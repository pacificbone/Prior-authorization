import {getOrthoProcedure,getOrthoProcedureCodes} from './orthopedic-procedures.mjs';
import {drugs} from './catalog.mjs';
export const COST_YEARS=Object.freeze([
  2026,
  2027
]);

export const COST_PAYERS=Object.freeze([
  "HMSA",
  "UnitedHealthcare",
  "Kaiser Permanente",
  "UHA",
  "HMAA",
  "Curative",
  "AlohaCare",
  "Humana",
  "Devoted Health",
  "MDX",
  "HMA / Verdegard",
  "Traditional Medicare",
  "Veterans Affairs",
  "TRICARE",
  "Workers compensation",
  "Other",
  "Self-pay"
]);

export const COST_LINES=Object.freeze([
  "Commercial",
  "Individual Exchange",
  "QUEST / Medicaid",
  "Medicare Advantage",
  "Traditional Medicare",
  "VA / Community Care",
  "TRICARE",
  "Workers compensation",
  "Uninsured / self-pay"
]);

export const COST_SETTINGS=Object.freeze([
  "Office",
  "ASC",
  "Hospital outpatient",
  "Hospital inpatient"
]);

export const COST_NETWORKS=Object.freeze([
  "unknown",
  "in-network",
  "out-of-network"
]);

export const COST_COVERAGE=Object.freeze([
  "unverified",
  "staff-verified-covered",
  "staff-verified-not-covered"
]);

export const COST_SECONDARY=Object.freeze([
  "unknown",
  "none",
  "possible",
  "verified-other"
]);

export const COST_RATE_SOURCES=Object.freeze([
  "unverified",
  "payer-cost-estimator",
  "hospital-negotiated-rate",
  "payer-negotiated-rate",
  "cms-medicare-rate",
  "written-quote",
  "self-pay-quote"
]);

export const COST_METHODS=Object.freeze([
  "unknown",
  "coinsurance",
  "copay",
  "both",
  "none",
  "cash",
  "part-a-review"
]);

