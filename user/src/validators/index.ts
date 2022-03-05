import { Service } from "typedi"
import AuthValidator from "./AuthValidator"

@Service()
class Validator {
    auth: AuthValidator
    constructor() {
        this.auth = new AuthValidator()
    }
}

export default Validator
