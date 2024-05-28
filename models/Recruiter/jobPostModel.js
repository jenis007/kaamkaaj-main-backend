const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    job_title: {
        type: String
    },
    job_type: {
        type: String
    },
    job_description: {
        type: String
    },
    work_experience: {
        type: String
    },
    education: {
        type: String
    },
    expected_salary: {
        type: String
    },
    job_location: {
        type: String
    },
    remote_job: {
        type: Number,
        enum: [
            0,
            1,
        ],
    },
    interviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
    }],
    recruiter:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
    },
    request_status: {
        type: String,
        enum: [
            "accept",
            "pending",
            "reject"
        ],
        default: "pending"
    },
    job_status: {
        type: String,
        enum: [
            "opening",
            "closed",
        ],
        default: "opening"
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const JobPost = mongoose.model('JobPost', jobPostSchema);
module.exports = JobPost;