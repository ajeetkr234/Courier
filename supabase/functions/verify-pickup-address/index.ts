import { admin, userClient } from '../_shared/supabase.ts';
import { corsHeaders, json } from '../_shared/http.ts';
const hash=async(v:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))].map(x=>x.toString(16).padStart(2,'0')).join('');
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:corsHeaders});
  if(req.method!=='POST') return json({error:'Method not allowed'},405);
  const authorization=req.headers.get('authorization')||'';
  const {data:{user}}=await userClient(authorization).auth.getUser();
  const sellerId=user?.app_metadata?.seller_id; if(!user||!sellerId)return json({error:'Authentication required'},401);
  const body=await req.json(), warehouseId=String(body.warehouseId||'');
  const {data:w}=await admin.from('warehouses').select('*').eq('id',warehouseId).eq('seller_id',sellerId).maybeSingle();
  if(!w)return json({error:'Pickup address not found'},404);
  const phone=String(w.phone||'').replace(/\D/g,'').slice(-10); if(!/^[6-9]\d{9}$/.test(phone))return json({error:'Enter a valid pickup mobile number first'},400);
  if(body.action==='send'){
    const {count}=await admin.from('pickup_verification_challenges').select('id',{count:'exact',head:true}).eq('warehouse_id',warehouseId).gte('created_at',new Date(Date.now()-3600000).toISOString());
    if((count||0)>=5)return json({error:'Too many OTP requests. Try again after one hour.'},429);
    const otp=String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0');
    const sid=Deno.env.get('TWILIO_ACCOUNT_SID'),token=Deno.env.get('TWILIO_AUTH_TOKEN'),from=Deno.env.get('TWILIO_SMS_FROM');
    // The documented QA seller must remain testable even when this non-production
    // project has no paid SMS provider. Never expose an OTP for a real account.
    const isQaSeller=user.email?.toLowerCase()==='seller.demo@shipfaster.test';
    if(!sid||!token||!from){
      if(!isQaSeller)return json({error:'SMS OTP service is not configured. Contact Super Admin.'},503);
      const {error:challengeError}=await admin.from('pickup_verification_challenges').insert({warehouse_id:warehouseId,otp_hash:await hash(`${warehouseId}:${otp}`),expires_at:new Date(Date.now()+600000).toISOString()});
      if(challengeError)return json({error:'Unable to create verification challenge.'},500);
      return json({ok:true,testOtp:otp,delivery:'qa-screen'});
    }
    const form=new URLSearchParams({To:`+91${phone}`,From:from,Body:`Your ShipFaster pickup verification OTP is ${otp}. It expires in 10 minutes.`});
    const sent=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{authorization:`Basic ${btoa(`${sid}:${token}`)}`,'content-type':'application/x-www-form-urlencoded'},body:form});
    if(!sent.ok)return json({error:'Unable to send OTP. Check SMS configuration.'},502);
    const {error:challengeError}=await admin.from('pickup_verification_challenges').insert({warehouse_id:warehouseId,otp_hash:await hash(`${warehouseId}:${otp}`),expires_at:new Date(Date.now()+600000).toISOString()});
    if(challengeError)return json({error:'Unable to create verification challenge.'},500);
    return json({ok:true});
  }
  if(body.action==='verify'){
    const {data:c}=await admin.from('pickup_verification_challenges').select('*').eq('warehouse_id',warehouseId).is('used_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(!c||c.attempts>=5)return json({error:'OTP expired or too many attempts. Request a new OTP.'},400);
    if(c.otp_hash!==await hash(`${warehouseId}:${String(body.otp||'')}`)){await admin.from('pickup_verification_challenges').update({attempts:c.attempts+1}).eq('id',c.id);return json({error:'Incorrect OTP'},400);}
    const now=new Date().toISOString(); await admin.from('pickup_verification_challenges').update({used_at:now}).eq('id',c.id);
    await admin.from('warehouses').update({address_verified_at:now,phone_verified_at:now}).eq('id',warehouseId);
    return json({ok:true,verifiedAt:now});
  }
  return json({error:'Unsupported action'},400);
});
