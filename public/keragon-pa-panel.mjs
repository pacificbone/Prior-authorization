import {KERAGON_LINKS, PRACTICE_CONNECTIVITY, CONNECTIVITY_LABELS, CONNECTIVITY_STATUS_LABELS, VENDOR_CLAIMS_AS_OF, keragonPaRoute} from '../shared/keragon-pa.mjs';

const h=value=>String(value??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const allowUrl=value=>{
 try{
  const u=new URL(String(value||''));
  return u.protocol==='https:'&&
    ['app.keragon.com','help.keragon.com','www.keragon.com',
     'www.trizettoprovider.com','www.modmed.com'].includes(u.hostname)&&
    !u.username&&!u.password?u.href:null;
 }catch{return null;}
};
const link=(href,label)=>{
 const url=allowUrl(href);
 return url?'<a href="'+h(url)+'" target="_blank" rel="noopener noreferrer">'+h(label)+'</a>':'';
};
export function renderKeragonPaPanel(ctx,{benefit='Medical',requestType='Initial'}={}){
 const route=keragonPaRoute(ctx,{benefit,requestType});
 if(!route)return '';
 const medical=route.lane==='medical-drug'||route.lane==='procedure';
 const status=Object.entries(PRACTICE_CONNECTIVITY).map(([k,v])=>'<tr><td>'+h(CONNECTIVITY_LABELS[k]||k)+'</td><td>'+h(CONNECTIVITY_STATUS_LABELS[v]||v)+'</td></tr>').join('');
 return '<section class="staff-vendor-pa staff-keragon-pa" aria-label="Keragon authorization workflow plan (existing systems; authorization connection not verified)">'+
  '<div class="staff-rate-heading"><strong>Keragon authorization workflow plan</strong><small>Existing systems · authorization connection not verified</small></div>'+
  '<div class="table-scroll"><table class="staff-connectivity"><thead><tr><th>Connection</th><th>Status</th></tr></thead><tbody>'+status+'</tbody></table></div>'+
  '<p class="helper">Vendor capability statements below are as published on '+h(VENDOR_CLAIMS_AS_OF)+' and have not been re-verified since; they are not fingerprinted like payer policies.</p>'+
  '<p class="helper"><strong>Already in use (reported by PBJ):</strong> Keragon ↔ ModMed, and TriZetto for clearinghouse/billing. No need to buy or reconnect ModMed just to plan this workflow. Exact scopes, Keragon-to-TriZetto actions and payer access still require verification.</p>'+
  '<div class="staff-answer"><strong>What to check first</strong><span>'+h(route.headline)+'</span></div>'+
  '<p class="helper">'+h(route.description)+'</p>'+
  '<ol class="staff-vendor-steps">'+route.steps.map(s=>
     '<li><strong>'+h(s.title)+'</strong> <small>'+h(s.mode)+'</small>'+
     '<p>'+h(s.detail)+'</p>'+(s.url?link(s.url,'Official product information'):'')+'</li>'
   ).join('')+'</ol>'+
  '<p class="notice amber"><strong>Current boundary:</strong> '+h(route.connectionStatus)+' '+h(route.warning)+'</p>'+
  '<div class="local-buttons"><button class="button secondary" data-action="staff-keragon-blueprint">Copy Keragon workflow instructions</button>'+
  link(KERAGON_LINKS.app,'Open Keragon workspace')+'</div>'+
  '<p class="helper">The blueprint contains only public payer/plan categories and the selected procedure or medication. No patient charts, credentials, member IDs, or real submissions leave this trial.</p>'+
  '<details class="staff-vendor-details"><summary>Use existing connections — administrator checklist</summary>'+
  '<p><strong>1. Keragon–ModMed:</strong> Already linked according to PBJ. Confirm the existing connection and permissions for Coverage, Encounter and ServiceRequest; do not open another integration or request credentials. ModMed ServiceRequest availability does not establish chart-note writeback or electronic PA filing.</p>'+
  '<p>'+link(KERAGON_LINKS.modmedConnector,'Keragon ModMed connector')+' · '+link(KERAGON_LINKS.httpClient,'Keragon HTTP client action')+' · '+link(KERAGON_LINKS.webhook,'Keragon webhook trigger')+'</p>'+
  '<p><strong>2. TriZetto:</strong> Already used for billing/clearinghouse, but whether its Keragon eligibility action is enabled and whether PBJ has purchased/enrolled for its separate prior authorization transactions are unknown. Ask the current TriZetto account representative to confirm available eligibility transactions, 278 authorization and newer FHIR-based prior-authorization products, payer roster, API/security requirements, and existing contracted pricing.</p>'+
  '<p>'+link(KERAGON_LINKS.trizetto,'Keragon TriZetto eligibility action')+' · '+
  link(KERAGON_LINKS.trizettoPa,'TriZetto electronic prior authorization')+' · '+
  link(KERAGON_LINKS.trizettoPaServices,'TriZetto PA services')+'</p>'+
  (medical?'<p><strong>3. Medical authorizations:</strong> If TriZetto already offers the exact payer and code authorization route for PBJ, use that approved workflow. Otherwise route to the existing official payer/delegate portal while Keragon manages document checklists, status and overdue tasks. Do not assume that the Keragon TriZetto eligibility connector itself creates prior authorizations.</p>':
   '<p><strong>3. Pharmacy benefit:</strong> Use ModMed EMA ePA or the actual PBM portal. TriZetto eligibility and medical prior-auth products are not a substitute for a verified pharmacy ePA transaction.</p>')+
  '<p><strong>4. Optum is optional:</strong> Optum is a separate health technology / authorization service. Keragon publishes PA actions for Optum (as published on '+h(VENDOR_CLAIMS_AS_OF)+'), but PBJ does not need an Optum subscription or connection unless the existing TriZetto and payer paths cannot meet a defined requirement. No Optum PA action is part of this default design. '+link(KERAGON_LINKS.optum,'Keragon Optum connector')+'</p>'+
  '<p><strong>5. PHI safeguards:</strong> Validate vendor agreements and scopes, workforce roles, audit, required clinical approval and privacy-safe error handling before connecting live submission or pricing feeds. This trial remains synthetic-data-only.</p>'+
  '</details></section>';
}
