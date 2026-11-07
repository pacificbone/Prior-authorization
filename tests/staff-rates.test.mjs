import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyStaffAccess} from '../server/access.mjs';
import {validateStaffRateRequest,createStaffRateBridge} from '../server/pricing.mjs';
import {createApi} from '../server/api.mjs';
import {renderStaffPage} from '../public/staff-page.mjs';
import {newCostCase} from '../shared/patient-cost.mjs';

const scoped={payer:'HMSA',planId:'hmsa-select-choice',year:2026,
 serviceId:'total-knee',benefit:'Medical',facilityId:'queens-honolulu',
 setting:'Hospital outpatient',code:'27447'};
const makeReq=(body=scoped,origin='https://app.example',headers={})=>new Request('https://app.example/api/staff/rates',{
 method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},
 body:JSON.stringify(body)
});
const signedIn=async()=>({configured:true,verified:true,email:'staff@sample.invalid'});
const key='synthetic-bridge-secret-long-enough-for-tests';
const reply=(input)=>({
 status:'public-rate-evidence-only',patientQuoteReady:false,applyAutomatically:false,
 request:input,builtAt:'2026-11-07T12:00:00Z',
 facilityMatches:1,facilityTruncated:false,
 facility:[{facilityId:input.facilityId,code:input.code,setting:'outpatient',
  payerLabel:'HMSA — PPO',amount:11000,percent:null,medianAllowed:null,
  methodology:'fee schedule',billingClassVerified:true,sourceUpdated:'2026-11-01'}],
 professional:[{payer:'HMSA',planLabel:'HMSA PPO',code:input.code,setting:'Facility',
   minimum:1000,median:1200,maximum:1400,observationCount:12}],
 warnings:['Not your contracted rate']
});

