const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    country_code: {
        type: String
    },
    mobile_number: {
        type: Number,
        unique: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `Please enter valid 10 digit mobile number!`
        },
    },
    profile_picture: {
        type: String
    },
    comapany_detail: {
        comapany_name: {
            type: String
        },
        comapany_type: {
            type: String
        },
        no_of_employees: {
            type: String
        },
        address: {
            type: String
        },
        about: {
            type: String
        }
    },
    job_position: {
        type: String
    },
    chats: [{
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidate',
        },
        status: {
            type: Number,
            enum: [0, 1],
            default: 1,
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        },
        updated_at: {
            type: Date,
            default: Date.now
        },
    }  
    ],
    job_list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
    }],
    interviews: [
        {
            candidate: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Candidate',
            },
            interview_time: {
                type: String
            },
            job: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'JobPost',
            },
            status: {
                type: Number,
                enum: [
                    0,
                    1,
                ],
                default: 0
            },
        }
    ],
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    availability: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    membership: [
        {
            plan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'PremiumPlan',
            },
            payment_detail: { type: Object },
            expired: {
                type: Number,
                enum: [0, 1],
                default: 0,
            },
            purchase_date: {
                type: Date,
            },
            expiry_date: {
                type: Date,
            },
        }
    ],
    payment_history: [
        {
            payment: { type: Object },
            detail: {
                type: { type: String },
                amount: { type: Number },
                currency: { type: String },
                payment_status: {
                    type: String,
                    enum: ['pending', 'completed', 'failed'],
                },
                gateway_response: { type: String }
            }
        }
    ],
    saved_profiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
    }],
    request_status: {
        type: String,
        enum: [
            "accept",
            "pending",
            "reject"
        ],
        default: "pending"
    },
    fcm_token: [String],
    role: {
        type: String,
        default: 'recruiter'
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
module.exports = Recruiter;
