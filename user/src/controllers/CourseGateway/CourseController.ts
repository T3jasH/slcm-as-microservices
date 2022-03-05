import { Router, Request, Response, NextFunction } from "express"
import * as express from "express"
import FetchWrapper from "../FetchWrapper"
import { Service } from "typedi"
import AuthMiddleware from "../../middlewares/AuthMiddleware"
import { Role } from "../../models/User"

@Service()
export default class CourseController {
    private readonly router: express.Router
    constructor(
        private readonly authMiddleware: AuthMiddleware,
        private readonly fetchWrapper: FetchWrapper
    ) {
        this.router = Router()
        this.setRoutes()
    }
    private getRoute = (url: string) => {
        return `/courses${url}`
    }
    setRoutes = () => {
        // create new course
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) => {
                console.log("Request recieved")
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/"))
                    .post()
            }
        )
        // delete a course
        this.router.delete(
            "/:code",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            async (req: Request, res: Response, next: NextFunction) => {
                const { code } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/${code}`))
                    .delete()
            }
        )
        // add course preference of faculty
        this.router.post(
            "/faculty",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.FACULTY),
            (req: Request, res: Response, next: NextFunction) => {
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/faculty`))
                    .post()
            }
        )
        // get course preference of faculty
        this.router.get(
            "/faculty",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.FACULTY),
            (req: Request, res: Response, next: NextFunction) => {
                const { _id } = req.session.user!
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/faculty/${_id}`))
                    .get()
            }
        )
        // update course preference of faculty
        this.router.put(
            "/faculty",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.FACULTY),
            (req: Request, res: Response, next: NextFunction) => {
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/faculty`))
                    .put()
            }
        )
    }
    getRoutes = () => this.router
}
