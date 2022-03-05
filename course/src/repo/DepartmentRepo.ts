import mongoose, { Types } from "mongoose"
import { Service } from "typedi"
import Department, { DepartmentModel } from "../models/Department"

@Service()
export default class DepartmentRepo {
    createDepartment = async (department: DepartmentModel) => {
        const newDepartment = new Department(department)
        return await newDepartment.save()
    }
    getDepartmentById = async (departmentId: string) => {
        return await Department.findById(departmentId)
    }
    getDepartmentByCode = async (code: string) => {
        return await Department.findOne({ code }).populate("courses")
    }
    getAllDepartments = async () => {
        return await Department.find({})
    }
    addCourses = async (departmentId: string, courses: string[]) => {
        await Department.findByIdAndUpdate(departmentId, {
            $addToSet: {
                courses: { $each: courses },
            },
        })
    }
    removeCourse = async (id: string, courseId: string) => {
        const dept = await Department.findById(id)
        if (!dept) {
            return dept
        }
        dept.courses = dept.courses.filter((crs) => crs._id !== courseId)
        await dept.save()
        return dept
    }
    deleteDepartmentById = async (departmentId: string) => {
        const dept = await Department.findById(departmentId)
        if (!dept) return null
        await dept.deleteOne()
        return dept
    }
}
