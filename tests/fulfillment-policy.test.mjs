import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveFulfillment,assessProcurement,validPolicyDate,fulfillmentChecklist,FULFILLMENT_PATHS} from '../shared/fulfillment-policy.mjs';
// Fictional evidence only; no payer coverage is asserted by these fixtures.
const policy={id:'fictional-policy',version:'v1',planPrecision:'exact-product',payer:'Fictional Payer',planId:'fictional-exact-plan-2026',productId:'fictional-drug',benefit:'Medical',effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',verified:true,sourceUrl:'https://payer.example/policy/v1',reviewedBy:'Synthetic reviewer',reviewedAt:'2026-11-01',reviewDue:'2026-12-01',path:'buy-and-bill'};
const query={payer:policy.payer,planId:policy.planId,productId:policy.productId,benefit:policy.benefit,serviceDate:'2026-11-07',asOf:'2026-11-07',policies:[policy]};
const resolve=(patch={},p=policy)=>resolveFulfillment({...query,...patch,policies:patch.policies||[p]});
test('normal ISO date now matches; general policy never permits ordering',()=>{
 const r=resolve();assert.equal(r.verified,true);assert.equal(r.path,'buy-and-bill');assert.equal(r.orderingAllowed,false);assert.equal(r.version,'v1');
});
for(const value of ['',null,undefined,'2026-2-01','2026-02-29','2026-04-31','2026-13-01','2026-11-07T00:00:00Z','2026-11-07junk',42])test('invalid calendar/service date fails closed: '+value,()=>{
 assert.equal(validPolicyDate(value),false);assert.equal(resolve({serviceDate:value}).verified,false);
});
test('service after review deadline cannot borrow a current review',()=>{assert.equal(resolve({serviceDate:'2026-12-02'}).verified,false);});
test('real leap day and inclusive policy boundaries work',()=>{
 assert.equal(validPolicyDate('2028-02-29'),true);
 for(const date of [policy.effectiveFrom,policy.effectiveTo])assert.equal(resolve({serviceDate:date},{...policy,reviewDue:'2026-12-31'}).verified,true);
 for(const date of ['2025-12-31','2027-01-01'])assert.equal(resolve({serviceDate:date}).verified,false);
});
for(const key of ['payer','planId','productId','benefit'])test('wrong or missing '+key+' cannot borrow policy',()=>{
 for(const value of ['Wrong','',null,undefined]){const r=resolve({[key]:value});assert.equal(r.verified,false);assert.equal(r.orderingAllowed,false);}
});
test('medical and pharmacy benefits stay separate',()=>{assert.equal(resolve({benefit:'Pharmacy'}).verified,false);});
for(const patch of [{planPrecision:'plan-family'},{planPrecision:undefined},{verified:false},{sourceUrl:''},{sourceUrl:'javascript:alert(1)'},{sourceUrl:'http://payer.example'},{sourceUrl:'https://user:pass@payer.example'},{version:''},{id:''},{reviewedBy:''},{reviewedAt:'2026-11-08'},{reviewedAt:'invalid'},{reviewDue:'2026-11-06'},{reviewDue:'2027-12-01'},{effectiveFrom:null},{effectiveTo:null},{effectiveTo:'2026-02-30'},{effectiveFrom:'2027-01-01'},{path:'always-order'}])test('invalid policy provenance/range fails closed '+JSON.stringify(patch),()=>{
 assert.equal(resolve({}, {...policy,...patch}).verified,false);
});
test('duplicate, overlapping, unverified and malformed conflicts cannot be hidden',()=>{
 for(const second of [policy,{...policy,verified:false},{...policy,path:'specialty-pharmacy'},{...policy,effectiveTo:'nonsense'}]){
  const r=resolve({policies:[policy,second]});assert.equal(r.verified,false);assert.equal(r.orderingAllowed,false);
 }
 assert.equal(resolve({policies:[null,policy,{...policy,effectiveFrom:'2027-01-01',effectiveTo:'2027-12-31'}]}).verified,true);
 assert.equal(resolveFulfillment({...query,policies:{}}).orderingAllowed,false);
});
test('all recognized paths, including both/restricted/unknown, remain non-orderable',()=>{
 for(const path of Object.values(FULFILLMENT_PATHS)){const r=resolve({}, {...policy,path});assert.equal(r.path,path);assert.equal(r.orderingAllowed,false);}
 assert.match(fulfillmentChecklist(null).join(' '),/STOP/);
 assert.match(fulfillmentChecklist({path:'both-permitted',verified:true}).join(' '),/one supply route/);
});
const proof={payer:query.payer,planId:query.planId,productId:query.productId,benefit:query.benefit,serviceDate:query.serviceDate,policyId:policy.id,policyVersion:policy.version,verified:true,verifiedAt:'2026-11-07',validThrough:'2026-12-01',reference:'SYNTHETIC evidence'};
const evidence={route:'buy-and-bill',eligibility:{...proof,status:'active'},authorization:{...proof,status:'approved'},supplier:{...proof,route:'buy-and-bill',name:'Fictional supplier',networkConfirmed:true,siteConfirmed:true},reimbursement:{...proof,drugPaymentConfirmed:true},productDoseUnitsConfirmed:true,noDuplicateDrugClaim:true,costSharingConfirmed:true};
test('even complete synthetic operational evidence cannot enable live procurement',()=>{
 const r=assessProcurement(query,evidence);assert.equal(r.orderingAllowed,false);assert.equal(r.syntheticOnly,true);assert.equal(r.blockers.length,1);
});
for(const key of ['eligibility','authorization','supplier','reimbursement'])test('missing or wrong-scope '+key+' produces blockers',()=>{
 for(const value of [undefined,{...evidence[key],planId:'wrong'},{...evidence[key],policyVersion:'old'},{...evidence[key],serviceDate:'2026-11-08'},{...evidence[key],verifiedAt:'2026-11-08'},{...evidence[key],validThrough:'2026-11-06'}]){
  const r=assessProcurement(query,{...evidence,[key]:value});assert.ok(r.blockers.length>1);assert.equal(r.orderingAllowed,false);
 }
});
for(const status of ['pending','denied','expired','unknown'])test('authorization status '+status+' is blocked',()=>{
 assert.match(assessProcurement(query,{...evidence,authorization:{...proof,status}}).blockers.join(' '),/Approved authorization/);
});
test('no-PA-required is evidence-backed and still not ordering permission',()=>{
 const r=assessProcurement(query,{...evidence,authorization:{...proof,status:'not-required'}});assert.equal(r.blockers.length,1);assert.equal(r.orderingAllowed,false);
});
test('specialty pharmacy, white-bagging and supplier restrictions cannot be bypassed',()=>{
 const q={...query,policies:[{...policy,path:'specialty-pharmacy',specialtyPharmacy:'Designated fictional pharmacy',whiteBagging:true}]};
 assert.match(assessProcurement(q,evidence).blockers.join(' '),/route explicitly permitted/);
 const e={...evidence,route:'specialty-pharmacy',shipping:'white-bagging',supplier:{...evidence.supplier,route:'specialty-pharmacy',name:'Designated fictional pharmacy',chainOfCustodyConfirmed:true}};
 assert.equal(assessProcurement(q,e).blockers.length,1);
 for(const patch of [{shipping:'brown-bagging'},{supplier:{...e.supplier,name:'wrong'}},{supplier:{...e.supplier,chainOfCustodyConfirmed:false}}])assert.ok(assessProcurement(q,{...e,...patch}).blockers.length>1);
 assert.ok(assessProcurement({...q,policies:[{...q.policies[0],whiteBagging:null}]},e).blockers.length>1);
});
test('both routes require an explicit choice and no duplicate drug claims',()=>{
 const q={...query,policies:[{...policy,path:'both-permitted'}]};
 assert.ok(assessProcurement(q,{...evidence,route:undefined}).blockers.length>1);
 assert.ok(assessProcurement(q,{...evidence,noDuplicateDrugClaim:false}).blockers.length>1);
});
