import { Router, Request, Response, NextFunction } from "express"
import * as express from "express"
import FetchWrapper from "../FetchWrapper"
import { Service } from "typedi"
import AuthMiddleware from "../../middlewares/AuthMiddleware"
import { Role } from "../../models/User"

@Service()
export default class ClassController {
    private readonly router: express.Router
    constructor(
        private readonly authMiddleware: AuthMiddleware,
        private readonly fetchWrapper: FetchWrapper
    ) {
        this.router = Router()
        this.setRoutes()
    }
    private getRoute = (route: string) => {
        return `/classes${route}`
    }
    setRoutes = () => {
        // create classes by stream(s)
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(""))
                    .post()
        )
        // allot classes to profs by stream
        this.router.post(
            "/faculty-allot",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(
                        req,
                        res,
                        next,
                        this.getRoute("/streams/faculty-allot")
                    )
                    .post()
        )
        // get allotment by stream
        this.router.post(
            "/streams/faculty",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/streams/faculty"))
                    .post()
        )
        // delete allotment(reset) by stream
        this.router.delete(
            "/streams/faculty",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/streams/faculty"))
                    .delete()
        )
        // allot classes to students by stream
        this.router.post(
            "/streams/students-allot",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(
                        req,
                        res,
                        next,
                        this.getRoute("/streams/faculty-allot")
                    )
                    .post()
        )
        // get allotment by stream
        this.router.post(
            "/streams/students",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/streams/faculty"))
                    .post()
        )
        // delete allotment(reset) by stream
        this.router.delete(
            "/streams/students",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/streams/faculty"))
                    .delete()
        )
    }
    getRoutes = () => this.router
}
