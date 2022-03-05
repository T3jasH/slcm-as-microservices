import mongoose, { Types } from "mongoose"
import DocType from "./dbTypes"

export interface RollNoModel {
    classId: Types.ObjectId
    userId: Types.ObjectId
    rollNo: number
}

const RollNoSchema = new mongoose.Schema({
    classId: {
        type: Types.ObjectId,
        required: [true, "Roll no model requires classId"],
        unique: [true, "Class Id already exists"],
    },
    userId: {
        type: Types.ObjectId,
        required: [true, "Roll no model requires userId"],
        unique: [true, "User Id already exists"],
    },
    rollNo: {
        type: Number,
        required: [true, "Roll No required"],
    },
})

export default mongoose.model<DocType<RollNoModel>>("RollNo", RollNoSchema)
