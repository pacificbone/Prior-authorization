import {drugs, policies as seeds, payers, lines,carrierChoices,coverageProfiles} from './catalog.mjs';
export const MAX_NOTE = 24000;
export const dateToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Honolulu',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
}
export function policyFreshness(policy, today=dateToday()) {
  if(!validDate(policy.reviewed)||policy.reviewed>today) return 'invalid';
  if(policy.kind==='authorization-list'&&policy.effective===null) return 'undated';
  if(!validDate(policy.effective)) return 'invalid';
  if(policy.effective>today) return 'future';
  if(policy.expires && policy.expires<today) return 'expired';
  if(policy.reviewed>today) return 'invalid';
  return (Date.parse(today)-Date.parse(policy.reviewed))/86400000>90 ? 'stale' : 'current';
}
export function matchingPolicies(scope, drugId, custom=[], today=dateToday()) {
  return [...seeds,...custom].filter(p=>p.payer===scope.payer && p.lines.includes(scope.line) && p.benefit===scope.benefit && p.drugIds.includes(drugId) && (!p.carrier||p.carrier===scope.carrier) && (!coverageProfiles[p.payer]?.requiresCarrier||!!scope.carrier) && !['invalid','future','expired'].includes(policyFreshness(p,today)) && ((p.kind!=='formulary'&&p.payer!=='HMA') || (scope.planCode && p.planCode===scope.planCode)));
}
export function applyPolicyPathway(policy,pathwayId,drugId) {
  if(!policy)return null;
  const base=policy._base||policy;
  const selected=base.pathways?.find(p=>p.id===pathwayId);
  const conditional=(base.conditionalCriteria||[]).filter(g=>g.drugIds.includes(drugId)).flatMap(g=>g.criteria);
  return {...base,_base:base,criteria:[...base.criteria,...(selected?.criteria||[]),...conditional],selectedPathway:selected||null,pathwayMissing:!!base.pathways?.length&&!selected};
}
export function resolvePolicy(scope,drugId,custom=[],today=dateToday()) {
  const matches=matchingPolicies(scope,drugId,custom,today);
  // Never silently choose between conflicting versions or separately imported criteria.
  const medical=matches.filter(p=>p.kind==='medical-policy');
  if(medical.length>1) return {policy:null,conflict:true,matches};
  return {policy:medical[0]||null,conflict:false,matches};
}
export function formularyResult(scope,drugId,custom=[],today=dateToday()) {
  const matches=matchingPolicies(scope,drugId,custom,today).filter(p=>p.kind==='formulary');
  if(matches.length!==1) return {status:'unknown',reason:matches.length>1?'Conflicting sources require review.':'No exact-plan formulary entry verified.',entry:null};
  const entry=matches[0];
  if(policyFreshness(entry,today)!=='current') return {status:'unknown',reason:'Source review is overdue.',entry};
  return {status:entry.formularyStatus,reason:'Exact plan entry; member eligibility and benefits remain unverified.',entry};
}
export function checkEvidence(policy, note, evidence={}) {
  return (policy?.criteria||[]).map(c=>{
    const item=evidence[c.id]||{};
    const valid=item.status==='documented' && typeof item.quote==='string' && item.quote.trim().length>=8 && note.includes(item.quote.trim());
    return {...c,status:valid?'documented':(item.status==='not_met'?'not_met':'missing'),quote:valid?item.quote.trim():'',issue:item.status==='documented'&&!valid?'Evidence must be an exact passage from the current note.':''};
  });
}
export function readiness(caseData,policy,custom=[],today=dateToday()) {
  const resolved=resolvePolicy(caseData,caseData.drugId,custom,today);
  const effective=applyPolicyPathway(policy,caseData.pathwayId,caseData.drugId);
  const checks=checkEvidence(effective,caseData.note,caseData.evidence);
  const issues=[];
  if(!caseData.note?.trim()) issues.push('Add the source clinical note.');
  if(!caseData.plan?.trim()) issues.push('Identify the exact plan.');
  if(coverageProfiles[caseData.payer]?.requiresCarrier&&!caseData.carrier)issues.push('Identify the underlying carrier or employer plan.');
  if(!policy || resolved.conflict || resolved.policy?.id!==policy.id) issues.push('No unambiguous applicable medical policy is selected.');
  if(policy && policyFreshness(policy,today)!=='current') issues.push('Recheck the policy source before release.');
  if(effective?.pathwayMissing)issues.push('Select the documented qualifying policy pathway.');
  if(effective?.selectedPathway?.requiresClarification)issues.push('The selected source pathway needs clarification before release.');
  if(caseData.requestType!=='initial') issues.push('This trial contains initial-therapy criteria only; import the applicable appeal/continuation workflow before release.');
  if(!checks.length) issues.push('No structured policy criteria available.');
  for(const c of checks) if(c.status!=='documented') issues.push(`${c.label}: ${c.status==='not_met'?'not met':'documentation missing'}.`);
  return {checks,issues,ready:issues.length===0};
}
export function buildLetter(caseData,policy,{custom=[],today=dateToday(),reviewed=false}={}) {
  const drug=drugs.find(d=>d.id===caseData.drugId);
  const result=readiness(caseData,policy,custom,today);
  const released=reviewed&&result.ready;
  const rows=result.checks.filter(c=>c.status==='documented').map(c=>`• ${c.label}\n  Clinical note evidence: “${c.quote}”`).join('\n\n');
  return `${released?'CLINICIAN-REVIEWED DRAFT — SIGNATURE REQUIRED':'DRAFT — INCOMPLETE / CLINICIAN REVIEW REQUIRED'}\nSYNTHETIC TRIAL — NOT FOR PATIENT SUBMISSION\n\nPacific Bone & Joint\nAuthorization support attachment\nDate: ${today}\nCase reference: ${caseData.label||'[case reference]'}\nPayer / administrator: ${caseData.payer}${caseData.carrier?' / '+caseData.carrier:''} · ${caseData.line}\nPlan: ${caseData.plan||'[exact plan not documented]'}\nBenefit: ${caseData.benefit}\nRequest: ${caseData.requestType==='appeal'?'Appeal support':'Initial authorization'} for ${drug?.name||'[medication]'}\n\nTo the Utilization Management Reviewer:\n\nPlease review the request for ${drug?.name||'the requested medication'} using the attached clinical documentation and the applicable member benefit terms. The following evidence is presented from the source note for clinician review.\n\n${policy?`Policy reference: ${policy.title}, ${policy.policyNumber||policy.id}. Effective ${policy.effective}; source checked ${policy.reviewed}. ${policy.locator||''}\n${policy.url}${applyPolicyPathway(policy,caseData.pathwayId,caseData.drugId)?.selectedPathway?'\nSelected qualifying pathway: '+applyPolicyPathway(policy,caseData.pathwayId,caseData.drugId).selectedPathway.label:''}`:'Policy reference: [applicable policy not verified]'}\n\nDOCUMENTED SUPPORT\n${rows||'[No criterion-specific support has been verified.]'}\n\nSOURCE CLINICAL NOTE\n${caseData.note||'[Clinical documentation required.]'}${caseData.rationale?.trim()?`\n\nADDITIONAL CLINICIAN RATIONALE\n${caseData.rationale.trim()}`:''}\n\n${result.issues.length?`ITEMS REQUIRING RESOLUTION BEFORE SUBMISSION\n${result.issues.map(x=>'• '+x).join('\n')}\n\n`:''}This attachment does not establish member coverage, clinical appropriateness, authorization approval or payment. Member benefits, current policy applicability, prescribing safety and the accuracy of all facts require clinician and staff verification.\n\nReviewing clinician: ____________________\nSignature / date: ____________________\n\nSuggested attachments: source visit note, DXA report, fracture records, prior treatment documentation, relevant laboratory results and the applicable policy. Include only available records relevant to the request.\n`;
}
export function validateAiEvidence(output,policy,note) {
  if(!output || !Array.isArray(output.evidence) || output.evidence.length>policy.criteria.length) throw new Error('AI response did not match the evidence schema.');
  const evidence={};
  for(const row of output.evidence) {
    if(!row || !policy.criteria.some(c=>c.id===row.criterionId) || evidence[row.criterionId]) throw new Error('AI returned an unknown or duplicate criterion.');
    if(!['documented','missing'].includes(row.status) || typeof row.quote!=='string') throw new Error('AI returned an invalid evidence status.');
    if(row.status==='documented' && (row.quote.trim().length<8 || !note.includes(row.quote))) throw new Error('AI evidence was not found verbatim in the source note.');
    if(row.status==='missing'&&row.quote!=='') throw new Error('Missing evidence cannot contain a quote.');
    evidence[row.criterionId]={status:row.status,quote:row.quote};
  }
  return evidence;
}
export function validatePolicy(value,today=dateToday()) {
  if(!value || typeof value!=='object'||Array.isArray(value)) throw new Error('Expected one policy object.');
  const required=['id','title','payer','benefit','kind','reviewed','url','locator','summary'];
  for(const key of required) if(typeof value[key]!=='string'||!value[key].trim()||value[key].length>3000) throw new Error(`Missing or invalid ${key}.`);
  if(!/^custom-[a-z0-9-]{1,70}$/.test(value.id)) throw new Error('Policy ID must begin custom- and use lowercase letters, numbers and hyphens.');
  if(!payers.includes(value.payer)||!['Medical','Pharmacy'].includes(value.benefit)||!['medical-policy','formulary','authorization-list'].includes(value.kind)) throw new Error('Invalid payer, benefit or source type.');
  if(coverageProfiles[value.payer]?.requiresCarrier&&(!value.carrier||!carrierChoices.includes(value.carrier)))throw new Error('This administrator requires an underlying carrier / employer plan.');
  if(!Array.isArray(value.lines)||!value.lines.length||value.lines.some(l=>!lines.includes(l))) throw new Error('Choose valid lines of business.');
  if(!Array.isArray(value.drugIds)||!value.drugIds.length||value.drugIds.some(id=>!drugs.some(d=>d.id===id))) throw new Error('Choose medications in the catalog.');
  const url=new URL(value.url);
  if(url.protocol!=='https:'||url.username||url.password||url.hash) throw new Error('Source URL must be HTTPS without credentials or fragment.');
  if((!validDate(value.effective)&&!(value.kind==='authorization-list'&&value.effective===null))||!validDate(value.reviewed)||value.reviewed>today||value.reviewed<value.effective && value.effective<=today) throw new Error('Check effective and reviewed dates.');
  if(value.expires && (!validDate(value.expires)||value.expires<value.effective)) throw new Error('Invalid expiration date.');
  if(!Array.isArray(value.criteria)||value.criteria.length>30) throw new Error('Criteria must be an array of at most 30 items.');
  const ids=new Set();
  for(const c of value.criteria) {
    if(!c||typeof c.id!=='string'||!/^[a-z0-9-]{1,60}$/.test(c.id)||ids.has(c.id)||typeof c.label!=='string'||!c.label.trim()||c.label.length>500||typeof c.help!=='string'||c.help.length>1000) throw new Error('Invalid or duplicate criterion.');
    ids.add(c.id);
  }
  if(!['unknown','preferred','covered','nonpreferred','excluded'].includes(value.formularyStatus)) throw new Error('Invalid formulary status.');
  if(value.kind!=='formulary'&&value.formularyStatus!=='unknown') throw new Error('Medical criteria / PA lists cannot establish formulary status.');
  if((value.kind==='formulary'||value.payer==='HMA') && (typeof value.planCode!=='string'||!value.planCode.trim()||value.planCode.length>100)) throw new Error('Formulary entries and HMA employer-plan rules require an exact plan/list code.');
  for(const field of ['policyNumber','limitations','tier','carrier'])if(value[field]!==undefined&&(typeof value[field]!=='string'||value[field].length>3000))throw new Error(`Invalid ${field}.`);
  if(value.pathways!==undefined){
    if(!Array.isArray(value.pathways)||!value.pathways.length||value.pathways.length>20)throw new Error('Invalid policy pathways.');
    const pathIds=new Set();
    for(const branch of value.pathways){
      if(!branch||typeof branch.id!=='string'||!/^[a-z0-9-]{1,60}$/.test(branch.id)||pathIds.has(branch.id)||typeof branch.label!=='string'||branch.label.length>500||!Array.isArray(branch.criteria)||!branch.criteria.length||branch.criteria.length>20)throw new Error('Invalid policy pathway.');
      pathIds.add(branch.id);const branchIds=new Set(ids);
      for(const row of branch.criteria){if(!row||typeof row.id!=='string'||!/^[a-z0-9-]{1,60}$/.test(row.id)||branchIds.has(row.id)||typeof row.label!=='string'||!row.label.trim()||row.label.length>500||typeof row.help!=='string'||row.help.length>1000)throw new Error('Invalid pathway criterion.');branchIds.add(row.id);}
    }
  }
  if(value.conditionalCriteria!==undefined)throw new Error('Custom drug-conditional criteria are not supported by this importer yet. Use a drug-specific policy record.');
  // Whitelist fields; arbitrary imported data is never sent to an AI provider.
  return Object.fromEntries(['id','title','payer','carrier','lines','benefit','kind','drugIds','policyNumber','effective','reviewed','expires','url','locator','summary','limitations','formularyStatus','planCode','tier','criteria','pathways'].filter(k=>value[k]!==undefined).map(k=>[k,value[k]]));
}
export function validateWorkspace(value) {
  if(!value||value.version!==1||!value.case||!Array.isArray(value.custom)||value.custom.length>100) throw new Error('Unsupported workspace.');
  const c=value.case;
  if(!drugs.some(d=>d.id===c.drugId)||!payers.includes(c.payer)||!lines.includes(c.line)||!['Medical','Pharmacy'].includes(c.benefit)||!['initial','appeal'].includes(c.requestType)) throw new Error('Invalid saved case.');
  for(const key of ['note','rationale','label','plan','planCode']) if(typeof c[key]!=='string'||c[key].length>MAX_NOTE) throw new Error('Invalid saved case fields.');
  if(c.carrier!==undefined&&!carrierChoices.includes(c.carrier))throw new Error('Invalid saved carrier.');
  if(c.pathwayId!==undefined&&(typeof c.pathwayId!=='string'||c.pathwayId.length>100))throw new Error('Invalid saved pathway.');
  if(!c.evidence||typeof c.evidence!=='object'||Array.isArray(c.evidence)||Object.keys(c.evidence).length>30) throw new Error('Invalid saved evidence.');
  for(const item of Object.values(c.evidence)) if(!item||typeof item.quote!=='string'||item.quote.length>MAX_NOTE||!['documented','missing','not_met'].includes(item.status)) throw new Error('Invalid saved evidence item.');
  return {version:1,case:{carrier:'',pathwayId:'',...c},custom:value.custom.map(p=>validatePolicy(p))};
}
