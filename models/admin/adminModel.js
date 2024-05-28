const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    country_code: {
        type: String
    },
    mobile_number: {
        type: Number,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `please enter valid 10 digit mobile number!`
        },
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 1
    },
    role: {
        type: String,
        default: 'admin'
    },
    fcm_token: {
        type: String
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;