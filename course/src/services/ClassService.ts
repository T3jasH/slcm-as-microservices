import { Service } from "typedi"
import CustomError from "../error"
import { ClassModel } from "../models/Class"
import { CourseModel } from "../models/Course"
import { UserToClassModel } from "../models/UserToClass"
import { UserToCoursesModel } from "../models/UserToCourses"
import ClassRepo from "../repo/ClassRepo"
import CourseRepo from "../repo/CourseRepo"
import StreamRepo from "../repo/StreamRepo"

// FIX COURSE FROM STREAM PROBLEM

@Service()
export default class ClassService {
    constructor(
        private readonly classRepo: ClassRepo,
        private readonly streamRepo: StreamRepo,
        private readonly courseRepo: CourseRepo
    ) {}

    /*****                      HELPER FUNCTIONS                        *****/

    /**
     * @returns First prof in list that teaches given course
     */
    private getProfByCourse = (
        profandCourses: UserToCoursesModel[],
        courseId: string
    ) => {
        const prof = profandCourses.find(
            (p) =>
                p.courses.findIndex((c: unknown) => {
                    return c === courseId
                }) !== -1
        )
        return prof!
    }
    private getCoursesByStream = async (streamId: string, semester: number) => {
        const courses = await this.streamRepo.getCoursesByStreamAndSem(
            streamId,
            semester
        )
        if (!courses) {
            throw new CustomError("Stream not found", 404, null)
        }
        return courses
    }

    /*****                      MAIN FUNCTIONS                        *****/

