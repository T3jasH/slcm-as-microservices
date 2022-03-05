import { CourseClassification, CourseModel } from "./models/Course"
import { Types } from "mongoose"
import { ClassModel } from "./models/Class"
import { DepartmentModel } from "./models/Department"
import { StreamModel } from "./models/Stream"

const NUMBER_OF_CLASSES = 4
const NUMBER_OF_STUDENTS = 250

export const streamToSections = [
    {
        streamId: new Types.ObjectId().toHexString(),
        batch: 2023,
        numberOfSections: 4,
        semesters: [3, 4, 5, 6, 7, 8],
    },
    {
        streamId: new Types.ObjectId().toHexString(),
        batch: 2023,
        numberOfSections: 4,
        semesters: [3, 4, 5, 6, 7, 8],
    },
    {
        streamId: new Types.ObjectId().toHexString(),
        batch: 2024,
        numberOfSections: 10,
        semesters: [1, 2],
    },
]

export const courses: CourseModel[] = [
    {
        _id: "1" as any,
        code: "DSA",
        name: "Data Structures and Algorithms",
        classification: CourseClassification.THEORY,
        credits: 48,
        hours: 4,
    },
    {
        _id: "2" as any,
        code: "DSD",
        name: "Digital System Design",
        classification: CourseClassification.THEORY,
        credits: 48,
        hours: 4,
    },
    {
        _id: "3" as any,
        code: "COA",
        name: "Computer Organization and Architecture",
        classification: CourseClassification.THEORY,
        credits: 24,
        hours: 3,
    },
    {
        _id: "4" as any,
        code: "OOP",
        name: "Object Oriented Programming",
        classification: CourseClassification.THEORY,
        credits: 48,
        hours: 3,
    },
]

export const userToCourses = [
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[0], courses[1]],
        semester: 3,
        year: 2022,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[2], courses[3]],
        semester: 3,
        year: 2022,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[0], courses[3]],
        semester: 3,
        year: 2022,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[1], courses[2]],
        semester: 3,
        year: 2022,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[0]],
        semester: 3,
        year: 2020,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[1]],
        semester: 3,
        year: 2020,
    },
    {
        userId: new Types.ObjectId().toHexString(),
        courses: [courses[2]],
        semester: 3,
        year: 2020,
    },
]

export const classes: ClassModel[] = []
for (var i = 0; i < NUMBER_OF_CLASSES; i++) {
    classes.push({
        _id: new Types.ObjectId().toHexString(),
        section: "A" + i,
        batch: 2023,
        year: 2020,
        semesters: [3, 4, 5, 6, 7, 8],
        students: [],
        stream: { _id: new Types.ObjectId() } as any,
    })
}

export const students: string[] = []
for (var i = 1; i <= NUMBER_OF_STUDENTS; i += 1)
    students.push(new Types.ObjectId().toHexString())

export const department: DepartmentModel = {
    code: "CSE",
    name: "Computer Science",
    courses: [],
    profs: [],
    _id: new Types.ObjectId().toHexString(),
}

export const streams: StreamModel[] = [
    {
        name: "Computer Science",
        code: "CS",
        courseToSem: [],
    },
    {
        name: "Information And Communication Technology",
        code: "ICT",
        courseToSem: [],
    },
]
