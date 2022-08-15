const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  checkId,
} = require('../controllers/reviewController');
const { protectRoute, restrictTo } = require('../controllers/authenController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protectRoute, restrictTo('user'), checkId, createReview);

router.route('/:id').delete(protectRoute, restrictTo('user'), deleteReview);
router.route('/:id').patch(protectRoute, restrictTo('user'), updateReview);
module.exports = router;
