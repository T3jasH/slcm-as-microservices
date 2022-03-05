import * as express from "express"
import { Types } from "mongoose"

export default class Common {
    protected readonly app
    constructor(app: express.Application) {
        this.app = app
    }
    protected validateId = (id: string) => {
        expect(Types.ObjectId.isValid(id)).toBe(true)
    }
}
