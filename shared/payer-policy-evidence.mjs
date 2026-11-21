// Curated public research extracts. Never import these as fulfillment permissions.
import {orthoGelProducts} from './orthopedic-procedures.mjs';
import {validPolicyDate,validPublicSource,validSourceDigest,policyDay} from './plan-adoption.mjs';
import {documentationBranchesFor,PAYER_DOCUMENTATION_BRANCHES} from './payer-documentation-branches.mjs';
const gel=orthoGelProducts.map(p=>'gel-'+p.id);
const G=(...ids)=>ids.map(id=>'gel-'+id),B=(...ids)=>ids.map(id=>'bone-'+id);
const joints=['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-total-hip','procedure-revision-hip','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'];
// Arthroplasty products are the only ones the Noridian TKA/THA LCDs address.
const arthroplasty=['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-total-hip','procedure-revision-hip'];
const kneeSoft=['procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'];
// Brand lists exactly as each preference table prints them (see shared/product-preferences.mjs).
const hmsaCqGelPreferred=G('euflexxa','synvisc','synvisc-one'),hmsaCqGelNonPreferred=G('durolane','gel-one','gelsyn-3','genvisc','hyalgan','hymovis','monovisc','orthovisc','supartz','triluron','trivisc','visco-3');
const hmsaMaGelPreferred=G('durolane','euflexxa','gelsyn-3','supartz'),hmsaMaGelNonPreferred=G('gel-one','genvisc','hyalgan','hymovis','monovisc','orthovisc','synvisc','synvisc-one','triluron','trivisc','visco-3');
const uhcGelCriteria=G('durolane','euflexxa','gelsyn-3'),uhcGelOther=gel.filter(p=>!uhcGelCriteria.includes(p));
const uhcMaGelPreferred=G('durolane','gelsyn-3','synvisc','synvisc-one'),uhcMaGelNonPreferred=gel.filter(p=>!uhcMaGelPreferred.includes(p));
const cq=['Commercial','QUEST / Medicaid'];
const drugDirectory='https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/';
export const PAYER_POLICY_EVIDENCE=Object.freeze([
 {id:'hmsa-gel-preference-2026',payer:'HMSA',lines:cq,benefit:'Medical',products:gel,
  title:'HMSA Hyaluronate Products — Exceptions Criteria',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:drugDirectory,documentId:'203275332',locator:'Pages 1–2; table 1 and sections B–D',
  sourceSha256:'0bb93f0dc0f6e4d0516cbb18706e867ef8589b0dce0ae45d8000968e0681e563',
  summary:'Lists Euflexxa, Synvisc and Synvisc One as preferred. Nonpreferred exceptions address finishing an ongoing course or documented intolerable adverse events to Euflexxa and Synvisc/Synvisc One. Precertification is required.',
  prompts:[{text:'Document which exception applies to this nonpreferred brand: completing the current course of treatment, or a documented intolerable adverse event to both preferred products (Euflexxa and Synvisc or Synvisc One).',products:hmsaCqGelNonPreferred},
   {text:'Euflexxa, Synvisc and Synvisc One are the preferred products in this policy; precertification is still required.',products:hmsaCqGelPreferred},
   {text:'Synojoynt is not listed in table 1 of this policy; confirm its preference status with HMSA (the policy states new-to-market products are considered non-preferred until added).',products:G('synojoynt')}],
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
  prompts:['Identify the indication-specific branch and prior HMSA/CVS authorization status.',
   {text:'For a nonpreferred request, document the Jubbonti exception and whether the event is attributable to the shared active ingredient.',products:B('prolia','bildyos','enoby','stoboclo')},
   {text:'Jubbonti is the preferred product in this policy; the policy notes preferred medications may still require a clinical prior-authorization review.',products:B('jubbonti')}],
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
  sourceSha256:'9f0be97828c56547d5c90f5240b1e978fe2781d30738d610cbcfaf5201ffcfdf',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Separates primary requests and related code groupings. Bilateral same-day joint surgery requires separate authorizations. Evolent does not manage facility precertification; emergency-department services are outside this program.',
  prompts:['Confirm exact primary procedure, side and associated code groupings.','Review professional and facility authorizations separately; bilateral requests need separate review.',
   {text:'Document the request against the matrix row Total Knee Arthroplasty (TKA): primary CPT 27447, allowable billed grouping 27447.',products:['procedure-total-knee']},
   {text:'Document the request against the matrix row Partial-Unicompartmental Knee Arthroplasty (UKA): primary CPT 27446, allowable billed groupings 27446 and 27438.',products:['procedure-partial-knee']},
   {text:'Document the request against the matrix row Revision Knee Arthroplasty: primary CPT 27487, allowable billed groupings 27486 and 27487 (27488 is not listed in that row).',products:['procedure-revision-knee']},
   {text:'Document the request against the matrix row Total Hip Arthroplasty/Resurfacing: primary CPT 27130, allowable billed groupings 27130 and S2118.',products:['procedure-total-hip']},
   {text:'Document the request against the matrix row Revision/Conversion Hip Arthroplasty: primary CPT 27134, allowable billed groupings 27132, 27134, 27137 and 27138 (27091 is not listed in that row).',products:['procedure-revision-hip']},
   {text:'Document the request against the matrix row Knee Ligament Reconstruction/Repair: primary CPT 29888, allowable billed groupings 27405, 27407, 27409, 27427, 27428, 27429, 29888 and 29889.',products:['procedure-acl-reconstruction']},
   {text:'Document the request against the matrix row Knee Meniscectomy/Meniscal Repair/Meniscal Transplant: primary CPT 29880, allowable billed groupings 27332, 27333, 27403, 29868, 29880, 29881, 29882 and 29883.',products:['procedure-meniscus-repair','procedure-knee-meniscectomy']},
   {text:'Document which primary surgery row applies: CPT 27412 appears in the Knee Surgery – Other row (primary CPT 29879) and as an additional covered procedure on the ligament and meniscus rows.',products:['procedure-maci-implant']}],
  limitations:'A utilization matrix is not a complete clinical-criteria policy or a payment guarantee. Re-downloaded on 2026-11-15 and matched byte-for-byte to the registered digest. The matrix lists hip, knee and shoulder codes only: SI joint fusion (27278/27279), carpal tunnel release and trigger finger release are not on it, and Evolent\'s separate tip sheet sends urgent, infection, tumor and hardware-removal cases to HMSA directly, so check HMSA\'s required-PA code list for those.'},
 {id:'hmsa-evolent-knee-2025',payer:'HMSA',lines:['Commercial','QUEST / Medicaid','Medicare Advantage'],benefit:'Medical',products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee'],
  title:'HMSA-linked Evolent Clinical Guideline 1763 — Knee Arthroplasty',version:'July 2025; revised November 2024',effectiveFrom:'2025-07-01',
  sourceUrl:'https://www1.radmd.com/sites/default/files/2025-07/2025%20Evolent%20Musculoskeletal%20Surgery%20Guidelines%20-%20HMSA%20FINAL%20eff%20070125.pdf',locator:'PDF pages 58–72; guideline pages 1–15',
  sourceSha256:'3d5aedb85f22b1f9df3f60383b6b3632379cb6acbb7b51a5fe15c6bf2e1b75e2',
  summary:'Public HMSA-linked guideline includes distinct TKA, partial-knee and revision branches, clinical evidence and contraindication review. TKA has alternative sections; a single conservative-treatment threshold must not be imposed across all branches.',
  prompts:['Confirm the operative branch, imaging findings, function and dated nonoperative care or applicable exceptions.','Review timing of prior injections/arthroscopy and the complete contraindication section.'],
  versionConfirmationRequired:true,
  limitations:'The official HMSA landing page links this July 2025 file. Its current adoption/supersession for a 2026 service requires confirmation; a generic 2026 Evolent guideline is not a substitute.'},
 {id:'hmsa-gel-ma-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:gel,
  title:'HMSA Hyaluronate Products — Medicare Advantage clinical policy',version:'2026-03-13',effectiveFrom:'2026-03-13',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',documentId:'203625802',locator:'Pages 1–3; sections A–D (indications, required documentation, criteria for approval, continuation)',
  sourceSha256:'412487c46f7536439b566f8ecfe34d324948deef0394d135ba14562bbd333064',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Knee osteoarthritis only. One course may be authorized after inadequate response to non-pharmacologic treatment (exercise and strengthening and/or physical therapy, weight counseling if appropriate) and inadequate response, contraindication or intolerance to acetaminophen, an oral or topical NSAID, or tramadol. Unlike the Commercial/QUEST policy it states no six-month conservative-therapy duration. Reauthorization requires prior treatment of the same joint, pain relief from the previous course and a start at least 6 months after the last injection of that course, or a switch for an adverse event. Members treated without a prior authorization must meet initial criteria.',
  prompts:['Name the previous pharmacologic treatments and the response, intolerance or contraindication to each.','Document the non-pharmacologic treatment tried and its result.','For continuation give the date of the last injection of the previous completed course and the pain relief obtained.'],
  limitations:'Medicare Advantage only; do not apply the Commercial/QUEST six-month rule. Exact member plan adoption is not verified, and the preferred-product program is a separate document.'},
 {id:'hmsa-gel-ma-preference-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:gel,
  title:'HMSA Hyaluronate Products Exceptions Criteria — Medicare Advantage preferred products',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',documentId:'203275735',locator:'Pages 1–2; sections A–E (product table, exception criteria, administrative guidelines, Medicare Advantage program exception)',
  sourceSha256:'1db89b7f91812c4cb649d83667ed557b1cf3b3ba6d86c8a7d805ff71eeb63b38',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Preferred for Medicare Advantage: Durolane, Euflexxa, Gelsyn-3 and Supartz FX. Synvisc, Synvisc-One, Monovisc, Orthovisc, Gel-One, GenVisc 850, Hyalgan, Hymovis, Triluron, Trivisc and Visco-3 are non-preferred. The policy provides coverage for a non-preferred product when the member received it in the past 365 days, is completing a current course, or had a documented intolerable adverse event to all four preferred products. Precertification is required. The policy states that since May 15, 2018 hyaluronate injections for HMSA Medicare Advantage members must be billed by a contracted Medicare Part B provider as a medical claim; a pharmacy cannot bill them.',
  prompts:['Check the requested brand against the Medicare Advantage preferred list, which differs from Commercial/QUEST (Euflexxa, Synvisc, Synvisc One).',
   {text:'For a non-preferred brand document which exception applies: use in the past 365 days, completing a course, or intolerable adverse events to all four preferred products.',products:hmsaMaGelNonPreferred},
   {text:'Durolane, Euflexxa, Gelsyn-3 and Supartz FX are the preferred products on this list; the policy notes preferred products may still require a clinical prior authorization review.',products:hmsaMaGelPreferred},
   {text:'Synojoynt is not listed in this product table, and the policy states its preferred-product criteria do not apply to an FDA-approved product that is not listed; document the Medicare Advantage clinical policy criteria.',products:G('synojoynt')}],
  limitations:'The billing paragraph is the policy\'s general statement, not a verification of this practice\'s contract, the member\'s plan or reimbursement; the supply route stays unverified in this trial. Preferred products may still require clinical prior authorization.'},
 {id:'hmsa-prolia-ma-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'HMSA Prolia and Biosimilars — Medicare Advantage',version:'2026-10-01',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/',documentId:'203599464',locator:'Prolia (Medicare Advantage), sections B–C, page 2; PDF reviewed and fingerprinted 2026-11-06',
  sourceSha256:'83cd86c7d690b9d58bb56325c44bdca99e75c5d152c8567e50681a8f9840e9d3',retrievedAt:'2026-11-06',reviewDue:'2027-02-04',
  summary:'Bildyos is the preferred product in the Medicare Advantage policy; a listed nonpreferred product (Prolia, Enoby, Stoboclo, Jubbonti) requires the section B exception (qualifying Bildyos response or event, or the requested product already used within 365 days). Clinical criteria address osteoporosis in a man or postmenopausal woman with high fracture risk; other indications and continuation use different criteria. The Commercial/QUEST Jubbonti preference does not apply here.',
  prompts:['Identify the MA indication branch (osteoporosis in a man or postmenopausal woman, high fracture risk) and the requested product.',
   {text:'For a nonpreferred product, document the section B exception: the qualifying Bildyos response or event, or the dated prior use of the requested product within 365 days.',products:B('prolia','enoby','stoboclo','jubbonti')},
   {text:'Bildyos is the preferred product in this Medicare Advantage policy; the policy notes preferred products may still require a clinical prior authorization review.',products:B('bildyos')},
   'Verify medical versus pharmacy benefit and specialty-pharmacy versus buy-and-bill route independently.'],
  limitations:'Reviewed PDF snapshot; exact member plan (Akamai Advantage product), adoption, supplier and payment are not verified. Continuation and non-osteoporosis indications are outside this extract.'},
 {id:'hmsa-evenity-ma-2025',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:['bone-evenity'],
  title:'HMSA Evenity — Medicare Advantage',version:'2025-06-27',effectiveFrom:'2025-06-27',
  sourceUrl:drugDirectory,documentId:'203599181',locator:'Evenity (Medicare Advantage), sections B and F, pages 1 and 3; PDF reviewed and fingerprinted 2026-11-06',
  sourceSha256:'dbfc5b1a4a2990c13a24ed9852ad05fb0ffc7492d59d60fbc4ba5f5f794f9175',retrievedAt:'2026-11-06',reviewDue:'2027-02-04',
  summary:'Initial therapy for postmenopausal osteoporosis with high fracture risk; total treatment authorization no longer than 12 months; the requested regimen is checked against current labeling. Do not substitute the Commercial/QUEST alternative pathways.',
  prompts:['Document postmenopausal osteoporosis, the basis for high fracture risk and the planned monthly course within the 12-month limit.','Confirm the requested regimen against current labeling and record prior osteoporosis therapy.'],
  limitations:'Reviewed PDF snapshot of the initial-therapy section only; exact member plan adoption, supplier and payment are not verified.'},
 {id:'uhc-knee-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',
  products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'],
  title:'UHC Surgery of the Knee — Commercial and Individual Exchange',version:'2026T0553JJ',effectiveFrom:'2026-09-10',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
  locator:'Pages 1–3: application, coverage rationale, medical records documentation, applicable codes',
  sourceSha256:'5fafd91fcd745b0312a21301a0c98105da22b71b5a023c8e6471e080088f5b5e',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'UHC medical policy refers to InterQual CP and proprietary client-defined criteria for total knee, unicondylar/patellofemoral replacement and other knee surgery. The publicly available policy does not supply the full InterQual thresholds.',
  prompts:['Verify exact plan product and whether delegated utilization management applies.','Obtain the applicable licensed InterQual criteria and medical records list before asserting a threshold.'],
  limitations:'Fingerprinted PDF snapshot; proprietary InterQual criteria and exact-plan adoption are not verified. This is not a PA approval or a determination that a specific procedure is covered.'},
 {id:'uhc-hip-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:['procedure-total-hip','procedure-revision-hip'],
  title:'UHC Surgery of the Hip — Commercial and Individual Exchange',version:'2026T0503KK',effectiveFrom:'2026-09-10',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-hip.pdf',locator:'Pages 1–3: application, coverage rationale, medical records documentation, definitions, applicable codes',
  sourceSha256:'9fdc9d17a35241ee75426da5eb4f2773336d121c50e8334b9f912ca72a917f3f',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Refers hip arthroplasty, hemiarthroplasty, revision (removal and replacement) and hip arthroscopy to InterQual CP and UHG client-defined criteria. The public policy defines disabling pain and functional disability as WOMAC domain scores above 40 and states that FAI surgery is unproven with Tönnis grade 2–3 arthritis or Outerbridge III–IV cartilage damage.',
  prompts:['Obtain the applicable licensed InterQual criteria before asserting a threshold; record pain and function with the instrument the criteria use.','Verify exact plan product, delegated utilization management and the medical records list for reviews.'],
  limitations:'The public policy does not contain the InterQual thresholds. Commercial and Individual Exchange only; Medicare Advantage uses the separate Joint Procedures policy and QUEST the Community Plan policy. Not a PA approval or coverage determination.'},
 {id:'uhc-gel-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:gel,
  title:'UHC Sodium Hyaluronate — Commercial and Individual Exchange Medical Benefit Drug Policy',version:'2026D0081M',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sodium-hyaluronate.pdf',locator:'Pages 1–3: coverage rationale, diagnosis-specific criteria, FDA-labeled course table, applicable codes',
  sourceSha256:'f705b33dc77cf9fc3bab12b1ffe923001ed214021a74a72317be858c353722e2',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Durolane, Euflexxa and Gelsyn-3 are covered contingent on diagnosis-specific criteria and the policy states prior authorization is not required for them. Gel-One, GenVisc 850, Hyalgan, Hymovis, Hymovis One, Monovisc, Orthovisc, Supartz, Synojoynt, Synvisc, Synvisc-One, Triluron, TriVisc and Visco-3 are typically excluded from coverage. Initial criteria: knee osteoarthritis, inadequate response to at least 3 months of conservative therapy or intolerance, pain interfering with function, no contraindication, FDA-labeled dosing, one course per joint per 6 months. Repeat courses need documented response, recurrent pain and at least 6 months since the prior course. Hip and other joints are unproven.',
  prompts:[{text:'Durolane, Euflexxa and Gelsyn-3: the policy makes coverage contingent on its diagnosis-specific criteria and states prior authorization is not required; document those criteria for the record.',products:uhcGelCriteria},
   {text:'This brand is typically excluded from coverage under this policy; coverage reviews may be in place if required by law or the benefit plan. Check the Medical Benefit Therapeutic Equivalent Medications – Excluded Drugs policy and its preferred alternatives before scheduling.',products:uhcGelOther},
   'Document knee OA, the 3-month conservative therapy trial or intolerance, functional pain and absence of contraindications.','For a repeat course document response to the prior course, recurrence and the date of the last course (at least 6 months).'],
  limitations:'"Prior authorization is not required" is this policy\'s statement for its scope and is not coverage, eligibility or a supply-route decision; exact plan adoption is not verified. Do not apply to QUEST (Community Plan policy) or Medicare Advantage (Part B step-therapy policy).'},
 {id:'uhc-evenity-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:['bone-evenity'],
  title:'UHC Evenity (romosozumab-aqqg) — Commercial and Individual Exchange Medical Benefit Drug Policy',version:'2026D0080M',effectiveFrom:'2026-11-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/evenity-romosozumab-aqqg.pdf',locator:'Page 1: coverage rationale and reauthorization; applicable codes (J3111)',
  sourceSha256:'286ae32f6638fbb27b78f7ec597d083079b4360bae8d5443c4a35e400abe2f3d',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Proven for postmenopausal osteoporosis at high risk for fracture (for example prior osteoporotic fracture, multiple risk factors, or failure of or intolerance to other therapy) with FDA-labeled dosing; authorization is for no more than 12 months. Use beyond 12 months is unproven.',
  prompts:['Document postmenopausal osteoporosis, the basis for high fracture risk and the planned course within the 12-month limit.','Record prior Evenity doses so the cumulative course does not exceed 12 months.'],
  limitations:'Exact plan adoption, sourcing and payment are not verified. Commercial and Individual Exchange only.'},
 {id:'uhc-denosumab-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'UHC Denosumab — Commercial and Individual Exchange Medical Benefit Drug Policy',version:'2026D0068U',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/denosumab-prolia-xgeva.pdf',locator:'Pages 1–3: preferred product criteria, diagnosis-specific criteria and HCPCS table',
  sourceSha256:'bfacb2993a80909044fb55ebaacb98cd4965e58b7dc6c553aff0c527abb5a70c',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Bildyos, Enoby, Prolia and Stoboclo are preferred. Bosaya, Conexxence, Jubbonti and Ospomyv are typically excluded (coverage reviews may be in place if required by law or the benefit plan; the policy refers to a separate Excluded Drugs policy). On medical necessity plans, coverage of a non-preferred product is contingent on the Preferred Product Criteria (minimal response to, or intolerance of, the preferred products with a physician attestation) and the diagnosis-specific criteria; on non-medical necessity plans any denosumab product is approved on the diagnosis-specific criteria. Osteoporosis criteria: diagnosis, high fracture risk, FDA-labeled dosing, 12-month authorization; continuation requires documented positive response. HCPCS table: J0897 Prolia, Q5136 Jubbonti, Q5157 Stoboclo, Q5162 Bildyos, Q5167 Enoby.',
  prompts:[{text:'Bildyos, Enoby, Prolia and Stoboclo are the preferred denosumab products in this policy for medical necessity plans; document the diagnosis-specific criteria.',products:B('prolia','bildyos','enoby','stoboclo')},
   {text:'Jubbonti is typically excluded from coverage under this policy; coverage reviews may be in place if required by law or the benefit plan (see the separate Excluded Drugs policy, not captured here). Separately, on medical necessity plans the policy makes coverage of a non-preferred product such as Jubbonti contingent on the Preferred Product Criteria (minimal clinical response to, or intolerance, contraindication or adverse event with, Bildyos, Enoby, Prolia and Stoboclo, with a physician attestation) and the diagnosis-specific criteria.',products:B('jubbonti')},
   'Document the osteoporosis diagnosis and basis for high fracture risk; for continuation document clinical response.','Bill the product-specific HCPCS code from the policy table.'],
  limitations:'UHC preferences are the reverse of HMSA\'s for Jubbonti; never carry a preference across payers. Exact plan adoption, medical-necessity versus non-medical-necessity plan type and sourcing are not verified.'},
 {id:'uhc-sij-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:['procedure-si-joint-fusion'],
  title:'UHC Sacroiliac Joint Interventions — Commercial and Individual Exchange',version:'2026T0621P',effectiveFrom:'2026-11-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sacroiliac-joint-interventions.pdf',locator:'Pages 1–3: coverage rationale, definitions, applicable codes (27278, 27279, 27280)',
  sourceSha256:'4e495f65d7a283983d3f9a1e17edc159c1e0328c9116a310d0b49d03d953dc96',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Minimally invasive SI joint fusion for degenerative sacroiliac disease is proven only with a titanium triangular implant system, under InterQual client-defined criteria; fusion with any other device or for other indications is unproven and not medically necessary. Open fusion and SI joint injections are also referred to InterQual criteria.',
  prompts:['Identify the implant system; only a titanium triangular implant is in the proven category.','Obtain the licensed InterQual SI Joint Fusion criteria before asserting thresholds; document provocative tests and diagnostic injections as those criteria require.'],
  limitations:'The public policy does not contain the InterQual thresholds. Device restriction differs from the Noridian LCD, which turns on transfixation rather than implant brand. Commercial and Individual Exchange only.'},
 {id:'uhc-omnibus-carpal-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',products:['procedure-carpal-balloon','procedure-carpal-ultrasound-other'],
  title:'UHC Omnibus Codes — percutaneous carpal tunnel decompression (CPT 64728)',version:'2026T0535XXX',effectiveFrom:'2026-06-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/omnibus-codes.pdf',locator:'Coverage rationale table entry and section for CPT 64728; revision history, page 239 of 240',
  sourceSha256:'063ceac6f3249e9ab3415a7eaa76815cfcabb7346abb42653c645fae530a4a91',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Percutaneous decompression of the median nerve at the carpal tunnel using balloon-assisted or ultrasound-guided techniques (CPT 64728) is listed as unproven and not medically necessary due to insufficient evidence of safety and/or efficacy.',
  prompts:['Tell the surgeon and patient before scheduling that this technique is in UHC\'s unproven category for these plans.','If the planned operation is open (64721) or endoscopic (29848) release, use that template instead; this entry does not apply to them.'],
  limitations:'Applies to the percutaneous balloon-assisted and ultrasound-guided techniques only, on Commercial and Individual Exchange plans. Benefit plan language and state mandates can differ; this is not a claim determination.'},
 {id:'uhc-cs-gel-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:gel,
  title:'UHC Sodium Hyaluronate — Community Plan Medical Benefit Drug Policy',version:'CS2026D0081Q',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/sodium-hyaluronate-cs.pdf',locator:'Page 1: application (state exclusions) and coverage rationale; preferred product criteria',
  sourceSha256:'eb2cdddf3d5c321f54e47e8a65804a541e92143e4b132497da31177bd8343041',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'The preferred-product criteria are stated to apply in Hawaiʻi. Durolane, Euflexxa and Gelsyn-3 are covered on the diagnosis-specific criteria; every other brand additionally needs the preferred product criteria, and members already on another brand are expected to change to a preferred one unless they meet them.',
  prompts:[{text:'Durolane, Euflexxa and Gelsyn-3 are reviewed on the diagnosis-specific criteria alone; no preferred-product exception is needed.',products:uhcGelCriteria},
   {text:'Document the Preferred Product Criteria for this brand: an adequate trial of Durolane, Euflexxa and Gelsyn-3 with minimal clinical response, or failure, contraindication or intolerance to all three, each with a physician attestation. Members already on this brand are expected to change to a preferred product unless they meet these criteria.',products:uhcGelOther},
   'Document the diagnosis-specific knee osteoarthritis criteria from the policy.'],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. Unlike the commercial policy, non-preferred brands are reviewable rather than typically excluded.'},
 {id:'uhc-cs-knee-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'],
  title:'UHC Surgery of the Knee — Community Plan',version:'CS068.AE',effectiveFrom:'2026-11-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/surgery-knee-cs.pdf',locator:'Page 1: application (state exclusions) and coverage rationale',
  sourceSha256:'4ef1f672df2139614ac51d4222de615d7ccff1b797a599bef333e549018b43e3',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Refers knee surgery to InterQual CP and client-defined criteria, as the commercial policy does. Several states have their own versions; Hawaiʻi is not listed as excluded.',
  prompts:['Obtain the applicable licensed InterQual criteria before asserting a threshold.','Verify the QUEST plan and whether delegated utilization management applies.'],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. The public policy does not contain the InterQual thresholds.'},
 {id:'uhc-cs-hip-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:['procedure-total-hip','procedure-revision-hip'],
  title:'UHC Surgery of the Hip — Community Plan',version:'CS056.AC',effectiveFrom:'2026-11-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/surgery-hip-cs.pdf',locator:'Page 1: application (state exclusions) and coverage rationale',
  sourceSha256:'92d6e335075ac091368f2fa30428ca55f652bcf044380fba8ed5cc189dad7d4b',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Refers hip surgery to InterQual CP and client-defined criteria. Several states have their own versions; Hawaiʻi is not listed as excluded.',
  prompts:['Obtain the applicable licensed InterQual criteria before asserting a threshold.','Verify the QUEST plan and whether delegated utilization management applies.'],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. The public policy does not contain the InterQual thresholds.'},
 {id:'uhc-cs-evenity-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:['bone-evenity'],
  title:'UHC Evenity (romosozumab-aqqg) — Community Plan Medical Benefit Drug Policy',version:'CS2026D0080S',effectiveFrom:'2026-11-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/evenity-romosozumab-aqqg-cs.pdf',locator:'Pages 1–2: application (state exclusions) and coverage rationale',
  sourceSha256:'a87333cf005d3a882438d30682949c60c1b8651519ea08f76db6bd2c509f19d2',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'More detailed than the commercial policy: it uses BMD T-score or FRAX thresholds (major osteoporotic fracture 20% or more, hip fracture 3% or more) and a very-high-fracture-risk definition such as a fracture in the past 12 months, a fracture on therapy or multiple fractures. Authorization is for no more than 12 months; use beyond 12 months is unproven and not medically necessary.',
  prompts:['Document the BMD T-score site and value or FRAX probabilities, and which very-high-risk feature applies.','Record prior Evenity doses so the cumulative course does not exceed 12 months.'],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. Read the full criteria; this summary lists only part of the alternative branches.'},
 {id:'uhc-cs-denosumab-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'UHC Denosumab — Community Plan Medical Benefit Drug Policy',version:'CS2026D0068Y',effectiveFrom:'2026-09-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/denosumab-prolia-xgeva-cs.pdf',locator:'Pages 1–3: application (state exclusions), preferred products and preferred product criteria',
  sourceSha256:'4b2b5b0c79f93668c646258804a3515f2bfdd5c87b13d524de059579067562d4',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Preferred for the Community Plan: Bildyos, Bilprevda, Enoby, Jubbonti, Wyost and Xtrenbo. Prolia and Stoboclo are non-preferred here and need the preferred product criteria (for example contraindication, intolerance or adverse event with two preferred products) in addition to the diagnosis-specific criteria.',
  prompts:['Check the requested product against the Community Plan preferred list, which differs from both UHC commercial and UHC Medicare Advantage.',
   {text:'For Prolia or Stoboclo document the Preferred Product Criteria: adequate trials of two of Bildyos, Enoby and Jubbonti with minimal clinical response and residual disease activity, or a contraindication, intolerance or adverse event to two of them, each with a physician attestation, and no loss of a favorable response after established maintenance therapy with Bildyos, Enoby or Jubbonti.',products:B('prolia','stoboclo')},
   {text:'Bildyos, Enoby and Jubbonti are on the Community Plan preferred list; document the diagnosis-specific criteria.',products:B('bildyos','enoby','jubbonti')}],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. Never carry a preferred list from one UHC line to another.'},
 {id:'uhc-cs-omnibus-carpal-2026',payer:'UnitedHealthcare',lines:['QUEST / Medicaid'],benefit:'Medical',products:['procedure-carpal-balloon','procedure-carpal-ultrasound-other'],
  title:'UHC Omnibus Codes (Community Plan) — percutaneous carpal tunnel decompression (CPT 64728)',version:'CS087.AAA',effectiveFrom:'2026-07-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/omnibus-codes-cs.pdf',locator:'Coverage rationale table entry and section for CPT 64728',
  sourceSha256:'f715066ef1384bedc8f89c9d034d89beb9453d9f46c87afef8cb5672ed475722',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'CPT 64728, percutaneous decompression of the median nerve at the carpal tunnel with balloon dilation including ultrasound guidance, is listed as unproven.',
  prompts:['Tell the surgeon before scheduling that this technique is in the unproven category for this line.','Use the open (64721) or endoscopic (29848) template if that is the planned operation; this entry does not apply to them.'],
  limitations:'Hawaiʻi is not among the states this Community Plan policy excludes, but adoption by the UnitedHealthcare Community Plan QUEST contract and the member\'s plan is not verified. Applies to the percutaneous technique only.'},
 {id:'uhc-ma-joint-2026',payer:'UnitedHealthcare',lines:['Medicare Advantage'],benefit:'Medical',products:[...new Set(['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant','procedure-total-hip','procedure-revision-hip'])],
  title:'UHC Joint Procedures — Medicare Advantage Medical Policy',version:'MMP052.14',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/joint-procedures.pdf',locator:'Page 1 coverage rationale; LCD/LCA tables for surgery of the hip and knee; MAC jurisdiction table listing Noridian for HI',
  sourceSha256:'1eb1d1ccb37f5523c9b8ce2caa88022b1b6ec89e9707a7b655a686a52ce37724',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'For hip and knee surgery UHC Medicare Advantage requires compliance with the applicable Local Coverage Determinations where they exist, and its tables list Noridian L34163 (total hip, article A57683) and L36575 (total knee, article A57685) with Hawaiʻi in Noridian\'s jurisdiction. Where no LCD applies it falls back to the UHC commercial policy.',
  prompts:[{text:'Document against Noridian LCD L36575 (knee) or L34163 (hip) and its billing article, as for Original Medicare.',products:arthroplasty},
   {text:'No Noridian LCD is listed for this procedure in the policy\'s tables; where no applicable LCD/LCA exists the policy falls back to the UnitedHealthcare Commercial Medical Policy titled Surgery of the Knee (InterQual criteria). Confirm on the Medicare Coverage Database, then document against the applicable InterQual criteria.',products:kneeSoft},
   'Confirm the plan\'s prior-authorization requirement and any delegate (for example MDX Hawaiʻi) separately; the LCD is a coverage standard, not an authorization route.'],
  limitations:'Medicare Advantage only. Says nothing about whether prior authorization is required or who performs it; exact plan adoption and delegation are not verified.'},
 {id:'uhc-ma-partb-step-2026',payer:'UnitedHealthcare',lines:['Medicare Advantage'],benefit:'Medical',products:[...gel,'bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti','bone-evenity'],
  title:'UHC Medicare Part B Step Therapy Programs — Medicare Advantage',version:'IAP.001.31',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/medicare-part-b-step-therapy-programs.pdf',locator:'Page 1 application and plan exceptions; preferred/non-preferred tables for bone density agents (osteoporosis) and hyaluronic acid polymers; HCPCS tables',
  sourceSha256:'c506bc24ff8201b5d9cbdd14724a76b5e0b65ab5c3a0d124961e7be097920f83',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'Hyaluronates: Durolane, Gelsyn-3, Synvisc and Synvisc-One are preferred; Euflexxa and the other brands need trial and failure of, or intolerance to, all preferred products, or use within the past 365 days. Osteoporosis agents: Jubbonti, Prolia and Stoboclo are preferred; Bildyos, Conexxence, Enoby, Evenity and Ospomyv need minimal response to, or intolerance of, a preferred product, or continuation of therapy. The policy excludes certain plans, including Hawaiʻi Dual Complete plan H6824-002 and group HMO plans.',
  prompts:['Check whether the member\'s plan is one of the excluded plans (for example H6824-002) before applying step therapy.',
   {text:'For this non-preferred hyaluronate document trial and failure of all of Durolane, Gelsyn-3 and Synvisc/Synvisc-One with minimal clinical response, intolerance or adverse events to all of them, or continuation of prior therapy within the past 365 days.',products:uhcMaGelNonPreferred},
   {text:'For this non-preferred osteoporosis agent document a history of use of Jubbonti, Prolia or Stoboclo with minimal clinical response, a contraindication, intolerance or adverse event to Jubbonti, Prolia or Stoboclo, or continuation of prior therapy within the past 365 days.',products:B('bildyos','enoby','evenity')},
   {text:'Note that Evenity is non-preferred behind a denosumab product on this line.',products:B('evenity')},
   {text:'This product is on the preferred side of the policy\'s step-therapy table for its class.',products:[...uhcMaGelPreferred,...B('jubbonti','prolia','stoboclo')]}],
  limitations:'Medicare Advantage only; preferred lists differ from UHC commercial and Community Plan. Step therapy applies to members new to the drug per the policy\'s own definitions; read them before relying on this summary. Exact plan adoption is not verified.'},
 {id:'uhc-ma-omnibus-carpal-2026',payer:'UnitedHealthcare',lines:['Medicare Advantage'],benefit:'Medical',products:['procedure-carpal-balloon','procedure-carpal-ultrasound-other'],
  title:'UHC Omnibus Codes (Medicare Advantage) — percutaneous carpal tunnel decompression (CPT 64728)',version:'MMP107.09',effectiveFrom:'2026-06-01',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/omnibus-codes-mamp.pdf',locator:'Code table row and revision history entry for CPT 64728',
  sourceSha256:'792615956ede7a20248cb93414c6279f90e6b7f11d914ae246593eb2cb445cd8',retrievedAt:'2026-11-15',reviewDue:'2027-02-13',
  summary:'CPT 64728 is listed as not reasonable and necessary for Medicare Advantage, with a reference to the UHC commercial Omnibus Codes policy.',
  prompts:[{text:'Tell the surgeon before scheduling that this technique is listed as not reasonable and necessary on this line.',products:['procedure-carpal-balloon']},
   {text:'The Medicare Advantage code-table entry is CPT 64728 (balloon dilation) and refers to the UHC commercial Omnibus Codes policy, which lists balloon-assisted or ultrasound-guided percutaneous decompression as unproven; document the coding determination for this non-balloon technique and discuss it with the surgeon before scheduling.',products:['procedure-carpal-ultrasound-other']},
   'Use the open (64721) or endoscopic (29848) template if that is the planned operation.'],
  limitations:'Applies to the percutaneous balloon technique only; Medicare Advantage only.'},
 {id:'uhc-sourcing-2026',payer:'UnitedHealthcare',lines:['Commercial'],benefit:'Medical',products:[],allProducts:true,referenceType:'sourcing',
  title:'UHC Commercial Medication Sourcing Protocol',version:'PCA-1-26-01739-E&I-QRG_09102026',effectiveFrom:null,
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/UHC-Admin-Drug-Chart.pdf',locator:'Page 1 overview and the applicable drug/site table',
  sourceSha256:'a61213afc1571ec38f6a11dcedcd90ffb28617053d203101f18d98104e16ad25',
  summary:'For listed drugs and applicable outpatient settings, the designated pharmacy bills the medical-benefit drug; the administering provider bills administration only. Excludes UHC West, UMR, Student Resources, UnitedHealthOne and Sierra; state-law exceptions apply.',
  prompts:['Check the exact medication and site table, excluded plan entities, state exceptions and any payer-authorized sourcing exception.'],
  limitations:'This is a general sourcing reference. Absence from this extract, coverage on a formulary, or a medical benefit does not prove buy-and-bill permission. The publication code is not an effective date.'},
 // Traditional Medicare (Noridian JE, the Part A/B MAC whose contractor information lists Hawaiʻi).
 // These are public web documents on the CMS Medicare Coverage Database identified by LCD/article ID and
 // version, so they carry no PDF fingerprint. An LCD applies to all Original Medicare beneficiaries in the
 // jurisdiction; it never applies to Medicare Advantage plans, which set their own rules.
 {id:'medicare-noridian-tka-l36575',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee'],
  title:'Noridian JE LCD L36575 — Total Knee Arthroplasty',version:'L36575 v21; revision effective 11/06/2025; Billing and Coding Article A57685 v15 effective 01/01/2026',effectiveFrom:'2025-11-06',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=36575&ver=21',documentId:'L36575',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Coverage Indications, Limitations, and/or Medical Necessity; A57685 Documentation Requirements. Contractor information lists Hawaiʻi (contracts 01211/01212, Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'TKA is medically necessary for advanced joint disease shown by radiographic (or MRI/CT when radiographs are inadequate) findings such as subchondral cysts, subchondral sclerosis, periarticular osteophytes, joint subluxation, joint space narrowing or avascular necrosity, with pain or functional disability, and, if appropriate, a documented unsuccessful conservative-therapy history (anti-inflammatory medications or analgesics, flexibility and strengthening exercises, supervised PT, assistive devices, weight reduction, therapeutic injections) or a documented rationale why conservative therapy is not reasonable. Other indications include failed osteotomy, distal femur or proximal tibia fracture, malignancy, failed unicompartmental replacement and avascular necrosis. Revision indications and absolute/relative contraindications (active joint, urinary, dental or skin infection, rapidly progressive neurological disease; extensor mechanism insufficiency, rapidly destructive bone process, neurotrophic arthritis) are listed in the LCD.',
  prompts:[{text:'Document the imaging modality, date and the specific LCD-listed findings (one or more of subchondral cysts, sclerosis, osteophytes, subluxation, degree of joint space narrowing, avascular necrosis, bone-on-bone).',products:['procedure-total-knee']},
   {text:'Describe pain or functional disability in context (ADL interference, weight-bearing pain) and the dated conservative-therapy trial or the documented reason it is not appropriate.',products:['procedure-total-knee']},
   {text:'For revision, document the specific failure mechanism from the LCD list.',products:['procedure-revision-knee']},
   {text:'LCD L36575 addresses unicompartmental replacement in a separate paragraph; document the findings that paragraph requires rather than the TKA list.',products:['procedure-partial-knee']},
   'For patients with significant comorbidities, document the risk/benefit discussion.'],
  limitations:'Original Medicare has no prior authorization for TKA; the LCD governs medical-necessity review of the claim and record. The LCD states that unicompartmental replacement is addressed separately in its text; review that paragraph before relying on it for 27446. Not applicable to Medicare Advantage. Web document without PDF fingerprint; confirm the current version on the MCD before use.'},
 {id:'medicare-noridian-tha-l34163',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-total-hip','procedure-revision-hip'],
  title:'Noridian JE LCD L34163 — Total Hip Arthroplasty',version:'L34163 v33; revision effective 11/06/2025; Billing and Coding Article A57683 v11 effective 11/06/2025',effectiveFrom:'2025-11-06',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=34163&ver=33',documentId:'L34163',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Coverage Indications, Limitations, and/or Medical Necessity; A57683 Documentation Requirements. Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'THA is medically necessary for advanced joint disease shown by radiographic (or MRI/CT) findings (subchondral cysts, subchondral sclerosis, periarticular osteophytes, joint subluxation, severe joint space narrowing, avascular necrosis) AND pain not adequately controlled despite optimal conservative treatment or functional disability AND, if appropriate, documented unsuccessful conservative therapy or the rationale for bypassing it. Other indications: malignancy of pelvis/proximal femur, avascular necrosis of the femoral head, femoral neck or acetabular fracture, non-union or failed hip fracture surgery, mal-union. Revision indications (loosening, implant fracture/failure, recurrent dislocation, infection, periprosthetic fracture, significant leg-length inequality, bone loss, bearing wear, audible noise, adverse local tissue reaction) and contraindications are listed in the LCD.',
  prompts:[{text:'Document imaging modality, date and the LCD-listed hip findings.',products:['procedure-total-hip']},
   {text:'Document pain despite optimal conservative treatment or functional disability, with dated conservative measures or the documented reason they are not appropriate.',products:['procedure-total-hip']},
   {text:'For revision, document the LCD-listed failure mechanism.',products:['procedure-revision-hip']},
   'Document the comorbidity risk/benefit discussion when relevant.'],
  limitations:'Original Medicare has no prior authorization for THA; the LCD governs medical-necessity review. Not applicable to Medicare Advantage. Web document without PDF fingerprint; confirm the current version on the MCD before use.'},
 {id:'medicare-noridian-sij-fusion-l39810',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-si-joint-fusion'],
  title:'Noridian JE LCD L39810 — Minimally Invasive Arthrodesis of the Sacroiliac Joint',version:'L39810 v13; revision effective 10/23/2025; Billing and Coding Article A59695 v12 effective 01/01/2026 (descriptor changes to CPT 27278 and 27279)',effectiveFrom:'2025-10-23',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39810&ver=13',documentId:'L39810',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Covered Indications and Limitations. Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'Minimally invasive SIJ arthrodesis WITH placement of a transfixation device is reasonable and necessary only when ALL criteria are met: the patient meets L39462 (Sacroiliac Joint Injections and Procedures) requirements including at least one diagnostic block with ≥75% pain reduction; a trial of at least one therapeutic intra-articular corticosteroid injection with ≥50% pain reduction for the expected duration of the agent; and imaging that includes plain radiographs plus CT or MRI of the SIJ excluding destructive lesions, fracture, traumatic instability or inflammatory arthropathy, an AP pelvis radiograph to rule out hip pathology, and lumbar CT or MRI to rule out neural compression or other degenerative causes. Arthrodesis WITHOUT a transfixation device is NOT considered reasonable and necessary. Limitations: absence of generalized pain behavior or disorders, and participation in an ongoing rehabilitation, home exercise or functional restoration program.',
  prompts:['Document the diagnostic SIJ block(s): guidance, agent, same-scale pre/post pain scores and ≥75% relief for the anesthetic duration.','Document the therapeutic intra-articular corticosteroid injection and ≥50% relief for its expected duration.','Document all three imaging elements (SIJ radiographs plus CT/MRI; AP pelvis; lumbar CT/MRI) and their exclusion findings.','Document the device/technique as transfixation (device piercing the iliac and sacral cortices) versus intra-articular-only, the ongoing rehabilitation plan, and screening for generalized pain disorders.'],
  limitations:'Original Medicare has no prior authorization for this procedure; the LCD governs medical-necessity review of the claim and record. Applies to Original Medicare only; Medicare Advantage and commercial payers have separate policies. The LCD text notes that 2026 CPT language distinguishes devices that pierce the cortices (27279) from intra-articular-only placement; confirm current descriptors and the billing article before coding. Web document without PDF fingerprint.'},
 {id:'medicare-noridian-sij-injections-l39462',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-si-joint-fusion'],
  title:'Noridian JE LCD L39462 — Sacroiliac Joint Injections and Procedures',version:'L39462 v9; revision effective 03/05/2026 (L39464 retired 03/05/2026)',effectiveFrom:'2026-03-05',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39462&ver=9',documentId:'L39462',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Covered Indications A (SIJI), B (diagnostic SIJI) and C (therapeutic SIJI). Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'Prerequisite policy for SIJ fusion under L39810. SIJ injections require moderate to severe low back pain over the SI joints between the iliac crests and gluteal fold for at least 3 months, below L5 without radiculopathy, no other obvious cause on clinical findings or imaging, at least three positive provocative maneuvers (FABER, Gaenslen, thigh thrust/posterior shear, compression, distraction, Yeoman) and persistence despite at least four weeks of conservative therapy. Diagnostic injections must use CT or fluoroscopic guidance with contrast (ultrasound only for documented contrast allergy or pregnancy), must not be combined with other lumbosacral injections, and must show ≥75% relief of index pain on the same pain scale measured pre-injection, post-injection and on following days; no more than two diagnostic sessions.',
  prompts:['Document pain location, duration ≥3 months, absence of radiculopathy and the three or more positive provocative maneuvers by name.','Document the ≥4 weeks of conservative therapy and the imaging/clinical exclusion of other causes.','Document guidance modality, contrast, same-scale pain scores and the number of diagnostic sessions.'],
  limitations:'Original Medicare only. This LCD is cited here because L39810 incorporates its requirements; it is not a fusion policy by itself. Web document without PDF fingerprint.'},
 {id:'medicare-noridian-ha-proposed-dl40456',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',products:gel,proposed:true,
  title:'Noridian JE PROPOSED LCD DL40456 — Hyaluronic Acid Injections for Knee Osteoarthritis (NOT IN EFFECT)',version:'DL40456 proposed; MCD page updated 09/23/2026; no effective date',effectiveFrom:null,
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=40455&ver=5',documentId:'DL40456',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Proposed Covered Indications and Limitations. Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'PROPOSED criteria only: symptomatic knee OA with pain interfering with function; radiographic evidence of OA; trial and failure of or contraindication to at least 3 months of non-pharmacologic and pharmacologic conservative therapy; failure of or contraindication to intra-articular glucocorticoid injection. A repeat series would require continued eligibility, recurrence, documented improvement after the prior series and at least 6 months since it. Proposed limitations include FDA-labeled dose and frequency, no use as initial treatment, OA diagnosis only, and ultrasound or fluoroscopy as the only needle-guidance imaging considered reasonable.',
  prompts:['Do not apply these criteria as current Medicare requirements; there is no active Noridian hyaluronan LCD for Hawaiʻi.','If the LCD is finalized, re-review the final text, effective date and billing article before updating documentation templates.'],
  limitations:'Proposed LCDs are not a reflection of the current policies or practices of the contractor. Current Original Medicare claims are reviewed under general reasonable-and-necessary and FDA-labeling rules. Not applicable to Medicare Advantage. Web document without PDF fingerprint.'},
 {id:'medicare-partb-osteoporosis-drugs-2026',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['bone-prolia','bone-jubbonti','bone-bildyos','bone-enoby','bone-stoboclo','bone-evenity','bone-reclast'],
  title:'Medicare Part B (Noridian JE) — no LCD, billing article or SAD exclusion found for denosumab, romosozumab or zoledronic acid',version:'CMS Medicare Coverage Database API search, 2026-11-08 (Hawaiʻi policy day)',effectiveFrom:null,
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/search.aspx',documentId:'MCD-search-2026-11-08',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Local coverage search (LCD and article) for denosumab, romosozumab, zoledronic and osteoporosis; Self-Administered Drug exclusion list search by HCPCS J0897, J3111 and J3489.',
  sourceSha256:null,directoryOnly:true,
  summary:'Searches of the Medicare Coverage Database on 2026-11-08 (Hawaiʻi policy day) returned no Noridian LCD or billing article for denosumab, romosozumab or zoledronic acid; the only denosumab billing article found (A52399) belongs to Wellpoint Federal and does not apply in Hawaiʻi. None of J0897, J3111 or J3489 appears on any current Self-Administered Drug exclusion list, so Part B coverage of office-administered doses rests on the incident-to benefit, FDA-labeled indication and claim-level medical-necessity documentation rather than a local policy.',
  prompts:['Document the FDA-labeled indication, DXA or fracture history and prior therapy as medical-necessity support even though no LCD applies.','Confirm office administration under the incident-to benefit, correct HCPCS billing units and the diagnosis code; Original Medicare does not use prior authorization for these drugs.'],
  limitations:'Absence of an LCD is not a coverage guarantee; the MAC may review medical necessity on a claim basis and MCD content changes. Medicare Advantage plans (for example HMSA Akamai Advantage, UHC/MDX, Kaiser Senior Advantage, Humana) have their own prior authorization rules and preferred products and are not covered by this record. Re-run the search before relying on it.'}
].map(s=>Object.freeze({...s,lines:Object.freeze(s.lines),products:Object.freeze(s.products),
 // A prompt is a string (every product the record lists) or {text,products} (only those products).
 prompts:Object.freeze(s.prompts.map(p=>typeof p==='string'?p:Object.freeze({text:p.text,products:Object.freeze([...p.products])}))),
 retrievedAt:s.retrievedAt||'2026-11-07',reviewDue:s.reviewDue||'2027-02-05',sourceRetrieved:true,planAdoptionVerified:false,orderingAllowed:false})));
export const EVIDENCE_REFERENCE_TYPES=Object.freeze(['policy','sourcing']);
export const EVIDENCE_DIGEST_STATUSES=Object.freeze(['bound','directory-only','unbound-pending-reverification']);
export const evidenceDigestStatus=s=>s.digestStatus||(s.directoryOnly===true?'directory-only':'bound');
const validPrompt=(p,s)=>typeof p==='string'?!!p.trim():!!p&&typeof p==='object'&&Object.keys(p).every(k=>['text','products'].includes(k))&&typeof p.text==='string'&&!!p.text.trim()&&
 Array.isArray(p.products)&&p.products.length>0&&p.products.every(x=>typeof x==='string'&&s.products.includes(x));
// The prompts that apply to one product: unscoped strings plus the scoped prompts naming that product.
export function promptsFor(record,productId=''){
 return Object.freeze((record?.prompts||[]).filter(p=>typeof p==='string'||(!!productId&&p.products.includes(productId))).map(p=>typeof p==='string'?p:p.text));
}
export function validatePayerEvidence(rows=PAYER_POLICY_EVIDENCE){
 if(!Array.isArray(rows)||!rows.length)throw Error('Missing public payer evidence');
 const ids=new Set();
 for(const s of rows){
  const host=new URL(s.sourceUrl).hostname;
  if(!['id','title','version','payer','locator','summary','limitations'].every(k=>typeof s[k]==='string'&&s[k].trim())||
   !Array.isArray(s.lines)||!s.lines.length||!s.lines.every(x=>typeof x==='string')||!Array.isArray(s.products)||!s.products.every(x=>typeof x==='string')||
   !Array.isArray(s.prompts)||!s.prompts.every(p=>validPrompt(p,s))||s.sourceRetrieved!==true||!['Medical','Pharmacy'].includes(s.benefit)||ids.has(s.id)||!validPublicSource(s.sourceUrl)||!['www.hmsa.com','www1.radmd.com','www.uhcprovider.com','www.cms.gov'].includes(host)||!(s.directoryOnly===true&&s.sourceSha256===null||validSourceDigest(s.sourceSha256))||
   !validPolicyDate(s.retrievedAt)||!validPolicyDate(s.reviewDue)||s.reviewDue<s.retrievedAt||(Date.parse(s.reviewDue)-Date.parse(s.retrievedAt))/86400000>90||
   (s.effectiveFrom!==null&&!validPolicyDate(s.effectiveFrom))||s.planAdoptionVerified!==false||s.orderingAllowed!==false||
   !(s.products.length>0||s.allProducts===true)||(s.referenceType!==undefined&&!EVIDENCE_REFERENCE_TYPES.includes(s.referenceType))||
   !EVIDENCE_DIGEST_STATUSES.includes(evidenceDigestStatus(s))||(evidenceDigestStatus(s)==='unbound-pending-reverification'&&!validSourceDigest(s.registerSha256)))throw Error('Invalid public payer evidence');
  ids.add(s.id);
 }
 return true;
}
// OVERDUE means the review window has passed as of today (or the record post-dates today). A service booked
// after a current window is a separate state: the source is fresh, but must be re-checked nearer the service date.
export const REVIEW_STATES=Object.freeze(['overdue','ends-before-service','due-soon','current']);
const DUE_SOON_DAYS=30;
function reviewFields(s,asOf,serviceDate){
 const overdue=s.reviewDue<asOf||s.retrievedAt>asOf;
 const days=Math.round((Date.parse(s.reviewDue+'T00:00:00Z')-Date.parse(asOf+'T00:00:00Z'))/86400000);
 const endsBeforeService=!overdue&&s.reviewDue<serviceDate,dueSoon=!overdue&&days>=0&&days<=DUE_SOON_DAYS;
 return {reviewOverdue:overdue,reviewEndsBeforeService:endsBeforeService,reviewDueSoon:dueSoon,reviewDueInDays:days,
  reviewState:overdue?'overdue':endsBeforeService?'ends-before-service':dueSoon?'due-soon':'current'};
}
// Returned records are frozen copies whose prompts are already narrowed to scope.productId.
export function payerEvidenceFor(scope={},asOf=policyDay()){
 if(!validPolicyDate(asOf)||!validPolicyDate(scope.serviceDate))return [];
 return PAYER_POLICY_EVIDENCE.filter(s=>s.payer===scope.payer&&s.lines.includes(scope.line)&&s.benefit===scope.benefit&&
  (s.products.includes(scope.productId)||s.allProducts&&scope.medication===true)&&(!s.effectiveFrom||s.effectiveFrom<=scope.serviceDate))
  .map(s=>Object.freeze({...s,prompts:promptsFor(s,scope.productId),...reviewFields(s,asOf,scope.serviceDate),applicability:'requires-exact-plan-review'}));
}
function reviewLine(s){
 const checked=s.directoryOnly?'directory entry / web document checked '+s.retrievedAt+'; no file fingerprint':'fingerprinted snapshot reviewed '+s.retrievedAt;
 const n=s.reviewDueInDays,state=s.reviewState==='overdue'?'OVERDUE'
  :s.reviewState==='ends-before-service'?`Reviewed ${s.retrievedAt}; this review window ends ${s.reviewDue}, before the service date: re-check closer to the date of service`
  :s.reviewState==='due-soon'?`${checked}; review due ${s.reviewDue} (${n===0?'today':n===1?'in 1 day':'in '+n+' days'})`:checked;
 return `Review: ${state}${s.reviewState==='overdue'?'':'; exact-plan applicability unverified'}${s.versionConfirmationRequired?'; current guideline version requires confirmation':''}`;
}
export function payerVerificationWorksheet(scope={},asOf=policyDay()){
 const refs=payerEvidenceFor(scope,asOf),requestType=scope.requestType||'Initial';
 const branches=refs.length?documentationBranchesFor(refs.map(s=>s.id),requestType,scope.productId||''):[];
 return ['SYNTHETIC PAYER VERIFICATION WORKSHEET — NOT FOR SUBMISSION',
  `Scope: ${scope.payer||'[PAYER]'} / ${scope.planId||'[EXACT PLAN PRODUCT]'} / ${scope.line||'[LINE]'} / ${scope.benefit||'[BENEFIT]'} / ${scope.productId||'[PRODUCT]'} / ${scope.setting||'[SETTING]'} / ${scope.state||'[STATE]'} / ${scope.serviceDate?(scope.serviceDateDefaulted?'[DATE NOT SELECTED — policy context used '+scope.serviceDate+']':scope.serviceDate):'[DATE]'}`,
  ...(scope.secondaryPayer?[`Original Medicare primary claim (${scope.secondaryPayer} pays secondary): the references below are Original Medicare's; the supplement's own terms are NOT VERIFIED`]:[]),
  'Exact member plan adoption: NOT VERIFIED','Patient eligibility, authorization and coverage: NOT VERIFIED',
  'Supplier, network, acquisition route and reimbursement: NOT VERIFIED','Ordering: BLOCKED',
  ...refs.flatMap(s=>['',`PUBLIC REFERENCE: ${s.title}${s.referenceType==='sourcing'?' (sourcing reference, not a coverage or criteria source)':''}`,`Version: ${s.version}; ${s.locator}; SHA-256: ${s.sourceSha256||(evidenceDigestStatus(s)==='unbound-pending-reverification'?'register digest '+s.registerSha256+' PENDING RE-VERIFICATION (not bound)':'NOT CAPTURED — DIRECTORY ENTRY / WEB DOCUMENT')}`,s.sourceUrl,
   reviewLine(s),s.summary,...s.prompts.map(p=>p+' [NOT DOCUMENTED]'),s.limitations]),
  ...(refs.length?[]:['No matching public reference imported. Obtain the exact policy; do not infer requirements.']),
  ...(refs.length?['','PAYER-POLICY DOCUMENTATION PROMPTS (public reference; plan adoption not verified)','Request type: '+requestType,
   ...(branches.length?branches.flatMap(b=>['',b.title,...b.fields.map(f=>'- '+f.label+' [NOT DOCUMENTED]'),'Note: '+b.notes])
    :['No documentation branch matches this request type and product; review the source policy manually.'])]:[]),
  '', 'Verification attachments to obtain in approved workflow:',
  '1. Exact plan/product and benefit adoption document with applicable dates and source version/hash.',
  '2. Patient-specific eligibility and approval or evidenced no-PA determination.',
  '3. Supplier/network/site permission, shipping restrictions, drug versus administration reimbursement and cost-sharing.',
  '4. Current surgical guideline adoption, code grouping and separate facility review where applicable.',
  'Clinician/payer verification: [NOT COMPLETED]'].join('\n');
}
// Branches live in a module with no imports, so their evidence and product scope are checked here.
export function validateDocumentationBranches(branches=PAYER_DOCUMENTATION_BRANCHES,rows=PAYER_POLICY_EVIDENCE){
 const ids=new Set(),types=['Initial','Repeat / continuation','Reconsideration / appeal'];
 for(const b of branches){
  const s=rows.find(r=>r.id===b.evidenceId);
  if(!s||ids.has(b.id)||typeof b.title!=='string'||!b.title.trim()||typeof b.notes!=='string'||!b.requestTypes.length||!b.requestTypes.every(t=>types.includes(t))||
   (b.products&&(!b.products.length||!b.products.every(p=>s.products.includes(p))))||!b.fields.length||!b.fields.every(f=>f.id&&typeof f.label==='string'&&f.label.trim()))
   throw Error('Invalid documentation branch '+b.id);
  ids.add(b.id);
 }
 return true;
}
validatePayerEvidence();
validateDocumentationBranches();
