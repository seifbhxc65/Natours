const catchAsync=require('../utils/catchAsync')
const appError=require('../utils/appError')
const Apifeatures = require(`${__dirname}/../utils/Apifeatures.js`);
exports.deleteOne=Model=>catchAsync( async (req, res,next) => {
     const doc =await Model.findByIdAndDelete(req.params.id);
     if(!doc){return next(new appError(`no document found with that id`,404)) }
     res.status(204).json({
       status: 'sucess',
       data: {
         data:null,
       },
     });
   } );
   exports.updateOne=Model=>catchAsync( async (req, res,next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!doc){return next(new appError(`no document found with that id`,404)) }
    res.status(201).json({
      status: 'sucess',
      data: {
        doc,
      },
    });
 
});
exports.createOne=Model=>catchAsync( async (req, res,next) => {
  
    const newDoc = await Model.create(req.body);
    console.log('------------------------------------------');
    res.status(201).json({
      status: 'sucess',
      data: {
        data: newDoc,
      },
    });
    next()
});
exports.getOne=(Model,popOptions)=>catchAsync( async (req, res,next) => {
   let query=Model.findById(req.params.id);
   if(popOptions) query.populate(popOptions)
    const doc = await query;
    if(!doc){return next(new appError(`no document found with that id`,404)) }
    
    res.status(201).json({
      status: 'sucess',
      data: {
        data:doc,
      },
    });
  
});
exports.getAll=Model=>catchAsync( async (req, res,next) => {
    let filter={};
    console.log(req.params);
    if(req.params.tourId || req.params.userId ) filter={
      tour:req.params.tourId,
    }
    if(req.params.userId ) filter={
      user:req.params.userId
    }
    console.log("filter");
    console.log(filter)
    //console.log(req.requestTime);
  
    
      //BUILD query
      
      const ApiF =new Apifeatures(Model.find(filter ), req.query) 
        .filtering()
        .sorting()
         .limiting()
         .pagination();
        console.log('test2');
        console.log(ApiF);
      const allDoc = await ApiF.query;
  
  
      res.status(200).json({
        status: 'sucess',
        results: allDoc.length,
        data: {
          data: allDoc,
        },
      });
    
  })