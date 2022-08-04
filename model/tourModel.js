const mongoose = require('mongoose');
const slug = require('slugify');
const valid = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name must never exceed 40 caractere '],
      minlength: [10, 'a tour name must never be less   10 caractere '],
      //validate:[valid.isAlpha,'tour name must only contain alphas']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty  '],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy , medium , difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document creation
          //this fct wont work on update
          return val < this.price;
        },
        message: 'discount price ({VALUE}) must be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover img'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startDatesTest:[ {
      date:Date,
      participant:{type:Number,default:0},
      soldOut:{
        type:Boolean,
        default:false
      }
    }],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      description: String,
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//indexes
// tourSchema.index({price:1});
tourSchema.index({ price: -1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({startLocation:'2dsphere'}); 
//this is used to keep the business logic away from the controller
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});
//documetn midds runs before and after .save() .create
tourSchema.pre('save', function (next) {
  this.slug = slug(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// tourSchema.pre('save',async function(next){
//   this.guides=await Promise.all(this.guides.map( id=>User.findById(id)))
//   next()
// })
// tourSchema.pre('save',function(next){
//   console.log('waitttting........');
//  next()
// })
// tourSchema.post ('save',function(doc,next){
//   console.log(doc);
//   next()
// })
//query midds
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (next) {
  console.log(`it took ${Date.now() - this.start} millisecondes`);
});
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: { $ne: true },
//     },
//   });
//   next();
// });
const Tour = new mongoose.model('Tour', tourSchema);
module.exports = Tour;
