const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //get tours from db
  const tours = await Tour.find();
  //consume api

  //render tour
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //get the tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'name rating user ',
  });

  if (!tour) {
    return next(new AppError('There is no tour with this name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.loginPage = (req, res, next) => {
  res.status(200).render('login', {
    title: `Login into your account`,
  });
};
exports.getUserInfo = (req, res, next) => {
  res.status(200).render('account', {
    title: `Your account`,
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const uodatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: `Your account`,
    user: uodatedUser,
  });
});

exports.signup = (req, res, next) => {
  res.status(200).render('signup', {
    title: `Your account`,
  });
};
