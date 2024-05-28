const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    mobile_number: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `please enter valid 10 digit mobile number!`
        },
    },
    country_code: {
        type: String
    },
    otp: {
        type: Number,
        required: true
    },
    role:{
        type: String
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const OtpModel = mongoose.model('Otp', otpSchema);
module.exports = OtpModel;
