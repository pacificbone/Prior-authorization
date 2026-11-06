import test from 'node:test';
import assert from 'node:assert/strict';
import {sealWorkspace,openWorkspace} from '../shared/vault.mjs';
import {createApi} from '../server/api.mjs';
import {handler} from '../server/lambda.mjs';
import {samples} from '../shared/fixtures.mjs';
const token='synthetic-test-token-01234567890123456789';
const env={AI_PROVIDER:'openai',AI_MODEL:'test-model',OPENAI_API_KEY:'fake-key-for-mocked-transport',AI_TRIAL_ENABLED:'true',TRIAL_ACCESS_TOKEN:token};
const sample=samples['osteoporosis-evenity'];
const request=(payload,headers={},method='POST')=>new Request('https://app.example/api/ai/extract',{method,headers:{'Content-Type':'application/json','Origin':'https://app.example','X-Trial-Token':token,...headers},...(method==='POST'?{body:JSON.stringify(payload)}:{})});
const ids={sampleId:'osteoporosis-evenity',policyId:'uhc-evenity-2026-11'};
const result={evidence:[{criterionId:'diagnosis',status:'documented',quote:sample.evidence.diagnosis.quote}]};
test('encrypted workspace round-trip uses random salt/IV and never stores plaintext',async()=>{
  const data={version:1,case:{note:'Fictional sensitive-looking text only'}};
  const pass='a long test passphrase with words';
  const a=await sealWorkspace(data,pass),b=await sealWorkspace(data,pass);
  assert.notEqual(a.ciphertext,b.ciphertext);assert.notEqual(a.iv,b.iv);assert.notEqual(a.salt,b.salt);
  assert.ok(!JSON.stringify(a).includes(data.case.note));assert.deepEqual(await openWorkspace(a,pass),data);
  await assert.rejects(()=>openWorkspace(a,'wrong password that is long enough'));
  const tampered={...a,ciphertext:(a.ciphertext[0]==='A'?'B':'A')+a.ciphertext.slice(1)};
  await assert.rejects(()=>openWorkspace(tampered,pass));
  await assert.rejects(()=>sealWorkspace(data,'short'));
  await assert.rejects(()=>openWorkspace({...a,iterations:1},pass));
});
test('AI is disabled by default and patient-data mode stays false even with an env switch',async()=>{
  const api=createApi();assert.equal((await api(request(ids),{})).status,503);
  const response=await api(new Request('https://app.example/api/status'),{...env,PATIENT_DATA_ENABLED:'true'});
  const status=await response.json();assert.equal(status.patientDataEnabled,false);assert.equal(status.phiRelease,'blocked');
  assert.ok(!JSON.stringify(status).includes('fake-key'));
});
test('cross-origin, missing-token, wrong-token and oversized requests never call the provider',async()=>{
  let calls=0;const api=createApi({fetcher:async()=>{calls++;throw new Error('Must not call');}});
  assert.equal((await api(request(ids,{Origin:'https://other.example'}),env)).status,403);
  assert.equal((await api(request(ids,{'X-Trial-Token':''}),env)).status,401);
  assert.equal((await api(request(ids,{'X-Trial-Token':'wrong'}),env)).status,401);
  assert.equal((await api(request({...ids,padding:'x'.repeat(3000)}),env)).status,400);
  assert.equal(calls,0);
});
test('arbitrary notes, unknown sample IDs, prototype properties and mismatched policies are blocked',async()=>{
  let calls=0;const api=createApi({fetcher:async()=>{calls++;throw new Error('Must not call');}});
  for(const input of [{...ids,note:'Never send this arbitrary content'},{...ids,sampleId:'custom'},{...ids,sampleId:'__proto__'},{...ids,policyId:'uhc-denosumab-2026-10'}])assert.equal((await api(request(input),env)).status,400);
  assert.equal(calls,0);
});
test('OpenAI transport sends the fixed sample only, disables application storage and exposes no credentials',async()=>{
  let captured;
  const api=createApi({fetcher:async(url,init)=>{captured={url,body:JSON.parse(init.body)};return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]});}});
  const response=await api(request(ids),env);assert.equal(response.status,200);
  assert.equal(captured.url,'https://api.openai.com/v1/responses');assert.equal(captured.body.store,false);assert.equal(captured.body.background,false);assert.equal(captured.body.tools,undefined);
  assert.ok(captured.body.input.includes('SYNTHETIC TRAINING CASE'));
  const data=await response.json();assert.equal(data.synthetic,true);assert.equal(data.requiresClinicianReview,true);assert.ok(!JSON.stringify(data).includes(env.OPENAI_API_KEY));
  assert.equal(response.headers.get('Cache-Control'),'no-store');assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
});
test('fabricated AI evidence, provider failures and refusals fail closed without leaking response text',async()=>{
  for(const mock of [async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({evidence:[{criterionId:'diagnosis',status:'documented',quote:'Invented diagnosis not present in the record'}]})}]}]}),async()=>new Response('private provider error details',{status:500}),async()=>Response.json({status:'completed',output:[{content:[{type:'refusal',refusal:'No'}]}]})]){
    const response=await createApi({fetcher:mock})(request(ids),env);assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/private provider error|Invented diagnosis/);
  }
});
test('trial request rate is bounded per isolate',async()=>{
  const api=createApi({fetcher:async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]})});
  for(let i=0;i<5;i++)assert.equal((await api(request(ids),env)).status,200);
  assert.equal((await api(request(ids),env)).status,429);
});
test('Bedrock adapter validates extracted quotes through the same boundary',async()=>{
  let captured;
  const api=createApi({fetcher:async(url,init)=>{captured={url,headers:init.headers,body:JSON.parse(init.body)};return Response.json({stopReason:'end_turn',output:{message:{content:[{text:JSON.stringify(result)}]}}});}});
  const response=await api(request(ids),{...env,AI_PROVIDER:'bedrock',AI_MODEL:'test.model-v1:0',AWS_REGION:'us-west-2',AWS_ACCESS_KEY_ID:'FAKEACCESSKEY',AWS_SECRET_ACCESS_KEY:'fake secret',AWS_SESSION_TOKEN:'fake session'});
  assert.equal(response.status,200);assert.match(captured.url,/^https:\/\/bedrock-runtime.us-west-2.amazonaws.com\/model\/test.model-v1%3A0\/converse$/);assert.match(captured.headers.authorization,/AWS4-HMAC-SHA256/);assert.equal(captured.headers['x-amz-security-token'],'fake session');assert.equal(captured.body.messages.length,1);
});
test('AWS adapter refuses requests without a verified gateway identity',async()=>{
  assert.equal((await handler({rawPath:'/api/status',requestContext:{http:{method:'GET'}}})).statusCode,401);
});
