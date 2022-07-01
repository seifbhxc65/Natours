const express = require('express');
const path=require('path');
const morgan = require('morgan');
const appError=require('./utils/appError')
const errCtr=require('./controllers/errorController')
const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp');
const cookieParser=require('cookie-parser');
const authCtr=require('./controllers/authController')
const app = express();
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))
//1)MIDDLEWARES
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json({
  limit:'10kb'
}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())
if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev'));
}
// app.use(helmet())
app.use(xss())
app.use(hpp({
  whitelist:[
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupeSize',
    'difficulty',
    'price'
  ]
}))
app.use(mongoSanitize())

app.use((req, res, next) => {
 //console.log(req.locals);
  return next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  return next();
});
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'too many requests coming from this ip adr'
})
app.use('/api',limiter)
//routing
const tourRouter = require('./routes/tourRouter.js');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter=require('./routes/viewRouter');
const bookingRouter=require('./routes/bookingsRouter');
//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*',(req,res,next)=>{
  const err=new appError(`can't find ${req.url} on this server`,404)
  next(err)
})
app.use(errCtr)
module.exports = app;
