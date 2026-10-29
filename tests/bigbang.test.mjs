import test from 'node:test';
import assert from 'node:assert/strict';
import {createBigBangClient,normalizeCatalogue,safeDemoURL} from '../lib/bigbang.mjs';
test('catalogue normalizes titles, restricts thumbnails and excludes premium/invalid/duplicate IDs',()=>{
 const result=normalizeCatalogue({success:true,data:[
 {id:1,name:'InternalSlug',title:'Display title',provider:'Provider',thumbnail:'https://bigbangcasino.bet/art.webp',game_type:'slot'},
 {id:1,name:'duplicate'},{id:2,name:'Premium',is_premium:true},{id:3,name:'Premium mode',mode:'premium'},
 {id:4,name:'Bad thumbnail',thumbnail:'https://evil.example/image.png',game_type:'crash'},{id:-1,name:'invalid'}
 ]});
 assert.equal(result.length,2);assert.equal(result[0].id,'bb-1');assert.equal(result[0].name,'Display title');assert.equal(result[1].thumbnail,null);assert.equal(result[1].category,'fast');
 assert.throws(()=>normalizeCatalogue({success:false,data:[]}));
});
test('only allowlisted demo launch URLs can reach the browser',()=>{
 assert.equal(safeDemoURL('https://bigbangcasino.bet/demo/launch/Provider/Game'),'https://bigbangcasino.bet/demo/launch/Provider/Game');
 for(const url of ['http://bigbangcasino.bet/demo/launch/a','https://bigbangcasino.bet.evil.example/demo/launch/a','https://bigbangcasino.bet/api/game/a','https://name:secret@bigbangcasino.bet/demo/launch/a','https://bigbangcasino.bet/demo/launch/a?api_key=secret'])assert.throws(()=>safeDemoURL(url));
});
test('launch always uses sandbox header auth and forces demo without a player or wallet',async()=>{
 const calls=[];
 const client=createBigBangClient({getKey:()=>'ek_test_fake',fetchImpl:async(url,options)=>{
  calls.push({url,options});
  return Response.json({success:true,demo:true,game_url:'https://bigbangcasino.bet/demo/launch/Provider/Game'});
 }});
 const session=await client.launchDemo(5,'fr');
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://api.bigbangcasino.bet/api/v1/games/launch');
 assert.equal(calls[0].options.headers['X-API-Key'],'ek_test_fake');
 const body=JSON.parse(calls[0].options.body);assert.equal(body.demo,true);assert.equal(body.game_id,5);assert.equal(body.language,'tr');assert(!('user_token' in body));assert(!('amount' in body));
 assert.equal(session.realMoneyEnabled,false);assert(!JSON.stringify(session).includes('ek_test_fake'));
});
test('live credentials and invalid game IDs fail before any request',async()=>{
 let count=0;
 const client=createBigBangClient({getKey:()=>'live-value',fetchImpl:()=>{count++;throw new Error()}});
 await assert.rejects(()=>client.catalogue(),{code:'configuration_required'});
 await assert.rejects(()=>client.launchDemo(-1,'en'),{code:'invalid_game'});assert.equal(count,0);
});
test('provider errors are generic, never echo bodies or keys and are not retried',async()=>{
 let count=0;
 const client=createBigBangClient({getKey:()=>'ek_test_fake',fetchImpl:async()=>{count++;return new Response('private upstream details ek_test_fake',{status:403})}});
 await assert.rejects(()=>client.launchDemo(1,'en'),error=>error.code==='provider_forbidden'&&!error.message.includes('private'));assert.equal(count,1);
});
test('reject non-demo responses even when provider returns success',async()=>{
 const client=createBigBangClient({getKey:()=>'ek_test_fake',fetchImpl:async()=>Response.json({success:true,game_url:'https://bigbangcasino.bet/api/game/a'})});
 await assert.rejects(()=>client.launchDemo(1,'en'),{code:'invalid_demo_launch'});
});

