/**
 * Coverage matrix: what the application can and cannot say for each Hawaiʻi payer,
 * coverage line and PBJ priority service, computed from the live data registries.
 *
 * This module only READS the registries. It never upgrades a record: a cell is
 * "reviewed" only when a fingerprinted public snapshot or a reviewed criteria
 * extract exists for the exact payer, line, benefit and product, and its review
 * window still covers the as-of date. Exact-plan adoption, member eligibility,
 * PA approval and procurement are never asserted by any cell.
 */
import {hawaiiCoverageSources} from './hawaii-plan-sources.mjs';
import {STAFF_PAYERS,STAFF_SERVICES,STAFF_YEARS,staffPlansForPayer,staffPlanProgramLine,staffDefaultBenefit} from './staff-workflow.mjs';
import {policies} from './catalog.mjs';
import {policyFreshness} from './domain.mjs';
import {PAYER_POLICY_EVIDENCE,payerEvidenceFor} from './payer-policy-evidence.mjs';
import {documentationBranchesFor} from './payer-documentation-branches.mjs';
import {orthoProcedures,orthoGelProducts,getOrthoPayerSources,getOrthoProcedureCodes} from './orthopedic-procedures.mjs';
import {authTemplateForService} from './authorization-template-catalog.mjs';
import {staffAuthResources} from './staff-auth-resources.mjs';
import {payerRoutingFor} from './hawaii-payer-routing.mjs';
import {submissionRequirementsFor} from './payer-submission-requirements.mjs';
import {PUBLISHED_FORMULARIES} from './live-formularies.mjs';
import {validPolicyDate,policyDay} from './plan-adoption.mjs';

// Payer names differ between the staff selector and the older catalogs.
const CATALOG_PAYER_ALIAS=Object.freeze({'MDX Hawaiʻi':'MDX','HMA / Verdegard':'HMA'});
const ORTHO_PAYER_ALIAS=Object.freeze({'MDX Hawaiʻi':'MDX'});

export const MATRIX_LINE_ORDER=Object.freeze(['Commercial','Individual Exchange','QUEST / Medicaid','Medicare Advantage','Traditional Medicare','Medicare Part D','Federal employee / postal','VA / Community Care','TRICARE','Delegated / claim-specific']);

// Payers the practice sees most often; gaps are reported for these first.
export const MATRIX_FOCUS_PAYERS=Object.freeze(['HMSA','UnitedHealthcare','Kaiser Permanente','UHA','HMAA','AlohaCare','ʻOhana / Wellcare','Traditional Medicare','Humana']);

const svc=(serviceId,group,label,extra={})=>Object.freeze({serviceId,group,label,gelProductId:'',...extra});
export const MATRIX_PRIORITY_SERVICES=Object.freeze([
 svc('prolia','Osteoporosis injections','Prolia (denosumab) J0897'),
 svc('jubbonti','Osteoporosis injections','Jubbonti (denosumab-bbdz) biosimilar'),
 svc('bildyos','Osteoporosis injections','Bildyos (denosumab-nxxp) biosimilar'),
 svc('evenity','Osteoporosis injections','Evenity (romosozumab) J3111'),
 svc('zoledronic-acid','Osteoporosis injections','Reclast (zoledronic acid) J3489'),
 svc('alendronate','Osteoporosis oral / pharmacy benefit','Alendronate (oral, pharmacy benefit)'),
 svc('teriparatide','Osteoporosis oral / pharmacy benefit','Teriparatide / Forteo (pharmacy benefit)'),
 svc('tymlos','Osteoporosis oral / pharmacy benefit','Tymlos (abaloparatide, pharmacy benefit)'),
 ...orthoGelProducts.map(p=>svc('knee-gel','Viscosupplementation',p.name+' ('+p.code+')',{gelProductId:p.id})),
 svc('total-knee','Arthroplasty','Primary total knee arthroplasty 27447'),
 svc('partial-knee','Arthroplasty','Partial / unicompartmental knee 27446'),
 svc('revision-knee','Arthroplasty','Revision total knee 27486 / 27487'),
 svc('total-hip','Arthroplasty','Primary total hip arthroplasty 27130'),
 svc('revision-hip','Arthroplasty','Revision total hip 27134 / 27137 / 27138'),
 svc('maci-harvest','MACI','MACI stage 1 cartilage harvest S2112'),
 svc('maci-implant','MACI','MACI stage 2 implantation 27412 (+ J7330 when billed together)'),
 svc('maci-cell-product','MACI','MACI stage 3 cultured cell product J7330 authorization'),
 svc('acl-reconstruction','Sports knee','ACL reconstruction 29888'),
 svc('bear-acl','Sports knee','BEAR ACL repair / implant'),
 svc('meniscus-repair','Sports knee','Meniscus repair 29882 / 29883'),
 svc('meniscus-root','Sports knee','Meniscus root repair'),
 svc('knee-meniscectomy','Sports knee','Arthroscopic partial meniscectomy 29881'),
 svc('carpal-open','Hand','Open carpal tunnel release 64721'),
 svc('carpal-endo','Hand','Endoscopic carpal tunnel release 29848'),
 svc('carpal-balloon','Hand','Balloon-assisted ultrasound-guided CTR 64728'),
 svc('carpal-ultrasound-other','Hand','Non-balloon ultrasound-guided CTR (no code)'),
 svc('trigger-finger','Hand','Trigger finger release, open 26055'),
 svc('trigger-finger-percutaneous','Hand','Percutaneous / ultrasound-guided trigger finger release'),
 svc('si-joint-fusion','SI joint','Minimally invasive SI joint fusion')
]);

