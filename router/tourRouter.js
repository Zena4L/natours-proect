const express = require('express');
const {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  topTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  calcDistance,
} = require('../controllers/tourController');

const { protectRoute, restrictTo } = require('../controllers/authenController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-tours').get(topTours, getAllTour);
router.route('/get-tour-stats').get(getTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithin);

router.route('/distance/:latlng/unit/:unit').get(calcDistance);
router
  .route('/')
  .get(getAllTour)
  .post(protectRoute, restrictTo('admin'), createTour);
router.route('/get-monthly-plan/:year').get(getMonthlyPlan);
router
  .route('/:id')
  .get(getTour)
  .patch(protectRoute, restrictTo('admin'), updateTour)
  .delete(protectRoute, restrictTo('admin'), deleteTour);

module.exports = router;
