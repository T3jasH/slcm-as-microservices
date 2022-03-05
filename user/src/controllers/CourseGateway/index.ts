import * as express from "express"
import { Service } from "typedi"
import CourseController from "./CourseController"
import ClassController from "./ClassController"
import StreamController from "./StreamController"
import DepartmentController from "./DepartmentController"

@Service()
export default class CourseService {
    private readonly router: express.Router
    constructor(
        private readonly classController: ClassController,
        private readonly courseController: CourseController,
        private readonly streamController: StreamController,
        private readonly departmentController: DepartmentController
    ) {
        this.router = express.Router()
        this.setRoutes()
    }
    setRoutes = () => {
        this.router.use("/classes", this.classController.getRoutes())
        this.router.use("/streams", this.streamController.getRoutes())
        this.router.use("/courses", this.courseController.getRoutes())
        this.router.use("/departments", this.departmentController.getRoutes())
    }
    getRoutes = () => this.router
}
