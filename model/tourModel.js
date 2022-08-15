const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name'],
      unique: true,
      maxlength: [40, 'Ratings be a maxlength of 40'],
      minlength: [3, 'Ratings be a minlength of 3'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour require duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour require maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour require difficulty'],
      enum: ['easy', 'medium', 'difficult'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings be a above of 0'],
      max: [5, 'Ratings be a below of 6'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour require price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount is greater than ({val})',
      },
    },
    summary: {
      type: String,
      required: [true, 'Tour require sunnary'],
      trim: true,
    },
    description: {
      type: String,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour require imageCover'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        description: String,
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],
    guides: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
