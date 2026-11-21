import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCostPage} from '../public/cost-page.mjs';
import {newCostCase,estimatePatientCost} from '../shared/patient-cost.mjs';

test('new cost page shows no patient price by default and requires documented components',()=>{
 const page=renderCostPage(newCostCase(),'arthroplasty');
 assert.match(page,/Estimate out-of-pocket costs/);
 assert.match(page,/Not a patient quote/);
 assert.match(page,/No complete estimate/);
 assert.match(page,/Not available/);
 assert.match(page,/Surgeon \/ professional procedure fee/);
 assert.match(page,/Hospital or ASC facility fee/);
 assert.match(page,/Anesthesia professional/);
 assert.match(page,/id="cost-deductible"/);
 assert.match(page,/Remaining medical deductible/);
 assert.match(page,/id="cost-benefit" disabled/);
 assert.match(page,/id="cost-oop"/);
 assert.match(page,/data-cost-field="source"/);
 assert.match(page,/id="cost-network"/);
 assert.match(page,/Not a patient quote/);
 assert.doesNotMatch(page,/<div class="cost-total">\$/);
});
test('gel comparison requires product and breaks out J-code and administration code',()=>{
 const base=newCostCase({procedureId:'knee-gel',setting:'Office',gelProductId:'durolane',guidance:'with-ultrasound'});
 const html=renderCostPage(base,'injections');
 assert.match(html,/Durolane/);
 assert.match(html,/J7318/);
 assert.match(html,/20611/);
 assert.match(html,/Rate source/);
 assert.match(html,/Unpriced/);
});
test('medications can have distinct pharmacy benefit and medical drug product lines',()=>{
 const base=newCostCase({procedureId:'drug-evenity',payer:'HMSA',line:'Commercial',setting:'Office'});
 const html=renderCostPage(base,'medication');
 assert.match(html,/Evenity \(romosozumab\)/);
 assert.match(html,/Drug benefit|Pharmacy|Medical/);
 assert.match(html,/medication product/);
 assert.match(html,/Injection \/ infusion administration/);
 assert.match(html,/Not available/);
});
test('plan product names are HTML-escaped and unrelated charges are not shown as verified',()=>{
 const base=newCostCase();
 const html=renderCostPage({...base,planLabel:"HMSA A&B + Choice's"},'arthroplasty');
 assert.match(html,/A&amp;B/);
 assert.match(html,/Choice&#39;s/);
 assert.doesNotMatch(html,/hmsa\.com\/member_id\//);
});
test('Medicare page shows verified statutory deductible facts but not a fictional surgery quote',()=>{
 const base=newCostCase({payer:'Traditional Medicare',line:'Traditional Medicare'});
 const html=renderCostPage(base,'arthroplasty');
 assert.match(html,/\$283/);
 assert.match(html,/\$1,736/);
 assert.match(html,/2026 Part B deductible/);
 assert.match(html,/per benefit period/);
 assert.match(html,/Not available/);
});
test('a complete but unverified total is titled assumption-only, never a conditional subtotal, and capped lines are annotated',()=>{
 const base=newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial',setting:'ASC'});
 // In network so the remaining-OOP cap applies; coverage, secondary, plan and sources stay unverified.
 const priced={...base,network:'in-network',deductibleRemaining:1500,oopRemaining:700,items:base.items.map(x=>x.required?{...x,allowed:x.id==='surgeon'?2000:x.id==='facility'?7500:900,method:'coinsurance',percentage:20,deductibleApplies:true}:x)};
 const html=renderCostPage(priced,'arthroplasty');
 assert.match(html,/Assumption-only scenario/);
 assert.match(html,/cost-total-assumption/);
 assert.match(html,/Unverified: coverage, secondary coverage, plan product, rate source/);
 assert.doesNotMatch(html,/Conditional modeled subtotal/);
 assert.match(html,/OOP limit reached/);
 const verified={...priced,planLabel:'Fictional plan',coverage:'staff-verified-covered',network:'in-network',secondary:'none',items:priced.items.map(x=>x.required?{...x,source:'payer-negotiated-rate'}:x)};
 assert.equal(estimatePatientCost(verified).isScenario,true);
 const html2=renderCostPage(verified,'arthroplasty');
 assert.match(html2,/Conditional modeled subtotal/);
 assert.doesNotMatch(html2,/Assumption-only scenario/);
 // Pharmacy-benefit medication cases cannot tick the medical OOP box.
 const rx=newCostCase({procedureId:'drug-prolia',payer:'HMSA',line:'Commercial',benefit:'Pharmacy',setting:'Office'});
 assert.match(renderCostPage(rx,'medication'),/data-cost-field="oopEligible"[^>]*disabled/);
});
