import { Service } from "typedi"
import AuthService from "../services/AuthService"
import * as express from "express"
import Validator from "../validators"
import AuthMiddleware from "../middlewares/AuthMiddleware"
import { Role } from "../models/User"
import FileUploadMiddleware from "../middlewares/FileUploadMiddleware"

@Service()
class AuthController {
    private readonly router: express.Router
    constructor(
        private readonly authService: AuthService,
        private readonly validator: Validator,
        private readonly authMiddleware: AuthMiddleware,
        private readonly fileUploadMiddleware: FileUploadMiddleware
    ) {
        this.router = express.Router()
        this.router.post(
            "/signup",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            this.validator.auth.signup,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                this.authService
                    .createUser(req.body)
                    .then((resData) =>
                        res.status(201).json({ data: resData, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/signup-bulk",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            this.fileUploadMiddleware.upload.single("users"),
            this.fileUploadMiddleware.getUsers,
            this.validator.auth.signupBulk,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                this.authService
                    .bulkCreateUsers(req.body.users)
                    .then(() => {
                        res.status(200).json({
                            success: true,
                            data: "Successfully added users",
                        })
                    })
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/login",
            this.validator.auth.login,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                this.authService
                    .login(req.body.username, req.body.password)
                    .then((user) => {
                        req.session.user = {
                            _id: user._id,
                            role: user.role,
                        }
                        res.status(200).json({
                            data: "Logged in successfully",
                            success: true,
                        })
                    })
                    .catch((err) => next(err))
            }
        )
        this.router.get(
            "/logout",
            this.authMiddleware.isAuthenticated,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                req.session.destroy((err) => {
                    if (err) {
                        next(err)
                    } else {
                        res.status(200).json({
                            data: "Logged out successfully",
                            success: true,
                        })
                    }
                })
            }
        )
        this.router.get(
            "/me",
            this.authMiddleware.isAuthenticated,
            (req: express.Request, res: express.Response) => {
                res.status(200).json({ success: true, data: req.session.user })
            }
        )
        this.router.get(
            "/reset-password",
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                const { user } = req.query // Reg No or email
                if (!user) {
                    res.status(422).json({
                        error: null,
                        message:
                            "Registration no or email is required is required",
                    })
                    return
                }
                this.authService
                    .resetPassword(user as string)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Password reset link mailed successfully",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.get(
            "/reset-password/:token",
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                const { token } = req.params
                this.authService
                    .getTokenValidity(token)
                    .then((user) =>
                        res.status(200).json({ success: true, data: user })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/reset-password",
            this.validator.auth.passwordReset,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                const { token, newPassword } = req.body
                this.authService
                    .performPasswordReset(token, newPassword)
                    .then((data) =>
                        res.status(200).json({
                            success: true,
                            data: "Password reset successfully",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.patch(
            "/role",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            this.validator.auth.updateRole,
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction
            ) => {
                const { role, id } = req.body
                this.authService
                    .updateUserRole(id as string, role)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Role updated successfully",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
    }
    getRouter = () => {
        return this.router
    }
}

export default AuthController
