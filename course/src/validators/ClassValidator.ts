import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import Joi from "joi"
import Validator from "./validator"

@Service()
export default class ClassValidator extends Validator {
    createClass = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.array()
            .items(
                Joi.object({
                    streamId: Joi.string()
                        .custom(this.mongooseIDValidator)
                        .required(),
                    batch: Joi.number().required(),
                    semesters: Joi.array().items(Joi.number()).required(),
                    numberOfSections: Joi.number().required(),
                })
            )
            .min(1)
            .required()
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    getByStreamBatch = (req: Request, res: Response, next: NextFunction) => {
        const paramSchema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        const bodySchema = Joi.object({ batch: Joi.number().required() })
        try {
            this.validate(paramSchema, req.params)
            this.validate(bodySchema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    classesToProfsAllotment = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            streamId: Joi.string().custom(this.mongooseIDValidator).required(),
            year: Joi.number().required(),
            semester: Joi.number().required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    classesToProfsAllotmentByUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const paramSchema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        const bodySchema = Joi.object({
            year: Joi.number().required(),
            semester: Joi.number(),
        })
        try {
            this.validate(paramSchema, req.params)
            this.validate(bodySchema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    allotClassesToStudents = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            students: Joi.array()
                .items(Joi.string().custom(this.mongooseIDValidator))
                .min(1)
                .required(),
            streamId: Joi.string().custom(this.mongooseIDValidator).required(),
            batch: Joi.number().required(),
            currSem: Joi.number().required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    studentClassAllotment = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            streamId: Joi.string().custom(this.mongooseIDValidator).required(),
            batch: Joi.number().required(),
            semesters: Joi.array().items(Joi.number()).min(1).required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    classAllotmentByStudent = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const paramSchema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        const bodySchema = Joi.object({
            streamId: Joi.string().custom(this.mongooseIDValidator).required(),
            currSem: Joi.number().required(),
            batch: Joi.number().required(),
        })
        try {
            this.validate(paramSchema, req.body)
            this.validate(bodySchema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
}
