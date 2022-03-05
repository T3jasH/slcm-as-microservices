import mongoose from "mongoose"
import { Service } from "typedi"

@Service()
class Database {
    async connectToDb() {
        const mongoUri =
            process.env.NODE_ENV === "test"
                ? process.env.TEST_MONGO_URI
                : process.env.MONGO_URI
        try {
            if (!mongoUri) {
                throw new Error("Env not initialized")
            }
            await mongoose.connect(mongoUri, {
                autoIndex: process.env.NODE_ENV === "production" ? false : true,
            })
            console.log("Connected to mongodb")
        } catch (err) {
            console.log(err)
        }
    }

    async disconnect() {
        await mongoose.disconnect()
    }
}

export default Database
