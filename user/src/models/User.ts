import mongoose from "mongoose"
import bcrypt from "bcrypt"
import DocType from "./dbTypes"

export enum Gender {
    M = "M",
    F = "F",
    T = "T",
}

export enum Role {
    STUDENT = 0,
    FACULTY = 10,
    ADMIN = 30,
}

export interface UserModel {
    _id?: mongoose.Types.ObjectId
    firstName: string
    middleName?: string
    lastName: string
    regNo: string
    email: string
    phoneNo: string
    currSem?: number
    password: string
    resetToken?: string
    resetTokenExpiry?: Date
    // eslint-disable-next-line @typescript-eslint/ban-types
    gpa?: Number
    // eslint-disable-next-line @typescript-eslint/ban-types
    cgpa?: Number
    credits?: number
    streamId?: mongoose.Types.ObjectId
    departmentId?: mongoose.Types.ObjectId
    batch: number
    currentYear?: number // For student, 1st, 2nd, 3rd, 4th
    gender: Gender
    role: Role
    feesPaid: {
        _id: mongoose.Types.ObjectId
    }[]
    attendance: {
        _id: mongoose.Types.ObjectId
    }[]
    matchPassword?(enteredPassword: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name cannot be empty"],
        maxlength: [20, "First name max length exceeded"],
    },
    middleName: {
        type: String,
        maxlength: [35, "Middle name max length exceeded"],
    },
    lastName: {
        type: String,
        maxlength: [20, "Last name max length exceeded"],
    },
    regNo: {
        type: String,
        minlength: [9, "Reg No length must be 9"],
        maxlength: [9, "Reg No length must be 9"],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phoneNo: {
        type: String,
        required: [true, "Phone no is required"],
        minlength: [10, "Invalid phone no"],
        maxlength: [15, "Invalid phone no"],
    },
    password: {
        type: String,
        required: [true, "Password cannot be empty"],
        select: false,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiry: {
        type: Date,
    },
    gpa: {
        type: Number,
        default: 0,
    },
    cgpa: {
        type: Number,
        default: 0,
    },
    currSem: {
        type: Number,
        default: 1,
    },
    credits: {
        type: Number,
        default: 0,
    },
    role: {
        type: Number,
        default: 0,
    },
    streamId: {
        type: mongoose.Types.ObjectId,
    },
    department: {
        type: String,
    },
    batch: {
        type: Number,
    },
    currentYear: {
        type: Number,
        default: new Date().getFullYear(),
    },
    gender: {
        type: String,
        enum: ["M", "F", "O"],
        required: [true, "Gender cannot be empty"],
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    feesPaid: [
        {
            type: mongoose.Types.ObjectId,
        },
    ],
    attendance: [
        {
            type: mongoose.Types.ObjectId,
        },
    ],
})

UserSchema.pre<DocType<UserModel>>("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash
})

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    const user = this as DocType<UserModel>
    return await bcrypt.compare(enteredPassword, user.password)
}

export default mongoose.model<DocType<UserModel>>("User", UserSchema)
