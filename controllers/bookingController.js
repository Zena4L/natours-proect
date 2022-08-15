const stripe = require('stripe')(
  'sk_test_51LTWeSAKVn3kP39Co3lbKaDCXJINThsl9hNfwIIhxOcRj1uBY4LEv1cLTgOvg9Gr44Ln3Jb7F2xFML1e4RCNCf0C00dsRHUHro'
);
const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.checkout = catchAsync(async (req, res, next) => {
  //1. find tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);
  //2 create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`natours.dev/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    // line_items: [{ price: `${tour.id}`, quantity: 2 }],
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
