import AuthForm from './AuthForm';
import AccountShell from '../../AccountShell';
import {authConfigured,safeNext} from '../../../lib/account-server';
export const dynamic='force-dynamic';
export const metadata={title:'Giriş — Pixbet'};
export default async function Page({searchParams}){
 const params=await searchParams;
 return <AccountShell><main className="auth-page"><div className="auth-intro"><span className="eyebrow">PIXBET DÜNYANIZ</span><h1>Oyun deneyiminiz<br/>hesabınızla başlar.</h1><p>Favori oyunlarınız ve geçmişiniz kişisel alanınızda.</p><div className="auth-benefits"><span>✦ Favorileriniz her zaman yanınızda</span><span>◷ Son açtığınız oyunlar</span><span>◈ Demo modunda oyun deneyimi</span></div><a href="/tr/casino" className="text-link">← Kataloğu keşfet</a></div><AuthForm next={safeNext(params.next)} initialMode={params.mode==='signup'?'signup':'signin'} configured={authConfigured()} confirmationError={params.error==='confirmation'}/></main></AccountShell>;
}

