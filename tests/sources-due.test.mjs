import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {sourcesDueReport,sourcesDueText,SOURCE_DUE_STATES} from '../shared/sources-due.mjs';
import {PAYER_POLICY_EVIDENCE} from '../shared/payer-policy-evidence.mjs';
import {policies} from '../shared/catalog.mjs';
import {PUBLISHED_FORMULARIES} from '../shared/live-formularies.mjs';
import {policyDay} from '../shared/plan-adoption.mjs';
// Every date below is fixed; nothing here depends on the day the suite runs.
const evidence=[
 {id:'ev-late',payer:'Payer A',title:'Late evidence',retrievedAt:'2026-08-01',reviewDue:'2026-10-30'},
 {id:'ev-soon',payer:'Payer A',title:'Soon evidence',retrievedAt:'2026-09-01',reviewDue:'2026-11-30'},
 {id:'ev-today',payer:'Payer B',title:'Due today',retrievedAt:'2026-08-23',reviewDue:'2026-11-21'},
 {id:'ev-later',payer:'Payer B',title:'Later evidence',retrievedAt:'2026-11-15',reviewDue:'2027-02-13'}
];
const catalog=[
 {id:'cat-review',payer:'Payer C',title:'Reviewed extract',reviewed:'2026-11-06',expires:null},
 {id:'cat-expires',payer:'Payer C',title:'Expiring list',reviewed:'2026-11-06',expires:'2026-12-31'},
 {id:'cat-expired',payer:'Payer C',carrier:'Carrier X',title:'Expired list',reviewed:'2026-10-01',expires:'2026-11-01'},
 {id:'cat-stale',payer:'Payer C',title:'Stale extract',reviewed:'2026-08-01',expires:'2027-06-30'}
];
const formularies=[
 {id:'form-reviewed',payer:'Payer D',label:'Reviewed file',reviewed:'2026-11-07',reviewAfterDays:90,effective:null},
 {id:'form-effective-only',payer:'Payer D',label:'Effective-only file',effective:'2026-11-01',reviewAfterDays:90},
 {id:'form-checked',payer:'Payer E',label:'Checked file',checked:'2026-09-01',reviewAfterDays:30}
];
const report=(asOf,horizonDays=30)=>sourcesDueReport({asOf,horizonDays,evidence,catalog,formularies});
const all=r=>[...r.overdue,...r.dueSoon,...r.current,...r.undated];
const row=(r,id)=>all(r).find(x=>x.id===id);
test('evidence rows are due on reviewDue and bucketed against the as-of day',()=>{
 const r=report('2026-11-21');
 assert.deepEqual(row(r,'ev-late'),{kind:'evidence',id:'ev-late',payer:'Payer A',title:'Late evidence',due:'2026-10-30',daysUntilDue:-22,state:'overdue',basis:'retrieved 2026-08-01; review due 2026-10-30'});
 assert.equal(row(r,'ev-soon').state,'due-soon');assert.equal(row(r,'ev-soon').daysUntilDue,9);
 // Due today is not yet overdue (the same rule as payerEvidenceFor: overdue only when reviewDue < asOf).
 assert.equal(row(r,'ev-today').state,'due-soon');assert.equal(row(r,'ev-today').daysUntilDue,0);
 assert.equal(row(r,'ev-later').state,'current');assert.equal(row(r,'ev-later').daysUntilDue,84);
 assert.equal(report('2026-11-22').overdue.some(x=>x.id==='ev-today'),true);
});
test('catalog extracts are due 90 days after review or at expiry if earlier, and expire after their printed end',()=>{
 const r=report('2026-11-21');
 assert.equal(row(r,'cat-review').due,'2027-02-04');assert.equal(row(r,'cat-review').state,'current');
 assert.equal(row(r,'cat-expires').due,'2026-12-31');assert.equal(row(r,'cat-expires').basis,'reviewed 2026-11-06 + 90 days; expires 2026-12-31');
 assert.equal(row(r,'cat-expired').state,'expired');assert.equal(row(r,'cat-expired').payer,'Payer C / Carrier X');assert.equal(row(r,'cat-expired').due,'2026-11-01');
 assert.equal(row(r,'cat-stale').due,'2026-10-30');assert.equal(row(r,'cat-stale').state,'overdue');
 assert.equal(row(report('2026-12-31'),'cat-expires').state,'due-soon');
 assert.equal(row(report('2027-01-01'),'cat-expires').state,'expired');
 assert.equal(row(report('2026-11-21',10),'cat-expires').state,'current');
});
test('formulary files use a reviewed or checked date and are never given an invented one',()=>{
 const r=report('2026-11-21');
 assert.equal(row(r,'form-reviewed').due,'2027-02-05');assert.equal(row(r,'form-reviewed').state,'current');
 assert.equal(row(r,'form-checked').due,'2026-10-01');assert.equal(row(r,'form-checked').state,'overdue');
 assert.deepEqual(row(r,'form-effective-only'),{kind:'formulary',id:'form-effective-only',payer:'Payer D',title:'Effective-only file',due:null,daysUntilDue:null,state:'undated',basis:'no reviewed date recorded; effective 2026-11-01 is not a review date'});
 assert.deepEqual(r.undated.map(x=>x.id),['form-effective-only']);
});
test('buckets are sorted by due date, overdue holds expired and overdue rows, and counts add up',()=>{
 const r=report('2026-11-21');
 assert.deepEqual(r.overdue.map(x=>x.id),['form-checked','ev-late','cat-stale','cat-expired']);
 assert.deepEqual(r.dueSoon.map(x=>x.id),['ev-today','ev-soon']);
 assert.deepEqual(r.current.map(x=>x.id),['cat-expires','cat-review','form-reviewed','ev-later']);
 for(const bucket of [r.overdue,r.dueSoon,r.current])assert.deepEqual(bucket.map(x=>x.due),bucket.map(x=>x.due).toSorted());
 assert.deepEqual(r.counts,{total:11,expired:1,overdue:3,dueSoon:2,current:4,undated:1});
 assert.equal(r.asOf,'2026-11-21');assert.equal(r.horizonDays,30);
 for(const x of all(r))assert.ok(SOURCE_DUE_STATES.includes(x.state)&&Object.isFrozen(x));
});
test('the report rejects impossible dates and horizons, and defaults to the Hawaiʻi policy day',()=>{
 for(const asOf of ['2026-02-30','11/21/2026','',null])assert.throws(()=>sourcesDueReport({asOf,evidence,catalog,formularies}),/asOf/);
 for(const horizonDays of [-1,1.5,'30'])assert.throws(()=>sourcesDueReport({asOf:'2026-11-21',horizonDays,evidence,catalog,formularies}),/horizonDays/);
 assert.equal(sourcesDueReport({evidence,catalog,formularies}).asOf,policyDay());
 assert.equal(sourcesDueReport({evidence,catalog,formularies}).horizonDays,30);
});
test('the text report names every bucket, the synthetic boundary and the next action',()=>{
 const text=sourcesDueText(report('2026-11-21'));
 assert.match(text,/as of 2026-11-21 \(Hawaiʻi policy day\)/);
 assert.match(text,/does not assert coverage, approval, eligibility or plan adoption/);
 assert.match(text,/OVERDUE OR EXPIRED — 4\n/);assert.match(text,/DUE SOON — 2\n/);assert.match(text,/CURRENT — 4\n/);
 assert.match(text,/2026-11-01 {2}20 days ago {3}EXPIRED {3}catalog {4}Payer C \/ Carrier X — Expired list \[cat-expired\]/);
 assert.match(text,/2026-11-21 {2}due today/);
 assert.match(text,/UNDATED \(no reviewed date recorded; check these by hand\) — 1\n {2}-{10} {2}not dated/);
 assert.match(text,/Total 11: 1 expired, 3 overdue, 2 due soon, 4 current, 1 undated\./);
 assert.match(text,/Action: re-read each overdue or expired source/);
 const quiet=sourcesDueText(sourcesDueReport({asOf:'2026-01-01',evidence:[],catalog:[],formularies:[]}));
 assert.match(quiet,/OVERDUE OR EXPIRED — 0\n {2}\(none\)/);assert.match(quiet,/Nothing is overdue or expired\./);
});
test('the real registries are all listed, with evidence due exactly on its recorded reviewDue',()=>{
 const r=sourcesDueReport({asOf:'2026-11-21'});
 assert.equal(r.counts.total,PAYER_POLICY_EVIDENCE.length+policies.length+PUBLISHED_FORMULARIES.length);
 for(const s of PAYER_POLICY_EVIDENCE)assert.equal(all(r).find(x=>x.kind==='evidence'&&x.id===s.id).due,s.reviewDue,s.id);
 for(const f of PUBLISHED_FORMULARIES.filter(f=>!f.reviewed&&!f.checked))assert.equal(all(r).find(x=>x.kind==='formulary'&&x.id===f.id).state,'undated',f.id);
 assert.equal(all(sourcesDueReport({asOf:'2000-01-01'})).some(x=>['overdue','expired'].includes(x.state)),false);
 assert.equal(sourcesDueReport({asOf:'2100-01-01'}).overdue.length,r.counts.total-r.counts.undated);
});
const cli=(...args)=>spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/sources-due.mjs',import.meta.url)),...args],{encoding:'utf8'});
test('npm run sources:due exits 1 only when something is overdue or expired, and validates its arguments',()=>{
 const early=cli('--as-of','2000-01-01');
 assert.equal(early.status,0,early.stderr);assert.match(early.stdout,/as of 2000-01-01/);assert.match(early.stdout,/Nothing is overdue or expired/);
 const late=cli('--as-of=2100-01-01','--horizon','7');
 assert.equal(late.status,1);assert.match(late.stdout,/"due soon" means within 7 days/);assert.match(late.stdout,/OVERDUE/);
 for(const bad of [['--as-of','2026-13-01'],['--horizon','-3'],['--horizon'],['--bogus']]){const r=cli(...bad);assert.equal(r.status,2,bad.join(' '));assert.match(r.stderr,/Usage: npm run sources:due/);}
});
