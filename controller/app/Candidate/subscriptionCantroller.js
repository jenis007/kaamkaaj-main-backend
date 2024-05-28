const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../../middleware/errorHandler");
const Candidate = require("../../../models/Candidate/candidateModel");
const PremiumPlan = require("../../../models/admin/plansModel");
const { checkPremiumCandidate } = require("../../../utils/helper");

const getAllPremiumPlansForCandidate = async (req, res, next) => {
    try {
        const premiumPlans = await PremiumPlan.find({ status: 1, user_type: "candidate" });
        const { activePremium } = await checkPremiumCandidate(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Premium plans retrieved successfully",
            data: premiumPlans,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const buyPlanCandidate = async (req, res, next) => {
    try {
        const { candidate_id, plan_id, payment_detail } = req.body;

        const candidate = await Candidate.findById(candidate_id);
        if (!candidate) {
            return next(new ErrorHandler("Candidate not found", StatusCodes.NOT_FOUND));
        }

        const activePlan = candidate.membership.find(plan => !plan.expired && plan.expiry_date > new Date());
        if (activePlan) {
            return next(new ErrorHandler("Candidate already has an active premium plan", StatusCodes.BAD_REQUEST));
        }

        const plan = await PremiumPlan.findById(plan_id);
        if (!plan) {
            return next(new ErrorHandler('Premium plan not found', StatusCodes.NOT_FOUND));
        }
        const expiryDate = new Date(Date.now() + plan.duration_day * 24 * 60 * 60 * 1000);

        // Increment total_payment by the amount of the payment made by the candidate
        plan.total_payment += payment_detail.amount;

        candidate.membership.push({
            plan: plan_id,
            expired: 0,
            purchase_date: new Date(),
            expiry_date: expiryDate,
            payment_detail: payment_detail
        });

        candidate.payment_history.push({
            payment: {
                plan: plan_id,
                type: "premium"
            },
            detail: {
                type: payment_detail.type,
                amount: payment_detail.amount,
                currency: payment_detail.currency,
                payment_status: payment_detail.payment_status,
                gateway_response: payment_detail.gateway_response
            }
        });

        await Promise.all([candidate.save(), plan.save()]);
        const { activePremium } = await checkPremiumCandidate(req.user._id)

        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Plan bought successfully",
            data: candidate.membership,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const getCandidatePremiumPlans = async (req, res, next) => {
    try {
        const { candidate_id } = req.params;

        const candidate = await Candidate.findById(candidate_id).populate('membership.plan');
        if (!candidate) {
            return next(new ErrorHandler("Candidate not found", StatusCodes.NOT_FOUND));
        }

        const sortedMembership = candidate.membership.sort((a, b) => b.purchase_date - a.purchase_date);
        const { activePremium } = await checkPremiumCandidate(req.user._id)
        const response = {
            code: StatusCodes.OK,
            success: true,
            message: "Candidate's premium plans retrieved successfully",
            data: sortedMembership,
            premium: activePremium
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    buyPlanCandidate,
    getAllPremiumPlansForCandidate,
    getCandidatePremiumPlans
};
