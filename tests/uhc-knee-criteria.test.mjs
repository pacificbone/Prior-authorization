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
 assert.equal(knee.sourceSha256,null);
 const branches=documentationBranchesFor(refs.map(x=>x.id),'Initial');
 assert.ok(branches.some(x=>x.id==='uhc-knee-2026-review'));
});
test('UHC public knee policy does not leak to HMSA or Medicare Advantage',()=>{
 assert.equal(payerEvidenceFor({...scope,payer:'HMSA'},'2026-11-08').some(x=>x.id==='uhc-knee-2026'),false);
 assert.equal(payerEvidenceFor({...scope,line:'Medicare Advantage'},'2026-11-08').some(x=>x.id==='uhc-knee-2026'),false);
});
