import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import Joi from "joi"
import { CourseClassification } from "../models/Course"
import Validator from "./validator"

@Service()
export default class CourseValidator extends Validator {
    createCourse = async (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            code: Joi.string().max(10).required(),
            name: Joi.string().max(60).required(),
            credits: Joi.number().required(),
            hours: Joi.number().required(),
            classification: Joi.string()
                .valid(...Object.values(CourseClassification))
                .required(),
            departmentCode: Joi.string().max(5).required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    addCoursePreferences = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            userId: Joi.string().custom(this.mongooseIDValidator).required(),
            semester: Joi.number().required(),
            year: Joi.number().required(),
            courses: Joi.array()
                .items(Joi.string().custom(this.mongooseIDValidator))
                .required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    updateCoursePreferences = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const schema = Joi.object({
            userId: Joi.string().custom(this.mongooseIDValidator).required(),
            courses: Joi.array()
                .items(Joi.string().custom(this.mongooseIDValidator))
                .required(),
        })
        try {
            this.validate(schema, req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
    paramsId = async (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            id: Joi.string().custom(this.mongooseIDValidator).required(),
        })
        try {
            this.validate(schema, req.params)
            next()
        } catch (err) {
            next(err)
        }
    }
}