export const COST_FACTS=Object.freeze([
  {
    "id": "part-d-2026",
    "year": 2026,
    "kind": "part-d",
    "title": "Medicare Part D 2026 covered-drug OOP threshold",
    "url": "https://www.cms.gov/newsroom/fact-sheets/final-cy-2026-part-d-redesign-program-instructions",
    "oopThreshold": 2100,
    "note": "Part D covered prescription-drug spending has a $2,100 annual OOP threshold in 2026. This is distinct from Part B medical services and depends on qualifying incurred drug costs, formulary coverage and LIS/Extra Help."
  },
  {
    "id": "part-d-2027",
    "year": 2027,
    "kind": "part-d",
    "title": "Medicare Part D 2027 covered-drug OOP threshold",
    "url": "https://www.medicare.gov/health-drug-plans/part-d/basics/costs",
    "oopThreshold": 2400,
    "note": "2027 Part D covered-drug annual OOP threshold is $2,400. Verify the member's exact PDP or MA-PD benefits and Extra Help; this is not a medical Part B or inpatient cap."
  },
  {
    "id": "medicare-2026",
    "year": 2026,
    "kind": "medicare",
    "title": "Original Medicare 2026 Part A and Part B cost sharing",
    "url": "https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles",
    "partADeductible": 1736,
    "partBDeductible": 283,
    "usualPartBCoinsurancePercent": 20,
    "note": "Part A hospital deductible is per benefit period; outpatient Part B deductible is annual. Inpatient facility cost share is not a simple 20% of an MRF price. Original Medicare has no annual medical out-of-pocket ceiling."
  },
  {
    "id": "marketplace-2026",
    "year": 2026,
    "kind": "marketplace",
    "title": "2026 federal Marketplace maximum annual cost sharing",
    "url": "https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/",
    "individualFederalCeiling": 10600,
    "familyFederalCeiling": 21200,
    "note": "This is a statutory maximum, not the patient’s specific plan MOOP. Non-covered and out-of-network services may not count."
  },
  {
    "id": "marketplace-2027",
    "year": 2027,
    "kind": "marketplace",
    "title": "2027 federal Marketplace maximum annual cost sharing",
    "url": "https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/",
    "individualFederalCeiling": 12000,
    "familyFederalCeiling": 24000,
    "note": "This is an outer statutory ceiling, not the member’s specific out-of-pocket limit."
  },
  {
    "id": "hmsa-akamai-standard-2026",
    "year": 2026,
    "kind": "plan-example",
    "title": "HMSA Akamai Advantage Standard (specific 2026 neighbor-island plan)",
    "url": "https://hmsa.com/content/assets/aa-26-standard-eoc.pdf",
    "outpatientInNetworkFacilityCoinsurancePercent": 20,
    "outpatientOutNetworkFacilityCoinsurancePercent": 40,
    "note": "Example from this named plan’s EOC; professional fees are separately described. DO NOT apply to other Akamai Advantage, HMSA commercial or QUEST plans."
  },
  {
    "id": "va-2026",
    "year": 2026,
    "kind": "va",
    "title": "2026 VA medical copay rates",
    "url": "https://www.va.gov/health-care/copay-rates/",
    "note": "Service-connected rating, care type, priority group and income-related exemptions determine copays. Some specialty outpatient visits cost $50; this is NOT a flat surgery price."
  },
  {
    "id": "tricare-2026",
    "year": 2026,
    "kind": "tricare",
    "title": "TRICARE 2026 health plan costs",
    "url": "https://tricare.mil/trrcosts",
    "note": "Prime vs Select, sponsor Group A/B, beneficiary group, network and facility determine cost sharing; never reuse a single universal amount."
  },
  {
    "id": "quest-hawaii",
    "payer": "Kaiser Permanente",
    "year": null,
    "kind": "quest",
    "title": "Hawaiʻi QUEST cost-sharing — official Kaiser member information",
    "url": "https://healthy.kaiserpermanente.org/hawaii/shop-plans/medicaid/faqs",
    "note": "Kaiser says most covered QUEST services have no copay for most eligible members, but a monthly cost share can apply based on financial eligibility. Verify the actual plan, authorized service, and any secondary coverage; never assume $0."
  },
  {
    "id": "quest-hmsa",
    "year": null,
    "kind": "quest",
    "payer": "HMSA",
    "title": "HMSA QUEST Member Handbook — cost sharing",
    "url": "https://hmsa.com/content/assets/member-handbook-quest.pdf",
    "note": "Most covered HMSA QUEST benefits are at no cost, but monthly financial-eligibility-based cost sharing may apply; if the member has Medicare, secondary coverage and prescription drugs differ."
  },
  {
    "id": "quest-alohacare",
    "year": null,
    "kind": "quest",
    "payer": "AlohaCare",
    "title": "AlohaCare QUEST medical coverage and cost sharing",
    "url": "https://www.xns1.alohacare.org/QUEST/MedicalCoverage",
    "note": "AlohaCare says no copayment for covered services and drugs except certain Medicare-drug arrangements, with possible eligibility-based cost sharing. Confirm current plan and authorization."
  },
  {
    "id": "wc-hawaii",
    "year": null,
    "kind": "workers-comp",
    "title": "Hawaiʻi workers compensation medical benefits",
    "url": "https://labor.hawaii.gov/dcd/main/frequently-asked-questions/",
    "note": "An accepted industrial claim should pay for injury-related covered treatment and hospital care; verify authorization and acceptance. Not a commercial patient deductible."
  },
  {
    "id": "gfe",
    "year": null,
    "kind": "self-pay",
    "title": "CMS Good Faith Estimate for uninsured or self-pay",
    "url": "https://www.cms.gov/initiatives/your-patient-rights/medical-bill-rights/know-your-rights/without-insurance",
    "note": "Separate good-faith estimate obligation for uninsured/self-pay patients. A one-provider estimate may omit facility and outside specialists."
  },
  {
    "id": "tic",
    "year": null,
    "kind": "transparency",
    "title": "CMS Transparency in Coverage—payer negotiated rates and member cost tool",
    "url": "https://www.cms.gov/initiatives/healthplan-price-transparency/overview/plans-issuers",
    "note": "Public negotiated rates are not member-specific payment estimates; most applicable plans have a personalized consumer cost-estimator tool."
  }
]);

