// Publicly confirmed administrative submission requirements only.
// No member identifiers are collected or stored by this synthetic-only application.
export const PAYER_SUBMISSION_REQUIREMENTS=Object.freeze([
 {payer:'ʻOhana / Wellcare',line:'QUEST / Medicaid',sourceUrl:'https://www.ohanahealthplan.com/providers/medicaid/authorizations.html',
  sourceSection:'Submitting an Authorization Request',reviewedAt:'2026-11-08',
  fields:[['memberName','Member name (approved system only)'],['memberId','Member ID (approved system only)'],
   ['provider','Treating provider identity and NPI'],['facility','Facility identity and NPI when applicable'],
   ['contact','Provider/facility fax'],['serviceDates','Date(s) of service'],
   ['diagnosis','Diagnosis and ICD codes'],['procedure','CPT codes']],
  note:'Authorization does not guarantee payment; confirm eligibility and exact code lookup.'},
 {payer:'UnitedHealthcare',line:'Commercial',sourceUrl:'https://ams-gateway.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
  sourceSection:'Medical Records Documentation Used for Reviews',reviewedAt:'2026-11-08',
  fields:[['procedure','Requested procedure and code'],['laterality','Body part and laterality'],
   ['diagnosis','Diagnosis and code'],['functional','Functional impairment and ADLs'],
   ['symptoms','Relevant symptoms and standardized functional tools'],['history','Relevant history and comorbidities'],
   ['nicotine','Nicotine history/status where applicable'],['treatments','Non-drug treatment dates, duration, responses'],
   ['medications','Prior medication dates, response and intolerance'],['imaging','Dated imaging reports'],
   ['exam','Physical examination'],['plan','Implant/graft and pre/postoperative plan'],
   ['revision','Revision indication and treatment plan when applicable']],
  note:'Policy refers to proprietary InterQual criteria; this list is a records checklist, not complete medical-necessity criteria.'}
].map(r=>Object.freeze({...r,fields:Object.freeze(r.fields.map(([id,label])=>Object.freeze({id,label}))),memberEligibilityVerified:false,criteriaVerified:false})));
export function submissionRequirementsFor({payer,line}={}){
 return PAYER_SUBMISSION_REQUIREMENTS.filter(x=>x.payer===payer&&x.line===line);
}
