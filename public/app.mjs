import {drugs,payers,lines,policies,sourceDirectory,defaultScope,coverageProfiles,formularyLists,carrierChoices} from '/shared/catalog.mjs';
import {samples,blankCase} from '/shared/fixtures.mjs';
import {matchingPolicies,resolvePolicy,formularyResult,checkEvidence,readiness,buildLetter,buildDocumentationChecklist,policyFreshness,compareMedications,validatePolicy,validateWorkspace,dateToday,MAX_NOTE,applyPolicyPathway} from '/shared/domain.mjs';
import {sealWorkspace,openWorkspace} from '/shared/vault.mjs';
import {hawaiiCoverageSources,coveragePrograms,findHawaiiCoverageSources,coverageDirectoryStats} from '/shared/hawaii-plan-sources.mjs';
import {PUBLISHED_FORMULARIES} from '/shared/live-formularies.mjs';
import {defaultOrthoCase,orthoProcedures,getOrthoProcedure,createOrthoWorksheet} from '/shared/orthopedic-procedures.mjs';
import {renderOrthopedicPage} from './orthopedic-page.mjs';

const $=(s,root=document)=>root.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  book:'<path d="M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>',
  shield:'<path d="m12 3 8 4v6c0 5-8 9-8 9s-8-4-8-9V7z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  pill:'<path d="M9 4a6 6 0 0 1 8.5 8.5L12 18a6 6 0 0 1-8.5-8.5zM6 7l8.5 8.5"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  external:'<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
  spark:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cloud:'<path d="M7 18a5 5 0 0 1-1-10 6 6 0 0 1 11-1 5.5 5.5 0 0 1 1 11M12 12v9m-3-3 3 3 3-3"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  print:'<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6zM17 11h.01"/>',
  reset:'<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>'
};
const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.info}</svg>`;
const sourceLink=(url,label='Open source')=>`<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon('external')}</a>`;
const options=(values,current)=>values.map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v)}</option>`).join('');
const nav=[['formulary','Formulary explorer','grid'],['coverage','Hawaiʻi coverage','book'],['procedures','Orthopedic procedures','file'],['authorization','Authorization letters','file'],['policies','Policy library','book'],['security','Security & connection','shield']];
const state={page:'formulary',orthoCategory:'injections',ortho:defaultOrthoCase(),coverage:{program:'all',payer:'all',query:'',drug:''},compareVisible:false,publicLookup:{sourceId:PUBLISHED_FORMULARIES[0].id,term:'',busy:false,result:null,error:''},scope:{...defaultScope},drugId:'evenity',search:'',case:blankCase(),custom:[],events:[],draft:'',review:{facts:false,scope:false},locked:false,token:'',connection:{configured:false,provider:'none'},aiBusy:false,aiEpoch:0,vaultMode:'save',vaultEnvelope:null};
let toastTimer,idleTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),6000);}
function log(action){state.events.unshift({action,time:new Date().toISOString()});state.events=state.events.slice(0,50);}
function invalidate(){state.draft='';state.review={facts:false,scope:false};state.aiEpoch++;}
const policyForCase=()=>applyPolicyPathway(resolvePolicy(state.case,state.case.drugId,state.custom).policy,state.case.pathwayId,state.case.drugId);
const saveData=()=>({version:1,case:structuredClone(state.case),custom:structuredClone(state.custom)});
function heading(eyebrow,title,subtitle,actions=''){return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`;}
function syncCaseScope(){Object.assign(state.case,state.scope);state.case.drugId=state.drugId;state.case.evidence={};state.case.pathwayId='';invalidate();}
function scopeMarkup(){
  const profile=coverageProfiles[state.scope.payer],lists=formularyLists.filter(f=>f.payer===state.scope.payer&&f.line===state.scope.line&&f.benefit===state.scope.benefit);
  return `<section class="panel scope-panel" aria-label="Coverage scope"><div class="panel-kicker">${icon('filter')} Start with the right coverage context</div><div class="scope-grid"><label>Payer / administrator<select data-scope="payer" aria-label="Payer">${options(payers,state.scope.payer)}</select></label><label>Plan type<select data-scope="line" aria-label="Plan type">${options(lines,state.scope.line)}</select></label><label>Benefit<select data-scope="benefit" aria-label="Benefit">${options(['Medical','Pharmacy'],state.scope.benefit)}</select></label><label>Plan / formulary code<input data-scope="planCode" aria-label="Plan or formulary code" value="${esc(state.scope.planCode)}" placeholder="${profile?.requiresCarrier?'Exact employer/group plan':'Optional · not member ID'}" maxlength="100"></label></div>${profile?.requiresCarrier?`<div class="scope-extra"><label>Underlying carrier / employer plan<select data-scope="carrier" aria-label="Underlying carrier">${carrierChoices.map(c=>`<option value="${esc(c)}" ${state.scope.carrier===c?'selected':''}>${esc(c||'Select the actual health plan')}</option>`).join('')}</select></label></div>`:''}${lists.length?`<div class="scope-extra"><label>Published formulary to inspect · confirm plan adoption<select id="formulary-list"><option value="">No published list selected</option>${lists.map(f=>`<option value="${esc(f.code)}" ${state.scope.planCode===f.code?'selected':''}>${esc(f.label)}</option>`).join('')}</select></label></div>`:''}<p class="scope-hint">${icon('info')} A formulary/list match does not verify member eligibility. HMA and MDX require the underlying plan; medical and pharmacy benefits stay separate.</p>${profile?`<details class="routing-details"><summary>${esc(profile.name)} · coverage and authorization routing</summary><div class="routing-content"><div class="key-value"><div><dt>ORGANIZATION ROLE</dt><dd>${esc(profile.role)}</dd></div><div><dt>PHARMACY BENEFIT</dt><dd>${esc(profile.pbm)}</dd></div></div><p><strong>Medical:</strong> ${esc(profile.medical)}<br><strong>Pharmacy:</strong> ${esc(profile.pharmacy)}</p><p>${esc(profile.note)}</p><div class="routing-links">${profile.urls.map(([label,url])=>sourceLink(url,label)).join('')}</div></div></details>`:'<p class="scope-hint">No verified routing profile loaded yet. Use exact plan documents and add reviewed public sources.</p>'}</section>`;
}
function renderNav(){
  $('#navigation').innerHTML=nav.map(([id,label,glyph])=>`<button class="nav-item ${state.page===id?'active':''}" data-page="${id}" ${state.page===id?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span>${id==='policies'?`<span class="count">${policies.length+state.custom.length}</span>`:''}</button>`).join('');
  $('#breadcrumb').textContent=nav.find(n=>n[0]===state.page)?.[1]||'Workspace';
  $('#lock').innerHTML=icon('lock');$('#trial-icon').innerHTML=icon('shield');
}
function render(){
  renderNav();
  if(state.locked){$('#page').innerHTML=`<div class="panel lock-screen">${icon('lock')}<h2>Your session is locked.</h2><p>Working notes, draft text and the connection token have been cleared from the active workspace. Restore an encrypted file or start a new fictional case.</p><div class="local-buttons"><button class="button primary" data-action="new-session">Start new session</button><button class="button secondary" data-action="restore-file">${icon('download')} Restore file</button></div></div>`;return;}
  ({formulary:renderExplorer,coverage:renderCoverage,procedures:renderOrthopedics,authorization:renderAuthorization,policies:renderPolicies,security:renderSecurity}[state.page]||renderExplorer)();
}
function setPage(page){if(!nav.some(n=>n[0]===page))return;state.page=page;history.replaceState(null,'',`#${page}`);render();window.scrollTo({top:0});}
function drugStatus(drug){
  const f=formularyResult(state.scope,drug.id,state.custom);
  if(f.status!=='unknown')return `Formulary: ${f.status}`;
  const r=resolvePolicy(state.scope,drug.id,state.custom);
  if(r.conflict)return 'Conflicting policies · review';
  if(r.matches.some(p=>p.kind==='authorization-list'))return 'Published PA list · verify date';
  return r.policy?'Medical policy available':'Coverage not verified';
}
function drugListMarkup(){
  const list=drugs.filter(d=>`${d.name} ${d.generic} ${d.category}`.toLowerCase().includes(state.search.toLowerCase()));
  return list.length?list.map(d=>`<button class="drug-row ${state.drugId===d.id?'active':''}" data-drug="${d.id}" aria-pressed="${state.drugId===d.id}"><span class="drug-mark">${icon('pill')}</span><span class="drug-info"><span class="drug-name">${esc(d.name)}</span><span class="drug-generic">${esc(d.generic)}</span><span class="drug-status"><i></i>${esc(drugStatus(d))}</span></span><span class="arrow" aria-hidden="true">›</span></button>`).join(''):`<div class="empty">No medications match your search.<br>Try a brand or generic name.</div>`;
}
function payerShortcuts(){return `<div class="payer-shortcuts" aria-label="Hawaiʻi coverage organizations">${['HMSA','HMAA','HMA','MDX','UHA','UnitedHealthcare'].map(p=>`<button class="payer-chip ${state.scope.payer===p?'active':''}" data-choose-payer="${p}">${esc(p==='HMA'?'HMA / Verdegard':p)}</button>`).join('')}</div>`;}
function comparisonMarkup(){
  const rows=compareMedications(state.scope,state.custom);
  return `<section class="panel comparison-panel" aria-label="Same-scope medication comparison"><div class="panel-title-row"><h2 class="section-title">Side-by-side medication coverage</h2><span class="pill neutral">${esc(state.scope.payer)} · ${esc(state.scope.line)} · ${esc(state.scope.benefit)}</span></div><div class="panel-content"><p class="helper">Compares public source records under the selected payer, line, benefit and plan/list. This is not member eligibility, therapeutic interchangeability or a prescribing recommendation. Unknown does not mean denied.</p><div class="table-scroll"><table class="compare-table"><thead><tr><th>Medication</th><th>Formulary / tier</th><th>Medical policy</th><th>Published PA list</th></tr></thead><tbody>${rows.map(({drug,formulary,medicalPolicy,medicalPolicyConflict,authorizationLists})=>{
    const status=formulary.status==="unknown"?"Unknown / unverified":formulary.status;
    const source=formulary.entry;
    const clinical=medicalPolicyConflict?"Conflicting policies — review":medicalPolicy?"Medical criteria on file":"Not loaded";
    return `<tr><th>${esc(drug.name)}<br><small>${esc(drug.generic)}</small></th><td><strong>${esc(status)}</strong>${source?(formulary.status==="unknown"?`<br><span class="tiny">Source needs review; tier unverified</span><br>${sourceLink(source.url,"Review source")}`:`<br>${esc(source.tier?`Tier ${source.tier} · `:"")}${esc(source.planCode||"")}<br>${sourceLink(source.url,"Formulary source")}`):""}${formulary.status==="unknown"?`<br><span class="tiny">${esc(formulary.reason)}</span>`:""}</td><td>${esc(clinical)}${medicalPolicy?`<br>${sourceLink(medicalPolicy.url,"Medical policy")}`:""}</td><td>${authorizationLists.length?`${authorizationLists.length} published record(s) · verify dates`:"Not verified"}</td></tr>`;
  }).join("")}</tbody></table></div><p class="helper">A policy-listed preferred product is not the same as an exact-plan pharmacy formulary entry. Confirm current eligibility, plan adoption, benefit routing, product selection and clinical suitability separately.</p></div></section>`;
}
function publicSourcePicker(){
  return `<label class="lookup-source-label">Verified published plan<select id="public-source-picker" aria-label="Published pharmacy formulary">
    ${PUBLISHED_FORMULARIES.map(item=>`<option value="${esc(item.id)}" ${state.publicLookup.sourceId===item.id?'selected':''}>${esc(item.label)}</option>`).join('')}
  </select></label>`;
}
function publicFormularyMarkup(){
  const lookup=state.publicLookup;
  const result=lookup.result;
  const source=result?.source;
  const status=lookup.error?`<p class="notice amber" role="alert">${esc(lookup.error)}</p>`:lookup.busy?'<p class="helper">Checking official published formulary…</p>':result?`<div class="lookup-summary"><strong>${esc(source.label)}</strong> · ${source.effective?`effective ${esc(source.effective)}`:`effective date not published · source reviewed ${esc(source.reviewed||'unverified')}`} · checked ${esc(result.checkedAt.slice(0,10))}<br><span class="tiny">Plan: ${esc(source.planId)} · ${esc(source.planIdType)} · year ${esc(source.year)} · ${esc(source.line)}. Confirm the exact member plan before using any entry.</span>${result.reviewOverdue?'<br><strong class="warn-text">Source review overdue (90 days after its recorded effective/review date). Check the payer for a newer published file.</strong>':''}</div>`:''; 
  return `<section class="panel public-lookup"><div class="panel-title-row"><h2 class="section-title">Search official pharmacy formularies</h2><span class="pill neutral">Public drug data · exact plan</span></div><div class="panel-content"><p class="helper">Choose one exact Hawaiʻi 2026 published pharmacy plan: HMSA QUEST, UHC QUEST, Kaiser QUEST, or the named Kaiser Marketplace Platinum product. Network type alone does not establish a formulary. These public files do not verify member eligibility, medical-benefit drugs, or authorization approval. Never enter a patient name, DOB, member ID, or clinical note.</p><div class="lookup-actions">${publicSourcePicker()}<label class="lookup-label">Drug brand, generic, or RxNorm ID<input type="search" id="public-drug-query" value="${esc(lookup.term)}" minlength="2" maxlength="70" placeholder="e.g., alendronate, Evenity" autocomplete="off"></label><button class="button primary" data-action="public-search" ${lookup.busy?'disabled':''}>${icon('search')} ${lookup.busy?'Checking…':'Search official list'}</button></div>${status}${result?`${result.totalMatches===0?'<div class="notice amber">No matching listed formulation found. This does not establish an exclusion; check the current plan/formulary and benefit channel.</div>':`<div class="table-scroll"><table class="lookup-table"><thead><tr><th>Published drug formulation</th><th>Formulary tier</th><th>Restrictions flagged</th><th>Plan ID</th></tr></thead><tbody>${result.matches.map(row=>`<tr><th>${esc(row.name)}<br><span class="tiny">RxNorm ${esc(row.rxnorm)}</span></th><td>${esc(row.tier)}</td><td>${row.priorAuthorization===true?'PA · ':''}${row.stepTherapy===true?'ST · ':''}${row.quantityLimit===true?'QL · ':''}${row.priorAuthorization!==true&&row.stepTherapy!==true&&row.quantityLimit!==true?(row.priorAuthorization===null||row.stepTherapy===null||row.quantityLimit===null?'Not reported':'No listed flags') : ''}</td><td>${esc(row.planId)}</td></tr>`).join('')}</tbody></table></div>`}${result.truncated?'<p class="notice amber">More than 40 formulations match. Narrow your drug search to the strength and dosage form.</p>':''}<p class="helper">${esc(result.limitations)}<br>${sourceLink(source.sourcePage,'Payer source page')} · ${sourceLink(source.sourceUrl,'Official published JSON')}</p>`:''}</div></section>`;
}
async function runPublicFormularyLookup(){
  const field=$('#public-drug-query');
  if(!field||state.publicLookup.busy)return;
  const term=field.value.trim();
  const sourceId=state.publicLookup.sourceId||PUBLISHED_FORMULARIES[0].id;
  if(term.length<2||term.length>70){toast('Enter a drug name or RxNorm identifier (2–70 characters).');return;}
  state.publicLookup={sourceId,term,busy:true,result:null,error:''};
  const generation=state.aiEpoch;
  renderExplorer();
  try{
    const response=await fetch('/api/formulary/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:sourceId,drug:term}),credentials:'same-origin',cache:'no-store'});
    const data=await response.json();
    if(state.aiEpoch!==generation||state.locked)return;
    if(!response.ok)throw new Error(data.error||'Public formulary unavailable.');
    state.publicLookup={sourceId,term,busy:false,result:data,error:''};
  }catch(error){
    if(state.aiEpoch!==generation||state.locked)return;
    state.publicLookup={sourceId,term,busy:false,result:null,error:error.message||'Unable to verify published list.'};
  }
  if(state.page==='formulary')renderExplorer();
}
const coverageStatusLabels={
  'live-drug-search':'Live published formulary lookup',
  'partial-verified-entries':'Limited verified extracts',
  'payer-search':'Official payer drug search / list',
  'public-source':'Official published source',
  'no-single-formulary':'Exact benefit / plan required'
};

function coverageCardsMarkup(){
  const records=findHawaiiCoverageSources({program:state.coverage.program,payer:state.coverage.payer,text:state.coverage.query});
  return records.length?`<div class="coverage-source-grid">${records.map(item=>`
    <article class="panel coverage-source-card">
      <div class="coverage-source-top"><span class="category">${esc(coveragePrograms.find(p=>p.id===item.program)?.label||item.program)}</span>
        <span class="pill ${item.status==='live-drug-search'?'':item.status==='no-single-formulary'?'amber':'neutral'}">${esc(coverageStatusLabels[item.status])}</span></div>
      <h3>${esc(item.name)}</h3><p><strong>${esc(item.payer)}</strong> · ${esc(item.network)} · ${esc(item.year)}</p>
      <p>${esc(item.notes)}</p>
      <div class="coverage-source-actions">${sourceLink(item.sourceUrl,'Official payer source')}${item.liveSourceId?`<button class="button small primary" data-action="coverage-to-lookup" data-source-id="${esc(item.liveSourceId)}">${icon('search')} Search published drugs</button>`:''}</div>
    </article>`).join('')}</div>`:'<div class="panel no-coverage-results">No source matches those filters. Try a different coverage program or carrier. An absent directory entry does not mean a plan or drug is excluded.</div>';
}
function renderCoverage(){
  const stats=coverageDirectoryStats();
  const insurers=[...new Set(hawaiiCoverageSources.map(p=>p.payer))].sort();
  $('#page').innerHTML=heading('PLAN-SPECIFIC PHARMACY COVERAGE','Hawaiʻi coverage navigator','Find the correct official drug list across HMO, PPO, QUEST, Medicare, VA and employer coverage. A linked source is not proof that a medication is covered.',`<button class="button secondary" data-action="authorization">${icon('file')} Authorization letters</button>`)+
  `<div class="metrics"><div class="metric"><div><span class="metric-value">${stats.sources}</span><span class="metric-label">Distinct source pathways</span></div></div><div class="metric"><div><span class="metric-value">${stats.imported}</span><span class="metric-label">Live drug-search feeds</span></div></div><div class="metric"><div><span class="metric-value">${stats.partial}</span><span class="metric-label">Partial verified extracts</span></div></div></div>
  <section class="panel coverage-controls"><div class="panel-title-row"><h2 class="section-title">Find the actual plan and benefit</h2><span class="pill neutral">Public sources only</span></div><div class="panel-content"><div class="coverage-filter-grid">
  <label>Coverage program<select id="coverage-program"><option value="all">All coverage programs</option>${coveragePrograms.map(p=>`<option value="${esc(p.id)}" ${state.coverage.program===p.id?'selected':''}>${esc(p.label)}</option>`).join('')}</select></label>
  <label>Payer / administrator<select id="coverage-payer"><option value="all">All payers</option>${insurers.map(p=>`<option value="${esc(p)}" ${state.coverage.payer===p?'selected':''}>${esc(p)}</option>`).join('')}</select></label>
  <label>Search insurer, plan or category<input type="search" id="coverage-query" value="${esc(state.coverage.query)}" placeholder="E.g., Kaiser PPO, QUEST, postal" maxlength="120" autocomplete="off"></label>
  <label>Optional drug name for live-source lookups<input type="search" id="coverage-drug" value="${esc(state.coverage.drug)}" placeholder="E.g., alendronate (no patient details)" maxlength="70" autocomplete="off"></label></div>
  <p class="helper">The source directory is searchable locally; it does not contact any insurer. Drug-level results are integrated only where a live feed has been validated. Other entries open official payer searches, PDFs, or benefit rules. Never enter patient identifiers or clinical notes in this trial.</p></div></section>
  <div id="coverage-results">${coverageCardsMarkup()}</div>
  <div class="notice coverage-footer"><strong>Important distinctions:</strong> Original Medicare Part B is not a pharmacy formulary. Traditional Medicare outpatient prescriptions use the member's separate Part D plan. VA and TRICARE have their own formularies. Medicare Advantage, D-SNP and commercial HMO/PPO network labels do not uniquely identify the applicable pharmacy list.</div>`;
}
function renderOrthopedics(){$('#page').innerHTML=renderOrthopedicPage(state.ortho,state.orthoCategory);}
function renderExplorer(){
  const applicable=policies.concat(state.custom).filter(p=>p.payer===state.scope.payer&&p.lines.includes(state.scope.line)&&p.benefit===state.scope.benefit).length;
  $('#page').innerHTML=heading('PRESCRIBE WITH CONTEXT','The right medication starts here.','Look up plan-specific coverage, understand policy requirements, and bring the supporting evidence into your note.',`<button class="button secondary" data-action="coverage">Hawaiʻi plans</button><button class="button secondary" data-action="sample">${icon('spark')} Try sample case</button><button class="button secondary" data-action="compare">${icon('grid')} ${state.compareVisible?'Hide comparison':'Compare medications'}</button><button class="button primary" data-action="authorization">New authorization ${icon('plus')}</button>`)+
  payerShortcuts()+`<div class="metrics"><div class="metric"><span class="metric-icon">${icon('pill')}</span><div><span class="metric-value">${drugs.length}</span><span class="metric-label">Bone health medications</span></div></div><div class="metric"><span class="metric-icon">${icon('book')}</span><div><span class="metric-value">${applicable}</span><span class="metric-label">Sources in selected scope</span></div><span class="metric-note">Public sources</span></div><div class="metric"><span class="metric-icon">${icon('shield')}</span><div><span class="metric-value">Unverified</span><span class="metric-label">Member-specific benefits</span></div></div></div>`+scopeMarkup()+
  `<div class="explorer-grid"><section class="panel"><div class="list-head"><h2 class="section-title">Medication explorer <small>Osteoporosis</small></h2><div class="search">${icon('search')}<input id="drug-search" type="search" aria-label="Search medications" placeholder="Search brand or generic name" value="${esc(state.search)}"></div><div class="list-meta"><span>MEDICATION</span><span>COVERAGE CONTEXT</span></div></div><div class="drug-list" id="drug-list">${drugListMarkup()}</div></section><section class="panel" id="drug-detail" aria-live="polite">${detailMarkup()}</section></div><div class="info-strip">${icon('info')}<span>Public medical policies and plan formularies answer different questions. No member eligibility, PBM, real-time benefit or ModMed connection is active in this trial.</span></div>${state.compareVisible?comparisonMarkup():''}${publicFormularyMarkup()}`;
}
function detailMarkup(){
  const drug=drugs.find(d=>d.id===state.drugId),resolved=resolvePolicy(state.scope,drug.id,state.custom),p=resolved.policy;
  const f=formularyResult(state.scope,drug.id,state.custom),paLists=resolved.matches.filter(p=>p.kind==='authorization-list');
  return `<div class="detail-head"><div class="detail-top"><span class="category">${esc(drug.category)}</span><span class="pill ${p?'':'amber'}">${p?'Policy located':f.entry?'Formulary located':paLists.length?'PA list located':'Source needed'}</span></div><h2>${esc(drug.name)}</h2><p>${esc(drug.generic)}</p></div><div class="detail-body"><div class="status-card"><div class="status-top">${icon('info')} ${f.status==='unknown'?'Formulary status is not verified':`Plan formulary: ${esc(f.status)}`}</div><p>${esc(f.reason)} ${p?'A matching public medical policy is available below.':''}</p>${f.entry?`<p>${sourceLink(f.entry.url,'View formulary source')} · ${esc(f.entry.locator)}</p><p><strong>${esc(f.entry.summary)}</strong></p><p>${esc(f.entry.limitations||'')}</p>`:''}</div>${paLists.map(list=>`<div class="notice amber"><strong>Published authorization requirement</strong><br>${esc(list.summary)}<br>${esc(list.limitations)}<br>${sourceLink(list.url,'View PA list')}</div>`).join('')}${resolved.conflict?'<div class="notice red">Multiple medical-policy records match this scope. Resolve the conflicting records in the policy library before drafting.</div>':''}${p?`<h3 class="section-title">Medical policy at a glance</h3><p class="policy-summary">${esc(p.summary)}</p><dl class="key-value"><div><dt>PLAN TYPE</dt><dd>${esc(state.scope.line)}</dd></div><div><dt>BENEFIT</dt><dd>${esc(p.benefit)} benefit</dd></div><div><dt>EFFECTIVE</dt><dd>${esc(p.effective||'Not stated')}</dd></div><div><dt>SOURCE CHECKED</dt><dd>${esc(p.reviewed)} <span class="pill ${policyFreshness(p)==='current'?'':'amber'}">${esc(policyFreshness(p))}</span></dd></div></dl>${sourceLink(p.url,'Read original policy')}<p class="helper">${esc(p.policyNumber||p.id)} · ${esc(p.locator)}</p><div class="mini-label">DOCUMENT BEFORE REQUESTING</div><ul class="criteria-mini">${p.criteria.map(c=>`<li>${icon('check')}<span>${esc(c.label)}</span></li>`).join('')}</ul>${p.pathways?.length?`<div class="notice">${p.pathways.length} alternative clinical pathways are available. Select the documented pathway in the authorization workspace; requirements are not combined across alternatives.</div>`:''}${p.preferred?.length?`<div class="notice"><strong>Policy-listed preferred products</strong><br>${p.preferred.map(esc).join(' · ')}<br>Preference depends on the exact policy and plan. Verify applicability before choosing a product.</div>`:''}<div class="notice">${esc(p.limitations||'Read the complete source and verify exact plan applicability.')}</div>`:`<div class="empty">${icon('book')}<h3>No applicable authorization criteria loaded</h3><p>${esc(state.scope.payer)} · ${esc(state.scope.line)} · ${esc(state.scope.benefit)}<br>Add the current source for this scope to begin an evidence checklist.</p><button class="button secondary" data-action="add-source">${icon('plus')} Add coverage source</button></div>`}<div class="detail-actions"><span class="tiny">Clinical appropriateness and prescribing safety require clinician review.</span><button class="button primary" data-action="authorization">Build authorization ${icon('arrow')}</button></div></div>`;
}
function renderAuthorization(){
  const p=policyForCase(),r=readiness(state.case,p,state.custom);
  $('#page').innerHTML=heading('DOCUMENT THE REASON','Make the evidence easy to review.','Turn a source note into a policy-linked attachment. Missing documentation stays visible at every step.',`<button class="button secondary" data-action="sample">${icon('spark')} Load fictional case</button><button class="button secondary" data-action="save">${icon('lock')} Save encrypted</button>`)+scopeMarkup()+
  `<div class="auth-grid"><section class="panel"><div class="panel-title-row"><h2 class="section-title">1. Source documentation</h2><span class="pill neutral">In browser memory</span></div><div class="panel-content form-stack"><div class="form-row"><label>Medication<select id="case-drug">${drugs.map(d=>`<option value="${d.id}" ${d.id===state.case.drugId?'selected':''}>${esc(d.name)}</option>`).join('')}</select></label><label>Request type<select id="request-type">${options(['initial','appeal'],state.case.requestType)}</select></label></div><label>Case reference · fictional only<input data-case="label" value="${esc(state.case.label)}" maxlength="150" placeholder="Synthetic case reference"></label><label>Exact plan name · fictional only<input data-case="plan" value="${esc(state.case.plan)}" maxlength="200" placeholder="Document the exact plan"></label><label>Source clinical note · synthetic data only<textarea id="clinical-note" aria-label="Source clinical note · synthetic data only" class="note-editor" maxlength="${MAX_NOTE}" placeholder="Paste a fictional clinical note, or load the sample above. Never enter real patient information in this trial.">${esc(state.case.note)}</textarea></label><div class="input-caption"><span>Not uploaded or autosaved</span><span id="note-count">${state.case.note.length.toLocaleString()} / ${MAX_NOTE.toLocaleString()}</span></div><label>Additional clinician rationale<textarea data-case="rationale" maxlength="10000" rows="3" placeholder="Document the clinical reason for this request. Do not add undocumented treatment history.">${esc(state.case.rationale)}</textarea></label><p class="helper">This trial does not connect to ModMed. Use a reviewed export as a workflow example; live EHR attachment and patient submissions require the production release.</p></div></section><section class="panel"><div class="panel-title-row"><h2 class="section-title">2. Match evidence to policy</h2><button class="button small soft" data-action="ai" ${state.aiBusy?'disabled':''}>${icon('spark')} ${state.aiBusy?'Extracting…':'AI extract evidence'}</button></div><div class="panel-content" id="evidence-panel">${evidenceMarkup(p,r)}</div></section></div><section class="panel packet-panel"><div class="panel-title-row"><h2 class="section-title">3. Authorization attachment</h2><div class="local-buttons"><button class="button secondary" data-action="checklist">${icon('download')} Gap checklist</button><button class="button primary" data-action="draft">${icon('file')} Build letter draft</button></div></div><div id="packet-content">${packetMarkup()}</div></section>`;
}
function evidenceMarkup(p,r=readiness(state.case,p,state.custom)){
  if(!p)return `<div class="empty">No unambiguous medical policy matches this scope.<br>Choose the right payer, plan type and benefit, or add a reviewed source.</div><button class="button secondary wide" data-action="add-source">${icon('plus')} Add coverage source</button>`;
  const count=r.checks.filter(c=>c.status==='documented').length;
  return `${p.pathways?.length?`<label class="pathway-picker">Qualifying clinical pathway<select id="policy-pathway"><option value="">Select the documented pathway</option>${p.pathways.map(b=>`<option value="${esc(b.id)}" ${state.case.pathwayId===b.id?'selected':''}>${esc(b.label)}</option>`).join('')}</select></label>`:''}<div class="progress-row"><span>Documentation coverage</span><strong>${count} / ${r.checks.length} linked</strong></div><div class="progress-track" aria-label="${count} of ${r.checks.length} criteria have note evidence">${r.checks.map(c=>`<span class="progress-segment ${c.status==='documented'?'done':''}"></span>`).join('')}</div><p class="helper">${esc(p.title)} · ${esc(p.policyNumber||p.id)}<br>Quoted evidence requires a clinician’s interpretation. A linked quote does not confirm that a criterion is met.</p><div class="evidence-list">${r.checks.map(c=>`<div class="criterion"><div class="criterion-top"><span class="criterion-title">${esc(c.label)}</span><span class="pill ${c.status==='documented'?'':c.status==='not_met'?'red':'amber'}">${c.status==='documented'?'Linked':c.status==='not_met'?'Not met':'Missing'}</span></div><p class="helper">${esc(c.help)}</p><div class="criterion-controls"><label class="sr-label">Evidence status<select data-evidence-status="${esc(c.id)}"><option value="missing" ${(state.case.evidence[c.id]?.status||'missing')==='missing'?'selected':''}>Not documented</option><option value="documented" ${(state.case.evidence[c.id]?.status||'missing')==='documented'?'selected':''}>Documented in note</option><option value="not_met" ${(state.case.evidence[c.id]?.status||'missing')==='not_met'?'selected':''}>Criterion not met</option></select></label><label>Exact passage from note<textarea data-evidence-quote="${esc(c.id)}" rows="2" maxlength="5000" placeholder="Copy the supporting passage verbatim">${esc(state.case.evidence[c.id]?.quote||'')}</textarea></label></div>${c.issue?`<p class="criterion-issue">${esc(c.issue)}</p>`:''}</div>`).join('')}</div><p class="helper evidence-source">${sourceLink(p.url,'Verify full source')} · ${esc(p.locator)}</p>${state.case.requestType==='appeal'?'<div class="notice amber">Appeal context can be drafted, but this trial’s initial-therapy checklist cannot release an appeal packet.</div>':''}`;
}
function packetMarkup(){
  if(!state.draft)return `<div class="draft-placeholder"><span class="metric-icon">${icon('file')}</span><h3>A clear request, backed by the note.</h3><p>Your draft will include the policy reference, exact supporting passages, source note and outstanding documentation. Nothing is submitted automatically.</p></div>`;
  const r=readiness(state.case,policyForCase(),state.custom),canRelease=r.ready&&state.review.facts&&state.review.scope;
  return `<pre class="draft-text">${esc(state.draft)}</pre><div class="review-area">${r.issues.length?`<div class="notice amber"><strong>${r.issues.length} item${r.issues.length===1?'':'s'} to resolve before release</strong><br>${r.issues.map(esc).join('<br>')}</div>`:'<span class="pill">Evidence checklist complete · clinician review required</span>'}<label class="check-label"><input type="checkbox" id="review-facts" ${state.review.facts?'checked':''}>I verified that the quoted evidence and clinical facts are accurate and sufficient for each criterion.</label><label class="check-label"><input type="checkbox" id="review-scope" ${state.review.scope?'checked':''}>I checked the current source, exact plan applicability, benefits and prescribing safety. The attachment remains unsigned.</label><div class="packet-buttons"><button class="button secondary" data-action="copy">${icon('copy')} Copy draft</button><button class="button secondary" data-action="download-draft">${icon('download')} Draft .txt</button><button class="button primary" data-action="export" ${canRelease?'':'disabled'}>${icon('download')} Reviewed .txt</button><button class="button secondary" data-action="print" ${canRelease?'':'disabled'}>${icon('print')} Print / PDF</button></div><p class="helper">All trial exports are labeled synthetic and are not for patient submission. Changing the note, scope, criteria or rationale resets review.</p></div>`;
}
function refreshEvidence(){if($('#evidence-panel'))$('#evidence-panel').innerHTML=evidenceMarkup(policyForCase());if($('#packet-content'))$('#packet-content').innerHTML=packetMarkup();}
function coverageTableMarkup(){return `<section class="panel coverage-map"><div class="panel-title-row"><h2 class="section-title">Hawaiʻi coverage map</h2><span class="pill neutral">Sources, not live eligibility</span></div><div class="table-scroll"><table><thead><tr><th>Organization</th><th>Role</th><th>Loaded records</th><th>Scope to verify</th></tr></thead><tbody>${Object.entries(coverageProfiles).map(([payer,profile])=>{const records=policies.concat(state.custom).filter(p=>p.payer===payer);return `<tr><th><button class="inline-link" data-choose-payer="${esc(payer)}">${esc(profile.name)}</button></th><td>${esc(profile.role)}</td><td>${records.length?records.map(p=>p.kind).filter((v,i,a)=>a.indexOf(v)===i).map(v=>`${records.filter(p=>p.kind===v).length} ${v==='formulary'?'formulary entries':v==='authorization-list'?'PA list':'medical policies'}`).join('<br>'):'Source directory only'}</td><td>${esc(profile.requiresCarrier?'Underlying carrier and exact employer/delegated plan':'Exact plan, benefit and source version')}</td></tr>`;}).join('')}</tbody></table></div></section>`;}
function renderPolicies(){
  const all=[...policies,...state.custom];
  $('#page').innerHTML=heading('KEEP THE SOURCE CLOSE','A policy library you can inspect.','Every coverage claim needs a scoped, dated source. Add a public policy or an exact-plan formulary entry after reviewing the original.',`<button class="button secondary" data-action="import-policy">${icon('download')} Import JSON</button><button class="button primary" data-action="add-source">${icon('plus')} Add source</button>`)+
  coverageTableMarkup()+`<div class="policy-grid">${all.map(p=>`<article class="panel policy-card"><div class="detail-top"><span class="pill ${policyFreshness(p)==='current'?'':'amber'}">${esc(policyFreshness(p))}</span><span class="category">${p.kind==='formulary'?'Plan formulary':p.kind==='authorization-list'?'PA requirement list':'Medical policy'}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.payer)}${p.carrier?' / '+esc(p.carrier):''} · ${p.lines.map(esc).join(' / ')} · ${esc(p.benefit)}<br>${p.planCode?`Plan code: ${esc(p.planCode)}<br>`:''}${esc(p.summary)}</p><dl class="key-value"><div><dt>EFFECTIVE</dt><dd>${esc(p.effective||'Not stated')}</dd></div><div><dt>CHECKED</dt><dd>${esc(p.reviewed)}</dd></div></dl>${sourceLink(p.url)}<p class="helper">${esc(p.locator)}</p>${p.id.startsWith('custom-')?`<div class="local-buttons"><button class="button small secondary" data-remove-policy="${esc(p.id)}">Remove source</button></div>`:''}</article>`).join('')}</div><div class="panel source-list"><div class="panel-title-row"><h2 class="section-title">Payer source directory</h2><span class="pill neutral">Links do not establish coverage</span></div>${sourceDirectory.map(s=>`<div class="source-row"><div><strong>${esc(s.name)}</strong><p>${esc(s.note)}</p></div>${sourceLink(s.url)}</div>`).join('')}</div><div class="panel import-panel"><h3 class="section-title">Portable sources, explicit scope</h3><p>Imported entries stay in this session until you save an encrypted workspace. Add separate records for medical criteria and pharmacy formulary status. Conflicting matching records block policy selection. Sources older than 90 days are flagged for review.</p><div class="import-actions"><button class="button secondary" data-action="export-policies">${icon('download')} Export source records</button><button class="button secondary" data-action="policy-template">Download JSON template</button></div><p class="helper">No automatic payer feed is connected. A source record is a staff-reviewed extract, not a live benefit check.</p></div>`;
}
function readyRow(title,text,done){return `<div class="readiness-row ${done?'':'pending'}">${icon(done?'check':'clock')}<div><strong>${title}</strong><p>${text}</p></div></div>`;}
function renderSecurity(){
  $('#page').innerHTML=heading('BUILT FOR A CAREFUL START','Local today. Portable for tomorrow.','A working synthetic-data trial with an explicit production boundary. Compliance depends on the deployed services, agreements and practice operations.')+
  `<div class="status-large">${icon('lock')}<div><strong>Patient-data release is locked</strong><p>This build is not approved for PHI. There is no setting that enables real patient data.</p></div></div><div class="security-grid"><section class="panel"><div class="panel-title-row"><h2 class="section-title">Safeguards & release requirements</h2><span class="pill amber">Trial</span></div><div class="panel-content">${readyRow('Notes stay in browser memory','No note upload, analytics, session replay or automatic plaintext browser storage. Explicit local saves use AES-256-GCM encryption.',true)}${readyRow('AI receives bundled fictional records only','The server accepts known sample IDs. It rejects arbitrary notes, custom source content and uploaded case files.',true)}${readyRow('Source grounding & human review','Exact note quotes, explicit gaps, policy-date checks and review gates support safer drafts. No automatic patient submission.',true)}${readyRow('Vendor agreements & eligible services','Execute and verify the relevant hosting/AI BAAs and feature-specific retention requirements before implementing a PHI workflow.',false)}${readyRow('Production identity, auditing & retention','Implement unique staff accounts, MFA, role-based access, durable tamper-resistant audit trails, key management, retention, backup recovery and incident procedures.',false)}${readyRow('Practice risk assessment & release review','Verify device safeguards, data flows, workforce training, vulnerability review and a documented approval for real clinical use.',false)}</div></section><div class="form-stack"><section class="panel"><div class="panel-title-row"><h2 class="section-title">AI connection</h2><span class="pill ${state.connection.configured?'':'amber'}">${state.connection.configured?'Provider configured':'Not connected'}</span></div><div class="panel-content"><p class="helper">Server adapters support OpenAI Responses and Amazon Bedrock Converse. A configured model is required. External AI only extracts supporting passages from the fixed fictional example.</p><div class="connection-status">Provider: <strong>${esc(state.connection.provider)}</strong> · Mode: <strong>Synthetic only</strong></div><label>Trial access token<input id="trial-token" type="password" autocomplete="off" value="${esc(state.token)}" placeholder="Server-configured trial token" maxlength="1000"></label><p class="helper">Kept in this session’s memory and cleared on lock. Never enter an AI provider key here.</p><div class="local-buttons"><button class="button secondary" data-action="check-connection">Check connection</button><button class="button soft" data-action="sample">${icon('spark')} Open sample</button></div><div class="notice">${state.connection.staticPreview?'This private review URL has no AI backend. Use the repository setup guide to connect AI in your local or Cloudflare deployment.':'Use the repository setup guide to configure the server-side provider. AI remains disabled until credentials, a model and trial authorization are configured.'}</div></div></section><section class="panel"><div class="panel-title-row"><h2 class="section-title">Your local workspace</h2><span class="pill neutral">Explicit save only</span></div><div class="panel-content"><p class="helper">Save an encrypted file to your computer, or keep an encrypted copy in this browser. Passphrases and keys are not stored. The active session clears after 10 minutes without interaction. Exported letters are plaintext and require appropriate handling.</p><div class="local-buttons"><button class="button primary" data-action="save">${icon('download')} Encrypted file</button><button class="button secondary" data-action="save-browser">${icon('lock')} Save in browser</button><button class="button secondary" data-action="restore-file">Restore file</button><button class="button secondary" data-action="restore-browser">Unlock browser copy</button><button class="button danger" data-action="delete-browser">Delete browser copy</button></div></div></section></div><section class="panel full-span"><div class="panel-title-row"><h2 class="section-title">Session activity</h2><span class="pill neutral">Not a production audit trail</span></div><div class="panel-content">${state.events.length?state.events.map(e=>`<div class="event-row"><span>${esc(e.action)}</span><time datetime="${esc(e.time)}">${new Date(e.time).toLocaleTimeString('en-US',{timeZone:'Pacific/Honolulu',hour:'2-digit',minute:'2-digit'})} HST</time></div>`).join(''):'<p class="no-events">Actions in this session will appear here. Clinical text is excluded.</p>'}</div></section></div>`;
}
function download(name,text,type='text/plain;charset=utf-8'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function loadSample(){
  invalidate();state.case=structuredClone(samples[state.scope.payer==='UnitedHealthcare'?'osteoporosis-evenity':'hmsa-osteoporosis-evenity']);state.drugId=state.case.drugId;state.scope=Object.fromEntries(Object.keys(defaultScope).map(k=>[k,state.case[k]]));state.locked=false;log('Bundled fictional example loaded');setPage('authorization');toast('Fictional example loaded. Review the linked evidence before drafting.');
}
async function checkConnection(showToast=true){
  if($('meta[name="pbj-api-mode"]')?.content==='static-preview'){
    state.connection={provider:'none',configured:false,staticPreview:true};
    if(showToast)toast('This private review preview has no AI backend. Configure AI in your local or Cloudflare deployment.');
    if(state.page==='security'&&!state.locked)renderSecurity();return;
  }
  try{const response=await fetch('/api/status',{cache:'no-store'});if(!response.ok)throw new Error();state.connection=await response.json();if(showToast)toast(state.connection.configured?'Provider configured for the synthetic trial.':'AI is not connected. Local drafting is available.');}
  catch{state.connection={provider:'none',configured:false};if(showToast)toast('Server connection unavailable. Local drafting still works.');}
  if(state.page==='security'&&!state.locked)renderSecurity();
}
async function runAi(){
  if(state.aiBusy)return;
  if(!state.connection.configured||!state.token){setPage('security');toast('Configure the server provider and enter its trial token to use AI.');return;}
  const sample=samples[state.case.id],p=policyForCase();
  if(!sample||state.case.id!==sample.id||state.case.note!==sample.note||state.case.drugId!==sample.drugId||state.case.payer!==sample.payer||state.case.line!==sample.line||state.case.benefit!==sample.benefit||p?.id!==sample.policyId||state.case.pathwayId!==sample.pathwayId){toast('AI trial accepts the unchanged bundled fictional case only. Load the sample to continue.');return;}
  state.aiBusy=true;const epoch=state.aiEpoch;renderAuthorization();
  try{
    const response=await fetch('/api/ai/extract',{method:'POST',headers:{'Content-Type':'application/json','X-Trial-Token':state.token},body:JSON.stringify({sampleId:sample.id,policyId:p.id}),signal:AbortSignal.timeout(50000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'AI request failed.');
    if(epoch!==state.aiEpoch||state.locked){toast('The case changed while AI was running. Results were discarded.');return;}
    // The server already validates quotes; recheck client-side before applying suggestions.
    const checks=checkEvidence(p,state.case.note,data.evidence);
    if(checks.some(c=>data.evidence[c.id]?.status==='documented'&&c.status!=='documented'))throw new Error('AI evidence failed source validation.');
    state.case.evidence=data.evidence;invalidate();log('AI evidence suggestions received for bundled fictional example');toast('AI suggestions linked to exact note passages. Clinician verification is still required.');
  }catch(error){toast(error.message||'AI extraction failed.');}
  finally{state.aiBusy=false;if(state.page==='authorization'&&!state.locked)renderAuthorization();}
}
function lockSession(){
  state.aiEpoch++;state.case=blankCase();state.scope={...defaultScope};state.drugId='evenity';state.custom=[];state.draft='';state.token='';state.events=[];state.review={facts:false,scope:false};state.search='';state.orthoCategory='injections';state.ortho=defaultOrthoCase();state.coverage={program:'all',payer:'all',query:'',drug:''};state.publicLookup={sourceId:PUBLISHED_FORMULARIES[0].id,term:'',busy:false,result:null,error:''};state.locked=true;state.vaultEnvelope=null;
  $('#vault-passphrase').value='';$('#vault-confirm').value='';$('#vault-dialog').close();$('#source-dialog')?.close();$('#source-form')?.reset();$('#print-region').textContent='';render();
}
function resetIdle(){clearTimeout(idleTimer);if(!state.locked)idleTimer=setTimeout(()=>{lockSession();toast('Session locked after 10 minutes without interaction.');},10*60*1000);}
function openVault(mode,envelope=null){
  state.vaultMode=mode;state.vaultEnvelope=envelope;$('#vault-passphrase').value='';$('#vault-confirm').value='';$('#vault-error').textContent='';
  const unlocking=mode==='unlock';$('#vault-title').textContent=unlocking?'Unlock your workspace':mode==='browser'?'Save encrypted in this browser':'Save an encrypted workspace';
  $('#vault-description').textContent=unlocking?'Decrypt the saved fictional case and coverage sources on this device.':'Encrypt the current fictional case and public-source records. No clinical text is sent to the server.';
  $('#vault-confirm-label').hidden=unlocking;$('#vault-confirm').required=!unlocking;$('#vault-passphrase').autocomplete=unlocking?'current-password':'new-password';$('#vault-submit').textContent=unlocking?'Unlock workspace':'Save encrypted';$('#vault-dialog').showModal();
}
$('#vault-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#vault-submit');button.disabled=true;$('#vault-error').textContent='';
  try{
    const passphrase=$('#vault-passphrase').value;
    if(state.vaultMode==='unlock'){
      const restored=validateWorkspace(await openWorkspace(state.vaultEnvelope,passphrase));
      state.case=restored.case;state.custom=restored.custom;state.drugId=state.case.drugId;state.scope=Object.fromEntries(Object.keys(defaultScope).map(k=>[k,state.case[k]]));state.locked=false;invalidate();log('Encrypted local workspace restored');setPage('authorization');resetIdle();
    }else{
      if(passphrase!==$('#vault-confirm').value)throw new Error('Passphrases do not match.');
      const sealed=await sealWorkspace(saveData(),passphrase);
      if(state.vaultMode==='browser')localStorage.setItem('pbj-encrypted-workspace-v1',JSON.stringify(sealed));
      else download(`pbj-workspace-${dateToday()}.pbjvault`,JSON.stringify(sealed),'application/json');
      log('Workspace explicitly encrypted and saved');toast(state.vaultMode==='browser'?'Encrypted copy saved in this browser.':'Encrypted workspace file created.');
    }
    $('#vault-dialog').close();$('#vault-passphrase').value='';$('#vault-confirm').value='';state.vaultEnvelope=null;
    if(state.page==='security')renderSecurity();
  }catch(error){$('#vault-error').textContent=error.message||'Could not save or restore the workspace.';}
  finally{button.disabled=false;}
});
$('#vault-dialog').addEventListener('close',()=>{$('#vault-passphrase').value='';$('#vault-confirm').value='';state.vaultEnvelope=null;});
$('#vault-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>2000000){toast('Encrypted file is too large.');return;}
  try{openVault('unlock',JSON.parse(await file.text()));}catch{toast('This is not a valid encrypted workspace file.');}
});
const template=()=>({id:'custom-plan-formulary',title:'Replace with reviewed plan formulary title',payer:'HMSA',lines:['Commercial'],benefit:'Pharmacy',kind:'formulary',drugIds:['alendronate'],policyNumber:'',planCode:'REPLACE-WITH-EXACT-PLAN-CODE',effective:dateToday(),reviewed:dateToday(),expires:null,url:'https://www.hmsa.com/prc/pharmacy/hmsa-essential-drug-formulary-and-coverage-codes/',locator:'Replace with specific document version and page',summary:'Template only. Replace with facts checked against the exact plan formulary. Status remains unknown until staff review.',limitations:'Member eligibility and benefits require separate verification.',formularyStatus:'unknown',criteria:[]});
function addPolicy(value){
  const policy=validatePolicy(value);
  if(state.custom.some(p=>p.id===policy.id)||policies.some(p=>p.id===policy.id))throw new Error('A source with this ID already exists. Remove the old custom record before replacing it.');
  if(state.custom.length>=100)throw new Error('Trial limit: 100 custom sources.');
  state.custom.push(policy);invalidate();log('Public coverage source added after staff review');render();toast('Source added for this session. Save an encrypted workspace to keep it.');
}
$('#policy-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>250000){toast('Source file must be under 250 KB.');return;}
  try{const value=JSON.parse(await file.text());if(Array.isArray(value)){const checked=value.map(p=>validatePolicy(p));if(checked.length+state.custom.length>100)throw new Error('Trial limit: 100 custom sources.');const ids=[...state.custom,...checked].map(p=>p.id);if(new Set(ids).size!==ids.length)throw new Error('Duplicate source IDs.');state.custom.push(...checked);invalidate();log('Public coverage records imported');render();toast('Public source records imported.');}else addPolicy(value);}catch(error){toast(error.message||'Source import failed.');}
});
function openSourceDialog(){
  if(!$('#source-dialog')){
    const dialog=document.createElement('dialog');dialog.id='source-dialog';dialog.setAttribute('aria-labelledby','source-title');dialog.innerHTML=`<form id="source-form"><div class="dialog-head"><div><span class="eyebrow">REVIEWED PUBLIC INFORMATION</span><h2 id="source-title">Add a coverage source</h2></div><button type="button" class="icon-button close-dialog" aria-label="Close dialog">×</button></div><p>Use a public payer source. Do not include patient notes, member IDs or portal screenshots.</p><div class="form-row"><label>Payer<select name="payer">${options(payers,state.scope.payer)}</select></label><label>Plan type<select name="line">${options(lines,state.scope.line)}</select></label><label>Benefit<select name="benefit">${options(['Medical','Pharmacy'],state.scope.benefit)}</select></label><label>Source type<select name="kind"><option value="medical-policy">Clinical policy criteria</option><option value="formulary">Plan formulary</option></select></label></div><label>Underlying carrier / employer plan · required for HMA or MDX<select name="carrier">${carrierChoices.map(c=>`<option value="${esc(c)}">${esc(c||'Not applicable / unconfirmed')}</option>`).join('')}</select></label><label>Source title<input name="title" required maxlength="200" placeholder="Policy or formulary title"></label><div class="form-row"><label>Medication<select name="drugId">${drugs.map(d=>`<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></label><label>Plan / formulary code<input name="planCode" maxlength="100" placeholder="Required for formulary"></label></div><label>Source HTTPS URL<input name="url" type="url" required placeholder="https://payer.example/current-policy.pdf"></label><label>Document version & page<input name="locator" required maxlength="300" placeholder="Policy number, revision and page"></label><div class="form-row"><label>Effective date<input name="effective" type="date" value="${dateToday()}" required></label><label>Source checked<input name="reviewed" type="date" value="${dateToday()}" required></label></div><label>Valid through · optional<input name="expires" type="date"></label><label>Formulary status · use unknown for medical policies<select name="formularyStatus">${options(['unknown','preferred','covered','nonpreferred','excluded'],'unknown')}</select></label><label>Short summary<textarea name="summary" required rows="2" maxlength="1500" placeholder="Summarize only what the source establishes"></textarea></label><label>Medical criteria · one per line<textarea name="criteria" rows="3" maxlength="5000" placeholder="Use the complete criteria for one indication and request type. Leave blank for a formulary entry."></textarea></label><label class="check-label"><input type="checkbox" required>I reviewed this source and its exact scope. This record contains no patient information.</label><div class="error-text" id="source-error" role="alert"></div><div class="dialog-actions"><button type="button" class="button secondary close-dialog">Cancel</button><button class="button primary" type="submit">Add reviewed source</button></div></form>`;
    document.body.append(dialog);
    $('#source-form').addEventListener('submit',event=>{
      event.preventDefault();const data=Object.fromEntries(new FormData(event.target));
      try{
        const criteria=data.criteria.split('\n').map(s=>s.trim()).filter(Boolean).map((label,i)=>({id:`criterion-${i+1}`,label,help:'Link the supporting passage from the source note and verify this criterion clinically.'}));
        if(data.kind==='medical-policy'&&!criteria.length)throw new Error('Add the medical-policy criteria before importing this source.');
        addPolicy({id:`custom-${crypto.randomUUID()}`,title:data.title,payer:data.payer,carrier:data.carrier,lines:[data.line],benefit:data.benefit,kind:data.kind,drugIds:[data.drugId],planCode:data.planCode,effective:data.effective,reviewed:data.reviewed,expires:data.expires||null,url:data.url,locator:data.locator,summary:data.summary,formularyStatus:data.formularyStatus,criteria});
        dialog.close();event.target.reset();
      }catch(error){$('#source-error').textContent=error.message;}
    });
  }
  const form=$('#source-form');form.elements.payer.value=state.scope.payer;form.elements.line.value=state.scope.line;form.elements.benefit.value=state.scope.benefit;form.elements.drugId.value=state.drugId;form.elements.carrier.value=state.scope.carrier||'';$('#source-error').textContent='';$('#source-dialog').showModal();
}
document.addEventListener('click',async event=>{
  const close=event.target.closest('.close-dialog');if(close){close.closest('dialog').close();return;}
  const navButton=event.target.closest('[data-page]');if(navButton){setPage(navButton.dataset.page);return;}
  const org=event.target.closest('[data-choose-payer]');if(org){state.scope={...defaultScope,payer:org.dataset.choosePayer};syncCaseScope();setPage('formulary');return;}
  const drug=event.target.closest('[data-drug]');if(drug){state.drugId=drug.dataset.drug;syncCaseScope();$('#drug-list').innerHTML=drugListMarkup();$('#drug-detail').innerHTML=detailMarkup();return;}
  const remove=event.target.closest('[data-remove-policy]');if(remove){state.custom=state.custom.filter(p=>p.id!==remove.dataset.removePolicy);invalidate();log('Custom public source removed');render();return;}
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='coverage'){setPage('coverage');return;}
  if(action==='ortho-gaps'||action==='ortho-outline'){
    try {const text=createOrthoWorksheet(state.ortho,{today:dateToday(),mode:action==='ortho-gaps'?'gaps':'outline'});
      download(`pbj-synthetic-orthopedic-${action==='ortho-gaps'?'gaps':'outline'}-${dateToday()}.txt`,text);
      log('Synthetic orthopedic worksheet downloaded');toast('Synthetic orthopedic worksheet downloaded. No PHI was included.');
    }catch(error){toast(error.message||'Orthopedic worksheet could not be generated.');}
    return;
  }
  if(action==='compare'){state.compareVisible=!state.compareVisible;renderExplorer();return;}
  if(action==='public-search'){await runPublicFormularyLookup();return;}
  if(action==='coverage-to-lookup'){state.publicLookup={sourceId:button.dataset.sourceId||PUBLISHED_FORMULARIES[0].id,term:state.coverage.drug,busy:false,result:null,error:''};setPage('formulary');if(state.publicLookup.term.trim().length>=2)await runPublicFormularyLookup();return;}
  if(action==='sample'){loadSample();return;}
  if(action==='authorization'){setPage('authorization');return;}
  if(action==='new-session'){state.locked=false;resetIdle();setPage('formulary');return;}
  if(action==='add-source'){openSourceDialog();return;}
  if(action==='save'||action==='save-browser'){openVault(action==='save-browser'?'browser':'save');return;}
  if(action==='restore-file'){$('#vault-file').click();return;}
  if(action==='restore-browser'){try{const value=localStorage.getItem('pbj-encrypted-workspace-v1');if(!value){toast('There is no encrypted copy in this browser.');return;}openVault('unlock',JSON.parse(value));}catch{toast('Browser storage is unavailable or the copy is invalid.');}return;}
  if(action==='delete-browser'){try{localStorage.removeItem('pbj-encrypted-workspace-v1');toast('Encrypted browser copy deleted.');}catch{toast('Browser storage is unavailable.');}return;}
  if(action==='import-policy'){$('#policy-file').click();return;}
  if(action==='policy-template'){download('coverage-source-template.json',JSON.stringify(template(),null,2),'application/json');return;}
  if(action==='export-policies'){download('coverage-sources.json',JSON.stringify(state.custom,null,2),'application/json');return;}
  if(action==='check-connection'){await checkConnection();return;}
  if(action==='ai'){await runAi();return;}
  if(action==='checklist'){download(`pbj-synthetic-documentation-checklist-${dateToday()}.txt`,buildDocumentationChecklist(state.case,policyForCase(),{custom:state.custom}));log('Synthetic evidence gap checklist downloaded');toast('Documentation checklist downloaded — fictional data only.');return;}
  if(action==='draft'){state.review={facts:false,scope:false};state.draft=buildLetter(state.case,policyForCase(),{custom:state.custom});log('Synthetic authorization draft built');$('#packet-content').innerHTML=packetMarkup();toast('Draft built from documented facts. Review the checklist and source before export.');return;}
  if(!state.draft)return;
  if(action==='copy'){try{await navigator.clipboard.writeText(state.draft);toast('Draft copied. It is labeled synthetic and unsigned.');log('Synthetic draft copied');}catch{toast('Clipboard unavailable. Download the draft instead.');}return;}
  if(action==='download-draft'){download(`pbj-synthetic-draft-${dateToday()}.txt`,state.draft);log('Synthetic draft downloaded');return;}
  if(action==='export'||action==='print'){
    const r=readiness(state.case,policyForCase(),state.custom);
    if(!r.ready||!state.review.facts||!state.review.scope){toast('Resolve missing documentation and complete clinician review first.');return;}
    const final=buildLetter(state.case,policyForCase(),{custom:state.custom,reviewed:true});
    if(action==='export')download(`pbj-reviewed-synthetic-attachment-${dateToday()}.txt`,final);
    else{$('#print-region').textContent=final;window.print();}
    log(action==='export'?'Reviewed synthetic attachment exported':'Reviewed synthetic attachment printed');
  }
});
document.addEventListener('input',event=>{
  const target=event.target;
  if(target.id==='drug-search'){state.search=target.value;$('#drug-list').innerHTML=drugListMarkup();return;}
  if(target.id==='ortho-plan-label'){state.ortho.planLabel=target.value;return;}
  if(target.id==='coverage-query'){state.coverage.query=target.value;const result=$('#coverage-results');if(result)result.innerHTML=coverageCardsMarkup();return;}
  if(target.id==='coverage-drug'){state.coverage.drug=target.value;return;}
  if(target.id==='public-drug-query'){state.publicLookup.term=target.value;if(state.publicLookup.busy)state.aiEpoch++;state.publicLookup.busy=false;state.publicLookup.result=null;state.publicLookup.error='';return;}
  if(target.id==='trial-token'){state.token=target.value;return;}
  if(target.id==='clinical-note'){state.case.note=target.value;invalidate();$('#note-count').textContent=`${target.value.length.toLocaleString()} / ${MAX_NOTE.toLocaleString()}`;refreshEvidence();return;}
  if(target.dataset.case){state.case[target.dataset.case]=target.value;if(target.dataset.case==='plan')state.scope.plan=target.value;invalidate();if($('#packet-content'))$('#packet-content').innerHTML=packetMarkup();return;}
  if(target.dataset.evidenceQuote){const id=target.dataset.evidenceQuote;state.case.evidence[id]={...(state.case.evidence[id]||{status:'missing'}),quote:target.value};invalidate();if($('#packet-content'))$('#packet-content').innerHTML=packetMarkup();}
});
document.addEventListener('change',event=>{
  const target=event.target;
  if(target.id==='coverage-program'){state.coverage.program=target.value;renderCoverage();return;}
  if(target.id==='coverage-payer'){state.coverage.payer=target.value;renderCoverage();return;}
  if(target.dataset.orthoCheck){state.ortho.checks[target.dataset.orthoCheck]=target.checked;renderOrthopedics();return;}
  if(target.id==='ortho-category'){state.orthoCategory=target.value;state.ortho.procedureId=orthoProcedures.find(p=>p.category===target.value)?.id||'knee-gel';state.ortho.checks={};state.ortho.gelProductId='';renderOrthopedics();return;}
  if(target.id==='ortho-procedure'){const next=getOrthoProcedure(target.value);if(!next)return;state.ortho.procedureId=next.id;state.orthoCategory=next.category;state.ortho.checks={};state.ortho.gelProductId='';renderOrthopedics();return;}
  if(target.id==='ortho-payer'){state.ortho.payer=target.value;const defaults={'Traditional Medicare':'Traditional Medicare','Veterans Affairs':'VA / Community Care','TRICARE':'TRICARE','Workers compensation':'Workers compensation','AlohaCare':'QUEST / Medicaid'};state.ortho.line=defaults[target.value]||(['Traditional Medicare','VA / Community Care','TRICARE','Workers compensation'].includes(state.ortho.line)?'Commercial':state.ortho.line);renderOrthopedics();return;}
  if(target.id==='ortho-line'||target.id==='ortho-setting'||target.id==='ortho-request-type'||target.id==='ortho-gel'||target.id==='ortho-guidance'||target.id==='ortho-plan-label'){
    const key={'ortho-line':'line','ortho-setting':'setting','ortho-request-type':'requestType','ortho-gel':'gelProductId','ortho-guidance':'guidance','ortho-plan-label':'planLabel'}[target.id];state.ortho[key]=target.value;renderOrthopedics();return;}
  if(target.dataset.scope){if(target.dataset.scope==='payer'){state.scope.carrier='';state.scope.planCode='';state.scope.plan='';}if(['line','benefit'].includes(target.dataset.scope))state.scope.planCode='';state.scope[target.dataset.scope]=target.value;syncCaseScope();render();return;}
  if(target.id==='public-source-picker'){state.aiEpoch++;state.publicLookup={sourceId:target.value,term:state.publicLookup.term,busy:false,result:null,error:''};renderExplorer();return;}
  if(target.id==='formulary-list'){state.scope.planCode=target.value;syncCaseScope();render();return;}
  if(target.id==='policy-pathway'){state.case.pathwayId=target.value;state.case.evidence={};invalidate();refreshEvidence();return;}
  if(target.id==='case-drug'){state.drugId=target.value;syncCaseScope();renderAuthorization();return;}
  if(target.id==='request-type'){state.case.requestType=target.value;invalidate();refreshEvidence();return;}
  if(target.dataset.evidenceStatus){const id=target.dataset.evidenceStatus;state.case.evidence[id]={...(state.case.evidence[id]||{quote:''}),status:target.value};invalidate();refreshEvidence();return;}
  if(target.dataset.evidenceQuote){refreshEvidence();return;}
  if(target.id==='review-facts'||target.id==='review-scope'){state.review[target.id==='review-facts'?'facts':'scope']=target.checked;$('#packet-content').innerHTML=packetMarkup();}
});
document.addEventListener('keydown',event=>{if(event.target.id==='public-drug-query'&&event.key==='Enter'){event.preventDefault();runPublicFormularyLookup();}});
$('#sidebar-sample').addEventListener('click',loadSample);$('#review-security').addEventListener('click',()=>setPage('security'));$('#lock').addEventListener('click',lockSession);
for(const event of ['pointerdown','keydown','input','scroll'])document.addEventListener(event,resetIdle,{passive:true});
window.addEventListener('afterprint',()=>{$('#print-region').textContent='';});
window.addEventListener('pageshow',event=>{if(event.persisted)lockSession();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)state.token='';});
const initial=location.hash.slice(1);if(nav.some(n=>n[0]===initial))state.page=initial;
render();resetIdle();checkConnection(false);
