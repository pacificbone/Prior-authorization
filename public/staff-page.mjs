import {renderClinicalAddendumPanel} from './clinical-addendum-panel.mjs';
import {STAFF_PAYERS,STAFF_YEARS,STAFF_CATEGORY_LABELS,staffPlansForPayer,staffPlanProgramLine,staffContext,staffServices} from '../shared/staff-workflow.mjs';
import {COST_FACILITIES,COST_RATE_SOURCES,COST_METHODS,estimatePatientCost} from '../shared/patient-cost.mjs';
import {orthoGelProducts} from '../shared/orthopedic-procedures.mjs';
import {renderKeragonPaPanel} from './keragon-pa-panel.mjs';
const h=function h(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));};
const opts=function opts(items,current,empty='',getter=(x)=>({v:x,label:x})){
  return (empty?`<option value="">${h(empty)}</option>`:'')+items.map(x=>{const {v,label}=getter(x);return `<option value="${h(v)}" ${String(v)===String(current)?'selected':''}>${h(label)}</option>`}).join('');
};
const money=function money(amount){return amount===null||amount===undefined?'Not yet available':'$'+Number(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
function renderRateEvidence(st,ctx){
  const service=ctx.service;
  if(service?.type!=='procedure')return '';
  const choices=[...ctx.possibleCodes.map(x=>({id:x.code,label:x.code+' · '+(x.label||'Procedure')})),
    ...(st.setting==='Hospital inpatient'&&service.category==='arthroplasty'
      ? ['DRG 469','DRG 470','DRG 461','DRG 462'].map(code=>({id:code,label:code+' · verify inpatient DRG assignment'})) : [])];
  const chosen=choices.some(x=>x.id===st.rateCode)?st.rateCode:choices[0]?.id||'';
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
            <td>${x.amount!==null?moneyOrUnknown(x.amount):x.percent!==null?h(x.percent)+'% of charges':x.medianAllowed!==null?'Median '+moneyOrUnknown(x.medianAllowed):'No dollar rate'}<small>${h(x.methodology||'unspecified methodology')}</small></td>
            <td>${h(x.sourceUpdated||'Unknown')}${x.sourceUrl?` <a href="${h(x.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`:''}</td></tr>`).join('')}
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
export function renderStaffPage(state){
 const {payer,planId,year,serviceId,benefit,requestType,setting,gelProductId,guidance,search,docs}=state;
 const plans=staffPlansForPayer(payer,year);
 const ctx=staffContext({payer,planId,year,serviceId,benefit,requestType,gelProductId,guidance});
 const plan=ctx.plan,service=ctx.service;
 const cost=state.cost;
 const estimate=cost?estimatePatientCost(cost):null;
 const matches=staffServices({query:search});
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
 const sourceRows=linked.map(x=>`<div class="staff-source"><div><strong>${h(x.name)}</strong><small>${h(x.status)}</small></div><p>${h(x.note||'Confirm source version and plan applicability.')}</p><a href="${h(x.url)}" target="_blank" rel="noopener noreferrer">Official source</a></div>`).join('');
 const estimateWarnings=estimate?[...estimate.missingRequired.map(x=>x.label+': '+x.reason),...estimate.messages].slice(0,9):[];
 const rateEvidence=renderRateEvidence(state,ctx);
 const pricesMarkup=`<section class="panel staff-stage" id="staff-cost"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">4</span> Patient cost estimate</h2></div><div class="panel-content">
   ${!costShown?`<p class="helper">Choose the insurer, plan and treatment above to begin. No price will be invented.</p>`:`
   <div class="staff-cost-hero"><div><span>Estimated patient responsibility</span><strong>${(estimate?.totalRequired??null)===null?'Not yet available':money(estimate.totalRequired)}</strong><small>${(estimate?.totalRequired??null)===null?'Core allowed amounts or plan benefits are missing.': 'Conditional scenario only — not a verified patient quote.'}</small></div><div><strong>Separate billing estimates</strong>
  <small>Surgeon: ${money(estimate?.components?.find(x=>x.id==='surgeon')?.patientShare)}</small>
  <small>Facility: ${money(estimate?.components?.find(x=>x.id==='facility')?.patientShare)}</small>
  <small>Anesthesia: ${money(estimate?.components?.find(x=>x.id==='anesthesia')?.patientShare)}</small>
  <small>Implant / gel / cellular product: ${money(estimate?.components?.find(x=>['gel-product','maci-cell','drug-product'].includes(x.id))?.patientShare)}</small>
  <small>Unknown is not $0; missing items remain unpriced.</small></div></div>
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
   ${estimateWarnings.length?`<details class="staff-checks" ${(estimate?.totalRequired??null)===null?'open':''}><summary>Missing rates and benefit checks (${estimateWarnings.length})</summary><ul>${estimateWarnings.map(x=>`<li>${h(x)}</li>`).join('')}</ul></details>`:''}
   <p class="helper">Never substitute a hospital chargemaster amount for an insurer's negotiated facility charge. Original Medicare inpatient Part A facility estimates require a separate benefit-period calculation.</p>
   <div class="local-buttons"><button class="button secondary" data-action="staff-cost-export">Download conditional cost worksheet</button><button class="button secondary" data-action="staff-advanced-cost">Advanced cost details</button></div>
   `}
 </div></section>`;
 return `<div class="page-heading"><div><span class="eyebrow">PACIFIC BONE & JOINT · FRONT DESK / AUTHORIZATION TEAM</span><h1>Coverage, prior auth & patient costs</h1>
 <p class="subtitle">One workflow: insurer → exact plan → medication or procedure → requirements → costs → documentation.</p></div></div>
 <div class="notice amber staff-banner"><strong>Synthetic trial — not cleared for patient records.</strong> Use only plan names and fictional figures. Medical necessity, patient eligibility, PA approvals, member-specific quotes and completed submissions require approved clinical systems.</div>
 <section class="panel staff-stage" id="staff-plan"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">1</span> Insurance and plan identity</h2><span class="pill neutral">No cross-insurer plans</span></div><div class="panel-content">
 <div class="staff-main-grid"><label>Insurance company<select id="staff-payer">${opts(STAFF_PAYERS,payer,'Choose insurance company',x=>({v:x.name,label:x.name}))}</select></label>
 <label>Coverage year<select id="staff-year">${opts(STAFF_YEARS.map(String),String(year))}</select></label>
 <label>Plan / product or official source<select id="staff-plan-select" ${!payer?'disabled':''}>${opts(plans,planId,payer?'Choose this insurer’s plan':'Select insurer first',x=>({v:x.id,label:x.name}))}</select></label></div>
 ${payer&&plans.length===0?'<p class="notice amber">No verified plan sources for this insurer and year. Do not substitute another insurer’s formulary; confirm the plan with the payer.</p>':''}
 ${plan?`<p class="staff-plan-identified"><strong>${h(plan.payer)} · ${h(plan.name)}</strong> <span>${h(plan.network)} · ${h(staffPlanProgramLine(plan))}</span><br><small>${h(ctx.planPrecision.label)} · ${h(planStatus)}. Actual group and eligibility must still be verified.</small></p>`:''}
 </div></section>
 <section class="panel staff-stage" id="staff-service"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">2</span> Medication or procedure</h2></div><div class="panel-content">
 <div class="staff-main-grid"><label>Search by drug, generic, condition or procedure<input id="staff-service-query" type="search" maxlength="80" placeholder="e.g., Prolia, TKA, MACI, gel, carpal tunnel" value="${h(search||'')}" autocomplete="off"></label>
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
 <section class="panel staff-stage" id="staff-coverage"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">3</span> Formulary, coverage and PA requirements</h2></div><div class="panel-content">
 ${needPlan||needService?'<p class="helper">Choose an insurer-owned plan and a requested treatment first. No cross-insurer policy will be shown.</p>':`
 <div class="staff-answer"><strong>Formulary / coverage</strong><span>${med?(benefit==='Medical'?'Medical-benefit drug — pharmacy formulary alone is not coverage':(live?'Exact-plan public pharmacy search available':'Drug formulary for this plan is not imported; not verified')):'Procedure medical benefit — confirm current plan coverage and any exclusions'}</span></div>
 <div class="staff-answer"><strong>Prior authorization</strong><span>${ctx.primaryPolicy?'Published medical policy may apply; review its exact plan scope and requirements':(ctx.supplementaryPA.length?'Published code PA-list record; verify exact plan and year':'Not verified for this particular plan and service')}</span></div>
 ${ctx.policyConflict?'<p class="notice amber">Conflicting medical policies were found; no automatic authorization conclusion can be made.</p>':''}
 ${paRouteMarkup}
 ${renderKeragonPaPanel(ctx,{benefit,requestType})}
 ${med&&benefit==='Pharmacy'&&live?`
 <div class="staff-lookup"><h3>Search this insurer’s published formulary</h3><p class="helper">${h(live.label)} · exact plan ID ${h(live.planId)} · ${h(live.year)}. Look up each strength and route. A row is not an eligibility approval.</p><div class="staff-lookup-search"><input id="staff-drug-lookup" value="${h(drugLookup.term||service.name)}" maxlength="70" autocomplete="off" placeholder="Brand / generic / RxNorm"><button class="button primary" data-action="staff-check-formulary" ${querying?'disabled':''}>${querying?'Checking…':'Check published drug list'}</button></div>
 ${drugLookup.error?`<p class="notice amber">${h(drugLookup.error)}</p>`:''}
 ${result&&drugLookup.sourceId===live.id?`<p class="helper">Published entries: ${result.totalMatches}. ${result.totalMatches===0?'No match does not mean excluded.':''}</p><div class="table-scroll"><table><thead><tr><th>Drug formulation</th><th>Tier</th><th>PA / restrictions</th></tr></thead><tbody>${result.matches.slice(0,15).map(x=>`<tr><td>${h(x.name)}</td><td>${h(x.tier)}</td><td>${x.priorAuthorization===true?'PA indicated':x.priorAuthorization===false?'No PA flag listed':'PA unknown'}${x.stepTherapy===true?' · ST':''}${x.quantityLimit===true?' · QL':''}</td></tr>`).join('')}</tbody></table></div>`:''}
 </div>`:''}
 ${ctx.preferredProducts.length?`<p class="staff-note"><strong>Policy-listed product preference:</strong> ${h(ctx.preferredProducts.join(', '))}. This does NOT establish the selected plan’s pharmacy formulary or exception eligibility.</p>`:''}
 ${ctx.restrictions.length?`<ul class="staff-unresolved">${ctx.restrictions.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`:''}
 <details class="staff-sources"><summary>Official sources relevant to this plan and request (${linked.length})</summary>${sourceRows||'<p class="helper">No reviewed exact-policy URL available; check insurer provider resources.</p>'}</details>
 `}
 </div></section>
 ${renderClinicalAddendumPanel(state)}
 ${pricesMarkup}
 <section class="panel staff-stage" id="staff-packet"><div class="panel-title-row"><h2 class="section-title"><span class="staff-number">5</span> Supporting documentation & staff communication</h2></div><div class="panel-content">
 ${!plan||!service?'<p class="helper">Select a plan and treatment to generate a tailored evidence checklist and request template.</p>':`
 <p class="helper">The checklist below tells staff what documents to locate. A checkmark means “record found,” not “medical necessity proven.” Use the actual patient chart only in ModMed or another approved workflow.</p>
 <div class="staff-doc-list">${checks}</div>
 <p class="staff-evidence">Documentation located: ${ctx.criteria.filter(x=>docs[x.id]).length}/${ctx.criteria.length}. ${ctx.primaryPolicy?'Matched public policy: '+h(ctx.primaryPolicy.title)+'. Check current plan applicability.':'No verified clinical-criteria policy imported for this exact plan/service.'}</p>
 <div class="local-buttons"><button class="button primary" data-action="staff-export-packet">Download authorization checklist / letter template</button><button class="button secondary" data-action="staff-patient-script">Copy patient explanation</button></div>
 <p class="helper">Packet includes a blank authorization cover sheet, candidate codes, source-specific criteria and labeled placeholders. It is not a completed patient letter and cannot be submitted with patient data in this trial.</p>`}
 </div></section>
 <details class="staff-advanced"><summary>Advanced reference tools (staff administrators only)</summary><div class="local-buttons">
 <button class="button secondary" data-page="formulary">Legacy formulary explorer</button>
 <button class="button secondary" data-page="coverage">Hawaiʻi plan source directory</button>
 <button class="button secondary" data-page="procedures">Procedure criteria library</button>
 <button class="button secondary" data-page="costs">Detailed cost calculator</button>
 <button class="button secondary" data-page="authorization">Existing letter builder</button>
 <button class="button secondary" data-page="policies">Policy source library</button></div><p class="helper">Advanced modules are kept for reference; the new workflow above is the primary staff-facing process.</p></details>`;
}
