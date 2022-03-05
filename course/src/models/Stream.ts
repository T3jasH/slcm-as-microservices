import { required } from "joi"
import mongoose, { Types } from "mongoose"
import { CourseModel } from "./Course"
import DocType from "./dbTypes"

export interface CourseToSem {
    semester: number
    course: CourseModel
}

export interface StreamModel {
    _id?: string
    name: string
    code: string
    courseToSem: CourseToSem[]
}

const StreamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Stream name cannot be empty"],
        unique: [true, "Stream name must be unique"],
    },
    code: {
        type: String,
        required: [true, "Stream code cannot be empty"],
        unique: [true, "Stream code must be unique"],
    },
    courseToSem: [
        {
            type: {
                semester: {
                    type: Number,
                    required: true,
                },
                course: {
                    type: String,
                    ref: "Course",
                    required: true,
                },
            },
        },
    ],
})

export default mongoose.model<DocType<StreamModel>>("Stream", StreamSchema)
