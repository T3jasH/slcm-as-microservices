import Joi from "joi"
import { Request, Response, NextFunction } from "express"
import CustomError from "../error"
import { Gender, Role } from "../models/User"

class AuthValidator {
    private readonly userSchema = Joi.object({
        firstName: Joi.string().required().max(20),
        middleName: Joi.string().max(20).min(0),
        lastName: Joi.string().required().max(20),
        phoneNo: Joi.string().min(10).max(15).required(),
        regNo: Joi.string().length(9),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(20).required(),
        streamCode: Joi.string().max(5),
        departmentCode: Joi.string().max(5),
        batch: Joi.number(),
        role: Joi.number()
            .valid(...Object.values(Role))
            .required(),
        gender: Joi.valid(...Object.values(Gender)).required(),
    })
    validate = (
        schema: Joi.ObjectSchema<any>,
        data: any,
        next: NextFunction
    ) => {
        const { error } = schema.validate(data)
        if (error) {
            next(new CustomError("Validation failed", 422, error.details))
        } else {
            next()
        }
    }
    signup = (req: Request, res: Response, next: NextFunction) => {
        this.validate(this.userSchema, req.body, next)
    }
    signupBulk = (req: Request, res: Response, next: NextFunction) => {
        const usersSchema = Joi.array().items(this.userSchema).min(1)
        const { error } = usersSchema.validate(req.body.users)
        if (error) {
            next(new CustomError("Validation failed", 422, error.details))
        } else {
            next()
        }
    }
    login = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().min(8).required(),
        })
        this.validate(schema, req.body, next)
    }
    passwordReset = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            newPassword: Joi.string().min(8).max(20).required(),
            token: Joi.string().required(),
        })
        this.validate(schema, req.body, next)
    }
    updateRole = (req: Request, res: Response, next: NextFunction) => {
        const schema = Joi.object({
            role: Joi.number().required(),
            id: Joi.string().length(24).required(),
        })
        this.validate(schema, req.body, next)
    }
}

export default AuthValidator
