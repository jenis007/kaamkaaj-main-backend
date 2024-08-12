const ErrorHandler = require("./errorHandler");
const { verifyToken } = require("../utils/tokenGenerator");
const Recruiter = require("../models/Recruiter/recruiterModel");

module.exports.authenticateUser = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ErrorHandler("Please logIn to access this resource", 401));
  }

  const bearer = authorizationHeader.split(' ')[1];
  const token = bearer;

  try {
    const { mobile_number, country_code, role, _id, status } = verifyToken(token);
    req.user = { mobile_number, country_code, role, _id, status };
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token, Please Log-Out and Log-In again", 401));
  }
};

module.exports.authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`You do not have permission to access this resource`, 403));
    }
    next();
  };
};

module.exports.profileApprovalAccess = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ErrorHandler("Please logIn to access this resource", 401));
  }

  const bearer = authorizationHeader.split(' ')[0];
  const token = bearer;
  const { _id, role } = verifyToken(token);

  try {
    const recruiter = await Recruiter.findById(_id);
    if (!recruiter) {
      return next(new ErrorHandler("User not found. Please check token role", 404));
    }

    if (recruiter.status !== 1 || recruiter.role !== role) {
      return next(new ErrorHandler(`Your profile approval request is pending. You must wait for approval before accessing this resource.`, 403));
    }
    
    next();
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};