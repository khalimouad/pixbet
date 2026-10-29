'use client';
import {useState} from 'react';
const errors={invalid_credentials:'E-posta adresi veya şifre hatalı.',email_not_confirmed:'Giriş yapmadan önce e-posta adresinizi doğrulayın.',invalid_registration:'Kullanıcı adınızı, şifrenizi ve yaş onayınızı kontrol edin.',rate_limited:'Çok fazla istek gönderildi. Birkaç dakika bekleyin.',signup_failed:'Kayıt tamamlanamadı. Bilgilerinizi kontrol edip yeniden deneyin.',auth_unavailable:'Giriş hizmeti şu anda kullanılamıyor.'};
export default function AuthForm({next,initialMode,configured,confirmationError}){
 const [mode,setMode]=useState(initialMode),[busy,setBusy]=useState(false),[message,setMessage]=useState(confirmationError?'Doğrulama bağlantısının süresi dolmuş veya başka bir tarayıcıda açılmış. Kayıt olduğunuz tarayıcıdan yeniden deneyin.':''),[success,setSuccess]=useState(false);
 async function submit(event){
  event.preventDefault();if(busy)return;setBusy(true);setMessage('');setSuccess(false);
  const form=new FormData(event.currentTarget);
  try{
   const response=await fetch('/api/account/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:mode,email:form.get('email'),password:form.get('password'),name:form.get('name'),adult:form.get('adult')==='on',next})});
   const data=await response.json();
   if(!response.ok)throw new Error(errors[data.error]||'İstek tamamlanamadı. Lütfen daha sonra tekrar deneyin.');
   if(data.confirmationRequired){setSuccess(true);setMessage('E-postanızı kontrol edip adresinizi doğrulayın, ardından giriş yapın. Bağlantıyı bu tarayıcıda açın.');return}
   window.location.assign(data.next||next);
  }catch(error){setMessage(error.message||'İstek tamamlanamadı.')}finally{setBusy(false)}
 }
 return <section className="auth-card"><div className="auth-tabs"><button disabled={busy} className={mode==='signin'?'active':''} onClick={()=>{setMode('signin');setMessage('')}}>Giriş yap</button><button disabled={busy} className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');setMessage('')}}>Hesap oluştur</button></div><h2>{mode==='signin'?'Tekrar hoş geldiniz.':'Pixbet’e hoş geldiniz.'}</h2><p>{mode==='signin'?'Oyunlara erişmek için giriş yapın.':'Oyunları keşfetmek için hesabınızı oluşturun.'}</p>{!configured&&<p className="form-message" role="status">Hesaplar henüz kullanıma açılmadı. Kayıt için yakında tekrar gelin.</p>}<form onSubmit={submit}>{mode==='signup'&&<label className="field">Kullanıcı adı<input name="name" required minLength={2} maxLength={40} autoComplete="nickname" placeholder="Kullanıcı adınız"/></label>}<label className="field">E-posta adresi<input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="siz@ornek.com"/></label><label className="field">Şifre<input name="password" type="password" required minLength={mode==='signup'?10:1} maxLength={128} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder={mode==='signup'?'En az 10 karakter':'Şifreniz'}/></label>{mode==='signup'&&<label className="adult-check"><input type="checkbox" name="adult" required/>18 yaşında veya daha büyüğüm.</label>}<button className="button primary full" disabled={busy||!configured}>{busy?'Lütfen bekleyin…':mode==='signin'?'Giriş yap':'Hesabımı oluştur'}</button>{message&&<p className={'form-message '+(success?'success':'')} role={success?'status':'alert'}>{message}</p>}</form><small>Demo modu · Gerçek para yatırma veya kazanç yok.</small></section>;
}

