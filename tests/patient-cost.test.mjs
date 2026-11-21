import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COST_MEDICATIONS,COST_FACILITIES,COST_FACTS,COST_PAYER_TOOLS,
  newCostCase,createCostItems,getCostService,validateCostCase,
  estimatePatientCost,costWorksheet,selectCostGuidance,costPayerLineConsistent,costContextForPlan
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
 // The surgeon line consumes the $700 remaining OOP; facility and anesthesia are capped to $0 and say so.
 assert.equal(r.components.find(v=>v.id==='surgeon').patientShare,700);
 assert.equal(r.components.find(v=>v.id==='surgeon').oopCapped,true);
 assert.equal(r.components.find(v=>v.id==='surgeon').preCapShare,1600);
 assert.equal(r.components.find(v=>v.id==='facility').patientShare,0);
 assert.equal(r.components.find(v=>v.id==='facility').oopCapped,true);
 assert.ok(r.messages.some(m=>m.includes('limit was reached')));
 assert.equal(r.confidence.level,'staff-verified-inputs');
 assert.equal(r.knownComponentShare,700);
 const worksheet=costWorksheet(x);
 assert.match(worksheet,/CONFIDENCE: STAFF-VERIFIED INPUTS/);
 assert.match(worksheet,/source: payer-negotiated-rate \| deductible applied \$1500\.00/);
 assert.match(worksheet,/OOP limit reached/);
});

