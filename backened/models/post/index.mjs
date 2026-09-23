import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false 
    }
}, { timestamps: true })

export const PostModel = mongoose.model("posts", postSchema)