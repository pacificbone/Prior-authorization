import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAuthorizationPolicyIntake} from '../shared/authorization-policy-intake.mjs';
const base={id:'p1',policyId:'published-1',payer:'HMSA',planId:'hmsa-quest',line:'QUEST / Medicaid',
 serviceId:'prolia',productId:'bone-prolia',benefit:'Medical',setting:'Office',state:'HI',version:'1',
 reviewedBy:'Clinical reviewer',sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',
 sourceSha256:'a'.repeat(64),effectiveFrom:'2026-11-01',effectiveTo:'2026-12-31',
 reviewedAt:'2026-11-01',reviewDue:'2026-11-30',verified:true,
 criteria:[{id:'indication',label:'Indication documented',sourceSection:'Section A'}]};
test('policy intake refuses missing source section',()=>{
 const p={...base,criteria:[{id:'indication',label:'Indication documented'}]};
 assert.equal(validateAuthorizationPolicyIntake({policy:p,asOf:'2026-11-08'}).valid,false);
});
test('policy intake refuses unsupported plan adoption',()=>{
 const r=validateAuthorizationPolicyIntake({policy:base,asOf:'2026-11-08'});
 assert.equal(r.valid,false);assert.match(r.errors.join(' '),/adoption/i);
});
test('policy intake refuses missing document fingerprint',()=>{
 const r=validateAuthorizationPolicyIntake({policy:{...base,sourceSha256:null},asOf:'2026-11-08'});
 assert.equal(r.valid,false);
});
