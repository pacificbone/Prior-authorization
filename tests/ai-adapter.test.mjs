import test from 'node:test';
import assert from 'node:assert/strict';
import {extractEvidence} from '../server/ai.mjs';
import {samples} from '../shared/fixtures.mjs';
import {policies} from '../shared/catalog.mjs';
import {applyPolicyPathway} from '../shared/domain.mjs';
const sample=samples['osteoporosis-evenity'];
const policy=applyPolicyPathway(policies.find(p=>p.id==='uhc-evenity-2026-11'),sample.pathwayId,sample.drugId);
const env={AI_PROVIDER:'openai',AI_MODEL:'test-model',OPENAI_API_KEY:'fake-key-for-mocked-transport'};
const bedrock={AI_PROVIDER:'bedrock',AI_MODEL:'test.model-v1:0',AWS_REGION:'us-west-2',AWS_ACCESS_KEY_ID:'FAKEACCESSKEY',AWS_SECRET_ACCESS_KEY:'fake secret'};
const good={evidence:[{criterionId:'diagnosis',status:'documented',quote:sample.evidence.diagnosis.quote}]};
const openaiBody=extra=>JSON.stringify({status:'completed',...extra,output:[{content:[{type:'output_text',text:JSON.stringify(good)}]}]});
const bedrockBody=extra=>JSON.stringify({stopReason:'end_turn',...extra,output:{message:{content:[{text:JSON.stringify(good)}]}}});
test('a sample object that is not the bundled fixture never reaches a provider, whatever the caller passes',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response(openaiBody());};
 for(const fake of [{...sample},{...sample,note:'A real patient narrative must never be sent'},null,undefined,'osteoporosis-evenity',{note:'x'}])
  await assert.rejects(()=>extractEvidence(fake,policy,env,fetcher),/bundled synthetic samples/);
 assert.equal(calls,0);
 const ok=await extractEvidence(sample,policy,env,fetcher);
 assert.equal(calls,1);assert.ok(JSON.stringify(ok).includes(sample.evidence.diagnosis.quote));
});
test('both provider adapters read responses through the bounded JSON reader',async()=>{
 const padding='x'.repeat(140000);
 await assert.rejects(()=>extractEvidence(sample,policy,env,async()=>new Response(openaiBody({padding}))),/too large/);
 await assert.rejects(()=>extractEvidence(sample,policy,env,async()=>new Response(openaiBody({padding}),{headers:{'Content-Length':String(openaiBody({padding}).length)}})),/too large/);
 await assert.rejects(()=>extractEvidence(sample,policy,bedrock,async()=>new Response(bedrockBody({padding}))),/too large/);
 const small=await extractEvidence(sample,policy,bedrock,async()=>new Response(bedrockBody()));
 assert.ok(JSON.stringify(small).includes(sample.evidence.diagnosis.quote));
});
