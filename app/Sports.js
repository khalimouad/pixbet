'use client';
import {useEffect,useState} from 'react';
export default function Sports({en,onSelect}) {
 const [data,setData]=useState(null),[status,setStatus]=useState('loading'),[filter,setFilter]=useState('all');
 const tr=(fr,english)=>en?english:fr;
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
 const date=value=>new Intl.DateTimeFormat(en?'en-GB':'fr-FR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
 return <section className="sports-section"><div className="section-heading"><h2>{tr('Sport · Cotes des bookmakers','Sports · Bookmaker odds')}</h2><span className="muted">The Odds API · EU</span></div><div className="odds-notice"><b>{tr('Cotes indicatives · Tickets simulés uniquement','Indicative odds · Simulated tickets only')}</b><p>{tr('Les données sont mises en cache pendant 6 heures. Les cotes affichées peuvent avoir changé. Aucun pari réel ne peut être placé.','Data is cached for 6 hours. Displayed prices may have changed. No real bets can be placed.')}</p>{data?.fetchedAt&&<small>{tr('Données récupérées : ','Data retrieved: ')}{date(data.fetchedAt)}</small>}</div>
 {status==='loading'&&<div className="empty" role="status">{tr('Chargement des rencontres et des cotes…','Loading events and odds…')}</div>}
 {status==='error'&&<div className="empty" role="alert"><h3>{tr('Les cotes sont momentanément indisponibles','Odds are temporarily unavailable')}</h3><p>{tr('Le fournisseur peut être indisponible ou la limite du forfait peut être atteinte. Réessayez plus tard.','The provider may be unavailable or the plan limit may have been reached. Please try again later.')}</p></div>}
 {status==='ready'&&<><div className="category-list" role="group" aria-label={tr('Filtrer par sport','Filter sports')}><button className={filter==='all'?'selected':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{tr('Tous les sports','All sports')}</button>{sports.map(sport=><button key={sport} className={filter===sport?'selected':''} aria-pressed={filter===sport} onClick={()=>setFilter(sport)}>{sport}</button>)}</div>{events.length===0&&<div className="empty">{tr('Aucune rencontre avec des cotes disponibles pour le moment.','No events with odds are currently available.')}</div>}{events.map(event=><article className="match real-match" key={event.id}><div className="event-info"><small>{event.sport} · {date(event.startTime)}</small><h3>{event.home}<span>vs</span>{event.away}</h3><small className="bookmaker">{event.bookmaker}{event.updatedAt&&Number.isFinite(Date.parse(event.updatedAt))?' · '+tr('Cotes du ','Odds as of ')+date(event.updatedAt):''}</small></div><div className="odds">{event.outcomes.map(outcome=><button key={outcome.label} aria-label={outcome.name+' '+outcome.price.toFixed(2)} onClick={()=>onSelect({match:event.id,teams:event.home+' – '+event.away,label:outcome.label==='X'?tr('Match nul','Draw'):outcome.name,odds:outcome.price,bookmaker:event.bookmaker,quotedAt:event.updatedAt})}><span>{outcome.label}</span><b>{outcome.price.toFixed(2)}</b></button>)}</div></article>)}</>}
 </section>;
}
