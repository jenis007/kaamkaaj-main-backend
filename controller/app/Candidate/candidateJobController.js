const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const JobPost = require("../../../models/Recruiter/jobPostModel");
const { checkPremiumCandidate } = require("../../../utils/helper");
const Candidate = require("../../../models/Candidate/candidateModel");

const getAllJobForCandidate = async (req, res, next) => {
    try {
        let filters = { status: 1 };

        if (req.query.job_type) {
            filters.job_type = req.query.job_type;
        }
        if (req.query.job_title) {
            filters.job_title = req.query.job_title;
        }
        if (req.query.work_experience) {
            filters.work_experience = req.query.work_experience;
        }
        if (req.query.education) {
            filters.education = req.query.education;
        }
        if (req.query.expected_salary) {
            filters.expected_salary = req.query.expected_salary;
        }
        if (req.query.job_location) {
            filters.job_location = req.query.job_location;
        }
        if (req.query.remote_job) {
            filters.remote_job = req.query.remote_job;
        }

        const jobs = await JobPost.find(filters).sort({ updated_at: -1 }).populate({
            path: 'recruiter',
            model: 'Recruiter',
            select: 'comapany_detail _id mobile_number frist_name last_name email fcm_token',
        });
        
        const { activePremium } = await checkPremiumCandidate(req.user._id);

        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Job posts retrieved successfully",
            data: jobs,
            premium: activePremium
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getJobById = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        const job = await JobPost.findById(jobId);

        if (!job || job.status !== 1) {
            return next(new ErrorHandler("Job not found or inactive", StatusCodes.NOT_FOUND));
        }
        const { activePremium } = await checkPremiumCandidate(req.user._id);

        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Job post retrieved successfully",
            data: job,
            premium: activePremium
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const saveJobPost = async (req, res, next) => {
    try {
        const { jobId, candidateId } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            throw new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND);
        }

        const isCandidateSaved = candidate.saved_jobs.includes(jobId);
        if (isCandidateSaved) {
            throw new ErrorHandler("Job already saved", StatusCodes.BAD_REQUEST);
        }

        candidate.saved_jobs.push(jobId);
        await candidate.save();
        const { activePremium } = await checkPremiumCandidate(candidateId);

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "job saved successfully",
            data: {
                _id: candidate._id,
                saved_profiles: candidate.saved_jobs
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

const getSavedJob = async (req, res, next) => {
    try {
        const { candidateId } = req.params;

        const candidate = await Candidate.findById(candidateId).populate('saved_jobs');
        if (!candidate) {
            throw new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND);
        }
        const { activePremium } = await checkPremiumCandidate(candidateId);

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Saved profiles retrieved successfully",
            data: candidate.saved_jobs,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

const removeSavedJob = async (req, res, next) => {
    try {
        const { jobId, candidateId } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            throw new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND);
        }

        const index = candidate.saved_jobs.indexOf(jobId);
        if (index === -1) {
            throw new ErrorHandler("Job not found in saved Job", StatusCodes.NOT_FOUND);
        }
        candidate.saved_jobs.splice(index, 1);
        await candidate.save();
        const { activePremium } = await checkPremiumCandidate(candidateId);

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Job removed from saved Job successfully",
            data: {
                _id: candidate._id,
                saved_profiles: candidate.saved_profiles
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAllJobForCandidate,
    getJobById,
    saveJobPost,
    getSavedJob,
    removeSavedJob,
};