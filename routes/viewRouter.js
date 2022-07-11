const express=require('express');
const router=express.Router();
const authCtr=require('../controllers/authController')
const viewCtr=require('../controllers/viewController')
const bookingController=require('../controllers/bookingController')
  router.get('/',bookingController.createBookingCheckout,authCtr.isLoggedIn,viewCtr.getOverview)
  router.get('/tour/:slug',authCtr.isLoggedIn,viewCtr.getTour)
  router.get('/login',authCtr.isLoggedIn,viewCtr.getLogin)
  router.get('/logout',authCtr.logOut)
  router.get('/me',authCtr.protect,viewCtr.getAccount)
  router.get('/my-tours',authCtr.protect,viewCtr.getMyTours)
  router.post('/submit-user-data',authCtr.protect,viewCtr.updateUserData)
module.exports=router;