import { Router, Request, Response, NextFunction } from "express"
import * as express from "express"
import FetchWrapper from "../FetchWrapper"
import { Service } from "typedi"
import AuthMiddleware from "../../middlewares/AuthMiddleware"
import { Role } from "../../models/User"

@Service()
export default class StreamController {
    private readonly router: express.Router
    constructor(
        private readonly fetchWrapper: FetchWrapper,
        private readonly authMiddleware: AuthMiddleware
    ) {
        this.router = Router()
        this.setRoutes()
    }
    protected getRoute = (url: string) => {
        return `/streams${url}`
    }
    setRoutes = () => {
        // get courses by streamId
        this.router.get(
            "/courses",
            this.authMiddleware.isAuthenticated,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(`/courses/${id}`))
                    .get()
            }
        )
        // get all streams
        this.router.get(
            "/",
            this.authMiddleware.isAuthenticated,
            (req: Request, res: Response, next: NextFunction) => {
                this.fetchWrapper.fetch(req, res, next, this.getRoute("")).get()
            }
        )
        // create new stream
        this.router.post(
            "/",
            this.authMiddleware.isAuthenticated,
            this.authMiddleware.isAuthorized(Role.ADMIN),
            (req: Request, res: Response, next: NextFunction) =>
                this.fetchWrapper
                    .fetch(req, res, next, this.getRoute(""))
                    .post()
        )
        // get stream by stream code
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
        // delete a stream by id
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
        // add courses to a stream
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
        // delete course from a stream
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
