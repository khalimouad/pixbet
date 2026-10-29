import {verifiedAccount,privateHeaders,sameAccountOrigin,readSmallJSON} from '../../../../lib/account-server';
import {readBigBangCatalogue} from '../../../../lib/bigbang-catalogue';
import {games as demos} from '../../../../lib/catalogue.mjs';
export async function POST(request){
 const reply=(body,status=200)=>Response.json(body,{status,headers:privateHeaders});
 if(!sameAccountOrigin(request))return reply({error:'origin_rejected'},403);
 try{
  const {supabase,user}=await verifiedAccount();if(!user)return reply({error:'authentication_required'},401);
  const {gameId,favorite}=await readSmallJSON(request);
  if(typeof gameId!=='string'||gameId.length>40||typeof favorite!=='boolean')return reply({error:'invalid_request'},400);
  const catalogue=gameId.startsWith('bb-')?(await readBigBangCatalogue()).games:demos;
  if(!catalogue.some(g=>String(g.id)===gameId))return reply({error:'game_not_found'},404);
  const result=favorite?await supabase.from('pixbet_favorites').upsert({user_id:user.id,game_id:gameId},{onConflict:'user_id,game_id',ignoreDuplicates:true}):await supabase.from('pixbet_favorites').delete().eq('user_id',user.id).eq('game_id',gameId);
  if(result.error)throw result.error;return reply({success:true,favorite});
 }catch{return reply({error:'favorite_update_failed'},503)}
}

