import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import Joi from "joi"
import Validator from "./validator"

@Service()
export default class DepartmentValidator extends Validator {
    createDepartment = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            code: Joi.string().max(5).required(),
            name: Joi.string().max(60).required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    removeCourse = (req: Request, res: Response, next: NextFunction) => {
        const bodySchema = Joi.object({
            course: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        const paramsSchema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        try {
            this.validate(paramsSchema, req.params)
            this.validate(bodySchema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
}
