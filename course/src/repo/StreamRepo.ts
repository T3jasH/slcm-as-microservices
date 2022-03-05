import { Service } from "typedi"
import Stream, { CourseToSem, StreamModel } from "../models/Stream"
import { Types } from "mongoose"

@Service()
class StreamRepo {
    createStream = async (newStream: StreamModel) => {
        const stream = new Stream(newStream)
        await stream.save()
        return stream
    }
    getStreamById = async (id: string) => {
        return await Stream.findById(id)
    }
    getStreamAndCoursesByCode = async (code: string) => {
        const stream = await Stream.findOne({ code }).populate(
            "courseToSem.course"
        )
        return stream
    }
    getStreamByCode = async (code: string) => {
        return await Stream.findOne({ code })
    }
    getStreamByName = async (name: string) => {
        return await Stream.findOne({ name })
    }
    /**
     * @returns Stream object with only those courses that are of given semester
     */
    getCoursesByStreamAndSem = async (_id: string, semester: number) => {
        const stream = await Stream.findById(_id)
            .populate({
                path: "courseToSem.course",
            })
            .lean()
        if (!stream) return null
        const courseToSem = stream?.courseToSem.filter(
            (course) => course.semester === semester
        )
        const courses = courseToSem.map((course) => ({
            ...course.course,
            _id: (course.course._id as any).toHexString() as string,
        }))
        return courses
    }
    getAllStreams = async () => {
        return await Stream.find({})
    }
    getStreamBySemester = async (semester: number) => {
        return await Stream.findOne({
            courseToSem: { $elemMatch: { semester, course: { $regex: ".*" } } },
        })
    }
    addCourses = async (streamId: string, courses: CourseToSem[]) => {
        await Stream.findByIdAndUpdate(streamId, {
            $addToSet: {
                courseToSem: { $each: courses },
            },
        })
    }
    removeCourse = async (streamId: string, courseId: string) => {
        await Stream.findByIdAndUpdate(streamId, {
            $pull: { courses: courseId },
        })
    }
    deleteStreamById = async (streamId: string) => {
        const stream = await Stream.findById(streamId)
        if (stream) {
            await stream.deleteOne()
        }
        return stream
    }
}

export default StreamRepo
