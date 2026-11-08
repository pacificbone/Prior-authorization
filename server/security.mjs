export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'",
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options':'DENY',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Cache-Control':'no-store'
};
export function secureResponse(response,url) {
  const headers=new Headers(response.headers);
  for(const [k,v] of Object.entries(SECURITY_HEADERS)) headers.set(k,v);
  if(new URL(url).protocol==='https:') headers.set('Strict-Transport-Security','max-age=31536000');
  return new Response(response.body,{status:response.status,headers});
}
export function json(data,status=200) {return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});}
export async function readBoundedJson(request,limit=2048) {
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('Use application/json.');
  if(Number(request.headers.get('content-length')||0)>limit) throw new Error('Request too large.');
  const reader=request.body?.getReader();
  if(!reader) throw new Error('Empty request.');
  let size=0;const chunks=[];
  try {
    while(true) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new Error('Request too large.');}chunks.push(value);}
  } finally {reader.releaseLock();}
  const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}
  return JSON.parse(new TextDecoder().decode(all));
}
export async function tokenMatches(supplied,expected) {
  if(typeof expected!=='string'||expected.length<32||typeof supplied!=='string'||supplied.length>1000) return false;
  const enc=new TextEncoder();
  const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(supplied)),crypto.subtle.digest('SHA-256',enc.encode(expected))]);
  const x=new Uint8Array(a),y=new Uint8Array(b);let d=0;for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0;
}

// Bound remote key material before parsing it; never include response text in errors.
export async function readBoundedResponseJson(response,limit=131072){
 if(Number(response.headers.get('content-length')||0)>limit)throw Error('Remote JSON too large');
 const reader=response.body?.getReader();
 if(!reader)throw Error('Missing remote JSON');
 let total=0;const chunks=[];
 try{
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;
   if(total>limit){await reader.cancel();throw Error('Remote JSON too large');}chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
