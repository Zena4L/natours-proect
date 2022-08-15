const express = require('express');
const {
  getAllUsers,
  updateMe,
  deleteMe,
  getUser,
  getMe,
  photoUpload,
  resizeUserPhoto,
} = require('../controllers/userController');
const {
  signup,
  login,
  protectRoute,
  restrictTo,
  forgetPassword,
  resetPasswordToken,
  updatePassword,
  logout,
} = require('../controllers/authenController');

router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);

router.route('/forgetPassword').post(forgetPassword);
router.route('/resetPassword/:token').patch(resetPasswordToken);

router.use(protectRoute);

router.route('/updateMyPassword').patch(updatePassword);
router.route('/getMe').get(getMe, getUser);

router.route('/').get(restrictTo('admin'), getAllUsers);
router.route('/updateMe').patch(photoUpload, resizeUserPhoto, updateMe);
router.route('/deleteMe').delete(deleteMe);
router.route('/getUser/:id').get(getUser);

module.exports = router;

//{{URL}}api/v1/user/resetPasswordToken/213c4a07283113ec21f65668ee49c96bb8d0b1a96883675dd05d79134109daec
