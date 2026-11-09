// Curated public research extracts. Never import these as fulfillment permissions.
import {orthoGelProducts} from './orthopedic-procedures.mjs';
import {validPolicyDate,validPublicSource,validSourceDigest,policyDay} from './plan-adoption.mjs';
const gel=orthoGelProducts.map(p=>'gel-'+p.id);
const joints=['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-total-hip','procedure-revision-hip','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'];
const cq=['Commercial','QUEST / Medicaid'];
const drugDirectory='https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/';
export const PAYER_POLICY_EVIDENCE=Object.freeze([
 {id:'hmsa-gel-preference-2026',payer:'HMSA',lines:cq,benefit:'Medical',products:gel,
  title:'HMSA Hyaluronate Products — Exceptions Criteria',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:drugDirectory,documentId:'203275332',locator:'Pages 1–2; table 1 and sections B–D',
  sourceSha256:'0bb93f0dc0f6e4d0516cbb18706e867ef8589b0dce0ae45d8000968e0681e563',
  summary:'Lists Euflexxa, Synvisc and Synvisc One as preferred. Nonpreferred exceptions address finishing an ongoing course or documented intolerable adverse events to Euflexxa and Synvisc/Synvisc One. Precertification is required.',
  prompts:['If requesting a nonpreferred product, identify the applicable exception branch and supporting evidence.'],
  limitations:'Product preference is not pharmacy formulary status or a supply-route determination. Review the complete exception policy.'},
 {id:'hmsa-gel-clinical-2026',payer:'HMSA',lines:cq,benefit:'Medical',products:gel,
  title:'HMSA Hyaluronate Products — Clinical Policy',version:'2026-06-26',effectiveFrom:'2026-06-26',
  sourceUrl:drugDirectory,documentId:'203625776',locator:'Pages 1–3; sections B–H',
  sourceSha256:'3bdf2818c776fa5c73040bd9852391761155abaa965bf0c1c595e950a09ca49b',
  summary:'Initial review addresses six months of conservative therapy, non-drug treatment response and medication response or intolerance/contraindication. Renewal distinguishes prior HMSA/CVS approval, pain relief and a six-month interval measured from the last injection of the completed course. An adverse/allergic reaction has a separate switch exception.',
  prompts:['Record initial versus continuation request and prior approval status.','Document treatment dates and responses, previous course last-injection date and benefit; use the applicable initial/renewal/exception branch.'],
  limitations:'Not a universal treatment prerequisite. These HMO/PPO/QUEST criteria must not be applied to Medicare Advantage. The separate MA billing paragraph does not establish buy-and-bill permission.'},
 {id:'hmsa-prolia-cq-2026',payer:'HMSA',lines:cq,benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'HMSA Prolia and Biosimilars — HMO/PPO/QUEST',version:'2026-04-01',effectiveFrom:'2026-04-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/',documentId:'203599459',locator:'Pages 2–4; product table and sections A–D',
  sourceSha256:'0f8ab9692533c9f170241f5b4c60ba1b5fe365c13825b4de10ae2ae8d9fb0c4f',
  summary:'Lists Jubbonti as preferred and a specific adverse-event exception for nonpreferred products. Clinical branches depend on indication and initial versus continuation status.',
  prompts:['Identify the indication-specific branch and prior HMSA/CVS authorization status.','For a nonpreferred request, document the Jubbonti exception and whether the event is attributable to the shared active ingredient.'],
  limitations:'Do not substitute UHC or Medicare Advantage preferences, or impose every alternative clinical branch as a prerequisite.'},
 {id:'hmsa-evenity-cq-2025',payer:'HMSA',lines:cq,benefit:'Medical',products:['bone-evenity'],
  title:'HMSA Evenity — HMO/PPO/QUEST',version:'2025-12-19',effectiveFrom:'2025-12-19',
  sourceUrl:drugDirectory,documentId:'203599176',locator:'Pages 1–2; sections B–D',
  sourceSha256:'f37a5031021f12e6d12dc78234ec5768c8733f3cd8ccead59401d84c21a87bdf',
  summary:'Contains alternative initial-treatment branches and a continuation limit of fewer than 12 monthly doses. One DXA branch prints -3.0 without a comparator.',
  prompts:['Identify the applicable initial branch, prior doses and continuation status.','Obtain payer clarification before interpreting the DXA branch with the missing comparator.'],
  limitations:'Do not invent a missing comparator or require bisphosphonate failure for every branch.'},
 {id:'hmsa-evolent-matrix-2026',payer:'HMSA',lines:['Commercial','QUEST / Medicaid','Medicare Advantage'],benefit:'Medical',products:joints,
  title:'HMSA Joint Surgery Utilization Review Matrix 2026',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:'https://www1.radmd.com/sites/default/files/2025-12/HMSA%20Joint%20Surgery%20Utilization%20Review%20Matrix%202026%2001.01.26.pdf',locator:'Pages 1–4 and 6',
  sourceSha256:null,directoryOnly:true,
  summary:'Separates primary requests and related code groupings. Bilateral same-day joint surgery requires separate authorizations. Evolent does not manage facility precertification; emergency-department services are outside this program.',
  prompts:['Confirm exact primary procedure, side and associated code groupings.','Review professional and facility authorizations separately; bilateral requests need separate review.'],
  limitations:'A utilization matrix is not a complete clinical-criteria policy or a payment guarantee.'},
 {id:'hmsa-evolent-knee-2025',payer:'HMSA',lines:['Commercial','QUEST / Medicaid','Medicare Advantage'],benefit:'Medical',products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee'],
  title:'HMSA-linked Evolent Clinical Guideline 1763 — Knee Arthroplasty',version:'July 2025; revised November 2024',effectiveFrom:'2025-07-01',
  sourceUrl:'https://www1.radmd.com/sites/default/files/2025-07/2025%20Evolent%20Musculoskeletal%20Surgery%20Guidelines%20-%20HMSA%20FINAL%20eff%20070125.pdf',locator:'PDF pages 58–72; guideline pages 1–15',
  sourceSha256:'3d5aedb85f22b1f9df3f60383b6b3632379cb6acbb7b51a5fe15c6bf2e1b75e2',
  summary:'Public HMSA-linked guideline includes distinct TKA, partial-knee and revision branches, clinical evidence and contraindication review. TKA has alternative sections; a single conservative-treatment threshold must not be imposed across all branches.',
  prompts:['Confirm the operative branch, imaging findings, function and dated nonoperative care or applicable exceptions.','Review timing of prior injections/arthroscopy and the complete contraindication section.'],
  versionConfirmationRequired:true,
  limitations:'The official HMSA landing page links this July 2025 file. Its current adoption/supersession for a 2026 service requires confirmation; a generic 2026 Evolent guideline is not a substitute.'},
 {id:'hmsa-gel-ma-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:gel,
  title:'HMSA Hyaluronates — Medicare Advantage',version:'2026-03-13',effectiveFrom:'2026-03-13',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',locator:'Official A–L directory: Hyaluronates (Medicare Advantage), effective 03/13/2026; separate MA fax form',
  sourceSha256:null,directoryOnly:true,
  summary:'HMSA publishes a separate Medicare Advantage hyaluronate clinical policy, distinct from its June 2026 Commercial/QUEST policy. This record confirms policy existence and date, not the detailed MA clinical criteria.',
  prompts:['Retrieve and review the MA policy and MA preferred-drug program before selecting a product.','Do not apply Commercial/QUEST six-month or renewal rules automatically to MA.'],
  limitations:'Directory-level verification only; SHA-256 is a legacy evidence reference and is NOT a verified digest of the linked directory. Exact member plan adoption, criteria and supply route are not verified.'},
 {id:'hmsa-gel-ma-preference-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:gel,
  title:'HMSA Hyaluronates Preferred Drug Program — Medicare Advantage',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/',locator:'Official M–Z directory: Synvisc and Synvisc One MA preferred program, effective 01/01/2026',
  sourceSha256:null,directoryOnly:true,
  summary:'A separate Medicare Advantage preferred-product program exists. The directory does not establish a universal preferred brand or exception requirements.',
  prompts:['Verify the exact MA product preference and exception policy for the requested gel.'],
  limitations:'Directory-level verification only; no verified plan adoption, sourcing route or complete product preference. Legacy digest does not fingerprint this directory URL.'},
 {id:'hmsa-prolia-ma-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'HMSA Prolia and Biosimilars — Medicare Advantage',version:'2026-10-01',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',locator:'Official A–L directory: Jubbonti (Medicare Advantage), effective 10/01/2026',
  sourceSha256:null,directoryOnly:true,
  summary:'HMSA publishes an MA-specific Prolia/biosimilar policy effective October 2026. Do not infer that the Commercial/QUEST Jubbonti preference or exceptions automatically apply.',
  prompts:['Retrieve the MA policy, determine product preference and applicable indication-specific branch.','Verify medical versus pharmacy benefit and specialty-pharmacy versus buy-and-bill route independently.'],
  limitations:'Directory-level verification only; exact clinical criteria, member adoption, supplier and payment not verified. Legacy digest does not fingerprint this directory URL.'},
 {id:'uhc-knee-2026',payer:'UnitedHealthcare',lines:['Commercial'],benefit:'Medical',
  products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'],
  title:'UHC Surgery of the Knee — Commercial and Individual Exchange',version:'2026T0553J',effectiveFrom:'2026-09-10',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
  locator:'Pages 1–3: application, coverage rationale, medical records documentation, applicable codes',
  sourceSha256:null,directoryOnly:true,
  summary:'UHC medical policy refers to InterQual CP and proprietary client-defined criteria for total knee, unicondylar/patellofemoral replacement and other knee surgery. The publicly available policy does not supply the full InterQual thresholds.',
  prompts:['Verify exact plan product and whether delegated utilization management applies.','Obtain the applicable licensed InterQual criteria and medical records list before asserting a threshold.'],
  limitations:'Public UHC policy verified, but document digest not captured; proprietary criteria and exact-plan adoption are not verified. This is not a PA approval or a determination that a specific procedure is covered.'},
 {id:'uhc-sourcing-2026',payer:'UnitedHealthcare',lines:['Commercial'],benefit:'Medical',products:[],allProducts:true,
  title:'UHC Commercial Medication Sourcing Protocol',version:'PCA-1-26-01739-E&I-QRG_09102026',effectiveFrom:null,
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/UHC-Admin-Drug-Chart.pdf',locator:'Page 1 overview and the applicable drug/site table',
  sourceSha256:'a61213afc1571ec38f6a11dcedcd90ffb28617053d203101f18d98104e16ad25',
  summary:'For listed drugs and applicable outpatient settings, the designated pharmacy bills the medical-benefit drug; the administering provider bills administration only. Excludes UHC West, UMR, Student Resources, UnitedHealthOne and Sierra; state-law exceptions apply.',
  prompts:['Check the exact medication and site table, excluded plan entities, state exceptions and any payer-authorized sourcing exception.'],
  limitations:'This is a general sourcing reference. Absence from this extract, coverage on a formulary, or a medical benefit does not prove buy-and-bill permission. The publication code is not an effective date.'}
].map(s=>Object.freeze({...s,lines:Object.freeze(s.lines),products:Object.freeze(s.products),prompts:Object.freeze(s.prompts),retrievedAt:'2026-11-07',reviewDue:'2027-02-05',sourceRetrieved:true,planAdoptionVerified:false,orderingAllowed:false})));
export function validatePayerEvidence(rows=PAYER_POLICY_EVIDENCE){
 if(!Array.isArray(rows)||!rows.length)throw Error('Missing public payer evidence');
 const ids=new Set();
 for(const s of rows){
  const host=new URL(s.sourceUrl).hostname;
  if(!['id','title','version','payer','locator','summary','limitations'].every(k=>typeof s[k]==='string'&&s[k].trim())||
   !Array.isArray(s.lines)||!s.lines.length||!s.lines.every(x=>typeof x==='string')||!Array.isArray(s.products)||!s.products.every(x=>typeof x==='string')||
   !Array.isArray(s.prompts)||!s.prompts.every(x=>typeof x==='string'&&x.trim())||s.sourceRetrieved!==true||!['Medical','Pharmacy'].includes(s.benefit)||ids.has(s.id)||!validPublicSource(s.sourceUrl)||!['www.hmsa.com','www1.radmd.com','www.uhcprovider.com'].includes(host)||!(s.directoryOnly===true&&s.sourceSha256===null||validSourceDigest(s.sourceSha256))||
   !validPolicyDate(s.retrievedAt)||!validPolicyDate(s.reviewDue)||s.reviewDue<s.retrievedAt||(Date.parse(s.reviewDue)-Date.parse(s.retrievedAt))/86400000>90||
   (s.effectiveFrom!==null&&!validPolicyDate(s.effectiveFrom))||s.planAdoptionVerified!==false||s.orderingAllowed!==false)throw Error('Invalid public payer evidence');
  ids.add(s.id);
 }
 return true;
}
export function payerEvidenceFor(scope={},asOf=policyDay()){
 if(!validPolicyDate(asOf)||!validPolicyDate(scope.serviceDate))return [];
 return PAYER_POLICY_EVIDENCE.filter(s=>s.payer===scope.payer&&s.lines.includes(scope.line)&&s.benefit===scope.benefit&&
  (s.products.includes(scope.productId)||s.allProducts&&scope.medication===true)&&(!s.effectiveFrom||s.effectiveFrom<=scope.serviceDate))
  .map(s=>({...s,reviewOverdue:s.reviewDue<asOf||s.reviewDue<scope.serviceDate||s.retrievedAt>asOf,applicability:'requires-exact-plan-review'}));
}
export function payerVerificationWorksheet(scope={},asOf=policyDay()){
 const refs=payerEvidenceFor(scope,asOf);
 return ['SYNTHETIC PAYER VERIFICATION WORKSHEET — NOT FOR SUBMISSION',
  `Scope: ${scope.payer||'[PAYER]'} / ${scope.planId||'[EXACT PLAN PRODUCT]'} / ${scope.line||'[LINE]'} / ${scope.benefit||'[BENEFIT]'} / ${scope.productId||'[PRODUCT]'} / ${scope.setting||'[SETTING]'} / ${scope.state||'[STATE]'} / ${scope.serviceDate||'[DATE]'}`,
  'Exact member plan adoption: NOT VERIFIED','Patient eligibility, authorization and coverage: NOT VERIFIED',
  'Supplier, network, acquisition route and reimbursement: NOT VERIFIED','Ordering: BLOCKED',
  ...refs.flatMap(s=>['',`PUBLIC REFERENCE: ${s.title}`,`Version: ${s.version}; ${s.locator}; SHA-256: ${s.sourceSha256||'NOT CAPTURED — DIRECTORY ONLY'}`,s.sourceUrl,
   `Review: ${s.reviewOverdue?'OVERDUE':'public snapshot reviewed; exact-plan applicability unverified'}${s.versionConfirmationRequired?'; current guideline version requires confirmation':''}`,
   s.summary,...s.prompts.map(p=>p+' [NOT DOCUMENTED]'),s.limitations]),
  ...(refs.length?[]:['No matching public reference imported. Obtain the exact policy; do not infer requirements.']),
  '', 'Verification attachments to obtain in approved workflow:',
  '1. Exact plan/product and benefit adoption document with applicable dates and source version/hash.',
  '2. Patient-specific eligibility and approval or evidenced no-PA determination.',
  '3. Supplier/network/site permission, shipping restrictions, drug versus administration reimbursement and cost-sharing.',
  '4. Current surgical guideline adoption, code grouping and separate facility review where applicable.',
  'Clinician/payer verification: [NOT COMPLETED]'].join('\n');
}
validatePayerEvidence();
