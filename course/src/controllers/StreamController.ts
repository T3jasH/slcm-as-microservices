import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import * as express from "express"
import StreamService from "../services/StreamService"
import StreamValidator from "../validators/StreamValidator"

@Service()
export default class StreamController {
    private readonly router: express.Router
    constructor(
        private readonly streamService: StreamService,
        private readonly streamValidator: StreamValidator
    ) {
        this.router = express.Router()
        this.router.get(
            "/",
            (req: Request, res: Response, next: NextFunction) => {
                this.streamService
                    .getAllStreams()
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.get(
            "/courses/:code",
            (req: Request, res: Response, next: NextFunction) => {
                const { code } = req.params
                this.streamService
                    .getCoursesByStream(code)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.get(
            "/:code",
            (req: Request, res: Response, next: NextFunction) => {
                const { code } = req.params
                this.streamService
                    .getStreamByCode(code)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/",
            this.streamValidator.createStream,
            (req: Request, res: Response, next: NextFunction) => {
                const { name, code } = req.body
                this.streamService
                    .createStream(name, code)
                    .then((data) =>
                        res.status(201).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/:id",
            this.streamValidator.paramsId,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.streamService
                    .deleteStreamById(id as any)
                    .then(() => {
                        res.status(200).json({
                            data: "Successfully deleted stream",
                            success: true,
                        })
                    })
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/courses/:id",
            this.streamValidator.addCourses,
            (req: Request, res: Response, next: NextFunction) => {
                this.streamService
                    .addCoursesToStream(req.body.courses, req.params.id as any)
                    .then(() =>
                        res.status(200).json({
                            data: "Added courses successfully",
                            success: true,
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/courses/:id",
            this.streamValidator.removeCourse,
            (req: Request, res: Response, next: NextFunction) => {
                this.streamService
                    .removeCourseFromStream(
                        req.body.courseId,
                        req.params.id as any
                    )
                    .then(() =>
                        res.status(200).json({
                            data: "Removed course successfully",
                            success: true,
                        })
                    )
                    .catch((err) => next(err))
            }
        )
    }
    getRouter = () => this.router
}
