/**
 * PBJ unified staff navigator, synthetic-only.
 * A PLAN belongs to exactly one PAYER. Never infer formulary inclusion or medical
 * authorization from a network name, a different payer's source or a policy link.
 */
import {hawaiiCoverageSources} from './hawaii-plan-sources.mjs';
import {PUBLISHED_FORMULARIES} from './live-formularies.mjs';
import {drugs,policies,formularyLists} from './catalog.mjs';
import {matchingPolicies,applyPolicyPathway,policyFreshness,dateToday} from './domain.mjs';
import {orthoProcedures,orthoGelProducts,getOrthoActiveCriteria,getOrthoPayerSources,getOrthoProcedureCodes} from './orthopedic-procedures.mjs';
import {EXTRA_PROCEDURES,EXTRA_DRUGS} from './staff-service-catalog.mjs';
import {staffAuthResources} from './staff-auth-resources.mjs';
import {authTemplateForService} from './authorization-template-catalog.mjs';

const NON_PLANS=new Set(['uha-medical-pa','aloha-wrap','va-cfuses','original-d','other-ma']);
// Older catalogs key the same organizations differently; the staff selector names are canonical.
const CATALOG_PAYER=Object.freeze({'MDX Hawaiʻi':'MDX','HMA / Verdegard':'HMA','Kaiser Permanente':'Kaiser','Traditional Medicare':'Medicare'});
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
 ...drugs.map(fromDrug),...EXTRA_DRUGS.filter(d=>!drugs.some(x=>x.id===d.id)).map(fromDrug),
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
 return hawaiiCoverageSources.filter(x=>x.payer===payer&&!NON_PLANS.has(x.id)&&x.availableYears.includes(year));
}
export function staffGetPlan(payer,planId,year=2026) {
 if(!planId)return null;
 return staffPlansForPayer(payer,year).find(x=>x.id===planId)||null;
}
export function staffPlanPrecision(plan,year=2026) {
 if(!plan)return {level:'unselected',label:'No plan selected'};
 if(plan.liveSourceId){
   const source=PUBLISHED_FORMULARIES.find(x=>x.id===plan.liveSourceId&&x.year===year&&x.payer===plan.payer);
   if(source&&source.planId&&source.planIdType)
     return {level:'published-plan-id',label:source.planIdIsFileKey?'Published file plan key (not a member or HIOS identifier)':'Exact published pharmacy plan ID',planId:source.planId,planIdType:source.planIdType,fileKey:source.planIdIsFileKey===true};
 }
 if(plan.program==='delegated')return {level:'administrator',label:'Administrator / claim routing, not a member plan'};
 if(plan.program==='original-medicare')return {level:'benefit-program',label:'Original Medicare medical benefit (not a PDP)'};
 if(plan.program==='veterans'||plan.program==='military')return {level:'benefit-program',label:'Program source; eligibility and referrals must be verified'};
 return {level:'plan-family',label:'Plan family / formulary resource only — exact member product not confirmed'};
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
// The payer whose policies govern the primary claim: Original Medicare for a Medigap supplement on the Traditional Medicare line.
export function staffPrimaryClaimPayer(plan){return plan?.payer==='Medigap'&&staffPlanProgramLine(plan)==='Traditional Medicare'?'Traditional Medicare':plan?.payer;}
export function staffGetService(id) {return STAFF_SERVICES.find(x=>x.id===id)||null;}
const OFFICE_ADMINISTERED_DRUGS=new Set(['evenity','prolia','bildyos','enoby','stoboclo','jubbonti','zoledronic-acid','exparel','lidocaine','bupivacaine','tranexamic-acid']);
export function staffDefaultBenefit(service){
 if(!service||service.type==='procedure')return 'Medical';
 return OFFICE_ADMINISTERED_DRUGS.has(service.id)?'Medical':'Pharmacy';
}
// Search: lower-case, accents and punctuation dropped, so "Synvisc-One", "synvisc one" and "SYNVISC ONE" agree.
const searchNorm=s=>String(s??'').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const GEL_SPELLINGS=Object.freeze({'synvisc-one':['synvisc 1'],'gelsyn-3':['gelsyn']});
const gelPhrases=p=>[...new Set([searchNorm(p.name),searchNorm(p.id),searchNorm(p.name).replace(/ /g,''),searchNorm(p.id).replace(/ /g,''),...(GEL_SPELLINGS[p.id]||[])])];
// Prolia is the reference product, so 'biosimilar' is a search term for the biosimilars only.
const denosumabTerms=['denosumab','osteoporosis'],biosimilarTerms=[...denosumabTerms,'denosumab biosimilar','biosimilar'];
// Common staff words and abbreviations for each service. Search terms only: never coverage or coding statements.
const SERVICE_ALIASES=Object.freeze({
 'total-knee':['TKA','TKR','total knee replacement','knee replacement','total knee'],
 'partial-knee':['UKA','UKR','partial knee','partial knee replacement','unicompartmental knee','uni knee','knee replacement'],
 'revision-knee':['revision TKA','TKA revision','knee revision','revision knee replacement'],
 'total-hip':['THA','THR','total hip replacement','hip replacement','total hip','anterior hip replacement'],
 'revision-hip':['revision THA','THA revision','hip revision','revision hip replacement'],
 'knee-gel':['viscosupplementation','viscosupplement','gel','gel injection','gel shot','hyaluronic acid','hyaluronan','hyaluronate','sodium hyaluronate','HA injection',...orthoGelProducts.flatMap(gelPhrases)],
 'maci-harvest':['MACI','ACI','cartilage biopsy','cartilage harvest','autologous chondrocyte'],
 'maci-implant':['MACI','ACI','autologous chondrocyte implantation','cartilage implant'],
 'maci-cell-product':['MACI','ACI','cultured chondrocytes','cell product'],
 'carpal-open':['CTR','OCTR','carpal tunnel','carpal tunnel release','open carpal tunnel','median nerve decompression'],
 'carpal-endo':['CTR','ECTR','carpal tunnel','carpal tunnel release','endoscopic carpal tunnel'],
 'carpal-balloon':['CTR','carpal tunnel','carpal tunnel release','percutaneous carpal tunnel','balloon carpal tunnel'],
 'carpal-ultrasound-other':['CTR','carpal tunnel','carpal tunnel release','percutaneous carpal tunnel','ultrasound guided carpal tunnel'],
 'trigger-finger':['trigger finger','trigger finger release','trigger thumb','A1 pulley','stenosing tenosynovitis'],
 'trigger-finger-percutaneous':['trigger finger','trigger finger release','trigger thumb','A1 pulley','percutaneous trigger finger','ultrasound guided trigger finger'],
 'si-joint-fusion':['SI fusion','SI joint fusion','SIJ fusion','SIJ','sacroiliac','sacroiliac joint fusion','iFuse'],
 'acl-reconstruction':['ACL','ACLR','ACL repair','anterior cruciate ligament','ligament reconstruction'],
 'bear-acl':['ACL','BEAR','ACL implant','anterior cruciate ligament'],
 'meniscus-repair':['meniscus','meniscal repair','torn meniscus','knee arthroscopy'],
 'knee-meniscectomy':['meniscus','meniscectomy','partial meniscectomy','APM','knee scope','knee arthroscopy'],
 'meniscus-root':['meniscus','meniscal root','root repair'],
 'cartiheal':['Agili-C','CartiHeal','osteochondral implant','cartilage implant'],
 'osteochondral-allograft':['OCA','osteochondral allograft','cartilage transplant'],
 'knee-osteotomy':['HTO','DFO','osteotomy','high tibial osteotomy','distal femoral osteotomy'],
 'pns-knee':['PNS','peripheral nerve stimulation','nerve stimulator'],
 'iovera':['iovera','cryoneurolysis','cryo','cryoablation'],
 'genicular-rfa':['RFA','genicular nerve ablation','radiofrequency ablation','nerve ablation'],
 'prp':['PRP','platelet rich plasma'],
 'bmac':['BMAC','bone marrow aspirate','bone marrow concentrate'],
 'a2m':['A2M','alpha 2 macroglobulin'],
 'corticosteroid-injection':['cortisone','cortisone shot','steroid injection','joint injection'],
 'ultrasound-diagnostic':['ultrasound','diagnostic ultrasound','MSK ultrasound'],
 'mri-knee':['MRI','knee MRI','magnetic resonance'],
 'xray-knee':['x-ray','xray','radiograph'],
 'dexa':['DXA','DEXA','bone density','bone density scan'],
 'dme-brace':['brace','knee brace','DME','unloader brace'],
 'office-pt':['PT','physical therapy','rehab','rehabilitation'],
 'core-decompression':['core decompression','AVN','avascular necrosis'],
 'osseointegration':['osseointegration','amputation implant'],
 'evenity':['romosozumab','osteoporosis'],
 'prolia':denosumabTerms,'bildyos':biosimilarTerms,'enoby':biosimilarTerms,'stoboclo':biosimilarTerms,'jubbonti':biosimilarTerms,
 'zoledronic-acid':['Reclast','zoledronic','zoledronate','bisphosphonate','osteoporosis','infusion'],
 'alendronate':['Fosamax','bisphosphonate','osteoporosis'],
 'risedronate':['Actonel','bisphosphonate','osteoporosis'],
 'ibandronate':['Boniva','Boniva IV','J1740','bisphosphonate','osteoporosis'],
 'teriparatide':['Forteo','osteoporosis'],
 'tymlos':['abaloparatide','osteoporosis'],
 'calcitonin':['Miacalcin','osteoporosis']
});
const serviceCodes=x=>x.id==='knee-gel'?[...(x.codes||[]).map(c=>c.code),...orthoGelProducts.map(p=>p.code)]:
 x.type==='medication'?[...(authTemplateForService(x.id)?.codes||[])]:(x.codes||[]).map(c=>c.code);
// Drug-class labels (e.g. "Denosumab biosimilar") are searchable even though the staff category is "medication".
const drugClass=new Map([...drugs,...EXTRA_DRUGS].map(d=>[d.id,d.category||'']));
// A billing-code-shaped token (27447, J0897, Q5136) matches only the service's own codes and code aliases, never
// description text: descriptions name codes to rule them out ("do not add separate 76942").
const CODE_TOKEN=/^[a-z]?\d{4,5}[a-z]?$/;
const SEARCH_INDEX=new Map(STAFF_SERVICES.map(x=>{
 const phrases=[x.name,x.generic,x.brand,...(SERVICE_ALIASES[x.id]||[]),...serviceCodes(x)].filter(Boolean).map(searchNorm);
 const words=[...new Set(searchNorm([...phrases,x.description,x.category,drugClass.get(x.id)].join(' ')).split(' '))];
 const codes=[...new Set(phrases.flatMap(p=>p.split(' ')).filter(w=>CODE_TOKEN.test(w)))];
 return [x.id,{phrases,words,codes,text:' '+words.join(' ')+' '}];
}));
// Every query token must start a word of the service (or, from 4 characters, appear inside one); a code token must start one of its codes.
const tokenHit=(t,ix)=>CODE_TOKEN.test(t)?ix.codes.some(c=>c.startsWith(t)):ix.words.some(w=>w.startsWith(t))||(t.length>=4&&ix.text.includes(t));
const searchRank=(q,ix)=>ix.phrases.includes(q)?3:ix.phrases.some(p=>(' '+p+' ').includes(' '+q+' '))?2:1;
export function staffServices({type='all',category='all',query=''}={}) {
 const q=searchNorm(String(query).slice(0,80)),tokens=q?q.split(' '):[];
 const found=STAFF_SERVICES.filter(x=>(type==='all'||x.type===type) &&
   (category==='all'||x.category===category) &&
   tokens.every(t=>tokenHit(t,SEARCH_INDEX.get(x.id))));
 return q?found.map((x,i)=>({x,i,r:searchRank(q,SEARCH_INDEX.get(x.id))})).sort((a,b)=>b.r-a.r||a.i-b.i).map(o=>o.x):found;
}
// The orthoGelProducts id when the query names exactly one gel brand; null when it names none or two.
// A brand whose phrase sits inside another named brand's phrase yields ("Synvisc One" is synvisc-one, not synvisc).
// Brands named in the captured policies that are NOT selectable here: a query naming one presets nothing
// ("Hymovis One" is a different product, course and status from Hymovis).
const UNSELECTABLE_GEL_PHRASES=['hymovis one','hymovisone','hymovis 1'];
export function gelProductForQuery(query=''){
 const q=' '+searchNorm(String(query).slice(0,80))+' ';
 if(UNSELECTABLE_GEL_PHRASES.some(f=>q.includes(' '+f+' ')))return null;
 const hits=orthoGelProducts.map(p=>({id:p.id,phrase:gelPhrases(p).filter(f=>q.includes(' '+f+' ')).sort((a,b)=>b.split(' ').length-a.split(' ').length)[0]})).filter(h=>h.phrase);
 const named=hits.filter(h=>!hits.some(o=>o.id!==h.id&&o.phrase!==h.phrase&&(' '+o.phrase+' ').includes(' '+h.phrase+' ')));
 return named.length===1?named[0].id:null;
}
function policyScope(plan,benefit) {
 const line=staffPlanProgramLine(plan);
 const payer=CATALOG_PAYER[plan.payer]||plan.payer;
 const exactFormulary=formularyLists.find(x=>x.payer===payer&&x.line===line&&x.benefit===benefit);
 // The generic HMAA employer directory is NOT proof an employer has adopted OptumRx Premium.
 // For a plan whose directory row is a partially transcribed published list, the transcribed
 // entries are surfaced as a reviewed extract with adoption explicitly unverified.
 const planCode=plan.status==='partial-verified-entries'&&exactFormulary?exactFormulary.code:'';
 return {payer,line,benefit,planCode,carrier:'',plan:'',adoptionVerified:false,
   potentialFormularyCode:exactFormulary?.code||null};
}
export function staffContext({payer='',planId='',year=2026,serviceId='',benefit='Medical',requestType='Initial',gelProductId='',guidance='without-ultrasound',asOf,serviceDate}={}) {
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
 if(plan?.program==='part-d'&&service?.type==='medication'&&benefit==='Medical')restrictions.push('A stand-alone Part D plan has no medical benefit. Identify the member’s Medicare Part B or Medicare Advantage medical payer for an office-administered drug.');
 if(plan?.payer==='HMSA'&&plan.program==='exchange'&&service?.type==='medication'&&benefit==='Medical')restrictions.push('HMSA Metallic / individual-plan adoption of the Commercial and QUEST medical drug policies is not verified; confirm the applicable policy with HMSA before using Commercial criteria.');
 if(plan?.program==='original-medicare'&&service?.type==='medication'&&benefit==='Pharmacy')restrictions.push('Choose the member’s actual PDP, not original Part B.');
 if(plan?.payer==='Medigap')restrictions.push('Medigap is supplemental; identify original Medicare and separate pharmacy coverage before deciding treatment benefits.');
 if(plan&&!plan.year.includes(String(year)))restrictions.push('The reviewed source for this plan is the '+plan.year+' edition. Confirm the '+year+' formulary, policy and plan availability before relying on it.');
 if(plan&&service?.type==='medication'&&benefit==='Pharmacy'&&plan.status!=='live-drug-search')restrictions.push('This plan does not yet have complete in-app drug-level formulary records; use its official source.');
 const precision=staffPlanPrecision(plan,year);
 if(precision.level==='plan-family')restrictions.push('This is a published plan family or source directory, NOT a member-specific plan match. Verify exact contract, plan, employer group, coverage code and PBM before applying formulary, PA criteria or cost sharing.');
 if(precision.level==='administrator')restrictions.push('Administrator is not a direct health-plan benefit. Identify the underwriting/underlying primary carrier and claim-specific authorization delegate.');
 if(precision.level==='published-plan-id')restrictions.push('Published HIOS/plan identifier does not establish that the member is enrolled in that product.');
 
 let liveSource=null;
 if(plan?.liveSourceId&&service?.type==='medication'&&benefit==='Pharmacy') {
   liveSource=PUBLISHED_FORMULARIES.find(x=>x.id===plan.liveSourceId&&x.year===year&&x.payer===plan.payer)||null;
   if(!liveSource)restrictions.push('The indexed machine-readable file for this plan covers '+plan.year+' only; no '+year+' edition is indexed, so use the official source for '+year+'.');
 }
 let matchedPolicies=[],supplementaryPA=[],formularyEntries=[];
 if(plan&&service?.type==='medication') {
   const scope=policyScope(plan,benefit);
   // Keep policy listings as contextual review requirements, not approval
   // determinations. MDX delegated UHC never becomes all UHC plans.
   if(plan.program!=='delegated'&&plan.payer!=='Medigap'&&!['Medicare Part D','Federal employee / postal','VA / Community Care','TRICARE'].includes(scope.line)){
     // asOf is today (tests and reports pass it). A later planned service date is the day a list must still be in
     // force, so an edition that lapses before the service is never shown as current.
     const today=asOf||dateToday(),day=/^\d{4}-\d{2}-\d{2}$/.test(serviceDate||'')&&serviceDate>today?serviceDate:today;
     const candidates=matchingPolicies(scope,service.id,[],day);
     matchedPolicies=candidates.filter(x=>x.kind==='medical-policy');
     supplementaryPA=candidates.filter(x=>x.kind==='authorization-list');
     formularyEntries=candidates.filter(x=>x.kind==='formulary');
     if(formularyEntries.length)restrictions.push('Reviewed extract from the published list '+scope.planCode+' is shown; whether this employer plan adopts that list is NOT verified.');
     // An expired edition is never shown as current, but staff are told it lapsed instead of seeing nothing.
     else{
       const lapsed=policies.filter(p=>p.kind==='formulary'&&p.payer===scope.payer&&p.lines.includes(scope.line)&&p.benefit===benefit&&p.drugIds.includes(service.id)&&
         (!p.planCode||p.planCode===scope.planCode)&&policyFreshness(p,day)==='expired');
       for(const p of lapsed.filter((p,i,a)=>a.findIndex(x=>x.planCode===p.planCode)===i)){
         const list=formularyLists.find(l=>l.code===p.planCode&&l.payer===p.payer);
         const past=p.expires<today;
         restrictions.push('The reviewed '+(list?p.payer+' '+list.label:p.title)+(past?' list expired '+p.expires:' list ends '+p.expires+', before the planned service date')+'; no current edition is indexed'+(past?'':' for that date')+'. Verify on the payer\'s current list.');
       }
     }
     // A delegated administrator's published PA list for this carrier and line (for example the
     // MDX Hawaiʻi list for UHC Medicare Advantage) is shown as delegate context, never as the plan's own rule.
     const delegate=policies.filter(p=>p.kind==='authorization-list'&&p.carrier===plan.payer&&p.payer!==scope.payer&&p.lines.includes(scope.line)&&p.benefit===benefit&&p.drugIds.includes(service.id));
     if(delegate.length){supplementaryPA=[...supplementaryPA,...delegate];restrictions.push('A delegated administrator’s published PA list ('+delegate.map(p=>p.payer).join(', ')+') lists this drug for '+plan.payer+' '+scope.line+'. It applies only if the member’s plan actually delegates to that administrator; verify delegation.');}
   }
   if(plan.program==='delegated'){
     // The administrator itself: show its own published lists as context for the underlying carrier it names.
     const own=policies.filter(p=>p.kind==='authorization-list'&&p.payer===scope.payer&&p.benefit===benefit&&p.drugIds.includes(service.id));
     if(own.length){supplementaryPA=own;restrictions.push('The administrator’s published list applies only to members whose carrier is '+own.map(p=>p.carrier+' ('+p.lines.join(', ')+')').join('; ')+' and who are delegated to it; identify the member’s carrier and line first.');}
   }
 }
 const primaryPolicy=matchedPolicies.length===1?matchedPolicies[0]:null;
 let criteria=[];
 if(service?.type==='medication'){
   const p=primaryPolicy?applyPolicyPathway(primaryPolicy,'',service.id):null;
   const all=[...(p?.criteria||[]),...medChecklist];
   const ids=new Set();
   criteria=all.filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true;});
   if(primaryPolicy?.pathways?.length)restrictions.push('Medical policy has alternative qualification pathways; select and verify a specific pathway in the full source.');
 }else if(service?.type==='procedure'){
   if(orthoProcedures.some(x=>x.id===service.id))
     criteria=getOrthoActiveCriteria({procedureId:service.id,requestType,gelProductId,guidance});
   else criteria=extraCriteria(service);
 }
 const planLine=staffPlanProgramLine(plan);
 // Medigap pays secondary: Original Medicare's own policies and route govern the primary claim.
 const primaryPayer=staffPrimaryClaimPayer(plan);
 if(primaryPayer!==plan?.payer&&service)restrictions.push('Original Medicare primary claim (Medigap pays secondary): Original Medicare (Noridian JE) policies and the CMS Medicare Coverage Database govern the primary claim; the supplement\'s own terms are not verified.');
 const sources=service?.type==='procedure'&&orthoProcedures.some(x=>x.id===service.id)&&plan
  ?getOrthoPayerSources({procedureId:service.id,payer:primaryPayer,line:planLine}):[];
 if(plan&&service?.type==='procedure'&&orthoProcedures.some(x=>x.id===service.id)&&!sources.length)restrictions.push('No payer-specific procedure policy or code-list source is cataloged for '+plan.payer+' on the '+planLine+' line. Research the payer policy manually; absence of a source is not absence of a requirement.');
 const authorizationResources=plan&&service?
  staffAuthResources({payer:primaryPayer,program:plan.program,benefit,
    serviceType:service.type}):[];
 const potentialNames=(primaryPolicy?primaryPolicy.preferred:[])||[];
 const possibleCodes=service?.type==='procedure'?
    (orthoProcedures.some(x=>x.id===service.id)?getOrthoProcedureCodes({procedureId:service.id,gelProductId,guidance}):service.codes||[]):[];
 return {
   plan,service,planLine,planPrecision:precision,liveSource,primaryPolicy,authorizationResources,
   policyConflict:matchedPolicies.length>1,matchedPolicies,supplementaryPA,formularyEntries,
   criteria,sourceLinks:[
     ...(plan?[{name:plan.name,url:plan.sourceUrl,status:plan.status,note:plan.notes}]:[]),
     ...matchedPolicies.map(p=>({name:p.title,url:p.url,status:'medical-policy-review',note:p.limitations})),
     ...supplementaryPA.map(p=>({name:p.title,url:p.url,status:'authorization-list',note:p.limitations})),
     ...formularyEntries.map(p=>({name:p.title,url:p.url,status:'formulary-extract',note:p.limitations})),
     ...sources.map(x=>({name:x.title,url:x.url,status:x.kind,note:x.note})),
     ...authorizationResources.map(x=>({name:x.name,url:x.url,status:x.role==='check'?'Official PA code/benefit lookup':'Authorization routing instructions',note:x.note}))
   ],
   possibleCodes,preferredProducts:potentialNames,restrictions,
   assurance:{planOwnedByPayer:!!plan,formulary:'not determined',priorAuthorization:'not determined',
     medicalNecessity:'requires clinical record review',cost:'not determined'}
 };
}
export function staffAuthorizePacket(input) {
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['payer','planId','year','serviceId','benefit','requestType','setting','gelProductId','guidance','checks'].includes(k)))
   throw Error('Only selected plan, service and checklist metadata are allowed. No patient identifiers or clinical notes.');
 const {payer,planId,year,serviceId,benefit='Medical',requestType='Initial',setting='Office',gelProductId='',guidance='without-ultrasound',checks={}}=input;
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
   // Original Medicare (and a Medigap supplement behind it) has no authorization department to address a request to.
   'TO: '+(plan.program==='original-medicare'?'Original Medicare (Noridian JE) for the primary claim — no authorization department is assumed; confirm whether any service-specific prior-authorization program applies':plan.payer+' — exact authorization department must be verified'),
   'PLAN: '+plan.name+' (source '+plan.id+', year '+year+')',
   'PLAN IDENTIFICATION: '+ctx.planPrecision.label+(ctx.planPrecision.planId?' / '+ctx.planPrecision.planId:'')+'.',
   'SERVICE: '+service.name+' ('+service.type+')',
   'BENEFIT: '+benefit+' | '+ctx.planLine+' | '+setting+' | '+requestType,
   'CANDIDATE CODES: '+(ctx.possibleCodes.length?ctx.possibleCodes.map(x=>x.code+' ('+x.type+')').join(', '):'No verified code — obtain payer/device-specific coding determination'),
   '',
   'SUBJECT: '+(plan.program==='original-medicare'?'Claim documentation worksheet for ':'Request for authorization of ')+service.name,
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
   'OFFICIAL SUBMISSION ROUTE: [Staff to confirm code, plan, delegate and correct provider portal; this app does not submit]',
   ...ctx.authorizationResources.map(x=>('Route: '+x.name+' ['+x.role+'] — '+x.url)),
  
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
 if(cost?.quoteReady===true&&Number.isFinite(cost.totalRequired)&&cost.totalRequired>=0)
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
