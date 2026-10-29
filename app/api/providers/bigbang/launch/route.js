import {bigBangClient,bigBangMessage} from '../../../../../lib/bigbang.mjs';
import {readBigBangCatalogue} from '../../../../../lib/bigbang-catalogue';
export const runtime='nodejs';
export async function POST(request){
 const headers={'Cache-Control':'private, no-store'};
 const reply=(body,status)=>Response.json(body.error?{...body,message:bigBangMessage(body.error)}:body,{status,headers});
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'origin_rejected'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'invalid_request'},400);
 if(Number(request.headers.get('content-length'))>4096)return reply({error:'invalid_request'},413);
 let body;try{const raw=await request.text();if(raw.length>4096)return reply({error:'invalid_request'},413);body=JSON.parse(raw)}catch{return reply({error:'invalid_request'},400)}
 if(!Number.isSafeInteger(body?.gameId)||body.gameId<=0)return reply({error:'invalid_game'},400);
 try{
  const catalogue=await readBigBangCatalogue();
  if(!catalogue.games.some(game=>game.providerGameId===body.gameId))return reply({error:'game_not_found'},404);
  const session=await bigBangClient.launchDemo(body.gameId);
  return reply(session,200);
 }catch(error){
  const codes=['configuration_required','provider_auth','provider_forbidden','provider_rate_limit'];
  return reply({error:codes.includes(error.code)?error.code:'launch_unavailable'},503);
 }
}

