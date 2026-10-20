import mongoose from "mongoose";
import { emailPattern } from "../../utils/core.mjs";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: emailPattern,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    profilepicture: {
        type: String,
        trim: true,
        default: null,
    },
    bio: {
        type: String,
        trim: true,
        default: "",
        maxLength: [200, "Bio cannot exceed 200 characters"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

export const UserModel = mongoose.model("users", userSchema)