export const COST_FACILITIES=Object.freeze([
  {
    "id": "none",
    "name": "Not selected",
    "sourceUrl": null,
    "category": "unknown",
    "note": "Choose a specific care facility to look up negotiated charges."
  },
  {
    "id": "queens-honolulu",
    "name": "Queen’s Medical Center, Honolulu",
    "sourceUrl": "https://www.queens.org/pricing-transparency/",
    "category": "hospital-mrf",
    "note": "Published hospital negotiated/standard charges; confirm payer, network, procedure code and facility-only components."
  },
  {
    "id": "queens-west",
    "name": "Queen’s Medical Center – West Oʻahu",
    "sourceUrl": "https://www.queens.org/pricing-transparency/",
    "category": "hospital-mrf",
    "note": "Separate Queen’s West Oʻahu machine-readable file; professional and anesthesia fees may be outside facility amount."
  },
  {
    "id": "castle",
    "name": "Adventist Health Castle",
    "sourceUrl": "https://www.adventisthealth.org/patients-and-visitors/price-transparency/",
    "category": "hospital-mrf",
    "note": "Castle provides machine-readable rates and consumer estimator, not a guarantee of patient liability."
  },
  {
    "id": "kuakini",
    "name": "Kuakini Medical Center",
    "sourceUrl": "https://www.kuakini.org/wps/portal/public/Patient-Information/Financial-Information/price-transparency",
    "category": "hospital-mrf",
    "note": "Charge master and shoppable estimates do not necessarily reflect insurer-negotiated allowed amounts."
  },
  {
    "id": "straub",
    "name": "Straub Benioff Medical Center",
    "sourceUrl": "https://www.hawaiipacifichealth.org/patient-resources/price-transparency/",
    "category": "hospital-mrf",
    "note": "Hawaiʻi Pacific Health provides hospital MRFs and a member/guest estimator."
  },
  {
    "id": "pali-momi",
    "name": "Pali Momi Medical Center",
    "sourceUrl": "https://www.hawaiipacifichealth.org/patient-resources/price-transparency/",
    "category": "hospital-mrf",
    "note": "Select the Pali Momi source rather than combining multiple Hawaiʻi Pacific Health hospitals."
  },
  {
    "id": "hilo",
    "name": "Hilo Medical Center / Hilo Benioff",
    "sourceUrl": "https://www.hhsc.org/price-transparency/",
    "category": "hospital-mrf",
    "note": "Hawaiʻi Health Systems transparency directory; verify current entity, file and payer contract."
  },
  {
    "id": "kona",
    "name": "Kona Community Hospital",
    "sourceUrl": "https://www.hhsc.org/price-transparency/",
    "category": "hospital-mrf",
    "note": "Hawaiʻi Health Systems hospital-specific cost estimator / machine-readable source."
  },
  {
    "id": "queens-north-hawaii",
    "name": "Queen’s North Hawaiʻi Community Hospital",
    "sourceUrl": "https://www.queens.org/pricing-transparency/",
    "category": "hospital-mrf",
    "note": "Hospital-specific price file. Verify plan, service setting, code and whether facility price includes implants."
  },
  {
    "id": "kaiser-moanalua",
    "name": "Kaiser Moanalua Medical Center",
    "sourceUrl": "https://healthy.kaiserpermanente.org/hawaii/doctors-locations/price-transparency",
    "category": "hospital-mrf",
    "note": "Kaiser facility rates and in-network plan pricing are not interchangeable with Added Choice PPO or other Kaiser products."
  },
  {
    "id": "maui-memorial",
    "name": "Maui Memorial Medical Center",
    "sourceUrl": "https://www.mauihealth.org/patients-and-visitors/billing-information/price-transparency/",
    "category": "hospital-mrf",
    "note": "Use the specific Maui Memorial rate source and exact payer; hospital and surgeon fees may be separate."
  },
  {
    "id": "invision",
    "name": "InVision Imaging (Honolulu)",
    "sourceUrl": "https://www.invisionhawaii.com/",
    "category": "provider-site-only",
    "note": "Imaging location only. No independently verified machine-readable negotiated-price file; request a written insurer-matched estimate."
  },
  {
    "id": "hra",
    "name": "Hawaiʻi Radiologic Associates (Hilo / Kona)",
    "sourceUrl": "https://www.hirad.com/",
    "category": "provider-site-only",
    "note": "Imaging location only. Contact the provider and payer for facility/professional quote; no public negotiated rate imported."
  },
  {
    "id": "hdrs",
    "name": "Hawaiʻi Diagnostic Radiology Services",
    "sourceUrl": "https://www.hawaiidrs.com/our-locations/",
    "category": "provider-site-only",
    "note": "Independent imaging provider; published operator location is not a patient cost estimator or price transparency file."
  },
  {
    "id": "other",
    "name": "Other facility / office / ASC",
    "sourceUrl": null,
    "category": "manual",
    "note": "Collect a written, dated insurer-matched quote from the actual ASC or hospital; do not substitute nearby-hospital rates."
  }
]);

