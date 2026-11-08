// Keragon-first staff orchestration plan. No patient identifiers, API credentials,
// vendor calls, payer submissions, or status writeback occur in this trial.
export const KERAGON_LINKS=Object.freeze({
  app:'https://app.keragon.com',
  modmedSetup:'https://help.keragon.com/hc/en-us/articles/26577409886098-ModMed',
  modmedConnector:'https://www.keragon.com/integrations/modmed',
  trizetto:'https://www.keragon.com/integrations/trizetto',
  optum:'https://www.keragon.com/integrations/optum',
  october:'https://help.keragon.com/hc/en-us/articles/40377130429842-October-2026',
  httpClient:'https://help.keragon.com/hc/en-us/articles/19894107858578-How-to-use-the-HTTP-Client-action-to-make-custom-API-requests',
  webhook:'https://help.keragon.com/hc/en-us/articles/26592306434578-Using-the-HTTP-Webhook-Trigger',
  modmedEpa:'https://www.modmed.com/what-we-do/eprescribing/'
});
export const KERAGON_MODMED_SETUP_EMAIL='mailto:practicesolutions@modmed.com?subject=Pacific%20Bone%20%26%20Joint%20-%20enable%20Keragon%20ModMed%20FHIR%20integration&body=Aloha%2C%0A%0APlease%20confirm%20whether%20Pacific%20Bone%20%26%20Joint%20has%20an%20active%20Keragon%20interface%20in%20ModMed%20EMA.%20If%20not%2C%20please%20provide%20the%20integration%20order%20and%20approved%20FHIR%20scopes%20needed%20for%20Coverage%2C%20Encounter%2C%20ServiceRequest%2C%20MedicationStatement%2C%20Appointment%20and%20patient%20lookup.%20Please%20confirm%20fees%2C%20read%2Fwrite%20restrictions%20and%20approved%20credential%20delivery%20to%20Keragon.%0A%0AMahalo%2C%0APacific%20Bone%20%26%20Joint';
const step=(id,title,mode,detail,url=null)=>Object.freeze({id,title,mode,detail,url,connected:false});
const shared=Object.freeze([
  step('modmed-context','ModMed chart and coverage context','Keragon ModMed connector; approved scopes required',
    'Use verified Coverage, ServiceRequest, Encounter, Appointment and Patient resources as permitted; MedicationStatement is not an e-prescription order.',KERAGON_LINKS.modmedSetup),
  step('eligibility','Check current eligibility','Keragon TriZetto action; optional, not yet activated',
    'Submit exact payer/member eligibility only inside Keragon after approved access. A 270/271 response does not prove PA necessity, remaining deductible, allowed price or payment.',KERAGON_LINKS.trizetto),
  step('plan-scope','Match actual plan and benefit','Staff review required',
    'Match carrier, program, member product, group, delegated authorizer and medical versus pharmacy benefit. Never route an HMSA member through VA or another carrier.')
]);
const make=(lane,headline,description,steps,warning)=>Object.freeze({
 lane,headline,description,steps:Object.freeze(steps),warning,
 activated:false,connectionStatus:'Blueprint only — Keragon/ModMed/Optum/TriZetto connections and payer access not verified.'
});
export function keragonPaRoute(ctx,{benefit='Medical',requestType='Initial'}={}){
 if(!ctx?.plan||!ctx?.service)return null;
 if(!['Medical','Pharmacy'].includes(benefit))throw Error('Choose Medical or Pharmacy benefit.');
 const {plan,service}=ctx;
 const pharmacy=service.type==='medication'&&benefit==='Pharmacy';
 const invalid=(plan.program==='part-d'&&!pharmacy)||
   (plan.program==='original-medicare'&&benefit==='Pharmacy')||
   plan.payer==='Medigap'||plan.program==='delegated';
 if(invalid)return make('verify-benefit','Stop: identify the actual benefit and payer first',
   'Keragon must not submit requests when this selection is an administrator, supplemental payer, or mismatched medical/pharmacy benefit.',
   [step('resolve','Resolve primary coverage','HOLD — no automation or submission',
     'For MDX or other delegates identify the underwriting plan and PA owner; for Original Medicare pharmacy identify the separate PDP; Part D does not authorize surgery.')],
   'Do not substitute plan-family links for verified member enrollment or send to a guessed payer.');
 if(plan.program==='veterans'||plan.program==='military'||plan.payer==='Workers compensation')
   return make('program-specific','Use the confirmed referral or claim administrator',
     'Keragon can organize tasks and reminders, but VA, TRICARE and workers-comp authorizations require the actual approved referral/claim route.',
     [...shared,step('program','Review program-specific instructions','Staff-controlled channel',
       'Confirm referral authorization, claim acceptance, condition, authorized site and applicable records before submitting.')],
     'Optum authorization and TriZetto eligibility are not assumed to handle this program.');
 if(pharmacy)return make('pharmacy','Keragon coordinates; ModMed ePA remains the prescription channel',
   'Use ModMed e-prescribing ePA/RTPB if the member PBM supports it. Keragon can queue document collection and follow-ups; its ModMed MedicationStatement access does not mean retail ePA submission.',
   [...shared,
     step('formulary','Verify the exact drug/strength and PBM formulary','Payer/PBM source; no universal Keragon formulary',
       'Use a verified pharmacy plan record or actual PBM source. Tier, PA/ST/QL and member copay remain unknown until confirmed.'),
     step('epa','Use ModMed EMA ePA or an approved PBM portal','Staff-reviewed; not a Keragon medication PA API',
       'Do not send via Optum merely because the connector is available; PBM participation and retail ePA transaction support must be confirmed.',KERAGON_LINKS.modmedEpa),
     step('track','Track PA reference, response and appeal in Keragon','Only after a real payer confirmation',
       'Schedule staff follow-up; record the real decision and reviewer. Never infer approval from a workflow run.')
   ],
   requestType==='Reconsideration / appeal'?'Use actual denial language, appeal rights and payer deadline; no automated medical-necessity decision.':'A pharmacy formulary or ePA status does not establish medical-benefit coverage or patient surgical cost.');
 if(service.type==='medication'||service.id==='knee-gel')return make('medical-drug','Keragon coordinates medical-benefit drug / gel requests',
   'Verify the HCPCS/J-code, units, route, site and medical policy before selecting a supported payer authorization endpoint.',
   [...shared,
     step('medical-policy','Check buy-and-bill product rules','Plan-specific medical criteria and product preference',
       'For Prolia/Evenity, gel and other injectables, check exact J-code/NDC, amount, preferred alternatives, injection administration and limits. Pharmacy tier is not proof of medical coverage.'),
     step('optum','Optum PA create / status / determination','Only if this payer and product are supported; disabled pending verification',
       'Keragon lists all three Optum actions. Confirm actual PA transaction route for the insurer/plan and whether the specific drug and site are accepted; otherwise use payer portal.',KERAGON_LINKS.optum),
     step('review','Clinical review, submit and monitor','Human approval required before any outbound request',
       'Document chart evidence, policy version, submitted reference, additional-information requests, actual decision and expiration.')
   ],
   'No payer support map, clinical necessity determination, member copay or PA approval is returned by this trial.');
 return make('procedure','Keragon coordinates orthopedic procedure authorizations',
   'Use the existing procedure criteria and exact payer/delegate route; Keragon may use Optum actions only for supported medical PA transactions.',
   [...shared,
     step('procedure-policy','Check CPT/HCPCS and site-of-service','Insurer / delegated medical authorizer',
       'Confirm procedure, laterality, office/ASC/inpatient setting, facility and surgeon identities, and whether separate professional/facility authorizations are needed.'),
     step('optum','Optum authorization create / status / determination','Conditional payer coverage; no live account connection',
       'Only after checking this exact insurer, plan and surgical CPT for an accepted route. Otherwise keep the payer-specific portal/RCM submission.',KERAGON_LINKS.optum),
     step('approval','Review evidence; submit and track decision','Human clinical/billing approval required',
       'Collect records and signed rationale, resolve missing criteria, then track real confirmation, decision dates and expiration; escalate stalled requests.')
   ],
   'Keragon exposes an Optum PA action, not a guarantee that all Hawaiʻi surgeries, CPTs or carriers are supported.');
}
export function keragonBuildPrompt(ctx,{benefit='Medical',requestType='Initial'}={}){
 const route=keragonPaRoute(ctx,{benefit,requestType});
 if(!route)throw Error('Choose a payer-owned plan and service first.');
 const {plan,service}=ctx;
 const steps=route.steps.map((x,i)=>(i+1)+'. '+x.title+': '+x.detail);
 return [
   'Create a DRAFT workflow in Keragon for Pacific Bone & Joint. DO NOT publish, submit a PA, text a patient, or transmit PHI until an administrator has completed HIPAA/BAA, scopes, payer access, audit and human-approval checks.',
   'Only use synthetic sample records while designing and testing this workflow.',
   'Selected public context: '+plan.payer+' | '+plan.name+' | '+service.name+' | '+benefit+' benefit | '+requestType+'. These labels do not prove an actual member is enrolled.',
   'Required lane: '+route.lane+'. '+route.headline+'.',
   'Start from an approved ModMed Coverage created/updated or ServiceRequest created/updated trigger (if available) or a manual authorization work queue. Use only approved FHIR resources and scopes; medication statements are NOT medication prescription orders.',
   'In Keragon, use a verified TriZetto eligibility request only when the actual payer and active credentials support it. Route unknown eligibility to staff; do not infer coinsurance or out-of-pocket accumulators.',
   'Check the exact insurer, plan year, delegated PA service, medical/pharmacy benefit, HCPCS/CPT or NDC, site and prior auth requirements against current documented payer sources. Do not use another insurer’s rules.',
   'Suggested steps:',
   ...steps,
   'Create staff tasks for missing documents; require explicit physician/PA clinical review and billing approval before ANY outbound payer authorization request.',
   'Use Keragon Optum Create authorization request / Get authorization status / Get authorization determination only if the payer, specific transaction and procedure/product are supported and approved; otherwise send staff to the verified payer portal or existing ModMed ePA as appropriate.',
   'Record only payer-verified confirmation and determination. Use states: needs coverage verification, gathering evidence, ready for review, approved to submit, submitted, pending, additional information, approved, denied, appeal, expired.',
   'Add idempotency, duplicate checking, authenticated callbacks, privacy-preserving logging and an exception queue with a designated human owner. Escalate unmatched payer, missing scope, expired policy, missing chart evidence, denials and timeouts.',
   'Patient estimate is a separate reviewed task: obtain verified member deductible/OOP remaining and actual surgeon/facility/anesthesia/product allowed amounts. Never use a public machine-readable hospital price as a member quote.',
   'Never export credentials, full medical records, claims identifiers or patient details to this synthetic Coverage Desk app. Do not pretend ModMed writeback or an automated decision endpoint exists if not shown in the connector.',
   'Produce a visual draft workflow, its missing credential/scope checklist and manual test plan; keep all live triggers and actions disabled until a human signs off.'
 ].join('\n');
}
