// Plan adoption is separate from public policy retrieval and member eligibility.
export const ADOPTION_SCOPE_KEYS=Object.freeze(['payer','planId','productId','benefit','line','setting','state']);
export const policyDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Honolulu',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validPolicyDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const ms=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value;
}
export function validPublicSource(value){
 if(typeof value!=='string')return false;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash;}catch{return false;}
}
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
export const validSourceDigest=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function assessPlanAdoption(scope,policy,adoptions=[],asOf=policyDay()){
 const fail=reason=>({verified:false,memberCoverageVerified:false,orderingAllowed:false,blockers:[reason]});
 if(!scope||!policy||!ADOPTION_SCOPE_KEYS.every(k=>nonempty(scope[k])&&policy[k]===scope[k])||!validPolicyDate(scope.serviceDate)||!validPolicyDate(asOf)||!Array.isArray(adoptions))return fail('Exact plan adoption context and dated evidence are required');
 const candidates=adoptions.filter(a=>a&&ADOPTION_SCOPE_KEYS.every(k=>a[k]===scope[k])&&a.policyId===policy.id);
 // Unverified/malformed overlapping records are conflicts, not a reason to pick a nicer record.
 if(candidates.some(a=>!validPolicyDate(a.effectiveFrom)||!validPolicyDate(a.effectiveTo)||a.effectiveFrom>a.effectiveTo))return fail('Plan adoption evidence has invalid effective dates');
 const active=candidates.filter(a=>a.effectiveFrom<=scope.serviceDate&&a.effectiveTo>=scope.serviceDate);
 if(active.length!==1)return fail('Unique exact-plan policy adoption evidence is missing or conflicting');
 const a=active[0];
 if(a.verified!==true||a.planPrecision!=='exact-product'||a.policyVersion!==policy.version||!validSourceDigest(a.policySha256)||a.policySha256!==policy.sourceSha256||
  !validSourceDigest(a.sourceSha256)||!validPublicSource(a.sourceUrl)||!nonempty(a.reference)||!nonempty(a.reviewedBy)||
  !validPolicyDate(a.reviewedAt)||!validPolicyDate(a.reviewDue)||a.reviewedAt>asOf||a.reviewDue<asOf||a.reviewDue<scope.serviceDate||a.reviewDue<a.reviewedAt||
  (Date.parse(a.reviewDue)-Date.parse(a.reviewedAt))/86400000>90)return fail('Plan adoption needs current, version- and document-bound source evidence');
 return {verified:true,memberCoverageVerified:false,orderingAllowed:false,reference:a.reference,blockers:['Policy adoption does not verify patient eligibility, authorization, network participation or reimbursement']};
}
