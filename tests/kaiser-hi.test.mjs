import test from 'node:test';
import assert from 'node:assert/strict';
import {PUBLISHED_FORMULARIES,getPublishedFormulary} from '../shared/live-formularies.mjs';
import {hawaiiCoverageSources,coverageDirectoryStats} from '../shared/hawaii-plan-sources.mjs';
import {normalizeQuestRows,createPublishedFormularyService} from '../server/formulary.mjs';
import {createApi} from '../server/api.mjs';

const k=getPublishedFormulary('kaiser-hi-quest-2026');
const origin='https://app.example';
const sample=(i=0,override={})=>({
  rxnorm_id:String(2000000+i),
  drug_name:i===0?'PRIMIDONE 250 MG ORAL TABLET':'SYNTHETIC MEDICATION '+i+' MG ORAL TABLET',
  plans:[{
    plan_id_type:'QUEST Medicaid-CHIP Plan Description',
    plan_id:'KP-HI-QUEST Medicaid',
    drug_tier:'TIER-1',
    prior_authorization:false,
    step_therapy:false,
    quantity_limit:false,
    years:'2026',...override
  }]
});
const payload=()=>Array.from({length:120},(_,i)=>sample(i));
const request=(drug,source=k.id)=>new Request(origin+'/api/formulary/search',{
  method:'POST',
  headers:{'Content-Type':'application/json','Origin':origin},
  body:JSON.stringify({source,drug})
});

test('Kaiser 2026 Hawaiʻi QUEST published schema has an exact description plan ID and a source',()=>{
  assert.ok(k);
  assert.equal(k.payer,'Kaiser Permanente');
  assert.equal(k.planIdType,'QUEST Medicaid-CHIP Plan Description');
  assert.equal(k.planId,'KP-HI-QUEST Medicaid');
  assert.equal(k.year,2026);
  assert.equal(k.effective,null);
  assert.ok(k.sourceUrl.includes('/data/hi/drugs-medicaid.json'));
  assert.equal(PUBLISHED_FORMULARIES.filter(x=>x.id===k.id).length,1);
  const entry=hawaiiCoverageSources.find(x=>x.id==='kaiser-quest');
  assert.equal(entry.status,'live-drug-search');
  assert.equal(entry.liveSourceId,k.id);
  assert.equal(coverageDirectoryStats().imported,PUBLISHED_FORMULARIES.length);
});

test('Kaiser Medicaid plan year may be a string; mismatched plans and years are never imported',()=>{
  const rows=payload();
  rows[0].plans.push({...rows[0].plans[0],plan_id:'KP-HI-NOT-QUEST',drug_tier:'TIER-7'});
  rows[1].plans.push({...rows[1].plans[0],years:'2027',drug_tier:'TIER-7'});
  rows[2].plans.push({...rows[2].plans[0],plan_id_type:'HIOS-PLAN-ID',drug_tier:'TIER-7'});
  const result=normalizeQuestRows(rows,{source:k});
  assert.equal(result.length,120);
  assert.equal(result[0].rxnorm,'2000000');
  assert.equal(result[0].tier,'TIER-1');
  assert.ok(result.every(x=>x.planId===k.planId && x.planIdType===k.planIdType));
  assert.throws(()=>normalizeQuestRows(rows,{source:{...k,planId:'KP-HI-NOT-QUEST'}}));
  assert.throws(()=>normalizeQuestRows(rows.map(x=>({...x,plans:[{...x.plans[0],years:'2027'}]})),{source:k}));
});

test('Kaiser output preserves unknown effective date, review age and pharmacy restrictions',async()=>{
  const fetches=[];
  const service=createPublishedFormularyService({
    fetcher:async(url,options)=>{fetches.push({url,options});return Response.json(payload());},
    now:()=>Date.parse('2026-11-07T20:00:00Z')
  });
  const a=await service({source:k.id,drug:'primidone'});
  assert.equal(a.matches.length,1);
  assert.equal(a.matches[0].name,'PRIMIDONE 250 MG ORAL TABLET');
  assert.equal(a.matches[0].tier,'TIER-1');
  assert.equal(a.source.effective,null);
  assert.equal(a.reviewOverdue,false);
  assert.equal(fetches.length,1);
  assert.equal(fetches[0].url,k.sourceUrl);
  assert.equal(fetches[0].options.redirect,'error');
});

test('Kaiser only searches known public sources and fails closed when schema is invalid',async()=>{
  let calls=0;
  const api=createApi({fetcher:async()=>{calls++;return Response.json(payload());}});
  const valid=await api(request('primidone'));
  assert.equal(valid.status,200);
  const data=await valid.json();
  assert.equal(data.matches[0].planId,'KP-HI-QUEST Medicaid');
  const wrong=new Request(origin+'/api/formulary/search',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify({source:k.id,drug:'primidone',memberId:'fake-123'})});
  assert.equal((await api(wrong)).status,400);
  assert.equal((await api(request('primidone','https://evil.example.json'))).status,400);
  assert.equal(calls,1);
  const failed=createApi({fetcher:async()=>Response.json(payload().map(x=>({...x,plans:[{...x.plans[0],plan_id:'OTHER'}]})))});
  assert.equal((await failed(request('primidone'))).status,503);
});

test('source review reminder is not a fabricated payer expiration',async()=>{
  const service=createPublishedFormularyService({
    fetcher:async()=>Response.json(payload()),
    now:()=>Date.parse('2027-03-01T12:00:00Z')
  });
  const result=await service({source:k.id,drug:'primidone'});
  assert.equal(result.reviewOverdue,true);
  assert.equal(result.source.effective,null);
});
