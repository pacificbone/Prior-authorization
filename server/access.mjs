import {readBoundedResponseJson} from './security.mjs';
// Cloudflare Access JWT verification for staff-only pricing data. This
// runtime module is never copied to public/dist/ and accepts NO identity
// asserted by a mere client header. Missing Access settings fail closed.
const cache=new Map();
const TTL=60*60*1000;
const teamPattern=/^[a-z0-9-]{1,100}\.cloudflareaccess\.com$/i;
function fromB64url(s){
 if(!/^[A-Za-z0-9_-]+$/.test(s))throw Error('Invalid Access token encoding');
 const input=s.replace(/-/g,'+').replace(/_/g,'/');
 const raw=atob(input+'='.repeat((4-input.length%4)%4));
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function jwtJson(s){
 return JSON.parse(new TextDecoder().decode(fromB64url(s)));
}
async function keys(team,fetcher,now,refresh=false){
 const c=cache.get(team);
 if(!refresh&&c&&c.expires>now)return c.keys;
 const response=await fetcher('https://'+team+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('Cloudflare Access keys are unavailable');
 const body=await readBoundedResponseJson(response);
 if(!Array.isArray(body.keys)||body.keys.length>32)throw Error('Invalid Cloudflare Access certificate response');
 const found=new Map();
 for(const k of body.keys){
   if(k.kty!=='RSA'||k.alg&&k.alg!=='RS256'||typeof k.kid!=='string'||!k.kid.trim()||k.kid.length>200||!k.n||!k.e)continue;
   if(found.has(k.kid))throw Error('Ambiguous Access key identifier');
   const key=await crypto.subtle.importKey('jwk',
     {kty:'RSA',n:k.n,e:k.e,alg:'RS256',ext:true},
     {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
   found.set(k.kid,key);
 }
 if(!found.size)throw Error('No usable Cloudflare Access verification keys');
 cache.set(team,{expires:now+TTL,keys:found});
 return found;
}
export async function verifyStaffAccess(request,env,{fetcher=fetch,now=Date.now()}={}){
 const team=env.ACCESS_TEAM_DOMAIN,aud=env.ACCESS_AUD;
 if(typeof team!=='string'||!teamPattern.test(team)||
    typeof aud!=='string'||aud.length<8||aud.length>220)
   return {verified:false,reason:'Access is not configured for staff pricing.',configured:false};
 const header=request.headers.get('Cf-Access-Jwt-Assertion');
 // A bare email header or unsignable cookie MUST never authorize rate access.
 const cookie=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1];
 const token=header||cookie;
 if(!token||token.length>12000)return {verified:false,reason:'Verified staff Access session required.',configured:true};
 const parts=token.split('.');
 if(parts.length!==3)return {verified:false,reason:'Malformed staff Access session.',configured:true};
 try{
   const head=jwtJson(parts[0]),claims=jwtJson(parts[1]);
   if(head.alg!=='RS256'||typeof head.kid!=='string'||!head.kid||head.b64!==undefined||head.crit!==undefined&&(!Array.isArray(head.crit)||head.crit.length))throw Error('Invalid token signing algorithm');
   const nowSeconds=Math.floor(now/1000);
   if(!Number.isSafeInteger(claims.exp)||claims.exp<=nowSeconds||
      !Number.isSafeInteger(claims.iat)||claims.iat<=0||claims.iat>nowSeconds+60||claims.iat>=claims.exp||
      claims.nbf!==undefined&&(!Number.isSafeInteger(claims.nbf)||claims.nbf<0||claims.nbf>nowSeconds+60||claims.nbf>=claims.exp))throw Error('Access token expired or not yet valid');
   if(claims.iss!=='https://'+team)throw Error('Access issuer mismatch');
   const audiences=Array.isArray(claims.aud)?claims.aud:[claims.aud];
   if(!audiences.includes(aud))throw Error('Access audience mismatch');
   if(typeof claims.sub!=='string'||!claims.sub.trim()||claims.sub.length>255||
      typeof claims.email!=='string'||!/^\S+@\S+\.\S+$/.test(claims.email)||claims.email.length>254)
     throw Error('Staff identity unavailable');
   const validKeys=await keys(team,fetcher,now);
   let key=validKeys.get(head.kid);
   if(!key)key=(await keys(team,fetcher,now,true)).get(head.kid);
   if(!key)throw Error('Unknown Access signing key');
   const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,fromB64url(parts[2]),
     new TextEncoder().encode(parts[0]+'.'+parts[1]));
   if(!ok)throw Error('Invalid Access signature');
   return {verified:true,email:claims.email,subject:claims.sub,configured:true};
 }catch{
   return {verified:false,reason:'Staff Access JWT verification failed.',configured:true};
 }
}
