const { StatusCodes } = require("http-status-codes");
const Filter = require("../../models/admin/filterModel");
const ErrorHandler = require("../../middleware/errorHandler");

const createFilters = async (req, res, next) => {
    try {
        const filterData = req.body;

        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!filterData[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
        }

        const filter = await Filter.create(filterData);
        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Filter created successfully",
            data: {
                _id: filter._id,
                status: filter.status,
                name: filter.name
            },
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllFilters = async (req, res, next) => {
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

const getFilterById = async (req, res, next) => {
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

const updateFilter = async (req, res, next) => {
    try {
        const filterId = req.params.id;
        const filterData = req.body;

        const filter = await Filter.findByIdAndUpdate(filterId, filterData, { new: true });
        if (!filter) {
            return next(new ErrorHandler("Filter not found", StatusCodes.NOT_FOUND));
        }
        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Filter updated successfully",
            data: {
                _id: filter._id,
                status: filter.status,
                name: filter.name
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteFilter = async (req, res, next) => {
    try {
        const filterId = req.params.id;
        const filter = await Filter.findByIdAndDelete(filterId);
        if (!filter) {
            return next(new ErrorHandler("Filter not found", StatusCodes.NOT_FOUND));
        }
        res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: "Filter deleted successfully",
            data: {
                _id: filter._id,
                status: filter.status,
                name: filter.name
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    createFilters,
    getAllFilters,
    getFilterById,
    updateFilter,
    deleteFilter
};