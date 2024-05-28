const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const JobPost = require("../../../models/Recruiter/jobPostModel");
const Recruiter = require("../../../models/recruiter/recruiterModel");
const { checkPremiumRecruiter } = require("../../../utils/helper");

const createJobPost = async (req, res, next) => {
    try {
        const jobData = req.body;

        const requiredFields = ['job_title', 'job_type', 'job_description', 'work_experience', 'education', 'expected_salary', 'job_location', 'remote_job', 'recruiter'];
        for (const field of requiredFields) {
            if (!jobData[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
        }

        const recruiter = await Recruiter.findById(jobData.recruiter);
        if (!recruiter) {
            throw new ErrorHandler(`Recruiter not found with ID: ${jobData.recruiter}`, StatusCodes.NOT_FOUND);
        }

        const job = await JobPost.create(jobData);
        recruiter.job_list.push(job._id);
        await recruiter.save();
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Job post request sent successfully",
            data: {
                _id: job._id,
                status: job.status
            },
            premium: activePremium
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllJobPostsByRecruiterId = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;
        const { status, request_status, job_status } = req.query;

        let baseQuery = { recruiter: recruiterId };

        if (status) {
            baseQuery.status = parseInt(status);
        }
        if (request_status) {
            baseQuery.request_status = request_status;
        }
        if (job_status) {
            baseQuery.job_status = job_status;
        }
        const jobs = await JobPost.find(baseQuery).sort({ updated_at: -1 });
        const { activePremium } = await checkPremiumRecruiter(recruiterId)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Job posts retrieved successfully",
            data: jobs,
            premium: activePremium
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getJobPostById = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = await JobPost.findById(jobId);

        if (!job) {
            throw new ErrorHandler("Job post not found", StatusCodes.NOT_FOUND);
        }
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Job post retrieved successfully",
            data: job,
            premium: activePremium
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateJobStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { job_status } = req.body;

        if (!job_status) {
            throw new ErrorHandler("Missing job_status field", StatusCodes.BAD_REQUEST);
        }

        if (job_status !== "opening" && job_status !== "closed") {
            throw new ErrorHandler("Invalid job_status value", StatusCodes.BAD_REQUEST);
        }
        const updatedJob = await JobPost.findByIdAndUpdate(jobId, { job_status }, { new: true });
        if (!updatedJob) {
            throw new ErrorHandler("Job post not found", StatusCodes.NOT_FOUND);
        }
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Job status updated successfully",
            data: {
                _id: updatedJob._id,
                status: updatedJob.status,
                job_status: updatedJob.job_status
            },
            premium: activePremium
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    createJobPost,
    getAllJobPostsByRecruiterId,
    getJobPostById,
    updateJobStatus
};