import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {isSameOrigin} from './account-validation.mjs';
export const privateHeaders={'Cache-Control':'private, no-store'};
export function authConfigured(){return Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY)}
export async function accountClient(){
 if(!authConfigured())throw new Error('auth_unavailable');
 const jar=await cookies();
 return createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'},
  cookies:{getAll:()=>jar.getAll(),setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{}}}
 });
}
export async function verifiedAccount(){
 const supabase=await accountClient();
 const {data,error}=await supabase.auth.getUser();
 return {supabase,user:error?null:data.user};
}
export const sameAccountOrigin=isSameOrigin;
export function safeNext(value){return typeof value==='string'&&/^\/tr\/(?:game\/[a-zA-Z0-9-]+|account)(?:[?#].*)?$/.test(value)&&!value.includes('\\')?value:'/tr/account'}
export async function readSmallJSON(request){
 if(!request.headers.get('content-type')?.startsWith('application/json')||Number(request.headers.get('content-length'))>8192)throw new Error('invalid_request');
 const text=await request.text();if(text.length>8192)throw new Error('invalid_request');return JSON.parse(text);
}
export async function recordGameLaunch(supabase,user,game){
 const {error}=await supabase.from('pixbet_game_sessions').insert({user_id:user.id,game_id:String(game.id),game_name:game.name,provider:game.provider,mode:'demo'});
 if(error)throw new Error('history_unavailable');
}

