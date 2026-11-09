import test from 'node:test';
import assert from 'node:assert/strict';
import {
 STAFF_PAYERS,STAFF_SERVICES,STAFF_CATEGORY_LABELS,staffPlansForPayer,
 staffGetPlan,staffGetService,staffServices,staffContext,
 staffAuthorizePacket,staffPatientScript,validateStaffRegistry
} from '../shared/staff-workflow.mjs';
import {newCostCase,estimatePatientCost,getCostService} from '../shared/patient-cost.mjs';

test('directory owner invariant: no unrelated insurer plans in payer dropdown',()=>{
 assert.equal(validateStaffRegistry(),true);
 const hmsa=staffPlansForPayer('HMSA',2026);
 const uhc=staffPlansForPayer('UnitedHealthcare',2026);
 const va=staffPlansForPayer('Veterans Affairs',2026);
 assert.ok(hmsa.some(x=>x.id==='hmsa-quest'));
 assert.ok(uhc.some(x=>x.id==='uhc-quest'));
 assert.ok(va.some(x=>x.id==='va'));
 assert.ok(!hmsa.some(x=>x.id==='va'||x.id==='uhc-quest'||x.id==='tricare'));
 assert.ok(!uhc.some(x=>x.id==='hmsa-quest'));
 assert.ok(!va.some(x=>x.id==='hmsa-quest'));
 assert.ok(staffPlansForPayer('HMSA',2026).every(x=>x.payer==='HMSA'));
 assert.equal(staffGetPlan('HMSA','va',2026),null);
 assert.throws(()=>staffContext({payer:'HMSA',planId:'va',year:2026,serviceId:'evenity',benefit:'Pharmacy'}),/does not belong/);
 assert.throws(()=>staffContext({payer:'HMSA',planId:'uhc-quest',year:2026}),/does not belong/);
 assert.deepEqual(staffPlansForPayer('Unknown',2026),[]);
});

