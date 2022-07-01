const express=require('express');
const router=express.Router({mergeParams:true});
const bookingCtr=require('../controllers/bookingController')
const authController=require('../controllers/authController')
router.use(authController.protect)
router.get('/checkout-session/:tourId',bookingCtr.getCheckoutSession)
router.use(authController.restrictTo('admin','lead-guide'));
router.route('/')
.get(bookingCtr.getAllBookings)
.post(bookingCtr.addParticipants,bookingCtr.createBooking,)
router.route('/:id')
router.get(bookingCtr.getBooking)
      .patch(bookingCtr.updateBooking)
      .delete(bookingCtr.deleteBooking)

module.exports=router;
      
 