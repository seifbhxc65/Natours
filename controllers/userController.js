
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const user=require('./../model/userModel')
const factory=require('./handlerFactory')
const multer=require('multer');
const sharp=require('sharp')
// const multerStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users');
//   },
//   filename:(req,file,cb)=>{
//     const ext=file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// });
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
const filterObj=(obj,...elems)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if(elems.includes(el)){
      newObj[el]=obj[el]
    }
  })
  return newObj;

}

  const updateMe=catchAsync( async(req,res,next)=>{
    console.log(req.body);
    console.log(req.file);
    //1 check if he's not tryying to update the password
    if(req.body.password ||req.body.passwordConfirm){
      return next(new appError('u cant update password in here',400))
    }
    //2 update user document
    const filtredBody={
    }
    const name=req.body.name
    const email=req.body.email
    if (name){filtredBody.name=name}
    if(email) {filtredBody.email=email}
    const filtredBodyJonas=filterObj(req.body,'name','email')
    if(req.file){ filtredBodyJonas.photo=req.file.filename;}
   
    const updatedUser=await user.findByIdAndUpdate(req.user.id,filtredBodyJonas,{
      new:true,
      runValidators:true,
      
    })
    console.log(updatedUser);
    res.status(200).json({
      status:'sucess',
      updatedUser
    })

  })
  const resizeUserImage=catchAsync (async(req,res,next)=> {
  if(!req.file) return next();
  req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/users/${req.file.filename}`);
  next();
  });
  const deleteMe=catchAsync(async (req,res,next)=>{
     await user.findByIdAndUpdate(req.user.id,{
       active:false
     })
     res.status(204).json( {
       status:'sucess',
       data:null
     })

  })
  const getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next();
  }
  const updateUserPhoto=upload.single('photo')
  const getAllUsers =factory.getAll(user)
  const createUser =factory.createOne(user)
  const getUser =factory.getOne(user)
  const updateUser =factory.updateOne(user)
  const deleteUser =factory.deleteOne(user)
  module.exports={
      getAllUsers,
      getUser,
      updateUser,
      deleteUser,
      createUser,
      updateMe,
      deleteMe,
      getMe,updateUserPhoto,
      resizeUserImage
  }