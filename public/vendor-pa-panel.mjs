import {modmedPaRoute,MODMED_PA_LINKS,SAMACARE_MODMED_SETUP_EMAIL} from '../shared/modmed-pa.mjs';

const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const safeUrl=value=>{
 const url=String(value||'');
 return /^(https:\/\/(?:help\.samacare\.com|www\.samacare\.com|www\.modmed\.com|portal\.api\.modmed\.com|www\.develophealth\.ai|docs\.develophealth\.ai)\/|mailto:practicesolutions@modmed\.com\?)/.test(url)?url:null;
};
const link=(href,label)=>{
 const url=safeUrl(href);
 if(!url)return '';
 return '<a href="'+escapeHtml(url)+'"'+(url.startsWith('mailto:')?'':' target="_blank" rel="noopener noreferrer"')+'>'+escapeHtml(label)+'</a>';
};
export function renderModmedPaPanel(ctx,{benefit='Medical',requestType='Initial'}={}){
 const route=modmedPaRoute(ctx,{benefit,requestType});
 if(!route)return '';
 return '<section class="staff-vendor-pa" aria-label="ModMed and prior authorization vendor handoff">'+
  '<div class="staff-rate-heading"><strong>ModMed authorization handoff</strong><small>Recommendation only · no live integration</small></div>'+
  '<p class="helper">Recommended route for this plan/benefit. The links below open vendor instructions, not a patient case. Never enter patient information into this trial.</p>'+
  '<p class="staff-vendor-summary"><strong>'+escapeHtml(route.headline)+'</strong> '+escapeHtml(route.description)+'</p>'+
  '<ol class="staff-vendor-steps">'+route.steps.map(s=>
    '<li><strong>'+escapeHtml(s.title)+'</strong> <small>'+escapeHtml(s.role)+'</small>'+
    '<p>'+escapeHtml(s.description)+'</p>'+(s.url?link(s.url,'Vendor / product documentation'):'')+'</li>').join('')+'</ol>'+
  '<p class="helper"><strong>Not connected:</strong> '+escapeHtml(route.connectionStatus)+' '+escapeHtml(route.caution)+'</p>'+
  '<details class="staff-vendor-details"><summary>Connect ModMed and vendors (practice administrator)</summary>'+
  '<p>SamaCare publishes a ModMed interface for demographics and document movement, including document uploads to Patient Chart &gt; Manage Attachments. Its September 2026 guide lists $20 per provider/month for the interface. This is distinct from SamaCare licensing, clinical coverage or authorization status writeback.</p>'+
  '<p>Setup: contact ModMed Practice Solutions, cc SamaCare, complete ModMed’s order form, then share API credentials via a secure channel directly with SamaCare — never paste credentials into this app or GitHub.</p>'+
  '<p>'+link(SAMACARE_MODMED_SETUP_EMAIL,'Prepare SamaCare / ModMed setup email')+' · '+link(MODMED_PA_LINKS.samacareGuide,'SamaCare official setup guide')+'</p>'+
  '<p>For pharmacy medication automation, evaluate Develop Health’s ModMed workflow or authenticated API/webhooks. Confirm read/write permission, supported PBMs, product scope, BAA, pricing, reviewer checkpoints, denial management and proven EMA outcome writeback.</p>'+
  '<p>'+link(MODMED_PA_LINKS.developModmed,'Develop Health ModMed options')+' · '+link(MODMED_PA_LINKS.developApi,'Develop Health API documentation')+'</p>'+
  '<p><strong>Launch blocker:</strong> PHI ingestion, patient/insurance data exchange, payer submission, webhook delivery and ModMed writeback require signed agreements, vendor accounts, scoped credentials, secure server storage, per-user audit, clinical validation and a security review. No new vendor endpoint is enabled here.</p>'+
  '</details>'+
  '</section>';
}