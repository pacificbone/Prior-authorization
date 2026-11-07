import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COST_MEDICATIONS,COST_FACILITIES,COST_FACTS,COST_PAYER_TOOLS,
  newCostCase,createCostItems,getCostService,validateCostCase,
  estimatePatientCost,costWorksheet,selectCostGuidance
} from '../shared/patient-cost.mjs';

function priced(data,{amounts={},method='coinsurance',percentage=20,source='written-quote'}={}){
  return {
    ...data,
    items:data.items.map(item=>amounts[item.id]===undefined?item:{
      ...item,
      allowed:amounts[item.id],
      source,
      method,
      percentage,
      copay:null,
      deductibleApplies:method==='coinsurance'
    })
  };
}
function staffVerified(data,values={}){
 return {
  ...data,
  network:'in-network',
  coverage:'staff-verified-covered',
  secondary:'none',
  planLabel:'Synthetic plan product',
  deductibleRemaining:0,
  oopRemaining:null,
  ...values
 };
}
test('default scenario is incomplete, never a real patient quote and contains no fake negotiated rates',()=>{
 const initial=newCostCase();
 assert.equal(initial.procedureId,'total-knee');
 assert.equal(initial.payer,'HMSA');
 assert.equal(initial.benefit,'Medical');
 assert.ok(initial.items.some(x=>x.id==='surgeon'));
 assert.ok(initial.items.some(x=>x.id==='facility'));
 assert.ok(initial.items.some(x=>x.id==='anesthesia'));
 assert.ok(initial.items.filter(x=>x.required).every(x=>x.allowed===null));
 const r=estimatePatientCost(initial);
 assert.equal(r.status,'incomplete');
 assert.equal(r.totalRequired,null);
 assert.equal(r.quoteReady,false);
 assert.ok(r.missingRequired.length>=3);
 assert.match(r.messages.join(' '),/not confirmed|not verified|incomplete/i);
});

test('Medicare Part B illustrative outpatient 2026 deductible and 20 percent uses total allowed parts, not gross charges',()=>{
 let x=newCostCase({procedureId:'total-knee',payer:'Traditional Medicare',line:'Traditional Medicare',year:2026,setting:'ASC'});
 x=staffVerified(x,{planLabel:'Original Medicare',deductibleRemaining:283,facilityId:'other',secondary:'none'});
 x=priced(x,{amounts:{surgeon:2000,facility:8000,anesthesia:1000},source:'cms-medicare-rate'});
 const r=estimatePatientCost(x);
 assert.equal(r.status,'scenario');
 assert.equal(r.totalRequired,2426.4); // $283 deductible + 20% of remaining $10,717
 assert.equal(r.quoteReady,false);
 assert.equal(r.deductibleLeftAfterKnown,0);
 assert.ok(r.missingOptional.length>=1);
 assert.ok(r.messages.some(v=>v.includes('Original Medicare has no annual')));
 assert.equal(r.components.find(v=>v.id==='surgeon').patientShare,626.4);
});
test('Original Medicare inpatient facility is never treated as a simple $1736 copay',()=>{
 let x=newCostCase({procedureId:'total-hip',payer:'Traditional Medicare',line:'Traditional Medicare',year:2026,setting:'Hospital inpatient'});
 x=staffVerified(x,{planLabel:'Original Medicare',deductibleRemaining:283,facilityId:'queens-honolulu'});
 x=priced(x,{amounts:{surgeon:1800,facility:22000,anesthesia:500},source:'cms-medicare-rate'});
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,null);
 assert.ok(r.missingRequired.some(v=>v.id==='facility'&&v.reason.includes('Part A')));
 assert.ok(r.messages.some(v=>v.includes('per benefit period')));
 assert.equal(r.quoteReady,false);
});