export const COST_PAYER_TOOLS=Object.freeze([
  {
    "id": "uha-medical",
    "payers": ["UHA"],
    "title": "UHA Personalized Price Comparison Tool",
    "url": "https://www.uhahealth.com/important-notices/transparency-in-coverage-and-no-surprises-act-overview",
    "note": "UHA's member portal estimates billing-code and bundled-service out-of-pocket amounts with accumulators; enter actual plan and facility."
  },
  {
    "id": "uha-rx",
    "payers": ["UHA"],
    "title": "UHA Drug Out-of-Pocket Estimator",
    "url": "https://www.uhahealth.com/members/provider-search/member-drug-tools",
    "note": "This drug tool is only an estimate, and may not match the member's exact PBM benefit. Confirm drug and dispensing channel."
  },
  {
    "id": "kaiser-cost",
    "payers": ["Kaiser Permanente"],
    "title": "Kaiser Hawaiʻi Personalized Cost Estimates",
    "url": "https://healthy.kaiserpermanente.org/hawaii/support/estimating-your-costs.html",
    "note": "Kaiser offers member-specific deductible and out-of-pocket-based care estimates and a separate sample fee list; verify individual HMO/product."
  },
  {
    "id": "hmsa",
    "payers": [
      "HMSA"
    ],
    "title": "HMSA Procedure Cost Estimator (member-specific)",
    "url": "https://hmsa.com/help-center/compare-out-of-pocket-costs-of-certain-medical-items-and-services/",
    "note": "Commercial members can log into My Account to estimate plan-specific deductible, copay and coinsurance."
  },
  {
    "id": "hmsa-ma",
    "payers": [
      "HMSA"
    ],
    "title": "HMSA Akamai Advantage 2026–2027 Evidence of Coverage",
    "url": "https://www.hmsa.com/prc/plan-library-medicare/hmsa-akamai-advantage/",
    "note": "Find the exact Akamai plan and year; hospital, ASC and physician cost shares can differ."
  },
  {
    "id": "queens",
    "payers": [],
    "title": "Queen’s medical center pricing transparency",
    "url": "https://www.queens.org/pricing-transparency/",
    "note": "Select exact hospital; MRF standard charges alone are not patient costs."
  },
  {
    "id": "hph",
    "payers": [],
    "title": "Hawaiʻi Pacific Health patient cost estimate",
    "url": "https://www.hawaiipacifichealth.org/patient-resources/cost-estimates/",
    "note": "MyChart guest/patient estimator with insurance plan data."
  },
  {
    "id": "adventist",
    "payers": [],
    "title": "Adventist Health Castle price estimation",
    "url": "https://www.adventisthealth.org/patients-and-visitors/price-transparency/",
    "note": "Castles price estimator and facility-specific negotiated rates."
  },
  {
    "id": "kuakini",
    "payers": [],
    "title": "Kuakini Medical Center price transparency",
    "url": "https://www.kuakini.org/wps/portal/public/Patient-Information/Financial-Information/price-transparency",
    "note": "Separate facility charge and patient insurance benefits."
  },
  {
    "id": "hhsc",
    "payers": [],
    "title": "Hawaiʻi Health Systems hospital price estimators",
    "url": "https://www.hhsc.org/price-transparency/",
    "note": "Locate specific Hilo/Kona hospital files and cost tools."
  },
  {
    "id": "medicare",
    "payers": [
      "Traditional Medicare"
    ],
    "title": "CMS 2026 Medicare costs",
    "url": "https://www.medicare.gov/basics/get-started-with-medicare/medicare-basics/what-does-medicare-cost",
    "note": "Confirm Part A benefit period, Part B deductible, 20% general co-pay and secondary coverage."
  },
  {
    "id": "va",
    "payers": [
      "Veterans Affairs"
    ],
    "title": "VA 2026 medical copay rates",
    "url": "https://www.va.gov/health-care/copay-rates/",
    "note": "Priority group and service-connected status matter; Community Care requires referral/authorization."
  },
  {
    "id": "tricare",
    "payers": [
      "TRICARE"
    ],
    "title": "TRICARE 2026 health plan costs",
    "url": "https://tricare.mil/trrcosts",
    "note": "Plan Prime/Select, category, Group A/B, network and cost-share determine amount."
  },
  {
    "id": "quest",
    "payers": [
      "AlohaCare",
      "Kaiser Permanente",
      "HMSA",
      "UnitedHealthcare"
    ],
    "title": "Hawaiʻi Medicaid cost-sharing FAQ",
    "url": "https://cca.hawaii.gov/ins/faqs/",
    "note": "Only use for verified QUEST members and covered, authorized services; exceptions apply."
  },
  {
    "id": "wc",
    "payers": [
      "Workers compensation"
    ],
    "title": "Hawaiʻi workers compensation medical benefits",
    "url": "https://labor.hawaii.gov/dcd/main/frequently-asked-questions/",
    "note": "Only accepted work injury / covered treatment; confirm claim and carrier routing."
  },
  {
    "id": "cms-tic",
    "payers": [],
    "title": "CMS payer negotiated-rate transparency and member tool",
    "url": "https://www.cms.gov/initiatives/healthplan-price-transparency/overview/plans-issuers",
    "note": "In-network negotiated rates must match actual provider, contract, procedure and billable bundle."
  }
]);

