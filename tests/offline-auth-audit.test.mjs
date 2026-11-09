import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveFulfillment,FULFILLMENT_PATHS} from '../shared/fulfillment-policy.mjs';
import {AUTH_TEMPLATE_CATALOG,assessAuthTemplate,renderAuthTemplateNote} from '../shared/authorization-template-catalog.mjs';
// Fictional fixture only. It must satisfy the hardened exact-scope contract so the assertion
// below really tests that a fully verified policy still never permits ordering.
const policy={id:'fictional-policy',version:'v1',planPrecision:'exact-product',payer:'Example',planId:'P1',productId:'prolia',benefit:'Medical',line:'Commercial',setting:'Office',state:'HI',
 sourceSha256:'a'.repeat(64),effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',verified:true,sourceUrl:'https://example.org/policy',reviewedBy:'Synthetic reviewer',reviewedAt:'2026-11-01',reviewDue:'2026-12-31',path:FULFILLMENT_PATHS.BUY_AND_BILL};
const adoption={...policy,policyId:policy.id,policyVersion:policy.version,policySha256:policy.sourceSha256,sourceSha256:'b'.repeat(64),reference:'Fictional plan adoption document'};
const request={payer:'Example',planId:'P1',productId:'prolia',benefit:'Medical',line:'Commercial',setting:'Office',state:'HI',serviceDate:'2026-11-08',asOf:'2026-11-08',policies:[policy],adoptions:[adoption]};
test('missing service date fails closed',()=>assert.equal(resolveFulfillment({...request,serviceDate:undefined}).orderingAllowed,false));
test('matching policy never authorizes ordering by itself',()=>{const r=resolveFulfillment(request);assert.equal(r.verified,true);assert.equal(r.orderingAllowed,false)});
test('expired policy fails closed',()=>assert.equal(resolveFulfillment({...request,serviceDate:'2027-01-01'}).verified,false));
test('policy without separate plan adoption evidence fails closed',()=>assert.equal(resolveFulfillment({...request,adoptions:[]}).verified,false));
test('plan-family precision cannot borrow an exact-product policy',()=>assert.equal(resolveFulfillment({...request,policies:[{...policy,planPrecision:'plan-family'}]}).verified,false));
test('conflicting policies fail closed',()=>assert.equal(resolveFulfillment({...request,policies:[policy,policy]}).verified,false));
test('template catalog has unique IDs',()=>assert.equal(new Set(AUTH_TEMPLATE_CATALOG.map(t=>t.id)).size,AUTH_TEMPLATE_CATALOG.length));
test('empty clinical template is incomplete',()=>assert.equal(assessAuthTemplate('bone-prolia',{}).status,'incomplete'));
test('unprovided findings remain explicit',()=>assert.match(renderAuthTemplateNote('bone-prolia',{}),/NOT DOCUMENTED/));
