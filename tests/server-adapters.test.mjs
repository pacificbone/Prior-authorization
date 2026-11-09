import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../server/worker.mjs';
import {handler} from '../server/lambda.mjs';
const failing={url:'https://app.example/api/formulary/search',method:'POST',headers:{get(){throw new Error('header store failure with private detail');}}};
test('worker returns a generic JSON 500 with security headers when either branch throws',async()=>{
 for(const [request,env] of [[new Request('https://app.example/'),{ASSETS:{fetch:async()=>{throw new Error('asset store private detail');}}}],[new Request('https://app.example/index.html'),{}],[failing,{}]]){
  const response=await worker.fetch(request,env);
  assert.equal(response.status,500);
  assert.deepEqual(await response.json(),{error:'Request failed.'});
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
  assert.equal(response.headers.get('Strict-Transport-Security'),'max-age=31536000');
 }
});
test('worker still serves API and asset responses with security headers on the happy path',async()=>{
 const status=await worker.fetch(new Request('https://app.example/api/status'),{});
 assert.equal(status.status,200);assert.equal((await status.json()).phiRelease,'blocked');
 const asset=await worker.fetch(new Request('https://app.example/'),{ASSETS:{fetch:async()=>new Response('<!doctype html>',{headers:{'Content-Type':'text/html'}})}});
 assert.equal(asset.status,200);assert.equal(asset.headers.get('X-Frame-Options'),'DENY');
});
test('lambda early refusals and unexpected failures use the JSON and security-header contract',async()=>{
 const saved=process.env.APP_ORIGIN;
 try{
  delete process.env.APP_ORIGIN;
  const unauth=await handler({rawPath:'/api/status',requestContext:{http:{method:'GET'}}});
  assert.equal(unauth.statusCode,401);assert.deepEqual(JSON.parse(unauth.body),{error:'Authentication required.'});
  assert.equal(unauth.headers['content-type'],'application/json; charset=utf-8');
  assert.match(unauth.headers['content-security-policy'],/frame-ancestors 'none'/);
  assert.equal(unauth.headers['cache-control'],'no-store');assert.equal(unauth.isBase64Encoded,false);
  const authed={rawPath:'/api/status',requestContext:{http:{method:'GET'},authorizer:{jwt:{claims:{sub:'synthetic-staff'}}}}};
  const noOrigin=await handler(authed);
  assert.equal(noOrigin.statusCode,503);assert.deepEqual(JSON.parse(noOrigin.body),{error:'Origin configuration required.'});
  assert.match(noOrigin.headers['content-security-policy'],/default-src 'self'/);
  process.env.APP_ORIGIN='https://app.example';
  const ok=await handler(authed);
  assert.equal(ok.statusCode,200);assert.equal(JSON.parse(ok.body).phiRelease,'blocked');assert.equal(ok.headers['strict-transport-security'],'max-age=31536000');
  const broken=await handler({...authed,requestContext:{...authed.requestContext,http:null}});
  assert.equal(broken.statusCode,500);assert.deepEqual(JSON.parse(broken.body),{error:'Request failed.'});
  assert.equal(broken.headers['x-content-type-options'],'nosniff');
 }finally{if(saved===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=saved;}
});
