const express = require('express');
const router=express.Router();

const userController=require(`${__dirname}/../controllers/userController.js`)
const authController=require(`${__dirname}/../controllers/authController.js`)
const bookingRouter=require('./bookingsRouter.js')

router
.route('/signup')
.post(authController.signup)
router
.route('/login')
.post(authController.login)
router.get('/logout',authController.logOut)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)
router.use(authController.protect)
router.get('/me',userController.getMe,userController.getUser);
router.patch('/updatePassword',authController.updatePassword)
router.patch('/updateMe',userController.updateUserPhoto,userController.resizeUserImage,userController.updateMe)
router.delete('/deleteMe',userController.deleteMe)
router.use(authController.restrictTo('admin'))
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)
router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)
router.use('/:userId/bookings',bookingRouter)
module.exports=router