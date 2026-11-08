import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPlanAdoption,ADOPTION_SCOPE_KEYS} from '../shared/plan-adoption.mjs';
import {resolveFulfillment} from '../shared/fulfillment-policy.mjs';
const scope={payer:'Fictional payer',planId:'exact-fictional-plan',productId:'fictional-product',benefit:'Medical',line:'Commercial',setting:'Office',state:'HI',serviceDate:'2026-11-07'};
const policy={...scope,id:'fictional-policy',version:'v1',sourceSha256:'a'.repeat(64),sourceUrl:'https://payer.example/policy',verified:true,planPrecision:'exact-product',effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',reviewedAt:'2026-11-01',reviewDue:'2026-12-01',reviewedBy:'Synthetic reviewer',path:'specialty-pharmacy'};
const adoption={...scope,policyId:policy.id,policyVersion:policy.version,policySha256:policy.sourceSha256,sourceSha256:'b'.repeat(64),sourceUrl:'https://payer.example/plan-adoption',planPrecision:'exact-product',verified:true,reference:'Synthetic adoption evidence',reviewedBy:'Synthetic reviewer',reviewedAt:'2026-11-01',reviewDue:'2026-12-01',effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31'};
const check=(rows=[adoption],s=scope,p=policy)=>assessPlanAdoption(s,p,rows,'2026-11-07');
test('public policy retrieval and exact-product label alone cannot establish plan adoption',()=>{
 const q={...scope,policies:[policy],asOf:'2026-11-07'};
 assert.equal(resolveFulfillment(q).verified,false);
 assert.match(resolveFulfillment(q).blockers.join(' '),/adoption/);
 assert.equal(resolveFulfillment({...q,adoptions:[adoption]}).verified,true);
 assert.equal(resolveFulfillment({...q,adoptions:[adoption]}).orderingAllowed,false);
});
test('adoption evidence never verifies member coverage or permits ordering',()=>{
 assert.equal(check().verified,true);assert.equal(check().memberCoverageVerified,false);assert.equal(check().orderingAllowed,false);
});
for(const key of ADOPTION_SCOPE_KEYS)test('adoption cannot cross '+key,()=>{
 assert.equal(check([{...adoption,[key]:'wrong'}]).verified,false);
 assert.equal(check([adoption],{...scope,[key]:undefined}).verified,false);
});
for(const patch of [{verified:false},{planPrecision:'plan-family'},{policyVersion:'v0'},{policySha256:'c'.repeat(64)},{sourceSha256:'not-a-digest'},
 {sourceUrl:'javascript:alert(1)'},{sourceUrl:'https://user:password@payer.example'},{reference:''},{reviewedBy:''},
 {effectiveFrom:undefined},{effectiveTo:null},{effectiveFrom:'2026-12-01',effectiveTo:'2026-11-01'},
 {reviewedAt:'2026-11-08'},{reviewDue:'2026-11-06'},{reviewDue:'2028-01-01'}])test('adoption rejects '+JSON.stringify(patch),()=>{
 assert.equal(check([{...adoption,...patch}]).verified,false);
});
test('overlapping, duplicate and unverified adoption records block selection',()=>{
 for(const second of [adoption,{...adoption,verified:false},{...adoption,effectiveTo:'bad'}])assert.equal(check([adoption,second]).verified,false);
 assert.equal(check([adoption,{...adoption,effectiveFrom:'2027-01-01',effectiveTo:'2027-12-31'}]).verified,true);
});
test('adoption review covers planned service date and current date',()=>{
 assert.equal(check([{...adoption,reviewDue:'2026-11-08'}],{...scope,serviceDate:'2026-11-09'}).verified,false);
 assert.equal(assessPlanAdoption(scope,policy,[adoption],'invalid').verified,false);
});
test('site and state restrictions cannot be borrowed across policies',()=>{
 for(const patch of [{setting:'Hospital outpatient'},{state:'MD'},{line:'Medicare Advantage'}])assert.equal(resolveFulfillment({...scope,...patch,policies:[policy],adoptions:[adoption],asOf:'2026-11-07'}).verified,false);
});
test('a pharmacy formulary cannot imply buy-and-bill even with adoption evidence',()=>{
 const q={...scope,benefit:'Pharmacy',policies:[{...policy,benefit:'Pharmacy',path:'buy-and-bill'}],adoptions:[{...adoption,benefit:'Pharmacy'}],asOf:'2026-11-07'};
 assert.equal(resolveFulfillment(q).verified,false);assert.match(resolveFulfillment(q).blockers.join(' '),/medical-benefit/);
});

test('direct adoption assessment also rejects a foreign policy scope',()=>{
 for(const key of ADOPTION_SCOPE_KEYS)assert.equal(check([adoption],scope,{...policy,[key]:'wrong'}).verified,false);
});
