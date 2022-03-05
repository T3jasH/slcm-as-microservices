import { Types } from "mongoose"
import { Service } from "typedi"
import Class, { ClassModel } from "../models/Class"
import UserToClass, { UserToClassModel } from "../models/UserToClass"

@Service()
export default class ClassRepo {
    createClass = async (cls: ClassModel) => {
        const newClass = new Class(cls)
        return await newClass.save()
    }
    createClassesByNumberOfSections = async (
        cls: ClassModel,
        numberOfSections: number
    ) => {
        const classes: ClassModel[] = []
        for (var i = 0; i < numberOfSections; i += 1) {
            classes.push({
                ...cls,
                section: String.fromCharCode("A".charCodeAt(0) + i),
            })
        }
        return await Class.insertMany(classes)
    }
    getClassById = async (classId: string) => {
        return await Class.findById(classId)
    }
    /**
     * @param year Year in which a semester starts, for profs only
     */
    getClassByStreamAndYear = async (streamId: string, year: number) => {
        return await Class.find({ stream: streamId, year })
    }
    /**
     * This is for students only
     */
    getClassesByStreamAndBatch = async (streamId: string, batch: number) => {
        const classes = await Class.find({ stream: streamId, batch }).lean()
        classes.forEach((cls, i) => {
            classes[i]._id = cls._id.toHexString()
        })
        return classes
    }
    deleteClassesByStreamBatch = async (streamId: string, batch: number) => {
        await Class.deleteMany({ stream: streamId, batch })
    }
    getClassesByStreamBatchSem = async (
        streamId: string,
        batch: number,
        semester: number
    ) => {
        return await Class.find({
            stream: streamId,
            batch: batch,
            semesters: { $elemMatch: semester },
        })
    }
    getAllClasses = async () => {
        return await Class.find({})
    }
    addStudentsToClass = async (_id: string, students: string[]) => {
        await Class.updateOne(
            { _id },
            { $addToSet: { students: { $each: students } } }
        )
    }
    getStudentsByStreamBatch = async (batch: number, stream: string) => {
        return await Class.find({ batch, stream })
    }
    removeStudentsFromClassByStreamBatch = async (
        batch: number,
        stream: string
    ) => {
        await Class.updateMany({ batch, stream }, { $set: { students: [] } })
    }
    getUserToClassRelationByCourseYearSem = async (
        year: number,
        semester: number,
        courses: string[]
    ) => {
        return await UserToClass.find({
            year,
            semester,
            course: { $in: courses },
        })
    }
    getUserToClassRelationByCourseYearSemUser = async (
        year: number,
        semester: number,
        userId: string
    ) => {
        const allotment = await UserToClass.find({
            year,
            semester,
            userId,
        })
            .populate("course")
            .lean()
        // allotment.forEach((prof, ix) => {
        //     allotment[ix].course._id = (
        //         prof.course._id as unknown as Types.ObjectId
        //     ).toHexString()
        // })
        return allotment
    }
    /**
     * To add map user and course to class.
     * Bulk operations
     */
    addToUserClassRelation = async (userToClassArray: UserToClassModel[]) => {
        const data = await UserToClass.insertMany(userToClassArray)
        return data
    }
    deleteUserToClassRelationByCourseYearSem = async (
        year: number,
        semester: number,
        courses: string[]
    ) => {
        await UserToClass.deleteMany({
            year,
            semester,
            course: { $in: courses },
        })
    }
    deleteClass = async (classId: string) => {
        await Class.findByIdAndDelete(classId)
    }
}
