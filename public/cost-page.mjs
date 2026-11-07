import {COST_YEARS,COST_PAYERS,COST_LINES,COST_SETTINGS,COST_NETWORKS,COST_COVERAGE,COST_SECONDARY,COST_RATE_SOURCES,COST_METHODS,COST_FACILITIES,COST_MEDICATIONS,estimatePatientCost,getCostService,selectCostGuidance} from '../shared/patient-cost.mjs';
import {orthoCategories,orthoProcedures,orthoGelProducts} from '../shared/orthopedic-procedures.mjs';
const escapeCost=function escapeCost(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));};
const costOpt=function costOpt(options,current){
 return options.map(x=>`<option value="${escapeCost(typeof x==='string'?x:x.id)}" ${(typeof x==='string'?x:x.id)===current?'selected':''}>${escapeCost(typeof x==='string'?x:x.name||x.label)}</option>`).join('');
};
const dollarValue=function dollarValue(value){return value===null||value===undefined?'Unknown':'$'+Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
export function renderCostPage(value,selectedCategory='arthroplasty'){
 const result=estimatePatientCost(value);
 const service=getCostService(value.procedureId);
 const categories=[
   ...orthoCategories.map(x=>({id:x.id,name:x.label})),
   {id:'medication',name:'Osteoporosis medications'}
 ];
 const services=[...orthoProcedures,...COST_MEDICATIONS].filter(x=>x.category===selectedCategory);
 const external=selectCostGuidance(value);
 const itemInputs=value.items.map((line,index)=>{
   const r=result.components[index];
   const hasPrice=line.allowed!==null;
   return `<div class="cost-item">
     <div class="cost-item-head">
       <div><strong>${escapeCost(line.label)}</strong><span>${escapeCost(line.kind)} ${line.code?' · '+escapeCost(line.code):''} ${line.required?' · required':' · may be separately billed'}</span></div>
       <span class="pill ${r.patientShare===null?'amber':'neutral'}">${r.patientShare===null?'Unpriced':dollarValue(r.patientShare)}</span>
     </div>
     <div class="cost-item-grid">
       <label>Allowed amount / quoted charge ($)<input type="number" min="0" max="10000000" step="0.01" data-cost-item="${escapeCost(line.id)}" data-cost-field="allowed" value="${line.allowed===null?'':line.allowed}" placeholder="Not verified"></label>
       <label>Rate source<select data-cost-item="${escapeCost(line.id)}" data-cost-field="source">${costOpt(COST_RATE_SOURCES,line.source)}</select></label>
       <label>Cost-share method<select data-cost-item="${escapeCost(line.id)}" data-cost-field="method">${costOpt(COST_METHODS,line.method)}</select></label>
       <label>Coinsurance (%)<input type="number" min="0" max="100" step="0.01" data-cost-item="${escapeCost(line.id)}" data-cost-field="percentage" value="${line.percentage===null?'':line.percentage}" placeholder="If applicable"></label>
       <label>Fixed copay ($)<input type="number" min="0" max="10000000" step="0.01" data-cost-item="${escapeCost(line.id)}" data-cost-field="copay" value="${line.copay===null?'':line.copay}" placeholder="If applicable"></label>
     </div>
     <div class="cost-item-flags">
      <label><input type="checkbox" data-cost-item="${escapeCost(line.id)}" data-cost-field="deductibleApplies" ${line.deductibleApplies?'checked':''}> Deductible applies to this charge</label>
      <label><input type="checkbox" data-cost-item="${escapeCost(line.id)}" data-cost-field="oopEligible" ${line.oopEligible?'checked':''}> Counts toward this plan’s medical OOP limit (verify)</label>
     </div>
     ${hasPrice&&line.source==='unverified'?'<p class="helper">Amount has no documented price source — this remains an illustrative assumption.</p>':''}
     ${r.missing?`<p class="helper">Missing: ${escapeCost(r.missing)}</p>`:''}
   </div>`;
 }).join('');
 const showTotal=result.totalRequired!==null;
 const title=showTotal?'Conditional modeled subtotal':'No complete estimate';
 const figure=showTotal?dollarValue(result.totalRequired):'Not available';
 const facility=external.facility;
 const overview=[
   `Covered service status: ${value.coverage==='staff-verified-covered'?'Staff marked covered; confirmation needed':'Unverified for patient'}`,
   `Facility/network: ${value.network}`,
   `Mandatory components missing: ${result.missingRequired.length}`,
   `Additional optional components unpriced: ${result.missingOptional.length}`
 ];
 return `<div class="page-heading"><div><span class="eyebrow">FINANCIAL COUNSELING · SYNTHETIC TRIAL</span><h1>Estimate out-of-pocket costs</h1>
 <p class="subtitle">Build a conditional surgery or medication cost scenario using exact insurance benefits, facility quotes and separately billed fees.</p></div>
 <div class="heading-actions"><button class="button secondary" data-action="cost-clear">Reset estimates</button><button class="button primary" data-action="cost-export">Export synthetic worksheet</button></div></div>
 <div class="notice amber cost-banner"><strong>Not a patient quote.</strong> No eligibility checks or insurer-specific live benefit values are connected. Never enter real patient information. Out-of-pocket totals remain incomplete until mandatory contracted charges and benefit information are entered.</div>
 <section class="panel cost-setup"><div class="panel-title-row"><h2 class="section-title">1 · Procedure and insurance</h2><span class="pill neutral">Staff-entered assumptions</span></div><div class="panel-content">
   <div class="cost-controls">
    <label>Service category<select id="cost-category">${costOpt(categories,selectedCategory)}</select></label>
    <label>Procedure or medication<select id="cost-service">${costOpt(services,value.procedureId)}</select></label>
    <label>Insurance company<select id="cost-payer">${costOpt(COST_PAYERS,value.payer)}</select></label>
    <label>Plan line<select id="cost-line">${costOpt(COST_LINES,value.line)}</select></label>
    <label>Benefit year<select id="cost-year">${costOpt(COST_YEARS.map(n=>String(n)),String(value.year))}</select></label>
    <label>Claim type / benefit<select id="cost-benefit">${costOpt(['Unverified','Medical','Pharmacy'],value.benefit)}</select></label>
    <label>Care setting<select id="cost-setting">${costOpt(COST_SETTINGS,value.setting)}</select></label>
    <label>Actual hospital / facility<select id="cost-facility">${costOpt(COST_FACILITIES,value.facilityId)}</select></label>
    ${value.procedureId==='knee-gel'?`
       <label>Gel product<select id="cost-gel"><option value="">Select product</option>${costOpt(orthoGelProducts.map(x=>({id:x.id,name:x.name+' — '+x.code})),value.gelProductId)}</select></label>
       <label>Injection type<select id="cost-guidance">${costOpt([{id:'without-ultrasound',name:'Without ultrasound'},{id:'with-ultrasound',name:'With documented ultrasound'}],value.guidance)}</select></label>
    `:''}
    <label>Network status<select id="cost-network">${costOpt([{id:'unknown',name:'Not confirmed'},{id:'in-network',name:'In network / participating'},{id:'out-of-network',name:'Out of network'}],value.network)}</select></label>
    <label>Coverage review<select id="cost-coverage">${costOpt([{id:'unverified',name:'Not verified'},{id:'staff-verified-covered',name:'Staff reports covered (not independently verified)'},{id:'staff-verified-not-covered',name:'Reported not covered / check appeal'}],value.coverage)}</select></label>
    <label>Secondary insurance<select id="cost-secondary">${costOpt([{id:'unknown',name:'Unknown'},{id:'none',name:'None'},{id:'possible',name:'Possibly'},{id:'verified-other',name:'Exists; not modeled'}],value.secondary)}</select></label>
    <label>Remaining deductible ($)<input type="number" id="cost-deductible" min="0" max="10000000" step="0.01" value="${value.deductibleRemaining===null?'':value.deductibleRemaining}" placeholder="Verify in payer portal"></label>
    <label>Remaining medical OOP limit ($)<input type="number" id="cost-oop" min="0" max="10000000" step="0.01" value="${value.oopRemaining===null?'':value.oopRemaining}" placeholder="Verify in payer portal"></label>
   </div>
   <label class="cost-plan-label">Plan name or employer product (NO member ID)<input id="cost-plan" maxlength="80" autocomplete="off" value="${escapeCost(value.planLabel)}" placeholder="e.g., HMSA Choice, UHA employer HMO"></label>
   <p class="helper">Use the patient's current benefit detail only inside an approved practice system. This trial receives staff-entered **non-identifying** plan characteristics. The deductible and OOP balances are different from annual plan limits. If an insurance value is unknown, leave the field blank.</p>
 </div></section>
 <div class="cost-summary">
 <section class="panel"><div class="panel-title-row"><h2 class="section-title">2 · Estimated responsibility</h2></div><div class="panel-content">
   <span class="cost-total-label">${escapeCost(title)}</span><div class="cost-total">${escapeCost(figure)}</div>
   <p class="helper">${showTotal?'Conditional covered-service calculation using staff-entered inputs only. Not a verified patient responsibility, final price or collected amount.':'Required charges or cost-share inputs remain missing. Known items do NOT support a full surgery estimate.'}</p>
   ${showTotal?`<p class="cost-tiny">Core items priced: ${result.components.filter(x=>x.required&&x.patientShare!==null).length}. Optional charges excluded unless priced. Exact final claim depends on eligibility, network, paid claims, authorization and medical necessity.</p>`:''}
 </div></section>
 <section class="panel"><div class="panel-title-row"><h2 class="section-title">Estimate completeness</h2></div><div class="panel-content">
  ${overview.map(x=>`<p class="cost-stat">${escapeCost(x)}</p>`).join('')}
  <p class="helper">A $0 copay is not proof the service is covered. Annual caps may not apply to out-of-network, uncovered, pharmacy or nonessential services.</p>
 </div></section>
 </div>
 <section class="panel cost-components"><div class="panel-title-row"><h2 class="section-title">3 · Component-by-component estimate</h2><span class="pill neutral">${value.items.length} charge components</span></div><div class="panel-content">
   <p class="helper">Enter actual payer-allowed amounts rather than charges from a public chargemaster. For facility and implant components, confirm bundled vs separately payable amounts to prevent double counting. Select the cost share that applies to each bill.</p>
   ${itemInputs}
 </div></section>
 <section class="panel cost-sources"><div class="panel-title-row"><h2 class="section-title">4 · Insurance and facility sources</h2></div><div class="panel-content">
   ${facility?.sourceUrl?`<div class="cost-source-row"><strong>${escapeCost(facility.name)}</strong><p>${escapeCost(facility.note)}</p><a class="source-link" href="${escapeCost(facility.sourceUrl)}" target="_blank" rel="noopener noreferrer">Hospital rate / estimate source</a></div>`:
      `<p class="helper">Choose the exact facility and plan; an anonymous hospital MRF does not tell us the patient's bill.</p>`}
   ${external.facts.map(x=>`<div class="cost-source-row"><strong>${escapeCost(x.title)}</strong><p>${escapeCost(x.note)}</p><a class="source-link" href="${escapeCost(x.url)}" target="_blank" rel="noopener noreferrer">Official benefits and rule source</a>
       ${x.partBDeductible?`<p class="cost-tiny">2026 Part B deductible: $${x.partBDeductible}; usual coinsurance: ${x.usualPartBCoinsurancePercent}% · Part A inpatient deductible: $${x.partADeductible} per benefit period</p>`:''}
       ${x.individualFederalCeiling?`<p class="cost-tiny">Federal statutory annual maximum: $${x.individualFederalCeiling.toLocaleString()} individual. This is NOT the selected plan’s remaining OOP balance.</p>`:''}
     </div>`).join('')}
   ${external.tools.filter(x=>x.payers.length>0).map(x=>`<div class="cost-source-row"><strong>${escapeCost(x.title)}</strong><p>${escapeCost(x.note)}</p><a class="source-link" href="${escapeCost(x.url)}" target="_blank" rel="noopener noreferrer">Official cost tool</a></div>`).join('')}
   <details class="cost-additional"><summary>More hospital and payer rate sources</summary>
    ${external.tools.filter(x=>x.payers.length===0).map(x=>`<div class="cost-source-row"><strong>${escapeCost(x.title)}</strong><p>${escapeCost(x.note)}</p><a class="source-link" href="${escapeCost(x.url)}" target="_blank" rel="noopener noreferrer">Official reference</a></div>`).join('')}
   </details>
 </div></section>
 <section class="panel cost-gaps"><div class="panel-title-row"><h2 class="section-title">5 · Outstanding checks</h2><span class="pill neutral">${result.messages.length} warnings</span></div><div class="panel-content">
  ${result.missingRequired.length?`<h3>Unpriced mandatory services</h3><ul>${result.missingRequired.map(x=>`<li>${escapeCost(x.label)}: ${escapeCost(x.reason)}</li>`).join('')}</ul>`:''}
  <ul>${result.messages.map(m=>`<li>${escapeCost(m)}</li>`).join('')}</ul>
  <p class="helper">For patient-specific quotes, obtain an insurer benefit response, a dated allowed/contract rate for each facility and professional, any secondary coverage, and a financial counselor's review. An uninsured/self-pay patient may be entitled to a formal Good Faith Estimate.</p>
 </div></section>`;
};
