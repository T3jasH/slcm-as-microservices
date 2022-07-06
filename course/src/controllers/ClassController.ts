import * as express from "express"
import { Request, Response, NextFunction } from "express"
import { Service } from "typedi"
import ClassService from "../services/ClassService"
import ClassValidator from "../validators/ClassValidator"

@Service()
export default class ClassController {
    private readonly router: express.Router
    constructor(
        private readonly classService: ClassService,
        private readonly classValidator: ClassValidator
    ) {
        this.router = express.Router()
        this.router.post(
            "/",
            this.classValidator.createClass,
            (req: Request, res: Response, next: NextFunction) => {
                this.classService
                    .createNewClassesByStreams(req.body)
                    .then((data) =>
                        res.status(201).json({ success: true, data })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            `/streams/faculty-allot`,
            this.classValidator.classesToProfsAllotment,
            (req: Request, res: Response, next: NextFunction) => {
                const { streamId, year, semester } = req.body
                this.classService
                    .allotClassesToProfsByStream(streamId, year, semester)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Classes assigned to profs",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/streams/faculty",
            this.classValidator.classesToProfsAllotment,
            (req: Request, res: Response, next: NextFunction) => {
                const { streamId, year, semester } = req.body
                this.classService
                    .getProfToClassAllotment(streamId, year, semester)
                    .then((data) =>
                        res.status(200).json({ success: true, data })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/streams/faculty-allot",
            this.classValidator.classesToProfsAllotment,
            (req: Request, res: Response, next: NextFunction) => {
                const { streamId, year, semester } = req.body
                this.classService
                    .resetProfToClassAllotmentByStreamYearSem(
                        streamId,
                        year,
                        semester
                    )
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Profs allotment reset",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/streams/students-allot",
            this.classValidator.allotClassesToStudents,
            (req: Request, res: Response, next: NextFunction) => {
                const { students, streamId, batch, currSem } = req.body
                this.classService
                    .allotClassesToStudentsByStream(
                        students,
                        streamId,
                        batch,
                        currSem
                    )
                    .then((data) =>
                        res.status(200).json({
                            success: true,
                            data,
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/streams/students",
            this.classValidator.studentClassAllotment,
            (req: Request, res: Response, next: NextFunction) => {
                const { streamId, batch, semesters } = req.body
                this.classService
                    .getStudentsClassAllotment(streamId, batch, semesters)
                    .then((data) =>
                        res.status(200).json({
                            success: true,
                            data,
                        })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/streams/students-allot",
            this.classValidator.studentClassAllotment,
            (req: Request, res: Response, next: NextFunction) => {
                const { streamId, batch } = req.body
                this.classService
                    .resetStudentClassAlltomentByStream(streamId, batch)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Students allotment reset",
                        })
                    )
                    .catch((err) => next(err))
            }
        )

        this.router.post(
            "/streams/faculty-allot/:id",
            this.classValidator.classesToProfsAllotmentByUser,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                const { year, semester } = req.body
                this.classService
                    .getProfToClassAllotmentByUser(year, semester, id)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/streans/student-allot/:id",
            this.classValidator.classAllotmentByStudent,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                const { streamId, batch, currSem } = req.body
                this.classService
                    .getClassByStudent(streamId, batch, currSem, id)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.post(
            "/streams/:id",
            this.classValidator.getByStreamBatch,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                const { batch } = req.body
                this.classService
                    .getClassesByStreamBatch(id, batch)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
            }
        )
        this.router.delete(
            "/streams/:id",
            this.classValidator.getByStreamBatch,
            (req: Request, res: Response, next: NextFunction) => {
                const { id } = req.params
                const { batch } = req.body
                this.classService
                    .deleteClassesByStreamBatch(id, batch)
                    .then(() =>
                        res.status(200).json({
                            success: true,
                            data: "Successfully deleted",
                        })
                    )
                    .catch((err) => next(err))
            }
        )
    }
    getRouter = () => this.router
}
