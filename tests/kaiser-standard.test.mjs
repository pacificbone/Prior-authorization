import test from 'node:test';
import assert from 'node:assert/strict';
import {PUBLISHED_FORMULARIES,getPublishedFormulary} from '../shared/live-formularies.mjs';
import {hawaiiCoverageSources,coverageDirectoryStats} from '../shared/hawaii-plan-sources.mjs';
import {staffPlansForPayer,staffContext} from '../shared/staff-workflow.mjs';
import {normalizeQuestRows,createPublishedFormularyService,validateSearchInput} from '../server/formulary.mjs';
import {createApi} from '../server/api.mjs';

const STANDARD_IDS=['60612HI0110017','60612HI0110018','60612HI0110019','60612HI0110020'];
const idsByYear=(year)=>['0017','0018','0019','0020'].map(id=>getPublishedFormulary('kaiser-hi-standard-'+id+'-'+year));
const sourceURL='https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json';
const sample=(i)=>({
 rxnorm_id:String(6000000+i),
 drug_name:i===0?'DOXEPIN 10 MG ORAL CAPSULE':i===1?'SYNTHETIC 2026-ONLY DRUG':'SYNTHETIC OTHER MEDICATION '+i,
 plans:STANDARD_IDS.map((plan_id,k)=>({
   plan_id_type:'HIOS-PLAN-ID',plan_id,drug_tier:k===0?'GENERIC':k===1?'BRAND':'SPECIALTY-DRUGS',
   prior_authorization:k===2,step_therapy:k===3,quantity_limit:k===1,years:i===1?[2026]:[2026,2027]
 }))
});
const payload=()=>Array.from({length:125},(_,i)=>sample(i));
test('Kaiser Standard 4 HIOS plans are each represented separately for both 2026 and 2027',()=>{
 const sources=[...idsByYear(2026),...idsByYear(2027)];
 assert.equal(sources.length,8);
 for(const year of [2026,2027]){
  const plans=idsByYear(year);
  assert.deepEqual(plans.map(x=>x.planId),STANDARD_IDS);
  for(const x of plans){
   assert.equal(x.year,year);
   assert.equal(x.payer,'Kaiser Permanente');
   assert.equal(x.line,'Individual Exchange');
   assert.equal(x.benefit,'Pharmacy');
   assert.equal(x.effective,null);
   assert.equal(x.planIdType,'HIOS-PLAN-ID');
   assert.equal(x.sourceUrl,sourceURL);
   assert.match(x.label,/verify marketing name/);
  }
  for(const x of plans){
   const entry=hawaiiCoverageSources.find(row=>row.liveSourceId===x.id);
   assert.ok(entry,x.id+' missing directory entry');
   assert.equal(entry.payer,'Kaiser Permanente');
   assert.equal(entry.program,'exchange');
   assert.equal(entry.year,String(year));
   assert.equal(entry.status,'live-drug-search');
   const staff=staffContext({payer:'Kaiser Permanente',planId:entry.id,serviceId:'alendronate',year,benefit:'Pharmacy'});
   assert.equal(staff.liveSource?.id,x.id);
   assert.equal(staff.plan?.id,entry.id);
   assert.equal(staff.liveSource?.planId,x.planId);
  }
 }
 assert.equal(new Set(sources.map(x=>x.id)).size,8);
 assert.equal(coverageDirectoryStats().imported,PUBLISHED_FORMULARIES.length);
});
test('year and HIOS isolation prevents 2026-only drugs leaking to 2027 or sibling plans',()=>{
 const data=payload();
 data[2].plans.push({...data[2].plans[0],plan_id:'000000HI0000000',years:[2027],drug_tier:'BOGUS'});
 const a=normalizeQuestRows(data,{source:idsByYear(2026)[0]});
 const b=normalizeQuestRows(data,{source:idsByYear(2027)[0]});
 const c=normalizeQuestRows(data,{source:idsByYear(2027)[2]});
 assert.equal(a.length,125);
 assert.equal(b.length,124);
 assert.equal(c.length,124);
 assert.ok(a.every(x=>x.planId===STANDARD_IDS[0]));
 assert.ok(c.every(x=>x.planId===STANDARD_IDS[2]));
 assert.ok(c.every(x=>x.tier==='SPECIALTY-DRUGS'));
 assert.equal(c[0].priorAuthorization,true);
 assert.equal(a[0].priorAuthorization,false);
 assert.equal(b.some(x=>x.name.includes('2026-ONLY')),false);
});
test('shared official source is fetched once for eight plan-year searches without combining their results',async()=>{
 const urls=[];
 const service=createPublishedFormularyService({
  fetcher:async(url,options)=>{urls.push({url,options});return Response.json(payload());},
  now:()=>Date.parse('2026-11-07T12:00:00Z')
 });
 const results=await Promise.all([...idsByYear(2026),...idsByYear(2027)].map(x=>
  service({source:x.id,drug:'DOXEPIN'})));
 assert.equal(urls.length,1);
 assert.equal(urls[0].url,sourceURL);
 assert.equal(urls[0].options.redirect,'error');
 for(let i=0;i<results.length;i++){
  assert.equal(results[i].matches.length,1);
  assert.equal(results[i].matches[0].planId,STANDARD_IDS[i%4]);
  assert.equal(results[i].matches[0].tier,i%4===0?'GENERIC':i%4===1?'BRAND':'SPECIALTY-DRUGS');
  assert.equal(results[i].source.year,i<4?2026:2027);
  assert.equal(results[i].source.effective,null);
 }
 const c=await service({source:idsByYear(2027)[0].id,drug:'2026-ONLY'});
 assert.equal(c.totalMatches,0);
 assert.equal(urls.length,1);
});
test('exact plan name cannot be searched through another insurer or date',()=>{
 const live=staffPlansForPayer('Kaiser Permanente',2026);
 const plan=live.find(x=>x.id==='kaiser-standard-0017-2026');
 assert.ok(plan);
 assert.equal(staffPlansForPayer('HMSA',2026).some(x=>x.id===plan.id),false);
 assert.equal(staffPlansForPayer('Kaiser Permanente',2027).some(x=>x.id===plan.id),false);
 assert.throws(()=>staffContext({payer:'HMSA',planId:plan.id,serviceId:'evenity',year:2026,benefit:'Pharmacy'}),/does not belong/);
 assert.throws(()=>staffContext({payer:'Kaiser Permanente',planId:plan.id,serviceId:'evenity',year:2027,benefit:'Pharmacy'}),/does not belong/);
});
test('API does not accept member fields, arbitrary plans or unexpected source URLs',async()=>{
 let called=0;
 const handle=createApi({fetcher:async()=>{called++;return Response.json(payload());}});
 const x=idsByYear(2026)[0];
 const req=(body)=>new Request('https://app.example/api/formulary/search',{
  method:'POST',headers:{'Content-Type':'application/json',Origin:'https://app.example'},body:JSON.stringify(body)
 });
 const good=await handle(req({source:x.id,drug:'DOXEPIN'}));
 assert.equal(good.status,200);
 assert.equal((await good.json()).matches[0].planId,x.planId);
 assert.equal((await handle(req({source:x.id,drug:'DOXEPIN',memberId:'secret'}))).status,400);
 assert.equal((await handle(req({source:'http://evil.example/x.json',drug:'DOXEPIN'}))).status,400);
 assert.equal(called,1);
 assert.equal(validateSearchInput({source:x.id,drug:'  doxepin '}),'doxepin');
});
