import {
    classes,
    courses,
    streamToSections,
    students,
    userToCourses,
} from "../mockData"
import { ClassModel } from "../models/Class"
import ClassService from "./ClassService"

describe("Test the class service", () => {
    let classService: ClassService
    let classRepo: any, streamRepo: any, courseRepo: any

    beforeAll(() => {
        classRepo = {
            createClassesByNumberOfSections: jest
                .fn()
                .mockImplementation(
                    async (cls: ClassModel, numberOfSections: number) => {
                        const classes = []
                        for (var i = 0; i < numberOfSections; i += 1) {
                            classes.push({ ...cls, section: "A" + i })
                        }
                        return classes
                    }
                ),
            getClassByStreamAndYear: jest
                .fn()
                .mockImplementation(
                    async (streamId: string, year: number) => classes
                ),
            getClassesByStreamBatchSem: jest
                .fn()
                .mockImplementation(
                    async (streamId: string, batch: number, sem: number) =>
                        classes
                ),
            addStudentsToClass: jest.fn(),
            addToUserClassRelation: jest.fn(),
        }
        streamRepo = {
            getCoursesByStreamAndSem: jest
                .fn()
                .mockImplementation(async (_id: string, semester: number) => {
                    return courses.map((c) => ({ course: c }))
                }),
        }
        courseRepo = {
            getUsersCoursesBySemYear: jest
                .fn()
                .mockImplementation(
                    async (semester: number, year: number) => userToCourses
                ),
        }
        classService = new ClassService(classRepo, streamRepo, courseRepo)
    })

    it("should return new classes", async () => {
        const resp = await classService.createNewClassesByStreams(
            streamToSections as any
        )
        expect(resp).toHaveProperty("length", 3)
        expect(resp[0]).toHaveProperty("length", 4)
        expect(resp[1]).toHaveProperty("length", 4)
        expect(resp[2]).toHaveProperty("length", 10)
    })

    it("should correctly assign classes to profs", async () => {
        const resp = await classService.allotClassesToProfsByStream(
            "cseid" as any,
            2020,
            3
        )
        expect(resp).toHaveProperty("length", classes.length * courses.length) // number of classes * number of courses per class
        expect(resp[0]).toHaveProperty("class")
        expect(resp[0]).toHaveProperty("course")
        expect(resp[0]).toHaveProperty("userId")
        // Go through each allotment and check if it is valid.
        // For this we simply make sure that assigned course was indeed opted by that prof
        resp.forEach((res) => {
            const user = userToCourses.find((usr) => usr.userId === res.userId)
            expect(user).toBeDefined()
            const course = user!.courses.find((c) => res.course === c._id)
            expect(course).toBeDefined()
        })
    })

    it("should assign correctly classes and roll numbers to students", async () => {
        const resp = await classService.allotClassesToStudentsByStream(
            students as any,
            "cseid" as any,
            2020,
            1
        )
        expect(resp).toHaveProperty("length", classes.length)
        expect(resp[0]).toHaveProperty("classId")
        expect(resp[0].students.length).toBeGreaterThanOrEqual(
            Math.floor(students.length / classes.length)
        )
        var sum = 0
        for (var i = 0; i < classes.length; i++) {
            //console.log(resp[i])
            sum += resp[i].students.length
            for (var j = 0; j < resp[i].students.length; j++) {
                expect(resp[i].students[j].rollNo).toBe(j + 1)
                expect(resp[i].students[j].id).toBeDefined()
            }
        }
        expect(sum).toBe(students.length)
    })
})
