import request from "supertest"
import * as express from "express"
import Common from "./common"
import { Types } from "mongoose"
import { CourseModel } from "../models/Course"

class Courses extends Common {
    constructor(app: express.Application) {
        super(app)
    }
    createCourses = async (
        courses: CourseModel[],
        expectedStatusCode: number
    ) => {
        const resp = await Promise.all(
            courses.map(async (course) => {
                const { status, body } = await request(this.app)
                    .post("/courses/")
                    .send({
                        code: course.code,
                        classification: course.classification,
                        name: course.name,
                        credits: course.credits,
                        hours: course.hours,
                        departmentCode: "CSE",
                    })
                return { status, body }
            })
        )
        resp.forEach(({ status, body }) => {
            try {
                expect(status).toBe(expectedStatusCode)
                if (expectedStatusCode >= 400) return
                this.validateId(body.data._id)
            } catch (err) {
                console.log(body)
                throw err
            }
        })
    }
    getCoursesByDept = async (code: string) => {
        const { status, body } = await request(this.app).get(
            `/departments/${code}/`
        )
        try {
            expect(status).toBe(200)
            expect(body.data.courses.length).toBeDefined()
        } catch (err) {
            console.log(body)
            throw err
        }
        return body.data.courses
    }
    getCoursesByStream = async (code: string) => {
        const { status, body } = await request(this.app).get(
            `/streams/${code}/`
        )
        try {
            expect(status).toBe(200)
            expect(body.data.courseToSem.length).toBeDefined()
        } catch (err) {
            console.log(body)
            throw err
        }
        return body.data.courseToSem.map((crs: any) => crs.course)
    }
    deleteCoursesById = async (courses: any[], expectedStatusCode: number) => {
        const deleted = await Promise.all(
            courses.map(async (course) => {
                const { status, body } = await request(this.app).delete(
                    `/courses/${course._id}`
                )
                return { status, body }
            })
        )
        deleted.forEach(({ status, body }) => {
            try {
                expect(status).toBe(expectedStatusCode)
            } catch (err) {
                console.log(body)
                throw err
            }
        })
    }
    addCoursePreference = async (
        preferences: {
            userId: string
            semester: number
            year: number
            courses: string[]
        }[],
        expectedStatusCode: number
    ) => {
        const result = await Promise.all(
            preferences.map(async (pref) => {
                const { status, body } = await request(this.app)
                    .post("/courses/faculty")
                    .send(pref)
                return { status, body }
            })
        )
        result.forEach(({ status, body }) => {
            try {
                expect(status).toBe(expectedStatusCode)
            } catch (err) {
                console.log(body)
                throw err
            }
        })
    }
    updateCoursePreferences = async (
        preferences: {
            userId: string
            courses: string[]
        }[],
        expectedStatusCode: number
    ) => {
        const result = await Promise.all(
            preferences.map(async (pref) => {
                const { status, body } = await request(this.app)
                    .put("/courses/faculty")
                    .send(pref)
                return { status, body }
            })
        )
        result.forEach(({ status, body }) => {
            try {
                expect(status).toBe(expectedStatusCode)
            } catch (err) {
                console.log(body)
                throw err
            }
        })
    }
    getCoursePreferences = async (
        users: string[],
        expectedStatusCode: number
    ) => {
        const result = await Promise.all(
            users.map(async (id) => {
                const { status, body } = await request(this.app).get(
                    `/courses/faculty/${id}`
                )
                return { status, body }
            })
        )
        result.forEach(({ status, body }) => {
            try {
                expect(status).toBe(expectedStatusCode)
                if (expectedStatusCode >= 400) return
                expect(body.data.length).toBeDefined()
            } catch (err) {
                console.log(body)
                throw err
            }
        })
        return result.map(({ body }) => body.data)
    }
}

export default Courses
