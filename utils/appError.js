module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //all errors from this class will be optional errors
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
};
