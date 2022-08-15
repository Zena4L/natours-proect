/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alert';

// // export const check
// var stripe = Stripe(
//   'pk_test_51LTWeSAKVn3kP39CS6vx1ToPU9wUHTm3uG9oZYSJmNlsMoPnCvzJULi2n5OirdfFrcvnioBjGqiLUzFiGIajMqBP00mF9ON2zo'
// );
// export const bookTour = async (tourId) => {
//   try {
//     // 1) Get checkout session from API
//     const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
//     console.log(session);

//     // 2) Create checkout form + charge credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };
