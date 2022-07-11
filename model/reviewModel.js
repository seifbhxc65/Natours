const mongoose = require('mongoose'); 
const appError = require('../utils/appError');
const Tour=require('./tourModel')
const reviewSchema=mongoose.Schema({
    review:{
        type:String,
      required:[true,'you must enter a review']
    },
    rating:{
        type:Number,
      min:1,
      max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'review must have a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'review must have a user']
    }
}, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    
  });
  reviewSchema.index({user:1,tour:1},{unique:true});
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name photo'
    });
    // .populate({
    //     path:'tour',
    //     select:'name'

    // });
    next();
});
reviewSchema.statics.calcAverageRatings=async function(tourId){
    console.log('oky');
    console.log(tourId);
   const stats=await this.aggregate(
        [{$match:{tour:tourId}},
        {$group:{
            _id:"$tour",
            nRating:{$sum:1},
            ratingAvg:{$avg:'$rating'}
        }}
    ]);
    if(stats.length>0)
   {await  Tour.updateOne({_id:tourId},{
       ratingsAverage:stats[0].ratingAvg,
       ratingsQuantity:stats[0].nRating
    })}
    else{
        await  Tour.updateOne({_id:tourId},{
            ratingsAverage:4.5,
            ratingsQuantity:0,
         })

    }
}
reviewSchema.post('save',function(){
    this.constructor.calcAverageRatings(this.tour);
    //next();
})
reviewSchema.pre(/^findOneAnd/,async function(next){
   //  console.log(await this);
    this.rev=await this.findOne();

    if(!this.rev) {return next(new appError('cant find this review',404))}
 
    
    //this.constructor.calcAverageRatings(this.tour);
    next();
})
reviewSchema.post(/^findOneAnd/,async function(){
    this.rev.constructor.calcAverageRatings(this.rev.tour);
    //next();
})
const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;