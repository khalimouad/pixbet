import {verifiedAccount,privateHeaders,authConfigured} from '../../../../lib/account-server';
export const dynamic='force-dynamic';
export async function GET(){
 if(!authConfigured())return Response.json({user:null,configured:false},{headers:privateHeaders});
 try{const {user}=await verifiedAccount();return Response.json({configured:true,user:user?{id:user.id,email:user.email,name:user.user_metadata?.display_name||'',createdAt:user.created_at}:null},{headers:privateHeaders})}
 catch{return Response.json({user:null,error:'auth_unavailable'},{status:503,headers:privateHeaders})}
}

