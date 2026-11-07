import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/app.mjs',import.meta.url),'utf8');
test('landing and demo stay in staff workup, not legacy formulary',()=>{
 assert.match(html,/class="brand" href="#workup"/);
 assert.match(html,/<strong id="breadcrumb">Staff workup<\/strong>/);
 assert.match(html,/Try a sample workup/);
 assert.match(js,/function loadStaffSample\(\)/);
 assert.match(js,/setPage\('workup'\)/);
 assert.match(js,/staffPlansForPayer\(st\.payer,st\.year\)/);
});
test('the selected published pharmacy plan is searched automatically but no PHI is sent',()=>{
 assert.match(js,/void runStaffFormularyLookup\(\{automatic:true\}\)/);
 assert.match(js,/body:JSON\.stringify\(\{source:source\.id,drug:term\}\)/);
 assert.doesNotMatch(js,/body:JSON\.stringify\(\{source:source\.id,drug:term,memberId/);
});
