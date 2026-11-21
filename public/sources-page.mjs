// Read-only "Sources due" page: when each captured public source must be re-read (shared/sources-due.mjs).
// A review date never asserts coverage, approval, eligibility or plan adoption. Browser-safe: no Node imports.
import {sourcesDueReport} from '../shared/sources-due.mjs';
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const SOURCE_KIND_LABELS=Object.freeze({evidence:'Payer policy evidence',catalog:'Catalog criteria extract',formulary:'Live formulary file'});
const STATE_LABELS=Object.freeze({expired:'Expired',overdue:'Overdue','due-soon':'Due soon',current:'Current',undated:'Undated'});
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
export function sourceDueDays(row){
 const n=row.daysUntilDue;
 return n===null?'No review date recorded':n===0?'Due today':n>0?'In '+plural(n,'day'):plural(-n,'day')+' overdue';
}
// Nav badge: sources that are overdue (or expired) plus those due within the report horizon.
export function sourcesNavBadge(report){return report.overdue.length+report.dueSoon.length;}
function rowMarkup(r){
 return `<li class="source-due-row state-${h(r.state)}"><div class="source-due-main"><div class="source-due-tags"><span class="pill neutral">${h(SOURCE_KIND_LABELS[r.kind]||r.kind)}</span>${r.state==='expired'||r.state==='overdue'?`<span class="pill red">${h(STATE_LABELS[r.state])}</span>`:r.state==='due-soon'?'<span class="pill amber">Due soon</span>':''}</div><strong>${h(r.title)}</strong><small>${h(r.payer)} · ${h(r.basis)}</small></div><div class="source-due-date"><strong>${h(r.due||'Undated')}</strong><small>${h(sourceDueDays(r))}</small></div></li>`;
}
function group(id,title,note,rows){
 return `<section class="panel source-due-group" id="${id}" aria-labelledby="${id}-title"><div class="panel-title-row"><h2 class="section-title" id="${id}-title">${h(title)}</h2><span class="pill ${rows.length&&(id==='sources-overdue'||id==='sources-due-soon')?'amber':'neutral'}">${rows.length}</span></div><div class="panel-content"><p class="helper">${h(note)}</p>${rows.length?`<ul class="source-due-list">${rows.map(rowMarkup).join('')}</ul>`:'<p class="source-due-none">None.</p>'}</div></section>`;
}
export function renderSourcesPage(report=sourcesDueReport()){
 const c=report.counts;
 return `<div class="page-heading"><div><span class="eyebrow">SOURCE MAINTENANCE · READ ONLY</span><h1>Sources due for review</h1>
 <p class="subtitle">When each captured payer document must be re-read, as of ${h(report.asOf)} (Hawaiʻi policy day).</p></div></div>
 <div class="notice source-due-explainer"><strong>What a review date means.</strong> Every payer document the app shows has a review-by date, at most 90 days after it was retrieved or reviewed (or a catalog extract's printed expiry, if sooner). After that date the source is overdue and staff should treat it as unconfirmed. Reviewing means opening the payer's current document and confirming that the title, the lines of business, the version or effective date and the summarized criteria still match. A source with no recorded review date is listed as undated; no date is ever made up for it. The source owner follows docs/SOURCE-MAINTENANCE.md (npm run sources:due and npm run sources:check). A current source never means a patient is covered, approved or eligible, or that a plan has adopted a policy.</div>
 <div class="metrics source-due-metrics"><div class="metric"><div><span class="metric-value">${c.expired+c.overdue}</span><span class="metric-label">Overdue or expired</span></div></div><div class="metric"><div><span class="metric-value">${c.dueSoon}</span><span class="metric-label">Due in the next ${h(report.horizonDays)} days</span></div></div><div class="metric"><div><span class="metric-value">${c.current}</span><span class="metric-label">Current</span></div></div><div class="metric"><div><span class="metric-value">${c.undated}</span><span class="metric-label">Undated</span></div></div></div>
 ${group('sources-overdue','Overdue','Re-read these first. The review-by date has passed, or a catalog extract is past its printed expiry.',report.overdue)}
 ${group('sources-due-soon',`Due in the next ${report.horizonDays} days`,'Plan the re-read before the date shown.',report.dueSoon)}
 ${group('sources-current','Current','Nothing to do yet; the date shows when each one comes due.',report.current)}
 ${group('sources-undated','Undated','No review date was recorded. Check these by hand and ask a developer to record the date you checked.',report.undated)}
 <p class="helper source-due-footnote">Total ${c.total} sources: ${c.expired} expired, ${c.overdue} overdue, ${c.dueSoon} due soon, ${c.current} current, ${c.undated} undated. This page reads the bundled registers only; it does not contact any payer.</p>`;
}
