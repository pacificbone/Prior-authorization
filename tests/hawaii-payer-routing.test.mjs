import test from 'node:test';
import assert from 'node:assert/strict';
import {HAWAII_PAYER_ROUTING,payerRoutingFor} from '../shared/hawaii-payer-routing.mjs';
import {PAYER_DOCUMENTATION_BRANCHES,documentationBranchesFor} from '../shared/payer-documentation-branches.mjs';
import {renderClinicalAddendumPanel} from '../public/clinical-addendum-panel.mjs';

test('payer routing is scoped by exact carrier, line and category',()=>{
 assert.ok(payerRoutingFor({payer:'AlohaCare',line:'QUEST / Medicaid',category:'medication'}).length);
 assert.equal(payerRoutingFor({payer:'AlohaCare',line:'Commercial',category:'medication'}).length,0);
 assert.equal(payerRoutingFor({payer:'HMSA',line:'QUEST / Medicaid',category:'medication'}).length,0);
 assert.ok(payerRoutingFor({payer:'ʻOhana / Wellcare',line:'QUEST / Medicaid',category:'surgery'}).length);
 for(const r of HAWAII_PAYER_ROUTING){
  assert.match(r.sourceUrl,/^https:\/\//);
  assert.equal(r.exactPlanAdoption,false);
  assert.equal(r.fulfillmentVerified,false);
 }
});
test('clinical prompts never promote public evidence to exact-plan criteria',()=>{
 const branches=documentationBranchesFor(['hmsa-prolia-cq-2026'],'Initial');
 assert.equal(branches.length,1);
 assert.match(branches[0].title,/Prolia/);
 assert.equal(documentationBranchesFor(['hmsa-prolia-cq-2026'],'Repeat / continuation').length,1);
 assert.equal(documentationBranchesFor(['hmsa-prolia-cq-2026'],'Reconsideration / appeal').length,0);
 assert.equal(documentationBranchesFor(['hmsa-gel-clinical-2026'],'Initial').length,1);
 assert.equal(documentationBranchesFor(['hmsa-gel-clinical-2026'],'Repeat / continuation').length,1);
 assert.equal(documentationBranchesFor(['hmsa-gel-clinical-2026'],'Reconsideration / appeal').length,0);
 assert.ok(PAYER_DOCUMENTATION_BRANCHES.every(b=>b.fields.length>0&&b.fields.every(f=>f.id&&f.label)));
});
test('staff screen renders fail-closed preflight and payer-specific public routing',()=>{
 const base={payer:'AlohaCare',planId:'aloha-quest',year:2026,serviceId:'prolia',benefit:'Medical',
  requestType:'Initial',setting:'Office',serviceDate:'2026-11-08'};
 const html=renderClinicalAddendumPanel(base);
 assert.match(html,/Authorization packet preflight/);
 assert.match(html,/not cleared for submission/);
 assert.match(html,/Exact-plan adoption: NOT VERIFIED/);
 assert.match(html,/Ordering blocked/);
 assert.match(html,/AlohaCare/);
 assert.doesNotMatch(html,/Ohana Medicaid code-specific authorization lookup/);
});