test('cash self-pay is quoted cost, does not use insurance deductible and not a formal Good Faith Estimate',()=>{
 let x=newCostCase({procedureId:'carpal-open',payer:'Self-pay',line:'Uninsured / self-pay',setting:'Office'});
 x=staffVerified(x,{planLabel:'Self-pay',network:'unknown',coverage:'unverified',secondary:'none'});
 x=priced(x,{amounts:{surgeon:1500},source:'self-pay-quote',method:'cash'});
 x.items=x.items.map(v=>v.id==='surgeon'?{...v,deductibleApplies:true}:v); // a stale flag must not block a cash line
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,1500);
 assert.ok(r.messages.some(m=>m.includes('Good Faith Estimate')));
 assert.equal(r.quoteReady,false);
 assert.equal(r.confidence.level,'cash-scenario');
 assert.match(costWorksheet(x),/cash scenario from staff-entered quotes/);
 assert.match(costWorksheet(x),/CONFIDENCE: CASH SCENARIO/);
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
 // The medical deductible field is not a pharmacy deductible: a pharmacy line marked "deductible applies" stays unpriced.
 x.items=x.items.map(v=>v.id==='drug-product'?{...v,deductibleApplies:true}:v);
 const blocked=estimatePatientCost(x);
 assert.equal(blocked.totalRequired,null);
 assert.match(blocked.missingRequired[0].reason,/Pharmacy-benefit deductible/);
 x.items=x.items.map(v=>v.id==='drug-product'?{...v,deductibleApplies:false}:v);
 assert.equal(estimatePatientCost(x).totalRequired,300);
 assert.ok(estimatePatientCost(x).messages.some(v=>v.includes('single claim')&&v.includes('Course length')));
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
  if(data.benefit==='Pharmacy')x.items=x.items.map(v=>({...v,deductibleApplies:false}));
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
 // Two-decimal values that are not exactly representable in binary are still valid money/percentages.
 validateCostCase({...base,deductibleRemaining:33.3,oopRemaining:1.1});
 validateCostCase({...base,items:base.items.map((v,i)=>i===0?{...v,allowed:0.07,percentage:33.3}:v)});
 assert.throws(()=>validateCostCase({...base,deductibleRemaining:1.005}));
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

test('payer and plan line must be consistent: an MA or commercial line never inherits Original Medicare sharing',()=>{
 assert.equal(costPayerLineConsistent('Traditional Medicare','Traditional Medicare'),true);
 assert.equal(costPayerLineConsistent('Traditional Medicare','Medicare Advantage'),false);
 assert.equal(costPayerLineConsistent('HMSA','Traditional Medicare'),false);
 assert.equal(costPayerLineConsistent('Self-pay','Commercial'),false);
 assert.equal(costPayerLineConsistent('Other','Medicare Advantage'),true);
 for(const bad of [
  {payer:'Traditional Medicare',line:'Medicare Advantage'},
  {payer:'Self-pay',line:'Commercial'},
  {payer:'HMSA',line:'Traditional Medicare'},
  {payer:'Humana',line:'TRICARE'},
  {payer:'Other',line:'Uninsured / self-pay'}
 ]){
  const x=newCostCase({procedureId:'total-knee',...bad});
  assert.ok(x.items.every(v=>v.method==='unknown'&&v.percentage===null),JSON.stringify(bad)); // no 20% / cash default leaks
  assert.throws(()=>validateCostCase(x),/plan line does not belong/,JSON.stringify(bad));
 }
 // A procedure cannot be moved onto the pharmacy benefit to escape the medical OOP cap.
 assert.throws(()=>validateCostCase({...newCostCase({procedureId:'carpal-open'}),benefit:'Pharmacy'}),/medical benefit only/);
});
test('staff hand-off keeps Medigap on Original Medicare as an unmodeled secondary and refuses non-medical lines',()=>{
 assert.deepEqual(costContextForPlan('Medigap','Traditional Medicare'),{payer:'Traditional Medicare',line:'Traditional Medicare',secondary:'verified-other'});
 assert.deepEqual(costContextForPlan('MDX Hawaiʻi','Medicare Advantage'),{payer:'MDX',line:'Medicare Advantage',secondary:'unknown'});
 assert.deepEqual(costContextForPlan('Other Medicare Advantage','Medicare Advantage'),{payer:'Other',line:'Medicare Advantage',secondary:'unknown'});
 assert.deepEqual(costContextForPlan('Workers compensation','Delegated / claim-specific'),{payer:'Workers compensation',line:'Workers compensation',secondary:'unknown'});
 assert.match(costContextForPlan('HMSA','Medicare Part D').unavailable,/not the medical payer/);
 assert.match(costContextForPlan('HMA / Verdegard','Delegated / claim-specific').unavailable,/not the medical payer/);
 // Medigap inpatient keeps the Part A block and the no-OOP-cap rule.
 const h=costContextForPlan('Medigap','Traditional Medicare');
 let x=newCostCase({procedureId:'total-hip',payer:h.payer,line:h.line,setting:'Hospital inpatient'});
 x={...x,secondary:h.secondary,planLabel:'Medigap - Plan G fictional',network:'in-network',coverage:'staff-verified-covered',facilityId:'queens-honolulu',deductibleRemaining:283,oopRemaining:3000};
 x=priced(x,{amounts:{surgeon:1800,facility:22000,anesthesia:500},source:'cms-medicare-rate'});
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,null);
 assert.ok(r.missingRequired.some(v=>v.id==='facility'&&v.reason.includes('Part A')));
 assert.equal(r.isScenario,false);
 assert.ok(r.messages.some(m=>m.includes('Medigap')));
});
test('charge components follow the service type: no surgeon or anesthesia line for imaging, DXA or therapy',()=>{
 const mri=newCostCase({procedureId:'mri-knee',setting:'Hospital outpatient'});
 assert.deepEqual(mri.items.map(v=>v.id+(v.required?'*':'')),['imaging-global*','imaging-read']);
 const dexa=newCostCase({procedureId:'dexa',setting:'Office'});
 assert.deepEqual(dexa.items.map(v=>v.id+(v.required?'*':'')),['imaging-global*','imaging-read']);
 assert.deepEqual(newCostCase({procedureId:'office-pt',setting:'Office'}).items.map(v=>v.id+(v.required?'*':'')),['service*']);
 assert.deepEqual(newCostCase({procedureId:'dme-brace',setting:'Office'}).items.map(v=>v.id+(v.required?'*':'')),['service*']);
 assert.deepEqual(newCostCase({procedureId:'prp',setting:'Office'}).items.map(v=>v.id+(v.required?'*':'')),['surgeon*','product']);
 assert.deepEqual(newCostCase({procedureId:'genicular-rfa',setting:'ASC'}).items.map(v=>v.id+(v.required?'*':'')),['surgeon*','product','facility*','anesthesia']);
 assert.equal(newCostCase({procedureId:'prp',setting:'Office'}).items[0].label,'Professional procedure fee');
 // Surgery keeps the required anesthesia line (except hand), the gel path is unchanged.
 assert.ok(newCostCase({procedureId:'total-knee',setting:'ASC'}).items.some(v=>v.id==='anesthesia'&&v.required));
 assert.ok(newCostCase({procedureId:'carpal-open',setting:'ASC'}).items.some(v=>v.id==='anesthesia'&&!v.required));
 assert.deepEqual(newCostCase({procedureId:'knee-gel',setting:'Office'}).items.map(v=>v.id),['surgeon','gel-product','additional-office']);
 // An imaging estimate completes with one priced line and no invented anesthesia charge.
 let x=staffVerified(mri,{planLabel:'Fictional PPO',facilityId:'queens-honolulu',deductibleRemaining:0});
 x=priced(x,{amounts:{'imaging-global':900},source:'payer-negotiated-rate'});
 assert.equal(estimatePatientCost(x).totalRequired,180);
});
test('Original Medicare hospital-outpatient facility is not pre-filled at 20 percent and explains the APC copayment',()=>{
 const x=newCostCase({procedureId:'total-knee',payer:'Traditional Medicare',line:'Traditional Medicare',setting:'Hospital outpatient'});
 const facility=x.items.find(v=>v.id==='facility');
 assert.equal(facility.method,'unknown');
 assert.equal(facility.percentage,null);
 assert.equal(facility.deductibleApplies,true);
 assert.equal(x.items.find(v=>v.id==='surgeon').method,'coinsurance');
 const r=estimatePatientCost(x);
 assert.ok(r.messages.some(m=>m.includes('APC')));
 assert.ok(r.missingRequired.some(v=>v.id==='facility'));
 // ASC and office keep the usual Part B default.
 assert.equal(newCostCase({procedureId:'total-knee',payer:'Traditional Medicare',line:'Traditional Medicare',setting:'ASC'}).items.find(v=>v.id==='facility').percentage,20);
});
test('payer cost tools are scoped to the plan line and benefit',()=>{
 const ids=v=>selectCostGuidance(v).tools.filter(t=>t.payers.length).map(t=>t.id);
 assert.deepEqual(ids(newCostCase({payer:'HMSA',line:'Commercial'})),['hmsa']);
 assert.deepEqual(ids(newCostCase({payer:'HMSA',line:'Medicare Advantage'})),['hmsa-ma']);
 assert.deepEqual(ids(newCostCase({payer:'HMSA',line:'QUEST / Medicaid'})),['quest']);
 assert.deepEqual(ids(newCostCase({payer:'ʻOhana / Wellcare',line:'QUEST / Medicaid'})),['quest']);
 assert.deepEqual(ids(newCostCase({payer:'UHA',line:'Commercial'})),['uha-medical']);
 assert.deepEqual(ids(newCostCase({payer:'Traditional Medicare',line:'Traditional Medicare'})),['medicare','medicare-opps']);
 assert.match(COST_PAYER_TOOLS.find(t=>t.id==='medicare-opps').note,/not pre-filled/);
 assert.deepEqual(ids(newCostCase({procedureId:'drug-prolia',payer:'UHA',line:'Commercial',benefit:'Pharmacy'})),['uha-medical','uha-rx']);
 const quest=COST_PAYER_TOOLS.find(t=>t.id==='quest');
 assert.match(quest.title,/not the Med-QUEST member handbook/);
 assert.ok(quest.payers.includes('ʻOhana / Wellcare'));
});
test('assumption-only totals are labelled in the result and the worksheet names the unverified items',()=>{
 let x=newCostCase({procedureId:'carpal-open',payer:'HMSA',line:'Commercial',setting:'ASC'});
 x=priced(x,{amounts:{surgeon:1000,facility:2000},source:'unverified'});
 x.items=x.items.map(v=>({...v,deductibleApplies:false}));
 const r=estimatePatientCost(x);
 assert.equal(r.totalRequired,600);
 assert.equal(r.isScenario,false);
 assert.equal(r.confidence.level,'assumption-only');
 assert.deepEqual(r.confidence.unverified,['coverage','network','secondary coverage','plan product','rate source']);
 const text=costWorksheet(x);
 assert.match(text,/CONFIDENCE: ASSUMPTION-ONLY \(unverified: coverage, network, secondary coverage, plan product, rate source\)/);
 assert.match(text,/source: unverified/);
 assert.match(text,/Medical deductible left after known items: unknown/);
 assert.doesNotMatch(text,/STAFF-VERIFIED/);
});
