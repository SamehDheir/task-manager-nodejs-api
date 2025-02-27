const dotenv = require("dotenv");
dotenv.config();

const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  if (isDevelopment) {
    res.status(statusCode).json({
      message,
      stack: err.stack, 
    });
  } else {
    res.status(statusCode).json({
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = errorHandler;
