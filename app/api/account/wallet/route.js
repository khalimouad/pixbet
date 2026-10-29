import {verifiedAccount,privateHeaders,sameAccountOrigin,readSmallJSON} from '../../../../lib/account-server';
export const dynamic='force-dynamic';
const reply=(body,status=200)=>Response.json(body,{status,headers:privateHeaders});
export async function GET(){
 try{
  const {supabase,user}=await verifiedAccount();if(!user)return reply({error:'authentication_required'},401);
  const [wallet,history]=await Promise.all([
   supabase.from('pixbet_wallets').select('balance_cents').eq('user_id',user.id).maybeSingle(),
   supabase.from('pixbet_wallet_transactions').select('id,kind,amount_cents,balance_after_cents,currency,simulated,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50)
  ]);
  if(wallet.error||history.error)throw new Error();
  return reply({balanceCents:wallet.data?.balance_cents||0,currency:'TRY',simulated:true,transactions:history.data});
 }catch{return reply({error:'wallet_unavailable'},503)}
}
export async function POST(request){
 if(!sameAccountOrigin(request))return reply({error:'origin_rejected'},403);
 try{
  const {supabase,user}=await verifiedAccount();if(!user)return reply({error:'authentication_required'},401);
  const body=await readSmallJSON(request);
  if(!Number.isSafeInteger(body.amountCents)||body.amountCents<1||body.amountCents>1000000||!['topup','withdraw'].includes(body.kind)||typeof body.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId))return reply({error:'invalid_amount'},400);
  const {data,error}=await supabase.rpc('pixbet_wallet_change',{amount_cents:body.amountCents,kind:body.kind,request_id:body.requestId});
  if(error){const code=['insufficient_balance','balance_limit','idempotency_conflict','invalid_amount'].find(c=>error.message?.includes(c));return reply({error:code||'wallet_unavailable'},code?409:503)}
  return reply(data);
 }catch{return reply({error:'wallet_unavailable'},503)}
}
