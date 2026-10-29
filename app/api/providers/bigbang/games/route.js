import {bigBangMessage} from '../../../../../lib/bigbang.mjs';
import {readBigBangCatalogue} from '../../../../../lib/bigbang-catalogue';
export const runtime='nodejs';
export async function GET(){
 try{
  const result=await readBigBangCatalogue();
  return Response.json(result,{headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=60'}});
 }catch(error){
  const codes=['configuration_required','provider_auth','provider_forbidden','provider_rate_limit'];
  const code=codes.includes(error.code)?error.code:'provider_unavailable';
  return Response.json({games:[],error:code,message:bigBangMessage(code)},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}

