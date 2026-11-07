import test from 'node:test';
import assert from 'node:assert/strict';
import {getPublishedFormulary,PUBLISHED_FORMULARIES} from '../shared/live-formularies.mjs';
import {hawaiiCoverageSources,coverageDirectoryStats} from '../shared/hawaii-plan-sources.mjs';
import {normalizeQuestRows,createPublishedFormularyService} from '../server/formulary.mjs';
import {createApi} from '../server/api.mjs';

const k=getPublishedFormulary('kaiser-hi-marketplace-platinum-2026');
const medicaid=getPublishedFormulary('kaiser-hi-quest-2026');
const origin='https://app.example';
const row=(i)=>({
  rxnorm_id:String(3000000+i),
  drug_name:i===0?'DOXEPIN 10 MG ORAL CAPSULE':'SYNTHETIC DRUG '+i+' MG ORAL TABLET',
  plans:[{
    plan_id_type:'HIOS-PLAN-ID',
    plan_id:'60612HI0110006',
    drug_tier:'GENERIC',
    PA:i===0,
    ST:false,
    QL:i%2===0,
    years:[2026,2027]
  }]
});
const rows=()=>Array.from({length:120},(_,i)=>row(i));
const req=(source,drug)=>new Request(origin+'/api/formulary/search',{
  method:'POST',headers:{'Content-Type':'application/json','Origin':origin},
  body:JSON.stringify({source,drug})
});

test('official Kaiser individual plan is explicitly separate from Kaiser QUEST and unknown HMO products',()=>{
  assert.equal(k.payer,'Kaiser Permanente');
  assert.equal(k.line,'Individual Exchange');
  assert.equal(k.planId,'60612HI0110006');
  assert.equal(k.planIdType,'HIOS-PLAN-ID');
  assert.equal(k.year,2026);
  assert.equal(k.effective,null);
  assert.equal(k.sourceUrl,'https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs.json');
  assert.notEqual(k.planId,medicaid.planId);
  assert.equal(hawaiiCoverageSources.find(x=>x.id==='kaiser-individual').liveSourceId,k.id);
  assert.equal(hawaiiCoverageSources.find(x=>x.id==='kaiser-individual-other').status,'public-source');
  assert.equal(coverageDirectoryStats().imported,PUBLISHED_FORMULARIES.length);
});

test('Kaiser commercial source supports uppercase PA, ST, QL and multi-year arrays',()=>{
  const input=rows();
  input[0].plans.push({...input[0].plans[0],plan_id:'60612HI0110011',drug_tier:'SPECIALTY-DRUGS',PA:false});
  input[1].plans.push({...input[1].plans[0],plan_id:'60612HI0110006',years:[2025],drug_tier:'OTHER-TIER'});
  const normalized=normalizeQuestRows(input,{source:k});
  assert.equal(normalized.length,120);
  assert.deepEqual(normalized[0],{
    rxnorm:'3000000',
    name:'DOXEPIN 10 MG ORAL CAPSULE',
    planId:k.planId,
    planIdType:k.planIdType,
    tier:'GENERIC',
    priorAuthorization:true,
    stepTherapy:false,
    quantityLimit:true
  });
  assert.equal(normalized[1].tier,'GENERIC');
  assert.ok(normalized.every(x=>x.planId===k.planId));
  assert.throws(()=>normalizeQuestRows(input,{source:{...k,year:2028}}));
  assert.throws(()=>normalizeQuestRows(input,{source:{...k,planId:'WRONG-PLAN'}}));
});

test('Kaiser Marketplace source is fetched by exact approved URL and not merged with Medicaid',async()=>{
  const urls=[];
  const service=createPublishedFormularyService({
    fetcher:async url=>{
      urls.push(url);
      if(url===k.sourceUrl)return Response.json(rows());
      return Response.json(Array.from({length:120},(_,i)=>({
        rxnorm_id:String(4000000+i),drug_name:'QUEST DRUG '+i,
        plans:[{plan_id_type:medicaid.planIdType,plan_id:medicaid.planId,drug_tier:'TIER-2',years:'2026',prior_authorization:false,step_therapy:false,quantity_limit:false}]
      })));
    },
    now:()=>Date.parse('2026-11-07T12:00:00Z')
  });
  const [commercial,quest]=await Promise.all([
    service({source:k.id,drug:'doxepin'}),
    service({source:medicaid.id,drug:'QUEST DRUG'})
  ]);
  assert.equal(commercial.matches[0].planId,k.planId);
  assert.equal(commercial.matches[0].priorAuthorization,true);
  assert.equal(quest.matches.length,40);
  assert.equal(quest.matches[0].tier,'TIER-2');
  assert.deepEqual(new Set(urls),new Set([k.sourceUrl,medicaid.sourceUrl]));
  assert.equal(commercial.source.line,'Individual Exchange');
  assert.equal(quest.source.line,'QUEST / Medicaid');
  assert.equal(commercial.source.effective,null);
});

test('Kaiser marketplace exact source search uses public-only bounded API',async()=>{
  let calls=0;
  const api=createApi({fetcher:async()=>{calls++;return Response.json(rows());}});
  const good=await api(req(k.id,'DOXEPIN'));
  assert.equal(good.status,200);
  assert.equal((await good.json()).matches[0].priorAuthorization,true);
  const wrong=new Request(origin+'/api/formulary/search',{
    method:'POST',headers:{'Content-Type':'application/json','Origin':origin},
    body:JSON.stringify({source:k.id,drug:'DOXEPIN',memberId:'fake-member'})
  });
  assert.equal((await api(wrong)).status,400);
  assert.equal((await api(req('kaiser-unknown','DOXEPIN'))).status,400);
  assert.equal(calls,1);
});
