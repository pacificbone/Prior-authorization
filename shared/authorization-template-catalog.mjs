import { orthoGelProducts, orthoProcedures, getOrthoActiveCriteria } from './orthopedic-procedures.mjs';
import { EXTRA_PROCEDURES } from './staff-service-catalog.mjs';

// Product- and procedure-specific note templates; clinical aids, not payer coverage rules.
const field=(id,label)=>({id,label});
const gelFields=[
 field('diagnosis','Symptomatic knee osteoarthritis diagnosis, ICD-10 and laterality'),
 field('symptoms','Pain, functional restrictions and examination findings'),
 field('imaging','Radiographic evidence and date'),
 field('conservative','Prior conservative care, dates, response or contraindication'),
 field('priorInjections','Prior corticosteroid or viscosupplement courses, dates and benefit'),
 field('reasonForProduct','Reason for the requested product and any preferred alternatives considered'),
 field('plan','Dose, number of injections, laterality and administration setting'),
 field('benefit','Medical versus pharmacy benefit and supply route')
];
const boneProducts=[
 // Q-codes for Jubbonti and Bildyos are cited in the reviewed MDX/UHC Medicare Advantage PA list; Enoby and Stoboclo codes are not yet verified.
 ['bildyos','Bildyos (denosumab-nxxp)','Q5157'],
 ['enoby','Enoby (denosumab-qbde)',null],
 ['stoboclo','Stoboclo (denosumab-bmwo)',null],
 ['jubbonti','Jubbonti (denosumab-bbdz)','Q5136'],
 ['alendronate','Alendronate',null],
 ['risedronate','Risedronate',null],
 ['ibandronate','Ibandronate (route to be specified)',null],
 ['calcitonin','Calcitonin salmon (formulation to be specified)',null],
 ['prolia','Prolia (denosumab)','J0897'],
 ['evenity','Evenity (romosozumab)','J3111'],
 ['reclast','Reclast (zoledronic acid)','J3489'],
 ['boniva-iv','Boniva IV (ibandronate)','J1740'],
 ['forteo','Forteo (teriparatide)',null],
 ['tymlos','Tymlos (abaloparatide)',null]
];
const boneFields=[
 field('diagnosis','Indication, osteoporosis diagnosis and fracture risk'),
 field('dxa','DXA date, T-scores and fracture history where available'),
 field('priorTherapy','Prior therapies, durations, outcomes, intolerance or contraindications'),
 field('rationale','Patient-specific rationale for selected agent over alternatives'),
 field('safety','Relevant safety review, precautions and contraindications'),
 field('labs','Relevant calcium, renal and mineral laboratory evaluation'),
 field('administration','Dose, route, schedule, setting and planned duration'),
 field('continuity','Last dose if ongoing and continuity/follow-on treatment plan'),
 field('benefit','Medical or pharmacy benefit, supplier and exact plan')
];
const surgicalFields=[
 field('diagnosis','Diagnosis, ICD-10, side and affected anatomy'),
 field('history','Symptoms, severity, duration and functional impact'),
 field('exam','Actual pertinent examination findings'),
 field('imaging','Relevant imaging and diagnostic results with dates'),
 field('conservative','Nonoperative treatment, dates, response or clinical exception'),
 field('indication','Specific operative indication and individualized medical necessity'),
 field('procedure','Proposed procedure, laterality, technique and concurrent work'),
 field('setting','Requested site of service and justification when needed'),
 field('records','Supporting office note, imaging, studies and records to attach')
];
// Non-surgical services get a scaffold that matches what a payer actually reviews for them.
const diagnosticFields=[
 field('diagnosis','Diagnosis, ICD-10, side and affected anatomy'),
 field('history','Symptoms, duration and examination findings prompting the study'),
 field('priorImaging','Prior imaging or studies, dates and results'),
 field('question','Clinical question and how the result will change management'),
 field('setting','Ordering provider, performing site and protocol'),
 field('records','Supporting office note and records to attach')
];
const therapyFields=[
 field('diagnosis','Diagnosis, ICD-10, side and affected anatomy'),
 field('function','Functional limitation and measurable goals'),
 field('history','Surgery or injury date and prior therapy or devices tried'),
 field('prescription','Prescription: frequency, duration, visit count or device specification'),
 field('setting','Treating facility or supplier and network status'),
 field('records','Supporting office note, operative report and records to attach')
];
const injectionFields=[
 field('diagnosis','Diagnosis, ICD-10, side and affected joint'),
 field('history','Symptoms, duration and examination findings'),
 field('imaging','Relevant imaging and date'),
 field('conservative','Conservative care, dates, response or contraindication'),
 field('priorInjections','Prior injections or biologic treatments, dates and response'),
 field('product','Product, preparation, dose, guidance and administration technique'),
 field('setting','Site of service and separately billed drug or supply'),
 field('records','Supporting office note, imaging and records to attach')
];
const productFields=[
 field('diagnosis','Diagnosis, ICD-10, side and affected anatomy'),
 field('records','Supporting operative, pathology and order records to attach')
];
const SCAFFOLDS={diagnostic:diagnosticFields,therapy:therapyFields,injection:injectionFields,product:productFields};
const TEMPLATE_CATEGORY={imaging:'diagnostic',support:'therapy',injections:'injection'};
const boneDetails={
 prolia:'Denosumab: document mineral/renal risk review, last dose, monitoring and interruption/transition plan',
 evenity:'Romosozumab: document cardiovascular history review, prior exposure, planned course and subsequent therapy',
 reclast:'Zoledronic acid: document renal assessment, hydration, infusion plan and prior bisphosphonate exposure',
 'boniva-iv':'IV ibandronate: document formulation, renal evaluation, IV administration and prior exposure',
 forteo:'Teriparatide: document selected brand/formulation, prior anabolic exposure, safety review and subsequent therapy',
 tymlos:'Abaloparatide: document prior anabolic exposure, safety review, administration training and subsequent therapy'
};
const procedureDetails={
 'total-knee':'Document tibiofemoral/patellofemoral findings and primary total knee plan',
 'partial-knee':'Document involved compartment, remaining compartments, ligament status and partial-knee rationale',
 'total-hip':'Document hip pathology, symptoms and primary hip replacement plan',
 'revision-knee':'Document knee implant failure, infection workup when indicated and components to revise',
 'revision-hip':'Document hip implant failure, infection workup when indicated and components to revise',
 'maci-harvest':'Document biopsy/harvest stage and separate future implantation/product review',
 'maci-implant':'Document implantation stage, lesion, cell product and separate professional/facility authorization',
 'maci-cell-product':'Document the cultured cell product order separately from the harvest and implantation procedures: lesion count/size, J7330 units, benefit channel and who purchases and bills the product',
 'si-joint-fusion':'Document the technique (transfixation device piercing the cortices versus intra-articular-only implant), diagnostic block and therapeutic injection responses, and the three imaging elements; codes 27279/27278 are candidates whose 2026 descriptors must be verified',
 'carpal-open':'Document open decompression approach and laterality',
 'carpal-endo':'Document endoscopic approach and laterality',
 'carpal-balloon':'Document actual intracarpal balloon technique; do not substitute other percutaneous techniques',
 'carpal-ultrasound-other':'Document actual non-balloon device and obtain payer-specific coding determination',
 'acl-reconstruction':'Document ACL instability, graft choice and associated ligament/meniscal work',
 'meniscus-repair':'Document tear morphology, reparability and repair of medial/lateral compartments',
 'trigger-finger':'Document the digit, A1-pulley findings, splinting and injection history and the open release plan',
 'trigger-finger-percutaneous':'Document the device and technique and record the payer/device-specific coding determination; no CPT is assumed',
 'knee-meniscectomy':'Document tear type, compartments involved (one versus both) and why meniscectomy rather than repair',
 'meniscus-root':'Document root tear type, extrusion, cartilage status and the specific root repair technique and coding determination',
 'bear-acl':'Document the tear pattern, implant-specific indication and the payer coverage and coding determination for the BEAR implant',
 'cartiheal':'Document lesion site and size, device-specific indication and the implant authorization and coding determination',
 'osteochondral-allograft':'Document lesion site and size, graft source and procurement, approach and payer-specific coding',
 'knee-osteotomy':'Document alignment measurements, compartment disease, bone and osteotomy technique and device coding',
 'pns-knee':'Document pain pattern, prior treatments, lead type (temporary or permanent), implantation technique and device coding',
 'iovera':'Document target nerves, timing relative to surgery, prior treatments and the applicable billing code',
 'genicular-rfa':'Document diagnostic genicular block results, prior treatments and the medical-necessity criteria of the payer',
 'prp':'Document the indication, prior treatments and the plan coverage or self-pay status before any cost promise',
 'bmac':'Document the indication, prior treatments, harvest and preparation details and the payer coverage and coding review',
 'a2m':'Document the indication, prior treatments and the investigational or noncovered status under the exact plan',
 'corticosteroid-injection':'Document the joint, laterality, drug and dose (J-code), guidance and interval since the last injection',
 'ultrasound-diagnostic':'Document the indication, complete versus limited study and the clinical question',
 'mri-knee':'Document the clinical question, prior imaging and treatment, and why MRI will change management',
 'xray-knee':'Document the views requested, laterality and indication',
 'dexa':'Document the indication, risk conditions, prior DXA date and the plan frequency rule',
 'dme-brace':'Document the indication, custom-fitted versus custom-fabricated need, L-code and supplier/benefit',
 'office-pt':'Document the diagnosis, functional goals, visit frequency and duration, and plan visit limits or authorization',
 'core-decompression':'Document osteonecrosis stage and imaging, prior care, graft or biologic use and facility coverage',
 'osseointegration':'Document amputation level, prior prosthetic use and failure, staged implant plan and negotiated coding'
};
const SURGICAL_CATEGORIES=new Set(['arthroplasty','cartilage','hand','sports','pain','spine']);
const allProcedures=[...orthoProcedures,...EXTRA_PROCEDURES];
// Orthopedic catalog procedures use the stage-aware criteria (for example MACI harvest excludes the
// implantation-stage product field); extra services use their checklist.
const procedureFields=p=>p.criteria?getOrthoActiveCriteria({procedureId:p.id,requestType:'Initial'}).map(c=>field(c.id,c.label)):p.checklist.map(([id,label])=>field(id,label));
const templateCategory=p=>p.id==='maci-cell-product'?'product':TEMPLATE_CATEGORY[p.category]||(SURGICAL_CATEGORIES.has(p.category)?'surgery':'surgery');
// Service-specific prompts never disappear behind the generic scaffold: a colliding id keeps both labels.
const mergeFields=(scaffold,specific)=>[
 ...scaffold.map(f=>{const own=specific.find(c=>c.id===f.id);return own&&own.label!==f.label?field(f.id,f.label+' — '+own.label):f;}),
 ...specific.filter(c=>!scaffold.some(f=>f.id===c.id))
];
export const AUTH_TEMPLATE_CATALOG=Object.freeze([
 ...orthoGelProducts.map(p=>Object.freeze({id:'gel-'+p.id,category:'viscosupplementation',name:p.name,codes:[p.code],fields:[...gelFields,field('course-'+p.id,p.name+': document exact formulation, labeled course, requested dose, injection count and '+p.code+' billing units ('+p.unit+'); verify current labeling')],notes:'Verify brand-specific dose, HCPCS billing units, payer preference and repeat-series rules.'})),
 ...boneProducts.map(([id,name,code])=>Object.freeze({id:'bone-'+id,category:'bone-health',name,codes:code?[code]:[],fields:[...boneFields,field('product-'+id,boneDetails[id]||(name+': document exact formulation/route, product-specific safety review, prior exposure and follow-up; verify current labeling'))],notes:'Verify current product labeling, indication, benefit channel, and payer-specific step therapy.'})),
 ...allProcedures.filter(p=>p.id!=='knee-gel').map(p=>{const category=templateCategory(p);return Object.freeze({
   id:'procedure-'+p.id,category,name:p.name,codes:p.codes.map(c=>c.code),
   fields:[...mergeFields(SCAFFOLDS[category]||surgicalFields,procedureFields(p)),field('specific-'+p.id,procedureDetails[p.id]||'Document the service-specific indication, technique or product, and the plan')],
   notes:[p.notes,p.description,'Confirm payer-specific criteria and site-of-service rules.'].filter(Boolean).join(' ')
 });})
]);
// Catalog defaults are immutable across requests and template selection changes.
for(const t of AUTH_TEMPLATE_CATALOG){for(const f of t.fields)Object.freeze(f);Object.freeze(t.fields);Object.freeze(t.codes);}
export function authTemplateForService(serviceId,gelProductId=''){
 if(serviceId==='knee-gel')return findAuthTemplate('gel-'+gelProductId);
 const aliases={'zoledronic-acid':'reclast','teriparatide':'forteo'};
 return findAuthTemplate('bone-'+(aliases[serviceId]||serviceId))||findAuthTemplate('procedure-'+serviceId);
}
export function documentedValue(value){
 if(typeof value!=='string')return '';
 const v=value.trim();
 // Placeholders, dashes and chart pointers are not documentation; require real letters.
 return !v||v.length>4000||/^\[.*\]$/.test(v)||!/[\p{L}]{2}/u.test(v)||/^(not documented|not provided|not applicable|unknown|pending|none|null|undefined|tbd|todo|see chart|n\/?a\b.*|false|true)$/i.test(v)?'':v;
}
export function findAuthTemplate(id){return AUTH_TEMPLATE_CATALOG.find(x=>x.id===id)||null;}
export function assessAuthTemplate(id,values={}){
 const template=findAuthTemplate(id);
 if(!template) return {status:'unknown-template',missing:[],payerVerified:false};
 const missing=template.fields.filter(f=>!documentedValue(values?.[f.id]));
 return {status:missing.length?'incomplete':'clinical-fields-complete',missing,payerVerified:false,
 warning:'Clinical fields complete does not imply medical necessity, benefit coverage, or authorization approval.'};
}
export function renderAuthTemplateNote(id,values={},metadata={}){
 const template=findAuthTemplate(id);
 if(!template) throw new Error('Unknown authorization template');
 const status=assessAuthTemplate(id,values);
 const header=['SYNTHETIC ONLY — NOT FOR SUBMISSION',
 'PRIOR AUTHORIZATION CLINICAL ADDENDUM — DRAFT FOR CLINICIAN REVIEW',
 'Service: '+template.name,'Codes (verify): '+(template.codes.join(', ')||'Coding review required'),
 'Payer and exact product: '+(metadata.plan||'[NOT VERIFIED]'),
 'Patient identifier: '+(metadata.patient||'[COMPLETE ONLY IN APPROVED CLINICAL SYSTEM]'),
 'Planned date of service: '+(metadata.date||'[DATE]')];
 const body=template.fields.map(f=>f.label+': '+(documentedValue(values?.[f.id])||'[NOT DOCUMENTED]'));
 return [...header,'',...body,'','Individualized medical necessity: '+(metadata.medicalNecessity||'[CLINICIAN TO COMPLETE]'),
 'Supporting attachments: '+(metadata.attachments||'[LIST SUPPORTING RECORDS]'),
 'Missing fields: '+(status.missing.map(f=>f.label).join('; ')||'None from generic template'),
 'Payer-specific criteria verified: NO — verify exact plan and effective policy.',
 'Product/procedure review: '+template.notes,
 'Coverage and procurement: UNVERIFIED — DO NOT ORDER. No approval or payment guarantee.',
 'Clinician review/signature: ______________________'].join('\n');
}
