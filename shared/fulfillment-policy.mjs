import {ADOPTION_SCOPE_KEYS,policyDay,validPolicyDate,validPublicSource,validSourceDigest,assessPlanAdoption} from './plan-adoption.mjs';
// Offline policy review only. No result from this module authorizes procurement.
export const FULFILLMENT_PATHS = Object.freeze({BUY_AND_BILL:'buy-and-bill',SPECIALTY_PHARMACY:'specialty-pharmacy',BOTH:'both-permitted',RESTRICTED:'restricted',UNKNOWN:'unknown'});
const paths=new Set(Object.values(FULFILLMENT_PATHS));
const keys=ADOPTION_SCOPE_KEYS;
const today=policyDay;
const text=v=>typeof v==='string'&&v.trim().length>0;
export {validPolicyDate} from './plan-adoption.mjs';
const blocked=reason=>({path:FULFILLMENT_PATHS.UNKNOWN,verified:false,orderingAllowed:false,sourceUrl:null,blockers:[reason]});
export function resolveFulfillment(input={}){
 const {payer,planId,productId,benefit,serviceDate,line,setting,state,policies=[],adoptions=[],asOf=today()}=input||{};
 if(![payer,planId,productId,line,setting,state].every(text)||!['Medical','Pharmacy'].includes(benefit)||!validPolicyDate(serviceDate)||!validPolicyDate(asOf))
  return blocked('Exact payer, plan, product, Medical/Pharmacy benefit, coverage line, setting, state and valid service date are required');
 if(!Array.isArray(policies))return blocked('Malformed fulfillment policy registry');
 const scope={payer,planId,productId,benefit,line,setting,state,serviceDate};
 const scoped=policies.filter(p=>p&&keys.every(k=>p[k]===scope[k]));
 // Invalid dates in a scoped record cannot silently disappear and hide a conflict.
 if(scoped.some(p=>!validPolicyDate(p.effectiveFrom)||!validPolicyDate(p.effectiveTo)||p.effectiveFrom>p.effectiveTo))
  return blocked('Exact-scope policy has missing, malformed or inverted effective dates');
 const active=scoped.filter(p=>p.effectiveFrom<=serviceDate&&serviceDate<=p.effectiveTo);
 if(active.length!==1)return blocked('Exact plan/product/benefit fulfillment policy not uniquely verified for service date');
 const p=active[0];
 if(p.verified!==true||p.planPrecision!=='exact-product'||!text(p.id)||!text(p.version)||!text(p.reviewedBy)||!validPublicSource(p.sourceUrl)||!validSourceDigest(p.sourceSha256)||!paths.has(p.path)||
   !validPolicyDate(p.reviewedAt)||!validPolicyDate(p.reviewDue)||p.reviewedAt>asOf||p.reviewDue<asOf||p.reviewDue<serviceDate||p.reviewDue<p.reviewedAt||
   (Date.parse(p.reviewDue)-Date.parse(p.reviewedAt))/86400000>90)
  return blocked('Policy provenance or current review is incomplete; authoritative policy review required');
 if(benefit==='Pharmacy'&&['buy-and-bill','both-permitted'].includes(p.path))return blocked('Buy-and-bill requires verified medical-benefit drug reimbursement, not pharmacy-benefit coverage');
 const adoption=assessPlanAdoption(scope,p,adoptions,asOf);
 if(!adoption.verified)return blocked(adoption.blockers[0]);
 const blockers=['Synthetic trial: patient-specific eligibility, authorization, supplier and reimbursement must be verified in an approved clinical workflow before ordering'];
 if(['unknown','restricted'].includes(p.path))blockers.push('Supply route is unknown or restricted; do not purchase or ship medication');
 return {path:p.path,verified:true,orderingAllowed:false,sourceUrl:p.sourceUrl,policyId:p.id,version:p.version,
  reviewedAt:p.reviewedAt,reviewDue:p.reviewDue,preferredProduct:p.preferredProduct||null,
  specialtyPharmacy:p.specialtyPharmacy||null,authorizationDestination:p.authorizationDestination||null,
  whiteBagging:p.whiteBagging??null,brownBagging:p.brownBagging??null,
  medicalBenefitBilling:p.medicalBenefitBilling??null,pharmacyBenefitBilling:p.pharmacyBenefitBilling??null,blockers};
}
export function assessProcurement(input={},evidence={}){
 input=input||{};evidence=evidence||{};
 const policy=resolveFulfillment(input);
 const blockers=[...policy.blockers];
 const pathsAllowed=policy.path==='both-permitted'?['buy-and-bill','specialty-pharmacy']:[policy.path];
 const route=evidence.route;
 if(!['buy-and-bill','specialty-pharmacy'].includes(route)||!pathsAllowed.includes(route))blockers.push('Choose a route explicitly permitted by the exact policy');
 const scoped=e=>e&&e.verified===true&&keys.every(k=>e[k]===input[k])&&e.serviceDate===input.serviceDate&&
  e.policyId===policy.policyId&&e.policyVersion===policy.version&&text(e.reference)&&validPolicyDate(e.verifiedAt)&&
  e.verifiedAt<=(input.asOf||today())&&validPolicyDate(e.validThrough)&&e.validThrough>=input.serviceDate&&e.validThrough>=e.verifiedAt;
 if(!scoped(evidence.eligibility)||evidence.eligibility?.status!=='active')blockers.push('Active eligibility evidence for this exact scope is required');
 if(!scoped(evidence.authorization)||!['approved','not-required'].includes(evidence.authorization?.status))blockers.push('Approved authorization or documented no-authorization-required determination is required');
 const supplier=evidence.supplier;
 if(!scoped(supplier)||supplier.route!==route||!text(supplier.name)||supplier.networkConfirmed!==true||supplier.siteConfirmed!==true)
  blockers.push('Verified supplier, network and administration site for the selected route are required');
 if(route==='specialty-pharmacy'){
  if(!text(policy.specialtyPharmacy)||supplier?.name!==policy.specialtyPharmacy)blockers.push('Exact designated specialty pharmacy must be confirmed');
  if(evidence.shipping!=='white-bagging'||policy.whiteBagging!==true||supplier?.chainOfCustodyConfirmed!==true)
   blockers.push('Verified patient-specific pharmacy delivery, allowed white-bagging and chain of custody are required; brown-bagging is not supported');
 }
 if(route==='buy-and-bill'&&(!scoped(evidence.reimbursement)||evidence.reimbursement?.drugPaymentConfirmed!==true))
  blockers.push('Provider acquisition and drug reimbursement evidence are required for buy-and-bill');
 if(evidence.productDoseUnitsConfirmed!==true||evidence.noDuplicateDrugClaim!==true||evidence.costSharingConfirmed!==true)
  blockers.push('Confirm dose/billing units, cost sharing and absence of duplicate drug claims');
 return {...policy,blockers,orderingAllowed:false,syntheticOnly:true};
}
export function fulfillmentChecklist(result){
 const checks=['Verify exact member plan and active coverage','Verify medical versus pharmacy benefit','Confirm drug brand, dose, HCPCS billing units and administration code','Confirm prior authorization and supplier/network requirements','Confirm allowed pharmacy, shipment and storage chain-of-custody','Confirm provider drug reimbursement versus administration-only billing','Confirm patient cost-sharing and no duplicate drug claim'];
 if(!result?.verified)checks.unshift('STOP: obtain current plan-specific policy before purchasing or shipping drug');
 if(result?.path==='specialty-pharmacy')checks.push('Confirm designated specialty pharmacy delivery to authorized site; no provider drug acquisition claim');
 if(result?.path==='buy-and-bill')checks.push('Confirm PBJ acquisition and payer drug reimbursement before ordering inventory');
 if(result?.path==='both-permitted')checks.push('Select and verify one supply route; do not bill drug acquisition twice');
 return checks;
}
