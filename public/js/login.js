import axios from 'axios'
import { showAlerts } from './alerts';
export const login= async (email,password)=>{
    try
    {
   const res=await axios({
        method:'POST',
        url:'http://127.0.0.1:3000/api/v1/users/login',
        data:{
           email,
           password
        }
          

    })
    console.log(res);
    if(res.data.status==='sucess'){
        showAlerts('success','Logged in sucessfully');
        window.setTimeout(()=>{
            location.assign('/');
        },1000);
    }
}
    catch(e  ){showAlerts('error',e);}
}
export const logout=async ()=>{
    try
    {const res=await axios(
        {method:'GET',
        url:'http://127.0.0.1:3000/api/v1/users/logout'}
    )
    if(res.data.status==='sucess'){
        showAlerts('success','Logged out sucessfully');
        window.setTimeout(()=>{
            //location.assign('/');
            location.reload(true)
            
        },1500);
    }}
    catch(e){
        showAlerts('error',e)
    }
}
