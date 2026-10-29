import {bigBangClient} from '../lib/bigbang.mjs';
try{
 const catalogue=await bigBangClient.catalogue();
 if(!catalogue.games.length)throw new Error('empty_catalogue');
 console.log('BigBang sandbox catalogue verified:',catalogue.games.length,'games.');
 const sample=catalogue.games.find(game=>game.category==='slots')||catalogue.games[0];
 const session=await bigBangClient.launchDemo(sample.providerGameId,'tr');
 if(session.mode!=='demo'||session.realMoneyEnabled!==false)throw new Error('demo_validation_failed');
 console.log('BigBang demo launch verified. Launch URL withheld from build logs.');
}catch(error){console.error('BigBang sandbox verification failed:',error.code||'verification_failed');process.exitCode=1}

