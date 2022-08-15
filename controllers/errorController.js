const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `cannot find ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};
const handleDuplicateField = (err) => {
  const message = `This field cannot have duplicate Field`;
  return new AppError(message, 400);
};

const handleValidation = (err) => {
  const message = `Verification failed, try again`;
  return new AppError(message, 400);
};
const jsonWebError = (err) => {
  const message = `Invalid User, loggin again`;
  return new AppError(message, 400);
};
const tokenError = (err) => {
  const message = `Expired token, please login again`;
  return new AppError(message, 400);
};

const sendDevErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: '404,not found',
      msg: err.message,
    });
  }
};

const sendProdErr = (err, req, res) => {
  //send  err if it is operational

  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR');
      res.status(500).json({
        status: 'error',
        message: 'ops something went wrong',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    } else {
      console.error('ERROR');
      res.status(500).render('error', {
        title: 'something went wrong',
        msg: 'Try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevErr(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //handling invalid database id
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (error.code === 11000) error = handleDuplicateField(err);
    if (err.name === 'ValidationError') error = handleValidation(err);
    if (error.name === 'JsonWebTokenError') error = jsonWebError(err);
    if (error.name === 'TokenExpiredError') error = tokenError(err);
    sendProdErr(error, req, res);
  }
};
