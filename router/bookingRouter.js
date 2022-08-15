const express = require('express');
const { checkout } = require('../controllers/bookingController');
const { protectRoute } = require('../controllers/authenController');

const router = express.Router();

router.use(protectRoute);
router.get('/checkout-session/:tourId', checkout);

module.exports = router;
888;
