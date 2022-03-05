import multer from "multer"
import { Request, Response, NextFunction } from "express"
import { UserModel } from "../models/User"
import fs from "fs"
import { parse } from "fast-csv"
import { Service } from "typedi"
import { ParseOne } from "unzipper"
import CustomError from "../error"

@Service()
class FileUploadMiddleware {
    constructor() {
        if (!fs.existsSync(process.env.FILE_UPLOAD_PATH!)) {
            fs.mkdir(process.env.FILE_UPLOAD_PATH!, (err) => {
                if (err) {
                    console.log("Error while creating directory ", err)
                }
            })
        }
    }
    private readonly storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, process.env.FILE_UPLOAD_PATH!)
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + Date.now() + file.originalname)
        },
    })
    private readonly zipFilter = (req: Request, file: any, cb: any) => {
        if (file.mimetype.match(/zip$/)) {
            cb(null, true)
        } else {
            cb(new CustomError("Please upload a zip file", 422, null), false)
        }
    }
    private readonly deleteFilePromisify = (filePath: string) =>
        new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    return reject(err)
                }
                return resolve(null)
            })
        })
    private readonly deleteFile = (filePath: string) => {
        this.deleteFilePromisify(filePath).catch((err) => console.log(err))
    }
    upload = multer({
        storage: this.storage,
        fileFilter: this.zipFilter,
        limits: {
            fileSize: 1024 * 1024 * 50,
        },
    })
    getUsers = (req: Request, res: Response, next: NextFunction) => {
        const filePath = process.env.FILE_UPLOAD_PATH + "/" + req.file?.filename
        const users: UserModel[] = []
        fs.createReadStream(filePath)
            .pipe(ParseOne(/users.csv/))
            .on("error", (err) => {
                this.deleteFile(filePath)
                next(
                    new CustomError(
                        "Name of csv file must be users.csv",
                        422,
                        err
                    )
                )
            })
            .pipe(parse({ headers: true }))
            .on("error", (err) => {
                this.deleteFile(filePath)
                return next(err)
            })
            .on("data", (row) => {
                users.push(row)
            })
            .on("end", () => {
                req.body.users = users
                this.deleteFile(filePath)
                next()
            })
    }
    // getUsers = (req: Request, res: Response, next: NextFunction) => {
    //     const filePath = process.env.FILE_UPLOAD_PATH + "/" + req.file?.filename
    //     const users: UserModel[] = []
    //     fs.createReadStream(filePath)
    //         .pipe(parse({ headers: true }))
    //         .on("error", (err) => {
    //             fs.unlink(filePath, err => {
    //                 if(err){
    //                     console.log("File deletion error", err)
    //                 }
    //             })
    //             return next(new CustomError("Error in parsing csv file", 500, err))})
    //         .on("data", (row) => {
    //             users.push(row)
    //         })
    //         .on("end", () => {
    //             req.body.users = users
    //             fs.unlink(filePath, (err) => {
    //                 if (err) {
    //                     console.log("File deletion error ", err)
    //                 }
    //             })
    //             next()
    //         })
    // }
}

export default FileUploadMiddleware
