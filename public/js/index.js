import '@babel/polyfill'
import {login,logout } from './login'
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import {bookTour} from './stripe'
const mapbox=document.getElementById('map');
if(mapbox)
{
    // const locations=JSON.parse(mapbox.dataset.locations);
   // console.log(locations);
//displayMap();
}
document.querySelector('.formLogin')?.addEventListener('submit',e=>{
    e.preventDefault();
    alert("fdds")
    const email=document.getElementById('email').value;
    const pwd=document.getElementById('password').value;
    login(email,pwd)
  
})
document.querySelector('.form-user-data')?.addEventListener('submit',e=>{
    e.preventDefault();

    const form=new FormData()
    
    form.append('name',document.getElementById('name').value)
    form.append('email',document.getElementById('email').value)
    form.append('photo',document.getElementById('photo').files[0])

    console.log(form);
    updateSettings(form,'userData');

})
document.querySelector('.form-user-password')?.addEventListener('submit',async e=>{
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent='Waiting ...'
    const currentPass=document.getElementById('password-current').value;
    const password=document.getElementById('password').value;
    const passwordConfirm=document.getElementById('password-confirm').value;
  await  updateSettings({currentPass,password,passwordConfirm},'password');
  document.querySelector('.btn--save-password').textContent='Save password'
    document.getElementById('password-current').value='';
    document.getElementById('password').value='';
    document.getElementById('password-confirm').value='';
    

})
document.getElementById('book-tour')?.addEventListener('click',async e=>{
    e.target.textContent='PROCESSING ...';
    const {tourid}=e.target.dataset
    console.log(tourid)
    await bookTour(tourid);
    e.target.textContent='Book tour now!';
})
document.querySelector('.nav__el--logout')?.addEventListener('click',logout) 
