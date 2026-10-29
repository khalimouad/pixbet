import {createHmac,randomInt,randomUUID,timingSafeEqual} from 'node:crypto';
import {games} from './catalogue.mjs';
export function findGame(id) { return games.find(game => String(game.id) === String(id)); }
export function createDemoSession(gameId, secret, now=Date.now(), userId=null) {
 if(!secret || secret.length<32) throw new Error('Session signing is not configured');
 const payload={gameId:String(gameId),mode:'demo',iss:'pixbet',aud:'demo-round',nonce:randomUUID(),userId,exp:Math.floor(now/1000)+900};
 const encoded=Buffer.from(JSON.stringify(payload)).toString('base64url');
 const signature=createHmac('sha256',secret).update(encoded).digest('base64url');
 return {token:encoded+'.'+signature,expiresAt:new Date(payload.exp*1000).toISOString()};
}
export function verifyDemoSession(token,gameId,secret,now=Date.now(),expectedUserId=null) {
 if(!secret||secret.length<32||typeof token!=='string'||token.length>2048) return false;
 try {
  const parts=token.split('.');if(parts.length!==2)return false;
  const signature=Buffer.from(parts[1],'base64url');
  const expected=createHmac('sha256',secret).update(parts[0]).digest();
  if(signature.length!==expected.length||!timingSafeEqual(signature,expected))return false;
  const data=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
  return (!expectedUserId||data.userId===expectedUserId)&&data.mode==='demo'&&data.iss==='pixbet'&&data.aud==='demo-round'&&data.gameId===String(gameId)&&Number.isInteger(data.exp)&&data.exp>Math.floor(now/1000);
 }catch{return false}
}
export function createDemoRound() {
 const symbols=['✦','7','◆','●'];
 const reels=Array.from({length:3},()=>symbols[randomInt(symbols.length)]);
 return {roundId:randomUUID(),mode:'demo',reels,matched:reels.every(s=>s===reels[0]),createdAt:new Date().toISOString(),monetaryValue:0};
}
export function sameOrigin(request) {
 const origin=request.headers.get('origin');
 return !origin || origin===new URL(request.url).origin;
}

