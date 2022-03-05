import request from "supertest"
import { Application } from "express"
import { Types } from "mongoose"
import Common from "./common"
import { StreamModel } from "../models/Stream"

export default class Streams extends Common {
    constructor(app: Application) {
        super(app)
    }
    createStreams = async (
        streams: StreamModel[],
        expectedStatusCode: number
    ) => {
        const resp = await Promise.all(
            streams.map(async (stream) => {
                const { status, body } = await request(this.app)
                    .post("/streams/")
                    .send({
                        name: stream.name,
                        code: stream.code,
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
    getAllStreams = async () => {
        const { status, body } = await request(this.app).get("/streams/")
        expect(status).toBe(200)
        expect(body.data.length).toBeDefined()
        return body.data
    }
    deleteStreamsById = async (streams: any[], expectedStatusCode: number) => {
        const deleted = await Promise.all(
            streams.map(async (stream) => {
                const { status, body } = await request(this.app).delete(
                    `/streams/${stream._id}`
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
    addCoursesToStream = async (
        courses: { semester: number; course: string }[],
        id: string,
        expectedStatusCode: number
    ) => {
        const { status, body } = await request(this.app)
            .post(`/streams/courses/${id}/`)
            .send({ courses })
        try {
            expect(status).toBe(expectedStatusCode)
        } catch (err) {
            console.log(body)
            throw err
        }
    }
}
