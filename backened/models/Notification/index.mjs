import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow"],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

export const NotificationModel = mongoose.model("notifications", notificationSchema);