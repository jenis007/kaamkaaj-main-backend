const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [String],
    messages: [{
        text: {
            type: String,
        },
        sender_type: {
            type: String,
            required: true,
            enum: ['candidate', 'recruiter']
        },
        view: {
            type: Number,
            enum: [0, 1],
            default: 0,
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
    }],
    updated_at: {
        type: Date,
        default: Date.now
    },

});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
