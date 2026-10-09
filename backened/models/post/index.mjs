import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }],
        default: [] // Ensures likes array is always initialized
    }
}, { timestamps: true });

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
    imageUrl: {
        type: String,
        trim: true,
        default: null,
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true 
    },
    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }],
        default: [] 
    },
    comments: {
        type: [commentSchema],
        default: [] 
    }
}, { timestamps: true });

export const PostModel = mongoose.model("posts", postSchema);