import test from 'node:test';
import assert from 'node:assert/strict';
import {staffContext} from '../shared/staff-workflow.mjs';
import {modmedPaRoute,SAMACARE_MODMED_SETUP_EMAIL} from '../shared/modmed-pa.mjs';
import {renderModmedPaPanel} from '../public/vendor-pa-panel.mjs';
import {renderStaffPage} from '../public/staff-page.mjs';

const ctx=(payer,planId,serviceId,benefit='Medical')=>staffContext({payer,planId,year:2026,serviceId,benefit});
test('pharmacy medications route to native ModMed ePA with optional Develop Health',()=>{
 const c=ctx('HMSA','hmsa-select-choice','alendronate','Pharmacy');
 const route=modmedPaRoute(c,{benefit:'Pharmacy'});
 assert.equal(route.lane,'pharmacy');
 assert.deepEqual(route.steps.map(s=>s.id),['modmed-epa','develop','pharmacy-fallback']);
 assert.equal(route.steps.find(s=>s.id==='develop').connected,false);
 assert.match(renderModmedPaPanel(c,{benefit:'Pharmacy'}),/Develop Health/);
 assert.doesNotMatch(renderModmedPaPanel(c,{benefit:'Pharmacy'}),/automatically submitted|approved authorization/i);
});
test('medical-benefit medication and gel route to insurer first and SamaCare evaluation second',()=>{
 for(const id of ['evenity','knee-gel']){
  const c=ctx('HMSA','hmsa-select-choice',id);
  const route=modmedPaRoute(c);
  assert.equal(route.lane,'medical-drug');
  assert.equal(route.steps[0].id,'payer-medical');
  assert.equal(route.steps[1].id,'samacare');
  assert.equal(route.steps[1].connected,false);
  assert.match(renderModmedPaPanel(c),/Not connected/);
 }
});
test('joint replacements and office procedures never claim vendor handles surgical PA',()=>{
 for(const id of ['total-knee','maci-implant','carpal-open','mri-knee']){
  const route=modmedPaRoute(ctx('HMSA','hmsa-select-choice',id));
  assert.equal(route.lane,'procedure');
  assert.deepEqual(route.steps.map(x=>x.id),['payer-procedure','samacare-scope']);
  assert.match(route.caution,/establishes automated surgical PA approval/);
 }
});
test('delegated or invalid benefit context blocks inappropriate vendor routing',()=>{
 for(const c of [
  ctx('MDX Hawaiʻi','mdx','evenity'),
  ctx('Traditional Medicare','original-b','alendronate','Pharmacy')
 ]){
  const r=modmedPaRoute(c,{benefit:c.service.id==='alendronate'?'Pharmacy':'Medical'});
  assert.equal(r.lane,'verify-coverage');
  assert.equal(r.steps.length,1);
  assert.match(r.steps[0].role,/STOP/);
 }
 assert.equal(modmedPaRoute(ctx('HMSA','','evenity')),null);
});
test('SamaCare setup goes to verified published ModMed contact, credentials never requested in UI',()=>{
 assert.match(SAMACARE_MODMED_SETUP_EMAIL,/^mailto:practicesolutions@modmed\.com\?/);
 assert.match(SAMACARE_MODMED_SETUP_EMAIL,/ehr_accounts%40samacare\.com/);
 const html=renderModmedPaPanel(ctx('HMSA','hmsa-select-choice','evenity'));
 assert.match(html,/per provider\/month/);
 assert.match(html,/secure channel/);
 assert.doesNotMatch(html,/<input[^>]*(API key|password)/i);
});
test('vendor handoff appears within one existing staff workup and does not change quoted costs',()=>{
 const c=ctx('HMSA','hmsa-select-choice','total-knee');
 const html=renderStaffPage({
  payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'total-knee',
  benefit:'Medical',requestType:'Initial',setting:'ASC',gelProductId:'',
  guidance:'without-ultrasound',search:'',docs:{},cost:null,lookup:{}
 });
 assert.ok(html.indexOf('ModMed authorization handoff')>html.indexOf('Formulary, coverage and PA requirements'));
 assert.ok(html.indexOf('ModMed authorization handoff')<html.indexOf('Patient cost estimate'));
 assert.match(html,/one workflow/i);
 assert.match(html,/Synthetic trial/);
 assert.match(html,/Patient cost estimate/);
 assert.ok(c);
});
