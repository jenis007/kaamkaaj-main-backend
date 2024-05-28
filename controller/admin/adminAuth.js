const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const Admin = require("../../models/admin/adminModel");
const bcrypt = require('bcrypt');
const { generateToken } = require("../../utils/tokenGenerator");

module.exports.registerAdmin = async (req, res, next) => {
    try {
        const adminData = req.body;

        const requiredFields = ['first_name', 'last_name', 'email', 'password', 'country_code', 'mobile_number',];
        for (const field of requiredFields) {
            if (!adminData[field]) {
                throw new ErrorHandler(`Missing or empty required field: ${field}`, StatusCodes.BAD_REQUEST);
            }
        }

        const existingUser = await Admin.findOne({ email: adminData.email });
        if (existingUser) {
            return next(new ErrorHandler("Email is already in use", StatusCodes.BAD_REQUEST));
        }

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const admin = await Admin.create({
            ...adminData,
            password: hashedPassword
        });

        const response = {
            code: StatusCodes.CREATED,
            success: true,
            message: "Admin registered successfully",
            data: admin
        };
        res.status(StatusCodes.CREATED).json(response);

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

module.exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password, fcm_token } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
        }

        const user = await Admin.findOne({ email });
        if (!user) {
            return next(new ErrorHandler("Invalid , Please check your email address.", StatusCodes.UNAUTHORIZED));
        }

        const passwordMatch = bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const userWithoutPassword = { ...user.toObject() };
            delete userWithoutPassword.password;

            if (fcm_token) {
                user.fcm_token = fcm_token;
                await user.save();
            }

            const token = generateToken(user);
            return res.status(StatusCodes.OK).json({
                code: StatusCodes.OK,
                success: true,
                message: `log-in successfully`,
                data: userWithoutPassword,
                token
            });
        } else {
            return next(new ErrorHandler("Incorrect Password", StatusCodes.UNAUTHORIZED));
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};