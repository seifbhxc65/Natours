const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// ((process.env.STRIPE_SECRET_KEY))
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
//const Booking = require('../model/b');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking=require('../model/bookingModel');
const appError = require('../utils/appError');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout =catchAsync( async (req,res,next) => {
  ///this is only temporary
  const { tour, user, price } =req.query;
  if(!tour&&!user&&!price) return next();
  //verif that the tour still has places in the selected date
  // const tourTest=await Tour.findById(tour);
  // if(tourTest.startDatesTest[ind].soldOut) return next(new appError("w've run out of places at that date",400));
  await Booking.create({tour,user,price});
  res.redirect(req.originalUrl.split('?')[0]+'my-tours')
  next();
});
exports.createBooking=factory.createOne(Booking);
exports.getAllBookings=factory.getAll(Booking);
exports.getBooking=factory.getOne(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);
exports.addParticipants=catchAsync (async (req,res,next)=>{
const tour=await Tour.findById(req.body.tour);
const ind=req.body.startDatesTest;
  if(tour.startDatesTest[ind].soldOut) return next(new appError("w've run out of places at that date",400));
tour.startDatesTest[ind].participant+=1;

if(tour.startDatesTest[ind].participant>tour.maxGroupSize){
  tour.startDatesTest[ind].soldOut=true;
}
await tour.save();
next();
})
// exports.webhookCheckout = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed')
//     createBookingCheckout(event.data.object);

//   res.status(200).json({ received: true });
// };

// exports.createBooking = factory.createOne(Booking);
// exports.getBooking = factory.getOne(Booking);
// exports.getAllBookings = factory.getAll(Booking);
// exports.updateBooking = factory.updateOne(Booking);
// exports.deleteBooking = factory.deleteOne(Booking);
