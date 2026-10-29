import {accountClient,sameAccountOrigin,readSmallJSON,privateHeaders,safeNext} from '../../../../lib/account-server';
export async function POST(request){
 const reply=(value,status=200)=>Response.json(value,{status,headers:privateHeaders});
 if(!sameAccountOrigin(request))return reply({error:'origin_rejected'},403);
 try{
  const body=await readSmallJSON(request),supabase=await accountClient();
  if(body.action==='signout'){const {error}=await supabase.auth.signOut();return error?reply({error:'signout_failed'},503):reply({success:true})}
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof body.password!=='string'||body.password.length>128)return reply({error:'invalid_credentials'},400);
  if(body.action==='signin'){
   if(body.password.length<1)return reply({error:'invalid_credentials'},400);
   const {data,error}=await supabase.auth.signInWithPassword({email,password:body.password});
   if(error||!data.user)return reply({error:error?.code==='email_not_confirmed'?'email_not_confirmed':'invalid_credentials'},401);
   return reply({success:true,next:safeNext(body.next)});
  }
  if(body.action==='signup'){
   const name=typeof body.name==='string'?body.name.trim():'';
   if(name.length<2||name.length>40||body.password.length<10||body.adult!==true)return reply({error:'invalid_registration'},400);
   const next=safeNext(body.next),redirect=new URL('/auth/callback',request.url);redirect.searchParams.set('next',next);
   const {data,error}=await supabase.auth.signUp({email,password:body.password,options:{data:{display_name:name},emailRedirectTo:redirect.href}});
   if(error)return reply({error:error.status===429?'rate_limited':'signup_failed'},400);
   return reply({success:true,confirmationRequired:!data.session,next});
  }
  return reply({error:'invalid_request'},400);
 }catch{return reply({error:'auth_unavailable'},503)}
}

