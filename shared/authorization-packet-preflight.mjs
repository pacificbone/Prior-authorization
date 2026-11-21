import {assessPayerAuthorization} from './payer-authorization-preflight.mjs';
import {findAuthTemplate,assessAuthTemplate,renderAuthTemplateNote} from './authorization-template-catalog.mjs';
// Offline-only combined review. No patient PHI, submission or order authorization.
export function prepareAuthorizationPacket(input={}){
 const {templateId,clinicalValues={},metadata={},policyRequest={}}=input;
 const template=findAuthTemplate(templateId);
 if(!template)return {status:'blocked',ready:false,blockers:['Select a recognized medication or procedure template'],note:null};
 const clinical=assessAuthTemplate(templateId,clinicalValues);
 const payer=assessPayerAuthorization(policyRequest);
 const blockers=[];
 if(clinical.status!=='clinical-fields-complete')blockers.push('Complete clinician-authored clinical documentation fields');
 if(payer.status!=='criteria-documented')blockers.push('Map actual record evidence to all verified exact-plan payer criteria');
 blockers.push('Verify eligibility, provider/facility network, authorization destination and current patient-specific benefits in approved systems');
 const note=renderAuthTemplateNote(templateId,clinicalValues,metadata);
 return {status:clinical.status==='clinical-fields-complete'&&payer.status==='criteria-documented'?'review-required':'incomplete',
  ready:false,syntheticOnly:true,templateId,service:template.name,clinical,payer,blockers,note};
}
export function renderAuthorizationPreflightSummary(result){
 if(!result||!result.payer)return 'Authorization preflight unavailable';
 const p=result.payer;
 return ['SYNTHETIC TRIAL — NOT FOR PATIENT SUBMISSION',
 'Authorization documentation review: '+result.service,
 'Clinical fields: '+result.clinical.status,
 'Payer criteria: '+p.status,
 'Policy: '+(p.policy?.id||'UNVERIFIED')+' / '+(p.policy?.version||'UNVERIFIED'),
 'Verified policy source: '+(p.policy?.sourceUrl||'NONE'),
 'Outstanding payer evidence: '+(p.missing||[]).map(x=>typeof x==='string'?x:x.label).join('; '),
 'Submission cleared: NO',
 'Required follow-up: '+result.blockers.join('; ')].join('\n');
}
