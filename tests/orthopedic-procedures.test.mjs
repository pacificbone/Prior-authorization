import test from 'node:test';
import assert from 'node:assert/strict';
import {
  orthoProcedures,orthoPayerSources,orthoGelProducts,
  getOrthoProcedure,getOrthoPayerSources,getOrthoProcedureCodes,
  orthoAuthorizationSnapshot,validateOrthoCatalog,validateOrthoCase,
  defaultOrthoCase,getOrthoActiveCriteria,createOrthoWorksheet
} from '../shared/orthopedic-procedures.mjs';

test('orthopedic catalog validates and covers gels, hips, knees, MACI, hand and sports',()=>{
  assert.equal(validateOrthoCatalog(),true);
  for(const id of ['knee-gel','total-knee','partial-knee','total-hip','revision-knee','revision-hip',
    'maci-harvest','maci-implant','carpal-open','carpal-endo','carpal-balloon','carpal-ultrasound-other',
    'acl-reconstruction','meniscus-repair'])assert.ok(getOrthoProcedure(id),'Missing '+id);
  const codes=(id)=>getOrthoProcedure(id).codes.map(x=>x.code);
  assert.deepEqual(codes('total-knee'),['27447']);
  assert.deepEqual(codes('total-hip'),['27130']);
  assert.deepEqual(codes('maci-implant'),['27412','J7330']);
  assert.deepEqual(codes('maci-harvest'),['S2112']);
  assert.deepEqual(codes('carpal-open'),['64721']);
  assert.deepEqual(codes('carpal-endo'),['29848']);
  assert.deepEqual(codes('carpal-balloon'),['64728']);
  assert.deepEqual(codes('carpal-ultrasound-other'),[]);
  for(const svc of orthoProcedures){
    assert.equal(new Set(svc.criteria.map(c=>c.id)).size,svc.criteria.length,svc.id+' duplicate criteria');
  }
});

test('gel product HCPCS codes do not get used until exact brand is chosen',()=>{
  const base=defaultOrthoCase();
  assert.deepEqual(getOrthoProcedureCodes(base).map(x=>x.code),['20610']);
  assert.deepEqual(getOrthoProcedureCodes({...base,gelProductId:'gelsyn-3',guidance:'with-ultrasound'}).map(x=>x.code),['20611','J7328']);
  assert.equal(orthoGelProducts.find(x=>x.id==='gelsyn-3').unit,'per 0.1 mg');
  assert.deepEqual(getOrthoProcedureCodes({...base,gelProductId:'monovisc'}).map(x=>x.code),['20610','J7327']);
  assert.deepEqual(getOrthoProcedureCodes({...base,gelProductId:'synvisc-one'}).map(x=>x.code),['20610','J7325']);
  assert.deepEqual(getOrthoProcedureCodes({...base,gelProductId:'triluron'}).map(x=>x.code),['20610','J7332']);
  assert.equal(new Set(orthoGelProducts.map(x=>x.id)).size,orthoGelProducts.length);
});

test('payer source lookup separates UHC knee and hip and 64728 from regular carpal tunnel',()=>{
  const sources=(payer,line,procedureId)=>getOrthoPayerSources({payer,line,procedureId}).map(x=>x.id);
  const knee=sources('UnitedHealthcare','Commercial','total-knee');
  assert.ok(knee.includes('uhc-surgery-knee'));
  assert.ok(!knee.includes('uhc-surgery-hip'));
  const hip=sources('UnitedHealthcare','Commercial','total-hip');
  assert.ok(hip.includes('uhc-surgery-hip'));
  assert.ok(!hip.includes('uhc-surgery-knee'));
  assert.ok(sources('UnitedHealthcare','QUEST / Medicaid','maci-implant').includes('uhc-community-knee'));
  assert.ok(!sources('UnitedHealthcare','Commercial','maci-implant').includes('uhc-community-knee'));
  assert.ok(sources('UnitedHealthcare','Commercial','carpal-balloon').includes('uhc-percutaneous'));
  assert.ok(!sources('UnitedHealthcare','Commercial','carpal-open').includes('uhc-percutaneous'));
  assert.ok(!sources('UnitedHealthcare','Commercial','carpal-ultrasound-other').includes('uhc-percutaneous'));
  assert.ok(sources('Traditional Medicare','Traditional Medicare','knee-gel').includes('noridian-ha-draft'));
  assert.ok(sources('HMSA','Commercial','total-hip').includes('hmsa-msk'));
  assert.ok(sources('UHA','Commercial','maci-implant').includes('uha-medical'));
  assert.ok(sources('UHA','Commercial','maci-implant').includes('maci-billing'));
  assert.ok(!sources('UHA','Commercial','knee-gel').includes('maci-billing'));
  assert.equal(orthoPayerSources.find(x=>x.id==='noridian-ha-draft').kind,'proposed-only');
});

