import { Service } from "typedi"
import { CourseModel } from "../models/Course"
import CourseRepo from "../repo/CourseRepo"
import { Types } from "mongoose"
import { UserToCoursesModel } from "../models/UserToCourses"
import DepartmentRepo from "../repo/DepartmentRepo"
import CustomError from "../error"

@Service()
export default class CourseService {
    constructor(
        private readonly courseRepo: CourseRepo,
        private readonly departmentRepo: DepartmentRepo
    ) {}
    /**
     * Create a new Course and add it to its department. Add to stream separately, since a course can
     * belong to multiple streams.
     */
    createNewCourse = async (data: any) => {
        const { departmentCode, name, code, credits, hours, classification } =
            data
        const course: CourseModel = {
            name,
            code,
            credits,
            hours,
            classification,
        }
        const dept = await this.departmentRepo.getDepartmentByCode(
            departmentCode
        )
        if (dept === null) {
            throw new CustomError("Validation error", 422, {
                error: { message: "Incorrect department code" },
            })
        }
        const newCourse = await this.courseRepo.createCourse(course)
        await this.departmentRepo.addCourses(dept._id, [newCourse._id])
        return newCourse
    }
    removeCourse = async (courseId: string) => {
        return await this.courseRepo.deleteCourse(courseId)
    }
    addCoursePreferences = async (userToCourses: UserToCoursesModel) => {
        await this.courseRepo.addCoursesToUser(userToCourses)
    }
    getLatestCoursePreferences = async (userId: string) => {
        const users = await this.courseRepo.getLatestUserCoursesByUserId(userId)
        if (users.length === 0) {
            return []
        }
        return users[0].courses
    }
    /**
     * Accepts the new complpete csourses array
     */
    updateCoursePreferences = async (userId: string, courses: string[]) => {
        await this.courseRepo.updateCoursesForUser(userId, courses)
    }
    deleteCourseByCode = async (code: string) => {
        if (!code) throw new CustomError("Please provide a code", 400, null)
        await this.courseRepo.deleteCourseByCode(code)
    }
}
