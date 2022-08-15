const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name,email,pasword,passwordconfirm and photo
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User requires a name'],
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Input a valid email'],
    required: [true, 'User requires emial'],
  },
  password: {
    type: String,
    required: [true, 'User requires a password'],
    minlength: [8, 'Password should have a minlength of 8'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User requires a password'],
    minlength: [8, 'Password should have a minlength of 8'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password does not match',
    },
  },
  roles: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg ',
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordTokenExipres: {
    type: Date,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//creating instance for password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.changedPasswordAt) {
    const changedAtTimeStamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedAtTimeStamp;
  }

  //return false by default
  return false;
};
userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordTokenExipres = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
