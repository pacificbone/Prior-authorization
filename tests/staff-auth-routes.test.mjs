import test from 'node:test';
import assert from 'node:assert/strict';
import {staffAuthResources,STAFF_AUTH_RESOURCES,validateStaffAuthResources} from '../shared/staff-auth-resources.mjs';
import {staffContext,staffAuthorizePacket} from '../shared/staff-workflow.mjs';
import {renderStaffPage} from '../public/staff-page.mjs';

test('official payer PA/submit resources are HTTPS, scoped to payer, line and benefit',()=>{
 assert.equal(validateStaffAuthResources(),true);
 const r=staffAuthResources({payer:'HMSA',program:'commercial',benefit:'Medical',serviceType:'procedure'});
 assert.ok(r.some(x=>x.id==='hmsa-medical'));
 assert.ok(!r.some(x=>x.id==='hmsa-pharmacy'));
 assert.ok(!r.some(x=>x.id==='hmsa-specialty'));
 assert.ok(r.every(x=>x.payer==='HMSA'));
 const pharmacy=staffAuthResources({payer:'HMSA',program:'quest',benefit:'Pharmacy',serviceType:'medication'});
 assert.ok(pharmacy.some(x=>x.id==='hmsa-pharmacy'));
 assert.ok(!pharmacy.some(x=>x.id==='hmsa-medical'));
 const specialty=staffAuthResources({payer:'HMSA',program:'quest',benefit:'Medical',serviceType:'medication'});
 assert.ok(specialty.some(x=>x.id==='hmsa-specialty'));
 assert.ok(!specialty.some(x=>x.id==='hmsa-pharmacy'));
 const uha=staffAuthResources({payer:'UHA',program:'commercial',benefit:'Medical',serviceType:'procedure'});
 assert.ok(uha.some(x=>x.id==='uha-medical'));
 assert.ok(!uha.some(x=>x.payer!=='UHA'));
 assert.equal(staffAuthResources({payer:'UHA',program:'quest',benefit:'Medical'}).length,0);
 assert.equal(staffAuthResources({payer:'HMSA',program:'veterans',benefit:'Medical'}).length,0);
 assert.equal(staffAuthResources({payer:'Veterans Affairs',program:'veterans',benefit:'Medical'}).some(x=>x.id==='va-community'),true);
 // No two HMSA medical routes open the same page under different labels.
 const hmsaMedical=staffAuthResources({payer:'HMSA',program:'commercial',benefit:'Medical',serviceType:'procedure'});
 assert.equal(new Set(hmsaMedical.map(x=>x.url)).size,hmsaMedical.length);
});
test('UnitedHealthcare commercial and Medicare Advantage and ʻOhana QUEST now have payer-scoped PA routes',()=>{
 const uhcCommercial=staffContext({payer:'UnitedHealthcare',planId:'uhc-commercial',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(uhcCommercial.authorizationResources.some(x=>x.id==='uhc-commercial-pa-list'&&x.role==='check'));
 assert.ok(uhcCommercial.authorizationResources.some(x=>x.id==='uhc-commercial-submit'&&x.role==='submit-info'));
 assert.ok(uhcCommercial.authorizationResources.every(x=>x.payer==='UnitedHealthcare'));
 const uhcMa=staffContext({payer:'UnitedHealthcare',planId:'uhc-ma',year:2026,serviceId:'prolia',benefit:'Medical'});
 assert.ok(uhcMa.authorizationResources.some(x=>x.id==='uhc-ma-medical'));
 assert.equal(uhcMa.authorizationResources.some(x=>x.id==='uhc-commercial-pa-list'),false);
 const ohana=staffContext({payer:'ʻOhana / Wellcare',planId:'ohana-quest',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(ohana.authorizationResources.some(x=>x.id==='ohana-quest-medical'));
 assert.ok(ohana.authorizationResources.some(x=>x.id==='ohana-quest-submit'));
 assert.ok(!ohana.sourceLinks.some(x=>x.name.includes('HMSA')||x.name.includes('AlohaCare')));
 const ohanaRx=staffContext({payer:'ʻOhana / Wellcare',planId:'ohana-quest',year:2026,serviceId:'alendronate',benefit:'Pharmacy'});
 assert.ok(ohanaRx.authorizationResources.some(x=>x.id==='ohana-quest-pharmacy'));
 assert.equal(ohanaRx.authorizationResources.some(x=>x.id==='ohana-quest-medical'),false);
});
test('AlohaCare QUEST procedure route exposes exact-code PA lookup and provider authorization instructions',()=>{
 const ctx=staffContext({payer:'AlohaCare',planId:'aloha-quest',year:2026,serviceId:'carpal-open',benefit:'Medical'});
 assert.ok(ctx.authorizationResources.some(x=>x.id==='aloha-medical'));
 assert.ok(ctx.authorizationResources.some(x=>x.id==='aloha-medical-submit'));
 assert.ok(ctx.sourceLinks.some(x=>x.url.includes('office.alohacare.org/PriorAuth/')));
 assert.ok(!ctx.sourceLinks.some(x=>x.name.includes('HMSA')));
 const packet=staffAuthorizePacket({payer:'AlohaCare',planId:'aloha-quest',year:2026,serviceId:'carpal-open',benefit:'Medical'});
 assert.match(packet,/OFFICIAL SUBMISSION ROUTE/);
 assert.match(packet,/office.alohacare.org\/PriorAuth/);
 assert.match(packet,/Staff to confirm code, plan, delegate/);
});
test('UHA commercial scope shows drug and procedure lookup, no Medicare or HMSA source',()=>{
 const medical=staffContext({payer:'UHA',planId:'uha-employer',year:2026,serviceId:'total-knee',benefit:'Medical'});
 assert.ok(medical.authorizationResources.some(x=>x.id==='uha-medical'));
 assert.ok(!medical.sourceLinks.some(x=>x.name.startsWith('HMSA')));
 const pharmacy=staffContext({payer:'UHA',planId:'uha-employer',year:2026,serviceId:'celecoxib',benefit:'Pharmacy'});
 assert.ok(pharmacy.authorizationResources.some(x=>x.id==='uha-pharmacy'));
 assert.ok(!pharmacy.authorizationResources.some(x=>x.id==='uha-medical'));
 assert.ok(STAFF_AUTH_RESOURCES.every(x=>x.url.startsWith('https://')));
});
test('staff screen includes direct PA lookup links while source directory stays collapsed',()=>{
 const staff={
  payer:'AlohaCare',planId:'aloha-quest',year:2026,serviceId:'carpal-open',benefit:'Medical',
  requestType:'Initial',setting:'Office',gelProductId:'',guidance:'without-ultrasound',
  search:'',docs:{},cost:null,lookup:{sourceId:null,term:'',busy:false,result:null,error:''}
 };
 const html=renderStaffPage(staff);
 assert.match(html,/Where staff verify \/ request authorization/);
 assert.match(html,/Open submission instructions/);
 assert.match(html,/Verify PA requirement/);
 assert.match(html,/office.alohacare.org\/PriorAuth/);
 assert.match(html,/<details class="staff-sources">/);
 assert.doesNotMatch(html,/<details class="staff-sources" open>/);
 assert.doesNotMatch(html,/hmsa\.com\/prc/);
});
