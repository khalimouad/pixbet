const API='https://api.bigbangcasino.bet/api/v1';
export class BigBangError extends Error {constructor(code){super(code);this.code=code;}}
const allowedHost=host=>host==='bigbangcasino.bet'||host.endsWith('.bigbangcasino.bet');
function imageURL(value){
 try{const url=new URL(value);return url.protocol==='https:'&&allowedHost(url.hostname)&&!url.username&&!url.password&&(!url.port||url.port==='443')?url.href:null}catch{return null}
}
export function normalizeCatalogue(payload){
 if(payload?.success!==true||!Array.isArray(payload.data))throw new BigBangError('invalid_provider_response');
 const seen=new Set();
 return payload.data.flatMap((g,index)=>{
  if(!Number.isSafeInteger(g.id)||g.id<=0||seen.has(g.id)||g.is_premium===true||g.mode==='premium')return [];
  seen.add(g.id);
  const type=['slot','live','crash'].includes(g.game_type)?g.game_type:'slot';
  const name=typeof g.title==='string'&&g.title.trim()?g.title:typeof g.name==='string'?g.name:null;
  if(!name)return [];
  return [{id:'bb-'+g.id,providerGameId:g.id,name,provider:typeof g.provider==='string'?g.provider:'BigBang',category:type==='crash'?'fast':type==='live'?'live':'slots',featured:index<18,thumbnail:imageURL(g.thumbnail),source:'bigbang',art:type==='crash'?'plane':'cards',color:['#138cde','#6248c2','#c69a2c','#219da8'][index%4]}];
 });
}
export function safeDemoURL(value,key){
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||!['bigbangcasino.bet','api.bigbangcasino.bet'].includes(url.hostname)||url.username||url.password||(url.port&&url.port!=='443')||!url.pathname.startsWith('/demo/launch/'))throw new Error();
  if([...url.searchParams.keys()].some(k=>['api_key','apikey','x-api-key'].includes(k.toLowerCase()))||(key&&url.href.includes(key)))throw new Error();
  return url.href;
 }catch{throw new BigBangError('invalid_demo_launch')}
}
export function createBigBangClient({getKey=()=>process.env.BIGBANG_API_KEY,fetchImpl=(...args)=>fetch(...args)}={}){
 async function request(path,{body}={}){
  const key=getKey();
  if(typeof key!=='string'||!/^ek_test_[a-zA-Z0-9]+$/.test(key))throw new BigBangError('configuration_required');
  let response;
  try{response=await fetchImpl(API+path,{method:body?'POST':'GET',headers:{'X-API-Key':key,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)})}catch{throw new BigBangError('provider_unavailable')}
  if(!response.ok)throw new BigBangError(response.status===401?'provider_auth':response.status===403?'provider_forbidden':response.status===429?'provider_rate_limit':'provider_unavailable');
  let data;try{data=await response.json()}catch{throw new BigBangError('invalid_provider_response')}
  if(data?.success!==true)throw new BigBangError('provider_rejected');
  return data;
 }
 return {
  async catalogue(){
   const payload=await request('/games?type=standard&limit=5000&offset=0');
   const games=normalizeCatalogue(payload);
   return {games,mode:'sandbox',source:'BigBang',fetchedAt:new Date().toISOString(),total:games.length};
  },
  async launchDemo(gameId,language){
   if(!Number.isSafeInteger(gameId)||gameId<=0)throw new BigBangError('invalid_game');
   const payload=await request('/games/launch',{body:{game_id:gameId,demo:true,language:language==='en'?'en':'fr',return_url:'https://pixbet-three.vercel.app/fr/casino'}});
   if(payload.demo!==true)throw new BigBangError('invalid_demo_launch');
   return {launchUrl:safeDemoURL(payload.game_url,getKey()),mode:'demo',realMoneyEnabled:false};
  }
 };
}
export const bigBangClient=createBigBangClient();
