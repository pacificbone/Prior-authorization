// Keragon-first authorization WORKFLOW PLAN, not a live authorization integration.
// Practice-reported: Keragon is already linked to ModMed, and TriZetto is its
// existing billing/clearinghouse service. Neither statement proves which API
// actions, enrolled payer routes, member benefits, or HIPAA scopes are active.
export const KERAGON_LINKS=Object.freeze({
 app:'https://app.keragon.com',
 modmedSetup:'https://help.keragon.com/hc/en-us/articles/26577409886098-ModMed',
 modmedConnector:'https://www.keragon.com/integrations/modmed',
 trizetto:'https://www.keragon.com/integrations/trizetto',
 trizettoPa:'https://www.trizettoprovider.com/interoperability-solutions/trizetto-provider-electronic-prior-authorization',
 trizettoPaServices:'https://www.trizettoprovider.com/solutions/patient-engagement/prior-authorization',
 optum:'https://www.keragon.com/integrations/optum',
 october:'https://help.keragon.com/hc/en-us/articles/40377130429842-October-2026',
 httpClient:'https://help.keragon.com/hc/en-us/articles/19894107858578-How-to-use-the-HTTP-Client-action-to-make-custom-API-requests',
 webhook:'https://help.keragon.com/hc/en-us/articles/26592306434578-Using-the-HTTP-Webhook-Trigger',
 modmedEpa:'https://www.modmed.com/what-we-do/eprescribing/'
});
export const PRACTICE_CONNECTIVITY=Object.freeze({
 modmedKeragon:'practice-reported-connected',
 trizettoClearinghouse:'practice-reported-in-use',
 trizettoKeragonEligibility:'not-verified',
 trizettoElectronicPriorAuthorization:'not-verified',
 optum:'not-required-not-verified',
 coverageDeskLiveBridge:'not-connected'
});
const step=(id,title,mode,detail,url=null)=>Object.freeze({id,title,mode,detail,url,connected:false});
const modmedContext=step('modmed-context','Reuse existing Keragon–ModMed connection',
 'Practice-reported connection; FHIR scopes must still be checked',
 'Do not request another ModMed integration. Inspect the working Keragon ModMed authentication, triggers, and permitted Coverage, ServiceRequest, Encounter and Patient resources; ServiceRequest read/search is not writeback.',KERAGON_LINKS.modmedSetup);
const eligibility=step('trizetto-eligibility','Confirm TriZetto eligibility access in Keragon',
 'Existing TriZetto clearinghouse account; Keragon action activation unverified',
 'Keragon currently documents Submit eligibility request for TriZetto. Confirm account enrollment, payer IDs and response fields with the existing billing team. Clearinghouse use alone does not prove this connector is activated.',KERAGON_LINKS.trizetto);
const planScope=step('plan-scope','Match the exact payer and benefit',
 'Staff verification: enrollment, plan/product, delegate, benefit',
 'Confirm member plan, year, payer and group, pharmacy versus medical benefit, current clinical criteria, exact NDC or CPT/HCPCS, and physician/facility site. Do not cross insurers or treat a plan-family document as member eligibility.');
const trizettoPa=step('trizetto-pa','Check existing TriZetto electronic prior-auth service',
 'First vendor to evaluate; NOT part of Keragon’s published TriZetto action set',
 'TriZetto separately markets prior authorization services (including 278 and FHIR CRD/DTR/PAS). Ask whether PBJ is licensed, which Hawaiʻi payers/benefits/codes are enrolled, and whether an authenticated Keragon handoff/API is supported; do not call an imagined endpoint.',KERAGON_LINKS.trizettoPa);
const payerFallback=step('payer-route','Use verified payer/delegate portal when electronic PA unavailable',
 'Existing manual/RCM route; not an automatic submission',
 'Use actual plan and delegated PA instructions to verify code, benefits, medical necessity and physician-versus-facility request. Track staff ownership and confirmation.');
