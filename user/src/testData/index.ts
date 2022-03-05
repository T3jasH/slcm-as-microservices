import { Gender, Role, UserModel } from "../models/User"

const generateUsers = () => {
    const users: UserModel[] = []
    const firstName = "First"
    const lastName = "Last"
    const middleName = "Middle"
    const email = "Email"
    const password = "12345678"
    const regNo = "123456789"
    const streams = ["CMN", "CSE"]
    const departments = [""]
    const phoneNo = "9912129030"
    for (var i = 0; i < 1000; i++) {
        users.push({
            firstName,
            lastName,
            middleName,
            email,
            password,
            regNo,
            phoneNo,
            batch: 2023,
            gender: i % 3 == 0 ? Gender.M : i % 3 === 1 ? Gender.T : Gender.F,
            role: i % 50 == 0 ? Role.FACULTY : Role.STUDENT,
            feesPaid: [],
            attendance: [],
        })
    }
}