export const COST_MEDICATIONS=Object.freeze([
  {id:'drug-evenity',name:'Evenity (romosozumab)',category:'medication',drugId:'evenity',settingNote:'Office-administered or specialty-pharmacy billing varies by payer.'},
  {id:'drug-prolia',name:'Prolia (denosumab)',category:'medication',drugId:'prolia',settingNote:'Medical versus pharmacy benefit and preferred biosimilar need verification.'},
  {id:'drug-zoledronic-acid',name:'Zoledronic acid (Reclast)',category:'medication',drugId:'zoledronic-acid',settingNote:'Infusion and medication may be billed separately.'},
  {id:'drug-teriparatide',name:'Teriparatide (Forteo/generic)',category:'medication',drugId:'teriparatide',settingNote:'Self-administered prescription: pharmacy formulary/PBM and quantity matter.'}
]);
export function getCostService(id){
  const existing=getOrthoProcedure(id)||COST_MEDICATIONS.find(x=>x.id===id);
  if(existing)return existing;
  if(typeof id!=='string'||!id.startsWith('drug-'))return null;
  const drug=drugs.find(x=>x.id===id.slice(5));
  return drug?{id,name:drug.name,category:'medication',drugId:drug.id,settingNote:'Check the exact benefit, dispensed units and site.'}:null;
}
export function createCostItems(selection){
 const service=getCostService(selection.procedureId);
 if(!service)throw new Error('Unknown service.');
 const procedureCodes=service.category==='medication'?[]:getOrthoProcedureCodes(selection);
 const coded=procedureCodes.filter(x=>x.type==='CPT'||x.type==='HCPCS');
 const surgicalCode=coded.find(x=>!x.code.startsWith('J'))?.code||'';
 const gelCode=coded.find(x=>x.code.startsWith('J'))?.code||'';
 const items=[];
 const medication=service.category==='medication';
 function item(id,label,code,kind,required=true){
   const medicare=selection.payer==='Traditional Medicare' && selection.year===2026;
   const partA=medicare&&kind==='facility'&&selection.setting==='Hospital inpatient';
   const usesPartB=medicare&&!partA&&selection.benefit==='Medical';
   items.push({
     id,label,code,kind,required,
     allowed:null,
     source:'unverified',
     method:partA?'part-a-review':usesPartB?'coinsurance':selection.payer==='Self-pay'?'cash':'unknown',
     percentage:usesPartB?20:null,
     copay:null,
     deductibleApplies:usesPartB,
     oopEligible:!partA
   });
 }
 if(medication){
   item('drug-product',service.name+' medication product (per planned course)', '', 'medical-drug');
   if(service.drugId==='evenity'||service.drugId==='prolia'||service.drugId==='zoledronic-acid')
     item('administration','Injection / infusion administration (if separately billed)','', 'professional',false);
   item('related-visit','Office/infusion visit if separately billed','', 'other',false);
   return items;
 }
 item('surgeon','Surgeon / professional procedure fee',surgicalCode,'professional');
 if(selection.procedureId==='knee-gel'){
   item('gel-product','Hyaluronic acid product (verify dosing and units)',gelCode,'medical-drug');
   item('additional-office','Separate office visit, if payable','', 'other',false);
 } else {
   if(selection.setting!=='Office')item('facility','Hospital or ASC facility fee (confirm included implants)','', 'facility');
   if(selection.setting!=='Office')item('anesthesia','Anesthesia professional / facility services','', 'anesthesia',!service.category||!['hand'].includes(service.category));
   if(selection.procedureId==='maci-implant')item('maci-cell','MACI cellular product (if separately billed)','J7330','cell-product');
   if(service.category==='arthroplasty'||service.category==='cartilage')item('therapy','Postoperative PT / rehabilitation','', 'rehab',false);
   if(service.category==='arthroplasty')item('implant-extra','Implant or implant-related charge ONLY if separately billable','', 'implant',false);
 }
 return items;
}

export function newCostCase(input={}){
 const procedureId=input.procedureId||'total-knee';
 const initial={
   procedureId,
   gelProductId:input.gelProductId||'',
   guidance:input.guidance||'without-ultrasound',
   payer:input.payer||'HMSA',
   line:input.line||'Commercial',
   setting:input.setting||'ASC',
   year:input.year||2026,
   network:input.network||'unknown',
   coverage:'unverified',
   benefit:input.benefit|| (procedureId.startsWith('drug-')?'Unverified':'Medical'),
   planLabel:'',
   facilityId:'none',
   deductibleRemaining:null,
   oopRemaining:null,
   secondary:'unknown',
   items:[]
 };
 initial.items=createCostItems(initial);
 return initial;
}

