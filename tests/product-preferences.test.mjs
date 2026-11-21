import test from 'node:test';
import assert from 'node:assert/strict';
import {PRODUCT_PREFERENCES,PA_SIGNALS,PREFERENCE_STATUSES,PA_SIGNAL_TYPES,evidenceAtAGlance,validateProductPreferences,productName} from '../shared/product-preferences.mjs';
import {PAYER_POLICY_EVIDENCE} from '../shared/payer-policy-evidence.mjs';
import {orthoGelProducts} from '../shared/orthopedic-procedures.mjs';
import {AUTH_TEMPLATE_CATALOG} from '../shared/authorization-template-catalog.mjs';
// The as-of day and service date are fixed so the clock never matters.
const asOf='2026-11-15';
const glance=(payer,line,productId,extra={})=>evidenceAtAGlance({payer,line,benefit:'Medical',productId,medication:true,serviceDate:asOf,...extra},asOf);
test('every preference row and PA signal is bound to a real evidence record and one of its selectable products',()=>{
 assert.equal(validateProductPreferences(),true);
 const selectable=new Set([...orthoGelProducts.map(p=>'gel-'+p.id),...AUTH_TEMPLATE_CATALOG.filter(t=>t.category==='bone-health').map(t=>t.id)]);
 for(const r of PRODUCT_PREFERENCES){
  const s=PAYER_POLICY_EVIDENCE.find(x=>x.id===r.evidenceId);
  assert.ok(s,r.evidenceId);assert.ok(s.products.includes(r.productId),r.evidenceId+' '+r.productId);
  assert.ok(selectable.has(r.productId),r.productId);assert.ok(PREFERENCE_STATUSES.includes(r.status));assert.ok(Object.isFrozen(r));
  assert.deepEqual(Object.keys(r).sort(),['evidenceId','exception','productId','status']);
  assert.ok(productName(r.productId));
 }
 for(const r of PA_SIGNALS){const s=PAYER_POLICY_EVIDENCE.find(x=>x.id===r.evidenceId);assert.ok(s,r.evidenceId);assert.ok(PA_SIGNAL_TYPES.includes(r.signal));assert.ok(!r.products||r.products.every(p=>s.products.includes(p)),r.evidenceId);}
 // Preferences come only from the documents that state them.
 assert.deepEqual([...new Set(PRODUCT_PREFERENCES.map(r=>r.evidenceId))].sort(),['hmsa-gel-ma-preference-2026','hmsa-gel-preference-2026','hmsa-prolia-cq-2026','hmsa-prolia-ma-2026','uhc-cs-denosumab-2026','uhc-cs-gel-2026','uhc-denosumab-2026','uhc-gel-2026','uhc-ma-partb-step-2026']);
 const row=PRODUCT_PREFERENCES[0];
 for(const bad of [{evidenceId:'missing'},{productId:'bone-prolia'},{status:'covered'},{status:'non-preferred',exception:null},{status:'preferred',exception:'x'}])
  assert.throws(()=>validateProductPreferences([{...row,...bad}]),JSON.stringify(bad));
 assert.throws(()=>validateProductPreferences([row,row]));
 assert.throws(()=>validateProductPreferences([],[{evidenceId:'uhc-gel-2026',signal:'approved',text:'x'}]));
 assert.throws(()=>validateProductPreferences([],[{evidenceId:'uhc-gel-2026',signal:'step-therapy',text:'x',products:['bone-prolia']}]));
});
test('HMSA Commercial prefers Synvisc-One; HMSA Medicare Advantage makes it non-preferred with the section B exception',()=>{
 const cq=glance('HMSA','Commercial','gel-synvisc-one');
 assert.equal(cq.hasEvidence,true);assert.equal(cq.selected.status,'preferred');assert.equal(cq.selected.displayName,'Synvisc-One');assert.equal(cq.selected.evidenceId,'hmsa-gel-preference-2026');
 assert.deepEqual([...cq.preferred],['Euflexxa','Synvisc','Synvisc-One']);
 assert.ok(cq.nonPreferred.includes('Durolane')&&cq.nonPreferred.includes('Supartz FX'));
 assert.ok(cq.paSignals.some(s=>s.signal==='precertification-required'));
 assert.ok(cq.references.some(r=>r.id==='hmsa-gel-preference-2026'&&r.reviewState==='current'));
 const ma=glance('HMSA','Medicare Advantage','gel-synvisc-one');
 assert.equal(ma.selected.status,'non-preferred');assert.equal(ma.selected.evidenceId,'hmsa-gel-ma-preference-2026');
 assert.match(ma.selected.exception,/past 365 days/);assert.match(ma.selected.exception,/Durolane, Euflexxa, Gelsyn-3 and Supartz FX/);
 assert.deepEqual([...ma.preferred],['Durolane','Euflexxa','Gelsyn-3','Supartz FX']);
 // Synojoynt is in neither HMSA table, so no status is invented for it; the document's own words for an unlisted product
 // are returned instead, and the exceptions documents (which cover only their own tables) are not cited for its PA signal.
 for(const line of ['Commercial','QUEST / Medicaid','Medicare Advantage']){
  const g=glance('HMSA',line,'gel-synojoynt');
  assert.equal(g.selected,null,line);assert.equal(g.unlisted.length,1,line);assert.equal(g.unlisted[0].displayName,'Synojoynt');
  assert.ok(g.paSignals.some(s=>s.signal==='precertification-required'),line);
  assert.ok(!g.paSignals.some(s=>/preference/.test(s.evidenceId)),line);
 }
 assert.match(glance('HMSA','Commercial','gel-synojoynt').unlisted[0].text,/new-to-market products will be considered non-preferred until they are added/);
 assert.match(glance('HMSA','Medicare Advantage','gel-synojoynt').unlisted[0].text,/do not apply to any new or existing FDA-approved product that is not listed/);
 assert.equal(cq.unlisted.length,0);assert.ok(cq.paSignals.some(s=>s.evidenceId==='hmsa-gel-preference-2026'));
});
test('UHC: commercial Jubbonti excluded, QUEST Prolia non-preferred, Medicare Advantage Evenity non-preferred under step therapy',()=>{
 const jub=glance('UnitedHealthcare','Commercial','bone-jubbonti');
 assert.equal(jub.selected.status,'excluded');assert.match(jub.selected.exception,/Typically excluded from coverage/);
 assert.deepEqual([...jub.excluded],['Jubbonti (denosumab-bbdz)']);assert.ok(jub.preferred.includes('Prolia (denosumab)'));
 const quest=glance('UnitedHealthcare','QUEST / Medicaid','bone-prolia');
 assert.equal(quest.selected.status,'non-preferred');assert.equal(quest.selected.evidenceId,'uhc-cs-denosumab-2026');assert.match(quest.selected.exception,/two of Bildyos, Enoby and Jubbonti/);
 assert.ok(quest.preferred.includes('Jubbonti (denosumab-bbdz)'));
 const ev=glance('UnitedHealthcare','Medicare Advantage','bone-evenity');
 assert.equal(ev.selected.status,'non-preferred');assert.equal(ev.selected.evidenceId,'uhc-ma-partb-step-2026');assert.match(ev.selected.exception,/^Step therapy/);
 assert.ok(ev.paSignals.some(s=>s.signal==='step-therapy'));
 assert.deepEqual([...ev.preferred],['Jubbonti (denosumab-bbdz)','Prolia (denosumab)','Stoboclo (denosumab-bmwo)']);
 // The step-therapy record also carries gel rows; they never mix into a bone-health glance.
 assert.equal(ev.preferred.some(n=>/Synvisc|Durolane/.test(n)),false);
 assert.equal(glance('UnitedHealthcare','Medicare Advantage','bone-prolia').paSignals.some(s=>s.signal==='step-therapy'),false);
 const gel=glance('UnitedHealthcare','Commercial','gel-durolane');
 assert.equal(gel.selected.status,'covered-on-criteria');assert.deepEqual([...gel.coveredOnCriteria],['Durolane','Euflexxa','Gelsyn-3']);
 assert.ok(gel.paSignals.some(s=>s.signal==='pa-not-required-per-policy'));
 assert.equal(glance('UnitedHealthcare','Commercial','gel-synvisc').paSignals.some(s=>s.signal==='pa-not-required-per-policy'),false);
 assert.equal(glance('UnitedHealthcare','Commercial','gel-synvisc').selected.status,'excluded');
});
test('scope caveats and unselectable brands come from the preference documents themselves',()=>{
 assert.match(glance('UnitedHealthcare','Medicare Advantage','gel-euflexxa').selected.caveat,/Dual Complete H6824-002 and all Employer Group HMO plans/);
 assert.match(glance('UnitedHealthcare','Medicare Advantage','gel-durolane').selected.caveat,/H6824-002/);
 const jubCaveat=glance('UnitedHealthcare','Individual Exchange','bone-jubbonti').selected.caveat;
 assert.match(jubCaveat,/medical necessity plans/);assert.match(jubCaveat,/titled for Commercial only/);
 assert.match(glance('UnitedHealthcare','Commercial','gel-synvisc').selected.caveat,/for Commercial only/);
 assert.equal(glance('HMSA','Commercial','gel-durolane').selected.caveat,null);
 // A caveat is shown only for the status it is about: the Commercial-only exclusion note never sits on a criteria-based brand.
 assert.equal(glance('UnitedHealthcare','Commercial','gel-durolane').selected.caveat,null);
 assert.match(glance('UnitedHealthcare','Commercial','bone-prolia').selected.caveat,/medical necessity plans/);
 assert.doesNotMatch(glance('UnitedHealthcare','Commercial','bone-prolia').selected.caveat,/Excluded Drugs/);
 // The Jubbonti row separates the exclusion from the medical-necessity-plan preferred product criteria.
 const jub=glance('UnitedHealthcare','Commercial','bone-jubbonti').selected.exception;
 assert.doesNotMatch(jub,/and then require/);assert.match(jub,/Separately, on medical necessity plans/);
 // Exception wording is attributed to the policy, never "covered" in the app's voice.
 for(const r of PRODUCT_PREFERENCES.filter(r=>r.exception))assert.doesNotMatch(r.exception,/: covered when/,r.evidenceId);
 assert.deepEqual([...glance('UnitedHealthcare','Commercial','gel-durolane').alsoNamed],['Hymovis One']);
 assert.deepEqual([...glance('UnitedHealthcare','Medicare Advantage','bone-prolia').alsoNamed],['Conexxence','Ospomyv']);
 assert.deepEqual([...glance('HMSA','Commercial','gel-durolane').alsoNamed],[]);
});
test('nothing leaks to another payer, line or benefit',()=>{
 for(const [payer,line,productId,extra] of [['AlohaCare','QUEST / Medicaid','gel-synvisc-one'],['HMSA','Individual Exchange','gel-synvisc-one'],['HMSA','Commercial','gel-synvisc-one',{benefit:'Pharmacy'}],
  ['UnitedHealthcare','Commercial','bone-jubbonti',{benefit:'Pharmacy'}],['Kaiser Permanente','Medicare Advantage','bone-evenity'],['HMSA','QUEST / Medicaid','gel-synvisc-one',{serviceDate:'bad'}]]){
  const g=glance(payer,line,productId,extra);
  assert.equal(g.selected,null,payer+line);
  assert.equal(g.hasEvidence,false,payer+line);assert.equal(g.preferred.length+g.nonPreferred.length+g.excluded.length,0);
 }
 // Each line sees only its own preference table.
 assert.equal(glance('UnitedHealthcare','Individual Exchange','bone-jubbonti').selected.status,'excluded');
 assert.equal(glance('UnitedHealthcare','QUEST / Medicaid','bone-jubbonti').selected.status,'preferred');
 assert.equal(glance('UnitedHealthcare','Medicare Advantage','bone-jubbonti').selected.status,'preferred');
 assert.equal(glance('HMSA','Commercial','bone-jubbonti').selected.status,'preferred');
 assert.equal(glance('HMSA','Medicare Advantage','bone-jubbonti').selected.status,'non-preferred');
 assert.equal(glance('HMSA','Commercial','gel-supartz').selected.status,'non-preferred');
 assert.equal(glance('HMSA','Medicare Advantage','gel-supartz').selected.status,'preferred');
 // Traditional Medicare has a reference but no preference table; a procedure never gets product lists.
 const tm=glance('Traditional Medicare','Traditional Medicare','bone-prolia');
 assert.equal(tm.hasEvidence,true);assert.equal(tm.selected,null);assert.equal(tm.preferred.length+tm.nonPreferred.length+tm.excluded.length,0);
 const knee=glance('UnitedHealthcare','Medicare Advantage','procedure-acl-reconstruction',{medication:false});
 // The MA joint policy only refers on to the commercial knee policy; it does not itself name InterQual for the knee.
 assert.equal(knee.selected,null);assert.equal(knee.preferred.length,0);assert.deepEqual(knee.paSignals.map(s=>s.signal),['refers-to-commercial-policy']);
 assert.doesNotMatch(knee.paSignals[0].text,/which uses InterQual/);
 assert.equal(glance('UnitedHealthcare','Medicare Advantage','procedure-total-knee',{medication:false}).paSignals.length,0);
 const tka=glance('Traditional Medicare','Traditional Medicare','procedure-total-knee',{medication:false});
 assert.deepEqual(tka.paSignals.map(s=>s.signal),['lcd-no-prior-auth']);
 // The same Original Medicare note applies to every LCD-governed procedure, SI joint fusion included.
 assert.deepEqual(glance('Traditional Medicare','Traditional Medicare','procedure-si-joint-fusion',{medication:false}).paSignals.map(s=>s.signal),['lcd-no-prior-auth']);
 // UHC commercial SI fusion: the unproven statement is about other devices and indications, never the selected service.
 assert.deepEqual(glance('UnitedHealthcare','Commercial','procedure-si-joint-fusion',{medication:false}).paSignals.map(s=>s.signal),['interqual-criteria','unproven-other-devices']);
 // UHC MA CPT 64728 (balloon dilation): the non-balloon technique is out of the row's scope.
 assert.deepEqual(glance('UnitedHealthcare','Medicare Advantage','procedure-carpal-balloon',{medication:false}).paSignals.map(s=>s.signal),['not-reasonable-and-necessary']);
 assert.deepEqual(glance('UnitedHealthcare','Medicare Advantage','procedure-carpal-ultrasound-other',{medication:false}).paSignals,[]);
 // A proposed LCD and a sourcing reference are marked so the page never calls them a coverage policy.
 const tmGel=glance('Traditional Medicare','Traditional Medicare','gel-synvisc');
 assert.deepEqual(tmGel.references.map(r=>[r.id,r.proposed,r.referenceType]),[['medicare-noridian-ha-proposed-dl40456',true,'policy']]);
 assert.ok(glance('UnitedHealthcare','Commercial','bone-prolia').references.some(r=>r.referenceType==='sourcing'));
 // Results are immutable and never claim plan adoption.
 const g=glance('HMSA','Commercial','gel-synvisc-one');
 assert.ok(Object.isFrozen(g)&&Object.isFrozen(g.preferred)&&Object.isFrozen(g.selected)&&Object.isFrozen(g.references));assert.equal(g.planAdoptionVerified,false);
});
