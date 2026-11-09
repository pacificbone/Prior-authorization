import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PAYER_POLICY_EVIDENCE,payerEvidenceFor,payerVerificationWorksheet,validatePayerEvidence} from '../shared/payer-policy-evidence.mjs';
import {renderClinicalAddendumPanel,staffVerificationWorksheet} from '../public/clinical-addendum-panel.mjs';
import {verifyPolicySnapshot} from '../server/policy-snapshot.mjs';
const scope={payer:'HMSA',line:'Commercial',benefit:'Medical',planId:'Unverified fictional plan',productId:'gel-monovisc',serviceDate:'2026-11-07',setting:'Office',state:'HI',medication:true};
const refs=(patch={})=>payerEvidenceFor({...scope,...patch},'2026-11-07');
test('reviewed evidence contains source identity and digest, never procurement permissions',()=>{
 assert.equal(validatePayerEvidence(),true);assert.equal(PAYER_POLICY_EVIDENCE.length,18);
 const register=JSON.parse(readFileSync(new URL('../docs/policy-source-checksums.json',import.meta.url))).snapshots;
 const sums=register.map(x=>x.sha256);
 const fingerprinted=PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly!==true),directoryOnly=PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly===true);
 assert.equal(fingerprinted.length,8);assert.equal(directoryOnly.length,10);
 // Register and module agree in both directions.
 for(const s of fingerprinted){const row=register.find(r=>r.sourceId===s.id);assert.ok(row,s.id);assert.equal(row.status,'bound');assert.equal(row.sha256,s.sourceSha256,s.id);}
 for(const row of register.filter(r=>r.status==='bound')){const s=PAYER_POLICY_EVIDENCE.find(x=>x.id===row.sourceId);assert.ok(s,row.sourceId);assert.equal(s.sourceSha256,row.sha256);}
 for(const row of register.filter(r=>r.status==='pending-reverification')){const s=PAYER_POLICY_EVIDENCE.find(x=>x.id===row.sourceId);assert.equal(s.sourceSha256,null);assert.equal(s.registerSha256,row.sha256);assert.equal(s.digestStatus,'unbound-pending-reverification');}
 for(const row of register)assert.ok(['bound','pending-reverification','catalog-only'].includes(row.status),row.document);
 // Medicare records are dated when they were drawn; the HMSA Medicare Advantage extracts are bound to their 2026-11-06 digests.
 for(const s of PAYER_POLICY_EVIDENCE.filter(s=>s.payer==='Traditional Medicare'))assert.equal(s.retrievedAt,'2026-11-08',s.id);
 assert.equal(PAYER_POLICY_EVIDENCE.find(s=>s.id==='hmsa-prolia-ma-2026').directoryOnly,undefined);
 assert.equal(PAYER_POLICY_EVIDENCE.find(s=>s.id==='hmsa-evenity-ma-2025').sourceSha256,'dbfc5b1a4a2990c13a24ed9852ad05fb0ffc7492d59d60fbc4ba5f5f794f9175');
 assert.equal(PAYER_POLICY_EVIDENCE.find(s=>s.id==='uhc-sourcing-2026').referenceType,'sourcing');
 assert.deepEqual([...PAYER_POLICY_EVIDENCE.find(s=>s.id==='uhc-knee-2026').lines],['Commercial','Individual Exchange']);
 assert.ok(directoryOnly.some(s=>s.id==='hmsa-evolent-matrix-2026'));
 for(const s of fingerprinted)assert.ok(sums.includes(s.sourceSha256),s.id);
 // Directory-only references never carry an invented digest and are never promoted to a fingerprinted snapshot.
 for(const s of directoryOnly){assert.equal(s.sourceSha256,null,s.id);assert.equal(sums.includes(s.sourceSha256),false);}
 for(const s of PAYER_POLICY_EVIDENCE){assert.equal(s.sourceRetrieved,true);assert.equal(s.orderingAllowed,false);assert.equal(s.planAdoptionVerified,false);assert.ok(Object.isFrozen(s));assert.equal(new URL(s.sourceUrl).hostname.startsWith('ams-gateway'),false,s.id);}
});
test('HMSA gel preferences and clinical evidence stay in their reviewed coverage lines and benefit',()=>{
 assert.deepEqual(refs().map(s=>s.id),['hmsa-gel-preference-2026','hmsa-gel-clinical-2026']);
 assert.equal(refs({line:'QUEST / Medicaid'}).length,2);
 const cqGel=['hmsa-gel-preference-2026','hmsa-gel-clinical-2026'];
 for(const patch of [{line:'Medicare Advantage'},{benefit:'Pharmacy'},{payer:'AlohaCare'},{serviceDate:'bad'},{productId:'bone-prolia'}])assert.equal(refs(patch).some(s=>cqGel.includes(s.id)),false,JSON.stringify(patch));
 // Medicare Advantage gets only its own directory-level gel references, never the Commercial/QUEST clinical rules.
 assert.deepEqual(refs({line:'Medicare Advantage'}).map(s=>s.id).sort(),['hmsa-gel-ma-2026','hmsa-gel-ma-preference-2026']);
 assert.deepEqual(refs({line:'Medicare Advantage',productId:'bone-prolia'}).map(s=>s.id),['hmsa-prolia-ma-2026']);
 assert.deepEqual(refs({line:'Medicare Advantage',productId:'bone-evenity'}).map(s=>s.id),['hmsa-evenity-ma-2025']);
 assert.equal(refs({productId:'bone-evenity'}).some(s=>s.id==='hmsa-evenity-ma-2025'),false);
 assert.ok(refs({line:'Medicare Advantage'}).every(s=>s.directoryOnly===true&&s.sourceSha256===null));
 assert.equal(refs({serviceDate:'2026-01-01'}).length,1);
 assert.match(refs()[0].summary,/Euflexxa, Synvisc and Synvisc One/);
 assert.match(refs()[1].summary,/last injection/);
});
test('knee guideline cannot become hip, MA gel, or UHC surgical criteria',()=>{
 const knee=refs({productId:'procedure-total-knee',medication:false});assert.equal(knee.length,2);
 assert.equal(knee.find(s=>s.id==='hmsa-evolent-knee-2025').versionConfirmationRequired,true);
 assert.equal(refs({productId:'procedure-total-hip',medication:false}).some(s=>s.id==='hmsa-evolent-knee-2025'),false);
 const uhcKnee=refs({payer:'UnitedHealthcare',productId:'procedure-total-knee',medication:false});
 assert.deepEqual(uhcKnee.map(s=>s.id),['uhc-knee-2026']);
 assert.deepEqual(refs({payer:'UnitedHealthcare',line:'Individual Exchange',productId:'procedure-total-knee',medication:false}).map(s=>s.id),['uhc-knee-2026']);
 assert.equal(uhcKnee.some(s=>s.id.startsWith('hmsa-')),false);
 assert.equal(new URL(uhcKnee[0].sourceUrl).hostname,'www.uhcprovider.com');
});
test('Traditional Medicare LCD references stay on the Traditional Medicare line and never reach Medicare Advantage or other payers',()=>{
 const medicare=(patch={})=>payerEvidenceFor({...scope,payer:'Traditional Medicare',line:'Traditional Medicare',medication:false,...patch},'2026-11-08');
 assert.deepEqual(medicare({productId:'procedure-total-knee'}).map(s=>s.id),['medicare-noridian-tka-l36575']);
 assert.deepEqual(medicare({productId:'procedure-total-hip'}).map(s=>s.id),['medicare-noridian-tha-l34163']);
 assert.deepEqual(medicare({productId:'procedure-si-joint-fusion'}).map(s=>s.id).sort(),['medicare-noridian-sij-fusion-l39810','medicare-noridian-sij-injections-l39462']);
 const ha=medicare({productId:'gel-synvisc-one',medication:true});
 assert.deepEqual(ha.map(s=>s.id),['medicare-noridian-ha-proposed-dl40456']);assert.equal(ha[0].proposed,true);assert.equal(ha[0].effectiveFrom,null);assert.match(ha[0].title,/NOT IN EFFECT/);
 const bone=medicare({productId:'bone-reclast',medication:true});
 assert.deepEqual(bone.map(s=>s.id),['medicare-partb-osteoporosis-drugs-2026']);assert.match(bone[0].summary,/no Noridian LCD/);
 for(const s of PAYER_POLICY_EVIDENCE.filter(s=>s.payer==='Traditional Medicare')){assert.equal(s.directoryOnly,true);assert.equal(s.sourceSha256,null);assert.equal(new URL(s.sourceUrl).hostname,'www.cms.gov');assert.deepEqual([...s.lines],['Traditional Medicare']);}
 assert.equal(medicare({line:'Medicare Advantage',productId:'procedure-total-knee'}).length,0);
 assert.equal(payerEvidenceFor({...scope,payer:'HMSA',productId:'procedure-total-knee',medication:false},'2026-11-08').some(s=>s.id.startsWith('medicare-')),false);
 assert.equal(payerEvidenceFor({...scope,payer:'UnitedHealthcare',productId:'procedure-total-knee',medication:false},'2026-11-08').some(s=>s.id.startsWith('medicare-')),false);
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
 // The nonpreferred-product exception prompts appear at initial precertification, not only on appeal.
 assert.match(html,/nonpreferred hyaluronate exception/);
 // Catalog criteria extracts (reviewed, not fingerprinted) are shown and printed for the same selection.
 const prolia={payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'prolia',benefit:'Medical',serviceDate:'2026-11-07',setting:'Office'};
 assert.match(renderClinicalAddendumPanel(prolia),/Reviewed criteria extracts from the medication catalog \(1\)/);
 assert.match(staffVerificationWorksheet(prolia),/CATALOG CRITERIA EXTRACT \(no PDF fingerprint\): HMSA denosumab/);
 assert.match(staffVerificationWorksheet(prolia,'2026-11-07'),/fingerprinted snapshot reviewed 2026-11-07/);
 const sij={payer:'Traditional Medicare',planId:'original-b',year:2026,serviceId:'si-joint-fusion',benefit:'Medical',serviceDate:'2026-11-08',setting:'Hospital outpatient'};
 assert.match(staffVerificationWorksheet(sij,'2026-11-08'),/web document checked 2026-11-08; no file fingerprint/);
 assert.match(staffVerificationWorksheet(sij,'2026-11-07'),/Review: OVERDUE/); // a record cannot be retrieved after the as-of day
 assert.doesNotMatch(renderClinicalAddendumPanel({...state,benefit:'Pharmacy'}),/HMSA Hyaluronate Products/);
 assert.doesNotMatch(renderClinicalAddendumPanel({...state,clinicalTemplateId:'procedure-total-hip'}),/HMSA Hyaluronate Products/);
 assert.match(renderClinicalAddendumPanel({...state,payer:'<script>alert(1)</script>'}),/&lt;script/);
});
test('changed sources, malformed digests and permission laundering fail registry validation',()=>{
 const s=PAYER_POLICY_EVIDENCE[0];
 for(const patch of [{title:''},{sourceRetrieved:false},{lines:[]},{benefit:'Unknown'},{orderingAllowed:true},{planAdoptionVerified:true},{sourceSha256:'bad'},{sourceUrl:'https://evil.example/policy'},{reviewDue:'2028-01-01'},{products:[]},{referenceType:'coverage'},{digestStatus:'bogus'},{sourceSha256:null,directoryOnly:true,digestStatus:'unbound-pending-reverification'}])assert.throws(()=>validatePayerEvidence([{...s,...patch}]),JSON.stringify(patch));
 assert.throws(()=>validatePayerEvidence([s,s]));
});
test('snapshot verification rejects wrong-title downloads by byte identity and remote revisions',async()=>{
 const bytes=new TextEncoder().encode('%PDF-1.7\nFictional public policy test bytes');
 const sha=Buffer.from(await crypto.subtle.digest('SHA-256',bytes)).toString('hex');
 const registry=[{id:'fictional',title:'Fictional reviewed policy',sourceSha256:sha}];
 const r=await verifyPolicySnapshot('fictional',bytes,registry);assert.equal(r.snapshotMatches,true);assert.equal(r.orderingAllowed,false);assert.equal(r.planAdoptionVerified,false);
 await assert.rejects(()=>verifyPolicySnapshot('hmsa-prolia-cq-2026',bytes),/mismatch/);
 await assert.rejects(()=>verifyPolicySnapshot('hmsa-evolent-matrix-2026',bytes),/No fingerprint on record.*register digest 9f0be978/);
 await assert.rejects(()=>verifyPolicySnapshot('medicare-noridian-tka-l36575',bytes),/directory entry or web document/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',new TextEncoder().encode('<html>Login</html>'),registry),/PDF/);
 await assert.rejects(()=>verifyPolicySnapshot('wrong',bytes,registry),/Unknown/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',bytes,[...registry,...registry]),/ambiguous/);
});
