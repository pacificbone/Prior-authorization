import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderStaffPage} from '../public/staff-page.mjs';
import {newCostCase} from '../shared/patient-cost.mjs';
import {staffContext,staffPlansForPayer,staffGetService} from '../shared/staff-workflow.mjs';

function state(payer='',planId='',serviceId='',benefit='Medical'){
 const plan=payer&&planId?staffContext({payer,planId,serviceId,benefit}).plan:null;
 const service=staffGetService(serviceId);
 return {
  payer,planId,year:2026,serviceId,benefit,requestType:'Initial',setting:'Office',
  gelProductId:'',guidance:'without-ultrasound',search:'',docs:{},
  cost:plan&&service?newCostCase({
    procedureId:service.type==='medication'?'drug-'+serviceId:serviceId,
    payer:payer==='Veterans Affairs'?'Veterans Affairs':payer,
    line:plan.program==='quest'?'QUEST / Medicaid':plan.program==='original-medicare'?'Traditional Medicare':'Commercial',
    setting:'Office',year:2026,benefit
  }):null,
  lookup:{sourceId:null,term:'',busy:false,result:null,error:''}
 };
}
test('a single staff workflow includes five steps and advanced tools are secondary',()=>{
 const page=renderStaffPage(state());
 for(const phrase of ['Insurance and plan identity','Medication or procedure','Formulary, coverage and PA requirements',
     'Patient cost estimate','Supporting documentation & staff communication']){
  assert.ok(page.includes(phrase),phrase);
 }
 assert.match(page,/One workflow: insurer/);
 assert.match(page,/FRONT DESK \/ AUTHORIZATION TEAM/);
 assert.match(page,/Advanced reference tools/);
 assert.match(page,/Synthetic trial/);
});
test('HMSA plan select cannot display VA or UHC plan options',()=>{
 const page=renderStaffPage(state('HMSA'));
 const match=page.match(/<select id="staff-plan-select"[\s\S]*?<\/select>/);
 assert.ok(match);
 assert.match(match[0],/hmsa-quest/);
 assert.doesNotMatch(match[0],/value="va"/);
 assert.doesNotMatch(match[0],/value="uhc-quest"/);
 assert.doesNotMatch(match[0],/value="kaiser-quest"/);
 const uhc=renderStaffPage(state('UnitedHealthcare'));
 const other=uhc.match(/<select id="staff-plan-select"[\s\S]*?<\/select>/)[0];
 assert.match(other,/value="uhc-quest"/);
 assert.doesNotMatch(other,/value="hmsa-quest"/);
 assert.doesNotMatch(other,/value="va"/);
});
test('HMSA QUEST pharmacy lookup appears for exact plan, but not for HMSA commercial',()=>{
 const quest=renderStaffPage(state('HMSA','hmsa-quest','alendronate','Pharmacy'));
 assert.match(quest,/staff-check-formulary/);
 assert.match(quest,/22780AA1111111/);
 const commercial=renderStaffPage(state('HMSA','hmsa-select-choice','alendronate','Pharmacy'));
 assert.doesNotMatch(commercial,/staff-check-formulary/);
 assert.match(commercial,/not imported|not yet have complete/);
 assert.match(commercial,/Official source/);
});
test('procedure screen keeps patient price missing and documents separate surgeon and facility charges',()=>{
 const st=state('HMSA','hmsa-select-choice','total-knee','Medical');
 st.setting='ASC';
 st.cost=newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial',setting:'ASC'});
 const html=renderStaffPage(st);
 assert.match(html,/Surgeon \/ professional procedure fee/);
 assert.match(html,/Hospital or ASC facility fee/);
 assert.match(html,/Anesthesia/);
 assert.match(html,/Surgeon:/);
 assert.match(html,/Facility:/);
 assert.match(html,/Implant \/ gel \/ cellular product:/);
 assert.match(html,/Not yet available/);
 assert.match(html,/Download authorization checklist/);
 assert.match(html,/Download conditional cost worksheet/);
 assert.match(html,/Remaining|Deductible remaining/);
});
test('cost hero never presents an unverified total as the estimate and keeps the caveats open',()=>{
 const st=state('HMSA','hmsa-select-choice','total-knee','Medical');
 st.setting='ASC';
 const cost=newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial',setting:'ASC'});
 cost.items=cost.items.map(x=>x.required?{...x,allowed:1000,method:'coinsurance',percentage:20,deductibleApplies:false}:x);
 st.cost=cost;
 const html=renderStaffPage(st);
 assert.match(html,/Assumption-only scenario: \$600\.00/);
 assert.match(html,/staff-cost-assumption/);
 assert.match(html,/Do not read this as the patient’s expected bill/);
 assert.match(html,/<details class="staff-checks" open>/);
 assert.doesNotMatch(html,/<strong class="">\$600\.00</);
 const verified={...cost,planLabel:'Fictional plan',coverage:'staff-verified-covered',network:'in-network',secondary:'none',items:cost.items.map(x=>x.required?{...x,source:'payer-negotiated-rate'}:x)};
 const html2=renderStaffPage({...st,cost:verified});
 assert.doesNotMatch(html2,/Assumption-only scenario/);
 assert.match(html2,/Conditional scenario — not a verified patient quote/);
 const med=state('HMSA','hmsa-select-choice','alendronate','Pharmacy');
 med.cost=newCostCase({procedureId:'drug-alendronate',payer:'HMSA',line:'Commercial',benefit:'Pharmacy'});
 const medHtml=renderStaffPage(med);
 assert.doesNotMatch(medHtml,/Surgeon: Not yet available/);
 assert.match(medHtml,/Implant \/ gel \/ cellular product: Not yet available/);
});
test('step order is plan, service, coverage, costs, packet, then the blank addendum library; PA routes get real styles',()=>{
 const html=renderStaffPage(state('AlohaCare','aloha-quest','carpal-open','Medical'));
 const order=['id="staff-plan"','id="staff-service"','id="staff-coverage"','id="staff-cost"','id="staff-packet"','id="staff-clinical-addendum"'].map(x=>html.indexOf(x));
 assert.ok(order.every((v,i)=>v>0&&(i===0||v>order[i-1])),JSON.stringify(order));
 assert.match(html,/<span class="staff-number">6<\/span> Blank clinical addendum/);
 assert.match(html,/data-action="staff-sample"/);
 assert.match(html,/<details class="staff-sources"><summary>Keragon authorization workflow/);
 const css=readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
 for(const cls of ['staff-pa-route','staff-pa-actions','staff-pa-action','staff-vendor-pa','staff-vendor-steps','staff-vendor-details','payer-evidence-entry','staff-cost-assumption'])assert.ok(css.includes('.'+cls),cls);
});
test('selected MA plan is shown with plan scope but never called a covered drug',()=>{
 const ma=staffPlansForPayer('HMSA',2026).find(x=>x.id==='hmsa-ma-individual');
 assert.ok(ma);
 const html=renderStaffPage(state('HMSA',ma.id,'prolia','Medical'));
 assert.match(html,/Akamai/);
 assert.match(html,/Medical-benefit drug/);
 assert.match(html,/plan/);
 assert.doesNotMatch(html,/Approved for surgery|Guaranteed payment/);
});
test('service catalog search can find peripheral procedures and medicines',()=>{
 const x=state('HMSA','hmsa-select-choice','trigger-finger-percutaneous','Medical');
 x.search='trigger';
 const html=renderStaffPage(x);
 assert.match(html,/Percutaneous \/ ultrasound-guided trigger finger release/);
 assert.match(html,/Billing code not verified/);
 x.serviceId='evenity';x.search='evenity';x.cost=newCostCase({procedureId:'drug-evenity',payer:'HMSA',line:'Commercial'});
 assert.match(renderStaffPage(x),/Evenity/);
});
