import {verifiedAccount,privateHeaders,sameAccountOrigin,readSmallJSON} from '../../../../lib/account-server';
import {readBigBangCatalogue} from '../../../../lib/bigbang-catalogue';
import {games as demos} from '../../../../lib/catalogue.mjs';
export const dynamic='force-dynamic';
export async function GET(){
 try{
  const {supabase,user}=await verifiedAccount();if(!user)return Response.json({error:'authentication_required'},{status:401,headers:privateHeaders});
  let {data:profile,error}=await supabase.from('pixbet_profiles').select('display_name,created_at').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(!profile){const result=await supabase.from('pixbet_profiles').insert({user_id:user.id,display_name:(typeof user.user_metadata?.display_name==='string'&&user.user_metadata.display_name.trim().length>=2?user.user_metadata.display_name.trim():'Oyuncu').slice(0,40)}).select('display_name,created_at').single();if(result.error)throw result.error;profile=result.data}
  const [sessions,favorites]=await Promise.all([
   supabase.from('pixbet_game_sessions').select('id,game_id,game_name,provider,mode,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50),
   supabase.from('pixbet_favorites').select('game_id,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(200)
  ]);
  if(sessions.error||favorites.error)throw new Error();
  let catalogue=[];try{catalogue=(await readBigBangCatalogue()).games}catch{}
  const map=new Map([...demos,...catalogue].map(g=>[String(g.id),g]));
  return Response.json({user:{email:user.email,createdAt:user.created_at},profile,sessions:sessions.data,favorites:favorites.data.map(f=>({...f,game:map.get(f.game_id)||null}))},{headers:privateHeaders});
 }catch{return Response.json({error:'account_unavailable'},{status:503,headers:privateHeaders})}
}
export async function PATCH(request){
 if(!sameAccountOrigin(request))return Response.json({error:'origin_rejected'},{status:403,headers:privateHeaders});
 try{
  const {supabase,user}=await verifiedAccount();if(!user)return Response.json({error:'authentication_required'},{status:401,headers:privateHeaders});
  const body=await readSmallJSON(request),name=typeof body.name==='string'?body.name.trim():'';
  if(name.length<2||name.length>40)return Response.json({error:'invalid_name'},{status:400,headers:privateHeaders});
  const {error}=await supabase.from('pixbet_profiles').upsert({user_id:user.id,display_name:name},{onConflict:'user_id'});
  if(error)throw error;return Response.json({success:true},{headers:privateHeaders});
 }catch{return Response.json({error:'profile_update_failed'},{status:503,headers:privateHeaders})}
}