    /**
     * Can use this to create classes for multiple streams, or just pass array with one object for single stream
     * @returns array of promises
     */
    createNewClassesByStreams = async (
        streamToSections: {
            streamId: string
            batch: number
            numberOfSections: number
            semesters: number[]
        }[]
    ) => {
        // add semesters info in stream itself
        return await Promise.all(
            streamToSections.map((obj) => {
                const { streamId, batch, numberOfSections, semesters } = obj
                const newClass: ClassModel = {
                    batch,
                    stream: streamId as any,
                    students: [],
                    year: new Date().getFullYear(),
                    semesters,
                    section: "A", // just so that ts will shut up
                }
                return this.classRepo.createClassesByNumberOfSections(
                    newClass,
                    numberOfSections
                )
            })
        )
    }
    getClassesByStreamBatch = async (streamId: string, batch: number) => {
        return await this.classRepo.getClassesByStreamAndBatch(streamId, batch)
    }
    deleteClassesByStreamBatch = async (streamId: string, batch: number) => {
        await this.classRepo.deleteClassesByStreamBatch(streamId, batch)
    }
    /**
     *
     * @param streamId
     * @param year Year in which that semester starts
     * @param semester Semester to which classes have to be assigned for prof
     */
    allotClassesToProfsByStream = async (
        streamId: string,
        year: number,
        semester: number
    ) => {
        // Find courses in this stream for this sem
        let coursesThisSem: (CourseModel & { count?: number })[] =
            await this.getCoursesByStream(streamId, semester)
        coursesThisSem = coursesThisSem.map((course) => {
            return { ...course, count: 0 }
        })
        let profsAndCourses = await this.courseRepo.getUsersCoursesBySemYear(
            semester,
            year
        )
        // profsAndCourses has course preferences from profs of all streams
        // Filter out preferences that belong to other courses. If courses array gets empty, delete that prof
        profsAndCourses.forEach((profCourse, index) => {
            const courses = profCourse.courses.filter(
                (c) =>
                    coursesThisSem.findIndex((crs: any) => crs._id === c) !== -1
            )
            profsAndCourses[index].courses = courses
        })
        profsAndCourses = profsAndCourses.filter(
            (profCourse) => profCourse.courses.length !== 0
        )
        //Find count of profs for each course. If a course has 0 profs alotted, throw error
        profsAndCourses.forEach((profCourse) => {
            profCourse.courses.forEach((course) => {
                coursesThisSem.forEach((crs, idx) => {
                    if (crs._id === (course as unknown as string)) {
                        coursesThisSem[idx].count =
                            coursesThisSem[idx].count! + 1
                    }
                })
            })
        })
        coursesThisSem.forEach((course: any) => {
            if (course.count === 0) {
                throw new CustomError(
                    `${course.name} has been alotted 0 profs`,
                    400,
                    0
                )
            }
        })
        // Find classes to which profs will be alloted
        const classesThisSem = await this.classRepo.getClassByStreamAndYear(
            streamId,
            year
        )
        if (classesThisSem.length === 0) {
            throw new CustomError("Classes not created yet", 400, null)
        }
        let coursesAssignedByClass: {
            classId: string
            allotment: { prof: string; course: string }[]
        }[] = classesThisSem.map((cls) => {
            return { classId: cls._id, allotment: [] }
        })
        // Using profsAndCourses as a circular queue
        // Find prof for a particular course from start of queue, assign and push to end of queue
        coursesThisSem.forEach((course) => {
            // Go through each class and assign prof for current course
            coursesAssignedByClass = coursesAssignedByClass.map(
                (classToCourse) => {
                    // find from start of q
                    const prof = this.getProfByCourse(
                        profsAndCourses,
                        course._id!
                    )
                    // remove from q
                    profsAndCourses.splice(
                        profsAndCourses.findIndex(
                            (p) => p.userId === prof.userId
                        ),
                        1
                    )
                    // push to end of q
                    profsAndCourses.push(prof as any)
                    return {
                        ...classToCourse,
                        allotment: [
                            ...classToCourse.allotment,
                            {
                                prof: prof.userId,
                                course: course._id as string,
                            },
                        ],
                    }
                }
            )
        })
        // Save to course-prof assignment in db
        // For each allotment, a new relation is created
        const profToClass: UserToClassModel[] = []
        coursesAssignedByClass.forEach((cls) => {
            cls.allotment.forEach((allot) => {
                profToClass.push({
                    class: cls.classId as any,
                    course: allot.course as any,
                    userId: allot.prof as any,
                    semester,
                    year,
                })
            })
        })
        await this.classRepo.addToUserClassRelation(profToClass)
        return profToClass
    }
    /**
     * To get allotment across a stream for a sem, admin level
     */
    getProfToClassAllotment = async (
        streamId: string,
        year: number,
        semester: number
    ) => {
        const courses = await this.getCoursesByStream(streamId, semester)
        const coursesAlloted =
            await this.classRepo.getUserToClassRelationByCourseYearSem(
                year,
                semester,
                courses.map((course) => course._id!)
            )
        return coursesAlloted
    }
    /**
     * To get allotment by individual prof. A prof can teach multiple streams, hence we don't fetch courses by stream here
     */
    getProfToClassAllotmentByUser = async (
        year: number,
        semester: number,
        userId: string
    ) => {
        const coursesAlloted =
            await this.classRepo.getUserToClassRelationByCourseYearSemUser(
                year,
                semester,
                userId
            )
        return coursesAlloted
    }
    resetProfToClassAllotmentByStreamYearSem = async (
        streamId: string,
        year: number,
        semester: number
    ) => {
        const courses = await this.getCoursesByStream(streamId, semester)
        await this.classRepo.deleteUserToClassRelationByCourseYearSem(
            year,
            semester,
            courses.map((course) => course._id!)
        )
    }
    /**
     * @param currSem Used for deciding which class (1st yr or [2nd, 3rd, 4th])
     * @returns List of class IDs with students and rollNo allotted
     */
    allotClassesToStudentsByStream = async (
        users: string[],
        streamId: string,
        batch: number,
        currSem: number
    ) => {
        const classes = await this.classRepo.getClassesByStreamBatchSem(
            batch,
            streamId,
            currSem
        )
        const numberOfClasses = classes.length
        const numberOfUsers = users.length
        if (numberOfClasses === 0) {
            throw new CustomError("Classes not created yet", 400, null)
        }
        const studentsPerClass = Math.floor(numberOfUsers / numberOfClasses)
        // Initialize with empty students list
        const classToStudents: {
            classId: string
            students: { id: string; rollNo: number }[]
        }[] = classes.map((cls) => ({ classId: cls._id!, students: [] }))
        var i = 0,
            j = 0,
            k = 0
        for (i = 0; i < numberOfClasses; i++) {
            for (
                j = i * studentsPerClass, k = 1;
                j < (i + 1) * studentsPerClass && j < numberOfUsers;
                j++, k++
            ) {
                classToStudents[i].students.push({
                    id: users[j],
                    rollNo: k,
                })
            }
        }
        i--
        while (j < users.length) {
            classToStudents[i].students.push({
                id: users[j],
                rollNo: k,
            })
            j++
            k++
        }
        await Promise.all(
            classToStudents.map((cls) =>
                this.classRepo.addStudentsToClass(
                    cls.classId,
                    cls.students.map((student) => student.id)
                )
            )
        )
        return classToStudents
    }
    /**
     * Get allotment by prof or admin
     */
    getStudentsClassAllotment = async (
        streamId: string,
        batch: number,
        semesters: number
    ) => {
        return await this.classRepo.getClassesByStreamBatchSem(
            batch,
            streamId,
            semesters
        )
    }

    /**
     * Get allotment by student. (To see which section student has been allotted)
     */
    getClassByStudent = async (
        streamId: string,
        batch: number,
        currSem: number,
        userId: string
    ) => {
        return await this.classRepo.getClassByStudent(
            streamId,
            batch,
            currSem,
            userId
        )
    }
    resetStudentClassAlltomentByStream = async (
        streamId: string,
        batch: number
    ) => {
        await this.classRepo.removeStudentsFromClassByStreamBatch(
            batch,
            streamId
        )
    }
}