test('plan availability is separate from the reviewed source edition, so 2027 keeps plans visible with an edition warning',()=>{
 const hmsa27=staffPlansForPayer('HMSA',2027).map(x=>x.id);
 for(const id of ['hmsa-select-choice','hmsa-essential','hmsa-metallic','hmsa-quest','hmsa-ma-individual','hmsa-fep','bcbs-fep'])assert.ok(hmsa27.includes(id),id);
 assert.ok(staffPlansForPayer('UHA',2027).some(x=>x.id==='uha-employer'));
 assert.ok(staffPlansForPayer('UnitedHealthcare',2027).some(x=>x.id==='uhc-quest'));
 // ʻOhana QUEST Integration membership ends 12/31/2026; its separate CCS contract stays selectable.
 assert.equal(staffPlansForPayer('ʻOhana / Wellcare',2027).some(x=>x.id==='ohana-quest'),false);
 assert.ok(staffPlansForPayer('ʻOhana / Wellcare',2026).some(x=>x.id==='ohana-quest'));
 const q27=staffContext({payer:'HMSA',planId:'hmsa-quest',year:2027,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.equal(q27.liveSource,null);
 assert.ok(q27.restrictions.some(x=>/2026 edition/.test(x)));
 assert.ok(q27.restrictions.some(x=>/no 2027 edition is indexed/.test(x)));
 assert.equal(staffContext({payer:'HMSA',planId:'hmsa-quest',year:2026,serviceId:'alendronate',benefit:'Pharmacy'}).restrictions.some(x=>/edition/.test(x)),false);
});
test('delegated administrator lists, partial published-list extracts and benefit-line mismatches are surfaced with explicit caveats',()=>{
 const uhcMa=staffContext({payer:'UnitedHealthcare',planId:'uhc-ma',year:2026,serviceId:'prolia',benefit:'Medical'});
 assert.deepEqual(uhcMa.supplementaryPA.map(p=>p.id),['mdx-uhc-ma-drug-list-2026']);
 assert.ok(uhcMa.restrictions.some(x=>/delegated administrator/.test(x)&&/verify delegation/.test(x)));
 assert.equal(staffContext({payer:'UnitedHealthcare',planId:'uhc-commercial',year:2026,serviceId:'prolia',benefit:'Medical'}).supplementaryPA.length,0);
 const mdx=staffContext({payer:'MDX Hawaiʻi',planId:'mdx',year:2026,serviceId:'evenity',benefit:'Medical'});
 assert.deepEqual(mdx.supplementaryPA.map(p=>p.id),['mdx-uhc-ma-drug-list-2026']);
 assert.equal(mdx.primaryPolicy,null);
 assert.ok(mdx.restrictions.some(x=>/UnitedHealthcare \(Medicare Advantage\)/.test(x)));
 const hmaa=staffContext({payer:'HMAA',planId:'hmaa-employer',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.deepEqual(hmaa.formularyEntries.map(p=>p.id),['hmaa-premium-2026-h2-alendronate']);
 assert.ok(hmaa.restrictions.some(x=>/NOT verified/.test(x)&&/HMAA-OPTUMRX-PREMIUM-2026-H2/.test(x)));
 assert.ok(hmaa.sourceLinks.some(x=>x.status==='formulary-extract'));
 assert.equal(staffContext({payer:'HMAA',planId:'hmaa-employer',year:2026,serviceId:'celecoxib',benefit:'Pharmacy'}).formularyEntries.length,0);
 assert.equal(hmaa.assurance.formulary,'not determined');
 assert.ok(staffContext({payer:'Humana',planId:'humana-pdp',year:2026,serviceId:'prolia',benefit:'Medical'}).restrictions.some(x=>/no medical benefit/.test(x)));
 assert.ok(staffContext({payer:'HMSA',planId:'hmsa-metallic',year:2026,serviceId:'prolia',benefit:'Medical'}).restrictions.some(x=>/Metallic/.test(x)));
 assert.equal(staffContext({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'prolia',benefit:'Medical'}).restrictions.some(x=>/Metallic/.test(x)),false);
});
test('staff plan precision distinguishes exact pharmacy ID from plan-family source or administrator',()=>{
 const hmsa=staffGetPlan('HMSA','hmsa-select-choice',2026);
 const quest=staffGetPlan('HMSA','hmsa-quest',2026);
 const mdx=staffGetPlan('MDX Hawaiʻi','mdx',2026);
 const a=staffContext({payer:'HMSA',planId:hmsa.id,year:2026,serviceId:'evenity',benefit:'Medical'});
 assert.equal(a.planPrecision.level,'plan-family');
 assert.ok(a.restrictions.some(x=>x.includes('NOT a member-specific plan match')));
 const b=staffContext({payer:'HMSA',planId:quest.id,year:2026,serviceId:'evenity',benefit:'Pharmacy'});
 assert.equal(b.planPrecision.level,'published-plan-id');
 assert.equal(b.planPrecision.planId,'22780AA1111111');
 assert.equal(b.planPrecision.fileKey,true);assert.match(b.planPrecision.label,/file plan key/);assert.doesNotMatch(b.planPrecision.label,/Exact/);
 const kaiser=staffContext({payer:'Kaiser Permanente',planId:'kaiser-individual',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.equal(kaiser.planPrecision.fileKey,false);assert.match(kaiser.planPrecision.label,/Exact published pharmacy plan ID/);
 const c=staffContext({payer:'MDX Hawaiʻi',planId:mdx.id,year:2026,serviceId:'evenity'});
 assert.equal(c.planPrecision.level,'administrator');
 const d=staffAuthorizePacket({payer:'HMSA',planId:hmsa.id,year:2026,serviceId:'total-knee',benefit:'Medical',checks:{}});
 assert.match(d,/PLAN IDENTIFICATION: Plan family/);
});
test('Medicare Part D and VA cannot appear as an HMSA medical plan',()=>{
 assert.equal(staffGetPlan('HMSA','original-b',2026),null);
 assert.equal(staffGetPlan('Traditional Medicare','hmsa-quest',2026),null);
 const medicare=staffContext({payer:'Traditional Medicare',planId:'original-b',year:2026,serviceId:'prolia',benefit:'Pharmacy'});
 assert.ok(medicare.restrictions.some(x=>/no outpatient Part D|actual PDP/.test(x)));
 assert.equal(medicare.liveSource,null);
 const va=staffContext({payer:'Veterans Affairs',planId:'va',serviceId:'carpal-open'});
 assert.ok(va.sourceLinks.some(x=>x.name==='VA National Formulary'));
 assert.ok(!va.sourceLinks.some(x=>x.name.includes('HMSA')));
 const hmsa=staffPlansForPayer('HMSA',2026);
 assert.ok(!hmsa.some(x=>x.id==='original-d'||x.id==='uha-medical-pa'||x.id==='va-cfuses'));
});

test('machine-readable pharmacy file is available only to the exact insurer/plan/year/benefit',()=>{
 const hmsa=staffContext({payer:'HMSA',planId:'hmsa-quest',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.equal(hmsa.liveSource?.id,'hmsa-quest-2026-11');
 assert.equal(hmsa.liveSource?.planId,'22780AA1111111');
 assert.equal(hmsa.primaryPolicy,null);
 const noMed=staffContext({payer:'HMSA',planId:'hmsa-quest',year:2026,serviceId:'alendronate',benefit:'Medical'});
 assert.equal(noMed.liveSource,null);
 const uhc=staffContext({payer:'UnitedHealthcare',planId:'uhc-quest',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.equal(uhc.liveSource?.id,'uhc-quest-2026-10');
 assert.ok(!uhc.sourceLinks.some(x=>x.url.includes('hmsa.com')));
 const kaiser=staffContext({payer:'Kaiser Permanente',planId:'kaiser-individual',year:2026,serviceId:'prolia',benefit:'Pharmacy'});
 assert.equal(kaiser.liveSource?.planId,'60612HI0110006');
 const commercial=staffContext({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.equal(commercial.liveSource,null);
 assert.ok(commercial.restrictions.some(x=>/does not yet have complete/.test(x)));
 assert.equal(commercial.assurance.formulary,'not determined');
});

test('medication clinical authorization requirements scoped by insurer and program',()=>{
 const medical=staffContext({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'evenity',benefit:'Medical'});
 assert.equal(medical.primaryPolicy?.payer,'HMSA');
 assert.ok(medical.criteria.length>=5);
 assert.ok(medical.primaryPolicy?.url.includes('hmsa.com'));
 assert.ok(medical.criteria.some(x=>x.id==='diagnosis'));
 const rx=staffContext({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'evenity',benefit:'Pharmacy'});
 assert.equal(rx.primaryPolicy,null);
 const uhc=staffContext({payer:'UnitedHealthcare',planId:'uhc-commercial',year:2026,serviceId:'evenity',benefit:'Medical'});
 assert.equal(uhc.primaryPolicy?.payer,'UnitedHealthcare');
 assert.ok(!uhc.sourceLinks.some(x=>x.name.startsWith('HMSA')));
 const mdx=staffContext({payer:'MDX Hawaiʻi',planId:'mdx',year:2026,serviceId:'evenity',benefit:'Medical'});
 assert.ok(mdx.restrictions.some(x=>/underlying carrier/.test(x)));
 assert.equal(mdx.primaryPolicy,null);
});

test('procedure policy links never inherit another payer or knee policy for hip',()=>{
 const hip=staffContext({payer:'UnitedHealthcare',planId:'uhc-commercial',year:2026,serviceId:'total-hip',benefit:'Medical'});
 assert.ok(hip.sourceLinks.some(x=>x.name.includes('Surgery of the Hip')));
 assert.ok(!hip.sourceLinks.some(x=>x.name.includes('Surgery of the Knee')));
 assert.deepEqual(hip.possibleCodes.map(x=>x.code),['27130']);
 const knee=staffContext({payer:'UnitedHealthcare',planId:'uhc-commercial',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(knee.sourceLinks.some(x=>x.name.includes('Surgery of the Knee')));
 assert.ok(!knee.sourceLinks.some(x=>x.name.includes('Surgery of the Hip')));
 const va=staffContext({payer:'Veterans Affairs',planId:'va',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(!va.sourceLinks.some(x=>x.name.includes('UnitedHealthcare')));
});

test('service catalog includes common and peripheral work and drug families, each unique',()=>{
 assert.ok(STAFF_SERVICES.length>=55);
 const ids=new Set(STAFF_SERVICES.map(x=>x.id));
 assert.equal(ids.size,STAFF_SERVICES.length);
 for(const id of ['total-knee','total-hip','revision-knee','revision-hip','partial-knee','knee-gel','maci-harvest','maci-implant',
 'carpal-open','carpal-balloon','carpal-ultrasound-other','trigger-finger','trigger-finger-percutaneous','si-joint-fusion',
 'pns-knee','iovera','genicular-rfa','meniscus-root','bear-acl','cartiheal','prp','bmac','a2m','osteochondral-allograft',
 'mri-knee','dexa','dme-brace','office-pt','core-decompression','osseointegration','acl-reconstruction']){
  assert.ok(staffGetService(id),id);
 }
 for(const id of ['evenity','prolia','jubbonti','zoledronic-acid','teriparatide','celecoxib','meloxicam','gabapentin',
 'pregabalin','apixaban','tramadol','methylprednisolone','exparel']){
  assert.ok(staffGetService(id),id);
  assert.ok(getCostService('drug-'+id),id+' needs cost routing');
 }
 assert.ok(staffServices({query:'MACI'}).some(x=>x.id==='maci-implant'));
 assert.ok(staffServices({query:'MACI'}).some(x=>x.id==='maci-cell-product'));
 assert.ok(staffServices({query:'Celebrex'}).some(x=>x.id==='celecoxib'));
 assert.equal(staffGetService('romosozumab'),null);
 assert.equal(getCostService('drug-romosozumab'),null);
 // Trigger finger and SI joint fusion are orthopedic catalog procedures with payer-source routing, not loose extras.
 const sij=staffContext({payer:'Traditional Medicare',planId:'original-b',year:2026,serviceId:'si-joint-fusion',benefit:'Medical'});
 assert.ok(sij.sourceLinks.some(x=>/L39810/.test(x.name)));
 assert.ok(sij.criteria.some(c=>c.id==='diagnosticBlock'));
 const tf=staffContext({payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'trigger-finger-percutaneous',benefit:'Medical'});
 assert.deepEqual(tf.possibleCodes,[]);
 assert.ok(tf.criteria.some(c=>c.id==='conservativeHand'));
 const fep=staffContext({payer:'HMSA',planId:'hmsa-fep',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(fep.sourceLinks.some(x=>/Federal Plan 87/.test(x.name)));
 const noSource=staffContext({payer:'Curative',planId:'curative-commercial',year:2026,serviceId:'si-joint-fusion',benefit:'Medical'});
 assert.ok(noSource.restrictions.some(x=>/No payer-specific procedure policy or code-list source is cataloged/.test(x))||noSource.sourceLinks.some(x=>x.status==='plan-check'));
 assert.ok(staffServices({query:'carpal'}).some(x=>x.id==='carpal-open'));
 assert.ok(Object.hasOwn(STAFF_CATEGORY_LABELS,'imaging'));
});

test('documentation template contains placeholders and uncovered clinical gaps rather than invented findings',()=>{
 const query={payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'total-knee',
   benefit:'Medical',requestType:'Initial',setting:'ASC',checks:{diagnosis:true}};
 const packet=staffAuthorizePacket(query);
 assert.match(packet,/PACIFIC BONE & JOINT/);
 assert.match(packet,/PRIOR AUTHORIZATION DOCUMENTATION WORKSHEET/);
 assert.match(packet,/TO: HMSA/);
 assert.match(packet,/Candidate|CANDIDATE CODES: 27447/);
 assert.match(packet,/TO BE COMPLETED|To be completed ONLY/);
 assert.match(packet,/\[RECORD LOCATED\] Diagnosis/);
 assert.match(packet,/\[NOT YET LOCATED\]/);
 assert.match(packet,/HMSA/);
 assert.match(packet,/UNRESOLVED: Exact member eligibility/);
 assert.doesNotMatch(packet,/Authorization approved|Patient has failed therapy|meets all criteria/i);
 assert.throws(()=>staffAuthorizePacket({...query,patientName:'Joe'}),/|/); // blocked by no patient output even if supplied, schema validation follows app UI
 assert.throws(()=>staffAuthorizePacket({...query,checks:{patientName:true}}),/Only the prepared/);
});
test('patient explanation never guarantees covered service or price',()=>{
 const script=staffPatientScript({payer:'HMSA',planId:'hmsa-quest',year:2026,serviceId:'knee-gel',benefit:'Medical'});
 assert.match(script,/We are checking coverage/);
 assert.match(script,/not yet have enough verified/);
 assert.match(script,/authorization/);
 assert.doesNotMatch(script,/guaranteed coverage|definitely covered/i);
});
test('synthetic cost case and plan registry do not import private Cuptomize rates',()=>{
 const cost=newCostCase({procedureId:'total-knee',payer:'HMSA',line:'Commercial'});
 const result=estimatePatientCost(cost);
 assert.equal(result.totalRequired,null);
 assert.ok(result.missingRequired.length>0);
});
