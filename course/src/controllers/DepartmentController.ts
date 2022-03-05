import { Service } from "typedi"
import { Request, Response, NextFunction } from "express"
import * as express from "express"
import DepartmentService from "../services/DepartmentService"
import DepartmentValidator from "../validators/DepartmentValidator"

@Service()
export default class DepartmentController {
    private readonly router: express.Router
    constructor(
        private readonly departmentValidator: DepartmentValidator,
        private readonly departmentService: DepartmentService
    ) {
        this.router = express.Router()
        this.router.post(
            "/",
            this.departmentValidator.createDepartment,
            (req: Request, res: Response, next: NextFunction) =>
                this.departmentService
                    .createNewDepartment(req.body)
                    .then((data) =>
                        res.status(201).json({ data, success: true })
                    )
                    .catch((err) => next(err))
        )
        this.router.get(
            "/",
            (req: Request, res: Response, next: NextFunction) =>
                this.departmentService
                    .getAllDepartments()
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
        )
        this.router.get(
            "/:code",
            (req: Request, res: Response, next: NextFunction) =>
                this.departmentService
                    .getDepartmentByCode(req.params.code as any)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
        )
        this.router.delete(
            "/:id",
            (req: Request, res: Response, next: NextFunction) =>
                this.departmentService
                    .deleteDepartmentById(req.params.id as any)
                    .then((data) =>
                        res.status(200).json({ data, success: true })
                    )
                    .catch((err) => next(err))
        )
        this.router.delete(
            "/courses/:id",
            this.departmentValidator.removeCourse,
            (req: Request, res: Response, next: NextFunction) =>
                this.departmentService
                    .removeCourse(req.params.id as any, req.body.course as any)
                    .then(() =>
                        res.status(200).json({
                            data: "Deleted course successfully",
                            success: true,
                        })
                    )
                    .catch((err) => next(err))
        )
    }
    getRouter = () => this.router
}