test('in-network covered commercial medical scenario applies deductible then in-network remaining OOP cap, never above allowed',()=>{
 let x=newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial',year:2026,setting:'ASC'});
 x=staffVerified(x,{planLabel:'HMSA Choice fictional',deductibleRemaining:1500,oopRemaining:700,facilityId:'castle'});
 x=priced(x,{amounts:{surgeon:2000,facility:7500,anesthesia:900},method:'coinsurance',percentage:20,source:'payer-negotiated-rate'});
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,700);
 assert.equal(r.oopLeftAfterKnown,0);
 assert.equal(r.quoteReady,false);
 assert.equal(r.isScenario,true);
 assert.equal(r.components.filter(v=>v.required).reduce((sum,v)=>sum+v.patientShare,0),700);
 assert.ok(r.components.every(v=>v.patientShare===null||v.patientShare<=v.allowed));
});

test('cash self-pay is quoted cost, does not use insurance deductible and not a formal Good Faith Estimate',()=>{
 let x=newCostCase({procedureId:'carpal-open',payer:'Self-pay',line:'Uninsured / self-pay',setting:'Office'});
 x=staffVerified(x,{planLabel:'Self-pay',network:'unknown',coverage:'unverified',secondary:'none'});
 x=priced(x,{amounts:{surgeon:1500},source:'self-pay-quote',method:'cash'});
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,1500);
 assert.ok(r.messages.some(m=>m.includes('Good Faith Estimate')));
 assert.equal(r.quoteReady,false);
});
test('gel administration and J-code require distinct prices; unselected brand does not create false complete quote',()=>{
 let x=newCostCase({procedureId:'knee-gel',setting:'Office',payer:'UHA',line:'Commercial'});
 x=staffVerified(x,{planLabel:'UHA fictional',oopRemaining:2500});
 x=priced(x,{amounts:{surgeon:160, 'gel-product':900},source:'written-quote',method:'copay',percentage:null});
 x.items=x.items.map(v=>v.required?{...v,copay:25,deductibleApplies:false}:v);
 assert.equal(estimatePatientCost(x).totalRequired,null);
 x={...x,gelProductId:'durolane',items:[]};x.items=createCostItems(x);
 x=priced(x,{amounts:{surgeon:160,'gel-product':900},source:'written-quote',method:'copay',percentage:null});
 x.items=x.items.map(v=>v.required?{...v,copay:25,deductibleApplies:false}:v);
 assert.equal(estimatePatientCost(x).totalRequired,50);
 assert.equal(estimatePatientCost(x).quoteReady,false);
});
test('bone-health medications can be estimated under separate unverified pharmacy/medical benefits',()=>{
 assert.ok(COST_MEDICATIONS.some(x=>x.id==='drug-evenity'));
 assert.ok(COST_MEDICATIONS.some(x=>x.id==='drug-prolia'));
 assert.equal(getCostService('drug-evenity').name,'Evenity (romosozumab)');
 let x=newCostCase({procedureId:'drug-evenity',payer:'HMSA',line:'Commercial'});
 assert.equal(x.benefit,'Unverified');
 assert.ok(x.items.some(v=>v.id==='drug-product'&&v.required));
 assert.ok(x.items.some(v=>v.id==='administration'&&!v.required));
 x=staffVerified(x,{planLabel:'HMSA medication hypothetical',oopRemaining:200,benefit:'Pharmacy'});
 x=priced(x,{amounts:{'drug-product':1000},source:'payer-negotiated-rate',method:'coinsurance',percentage:30});
 x.items=x.items.map(v=>v.id==='drug-product'?{...v,deductibleApplies:true}:v);
 assert.equal(estimatePatientCost(x).totalRequired,300);
 assert.ok(estimatePatientCost(x).messages.some(v=>v.includes('specialty pharmacy')||v.includes('course length')));
 assert.equal(estimatePatientCost(x).quoteReady,false);
});
test('remaining medical OOP balance does not cap out-of-network, Original Medicare or pharmacy benefit estimates',()=>{
 for(const data of [
  {payer:'HMSA',line:'Commercial',network:'out-of-network',benefit:'Medical'},
  {payer:'Traditional Medicare',line:'Traditional Medicare',network:'in-network',benefit:'Medical'},
  {payer:'HMSA',line:'Commercial',network:'in-network',benefit:'Pharmacy'}
 ]){
  let x=newCostCase({procedureId:'drug-prolia',payer:data.payer,line:data.line,benefit:data.benefit,setting:'Office',year:2026});
  x=staffVerified(x,{planLabel:'Example only',deductibleRemaining:0,oopRemaining:75,network:data.network});
  x=priced(x,{amounts:{'drug-product':1000},source:'payer-negotiated-rate',method:'coinsurance',percentage:30});
  assert.equal(estimatePatientCost(x).totalRequired,300);
  assert.equal(estimatePatientCost(x).quoteReady,false);
 }
});

