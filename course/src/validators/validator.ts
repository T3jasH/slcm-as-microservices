import { NextFunction } from "express"
import Joi from "joi"
import { Types } from "mongoose"
import CustomError from "../error"

export default class Validator {
    protected mongooseIDValidator = (
        value: any,
        helpers: Joi.CustomHelpers<any>
    ) => {
        if (!Types.ObjectId.isValid(value)) {
            throw new Error(`Invalid id: ${value}`)
        }
        return value
    }

    protected validate = (
        schema: Joi.ObjectSchema<any> | Joi.ArraySchema,
        data: any
    ) => {
        const { error } = schema.validate(data)
        if (error) {
            throw new CustomError("Validation failed", 422, error.details)
        }
        return error
    }
}
