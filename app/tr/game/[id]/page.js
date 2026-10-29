import {redirect,notFound} from 'next/navigation';
import {verifiedAccount} from '../../../../lib/account-server';
import {gameDirectory} from '../../../../lib/game-directory';
import AccountShell from '../../../AccountShell';
import GamePage from './GamePage';
export const dynamic='force-dynamic';
export const metadata={title:'Oyna — Pixbet'};
export default async function Page({params}){
 const {id}=await params;
 let account;try{account=await verifiedAccount()}catch{}
 if(!account?.user)redirect('/tr/auth?next='+encodeURIComponent('/tr/game/'+id));
 let directory;try{directory=await gameDirectory(id)}catch{return <AccountShell><main className="empty"><h1>Oyun şu anda kullanılamıyor.</h1><a className="button primary" href="/tr/casino">Casinoya dön</a></main></AccountShell>}
 if(!directory.game)notFound();
 const {data:favorite}=await account.supabase.from('pixbet_favorites').select('game_id').eq('user_id',account.user.id).eq('game_id',String(directory.game.id)).maybeSingle();
 return <AccountShell name={typeof account.user.user_metadata?.display_name==='string'?account.user.user_metadata.display_name:'Hesabım'}><GamePage game={directory.game} related={directory.related} initialFavorite={Boolean(favorite)}/></AccountShell>;
}

