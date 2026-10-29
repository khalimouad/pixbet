import {readBigBangCatalogue} from './bigbang-catalogue';
import {games as demos} from './catalogue.mjs';
export async function gameDirectory(id){
 if(/^bb-[1-9][0-9]*$/.test(String(id))){
  const {games}=await readBigBangCatalogue();
  const game=games.find(g=>g.id===id);
  return {game,related:game?games.filter(g=>g.provider===game.provider&&g.id!==id).slice(0,6):[]};
 }
 const game=demos.find(g=>String(g.id)===String(id));
 return {game,related:game?demos.filter(g=>g.id!==game.id).slice(0,6):[]};
}

