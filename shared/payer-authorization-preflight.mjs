import {policyDay,validPublicSource,validSourceDigest,assessPlanAdoption} from './plan-adoption.mjs';
// Synthetic-only preflight for plan-specific authorization evidence.
// Never infer payer requirements from clinical checklist completion.
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const iso=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const blocked=(reason)=>({status:'blocked',payerCriteriaVerified:false,submissionReady:false,missing:[reason],satisfied:[],policy:null});
export function assessPayerAuthorization({payer,planId,line,serviceId,serviceDate,policies=[],evidence={},asOf=policyDay(),adoptions=[]}={}){
 if(![payer,planId,line,serviceId].every(nonempty)||!iso(serviceDate)||!iso(asOf))
  return blocked('Exact carrier, plan, coverage line, service and valid dates required');
 if(!Array.isArray(policies))return blocked('Policy registry is malformed');
 const scoped=policies.filter(p=>p&&p.payer===payer&&p.planId===planId&&p.line===line&&p.serviceId===serviceId);
 if(scoped.some(p=>!iso(p.effectiveFrom)||!iso(p.effectiveTo)||p.effectiveFrom>p.effectiveTo))
  return blocked('Invalid date range in matching policy records');
 const active=scoped.filter(p=>p.effectiveFrom<=serviceDate&&p.effectiveTo>=serviceDate);
 if(active.length!==1)return blocked('No unique effective policy for exact plan and service');
 const p=active[0];
 if(p.verified!==true||!validPublicSource(p.sourceUrl)||
   !nonempty(p.policyId)||!nonempty(p.version)||!nonempty(p.reviewedBy)||!iso(p.reviewedAt)||
   !iso(p.reviewDue)||p.reviewedAt>asOf||p.reviewDue<asOf||p.reviewDue<serviceDate||
   !Array.isArray(p.criteria)||!p.criteria.length||
   p.criteria.some(c=>!nonempty(c.id)||!nonempty(c.label))||
   new Set(p.criteria.map(c=>c.id)).size!==p.criteria.length)
  return blocked('Current authoritative policy provenance and criteria must be reviewed');
 // Public references alone are never sufficient for real-payer criteria verification.
 if(payer!=='Synthetic'){
  if(!validSourceDigest(p.sourceSha256)||!nonempty(p.id)||!nonempty(p.productId)||
   !nonempty(p.benefit)||!nonempty(p.setting)||!nonempty(p.state)||
   !Array.isArray(adoptions))return blocked('Verified source digest and exact-plan adoption are required');
  const adoption=assessPlanAdoption({payer,planId,productId:p.productId,benefit:p.benefit,line,
   setting:p.setting,state:p.state,serviceDate},p,adoptions,asOf);
  if(!adoption.verified)return blocked('Exact-plan adoption unverified: '+adoption.blockers.join('; '));
 }
 const satisfied=[],missing=[];
 for(const c of p.criteria){
  const e=evidence[c.id];
  if(e&&e.reviewed===true&&nonempty(e.recordReference)&&nonempty(e.finding)&&e.applicable!==false)
   satisfied.push({id:c.id,label:c.label,recordReference:e.recordReference});
  else if(e&&e.reviewed===true&&e.applicable===false&&nonempty(e.exceptionRationale)&&c.exceptionAllowed===true)
   satisfied.push({id:c.id,label:c.label,exception:true});
  else missing.push({id:c.id,label:c.label});
 }
 return {status:missing.length?'documentation-incomplete':'criteria-documented',
  payerCriteriaVerified:true,submissionReady:false, // requires patient-specific eligibility and clinician review
  missing,satisfied,policy:{id:p.policyId,version:p.version,sourceUrl:p.sourceUrl,reviewedAt:p.reviewedAt}};
}
