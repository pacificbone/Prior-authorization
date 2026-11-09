import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCoverageMatrix,renderCoverageMatrixMarkdown,compactCoverageMatrix,assessCoverageCell,MATRIX_PRIORITY_SERVICES,MATRIX_STATUSES,MATRIX_FOCUS_PAYERS} from '../shared/coverage-matrix.mjs';
import {STAFF_SERVICES,STAFF_PAYERS} from '../shared/staff-workflow.mjs';
const committed=JSON.parse(readFileSync(new URL('../docs/coverage-matrix.json',import.meta.url),'utf8'));
const asOf=committed.asOf;
const matrix=buildCoverageMatrix({asOf});
const cells=matrix.sections.flatMap(s=>s.cells);
const cell=(payer,line,serviceId,gelProductId='')=>cells.find(c=>c.payer===payer&&c.line===line&&c.serviceId===serviceId&&c.gelProductId===gelProductId);
test('committed coverage matrix documents match the registries for their as-of date',()=>{
 assert.equal(JSON.stringify(compactCoverageMatrix(matrix),null,1)+'\n',readFileSync(new URL('../docs/coverage-matrix.json',import.meta.url),'utf8'));
 assert.ok(committed.cells.every(c=>c.status!=='n/a'&&Array.isArray(c.records)));
 assert.equal(renderCoverageMatrixMarkdown(matrix),readFileSync(new URL('../docs/COVERAGE-MATRIX.md',import.meta.url),'utf8'));
});
test('every priority service exists in the staff catalog and every focus payer in the selector',()=>{
 for(const s of MATRIX_PRIORITY_SERVICES)assert.ok(STAFF_SERVICES.some(x=>x.id===s.serviceId),s.serviceId);
 for(const p of MATRIX_FOCUS_PAYERS)assert.ok(STAFF_PAYERS.some(x=>x.name===p),p);
 assert.ok(MATRIX_PRIORITY_SERVICES.some(s=>s.serviceId==='carpal-ultrasound-other'));
 assert.ok(MATRIX_PRIORITY_SERVICES.some(s=>s.serviceId==='maci-harvest')&&MATRIX_PRIORITY_SERVICES.some(s=>s.serviceId==='maci-implant'));
});
test('no cell ever asserts coverage, approval, eligibility or procurement',()=>{
 for(const c of cells){
  assert.ok(Object.keys(MATRIX_STATUSES).includes(c.status),c.status);
  assert.equal(c.procurement,'unknown');assert.equal(c.exactPlanAdoption,'not verified');
  assert.equal(c.memberEligibility,'not verified');assert.equal(c.priorAuthorizationDecision,'not determined');
 }
 const md=renderCoverageMatrixMarkdown(matrix).toLowerCase();
 for(const banned of ['approved','covered ✔','no pa required','guaranteed'])assert.equal(md.includes(banned),false,banned);
});
test('reviewed HMSA Commercial/QUEST gel and bone records never leak to Medicare Advantage or other payers',()=>{
 const ma=cell('HMSA','Medicare Advantage','knee-gel','synvisc-one');
 assert.equal(ma.status,'partial');
 assert.ok(ma.records.every(r=>!['hmsa-gel-clinical-2026','hmsa-gel-preference-2026'].includes(r.id)));
 assert.equal(cell('HMSA','Commercial','knee-gel','synvisc-one').status,'reviewed');
 assert.equal(cell('UnitedHealthcare','Commercial','total-knee').records.some(r=>r.id.startsWith('hmsa-')),false);
 assert.equal(cell('HMSA','Commercial','total-hip').records.some(r=>r.id==='hmsa-evolent-knee-2025'),false);
});
test('lines that cannot pay for a service type are n/a, and procedures without a validated code are flagged',()=>{
 assert.equal(cell('HMSA','Medicare Part D','total-knee').status,'n/a');
 assert.equal(cell('Humana','Medicare Part D','prolia').status,'n/a');
 assert.ok(cell('HMSA','Commercial','carpal-ultrasound-other').flags.includes('no-candidate-code'));
 assert.ok(cell('HMSA','Commercial','carpal-balloon').codes.includes('64728'));
 assert.deepEqual(cell('HMSA','Commercial','maci-implant').codes,['27412','J7330']);
});
test('pharmacy-benefit drugs report the exact-plan formulary lookup where one exists, not criteria',()=>{
 const quest=cell('HMSA','QUEST / Medicaid','alendronate');
 assert.equal(quest.status,'live-formulary');assert.equal(quest.formulary.state,'live-source');assert.match(quest.formulary.detail,/22780AA1111111/);
 assert.equal(cell('HMSA','Commercial','alendronate').status,'routing-only');
 assert.equal(cell('HMAA','Commercial','alendronate').status,'partial');
 assert.equal(cell('HMSA','Commercial','prolia').formulary.state,'n/a');
});
test('gap report lists services with no reviewed or partial source for focus payers and excludes satisfied cells',()=>{
 const reclast=matrix.gaps.find(g=>g.serviceId==='zoledronic-acid');
 assert.ok(reclast,'Reclast gaps are expected until payer policies are retrieved');
 assert.ok(reclast.cells.includes('HMSA / Commercial'));
 const prolia=matrix.gaps.find(g=>g.serviceId==='prolia');
 assert.equal(prolia.cells.includes('HMSA / Commercial'),false);
 for(const g of matrix.gaps)for(const p of g.byPayer)assert.ok(MATRIX_FOCUS_PAYERS.includes(p.payer));
});
test('review windows are enforced: every reviewed record becomes stale once its review date passes',()=>{
 const future=buildCoverageMatrix({asOf:'2027-06-01'});
 const futureCells=future.sections.flatMap(s=>s.cells);
 assert.equal(futureCells.some(c=>c.status==='reviewed'),false);
 assert.ok(futureCells.some(c=>c.status==='stale'));
 assert.throws(()=>buildCoverageMatrix({asOf:'2027-13-01'}));
 assert.throws(()=>assessCoverageCell({payer:'HMSA',line:'Commercial',entry:{serviceId:'not-a-service'},asOf}));
});
