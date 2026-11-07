import test from 'node:test';
import assert from 'node:assert/strict';
import {policies,defaultScope} from '../shared/catalog.mjs';
import {samples} from '../shared/fixtures.mjs';
import {matchingPolicies,resolvePolicy,formularyResult,checkEvidence,readiness,buildLetter,compareMedications,validateAiEvidence,validatePolicy,validateWorkspace,policyFreshness} from '../shared/domain.mjs';
const today='2026-11-06',p=policies[0],sample=samples['osteoporosis-evenity'];
const uhcScope={...defaultScope,payer:'UnitedHealthcare'};
const formulary=(extra={})=>({id:'custom-test',title:'Test exact-plan extract',payer:'HMSA',lines:['Commercial'],benefit:'Pharmacy',kind:'formulary',drugIds:['alendronate'],planCode:'ABC123',effective:'2026-10-01',reviewed:today,expires:null,url:'https://example.org/formulary.pdf',locator:'Version 1, page 4',summary:'Synthetic test source only.',formularyStatus:'preferred',criteria:[],...extra});
test('commercial medical policy cannot leak into another payer, line, benefit or medication',()=>{
  assert.equal(matchingPolicies(uhcScope,'evenity',[],today).length,1);
  for(const scope of [{...uhcScope,payer:'HMSA'},{...uhcScope,line:'QUEST / Medicaid'},{...uhcScope,line:'Medicare Advantage'},{...uhcScope,benefit:'Pharmacy'}])assert.ok(!matchingPolicies(scope,'evenity',[],today).some(p=>p.id==='uhc-evenity-2026-11'));
  assert.equal(matchingPolicies(uhcScope,'alendronate',[],today).length,0);
});
test('medical necessity policy never implies formulary coverage',()=>{
  assert.equal(formularyResult(uhcScope,'evenity',[],today).status,'unknown');
  assert.equal(formularyResult(uhcScope,'prolia',[],today).status,'unknown');
});
test('formulary requires an exact matching plan code and scope',()=>{
  const f=formulary(),scope={payer:'HMSA',line:'Commercial',benefit:'Pharmacy',planCode:'ABC123'};
  assert.equal(formularyResult(scope,'alendronate',[f],today).status,'preferred');
  for(const s of [{...scope,planCode:''},{...scope,planCode:'OTHER'},{...scope,line:'Medicare Advantage'},{...scope,benefit:'Medical'}])assert.equal(formularyResult(s,'alendronate',[f],today).status,'unknown');
});
test('future, expired and stale formulary entries do not produce coverage claims',()=>{
  const scope={payer:'HMSA',line:'Commercial',benefit:'Pharmacy',planCode:'ABC123'};
  for(const extra of [{effective:'2026-12-01'},{expires:'2026-11-01'},{reviewed:'2026-01-01'},{reviewed:'2026-12-01'}])assert.equal(formularyResult(scope,'alendronate',[formulary(extra)],today).status,'unknown');
  assert.equal(policyFreshness({...p,effective:'2026-02-30'},today),'invalid');
});
test('conflicting applicable policies block selection instead of silently taking the first',()=>{
  const result=resolvePolicy(uhcScope,'evenity',[{...p,id:'custom-conflict'}],today);
  assert.equal(result.conflict,true);assert.equal(result.policy,null);
  const f=formulary();assert.equal(formularyResult({payer:'HMSA',line:'Commercial',benefit:'Pharmacy',planCode:'ABC123'},'alendronate',[f,{...f,id:'custom-other'}],today).status,'unknown');
});
test('editing the source note invalidates stale quoted evidence',()=>{
  assert.equal(checkEvidence(p,sample.note,sample.evidence).filter(c=>c.status==='documented').length,4);
  const note=sample.note.replace('Diagnosis: postmenopausal osteoporosis.','Diagnosis is not established.');
  assert.equal(checkEvidence(p,note,sample.evidence).find(c=>c.id==='diagnosis').status,'missing');
  assert.equal(readiness({...sample,note},p,[],today).ready,false);
});
test('a complete fictional case can be reviewed, while missing or wrong-context cases stay drafts',()=>{
  assert.equal(readiness(sample,p,[],today).ready,true);
  assert.match(buildLetter(sample,p,{today,reviewed:true}),/^CLINICIAN-REVIEWED DRAFT/);
  for(const data of [{...sample,note:''},{...sample,plan:''},{...sample,evidence:{}},{...sample,line:'Medicare Advantage'},{...sample,requestType:'appeal'}])assert.equal(readiness(data,p,[],today).ready,false);
  assert.match(buildLetter({...sample,note:'',evidence:{}},p,{today,reviewed:true}),/^DRAFT — INCOMPLETE/);
});
test('draft does not fabricate treatment failures, safety screening or a signature',()=>{
  const letter=buildLetter({...sample,note:'Synthetic diagnosis pending.',evidence:{}},p,{today});
  assert.doesNotMatch(letter,/failed alendronate|no contraindications|signed by|guaranteed approval/i);
  assert.match(letter,/documentation missing/);assert.match(letter,/Signature \/ date: _/);assert.match(letter,/NOT FOR PATIENT SUBMISSION/);
});
test('AI evidence rejects fabricated quotes, unknown IDs, duplicate IDs and unsupported statuses',()=>{
  const good={criterionId:'diagnosis',status:'documented',quote:sample.evidence.diagnosis.quote};
  assert.equal(validateAiEvidence({evidence:[good]},p,sample.note).diagnosis.status,'documented');
  for(const output of [{evidence:[{...good,quote:'The patient failed four medications.'}]},{evidence:[{...good,criterionId:'coverage-approved'}]},{evidence:[good,good]},{evidence:[{...good,status:'approved'}]},{evidence:[{...good,status:'missing'}]}])assert.throws(()=>validateAiEvidence(output,p,sample.note));
});
test('public source import validates scope, dates, unique criteria and safe URLs',()=>{
  assert.equal(validatePolicy(formulary(),today).planCode,'ABC123');
  for(const extra of [{url:'javascript:alert(1)'},{url:'https://user:password@example.org/file'},{reviewed:'2026-12-01'},{effective:'2026-02-30'},{planCode:''},{kind:'medical-policy',formularyStatus:'covered'},{criteria:[{id:'x',label:'One',help:''},{id:'x',label:'Two',help:''}]}])assert.throws(()=>validatePolicy(formulary(extra),today));
});
test('encrypted restore validates data shape before it reaches the interface',()=>{
  assert.equal(validateWorkspace({version:1,case:sample,custom:[]}).case.drugId,'evenity');
  for(const value of [{version:2,case:sample,custom:[]},{version:1,case:{...sample,note:{}},custom:[]},{version:1,case:{...sample,evidence:{a:{status:'approved',quote:'x'}}},custom:[]}])assert.throws(()=>validateWorkspace(value));
});

