const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Candidate = require("../../models/Candidate/candidateModel");

const getAllCandidateAdmin = async (req, res, next) => {
    try {
        const { first_name, last_name, status } = req.query;
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

        const candidate = await Candidate.find(baseQuery).sort({ updated_at: -1 });
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "candidate retrieved successfully",
            data: candidate,
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAllCandidateAdmin,
};
