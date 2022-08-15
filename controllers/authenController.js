const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/sendMail');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expire: new Date(
      Date.now() * process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    message: 'logged in successful',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // roles: req.body.roles,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;

  console.log(url);
  // http://127.0.0.1:3000/me
  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //1. get email and password from body
  const { email, password } = req.body;

  //check if email or password exist
  if (!email || !password) {
    return next(new AppError('Email or Password is not found', 400));
  }
  //check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is incorrect', 401));
  }

  createAndSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logout', {
    expire: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });
  // res.cookie('jwt', 'someloadher', {
  //   expire: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true,
  // });
  res.status(200).json({ status: 'success' });
};

exports.protectRoute = catchAsync(async (req, res, next) => {
  //1 get the token and check if it exist
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Error, Loggin in again', 401));
  }

  //2 verify token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3 check if user still exists
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) return next(new AppError('User does not exist', 401));

  //4 check if user changed password after token was issued
  // I used mongoose instance for this
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(new AppError('User recently changed password', 401));
  }

  //allow access
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.ifLoggedIn = async (req, res, next) => {
  //1 get the token and check if it exist
  if (req.cookies.jwt) {
    //verify token
    try {
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //3 check if user still exists
      const currentUser = await User.findById(decodedToken.id);
      if (!currentUser) return next();

      //4 check if user changed password after token was issued
      // I used mongoose instance for this
      if (currentUser.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }

      //allow access
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.roles)) {
      next(new AppError('You do not have permission to this action', 403));
    }

    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1 get the email
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('No user with this email', 404));
  //2 generate random token
  const resetToken = await user.createResetToken();
  await user.save({ validateBeforeSave: false });
  // create an instance method

  // c
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your Reset Token, valid for 10mins',
    //   message,
    // });
    await new Email(user, resetURL).sendResetToken();
    res.status(200).json({
      status: 'success',
      message: 'Email send',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordTokenExipres = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error occured,try again', 500));
  }
});
exports.resetPasswordToken = catchAsync(async (req, res, next) => {
  //get user based on reset token but encrypt and confirm

  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //find token
  const user = await User.findOne({ passwordResetToken: hashToken });

  if (!user)
    return next(new AppError('Invalid token or token has expired', 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordTokenExipres = undefined;
  //send token

  createAndSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2 check if the POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is incorrect', 401));
  }

  //3 update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //turn off validation

  //4 send token

  createAndSendToken(user, 200, res);
});
