const User =require('./../model/userModel')
const {promisify}=require('util')
const catchAsync=require('./../utils/catchAsync')
const jwt=require('jsonwebtoken')
const AppError=require('./../utils/appError')
const email=require('./../utils/email')
const crypto=require('crypto')

const signToken=id=>
    jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
const createToken=(user,res,statusCode)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date( Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        //secure:true,
        httpOnly:true
    }
   // if(process.env.NODE_ENV='production') {cookieOptions.secure=true}
    res.cookie('jwt',token,cookieOptions)
    user.password=undefined
    res.status(statusCode)
    .json(
        {
            status:'sucess',
            token,
            data:{
                user
            }
        } 
    )
}
exports.signup=catchAsync(async (req,res,next)=>{
   
    const newuser =await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role   })
        const url=`${req.protocol}://${req.get('host')}/me`;
      await  new email(newuser,url).sendWelcome();
   // if(!newuser) return next(new Error('wtf'))
   createToken(newuser,res,201)
   
})
exports.login=catchAsync(async (req,res,next)=>{
    const  {email,password}=req.body;
    //check if email and password exists 
    if(!password || !email){
        return next(new AppError('please provide email and password !',400))
    }
    //check if user exist with correct password
    const user=await User.findOne({email}).select('+password')
    //console.log(user.password);
    
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect email or password',401));
    }
    //if correct send jwt back to the client
    createToken(user,res,200)
    
})
exports.protect=catchAsync(async (req,res,next)=>{
    //1 getting token and checking if it exists
    let token;
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token=req.headers.authorization.split(" ")[1]
    }
    else if(req.cookies.jwt){
        token=req.cookies.jwt;
    }
    if(token){
        console.log('u are logged in ');
    }
    else{
        return next(new AppError('u are logged out , please log in to get acess',401))
    }
    //2 verification token
   const decoded= await promisify (jwt.verify)(token,process.env.JWT_SECRET)
   
    //3 check if user still exist
    console.log(decoded);
    const checkuser=await User.findById(decoded.id);
    if(!checkuser){
        return next(new AppError('user no longer exists ',401))
    }
    //4 check if user changed password after the token was issued
    const checkChanged=checkuser.changedPasswordAfter(decoded.iat);
    if(checkChanged){
        return next(new AppError('user has changed his password after this token was issued ',401))
    }
    //giive     acess to protected route
    req.user=checkuser
    res.locals.user=checkuser
    next();
});
exports.isLoggedIn=catchAsync(async (req,res,next)=>{
    //1 getting token and checking if it exists
    let token;
 let checkuser,decoded;
 if(req.cookies.jwt){
        token=req.cookies.jwt;
        //2 verification token
        try
      {  decoded= await promisify (jwt.verify)(token,process.env.JWT_SECRET)}
      catch(e){return next();}
   
       //3 check if user still exist
       checkuser=await User.findById(decoded.id);
   if(!checkuser){
       return next()
   }
   //4 check if user changed password after the token was issued
   const checkChanged=checkuser.changedPasswordAfter(decoded.iat);
   if(checkChanged){
       return next()

   }
    //giive     acess to protected route
    res.locals.user=checkuser
    //console.log(res.locals);
    return next();
    }
  
   
    
   next()
})  
exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        console.log(req.user);
        if(!roles.includes(req.user.role)){
            return next (new AppError('u dont  have permission to acess this route',403))
        }
        next();
    }
}
exports.forgotPassword=catchAsync(async (req,res,next)=>{
//1 check if the email existbo

const user =await User.findOne({email:req.body.email})

if(!user){
return next(new AppError('no user with the provided email',404))
}
//2 generate a random token
const token=user.generatePasswordResetToken();
await user.save({validateBeforeSave:false})
//3 send the token to the email

try
{   
    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${token}`;
    await new email(user,resetUrl).sendPasswordReset();
}
catch(e){
    user.passwordResetToken=null
    user.passwordResetExpires=null
    await user.save({validateBeforeSave:false})
    return next(new AppError('there was an error sending the email.',500))
}
res.status(200).json({
    status:'sucess',
    message
})
}) 
exports.resetPassword=catchAsync( async (req,res,next)=>{
//1)get user based on the token
const token =req.params.token

const user=await User.findOne({
    passwordResetToken:crypto.createHash('sha256').update(token).digest('hex'),
    passwordResetExpires:{$gt:Date.now()}
})
console.log(user);

//2)if token has not expired, and there is user, set the new password
// const exp=user.passwordResetExpires
// if(Date.now()>exp){
//     return next(new AppError('time has expired',401));
// }
if(!user ){
    return next(new AppError('invalid token or token has expired',400))
}
//3)update changedpasswordAt property for the user 
user.password=req.body.password
user.passwordConfirm=req.body.passwordConfirm
user.passwordResetToken=undefined
user.passwordResetExpires=undefined
await user.save()

//4) log the user in, send jwt
//const token=signToken(user._id);
createToken(user,res,200)
    
  
//res.redirect('/api/v1/users/login')
})
exports.updatePassword=catchAsync( async (req,res,next)=>{
    //1 find the user in the collection
    console.log(req.user);
    const user =await User.findById(req.user.id).select('+password')
   
    const curr=req.body
    //2 check if the provided password is a match
    console.log(curr);
    if(!curr || ! await user.correctPassword(req.body.currentPass,user.password)){
        
        return next(new AppError('wrong provided password',401))
    }
    console.log('*********');
    //3 if so update,it with the new provided pass
    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    await user.save()
    //user.findByIdAndUpdate wont work as intented
    //4 log the user in by sending the jwt 
    createToken(user,res,200)
    
})
exports.logOut=(req,res)=>{
    res.cookie ('jwt','loggedout',{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        status:'sucess'
    })
}