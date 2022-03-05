import { NextFunction, Request, Response } from "express"
import { Service } from "typedi"
import CustomError from "../error"

@Service()
class AuthMiddleware {
    isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
        if (req.session.user !== undefined) {
            return next()
        }
        next(new CustomError("Please login", 401, null))
    }
    isAuthorized = (role: number) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.session.user!.role >= role) {
                next()
            } else {
                next(
                    new CustomError(
                        "You do not have access to this resource",
                        403,
                        null
                    )
                )
            }
        }
    }
}

export default AuthMiddleware
