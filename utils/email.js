const nodemailer=require('nodemailer');
const { options } = require('request');
const htmlToText=require('html-to-text');
const pug=require('pug')
module.exports=class Email{
  constructor(user,url){
    this.to=user.email;
    this.firstName=user.name.split(' ')[0];
    this.url=url;
    this.from=`Seif Belhaj <${process.env.EMAIL_FROM}>`;

  }
  newTransport(){
   //process.env.NODE_ENV='production'
    if(process.env.NODE_ENV==='production'){
      return nodemailer.createTransport({
        service:'SendGrid',
        auth:{
          user:process.env.SENDGRID_USERNAME,
          pass:process.env.SENDGRID_PASSWORD
        }
      });
    }
    
    return nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
  }
 async send(template,subject){
    //1) render html based on a pug template
  const html=  pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
    firstName:this.firstName,
    url:this.url,
    subject
  });
    //2)Define email options
    const mailOptions={
      from:this.from,
      to:this.to,
      subject,
      html,
      text:htmlToText.fromString(html),
      //html:
  }
  await this.newTransport().sendMail(mailOptions)
  }
  async sendWelcome(){
   await   this.send('welcome','Welcome to the Natours Family')
  }
  async sendPasswordReset(){
    await   this.send('passwordReset','Password reset')
   }
}
const sendEmail=async options=>{ 
    //1 create a trasnporter
    // const transporteur=nodemailer.createTransport({
    //     service:'Gmail',
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         pass:process.env.EMAIL_PASSWORD
    //     }
    //     //Activate in gmail "less secure app" option
    // })
    //2 define the email options
    //3 send the email
  
}
