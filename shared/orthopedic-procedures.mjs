/**
 * PUBLIC, SYNTHETIC-ONLY orthopedic utilization-management reference catalog.
 * CPT/HCPCS codes are informational examples, not a claim, guarantee of coverage,
 * complete coding set, or a substitute for current payer rules/AMA licenses.
 * No patient data, treatment decisions, authorization submissions or PHI.
 */
export const orthoCategories=Object.freeze([
  {id:'injections',label:'Gel injections'},
  {id:'arthroplasty',label:'Hip & knee replacements'},
  {id:'cartilage',label:'MACI & cartilage'},
  {id:'hand',label:'Carpal tunnel & trigger finger'},
  {id:'sports',label:'Sports knee'},
  {id:'spine',label:'SI joint'}
]);
export const orthoPayers=Object.freeze([
  'HMSA','UnitedHealthcare','UHA','Curative','HMAA','Kaiser Permanente',
  'AlohaCare','ʻOhana / Wellcare','Humana','Devoted Health','MDX','HMA / Verdegard',
  'Traditional Medicare','Veterans Affairs','TRICARE','Workers compensation','Other'
]);
export const orthoLines=Object.freeze([
  'Commercial','Individual Exchange','QUEST / Medicaid','Medicare Advantage',
  'Traditional Medicare','Federal employee / postal','VA / Community Care','TRICARE','Workers compensation'
]);
export const orthoSettings=Object.freeze([
  'Office','ASC','Hospital outpatient','Hospital inpatient'
]);
export const orthoRequestTypes=Object.freeze(['Initial','Repeat / continuation','Reconsideration / appeal']);
export const orthoGelProducts=Object.freeze([
  {id:'durolane',name:'Durolane',code:'J7318',unit:'per mg'},
  {id:'euflexxa',name:'Euflexxa',code:'J7323',unit:'per dose'},
  {id:'gel-one',name:'Gel-One',code:'J7326',unit:'per dose'},
  {id:'gelsyn-3',name:'Gelsyn-3',code:'J7328',unit:'per 0.1 mg'},
  {id:'genvisc',name:'GenVisc 850',code:'J7320',unit:'per mg'},
  {id:'hyalgan',name:'Hyalgan',code:'J7321',unit:'per dose'},
  {id:'hymovis',name:'Hymovis',code:'J7322',unit:'per mg'},
  {id:'monovisc',name:'Monovisc',code:'J7327',unit:'per dose'},
  {id:'orthovisc',name:'Orthovisc',code:'J7324',unit:'per dose'},
  {id:'supartz',name:'Supartz FX',code:'J7321',unit:'per dose'},
  {id:'synvisc',name:'Synvisc',code:'J7325',unit:'per mg'},
  {id:'synvisc-one',name:'Synvisc-One',code:'J7325',unit:'per mg'},
  {id:'trivisc',name:'TriVisc',code:'J7329',unit:'per mg'},
  {id:'synojoynt',name:'Synojoynt',code:'J7331',unit:'per mg'},
  {id:'triluron',name:'Triluron',code:'J7332',unit:'per mg'},
  {id:'visco-3',name:'Visco-3',code:'J7321',unit:'per dose'}
]);
const C=(id,label,help)=>Object.freeze({id,label,help});
const base=[
  C('diagnosis','Diagnosis and laterality','Confirm clinical diagnosis, side and ICD-10 selection in the source chart.'),
  C('function','Functional impact','Record symptoms, activities affected and objective limitations without inventing details.'),
  C('conservative','Nonoperative management','Record treatments attempted, durations and responses or documented contraindications.'),
  C('records','Relevant records','Identify necessary examination, imaging, prior procedure and response records.'),
  C('site','Service location','Verify hospital/ASC/office site, medical benefits and possible site-of-service restrictions.')
];
const gel=[
  C('knee-oa','Symptomatic knee osteoarthritis','Document diagnosis, treated side, severity and relevant radiology.'),
  C('medical-history','Previous treatment response','Identify prior oral/topical medications, therapy, activity modification or corticosteroid injections when relevant.'),
  C('product','Specific viscosupplement product','Match brand, HCPCS, dosage units, injection count and billing channel; verify payer preference.'),
  C('repeat','Previous course and interval','For continuation, document prior product/date, functional improvement, recurrence and elapsed interval; check current payer frequency rules.'),
  C('guidance','Guidance and administration','Verify injection approach, laterality, whether ultrasound was medically necessary and any documentation for 20611.'),
  C('benefit','Buy-and-bill versus pharmacy fulfillment','Check medical benefit vs specialty pharmacy, preferred product, supplier and authorization destination.')
];
const joint=[
  C('xray','Imaging and joint pathology','Verify current weight-bearing knee or appropriate hip images and diagnosis.'),
  C('severity','Pain, disability and function','Document impact on walking, stairs, ADLs, sleep and objective orthopedic findings as appropriate.'),
  C('nonsurgical','Documented conservative-treatment course','Describe trials of PT, medications, injections, aids, modifications or clinical reasons to bypass any measure.'),
  C('operative','Proposed surgical plan','Specify side, approach, primary versus partial versus revision, components and related codes.'),
  C('necessity','Indication and informed clinical rationale','Summarize why this operation and proposed setting are indicated based on clinician-authored evidence.')
];
const revision=[
  ...joint,
  C('failure','Failed-implant mechanism','Identify loosening, instability, wear, malposition, fracture, stiffness or infection concern as appropriate.'),
  C('workup','Revision diagnostic workup','Document imaging, exam and relevant ESR/CRP, aspiration/culture or infection investigation when indicated.'),
  C('component','Component-specific revision coding','Identify which components are revised and verify correct code(s) and staged versus single-stage strategy.')
];
const cartilage=[
  C('lesion','Cartilage defect characterization','Record location, size, full-thickness status, symptoms, imaging and/or arthroscopy findings.'),
  C('joint','Joint environment','Record alignment, instability/ligament status, meniscal status and osteoarthritic change when relevant.'),
  C('previous','Conservative and prior surgical care','Summarize therapy, prior arthroscopy or other cartilage procedures as applicable.'),
  C('stage','Stage of MACI therapy','Distinguish harvest/biopsy and implantation requests; verify whether both need separate approvals.'),
  C('implant','Cell product and implant authorization','For implantation, separately verify product J7330, fabrication and facility arrangements; do not infer from approval of CPT 27412.'),
  C('rehab','Postoperative restrictions and rehabilitation','Identify intended protective weight-bearing, brace and therapy plan and site of care.')
];
const carpal=[
  C('history','Median neuropathy symptoms','Record distribution, nocturnal symptoms, numbness, functional loss, weakness and duration.'),
  C('exam','Clinical assessment','Document appropriate examination and provocative or sensory/motor findings; do not assume telehealth findings are sufficient for the payer.'),
  C('electro','Diagnostic testing if applicable','Record electrodiagnostic or ultrasound findings if obtained, and review if the selected payer requires specific studies.'),
  C('treatment','Conservative management or severity exception','Record splinting, injections, prior care or objective deficit supporting earlier intervention.'),
  C('technique','Specific release technique','Select open, endoscopic or the specifically described balloon-assisted percutaneous approach; codes are not interchangeable.'),
  C('site-hand','Office procedure and site of service','Verify office or facility medical benefit, professional/facility payment and preauthorization rules.')
];
const trigger=[
  C('digit','Affected digit and triggering/locking','Record the digit(s), triggering, locking or catching, A1-pulley pain and symptom duration.'),
  C('exam','Clinical examination: A1-pulley tenderness or nodule, triggering grade, range of motion','Document the examination findings; telehealth findings may not satisfy the payer.'),
  C('conservativeHand','Splinting, activity modification and corticosteroid injections','Record splinting duration, number and dates of A1-pulley injections and response; some payers require a failed injection before release.'),
  C('technique','Release technique and site','Specify open versus percutaneous/ultrasound-guided release and office versus facility site; codes are not interchangeable.')
];
const sij=[
  C('provocative','SI joint pain pattern and provocative maneuvers','Document pain over the SI joints below L5 without radiculopathy for at least 3 months and at least 3 positive provocative maneuvers (FABER, Gaenslen, thigh thrust, compression, distraction, Yeoman).'),
  C('conservativeSij','Conservative therapy and rehabilitation plan','Record at least 4 weeks of conservative care (PT, medications, activity modification) and the ongoing rehabilitation or home exercise plan.'),
  C('diagnosticBlock','Diagnostic SI joint block','Record guidance with contrast, agent, same-scale pre/post pain scores and ≥75% relief for the anesthetic duration; no more than two diagnostic sessions.'),
  C('therapeuticInjection','Therapeutic intra-articular injection','Record the corticosteroid injection and ≥50% relief for its expected duration.'),
  C('sijImaging','Imaging work-up','Record SIJ radiographs plus CT or MRI excluding destructive lesion, fracture, instability or inflammatory arthropathy; an AP pelvis radiograph excluding hip pathology; lumbar CT or MRI excluding neural compression.'),
  C('device','Technique and device','Specify a transfixation device piercing the iliac and sacral cortices versus an intra-articular-only implant; payer coverage and the 2026 CPT descriptors differ.'),
  C('painScreen','Generalized pain disorder screen','Document the absence of generalized pain behavior or disorders where the payer requires it.')
];
const sports=[
  C('injury','Injury diagnosis and imaging','Identify mechanism and relevant exam/imaging, affected structures and side.'),
  C('symptoms','Mechanical symptoms or instability','Document objective instability, locking, loss of function or other relevant findings.'),
  C('management','Preoperative management','Describe rehabilitation, prior interventions and the patient-specific indication for operative treatment.'),
  C('plan','Repair versus reconstruction','Specify technique, graft/implant if applicable and codes; verify concurrent procedures.')
];
const P=(id,category,name,codes,description,criteria,notes='')=>Object.freeze({
  id,category,name,codes:Object.freeze(codes.map(x=>Object.freeze(x))),
  description,criteria:Object.freeze(criteria),notes
});
export const orthoProcedures=Object.freeze([
  P('knee-gel','injections','Knee viscosupplementation / gel injections',[
    {code:'20610',type:'CPT',label:'Large joint injection without ultrasound'},
    {code:'20611',type:'CPT',label:'Large joint injection with ultrasound'}
  ],'Product-specific HCPCS code is required in addition to the applicable administration code.',[...base,...gel],'J-code choice is brand and unit-specific. Never infer preferred formulary product, payment or repeat-series authorization.'),
  P('total-knee','arthroplasty','Primary total knee arthroplasty',[{code:'27447',type:'CPT',label:'Primary total knee'}],'Evaluate joint indication and site of service separately.',[...base,...joint]),
  P('partial-knee','arthroplasty','Unicompartmental / partial knee replacement',[{code:'27446',type:'CPT',label:'Unicompartmental knee arthroplasty'}],'Verify patient-specific compartment and implant choice.',[...base,...joint]),
  P('total-hip','arthroplasty','Primary total hip arthroplasty',[{code:'27130',type:'CPT',label:'Primary total hip'}],'Anterior approach and robotic assistance do not establish separate coverage by themselves.',[...base,...joint]),
  P('revision-knee','arthroplasty','Revision total knee arthroplasty',[
    {code:'27486',type:'CPT',label:'Revision of one component (verify)'},
    {code:'27487',type:'CPT',label:'Revision of femoral/tibial components (verify)'},
    {code:'27488',type:'CPT',label:'Two-stage revision, stage 1: removal of knee prosthesis with or without spacer (verify)'}
  ],'Codes are alternatives based on actual component work and stage, not a combined billable set. A staged infected revision uses the removal code for stage 1, not 27486/27487.',[...base,...revision]),
  P('revision-hip','arthroplasty','Revision total hip arthroplasty',[
    {code:'27134',type:'CPT',label:'Revision both components (verify)'},
    {code:'27137',type:'CPT',label:'Revision acetabular component (verify)'},
    {code:'27138',type:'CPT',label:'Revision femoral component (verify)'},
    {code:'27091',type:'CPT',label:'Two-stage revision, stage 1: removal of hip prosthesis, complicated, with or without spacer (verify)'}
  ],'Choose component-specific CPT and staged approach from the operative plan. A staged infected revision uses the removal code for stage 1, not 27134/27137/27138.',[...base,...revision]),
  P('maci-harvest','cartilage','MACI stage 1: cartilage biopsy / harvest',[
    {code:'S2112',type:'HCPCS',label:'Cartilage harvest arthroscopy (payer-dependent)'}
  ],'Commercial S-code applicability varies. Confirm payer coding and distinct stage authorization.',[...base,...cartilage]),
  P('maci-implant','cartilage','MACI stage 2: autologous chondrocyte implantation',[
    {code:'27412',type:'CPT',label:'Autologous chondrocyte implantation, knee'}
  ],'Professional and facility implantation authorization. The cultured cell product (J7330) is authorized and procured separately as MACI stage 3.',[...base,...cartilage]),
  P('carpal-open','hand','Open carpal tunnel release',[
    {code:'64721',type:'CPT',label:'Open carpal tunnel decompression'}
  ],'Coverage and medical necessity depend on the exact benefit and payer.',[...base,...carpal]),
  P('carpal-endo','hand','Endoscopic carpal tunnel release',[
    {code:'29848',type:'CPT',label:'Endoscopic transverse carpal ligament release'}
  ],'Distinguish from open and percutaneous approaches.',[...base,...carpal]),
  P('carpal-balloon','hand','Percutaneous balloon-assisted carpal tunnel release',[
    {code:'64728',type:'CPT',label:'Percutaneous median nerve decompression with intracarpal balloon dilation and included ultrasound'}
  ],'Code 64728 is technique-specific. Do not add separate 76942 ultrasound guidance to 64728; some payer policies label the technique unproven.',[...base,...carpal,
    C('device','Balloon-specific technique documentation','Confirm the selected device/technique meets the actual 64728 descriptor, not any generic ultrasound-guided release.')
  ]),
  P('trigger-finger','hand','Trigger finger release (open)',[
    {code:'26055',type:'CPT',label:'Tendon sheath incision, A1 pulley (trigger finger)'}
  ],'Open A1-pulley release. An office percutaneous technique needs its own coding confirmation.',[...base,...trigger]),
  P('trigger-finger-percutaneous','hand','Percutaneous / ultrasound-guided trigger finger release',[],
    'No verified universal code: do not assume 26055 covers a device-specific percutaneous or ultrasound-guided technique. Obtain a payer/device-specific coding determination before billing.',
    [...base,...trigger],
    'No candidate code is displayed by design; packet completeness is blocked until coding is determined.'),
  P('si-joint-fusion','spine','Minimally invasive SI joint fusion',[
    {code:'27279',type:'CPT',label:'Minimally invasive SI joint arthrodesis with transfixation device(s) piercing the iliac and sacral cortices (verify 2026 descriptor)'},
    {code:'27278',type:'CPT',label:'SI joint stabilization with intra-articular implant(s) WITHOUT transfixation (Noridian L39810: not reasonable and necessary for Original Medicare; verify 2026 descriptor)'}
  ],'Codes are candidates only and the 2026 CPT descriptors were revised; the technique (transfixation versus intra-articular-only) drives both the code and payer coverage. Commercial and Medicare Advantage criteria require the exact payer policy.',[...base,...sij]),
  P('carpal-ultrasound-other','hand','Ultrasound-guided percutaneous CTR (non-balloon / other technique)',[],
    'No verified universal code supplied. Do not assume CPT 64728 applies to a non-balloon or SX-One style technique. Obtain a current, device-specific payer coding determination before billing.',
    [...base,...carpal],
    'The 64728 code specifically includes intracarpal balloon dilation. This non-balloon route intentionally displays NO candidate code and blocks authorization packet completeness.'),
  P('acl-reconstruction','sports','ACL reconstruction',[{code:'29888',type:'CPT',label:'Arthroscopically aided ACL reconstruction'}],'Verify graft, concurrent meniscal work and actual current payer criteria.',[...base,...sports]),
  P('meniscus-repair','sports','Meniscus repair',[{code:'29882',type:'CPT',label:'Meniscus repair, medial or lateral'},
    {code:'29883',type:'CPT',label:'Meniscus repair, medial and lateral'}],'Choose exact repair codes by anatomy and operative plan.',[...base,...sports])
]);
const D=(id,payer,lines,categories,procedureIds,title,url,kind,note)=>Object.freeze({
  id,payer,lines,categories,procedureIds,title,url,kind,note,checked:'2026-11-07'
});
export const orthoPayerSources=Object.freeze([
  D('hmsa-current-pa','HMSA',
    ['Commercial','Individual Exchange','QUEST / Medicaid','Medicare Advantage'],
    [],[],'HMSA required prior-authorization code lookup (current)',
    'https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/',
    'code-check','Search the current CPT/HCPCS, product, line of business, provider participation and setting. HMSA states that code-list status is NOT a coverage/benefit determination.'),
  D('hmsa-hyaluronate','HMSA',
    ['Commercial','QUEST / Medicaid','Medicare Advantage'],['injections'],[],
    'HMSA medical specialty drug policies: hyaluronates, by line and product',
    'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/',
    'policy-directory','HMSA lists separate commercial/QUEST and Medicare Advantage hyaluronate policies, including preferred-product programs. Select exact version before conclusions.'),
  D('hmsa-msk','HMSA',
    ['Commercial','Individual Exchange','QUEST / Medicaid','Medicare Advantage'],
    ['arthroplasty','cartilage','sports'],[],
    'HMSA Evolent musculoskeletal hip/knee surgery authorization routing',
    'https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/',
    'delegate-route','HMSA reports Evolent manages selected hip/knee/shoulder MSK surgery authorizations; check current delegated routing and each requested CPT.'),
  D('uhc-gel-commercial','UnitedHealthcare',['Commercial'],['injections'],[],
    'UnitedHealthcare commercial medical-benefit sodium hyaluronate policy',
    'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sodium-hyaluronate.pdf',
    'policy-directory','Commercial policy directory includes 20610/20611 and brand-specific J-codes. Check actual product preferences and medical criteria.'),
  D('uhc-gel-exchange','UnitedHealthcare',['Individual Exchange'],['injections'],[],
    'UnitedHealthcare Individual Exchange sodium hyaluronate policy',
    'https://www.uhcprovider.com/en/policies-protocols/exchange-policies/exchanges-medical-drug-policies.html',
    'policy-directory','Exchange source lists a sodium hyaluronate policy effective October 2026. Do not substitute commercial employer or Medicare Advantage criteria.'),
  D('uhc-surgery-knee','UnitedHealthcare',['Commercial','Individual Exchange'],
    [],['total-knee','partial-knee','revision-knee','maci-harvest','maci-implant','acl-reconstruction','meniscus-repair'],
    'UnitedHealthcare Surgery of the Knee (September 2026)',
    'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf',
    'policy-directory','2026 knee policy includes total and partial knee, revision, MACI, arthroscopy and meniscal codes; full clinical criteria may be in licensed InterQual.'),
  D('uhc-surgery-hip','UnitedHealthcare',['Commercial','Individual Exchange'],
    [],['total-hip','revision-hip'],
    'UnitedHealthcare Surgery of the Hip (September 2026)',
    'https://www.uhcprovider.com/en/policies-protocols/commercial-policies/commercial-medical-drug-policies.html',
    'policy-directory','Review exact Surgery of the Hip policy effective September 2026 and applicable licensed InterQual criteria. Do not use a knee policy for hip arthroplasty.'),
  D('uhc-percutaneous','UnitedHealthcare',['Commercial','Individual Exchange'],[],['carpal-balloon'],
    'UnitedHealthcare omnibus codes: CPT 64728',
    'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/omnibus-codes.pdf',
    'restrictive-review','June 2026 policy describes 64728 balloon-assisted/ultrasound-guided decompression as unproven. Review the latest applicable plan-specific version and exception options; do not assume all CTR approaches share this status.'),
  D('uhc-community-knee','UnitedHealthcare',['QUEST / Medicaid'],
    [],['total-knee','partial-knee','revision-knee','maci-harvest','maci-implant','acl-reconstruction','meniscus-repair'],
    'UnitedHealthcare Community Plan surgery of knee medical policy',
    'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/surgery-knee-cs.pdf',
    'policy-directory','Community Plan policy effective November 2026; confirm state adoption and actual QUEST prior-authorization code lookup, not commercial policy.'),
  D('uhc-ma-gels','UnitedHealthcare',['Medicare Advantage'],['injections'],[],
    'UnitedHealthcare 2026 Medicare Advantage prior authorization requirements',
    'https://ams-prod.uhcprovider.com/content/dam/provider/docs/public/prior-auth/pa-requirements/medicare/Med-Adv-Dual-Eff-4-1-26.pdf',
    'code-check','Published 2026 MA/dual document includes specified J-code hyaluronic acid products; verify member product and latest list. This is not blanket approval or universal UHC MA benefit.'),
  D('uhc-ma-carpal','UnitedHealthcare',['Medicare Advantage'],[],['carpal-balloon'],
    'UnitedHealthcare Medicare Advantage Omnibus Codes policy (64728)',
    'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/omnibus-codes-mamp.pdf',
    'restrictive-review','The 2026 MA policy describes balloon-assisted 64728 as not reasonable and necessary. Confirm most current version and exact plan terms; does not describe open or endoscopic CTR.'),
  D('maci-billing','Other',['Commercial','Individual Exchange','QUEST / Medicaid','Medicare Advantage'],
    ['cartilage'],[],
    'MACI manufacturer billing and staged authorization references',
    'https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/',
    'coding-reference','External manufacturer code overview only, not insurer coverage criteria. Check distinct harvest, implant professional, and J7330 product benefits.'),
  D('uha-medical','UHA',['Commercial'],[],[],
    'UHA medical services prior-authorization lookup',
    'https://www.uhahealth.com/providers/medical-services-prior-authorization-requirements-search',
    'code-check','Search exact current service CPT and setting. Older lists explicitly mention autologous chondrocyte implantation; current lookup controls.'),
  D('cms-mcd','Traditional Medicare',['Traditional Medicare'],[],[],
    'CMS Medicare Coverage Database: NCD/LCD/article and Hawaii jurisdiction',
    'https://www.cms.gov/medicare-coverage-database/search.aspx',
    'coverage-research','Original Medicare Part B is not a pharmacy formulary and does not use commercial prior-auth rules. Check national/local coverage, benefit, claim and site-specific programs.'),
  D('noridian-ha-draft','Traditional Medicare',['Traditional Medicare'],['injections'],[],
    'Noridian JE: proposed hyaluronic acid LCD DL40456 (NOT FINAL)',
    'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=40455&ver=5',
    'proposed-only','Proposed October 1, 2026, with public comments through November 14. This is NOT an active LCD; consult the presently applicable Medicare rules.'),
  D('cms-opd','Traditional Medicare',['Traditional Medicare'],
    ['arthroplasty','cartilage','hand','sports'],[],
    'CMS Hospital Outpatient Department prior-authorization program',
    'https://www.cms.gov/data-research/monitoring-programs/medicare-fee-service-compliance-programs/prior-authorization-pre-claim-review-initiatives/prior-authorization-certain-hospital-outpatient-department-opd-services',
    'code-check','CMS OPD PA list is program-specific. The existence of surgery does not imply CMS national OPD prior auth; verify separately from LCD/NCD, ASC and site eligibility.'),
  D('noridian-sij-lcd','Traditional Medicare',['Traditional Medicare'],[],['si-joint-fusion'],
    'Noridian JE LCD L39810 Minimally Invasive Arthrodesis of the SI Joint (revision effective 10/23/2025) with LCD L39462 injection criteria',
    'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39810&ver=13',
    'policy-directory','Active LCD whose contractor information lists Hawaiʻi. Covered only WITH a transfixation device when the L39462 injection criteria, a ≥75% diagnostic block, a ≥50% therapeutic injection and three imaging elements are documented; intra-articular-only stabilization is not reasonable and necessary.'),
  D('hmsa-fep-plan-check','HMSA',['Federal employee / postal'],[],[],
    'HMSA Federal Plan 87 / BCBS FEP — confirm which federal product applies and its authorization rules',
    'https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/',
    'plan-check','Federal Plan 87 is an HMSA FEHB product; the BCBS FEP Service Benefit Plan has national rules administered locally by HMSA. Confirm which product the member holds and whether the HMSA code lookup or the FEP national rules govern the request.'),
  D('ohana-quest-pa','ʻOhana / Wellcare',['QUEST / Medicaid'],[],[],
    'ʻOhana / Wellcare QUEST code-level authorization lookup',
    'https://www.wellcare.com/en/Hawaii/Providers/Authorization-Lookup',
    'code-check','Code-level lookup for QUEST Integration members (membership ends 12/31/2026). Authorization does not guarantee payment; confirm eligibility and the exact member product.'),
  D('noridian-tka-lcd','Traditional Medicare',['Traditional Medicare'],[],['total-knee','partial-knee','revision-knee'],
    'Noridian JE LCD L36575 Total Knee Arthroplasty (revision effective 11/06/2025) and Billing and Coding Article A57685',
    'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=36575&ver=21',
    'policy-directory','Active LCD whose contractor information lists Hawaiʻi. Medical-necessity criteria for TKA and revision; unicompartmental replacement is addressed separately in the LCD text. Original Medicare has no prior authorization for these codes.'),
  D('noridian-tha-lcd','Traditional Medicare',['Traditional Medicare'],[],['total-hip','revision-hip'],
    'Noridian JE LCD L34163 Total Hip Arthroplasty (revision effective 11/06/2025) and Billing and Coding Article A57683',
    'https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=34163&ver=33',
    'policy-directory','Active LCD whose contractor information lists Hawaiʻi. Medical-necessity criteria for THA and revision. Original Medicare has no prior authorization for these codes.'),
  D('va-community','Veterans Affairs',['VA / Community Care'],[],[],
    'VA Community Care referral/authorization',
    'https://www.va.gov/COMMUNITYCARE/',
    'authorization-route','VA authorization and referral scope are separate from the VA pharmacy formulary. Confirm issued authorization and approved CPT/site/dates.'),
  D('tricare-coverage','TRICARE',['TRICARE'],[],[],
    'TRICARE covered services and authorization',
    'https://www.tricare.mil/CoveredServices/IsItCovered',
    'code-check','Check the applicable regional contractor, Prime/Select plan, referral/PA, setting and provider network.'),
  D('hmaa','HMAA',['Commercial'],[],[],
    'HMAA health plans (medical administration)',
    'https://www.hmaa.com/',
    'plan-check','Employer plan and utilization management may vary; no procedure-code determination is integrated.'),
  D('curative','Curative',['Commercial'],[],[],
    'Curative member and employer plan',
    'https://curative.com/',
    'plan-check','Confirm exact network, negotiated procedure terms, benefit manager and any procedure authorization; no code-level integration.'),
  D('kaiser','Kaiser Permanente',['Commercial','Individual Exchange','Medicare Advantage','QUEST / Medicaid'],[],[],
    'Kaiser Permanente Hawaiʻi plan coverage',
    'https://healthy.kaiserpermanente.org/hawaii',
    'plan-check','Internal versus external procedure authorization, location and plan rules require member-specific review.'),
  D('medicaid-other','AlohaCare',['QUEST / Medicaid','Medicare Advantage'],[],[],
    'AlohaCare official plan and utilization management',
    'https://www.alohacare.org/',
    'plan-check','QUEST and dual products differ. Do not apply an HMSA or UHC gel/surgical policy to AlohaCare.')
]);
export const orthoSourceKinds=Object.freeze({
  'code-check':'PA code lookup (not coverage)',
  'policy-directory':'Official medical-policy source',
  'delegate-route':'Authorization routing (verify)',
  'restrictive-review':'Potential restrictive coverage policy',
  'coverage-research':'CMS coverage research',
  'proposed-only':'Proposed rule — NOT active',
  'authorization-route':'Referral / authorization route',
  'plan-check':'Plan-specific verification needed',
  'coding-reference':'Manufacturer coding guide (not coverage)'
});
export const defaultOrthoCase=()=>({
  procedureId:'knee-gel',payer:'HMSA',line:'Commercial',
  setting:'Office',requestType:'Initial',gelProductId:'',
  guidance:'without-ultrasound',planLabel:'',checks:{}
});
export function getOrthoProcedure(id){return orthoProcedures.find(p=>p.id===id)||null;}
export function getOrthoActiveCriteria(selection){
  const service=getOrthoProcedure(selection?.procedureId);
  if(!service)return [];
  return service.criteria.filter(c=>!(service.id==='knee-gel' && selection.requestType==='Initial' && c.id==='repeat') && !(service.id==='maci-harvest' && c.id==='implant'));
}
export function getOrthoGelProduct(id){return orthoGelProducts.find(p=>p.id===id)||null;}
export function getOrthoPayerSources({procedureId,payer,line}={}){
  const service=getOrthoProcedure(procedureId);
  if(!service)return [];
  return orthoPayerSources.filter(x=>(x.payer===payer||(x.payer==='Other'&&x.kind==='coding-reference'))&&x.lines.includes(line)&&
    (!x.categories.length||x.categories.includes(service.category))&&
    (!x.procedureIds.length||x.procedureIds.includes(procedureId)));
}
export function getOrthoProcedureCodes(selection){
  const service=getOrthoProcedure(selection?.procedureId);
  if(!service)return [];
  if(service.id!=='knee-gel')return service.codes;
  const c=service.codes.find(x=>x.code===(selection.guidance==='with-ultrasound'?'20611':'20610'));
  const gel=getOrthoGelProduct(selection.gelProductId);
  return [c,...(gel?[{code:gel.code,type:'HCPCS',label:gel.name+' ('+gel.unit+')'}]:[])];
}
export function validateOrthoCase(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid orthopedic selection.');
  const permitted=['procedureId','payer','line','setting','requestType','gelProductId','guidance','planLabel','checks'];
  if(Object.keys(value).some(k=>!permitted.includes(k)))throw new Error('Unsupported field. Patient records are not accepted.');
  const service=getOrthoProcedure(value.procedureId);
  if(!service||!orthoPayers.includes(value.payer)||!orthoLines.includes(value.line)||
    !orthoSettings.includes(value.setting)||!orthoRequestTypes.includes(value.requestType))
    throw new Error('Select a valid procedure and coverage program.');
  if(typeof value.planLabel!=='string'||value.planLabel.length>80||
    !/^[\p{L}\p{N} /&+().,'’ʻ_-]*$/u.test(value.planLabel)||/\d{7,}/.test(value.planLabel))
    throw new Error('Use a plan name/group code only; never enter member identifiers.');
  if(typeof value.gelProductId!=='string'||typeof value.guidance!=='string'||
    !['with-ultrasound','without-ultrasound'].includes(value.guidance))
    throw new Error('Invalid gel procedure configuration.');
  if(value.gelProductId&&!getOrthoGelProduct(value.gelProductId))throw new Error('Unknown product.');
  if(!value.checks||typeof value.checks!=='object'||Array.isArray(value.checks))throw new Error('Invalid checklist.');
  const ids=new Set(service.criteria.map(c=>c.id));
  if(Object.entries(value.checks).some(([id,v])=>!ids.has(id)||typeof v!=='boolean'))
    throw new Error('The documentation checklist includes unsupported items.');
  return value;
}
export function orthoAuthorizationSnapshot(value){
  const selection=validateOrthoCase(value);
  const service=getOrthoProcedure(selection.procedureId);
  const sources=getOrthoPayerSources(selection);
  const missing=getOrthoActiveCriteria(selection).filter(c=>selection.checks[c.id]!==true);
  const blockers=[
    'Exact member eligibility and covered benefit not verified.',
    'Current payer/code-level PA determination and authorization routing not verified.',
    'Clinician review of clinical evidence and proposed coding not completed.'
  ];
  if(!selection.planLabel.trim())blockers.push('Specific plan or employer group not identified.');
  if(service.id==='knee-gel'&&!selection.gelProductId)blockers.push('Brand-specific gel product/HCPCS not selected.');
  if(!getOrthoProcedureCodes(selection).length)blockers.push('No validated code for this technique; obtain payer/device-specific coding guidance.');
  if(!sources.length)blockers.push('No verified payer procedure source in this public catalog; manual policy research required.');
  if(missing.length)blockers.push(missing.length+' supporting-documentation categories not marked located.');
  if(selection.payer==='Traditional Medicare'&&selection.line!=='Traditional Medicare')blockers.push('Traditional Medicare payer/line mismatch.');
  if(selection.payer==='Veterans Affairs'&&selection.line!=='VA / Community Care')blockers.push('VA payer/line mismatch.');
  return {
    service,sources,missing,blockers,
    codes:getOrthoProcedureCodes(selection),
    coverage:'unknown',authorization:'not verified',readyForSubmission:false
  };
}
export function createOrthoWorksheet(value,{today='2026-11-07',mode='gaps'}={}){
  const selection=validateOrthoCase(value);
  const r=orthoAuthorizationSnapshot(selection);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(today)||!['gaps','outline'].includes(mode))
    throw new Error('Invalid export setting.');
  const text=[
    'SYNTHETIC WORKSHEET ONLY — NO PHI / NOT FOR PATIENT SUBMISSION',
    'Pacific Bone & Joint | '+(mode==='outline'?'Orthopedic procedure authorization outline':'Orthopedic documentation gap checklist'),
    'Generated: '+today,
    'Service: '+r.service.name,
    'Payer / line: '+selection.payer+' / '+selection.line,
    'Plan / employer label: '+(selection.planLabel||'[not verified]'),
    'Setting: '+selection.setting,
    'Request type: '+selection.requestType,
    'Benefit: medical procedure / physician-administered product; verify actual plan benefit',
    'Candidate CPT/HCPCS (not a coding determination): '+r.codes.map(c=>c.code+' '+c.type).join(', '),
    ...(r.service.id==='knee-gel'?[
      'Product: '+(getOrthoGelProduct(selection.gelProductId)?.name||'[not selected]'),
      'Guidance: '+selection.guidance
    ]:[]),
    '',
    'DOCUMENTATION WORKFLOW',
    ...getOrthoActiveCriteria(selection).map(c=>(selection.checks[c.id]===true?'[LOCATED] ':'[MISSING] ')+c.label+' — '+c.help),
    '',
    'PUBLIC PAYER SOURCES (manual source/code/plan review required)',
    ...(r.sources.length?r.sources.map(x=>x.title+' ['+orthoSourceKinds[x.kind]+']\n'+x.url+'\n'+x.note):['No source cataloged for this exact payer/line/procedure. Research current policy.']),
    '',
    'UNRESOLVED AUTHORIZATION / RELEASE BLOCKERS',
    ...r.blockers.map((x,i)=>(i+1)+'. '+x),
    '',
    'No member eligibility, coverage, referral, prior-auth approval, payment or medical-necessity determination was performed.',
    'Do not claim that locating a document proves the payer criterion is met. A clinician and staff must verify source records.',
    'Do not enter real patient information into this synthetic-data application.'
  ];
  return text.join('\n')+'\n';
}
export function validateOrthoCatalog(){
  const ids=new Set();
  for(const service of orthoProcedures){
    if(ids.has(service.id)||!orthoCategories.some(c=>c.id===service.category))throw new Error('Duplicate or invalid orthopedic service.');
    ids.add(service.id);
    const criteriaIds=service.criteria.map(c=>c.id);
    if(new Set(criteriaIds).size!==criteriaIds.length)throw new Error('Duplicate checklist requirement: '+service.id);
    if((!service.codes.length&&!['carpal-ultrasound-other','trigger-finger-percutaneous'].includes(service.id))||service.codes.some(c=>!/^[A-Z]?\d{4,5}$/.test(c.code)))
      throw new Error('Invalid candidate billing codes.');
  }
  for(const source of orthoPayerSources){
    if(!orthoPayers.includes(source.payer)||source.lines.some(line=>!orthoLines.includes(line)))
      throw new Error('Invalid source payer/coverage line.');
    const url=new URL(source.url);
    if(url.protocol!=='https:'||url.username||url.password)throw new Error('Unsafe source URL.');
  }
  return true;
}
validateOrthoCatalog();
