const appError = require('../utils/appError.js');
const Tour = require(`./../model/tourModel.js`);

const catchAsync=require('./../utils/catchAsync')
const factory=require('./handlerFactory')
const multer=require('multer');
const sharp=require('sharp')
const multerStorage=multer.memoryStorage();
const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){cb(null,true);}
  else
 { cb(new appError('Not an image ! make sure you are uploading an image',400),false)
}}
const upload=multer({
  storage:multerStorage,
  fileFilter:multerFilter
});
const updateTourPhoto=upload.fields(
  [
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]
);
const resizeTourImages=catchAsync( async (req,res,next)=>{
 // console.log(req.files);
  if(!req.files.images || !req.files.imageCover) return next();
  //1) image cover
   req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/tours/${req.body.imageCover}`);
  //2) images
  req.body.images=[];
 await Promise.all (req.files.images.map(async (img,i) => {
    console.log(img.buffer);
    
    const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
    req.body.images.push(filename);
    await sharp(img.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`);
        
  //2) images
  }));
  next();
  
})
const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'failed',
    });
  }
  next();
};
const aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAlltours=factory.getAll(Tour);
const createTour =factory.createOne(Tour);
const updateTour =factory.updateOne(Tour); 
const deleteTour =factory.deleteOne(Tour);
const getTour=factory.getOne(Tour,'reviews');
const getTourStat=catchAsync( async (req,res)=>{
     console.log(process.env.NODE_ENV);
    const stats =await Tour.aggregate([
      {
        $match: { ratingsAverage: {$gte: 4}}
      },
      {
        $group:{
          _id: {$toUpper:"$difficulty"},
          numTours:{$sum:1},
          numRatings:{$sum:'$ratingsQuantity'},
          avgRating:{ $avg: '$ratingsAverage'},
          avgPrice:{ $avg: '$price'},
          minPrice:{ $min: '$price'},
          maxPrice:{ $max: '$price'}
        }
      },
      {
        $sort:{
          numTours:1
        }
      }
      // ,
      //  {
      //    $match: {_id:{$ne:'EASY'}}
      //  }
    ])
    res.status(200).json({
      status: 'sucess',
      data: {
        stats,
      },
    });
    
 
})
const getMonthlyPlan=catchAsync( async (req,res)=>{

  const year=+req.params.year
  const plan=await Tour.aggregate([
    {$unwind:"$startDates"},
    {$match:{
      startDates:{
        $gte:new Date(`${year}-1-1`),
        $lte:new Date(`${year}-12-31`)
    }
  }
},
    {
      $group:{
        _id:{$month:"$startDates"},
        numTours:{$sum:1},
        tours:{$push:"$name"}
      }
    },
    {$addFields:{month:"$_id"}},
    {$project:{_id:0}},
    {$sort:{numTours:1}},
    {$limit:12}
    
  ])
  res.status(200).json({
    status: 'sucess',
    data: {
      plan,
    },
  });
})
const getToursWithin=catchAsync(async (req,res,next)=>
{
  const  {latlng, distance ,unit}=req.params;
  const radius=unit==='mi'?distance/3963.2:distance/6378.1;
const [lat , lng]=latlng.split(',');
if(!lat || !lng) return next(new appError('u need to provide a center',401));
console.log(lat,lng,distance,unit);
const tours=await Tour.find({
  startLocation: {$geoWithin:{
    $centerSphere:[[lng,lat],radius]

}}})});
const getDistances=catchAsync(async (req,res,next)=>
{
  const  {latlng ,unit}=req.params;
const [lat , lng]=latlng.split(',');
if(!lat || !lng) return next(new appError('u need to provide a center',401));
const mult=unit==='mi'?0.000621371:0.001;
const distances=await Tour.aggregate([{
  $geoNear:{
    near:{
      type:'point',
      coordinates:[lng*1,lat*1],
    },
    distanceField:'distance',
    distanceMultiplier:mult
  }
},
{$project:{
  name:1,
  distance:1
}}]);
res.status(200)
      .json({
          status:'sucess',
          results:distances.length,
          data:{data:distances}
      });
}) ;

module.exports = {
  getAlltours,
  getTour,
  updateTour,
  deleteTour,
  createTour,
  checkBody,
  aliasTopTour,
  getTourStat,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  resizeTourImages,updateTourPhoto
}
