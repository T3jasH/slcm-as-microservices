import mongoose, { Types } from "mongoose"
import DocType from "./dbTypes"
import { StreamModel } from "./Stream"

// Refers to a "classroom"
// Contains all courses taught there

export interface ClassModel {
    _id?: string
    section: string
    batch: number // For students only
    year: number // For profs
    stream: StreamModel
    semesters: number[] // For students only. [1, 2] for 1st year, [3, 4, 5, 6, 7, 8] for rest of the engg course
    students: string[]
}

const ClassSchema = new mongoose.Schema({
    section: {
        type: String,
        required: [true, "Class section cannot be empty"],
    },
    batch: {
        type: Number,
        required: [true, "Class batch cannot be empty"],
    },
    year: { type: Number, default: new Date().getFullYear() },
    stream: {
        type: String,
        ref: "Stream",
        required: [true, "Class stream cannot be empty"],
    },
    students: [
        {
            type: String,
            required: [true, "Student id cannot be empty"],
        },
    ],
    semesters: [
        {
            type: Number,
        },
    ],
})

export default mongoose.model<DocType<ClassModel>>("Class", ClassSchema)
