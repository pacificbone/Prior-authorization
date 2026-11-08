// Synthetic-only preflight for plan-specific authorization evidence.
// Never infer payer requirements from clinical checklist completion.
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const iso=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const blocked=(reason)=>({status:'blocked',payerCriteriaVerified:false,submissionReady:false,missing:[reason],satisfied:[],policy:null});
export function assessPayerAuthorization({payer,planId,line,serviceId,serviceDate,policies=[],evidence={},asOf='2026-11-08'}={}){
 if(![payer,planId,line,serviceId].every(nonempty)||!iso(serviceDate)||!iso(asOf))
  return blocked('Exact carrier, plan, coverage line, service and valid dates required');
 if(!Array.isArray(policies))return blocked('Policy registry is malformed');
 const scoped=policies.filter(p=>p&&p.payer===payer&&p.planId===planId&&p.line===line&&p.serviceId===serviceId);
 if(scoped.some(p=>!iso(p.effectiveFrom)||!iso(p.effectiveTo)||p.effectiveFrom>p.effectiveTo))
  return blocked('Invalid date range in matching policy records');
 const active=scoped.filter(p=>p.effectiveFrom<=serviceDate&&p.effectiveTo>=serviceDate);
 if(active.length!==1)return blocked('No unique effective policy for exact plan and service');
 const p=active[0];
 if(p.verified!==true||!nonempty(p.sourceUrl)||!/^https:\/\//.test(p.sourceUrl)||
   !nonempty(p.policyId)||!nonempty(p.version)||!nonempty(p.reviewedBy)||!iso(p.reviewedAt)||
   !iso(p.reviewDue)||p.reviewedAt>asOf||p.reviewDue<asOf||p.reviewDue<serviceDate||
   !Array.isArray(p.criteria)||!p.criteria.length||
   p.criteria.some(c=>!nonempty(c.id)||!nonempty(c.label))||
   new Set(p.criteria.map(c=>c.id)).size!==p.criteria.length)
  return blocked('Current authoritative policy provenance and criteria must be reviewed');
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
