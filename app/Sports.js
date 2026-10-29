'use client';
import {useEffect,useState} from 'react';
export default function Sports({onSelect}) {
 const [data,setData]=useState(null),[status,setStatus]=useState('loading'),[filter,setFilter]=useState('all');
 
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/odds',{signal:controller.signal}).then(async response=>{
   if(!response.ok)throw new Error('Odds unavailable');
   const value=await response.json();if(!Array.isArray(value.events))throw new Error('Invalid response');
   setData(value);setStatus('ready');
  }).catch(error=>{if(error.name!=='AbortError')setStatus('error')});
  return()=>controller.abort();
 },[]);
 const sports=[...new Set((data?.events||[]).map(e=>e.sport))];
 const events=(data?.events||[]).filter(e=>filter==='all'||e.sport===filter);
 const date=value=>new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
 return <section className="sports-section"><div className="section-heading"><h2>{"Spor · Bahis şirketi oranları"}</h2><span className="muted">The Odds API · Avrupa</span></div><div className="odds-notice"><b>{"Bilgilendirme amaçlı oranlar · Yalnızca sanal kuponlar"}</b><p>{"Veriler 6 saat önbellekte tutulur. Gösterilen oranlar değişmiş olabilir. Gerçek para ile bahis oynanamaz."}</p>{data?.fetchedAt&&<small>{"Veri zamanı: "}{date(data.fetchedAt)}</small>}</div>
 {status==='loading'&&<div className="empty" role="status">{"Karşılaşmalar ve oranlar yükleniyor…"}</div>}
 {status==='error'&&<div className="empty" role="alert"><h3>{"Oranlar şu anda kullanılamıyor"}</h3><p>{"Veri sağlayıcısına ulaşılamıyor veya plan limiti dolmuş olabilir. Lütfen daha sonra tekrar deneyin."}</p></div>}
 {status==='ready'&&<><div className="category-list" role="group" aria-label={"Spor dalına göre filtrele"}><button className={filter==='all'?'selected':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{"Tüm sporlar"}</button>{sports.map(sport=><button key={sport} className={filter===sport?'selected':''} aria-pressed={filter===sport} onClick={()=>setFilter(sport)}>{sport}</button>)}</div>{events.length===0&&<div className="empty">{"Şu anda oranı bulunan karşılaşma yok."}</div>}{events.map(event=><article className="match real-match" key={event.id}><div className="event-info"><small>{event.sport} · {date(event.startTime)}</small><h3>{event.home}<span>–</span>{event.away}</h3><small className="bookmaker">{event.bookmaker}{event.updatedAt&&Number.isFinite(Date.parse(event.updatedAt))?' · '+"Oran zamanı: "+date(event.updatedAt):''}</small></div><div className="odds">{event.outcomes.map(outcome=><button key={outcome.label} aria-label={(outcome.label==='X'?'Beraberlik':outcome.name)+' '+outcome.price.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})} onClick={()=>onSelect({match:event.id,teams:event.home+' – '+event.away,label:outcome.label==='X'?"Beraberlik":outcome.name,odds:outcome.price,bookmaker:event.bookmaker,quotedAt:event.updatedAt})}><span>{outcome.label}</span><b>{outcome.price.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></button>)}</div></article>)}</>}
 </section>;
}

