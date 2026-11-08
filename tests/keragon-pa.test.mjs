import test from 'node:test';
import assert from 'node:assert/strict';
import {staffContext} from '../shared/staff-workflow.mjs';
import {keragonPaRoute,keragonBuildPrompt,KERAGON_LINKS,KERAGON_MODMED_SETUP_EMAIL} from '../shared/keragon-pa.mjs';
import {renderKeragonPaPanel} from '../public/keragon-pa-panel.mjs';
import {renderStaffPage} from '../public/staff-page.mjs';

const ctx=(payer,planId,serviceId,benefit='Medical')=>staffContext({payer,planId,year:2026,serviceId,benefit});
test('pharmacy medications coordinate via Keragon but do not misuse Optum as ePA',()=>{
 const c=ctx('HMSA','hmsa-select-choice','alendronate','Pharmacy');
 const r=keragonPaRoute(c,{benefit:'Pharmacy'});
 assert.equal(r.lane,'pharmacy');
 assert.ok(r.steps.some(x=>x.id==='epa'));
 assert.ok(r.steps.some(x=>x.id==='formulary'));
 assert.equal(r.steps.some(x=>x.id==='optum'),false);
 assert.match(r.warning,/pharmacy formulary/i);
 assert.match(renderKeragonPaPanel(c,{benefit:'Pharmacy'}),/ModMed EMA ePA/);
 assert.doesNotMatch(renderKeragonPaPanel(c,{benefit:'Pharmacy'}),/Develop Health|SamaCare/);
});
test('buy-and-bill medication and knee gel require exact medical plan with conditional Optum',()=>{
 for(const id of ['evenity','prolia','knee-gel']){
  const c=ctx('HMSA','hmsa-select-choice',id);
  const r=keragonPaRoute(c);
  assert.equal(r.lane,'medical-drug',id);
  assert.ok(r.steps.some(x=>x.id==='medical-policy'));
  assert.ok(r.steps.some(x=>x.id==='optum'));
  assert.equal(r.activated,false);
  assert.match(r.connectionStatus,/not verified/i);
 }
});
test('surgeries, imaging and peripheral procedures share payer-scoped procedure lane',()=>{
 for(const id of ['total-knee','total-hip','maci-implant','carpal-open','trigger-finger','mri-knee']){
  const c=ctx('UnitedHealthcare','uhc-commercial',id);
  const r=keragonPaRoute(c);
  assert.equal(r.lane,'procedure',id);
  assert.ok(r.steps.some(x=>x.id==='procedure-policy'));
  assert.ok(r.steps.some(x=>x.id==='optum'));
  assert.match(r.warning,/not a guarantee/i);
  assert.equal(r.steps.find(x=>x.id==='optum').connected,false);
 }
});
test('delegated, Part D surgery and Original Medicare Part B pharmacy never auto-submit',()=>{
 const a=keragonPaRoute(ctx('MDX Hawaiʻi','mdx','evenity'));
 assert.equal(a.lane,'verify-benefit');
 assert.equal(a.steps[0].mode,'HOLD — no automation or submission');
 const b=keragonPaRoute(ctx('Traditional Medicare','original-b','alendronate','Pharmacy'),{benefit:'Pharmacy'});
 assert.equal(b.lane,'verify-benefit');
 const c=keragonPaRoute(ctx('HMSA','','evenity'));
 assert.equal(c,null);
});
test('VA routes through the specific referral program instead of generic commercial PA',()=>{
 const r=keragonPaRoute(ctx('Veterans Affairs','va','total-knee'));
 assert.equal(r.lane,'program-specific');
 assert.equal(r.steps.some(x=>x.id==='optum'),false);
 assert.match(r.warning,/not assumed/i);
});
test('blueprint is synthetic, scoped and requires approval before action',()=>{
 const c=ctx('HMSA','hmsa-select-choice','total-knee');
 const result=keragonBuildPrompt(c);
 assert.match(result,/DRAFT workflow/);
 assert.match(result,/ModMed/);
 assert.match(result,/TriZetto/);
 assert.match(result,/Optum/);
 assert.match(result,/HMSA/);
 assert.match(result,/Total knee|total knee/i);
 assert.match(result,/DO NOT publish/);
 assert.match(result,/human/i);
 assert.match(result,/actual surgeon\/facility\/anesthesia\/product allowed amounts/);
 assert.doesNotMatch(result,/Develop Health|SamaCare/);
});
test('only documented Keragon public links and pre-addressed ModMed contact are displayed',()=>{
 const c=ctx('HMSA','hmsa-select-choice','evenity');
 const html=renderKeragonPaPanel(c);
 assert.match(html,/staff-keragon-blueprint/);
 assert.match(html,/ModMed FHIR connector/);
 assert.match(html,/credential/i);
 assert.match(html,/Not connected|No live connection/);
 assert.match(KERAGON_MODMED_SETUP_EMAIL,/^mailto:practicesolutions@modmed\.com/);
 for(const u of Object.values(KERAGON_LINKS))assert.ok(u.startsWith('https://'));
 assert.doesNotMatch(html,/<input[^>]*(password|api.key)/i);
});
test('single staff workflow contains Keragon routing before patient costs, with no vendor competition',()=>{
 const c=ctx('HMSA','hmsa-select-choice','total-knee');
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
 assert.ok(c);
});
