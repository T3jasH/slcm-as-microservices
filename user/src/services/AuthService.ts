import { Service } from "typedi"
import CustomError from "../error"
import { Role, UserModel } from "../models/User"
import UserRepo from "../repo/User"
import { nanoid } from "nanoid/async"
import nodemailer from "nodemailer"
import ApiCalls from "./ApiCalls"

@Service()
class AuthService {
    constructor(
        private readonly userRepo: UserRepo,
        private readonly api: ApiCalls
    ) {}
    /**
     * @returns all streams if id is null
     */
    createUser = async (data: any) => {
        const {
            firstName,
            middleName,
            lastName,
            regNo,
            email,
            password,
            streamCode,
            departmentCode,
            batch,
            gender,
            role,
            phoneNo,
        } = data
        let stream: any, departement: any
        if (role === Role.STUDENT) {
            if (streamCode === undefined)
                throw new CustomError("Validation error", 422, {
                    error: { message: "Stream is required for student" },
                })
            else stream = await this.api.getStreamByCode(streamCode)
            if (batch === undefined) {
                throw new CustomError("Validation error", 422, {
                    error: { message: "Student requires batch" },
                })
            }
        } else if (role === Role.FACULTY) {
            if (departmentCode === undefined) {
                throw new CustomError("Validation error", 422, {
                    error: { message: "Department is required for faculty" },
                })
            } else {
                departement = await this.api.getDepartmentByCode(departmentCode)
            }
        }
        if (await this.userRepo.findUserByEmail(email)) {
            throw new CustomError("Email already exists", 400, null)
        }
        if (await this.userRepo.findUserByRegNo(regNo)) {
            throw new CustomError("Reg No already exists", 400, null)
        }
        const newUser = await this.userRepo.createSingleUser({
            firstName,
            middleName,
            lastName,
            phoneNo,
            regNo,
            email,
            password,
            streamId: streamCode ? stream._id : undefined,
            departmentId: departmentCode ? departement._id : undefined,
            batch,
            gender,
            role,
            feesPaid: [],
            attendance: [],
        })
        return {
            _id: newUser._id,
            firstName,
            middleName,
            lastName,
            phoneNo,
            regNo,
            email,
            streamId: newUser.streamId,
            departmentId: newUser.departmentId,
            batch,
            gender,
            role,
        }
    }
    sendMail = async (to: string, subject: string, text: string) => {
        const transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: 587,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD,
            },
            logger: true,
        })
        await transporter.sendMail({
            from: process.env.MAILER_USER, // sender address
            to,
            subject,
            text,
        })
    }
    resetPassword = async (username: string) => {
        let user = await this.userRepo.findUserByRegNo(username)
        if (user === null) {
            user = await this.userRepo.findUserByEmail(username)
            if (user === null) {
                throw new CustomError("User not found", 404, null)
            }
        }
        const token = await nanoid()
        const expiry = new Date(Date.now() + 1000 * 60 * 15)
        await this.userRepo.setResetToken(token, expiry, user._id)
        await this.sendMail(
            user.email,
            "Password Reset Link",
            `Please use this link to reset your password: ${process.env.PASSWORD_RESET_DOMAIN}/${token}`
        )
    }
    getTokenValidity = async (resetToken: string) => {
        const user = await this.userRepo.findUserByResetToken(resetToken)
        const currentDate = new Date()
        if (
            user.resetTokenExpiry &&
            currentDate.getTime() > user.resetTokenExpiry.getTime()
        ) {
            throw new CustomError(
                "Link has expired. Request another password reset",
                400,
                null
            )
        }
        return user
    }
    performPasswordReset = async (resetToken: string, newPassword: string) => {
        const user = await this.userRepo.findUserByResetToken(resetToken)
        await this.userRepo.setPassword(user._id, newPassword)

        // After successful reset, token needs to be expired
        // Don't have to wait for this operation
        this.userRepo
            .setResetToken(resetToken, new Date(), user._id)
            .catch((err) => console.log(err))
        return user
    }
    login = async (username: string, password: string) => {
        let user = await this.userRepo.findUserByRegNo(username, true)
        if (user === null) {
            user = await this.userRepo.findUserByEmail(username, true)
            if (user === null) {
                throw new CustomError("User not found", 404, null)
            }
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const passwordMatch = await user.matchPassword(password)
        if (!passwordMatch) {
            throw new CustomError("Incorrect password", 400, null)
        }
        return user
    }
    bulkCreateUsers = async (users: any[]) => {
        const streams: any[] = await this.api.getStreamByCode(null)
        const departments: any[] = await this.api.getDepartmentByCode(null)
        users.forEach((user, index) => {
            if (user.role === Role.STUDENT) {
                if (user.streamCode === undefined) {
                    throw new CustomError("Validation error", 422, {
                        error: {
                            message: `Stream not given on user ${user.email}`,
                        },
                    })
                }
                const streamId = streams.find(
                    (str: any) => str.code === user.streamCode
                )?._id
                if (streamId === undefined) {
                    throw new CustomError(
                        `Stream with code ${user.streamCode} not found`,
                        404,
                        null
                    )
                }
                users[index].streamId = streamId
                if (user.batch === undefined) {
                    throw new CustomError("Validation error", 422, {
                        error: {
                            message: `Batch not given on user ${user.email}`,
                        },
                    })
                }
            } else if (user.role === Role.FACULTY) {
                if (user.departmentCode === undefined) {
                    throw new CustomError("Validation error", 422, {
                        error: {
                            message: `Department not given on user ${user.email}`,
                        },
                    })
                }
                const departmentId = departments.find(
                    (dept) => dept.code === user.departmentCode
                )
                if (departmentId === undefined) {
                    throw new CustomError(
                        `Department with code ${user.departmentCode} not found`,
                        404,
                        null
                    )
                }
                users[index].departmentId = departmentId
            }
        })
        await this.userRepo.bulkCreateUsers(users)
    }
    updateUserRole = async (_id: string, role: number) => {
        await this.userRepo.updateUserRole(_id, role)
    }
}

export default AuthService
