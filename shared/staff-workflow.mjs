/**
 * PBJ unified staff navigator, synthetic-only.
 * A PLAN belongs to exactly one PAYER. Never infer formulary inclusion or medical
 * authorization from a network name, a different payer's source or a policy link.
 */
import {hawaiiCoverageSources} from './hawaii-plan-sources.mjs';
import {PUBLISHED_FORMULARIES} from './live-formularies.mjs';
import {drugs,policies,formularyLists} from './catalog.mjs';
import {matchingPolicies,applyPolicyPathway,formularyResult} from './domain.mjs';
import {orthoProcedures,getOrthoActiveCriteria,getOrthoPayerSources,getOrthoProcedureCodes} from './orthopedic-procedures.mjs';
import {EXTRA_PROCEDURES,EXTRA_DRUGS} from './staff-service-catalog.mjs';

const NON_PLANS=new Set(['uha-medical-pa','aloha-wrap','va-cfuses','original-d','other-ma']);
const PAYER_ROLES=Object.freeze({
 'HMSA':'Carrier / managed care',
 'UnitedHealthcare':'Carrier / managed care',
 'Kaiser Permanente':'Carrier / integrated delivery',
 'AlohaCare':'Carrier / managed care',
 'ʻOhana / Wellcare':'Carrier / managed care',
 'UHA':'Carrier / employer plan',
 'HMAA':'Carrier / employer plan',
 'Curative':'Carrier / employer plan',
 'Humana':'Carrier / Medicare plan',
 'Devoted Health':'Carrier / Medicare plan',
 'Traditional Medicare':'Original Medicare benefit',
 'Veterans Affairs':'VA health system',
 'TRICARE':'Military benefit',
 'MDX Hawaiʻi':'Delegated administrator (underlying carrier required)',
 'HMA / Verdegard':'Third-party administrator (underlying plan required)',
 'Workers compensation':'Carrier/claim administrator required',
 'Other employer / national':'Employer/PBM must be identified',
 'Medigap':'Supplement only; not primary coverage'
});
export const STAFF_PAYERS=Object.freeze(hawaiiCoverageSources
 .map(x=>x.payer).filter((x,i,a)=>a.indexOf(x)===i&&x!=='Other Medicare Advantage')
 .map(name=>Object.freeze({name,role:PAYER_ROLES[name]||'Plan-specific verification'})));