test('exact-plan imported medical criteria never leak to another plan or unknown plan',()=>{
  const exact={...p,id:'custom-exact-plan-criteria',drugIds:['teriparatide'],planCode:'EMPLOYER-ABC'};
  const matching={...uhcScope,planCode:'EMPLOYER-ABC'};
  assert.equal(resolvePolicy(matching,'teriparatide',[exact],today).policy?.id,exact.id);
  for(const scope of [{...matching,planCode:'EMPLOYER-XYZ'},{...matching,planCode:''},{...matching,benefit:'Pharmacy'},{...matching,line:'Medicare Advantage'},{...matching,payer:'HMSA'}]){
    assert.equal(resolvePolicy(scope,'teriparatide',[exact],today).policy,null);
  }
});
test('comparison separates pharmacy formulary, medical policy, and published PA lists',()=>{
  const uhcRows=compareMedications(uhcScope,[],today);
  const evenity=uhcRows.find(x=>x.drug.id==='evenity');
  assert.equal(evenity.formulary.status,'unknown');
  assert.ok(evenity.medicalPolicy);
  assert.equal(evenity.authorizationLists.length,0);
  const pharmacy={payer:'HMAA',line:'Commercial',benefit:'Pharmacy',planCode:'HMAA-OPTUMRX-PREMIUM-2026-H2'};
  const rows=compareMedications(pharmacy,[],today);
  const prolia=rows.find(x=>x.drug.id==='prolia');
  assert.equal(prolia.formulary.status,'excluded');
  assert.equal(prolia.medicalPolicy,null);
  const noPlan=compareMedications({...pharmacy,planCode:''},[],today);
  assert.ok(noPlan.every(x=>x.formulary.status==='unknown'));
  const mdx={payer:'MDX',carrier:'UnitedHealthcare',line:'Medicare Advantage',benefit:'Medical'};
  const mdxEvenity=compareMedications(mdx,[],today).find(x=>x.drug.id==='evenity');
  assert.equal(mdxEvenity.formulary.status,'unknown');
  assert.equal(mdxEvenity.medicalPolicy,null);
  assert.equal(mdxEvenity.authorizationLists.length,1);
});
test('same-plan policy conflicts remain explicitly blocked in comparisons',()=>{
  const other={...p,id:'custom-conflicting-uhc-policy'};
  const row=compareMedications(uhcScope,[other],today).find(x=>x.drug.id==='evenity');
  assert.equal(row.medicalPolicy,null);
  assert.equal(row.medicalPolicyConflict,true);
});
