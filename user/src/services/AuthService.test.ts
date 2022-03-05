import AuthService from "./AuthService"
import { Gender } from "../models/User"
import CustomError from "../error"
const user = {
    firstName: "John",
    lastName: "Doe",
    password: "password",
    gender: Gender.M,
    phoneNo: "121212",
    role: 0,
    email: "validmail@gmail.com",
    regNo: "",
    batch: 2023,
    streamCode: "CSE",
    feesPaid: [],
    attendance: [],
    classToCourses: [],
}

describe("create user serivce", () => {
    let userRepo: any
    let api: any
    let authService: AuthService

    beforeEach(() => {
        userRepo = {
            findUserByEmail: jest
                .fn()
                .mockImplementation(async (email) => null),
            findUserByRegNo: jest
                .fn()
                .mockImplementation(async (regno) => null),
            createSingleUser: jest.fn().mockImplementation(async (user) => ({
                ...user,
                _id: "someRandomId",
            })),
        }
        api = {
            getStreamByCode: jest
                .fn()
                .mockImplementation(async (code: string | null) => ({
                    _id: "huehue",
                })),
        }
        authService = new AuthService(userRepo, api)
    })
    it("should return a new user", async () => {
        const resp = await authService.createUser(user)
        expect(resp).toHaveProperty("_id", "someRandomId")
        expect(resp).toHaveProperty("email", user.email)
    })
    it("throws an error", async () => {
        await expect(
            async () => await authService.login("username@mail.com", "password")
        ).rejects.toBeInstanceOf(CustomError)
    })
})
