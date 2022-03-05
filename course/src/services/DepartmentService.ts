import { Service } from "typedi"
import CustomError from "../error"
import { DepartmentModel } from "../models/Department"
import DepartmentRepo from "../repo/DepartmentRepo"

@Service()
export default class Department {
    constructor(private readonly departmentRepo: DepartmentRepo) {}
    createNewDepartment = async (department: DepartmentModel) => {
        return await this.departmentRepo.createDepartment(department)
    }
    getAllDepartments = async () => {
        const depts = await this.departmentRepo.getAllDepartments()
        return depts
    }
    getDepartmentById = async (id: string) => {
        const dept = await this.departmentRepo.getDepartmentById(id)
        if (dept === null) {
            throw new CustomError(
                `Department with id ${id} not found`,
                404,
                null
            )
        }
        return dept
    }
    getDepartmentByCode = async (code: string) => {
        const dept = await this.departmentRepo.getDepartmentByCode(code)
        if (dept === null) {
            throw new CustomError(
                `Department with code ${code} not found`,
                404,
                null
            )
        }
        return dept
    }
    removeCourse = async (id: string, course: string) => {
        await this.departmentRepo.removeCourse(id, course)
    }
    deleteDepartmentById = async (id: string) => {
        const dept = await this.departmentRepo.deleteDepartmentById(id)
        if (!dept) throw new CustomError("Department not found", 404, null)
        return dept
    }
}
