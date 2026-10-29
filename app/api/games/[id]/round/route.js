import {verifiedAccount,sameAccountOrigin as sameOrigin} from '../../../../../lib/account-server';
import {findGame,verifyDemoSession,createDemoRound} from '../../../../../lib/demo-engine.mjs';
export const runtime='nodejs';
export async function POST(request,{params}) {
 const {id}=await params;
 const headers={'Cache-Control':'no-store'};
 if(!sameOrigin(request))return Response.json({error:'origin_rejected'},{status:403,headers});
 if(!findGame(id))return Response.json({error:'game_not_found'},{status:404,headers});
 let account;try{account=await verifiedAccount()}catch{return Response.json({error:'auth_unavailable'},{status:503,headers})}
 if(!account.user)return Response.json({error:'authentication_required'},{status:401,headers});
 const authorization=request.headers.get('authorization')||'';
 const token=authorization.startsWith('Bearer ')?authorization.slice(7):'';
 if(!verifyDemoSession(token,id,process.env.DEMO_SESSION_SECRET,Date.now(),account.user.id))return Response.json({error:'invalid_or_expired_session'},{status:401,headers});
 return Response.json(createDemoRound(),{headers});
}

