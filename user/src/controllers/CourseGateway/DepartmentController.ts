import { Router, Request, Response, NextFunction } from "express"
import * as express from "express"
import FetchWrapper from "../FetchWrapper"
import { Service } from "typedi"
import AuthMiddleware from "../../middlewares/AuthMiddleware"
import { Role } from "../../models/User"

@Service()
export default class DepartmentController {
    private readonly router: express.Router
    constructor(
        private readonly fetchWrapper: FetchWrapper,
        private readonly authMiddleware: AuthMiddleware
    ) {
        this.router = Router()
        this.setRoutes()
    }
    protected getRoute = (url: string) => {
        return `/departments${url}`
    }
    setRoutes = () => {
        // get all departments
        this.router.get(
            "/",
            this.authMiddleware.isAuthenticated,
            (req: Request, res: Response, next: NextFunction) => {
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/"))
                    .get()
            }
        )
        // create new department
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute("/"))
                    .post()
        )
        // get department by department code
        this.router.get(
            "/:code",
            this.authMiddleware.isAuthenticated,
            (req: Request, res: Response, next: NextFunction) => {
                const { code } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/${code}`))
                    .get()
            }
        )
        // delete a department by id
        this.router.delete(
            "/:id",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/${id}`))
                    .delete()
            }
        )
        // add courses to a department
        this.router.post(
            "/courses/:id",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/courses/${id}`))
                    .post()
            }
        )
        // delete course from a department
        this.router.delete(
            "/courses/:id",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/courses/${id}`))
                    .delete()
            }
        )
    }
    getRoutes = () => this.router
}
