import test from 'node:test';
import assert from 'node:assert/strict';
import {AUTH_TEMPLATE_CATALOG,assessAuthTemplate,findAuthTemplate,renderAuthTemplateNote,authTemplateForService} from '../shared/authorization-template-catalog.mjs';
import {renderCatalogAddendumHtml,renderAuthorizationAddendumHtml} from '../shared/printable-addendum.mjs';
import {OFFLINE_AUTH_GUIDES,assessOfflinePacket,renderOfflineLetter,getOfflineGuide} from '../shared/offline-auth-guides.mjs';
import {STAFF_SERVICES} from '../shared/staff-workflow.mjs';
import {orthoGelProducts} from '../shared/orthopedic-procedures.mjs';
import {renderClinicalAddendumPanel,staffClinicalAddendum,selectedClinicalTemplate,staffVerificationWorksheet,staffVerificationScope,addendumDocumentationPrompts,ADDENDUM_PROMPTS_HEADING} from '../public/clinical-addendum-panel.mjs';
import {payerEvidenceFor} from '../shared/payer-policy-evidence.mjs';
import {documentationBranchesFor} from '../shared/payer-documentation-branches.mjs';
test('every procedure, gel brand and bone-health service has a template',()=>{
 assert.equal(new Set(AUTH_TEMPLATE_CATALOG.map(t=>t.id)).size,AUTH_TEMPLATE_CATALOG.length);
 for(const s of STAFF_SERVICES.filter(s=>s.type==='procedure'&&s.id!=='knee-gel'))assert.ok(authTemplateForService(s.id),s.id);
 for(const p of orthoGelProducts){const t=authTemplateForService('knee-gel',p.id);assert.ok(t,p.id);assert.deepEqual(t.codes,[p.code]);assert.match(t.fields.at(-1).label,new RegExp(p.name));}
 for(const id of ['prolia','evenity','bildyos','enoby','stoboclo','jubbonti','zoledronic-acid','teriparatide','tymlos','ibandronate','alendronate','risedronate','calcitonin'])assert.ok(authTemplateForService(id),id);
 assert.equal(authTemplateForService('knee-gel'),null);
 assert.ok(findAuthTemplate('bone-boniva-iv'));
});
for(const t of AUTH_TEMPLATE_CATALOG)test('template completeness and safe printable output: '+t.id,()=>{
 assert.equal(new Set(t.fields.map(f=>f.id)).size,t.fields.length);
 assert.ok(Object.isFrozen(t.fields));assert.ok(Object.isFrozen(t.fields[0]));
 const a=assessAuthTemplate(t.id,{});assert.equal(a.status,'incomplete');assert.equal(a.missing.length,t.fields.length);
 const values=Object.fromEntries(t.fields.map(f=>[f.id,'Fictional documented evidence with dated record reference']));
 assert.equal(assessAuthTemplate(t.id,values).status,'clinical-fields-complete');assert.equal(assessAuthTemplate(t.id,values).payerVerified,false);
 const id=t.fields[0].id;
 for(const v of [true,false,{},42,[],null,'','  ','[NOT DOCUMENTED]','unknown','N/A','N/A - see chart','none','TBD','—','---','see chart','x'.repeat(4001)])assert.ok(assessAuthTemplate(t.id,{...values,[id]:v}).missing.some(f=>f.id===id),String(v));
 const note=renderAuthTemplateNote(t.id);assert.match(note,/SYNTHETIC ONLY/);assert.match(note,/NOT DOCUMENTED/);assert.match(note,/DO NOT ORDER/);assert.match(note,/Clinician review/);
 const html=renderCatalogAddendumHtml(t.id,{[id]:'<img src=x onerror=alert(1)>'},{plan:'<script>bad()</script>'});
 assert.match(html,/&lt;img/);assert.match(html,/&lt;script/);assert.doesNotMatch(html,/<script>|<img/);
});
test('brand variants and procedure variants contain their own documentation prompts',()=>{
 assert.notDeepEqual(findAuthTemplate('gel-synvisc').fields,findAuthTemplate('gel-synvisc-one').fields);
 for(const [a,b] of [['total-knee','partial-knee'],['maci-harvest','maci-implant'],['maci-implant','maci-cell-product'],['carpal-open','carpal-endo']])assert.notDeepEqual(authTemplateForService(a).fields,authTemplateForService(b).fields);
 // MACI is three separately authorized stages: harvest (S2112), implantation (27412) and the cell product (J7330).
 assert.deepEqual(authTemplateForService('maci-harvest').codes,['S2112']);assert.deepEqual(authTemplateForService('maci-implant').codes,['27412']);assert.deepEqual(authTemplateForService('maci-cell-product').codes,['J7330']);
 // Harvest never demands the implantation-stage product field, matching the orthopedic worksheet.
 assert.equal(authTemplateForService('maci-harvest').fields.some(f=>f.id==='implant'),false);
 assert.ok(authTemplateForService('maci-implant').fields.some(f=>f.id==='implant'));
 // Service-specific prompts survive id collisions with the generic scaffold.
 assert.match(authTemplateForService('si-joint-fusion').fields.find(f=>f.id==='diagnosis').label,/Diagnosis, ICD-10/);
 assert.ok(authTemplateForService('si-joint-fusion').fields.some(f=>/provocative maneuvers/.test(f.label)));
 assert.ok(authTemplateForService('si-joint-fusion').fields.some(f=>/transfixation/.test(f.label)));
 assert.match(authTemplateForService('trigger-finger').fields.find(f=>f.id==='exam').label,/A1-pulley/);
 // Non-surgical services are not forced through the surgical scaffold.
 for(const [id,category] of [['dexa','diagnostic'],['mri-knee','diagnostic'],['office-pt','therapy'],['dme-brace','therapy'],['prp','injection'],['corticosteroid-injection','injection'],['maci-cell-product','product']]){
  const t=authTemplateForService(id);assert.equal(t.category,category,id);
  assert.equal(t.fields.some(f=>/operative indication/i.test(f.label)||/Proposed procedure, laterality/.test(f.label)),false,id);
 }
 assert.equal(authTemplateForService('total-knee').category,'surgery');
 // Cautionary descriptions are notes, never mandatory field labels.
 for(const t of AUTH_TEMPLATE_CATALOG)for(const f of t.fields)assert.equal(/\.$/.test(f.label.trim())&&/may vary|require|review/.test(f.label),false,t.id+': '+f.label);
 assert.deepEqual(authTemplateForService('jubbonti').codes,['Q5136']);assert.deepEqual(authTemplateForService('bildyos').codes,['Q5162']);assert.deepEqual(authTemplateForService('enoby').codes,['Q5167']);assert.deepEqual(authTemplateForService('stoboclo').codes,['Q5157']);
 assert.deepEqual(authTemplateForService('si-joint-fusion').codes,['27279','27278']);
 assert.deepEqual(authTemplateForService('carpal-ultrasound-other').codes,[]);assert.deepEqual(authTemplateForService('carpal-balloon').codes,['64728']);
 assert.match(findAuthTemplate('bone-evenity').fields.at(-1).label,/cardiovascular/);
 assert.match(findAuthTemplate('bone-prolia').fields.at(-1).label,/interruption/);
 assert.match(findAuthTemplate('bone-reclast').fields.at(-1).label,/renal/);
});
test('unknown template/service cannot generate a clinical note',()=>{
 assert.equal(findAuthTemplate('__proto__'),null);assert.equal(getOfflineGuide('__proto__'),null);
 assert.equal(assessAuthTemplate('missing').status,'unknown-template');
 assert.throws(()=>renderAuthTemplateNote('missing'));assert.throws(()=>renderCatalogAddendumHtml('missing'));assert.throws(()=>renderAuthorizationAddendumHtml('missing'));
});
test('legacy guides and addenda retain synthetic labels, missing evidence and HTML escaping',()=>{
 for(const [id,g] of Object.entries(OFFLINE_AUTH_GUIDES)){
  assert.ok(assessOfflinePacket(id,{[g.questions[0][0]]:true}).missing.length);
  assert.match(renderOfflineLetter(id),/SYNTHETIC ONLY/);
  const html=renderAuthorizationAddendumHtml(id,{[g.questions[0][0]]:'<script>bad</script>'},{patientName:'<img src=x>'});
  assert.match(html,/SYNTHETIC ONLY/);assert.match(html,/NOT DOCUMENTED/);assert.doesNotMatch(html,/<script>|<img/);
  // A caller-supplied patient name is never echoed; the placeholder points to the approved system.
  assert.match(html,/Patient:<\/strong> \[COMPLETE ONLY IN APPROVED CLINICAL SYSTEM\]/);
  assert.equal(assessOfflinePacket(id,Object.fromEntries(g.questions.map(([k])=>[k,'Fictional dated finding']))).status,'clinical-fields-complete');
 }
});
const state={payer:'HMSA',planId:'hmsa-quest',benefit:'Medical',serviceId:'prolia',serviceDate:'2026-11-07'};
test('staff print/export uses selected service and exact template, never checkbox findings',()=>{
 assert.equal(selectedClinicalTemplate(state).id,'bone-prolia');
 const note=staffClinicalAddendum({...state,docs:{diagnosis:true,labs:true}});assert.match(note,/NOT DOCUMENTED/);assert.match(note,/member product not verified/);
 assert.equal(selectedClinicalTemplate({...state,serviceId:'knee-gel',gelProductId:'monovisc'}).id,'gel-monovisc');
 assert.equal(selectedClinicalTemplate({...state,clinicalTemplateId:'procedure-maci-implant'}).id,'procedure-maci-implant');
 assert.throws(()=>staffClinicalAddendum({...state,clinicalTemplateId:'wrong'}));
 const html=renderClinicalAddendumPanel(state);assert.match(html,/staff-print-addendum/);assert.match(html,/staff-download-addendum/);assert.match(html,/Ordering blocked/);assert.doesNotMatch(html,/<textarea/);
 assert.match(renderClinicalAddendumPanel({...state,serviceDate:'invalid'}),/valid service date/);
 // A library template that differs from the step-2 service is announced on screen and in the printed worksheet.
 const overridden={...state,clinicalTemplateId:'gel-synvisc-one'};
 assert.match(renderClinicalAddendumPanel(overridden),/Template override:/);
 assert.match(renderClinicalAddendumPanel(overridden),/Synvisc-One/);
 assert.doesNotMatch(renderClinicalAddendumPanel(state),/Template override:/);
 assert.match(staffVerificationWorksheet(overridden),/TEMPLATE OVERRIDE: this worksheet is for Synvisc-One; the step-2 selection is Prolia/);
 assert.doesNotMatch(staffVerificationWorksheet(state),/TEMPLATE OVERRIDE/);
 assert.match(renderClinicalAddendumPanel(state),/<optgroup label="Bone health medications">/);
 assert.match(renderClinicalAddendumPanel({...state,payer:'<script>bad</script>'}),/&lt;script/);
});
// Every date below is explicit: hmsa-prolia-cq-2026 was retrieved 2026-11-07 and is due for review 2027-02-05.
const evidenceSection=html=>html.slice(html.indexOf('id="staff-policy-evidence"'),html.indexOf('Reviewed criteria extracts'));
test('payer evidence shows each review state in words and as an amber badge on the record summary',()=>{
 const at=(asOf,serviceDate)=>evidenceSection(renderClinicalAddendumPanel({...state,serviceDate},asOf));
 const current=at('2026-11-21','2026-12-01');
 assert.match(current,/Fingerprinted snapshot reviewed 2026-11-07; plan applicability unverified\./);
 assert.doesNotMatch(current,/review-badge|REVIEW OVERDUE/);
 const soon=at('2027-01-20','2026-12-01');
 assert.match(soon,/Review due 2027-02-05 \(in 16 days\)/);
 assert.match(soon,/<summary>HMSA Prolia and Biosimilars — HMO\/PPO\/QUEST · 2026-04-01 <span class="pill amber review-badge" data-review-state="due-soon">Review due in 16 days<\/span><\/summary>/);
 assert.match(soon,/<h3>Source verification and exact-plan adoption <span class="pill amber review-badge">1 reference needs review<\/span><\/h3>/);
 assert.match(at('2027-02-05','2026-12-01'),/Review due 2027-02-05 \(today\)/);
 const overdue=at('2027-03-01','2026-12-01');
 assert.match(overdue,/Review overdue \(due 2027-02-05\)/);assert.match(overdue,/data-review-state="overdue">Review overdue</);
 assert.doesNotMatch(overdue,/REVIEW OVERDUE/);
 const ends=at('2026-11-21','2027-03-01');
 assert.match(ends,/Reviewed 2026-11-07; this review window ends 2027-02-05, before the service date: re-check closer to the date of service/);
 assert.match(ends,/data-review-state="ends-before-service">Review window ends before service</);
 // The badge sits inside the <summary>, so it is visible while the entry is collapsed.
 for(const html of [soon,overdue,ends])assert.match(html,/<summary>[^<]*<span class="pill amber review-badge"/);
});
test('the verification scope carries the selected request type into the printed worksheet',()=>{
 assert.equal(staffVerificationScope(state).requestType,'Initial');
 assert.equal(staffVerificationScope({...state,requestType:'Repeat / continuation'}).requestType,'Repeat / continuation');
 const initial=staffVerificationWorksheet(state,'2026-11-21'),renewal=staffVerificationWorksheet({...state,requestType:'Repeat / continuation'},'2026-11-21');
 assert.match(initial,/^Request type: Initial$/m);assert.match(renewal,/^Request type: Repeat \/ continuation$/m);
 assert.match(initial,/HMSA Commercial\/QUEST Prolia and biosimilars — initial/);
 assert.doesNotMatch(renewal,/Prolia and biosimilars — initial/);
});
test('the printed addendum lists the matching payer documentation prompts with an approved-system placeholder, never prefilled or a handwriting line',()=>{
 const asOf='2026-11-21';
 for(const requestType of ['Initial','Repeat / continuation','Reconsideration / appeal'])for(const s of [state,{...state,serviceId:'knee-gel',gelProductId:'synvisc'},{...state,clinicalTemplateId:'gel-durolane'},{...state,payer:'UnitedHealthcare',planId:'uhc-commercial',serviceId:'total-knee'},{...state,payer:'UnitedHealthcare',planId:'uhc-ma',serviceId:'total-knee'}]){
  const st={...s,requestType,docs:{diagnosis:true}},note=staffClinicalAddendum(st,asOf),lines=note.split('\n');
  const scope=staffVerificationScope(st);
  const expected=documentationBranchesFor(payerEvidenceFor(scope,asOf).map(r=>r.id),requestType,selectedClinicalTemplate(st).id);
  assert.deepEqual(addendumDocumentationPrompts(st,asOf).branches.map(b=>b.id),expected.map(b=>b.id));
  const start=lines.indexOf(ADDENDUM_PROMPTS_HEADING);assert.ok(start>0,requestType);
  assert.equal(lines[start+1],'Request type: '+requestType);
  for(const b of expected){
   assert.ok(lines.includes(b.title),b.id);
   for(const f of b.fields){const i=lines.indexOf('- '+f.label,start);assert.ok(i>start,f.label);assert.equal(lines[i+1],'  [COMPLETE IN APPROVED CLINICAL SYSTEM]');}
  }
  if(!expected.length)assert.match(note,/No (documentation branch matches|public payer reference matches)/);
  // Synthetic and blank labels stay; the signature line is still last.
  assert.match(note,/^SYNTHETIC ONLY — NOT FOR SUBMISSION/);assert.match(note,/\[NOT DOCUMENTED\]/);assert.match(note,/DO NOT ORDER/);
  assert.match(lines.at(-1),/^Clinician review\/signature: _+$/);
  assert.doesNotMatch(note.slice(start),/^\s+_{20,}$/m);
  assert.doesNotMatch(note.slice(note.indexOf(ADDENDUM_PROMPTS_HEADING)),/: (true|yes|met|documented)\b/i);
 }
 // The request type changes the branch set, and the UHC Medicare Advantage knee prompt is printed under its own heading.
 assert.match(staffClinicalAddendum({...state,payer:'UnitedHealthcare',planId:'uhc-ma',serviceId:'total-knee'},asOf),/Source: UHC Joint Procedures — Medicare Advantage Medical Policy/);
 const ids=t=>addendumDocumentationPrompts({...state,requestType:t},asOf).branches.map(b=>b.id).join();
 assert.notEqual(ids('Initial'),ids('Repeat / continuation'));
 // No insurer or date selected: the heading still prints with an explanation, and nothing is inferred.
 const bare=staffClinicalAddendum({serviceId:'prolia'},asOf);
 assert.match(bare,new RegExp(ADDENDUM_PROMPTS_HEADING.replace(/[()]/g,'\\$&')));
 assert.match(bare,/No public payer reference matches this insurer/);
 // The on-screen preview counts the prompts it appends.
 assert.match(renderClinicalAddendumPanel(state,asOf),/Preview blank clinical addendum \(\d+ fields \+ \d+ payer-policy prompts\)/);
});
test('a planned date the page filled in is printed as policy context, never as the planned date of service',()=>{
 const asOf='2026-11-21',st={...state,serviceDate:asOf};
 assert.match(staffClinicalAddendum({...st,serviceDateSource:'default'},asOf),/Planned date of service: \[DATE NOT SELECTED — policy context used 2026-11-21\]/);
 assert.match(staffVerificationWorksheet({...st,serviceDateSource:'default'},asOf),/\/ HI \/ \[DATE NOT SELECTED — policy context used 2026-11-21\]\n/);
 // A date staff typed is printed as is; the default still drives the evidence lookup.
 assert.match(staffClinicalAddendum({...st,serviceDateSource:'entered'},asOf),/Planned date of service: 2026-11-21\n/);
 assert.deepEqual(addendumDocumentationPrompts({...st,serviceDateSource:'default'},asOf).branches.map(b=>b.id),addendumDocumentationPrompts({...st,serviceDateSource:'entered'},asOf).branches.map(b=>b.id));
 assert.match(staffClinicalAddendum({...state,serviceDate:''},asOf),/Planned date of service: \[DATE NOT SELECTED\]/);
});
test('a Medigap selection is documented against Original Medicare, which decides the primary claim',()=>{
 const asOf='2026-11-21',st={payer:'Medigap',planId:'medigap',benefit:'Medical',serviceId:'total-hip',serviceDate:asOf};
 const scope=staffVerificationScope(st);
 assert.equal(scope.payer,'Traditional Medicare');assert.equal(scope.secondaryPayer,'Medigap');assert.equal(scope.line,'Traditional Medicare');
 const note=staffClinicalAddendum(st,asOf);
 assert.match(note,/Original Medicare primary claim \(Medigap pays secondary\)/);assert.match(note,/Traditional Medicare \(Noridian JE\) — total hip arthroplasty LCD L34163 documentation/);
 assert.match(note,/Medigap \/ medigap \(member product not verified\)/);
 assert.match(renderClinicalAddendumPanel(st,asOf),/notice amber">Original Medicare primary claim \(Medigap pays secondary\)/);
});
