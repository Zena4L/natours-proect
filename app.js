const express = require('express');
const pug = require('pug');
const path = require('path');
const tourRouter = require('./router/tourRouter');
const userRouter = require('./router/userRouter');
const reviewRouter = require('./router/reviewRouter');
const viewsRouter = require('./router/viewsRouter');
const bookingRouter = require('./router/bookingRouter');
const appError = require('./utils/appError');
const globalError = require('./controllers/errorController');
const morgan = require('morgan');
const limitRate = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const limiter = limitRate({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request to this request, try again later',
});
app.use('/api', limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  })
);

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

app.use('/', viewsRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//this is an eror to handle all unhandled route errors
app.all('*', (req, res, next) => {
  next(new appError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);
module.exports = app;
