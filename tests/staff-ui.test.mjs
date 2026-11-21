import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderStaffPage as renderStaffPageAt,staffDefaultYear,staffGlance,glanceSignals,addendumPanel,STAFF_SEARCH_NO_MATCH,STAFF_GLANCE_CAVEAT,STAFF_DATE_NEEDED,STAFF_PRODUCT_NEEDED,STAFF_NO_PA_STATEMENT,PA_SIGNAL_LABELS} from '../public/staff-page.mjs';
import {PA_SIGNAL_TYPES} from '../shared/product-preferences.mjs';
// The page is rendered as of a fixed Hawaiʻi policy day so no assertion depends on today's date.
const POLICY_DAY='2026-11-21';
const renderStaffPage=(st,options={})=>renderStaffPageAt(st,{asOf:POLICY_DAY,...options});
import {newCostCase} from '../shared/patient-cost.mjs';
import {staffContext,staffPlansForPayer,staffGetService,STAFF_YEARS} from '../shared/staff-workflow.mjs';
const h=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
 assert.match(html,/Separately billable implant:/);
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
 assert.match(medHtml,/Medication product: Not yet available/);
 assert.doesNotMatch(medHtml,/Implant \/ gel \/ cellular product/);
});
test('step order is plan, service, coverage, costs, packet, then the blank addendum library; PA routes get real styles',()=>{
 const html=renderStaffPage(state('AlohaCare','aloha-quest','carpal-open','Medical'));
 const order=['id="staff-plan"','id="staff-service"','id="staff-requirements"','id="staff-cost"','id="staff-packet"','id="staff-clinical-addendum"'].map(x=>html.indexOf(x));
 // Every element id on the staff screen is unique (the cost Coverage select once shared its id with step 3).
 const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(ids.filter((v,i)=>ids.indexOf(v)!==i),[]);
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
// Round 2: plan-year default, search counts, planned service date in step 3 and the at-a-glance block.
// Every case passes an explicit service date or day, so nothing depends on today's date.
const dated=(payer,planId,serviceId,gelProductId,serviceDate='2026-11-21')=>({...state(payer,planId,serviceId,'Medical'),gelProductId,serviceDate});
const glanceOf=html=>(html.match(/<section class="staff-glance"[\s\S]*?<\/section>/)||[''])[0];
test('plan year defaults to the policy-day year within the supported years, else the latest one',()=>{
 assert.equal(staffDefaultYear('2026-11-21'),2026);
 assert.equal(staffDefaultYear('2027-01-05'),2027);
 assert.equal(staffDefaultYear('2028-03-01'),STAFF_YEARS.at(-1));
 assert.equal(staffDefaultYear('2025-12-31'),STAFF_YEARS.at(-1));
});
test('search shows a match count, and a hint when nothing matches',()=>{
 const x=state();x.search='TKA';
 const html=renderStaffPage(x);
 assert.match(html,/id="staff-search-count"[^>]*>\d+ match(es)?</);
 assert.match(html,/<option value="total-knee"/);
 x.search='zzqx';
 assert.ok(renderStaffPage(x).includes(STAFF_SEARCH_NO_MATCH));
 assert.equal(STAFF_SEARCH_NO_MATCH,'No match - try a brand, procedure name or code (for example TKA, Synvisc, 27447).');
 x.search='';
 assert.match(renderStaffPage(x),/id="staff-search-count"[^>]*><\/small>/);
});
test('the planned service date input sits in step 3 exactly once, even if step 6 still prints its own',()=>{
 for(const st of [state(),dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one')]){
  const html=renderStaffPage(st);
  assert.equal(html.match(/id="staff-service-date"/g).length,1);
  const step3=html.slice(html.indexOf('id="staff-requirements"'),html.indexOf('id="staff-cost"'));
  assert.match(step3,/id="staff-service-date"/);
 }
 assert.doesNotMatch(addendumPanel(dated('HMSA','hmsa-quest','prolia','')),/staff-service-date/);
 assert.match(renderStaffPage(dated('HMSA','hmsa-quest','prolia','')),/id="staff-service-date" value="2026-11-21"/);
});
test('at a glance shows published PA signals deduped by signal, the product lists and the preferred status',()=>{
 const html=renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one'));
 const glance=glanceOf(html);
 assert.ok(glance.includes(h(STAFF_GLANCE_CAVEAT)),'caveat');
 assert.equal(STAFF_GLANCE_CAVEAT,"Published policy statements - this member's plan adoption, eligibility and authorization are not verified.");
 assert.match(glance,/<span class="pill">Preferred<\/span> <strong>Synvisc-One<\/strong>/);
 // Two HMSA documents carry the precertification signal; it is shown once with both titles.
 assert.equal(glance.match(/<li><strong>/g).length,1);
 assert.match(glance,/Source: HMSA Hyaluronate Products — Exceptions Criteria · HMSA Hyaluronate Products — Clinical Policy/);
 assert.match(glance,/Preferred<\/span><p>Euflexxa, Synvisc, Synvisc-One<\/p>/);
 assert.match(glance,/Non-preferred<\/span><p>Durolane/);
 assert.doesNotMatch(glance,/staff-glance-warn/);
 assert.doesNotMatch(html,/Not verified for this particular plan and service/);
 assert.match(html,/Prior authorization<\/strong><span>Published policy states prior authorization \(precertification\) is required\.<small>Member-level authorization: not verified\.<\/small>/);
 assert.doesNotMatch(html,/Approved|Guaranteed|is covered\b/);
 // The at-a-glance block is the first thing in step 3.
 const step3=html.slice(html.indexOf('id="staff-requirements"'));
 assert.ok(step3.indexOf('id="staff-glance"')<step3.indexOf('Formulary / coverage'));
});
test('non-preferred and excluded selections get an amber notice with the exception text',()=>{
 const hmsa=glanceOf(renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','durolane')));
 assert.match(hmsa,/<p class="notice amber staff-glance-warn" role="note"><strong>Durolane is listed as non-preferred<\/strong>/);
 assert.match(hmsa,/Exception path stated: Section B/);
 const uhc=glanceOf(renderStaffPage(dated('UnitedHealthcare','uhc-commercial','knee-gel','synvisc')));
 assert.match(uhc,/staff-glance-warn[\s\S]*Synvisc is listed as typically excluded/);
 assert.match(uhc,/Typically excluded<\/span>/);
 assert.match(uhc,/Coverage contingent on the policy’s diagnosis-specific criteria<\/span><p>Durolane, Euflexxa, Gelsyn-3<\/p>/);
 assert.match(uhc,/Policy summary: Typically excluded/);assert.match(uhc,/Also named in the matched documents \(not selectable here\): Hymovis One\./);
 assert.match(uhc,/Selectable products, by their Coverage Desk names, as classified in the matched documents/);assert.doesNotMatch(uhc,/as printed in the matched documents/);
 // No PA statement is recorded for an excluded brand: the glance says Coverage Desk has none, and the headline keeps "Not verified".
 const excluded=renderStaffPage(dated('UnitedHealthcare','uhc-commercial','knee-gel','synvisc'));
 assert.ok(glanceOf(excluded).includes(h(STAFF_NO_PA_STATEMENT)));
 assert.match(excluded,/Prior authorization<\/strong><span>Not verified for this particular plan and service/);
 assert.doesNotMatch(excluded,/states no prior-authorization rule|Published policy reference on file/);
});
test('an empty date asks for one only when a date would show references; no evidence keeps the old headline',()=>{
 const noDate=renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one',''));
 assert.match(glanceOf(noDate),new RegExp(STAFF_DATE_NEEDED.replace(/\./g,'\\.')));
 assert.equal(STAFF_DATE_NEEDED,'Enter a planned service date to see payer references.');
 assert.match(noDate,/Prior authorization<\/strong><span>Not verified for this particular plan and service/);
 const none=renderStaffPage(dated('AlohaCare','aloha-quest','carpal-open',''));
 assert.doesNotMatch(none,/Enter a planned service date|Published policy statements -/);
 assert.match(none,/No published payer reference is indexed/);
 assert.match(none,/Not verified for this particular plan and service/);
});
test('a service date outside the plan year is flagged in step 3',()=>{
 const html=renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one','2027-02-01'));
 assert.match(html,/The planned service date is in 2027; this plan view is for 2026\./);
 assert.doesNotMatch(renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one','2026-12-01')),/staff-year-note/);
 assert.match(renderStaffPage({...state(),serviceDate:'2027-03-01'}),/The planned service date is in 2027; this plan view is for 2026\./);
});
test('a step-6 template override never changes the step-3 glance; legacy letter builder only with legacy on',()=>{
 const st={...dated('HMSA','hmsa-select-choice','knee-gel','synvisc-one'),clinicalTemplateId:'gel-durolane'};
 assert.match(glanceOf(renderStaffPage(st)),/Preferred<\/span> <strong>Synvisc-One/);
 assert.equal(staffGlance(st,'2026-11-21').glance.selected.productId,'gel-synvisc-one');
 assert.deepEqual(glanceSignals(staffGlance(st,'2026-11-21').glance).map(x=>x.signal),['precertification-required']);
 assert.doesNotMatch(renderStaffPage(state()),/data-page="authorization"/);
 assert.match(renderStaffPage(state(),{legacy:true}),/data-page="authorization"/);
 for(const key of Object.keys(PA_SIGNAL_LABELS))assert.match(PA_SIGNAL_LABELS[key],/\S/);
 assert.deepEqual(Object.keys(PA_SIGNAL_LABELS).sort(),[...PA_SIGNAL_TYPES].sort());
});

test('the Prior authorization answer never reads a reference without a PA statement as "no PA"; criteria statements sit under Criteria',()=>{
 const pa=html=>(html.match(/<strong>Prior authorization<\/strong><span>([\s\S]*?)<\/span><\/div>/)||[])[1]||'';
 const crit=html=>(html.match(/<div class="staff-answer staff-criteria-answer"><strong>Criteria<\/strong><span>([\s\S]*?)<\/span><\/div>/)||[])[1]||'';
 const cases=[['UnitedHealthcare','uhc-commercial','evenity'],['UnitedHealthcare','uhc-commercial','prolia'],['UnitedHealthcare','uhc-ma','total-knee'],['UnitedHealthcare','uhc-commercial','alendronate'],
  ['UnitedHealthcare','uhc-quest','prolia'],['UnitedHealthcare','uhc-dual','prolia'],['Traditional Medicare','original-b','prolia'],['UnitedHealthcare','uhc-commercial','jubbonti']];
 for(const [payer,planId,serviceId] of cases){
  const html=renderStaffPage(dated(payer,planId,serviceId,''));
  assert.doesNotMatch(html,/states no prior-authorization rule|Published policy reference on file/,payer+planId+serviceId);
  assert.match(pa(html),/^(Published medical policy may apply; review its exact plan scope and requirements|Published code PA-list record; verify exact plan and year|Not verified for this particular plan and service)$/,payer+planId+serviceId);
 }
 // A medical policy on file keeps the earlier "may apply" wording rather than describing the document.
 assert.equal(pa(renderStaffPage(dated('UnitedHealthcare','uhc-commercial','evenity',''))),'Published medical policy may apply; review its exact plan scope and requirements');
 // A sourcing reference alone, or a proposed LCD alone, is never introduced as a published policy statement.
 const sourcing=renderStaffPage(dated('UnitedHealthcare','uhc-commercial','alendronate',''));
 assert.doesNotMatch(glanceOf(sourcing),new RegExp(STAFF_GLANCE_CAVEAT.slice(0,25)));assert.match(glanceOf(sourcing),/sourcing reference, not a coverage or criteria source/);
 const proposed=renderStaffPage(dated('Traditional Medicare','original-b','knee-gel','synvisc-one'));
 assert.doesNotMatch(glanceOf(proposed),/Published policy statements -/);
 assert.match(glanceOf(proposed),/No coverage or criteria policy in effect is indexed[\s\S]*proposed, not in effect; not a current requirement/);
 assert.equal(pa(proposed),'Not verified for this particular plan and service');
 // InterQual, "unproven" and MA-refers-on statements answer criteria, not PA.
 const tka=renderStaffPage(dated('UnitedHealthcare','uhc-commercial','total-knee',''));
 assert.doesNotMatch(pa(tka),/InterQual/);assert.match(crit(tka),/licensed InterQual criteria/);
 const acl=renderStaffPage(dated('UnitedHealthcare','uhc-ma','acl-reconstruction',''));
 assert.doesNotMatch(pa(acl),/InterQual|refers/);assert.match(crit(acl),/^Published Medicare Advantage policy refers to the UHC commercial policy where no LCD applies/);
 // SI joint fusion: the summary row names other devices or indications as unproven, never the selected service itself.
 const sij=crit(renderStaffPage(dated('UnitedHealthcare','uhc-commercial','si-joint-fusion','')));
 assert.match(sij,/lists other devices or indications as unproven/);assert.doesNotMatch(sij,/lists this service or device as unproven/);
 // UHC Medicare Advantage CPT 64728: balloon only; the non-balloon technique is not called "not reasonable and necessary".
 assert.match(crit(renderStaffPage(dated('UnitedHealthcare','uhc-ma','carpal-balloon',''))),/not reasonable and necessary/);
 assert.doesNotMatch(renderStaffPage(dated('UnitedHealthcare','uhc-ma','carpal-ultrasound-other','')),/lists this service as not reasonable and necessary/);
 // Original Medicare: the no-PA statement is labelled as a Coverage Desk note, the same for every LCD-governed procedure.
 for(const serviceId of ['total-knee','total-hip','si-joint-fusion'])
  assert.match(pa(renderStaffPage(dated('Traditional Medicare','original-b',serviceId,''))),/^Coverage Desk note on the LCD record \(not LCD text\)/,serviceId);
});
test('knee gel without a brand asks for the brand instead of saying no reference is indexed',()=>{
 for(const [payer,planId] of [['HMSA','hmsa-select-choice'],['HMSA','hmsa-ma-individual'],['UnitedHealthcare','uhc-commercial'],['UnitedHealthcare','uhc-ma'],['Traditional Medicare','original-b']]){
  const html=renderStaffPage(dated(payer,planId,'knee-gel',''));
  assert.ok(glanceOf(html).includes(h(STAFF_PRODUCT_NEEDED)),payer+planId);
  assert.doesNotMatch(html,/No published payer reference is indexed/,payer+planId);
  assert.match(html,/Prior authorization<\/strong><span>Not verified — choose the gel product/,payer+planId);
  assert.equal(staffGlance(dated(payer,planId,'knee-gel',''),POLICY_DAY).needsProduct,true);
 }
 // A line with no gel reference for any brand keeps the plain message.
 assert.match(renderStaffPage(dated('AlohaCare','aloha-quest','knee-gel','')),/No published payer reference is indexed/);
 // Choosing a brand shows that brand's references.
 assert.match(glanceOf(renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc'))),/Preferred<\/span> <strong>Synvisc<\/strong>/);
});
test('overdue or soon-lapsing sources are flagged at the top of the glance and on the step-3 answers',()=>{
 const st={...dated('UnitedHealthcare','uhc-commercial','knee-gel','durolane','2027-03-21'),year:2027};
 const html=renderStaffPage(st,{asOf:'2027-03-21'}),glance=glanceOf(html);
 const notice=glance.indexOf('Source review overdue');
 assert.ok(notice>0&&notice<glance.indexOf('staff-glance-selected')&&notice<glance.indexOf('staff-glance-signals'),'notice first');
 assert.match(glance,/review was due 2027-02-13[\s\S]*Treat these statements as unconfirmed/);
 assert.match(html,/Prior authorization<\/strong><span>Published policy states prior authorization is not required for this product\.<small class="warn-text staff-review-flag">Source review overdue: treat as unconfirmed/);
 // The same selection on a day inside the review window carries no flag.
 const fresh=renderStaffPage(dated('UnitedHealthcare','uhc-commercial','knee-gel','durolane'));
 assert.doesNotMatch(fresh,/Source review overdue|staff-review-flag/);
 // A service date after the review window gets the re-check notice instead.
 const later=renderStaffPage(dated('HMSA','hmsa-select-choice','knee-gel','synvisc','2027-03-01'));
 assert.match(glanceOf(later),/Source review window ends before the service date/);assert.match(later,/staff-review-flag">Source review window ends before the service date/);
});
test('glance: unlisted brand, scope caveats, merged signal texts, Medigap primary claim and list expiry at the service date',()=>{
 // HMSA Synojoynt: no status is invented; the policy's own words for an unlisted product are shown, and the
 // exceptions criteria (which list only their own products) are not cited for the PA signal.
 for(const planId of ['hmsa-select-choice','hmsa-quest','hmsa-ma-individual']){
  const glance=glanceOf(renderStaffPage(dated('HMSA',planId,'knee-gel','synojoynt')));
  assert.match(glance,/staff-glance-unlisted[\s\S]*Synojoynt is not listed<\/strong> in the product table/,planId);
  assert.doesNotMatch(glance,/staff-glance-selected|staff-glance-warn/,planId);
  assert.doesNotMatch(glance,/Source: [^<]*Exceptions Criteria/,planId);
 }
 // HMSA MA Durolane: the preferred-product review caveat survives de-duplication of the precertification signal.
 assert.match(glanceOf(renderStaffPage(dated('HMSA','hmsa-ma-individual','knee-gel','durolane'))),/may still require a clinical prior authorization review/);
 // UHC Dual Complete: the step-therapy status carries the policy's excluded-plan caveat, for preferred and non-preferred brands.
 for(const gel of ['euflexxa','durolane'])assert.match(glanceOf(renderStaffPage(dated('UnitedHealthcare','uhc-dual','knee-gel',gel))),/Dual Complete H6824-002/,gel);
 // Medigap: Original Medicare's LCD and route govern the primary claim.
 const medigap=renderStaffPage({...state(),payer:'Medigap',planId:'medigap',serviceId:'total-hip',serviceDate:POLICY_DAY});
 assert.match(glanceOf(medigap),/Original Medicare primary claim \(Medigap pays secondary\)[\s\S]*L34163/);
 assert.doesNotMatch(medigap,/No published payer reference is indexed/);assert.match(medigap,/staff-pa-route[\s\S]*Medicare Coverage Database/);
 // HMAA extract: a list that lapses before a later service date is not shown as the current reviewed extract.
 const pharmacy=d=>renderStaffPage({...state(),payer:'HMAA',planId:'hmaa-employer',serviceId:'prolia',benefit:'Pharmacy',serviceDate:d});
 assert.match(pharmacy('2026-12-01'),/Reviewed extract from the published list HMAA-OPTUMRX-PREMIUM-2026-H2 is shown/);
 assert.match(pharmacy('2027-02-01'),/list ends 2026-12-31, before the planned service date/);
 assert.doesNotMatch(pharmacy('2027-02-01'),/Reviewed extract from the published list HMAA/);
});