export const STAFF_CATEGORY_LABELS=Object.freeze({
 medication:'Medications / osteoporosis / postoperative drugs',
 arthroplasty:'Joint replacement & revision',
 injections:'Injections & gel',
 cartilage:'MACI / cartilage preservation',
 hand:'Hand / carpal tunnel / trigger finger',
 sports:'Sports knee / ACL / meniscus',
 pain:'Peripheral nerve / knee pain',
 spine:'SI joint',
 imaging:'Imaging & diagnostics',
 support:'Braces / physical therapy'
});
const fromDrug=d=>({...d,type:'medication',category:'medication',codes:[]});
const fromProcedure=d=>({...d,type:'procedure'});
export const STAFF_SERVICES=Object.freeze([
 ...drugs.map(fromDrug),...EXTRA_DRUGS.filter(d=>!drugs.some(x=>x.id===d.id)&&d.id!=='romosozumab').map(fromDrug),
 ...orthoProcedures.map(fromProcedure),...EXTRA_PROCEDURES.map(fromProcedure)
]);
export const STAFF_YEARS=Object.freeze([2026,2027]);
const medChecklist=Object.freeze([
 {id:'diagnosis',label:'Diagnosis, indication and treatment goal',help:'Include the appropriate clinical diagnosis, treatment purpose and qualifying severity.'},
 {id:'treatment-history',label:'Previous therapies and response',help:'Record dates/duration, ineffective treatments, contraindications and intolerances with evidence.'},
 {id:'product-dose',label:'Specific brand, generic, route, dose and duration',help:'Match the exact formulation, requested units, frequency, duration and drug benefit.'},
 {id:'medical-records',label:'Supporting clinical records',help:'Provide relevant imaging, DEXA, fracture history, lab results or operative details, as indicated.'},
 {id:'exceptions',label:'Step therapy and preferred-product exceptions',help:'Only if the matched plan requires an exception, document specific reason and supported facts.'}
]);
const extraCriteria=service=>service.checklist.map(([id,label])=>({id,label,help:label+' — attach dated record or clinician-authored evidence.'}));
export function staffPlansForPayer(payer,year=2026) {
 if(!STAFF_PAYERS.some(x=>x.name===payer)||!STAFF_YEARS.includes(year))return [];
 return hawaiiCoverageSources.filter(x=>x.payer===payer&&!NON_PLANS.has(x.id)&&
   (x.year.includes(String(year))||x.year==='2026–2027'));
}
export function staffGetPlan(payer,planId,year=2026) {
 if(!planId)return null;
 return staffPlansForPayer(payer,year).find(x=>x.id===planId)||null;
}
export function staffPlanProgramLine(plan) {
 if(!plan)return null;
 return ({
   commercial:'Commercial',exchange:'Individual Exchange',quest:'QUEST / Medicaid',
   'medicare-advantage':'Medicare Advantage', 'part-d':'Medicare Part D',
   'original-medicare':'Traditional Medicare',federal:'Federal employee / postal',
   veterans:'VA / Community Care',military:'TRICARE',delegated:'Delegated / claim-specific'
 })[plan.program]||null;
}
export function staffGetService(id) {return STAFF_SERVICES.find(x=>x.id===id)||null;}
export function staffServices({type='all',category='all',query=''}={}) {
 const q=String(query).toLowerCase().trim().slice(0,80);
 return STAFF_SERVICES.filter(x=>(type==='all'||x.type===type) &&
   (category==='all'||x.category===category) &&
   (!q||[x.name,x.generic||'',x.description||'',x.category].join(' ').toLowerCase().includes(q)));
}
function policyScope(plan,benefit) {
 const line=staffPlanProgramLine(plan);
 const exactFormulary=formularyLists.find(x=>x.payer===plan.payer&&x.line===line&&x.benefit===benefit);
 // The generic HMAA employer directory is NOT proof an employer has adopted
 // OptumRx Premium, even if a few entries were manually transcribed.
 return {payer:plan.payer,line,benefit,planCode:'',carrier:'',plan:'',adoptionVerified:false,
   potentialFormularyCode:exactFormulary?.code||null};
}
export function staffContext({payer='',planId='',year=2026,serviceId='',benefit='Medical',requestType='Initial',gelProductId='',guidance='without-ultrasound'}={}) {
 if(!STAFF_YEARS.includes(year))throw Error('Choose a supported plan year.');
 if(payer&&!STAFF_PAYERS.some(x=>x.name===payer))throw Error('Unknown insurer.');
 if(!['Medical','Pharmacy'].includes(benefit))throw Error('Select the medical or pharmacy benefit.');
 if(!['Initial','Repeat / continuation','Reconsideration / appeal'].includes(requestType))throw Error('Invalid request type.');
 const plan=staffGetPlan(payer,planId,year);
 if(planId&&!plan)throw Error('This plan does not belong to the selected insurance company or year.');
 const service=staffGetService(serviceId);
 if(serviceId&&!service)throw Error('Unknown treatment or medication.');
 const restrictions=[];
 if(!payer)restrictions.push('Select the primary insurance company.');
 if(payer&&!plan)restrictions.push('Select the exact plan/product from this insurer before checking authorization rules.');
 if(!service)restrictions.push('Select the medication or procedure.');
 if(plan?.program==='delegated')restrictions.push('This is an administrator/claim pathway, not a verified medical/pharmacy plan. Obtain underlying carrier, employer group and PBM.');
 if(plan?.program==='original-medicare'&&benefit==='Pharmacy')restrictions.push('Original Medicare alone has no outpatient Part D formulary. Identify the separately enrolled prescription drug plan.');
 if(plan?.program==='part-d'&&service?.type==='procedure')restrictions.push('Part D is the retail drug benefit, not the surgical/facility medical payer.');
 if(plan?.program==='original-medicare'&&service?.type==='medication'&&benefit==='Pharmacy')restrictions.push('Choose the member’s actual PDP, not original Part B.');
 if(plan?.payer==='Medigap')restrictions.push('Medigap is supplemental; identify original Medicare and separate pharmacy coverage before deciding treatment benefits.');
 if(plan?.year&&!plan.year.includes(String(year)))restrictions.push('Plan source year requires current-year verification.');
 if(plan&&plan.status!=='live-drug-search')restrictions.push('This plan does not yet have complete in-app drug-level formulary records; use its official source.');
 let liveSource=null;
 if(plan?.liveSourceId&&service?.type==='medication'&&benefit==='Pharmacy') {
   liveSource=PUBLISHED_FORMULARIES.find(x=>x.id===plan.liveSourceId&&x.year===year&&x.payer===plan.payer)||null;
 }
 let matchedPolicies=[],supplementaryPA=[];
 if(plan&&service?.type==='medication') {
   const scope=policyScope(plan,benefit);
   // Keep policy listings as contextual review requirements, not approval
   // determinations. MDX delegated UHC never becomes all UHC plans.
   if(plan.program!=='delegated'&&plan.payer!=='Medigap'&&!['Medicare Part D','Federal employee / postal','VA / Community Care','TRICARE'].includes(scope.line)){
     const candidates=matchingPolicies(scope,service.id,[]);
     matchedPolicies=candidates.filter(x=>x.kind==='medical-policy');
     supplementaryPA=candidates.filter(x=>x.kind==='authorization-list');
   }
 }
 const primaryPolicy=matchedPolicies.length===1?matchedPolicies[0]:null;
 let criteria=[];
 if(service?.type==='medication'){
   const p=primaryPolicy?applyPolicyPathway(primaryPolicy,'',service.id):null;
   const all=[...medChecklist,...(p?.criteria||[])];
   const ids=new Set();
   criteria=all.filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true;});
   if(primaryPolicy?.pathways?.length)restrictions.push('Medical policy has alternative qualification pathways; select and verify a specific pathway in the full source.');
 }else if(service?.type==='procedure'){
   if(orthoProcedures.some(x=>x.id===service.id))
     criteria=getOrthoActiveCriteria({procedureId:service.id,requestType,gelProductId,guidance});
   else criteria=extraCriteria(service);
 }
 const planLine=staffPlanProgramLine(plan);
 const sources=service?.type==='procedure'&&orthoProcedures.some(x=>x.id===service.id)&&plan
  ?getOrthoPayerSources({procedureId:service.id,payer:plan.payer,line:planLine}):[];
 const potentialNames=(primaryPolicy?primaryPolicy.preferred:[])||[];
 const possibleCodes=service?.type==='procedure'?
    (orthoProcedures.some(x=>x.id===service.id)?getOrthoProcedureCodes({procedureId:service.id,gelProductId,guidance}):service.codes||[]):[];
 return {
   plan,service,planLine,liveSource,primaryPolicy,
   policyConflict:matchedPolicies.length>1,matchedPolicies,supplementaryPA,
   criteria,sourceLinks:[
     ...(plan?[{name:plan.name,url:plan.sourceUrl,status:plan.status,note:plan.notes}]:[]),
     ...matchedPolicies.map(p=>({name:p.title,url:p.url,status:'medical-policy-review',note:p.limitations})),
     ...supplementaryPA.map(p=>({name:p.title,url:p.url,status:'authorization-list',note:p.limitations})),
     ...sources.map(x=>({name:x.title,url:x.url,status:x.kind,note:x.note}))
   ],
   possibleCodes,preferredProducts:potentialNames,restrictions,
   assurance:{planOwnedByPayer:!!plan,formulary:'not determined',priorAuthorization:'not determined',
     medicalNecessity:'requires clinical record review',cost:'not determined'}
 };
}
export function staffAuthorizePacket({payer,planId,year,serviceId,benefit='Medical',requestType='Initial',setting='Office',gelProductId='',guidance='without-ultrasound',checks={}}) {
 const ctx=staffContext({payer,planId,year,serviceId,benefit,requestType,gelProductId,guidance});
 if(!ctx.plan||!ctx.service)throw Error('Select exact payer plan and requested service first.');
 const {plan,service}=ctx;
 if(!checks||typeof checks!=='object'||Array.isArray(checks)||Object.keys(checks).some(id=>!ctx.criteria.some(x=>x.id===id)&&id!=='coverageVerified'))
   throw Error('Only the prepared documentation checklist may be used.');
 const lines=[
   'PACIFIC BONE & JOINT — PRIOR AUTHORIZATION DOCUMENTATION WORKSHEET',
   'TEMPLATE ONLY — NOT PATIENT-READY / NOT A CLINICIAN-SIGNED LETTER',
   'No PHI may be entered into this application. Populate identifiers and attachments only in the approved clinical system.',
   '',
   'TO: '+plan.payer+' — exact authorization department must be verified',
   'PLAN: '+plan.name+' (source '+plan.id+', year '+year+')',
   'SERVICE: '+service.name+' ('+service.type+')',
   'BENEFIT: '+benefit+' | '+ctx.planLine+' | '+setting+' | '+requestType,
   'CANDIDATE CODES: '+(ctx.possibleCodes.length?ctx.possibleCodes.map(x=>x.code+' ('+x.type+')').join(', '):'No verified code — obtain payer/device-specific coding determination'),
   '',
   'SUBJECT: Request for authorization of '+service.name,
   'PATIENT: [To be completed ONLY within HIPAA-approved clinical workflow]',
   'DIAGNOSIS / LATERALITY: [Clinician must document from examination and chart]',
   'MEDICAL NECESSITY STATEMENT: [Clinician-authored indication and clinical rationale required]',
   'PRIOR TREATMENTS / RESPONSE: [Attach exact dates, response and exception evidence]',
   'SPECIFIC PRODUCT / PROCEDURE: [Dose, route, units, equipment, stage, components and site]',
   '',
   'SUPPORTING RECORDS — located does not mean criteria satisfied',
   ...ctx.criteria.map(x=>(checks[x.id]===true?'[RECORD LOCATED] ':'[NOT YET LOCATED] ')+x.label+' — '+x.help),
   '',
   'CURRENT PAYER POLICY / FORMULARY VERIFICATION STILL REQUIRED',
   'Payer source: '+plan.sourceUrl,
   ...ctx.sourceLinks.filter(x=>x.url!==plan.sourceUrl).map(x=>x.name+': '+x.url),
   ...ctx.restrictions.map(x=>'UNRESOLVED: '+x),
   'UNRESOLVED: Exact member eligibility, medical benefit coverage and current PA requirement cannot be verified in this trial.',
   'UNRESOLVED: Attach payer-required forms, clinician-reviewed notes and exact supporting records.',
   'UNRESOLVED: Staff must verify correct payer routing, submission channel and authorization response.',
   '',
   'DO NOT SUBMIT THIS TEMPLATE AS A COMPLETED REQUEST. The app did not assess clinical facts or member benefits.'
 ];
 return lines.join('\n')+'\n';
}
export function staffPatientScript({payer,planId,year,serviceId,benefit='Medical',cost=null}){
 const ctx=staffContext({payer,planId,year,serviceId,benefit});
 if(!ctx.plan||!ctx.service)throw Error('Choose exact plan and service.');
 const pieces=[
   'We are checking coverage for '+ctx.service.name+' under '+ctx.plan.name+' ('+year+').',
   'The insurance plan must verify whether the service is covered, whether an authorization is required, and whether any medications or products are preferred.',
   'Your estimated portion may include a professional fee, facility charge and other separately billed services, depending on your plan and remaining deductible.'
 ];
 if(cost&&Number.isFinite(cost.totalRequired)&&cost.totalRequired>=0)
    pieces.push('Our preliminary cost scenario is $'+cost.totalRequired.toFixed(2)+' based on assumptions that still require verification; this is not a guaranteed bill.');
 else pieces.push('We do not yet have enough verified information to provide a complete dollar estimate.');
 pieces.push('We will confirm the benefits and authorization before giving a personalized estimate. Actual charges may change with the services provided and claim processing.');
 return pieces.join(' ');
}
export function validateStaffRegistry(){
 const payerSet=new Set(STAFF_PAYERS.map(x=>x.name)),seen=new Set();
 if(!STAFF_PAYERS.length)throw Error('No payer entries.');
 for(const plan of hawaiiCoverageSources){
   if(plan.id&&seen.has(plan.id))throw Error('Duplicate plan.');
   seen.add(plan.id);
   if(!payerSet.has(plan.payer)&&plan.payer!=='Other Medicare Advantage')throw Error('Unrecognized payer: '+plan.payer);
   if(plan.liveSourceId&&!PUBLISHED_FORMULARIES.some(x=>x.id===plan.liveSourceId&&x.payer===plan.payer))
     throw Error('A live drug source cannot be assigned to a different carrier.');
 }
 const serviceIds=new Set();
 for(const service of STAFF_SERVICES){
   if(serviceIds.has(service.id)||!STAFF_CATEGORY_LABELS[service.category])throw Error('Duplicate or uncategorized service '+service.id);
   serviceIds.add(service.id);
 }
 return true;
}
validateStaffRegistry();
