import {redirect} from 'next/navigation';
import {verifiedAccount} from '../../../lib/account-server';
import AccountShell from '../../AccountShell';
import Dashboard from './Dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Hesabım — Pixbet'};
export default async function Page({searchParams}){
 const params=await searchParams;
 let account;try{account=await verifiedAccount()}catch{}
 if(!account?.user)redirect('/tr/auth?next='+encodeURIComponent(params.tab==='wallet'?'/tr/account?tab=wallet':'/tr/account'));
 return <AccountShell name={typeof account.user.user_metadata?.display_name==='string'?account.user.user_metadata.display_name:'Hesabım'}><Dashboard initialTab={params.tab==='wallet'?'wallet':'overview'}/></AccountShell>;
}

