import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 300 seconds = 5 minutes (5 min baad DB se auto delete ho jaye ga)
    }
}, { timestamps: true })

export const EmailOtpModel = mongoose.model("email-otps", emailOtpSchema)