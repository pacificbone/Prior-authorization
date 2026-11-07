import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hawaiiCoverageSources,coveragePrograms,findHawaiiCoverageSources,
  coverageDirectoryStats,validateHawaiiCoverageSources
} from '../shared/hawaii-plan-sources.mjs';
import {PUBLISHED_FORMULARIES,getPublishedFormulary} from '../shared/live-formularies.mjs';
import {normalizeQuestRows,validateSearchInput,createPublishedFormularyService} from '../server/formulary.mjs';
const planRows=(source)=>{
 const row=(name,plan={})=>({
   rxnorm_id:'1011001',drug_name:name,
   plans:[{
     plan_id_type:source.planIdType,
     plan_id:source.planId,
     drug_tier:source.id.startsWith('uhc')?'PREFERRED(29)':'GENERIC',
     prior_authorization:false,step_therapy:false,quantity_limit:true,
     years:[source.year],
     ...plan
   }]
 });
 return Array.from({length:120},(_,i)=>row(i===0?'alendronate 70 MG Oral Tablet':'Other '+i+' MG Tablet'));
};

test('public directory represents every requested Hawaii program without inventing universal coverage',()=>{
 assert.equal(validateHawaiiCoverageSources(),true);
 assert.ok(hawaiiCoverageSources.length>=35);
 for(const type of ['commercial','exchange','quest','medicare-advantage','part-d','original-medicare','federal','veterans','military','delegated']){
   assert.ok(coveragePrograms.some(p=>p.id===type));
   assert.ok(hawaiiCoverageSources.some(s=>s.program===type));
 }
 for(const payer of ['HMSA','HMAA','UHA','Kaiser Permanente','AlohaCare','UnitedHealthcare','Curative','Humana','ʻOhana / Wellcare','Veterans Affairs','TRICARE']){
   assert.ok(hawaiiCoverageSources.some(s=>s.payer===payer),payer+' missing');
 }
 assert.equal(findHawaiiCoverageSources({program:'quest'}).every(x=>x.program==='quest'),true);
 assert.ok(findHawaiiCoverageSources({text:'Postal'}).length>=2);
 assert.ok(findHawaiiCoverageSources({text:'alendronate'}).length<=2);
});
test('only imported published feeds advertise local drug-level lookup',()=>{
 const live=hawaiiCoverageSources.filter(x=>x.status==='live-drug-search');
 assert.equal(live.length,PUBLISHED_FORMULARIES.length);
 for(const entry of live){
   const source=getPublishedFormulary(entry.liveSourceId);
   assert.ok(source);
   assert.equal(entry.payer,source.payer);
   assert.equal(entry.program,source.line==='QUEST / Medicaid'?'quest':'exchange');
   assert.ok(['QUEST / Medicaid','Individual Exchange'].includes(source.line));
 }
 assert.equal(coverageDirectoryStats().imported,PUBLISHED_FORMULARIES.length);
 const original=hawaiiCoverageSources.find(x=>x.id==='original-b');
 assert.equal(original.status,'no-single-formulary');
 assert.equal(hawaiiCoverageSources.find(x=>x.id==='medigap').status,'no-single-formulary');
 assert.equal(hawaiiCoverageSources.find(x=>x.id==='hmaa-employer').status,'partial-verified-entries');
 assert.notEqual(hawaiiCoverageSources.find(x=>x.id==='hmsa-ma-individual').status,'live-drug-search');
});
test('refuse invalid directory paths or contradictory live-source flags',()=>{
 assert.throws(()=>validateHawaiiCoverageSources([hawaiiCoverageSources[0],hawaiiCoverageSources[0]]));
 assert.throws(()=>validateHawaiiCoverageSources([{...hawaiiCoverageSources[0],sourceUrl:'http://insecure.example/'}]));
 assert.throws(()=>validateHawaiiCoverageSources([{...hawaiiCoverageSources[0],status:'live-drug-search'}]));
});
test('UHC pharmacy file isolates plan UCSHIQ1 and never imports embedded PART D or wrong year',()=>{
 const source=getPublishedFormulary('uhc-quest-2026-10');
 assert.ok(source);
 const records=planRows(source);
 records[0].plans.push({...records[0].plans[0],plan_id:'PART D',drug_tier:'MEDICAID-DRUG'});
 records[1].plans.push({...records[1].plans[0],plan_id:'WRONG-PLAN',drug_tier:'NON-PREFERRED(90)'});
 records[2].plans.push({...records[2].plans[0],years:[2027],drug_tier:'NON-PREFERRED(90)'});
 const normalized=normalizeQuestRows(records,{source});
 assert.equal(normalized.length,120);
 assert.equal(normalized[0].planId,'UCSHIQ1');
 assert.equal(normalized[0].tier,'PREFERRED(29)');
 assert.ok(normalized.every(x=>x.planId==='UCSHIQ1'));
 assert.equal(validateSearchInput({source:source.id,drug:'Alendronate'}),'alendronate');
 assert.throws(()=>normalizeQuestRows(records,{source:{...source,planId:'PART D'}}));
});
test('HMSA and UHC caches are isolated, with fixed upstream destinations',async()=>{
 const urls=[];
 const hmsa=getPublishedFormulary('hmsa-quest-2026-11');
 const uhc=getPublishedFormulary('uhc-quest-2026-10');
 const service=createPublishedFormularyService({
   fetcher:async(url)=>{
     urls.push(url);
     return Response.json(url===uhc.sourceUrl?planRows(uhc):planRows(hmsa));
   },
   now:()=>Date.parse('2026-11-07T20:00:00Z')
 });
 const [a,b,c]=await Promise.all([
   service({source:hmsa.id,drug:'alendronate'}),
   service({source:uhc.id,drug:'alendronate'}),
   service({source:uhc.id,drug:'1011001'})
 ]);
 assert.equal(a.source.payer,'HMSA');
 assert.equal(b.source.payer,'UnitedHealthcare');
 assert.equal(a.matches[0].tier,'GENERIC');
 assert.equal(b.matches[0].tier,'PREFERRED(29)');
 assert.equal(c.matches[0].planId,'UCSHIQ1');
 assert.equal(urls.length,2);
 assert.deepEqual(new Set(urls),new Set([hmsa.sourceUrl,uhc.sourceUrl]));
 assert.ok(!b.matches.some(x=>x.planId==='PART D'));
});
