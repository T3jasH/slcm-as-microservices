class CustomError {
    message: string
    statusCode: number
    error: unknown
    constructor(message: string, statusCode: number, error: unknown) {
        this.message = message
        this.statusCode = statusCode
        this.error = error
    }
}

export default CustomError
