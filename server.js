const dotenv = require('dotenv');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
dotenv.config({
  path: './config.env',
});

const app = require('./app.js');
process.on('uncaughtException',err=>{
  //console.log(err.name+' '+err.message)
  console.log('UNCAUGHT EXCEPTION ! shutting down');
  server.close(()=>{
    process.exit(1)
  })
  
})

const server=app.listen(port, () => {  
  
  console.log(`app running on port ${process.env.PORT}`);
});

process.on('unhandledRejection',err=>{
  console.log(err.name+' '+err.message)
  console.log('unhandled rejection shutting');
 
    process.exit(1)
 
  
})


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
    
    
  
    const Tour=require('./model/tourModel.js')
    // const testTour=new Tour({
    //   name:'Subway world',
    //   /*rating:4.7,*/
    //   price:997
    // })
    // testTour
    // .save()
    // .then((doc)=>console.log(doc))
    // .catch(err=>console.log(`Error !!! ${err} `))



