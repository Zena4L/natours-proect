const express = require('express');
const {
  getOverview,
  getTour,
  loginPage,
  getUserInfo,
  updateMe,
  signup,
} = require('../controllers/viewController');

const { protectRoute, ifLoggedIn } = require('../controllers/authenController');

const router = express.Router();

router.get('/', ifLoggedIn, getOverview);

router.get('/tour/:slug', ifLoggedIn, getTour);
router.get('/login', ifLoggedIn, loginPage);
router.get('/me', protectRoute, getUserInfo);
router.get('/submit-user-data', protectRoute, updateMe);

router.get('/signup', signup);

module.exports = router;
