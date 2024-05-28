const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const OtpModel = require("../../models/otpModel");
const { generateToken } = require("../../utils/tokenGenerator");
const Candidate = require("../../models/Candidate/candidateModel");
const Recruiter = require("../../models/recruiter/recruiterModel");

const staticOTP = 1234;

module.exports.sentOtp = async (req, res, next) => {
    try {
        const { country_code, mobile_number, type } = req.body;
        if (!country_code || !mobile_number || (type !== 'candidate' && type !== 'recruiter')) {
            return next(new ErrorHandler("All fields are required for sent OTP", StatusCodes.BAD_REQUEST));
        }

        let otpDataList = await OtpModel.find({ role: type });
        let filteredOtpDataList = otpDataList.filter(otpData => otpData.mobile_number === mobile_number && otpData.country_code === country_code);

        let otpData;

        if (filteredOtpDataList.length > 0) {
            otpData = filteredOtpDataList[0];
            otpData.otp = staticOTP;
            await otpData.save();
        } else {
            otpData = await OtpModel.create({ mobile_number: mobile_number, country_code: country_code, role: type, otp: staticOTP });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            code: StatusCodes.OK,
            message: `OTP sent successfully`,
            data: {
                _id: otpData._id,
                country_code: otpData.country_code,
                mobile_number: otpData.mobile_number,
                type: otpData.role
            }
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { country_code, mobile_number, otp, type } = req.body;
        if (!country_code || !mobile_number || !otp || !type || (type !== 'candidate' && type !== 'recruiter')) {
            return next(new ErrorHandler("Please provide valid country code, mobile number, OTP, and type (either 'candidate' or 'recruiter')", StatusCodes.BAD_REQUEST));
        }

        const filter = { mobile_number: mobile_number, country_code: country_code, role: type };
        let user;

        if (type === 'candidate') {
            user = await Candidate.findOne(filter);
        } else if (type === 'recruiter') {
            user = await Recruiter.findOne(filter);
        }

        const otpData = await OtpModel.findOne(filter);
        if (!otpData || otpData.otp !== otp || otpData.role !== type) {
            return next(new ErrorHandler("Invalid OTP", StatusCodes.UNAUTHORIZED));
        }
        if (!user) {
            if (type === 'candidate') {
                user = await Candidate.create({ mobile_number, country_code });
            } else if (type === 'recruiter') {
                user = await Recruiter.create({ mobile_number, country_code });
            }
        }

        const token = generateToken(user);
        return res.status(StatusCodes.OK).json({
            code: StatusCodes.OK,
            success: true,
            message: `Login successful`,
            data: user,
            token,
            type: type
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}; 