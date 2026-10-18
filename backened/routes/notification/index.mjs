import express from "express";
import {
    getNotifications,
    markNotificationsAsRead,
    deleteNotification
} from "./controllers/index.mjs";

const router = express.Router();

// 1. Get All Notifications for Logged-in User
router.get("/all", getNotifications);

// 2. Mark All Notifications as Read
router.patch("/mark-as-read", markNotificationsAsRead);

// 3. Delete Single Notification
router.delete("/:notificationId", deleteNotification);

export default router;