import Common from "./common"
import * as express from "express"
import request from "supertest"

export default class Class extends Common {
    constructor(app: express.Application) {
        super(app)
    }
    createClasses = async (
        classes: {
            streamId: string
            batch: number
            semesters: number[]
            numberOfSections: number
        }[],
        expectedStatusCode: number
    ) => {
        const { status, body } = await request(this.app)
            .post("/classes/")
            .send(classes)
        try {
            expect(status).toBe(expectedStatusCode)
            if (expectedStatusCode >= 400) return
            const { data } = body
            expect(data.length).toBe(classes.length)
            classes.forEach((cls, i) => {
                expect(data[i].length).toBe(cls.numberOfSections)
            })
        } catch (err) {
            console.log(body)
            throw err
        }
    }
    getClassesByStreamBatch = async (
        data: { streamId: string; batch: number }[],
        expectedStatusCode: number
    ) => {
        const resp = await Promise.all(
            data.map(async ({ streamId, batch }) => {
                const { status, body } = await request(this.app)
                    .post(`/classes/streams/${streamId}`)
                    .send({ batch })
                try {
                    expect(status).toBe(expectedStatusCode)
                    if (expectedStatusCode >= 400) return
                    const { data } = body
                    expect(data.length).toBeDefined()
                    return data
                } catch (err) {
                    console.log(body)
                    throw err
                }
            })
        )
        return resp
    }
    deleteClassesByStreamBatch = async (
        data: { streamId: string; batch: number }[],
        expectedStatusCode: number
    ) => {
        await Promise.all(
            data.map(async ({ streamId, batch }) => {
                const { status, body } = await request(this.app)
                    .delete(`/classes/streams/${streamId}`)
                    .send({ batch })
                try {
                    expect(status).toBe(expectedStatusCode)
                } catch (err) {
                    console.log(body)
                    throw err
                }
            })
        )
    }
    allotToProfs = async (
        data: { streamId: string; year: number; semester: number },
        expectedStatusCode: number
    ) => {
        const { status, body } = await request(this.app)
            .post("/classes/streams/faculty-allot")
            .send(data)
        try {
            expect(status).toBe(expectedStatusCode)
            if (expectedStatusCode >= 400) return
            const { data } = body
        } catch (err) {
            console.log(body)
            throw err
        }
    }
    getProfsAllotment = async (
        data: { streamId: string; year: number; semester: number },
        expectedStatusCode: number
    ) => {
        const { status, body } = await request(this.app)
            .post("/classes/streams/faculty")
            .send(data)
        try {
            expect(status).toBe(expectedStatusCode)
            if (expectedStatusCode >= 400) return
            const { data } = body
            expect(data.length).toBeDefined()
            return data
        } catch (err) {
            console.log(body)
            throw err
        }
    }
    getAllotmentByProf = async (
        data: {
            year: number
            semester: number
            userId: string
        }[],
        expectedStatusCode: number
    ) => {
        return Promise.all(
            data.map(async ({ semester, userId, year }) => {
                const { status, body } = await request(this.app)
                    .post(`/classes/streams/faculty-allot/${userId}`)
                    .send({ year, semester })
                try {
                    expect(status).toBe(expectedStatusCode)
                    if (expectedStatusCode >= 400) return
                    const { data } = body
                    expect(data.length).toBeDefined()
                    return data as any[]
                } catch (err) {
                    console.log(body)
                    throw err
                }
            })
        )
    }
    deleteProfsAllotment = async (data: {
        streamId: string
        year: number
        semester: number
    }) => {
        const { status, body } = await request(this.app)
            .delete("/classes/streams/faculty-allot")
            .send(data)
        try {
            expect(status).toBe(200)
            const { data } = body
            expect(data.length).toBeDefined()
            return data
        } catch (err) {
            console.log(body)
            throw err
        }
    }
    allotToStudents = async (
        students: string[],
        streamId: string,
        batch: number,
        currSem: number
    ) => {
        const { status, body } = await request(this.app)
            .post("/classes/streams/students-allot")
            .send({ students, streamId, batch, currSem })
        try {
            expect(status).toBe(200)
            const { data } = body
            expect(data.length).toBeDefined()
            return data
        } catch (err) {
            console.log(body)
            throw err
        }
    }
    getStudentsAllotment = async (
        streamId: string,
        batch: number,
        semesters: number[]
    ) => {
        const { status, body } = await request(this.app)
            .post("/classes/streams/students")
            .send({ streamId, batch, semesters })
        try {
            expect(status).toBe(200)
            const { data } = body
            expect(data.length).toBeDefined()
            return data
        } catch (err) {
            console.log(body)
        }
    }
    getClassByStudents = async (
        data: {
            streamId: string
            userId: string
            batch: number
            currSem: number
        }[]
    ) => {
        return Promise.all(
            data.map(async ({ streamId, userId, batch, currSem }) => {
                const { status, body } = await request(this.app)
                    .post(`/classes/streams/students/${userId}`)
                    .send({ streamId, batch, currSem })
                try {
                    expect(status).toBe(200)
                    const { data } = body
                    expect(data.section).toBeDefined()
                    return data
                } catch (err) {
                    console.log(body)
                    throw err
                }
            })
        )
    }
    deleteStudentsAllotment = async (data: {
        streamId: string
        batch: number
    }) => {
        const { status, body } = await request(this.app)
            .delete("/classes/streams/students-allot")
            .send(data)
        try {
            expect(status).toBe(200)
            return data
        } catch (err) {
            console.log(body)
            throw err
        }
    }
}
