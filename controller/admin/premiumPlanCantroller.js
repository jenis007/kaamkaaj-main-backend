const { StatusCodes } = require("http-status-codes");
const PremiumPlan = require("../../models/admin/plansModel");
const ErrorHandler = require("../../middleware/errorHandler");
const Candidate = require("../../models/Candidate/candidateModel");
const Recruiter = require("../../models/recruiter/recruiterModel");

const createPremiumPlan = async (req, res, next) => {
    try {
        const premiumPlanData = req.body;

        const requiredFields = ['premium_name', 'user_type', 'premium_price', 'duration_day', 'description', 'show_user', 'discount_price'];
        for (const field of requiredFields) {
            if (!premiumPlanData[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
        }

        const premiumPlan = await PremiumPlan.create(premiumPlanData);

        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "premium plan created successfully",
            data: {
                _id: premiumPlan._id,
                status: premiumPlan.status
            },
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

const getAllPremiumPlan = async (req, res, next) => {
    try {
        const { user_type, show_user, status, popular } = req.query;
        const query = {};

        if (user_type) {
            query.user_type = user_type;
        }
        if (show_user) {
            query.show_user = show_user;
        }
        if (status) {
            query.status = status;
        }
        if (popular) {
            query.popular = popular;
        }

        const plans = await PremiumPlan.find(query).sort({ updated_at: -1 });

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Plans retrieved successfully",
            data: plans,
        };
        res.status(StatusCodes.OK).json(response);

    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
}


const getAllPremiumPlanBuyers = async (req, res, next) => {
    try {
        const { plan_id } = req.params;
        const plan = await PremiumPlan.findById(plan_id);
        if (!plan) {
            throw new ErrorHandler("Premium plan not found", StatusCodes.NOT_FOUND);
        }

        let buyers = [];
        let userType = '';

        if (plan.user_type === 'candidate') {
            buyers = await Candidate.find({
                "membership.plan": plan_id
            })
            userType = 'candidate';
        } else if (plan.user_type === 'recruiter') {
            buyers = await Recruiter.find({
                "membership.plan": plan_id
            })
            userType = 'recruiter';
        }

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "buyrs data retrieved successfully",
            data: {
                plan: plan,
                user_type: userType,
                total_buyers: buyers.length,
                buyers_detail: buyers.map(buyer => ({
                    first_name: buyer.first_name,
                    last_name: buyer.last_name,
                    gender: buyer.gender,
                    email: buyer.email,
                    country_code: buyer.country_code,
                    mobile_number: buyer.mobile_number,
                    role: buyer.role,
                    plan_detail: buyer.membership.filter(membership => membership.plan._id.toString() === plan_id.toString())
                }))
            }
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    createPremiumPlan,
    getAllPremiumPlan,
    getAllPremiumPlanBuyers
};