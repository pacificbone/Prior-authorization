import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPayerAuthorization} from '../shared/payer-authorization-preflight.mjs';
const policy={id:'hmsa-verified-test',policyId:'hmsa-test',payer:'HMSA',planId:'hmsa-quest',line:'QUEST / Medicaid',
 serviceId:'prolia',productId:'bone-prolia',benefit:'Medical',setting:'Office',state:'HI',
 effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',verified:true,
 sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',
 sourceSha256:'a'.repeat(64),version:'2026-01-01',reviewedBy:'Synthetic reviewer',
 reviewedAt:'2026-11-01',reviewDue:'2026-11-30',criteria:[{id:'indication',label:'Indication'}]};
const input={payer:'HMSA',planId:'hmsa-quest',line:'QUEST / Medicaid',serviceId:'prolia',
 serviceDate:'2026-11-08',asOf:'2026-11-08',policies:[policy]};
const adoption={payer:policy.payer,planId:policy.planId,line:policy.line,productId:policy.productId,
 benefit:policy.benefit,setting:policy.setting,state:policy.state,policyId:policy.id,
 effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',verified:true,planPrecision:'exact-product',
 policyVersion:policy.version,policySha256:policy.sourceSha256,sourceSha256:'b'.repeat(64),
 sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',
 reference:'Synthetic plan adoption',reviewedBy:'Synthetic reviewer',reviewedAt:'2026-11-01',reviewDue:'2026-11-30'};
test('public real-payer policy without independently reviewed adoption blocks',()=>{
 assert.equal(assessPayerAuthorization(input).status,'blocked');
});
test('unreviewed adoption cannot verify criteria',()=>{
 assert.equal(assessPayerAuthorization({...input,adoptions:[{...adoption,verified:false}]}).status,'blocked');
});
test('mismatched policy fingerprint cannot verify criteria',()=>{
 assert.equal(assessPayerAuthorization({...input,adoptions:[{...adoption,policySha256:'c'.repeat(64)}]}).status,'blocked');
});
test('synthetic matching adoption still never clears submission',()=>{
 const result=assessPayerAuthorization({...input,adoptions:[adoption],
  evidence:{indication:{reviewed:true,recordReference:'Test note',finding:'Synthetic example'}}});
 assert.equal(result.status,'criteria-documented');
 assert.equal(result.submissionReady,false);
});