test('status remains unverified even when all preparation boxes are ticked',()=>{
  const base={...defaultOrthoCase(),planLabel:'HMSA Choice',gelProductId:'monovisc'};
  const svc=getOrthoProcedure(base.procedureId);
  const checks=Object.fromEntries(svc.criteria.map(c=>[c.id,true]));
  const ready=orthoAuthorizationSnapshot({...base,checks});
  assert.equal(ready.missing.length,0);
  assert.equal(ready.readyForSubmission,false);
  assert.equal(ready.coverage,'unknown');
  assert.equal(ready.authorization,'not verified');
  assert.match(ready.blockers.join(' '),/eligibility.*not verified/i);
  assert.match(ready.blockers.join(' '),/PA determination/i);
});

test('non-balloon ultrasound guided CTR must not inherit balloon 64728 code',()=>{
  const data={...defaultOrthoCase(),procedureId:'carpal-ultrasound-other',gelProductId:'',planLabel:'HMSA Choice'};
  const result=orthoAuthorizationSnapshot(data);
  assert.deepEqual(result.codes,[]);
  assert.match(result.blockers.join(' '),/No validated code for this technique/);
  const outline=createOrthoWorksheet(data,{mode:'outline'});
  assert.doesNotMatch(outline,/64728/);
  assert.match(outline,/No validated code for this technique/);
  assert.match(outline,/SYNTHETIC WORKSHEET ONLY/);
});

test('reject unrecognized data, payer fields, patient payload and invalid product',()=>{
  const base=defaultOrthoCase();
  assert.equal(validateOrthoCase(base).procedureId,'knee-gel');
  for(const input of [
    {...base,patientName:'Jane Doe'},
    {...base,dob:'1990-01-01'},
    {...base,memberId:'fake-id'},
    {...base,notes:'sample note'},
    {...base,payer:'InvalidPayer'},
    {...base,line:'FakeLine'},
    {...base,procedureId:'unknown'},
    {...base,gelProductId:'not-a-product'},
    {...base,planLabel:'<script>alert(1)</script>'},
    {...base,checks:{patientDiagnosis:'OA'}}
  ])assert.throws(()=>validateOrthoCase(input));
});

test('synthetic worksheet contains gaps and payer source links but no patient note or fabricated approval',()=>{
  const caseData={...defaultOrthoCase(),payer:'UnitedHealthcare',line:'Commercial',planLabel:'UHC Choice',gelProductId:'durolane'};
  const gap=createOrthoWorksheet(caseData,{mode:'gaps',today:'2026-11-07'});
  assert.match(gap,/J7318/);
  assert.match(gap,/20610/);
  assert.match(gap,/SYNTHETIC WORKSHEET ONLY/);
  assert.match(gap,/DOCUMENTATION WORKFLOW/);
  assert.match(gap,/PUBLIC PAYER SOURCES/);
  assert.match(gap,/UNRESOLVED AUTHORIZATION/);
  assert.doesNotMatch(gap,/APPROVED\s+AUTHORIZATION/i);
  const outline=createOrthoWorksheet(caseData,{mode:'outline',today:'2026-11-07'});
  assert.match(outline,/Orthopedic procedure authorization outline/);
  assert.match(outline,/No member eligibility/);
  const withChecks={...caseData,checks:{diagnosis:true}};
  assert.match(createOrthoWorksheet(withChecks),/\[LOCATED\] Diagnosis/);
});

test('Hawaiʻi plan product names are accepted but long member-style numeric strings are not',()=>{
  assert.equal(validateOrthoCase({...defaultOrthoCase(),planLabel:'Hawaiʻi Choice'}).planLabel,'Hawaiʻi Choice');
  assert.throws(()=>validateOrthoCase({...defaultOrthoCase(),planLabel:'Member 12345678901'}));
});
test('wrong combination cannot create false Medicare or Veterans coverage claims',()=>{
  const wrong={...defaultOrthoCase(),payer:'Traditional Medicare',line:'Commercial'};
  const snapshot=orthoAuthorizationSnapshot(wrong);
  assert.ok(snapshot.blockers.some(x=>x.includes('mismatch')));
  assert.equal(snapshot.sources.length,0);
  const va={...defaultOrthoCase(),payer:'Veterans Affairs',line:'VA / Community Care'};
  assert.ok(orthoAuthorizationSnapshot(va).sources.some(x=>x.id==='va-community'));
});

test('initial gel and MACI biopsy checklists avoid irrelevant repeat and implant criteria',()=>{
  const gel=defaultOrthoCase();
  const initial=getOrthoActiveCriteria(gel).map(c=>c.id);
  const repeat=getOrthoActiveCriteria({...gel,requestType:'Repeat / continuation'}).map(c=>c.id);
  assert.ok(!initial.includes('repeat'));
  assert.ok(repeat.includes('repeat'));
  const biopsy={...gel,procedureId:'maci-harvest'};
  const implantation={...gel,procedureId:'maci-implant'};
  assert.ok(!getOrthoActiveCriteria(biopsy).some(c=>c.id==='implant'));
  assert.ok(getOrthoActiveCriteria(implantation).some(c=>c.id==='implant'));
  const worksheet=createOrthoWorksheet(biopsy);
  assert.doesNotMatch(worksheet,/\[MISSING\] Cell product and implant authorization/);
});
