import "reflect-metadata"
import express, { NextFunction, Request, Response } from "express"
import "dotenv/config"
import Container from "typedi"
import Database from "./repo/db"
import AuthController from "./controllers/AuthController"
import session from "express-session"
import connectRedis from "connect-redis"
import Cache from "./repo/cache"
import CourseController from "./controllers/CourseGateway"

interface SessionUser {
    _id: string
    role: number
}

declare module "express-session" {
    export interface SessionData {
        user: SessionUser
    }
}

const app = express()
const db = Container.get(Database)
const cache = Container.get(Cache)
app.use(express.json())
app.disable("x-powered-by") // Security measure

app.listen(process.env.PORT, () => {
    db.connectToDb()
    console.log("Listening at ", process.env.PORT)
})

const RedisStore = connectRedis(session)

app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        store: new RedisStore({ client: cache.getClient(), logErrors: true }),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 10000 * 60 * 60 * 24 }, // 1 day
    })
)

app.use("/auth", Container.get(AuthController).getRouter())
app.use("/course", Container.get(CourseController).getRoutes())
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
        message: "Route does not exist in gateway",
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

process.on("SIGABRT", () => db.disconnect())
process.on("SIGINT", () => db.disconnect())

export default app