test('validation rejects PHI fields, arbitrary line items and unsafe plan text',()=>{
 const base=newCostCase();
 const errors=[
  {...base,patientName:'A Patient'},
  {...base,memberId:'fake-12345'},
  {...base,clinicalNote:'Knee pain'},
  {...base,planLabel:'Patient 98765432100'},
  {...base,planLabel:'<script>alert(1)</script>'},
  {...base,oopRemaining:-1},
  {...base,deductibleRemaining:Infinity},
  {...base,network:'secret'},
  {...base,items:[...base.items,{id:'injected',allowed:100}]},
  {...base,items:base.items.map((v,i)=>i===0?{...v,label:'Malicious fee'}:v)},
  {...base,items:base.items.map((v,i)=>i===0?{...v,allowed:-1}:v)}
 ];
 for(const payload of errors)assert.throws(()=>validateCostCase(payload));
 assert.equal(validateCostCase({...base,planLabel:'Hawaiʻi Choice'}).planLabel,'Hawaiʻi Choice');
});
test('2027 is not given 2026 Medicare default cost share or deductible',()=>{
 const x=newCostCase({procedureId:'total-hip',payer:'Traditional Medicare',line:'Traditional Medicare',year:2027});
 assert.equal(x.items.find(v=>v.id==='surgeon').method,'unknown');
 assert.ok(estimatePatientCost(x).messages.some(v=>v.includes('2027 benefit terms')));
});
test('source directory includes major facilities and national cost-share reference facts',()=>{
 for(const id of ['queens-honolulu','queens-west','castle','kuakini','straub','pali-momi','hilo','kona'])
  assert.ok(COST_FACILITIES.find(x=>x.id===id)?.sourceUrl);
 assert.equal(COST_FACTS.find(x=>x.id==='medicare-2026').partADeductible,1736);
 assert.equal(COST_FACTS.find(x=>x.id==='medicare-2026').partBDeductible,283);
 assert.equal(COST_FACTS.find(x=>x.id==='marketplace-2026').individualFederalCeiling,10600);
 assert.equal(COST_FACTS.find(x=>x.id==='marketplace-2027').individualFederalCeiling,12000);
 assert.ok(COST_PAYER_TOOLS.some(x=>x.payers.includes('HMSA')));
 const g=selectCostGuidance(newCostCase({payer:'Traditional Medicare',line:'Traditional Medicare'}));
 assert.ok(g.facts.some(x=>x.kind==='medicare'));
});
test('cost worksheet discloses component exclusions and never invents an eligibility confirmation',()=>{
 const x=newCostCase({procedureId:'maci-implant',payer:'Curative',line:'Commercial',setting:'ASC'});
 const text=costWorksheet(x,{generated:'2026-11-07'});
 assert.match(text,/SYNTHETIC PATIENT COST SCENARIO/);
 assert.match(text,/Service: MACI/);
 assert.match(text,/INCOMPLETE/);
 assert.match(text,/allowed unknown/);
 assert.match(text,/No PHI or member identifiers/);
 assert.doesNotMatch(text,/Approved for payment/);
});
