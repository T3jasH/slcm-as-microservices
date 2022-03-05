import mongoose, { Types } from "mongoose"
import { CourseModel } from "./Course"
import DocType from "./dbTypes"

export interface DepartmentModel {
    _id?: string
    name: string
    code: string
    courses: CourseModel[]
    profs: Types.ObjectId[]
}

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Department name cannot be empty"],
        unique: [true, "Department name must be unique"],
    },
    code: {
        type: String,
        required: [true, "Department code cannot be empty"],
        unique: [true, "Department code must be unique"],
    },
    courses: [
        {
            type: String,
            required: [true, "Stream name cannot be empty"],
            ref: "Course",
        },
    ],
    profs: [
        {
            type: String,
        },
    ],
})

export default mongoose.model<DocType<DepartmentModel>>(
    "Department",
    DepartmentSchema
)
