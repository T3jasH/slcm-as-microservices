import mongoose from "mongoose"

type DocType<T> = T & mongoose.Document

export default DocType
