// Fulfillment policies must be verified for the exact payer, product, benefit and date.
// No synthetic preference is treated as a real plan requirement.
export const FULFILLMENT_PATHS = Object.freeze({
  BUY_AND_BILL:'buy-and-bill',
  SPECIALTY_PHARMACY:'specialty-pharmacy',
  BOTH:'both-permitted',
  RESTRICTED:'restricted',
  UNKNOWN:'unknown'
});
const validPaths=new Set(Object.values(FULFILLMENT_PATHS));
export function resolveFulfillment({payer,planId,productId,benefit,serviceDate,policies=[]}={}){
 if(!payer || !planId || !productId || !benefit || !/^\\d{4}-\\d{2}-\\d{2}$/.test(String(serviceDate||'')) || !Number.isFinite(Date.parse(serviceDate+'T00:00:00Z'))) return {path:FULFILLMENT_PATHS.UNKNOWN,verified:false,blockers:['Exact payer, plan, product, benefit and valid service date are required'],orderingAllowed:false,sourceUrl:null};
 const exact=policies.filter(p=>p.payer===payer && p.planId===planId &&
   p.productId===productId && p.benefit===benefit &&
   (!p.effectiveFrom || p.effectiveFrom<=serviceDate) &&
   (!p.effectiveTo || p.effectiveTo>=serviceDate) &&
   p.verified===true && p.sourceUrl && validPaths.has(p.path));
 if(exact.length!==1) return {path:FULFILLMENT_PATHS.UNKNOWN,verified:false,
  blockers:['Exact plan/product/benefit fulfillment policy not uniquely verified'],
  orderingAllowed:false,sourceUrl:null};
 const p=exact[0];
 return {path:p.path,verified:true,sourceUrl:p.sourceUrl,reviewedAt:p.reviewedAt||null,
  preferredProduct:p.preferredProduct||null,specialtyPharmacy:p.specialtyPharmacy||null,
  authorizationDestination:p.authorizationDestination||null,
  whiteBagging:p.whiteBagging??null,brownBagging:p.brownBagging??null,
  medicalBenefitBilling:p.medicalBenefitBilling??null,
  pharmacyBenefitBilling:p.pharmacyBenefitBilling??null,
  orderingAllowed:false, // Requires a separate validated patient-specific authorization and procurement workflow.
  blockers:['Patient-specific eligibility, authorization and supplier details require verification before ordering']};
}
export function fulfillmentChecklist(result){
 const checks=['Verify exact member plan and active coverage','Verify medical versus pharmacy benefit',
  'Confirm drug brand, dose, HCPCS billing units and administration code',
  'Confirm prior authorization and supplier/network requirements',
  'Confirm allowed pharmacy, shipment and storage chain-of-custody',
  'Confirm provider drug reimbursement versus administration-only billing',
  'Confirm patient cost-sharing and no duplicate drug claim'];
 if(!result?.verified) checks.unshift('STOP: obtain current plan-specific policy before purchasing or shipping drug');
 if(result?.path===FULFILLMENT_PATHS.SPECIALTY_PHARMACY) checks.push('Confirm specialty pharmacy will deliver patient-specific medication to authorized site');
 if(result?.path===FULFILLMENT_PATHS.BUY_AND_BILL) checks.push('Confirm PBJ acquisition and payer drug reimbursement before ordering inventory');
 return checks;
}
