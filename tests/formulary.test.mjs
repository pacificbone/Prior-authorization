import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublishedFormularyService,validateSearchInput,normalizeQuestRows,QUEST_FORMULARY} from '../server/formulary.mjs';
import {createApi} from '../server/api.mjs';

const plan={
  plan_id_type:'HIOS-PLAN-ID',
  plan_id:'22780AA1111111',
  drug_tier:'GENERIC',
  prior_authorization:false,
  step_therapy:false,
  quantity_limit:false,
  years:[2026]
};
const rows=Array.from({length:120},(_,index)=>({
  rxnorm_id:String(1000000+index),
  drug_name:index<3 ? ['alendronate 70 MG Oral Tablet','Evenity 105 MG/1.17ML Injection','alendronate 35 MG Oral Tablet'][index] : 'Other Drug '+index+' MG Oral Tablet',
  plans:[{...plan, ...(index===1 ?{drug_tier:'BRAND',prior_authorization:true,quantity_limit:true}:{})}]
}));
const input=(drug)=>({source:QUEST_FORMULARY.id,drug});
function request(body, origin='https://app.example'){
  return new Request('https://app.example/api/formulary/search',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify(body)});
}

test('HMSA published schema can normalize RxNorm names, tiers, flags and exact plan identifiers',()=>{
  const normalized=normalizeQuestRows(rows);
  assert.equal(normalized.length,120);
  assert.deepEqual(normalized[1],{
    rxnorm:'1000001',name:'Evenity 105 MG/1.17ML Injection',
    planId:'22780AA1111111',planIdType:'HIOS-PLAN-ID',
    tier:'BRAND',priorAuthorization:true,stepTherapy:false,quantityLimit:true
  });
  assert.equal(normalizeQuestRows([{...rows[0],plans:[{...plan,years:[2027]}]},...rows.slice(1)],{minimum:100}).length,119);
  assert.throws(()=>normalizeQuestRows(rows.slice(0,1)));
  assert.throws(()=>normalizeQuestRows([{...rows[0],plans:[{...plan,drug_tier:'<script>'}]},...rows.slice(1)]));
  assert.throws(()=>normalizeQuestRows([{...rows[0],plans:[{...plan,plan_id_type:'wrong'}]},...rows.slice(1)]));
});

test('search input only accepts source ID and a bounded drug name / numeric RxNorm',()=>{
  assert.equal(validateSearchInput(input('  Alendronate ')),'alendronate');
  assert.equal(validateSearchInput(input('123456')),'123456');
  for(const entry of [
    {...input('Evenity'),patientId:'01234'},
    {...input('Evenity'),note:'Fictional note'},
    input('<script>'),input('a'),input('x'.repeat(75)),
    {source:'hmsa-commercial-2026',drug:'Evenity'},
    null
  ])assert.throws(()=>validateSearchInput(entry));
});

test('server searches the official allowlisted source only, caches it, and returns no note data',async()=>{
  let callCount=0,seenUrl=null,seenOptions=null;
  const service=createPublishedFormularyService({
    fetcher:async(url,options)=>{callCount++;seenUrl=url;seenOptions=options;return Response.json(rows);},
    now:()=>Date.parse('2026-11-07T12:00:00Z')
  });
  const result=await service(input('Alendronate'));
  assert.equal(result.totalMatches,2);
  assert.equal(result.matches.length,2);
  assert.equal(result.source.id,QUEST_FORMULARY.id);
  assert.equal(result.source.line,'QUEST / Medicaid');
  assert.equal(result.reviewOverdue,false);
  assert.match(result.limitations,/Not member-specific eligibility/);
  assert.equal(seenUrl,QUEST_FORMULARY.sourceUrl);
  assert.equal(seenOptions.redirect,'error');
  const second=await service(input('1000001'));
  assert.equal(second.matches[0].name,'Evenity 105 MG/1.17ML Injection');
  assert.equal(callCount,1);
  assert.equal((await service(input('UnlistedNewDrug'))).totalMatches,0);
});

test('API refuses cross-origin, extra patient fields and invalid searches without external fetch',async()=>{
  let called=0;
  const handle=createApi({fetcher:async()=>{called++;return Response.json(rows);}});
  assert.equal((await handle(request(input('evenity'),'https://other.example'))).status,403);
  assert.equal((await handle(request({...input('Evenity'),memberId:'sensitive'}))).status,400);
  assert.equal((await handle(request(input('a')))).status,400);
  assert.equal(called,0);
  const response=await handle(request(input('Evenity')));
  assert.equal(response.status,200);
  const result=await response.json();
  assert.equal(result.matches[0].tier,'BRAND');
  assert.equal(result.matches[0].priorAuthorization,true);
  assert.equal(result.matches[0].quantityLimit,true);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(called,1);
});

test('malformed or failed official source must not be reported as verified formulary',async()=>{
  for(const fetcher of [async()=>new Response('not found',{status:404}),async()=>Response.json({wrong:'object'}),async()=>Response.json(rows.slice(0,1))]){
    const response=await createApi({fetcher})(request(input('alendronate')));
    assert.equal(response.status,503);
    const data=await response.json();
    assert.match(data.error,/could not be verified/i);
    assert.equal(data.matches,undefined);
  }
});

test('the public fetch carries a timeout and failures are negatively cached for about a minute',async()=>{
  let t=Date.parse('2026-11-07T12:00:00Z'),callCount=0,seenSignal=null;
  const service=createPublishedFormularyService({fetcher:async(url,options)=>{callCount++;seenSignal=options.signal;return new Response('upstream down',{status:503});},now:()=>t});
  await assert.rejects(()=>service(input('alendronate')));
  assert.ok(seenSignal instanceof AbortSignal);
  await assert.rejects(()=>service(input('alendronate')));
  await assert.rejects(()=>service(input('evenity')));
  assert.equal(callCount,1);
  t+=61000;
  await assert.rejects(()=>service(input('alendronate')));
  assert.equal(callCount,2);
  const api=createApi({fetcher:async()=>{throw new Error('timed out');}});
  for(let i=0;i<2;i++){const r=await api(request(input('alendronate')));assert.equal(r.status,503);assert.match((await r.json()).error,/could not be verified/i);}
});

test('public formulary searches are rate limited per isolate',async()=>{
  let called=0;
  const handle=createApi({fetcher:async()=>{called++;return Response.json(rows);}});
  for(let i=0;i<30;i++)assert.equal((await handle(request(input('alendronate')))).status,200);
  const limited=await handle(request(input('alendronate')));
  assert.equal(limited.status,429);
  assert.match((await limited.json()).error,/Try again in a minute/);
  assert.equal(called,1);
});

test('source review age is flagged without inventing a payer expiration date',async()=>{
  const service=createPublishedFormularyService({fetcher:async()=>Response.json(rows),now:()=>Date.parse('2027-02-05T12:00:00Z')});
  assert.equal((await service(input('alendronate'))).reviewOverdue,true);
});
