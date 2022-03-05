import { Service } from "typedi"
import Course, { CourseModel } from "../models/Course"
import UserToCourses, { UserToCoursesModel } from "../models/UserToCourses"
import CustomError from "../error"

@Service()
export default class CourseRepo {
    createCourse = async (course: CourseModel) => {
        const newCourse = new Course(course)
        return await newCourse.save()
    }
    getCourseById = async (courseId: string) => {
        return await Course.findById(courseId)
    }
    getAllCourses = async () => {
        return await Course.find({})
    }
    /**
     * Creates a new user to courses mapping. For faculty only
     */
    addCoursesToUser = async (userToCourses: UserToCoursesModel) => {
        const newUserToCourses = new UserToCourses(userToCourses)
        await newUserToCourses.save()
    }
    /**
     * Replaces the previous courses to user mapping by new array. For faculty only
     */
    updateCoursesForUser = async (userId: string, courses: string[]) => {
        await UserToCourses.updateOne({ userId }, { $set: { courses } })
    }
    /**
     * @return A list of users and courses preferred by them, for given semester and year
     */
    getUsersCoursesBySemYear = async (semester: number, year: number) => {
        const userToCourses = await UserToCourses.find({
            semester,
            year,
        })
        return userToCourses
    }
    /**
     * @returns course preferences of prof
     * @param userId prof id
     */
    getLatestUserCoursesByUserId = async (userId: string) => {
        return await UserToCourses.find({ userId })
            .sort({ year: -1, semester: -1 })
            .limit(1)
            .populate("courses")
    }
    deleteCourse = async (courseId: string) => {
        const course = await Course.findById(courseId)
        if (!course) {
            throw new CustomError("Course not found", 404, null)
        }
        await course.deleteOne()
        return course
    }
    deleteCourseByCode = async (code: string) => {
        const course = await Course.findOne({ code })
        if (!course) {
            throw new CustomError("Course not found", 404, null)
        }
        await course.deleteOne()
    }
}
