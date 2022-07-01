'use strict'
//***********************************************************************           ********************* */
import axios from "axios";
//import Stripe from "stripe"
import { showAlerts } from "./alerts";
import {loadStripe} from '@stripe/stripe-js';

export const bookTour=async tourId=>{
    try
   { const stripe = await loadStripe('pk_test_51LCjyBHF92x0ObCPSMvDRIjHl2YnOYM5r52RhbbxqvVFLltShEkM8uaUw0Wz17OgT3iskvWFwvJ3RuCNYCiO4FFK00RIsXaU2e');

    //1)get checkout session from api
    console.log('hiiii')
    const session=await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session)
    //console.log(session);
       //2)create checkout form + charge credit card
       await stripe.redirectToCheckout({
        sessionId:session.data.session.id
       })
    }

    catch(err){
        console.log(err);
        showAlerts('error',err)
    }



}