export function validateCostCase(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid cost estimate.');
 const keys=['procedureId','gelProductId','guidance','payer','line','setting','year','network','coverage','benefit','planLabel','facilityId','deductibleRemaining','oopRemaining','secondary','items'];
 if(Object.keys(value).some(k=>!keys.includes(k)))throw Error('Unsupported data. Do not enter patient identifiers.');
 if(!getCostService(value.procedureId)||!COST_PAYERS.includes(value.payer)||!COST_LINES.includes(value.line)||
    !COST_SETTINGS.includes(value.setting)||!COST_YEARS.includes(value.year)||!COST_NETWORKS.includes(value.network)||
    !COST_COVERAGE.includes(value.coverage)||!['Medical','Pharmacy','Unverified'].includes(value.benefit)||!COST_SECONDARY.includes(value.secondary)||
    !COST_FACILITIES.some(f=>f.id===value.facilityId))
   throw Error('Invalid payer, service, facility or coverage context.');
 if(typeof value.planLabel!=='string'||value.planLabel.length>80||!(/^[\p{L}\p{N} /&+().,'’ʻ_-]*$/u).test(value.planLabel)||/\d{7,}/.test(value.planLabel))
    throw Error('Enter a general plan product name only; not a member number or PHI.');
 for(const field of ['deductibleRemaining','oopRemaining']){
   const n=value[field];
   if(n!==null&&(!Number.isFinite(n)||n<0||n>1e7||Math.round(n*100)!==n*100))throw Error('Invalid remaining deductible / out-of-pocket balance.');
 }
 if(typeof value.gelProductId!=='string'||!['with-ultrasound','without-ultrasound'].includes(value.guidance))
   throw Error('Invalid gel configuration.');
 const expected=createCostItems(value);
 if(!Array.isArray(value.items)||value.items.length!==expected.length)throw Error('Unexpected charge components.');
 for(let i=0;i<value.items.length;i++){
   const p=value.items[i],base=expected[i];
   if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['id','label','code','kind','required','allowed','source','method','percentage','copay','deductibleApplies','oopEligible'].includes(k))||
     p.id!==base.id||p.label!==base.label||p.code!==base.code||p.kind!==base.kind||p.required!==base.required)
     throw Error('Charge components were modified unexpectedly.');
   if(!COST_RATE_SOURCES.includes(p.source)||!COST_METHODS.includes(p.method)||typeof p.deductibleApplies!=='boolean'||typeof p.oopEligible!=='boolean')
     throw Error('Invalid cost-sharing or rate source.');
   for(const key of ['allowed','copay']){
     if(p[key]!==null&&(!Number.isFinite(p[key])||p[key]<0||p[key]>1e7||Math.abs(p[key]*100-Math.round(p[key]*100))>1e-6))
       throw Error('Invalid dollar amount.');
   }
   if(p.percentage!==null&&(!Number.isFinite(p.percentage)||p.percentage<0||p.percentage>100||Math.round(p.percentage*100)!==p.percentage*100))
     throw Error('Invalid coinsurance percentage.');
 }
 return value;
}

export function estimatePatientCost(data){
 validateCostCase(data);
 const messages=[],components=[],missingRequired=[],missingOptional=[];
 const service=getCostService(data.procedureId);
 const originalMedicare=data.payer==='Traditional Medicare'&&data.line==='Traditional Medicare';
 const selfPay=data.payer==='Self-pay'&&data.line==='Uninsured / self-pay';
 if(!data.planLabel&&!selfPay)messages.push('Exact plan product or employer group is not identified.');
 if(data.network!=='in-network'&&!selfPay)messages.push('Network is not confirmed in-network: out-of-network deductibles, balance billing and protections cannot be calculated reliably.');
 if(data.coverage!=='staff-verified-covered'&&!selfPay)
    messages.push(data.coverage==='staff-verified-not-covered'?'Staff marked the service not covered; a covered-service share is not a cash price.':'Coverage / eligibility / medical necessity have not been confirmed for this benefit and setting.');
 if(data.secondary!=='none'&&!selfPay)messages.push('Secondary insurance, Medicaid dual coverage or Medigap is unresolved or unmodeled; primary-plan estimate may overstate eventual patient liability.');
 if(data.year===2027)messages.push('2027 benefit terms and Medicare statutory amounts require separate verification; do not reuse 2026 rates.');
 if(data.line==='QUEST / Medicaid')messages.push('QUEST generally has little or no copay for most authorized covered services, but financial-eligibility cost sharing and plan exclusions exist. Never enter $0 without verifying the actual plan.');
 if(data.payer==='Workers compensation')messages.push('An accepted and authorized Hawaiʻi work injury may have no patient share for covered related treatment; claim acceptance and carrier authorization must be verified.');
 if(data.payer==='Veterans Affairs')messages.push('VA care may be exempt or subject to priority-group/service-based copays; VA Community Care requires referral and authorization, not a commercial coinsurance assumption.');
 if(data.payer==='TRICARE')messages.push('Verify Prime/Select, beneficiary category, Group A/B, network and annual catastrophic cap before computing cost share.');
 if(data.line==='Medicare Advantage')messages.push('Verify exact MA plan and medical OOP limit; surgery copays and ASC/hospital facility costs may differ from Original Medicare.');

 if(service.category==='medication'&&data.benefit==='Unverified')messages.push('Medication billing is not classified as Medical vs Pharmacy. The correct plan benefit, billing route and specialty pharmacy must be established.');
 if(service.category==='medication'&&data.benefit==='Pharmacy'&&originalMedicare)messages.push('Original Medicare does not provide a standalone pharmacy formulary. Enter the actual Part D PDP and its pharmacy cost-sharing to estimate this prescription.');
 if(service.category==='medication'&&data.benefit==='Pharmacy'&&data.line==='Medicare Advantage')messages.push('For Medicare Advantage Part D medicines, confirm formulary/tier, LIS/Extra Help and the separate annual Part D out-of-pocket threshold.');
 if(service.category==='medication')messages.push('This is one treatment course: course length, dose, units and authorization period affect total cost. Manufacturer assistance was not modeled.');

 if(originalMedicare&&data.network==='in-network')messages.push('Original Medicare has no annual medical out-of-pocket maximum; Medicare assignment and supplemental coverage must be confirmed.');
 if(service.id==='carpal-ultrasound-other')messages.push('Coding for this non-balloon ultrasound technique is not verified; no billable CPT should be inferred.');
 if(service.id==='knee-gel'&&!data.gelProductId)messages.push('Gel product, units and billable HCPCS code are not selected.');
 if(data.facilityId==='none'&&data.items.some(x=>x.id==='facility'))messages.push('Specific surgical facility / contracted payer rate is not identified.');
 if(data.setting==='Hospital inpatient')messages.push('Inpatient facility billing may require MS-DRG, Part A benefit period, length of stay and separate admission rules; a per-CPT outpatient price is not a reliable inpatient estimate.');
 let remainingDed=data.deductibleRemaining===null?null:Math.round(data.deductibleRemaining*100);
 let remainingOop=(data.network==='in-network'&&!originalMedicare&&!selfPay&&data.benefit==='Medical'&&data.oopRemaining!==null)?Math.round(data.oopRemaining*100):null;
 let total=0,priced=0,pricedRequired=0,knownShare=0;
 for(const line of data.items){
   let missingReason='';
   if(line.required&&line.id==='surgeon'&&!line.code)missingReason='No verified procedure code.';
   if(line.required&&line.id==='gel-product'&&!line.code)missingReason='Gel J-code not selected.';
   if(line.allowed===null)missingReason=missingReason||'Negotiated allowed amount / cash quote missing.';
   if(!['cash','none','part-a-review'].includes(line.method) && line.method==='unknown')missingReason=missingReason||'Member cost-share rule missing.';
   if((line.method==='coinsurance'||line.method==='both')&&line.percentage===null)missingReason=missingReason||'Coinsurance percentage missing.';
   if((line.method==='copay'||line.method==='both')&&line.copay===null)missingReason=missingReason||'Copay missing.';
   if(line.deductibleApplies&&line.method!=='none'&&remainingDed===null)missingReason=missingReason||'Remaining annual deductible unknown.';
   if(line.method==='part-a-review')missingReason=missingReason||'Inpatient Part A benefit-period calculation requires manual verification.';
   if(originalMedicare&&data.setting==='Hospital inpatient'&&line.kind==='facility')missingReason='Original Medicare Part A inpatient facility requires benefit-period and admission-specific calculation; no percentage approximation permitted.';
   if(missingReason){
     (line.required?missingRequired:missingOptional).push({id:line.id,label:line.label,reason:missingReason});
     components.push({id:line.id,label:line.label,allowed:line.allowed,patientShare:null,missing:missingReason,required:line.required});
     continue;
   }
   const allowed=Math.round(line.allowed*100);
   let deductiblePaid=0;
   if(line.deductibleApplies&&!['none','cash'].includes(line.method)&&remainingDed!==null){
      deductiblePaid=Math.min(allowed,remainingDed);
      remainingDed-=deductiblePaid;
   }
   const remainder=allowed-deductiblePaid;
   let share=0;
   if(line.method==='cash')share=allowed;
   else if(line.method==='coinsurance')share=deductiblePaid+Math.round(remainder*line.percentage/100);
   else if(line.method==='copay')share=deductiblePaid+Math.min(remainder,Math.round(line.copay*100));
   else if(line.method==='both')share=deductiblePaid+Math.min(remainder,Math.round(line.copay*100)+Math.round(remainder*line.percentage/100));
   else if(line.method==='none')share=0;
   share=Math.max(0,Math.min(allowed,share));
   if(remainingOop!==null&&line.oopEligible&&line.method!=='cash'){
     const adjusted=Math.min(share,remainingOop);
     remainingOop-=adjusted;share=adjusted;
   }
   const patientShare=share/100;
   total+=share;
   knownShare+=share;
   priced++;
   if(line.required)pricedRequired++;
   components.push({
     id:line.id,label:line.label,allowed:line.allowed,patientShare,
     deductibleShare:deductiblePaid/100,required:line.required,rateSource:line.source,missing:null
   });
 }
 const requiredComplete=missingRequired.length===0&&(data.coverage!=='staff-verified-not-covered'||selfPay);
 const isScenario=requiredComplete&&data.coverage==='staff-verified-covered'&&data.network==='in-network'&&data.secondary==='none'&&data.planLabel.trim()!==''&&data.benefit!=='Unverified'&&data.items.filter(x=>x.required).every(x=>x.source!=='unverified')&&!selfPay;
 const sourceMissing=data.items.filter(x=>x.required&&x.source==='unverified').map(x=>x.label);
 if(data.benefit==='Unverified')messages.push('Exact benefit channel has not been identified; do not interpret modeled shares as payable amounts.');
 if(sourceMissing.length)messages.push('At least one required price lacks a verified source; amounts are assumptions, not validated contracted prices.');
 if(missingOptional.length)messages.push('Optional or separately billed services remain unpriced; shown core costs exclude them.');
 if(selfPay)messages.push('For uninsured/self-pay, this modeled cash quote is NOT a formal No Surprises Act Good Faith Estimate. Request facility and surgeon estimates separately.');
 if(originalMedicare&&data.setting==='Hospital inpatient')messages.push('2026 Part A $1,736 deductible is per benefit period; do not use it as an automatic per-surgery copay. Part B physician fees may still be owed.');
 if(!requiredComplete)messages.push(data.coverage==='staff-verified-not-covered'&&!selfPay?'Service is reported noncovered. Do not interpret a covered-service cost-share calculation as the self-pay or full patient price.':'Incomplete required facility/professional/product rates: no comprehensive estimate is available.');
 return {
   status:requiredComplete?'scenario':'incomplete',
   totalRequired:requiredComplete?total/100:null,
   knownComponentShare:knownShare/100,
   components,missingRequired,missingOptional,
   messages,
   priced,
   isScenario,
   quoteReady:false,
   deductibleLeftAfterKnown:remainingDed===null?null:remainingDed/100,
   oopLeftAfterKnown:remainingOop===null?null:remainingOop/100
 };
}

export function selectCostGuidance(value){
 const related=COST_PAYER_TOOLS.filter(t=>t.payers.length===0||t.payers.includes(value.payer));
 const special=COST_FACTS.filter(x=>x.kind===(
   value.payer==='Traditional Medicare'?'medicare':
   value.payer==='Veterans Affairs'?'va':
   value.payer==='TRICARE'?'tricare':
   value.payer==='Workers compensation'?'workers-comp':
   value.payer==='Self-pay'?'self-pay':
   value.line==='QUEST / Medicaid'?'quest':
   value.line==='Individual Exchange'?'marketplace':
   'none'
 ) && (x.year===null||x.year===value.year) && (!x.payer||x.payer===value.payer));
 if(value.benefit==='Pharmacy'&&['Medicare Advantage','Traditional Medicare'].includes(value.line)) {
   const partD=COST_FACTS.find(x=>x.id==='part-d-'+value.year);
   if(partD)special.push(partD);
 }
 // Do not include a specific Akamai-plan example unless the plan can be positively matched.
 // A shared payer label is insufficient to identify actual plan benefits.
 return {tools:related,facts:special,facility:COST_FACILITIES.find(f=>f.id===value.facilityId)};
}

export function costWorksheet(value,{generated='2026-11-07'}={}){
 const result=estimatePatientCost(value);
 const lines=[
 'PACIFIC BONE & JOINT — SYNTHETIC PATIENT COST SCENARIO',
 'NOT A PATIENT QUOTE, CLAIM, ELIGIBILITY OR COVERAGE DETERMINATION',
 'Date: '+generated,
 'Service: '+getCostService(value.procedureId).name,
 'Payer: '+value.payer+' / '+value.line+' / '+value.year,
 'Plan product label: '+(value.planLabel||'[unverified]'),
 'Location: '+value.setting+' / '+(COST_FACILITIES.find(f=>f.id===value.facilityId)?.name||'Not selected'),
 'Network: '+value.network+' / Coverage: '+value.coverage,
 'Claimed benefit channel (verify): '+value.benefit,
 'Known remaining deductible (staff-entered): '+(value.deductibleRemaining===null?'unknown':value.deductibleRemaining),
 'Known in-network remaining out-of-pocket limit (staff-entered): '+(value.oopRemaining===null?'unknown':value.oopRemaining),
 'Secondary coverage: '+value.secondary,
 '',
 'LINE ITEMS — staff-entered allowed charges and benefit assumptions only',
 ...result.components.map(x=>x.label+' | allowed '+(x.allowed===null?'unknown':'$'+x.allowed.toFixed(2))+' | estimated patient share '+(x.patientShare===null?'UNVERIFIED':'$'+x.patientShare.toFixed(2))),
 '',
 'ESTIMATE: '+(result.totalRequired===null?'INCOMPLETE — no comprehensive amount':('$'+result.totalRequired.toFixed(2)+' conditional covered-service core scenario')),
 'Not included: future or separately billed visits, complications, out-of-network balances, uncovered services, post-op meds and any optional missing line items.',
 ...result.messages.map(x=>'- '+x),
 '',
 'No PHI or member identifiers may be entered. Use official payer/facility estimates and verified benefits before providing a real patient-specific estimate.'
 ];
 return lines.join('\n')+'\n';
}
