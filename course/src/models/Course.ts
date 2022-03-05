import mongoose, { Types } from "mongoose"
import DocType from "./dbTypes"
import Stream from "./Stream"
import UserToClass from "./UserToClass"
import UserToCourses from "./UserToCourses"

// Update course validator too when this changes
export enum CourseClassification {
    LAB = "LAB",
    THEORY = "THEORY",
}

export interface CourseModel {
    _id?: string
    code: string
    name: string
    credits: number
    hours: number
    classification: CourseClassification
}

const CourseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Course code cannot be empty"],
        unique: [true, "Course code must be unique"],
    },
    name: {
        type: String,
        required: [true, "Course name cannot be empty"],
        unique: [true, "Course name must be unique"],
    },
    credits: {
        type: Number,
        required: [true, "Course credits cannot be empty"],
    },
    hours: {
        type: Number,
        required: [true, "Course contact hours cannot be empty"],
    },
    classification: {
        type: String,
        required: [true, "Stream name cannot be empty"],
    },
})

CourseSchema.pre<DocType<CourseModel>>("deleteOne", async function (next) {
    const id = this._id
    await UserToCourses.updateMany(
        { courses: { $elemMatch: id } },
        { $pull: { courses: id } }
    )
    await UserToClass.deleteMany({ courses: id })
    await Stream.updateMany(
        {
            courseToSem: {
                $elemMatch: { semester: { $regex: ".*" }, course: id },
            },
        },
        {
            $pull: {
                courseToSem: {
                    $elemMatch: { semester: { $regex: ".*" }, course: id },
                },
            },
        }
    )
    next()
})

export default mongoose.model<DocType<CourseModel>>("Course", CourseSchema)
