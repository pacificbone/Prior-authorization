import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyStaffAccess} from '../server/access.mjs';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const pub=await crypto.subtle.exportKey('jwk',pair.publicKey);
const kid='synthetic-access-key';
const certs={keys:[{kid,kty:'RSA',alg:'RS256',n:pub.n,e:pub.e}]};
const now=Date.parse('2026-11-07T12:00:00Z'),seconds=now/1000;
const config={ACCESS_TEAM_DOMAIN:'claims-hardening.cloudflareaccess.com',ACCESS_AUD:'synthetic-app-audience'};
const base={sub:'synthetic-user',email:'staff@sample.invalid',iss:'https://'+config.ACCESS_TEAM_DOMAIN,aud:[config.ACCESS_AUD],iat:seconds-60,nbf:seconds-60,exp:seconds+3600};
const b64=value=>Buffer.from(typeof value==='string'?value:value).toString('base64url');
async function token(claims=base,head={alg:'RS256',kid},key=pair.privateKey){
 const h=b64(JSON.stringify(head)),b=b64(JSON.stringify(claims));
 const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(h+'.'+b));return h+'.'+b+'.'+b64(new Uint8Array(sig));
}
const req=t=>new Request('https://app.example/api/staff/rates',{headers:{'Cf-Access-Jwt-Assertion':t,'Cf-Access-Authenticated-User-Email':'spoof@attacker.invalid'}});
const verify=async(claims=base,head)=>verifyStaffAccess(req(await token(claims,head)),config,{now,fetcher:async()=>Response.json(certs)});
test('signed subject, strict NumericDate values and configured audience/issuer establish only staff identity',async()=>{
 const r=await verify();assert.equal(r.verified,true);assert.equal(r.subject,'synthetic-user');assert.equal(r.email,'staff@sample.invalid');assert.equal(r.patientDataEnabled,undefined);
});
for(const patch of [{iat:'yesterday'},{iat:String(seconds-60)},{iat:seconds+61},{iat:seconds+.5},{iat:0},{exp:String(seconds+3600)},{exp:seconds},{exp:seconds+.5},{iat:seconds+60,exp:seconds+30},{nbf:'not-a-date'},{nbf:String(seconds)},{nbf:seconds+61},{nbf:seconds+.5},{nbf:-1},{sub:''},{sub:undefined},{sub:123},{email:'spaces not-allowed@example.com'},{aud:['wrong-audience']},{iss:'https://other.cloudflareaccess.com'}])test('signed malformed/unusable Access claims fail closed: '+JSON.stringify(patch),async()=>{
 const r=await verify({...base,...patch});assert.equal(r.verified,false);assert.equal(r.email,undefined);assert.equal(r.subject,undefined);
});
for(const patch of [{alg:'none'},{alg:'HS256'},{crit:['unsupported']},{crit:'unsupported'},{b64:false},{kid:42}])test('unsupported JOSE header fails closed: '+JSON.stringify(patch),async()=>{
 assert.equal((await verify(base,{alg:'RS256',kid,...patch})).verified,false);
});
test('token-supplied key URLs are ignored; issuer key fetch has timeout and refuses redirects',async()=>{
 const seen=[];const r=await verifyStaffAccess(req(await token(base,{alg:'RS256',kid,jku:'https://attacker.invalid/keys'})),config,{now,fetcher:async(url,options)=>{
  seen.push(url);assert.equal(options.redirect,'error');assert.ok(options.signal instanceof AbortSignal);return Response.json(certs);
 }});
 assert.equal(r.verified,true);
 // Key may already be cached; if fetched, only the configured issuer is allowed.
 assert.ok(seen.every(u=>u==='https://'+config.ACCESS_TEAM_DOMAIN+'/cdn-cgi/access/certs'));
});
for(const [name,data] of [['duplicate',{keys:[...certs.keys,...certs.keys]}],['oversized',{keys:certs.keys,padding:'x'.repeat(140000)}],['too-many',{keys:Array(33).fill(certs.keys[0])}],['empty',{keys:[]}]])test('ambiguous/unbounded issuer key data is rejected: '+name,async()=>{
 const cfg={...config,ACCESS_TEAM_DOMAIN:'keys-'+name+'.cloudflareaccess.com'};
 const r=await verifyStaffAccess(req(await token({...base,iss:'https://'+cfg.ACCESS_TEAM_DOMAIN})),cfg,{now,fetcher:async()=>Response.json(data)});
 assert.equal(r.verified,false);
});
test('forged signature and a valid JWT for another application never yield identity',async()=>{
 const bad=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 assert.equal((await verifyStaffAccess(req(await token(base,undefined,bad.privateKey)),config,{now,fetcher:async()=>Response.json(certs)})).verified,false);
 assert.equal((await verify({...base,aud:['other-app']})).verified,false);
});
