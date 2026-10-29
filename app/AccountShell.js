'use client';
import {useEffect,useState} from 'react';
export default function AccountShell({children,name}){
 const [theme,setTheme]=useState('dark');
 useEffect(()=>{try{const value=localStorage.getItem('pixbet-theme');if(value==='light'||value==='dark')setTheme(value)}catch{}},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme},[theme]);
 const toggle=()=>setTheme(old=>{const value=old==='dark'?'light':'dark';try{localStorage.setItem('pixbet-theme',value)}catch{}return value});
 return <><header className="header"><div className="header-inner"><a className="brand shell-brand" href="/tr/casino">pix<span>bet</span><i/></a><nav className="desktop-nav"><a href="/tr/casino">Casino</a><a href="/tr/sport">Spor</a></nav><div className="header-actions"><span className="demo-pill">DEMO</span><button className="icon-button" onClick={toggle} aria-label="Temayı değiştir">{theme==='dark'?'☀':'☾'}</button><a className="button secondary" href="/tr/account">{name||'Hesabım'}</a></div></div></header>{children}<nav className="account-mobile-nav"><a href="/tr/casino">◈ <span>Casino</span></a><a href="/tr/sport">◉ <span>Spor</span></a><a href="/tr/account">◎ <span>Hesabım</span></a></nav></>;
}

