import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCostPage} from '../public/cost-page.mjs';
import {newCostCase} from '../shared/patient-cost.mjs';

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
 const html=renderCostPage({...base,planLabel:'HMSA A&B + "Choice"'},'arthroplasty');
 assert.match(html,/A&amp;B/);
 assert.match(html,/&quot;Choice&quot;/);
 assert.doesNotMatch(html,/hmsa\.com\/member_id\//);
});
test('Medicare page shows verified statutory deductible facts but not a fictional surgery quote',()=>{
 const base=newCostCase({payer:'Traditional Medicare',line:'Traditional Medicare'});
 const html=renderCostPage(base,'arthroplasty');
 assert.match(html,/\$283/);
 assert.match(html,/\$1736/);
 assert.match(html,/per benefit period/);
 assert.match(html,/Not available/);
});
