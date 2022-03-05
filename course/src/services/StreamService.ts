import { Service } from "typedi"
import CustomError from "../error"
import { CourseToSem } from "../models/Stream"
import StreamRepo from "../repo/StreamRepo"

@Service()
export default class StreamService {
    constructor(private readonly streamRepo: StreamRepo) {}
    createStream = async (name: string, code: string) => {
        const streamByName = await this.streamRepo.getStreamByName(name)
        if (streamByName !== null) {
            throw new CustomError(
                `Stream with name ${name} already exists`,
                400,
                { error: streamByName }
            )
        }
        const streamByCode = await this.streamRepo.getStreamByCode(code)
        if (streamByCode !== null) {
            throw new CustomError(
                `Stream with code ${code} already exists`,
                400,
                { error: streamByCode }
            )
        }
        return await this.streamRepo.createStream({
            name,
            courseToSem: [],
            code,
        })
    }
    getAllStreams = async () => {
        const streams = await this.streamRepo.getAllStreams()
        return streams
    }
    getStreamById = async (id: string) => {
        const stream = await this.streamRepo.getStreamById(id)
        if (stream === null) {
            throw new CustomError(`Stream with id ${id} not found`, 404, null)
        }
        return stream
    }
    getCoursesByStream = async (code: string) => {
        const stream = await this.streamRepo.getStreamAndCoursesByCode(code)
        if (stream === null) {
            throw new CustomError(
                `Stream with code ${code} not found`,
                404,
                null
            )
        }
        return stream
    }
    getStreamByCode = async (code: string) => {
        const stream = await this.streamRepo.getStreamAndCoursesByCode(code)
        if (stream === null) {
            throw new CustomError(
                `Stream with code ${code} not found`,
                404,
                null
            )
        }
        return stream
    }
    addCoursesToStream = async (courses: CourseToSem[], streamId: string) => {
        await this.streamRepo.addCourses(streamId, courses)
    }
    removeCourseFromStream = async (courseId: string, streamId: string) => {
        await this.streamRepo.removeCourse(streamId, courseId)
    }
    deleteStreamById = async (streamId: string) => {
        const stream = await this.streamRepo.deleteStreamById(streamId)
        if (!stream) {
            throw new CustomError(`Stream not found`, 404, null)
        }
    }
}
