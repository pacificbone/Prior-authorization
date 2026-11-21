// This reports engineering release gaps; it is not a HIPAA compliance assessment.
const controls=Object.freeze([
 ['identity','Managed unique staff sign-in and MFA','Production identity policy and account lifecycle are not verified.'],
 ['authorization','Roles and practice isolation','No patient case authorization or tenant isolation service exists.'],
 ['storage','Protected persistence and recovery','Browser memory/encrypted local exports are not a production clinical record store.'],
 ['audit','Durable protected audit trail','Browser action history is not durable or tamper-resistant auditing.'],
 ['vendors','Vendor agreements and service scope','Executed BAAs and covered services have not been verified.'],
 ['risk','Risk analysis and security validation','Independent review, device controls and operational risks remain open.'],
 ['operations','Incident response, retention and staff procedures','Practice-specific procedures and restore tests remain unverified.'],
 ['clinical','Clinical and payer validation','Exact-plan policy adoption, evidence and clinician release remain required.']
].map(([id,label,reason])=>Object.freeze({id,label,reason,status:'blocked'})));
export function releaseBoundary(){return {mode:'synthetic-only',patientDataEnabled:false,productionReleaseAllowed:false,orderingAllowed:false,controls:controls.map(c=>({...c}))};}
export function assertSyntheticBuild(env={}){
 const inactive=v=>v===undefined||v===null||v===false||v===0||typeof v==='string'&&['','false','0','off'].includes(v.toLowerCase().trim());
 if(!inactive(env.PATIENT_DATA_ENABLED)||!inactive(env.PHI_ENABLED)||!inactive(env.PRODUCTION_RELEASE_ALLOWED)||
  env.DEPLOYMENT_MODE&&!['development','test','synthetic-trial'].includes(env.DEPLOYMENT_MODE))throw Error('Production/PHI build blocked: this release supports synthetic data only.');
 return true;
}
