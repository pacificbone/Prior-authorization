import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PAYER_POLICY_EVIDENCE,payerEvidenceFor,payerVerificationWorksheet,validatePayerEvidence} from '../shared/payer-policy-evidence.mjs';
import {renderClinicalAddendumPanel,staffVerificationWorksheet} from '../public/clinical-addendum-panel.mjs';
import {verifyPolicySnapshot} from '../server/policy-snapshot.mjs';
const scope={payer:'HMSA',line:'Commercial',benefit:'Medical',planId:'Unverified fictional plan',productId:'gel-monovisc',serviceDate:'2026-11-07',setting:'Office',state:'HI',medication:true};
const refs=(patch={})=>payerEvidenceFor({...scope,...patch},'2026-11-07');
test('reviewed evidence contains source identity and digest, never procurement permissions',()=>{
 assert.equal(validatePayerEvidence(),true);assert.equal(PAYER_POLICY_EVIDENCE.length,7);
 const sums=JSON.parse(readFileSync(new URL('../docs/policy-source-checksums.json',import.meta.url))).snapshots.map(x=>x.sha256);
 for(const s of PAYER_POLICY_EVIDENCE){assert.ok(sums.includes(s.sourceSha256),s.id);assert.equal(s.sourceRetrieved,true);assert.equal(s.orderingAllowed,false);assert.equal(s.planAdoptionVerified,false);assert.ok(Object.isFrozen(s));}
});
test('HMSA gel preferences and clinical evidence stay in their reviewed coverage lines and benefit',()=>{
 assert.deepEqual(refs().map(s=>s.id),['hmsa-gel-preference-2026','hmsa-gel-clinical-2026']);
 assert.equal(refs({line:'QUEST / Medicaid'}).length,2);
 for(const patch of [{line:'Medicare Advantage'},{benefit:'Pharmacy'},{payer:'AlohaCare'},{serviceDate:'bad'},{productId:'bone-prolia'}])assert.equal(refs(patch).some(s=>s.id.startsWith('hmsa-gel')),false);
 assert.equal(refs({serviceDate:'2026-01-01'}).length,1);
 assert.match(refs()[0].summary,/Euflexxa, Synvisc and Synvisc One/);
 assert.match(refs()[1].summary,/last injection/);
});
test('knee guideline cannot become hip, MA gel, or UHC surgical criteria',()=>{
 const knee=refs({productId:'procedure-total-knee',medication:false});assert.equal(knee.length,2);
 assert.equal(knee.find(s=>s.id==='hmsa-evolent-knee-2025').versionConfirmationRequired,true);
 assert.equal(refs({productId:'procedure-total-hip',medication:false}).some(s=>s.id==='hmsa-evolent-knee-2025'),false);
 assert.equal(refs({payer:'UnitedHealthcare',productId:'procedure-total-knee',medication:false}).length,0);
});
test('publication code is not silently converted to an effective date or buy-and-bill authority',()=>{
 const source=refs({payer:'UnitedHealthcare'})[0];assert.equal(source.effectiveFrom,null);
 assert.match(source.summary,/administration only/);assert.match(source.summary,/UMR/);assert.equal(source.orderingAllowed,false);
 assert.equal(refs({payer:'UnitedHealthcare',line:'Medicare Advantage'}).length,0);
 assert.match(source.limitations,/not prove buy-and-bill/);
});
test('dated extracts become overdue and cannot imply exact-plan adoption',()=>{
 for(const asOf of ['2027-02-06','2026-11-06'])assert.ok(payerEvidenceFor(scope,asOf).every(s=>s.reviewOverdue));
 assert.ok(refs({serviceDate:'2027-03-01'}).every(s=>s.reviewOverdue));
 assert.equal(payerEvidenceFor(scope,'bad').length,0);
});
test('printable workup separates retrieved sources from missing adoption, eligibility and supplier proof',()=>{
 const note=payerVerificationWorksheet(scope,'2026-11-07');
 for(const text of ['SYNTHETIC','NOT VERIFIED','Ordering: BLOCKED','last injection','source version/hash','facility'])assert.ok(note.includes(text),text);
 assert.match(payerVerificationWorksheet({...scope,payer:'Other'},'2026-11-07'),/No matching public reference/);
});
test('staff evidence and worksheet match selected template, plan line, benefit and date',()=>{
 const state={payer:'HMSA',planId:'hmsa-quest',year:2026,serviceId:'knee-gel',gelProductId:'monovisc',benefit:'Medical',serviceDate:'2026-11-07',setting:'Office'};
 const html=renderClinicalAddendumPanel(state);assert.match(html,/HMSA Hyaluronate Products/);assert.match(html,/staff-print-verification/);
 assert.match(staffVerificationWorksheet(state),/QUEST \/ Medicaid/);
 assert.doesNotMatch(renderClinicalAddendumPanel({...state,benefit:'Pharmacy'}),/HMSA Hyaluronate Products/);
 assert.doesNotMatch(renderClinicalAddendumPanel({...state,clinicalTemplateId:'procedure-total-hip'}),/HMSA Hyaluronate Products/);
 assert.match(renderClinicalAddendumPanel({...state,payer:'<script>alert(1)</script>'}),/&lt;script/);
});
test('changed sources, malformed digests and permission laundering fail registry validation',()=>{
 const s=PAYER_POLICY_EVIDENCE[0];
 for(const patch of [{title:''},{sourceRetrieved:false},{lines:[]},{benefit:'Unknown'},{orderingAllowed:true},{planAdoptionVerified:true},{sourceSha256:'bad'},{sourceUrl:'https://evil.example/policy'},{reviewDue:'2028-01-01'}])assert.throws(()=>validatePayerEvidence([{...s,...patch}]));
 assert.throws(()=>validatePayerEvidence([s,s]));
});
test('snapshot verification rejects wrong-title downloads by byte identity and remote revisions',async()=>{
 const bytes=new TextEncoder().encode('%PDF-1.7\nFictional public policy test bytes');
 const sha=Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex');
 const registry=[{id:'fictional',title:'Fictional reviewed policy',sourceSha256:sha}];
 const r=await verifyPolicySnapshot('fictional',bytes,registry);assert.equal(r.snapshotMatches,true);assert.equal(r.orderingAllowed,false);assert.equal(r.planAdoptionVerified,false);
 await assert.rejects(()=>verifyPolicySnapshot('hmsa-prolia-cq-2026',bytes),/mismatch/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',new TextEncoder().encode('<html>Login</html>'),registry),/PDF/);
 await assert.rejects(()=>verifyPolicySnapshot('wrong',bytes,registry),/Unknown/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',bytes,[...registry,...registry]),/ambiguous/);
});
