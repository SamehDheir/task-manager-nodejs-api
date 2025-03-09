const dotenv = require("dotenv");
dotenv.config();

const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Handle specific error cases
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed. Please check your input.";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Authentication failed.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 403;
    message = "Session expired. Please log in again.";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate key error. A record with this value already exists.";
  }

  // Log error in production for debugging
  if (!isDevelopment) {
    console.error(err);
  }

  // Send error response
  res.status(statusCode).json({
    message: isDevelopment
      ? message
      : "Something went wrong. Please try again later.",
    ...(isDevelopment && { stack: err.stack }), 
  });
};

module.exports = errorHandler;
