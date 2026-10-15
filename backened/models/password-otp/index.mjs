import mongoose from "mongoose";

const passwordOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otpCodeHash: {
        type: String,
        required: true,
    },
    
}, { timestamps: true })

export const PasswordOtpModel = mongoose.model("password-otps", passwordOtpSchema)