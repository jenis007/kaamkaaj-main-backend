const { StatusCodes } = require("http-status-codes");
const Recruiter = require("../../models/recruiter/recruiterModel");
const ErrorHandler = require("../../middleware/errorHandler");
const JobPost = require("../../models/Recruiter/jobPostModel");

const getAllRecruiterAdmin = async (req, res, next) => {
    try {
        const { first_name, last_name, status, request_status } = req.query;
        let baseQuery = {};

        if (first_name) {
            baseQuery.first_name = { $regex: new RegExp(first_name, "i") };
        }
        if (last_name) {
            baseQuery.last_name = { $regex: new RegExp(last_name, "i") };
        }
        if (status) {
            baseQuery.status = parseInt(status);
        }
        if (request_status) {
            baseQuery.request_status = request_status;
        }

        const recruiters = await Recruiter.find(baseQuery).sort({ updated_at: -1 });
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Recruiters retrieved successfully",
            data: recruiters,
            premium: {}
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const requestUpdateRecruiter = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;
        const { request_status } = req.body;

        if (request_status && !["accept", "pending", "reject"].includes(request_status)) {
            return next(new ErrorHandler("Invalid request status", StatusCodes.BAD_REQUEST));
        }

        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            return next(new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND));
        }

        recruiter.request_status = request_status;
        recruiter.status = 1;

        await recruiter.save();
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Request accepted successfully",
            data: {
                _id: recruiter._id,
                status: recruiter.status,
                request_status: recruiter.request_status
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

// Job's

const getAllJobsAdmin = async (req, res, next) => {
    try {
        const { job_title, job_type, status, request_status } = req.query;
        let baseQuery = {};

        if (job_title) {
            baseQuery.job_title = { $regex: new RegExp(job_title, "i") };
        }
        if (job_type) {
            baseQuery.job_type = { $regex: new RegExp(job_type, "i") };
        }
        if (status) {
            baseQuery.status = parseInt(status);
        }
        if (request_status) {
            baseQuery.request_status = request_status;
        }

        const jobs = await JobPost.find(baseQuery).sort({ updated_at: -1 });
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "jobs retrieved successfully",
            data: jobs,
            premium: {}
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const requestUpdateJobPost = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { request_status } = req.body;

        if (request_status && !["accept", "pending", "reject"].includes(request_status)) {
            return next(new ErrorHandler("Invalid request status", StatusCodes.BAD_REQUEST));
        }

        const job = await JobPost.findById(jobId);
        if (!job) {
            return next(new ErrorHandler("job not found", StatusCodes.NOT_FOUND));
        }

        job.request_status = request_status;
        job.status = 1;

        await job.save();
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Request accepted successfully",
            data: {
                _id: job._id,
                status: job.status,
                request_status: job.request_status,
                recruiter: job.recruiter
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllRecruiterAdmin,
    requestUpdateRecruiter,
    getAllJobsAdmin,
    requestUpdateJobPost
};
