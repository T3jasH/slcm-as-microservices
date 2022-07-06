import server, { db } from "../index"
import Courses from "./courses"
import Departments from "./departments"
import Streams from "./streams"
import Class from "./class"
import {
    courses,
    department,
    streams,
    students,
    userToCourses,
} from "../mockData"
import { Types } from "mongoose"
import { CourseModel } from "../models/Course"

let { app, closeApp } = server

const getCourses = (crs: CourseModel[], num: number) => {
    const cors = []
    let j = 0
    let numCourses = crs.length
    for (let i = 0; i < num; i++, j++) {
        cors.push([crs[j % numCourses]._id!, crs[(j + 1) % numCourses]._id!])
    }
    return cors
}

describe("Test the course microservice", () => {
    let course: Courses
    let departments: Departments
    let stream: Streams
    let classes: Class

    beforeEach(() => {
        course = new Courses(app)
        departments = new Departments(app)
        stream = new Streams(app)
        classes = new Class(app)
    })
    it("Creates and fetches department", async () => {
        await departments.createDepartments(department, 201)
        await departments.getAllDepartments()
    })
    it("Creates and fethes streams", async () => {
        await stream.createStreams(streams.slice().reverse(), 201)
        await stream.getAllStreams()
    })
    it("Creates and fetches courses", async () => {
        await course.createCourses(courses, 201)
        await course.getCoursesByDept(department.code)
    })
    it("Adds courses to stream", async () => {
        let crs = await course.getCoursesByDept(department.code)
        const str = await stream.getAllStreams()
        await stream.addCoursesToStream(
            crs.map((c: any) => ({ semester: 3, course: c._id })),
            str[0]._id!,
            200
        )
    })

    it("Adds faculty course preferences", async () => {
        let crs = await course.getCoursesByStream(streams[0].code)
        let courseIds = getCourses(crs, userToCourses.length)
        await course.addCoursePreference(
            userToCourses.map((usr, idx) => ({
                userId: usr.userId,
                year: usr.year,
                semester: usr.semester,
                courses: courseIds[idx],
            })),
            200
        )
        await course.getCoursePreferences(
            userToCourses.map((usr) => usr.userId),
            200
        )
    })

    it("Creates classes and fetches", async () => {
        const str = await stream.getAllStreams()
        await classes.createClasses(
            [
                {
                    streamId: str[0]._id,
                    batch: 2021,
                    numberOfSections: 4,
                    semesters: [3, 4, 5, 6, 7, 8],
                },
            ],
            201
        )
        const data = await classes.getClassesByStreamBatch(
            [{ streamId: str[0]._id, batch: 2021 }],
            200
        )
        expect(data[0].length).toBe(4)
    })

    // UserToClasses must be deleted manually from db after this
    it("Allots classes to profs and fetches them", async () => {
        const str = await stream.getAllStreams()
        const data = {
            streamId: str[0]._id,
            year: userToCourses[0].year,
            semester: userToCourses[0].semester,
        }
        await classes.allotToProfs(data, 200)
        await classes.getProfsAllotment(data, 200)
    })

    it("Compares course preferences and allotments of profs", async () => {
        const allotmentByUsers = await classes.getAllotmentByProf(
            userToCourses.map((user) => ({
                year: user.year,
                semester: user.semester,
                userId: user.userId,
            })),
            200
        )
        const preferences = await course.getCoursePreferences(
            userToCourses.map((usr) => usr.userId),
            200
        )
        // Check if profs have been alotted courses preferred by them
        userToCourses.forEach((user, i) => {
            allotmentByUsers[i]?.forEach(({ course }) => {
                expect(
                    preferences[i].findIndex(
                        (crs: any) => crs._id === course._id
                    )
                ).not.toBe(-1)
            })
        })
    })

    it("Allots classes to students", async () => {
        const str = await stream.getAllStreams()
        const allotment = await classes.allotToStudents(
            students,
            str[0]._id,
            2021,
            3
        )
        const allotmentByStudents = await classes.getClassByStudents(
            students.slice(0, 10).map((student) => ({
                streamId: str[0]._id,
                userId: student,
                batch: 2020,
                currSem: 3,
            }))
        )
        console.log(allotmentByStudents)
    })

    afterAll(async () => {
        try {
            const str = await stream.getAllStreams()
            const data = {
                streamId: str[0]._id,
                year: userToCourses[0].year,
                semester: userToCourses[0].semester,
            }
            await classes.deleteProfsAllotment(data)
            // await classes.deleteStudentsAllotment({
            //     streamId: data.streamId,
            //     batch: 2020,
            // })
            // updating to empty array, thereby deleting course preferences
            await course.updateCoursePreferences(
                userToCourses.map((user) => ({
                    userId: user.userId,
                    courses: [],
                })),
                200
            )
            let crs = await course.getCoursesByDept(department.code)
            await course.deleteCoursesById(crs, 200)
            const depts = await departments.getAllDepartments()
            await departments.deleteDepatmentsById(depts, 200)
            await classes.deleteClassesByStreamBatch(
                [{ streamId: str[0]._id, batch: 2021 }],
                200
            )
            await stream.deleteStreamsById(str, 200)
        } finally {
            closeApp()
            await db.disconnect()
        }
    })
})
