import {staffGetPlan,staffPlanProgramLine} from '../shared/staff-workflow.mjs';
import {payerEvidenceFor,payerVerificationWorksheet} from '../shared/payer-policy-evidence.mjs';
import {AUTH_TEMPLATE_CATALOG,authTemplateForService,findAuthTemplate,renderAuthTemplateNote} from '../shared/authorization-template-catalog.mjs';
import {resolveFulfillment,fulfillmentChecklist} from '../shared/fulfillment-policy.mjs';
import {prepareAuthorizationPacket,renderAuthorizationPreflightSummary} from '../shared/authorization-packet-preflight.mjs';
import {documentationBranchesFor} from '../shared/payer-documentation-branches.mjs';
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selectedClinicalTemplate(state){
 return state.clinicalTemplateId?findAuthTemplate(state.clinicalTemplateId):authTemplateForService(state.serviceId,state.gelProductId);
}
export function staffVerificationScope(state){
 const template=selectedClinicalTemplate(state);
 return {payer:state.payer,planId:state.planId,line:staffPlanProgramLine(staffGetPlan(state.payer,state.planId,state.year||2026)),benefit:state.benefit,
  productId:template?.id,setting:state.setting||'Office',state:'HI',serviceDate:state.serviceDate,medication:!!template&&template.category!=='surgery'};
}
export function staffVerificationWorksheet(state){return payerVerificationWorksheet(staffVerificationScope(state));}
export function staffClinicalAddendum(state){
 const template=selectedClinicalTemplate(state);
 if(!template)throw new Error('Choose a clinical template first');
 // Blank export by design: clinical findings must be entered in an approved system.
 return renderAuthTemplateNote(template.id,{}, {plan:state.payer&&state.planId?state.payer+' / '+state.planId+' (member product not verified)':'[NOT VERIFIED]',date:state.serviceDate||'[DATE NOT SELECTED]'});
}
export function renderClinicalAddendumPanel(state){
 const template=selectedClinicalTemplate(state);
 const scope=staffVerificationScope(state);
 const fulfillment=resolveFulfillment(scope);
 const refs=payerEvidenceFor(scope);
 const branches=documentationBranchesFor(refs.map(r=>r.id),state.requestType||'Initial');
 // No unverified reference documents are promoted into authoritative criteria.
 const packet=prepareAuthorizationPacket({templateId:template?.id,policyRequest:{
   payer:scope.payer,planId:scope.planId,line:scope.line,
   serviceId:state.serviceId,serviceDate:scope.serviceDate,policies:[]
 }});
 return `<section class="panel staff-stage" id="staff-clinical-addendum"><div class="panel-title-row"><h2 class="section-title">Clinical addendum & medication supply review</h2></div><div class="panel-content">
 <p class="notice amber"><strong>Synthetic only — not for submission.</strong> Print a blank product-specific or procedure-specific addendum to complete in an approved clinical system. No patient information or clinical findings are entered here.</p>
 <label>Clinical template library<select id="staff-clinical-template"><option value="">Use selected treatment (choose a gel brand when applicable)</option>${AUTH_TEMPLATE_CATALOG.map(t=>`<option value="${h(t.id)}" ${state.clinicalTemplateId===t.id?'selected':''}>${h(t.name)}</option>`).join('')}</select></label>
 <label>Planned service date (policy context only)<input type="date" id="staff-service-date" value="${h(state.serviceDate||'')}"></label>
 ${template?`<h3>${h(template.name)}</h3><p class="helper">${h(template.notes)} Candidate codes: ${h(template.codes.join(', ')||'Coding determination required')}.</p><details><summary>Preview blank clinical addendum (${template.fields.length} fields)</summary><pre class="clinical-template-preview">${h(staffClinicalAddendum(state))}</pre></details><div class="local-buttons"><button class="button secondary" data-action="staff-print-addendum">Print / Save addendum as PDF</button><button class="button secondary" data-action="staff-download-addendum">Download blank clinical addendum</button></div>`:'<p class="helper">Choose a supported treatment or a template from the library.</p>'}
 <section id="staff-auth-preflight"><h3>Authorization packet preflight</h3>
 <p class="notice amber"><strong>${h(packet.status)} — not cleared for submission.</strong> The clinical template is available, but no verified exact-plan authorization criteria or patient-specific evidence have been loaded.</p>
 <div class="staff-answer"><strong>Clinical documentation</strong><span>${h(packet.clinical?.status||"Select a template")}${packet.clinical?.missing?.length?" · "+packet.clinical.missing.length+" fields to document":""}</span></div>
 <div class="staff-answer"><strong>Exact-plan payer criteria</strong><span>${h(packet.payer?.status||"blocked")} · no verified plan policy loaded</span></div>
 <details><summary>Missing clinical fields and authorization blockers</summary>
 <ul>${(packet.clinical?.missing||[]).map(x=>`<li>${h(x.label)}</li>`).join("")}
 ${(packet.payer?.missing||[]).map(x=>`<li>${h(typeof x==="string"?x:x.label)}</li>`).join("")}
 ${packet.blockers.map(x=>`<li>${h(x)}</li>`).join("")}</ul>
 <pre class="clinical-template-preview">${h(renderAuthorizationPreflightSummary(packet))}</pre></details>
 <p class="helper">This is a synthetic checklist preview. Clinical findings and patient records must remain in an approved clinical system; selecting checkboxes elsewhere does not satisfy payer criteria.</p>
 </section>
 <section id="staff-policy-evidence"><h3>Source verification and exact-plan adoption</h3>
 <p><strong>Exact-plan adoption: NOT VERIFIED.</strong> Public document retrieval does not confirm the member's plan, benefits or supply permissions.</p>
 ${refs.length?refs.map(s=>`<details class="payer-evidence-entry"><summary>${h(s.title)} · ${h(s.version)}</summary><p>${h(s.summary)}</p><p>${h(s.limitations)}</p><p class="helper">${h(s.locator)}. Snapshot reviewed ${h(s.retrievedAt)}; ${s.reviewOverdue?'REVIEW OVERDUE':'plan applicability unverified'}. ${s.versionConfirmationRequired?'Current guideline version requires confirmation.':''}</p><p class="helper policy-fingerprint">Document fingerprint: ${h(s.sourceSha256)}</p><a class="source-link" href="${h(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open authoritative source / directory</a></details>`).join(''):'<p class="helper">Select a valid service date, plan and treatment. If no reference matches, obtain the exact payer policy.</p>'}
 <details class="staff-sources"><summary>Source-linked documentation prompts (${branches.length})</summary>
 <p class="helper">Research aids only: the exact member plan has not been confirmed to adopt these criteria. Verify the current policy before submission.</p>
 ${branches.map(b=>`<section class="payer-evidence-entry"><strong>${h(b.title)}</strong><ul>${b.fields.map(f=>`<li>${h(f.label)}</li>`).join("")}</ul><p class="helper">${h(b.notes)}</p></section>`).join("")||"<p>No matching branch for this request type; review the source policy manually.</p>"}
 </details>
 <div class="local-buttons"><button class="button secondary" data-action="staff-print-verification">Print payer verification worksheet</button></div></section>
 <h3>Supply route: ${h(fulfillment.path)} / ${fulfillment.verified?'policy verified':'unverified'}</h3>
 <p><strong>Ordering blocked.</strong> No verified exact-plan procurement policy is loaded. A formulary result or completed checklist cannot authorize purchasing, dispensing or shipment.</p>
 <ul>${fulfillment.blockers.map(x=>`<li>${h(x)}</li>`).join('')}</ul>
 <details><summary>Buy-and-bill versus specialty pharmacy checks</summary><ul>${fulfillmentChecklist(fulfillment).map(x=>`<li>${h(x)}</li>`).join('')}</ul><p>Buy-and-bill requires provider acquisition and drug reimbursement verification. Specialty pharmacy requires the designated supplier, permitted delivery route and administration-only versus drug billing review. If either route is allowed, select one and prevent duplicate drug claims.</p></details>
 </div></section>`;
}
