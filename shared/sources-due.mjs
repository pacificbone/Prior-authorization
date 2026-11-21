// Review-date report over every captured public source: fingerprinted evidence records, older catalog
// criteria extracts and live formulary files. A due date only says when a document must be re-read;
// it never asserts coverage, approval, eligibility or plan adoption. Dates are never invented: a source
// without a recorded review date is listed as undated.
import {PAYER_POLICY_EVIDENCE} from './payer-policy-evidence.mjs';
import {policies as CATALOG_POLICIES} from './catalog.mjs';
import {PUBLISHED_FORMULARIES} from './live-formularies.mjs';
import {policyDay,validPolicyDate} from './plan-adoption.mjs';
export const SOURCE_REVIEW_DAYS=90;
export const SOURCE_DUE_KINDS=Object.freeze(['evidence','catalog','formulary']);
export const SOURCE_DUE_STATES=Object.freeze(['expired','overdue','due-soon','current','undated']);
const DAY=86400000;
const ms=d=>Date.parse(d+'T00:00:00Z');
const addDays=(d,n)=>new Date(ms(d)+n*DAY).toISOString().slice(0,10);
const ok=v=>validPolicyDate(v);
function evidenceRow(s){
 return {kind:'evidence',id:s.id,payer:s.payer,title:s.title,due:ok(s.reviewDue)?s.reviewDue:null,expires:null,
  basis:ok(s.reviewDue)?`${ok(s.retrievedAt)?'retrieved '+s.retrievedAt+'; ':''}review due ${s.reviewDue}`:'no valid review date recorded'};
}
// Catalog extracts follow policyFreshness() in shared/domain.mjs: current for 90 days after review, and
// never past their printed expiry.
function catalogRow(p){
 const review=ok(p.reviewed)?addDays(p.reviewed,SOURCE_REVIEW_DAYS):null,expires=ok(p.expires)?p.expires:null;
 const due=review&&expires?(expires<review?expires:review):review||expires;
 return {kind:'catalog',id:p.id,payer:p.carrier?`${p.payer} / ${p.carrier}`:p.payer,title:p.title,due,expires,
  basis:due===null?'no reviewed date recorded':[review&&`reviewed ${p.reviewed} + ${SOURCE_REVIEW_DAYS} days`,expires&&`expires ${expires}`].filter(Boolean).join('; ')};
}
// Live formulary files only count as dated when they carry a reviewed (or checked) date; an effective
// date is when the payer's file took effect, not when anyone reviewed it.
function formularyRow(f){
 const checked=ok(f.reviewed)?f.reviewed:ok(f.checked)?f.checked:null;
 const days=Number.isInteger(f.reviewAfterDays)&&f.reviewAfterDays>0?f.reviewAfterDays:SOURCE_REVIEW_DAYS;
 return {kind:'formulary',id:f.id,payer:f.payer,title:f.label,due:checked?addDays(checked,days):null,expires:null,
  basis:checked?`reviewed ${checked} + ${days} days`:`no reviewed date recorded${ok(f.effective)?`; effective ${f.effective} is not a review date`:''}`};
}
function stateOf(r,asOf,horizonDays){
 if(r.due===null)return 'undated';
 if(r.expires&&r.expires<asOf)return 'expired';
 if(r.due<asOf)return 'overdue';
 return r.daysUntilDue<=horizonDays?'due-soon':'current';
}
const byDue=(a,b)=>(a.due===null)-(b.due===null)||(a.due||'').localeCompare(b.due||'')||SOURCE_DUE_KINDS.indexOf(a.kind)-SOURCE_DUE_KINDS.indexOf(b.kind)||a.id.localeCompare(b.id);
/**
 * Pure: no clock reads except the default asOf (today's Hawaiʻi policy day).
 * Returns {asOf,horizonDays,overdue,dueSoon,current,undated,counts}; overdue holds 'expired' and 'overdue'
 * rows, each bucket is sorted by due date, and counts = {total,expired,overdue,dueSoon,current,undated}.
 * Row: {kind,id,payer,title,due,daysUntilDue,state,basis}; due and daysUntilDue are null when undated.
 */
export function sourcesDueReport({asOf=policyDay(),horizonDays=30,evidence=PAYER_POLICY_EVIDENCE,catalog=CATALOG_POLICIES,formularies=PUBLISHED_FORMULARIES}={}){
 if(!validPolicyDate(asOf))throw Error('asOf must be a real calendar date written YYYY-MM-DD');
 if(!Number.isInteger(horizonDays)||horizonDays<0)throw Error('horizonDays must be a whole number of days (0 or more)');
 const rows=[...evidence.map(evidenceRow),...catalog.map(catalogRow),...formularies.map(formularyRow)].map(r=>{
  const daysUntilDue=r.due===null?null:Math.round((ms(r.due)-ms(asOf))/DAY);
  const row={kind:r.kind,id:r.id,payer:r.payer,title:r.title,due:r.due,daysUntilDue,state:null,basis:r.basis};
  row.state=stateOf({...r,daysUntilDue},asOf,horizonDays);
  return Object.freeze(row);
 }).sort(byDue);
 const pick=(...states)=>rows.filter(r=>states.includes(r.state));
 const n=s=>rows.filter(r=>r.state===s).length;
 return {asOf,horizonDays,overdue:pick('expired','overdue'),dueSoon:pick('due-soon'),current:pick('current'),undated:pick('undated'),
  counts:{total:rows.length,expired:n('expired'),overdue:n('overdue'),dueSoon:n('due-soon'),current:n('current'),undated:n('undated')}};
}
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;
const when=r=>r.daysUntilDue===null?'not dated':r.daysUntilDue===0?'due today':r.daysUntilDue>0?'in '+plural(r.daysUntilDue,'day'):plural(-r.daysUntilDue,'day')+' ago';
const line=r=>`  ${(r.due||'----------')}  ${when(r).padEnd(13)} ${r.state==='expired'?'EXPIRED   ':r.state==='overdue'?'OVERDUE   ':''}${r.kind.padEnd(9)}  ${r.payer} — ${r.title} [${r.id}] · ${r.basis}`;
export function sourcesDueText(report){
 const c=report.counts,section=(head,rows)=>[head+' — '+rows.length,...(rows.length?rows.map(line):['  (none)']),''];
 return ['SOURCE REVIEW DATES — as of '+report.asOf+' (Hawaiʻi policy day); "due soon" means within '+plural(report.horizonDays,'day'),
  'Synthetic-data trial. A review date says when a captured public document must be re-read; it does not assert coverage, approval, eligibility or plan adoption.','',
  ...section('OVERDUE OR EXPIRED',report.overdue),...section('DUE SOON',report.dueSoon),...section('CURRENT',report.current),
  ...section('UNDATED (no reviewed date recorded; check these by hand)',report.undated),
  `Total ${c.total}: ${c.expired} expired, ${c.overdue} overdue, ${c.dueSoon} due soon, ${c.current} current, ${c.undated} undated.`,
  report.overdue.length?'Action: re-read each overdue or expired source and update its record (docs/SOURCE-MAINTENANCE.md).':'Nothing is overdue or expired.'].join('\n');
}
