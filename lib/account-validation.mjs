export function isSameOrigin(request){
 const value=request.headers.get('origin');if(!value)return false;
 try{
  const origin=new URL(value),target=new URL(request.url);
  if(origin.username||origin.password||!['https:','http:'].includes(origin.protocol))return false;
  if(origin.origin===target.origin)return true;
  const host=request.headers.get('host');
  const local=['localhost','127.0.0.1','[::1]'].includes(origin.hostname);
  return origin.host===host&&(origin.protocol==='https:'||local);
 }catch{return false}
}

