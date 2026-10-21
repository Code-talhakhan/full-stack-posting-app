import { NotificationModel } from "../../../models/Notification/index.mjs";

// Get All Notifications for Logged-in User
export const getNotifications = async (req, res) => {
    try {
        const userId = req.currentUser?._id || req.user?._id;

        const notifications = await NotificationModel.find({ recipient: userId })
            .populate("sender", "firstName lastName firstname lastname profilePicture profilepicture profilePic")
            .populate("post", "title description imageUrl")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Notifications fetched successfully",
            data: notifications
        });
    } catch (error) {
        return res.status(500).send({
            message: "Error fetching notifications",
            error: error.message
        });
    }
};

//  Mark All Notifications as Read
export const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.currentUser?._id || req.user?._id;

        await NotificationModel.updateMany(
            { recipient: userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).send({
            message: "Notifications marked as read"
        });
    } catch (error) {
        return res.status(500).send({
            message: "Error updating notifications",
            error: error.message
        });
    }
};

// Delete Single Notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.currentUser?._id || req.user?._id;

        const deletedNotification = await NotificationModel.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!deletedNotification) {
            return res.status(404).send({
                message: "Notification not found"
            });
        }

        return res.status(200).send({
            message: "Notification deleted successfully"
        });
    } catch (error) {
        return res.status(500).send({
            message: "Error deleting notification",
            error: error.message
        });
    }
};