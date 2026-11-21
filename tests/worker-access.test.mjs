import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{createWorker,accessGate,GATE_HEADER} from '../server/worker.mjs';
import {verifyStaffAccess} from '../server/access.mjs';
// Tokens are dated from the (possibly shifted) clock, so the suite never depends on today's date.
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const rogue=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const pub=await crypto.subtle.exportKey('jwk',pair.publicKey);
const kid='worker-gate-key';
const certs={keys:[{kid,kty:'RSA',alg:'RS256',n:pub.n,e:pub.e}]};
const config={ACCESS_TEAM_DOMAIN:'worker-gate.cloudflareaccess.com',ACCESS_AUD:'synthetic-worker-audience'};
const b64=v=>Buffer.from(v).toString('base64url');
async function token({key=pair.privateKey,...patch}={}){
 const s=Math.floor(Date.now()/1000);
 const claims={sub:'synthetic-staff',email:'staff@sample.invalid',iss:'https://'+config.ACCESS_TEAM_DOMAIN,aud:[config.ACCESS_AUD],iat:s-60,exp:s+3600,...patch};
 const h=b64(JSON.stringify({alg:'RS256',kid})),b=b64(JSON.stringify(claims));
 return h+'.'+b+'.'+b64(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(h+'.'+b))));
}
let certFetches=0;
const verify=(request,env)=>verifyStaffAccess(request,env,{fetcher:async url=>{certFetches++;assert.equal(url,'https://'+config.ACCESS_TEAM_DOMAIN+'/cdn-cgi/access/certs');return Response.json(certs);}});
const gated=createWorker({verify});
function assets(){const seen=[];return {seen,ASSETS:{fetch:async request=>{seen.push(new URL(request.url).pathname);return new Response('<!doctype html><title>Coverage Desk</title>',{headers:{'Content-Type':'text/html'}});}}};}
const get=(path,headers={})=>new Request('https://app.example'+path,{headers});
const assertJsonRefusal=async(response,status)=>{
 assert.equal(response.status,status);assert.equal(response.headers.get('Content-Type'),'application/json; charset=utf-8');
 assert.equal(response.headers.get('Cache-Control'),'no-store');assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
 assert.equal(response.headers.get('Strict-Transport-Security'),'max-age=31536000');
 const body=await response.json();assert.deepEqual(Object.keys(body),['error']);assert.doesNotMatch(body.error,/ACCESS_|REQUIRE_|synthetic-worker-audience|worker-gate/);
};

