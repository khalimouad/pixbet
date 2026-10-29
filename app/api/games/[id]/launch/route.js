import {verifiedAccount,recordGameLaunch,sameAccountOrigin as sameOrigin} from '../../../../../lib/account-server';
import {findGame,createDemoSession} from '../../../../../lib/demo-engine.mjs';
export const runtime='nodejs';
export async function POST(request,{params}) {
 const {id}=await params;
 const headers={'Cache-Control':'no-store'};
 if(!sameOrigin(request)) return Response.json({error:'origin_rejected'},{status:403,headers});
 const game=findGame(id);
 if(!game)return Response.json({error:'game_not_found'},{status:404,headers});
 if(!process.env.DEMO_SESSION_SECRET)return Response.json({error:'sessions_not_configured'},{status:503,headers});
 try {
  const {supabase,user}=await verifiedAccount();
  if(!user)return Response.json({error:'authentication_required'},{status:401,headers});
  const session=createDemoSession(id,process.env.DEMO_SESSION_SECRET,Date.now(),user.id);
  await recordGameLaunch(supabase,user,game);
  return Response.json({...session,game:{id:game.id,name:game.name},mode:'demo',realMoneyEnabled:false},{headers});
 }catch{return Response.json({error:'sessions_unavailable'},{status:503,headers})}
}

