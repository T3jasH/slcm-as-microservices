import * as express from "express"
import request from "supertest"
import { DepartmentModel } from "../models/Department"
import { Types } from "mongoose"
import Common from "./common"

export default class Departments extends Common {
    constructor(app: express.Application) {
        super(app)
    }
    createDepartments = async (
        department: DepartmentModel,
        expectedStatusCode: number
    ) => {
        const { status, body } = await request(this.app)
            .post("/departments/")
            .send({ code: department.code, name: department.name })
        try {
            expect(status).toBe(expectedStatusCode)
            if (expectedStatusCode >= 400) return
            this.validateId(body.data._id)
        } catch (err) {
            console.log(body)
            throw err
        }
        return body.data
    }
    getAllDepartments = async () => {
        const { status, body } = await request(this.app).get("/departments/")
        try {
            expect(status).toBe(200)
            expect(body.data.length).toBeDefined()
        } catch (err) {
            console.log(body)
            throw err
        }
        return body.data
    }
    deleteDepatmentsById = async (
        departments: any[],
        expectedStatusCode: number
    ) => {
        const deleted = await Promise.all(
            departments.map(async (dept) => {
                const { status, body } = await request(this.app).delete(
                    `/departments/${dept._id}`
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
}
