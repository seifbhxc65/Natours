const appError=require('./../utils/appError')
const handleCastErrorDB=err=>{

  const message=`${err.path} : ${err.value}`
  return new appError(message,400)
}
const handleDupErrorDB=err=>{
  console.log(err.errmsg);
  const message=`duplicate value error : ${err.errmsg.match(/(["'])(\\?.)*?\1/)[0]}`
  return new appError(message,400)
}
const handleValidationError=err=>{
  const message=`Invalid input data ${Object.values(err.errors).map(el=>el.name).join('. ')}`
  return new appError(message,400)
}
const handlejwtWebTokenError=err=>{
  return new appError('Invalid token error',401)
}
const handleTokenExpiredError=err=>{
  return new appError('expired token',401)
}
const sendErrorDev=(err,req,res)=>{
  console.log(req.originalUrl);
  if(req.originalUrl.startsWith('/api'))
 { res.status(err.statusCode).json({
    name:err.name,
    status:err.status,
    message:err.message,
    stack:err.stack,
    error:err
  })}
  else{res.status(err.statusCode).render('error',
    {
      title:'something went wrong !!',
      msg:err.message
  }
  )}
}
const sendErrorProd=(err,req,res)=>{
  if(req.originalUrl.startsWith('/api'))
  {
    if(err.isOperational){ return res.status(err.statusCode).json({
    status:err.status,
    message:err.message,
   
  })}
  
    
    return res.status(500).json({
      status:'error',
      message:'something went wrong !'
    })
  
 }
 // rendred website
  if(err.isOperational){  
   // console.log(err);
    return res.status(err.statusCode).render('error',{
   title:'Something went wrong',
    msg:err.message,
   
  })}
  
    
    return res.status(500).render('error',{
      title:'Something went wrong',
       msg:'please try again later',
      
     })
  

 
}
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500
    err.status=err.status||"error"
    process.env.NODE_ENV='development'
    if(process.env.NODE_ENV=='development'){
     sendErrorDev(err,req,res)
    }
    else{
      
        let error={...err}
        error.message=err.message;
      // console.error(error)
       if(err.name==='CastError'){
        
         error= handleCastErrorDB(err)
      }
      if(err.name==='ValidationError'){
        
        error= handleValidationError(err)
     }
     if(err.name==='JsonWebTokenError'){
      
       error=handlejwtWebTokenError(err)
     }
     if(err.name==='TokenExpiredError'){
       error=handleTokenExpiredError(err)
     }
      if(err.code===11000) {error= handleDupErrorDB(err)}
        sendErrorProd(error,req,res)
        
    }
    
    next()
  } 