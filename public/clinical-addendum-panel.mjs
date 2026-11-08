import {AUTH_TEMPLATE_CATALOG,authTemplateForService,findAuthTemplate,renderAuthTemplateNote} from '../shared/authorization-template-catalog.mjs';
import {resolveFulfillment,fulfillmentChecklist} from '../shared/fulfillment-policy.mjs';
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selectedClinicalTemplate(state){
 return state.clinicalTemplateId?findAuthTemplate(state.clinicalTemplateId):authTemplateForService(state.serviceId,state.gelProductId);
}
export function staffClinicalAddendum(state){
 const template=selectedClinicalTemplate(state);
 if(!template)throw new Error('Choose a clinical template first');
 // Blank export by design: clinical findings must be entered in an approved system.
 return renderAuthTemplateNote(template.id,{}, {plan:state.payer&&state.planId?state.payer+' / '+state.planId+' (member product not verified)':'[NOT VERIFIED]',date:state.serviceDate||'[DATE NOT SELECTED]'});
}
export function renderClinicalAddendumPanel(state){
 const template=selectedClinicalTemplate(state);
 const fulfillment=resolveFulfillment({payer:state.payer,planId:state.planId,productId:template?.id,benefit:state.benefit,serviceDate:state.serviceDate});
 return `<section class="panel staff-stage" id="staff-clinical-addendum"><div class="panel-title-row"><h2 class="section-title">Clinical addendum & medication supply review</h2></div><div class="panel-content">
 <p class="notice amber"><strong>Synthetic only — not for submission.</strong> Print a blank product-specific or procedure-specific addendum to complete in an approved clinical system. No patient information or clinical findings are entered here.</p>
 <label>Clinical template library<select id="staff-clinical-template"><option value="">Use selected treatment (choose a gel brand when applicable)</option>${AUTH_TEMPLATE_CATALOG.map(t=>`<option value="${h(t.id)}" ${state.clinicalTemplateId===t.id?'selected':''}>${h(t.name)}</option>`).join('')}</select></label>
 <label>Planned service date (policy context only)<input type="date" id="staff-service-date" value="${h(state.serviceDate||'')}"></label>
 ${template?`<h3>${h(template.name)}</h3><p class="helper">${h(template.notes)} Candidate codes: ${h(template.codes.join(', ')||'Coding determination required')}.</p><details><summary>Preview blank clinical addendum (${template.fields.length} fields)</summary><pre class="clinical-template-preview">${h(staffClinicalAddendum(state))}</pre></details><div class="local-buttons"><button class="button secondary" data-action="staff-print-addendum">Print / Save addendum as PDF</button><button class="button secondary" data-action="staff-download-addendum">Download blank clinical addendum</button></div>`:'<p class="helper">Choose a supported treatment or a template from the library.</p>'}
 <h3>Supply route: ${h(fulfillment.path)} / ${fulfillment.verified?'policy verified':'unverified'}</h3>
 <p><strong>Ordering blocked.</strong> No verified exact-plan procurement policy is loaded. A formulary result or completed checklist cannot authorize purchasing, dispensing or shipment.</p>
 <ul>${fulfillment.blockers.map(x=>`<li>${h(x)}</li>`).join('')}</ul>
 <details><summary>Buy-and-bill versus specialty pharmacy checks</summary><ul>${fulfillmentChecklist(fulfillment).map(x=>`<li>${h(x)}</li>`).join('')}</ul><p>Buy-and-bill requires provider acquisition and drug reimbursement verification. Specialty pharmacy requires the designated supplier, permitted delivery route and administration-only versus drug billing review. If either route is allowed, select one and prevent duplicate drug claims.</p></details>
 </div></section>`;
}
