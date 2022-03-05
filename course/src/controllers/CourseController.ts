import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import * as express from "express"
import CourseService from "../services/CourseService"
import CourseValidator from "../validators/CourseValidator"

@Service()
class CourseController {
    private readonly router: express.Router
    constructor(
        private readonly courseService: CourseService,
        private readonly courseValidator: CourseValidator
    ) {
        this.router = express.Router()
        this.router.post(
            "/",
            this.courseValidator.createCourse,
            (req: Request, res: Response, next: NextFunction) => {
                this.courseService
                    .createNewCourse(req.body)
                    .then((data) =>
                        res.status(201).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/:id",
            this.courseValidator.paramsId,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.courseService
                    .removeCourse(id as any)
                    .then((data) =>
                        res.status(200).json({
                            success: true,
                            data: data,
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.get(
            "/faculty/:id",
            this.courseValidator.paramsId,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                this.courseService
                    .getLatestCoursePreferences(id)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/faculty",
            this.courseValidator.addCoursePreferences,
            (req: Request, res: Response, next: NextFunction) => {
                this.courseService
                    .addCoursePreferences(req.body)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Successfully added courses",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.put(
            "/faculty",
            this.courseValidator.updateCoursePreferences,
            (req: Request, res: Response, next: NextFunction) => {
                this.courseService
                    .updateCoursePreferences(req.body.userId, req.body.courses)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Successfully updated course preferences",
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

export default CourseController
