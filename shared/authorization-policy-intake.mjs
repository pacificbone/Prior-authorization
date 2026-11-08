// Strict intake validation for a manually reviewed, exact-plan authorization policy.
// Do not populate this registry from general payer URLs or public clinical guidance alone.
import {validPolicyDate,validPublicSource,validSourceDigest,assessPlanAdoption,policyDay} from './plan-adoption.mjs';
const filled=v=>typeof v==='string'&&v.trim().length>0;
export function validateAuthorizationPolicyIntake({policy,adoption,asOf=policyDay()}={}){
 const errors=[];
 if(!policy||typeof policy!=='object')return {valid:false,errors:['Policy record required']};
 for(const key of ['id','policyId','payer','planId','line','serviceId','productId','benefit','setting','state','version','reviewedBy'])
  if(!filled(policy[key]))errors.push('Missing policy '+key);
 if(!validPublicSource(policy.sourceUrl))errors.push('Invalid authoritative policy URL');
 if(!validSourceDigest(policy.sourceSha256))errors.push('Policy PDF fingerprint required');
 for(const key of ['effectiveFrom','effectiveTo','reviewedAt','reviewDue'])
  if(!validPolicyDate(policy[key]))errors.push('Invalid policy date '+key);
 if(validPolicyDate(policy.effectiveFrom)&&validPolicyDate(policy.effectiveTo)&&policy.effectiveFrom>policy.effectiveTo)errors.push('Invalid effective interval');
 if(validPolicyDate(policy.reviewedAt)&&validPolicyDate(policy.reviewDue)&&policy.reviewDue<policy.reviewedAt)errors.push('Invalid review interval');
 if(!Array.isArray(policy.criteria)||!policy.criteria.length)errors.push('No policy criteria');
 else {
  const ids=new Set();
  for(const c of policy.criteria){
   if(!filled(c?.id)||!filled(c?.label)||!filled(c?.sourceSection))errors.push('Criterion requires id, label and exact source section');
   if(ids.has(c?.id))errors.push('Duplicate criterion');
   ids.add(c?.id);
  }
 }
 if(policy.verified!==true)errors.push('Clinical policy review not signed off');
 if(errors.length)return {valid:false,errors};
 const scope={payer:policy.payer,planId:policy.planId,productId:policy.productId,benefit:policy.benefit,
  line:policy.line,setting:policy.setting,state:policy.state,serviceDate:policy.effectiveFrom};
 const adoptionResult=assessPlanAdoption(scope,policy,adoption?[adoption]:[],asOf);
 if(!adoptionResult.verified)errors.push(...adoptionResult.blockers);
 return {valid:errors.length===0,errors,memberCoverageVerified:false,submissionReady:false,orderingAllowed:false};
}