test('staff rate requests require an exact payer-owned plan, procedure code and facility and reject PHI',()=>{
 assert.equal(validateStaffRateRequest(scoped).code,'27447');
 for(const v of [
  {...scoped,patientName:'Synthetic Smith'},
  {...scoped,memberId:'12341234'},
  {...scoped,payer:'UnitedHealthcare'},
  {...scoped,planId:'va'},
  {...scoped,code:'27130'},
  {...scoped,code:'1234567890'},
  {...scoped,serviceId:'total-hip'},
  {...scoped,facilityId:'invision'},
  {...scoped,setting:'Hospital inpatient'},
  {...scoped,benefit:'Pharmacy'}
 ])assert.throws(()=>validateStaffRateRequest(v));
 const drg=validateStaffRateRequest({...scoped,code:'DRG 470',setting:'Hospital inpatient'});
 assert.equal(drg.code,'DRG 470');
 assert.equal(drg.planPrecision,'plan-family');
});
test('a valid staff request remains unavailable without configured Access or a private Cuptomize binding',async()=>{
 const handler=createStaffRateBridge({verify:async()=>({verified:false,configured:false})});
 const noAccess=await handler(makeReq(),{});
 assert.equal(noAccess.status,503);
 const deny=await createStaffRateBridge({verify:async()=>({verified:false,configured:true})})(makeReq(),{});
 assert.equal(deny.status,403);
 const noBridge=await createStaffRateBridge({verify:signedIn})(makeReq(),{});
 assert.equal(noBridge.status,503);
});
test('only signed-in staff query and a server-only binding token reach Cuptomize; member data never leaves',async()=>{
 const seen=[];
 const env={
   ACCESS_TEAM_DOMAIN:'pbj.cloudflareaccess.com',ACCESS_AUD:'fake-audience-from-test',
   CUP_PRICE_BRIDGE_TOKEN:key,
   CUP_PRICE_SERVICE:{
     fetch:async(request)=>{
       const json=await request.json();
       seen.push({url:request.url,headers:Object.fromEntries(request.headers),payload:json});
       return Response.json(reply(json));
     }
   }
 };
 const r=await createStaffRateBridge({verify:signedIn})(makeReq(),env);
 assert.equal(r.status,200);
 const data=await r.json();
 assert.equal(data.patientQuoteReady,false);
 assert.equal(data.applyAutomatically,false);
 assert.equal(data.exactMemberPlanVerified,false);
 assert.equal(data.planScope,'Select / Choice commercial formulary');
 assert.equal(seen.length,1);
 assert.deepEqual(Object.keys(seen[0].payload).sort(),['code','facilityId','payer','setting','year']);
 assert.equal(seen[0].headers['x-pbj-staff-bridge'],key);
 assert.equal(seen[0].url,'https://cup-optimize.internal/api/staff-pricing/evidence');
 assert.equal(JSON.stringify(data).includes(key),false);
 const bad=await createStaffRateBridge({verify:signedIn})(makeReq({...scoped,note:'Real patient note not allowed'}),env);
 assert.equal(bad.status,400);
 assert.equal(seen.length,1);
 const cross=await createStaffRateBridge({verify:signedIn})(makeReq(scoped,'https://evil.example'),env);
 assert.equal(cross.status,403);
});
test('incorrect service response cannot be laundered into patient price',async()=>{
 const env={CUP_PRICE_BRIDGE_TOKEN:key,CUP_PRICE_SERVICE:{
    fetch:async()=>Response.json({...reply(scoped),request:{...scoped,payer:'UnitedHealthcare'}})
 }};
 const r=await createStaffRateBridge({verify:signedIn})(makeReq(),env);
 assert.equal(r.status,503);
});
test('the public API exposes no rate data when Access is missing',async()=>{
 const response=await createApi()(makeReq(),{});
 assert.equal(response.status,503);
 const r=await response.json();
 assert.match(r.error,/Cloudflare Access/);
});
test('staff page exposes a lookup, but displays no rate before authenticated query',()=>{
 const html=renderStaffPage({
  payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'total-knee',
  benefit:'Medical',setting:'Hospital outpatient',requestType:'Initial',
  gelProductId:'',guidance:'without-ultrasound',docs:{},search:'',
  cost:newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial',setting:'Hospital outpatient'}),
  lookup:{sourceId:null,term:'',busy:false,result:null,error:''}
 });
 assert.match(html,/not a patient quote/);
});
test('Cloudflare Access verification fails closed and only accepts signed identity from JWT claims',async()=>{
 const u='https://app.example/api/staff/rates';
 assert.equal((await verifyStaffAccess(new Request(u),{})).verified,false);
 const config={ACCESS_TEAM_DOMAIN:'pbjtest.cloudflareaccess.com',ACCESS_AUD:'audience-123'};
 assert.equal((await verifyStaffAccess(new Request(u,{headers:{'Cf-Access-Authenticated-User-Email':'spoof@example.com'}}),config)).verified,false);
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,
   publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);
 const kid='test-key-unique';
 const certs={keys:[{kid,kty:'RSA',alg:'RS256',n:jwk.n,e:jwk.e}]};
 const b64=x=>btoa(String.fromCharCode(...(typeof x==='string'?new TextEncoder().encode(x):new Uint8Array(x))))
   .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const now=Date.parse('2026-11-07T12:00:00Z');
 const claims={aud:[config.ACCESS_AUD],iss:'https://'+config.ACCESS_TEAM_DOMAIN,
   email:'true-staff@example.com',exp:Math.floor(now/1000)+3600,iat:Math.floor(now/1000)-50};
 const head=b64(JSON.stringify({alg:'RS256',kid}));
 const body=b64(JSON.stringify(claims));
 const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(head+'.'+body));
 const token=head+'.'+body+'.'+b64(sig);
 const f=async()=>Response.json(certs);
 const verified=await verifyStaffAccess(new Request(u,{headers:{'Cf-Access-Jwt-Assertion':token,
   'Cf-Access-Authenticated-User-Email':'spoof@example.com'}}),config,{fetcher:f,now});
 assert.equal(verified.verified,true);
 assert.equal(verified.email,'true-staff@example.com');
 assert.equal((await verifyStaffAccess(new Request(u,{headers:{'Cf-Access-Jwt-Assertion':token}}),
   {...config,ACCESS_AUD:'wrong-audience'},{fetcher:f,now})).verified,false);
});
