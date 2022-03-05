import { Service } from "typedi"
import { createClient } from "redis"

@Service()
class Cache {
    private cache
    constructor() {
        const url = process.env.REDIS_URL
        if (!url) {
            throw Error("Redis host not in env")
        }
        this.cache = createClient({ url })
    }
    getClient() {
        return this.cache
    }
}

export default Cache
