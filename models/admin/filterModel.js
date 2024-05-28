const mongoose = require('mongoose');

const filterSchema = new mongoose.Schema({
    name: {
        type: String
    },
    detail: [String],
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    show_user: {
        type: Number,
        enum: [0, 1],
        default: 1
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

const Filter = mongoose.model('Filter', filterSchema);
module.exports = Filter;