export const MATRIX_STATUSES=Object.freeze({
 reviewed:'REVIEWED — fingerprinted public snapshot or reviewed criteria extract for this payer, line and product; exact-plan adoption still unverified',
 stale:'STALE — a reviewed record exists but its review window, effective date or version no longer covers the as-of date',
 partial:'PARTIAL — directory-level reference, policy link, code-list entry or restrictive note without extracted criteria',
 'live-formulary':'LIVE FORMULARY — pharmacy-benefit drug on a line with an exact-plan machine-readable formulary lookup (tier and PA/ST/QL flags at runtime); not member eligibility',
 'routing-only':'ROUTE ONLY — only a PA lookup or submission route is known; no policy content',
 missing:'MISSING — no record of any kind for this payer, line and service',
 'n/a':'n/a — the coverage line cannot pay for this service type (for example Part D for surgery)'
});

const MEDICAL_DRUG_CODES=Object.freeze({prolia:'J0897',jubbonti:'Q5136',bildyos:'Q5157',evenity:'J3111','zoledronic-acid':'J3489'});

function lineForProgram(program){return staffPlanProgramLine({program});}
function payerLines(payer){
 const plans=STAFF_YEARS.flatMap(y=>staffPlansForPayer(payer,y));
 const lines=[...new Set(plans.map(p=>staffPlanProgramLine(p)).filter(Boolean))];
 return MATRIX_LINE_ORDER.filter(l=>lines.includes(l));
}
function plansFor(payer,line){
 const seen=new Set();
 return STAFF_YEARS.flatMap(y=>staffPlansForPayer(payer,y)).filter(p=>staffPlanProgramLine(p)===line&&!seen.has(p.id)&&seen.add(p.id));
}
function serviceFor(entry){return STAFF_SERVICES.find(s=>s.id===entry.serviceId)||null;}
function codesFor(entry,service){
 if(!service)return [];
 if(service.type==='medication')return MEDICAL_DRUG_CODES[service.id]?[MEDICAL_DRUG_CODES[service.id]]:[];
 if(orthoProcedures.some(p=>p.id===service.id))return getOrthoProcedureCodes({procedureId:service.id,gelProductId:entry.gelProductId,guidance:'without-ultrasound'}).map(c=>c.code);
 return (service.codes||[]).map(c=>c.code);
}
function lineAllows(line,service,benefit){
 if(!service)return false;
 if(line==='Medicare Part D')return service.type==='medication'&&benefit==='Pharmacy';
 if(line==='Traditional Medicare')return !(service.type==='medication'&&benefit==='Pharmacy');
 return true;
}
function evidenceRecords({payer,line,benefit,productId,medication,asOf}){
 return payerEvidenceFor({payer,line,benefit,productId,medication,serviceDate:asOf,planId:'matrix',setting:'Office',state:'HI'},asOf).map(s=>({
  kind:s.directoryOnly===true?'directory-reference':'reviewed-snapshot',id:s.id,title:s.title,version:s.version,effective:s.effectiveFrom,
  reviewDue:s.reviewDue,sourceUrl:s.sourceUrl,
  flags:[...(s.reviewOverdue?['stale']:[]),...(s.versionConfirmationRequired?['version-confirmation-required']:[]),...(s.allProducts?['general-reference']:[]),...(s.proposed?['proposed-not-active']:[])]
 }));
}
function catalogRecords({payer,line,benefit,serviceId,asOf}){
 const alias=CATALOG_PAYER_ALIAS[payer]||payer;
 return policies.filter(p=>p.payer===alias&&p.lines.includes(line)&&p.benefit===benefit&&p.drugIds.includes(serviceId)).map(p=>{
  const freshness=policyFreshness(p,asOf);
  const flags=[];
  if(freshness==='stale'||freshness==='expired'||freshness==='future'||freshness==='invalid')flags.push('stale');
  if(freshness==='undated')flags.push('undated-effective-date');
  if(p.carrier)flags.push('carrier-specific: '+p.carrier);
  if(p.pathways?.length)flags.push(p.pathways.length+' alternative pathways');
  if(p.pathways?.some(x=>x.requiresClarification))flags.push('pathway-needs-clarification');
  const kind=p.kind==='medical-policy'?'reviewed-extract':p.kind==='authorization-list'?'code-list':'formulary-entry';
  return {kind,id:p.id,title:p.title,version:p.policyNumber||null,effective:p.effective,reviewed:p.reviewed,expires:p.expires,sourceUrl:p.url,flags};
 });
}
function orthoRecords({payer,line,serviceId}){
 if(!orthoProcedures.some(p=>p.id===serviceId))return [];
 const alias=ORTHO_PAYER_ALIAS[payer]||payer;
 return getOrthoPayerSources({procedureId:serviceId,payer:alias,line}).map(x=>{
  const kind={'policy-directory':'policy-link','restrictive-review':'restrictive-review','proposed-only':'proposed-only','code-check':'routing','delegate-route':'routing','authorization-route':'routing','plan-check':'routing','coverage-research':'routing','coding-reference':'reference'}[x.kind]||'routing';
  return {kind,id:x.id,title:x.title,version:null,effective:null,checked:x.checked,sourceUrl:x.url,flags:x.kind==='proposed-only'?['proposed-not-active']:x.kind==='restrictive-review'?['restrictive']:[]};
 });
}
function formularyState({payer,line,benefit,service,plans}){
 if(!service||service.type!=='medication')return {state:'n/a',detail:'Not a drug'};
 if(benefit==='Medical')return {state:'n/a',detail:'Medical-benefit drug: pharmacy formulary status is not coverage'};
 const live=plans.filter(p=>p.status==='live-drug-search');
 if(live.length)return {state:'live-source',detail:live.map(p=>PUBLISHED_FORMULARIES.find(f=>f.id===p.liveSourceId)?.planId||p.id).join(', ')};
 const partial=plans.filter(p=>p.status==='partial-verified-entries');
 if(partial.length){
  const entry=policies.find(p=>p.kind==='formulary'&&p.payer===(CATALOG_PAYER_ALIAS[payer]||payer)&&p.lines.includes(line)&&p.drugIds.includes(service.id));
  return {state:entry?'partial-entry':'partial-list',detail:entry?entry.title:'Published list partially transcribed; this drug not transcribed'};
 }
 if(plans.length)return {state:'source-link',detail:'Official formulary page linked; no drug-level import'};
 return {state:'none',detail:'No plan source for this line'};
}
function rollup(records){
 const kinds=new Set(records.map(r=>r.kind));
 const reviewed=records.filter(r=>['reviewed-snapshot','reviewed-extract'].includes(r.kind));
 if(reviewed.length){
  return reviewed.every(r=>r.flags.includes('stale'))?'stale':'reviewed';
 }
 if(['directory-reference','policy-link','restrictive-review','proposed-only','code-list','formulary-entry'].some(k=>kinds.has(k)))return 'partial';
 if(kinds.has('routing')||kinds.has('resource'))return 'routing-only';
 return 'missing';
}
export function assessCoverageCell({payer,line,entry,asOf=policyDay()}={}){
 if(!validPolicyDate(asOf))throw Error('as-of date must be YYYY-MM-DD');
 const service=serviceFor(entry);
 if(!service)throw Error('Unknown priority service '+entry.serviceId);
 const benefit=staffDefaultBenefit(service);
 const plans=plansFor(payer,line);
 const template=authTemplateForService(service.id,entry.gelProductId);
 const codes=codesFor(entry,service);
 const base={payer,line,serviceId:service.id,gelProductId:entry.gelProductId||'',label:entry.label,group:entry.group,benefit,
  plans:plans.map(p=>({id:p.id,name:p.name,status:p.status,year:p.year,exactPlanId:PUBLISHED_FORMULARIES.find(f=>f.id===p.liveSourceId)?.planId||null})),
  template:template?{id:template.id,fields:template.fields.length}:null,codes,
  procurement:'unknown',exactPlanAdoption:'not verified',memberEligibility:'not verified',priorAuthorizationDecision:'not determined'};
 if(!plans.length)return {...base,status:'n/a',records:[],formulary:{state:'n/a',detail:'No plan sources for this payer and line'},routes:[],submissionChecklists:0,documentationPrompts:0,flags:['no-plan-source']};
 if(!lineAllows(line,service,benefit))return {...base,status:'n/a',records:[],formulary:{state:'n/a',detail:'Line cannot pay for this service type'},routes:[],submissionChecklists:0,documentationPrompts:0,flags:['line-not-applicable']};
 const records=[
  ...evidenceRecords({payer,line,benefit,productId:template?.id,medication:service.type==='medication',asOf}),
  ...catalogRecords({payer,line,benefit,serviceId:service.id,asOf}),
  ...orthoRecords({payer,line,serviceId:service.id})
 ];
 const programs=[...new Set(plans.map(p=>p.program))];
 const routes=[
  ...programs.flatMap(program=>staffAuthResources({payer,program,benefit,serviceType:service.type})).map(r=>({id:r.id,name:r.name,role:r.role,sourceUrl:r.url})),
  ...payerRoutingFor({payer,line,category:service.type==='medication'?'medication':'surgery'}).map(r=>({id:r.title,name:r.title,role:'routing',sourceUrl:r.sourceUrl}))
 ].filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i);
 if(!records.length&&routes.length)records.push(...routes.map(r=>({kind:'routing',id:r.id,title:r.name,version:null,effective:null,sourceUrl:r.sourceUrl,flags:[]})));
 const evidenceIds=records.filter(r=>['reviewed-snapshot','directory-reference'].includes(r.kind)).map(r=>r.id);
 const prompts=documentationBranchesFor(evidenceIds,'Initial').length;
 const formulary=formularyState({payer,line,benefit,service,plans});
 let status=rollup(records);
 if(service.type==='medication'&&benefit==='Pharmacy'&&['missing','routing-only'].includes(status)){
  if(formulary.state==='live-source')status='live-formulary';
  else if(formulary.state==='partial-entry')status='partial';
 }
 const flags=[...new Set(records.flatMap(r=>r.flags))];
 if(!codes.length&&service.type==='procedure')flags.push('no-candidate-code');
 if(!template)flags.push('no-clinical-template');
 if(plans.every(p=>!['live-drug-search'].includes(p.status)))flags.push('plan-family-sources-only');
 return {...base,status,records,formulary,routes,submissionChecklists:submissionRequirementsFor({payer,line}).length,documentationPrompts:prompts,flags};
}
export function buildCoverageMatrix({asOf=policyDay(),payers=STAFF_PAYERS.map(p=>p.name),services=MATRIX_PRIORITY_SERVICES}={}){
 if(!validPolicyDate(asOf))throw Error('as-of date must be YYYY-MM-DD');
 const sections=payers.map(payer=>{
  const lines=payerLines(payer);
  const cells=services.flatMap(entry=>lines.map(line=>assessCoverageCell({payer,line,entry,asOf})));
  return {payer,role:STAFF_PAYERS.find(p=>p.name===payer)?.role||'',lines,cells};
 }).filter(s=>s.lines.length);
 const all=sections.flatMap(s=>s.cells);
 const counts=Object.fromEntries(Object.keys(MATRIX_STATUSES).map(k=>[k,all.filter(c=>c.status===k).length]));
 const gaps=[];
 for(const entry of services){
  const missing=all.filter(c=>c.serviceId===entry.serviceId&&c.gelProductId===(entry.gelProductId||'')&&MATRIX_FOCUS_PAYERS.includes(c.payer)&&['missing','routing-only'].includes(c.status));
  const byPayer=MATRIX_FOCUS_PAYERS.filter(p=>missing.some(c=>c.payer===p)).map(p=>({payer:p,lines:missing.filter(c=>c.payer===p).map(c=>c.line)}));
  if(missing.length)gaps.push({label:entry.label,group:entry.group,serviceId:entry.serviceId,gelProductId:entry.gelProductId||'',cells:missing.map(c=>c.payer+' / '+c.line),byPayer});
 }
 const registry={
  evidenceRecords:PAYER_POLICY_EVIDENCE.length,
  fingerprinted:PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly!==true).length,
  directoryOnly:PAYER_POLICY_EVIDENCE.filter(s=>s.directoryOnly===true).length,
  reviewedExtracts:policies.filter(p=>p.kind==='medical-policy').length,
  formularyEntries:policies.filter(p=>p.kind==='formulary').length,
  codeLists:policies.filter(p=>p.kind==='authorization-list').length,
  planSources:hawaiiCoverageSources.length,
  liveFormularies:PUBLISHED_FORMULARIES.length,
  fulfillmentPolicies:0
 };
 return {asOf,generatedFrom:'shared/coverage-matrix.mjs',sections,counts,gaps,registry,
  caveat:'No cell verifies exact-plan adoption, member eligibility, prior authorization approval, payment or a medication supply route. REVIEWED means a reviewed public source exists for the payer, line and product; staff must still confirm the member product and the current source version.'};
}
export function compactCoverageMatrix(matrix){
 return {asOf:matrix.asOf,generatedFrom:matrix.generatedFrom,caveat:matrix.caveat,counts:matrix.counts,registry:matrix.registry,
  statuses:MATRIX_STATUSES,gaps:matrix.gaps.map(g=>({serviceId:g.serviceId,gelProductId:g.gelProductId,label:g.label,group:g.group,byPayer:g.byPayer})),
  cells:matrix.sections.flatMap(s=>s.cells).filter(c=>c.status!=='n/a').map(c=>({payer:c.payer,line:c.line,serviceId:c.serviceId,...(c.gelProductId?{gelProductId:c.gelProductId}:{}),benefit:c.benefit,status:c.status,
   ...(c.flags.length?{flags:c.flags}:{}),records:c.records.filter(r=>r.kind!=='routing').map(r=>r.id),routes:c.routes.length,codes:c.codes,template:c.template?.id||null,formulary:c.formulary.state}))};
}
const STATUS_TOKEN={reviewed:'REVIEWED',stale:'STALE',partial:'PARTIAL','live-formulary':'LIVE FORMULARY','routing-only':'ROUTE ONLY',missing:'MISSING','n/a':'n/a'};
function cellToken(c){
 if(c.status==='n/a')return 'n/a';
 const marks=[];
 if(c.flags.includes('version-confirmation-required'))marks.push('ver?');
 if(c.flags.includes('proposed-not-active'))marks.push('proposed');
 if(c.flags.includes('restrictive'))marks.push('restrictive');
 if(c.flags.includes('no-candidate-code'))marks.push('no code');
 if(c.flags.includes('stale')&&c.status!=='stale')marks.push('some stale');
 const n=c.records.filter(r=>r.kind!=='routing').length;
 return STATUS_TOKEN[c.status]+(n?' ('+n+')':'')+(marks.length?' · '+marks.join(', '):'');
}
export function renderCoverageMatrixMarkdown(matrix){
 const L=[];
 L.push('# Coverage matrix — payer × coverage line × PBJ priority service');
 L.push('');
 L.push(`Generated from the application registries on **${matrix.asOf}** by \`npm run matrix\`. Do not edit by hand; edit the registries and regenerate. The test suite fails if this file drifts from the registries.`);
 L.push('');
 L.push('> '+matrix.caveat);
 L.push('');
 L.push('## Legend');
 L.push('');
 for(const [k,v] of Object.entries(MATRIX_STATUSES))L.push(`- **${STATUS_TOKEN[k]}** — ${v.slice(v.indexOf(' — ')+3)}`);
 L.push('- `(n)` is the number of non-routing records behind the cell; `ver?` means the source version must be confirmed; `proposed` means a proposed rule that is not in effect; `restrictive` means a published policy that limits or excludes the service; `no code` means the technique has no validated candidate code.');
 L.push('');
 L.push('## Summary');
 L.push('');
 L.push('| Status | Cells |');L.push('| --- | ---: |');
 for(const [k,n] of Object.entries(matrix.counts))L.push(`| ${STATUS_TOKEN[k]} | ${n} |`);
 L.push('');
 const r=matrix.registry;
 L.push(`Registries behind the matrix: ${r.evidenceRecords} public payer evidence records (${r.fingerprinted} fingerprinted PDF snapshots, ${r.directoryOnly} directory-only), ${r.reviewedExtracts} reviewed medical-policy criteria extracts, ${r.formularyEntries} transcribed pharmacy formulary entries, ${r.codeLists} published PA code list, ${r.planSources} plan/source directory entries, ${r.liveFormularies} exact-plan machine-readable formulary lookups, and **${r.fulfillmentPolicies} verified exact-plan procurement (buy-and-bill / specialty pharmacy) policies**.`);
 L.push('');
 L.push('## Priority gaps (focus payers)');
 L.push('');
 L.push('Services with no reviewed or partial source for a focus payer and line. Each is a research task: retrieve the exact payer policy, record its version and fingerprint, and scope it to the line before the staff screen can show more than a routing link.');
 L.push('');
 let group='';
 for(const g of matrix.gaps){
  if(g.group!==group){group=g.group;L.push('');L.push(`### ${group}`);L.push('');}
  L.push(`- **${g.label}** — ${g.byPayer.map(p=>p.payer+' ('+p.lines.join(', ')+')').join('; ')}`);
 }
 L.push('');
 for(const s of matrix.sections){
  L.push(`## ${s.payer}`);
  L.push('');
  L.push(`${s.role}. Lines with plan sources: ${s.lines.join(', ')}.`);
  L.push('');
  L.push('| Service | '+s.lines.join(' | ')+' |');
  L.push('| --- | '+s.lines.map(()=>'---').join(' | ')+' |');
  let g='';
  for(const entry of MATRIX_PRIORITY_SERVICES){
   const row=s.lines.map(line=>s.cells.find(c=>c.line===line&&c.serviceId===entry.serviceId&&c.gelProductId===(entry.gelProductId||'')));
   if(row.some(c=>!c))continue;
   if(entry.group!==g){g=entry.group;L.push(`| **${g}** | ${s.lines.map(()=>'').join(' | ')} |`);}
   L.push(`| ${entry.label} | ${row.map(cellToken).join(' | ')} |`);
  }
  L.push('');
  const recs=new Map();
  for(const c of s.cells)for(const rec of c.records)if(rec.kind!=='routing'&&!recs.has(rec.id))recs.set(rec.id,rec);
  if(recs.size){
   L.push(`<details><summary>Records behind ${s.payer} (${recs.size})</summary>`);
   L.push('');
   L.push('| Record | Kind | Version / effective | Review | Flags |');
   L.push('| --- | --- | --- | --- | --- |');
   for(const rec of recs.values())L.push(`| [${rec.title}](${rec.sourceUrl}) | ${rec.kind} | ${[rec.version,rec.effective].filter(Boolean).join(' · ')||'—'} | ${rec.reviewDue?'due '+rec.reviewDue:rec.reviewed?'reviewed '+rec.reviewed+(rec.expires?' · expires '+rec.expires:''):rec.checked?'checked '+rec.checked:'—'} | ${rec.flags.join(', ')||'—'} |`);
   L.push('');
   L.push('</details>');
   L.push('');
  }
  const forms=s.cells.filter(c=>c.formulary.state!=='n/a').map(c=>c.line+': '+c.formulary.state+(c.formulary.state==='live-source'?' ('+c.formulary.detail+')':'')).filter((x,i,a)=>a.indexOf(x)===i);
  if(forms.length){L.push('Pharmacy-benefit formulary access by line: '+forms.join('; ')+'.');L.push('');}
 }
 L.push('## How to close a gap');
 L.push('');
 L.push('1. Retrieve the exact payer document for the line (not a plan-family page), record title, version, effective date, page locator and SHA-256 in `shared/payer-policy-evidence.mjs` and `docs/policy-source-checksums.json`.');
 L.push('2. Add documentation prompts in `shared/payer-documentation-branches.mjs` only for criteria the document actually states.');
 L.push('3. Keep exact-plan adoption, eligibility and procurement as separate, patient-specific gates; nothing in this matrix clears them.');
 L.push('4. Run `npm run matrix` and commit the regenerated file with the registry change.');
 L.push('');
 return L.join('\n');
}
