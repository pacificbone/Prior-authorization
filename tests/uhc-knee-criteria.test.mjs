import test from 'node:test';
import assert from 'node:assert/strict';
import {payerEvidenceFor} from '../shared/payer-policy-evidence.mjs';
import {documentationBranchesFor} from '../shared/payer-documentation-branches.mjs';
const scope={payer:'UnitedHealthcare',line:'Commercial',benefit:'Medical',productId:'procedure-total-knee',serviceDate:'2026-11-08'};
test('UHC knee surgery source has a separate public reference and prompts',()=>{
 const refs=payerEvidenceFor(scope,'2026-11-08');
 const knee=refs.find(x=>x.id==='uhc-knee-2026');
 assert.ok(knee);
 assert.equal(knee.planAdoptionVerified,false);
 assert.equal(knee.orderingAllowed,false);
 assert.equal(knee.sourceSha256,'5fafd91fcd745b0312a21301a0c98105da22b71b5a023c8e6471e080088f5b5e');
 assert.equal(knee.version,'2026T0553JJ');
 assert.match(knee.limitations,/InterQual criteria and exact-plan adoption are not verified/);
 const branches=documentationBranchesFor(refs.map(x=>x.id),'Initial');
 assert.ok(branches.some(x=>x.id==='uhc-knee-2026-review'));
});
test('UHC public knee policy does not leak to HMSA or Medicare Advantage',()=>{
 assert.equal(payerEvidenceFor({...scope,payer:'HMSA'},'2026-11-08').some(x=>x.id==='uhc-knee-2026'),false);
 assert.equal(payerEvidenceFor({...scope,line:'Medicare Advantage'},'2026-11-08').some(x=>x.id==='uhc-knee-2026'),false);
});
test('UHC hip, SI fusion, percutaneous carpal tunnel and denosumab records are scoped to their own products and lines',()=>{
 const at=(productId,extra={})=>payerEvidenceFor({...scope,productId,serviceDate:'2026-11-15',...extra},'2026-11-15').map(x=>x.id);
 assert.deepEqual(at('procedure-total-hip'),['uhc-hip-2026']);
 assert.deepEqual(at('procedure-si-joint-fusion'),['uhc-sij-2026']);
 assert.deepEqual(at('procedure-carpal-balloon'),['uhc-omnibus-carpal-2026']);
 assert.deepEqual(at('procedure-carpal-open'),[]); // the unproven entry never attaches to open or endoscopic release
 assert.ok(at('bone-jubbonti',{medication:true}).includes('uhc-denosumab-2026'));
 assert.deepEqual(at('procedure-total-hip',{line:'Medicare Advantage'}),['uhc-ma-joint-2026']);
 assert.equal(at('procedure-si-joint-fusion',{payer:'HMSA'}).some(x=>x.startsWith('uhc-')),false);
 const d=payerEvidenceFor({...scope,productId:'bone-jubbonti',medication:true,serviceDate:'2026-11-15'},'2026-11-15').find(x=>x.id==='uhc-denosumab-2026');
 assert.match(d.summary,/Jubbonti and Ospomyv are typically excluded/);
 assert.match(d.limitations,/never carry a preference across payers/);
});
test('UHC Commercial, QUEST and Medicare Advantage each get only their own line\'s records and preferred lists',()=>{
 const at=(line,productId,medication=false)=>payerEvidenceFor({payer:'UnitedHealthcare',line,benefit:'Medical',productId,medication,serviceDate:'2026-11-15'},'2026-11-15');
 const ids=(...a)=>at(...a).map(x=>x.id).filter(id=>id!=='uhc-sourcing-2026');
 assert.deepEqual(ids('QUEST / Medicaid','procedure-total-knee'),['uhc-cs-knee-2026']);
 assert.deepEqual(ids('Medicare Advantage','procedure-total-knee'),['uhc-ma-joint-2026']);
 assert.deepEqual(ids('Medicare Advantage','procedure-total-hip'),['uhc-ma-joint-2026']);
 assert.deepEqual(ids('QUEST / Medicaid','procedure-carpal-balloon'),['uhc-cs-omnibus-carpal-2026']);
 assert.deepEqual(ids('Medicare Advantage','procedure-carpal-balloon'),['uhc-ma-omnibus-carpal-2026']);
 assert.deepEqual(ids('Commercial','bone-jubbonti',true),['uhc-denosumab-2026']);
 assert.deepEqual(ids('QUEST / Medicaid','bone-jubbonti',true),['uhc-cs-denosumab-2026']);
 assert.deepEqual(ids('Medicare Advantage','bone-jubbonti',true),['uhc-ma-partb-step-2026']);
 assert.deepEqual(ids('Medicare Advantage','bone-evenity',true),['uhc-ma-partb-step-2026']);
 assert.deepEqual(ids('QUEST / Medicaid','gel-euflexxa',true),['uhc-cs-gel-2026']);
 // Three lines, three different stances on the same products.
 assert.match(at('Commercial','bone-jubbonti',true)[0].summary,/Jubbonti and Ospomyv are typically excluded/);
 assert.match(at('QUEST / Medicaid','bone-jubbonti',true)[0].summary,/Prolia and Stoboclo are non-preferred here/);
 assert.match(at('Medicare Advantage','bone-jubbonti',true).find(x=>x.id==='uhc-ma-partb-step-2026').summary,/Jubbonti, Prolia and Stoboclo are preferred/);
 assert.match(at('Medicare Advantage','procedure-total-knee')[0].summary,/L36575/);
 assert.match(at('Medicare Advantage','procedure-total-knee')[0].limitations,/Says nothing about whether prior authorization is required/);
});
test('UHC Medicare Advantage knee procedures: LCD prompts only for arthroplasty, the commercial InterQual fallback for the rest',()=>{
 const at=productId=>payerEvidenceFor({payer:'UnitedHealthcare',line:'Medicare Advantage',benefit:'Medical',productId,serviceDate:'2026-11-15'},'2026-11-15').find(x=>x.id==='uhc-ma-joint-2026');
 for(const p of ['procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant']){
  const r=at(p);
  assert.equal(r.prompts.some(t=>/L36575|L34163/.test(t)),false,p);
  assert.ok(r.prompts.some(t=>/falls back to the UnitedHealthcare Commercial Medical Policy titled Surgery of the Knee \(InterQual criteria\)/.test(t)),p);
  assert.deepEqual(documentationBranchesFor([r.id],'Initial',p),[],p);
 }
 for(const p of ['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-total-hip','procedure-revision-hip']){
  const r=at(p);
  assert.ok(r.prompts.some(t=>/Noridian LCD L36575 \(knee\) or L34163 \(hip\)/.test(t)),p);
  assert.deepEqual(documentationBranchesFor([r.id],'Initial',p).map(b=>b.id),['uhc-ma-joint-lcd'],p);
 }
 // The commercial knee record keeps its generic InterQual prompts for every knee product.
 const commercial=payerEvidenceFor({...scope,productId:'procedure-acl-reconstruction',serviceDate:'2026-11-15'},'2026-11-15').find(x=>x.id==='uhc-knee-2026');
 assert.ok(commercial.prompts.some(t=>/InterQual/.test(t)));
});
