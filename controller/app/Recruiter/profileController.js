const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const Recruiter = require("../../../models/Recruiter/recruiterModel");
const Candidate = require("../../../models/Candidate/candidateModel");
const { checkPremiumRecruiter, extractFolderAndFilename } = require("../../../utils/helper");
const path = require('path');
const fs = require('fs');

const updateRecruiterData = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;
        const update = req.body;

        const requiredFields = ['first_name', 'last_name', 'email', 'job_position', 'comapany_detail'];
        for (const field of requiredFields) {
            if (!update[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
            if (field === 'comapany_detail') {
                const companyDetailFields = ['comapany_name', 'comapany_type', 'no_of_employees', 'address', 'about'];
                for (const subField of companyDetailFields) {
                    if (!update[field][subField]) {
                        throw new ErrorHandler(`Missing or empty required field: comapany_detail.${subField}`, StatusCodes.BAD_REQUEST);
                    }
                }
            }
        }

        const recruiter = await Recruiter.findByIdAndUpdate(recruiterId, update, { new: true });
        if (!recruiter) {
            throw new ErrorHandler("recruiter not found", StatusCodes.NOT_FOUND);
        }
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "requst sent successfully",
            data: {
                _id: recruiter._id,
                status: recruiter.status
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getRecruiterDetails = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;

        const recruiter = await Recruiter.findOne({ _id: recruiterId, status: 1 });
        if (!recruiter) {
            return next(new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND));
        }

        const { activePremium } = await checkPremiumRecruiter(recruiterId)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "recruiter details retrieved successfully",
            data: recruiter,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const uplodeProfilePicturRecruiter = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;
        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            throw new ErrorHandler("recruiter not found", StatusCodes.NOT_FOUND);
        }

        if (!req.file) {
            throw new ErrorHandler("profile picture file not provided", StatusCodes.BAD_REQUEST);
        }
        if (req.file) {
            if (recruiter && recruiter.profile_picture) {
                const { folderName, filename } = extractFolderAndFilename(recruiter.profile_picture);
                const existingImagePath = path.join(__dirname, '..', '..', '..', 'assets', folderName, filename);
                try {
                    fs.unlinkSync(existingImagePath);
                } catch (error) {
                    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
                }
            }
            recruiter.profile_picture = `profile_picture/${req.file.filename}`;
            await recruiter.save();
        }
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Profile Picture uploaded successfully",
            data: recruiter.profile_picture,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const checkProfileRequestStatus = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;

        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            throw new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND);
        }
        const responseData = {
            _id: recruiter._id,
            request_status: recruiter.request_status,
            status: recruiter.status
        };
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Request sent successfully",
            data: responseData,
            premium: activePremium
        };

        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

// home screen
const getOneCandidates = async (req, res, next) => {
    try {
        const { candidateId } = req.params;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return next(new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND));
        }
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "candidate details retrieved successfully",
            data: candidate,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllCandidates = async (req, res, next) => {
    try {
        const { name, skills, experience } = req.query;

        let baseQuery = {};
        if (name) {
            baseQuery.$or = [
                { first_name: { $regex: new RegExp(name, "i") } },
                { last_name: { $regex: new RegExp(name, "i") } }
            ];
        }
        if (skills) {
            baseQuery.skills = { $in: skills.split(",") };
        }
        if (experience) {
            baseQuery.experience = { $gte: experience };
        }

        const candidates = await Candidate.find(baseQuery, { mobile_number: 1, profile_picture: 1, first_name: 1, last_name: 1, date_of_birth: 1, "job_preference.expected_salary": 1, experience_level: 1, home_page_profile: 1, skills: 1, availability: 1, education: 1 }).sort({ updated_at: -1 });
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Candidates retrieved successfully",
            data: candidates,
            premium: activePremium
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

// Save candidet profiles
const saveCandidateProfile = async (req, res, next) => {
    try {
        const { recruiterId, candidateId } = req.body;

        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            throw new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND);
        }

        const isCandidateSaved = recruiter.saved_profiles.includes(candidateId);
        if (isCandidateSaved) {
            throw new ErrorHandler("Candidate profile already saved by this recruiter", StatusCodes.BAD_REQUEST);
        }

        recruiter.saved_profiles.push(candidateId);
        await recruiter.save();
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Candidate profile saved successfully",
            data: {
                _id: recruiter._id,
                saved_profiles: recruiter.saved_profiles
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

const getSavedProfiles = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;

        const recruiter = await Recruiter.findById(recruiterId).populate('saved_profiles');
        if (!recruiter) {
            throw new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND);
        }

        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Saved profiles retrieved successfully",
            data: recruiter.saved_profiles,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

const removeSavedProfile = async (req, res, next) => {
    try {
        const { recruiterId, candidateId } = req.body;

        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            throw new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND);
        }

        const index = recruiter.saved_profiles.indexOf(candidateId);
        if (index === -1) {
            throw new ErrorHandler("Candidate profile not found in saved profiles", StatusCodes.NOT_FOUND);
        }
        recruiter.saved_profiles.splice(index, 1);
        await recruiter.save();
        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Candidate profile removed from saved profiles successfully",
            data: {
                _id: recruiter._id,
                saved_profiles: recruiter.saved_profiles
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

// sidebar count
const countRecruiterData = async (req, res, next) => {
    try {
        const { recruiterId } = req.params;
        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            throw new ErrorHandler("Recruiter not found", StatusCodes.NOT_FOUND);
        }

        const savedProfilesCount = recruiter.saved_profiles.length;
        const interviewsCount = recruiter.interviews.length;
        const chatsCount = recruiter.chats.length;

        const { activePremium } = await checkPremiumRecruiter(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Recruiter data count retrieved successfully",
            data: {
                saved_profiles: savedProfilesCount,
                interviews: interviewsCount,
                chats: chatsCount
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    updateRecruiterData,
    getRecruiterDetails,
    uplodeProfilePicturRecruiter,
    checkProfileRequestStatus,
    getOneCandidates,
    getAllCandidates,
    saveCandidateProfile,
    getSavedProfiles,
    removeSavedProfile,
    countRecruiterData
};