const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Notification = require("../../models/notificationModel");

const addNotification = async (notificationData) => {
    try {
        // const notificationData = req.body;

        const requiredFields = ['user', 'userRole', 'title', 'body'];
        for (const field of requiredFields) {
            if (!notificationData[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
        }

        const existingNotification = await Notification.findOne({ user: notificationData.user });
        if (existingNotification) {
            existingNotification.notifications.push({
                title: notificationData.title,
                body: notificationData.body,
                data: notificationData.data
            });
            await existingNotification.save();
        } else {
            const newNotification = new Notification({
                user: notificationData.user,
                userRole: notificationData.userRole,
                notifications: [{
                    title: notificationData.title,
                    body: notificationData.body,
                    data: notificationData.data
                }]
            });
            await newNotification.save();
        }

        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Notification added successfully",
            data: {
                user: notificationData.user,
                userRole: notificationData.userRole
            }
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getNotifications = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.findOne({ user: userId });
        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Notification data retriv successfully",
            data: notifications
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateNotificationReadStatus = async (req, res, next) => {
    try {
        // frist find notification using user id and after this find data in notifications in match notificationid this id and user id i have pass in body
        const notificationId = req.params.notificationId;
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new ErrorHandler("Notification not found", StatusCodes.NOT_FOUND);
        }
        notification.notifications.forEach(notif => {
            notif.read = 1;
        });
        await notification.save();
        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Notification staus update successfully",
            data: {
                user: notification.user,
                userRole: notification.userRole
            }
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await Notification.findOneAndUpdate(
            { 'notifications._id': notificationId },
            { $pull: { notifications: { _id: notificationId } } },
            { new: true }
        );

        if (!notification) {
            throw new ErrorHandler("Notification not found", StatusCodes.NOT_FOUND);
        }

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Notification deleted successfully",
            data: {
                user: notification.user,
                userRole: notification.userRole
            }
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addNotification,
    getNotifications,
    updateNotificationReadStatus,
    deleteNotification
}