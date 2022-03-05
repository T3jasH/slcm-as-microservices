import mongoose, { Types } from "mongoose"
import { CourseModel } from "./Course"
import DocType from "./dbTypes"

/**
 * This is a model for PROFS only.
 * Used for a prof's course preferences
 */
export interface UserToCoursesModel {
    _id?: string
    userId: string
    courses: CourseModel[]
    semester: number
    year: number
}

const UserToCoursesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "userId cannot be empty"],
    },
    courses: [
        {
            type: String,
            ref: "Course",
        },
    ],
    semester: {
        type: Number,
        required: [true, "Courses preference semester cannot be empty"],
    },
    year: {
        type: Number,
        required: [true, "Courses preference year cannot be empty"],
    },
})

export default mongoose.model<DocType<UserToCoursesModel>>(
    "UserToCourses",
    UserToCoursesSchema
)
