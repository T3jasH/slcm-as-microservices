import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import Joi from "joi"
import Validator from "./validator"

@Service()
export default class StreamValidator extends Validator {
    paramsId = (req: Request, res: Response, next: NextFunction) => {
        try {
            this.validate(
                Joi.object({
                    id: Joi.string()
                        .custom(this.mongooseIDValidator)
                        .required(),
                }),
                req.params
            )
            next()
        } catch (err) {
            next(err)
        }
    }
    createStream = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            code: Joi.string().max(5).required(),
            name: Joi.string().max(50).required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    addCourses = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            courses: Joi.array()
                .items(
                    Joi.object({
                        semester: Joi.number().required(),
                        course: Joi.string()
                            .custom(this.mongooseIDValidator)
                            .required(),
                    })
                )
                .min(1),
        })
        const idSchema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        try {
            this.validate(idSchema, req.params)
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    removeCourse = (req: Request, res: Response, next: NextFunction) => {
        const bodySchema = Joi.object({
            courseId: Joi.string().custom(this.mongooseIDValidator).required(),
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
