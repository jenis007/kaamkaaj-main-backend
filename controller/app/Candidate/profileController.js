const { StatusCodes } = require("http-status-codes");
const path = require('path');
const fs = require('fs');
const ErrorHandler = require("../../../middleware/errorHandler");
const Candidate = require("../../../models/Candidate/candidateModel");
const { extractFolderAndFilename, checkPremiumCandidate } = require("../../../utils/helper");
const Filter = require("../../../models/admin/filterModel");

const updateCandidateData = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const update = req.body;

        const candidate = await Candidate.findByIdAndUpdate(candidateId, update, { new: true });
        if (!candidate) {
            throw new ErrorHandler("Candidate not found", StatusCodes.NOT_FOUND);
        }
        const { activePremium } = await checkPremiumCandidate(candidateId)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "updated successfully",
            data: {
                _id: candidate._id
            },
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const uplodeProfilePictur = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            throw new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND);
        }

        if (!req.file) {
            throw new ErrorHandler("Profile picture file not provided", StatusCodes.BAD_REQUEST);
        }
        if (req.file) {
            if (candidate && candidate.profile_picture) {
                const { folderName, filename } = extractFolderAndFilename(candidate.profile_picture);
                const existingImagePath = path.join(__dirname, '..', '..', '..', 'assets', folderName, filename);
                try {
                    fs.unlinkSync(existingImagePath);
                } catch (error) {
                    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
                }
            }
            candidate.profile_picture = `profile_picture/${req.file.filename}`;
            await candidate.save();
        }
        const { activePremium } = await checkPremiumCandidate(candidateId)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Profile Picture uploaded successfully",
            data: candidate.profile_picture,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const uplodeVideoCV = async (req, res, next) => {
    try {
        const { candidateId } = req.params;
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            throw new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND);
        }

        if (!req.file) {
            throw new ErrorHandler("Video CV file not provided", StatusCodes.BAD_REQUEST);
        }
        if (req.file) {
            if (candidate && candidate.video_cv) {
                const { folderName, filename } = extractFolderAndFilename(candidate.video_cv);
                const existingImagePath = path.join(__dirname, '..', '..', '..', 'assets', folderName, filename);
                try {
                    fs.unlinkSync(existingImagePath);
                } catch (error) {
                    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
                }
            }
            candidate.video_cv = `video_cv/${req.file.filename}`;
            await candidate.save();
        }
        const { activePremium } = await checkPremiumCandidate(candidateId)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Video CV uploaded successfully",
            data: candidate.video_cv,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getCandidateDetails = async (req, res, next) => {
    try {
        const { candidateId } = req.params;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return next(new ErrorHandler("candidate not found", StatusCodes.NOT_FOUND));
        }

        const { activePremium } = await checkPremiumCandidate(candidateId)
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
};

// filter
const getAllFiltersCandidat = async (req, res, next) => {
    try {
        const { name } = req.query;
        const filter = {};
        if (name) {
            filter.name = { $regex: new RegExp(name, "i") };
        }
        const filters = await Filter.find(filter);
        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Filters retrieved successfully",
            data: filters
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getFilterByIdCandidate = async (req, res, next) => {
    try {
        const filterId = req.params.id;
        const filter = await Filter.findById(filterId);
        if (!filter) {
            return next(new ErrorHandler("Filter not found", StatusCodes.NOT_FOUND));
        }
        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Filter retrieved successfully",
            data: filter
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    updateCandidateData,
    uplodeProfilePictur,
    uplodeVideoCV,
    getCandidateDetails,
    getFilterByIdCandidate,
    getAllFiltersCandidat
};