import {KERAGON_LINKS,KERAGON_MODMED_SETUP_EMAIL,keragonPaRoute} from '../shared/keragon-pa.mjs';

const h=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safeUrl=value=>{
 const raw=String(value??'');
 if(raw===KERAGON_MODMED_SETUP_EMAIL)return raw;
 try {
   const u=new URL(raw);
   const allowed=new Set(['app.keragon.com','help.keragon.com','www.keragon.com','www.modmed.com']);
   return u.protocol==='https:'&&allowed.has(u.hostname)&&u.username===''&&u.password===''?u.href:null;
 }catch{return null;}
};
const link=(href,label)=>{
 const url=safeUrl(href);
 if(!url)return '';
 return '<a href="'+h(url)+'"'+(url.startsWith('mailto:')?'':' target="_blank" rel="noopener noreferrer"')+'>'+h(label)+'</a>';
};
export function renderKeragonPaPanel(ctx,{benefit='Medical',requestType='Initial'}={}){
 const route=keragonPaRoute(ctx,{benefit,requestType});
 if(!route)return '';
 return '<section class="staff-vendor-pa staff-keragon-pa" aria-label="Keragon authorization workflow handoff">'+
  '<div class="staff-rate-heading"><strong>Keragon authorization workflow</strong><small>Blueprint only · no active payer submission</small></div>'+
  '<div class="staff-answer"><strong>Recommended lane</strong><span>'+h(route.headline)+'</span></div>'+
  '<p class="helper">'+h(route.description)+'</p>'+
  '<ol class="staff-vendor-steps">'+route.steps.map(x=>
    '<li><strong>'+h(x.title)+'</strong> <small>'+h(x.mode)+'</small>'+
    '<p>'+h(x.detail)+'</p>'+(x.url?link(x.url,'Connector documentation'):'')+'</li>').join('')+'</ol>'+
  '<p class="notice amber"><strong>No live connection:</strong> '+h(route.connectionStatus)+' '+h(route.warning)+'</p>'+
  '<div class="local-buttons"><button class="button primary" data-action="staff-keragon-blueprint">Copy workflow instructions for Keragon</button>'+
  link(KERAGON_LINKS.app,'Open Keragon workspace')+'</div>'+
  '<p class="helper">The copy action uses only the selected public payer/plan category and service, never member identifiers or clinical notes. Paste into Keragon’s AI workflow builder and review all steps before enabling.</p>'+
  '<details class="staff-vendor-details"><summary>Keragon setup checklist — administrator</summary>'+
  '<p><strong>1. ModMed FHIR connector:</strong> Ask ModMed Practice Solutions to enable Keragon. Obtain the firm URL prefix, FHIR username and FHIR password from ModMed; connect through Keragon Authentication, not through Coverage Desk. Verify enabled resource scopes (Coverage, ServiceRequest, Encounter and any other needed reads). ServiceRequest access is read/search; it is not an authorization-result writeback.</p>'+
  '<p>'+link(KERAGON_MODMED_SETUP_EMAIL,'Prepare ModMed activation email')+' · '+link(KERAGON_LINKS.modmedSetup,'Official Keragon–ModMed setup')+'</p>'+
  '<p><strong>2. Eligibility:</strong> Configure the TriZetto insurance eligibility action and exact payer IDs only after appropriate account authorization. Eligibility does not prove deductible remaining or negotiated allowed fees.</p>'+
  '<p>'+link(KERAGON_LINKS.trizetto,'TriZetto eligibility connector')+'</p>'+
  '<p><strong>3. Prior auth:</strong> Verify Optum authorization create, status and determination actions for each relevant Hawaiʻi payer, benefit, CPT/HCPCS and medication. Unsupported transactions must use the official payer portal or existing ModMed ePA.</p>'+
  '<p>'+link(KERAGON_LINKS.optum,'Optum authorization connector')+' · '+link(KERAGON_LINKS.modmedEpa,'ModMed ePrescribing / ePA')+'</p>'+
  '<p><strong>4. Security:</strong> Confirm Keragon BAA, ModMed interfaces, TriZetto/Optum agreements, MFA, scopes, unique users, approval before submission, logging and exception handling. Do not enter patient information here or create unverified callback endpoints.</p>'+
  '<p>'+link(KERAGON_LINKS.october,'Keragon October 2026 connector release')+' · '+
  link(KERAGON_LINKS.httpClient,'Keragon custom HTTP action')+' · '+link(KERAGON_LINKS.webhook,'Keragon webhook setup')+'</p>'+
  '</details></section>';
}
