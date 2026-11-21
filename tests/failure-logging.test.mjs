import test from 'node:test';
import assert from 'node:assert/strict';
import {logFailure,logRoute} from '../server/security.mjs';
import {createWorker} from '../server/worker.mjs';
import {createApi} from '../server/api.mjs';
import {createStaffRateBridge} from '../server/pricing.mjs';
import {handler} from '../server/lambda.mjs';
const SECRET='Synthetic-Private-Detail-7731';
// Collects console.error lines for one block; every line must be a metadata-only JSON record.
async function captured(fn){
 const lines=[],original=console.error;console.error=(...args)=>lines.push(args.map(String).join(' '));
 try{await fn();}finally{console.error=original;}
 for(const line of lines){
  assert.doesNotMatch(line,new RegExp(SECRET,'i'));assert.doesNotMatch(line,/[?&=]|drug|token|authorization|cookie|staff@/i);
  const record=JSON.parse(line);assert.deepEqual(Object.keys(record),['event','route','status','error']);assert.equal(record.event,'request_failed');
 }
 return lines.map(line=>JSON.parse(line));
}
const secretError=(name='Error')=>Object.assign(new Error('message '+SECRET+' with drug=evenity'),{name});

test('logFailure writes only the event, a fixed route, the status and the error class name',async()=>{
 const records=await captured(()=>{
  logFailure('/api/formulary/search?drug='+SECRET,503,secretError('TimeoutError'));
  logFailure('https://app.example/api/ai/extract?token='+SECRET+'#'+SECRET,502,secretError());
  logFailure('/api/patients/'+SECRET,500,secretError('TypeError'));
  logFailure('/'+SECRET+'.html',500,{name:'Bad name with '+SECRET,message:SECRET});
  logFailure(undefined,500,undefined);logFailure({toString(){return SECRET;}},'500',null);
 });
 assert.deepEqual(records,[
  {event:'request_failed',route:'/api/formulary/search',status:503,error:'TimeoutError'},
  {event:'request_failed',route:'/api/ai/extract',status:502,error:'Error'},
  {event:'request_failed',route:'/api/other',status:500,error:'TypeError'},
  {event:'request_failed',route:'/other',status:500,error:'Error'},
  {event:'request_failed',route:'/other',status:500,error:'Error'},
  {event:'request_failed',route:'/other',status:0,error:'Error'}]);
 for(const route of ['/','/index.html','/version.json','/api/status','/api/staff/rates','/api/formulary/search','/api/ai/extract'])assert.equal(logRoute(route+'?q='+SECRET),route);
});
test('the Worker catch logs metadata only and still answers the generic JSON 500',async()=>{
 let response;
 const records=await captured(async()=>{
  const failingAssets={REQUIRE_ACCESS:'false',ASSETS:{fetch:async()=>{throw secretError('TypeError');}}};
  response=await createWorker().fetch(new Request('https://app.example/index.html?name='+SECRET),failingAssets);
  await createWorker({api:async()=>{throw secretError('RangeError');}}).fetch(new Request('https://app.example/api/formulary/search?drug='+SECRET,{headers:{Authorization:'Bearer '+SECRET}}),{REQUIRE_ACCESS:'false'});
 });
 assert.equal(response.status,500);assert.deepEqual(await response.json(),{error:'Request failed.'});
 assert.deepEqual(records,[{event:'request_failed',route:'/index.html',status:500,error:'TypeError'},{event:'request_failed',route:'/api/formulary/search',status:500,error:'RangeError'}]);
});
test('formulary, AI and pricing failures log the route and status, never the upstream message or the search term',async()=>{
 const headers={'Content-Type':'application/json',Origin:'https://app.example'};
 const records=await captured(async()=>{
  const formulary=await createApi({fetcher:async()=>{throw secretError('TimeoutError');}})(new Request('https://app.example/api/formulary/search?drug='+SECRET,{method:'POST',headers,body:JSON.stringify({source:'hmsa-quest-2026-11',drug:'evenity'})}),{});
  assert.equal(formulary.status,503);
  const token='synthetic-test-token-01234567890123456789';
  const ai=await createApi({fetcher:async()=>new Response(SECRET,{status:500})})(new Request('https://app.example/api/ai/extract',{method:'POST',headers:{...headers,'X-Trial-Token':token},body:JSON.stringify({sampleId:'osteoporosis-evenity',policyId:'uhc-evenity-2026-11'})}),
   {LEGACY_TOOLS:'on',AI_PROVIDER:'openai',AI_MODEL:'test-model',OPENAI_API_KEY:SECRET,AI_TRIAL_ENABLED:'true',TRIAL_ACCESS_TOKEN:token});
  assert.equal(ai.status,502);
  const bridge=createStaffRateBridge({verify:async()=>({configured:true,verified:true,email:'staff@sample.invalid'})});
  const rates=await bridge(new Request('https://app.example/api/staff/rates',{method:'POST',headers,body:JSON.stringify({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'total-knee',benefit:'Medical',facilityId:'queens-honolulu',setting:'Hospital outpatient',code:'27447'})}),
   {CUP_PRICE_BRIDGE_TOKEN:'synthetic-bridge-secret-long-enough-for-tests',CUP_PRICE_SERVICE:{fetch:async()=>new Response('{"status":"'+SECRET+'"}')}});
  assert.equal(rates.status,503);
 });
 const routes=records.map(r=>r.route+' '+r.status);
 assert.ok(routes.includes('/api/formulary/search 503'));assert.ok(routes.includes('/api/ai/extract 502'));assert.ok(routes.includes('/api/staff/rates 503'));
 assert.ok(records.every(r=>r.error==='Error'||r.error==='TimeoutError'||r.error==='SyntaxError'));
});
test('the Lambda catch logs metadata only',async()=>{
 const saved=process.env.APP_ORIGIN;process.env.APP_ORIGIN='https://app.example';
 try{
  const records=await captured(async()=>{
   const r=await handler({rawPath:'/api/status',rawQueryString:'drug='+SECRET,requestContext:{http:null,authorizer:{jwt:{claims:{sub:'synthetic-staff'}}}}});
   assert.equal(r.statusCode,500);
  });
  assert.deepEqual(records,[{event:'request_failed',route:'/api/status',status:500,error:'TypeError'}]);
 }finally{if(saved===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=saved;}
});
