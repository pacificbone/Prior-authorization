import { orthoGelProducts, orthoProcedures } from './orthopedic-procedures.mjs';
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
 ['bildyos','Bildyos (denosumab-nxxp)',null],
 ['enoby','Enoby (denosumab-qbde)',null],
 ['stoboclo','Stoboclo (denosumab-bmwo)',null],
 ['jubbonti','Jubbonti (denosumab-bbdz)',null],
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
 'meniscus-repair':'Document tear morphology, reparability and repair of medial/lateral compartments'
};
const allProcedures=[...orthoProcedures,...EXTRA_PROCEDURES];
const procedureFields=p=>p.criteria||p.checklist.map(([id,label])=>field(id,label));
export const AUTH_TEMPLATE_CATALOG=Object.freeze([
 ...orthoGelProducts.map(p=>Object.freeze({id:'gel-'+p.id,category:'viscosupplementation',name:p.name,codes:[p.code],fields:[...gelFields,field('course-'+p.id,p.name+': document exact formulation, labeled course, requested dose, injection count and '+p.code+' billing units ('+p.unit+'); verify current labeling')],notes:'Verify brand-specific dose, HCPCS billing units, payer preference and repeat-series rules.'})),
 ...boneProducts.map(([id,name,code])=>Object.freeze({id:'bone-'+id,category:'bone-health',name,codes:code?[code]:[],fields:[...boneFields,field('product-'+id,boneDetails[id]||(name+': document exact formulation/route, product-specific safety review, prior exposure and follow-up; verify current labeling'))],notes:'Verify current product labeling, indication, benefit channel, and payer-specific step therapy.'})),
 ...allProcedures.filter(p=>p.id!=='knee-gel').map(p=>Object.freeze({
   id:'procedure-'+p.id,category:'surgery',name:p.name,codes:p.codes.map(c=>c.code),
   fields:[...surgicalFields,...procedureFields(p).filter(c=>!surgicalFields.some(f=>f.id===c.id)).map(c=>field(c.id,c.label)),field('specific-'+p.id,procedureDetails[p.id]||p.description)],
   notes:p.notes||'Confirm payer-specific procedure and site-of-service criteria.'
 }))
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
 return !v||v.length>4000||/^\[.*\]$/.test(v)||/^(not documented|not provided|unknown|pending|n\/a|false|true)$/i.test(v)?'':v;
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
