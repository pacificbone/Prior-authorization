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
 // A cited document can cover several lines of the same payer, never another payer.
 assert.ok(payerRoutingFor({payer:'Kaiser Permanente',line:'Medicare Advantage',category:'surgery'}).length);
 assert.ok(payerRoutingFor({payer:'AlohaCare',line:'Medicare Advantage',category:'medication'}).length);
 assert.equal(payerRoutingFor({payer:'Kaiser Permanente',line:'Traditional Medicare',category:'surgery'}).length,0);
 assert.ok(HAWAII_PAYER_ROUTING.every(r=>Array.isArray(r.lines)&&r.lines.includes(r.line)));
 assert.ok(HAWAII_PAYER_ROUTING.filter(r=>r.payer==='ʻOhana / Wellcare').every(r=>r.title.startsWith('ʻOhana')));
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
 // HMSA Commercial/QUEST gel branches restate sections B–D only: no imaging or objective-findings fields, the six-month
 // criterion stated without an exception, the C.2 second-course switch and the D.1 no-prior-authorization rule.
 const cqInitial=documentationBranchesFor(['hmsa-gel-clinical-2026'],'Initial')[0],cqRenewal=documentationBranchesFor(['hmsa-gel-clinical-2026'],'Repeat / continuation')[0];
 const cqText=b=>b.fields.map(f=>f.label).join(' ')+' '+b.notes;
 assert.doesNotMatch(cqText(cqInitial)+cqText(cqRenewal),/[Ii]maging|objective findings|applicable exception|Source summary|Current symptoms/);
 assert.ok(cqInitial.fields.some(f=>f.label==='Inadequate response to 6 months of conservative therapy'));
 assert.match(cqText(cqInitial),/acetaminophen, NSAIDs or tramadol/);assert.match(cqText(cqInitial),/adverse or allergic reaction/);
 assert.match(cqText(cqRenewal),/no previous authorization\/precertification[\s\S]*must meet the initial criteria in section C/);
 assert.match(cqText(cqRenewal),/at least 6 months after it/);
 // The exception (including its current-course path) prints on every request type, only for table-1 non-preferred brands;
 // a brand the table does not list gets the confirm-status branch instead. Product-scoped branches never cross procedures.
 for(const type of ['Initial','Repeat / continuation','Reconsideration / appeal']){
  assert.deepEqual(documentationBranchesFor(['hmsa-gel-preference-2026'],type,'gel-monovisc').map(b=>b.id),['hmsa-gel-exception'],type);
  assert.deepEqual(documentationBranchesFor(['hmsa-gel-preference-2026'],type,'gel-synojoynt').map(b=>b.id),['hmsa-gel-unlisted'],type);
 }
 assert.doesNotMatch(PAYER_DOCUMENTATION_BRANCHES.find(b=>b.id==='hmsa-gel-exception').title,/initial precertification/);
 assert.deepEqual(documentationBranchesFor(['hmsa-evolent-knee-2025'],'Initial','procedure-total-knee').map(b=>b.id),['hmsa-tka']);
 assert.deepEqual(documentationBranchesFor(['hmsa-evolent-knee-2025'],'Initial','procedure-partial-knee').map(b=>b.id),['hmsa-partial-knee']);
 assert.deepEqual(documentationBranchesFor(['hmsa-evolent-knee-2025'],'Initial','procedure-revision-knee').map(b=>b.id),['hmsa-revision-knee']);
 assert.deepEqual(documentationBranchesFor(['medicare-noridian-tka-l36575'],'Initial','procedure-partial-knee').map(b=>b.id),['medicare-partial-knee-l36575-note']);
 assert.deepEqual(documentationBranchesFor(['hmsa-prolia-ma-2026'],'Initial','bone-prolia').map(b=>b.id),['hmsa-prolia-ma-initial']);
 assert.ok(PAYER_DOCUMENTATION_BRANCHES.every(b=>b.fields.length>0&&b.fields.every(f=>f.id&&f.label)));
 // The Commercial/QUEST nonpreferred exception never prints for a preferred brand.
 assert.deepEqual(documentationBranchesFor(['hmsa-gel-preference-2026'],'Initial','gel-euflexxa'),[]);
 assert.deepEqual(documentationBranchesFor(['hmsa-gel-preference-2026'],'Initial','gel-monovisc').map(b=>b.id),['hmsa-gel-exception']);
});
test('documentation branches written from the captured UHC and HMSA Medicare Advantage documents are scoped by request type and product',()=>{
 assert.equal(PAYER_DOCUMENTATION_BRANCHES.length,52);
 assert.equal(new Set(PAYER_DOCUMENTATION_BRANCHES.map(b=>b.id)).size,52);
 const ids=(evidenceId,type,product='')=>documentationBranchesFor([evidenceId],type,product).map(b=>b.id);
 // Every record named for new branches now has at least one.
 for(const id of ['uhc-gel-2026','uhc-cs-gel-2026','hmsa-gel-ma-2026','hmsa-gel-ma-preference-2026','uhc-denosumab-2026','uhc-cs-denosumab-2026','uhc-evenity-2026','uhc-cs-evenity-2026','uhc-ma-partb-step-2026','uhc-hip-2026','uhc-sij-2026','uhc-ma-joint-2026','uhc-omnibus-carpal-2026','uhc-cs-omnibus-carpal-2026','uhc-ma-omnibus-carpal-2026','uhc-cs-knee-2026','uhc-cs-hip-2026'])
  assert.ok(PAYER_DOCUMENTATION_BRANCHES.some(b=>b.evidenceId===id),id);
 // Gel: diagnosis-specific initial and reauthorization branches; exclusion and preferred-product branches only for their brands.
 assert.deepEqual(ids('uhc-gel-2026','Initial','gel-durolane'),['uhc-gel-initial']);
 assert.deepEqual(ids('uhc-gel-2026','Initial','gel-synvisc'),['uhc-gel-initial','uhc-gel-excluded']);
 assert.deepEqual(ids('uhc-gel-2026','Repeat / continuation','gel-euflexxa'),['uhc-gel-repeat']);
 assert.deepEqual(ids('uhc-cs-gel-2026','Initial','gel-euflexxa'),['uhc-cs-gel-initial']);
 assert.deepEqual(ids('uhc-cs-gel-2026','Repeat / continuation','gel-monovisc'),['uhc-cs-gel-repeat','uhc-cs-gel-preferred-product']);
 assert.deepEqual(ids('hmsa-gel-ma-2026','Initial','gel-synojoynt'),['hmsa-gel-ma-initial']);
 assert.deepEqual(ids('hmsa-gel-ma-2026','Repeat / continuation','gel-synvisc'),['hmsa-gel-ma-reauth']);
 for(const type of ['Initial','Repeat / continuation','Reconsideration / appeal'])assert.deepEqual(ids('hmsa-gel-ma-preference-2026',type,'gel-synvisc-one'),['hmsa-gel-ma-exception'],type);
 assert.deepEqual(ids('hmsa-gel-ma-preference-2026','Initial','gel-durolane'),[]);
 // Synojoynt is in neither MA table: the confirm-review branch, never the non-preferred exception.
 assert.deepEqual(ids('hmsa-gel-ma-preference-2026','Initial','gel-synojoynt'),['hmsa-gel-ma-unlisted']);
 const ma=documentationBranchesFor(['hmsa-gel-ma-2026'],'Initial')[0];
 assert.doesNotMatch(ma.fields.map(f=>f.label).join(' '),/six months of conservative|3 months/);assert.match(ma.notes,/do not apply the Commercial\/QUEST six-month rule/);
 // Bone health.
 assert.deepEqual(ids('uhc-denosumab-2026','Initial','bone-prolia'),['uhc-denosumab-initial']);
 assert.deepEqual(ids('uhc-denosumab-2026','Initial','bone-jubbonti'),['uhc-denosumab-initial','uhc-denosumab-nonpreferred']);
 assert.deepEqual(ids('uhc-denosumab-2026','Repeat / continuation','bone-bildyos'),['uhc-denosumab-continuation']);
 // The glucocorticoid-induced osteoporosis branch is its own initial branch (steroid dose; FRAX without a T-score range).
 assert.deepEqual(ids('uhc-cs-denosumab-2026','Initial','bone-jubbonti'),['uhc-cs-denosumab-initial','uhc-cs-denosumab-gio-initial']);
 const gio=PAYER_DOCUMENTATION_BRANCHES.find(b=>b.id==='uhc-cs-denosumab-gio-initial').fields.map(f=>f.label).join(' ');
 assert.match(gio,/prednisone or its equivalent at a dose ≥ 5 mg\/day for ≥ 3 months/);assert.match(gio,/no T-score range for the FRAX path/);
 assert.match(PAYER_DOCUMENTATION_BRANCHES.find(b=>b.id==='uhc-cs-denosumab-initial').notes,/glucocorticoid-induced osteoporosis/);
 assert.deepEqual(ids('uhc-cs-denosumab-2026','Repeat / continuation','bone-prolia'),['uhc-cs-denosumab-continuation','uhc-cs-denosumab-nonpreferred']);
 for(const e of ['uhc-evenity-2026','uhc-cs-evenity-2026']){assert.equal(ids(e,'Initial','bone-evenity').length,1,e);assert.equal(ids(e,'Repeat / continuation','bone-evenity').length,1,e);assert.equal(ids(e,'Reconsideration / appeal','bone-evenity').length,0,e);}
 assert.match(documentationBranchesFor(['uhc-cs-evenity-2026'],'Initial')[0].fields.map(f=>f.label).join(' '),/major osteoporotic fracture at 30% or more or hip fracture at 4\.5% or more/);
 assert.match(documentationBranchesFor(['uhc-evenity-2026'],'Repeat / continuation')[0].notes,/beyond 12 months is unproven/);
 assert.deepEqual(ids('uhc-ma-partb-step-2026','Initial','bone-evenity'),['uhc-ma-step-bone']);
 assert.deepEqual(ids('uhc-ma-partb-step-2026','Initial','bone-prolia'),[]);
 assert.deepEqual(ids('uhc-ma-partb-step-2026','Repeat / continuation','gel-euflexxa'),['uhc-ma-step-gel']);
 assert.deepEqual(ids('uhc-ma-partb-step-2026','Initial','gel-synvisc'),[]);
 // Surgery: public definitions and InterQual pointers, never invented thresholds.
 const hip=documentationBranchesFor(['uhc-hip-2026'],'Initial','procedure-total-hip');assert.deepEqual(hip.map(b=>b.id),['uhc-hip-2026-review']);
 const hipText=hip[0].fields.map(f=>f.label).join(' ');
 assert.match(hipText,/WOMAC pain domain > 40; functional limitation domain > 40/);
 // The FAI arthroscopy criterion belongs to a different procedure and is not a prompt on an arthroplasty workup.
 assert.doesNotMatch(hipText,/Tönnis|Outerbridge|femoroacetabular/);assert.match(hip[0].notes,/do not apply to arthroplasty/);
 assert.match(documentationBranchesFor(['uhc-sij-2026'],'Initial')[0].fields[0].label,/titanium triangular implant system/);
 assert.deepEqual(ids('uhc-ma-joint-2026','Initial','procedure-total-knee'),['uhc-ma-joint-lcd']);
 assert.deepEqual(ids('uhc-ma-joint-2026','Initial','procedure-revision-hip'),['uhc-ma-joint-lcd']);
 for(const p of ['procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'])assert.deepEqual(ids('uhc-ma-joint-2026','Initial',p),[],p);
 for(const e of ['uhc-cs-knee-2026','uhc-cs-hip-2026'])assert.match(documentationBranchesFor([e],'Initial')[0].fields.map(f=>f.label).join(' '),/InterQual/);
 // CPT 64728: a single status field on every request type.
 for(const e of ['uhc-omnibus-carpal-2026','uhc-cs-omnibus-carpal-2026','uhc-ma-omnibus-carpal-2026'])for(const type of ['Initial','Repeat / continuation','Reconsideration / appeal']){
  const b=documentationBranchesFor([e],type,'procedure-carpal-balloon');assert.equal(b.length,1,e+type);assert.equal(b[0].fields.length,1);
 }
 assert.match(documentationBranchesFor(['uhc-ma-omnibus-carpal-2026'],'Initial')[0].fields[0].label,/not reasonable and necessary/);
 // The Medicare Advantage row is CPT 64728 with balloon dilation only: the non-balloon technique gets a coding-determination prompt instead.
 for(const type of ['Initial','Repeat / continuation'])assert.deepEqual(ids('uhc-ma-omnibus-carpal-2026',type,'procedure-carpal-ultrasound-other'),['uhc-ma-omnibus-nonballoon-coding'],type);
 assert.deepEqual(ids('uhc-ma-omnibus-carpal-2026','Initial','procedure-carpal-balloon'),['uhc-ma-omnibus-64728-note']);
 // The MA arthroplasty branch carries the LCD documentation itself instead of pointing at prompts the MA path never shows.
 const maJoint=PAYER_DOCUMENTATION_BRANCHES.find(b=>b.id==='uhc-ma-joint-lcd').fields.map(f=>f.label).join(' ');
 assert.doesNotMatch(maJoint,/see the Traditional Medicare/);assert.match(maJoint,/Imaging modality, date and the specific findings the LCD lists/);
 assert.match(documentationBranchesFor(['uhc-omnibus-carpal-2026'],'Initial')[0].fields[0].label,/unproven/);
 // Request-type, evidence and product scoping are frozen.
 assert.ok(PAYER_DOCUMENTATION_BRANCHES.every(b=>Object.isFrozen(b)&&Object.isFrozen(b.requestTypes)&&Object.isFrozen(b.fields)));
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
