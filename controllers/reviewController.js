const Review=require('../model/reviewModel');
const Booking=require('../model/bookingModel')
// const appError = require('../utils/appError');
 const catchAsync = require('../utils/catchAsync');
const factory=require('./handlerFactory');
const appError = require('../utils/appError');
exports.createReview=factory.createOne(Review);
exports.getAllReviews=factory.getAll(Review);
exports.getReview=factory.getOne(Review);
exports.deleteReview=factory.deleteOne(Review);
exports.updateReview=factory.updateOne(Review);
exports.setTourReviewId=(req,res,next)=>{
    if(!req.body.user) req.body.user=req.user.id;
    if(!req.body.tour) req.body.tour=req.params.tourId;
    next();
}
exports.verifyBooked=catchAsync( async (req,res,next)=>{
    const possibleBooking=await Booking.findOne({
        tour:req.body.tour,
        user:req.body.user
    });
    // console.log(possibleBooking);
    if(!possibleBooking){return next(new appError('you need to book this tour to give it a review',401));}
    next();
   
})