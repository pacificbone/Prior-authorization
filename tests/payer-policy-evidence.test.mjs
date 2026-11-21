import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PAYER_POLICY_EVIDENCE,payerEvidenceFor,payerVerificationWorksheet,validatePayerEvidence,promptsFor,validateDocumentationBranches} from '../shared/payer-policy-evidence.mjs';
import {PAYER_DOCUMENTATION_BRANCHES} from '../shared/payer-documentation-branches.mjs';
import {renderClinicalAddendumPanel,staffVerificationWorksheet} from '../public/clinical-addendum-panel.mjs';
import {verifyPolicySnapshot} from '../server/policy-snapshot.mjs';
const scope={payer:'HMSA',line:'Commercial',benefit:'Medical',planId:'Unverified fictional plan',productId:'gel-monovisc',serviceDate:'2026-11-07',setting:'Office',state:'HI',medication:true};
const refs=(patch={})=>payerEvidenceFor({...scope,...patch},'2026-11-07');
test('reviewed evidence contains source identity and digest, never procurement permissions',()=>{
 assert.equal(validatePayerEvidence(),true);assert.equal(PAYER_POLICY_EVIDENCE.length,33);
 const register=JSON.parse(readFileSync(new URL('../docs/policy-source-checksums.json',import.meta.url))).snapshots;
 const sums=register.map(x=>x.sha256);
 const fingerprinted=PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly!==true),directoryOnly=PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly===true);
 assert.equal(fingerprinted.length,27);assert.equal(directoryOnly.length,6);
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
 // Re-downloaded and matched on 2026-11-15: the Evolent matrix and the UHC policies are fingerprinted snapshots again.
 assert.ok(fingerprinted.some(s=>s.id==='hmsa-evolent-matrix-2026'));
 for(const id of ['uhc-knee-2026','uhc-hip-2026','uhc-gel-2026','uhc-evenity-2026','uhc-denosumab-2026','uhc-sij-2026','uhc-omnibus-carpal-2026']){const s=fingerprinted.find(x=>x.id===id);assert.ok(s,id);assert.equal(s.retrievedAt,'2026-11-15');assert.deepEqual([...s.lines],['Commercial','Individual Exchange']);}
 assert.equal(register.some(r=>r.status==='pending-reverification'),false);
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
 // Medicare Advantage gel policies are their own fingerprinted documents with a different preferred list.
 const maGel=refs({line:'Medicare Advantage'});assert.ok(maGel.every(s=>/^[0-9a-f]{64}$/.test(s.sourceSha256)));
 assert.match(maGel.find(s=>s.id==='hmsa-gel-ma-preference-2026').summary,/Durolane, Euflexxa, Gelsyn-3 and Supartz FX/);
 assert.match(maGel.find(s=>s.id==='hmsa-gel-ma-preference-2026').limitations,/supply route stays unverified/);
 assert.doesNotMatch(maGel.find(s=>s.id==='hmsa-gel-ma-2026').summary,/six months of conservative/);
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
 const uhc=refs({payer:'UnitedHealthcare'});const source=uhc.find(s=>s.id==='uhc-sourcing-2026');assert.equal(source.effectiveFrom,null);
 // The UHC gel policy is a separate fingerprinted record and states its own scope; it never reaches HMSA or MA.
 const gelPolicy=uhc.find(s=>s.id==='uhc-gel-2026');assert.match(gelPolicy.summary,/Durolane, Euflexxa and Gelsyn-3/);assert.match(gelPolicy.limitations,/not coverage/);
 assert.equal(refs().some(s=>s.id.startsWith('uhc-')),false);
 assert.match(source.summary,/administration only/);assert.match(source.summary,/UMR/);assert.equal(source.orderingAllowed,false);
 // The commercial sourcing protocol and commercial policies never reach Medicare Advantage; only MA-specific records do.
 assert.ok(refs({payer:'UnitedHealthcare',line:'Medicare Advantage'}).every(s=>s.id.startsWith('uhc-ma-')));
 assert.match(source.limitations,/not prove buy-and-bill/);
});
test('dated extracts become overdue and cannot imply exact-plan adoption',()=>{
 for(const asOf of ['2027-02-06','2026-11-06'])assert.ok(payerEvidenceFor(scope,asOf).every(s=>s.reviewOverdue&&s.reviewState==='overdue'&&!s.reviewEndsBeforeService&&!s.reviewDueSoon));
 assert.equal(payerEvidenceFor(scope,'bad').length,0);
 for(const s of refs())assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.prompts),s.id);
});
test('a booked-ahead service is not OVERDUE: review window ending before the service date and due-soon are separate states',()=>{
 // Reviewed 2026-11-07, review due 2027-02-05; the as-of day is fixed so the clock never matters.
 const ahead=refs({serviceDate:'2027-03-01'});
 assert.ok(ahead.length&&ahead.every(s=>!s.reviewOverdue&&s.reviewEndsBeforeService&&s.reviewState==='ends-before-service'));
 const fresh=refs();assert.ok(fresh.every(s=>s.reviewState==='current'&&!s.reviewDueSoon&&s.reviewDueInDays===90));
 const soon=payerEvidenceFor({...scope,serviceDate:'2027-01-20'},'2027-01-20');
 assert.ok(soon.length&&soon.every(s=>s.reviewState==='due-soon'&&s.reviewDueSoon&&s.reviewDueInDays===16&&!s.reviewOverdue));
 // Precedence: overdue > ends-before-service > due-soon > current.
 const both=payerEvidenceFor({...scope,serviceDate:'2027-03-01'},'2027-01-20');
 assert.ok(both.every(s=>s.reviewDueSoon&&s.reviewEndsBeforeService&&s.reviewState==='ends-before-service'));
 assert.equal(payerEvidenceFor({...scope,serviceDate:'2027-02-05'},'2027-02-05')[0].reviewDueInDays,0);
 assert.equal(payerEvidenceFor({...scope,serviceDate:'2027-02-05'},'2027-02-05')[0].reviewState,'due-soon');
 const sheet=d=>payerVerificationWorksheet({...scope,serviceDate:d.service},d.asOf);
 const aheadSheet=sheet({service:'2027-03-01',asOf:'2026-11-07'});
 assert.match(aheadSheet,/Review: Reviewed 2026-11-07; this review window ends 2027-02-05, before the service date: re-check closer to the date of service/);
 assert.doesNotMatch(aheadSheet,/OVERDUE/);
 assert.match(sheet({service:'2027-01-20',asOf:'2027-01-20'}),/fingerprinted snapshot reviewed 2026-11-07; review due 2027-02-05 \(in 16 days\)/);
 assert.match(sheet({service:'2027-02-10',asOf:'2027-02-10'}),/Review: OVERDUE/);
 assert.doesNotMatch(sheet({service:'2026-11-07',asOf:'2026-11-07'}),/OVERDUE|review due|re-check closer/);
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
test('product-scoped prompts: an LCD, preference or product-only prompt never prints for a product it does not name',()=>{
 const arthroplasty=['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-total-hip','procedure-revision-hip'];
 for(const s of PAYER_POLICY_EVIDENCE){
  for(const p of s.prompts)if(typeof p!=='string'){assert.ok(Object.isFrozen(p)&&Object.isFrozen(p.products),s.id);assert.ok(p.products.every(x=>s.products.includes(x)),s.id);}
  for(const productId of s.products.filter(p=>!arthroplasty.includes(p)))
   assert.equal(promptsFor(s,productId).some(t=>/L36575|L34163/.test(t)),false,s.id+' '+productId);
  // Without a product, only the unscoped prompts apply.
  assert.deepEqual([...promptsFor(s,'')],s.prompts.filter(p=>typeof p==='string'));
 }
 const at=(line,productId,medication=false,payer='UnitedHealthcare')=>payerEvidenceFor({payer,line,benefit:'Medical',productId,medication,serviceDate:'2026-11-15'},'2026-11-15');
 const maJoint=productId=>at('Medicare Advantage',productId).find(s=>s.id==='uhc-ma-joint-2026').prompts;
 for(const p of ['procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant']){
  assert.equal(maJoint(p).some(t=>/L36575|L34163/.test(t)),false,p);
  assert.ok(maJoint(p).some(t=>/No Noridian LCD is listed for this procedure/.test(t)&&/Surgery of the Knee \(InterQual/.test(t)),p);
 }
 for(const p of arthroplasty){assert.ok(maJoint(p).some(t=>/L36575/.test(t)),p);assert.equal(maJoint(p).some(t=>/No Noridian LCD is listed/.test(t)),false,p);}
 // Evenity-only, Jubbonti-only and brand-preference language stays with its product.
 const step=(p)=>at('Medicare Advantage',p,true).find(s=>s.id==='uhc-ma-partb-step-2026').prompts;
 assert.ok(step('bone-evenity').some(t=>/Evenity is non-preferred/.test(t)));
 for(const p of ['bone-prolia','bone-jubbonti','bone-bildyos','gel-synvisc'])assert.equal(step(p).some(t=>/Evenity/.test(t)),false,p);
 assert.ok(step('gel-euflexxa').some(t=>/non-preferred hyaluronate/.test(t)));assert.equal(step('gel-durolane').some(t=>/non-preferred/.test(t)),false);
 const den=p=>at('Commercial',p,true).find(s=>s.id==='uhc-denosumab-2026').prompts;
 assert.ok(den('bone-jubbonti').some(t=>/Jubbonti is typically excluded/.test(t)));assert.equal(den('bone-prolia').some(t=>/typically excluded/.test(t)),false);
 const hmsaPref=p=>refs({productId:'gel-'+p}).find(s=>s.id==='hmsa-gel-preference-2026').prompts;
 assert.ok(hmsaPref('monovisc').some(t=>/nonpreferred brand/.test(t)));assert.equal(hmsaPref('euflexxa').some(t=>/nonpreferred brand/.test(t)),false);
 assert.ok(hmsaPref('durolane').some(t=>/nonpreferred brand/.test(t))); // Durolane is in the Commercial/QUEST non-preferred group
 const tka=p=>at('Traditional Medicare',p,false,'Traditional Medicare').find(s=>s.id==='medicare-noridian-tka-l36575').prompts;
 assert.ok(tka('procedure-partial-knee').some(t=>/unicompartmental/.test(t)));assert.equal(tka('procedure-partial-knee').some(t=>/subchondral cysts/.test(t)),false);
 assert.ok(tka('procedure-revision-knee').some(t=>/failure mechanism/.test(t)));assert.equal(tka('procedure-total-knee').some(t=>/failure mechanism/.test(t)),false);
 const ma64728=p=>at('Medicare Advantage',p).find(s=>s.id==='uhc-ma-omnibus-carpal-2026').prompts;
 assert.ok(ma64728('procedure-carpal-ultrasound-other').some(t=>/non-balloon/.test(t)));assert.equal(ma64728('procedure-carpal-balloon').some(t=>/non-balloon/.test(t)),false);
 // Scoped prompts are validated against the record's own products.
 const s=PAYER_POLICY_EVIDENCE.find(x=>x.id==='uhc-ma-joint-2026');
 for(const bad of [{text:'x',products:['procedure-total-hip-typo']},{text:'x',products:[]},{text:'',products:['procedure-total-hip']},{text:'x',products:['procedure-total-hip'],extra:1},{products:['procedure-total-hip']}])
  assert.throws(()=>validatePayerEvidence([{...s,prompts:[bad]}]),JSON.stringify(bad));
 assert.equal(validatePayerEvidence([{...s,prompts:['x',{text:'y',products:['procedure-total-hip']}]}]),true);
});
test('every documentation branch cites a real evidence record and only that record\'s products',()=>{
 assert.equal(validateDocumentationBranches(),true);
 const b=PAYER_DOCUMENTATION_BRANCHES[0];
 assert.throws(()=>validateDocumentationBranches([{...b,evidenceId:'missing'}]));
 assert.throws(()=>validateDocumentationBranches([{...b,products:['bone-prolia']}]));
 assert.throws(()=>validateDocumentationBranches([b,b]));
});
test('the verification worksheet prints the matching documentation branches as undocumented fields',()=>{
 const block='PAYER-POLICY DOCUMENTATION PROMPTS (public reference; plan adoption not verified)';
 const note=payerVerificationWorksheet(scope,'2026-11-07');
 const at=note.indexOf(block);assert.ok(at>note.lastIndexOf('PUBLIC REFERENCE:'),'block follows the evidence references');assert.ok(at<note.indexOf('Verification attachments'));
 assert.match(note,/Request type: Initial/);
 assert.match(note,/HMSA Commercial\/QUEST hyaluronate — initial \(osteoarthritis of the knee\)\n- Osteoarthritis of the knee, side treated \[NOT DOCUMENTED\]/);
 assert.match(note,/nonpreferred hyaluronate exception/); // Monovisc is nonpreferred
 assert.doesNotMatch(note,/hyaluronate — continuation/);
 const renewal=payerVerificationWorksheet({...scope,requestType:'Repeat / continuation'},'2026-11-07');
 assert.match(renewal,/Request type: Repeat \/ continuation/);assert.match(renewal,/hyaluronate — continuation \/ reauthorization/);assert.doesNotMatch(renewal,/hyaluronate — initial/);
 assert.doesNotMatch(payerVerificationWorksheet({...scope,productId:'gel-euflexxa'},'2026-11-07'),/nonpreferred hyaluronate exception/);
 assert.match(payerVerificationWorksheet({...scope,requestType:'Reconsideration / appeal'},'2026-11-07'),/nonpreferred hyaluronate exception/);
 assert.doesNotMatch(payerVerificationWorksheet({...scope,payer:'Other'},'2026-11-07'),/PAYER-POLICY DOCUMENTATION PROMPTS/);
 const lines=payerVerificationWorksheet(scope,'2026-11-07').split('\n');
 const fieldLines=lines.slice(lines.indexOf(block)).filter(l=>l.startsWith('- '));
 assert.ok(fieldLines.length>0&&fieldLines.every(l=>l.endsWith(' [NOT DOCUMENTED]')));
 // A date the page filled in is printed as policy context, never as the planned date; a Medigap scope names the primary claim.
 assert.match(payerVerificationWorksheet({...scope,serviceDateDefaulted:true},'2026-11-07'),/\/ \[DATE NOT SELECTED — policy context used 2026-11-07\]\n/);
 assert.match(payerVerificationWorksheet({...scope,payer:'Traditional Medicare',secondaryPayer:'Medigap',line:'Traditional Medicare'},'2026-11-07'),/Original Medicare primary claim \(Medigap pays secondary\)/);
 // A product without a matching branch says so instead of printing nothing.
 assert.match(payerVerificationWorksheet({payer:'UnitedHealthcare',line:'Commercial',benefit:'Medical',productId:'procedure-acl-reconstruction',serviceDate:'2026-11-15'},'2026-11-15'),/UnitedHealthcare Commercial \/ Exchange — knee surgery evidence review/);
 assert.match(payerVerificationWorksheet({payer:'UnitedHealthcare',line:'Commercial',benefit:'Medical',productId:'procedure-acl-reconstruction',serviceDate:'2026-11-15',requestType:'Reconsideration / appeal'},'2026-11-15'),/No documentation branch matches this request type and product/);
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
 await assert.rejects(()=>verifyPolicySnapshot('hmsa-evolent-matrix-2026',bytes),/mismatch/); // re-bound on 2026-11-15 after a matching re-download
 await assert.rejects(()=>verifyPolicySnapshot('pending',bytes,[{id:'pending',title:'Pending record',sourceSha256:null,registerSha256:'9f0be978'+'0'.repeat(56)}]),/No fingerprint on record.*register digest 9f0be978/);
 await assert.rejects(()=>verifyPolicySnapshot('medicare-noridian-tka-l36575',bytes),/directory entry or web document/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',new TextEncoder().encode('<html>Login</html>'),registry),/PDF/);
 await assert.rejects(()=>verifyPolicySnapshot('wrong',bytes,registry),/Unknown/);
 await assert.rejects(()=>verifyPolicySnapshot('fictional',bytes,[...registry,...registry]),/ambiguous/);
});
