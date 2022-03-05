import mongoose, { Types } from "mongoose"
import { ClassModel } from "./Class"
import { CourseModel } from "./Course"
import DocType from "./dbTypes"

/**
 * This is a model for PROFS only.
 * Used for assigning class and course to prof
 */
export interface UserToClassModel {
    _id?: string
    class: ClassModel
    userId: Types.ObjectId
    semester: number
    year: number
    course: CourseModel | Types.ObjectId
    createdAt?: Date
}

const UserToClassSchema = new mongoose.Schema({
    class: {
        type: String,
        ref: "Class",
    },
    userId: {
        type: String,
        required: [true, "userId cannot be empty"],
    },
    semester: {
        type: Number,
        required: [true, "semester cannot be empty"],
    },
    course: {
        type: String,
        ref: "Course",
        required: [true, "courseId cannot be empty"],
    },
    year: { type: Number, default: new Date().getFullYear() },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model<DocType<UserToClassModel>>(
    "UserToClass",
    UserToClassSchema
)
