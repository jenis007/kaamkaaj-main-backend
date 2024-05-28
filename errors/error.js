const ErrorHandler = require("../middleware/errorHandler");

module.exports = (err, req, res, next) => {
  err.code = err.code || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID: ${err.value}`;
    err = new ErrorHandler(message, 404);
  } else if (err.code && err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for the '${key}' field. Please choose another value for '${key}'.`;
    err = new ErrorHandler(message, 400);
  } else if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Please try again.";
    err = new ErrorHandler(message, 400);
  } else if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired. Please try again.";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.code).json({
    code: err.code,
    success: false,
    message: err.message
  });
};