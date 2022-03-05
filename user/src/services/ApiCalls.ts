import axios from "axios"
import { Service } from "typedi"

@Service()
/**
 * Separate class so that api calls can be mocked easily for unit tests
 */
export default class ApiCalls {
    getStreamByCode = async (code: string | null) => {
        if (code === null) {
            const { data } = await axios.get("/course/streams")
            return data
        }

        const { data } = await axios.get(`/course/streams/${code}`)
        return data
    }
    getDepartmentByCode = async (code: string | null) => {
        if (code === null) {
            const { data } = await axios.get("/course/departments")
            return data
        }
        const { data } = await axios.get(`/course/departments/${code}`)
        return data
    }
}
