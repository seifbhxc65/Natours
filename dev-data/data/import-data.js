const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs=require('fs')
dotenv.config({
  path: './../../config.env',
});



const port = process.env.PORT || 3000;
mongoose
  .connect(
    process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log('connected successfully');})
    
  
    const Tour=require('./../../model/tourModel')
    const Review=require('./../../model/reviewModel')
    const User=require('./../../model/userModel')
    const tours=JSON.parse(fs.readFileSync('./tours.json','utf-8')) 
    const users=JSON.parse(fs.readFileSync('./users.json','utf-8')) 
    const reviews=JSON.parse(fs.readFileSync('./reviews.json','utf-8')) 
const importData=async function(){
  try{ 
  await Tour.create(tours);
  await User.create(users,{
    validateBeforeSave:false,
  });
  await Review.create(reviews);
  console.log('Data sucessfully loaded');
 }
  catch(err){
      console.log(err);
  }
  process.exit()
}
const deleteData=async  function() {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('Data deleted sucessfully ');
    

  }
  catch(err){
    console.log(err);
  }
  process.exit()
}
//importData() 
if(process.argv[2]==="--import"){
  importData()
}
else if(process.argv[2]==="--delete"){
  deleteData()
}
console.log(process.argv);