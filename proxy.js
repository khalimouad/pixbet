import {createServerClient} from '@supabase/ssr';
import {NextResponse} from 'next/server';
export async function proxy(request){
 let response=NextResponse.next({request});
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return response;
 const supabase=createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'},
  cookies:{getAll:()=>request.cookies.getAll(),setAll(values,headers={}){
   values.forEach(({name,value})=>request.cookies.set(name,value));
   response=NextResponse.next({request});
   values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   Object.entries(headers).forEach(([key,value])=>response.headers.set(key,value));
  }}
 });
 try{await supabase.auth.getClaims()}catch{}
 response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/tr/account/:path*','/tr/game/:path*','/tr/auth','/auth/:path*','/api/account/:path*','/api/providers/bigbang/launch','/api/games/:id/launch','/api/games/:id/round']};

