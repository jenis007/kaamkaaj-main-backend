const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    experience_level: {
        type: String,
    },
    start_working: {
        type: Date
    },
    date_of_birth: {
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
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `please enter valid 10 digit mobile number!`
        },
    },
    profile_picture: {
        type: String
    },
    video_cv: {
        type: String
    },
    address: {
        type: String
    },
    language: {
        type: String
    },
    pin_code: {
        type: String
    },
    state: {
        type: String
    },
    district: {
        type: String
    },
    city: {
        type: String
    },
    bio: {
        type: String
    },
    work_experience: [{
        company_name: String,
        industry: String,
        start_time: Date,
        end_time: Date,
        functional_area: String,
        designation: String,
        department: String,
        role: String,
        this_is_an_internship: {
            type: Number,
            enum: [
                0,
                1,
            ],
        },
        hide_info_this_company: {
            type: Number,
            enum: [
                0,
                1,
            ],
        },
        present: {
            type: Number,
            enum: [
                0,
                1,
            ],
        }
    }],
    job_preference: [{
        job_type: {
            type: String,
            enum: ['Full Time', 'Internship', "Contract"],
        },
        functional_area: [String],
        industry: [String],
        preferred_city: String,
        expected_salary: String,
    }],
    education: [{
        institute_name: String,
        education_level: String,
        field_study: String,
        start_time: String,
        end_time: String,
        grade: String,
        experience_school: String,
        present: {
            type: Number,
            enum: [
                0,
                1,
            ],
        }
    }],
    notification: {
        SMS_notification: {
            type: Number,
            enum: [
                0,
                1,
            ],
        },
        SMS_recommendation: {
            type: Number,
            enum: [
                0,
                1,
            ],
        },
        notifications: {
            type: Number,
            enum: [
                0,
                1,
            ],
        }
    },
    skills: [String],
    payment_history: [{
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
    home_page_profile: [String],
    saved_jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
    }],
    viewed_jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPost',
    }],
    fcm_token: [String],
    profile_viewers: [{
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recruiter',
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
    ],
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 1
    },
    availability: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    not_searching_jobs_now: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    profile_completion: {
        type: String
    },
    role: {
        type: String,
        default: 'candidate'
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
    chats: [
        {
            recruiter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recruiter',
            },
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chat',
            },
            status: {
                type: Number,
                enum: [0, 1],
                default: 1,
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

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;