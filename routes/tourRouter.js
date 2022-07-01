

const express = require('express');


const tourController=require(`${__dirname}/../controllers/tourController.js`)
const authController=require(`${__dirname}/../controllers/authController`)
const router=express.Router()
const reviewRouter=require('./reviewRouter');
const bookingRouter=require('./bookingsRouter');
//router.param('id',tourController.checkId)
router
.route('/top-5-cheap')
.get(tourController.aliasTopTour,tourController.getAlltours);
router
.route('/tour-stats')
.get(tourController.getTourStat);
router
.route('/monthly-plan/:year')
.get(authController.protect,
  authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);
  // tours-within/233/-40,45/unit/mi
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin)
  router.route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances)
router
.route('/')
.get(tourController.getAlltours)
.post(authController.protect,tourController.createTour);
//remembre that order mattter in the middleware stack
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.updateTourPhoto,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect,
  authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour);
// router
//      .route('/:tourId/reviews')
//      .post(authController.protect,authController.restrictTo('user'),reviewController.createReview).
router.use('/:tourId/reviews',reviewRouter)
router.use('/:tourId/bookings',bookingRouter)
  module.exports=router