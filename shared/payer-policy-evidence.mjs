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
  sourceSha256:null,directoryOnly:true,digestStatus:'unbound-pending-reverification',registerSha256:'9f0be97828c56547d5c90f5240b1e978fe2781d30738d610cbcfaf5201ffcfdf',
  summary:'Separates primary requests and related code groupings. Bilateral same-day joint surgery requires separate authorizations. Evolent does not manage facility precertification; emergency-department services are outside this program.',
  prompts:['Confirm exact primary procedure, side and associated code groupings.','Review professional and facility authorizations separately; bilateral requests need separate review.'],
  limitations:'A utilization matrix is not a complete clinical-criteria policy or a payment guarantee. This is a direct PDF whose 2026-11-07 digest is held in docs/policy-source-checksums.json but was de-linked from this record on 2026-11-08; re-download the file and match that digest before treating it as a fingerprinted snapshot.'},
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
  limitations:'Directory-level verification only: policy existence and effective date were confirmed on the official directory; the MA policy text itself has not been retrieved or fingerprinted. Exact member plan adoption, criteria and supply route are not verified.'},
 {id:'hmsa-gel-ma-preference-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:gel,
  title:'HMSA Hyaluronates Preferred Drug Program — Medicare Advantage',version:'2026-01-01',effectiveFrom:'2026-01-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/',locator:'Official M–Z directory: Synvisc and Synvisc One MA preferred program, effective 01/01/2026',
  sourceSha256:null,directoryOnly:true,
  summary:'A separate Medicare Advantage preferred-product program exists. The directory does not establish a universal preferred brand or exception requirements.',
  prompts:['Verify the exact MA product preference and exception policy for the requested gel.'],
  limitations:'Directory-level verification only; no verified plan adoption, sourcing route or complete product preference. The MA preferred-program document itself has not been retrieved or fingerprinted.'},
 {id:'hmsa-prolia-ma-2026',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:['bone-prolia','bone-bildyos','bone-enoby','bone-stoboclo','bone-jubbonti'],
  title:'HMSA Prolia and Biosimilars — Medicare Advantage',version:'2026-10-01',effectiveFrom:'2026-10-01',
  sourceUrl:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/',documentId:'hmsa-prolia-ma.pdf',locator:'Prolia (Medicare Advantage), sections B–C, page 2; PDF reviewed and fingerprinted 2026-11-06',
  sourceSha256:'83cd86c7d690b9d58bb56325c44bdca99e75c5d152c8567e50681a8f9840e9d3',retrievedAt:'2026-11-06',reviewDue:'2027-02-04',
  summary:'Bildyos is the preferred product in the Medicare Advantage policy; a listed nonpreferred product (Prolia, Enoby, Stoboclo, Jubbonti) requires the section B exception (qualifying Bildyos response or event, or the requested product already used within 365 days). Clinical criteria address osteoporosis in a man or postmenopausal woman with high fracture risk; other indications and continuation use different criteria. The Commercial/QUEST Jubbonti preference does not apply here.',
  prompts:['Identify the MA indication branch (osteoporosis in a man or postmenopausal woman, high fracture risk) and the requested product.','For a nonpreferred product, document the section B exception: the qualifying Bildyos response or event, or the dated prior use of the requested product within 365 days.','Verify medical versus pharmacy benefit and specialty-pharmacy versus buy-and-bill route independently.'],
  limitations:'Reviewed PDF snapshot; exact member plan (Akamai Advantage product), adoption, supplier and payment are not verified. Continuation and non-osteoporosis indications are outside this extract.'},
 {id:'hmsa-evenity-ma-2025',payer:'HMSA',lines:['Medicare Advantage'],benefit:'Medical',products:['bone-evenity'],
  title:'HMSA Evenity — Medicare Advantage',version:'2025-06-27',effectiveFrom:'2025-06-27',
  sourceUrl:drugDirectory,documentId:'hmsa-evenity-ma.pdf',locator:'Evenity (Medicare Advantage), sections B and F, pages 1 and 3; PDF reviewed and fingerprinted 2026-11-06',
  sourceSha256:'dbfc5b1a4a2990c13a24ed9852ad05fb0ffc7492d59d60fbc4ba5f5f794f9175',retrievedAt:'2026-11-06',reviewDue:'2027-02-04',
  summary:'Initial therapy for postmenopausal osteoporosis with high fracture risk; total treatment authorization no longer than 12 months; the requested regimen is checked against current labeling. Do not substitute the Commercial/QUEST alternative pathways.',
  prompts:['Document postmenopausal osteoporosis, the basis for high fracture risk and the planned monthly course within the 12-month limit.','Confirm the requested regimen against current labeling and record prior osteoporosis therapy.'],
  limitations:'Reviewed PDF snapshot of the initial-therapy section only; exact member plan adoption, supplier and payment are not verified.'},
 {id:'uhc-knee-2026',payer:'UnitedHealthcare',lines:['Commercial','Individual Exchange'],benefit:'Medical',
  products:['procedure-total-knee','procedure-partial-knee','procedure-revision-knee','procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant'],
  title:'UHC Surgery of the Knee — Commercial and Individual Exchange',version:'2026T0553J',effectiveFrom:'2026-09-10',
  sourceUrl:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
  locator:'Pages 1–3: application, coverage rationale, medical records documentation, applicable codes',
  sourceSha256:null,directoryOnly:true,
  summary:'UHC medical policy refers to InterQual CP and proprietary client-defined criteria for total knee, unicondylar/patellofemoral replacement and other knee surgery. The publicly available policy does not supply the full InterQual thresholds.',
  prompts:['Verify exact plan product and whether delegated utilization management applies.','Obtain the applicable licensed InterQual criteria and medical records list before asserting a threshold.'],
  limitations:'Public UHC policy verified, but document digest not captured; proprietary criteria and exact-plan adoption are not verified. This is not a PA approval or a determination that a specific procedure is covered.'},
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
  prompts:['Document the imaging modality, date and the specific LCD-listed findings (one or more of subchondral cysts, sclerosis, osteophytes, subluxation, degree of joint space narrowing, avascular necrosis, bone-on-bone).','Describe pain or functional disability in context (ADL interference, weight-bearing pain) and the dated conservative-therapy trial or the documented reason it is not appropriate.','For revision, document the specific failure mechanism from the LCD list; for patients with significant comorbidities, document the risk/benefit discussion.'],
  limitations:'Original Medicare has no prior authorization for TKA; the LCD governs medical-necessity review of the claim and record. The LCD states that unicompartmental replacement is addressed separately in its text; review that paragraph before relying on it for 27446. Not applicable to Medicare Advantage. Web document without PDF fingerprint; confirm the current version on the MCD before use.'},
 {id:'medicare-noridian-tha-l34163',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-total-hip','procedure-revision-hip'],
  title:'Noridian JE LCD L34163 — Total Hip Arthroplasty',version:'L34163 v33; revision effective 11/06/2025; Billing and Coding Article A57683 v11 effective 11/06/2025',effectiveFrom:'2025-11-06',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=34163&ver=33',documentId:'L34163',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Coverage Indications, Limitations, and/or Medical Necessity; A57683 Documentation Requirements. Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'THA is medically necessary for advanced joint disease shown by radiographic (or MRI/CT) findings (subchondral cysts, subchondral sclerosis, periarticular osteophytes, joint subluxation, severe joint space narrowing, avascular necrosis) AND pain not adequately controlled despite optimal conservative treatment or functional disability AND, if appropriate, documented unsuccessful conservative therapy or the rationale for bypassing it. Other indications: malignancy of pelvis/proximal femur, avascular necrosis of the femoral head, femoral neck or acetabular fracture, non-union or failed hip fracture surgery, mal-union. Revision indications (loosening, implant fracture/failure, recurrent dislocation, infection, periprosthetic fracture, significant leg-length inequality, bone loss, bearing wear, audible noise, adverse local tissue reaction) and contraindications are listed in the LCD.',
  prompts:['Document imaging modality, date and the LCD-listed hip findings.','Document pain despite optimal conservative treatment or functional disability, with dated conservative measures or the documented reason they are not appropriate.','For revision, document the LCD-listed failure mechanism; document the comorbidity risk/benefit discussion when relevant.'],
  limitations:'Original Medicare has no prior authorization for THA; the LCD governs medical-necessity review. Not applicable to Medicare Advantage. Web document without PDF fingerprint; confirm the current version on the MCD before use.'},
 {id:'medicare-noridian-sij-fusion-l39810',payer:'Traditional Medicare',lines:['Traditional Medicare'],benefit:'Medical',
  products:['procedure-si-joint-fusion'],
  title:'Noridian JE LCD L39810 — Minimally Invasive Arthrodesis of the Sacroiliac Joint',version:'L39810 v13; revision effective 10/23/2025; Billing and Coding Article A59695 v12 effective 01/01/2026 (descriptor changes to CPT 27278 and 27279)',effectiveFrom:'2025-10-23',
  sourceUrl:'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39810&ver=13',documentId:'L39810',retrievedAt:'2026-11-08',reviewDue:'2027-02-06',locator:'Covered Indications and Limitations. Contractor information lists Hawaiʻi (Jurisdiction E).',
  sourceSha256:null,directoryOnly:true,
  summary:'Minimally invasive SIJ arthrodesis WITH placement of a transfixation device is reasonable and necessary only when ALL criteria are met: the patient meets L39462 (Sacroiliac Joint Injections and Procedures) requirements including at least one diagnostic block with ≥75% pain reduction; a trial of at least one therapeutic intra-articular corticosteroid injection with ≥50% pain reduction for the expected duration of the agent; and imaging that includes plain radiographs plus CT or MRI of the SIJ excluding destructive lesions, fracture, traumatic instability or inflammatory arthropathy, an AP pelvis radiograph to rule out hip pathology, and lumbar CT or MRI to rule out neural compression or other degenerative causes. Arthrodesis WITHOUT a transfixation device is NOT considered reasonable and necessary. Limitations: absence of generalized pain behavior or disorders, and participation in an ongoing rehabilitation, home exercise or functional restoration program.',
  prompts:['Document the diagnostic SIJ block(s): guidance, agent, same-scale pre/post pain scores and ≥75% relief for the anesthetic duration.','Document the therapeutic intra-articular corticosteroid injection and ≥50% relief for its expected duration.','Document all three imaging elements (SIJ radiographs plus CT/MRI; AP pelvis; lumbar CT/MRI) and their exclusion findings.','Document the device/technique as transfixation (device piercing the iliac and sacral cortices) versus intra-articular-only, the ongoing rehabilitation plan, and screening for generalized pain disorders.'],
  limitations:'Applies to Original Medicare only; Medicare Advantage and commercial payers have separate policies. The LCD text notes that 2026 CPT language distinguishes devices that pierce the cortices (27279) from intra-articular-only placement; confirm current descriptors and the billing article before coding. Web document without PDF fingerprint.'},
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
].map(s=>Object.freeze({...s,lines:Object.freeze(s.lines),products:Object.freeze(s.products),prompts:Object.freeze(s.prompts),retrievedAt:s.retrievedAt||'2026-11-07',reviewDue:s.reviewDue||'2027-02-05',sourceRetrieved:true,planAdoptionVerified:false,orderingAllowed:false})));
export const EVIDENCE_REFERENCE_TYPES=Object.freeze(['policy','sourcing']);
export const EVIDENCE_DIGEST_STATUSES=Object.freeze(['bound','directory-only','unbound-pending-reverification']);
export const evidenceDigestStatus=s=>s.digestStatus||(s.directoryOnly===true?'directory-only':'bound');
export function validatePayerEvidence(rows=PAYER_POLICY_EVIDENCE){
 if(!Array.isArray(rows)||!rows.length)throw Error('Missing public payer evidence');
 const ids=new Set();
 for(const s of rows){
  const host=new URL(s.sourceUrl).hostname;
  if(!['id','title','version','payer','locator','summary','limitations'].every(k=>typeof s[k]==='string'&&s[k].trim())||
   !Array.isArray(s.lines)||!s.lines.length||!s.lines.every(x=>typeof x==='string')||!Array.isArray(s.products)||!s.products.every(x=>typeof x==='string')||
   !Array.isArray(s.prompts)||!s.prompts.every(x=>typeof x==='string'&&x.trim())||s.sourceRetrieved!==true||!['Medical','Pharmacy'].includes(s.benefit)||ids.has(s.id)||!validPublicSource(s.sourceUrl)||!['www.hmsa.com','www1.radmd.com','www.uhcprovider.com','www.cms.gov'].includes(host)||!(s.directoryOnly===true&&s.sourceSha256===null||validSourceDigest(s.sourceSha256))||
   !validPolicyDate(s.retrievedAt)||!validPolicyDate(s.reviewDue)||s.reviewDue<s.retrievedAt||(Date.parse(s.reviewDue)-Date.parse(s.retrievedAt))/86400000>90||
   (s.effectiveFrom!==null&&!validPolicyDate(s.effectiveFrom))||s.planAdoptionVerified!==false||s.orderingAllowed!==false||
   !(s.products.length>0||s.allProducts===true)||(s.referenceType!==undefined&&!EVIDENCE_REFERENCE_TYPES.includes(s.referenceType))||
   !EVIDENCE_DIGEST_STATUSES.includes(evidenceDigestStatus(s))||(evidenceDigestStatus(s)==='unbound-pending-reverification'&&!validSourceDigest(s.registerSha256)))throw Error('Invalid public payer evidence');
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
  ...refs.flatMap(s=>['',`PUBLIC REFERENCE: ${s.title}${s.referenceType==='sourcing'?' (sourcing reference, not a coverage or criteria source)':''}`,`Version: ${s.version}; ${s.locator}; SHA-256: ${s.sourceSha256||(evidenceDigestStatus(s)==='unbound-pending-reverification'?'register digest '+s.registerSha256+' PENDING RE-VERIFICATION (not bound)':'NOT CAPTURED — DIRECTORY ENTRY / WEB DOCUMENT')}`,s.sourceUrl,
   `Review: ${s.reviewOverdue?'OVERDUE':(s.directoryOnly?'directory entry / web document checked '+s.retrievedAt+'; no file fingerprint':'fingerprinted snapshot reviewed '+s.retrievedAt)+'; exact-plan applicability unverified'}${s.versionConfirmationRequired?'; current guideline version requires confirmation':''}`,
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