test('only an explicit REQUIRE_ACCESS "false" (wrangler dev, tests) serves assets and API without a token',async()=>{
 for(const flag of ['false']){
  const env=assets();env.REQUIRE_ACCESS=flag;
  let called=0;const w=createWorker({verify:async()=>{called++;return {verified:false,configured:false};}});
  assert.equal(accessGate(env),'off');
  const page=await w.fetch(get('/'),env);assert.equal(page.status,200);assert.equal(page.headers.get('X-Frame-Options'),'DENY');
  const status=await w.fetch(get('/api/status'),env);assert.equal(status.status,200);assert.equal((await status.json()).accessRequired,false);
  assert.equal(called,0);assert.deepEqual(env.seen,['/']);
 }
});
test('REQUIRE_ACCESS "true" without the Access team domain and audience answers 503 and never serves',async()=>{
 for(const missing of [{},{ACCESS_TEAM_DOMAIN:config.ACCESS_TEAM_DOMAIN},{ACCESS_AUD:config.ACCESS_AUD},{ACCESS_TEAM_DOMAIN:'not-an-access-domain.example',ACCESS_AUD:config.ACCESS_AUD}]){
  const env={...assets(),...missing,REQUIRE_ACCESS:'true'};
  let called=0;const w=createWorker({verify:async()=>{called++;return {verified:true,configured:true};}});
  assert.equal(accessGate(env),'misconfigured');
  for(const path of ['/','/index.html','/version.json','/api/status','/api/staff/rates'])await assertJsonRefusal(await w.fetch(get(path,{'Cf-Access-Jwt-Assertion':await token()}),env),503);
  assert.equal(called,0);assert.deepEqual(env.seen,[]);
 }
});
test('REQUIRE_ACCESS unset or empty (a dropped var, an env stanza without vars) fails closed: 503 marked as a gate reply, nothing served',async()=>{
 for(const flag of [undefined,'']){
  const env=assets();if(flag!==undefined)env.REQUIRE_ACCESS=flag;
  let called=0;const w=createWorker({verify:async()=>{called++;return {verified:true,configured:true};}});
  assert.equal(accessGate(env),'misconfigured');
  for(const path of ['/','/index.html','/version.json','/api/status','/api/staff/rates']){
   const response=await w.fetch(get(path),env);await assertJsonRefusal(response,503);assert.equal(response.headers.get(GATE_HEADER),'access');
  }
  assert.equal(called,0);assert.deepEqual(env.seen,[]);
 }
 // The Worker's default export behaves the same way with no env at all.
 await assertJsonRefusal(await worker.fetch(get('/'),{}),503);
});
test('any REQUIRE_ACCESS value other than "false" or "true" is a misconfiguration: 503, nothing served',async()=>{
 for(const flag of ['TRUE','True','yes','1','on','false ',' true',true,1,null,false]){
  const env={...assets(),...config,REQUIRE_ACCESS:flag};
  assert.equal(accessGate(env),'misconfigured');
  await assertJsonRefusal(await gated.fetch(get('/',{'Cf-Access-Jwt-Assertion':await token()}),env),503);
  await assertJsonRefusal(await gated.fetch(get('/api/status',{'Cf-Access-Jwt-Assertion':await token()}),env),503);
  assert.deepEqual(env.seen,[]);
 }
});
test('REQUIRE_ACCESS "true" with Access configured refuses missing, malformed, forged, expired and wrong-audience tokens with 403',async()=>{
 const s=Math.floor(Date.now()/1000);
 const cases=[{},{'Cf-Access-Jwt-Assertion':'not-a-jwt'},{'Cf-Access-Jwt-Assertion':'a.b.c'},
  {'Cf-Access-Jwt-Assertion':await token({key:rogue.privateKey})},{'Cf-Access-Jwt-Assertion':await token({iat:s-7200,exp:s-60})},
  {'Cf-Access-Jwt-Assertion':await token({aud:['another-application']})},{'Cf-Access-Jwt-Assertion':await token({iss:'https://other.cloudflareaccess.com'})},
  {'Cf-Access-Authenticated-User-Email':'staff@sample.invalid'},{Cookie:'CF_Authorization=forged.cookie.value'}];
 for(const headers of cases)for(const path of ['/','/version.json','/api/status','/api/formulary/search']){
  const env={...assets(),...config,REQUIRE_ACCESS:'true'};
  await assertJsonRefusal(await gated.fetch(get(path,headers),env),403);
  assert.deepEqual(env.seen,[]);
 }
});
test('REQUIRE_ACCESS "true" with a valid Access JWT (header or CF_Authorization cookie) serves assets and API routes',async()=>{
 const env={...assets(),...config,REQUIRE_ACCESS:'true'};assert.equal(accessGate(env),'on');
 const jwt=await token();
 const page=await gated.fetch(get('/',{'Cf-Access-Jwt-Assertion':jwt}),env);
 assert.equal(page.status,200);assert.match(await page.text(),/Coverage Desk/);assert.equal(page.headers.get('X-Content-Type-Options'),'nosniff');
 const status=await gated.fetch(get('/api/status',{Cookie:'theme=light; CF_Authorization='+jwt}),env);
 assert.equal(status.status,200);const data=await status.json();
 assert.equal(data.accessRequired,true);assert.equal(data.accessConfigured,true);assert.equal(data.phiRelease,'blocked');
 assert.doesNotMatch(JSON.stringify(data),/worker-gate|synthetic-worker-audience/);
 const unknown=await gated.fetch(get('/api/patients',{'Cf-Access-Jwt-Assertion':jwt}),env);assert.equal(unknown.status,404);
 assert.deepEqual(env.seen,['/']);assert.ok(certFetches>=1);
});
test('the default export enforces the same gate without any test seam',async()=>{
 const env={...assets(),...config,REQUIRE_ACCESS:'true'};
 await assertJsonRefusal(await worker.fetch(get('/'),env),403);
 assert.equal((await worker.fetch(get('/'),env)).headers.get(GATE_HEADER),'access');
 await assertJsonRefusal(await worker.fetch(get('/'),{...assets(),REQUIRE_ACCESS:'true'}),503);
 await assertJsonRefusal(await worker.fetch(get('/'),{...assets(),...config,REQUIRE_ACCESS:'yes'}),503);
 assert.equal((await worker.fetch(get('/'),{...assets(),REQUIRE_ACCESS:'false'})).status,200);
 assert.equal((await worker.fetch(get('/'),assets())).status,503);
 assert.deepEqual(env.seen,[]);
});
