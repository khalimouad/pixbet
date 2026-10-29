'use client';
import {useEffect,useRef,useState} from 'react';
const money=cents=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(cents/100);
const errors={insufficient_balance:'Sanal bakiyeniz yetersiz.',balance_limit:'Sanal bakiye üst sınırına ulaşıldı.',invalid_amount:'0,01–10.000 ₺ arasında bir tutar girin.',idempotency_conflict:'İstek bilgileri uyuşmuyor. Sayfayı yenileyin.',wallet_unavailable:'Cüzdan şu anda kullanılamıyor. Yeniden deneyin.'};
export default function VirtualWallet(){
 const [wallet,setWallet]=useState(null),[kind,setKind]=useState('topup'),[amount,setAmount]=useState('500'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const pending=useRef(null);
 async function load(signal){try{const response=await fetch('/api/account/wallet',{cache:'no-store',signal});if(response.status===401){window.location.assign('/tr/auth?next=%2Ftr%2Faccount');return}if(!response.ok)throw new Error();setWallet(await response.json())}catch(e){if(e.name!=='AbortError')setError(errors.wallet_unavailable)}}
 useEffect(()=>{const c=new AbortController();load(c.signal);return()=>c.abort()},[]);
 async function submit(event){
  event.preventDefault();if(busy)return;setError('');setNotice('');
  const normalized=amount.trim().replace(',','.');const cents=Math.round(Number(normalized)*100);
  if(!/^\d{1,5}(\.\d{1,2})?$/.test(normalized)||!Number.isSafeInteger(cents)||cents<1||cents>1000000){setError(errors.invalid_amount);return}
  const fingerprint=kind+':'+cents;if(pending.current?.fingerprint!==fingerprint)pending.current={fingerprint,requestId:crypto.randomUUID()};
  setBusy(true);
  try{
   const response=await fetch('/api/account/wallet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,amountCents:cents,requestId:pending.current.requestId})});
   if(response.status===401){window.location.assign('/tr/auth?next=%2Ftr%2Faccount');return}
   const data=await response.json();if(!response.ok)throw new Error(errors[data.error]||errors.wallet_unavailable);
   pending.current=null;setNotice(kind==='topup'?'Sanal kredi eklendi. Gerçek para tahsil edilmedi.':'Sanal çekim tamamlandı. Bankaya veya bir adrese ödeme gönderilmedi.');await load();
  }catch(e){setError(e.message||errors.wallet_unavailable)}finally{setBusy(false)}
 }
 return <section className="account-panel virtual-wallet"><div className="wallet-summary"><div><span className="eyebrow">SANAL TÜRK LİRASI CÜZDANI</span><h2>{wallet?money(wallet.balanceCents):'Yükleniyor…'}</h2></div><span className="mode-badge">DEMO · TRY</span></div><p>Bu bakiye yalnızca Pixbet demo cüzdanına aittir. Gerçek para, banka hesabı veya kripto varlık içermez. BigBang oyunlarının kendi demo bakiyesinden bağımsızdır; bu cüzdan oyunları finanse etmez.</p><div className="auth-tabs"><button disabled={busy} className={kind==='topup'?'active':''} onClick={()=>{setKind('topup');setNotice('');setError('')}}>Sanal kredi yükle</button><button disabled={busy} className={kind==='withdraw'?'active':''} onClick={()=>{setKind('withdraw');setNotice('');setError('')}}>Sanal çekim</button></div><form onSubmit={submit}><label className="field">Tutar (₺)<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} maxLength={8} required disabled={busy}/></label><div className="wallet-presets">{[100,500,1000].map(value=><button type="button" className="button secondary" disabled={busy} key={value} onClick={()=>setAmount(String(value))}>{money(value*100)}</button>)}</div><button className="button primary full" disabled={busy||!wallet}>{busy?'İşleniyor…':kind==='topup'?'Ücretsiz sanal kredi ekle':'Sanal çekimi tamamla'}</button></form>{error&&<p className="form-message" role="alert">{error}</p>}{notice&&<p className="form-message success" role="status">{notice}</p>}<h3>İşlem geçmişi</h3>{wallet?.transactions.length?<div className="wallet-history">{wallet.transactions.map(t=><article key={t.id}><div><b>{t.kind==='topup'?'Sanal yükleme':'Sanal çekim'}</b><small>{new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(t.created_at))}</small></div><div><strong>{t.kind==='topup'?'+':'−'}{money(t.amount_cents)}</strong><small>Son bakiye: {money(t.balance_after_cents)}</small></div></article>)}</div>:<p>Henüz sanal işlem yapılmadı.</p>}<small className="muted">Her işlem yalnızca bir kez kaydedilir. Tek işlem sınırı 10.000 ₺; sanal bakiye üst sınırı 1.000.000 ₺.</small></section>;
}
