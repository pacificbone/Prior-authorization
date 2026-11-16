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
 assert.equal(at('procedure-total-hip',{line:'Medicare Advantage'}).length,0);
 assert.equal(at('procedure-si-joint-fusion',{payer:'HMSA'}).some(x=>x.startsWith('uhc-')),false);
 const d=payerEvidenceFor({...scope,productId:'bone-jubbonti',medication:true,serviceDate:'2026-11-15'},'2026-11-15').find(x=>x.id==='uhc-denosumab-2026');
 assert.match(d.summary,/Jubbonti and Ospomyv are typically excluded/);
 assert.match(d.limitations,/never carry a preference across payers/);
});
