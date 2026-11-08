// Public payer routing references verified against published provider pages.
// These are NOT exact-plan coverage, clinical criteria, or procurement permissions.
export const HAWAII_PAYER_ROUTING=Object.freeze([
 {payer:'UnitedHealthcare',line:'Commercial',category:'surgery',title:'2026 Commercial arthroplasty authorization and knee/hip policy',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/prior-auth/pa-requirements/commercial/UHC-Commercial-Advance-Notification-PA-Requirements-1-2026.pdf',
  secondaryUrl:'https://ams-gateway.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
  note:'Arthroplasty CPT 27447, 27446, 27486, 27487, 27130 and revision hip codes appear in the published 2026 PA list. Verify exact product, delegation, site and code. Knee policy effective 2026-09-10.',reviewedAt:'2026-11-08'},
 {payer:'AlohaCare',line:'QUEST / Medicaid',category:'surgery',title:'AlohaCare service prior authorization lookup',
  sourceUrl:'https://office.alohacare.org/Providers/Authorization',
  note:'Use current code-level lookup; do not infer that every surgery requires PA.',reviewedAt:'2026-11-08'},
 {payer:'AlohaCare',line:'QUEST / Medicaid',category:'medication',title:'AlohaCare QUEST formulary and physician-administered drug pathway',
  sourceUrl:'https://0ogp.alohacare.org/Providers/Formulary_QUEST',
  note:'Separate pharmacy ePA and physician-administered drug forms. Verify exact product, benefit, and acquisition route.',reviewedAt:'2026-11-08'},
 {payer:'ʻOhana / Wellcare',line:'QUEST / Medicaid',category:'surgery',title:'Ohana Medicaid code-specific authorization lookup',
  sourceUrl:'https://www.ohanahealthplan.com/content/dam/centene/wellcare/hi/pdfs/provider/HI_OhanaHP_Medicaid_CCS_QI_PriorAuthReq_R.pdf',
  secondaryUrl:'https://www.wellcare.com/en/Hawaii/Providers/Authorization-Lookup',
  note:'Medicaid PA list directs providers to the current code lookup. Verify exact member product, service and facility.',reviewedAt:'2026-11-08'},
 {payer:'Kaiser Permanente',line:'Commercial',category:'surgery',title:'Kaiser Hawai\u02bbi contracted provider authorization/referral',
  sourceUrl:'https://healthy.kaiserpermanente.org/content/dam/kporg/final/documents/community-providers/hi/ever/HI-NDA-2026-Hawaii-Provider-Manual-FINAL.pdf',
  note:'Contracted providers verify eligibility, benefit, referral and authorization; out-of-plan and inpatient pathways differ. Do not assume PBJ is authorized.',reviewedAt:'2026-11-08'},
 {payer:'Kaiser Permanente',line:'Commercial',category:'medication',title:'Kaiser Hawai\u02bbi plan-specific formulary',
  sourceUrl:'https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary',
  note:'Choose the exact Kaiser formulary (including Added Choice). Pharmacy listing does not establish buy-and-bill or outside administration.',reviewedAt:'2026-11-08'}
].map(x=>Object.freeze({...x,verifiedPublicReference:true,exactPlanAdoption:false,fulfillmentVerified:false})));
export function payerRoutingFor({payer,line,category}={}){
 return HAWAII_PAYER_ROUTING.filter(x=>x.payer===payer&&x.line===line&&x.category===category);
}
