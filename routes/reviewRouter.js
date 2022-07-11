const express=require('express');
const router=express.Router({mergeParams:true});
const reviewCtr=require('../controllers/reviewController')
const authController=require('../controllers/authController')
router.use(authController.protect)
router.route('/')
.get(reviewCtr.getAllReviews)
.post(authController.restrictTo('user'),
reviewCtr.setTourReviewId,
reviewCtr.verifyBooked,
reviewCtr.createReview)
router.route('/:id')
      .get(reviewCtr.getReview)
      .delete(authController.restrictTo('admin','user'),reviewCtr.deleteReview)
      .patch(authController.restrictTo('admin','user'),
          reviewCtr.updateReview);

module.exports=router;
      
