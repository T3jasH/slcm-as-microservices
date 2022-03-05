import { Service } from "typedi"
import CustomError from "../error"
import User, { UserModel } from "../models/User"

@Service()
class UserRepo {
    createSingleUser = async (newUser: UserModel) => {
        const user = new User({
            ...newUser,
        })
        try {
            return await user.save()
        } catch (err: any) {
            console.log("User creation failed", err)
            throw new CustomError(err.message, 500, err.errors)
        }
    }
    bulkCreateUsers = async (users: UserModel[]) => {
        await User.insertMany(users)
    }
    findUserByRegNo = async (regNo: string, includePassword = false) => {
        try {
            let user
            if (includePassword) {
                user = await User.findOne({ regNo }).select("+password")
            } else {
                user = await User.findOne({ regNo })
            }
            return user
        } catch (err: any) {
            console.log("Error in finding user by regNo", err)
            throw new CustomError(err.message, 500, err.errors)
        }
    }
    findUserByEmail = async (email: string, includePassword = false) => {
        try {
            let user
            if (includePassword) {
                user = await User.findOne({ email }).select("+password")
            } else {
                user = await User.findOne({ email })
            }
            return user
        } catch (err: any) {
            console.log("Error in finding user by regNo", err)
            throw new CustomError(err.message, 500, err.errors)
        }
    }
    findUserByResetToken = async (resetToken: string) => {
        const user = await User.findOne({ resetToken }).select(
            "regNo firstName lastName email phoneNo resetTokenExpiry _id"
        )
        if (user === null) {
            throw new CustomError("Invalid token", 400, null)
        }
        return user
    }
    setPassword = async (_id: string, password: string) => {
        const user = await User.findById(_id)
        user!.password = password
        await user?.save()
    }
    setResetToken = async (token: string, expiry: Date, _id: string) => {
        await User.findByIdAndUpdate(_id, {
            $set: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        })
    }
    updateUserRole = async (_id: string, role: number) => {
        await User.findByIdAndUpdate(_id, { $set: { role } })
    }
}

export default UserRepo
