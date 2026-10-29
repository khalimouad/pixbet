import {NextResponse} from 'next/server';
import {accountClient,safeNext} from '../../../lib/account-server';
export async function GET(request){
 const url=new URL(request.url),code=url.searchParams.get('code');
 if(code){try{const supabase=await accountClient();const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeNext(url.searchParams.get('next')),url.origin))}catch{}}
 return NextResponse.redirect(new URL('/tr/auth?error=confirmation',url.origin));
}

