import {orthoCategories,orthoPayers,orthoLines,orthoSettings,orthoRequestTypes,orthoProcedures,orthoGelProducts,orthoSourceKinds,getOrthoProcedure,getOrthoActiveCriteria,orthoAuthorizationSnapshot} from '../shared/orthopedic-procedures.mjs';
const escapeHtml=function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));};
const selectionOptions=function selectionOptions(list,current){return list.map(v=>`<option value="${escapeHtml(v)}" ${v===current?'selected':''}>${escapeHtml(v)}</option>`).join('');};
export function renderOrthopedicPage(selection,category='injections'){
 const selected=getOrthoProcedure(selection.procedureId)||orthoProcedures[0];
 const snapshot=orthoAuthorizationSnapshot(selection);
 const activeCriteria=getOrthoActiveCriteria(selection);
 const filtered=orthoProcedures.filter(p=>p.category===category);
 const gel=selected.id==='knee-gel';
 return `<div class="page-heading"><div><span class="eyebrow">ORTHOPEDIC MEDICAL PROCEDURES</span><h1>Procedure authorizations</h1><p class="subtitle">Gel injections, joint replacements, MACI, carpal tunnel and sports surgery: find coding, documentation and payer policy.</p></div></div>
 <div class="notice amber ortho-banner"><strong>Synthetic trial only.</strong> No patient data, prior authorization submission, approval or eligibility checks. Checklists are a preparation aid, not a payer coverage determination.</div>
 <section class="panel ortho-selector"><div class="panel-title-row"><h2 class="section-title">Choose procedure and coverage</h2><span class="pill neutral">Medical benefit</span></div><div class="panel-content">
 <div class="ortho-form-grid">
  <label>Procedure category<select id="ortho-category">${orthoCategories.map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===category?'selected':''}>${escapeHtml(p.label)}</option>`).join('')}</select></label>
  <label>Procedure<select id="ortho-procedure">${filtered.map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===selected.id?'selected':''}>${escapeHtml(p.name)}</option>`).join('')}</select></label>
  <label>Payer / administrator<select id="ortho-payer">${selectionOptions(orthoPayers,selection.payer)}</select></label>
  <label>Coverage line<select id="ortho-line">${selectionOptions(orthoLines,selection.line)}</select></label>
  <label>Service setting<select id="ortho-setting">${selectionOptions(orthoSettings,selection.setting)}</select></label>
  <label>Request stage<select id="ortho-request-type">${selectionOptions(orthoRequestTypes,selection.requestType)}</select></label>
 </div>
 ${gel?`<div class="ortho-form-grid ortho-gel-fields">
   <label>Gel injection product<select id="ortho-gel"><option value="">Choose a brand to see J-code</option>${orthoGelProducts.map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===selection.gelProductId?'selected':''}>${escapeHtml(p.name)} — ${escapeHtml(p.code)}</option>`).join('')}</select></label>
   <label>Administration<select id="ortho-guidance"><option value="without-ultrasound" ${selection.guidance==='without-ultrasound'?'selected':''}>Without ultrasound · 20610</option><option value="with-ultrasound" ${selection.guidance==='with-ultrasound'?'selected':''}>With ultrasound · 20611 (when supported)</option></select></label>
  </div>`:''}
 <label class="ortho-plan-label">Plan or employer product name (NOT member ID)<input id="ortho-plan-label" maxlength="80" autocomplete="off" placeholder="e.g., HMSA Choice commercial" value="${escapeHtml(selection.planLabel)}"></label>
 <p class="helper">${escapeHtml(selected.description)} ${escapeHtml(selected.notes)}</p></div></section>
 <div class="ortho-summary-grid">
  <section class="panel"><div class="panel-title-row"><h2 class="section-title">Possible CPT / HCPCS</h2></div><div class="panel-content">
   ${snapshot.codes.length?`<div class="ortho-code-list">${snapshot.codes.map(x=>`<div class="ortho-code"><strong>${escapeHtml(x.code)}</strong><span>${escapeHtml(x.type)} · ${escapeHtml(x.label)}</span></div>`).join('')}</div>`:'<p class="notice amber">No verified CPT/HCPCS code for this technique. Obtain device- and payer-specific guidance before coding.</p>'}
   <p class="helper">Coding is provisional. Verify units, modifiers, side, year, setting and medical product separately. Do not use every displayed alternative together.</p>
  </div></section>
  <section class="panel"><div class="panel-title-row"><h2 class="section-title">Authorization status</h2></div><div class="panel-content">
   <p><strong>Coverage:</strong> Unknown / unverified</p><p><strong>Prior authorization:</strong> Not verified for exact plan, code and setting</p><p><strong>Clinical criteria:</strong> Current policy and clinician review required</p>
   <p class="helper">${snapshot.missing.length} documentation categories still unmarked.</p>
  </div></section>
 </div>
 <section class="panel ortho-checklist"><div class="panel-title-row"><h2 class="section-title">Documentation preparation</h2><span class="pill neutral">${activeCriteria.length-snapshot.missing.length}/${activeCriteria.length} located</span></div><div class="panel-content">
 <p class="helper">Mark that a supporting record is located. This does NOT establish that the policy criterion is satisfied.</p>
 <div class="ortho-check-rows">${activeCriteria.map(c=>`<label class="ortho-check-row"><input type="checkbox" data-ortho-check="${escapeHtml(c.id)}" ${selection.checks[c.id]===true?'checked':''}><span><strong>${escapeHtml(c.label)}</strong><small>${escapeHtml(c.help)}</small></span></label>`).join('')}</div>
 </div></section>
 <section class="panel ortho-sources"><div class="panel-title-row"><h2 class="section-title">Public payer policy and routing sources</h2><span class="pill neutral">${snapshot.sources.length} source(s)</span></div><div class="panel-content">
 <p class="helper">These are official payer links or clearly labeled coding references. A source match does not prove whether a specific member needs prior authorization.</p>
 ${snapshot.sources.length?snapshot.sources.map(x=>`<article class="ortho-source-entry"><div><strong>${escapeHtml(x.title)}</strong><span class="pill neutral">${escapeHtml(orthoSourceKinds[x.kind])}</span></div><p>${escapeHtml(x.note)}</p><a class="source-link" href="${escapeHtml(x.url)}" target="_blank" rel="noopener noreferrer">Open source</a></article>`).join(''):'<p class="notice amber">No current payer-specific public source cataloged for this combination. Manual review required.</p>'}
 </div></section>
 <section class="panel ortho-gaps"><div class="panel-title-row"><h2 class="section-title">Outstanding authorization checks</h2><span class="pill neutral">${snapshot.blockers.length} blockers</span></div><div class="panel-content">
 <ul>${snapshot.blockers.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
 <div class="local-buttons"><button class="button secondary" data-action="ortho-gaps">Download gap checklist</button><button class="button primary" data-action="ortho-outline">Download synthetic packet outline</button></div>
 <p class="helper">Not a clinician-signed letter or prior authorization submission. No PHI is accepted. Current exact-plan policy and medical documentation must be reviewed separately.</p>
 </div></section>`;
}
