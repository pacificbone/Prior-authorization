import test from 'node:test';
import assert from 'node:assert/strict';
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
 for(const phrase of ['Insurance and exact plan','Medication or procedure','Formulary, coverage and PA requirements',
     'Patient cost estimate','Supporting documentation & staff communication']){
  assert.ok(page.includes(phrase),phrase);
 }
 assert.match(page,/One workflow: insurer/);
 assert.match(page,/Staff/);
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
 assert.match(html,/Not yet available/);
 assert.match(html,/Download authorization checklist/);
 assert.match(html,/Download conditional cost worksheet/);
 assert.match(html,/Remaining|Deductible remaining/);
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
 assert.match(html,/No verified code|Candidate codes/);
 x.serviceId='evenity';x.search='evenity';x.cost=newCostCase({procedureId:'drug-evenity',payer:'HMSA',line:'Commercial'});
 assert.match(renderStaffPage(x),/Evenity/);
});
