const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const factory = require('./handlerController');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// const upload = multer({ dest: 'public/img/users' });

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

//storage
// const multerStorage = multer.diskStorage({
//   //destination
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   //filename
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
//filter
const multerFilter = (req, file, cb) => {
  //check if it is image upload
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images allowed', 401), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.photoUpload = upload.single('photo');

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file.imageCover || !req.file.images) return next();
  await sharp(req.files.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // check if body containes password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('You cannot update password, use /updateMyPassword'),
      401
    );
  }

  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    message: 'deleted',
  });
});
