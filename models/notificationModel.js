const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userRole'
    },
    userRole: {
        type: String,
        required: true,
        enum: ['Candidate', 'Recruiter']
    },
    notifications: [
        {
            title: {
                type: String
            },
            body: {
                type: String
            },
            data: {
                type: Object
            },
            read: {
                type: Number,
                enum: [0, 1],
                default: 0,
            },
            updated_at: {
                type: Date,
                default: Date.now
            },
        }
    ],
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;