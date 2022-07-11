module.exports=fn=>{
  //process.env.NODE_ENV='production'
    return (req,res,next)=>{
      fn(req,res,next).catch(next)
    }
  }