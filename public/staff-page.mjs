import {renderClinicalAddendumPanel,staffVerificationScope} from './clinical-addendum-panel.mjs';
import {STAFF_PAYERS,STAFF_YEARS,STAFF_CATEGORY_LABELS,staffPlansForPayer,staffPlanProgramLine,staffContext,staffServices} from '../shared/staff-workflow.mjs';
import {evidenceAtAGlance} from '../shared/product-preferences.mjs';
import {policyDay,validPolicyDate} from '../shared/plan-adoption.mjs';
import {COST_FACILITIES,COST_RATE_SOURCES,COST_METHODS,estimatePatientCost} from '../shared/patient-cost.mjs';
import {orthoGelProducts,orthoSourceKinds} from '../shared/orthopedic-procedures.mjs';
import {coverageStatusLabels} from '../shared/hawaii-plan-sources.mjs';
const SOURCE_STATUS_LABELS={...coverageStatusLabels,...orthoSourceKinds,'medical-policy-review':'Reviewed medical policy extract','authorization-list':'Published PA code list','formulary-extract':'Reviewed formulary extract (adoption unverified)'};
const sourceStatusLabel=status=>SOURCE_STATUS_LABELS[status]||status;
import {renderKeragonPaPanel} from './keragon-pa-panel.mjs';
const h=function h(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));};
const opts=function opts(items,current,empty='',getter=(x)=>({v:x,label:x})){
  return (empty?`<option value="">${h(empty)}</option>`:'')+items.map(x=>{const {v,label}=getter(x);return `<option value="${h(v)}" ${String(v)===String(current)?'selected':''}>${h(label)}</option>`}).join('');
};
const money=function money(amount){return amount===null||amount===undefined?'Not yet available':'$'+Number(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
// Plan-year default: the Hawaiʻi policy-day year when the registry supports it, else the latest supported year.
export function staffDefaultYear(day=policyDay()){const y=Number(String(day).slice(0,4));return STAFF_YEARS.includes(y)?y:STAFF_YEARS[STAFF_YEARS.length-1];}
export const STAFF_SEARCH_NO_MATCH='No match - try a brand, procedure name or code (for example TKA, Synvisc, 27447).';
export const STAFF_GLANCE_CAVEAT="Published policy statements - this member's plan adoption, eligibility and authorization are not verified.";
export const STAFF_DATE_NEEDED='Enter a planned service date to see payer references.';
// Plain-English headings for the published PA signals in shared/product-preferences.mjs. Each restates a document; none is a determination.
export const PA_SIGNAL_LABELS=Object.freeze({
 'precertification-required':'Published policy states prior authorization (precertification) is required',
 'pa-not-required-per-policy':'Published policy states prior authorization is not required for this product',
 'step-therapy':'Published step-therapy program lists this product as non-preferred',
 'interqual-criteria':'Published policy: medical necessity is reviewed against licensed InterQual criteria, not reproduced here',
 'lcd-no-prior-auth':'Published LCD record: Original Medicare has no prior authorization; the LCD governs claim and record review',
 'unproven':'Published policy lists this service or device as unproven / not medically necessary',
 'not-reasonable-and-necessary':'Published policy lists this service as not reasonable and necessary'
});
const PREF_LABELS=Object.freeze({preferred:'Preferred','non-preferred':'Non-preferred',excluded:'Excluded per policy','covered-on-criteria':'Criteria-based per policy'});
const PREF_TEXT=Object.freeze({preferred:'listed as preferred','non-preferred':'listed as non-preferred',excluded:'listed as typically excluded','covered-on-criteria':'listed as covered when the policy criteria are met'});
// Step 3 always reads the step-2 selection; a step-6 template override never changes this block.
export function staffGlance(state,asOf=policyDay()){
 const scope=staffVerificationScope({...state,clinicalTemplateId:''});
 if(validPolicyDate(state.serviceDate))return {needsDate:false,glance:evidenceAtAGlance(scope,asOf)};
 // Evidence is empty only because no date is set when the same selection on the policy day has references.
 return {needsDate:evidenceAtAGlance({...scope,serviceDate:asOf},asOf).hasEvidence,glance:null};
}
export function glanceSignals(glance){
 const titles=new Map(glance.references.map(r=>[r.id,r.title])),out=new Map();
 for(const s of glance.paSignals){const row=out.get(s.signal)||{signal:s.signal,label:PA_SIGNAL_LABELS[s.signal]||s.signal,text:s.text,sources:[]};const t=titles.get(s.evidenceId);if(t&&!row.sources.includes(t))row.sources.push(t);out.set(s.signal,row);}
 return [...out.values()];
}
function renderGlance(glance){
 const signals=glanceSignals(glance),sel=glance.selected,titles=new Map(glance.references.map(r=>[r.id,r.title]));
 const lists=[['Preferred',glance.preferred],['Non-preferred',glance.nonPreferred],['Typically excluded',glance.excluded],['Listed as covered on policy criteria',glance.coveredOnCriteria]].filter(([,v])=>v.length);
 const warn=sel&&(sel.status==='non-preferred'||sel.status==='excluded');
 return `${sel?(warn?`<p class="notice amber staff-glance-warn" role="note"><strong>${h(sel.displayName)} is ${h(PREF_TEXT[sel.status])}</strong> in ${h(titles.get(sel.evidenceId)||'the published policy')}.${sel.exception?` ${sel.status==='excluded'?'Policy text':'Exception path stated'}: ${h(sel.exception)}`:''}</p>`
   :`<p class="staff-glance-selected"><span class="pill">${h(PREF_LABELS[sel.status])}</span> <strong>${h(sel.displayName)}</strong> — ${h(PREF_TEXT[sel.status])} in ${h(titles.get(sel.evidenceId)||'the published policy')} (published policy statement).</p>`):''}
 ${signals.length?`<ul class="staff-glance-signals">${signals.map(s=>`<li><strong>${h(s.label)}</strong><span>${h(s.text)}</span><small>Source: ${h(s.sources.join(' · '))}</small></li>`).join('')}</ul>`:'<p class="helper">The matched references state no prior-authorization rule for this selection; read the source before relying on that.</p>'}
 ${lists.length?`<div class="staff-glance-lists">${lists.map(([label,names])=>`<div><span>${h(label)}</span><p>${h(names.join(', '))}</p></div>`).join('')}</div><p class="helper">Product lists are for this insurer and plan line only, as printed in the matched documents.</p>`:''}
 <p class="helper staff-glance-refs">References: ${glance.references.map(r=>`${h(r.title)} (${h(r.version)})${r.reviewState==='overdue'?' — <strong class="warn-text">review overdue</strong>':r.reviewState==='ends-before-service'?' — review window ends before the service date':''}`).join(' · ')}. Full fingerprints and prompts are in step 6.</p>`;
}
function renderRateEvidence(st,ctx){
  const service=ctx.service;
  if(service?.type!=='procedure')return '';
  const choices=[...ctx.possibleCodes.map(x=>({id:x.code,label:x.code+' · '+(x.label||'Procedure')})),
    ...(st.setting==='Hospital inpatient'&&service.category==='arthroplasty'
      ? ['DRG 469','DRG 470','DRG 461','DRG 462'].map(code=>({id:code,label:code+' · verify inpatient DRG assignment'})) : [])];
  const preferred=st.setting==='Hospital inpatient'?choices.find(x=>x.id.startsWith('DRG'))||choices[0]:choices[0];
 const chosen=choices.some(x=>x.id===st.rateCode)?st.rateCode:preferred?.id||'';
  const lookup=st.rateLookup||{};
  const result=lookup.result;
  const fs=result?.facility||[],ps=result?.professional||[];
  const moneyOrUnknown=n=>n===null||n===undefined?'Unknown':money(n);
  return `<section class="staff-rate-evidence">
    <div class="staff-rate-heading"><strong>Cuptomize price evidence</strong><small>Protected staff lookup · not a patient quote</small></div>
    <p class="helper">Find published hospital charges and professional market benchmarks for the selected insurer and billing code. These are not the member's verified allowed amounts.</p>
    <div class="staff-rate-tools"><label>Exact billing code<select id="staff-rate-code">${opts(choices,chosen,'Choose code',x=>({v:x.id,label:x.label}))}</select></label>
      <button class="button secondary" data-action="staff-load-rates" ${!chosen||lookup.busy?'disabled':''}>${lookup.busy?'Checking…':'Find Cuptomize rates'}</button></div>
    ${lookup.error?`<p class="notice amber">${h(lookup.error)}</p>`:''}
    ${result?`<div class="staff-rate-results">
      <p class="helper"><strong>Public rate evidence only.</strong> Indexed ${h(result.builtAt||'Unknown')}; no insurer/member benefits verified; no amounts automatically entered in the calculator.</p>
      <div class="staff-rate-grid">
        <div><strong>Hospital facility evidence (${fs.length})</strong>
          ${fs.length?`<div class="table-scroll"><table><thead><tr><th>Published payer label</th><th>Price or benchmark</th><th>Source date</th></tr></thead><tbody>
          ${fs.map(x=>`<tr><td>${h(x.payerLabel)}<small>${h(x.description)}${x.billingClassVerified?'':' · class unverified'}</small></td>
            <td>${Number.isFinite(x.amount)?moneyOrUnknown(x.amount):Number.isFinite(x.percent)?h(x.percent)+'% of charges':Number.isFinite(x.medianAllowed)?'Median '+moneyOrUnknown(x.medianAllowed):'No dollar rate'}<small>${h(x.methodology||'unspecified methodology')}</small></td>
            <td>${h(x.sourceUpdated||'Unknown')}${typeof x.sourceUrl==='string'&&/^https:\/\//.test(x.sourceUrl)?` <a href="${h(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`:''}</td></tr>`).join('')}
          </tbody></table></div>`:'<p class="helper">No exact code, setting, hospital and insurer-label match found.</p>'}</div>
        <div><strong>Professional market benchmark (${ps.length})</strong>
          ${ps.length?`<div class="table-scroll"><table><thead><tr><th>Published plan</th><th>Min / median / max</th><th>Observations</th></tr></thead><tbody>
            ${ps.map(x=>`<tr><td>${h(x.payer)} · ${h(x.planLabel)}</td><td>${moneyOrUnknown(x.minimum)} / ${moneyOrUnknown(x.median)} / ${moneyOrUnknown(x.maximum)}</td><td>${h(x.observationCount)}</td></tr>`).join('')}
          </tbody></table></div>`:'<p class="helper">No professional benchmark found. Your actual contracted fee must be verified independently.</p>'}</div>
      </div>
      <details class="staff-rate-warnings"><summary>Assumptions and missing data</summary><ul>${(result.warnings||[]).slice(0,10).map(x=>`<li>${h(x)}</li>`).join('')}</ul></details>
    </div>`:''}
    <p class="helper">Requires verified Cloudflare Access and a configured private Cuptomize Worker connection. A missing result does not mean $0 or no coverage.</p>
  </section>`;
}
// The planned service date input lives in step 3. Step 6 is rendered by clinical-addendum-panel.mjs, which
// may still print its own copy: drop that label so id="staff-service-date" appears exactly once.
const DATE_LABEL=/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?id="staff-service-date"(?:(?!<\/label>)[\s\S])*<\/label>\s*/;
export function addendumPanel(state){return renderClinicalAddendumPanel(state).replace(DATE_LABEL,'');}
export function renderStaffPage(state,{legacy=false}={}){
 const {payer,planId,year,serviceId,benefit,requestType,setting,gelProductId,guidance,search,docs,serviceDate}=state;
 const plans=staffPlansForPayer(payer,year);
 const ctx=staffContext({payer,planId,year,serviceId,benefit,requestType,gelProductId,guidance});
 const plan=ctx.plan,service=ctx.service;
 const cost=state.cost;
 const estimate=cost?estimatePatientCost(cost):null;
 const matches=staffServices({query:search});
 const searchCount=String(search||'').trim()?(matches.length?matches.length+' match'+(matches.length===1?'':'es'):h(STAFF_SEARCH_NO_MATCH)):'';
 const visible=matches.some(x=>x.id===serviceId)?matches:(service?[service,...matches]:matches);
 const grouped=[...new Set(visible.map(x=>x.category))].map(cat=>({cat,items:visible.filter(x=>x.category===cat)}));
 const servicesMarkup=grouped.map(({cat,items})=>`<optgroup label="${h(STAFF_CATEGORY_LABELS[cat]||cat)}">${opts(items,serviceId,'',x=>({v:x.id,label:x.name}))}</optgroup>`).join('');
 const needPlan=!plan,needService=!service;
 const linked=ctx.sourceLinks.filter(x=>x.url);
 const costShown=!!plan&&!!service&&!!cost;
 const med=service?.type==='medication';
 const live=ctx.liveSource;
 const drugLookup=state.lookup||{};
 const result=drugLookup.result,querying=drugLookup.busy===true;
 const planStatus=plan?.status==='live-drug-search'?'Machine-readable formulary for this exact published plan':plan?.status==='partial-verified-entries'?'Limited reviewed entries, not complete formulary':'Official plan source only — drug-level coverage unverified';
 const checks=ctx.criteria.map(c=>`<label class="staff-doc"><input type="checkbox" data-staff-check="${h(c.id)}" ${docs[c.id]?'checked':''}><span><strong>${h(c.label)}</strong><small>${h(c.help||'Clinical evidence must be verified and attached in the EHR.')}</small></span></label>`).join('');
 const rows=cost?.items?.map(line=>{
   const calc=estimate?.components?.find(x=>x.id===line.id);
   const advanced=!line.required;
   return `<div class="staff-cost-row ${advanced?'staff-cost-optional':''}">
     <div class="staff-cost-head"><strong>${h(line.label)}</strong><span>${h(line.code||'Separate bill if applicable')} · ${line.required?'Core':'May be separate'}</span></div>
     <div class="staff-cost-inputs">
       <label>Allowed amount ($)<input type="number" step="0.01" min="0" max="10000000" placeholder="Unknown" data-staff-cost="${h(line.id)}" data-staff-price="allowed" value="${line.allowed===null?'':h(line.allowed)}"></label>
       <label>Source<select data-staff-cost="${h(line.id)}" data-staff-price="source">${opts(COST_RATE_SOURCES,line.source)}</select></label>
       <label>Patient share<select data-staff-cost="${h(line.id)}" data-staff-price="method">${opts(COST_METHODS,line.method)}</select></label>
       <label>Coinsurance %<input type="number" step="0.01" min="0" max="100" placeholder="Unknown" data-staff-cost="${h(line.id)}" data-staff-price="percentage" value="${line.percentage===null?'':h(line.percentage)}"></label>
       <label>Copay ($)<input type="number" step="0.01" min="0" max="10000000" placeholder="Unknown" data-staff-cost="${h(line.id)}" data-staff-price="copay" value="${line.copay===null?'':h(line.copay)}"></label>
     </div>
     <div class="staff-cost-foot"><label><input type="checkbox" data-staff-cost="${h(line.id)}" data-staff-price="deductibleApplies" ${line.deductibleApplies?'checked':''}> Deductible applies</label><label><input type="checkbox" data-staff-cost="${h(line.id)}" data-staff-price="oopEligible" ${line.oopEligible?'checked':''}> Counts toward medical OOP max</label><span>${calc?.patientShare!==null?money(calc.patientShare):'Cannot calculate yet'}</span></div>
   </div>`;
 }).join('')||'';
 const paRouteMarkup=(ctx.authorizationResources||[]).length?
  `<div class="staff-pa-route"><strong>Where staff verify / request authorization</strong>
   <div class="staff-pa-actions">${ctx.authorizationResources.map(x=>`<a href="${h(x.url)}" target="_blank" rel="noopener noreferrer" class="staff-pa-action">
   <span>${x.role==='check'?'Verify PA requirement':'Open submission instructions'}</span>
   <small>${h(x.name)}</small></a>`).join('')}</div>
   <p class="helper">Opens the payer's site. Check the exact plan and CPT/NDC/HCPCS before using it. No member data is sent from this trial.</p>
  </div>`:'';
 const sourceRows=linked.map(x=>`<div class="staff-source"><div><strong>${h(x.name)}</strong><small>${h(sourceStatusLabel(x.status))}</small></div><p>${h(x.note||'Confirm source version and plan applicability.')}</p><a href="${h(x.url)}" target="_blank" rel="noopener noreferrer">Official source</a></div>`).join('');
 const estimateWarnings=estimate?[...estimate.missingRequired.map(x=>x.label+': '+x.reason),...estimate.messages]:[];
 const rateEvidence=renderRateEvidence(state,ctx);
 const {needsDate,glance}=plan&&service?staffGlance(state):{needsDate:false,glance:null};
 const signals=glance?.hasEvidence?glanceSignals(glance):[];
 const dateField=`<label class="staff-date-field">Planned service date <small>Policy context only; defaults to today in Hawaiʻi</small><input type="date" id="staff-service-date" value="${h(serviceDate||'')}"></label>`;
 const dateYear=validPolicyDate(serviceDate)?Number(serviceDate.slice(0,4)):null;
 const yearNote=dateYear&&dateYear!==Number(year)?`<p class="notice amber staff-year-note">The planned service date is in ${dateYear}; this plan view is for ${h(year)}.</p>`:'';
 const pricesMarkup=`<section class="panel staff-stage" id="staff-cost"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">4</span> Patient cost estimate</h2></div><div class="panel-content">
   ${!costShown?`<p class="helper">${state.costUnavailable?h(state.costUnavailable):'Choose the insurer, plan and treatment above to begin. No price will be invented.'}</p>`:`
   ${(()=>{const total=estimate?.totalRequired??null;const verified=estimate?.isScenario===true;
     const value=total===null?'Not yet available':verified?money(total):'Assumption-only scenario: '+money(total);
     const note=total===null?'Core allowed amounts or plan benefits are missing.':verified?'Conditional scenario — not a verified patient quote.':'Coverage, network, rate sources or secondary status are still unverified. Do not read this as the patient’s expected bill.';
     const labels={surgeon:'Surgeon',facility:'Facility',anesthesia:'Anesthesia','gel-product':'Gel product','maci-cell':'MACI cell product','drug-product':'Medication product','implant-extra':'Separately billable implant','imaging-global':'Imaging','service':'Therapy / DME'};
     const labelFor=id=>labels[id];
     // Only components that exist for this case are listed; a drug workup no longer shows surgeon/facility/anesthesia rows.
     const rows=cost.items.filter(x=>x.required||labels[x.id]||estimate?.components?.some(c=>c.id===x.id)).map(x=>{const c=estimate?.components?.find(c=>c.id===x.id);return `<small>${h(labelFor(x.id)||x.label)}: ${money(c?.patientShare)}${c?.oopCapped?' (OOP limit reached)':''}</small>`;}).join('');
     return `<div class="staff-cost-hero"><div><span>Estimated patient responsibility</span><strong class="${verified||total===null?'':'staff-cost-assumption'}">${value}</strong><small>${note}</small></div><div><strong>Separate billing estimates</strong>${rows}<small>Unknown is not $0; missing items remain unpriced.</small></div></div>`;})()}
   <div class="staff-cost-setup">
     <label>Hospital / ASC<select id="staff-facility">${opts(COST_FACILITIES,cost.facilityId,'',x=>({v:x.id,label:x.name}))}</select></label>
     <label>Network<select id="staff-network">${opts([{v:'unknown',label:'Not confirmed'},{v:'in-network',label:'In network'},{v:'out-of-network',label:'Out of network'}],cost.network,'',x=>x)}</select></label>
     <label>Coverage<select id="staff-coverage">${opts([{v:'unverified',label:'Not verified'},{v:'staff-verified-covered',label:'Staff verified covered (trial only)'},{v:'staff-verified-not-covered',label:'Reported noncovered'}],cost.coverage,'',x=>x)}</select></label>
     <label>Deductible remaining ($)<input id="staff-deductible" type="number" min="0" step="0.01" value="${cost.deductibleRemaining===null?'':h(cost.deductibleRemaining)}" placeholder="Unknown"></label>
     <label>Medical OOP remaining ($)<input id="staff-oop" type="number" min="0" step="0.01" value="${cost.oopRemaining===null?'':h(cost.oopRemaining)}" placeholder="Unknown"></label>
     <label>Secondary payer<select id="staff-secondary">${opts([{v:'unknown',label:'Unknown'},{v:'none',label:'No secondary'},{v:'possible',label:'Possible secondary'},{v:'verified-other',label:'Secondary exists, not modeled'}],cost.secondary,'',x=>x)}</select></label>
   </div>
   ${rateEvidence}
   <p class="helper">Enter the confirmed insurer-allowed amount or dated written quote for each charge. Public Cuptomize market evidence is never used automatically as a patient price.</p>
   <div class="staff-price-lines">${rows}</div>
   ${estimateWarnings.length?`<details class="staff-checks" ${estimate?.isScenario===true?'':'open'}><summary>Missing rates and benefit checks (${estimateWarnings.length})</summary><ul>${estimateWarnings.map(x=>`<li>${h(x)}</li>`).join('')}</ul></details>`:''}
   <p class="helper">Never substitute a hospital chargemaster amount for an insurer's negotiated facility charge. Original Medicare inpatient Part A facility estimates require a separate benefit-period calculation.</p>
   <div class="local-buttons"><button class="button secondary" data-action="staff-cost-export">Download conditional cost worksheet</button><button class="button secondary" data-action="staff-advanced-cost">Advanced cost details</button></div>
   `}
 </div></section>`;
 return `<div class="page-heading"><div><span class="eyebrow">PACIFIC BONE & JOINT · FRONT DESK / AUTHORIZATION TEAM</span><h1>Coverage, prior auth & patient costs</h1>
 <p class="subtitle">One workflow: insurer → exact plan → medication or procedure → requirements → costs → documentation.</p></div><div class="heading-actions"><button class="button secondary" data-action="staff-sample">Try a sample workup</button></div></div>
 <div class="notice amber staff-banner"><strong>Synthetic trial — not cleared for patient records.</strong> Use only plan names and fictional figures. Medical necessity, patient eligibility, PA approvals, member-specific quotes and completed submissions require approved clinical systems.</div>
 <section class="panel staff-stage" id="staff-plan"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">1</span> Insurance and plan identity</h2><span class="pill neutral">No cross-insurer plans</span></div><div class="panel-content">
 <div class="staff-main-grid"><label>Insurance company<select id="staff-payer">${opts(STAFF_PAYERS,payer,'Choose insurance company',x=>({v:x.name,label:x.name}))}</select></label>
 <label>Coverage year<select id="staff-year">${opts(STAFF_YEARS.map(String),String(year))}</select></label>
 <label>Plan / product or official source<select id="staff-plan-select" ${!payer?'disabled':''}>${opts(plans,planId,payer?'Choose this insurer’s plan':'Select insurer first',x=>({v:x.id,label:x.name}))}</select></label></div>
 ${payer&&plans.length===0?'<p class="notice amber">No verified plan sources for this insurer and year. Do not substitute another insurer’s formulary; confirm the plan with the payer.</p>':''}
 ${plan?`<p class="staff-plan-identified"><strong>${h(plan.payer)} · ${h(plan.name)}</strong> <span>${h(plan.network)} · ${h(staffPlanProgramLine(plan))}</span><br><small>${h(ctx.planPrecision.label)}${service&&(service.type==='procedure'||benefit==='Medical')&&ctx.planPrecision.level==='published-plan-id'?' (pharmacy file identity — not relevant to the medical benefit)':''} · ${h(planStatus)}. Actual group and eligibility must still be verified.</small></p>`:''}
 </div></section>
 <section class="panel staff-stage" id="staff-service"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">2</span> Medication or procedure</h2></div><div class="panel-content">
 <div class="staff-main-grid"><label>Search by drug, generic, condition or procedure<input id="staff-service-query" type="search" maxlength="80" placeholder="e.g., Prolia, TKA, MACI, gel, carpal tunnel" value="${h(search||'')}" autocomplete="off" aria-describedby="staff-search-count">
 <small class="staff-search-count ${search&&!matches.length?'none':''}" id="staff-search-count" aria-live="polite">${searchCount}</small></label>
 <label>Requested service<select id="staff-service-select"><option value="">Choose a treatment</option>${servicesMarkup}</select></label>
 <label>Benefit channel<select id="staff-benefit" ${service?.type==='procedure'?'disabled':''}>${opts(['Medical','Pharmacy'],benefit)}</select></label>
 </div>
 <div class="staff-main-grid staff-subgrid">
 <label>Request type<select id="staff-request-type">${opts(['Initial','Repeat / continuation','Reconsideration / appeal'],requestType)}</select></label>
 <label>Care setting<select id="staff-setting">${opts(['Office','ASC','Hospital outpatient','Hospital inpatient'],setting)}</select></label>
 ${serviceId==='knee-gel'?`<label>Gel product<select id="staff-gel"><option value="">Choose product</option>${opts(orthoGelProducts,gelProductId,'',x=>({v:x.id,label:x.name+' ('+x.code+')'}))}</select></label><label>Injection technique<select id="staff-guidance">${opts([{v:'without-ultrasound',label:'Without ultrasound'},{v:'with-ultrasound',label:'With documented ultrasound'}],guidance,'',x=>x)}</select></label>`:''}
 </div>
 ${service?`<p class="helper"><strong>${h(service.name)}</strong>${service.description?` — ${h(service.description)}`:''}${ctx.possibleCodes.length?`<br>Candidate codes: ${ctx.possibleCodes.map(c=>h(c.code)).join(' · ')} (verify coding)`:(service.type==='procedure'?'<br>Billing code not verified — confirm technique and payer coding before submission.':'')}</p>`:''}
 </div></section>
 <section class="panel staff-stage" id="staff-requirements"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">3</span> Formulary, coverage and PA requirements</h2></div><div class="panel-content">
 ${needPlan||needService?`<div class="staff-date-row">${dateField}</div>${yearNote}<p class="helper">Choose an insurer-owned plan and a requested treatment first. No cross-insurer policy will be shown.</p>`:`
 <section class="staff-glance" id="staff-glance" aria-labelledby="staff-glance-title"><div class="staff-glance-head"><div><h3 id="staff-glance-title">At a glance</h3>${glance?.hasEvidence?`<p class="staff-glance-caveat">${h(STAFF_GLANCE_CAVEAT)}</p>`:''}</div>${dateField}</div>${yearNote}
 ${needsDate?`<p class="staff-glance-empty">${h(STAFF_DATE_NEEDED)}</p>`:glance?.hasEvidence?renderGlance(glance):'<p class="helper">No published payer reference is indexed for this plan, treatment and date. Use the authorization routes and official sources below.</p>'}</section>
 <div class="staff-answer"><strong>Formulary / coverage</strong><span>${med?(benefit==='Medical'?'Medical-benefit drug — pharmacy formulary alone is not coverage':(live?'Exact-plan public pharmacy search available':ctx.formularyEntries?.length?'Reviewed extract from a published list is shown below; plan adoption is not verified':'Drug formulary for this plan is not imported; not verified')):'Procedure medical benefit — confirm current plan coverage and any exclusions'}</span></div>
 <div class="staff-answer"><strong>Prior authorization</strong><span>${glance?.hasEvidence?`${signals.length?signals.map(x=>h(x.label)).join('; ')+'.':'Published policy reference on file; it states no prior-authorization rule for this selection. Read the source.'}<small>Member-level authorization: not verified.</small>`
  :ctx.primaryPolicy?'Published medical policy may apply; review its exact plan scope and requirements':(ctx.supplementaryPA.length?'Published code PA-list record; verify exact plan and year':'Not verified for this particular plan and service')}</span></div>
 ${ctx.policyConflict?'<p class="notice amber">Conflicting medical policies were found; no automatic authorization conclusion can be made.</p>':''}
 ${ctx.formularyEntries?.length?`<p class="staff-note"><strong>Reviewed extract (adoption unverified):</strong> ${ctx.formularyEntries.map(e=>h(e.title)+' — listed as '+h(e.formularyStatus)+(e.summary?'; '+h(e.summary):'')).join(' · ')}</p>`:''}
 ${paRouteMarkup}
 ${med&&benefit==='Pharmacy'&&live?`
 <div class="staff-lookup"><h3>Search this insurer’s published formulary</h3><p class="helper">${h(live.label)} · exact plan ID ${h(live.planId)} · ${h(live.year)}. Look up each strength and route. A row is not an eligibility approval.</p><div class="staff-lookup-search"><input id="staff-drug-lookup" value="${h(drugLookup.term||service.name)}" maxlength="70" autocomplete="off" placeholder="Brand / generic / RxNorm"><button class="button primary" data-action="staff-check-formulary" ${querying?'disabled':''}>${querying?'Checking…':'Check published drug list'}</button></div>
 ${drugLookup.error?`<p class="notice amber">${h(drugLookup.error)}</p>`:''}
 ${result&&drugLookup.sourceId===live.id?`<p class="helper">Published entries: ${result.totalMatches}. ${result.totalMatches===0?'No match does not mean excluded.':result.truncated?'Showing the first '+result.matches.length+'; narrow the search by strength or form.':'All matching rows are shown.'}</p><div class="table-scroll"><table><thead><tr><th>Drug formulation</th><th>Tier</th><th>PA / restrictions</th></tr></thead><tbody>${result.matches.map(x=>`<tr><td>${h(x.name)}</td><td>${h(x.tier)}</td><td>${x.priorAuthorization===true?'PA indicated':x.priorAuthorization===false?'No PA flag listed':'PA unknown'}${x.stepTherapy===true?' · ST':''}${x.quantityLimit===true?' · QL':''}</td></tr>`).join('')}</tbody></table></div>`:''}
 </div>`:''}
 <details class="staff-sources"><summary>Keragon authorization workflow (existing PBJ systems)</summary>${renderKeragonPaPanel(ctx,{benefit,requestType})}</details>
 ${ctx.preferredProducts.length?`<p class="staff-note"><strong>Policy-listed product preference:</strong> ${h(ctx.preferredProducts.join(', '))}. This does NOT establish the selected plan’s pharmacy formulary or exception eligibility.</p>`:''}
 ${ctx.restrictions.length?`<ul class="staff-unresolved">${ctx.restrictions.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}
 <details class="staff-sources"><summary>Official sources relevant to this plan and request (${linked.length})</summary>${sourceRows||'<p class="helper">No reviewed exact-policy URL available; check insurer provider resources.</p>'}</details>
 `}
 </div></section>
 ${pricesMarkup}
 <section class="panel staff-stage" id="staff-packet"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">5</span> Supporting documentation & staff communication</h2></div><div class="panel-content">
 ${!plan||!service?'<p class="helper">Select a plan and treatment to generate a tailored evidence checklist and request template.</p>':`
 <p class="helper">The checklist below tells staff what documents to locate. A checkmark means “record found,” not “medical necessity proven.” Use the actual patient chart only in ModMed or another approved workflow.</p>
 <div class="staff-doc-list">${checks}</div>
 <p class="staff-evidence">Documentation located: ${ctx.criteria.filter(x=>docs[x.id]).length}/${ctx.criteria.length}. ${ctx.primaryPolicy?'Matched public policy: '+h(ctx.primaryPolicy.title)+'. Check current plan applicability.':'No verified clinical-criteria policy imported for this exact plan/service.'}</p>
 <div class="local-buttons"><button class="button primary" data-action="staff-export-packet">Download authorization checklist / letter template</button><button class="button secondary" data-action="staff-patient-script">Copy patient explanation</button></div>
 <p class="helper">Packet includes a blank authorization cover sheet, candidate codes, source-specific criteria and labeled placeholders. It is not a completed patient letter and cannot be submitted with patient data in this trial.</p>`}
 </div></section>
 ${addendumPanel(state)}
 <details class="staff-advanced"><summary>Advanced reference tools (staff administrators only)</summary><div class="local-buttons">
 <button class="button secondary" data-page="formulary">Legacy formulary explorer</button>
 <button class="button secondary" data-page="coverage">Hawaiʻi plan source directory</button>
 <button class="button secondary" data-page="procedures">Procedure criteria library</button>
 <button class="button secondary" data-page="costs">Detailed cost calculator</button>
 ${legacy?'<button class="button secondary" data-page="authorization">Existing letter builder</button>':''}
 <button class="button secondary" data-page="policies">Policy source library</button></div><p class="helper">Advanced modules are kept for reference; the new workflow above is the primary staff-facing process.</p></details>`;
}
