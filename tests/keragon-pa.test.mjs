import test from 'node:test';
import assert from 'node:assert/strict';
import {staffContext} from '../shared/staff-workflow.mjs';
import {keragonPaRoute,keragonBuildPrompt,KERAGON_LINKS,PRACTICE_CONNECTIVITY} from '../shared/keragon-pa.mjs';
import {renderKeragonPaPanel} from '../public/keragon-pa-panel.mjs';
import {renderStaffPage} from '../public/staff-page.mjs';

const ctx=(payer,planId,serviceId,benefit='Medical')=>staffContext({payer,planId,year:2026,serviceId,benefit});
test('practice-reported connections are not mislabeled as verified Keragon services',()=>{
 assert.equal(PRACTICE_CONNECTIVITY.modmedKeragon,'practice-reported-connected');
 assert.equal(PRACTICE_CONNECTIVITY.trizettoClearinghouse,'practice-reported-in-use');
 assert.equal(PRACTICE_CONNECTIVITY.trizettoKeragonEligibility,'not-verified');
 assert.equal(PRACTICE_CONNECTIVITY.trizettoElectronicPriorAuthorization,'not-verified');
 assert.equal(PRACTICE_CONNECTIVITY.optum,'not-required-not-verified');
});
test('retail pharmacy routes to ModMed ePA, never Optum or unverified medical PA',()=>{
 const c=ctx('HMSA','hmsa-select-choice','alendronate','Pharmacy');
 const r=keragonPaRoute(c,{benefit:'Pharmacy'});
 assert.equal(r.lane,'pharmacy');
 assert.ok(r.steps.some(s=>s.id==='modmed-epa'));
 assert.ok(r.steps.some(s=>s.id==='formulary'));
 assert.equal(r.steps.some(s=>s.id==='trizetto-pa'),false);
 assert.equal(r.steps.some(s=>s.id==='optum'),false);
 assert.match(renderKeragonPaPanel(c,{benefit:'Pharmacy'}),/ModMed EMA ePA/);
});
test('medical benefit drugs and gel check existing TriZetto before additional vendors',()=>{
 for(const id of ['evenity','prolia','knee-gel']){
  const r=keragonPaRoute(ctx('HMSA','hmsa-select-choice',id));
  assert.equal(r.lane,'medical-drug');
  assert.ok(r.steps.some(s=>s.id==='medical-policy'));
  assert.ok(r.steps.some(s=>s.id==='trizetto-pa'));
  assert.equal(r.steps.some(s=>s.id==='optum'),false);
  assert.equal(r.activated,false);
  assert.match(r.connectionStatus,/reported/i);
  assert.match(r.warning,/separate product/);
 }
});
test('surgical and imaging route is payer scoped and TriZetto-first, not Optum-dependent',()=>{
 for(const id of ['total-knee','total-hip','maci-implant','carpal-open','trigger-finger','mri-knee']){
  const r=keragonPaRoute(ctx('UnitedHealthcare','uhc-commercial',id));
  assert.equal(r.lane,'procedure');
  assert.ok(r.steps.some(s=>s.id==='procedure-policy'));
  assert.ok(r.steps.some(s=>s.id==='trizetto-pa'));
  assert.ok(r.steps.some(s=>s.id==='payer-route'));
  assert.equal(r.steps.some(s=>s.id==='optum'),false);
  assert.match(r.warning,/optional alternative vendor/);
 }
});
test('invalid benefit/delegated route halts instead of implying authorization',()=>{
 const d=keragonPaRoute(ctx('MDX Hawaiʻi','mdx','evenity'));
 assert.equal(d.lane,'verify-benefit');
 assert.equal(d.steps[0].mode,'HOLD — no submission');
 const m=keragonPaRoute(ctx('Traditional Medicare','original-b','alendronate','Pharmacy'),{benefit:'Pharmacy'});
 assert.equal(m.lane,'verify-benefit');
 assert.equal(keragonPaRoute(ctx('HMSA','','evenity')),null);
});
test('VA routes to program administrator, not commercial medical PA',()=>{
 const r=keragonPaRoute(ctx('Veterans Affairs','va','total-knee'));
 assert.equal(r.lane,'program-specific');
 assert.equal(r.steps.some(s=>s.id==='trizetto-pa'),false);
 assert.equal(r.steps.some(s=>s.id==='optum'),false);
 assert.match(r.warning,/unverified/);
});
test('Keragon blueprint reuses ModMed and does not require Optum or automatic submission',()=>{
 const result=keragonBuildPrompt(ctx('HMSA','hmsa-select-choice','total-knee'));
 assert.match(result,/DRAFT Keragon workflow/);
 assert.match(result,/ALREADY connected to ModMed/);
 assert.match(result,/ALREADY used for clearinghouse\/billing/);
 assert.match(result,/Optum is not mandatory/);
 assert.match(result,/Do NOT add an Optum step/);
 assert.match(result,/TriZetto/);
 assert.match(result,/DO NOT|Do NOT/);
 assert.match(result,/clinical-evidence review/);
 assert.match(result,/actual member-specific benefit accumulators/);
 assert.doesNotMatch(result,/Develop Health|SamaCare/);
});
test('UI shows real connection distinction and links to original TriZetto PA resources',()=>{
 const c=ctx('HMSA','hmsa-select-choice','evenity');
 const html=renderKeragonPaPanel(c);
 assert.match(html,/staff-keragon-blueprint/);
 assert.match(html,/Already in use \(reported by PBJ\)/);
 assert.match(html,/does not confirm|are unknown|unknown/i);
 assert.match(html,/TriZetto electronic prior authorization/);
 assert.match(html,/Optum is optional/);
 assert.doesNotMatch(html,/Prepare ModMed activation email|mailto:practicesolutions@modmed\.com/i);
 assert.doesNotMatch(html,/<input[^>]*(password|api.key)/i);
 for(const url of Object.values(KERAGON_LINKS))assert.match(url,/^https:\/\//);
});
test('single staff workflow remains intact and no payer prices/PA approvals claimed',()=>{
 const html=renderStaffPage({
  payer:'HMSA',planId:'hmsa-select-choice',year:2026,serviceId:'total-knee',
  benefit:'Medical',requestType:'Initial',setting:'ASC',gelProductId:'',
  guidance:'without-ultrasound',search:'',docs:{},cost:null,lookup:{}
 });
 assert.ok(html.indexOf('Keragon authorization workflow')>html.indexOf('Formulary, coverage and PA requirements'));
 assert.ok(html.indexOf('Keragon authorization workflow')<html.indexOf('Patient cost estimate'));
 assert.match(html,/One workflow: insurer/);
 assert.match(html,/Synthetic trial/);
 assert.doesNotMatch(html,/SamaCare|Develop Health/);
});
