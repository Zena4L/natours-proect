const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerController');

exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        numTour: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tours: stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
exports.getTourWithin = catchAsync(async (req, res, next) => {
  //destruct params
  const { distance, latlng, unit } = req.params;
  //destruct lat and lng
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(new AppError('Specify lat and lng', 400));
  }
  //geting the radius of the earth
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6398.1;
  //query here
  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  //sending responds
  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});

exports.calcDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  //destruct lat and lng
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(new AppError('Specify lat and lng', 400));
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        type: 'Point',
        coordinates: [lng * 1, lat * 1],
      },
    },
    {
      distanceField: 'distance',
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tour: distance,
    },
  });
});
