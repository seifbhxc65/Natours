const { findByIdAndUpdate } = require('../model/reviewModel');
const Tour=require('../model/tourModel');
const appError = require('../utils/appError');
const catchAsync=require('../utils/catchAsync')
const User=require('../model/userModel');
const Booking = require('../model/bookingModel');

exports.getOverview= catchAsync(async (req,res,next)=>{
    //1) get tours data from collection
    console.log('ok');
    const tours=await Tour.find();
    console.log(tours);
    //2) build template 
    //3)Render that  using tour data from step 1
    res.status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com/ https://js.stripe.com/v3/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('overview',{
      title:'All Tours',
      tours
    })
  }) 
exports.getTour=catchAsync(async (req,res,next)=>{
     //1)get the data , for the requested tou including the reviewss
     const tour=await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review'
    });
    if(!tour){return next( new appError('there is no tour with that slug',404))}
     //2)build template
     //3)render template using data from 1)
    res.status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com/ https://js.stripe.com/v3/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('tour',{
      title:`${tour.name} tour`,
      tour
    })
  }) 
  exports.getLogin=(req,res)=>{
    res.status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com  'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('login',{
      title:'Log In Form'
    })
  }
  exports.getAccount= catchAsync(async (req,res,next)=>{
    //1) get tours data from collection
    // console.log('ok');
    // const tours=await Tour.find();
    // console.log(tours);
    //2) build template 
    //3)Render that  using tour data from step 1
    res.status(200)
    .render('account',{
      title:'My account',
      //tours
    })
  });
  exports.updateUserData=async (req,res)=>{
    const updatedUser=await User.findByIdAndUpdate(req.user.id,{
      name:req.body.name,
      email:req.body.email,
    },{
      new:true,
      runValidators:true
      
    })
    
    res.status(200)
    .render('account',{
      title:'My account',
      user:updatedUseree
      //tours
    })
  }
  exports.getMyTours=catchAsync (async (req,res,next)=>{
    //1)find all bookings
    const bookings=await Booking.find({user:req.user.id})
    //2)find tours with the returned id
    const tourIds=bookings.map(el=>el.tour)
    const tours=await  Promise.all( tourIds.map(async el=>await Tour.findById(el)));
    //const tours=await Tour.find({_id:{$in:tourIds}});
    res.status(200).render('overview',{
      title:'my tours',
      tours
    })

  })