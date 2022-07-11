const mongoose = require('mongoose'); 
const valid=require('validator')
const bcrypt=require('bcryptjs')
const crypto=require('crypto')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please tell us your name']
 
    },
    role:{
        type:String,
        enum:['user','admin','guide','lead-guide'],
        default:'user'
    },
    email:{
        type:String,
        required:[true,'please give us your email'],
        unique:true,
        lowercase:true,
        
            validate:[valid.isEmail,'please a valid email']
    
    }
    ,photo:{
        type:String,
        default:'default.jpg'
    },password:{
        type:String,
   required:[true,'please enter a password '],
        minlength:8,
        select:false
    },passwordConfirm:{
        type:String,
       
   required:[true,'please confirm your password '],
        validate:{
            //this only works for save and create
            validator:function(pswd){
                return this.password===pswd
            },
            message:"passwords are not the same"
            
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

})
userSchema.pre("save",function (next){
    if(!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt=Date.now()-1
    next()
})
userSchema.pre("save",async function (next){
    if(!this.isModified('password')) return next()
    this.password=await bcrypt.hash(this.password,12)
    this.passwordConfirm=undefined
    next()
})
userSchema.pre(/^find/,function(next){
    //this points to the current query
    this.find({active:{$ne:false}})
    next()
})
userSchema.methods.correctPassword=async (candidatePassword,userPassword)=>{
   return await bcrypt.compare(candidatePassword,userPassword)
    

}
userSchema.methods.changedPasswordAfter= function(jwtTimeStamp){
    
        if(this.passwordChangedAt){
            console.log(this.passwordChangedAt.getTime()+'**'+jwtTimeStamp);
            if( parseInt(this.passwordChangedAt.getTime()/1000,10)> jwtTimeStamp){
                return true;
            }
        }
    return false
}
userSchema.methods.generatePasswordResetToken=function(){
const resetToken=crypto.randomBytes(20).toString('hex')
this.passwordResetToken=
crypto.createHash('sha256').update(resetToken).digest('hex')
this.passwordResetExpires=Date.now()+60*1000*10
console.log({resetToken},this.passwordResetToken);
return resetToken
}
const User=new mongoose.model("User",userSchema)
module.exports=User