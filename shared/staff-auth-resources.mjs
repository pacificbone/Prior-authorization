/**
 * Official public directions for prior authorization — no member data, no
 * embedded credentials, and no automatic submitted or approved status.
 * "check" is a lookup and "submit-info" is a guide, not an EDI transaction.
 * Only display resources belonging to the selected carrier/program/benefit.
 */
export const STAFF_AUTH_RESOURCES=Object.freeze([
 {id:'hmsa-medical',payer:'HMSA',benefit:'Medical',programs:['commercial','exchange','quest','medicare-advantage','federal'],
  name:'HMSA current medical code PA and delegated service routing',
  url:'https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/',role:'check',
  note:'Search exact CPT/HCPCS, line, location, participation, and selected delegated reviewer (including Evolent for hip/knee/spine). A code-list result is not benefit coverage.'},
 {id:'hmsa-medical-submit',payer:'HMSA',benefit:'Medical',programs:['commercial','exchange','quest','medicare-advantage','federal'],
  name:'HMSA provider PA submission instructions and forms',
  url:'https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/',role:'submit-info',
  note:'Use HHIN+ or the applicable delegate, or payer-specified form/fax. Verify that the requested service is not delegated elsewhere.'},
 {id:'hmsa-pharmacy',payer:'HMSA',benefit:'Pharmacy',programs:['commercial','exchange','quest','medicare-advantage','federal','part-d'],
  name:'HMSA CVS Caremark pharmacy PA and exceptions',
  url:'https://www.hmsa.com/prc/pharmacy/hmsa-pharmacy-benefit-manager-prior-authorization/',role:'submit-info',
  note:'Official Caremark/covermymeds electronic prior-auth, pharmacy forms and separate commercial/QUEST/Medicare contact routes. Confirm PBM and member pharmacy benefit.'},
 {id:'hmsa-specialty',payer:'HMSA',benefit:'Medical',programs:['commercial','exchange','quest','medicare-advantage','federal'],
  name:'HMSA specialty medical drug Novologix authorization',
  url:'https://www.hmsa.com/prc/pharmacy/specialty-pharmacies-and-specialty-drug-lists/',role:'submit-info',appliesTo:'medication',
  note:'Access Novologix via HHIN+ / Cozeva, with listed fallback phone/fax options; office-administered drugs use medical benefit criteria where applicable.'},
 {id:'aloha-medical',payer:'AlohaCare',benefit:'Medical',programs:['quest','medicare-advantage'],
  name:'AlohaCare exact CPT/HCPCS PA requirement lookup',
  url:'https://office.alohacare.org/PriorAuth/',role:'check',
  note:'Select actual line of business and full CPT/HCPCS. The lookup expressly states payment depends on eligibility, benefits, network and coding.'},
 {id:'aloha-medical-submit',payer:'AlohaCare',benefit:'Medical',programs:['quest','medicare-advantage'],
  name:'AlohaCare provider authorization forms and medical criteria',
  url:'https://office.alohacare.org/Providers/Authorization',role:'submit-info',
  note:'Request for PA / notification, retrospective authorization, and nationally developed clinical-review criteria. Review applicable provider manual.'},
 {id:'aloha-pharmacy',payer:'AlohaCare',benefit:'Pharmacy',programs:['quest','medicare-advantage'],
  name:'AlohaCare official Drug Finder and pharmacy PA route',
  url:'https://office.alohacare.org/Formulary',role:'submit-info',
  note:'Exact QUEST vs dual/Medicare source. Physician may use EHR ePA or the official pharmacy authorization form; Prompt PA applies to QUEST and CCS only.'},
 {id:'uha-medical',payer:'UHA',benefit:'Medical',programs:['commercial'],
  name:'UHA CPT/HCPCS prior-auth search and electronic submission',
  url:'https://www.uhahealth.com/providers/online-prior-authorization-pa',role:'check',
  note:'CPT-level list applies to UHA medical plans, with specific setting/out-of-state conditions. Sign into the UHA provider portal for medical authorization submission.'},
 {id:'uha-pharmacy',payer:'UHA',benefit:'Pharmacy',programs:['commercial'],
  name:'UHA drug PA lookup and actual PBM/MBM routing',
  url:'https://www.uhahealth.com/providers/online-prior-authorization-pa',role:'check',
  note:'Drug-level tool lists whether PA is required and the corresponding PBM/medical benefit manager contact; not proof of formulary coverage.'},
 {id:'uhc-hawaii-quest',payer:'UnitedHealthcare',benefit:'Medical',programs:['quest'],
  name:'UHC Hawaiʻi Community Plan medical prior authorization',
  url:'https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-prior-auth.html',
  role:'check',note:'Community Plan medical authorizations are distinct from UHC Commercial and Medicare Advantage. Confirm exact requested CPT and participating provider.'},
 {id:'uhc-hawaii-quest-pharmacy',payer:'UnitedHealthcare',benefit:'Pharmacy',programs:['quest'],
  name:'UHC Hawaiʻi QUEST prescription PA and pharmacy program',
  url:'https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-pharmacy.html',
  role:'submit-info',note:'Check the actual drug formulation and PA/ST/QL flags; pharmacy ePA routing may differ from medical-benefit injected drugs.'},
 {id:'kaiser-hawaii',payer:'Kaiser Permanente',benefit:'Medical',programs:['commercial','exchange','quest','medicare-advantage'],
  name:'Kaiser Hawaiʻi contracted/out-of-plan referral and authorization manual',
  url:'https://healthy.kaiserpermanente.org/content/dam/kporg/final/documents/community-providers/hi/ever/HI-NDA-2026-Hawaii-Provider-Manual-FINAL.pdf',
  role:'submit-info',note:'Kaiser referral/authorization and eligibility procedures vary by contracted status and inpatient/out-of-plan site. The manual is not a member-specific approval.'},
 {id:'va-community',payer:'Veterans Affairs',benefit:'Medical',programs:['veterans'],
  name:'VA Community Care referral and authorization rules',
  url:'https://www.va.gov/COMMUNITYCARE/',role:'submit-info',
  note:'Confirm issued referral, authorized services, site and dates. A VA formulary status alone cannot authorize surgery.'},
 {id:'tricare',payer:'TRICARE',benefit:'Medical',programs:['military'],
  name:'TRICARE covered service, referral and prior authorization',
  url:'https://www.tricare.mil/CoveredServices/IsItCovered',
  role:'check',note:'Prime/Select, regional contractor and service network determine referral and authorization requirements.'},
 {id:'tricare-rx',payer:'TRICARE',benefit:'Pharmacy',programs:['military'],
  name:'TRICARE pharmacy formulary, PA and medical necessity forms',
  url:'https://www.tricare.mil/FormularySearch',
  role:'check',note:'Search exact product/formulation and PA/tier, then use correct prescription pharmacy authorization route.'},
 {id:'medicare-mcd',payer:'Traditional Medicare',benefit:'Medical',programs:['original-medicare'],
  name:'CMS Medicare Coverage Database for NCD/LCD and billing articles',
  url:'https://www.cms.gov/medicare-coverage-database/search.aspx',
  role:'check',note:'Original Medicare is not a commercial insurer PA portal; check actual coverage and applicable service-specific prior-authorization programs only.'},
 {id:'workers-comp-hi',payer:'Workers compensation',benefit:'Medical',programs:['delegated'],
  name:'Hawaiʻi workers’ compensation medical benefit rules',
  url:'https://labor.hawaii.gov/dcd/home/about-division/workers-compensation/',
  role:'check',note:'Claim/carrier acceptance, treating physician authorization and relatedness are required; there is no statewide universal pharmacy formulary.'}
]);
export function staffAuthResources({payer,program,benefit,serviceType}){
 if(typeof payer!=='string'||typeof program!=='string'||!['Medical','Pharmacy'].includes(benefit))return [];
 return STAFF_AUTH_RESOURCES.filter(x=>x.payer===payer&&x.benefit===benefit&&x.programs.includes(program)&&(!x.appliesTo||x.appliesTo===serviceType));
}
export function validateStaffAuthResources(){
 const ids=new Set();
 for(const x of STAFF_AUTH_RESOURCES){
  if(ids.has(x.id))throw Error('Duplicate payer authorization resource');
  ids.add(x.id);
  const url=new URL(x.url);
  if(url.protocol!=='https:'||url.username||url.password||url.hash)throw Error('Invalid public PA resource URL');
  if(!['check','submit-info'].includes(x.role)||!x.programs.length)throw Error('Invalid authorization lookup role');
 }
 return true;
}
validateStaffAuthResources();
