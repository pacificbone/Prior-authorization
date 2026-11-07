import test from 'node:test';
import assert from 'node:assert/strict';
import {renderOrthopedicPage} from '../public/orthopedic-page.mjs';
import {defaultOrthoCase} from '../shared/orthopedic-procedures.mjs';

test('orthopedic page shows medical procedure scope and explicitly unverified authorization',()=>{
  const html=renderOrthopedicPage(defaultOrthoCase(),'injections');
  assert.match(html,/Procedure authorizations/);
  assert.match(html,/Gel injections/);
  assert.match(html,/Choose procedure and coverage/);
  assert.match(html,/Coverage:<\/strong> Unknown/);
  assert.match(html,/Prior authorization:<\/strong> Not verified/);
  assert.match(html,/SYNTHETIC|Synthetic trial only/);
  assert.match(html,/id="ortho-payer"/);
  assert.match(html,/id="ortho-line"/);
  assert.match(html,/id="ortho-category"/);
  assert.match(html,/id="ortho-gel"/);
  assert.match(html,/data-action="cost-from-ortho"/);
  assert.match(html,/Download gap checklist/);
  assert.match(html,/Download synthetic packet outline/);
  assert.doesNotMatch(html,/Patient name|Member identifier|Member ID:/i);
});

test('gel page shows one selected administration code and exact product J-code',()=>{
  const html=renderOrthopedicPage({...defaultOrthoCase(),gelProductId:'monovisc',guidance:'with-ultrasound',planLabel:'HMSA A&B'},'injections');
  assert.match(html,/20611/);
  assert.match(html,/J7327/);
  assert.match(html,/Monovisc/);
  assert.match(html,/HMSA A&amp;B/);
  assert.doesNotMatch(html,/&lt;script&gt;/);
});

test('non-balloon ultrasound CTR page does not suggest 64728 and blocks coding',()=>{
  const html=renderOrthopedicPage({
    ...defaultOrthoCase(),procedureId:'carpal-ultrasound-other',gelProductId:'',planLabel:'HMSA Choice'
  },'hand');
  assert.match(html,/No verified CPT\/HCPCS code/);
  assert.match(html,/No validated code for this technique/);
  assert.doesNotMatch(html,/<strong>64728<\/strong>/);
  assert.match(html,/Do not assume CPT 64728/);
  assert.match(html,/Not verified/);
});
test('MACI implant page lists product and procedure codes without claiming coverage',()=>{
  const html=renderOrthopedicPage({
    ...defaultOrthoCase(),procedureId:'maci-implant',payer:'UnitedHealthcare',line:'Commercial',gelProductId:''
  },'cartilage');
  assert.match(html,/27412/);
  assert.match(html,/J7330/);
  assert.match(html,/Surgery of the Knee/);
  assert.match(html,/Current policy and clinician review required/);
  assert.doesNotMatch(html,/Authorization approved/);
});
