import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSourcesPage,sourcesNavBadge,sourceDueDays,SOURCE_KIND_LABELS} from '../public/sources-page.mjs';
import {sourcesDueReport} from '../shared/sources-due.mjs';
// Every report here is built for an explicit day, so the page never depends on today's date.
const section=(html,id)=>(html.match(new RegExp(`<section class="panel source-due-group" id="${id}"[\\s\\S]*?</section>`))||[''])[0];
test('the sources page groups every source as overdue, due soon, current or undated, with kind, payer, title, date and days',()=>{
 const report=sourcesDueReport({asOf:'2027-01-05'});
 const html=renderSourcesPage(report);
 assert.match(html,/Sources due for review/);
 assert.match(html,/as of 2027-01-05/);
 assert.match(html,/docs\/SOURCE-MAINTENANCE\.md/);
 assert.match(html,/never means a patient is covered, approved or eligible/);
 const rows={'sources-overdue':report.overdue,'sources-due-soon':report.dueSoon,'sources-current':report.current,'sources-undated':report.undated};
 let total=0;
 for(const [id,list] of Object.entries(rows)){
  const block=section(html,id);
  assert.ok(block,id);
  assert.equal((block.match(/class="source-due-row /g)||[]).length,list.length,id);
  total+=list.length;
  for(const r of list.slice(0,3)){
   assert.ok(block.includes(SOURCE_KIND_LABELS[r.kind]),r.id);
   assert.ok(block.includes(r.due||'Undated'),r.id);
   assert.ok(block.includes(sourceDueDays(r)),r.id);
  }
 }
 assert.equal(total,report.counts.total);
 assert.match(section(html,'sources-due-soon'),/Due in the next 30 days/);
 assert.ok(report.overdue.length>0,'some sources are overdue by 2027-01-05');
 assert.match(section(html,'sources-overdue'),/<span class="pill red">(Overdue|Expired)<\/span>/);
 assert.equal(sourcesNavBadge(report),report.overdue.length+report.dueSoon.length);
});
test('empty groups say none; undated sources never get a made-up date; text is escaped',()=>{
 const report=sourcesDueReport({asOf:'2026-11-21',evidence:[],catalog:[],formularies:[{id:'x',payer:'A&B <Plan>',label:'Label "Q"',effective:'2026-11-01'}]});
 const html=renderSourcesPage(report);
 assert.equal((html.match(/None\./g)||[]).length,3);
 assert.match(section(html,'sources-undated'),/<strong>Undated<\/strong><small>No review date recorded<\/small>/);
 assert.match(html,/A&amp;B &lt;Plan&gt;/);
 assert.match(html,/Label &quot;Q&quot;/);
 assert.equal(sourcesNavBadge(report),0);
});
test('day wording covers today, future and overdue rows',()=>{
 assert.equal(sourceDueDays({daysUntilDue:0}),'Due today');
 assert.equal(sourceDueDays({daysUntilDue:1}),'In 1 day');
 assert.equal(sourceDueDays({daysUntilDue:12}),'In 12 days');
 assert.equal(sourceDueDays({daysUntilDue:-3}),'3 days overdue');
 assert.equal(sourceDueDays({daysUntilDue:null}),'No review date recorded');
});
