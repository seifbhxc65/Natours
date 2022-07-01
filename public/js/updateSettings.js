import axios from 'axios'
import { showAlerts } from './alerts';
export const updateSettings=async (data,type)=>{


try
{const res=await axios(
    {method:'PATCH',
        url:`http://127.0.0.1:3000/api/v1/users/${type==='password'?'updatePassword':'updateMe'}`,
        data}
);
console.log(res);
if(res.data.status==='sucess')
{showAlerts('success','succefully updated the data');}
}
catch(e){
    console.log(e);
    showAlerts('error',e.response.data.message);
}
//
//location.reload(true)

}