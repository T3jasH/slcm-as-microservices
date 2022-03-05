import axios from "axios"
import { NextFunction, Request, Response } from "express"
import { Service } from "typedi"

@Service()
export default class FetcWrapper {
    private readonly fetcher
    constructor() {
        this.fetcher = axios.create({ baseURL: process.env.COURSE_ADDR })
    }
    fetch = (req: Request, res: Response, next: NextFunction, addr: string) => {
        const thenFunction = ({
            data,
            status,
        }: {
            data: any
            status: number
        }) => {
            return res.status(status).json(data)
        }
        const catchFunction = (error: any) => {
            const { data, status } = error.response
            return res
                .status(status)
                .json({ error: data.error, message: data.message })
        }
        return {
            post: () =>
                this.fetcher
                    .post(addr, req.body)
                    .then(thenFunction)
                    .catch(catchFunction),
            get: () =>
                this.fetcher.get(addr).then(thenFunction).catch(catchFunction),
            put: () =>
                this.fetcher
                    .put(addr, req.body)
                    .then(thenFunction)
                    .catch(catchFunction),
            delete: () =>
                this.fetcher
                    .delete(addr)
                    .then(thenFunction)
                    .catch(catchFunction),
            patch: () =>
                this.fetcher
                    .patch(addr, req.body)
                    .then(thenFunction)
                    .catch(catchFunction),
        }
    }
}
