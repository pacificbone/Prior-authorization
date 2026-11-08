import test from 'node:test';
import assert from 'node:assert/strict';
import {AUTH_TEMPLATE_CATALOG,assessAuthTemplate,findAuthTemplate,renderAuthTemplateNote,authTemplateForService} from '../shared/authorization-template-catalog.mjs';
import {renderCatalogAddendumHtml,renderAuthorizationAddendumHtml} from '../shared/printable-addendum.mjs';
import {OFFLINE_AUTH_GUIDES,assessOfflinePacket,renderOfflineLetter,getOfflineGuide} from '../shared/offline-auth-guides.mjs';
import {STAFF_SERVICES} from '../shared/staff-workflow.mjs';
import {orthoGelProducts} from '../shared/orthopedic-procedures.mjs';
import {renderClinicalAddendumPanel,staffClinicalAddendum,selectedClinicalTemplate} from '../public/clinical-addendum-panel.mjs';
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
 for(const v of [true,false,{},42,[],null,'','  ','[NOT DOCUMENTED]','unknown','N/A','x'.repeat(4001)])assert.ok(assessAuthTemplate(t.id,{...values,[id]:v}).missing.some(f=>f.id===id));
 const note=renderAuthTemplateNote(t.id);assert.match(note,/SYNTHETIC ONLY/);assert.match(note,/NOT DOCUMENTED/);assert.match(note,/DO NOT ORDER/);assert.match(note,/Clinician review/);
 const html=renderCatalogAddendumHtml(t.id,{[id]:'<img src=x onerror=alert(1)>'},{plan:'<script>bad()</script>'});
 assert.match(html,/&lt;img/);assert.match(html,/&lt;script/);assert.doesNotMatch(html,/<script>|<img/);
});
test('brand variants and procedure variants contain their own documentation prompts',()=>{
 assert.notDeepEqual(findAuthTemplate('gel-synvisc').fields,findAuthTemplate('gel-synvisc-one').fields);
 for(const [a,b] of [['total-knee','partial-knee'],['maci-harvest','maci-implant'],['carpal-open','carpal-endo']])assert.notDeepEqual(authTemplateForService(a).fields,authTemplateForService(b).fields);
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
 assert.match(renderClinicalAddendumPanel({...state,payer:'<script>bad</script>'}),/&lt;script/);
});