const make=(lane,headline,description,steps,warning)=>Object.freeze({
 lane,headline,description,steps:Object.freeze(steps),warning,
 activated:false,connectionStatus:'ModMed ↔ Keragon connected (reported by PBJ); TriZetto used for billing/clearinghouse (reported). No Keragon-to-TriZetto eligibility/PA or payer submission verified in Coverage Desk.'
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
   'Neither existing ModMed/Keragon access nor TriZetto billing establishes the primary payer or correct authorization delegate.',
   [step('resolve','Identify the underlying carrier, plan and benefit','HOLD — no submission',
     'For delegated/secondary plans identify the true authorizer; Original Medicare does not supply a retail Part D formulary, and a Part D plan does not authorize surgery.')],
   'Do not infer authorization requirements or substitute another insurer.');
 if(plan.program==='veterans'||plan.program==='military'||plan.payer==='Workers compensation')
   return make('program-specific','Use the actual referral or claim administrator',
     'Keragon may organize review and follow-up; do not assume TriZetto or Optum has access to the program.',
     [modmedContext,planScope,step('program','Confirm program-specific submission','Staff-controlled referral or claim authorization',
       'Check approved body part/diagnosis and claim, referral, payer, facility and rules with the correct administrator.')],
     'TriZetto electronic authorization support for VA, TRICARE or workers-comp claims is unverified.');
 if(pharmacy)return make('pharmacy','Use ModMed pharmacy ePA; let Keragon coordinate',
   'Keragon is linked to ModMed, but that does not automatically enable every PBM or e-prescribing action. Keep retail prescription PA distinct from medical authorization and costs.',
   [modmedContext,eligibility,planScope,
    step('formulary','Verify medication in the member’s actual PBM formulary',
     'Exact medication, route, strength, quantity, preferred alternatives',
     'Use the payer/PBM formulary and actual member plan. A public product list is not evidence of member enrollment.'),
    step('modmed-epa','Initiate actual prescription PA via ModMed or approved PBM',
     'Use the existing ModMed ePA module if enabled; not a Keragon 278 action',
     'Confirm ePA transaction acceptance, payer questions and status in the approved workflow. Do not infer that MedicationStatement grants eRx access.',KERAGON_LINKS.modmedEpa),
    step('pharmacy-follow-up','Track the actual PBM response and appeal',
     'Staff review; do not assume an approved request',
     'Require actual confirmation, denial reason or approval ID and follow-up dates; do not derive approval from a successful automation run.')],
   requestType==='Reconsideration / appeal'?'Appeal deadlines and denial reasoning must come from the actual PBM response.':'Do not use a medical authorization gateway as a substitute for retail ePA.');
 if(service.type==='medication'||service.id==='knee-gel')
   return make('medical-drug','Start with TriZetto authorization capability and payer requirements',
     'For physician-administered drugs and gel, first determine whether your existing TriZetto service has medical-benefit PA for the actual payer and product.',
     [modmedContext,eligibility,planScope,
      step('medical-policy','Verify medical drug benefit, J-code, units and criteria',
       'Required before any electronic PA',
       'Check buy-and-bill benefit, preferred product, administration code, route, dosage, site and medical-policy criteria. A pharmacy tier does not establish coverage.'),
      trizettoPa,payerFallback,
      step('review','Clinician reviews clinical evidence; staff monitors determination',
       'Explicit human approval before any actual submission',
       'Attach chart documentation only in approved systems; record confirmation, missing information, true payer decision and expiry.')],
     'TriZetto PA is a separate product from Keragon’s documented TriZetto eligibility action. Product license and payer connectivity have not been verified.');
 return make('procedure','Use existing TriZetto first for surgical/imaging PA feasibility',
   'For total joint replacement, MACI, carpal tunnel, peripheral procedures and imaging, TriZetto’s separate electronic PA offering is the first integration to check; otherwise use exact payer portals.',
   [modmedContext,eligibility,planScope,
    step('procedure-policy','Verify procedure code and surgical setting',
     'Exact insurer/delegate, site-of-service and authorization scope',
     'Check CPT/HCPCS and laterality, ASC/hospital/office, surgeon and facility requirements, insurer-specific criteria and supporting records.'),
    trizettoPa,payerFallback,
    step('decision','Human review, submit through approved route and monitor',
     'Verified payer result only; clinician and billing sign-off',
     'Require reviewer approval, submission reference, site and codes, determination, dates and escalation before claiming authorization.')],
   'No universal authorization pathway exists for all Hawaiʻi insurers. Optum is an optional alternative vendor, not part of this default flow.');
}
export function keragonBuildPrompt(ctx,{benefit='Medical',requestType='Initial'}={}){
 const route=keragonPaRoute(ctx,{benefit,requestType});
 if(!route)throw Error('Choose a payer-owned plan and service first.');
 const {plan,service}=ctx;
 const steps=route.steps.map((x,i)=>(i+1)+'. '+x.title+': '+x.detail);
 return [
 'Create a DRAFT Keragon workflow for Pacific Bone & Joint. Do NOT publish, submit prior authorization, message patients, or transmit PHI during the synthetic trial.',
 'Existing systems (practice-reported): Keragon is ALREADY connected to ModMed. TriZetto is ALREADY used for clearinghouse/billing. Reuse current ModMed authentication: do not reconnect or ask for credentials. Check allowed FHIR resource scopes, rather than assuming all clinical data or writeback is available.',
 'TriZetto-in-Keragon currently publicly documents an eligibility action only. The EXISTING TriZetto clearinghouse relationship does not confirm Keragon eligibility access or the separate TriZetto electronic prior-authorization service. Confirm enrollment and supported payer/codes before connecting anything.',
 'Optum is not mandatory. Do NOT add an Optum step to this draft; it is an optional alternative only if independently chosen later.',
 'Synthetic public selection: '+plan.payer+' | '+plan.name+' | '+service.name+' | '+benefit+' benefit | '+requestType+'. This is NOT a real patient or an eligibility record.',
 'Required lane: '+route.lane+'. '+route.headline+'.',
 'Use the current Keragon ModMed trigger if supported for approved Coverage or ServiceRequest events, or use a manually initiated task. Validate duplicate-event behavior. Do not treat a MedicationStatement as an e-prescription.',
 'Confirm exact plan/payer, coverage program, delegate, pharmacy or medical benefit, code and setting before any authorization workflow. If unknown, stop and assign staff verification.',
 'Steps for this lane:',
 ...steps,
 'Investigate existing TriZetto 278 and FHIR electronic PA options only with the billing/clearinghouse administrator; do not invent REST endpoints or assume the Keragon TriZetto connector submits PA. Use current payer portal/RCM workflow until an authenticated integration is verified.',
 'Require clinician clinical-evidence review and staff/billing approval BEFORE outbound submission; record only payer-confirmed statuses: awaiting verification, gathering records, ready for review, submitted, pending, more information, approved, denied, appealed, expired.',
 'Add role-specific staff queue, due dates, retries, idempotency, privacy-safe audit trail and escalation for unmatched insurer, denied authorization, invalid code, expired approval, missing clinical record and unavailable integration.',
 'Financial estimate is separate: get actual member-specific benefit accumulators and allowed amounts for surgeon, facility, anesthesia and products, not public hospital machine-readable price as quote.',
 'Do not send credentials, PHI, notes or claim identifiers into the public synthetic Coverage Desk app. No patient data exchange, PA submission, ModMed writeback, or Keragon webhook can be claimed active from this blueprint.',
 'Produce visual DRAFT workflow, external requirements/contract checklist, and synthetic/manual test plan with all live triggers disabled until review.'
 ].join('\n');
}
