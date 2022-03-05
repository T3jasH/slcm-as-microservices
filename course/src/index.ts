import "reflect-metadata"
import "dotenv/config"
import express, { NextFunction, Request, Response } from "express"
import Container from "typedi"
import Database from "./repo/db"
import CourseController from "./controllers/CourseController"
import StreamController from "./controllers/StreamController"
import ClassController from "./controllers/ClassController"
import DepartmentController from "./controllers/DepartmentController"

const app: express.Application = express()
export const db = Container.get(Database)
app.use(express.json())

const server = app.listen(process.env.PORT, () => {
    db.connectToDb()
    console.log("Listening at ", process.env.PORT)
})

const closeApp = () => {
    server.close()
}

app.use("/courses", Container.get(CourseController).getRouter())
app.use("/streams", Container.get(StreamController).getRouter())
app.use("/classes", Container.get(ClassController).getRouter())
app.use("/departments", Container.get(DepartmentController).getRouter())
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
        message: "Route does not exist in course microservice",
        success: false,
    })
})

app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.statusCode === undefined) {
        console.log(err)
        return res
            .status(500)
            .json({ error: err, message: "Something went wrong!" })
    }
    return res.status(err.statusCode).json({
        error: err.error,
        message: err.message,
    })
})

process.env.NODE_ENV !== "production" &&
    process.on("uncaughtException", (err) => {
        console.log(err)
    })
process.env.NODE_ENV !== "production" &&
    process.on("unhandledRejection", (err) => {
        console.log(err)
    })

process.on("SIGABRT", () => db.disconnect())
process.on("SIGINT", () => db.disconnect())

export default { app, closeApp }
