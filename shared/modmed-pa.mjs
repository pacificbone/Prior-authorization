// Vendor-aware staff handoff. This module never authenticates, transmits PHI,
// checks eligibility, writes ModMed records, or submits an authorization.
export const MODMED_PA_LINKS=Object.freeze({
  modmedEpa:'https://www.modmed.com/what-we-do/eprescribing/',
  modmedApi:'https://portal.api.modmed.com/docs/getting-started',
  samacareGuide:'https://help.samacare.com/modmed-integration-guide',
  samacareProviders:'https://www.samacare.com/providers',
  developModmed:'https://www.develophealth.ai/blog/prior-authorization-modmed',
  developApi:'https://docs.develophealth.ai/introduction'
});
export const SAMACARE_MODMED_SETUP_EMAIL='mailto:practicesolutions@modmed.com?cc=ehr_accounts%40samacare.com&subject=Pacific%20Bone%20%26%20Joint%20-%20SamaCare%20ModMed%20integration&body=Aloha%2C%0A%0APlease%20send%20the%20order%20form%20and%20technical%20requirements%20for%20enabling%20SamaCare%20with%20our%20ModMed%20EMA%20practice.%20Please%20confirm%20the%20per-provider%20interface%20fee%2C%20scope%20of%20demographic%2Fdocument%20exchange%2C%20and%20implementation%20steps.%0A%0AMahalo%2C%0APacific%20Bone%20%26%20Joint';
const step=(id,title,role,description,url=null)=>Object.freeze({id,title,role,description,url,connected:false});
const CHECKS=Object.freeze([
 'Verify actual member eligibility, carrier, exact plan, group, benefit administrator and PBM.',
 'Verify the specific drug formulation/NDC or procedure CPT/HCPCS, care setting and applicable PA requirements with the correct payer.',
 'Locate current signed clinical evidence and payer forms in the approved clinical system; clinician must review the request.',
 'Record submitted-to destination, confirmation number, decision, dates and follow-up in an approved system.',
 'Calculate patient estimates separately from verified member accumulators and surgeon/facility allowed amounts.'
]);
const result=(lane,headline,description,steps,caution)=>Object.freeze({
 lane,headline,description,steps:Object.freeze(steps),caution,checks:CHECKS,
 connectionStatus:'Not connected to Coverage Desk; vendor and ModMed setup not verified.'
});
export function modmedPaRoute(ctx,{benefit='Medical',requestType='Initial'}={}){
 if(!ctx?.plan||!ctx?.service)return null;
 if(!['Medical','Pharmacy'].includes(benefit))throw Error('Unknown benefit channel.');
 const {plan,service}=ctx;
 const pharmacy=service.type==='medication'&&benefit==='Pharmacy';
 const invalid=(plan.program==='part-d'&&!pharmacy)||
   (plan.program==='original-medicare'&&benefit==='Pharmacy')||
   plan.payer==='Medigap'||plan.program==='delegated';
 if(invalid)return result('verify-coverage','Identify the correct primary benefit first',
   'This selection does not establish the primary medical or pharmacy benefit. Identify the actual carrier, member product and delegate before routing any authorization.',
   [step('identify-coverage','Verify underlying coverage','STOP — do not send',
      'For delegated administrators identify the underwriting plan; for Original Medicare pharmacy use the member’s separate PDP; Part D and Medigap do not authorize surgery.')],
   'Do not substitute another insurer’s formulary or a non-primary administrator for the actual member plan.');
 if(plan.payer==='Workers compensation'||plan.program==='veterans'||plan.program==='military')
   return result('program-specific','Use the verified claim, referral or program channel',
     'VA, TRICARE and workers-compensation arrangements must be routed through their own confirmed referral or claim authorizer.',
     [step('program-portal','Check program/claim authorization','Program-specific workflow',
       'Confirm claim/referral eligibility, accepted condition and required documentation using the appropriate official route shown above.')],
     'No commercial-vendor acceptance, member pricing or approval can be inferred for this program.');
 if(pharmacy)return result('pharmacy','Start with ModMed EMA ePA and prescription benefits',
   'The practice should verify native Surescripts ePA and Real-Time Prescription Benefit are enabled for the member’s PBM; Develop Health is an optional automation partner, not connected to this app.',
   [
     step('modmed-epa','ModMed EMA ePrescribing / ePA','Native route; activation and PBM connectivity unverified',
       'Check the ePA Rx queue and real-time prescription benefit for the exact formulation. Prescription cost shown there is not a medical/facility quote.',MODMED_PA_LINKS.modmedEpa),
     step('develop','Develop Health','Optional vendor; commercial/API onboarding required',
       'Evaluate evidence-backed pharmacy PA intake, submission, follow-up and appeal automation, and confirm its precise read/write method in your EMA environment.',MODMED_PA_LINKS.developModmed),
     step('pharmacy-fallback','Plan/PBM pharmacy portal','Fallback when ePA is unavailable',
       'Use the payer-owned pharmacy/PBM resources above; do not treat nonresponse as “no authorization required.”')
   ],
   requestType==='Reconsideration / appeal'?'For appeals, verify the actual denial reason and deadline before using any automation.':'The app cannot determine PBM participation, member copay or pharmacy PA status without an authenticated connection.');
 if(service.type==='medication'||service.id==='knee-gel')
   return result('medical-drug','Medical benefit: payer check first; evaluate SamaCare',
     'For office-administered medication or gel, verify buy-and-bill benefits and medical PA requirements. SamaCare can exchange ModMed demographics/documents after a separate setup, but product/payer support must be confirmed.',
     [
       step('payer-medical','Verify medical PA with payer/delegate','Primary route; member verification needed',
         'Confirm HCPCS/J-code, units, administration code, office versus facility, preferred product, step therapy and medical necessity in the applicable payer route above.'),
       step('samacare','SamaCare medical-benefit workflow','Optional; exact product and Hawaiʻi payer support unverified',
         'Ask SamaCare whether it processes this drug/gel and payer. Its documented ModMed connector moves demographics and attachments; authorization status/writeback is not established.',MODMED_PA_LINKS.samacareGuide)
     ],
     'A pharmacy formulary result does not establish buy-and-bill coverage. SamaCare integration is not active in Coverage Desk.');
 return result('procedure','Procedure/imaging: payer medical authorization route',
   'For joint replacement, MACI, carpal tunnel, other surgery and imaging, start with payer/delegate medical authorization or the practice RCM workflow. Do not assume a medication PA vendor handles surgery.',
   [
     step('payer-procedure','Verify procedure requirements at the payer','Primary route; exact CPT/setting needed',
       'Use the insurer-specific links above to verify the codes, facility, physician/facility authorizations and supporting records. Obtain separate confirmations when required.'),
     step('samacare-scope','Ask SamaCare about procedure scope','Unverified for this operation',
       'SamaCare focuses on medical benefit PA. Require a successful live demonstration for this procedure, payer, approval and ModMed writeback before using it.',MODMED_PA_LINKS.samacareProviders)
   ],
   'Neither Develop Health nor the documented SamaCare ModMed demographic/document interface establishes automated surgical PA approval.');
}