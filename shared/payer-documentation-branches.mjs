// Public-reference documentation branches; NOT verified exact-plan adoption or PA approval.
// Use only with the matching payer evidence record and clinician-reviewed source.
export const PAYER_DOCUMENTATION_BRANCHES=Object.freeze([
 {id:'hmsa-gel-initial',evidenceId:'hmsa-gel-clinical-2026',requestType:'Initial',title:'HMSA Commercial/QUEST hyaluronate — initial',
  fields:[['diagnosis','OA diagnosis, knee and laterality'],['symptoms','Pain, function and objective findings'],['nonDrug','Non-drug therapy, dates, response or exceptions'],['medications','Medication therapy, dates, response, contraindications or intolerance'],['conservativeDuration','Document applicable conservative treatment duration and exceptions'],['imaging','Imaging findings and date'],['product','Brand, formulation, dose, course and prior injections']],
  notes:'Source summary references six months of conservative treatment; verify the full current policy and applicable exceptions. Not applicable to Medicare Advantage.'},
 {id:'hmsa-gel-renewal',evidenceId:'hmsa-gel-clinical-2026',requestType:'Repeat / continuation',title:'HMSA Commercial/QUEST hyaluronate — renewal',
  fields:[['priorApproval','Previous HMSA/CVS approval and course history'],['lastInjection','Date of final injection in prior course'],['priorResponse','Pain and functional benefit after previous course'],['interval','Document six-month interval or applicable exception'],['currentSymptoms','Current symptoms and functional impairment'],['product','Brand, dose and planned course']],
  notes:'Six-month interval is measured from the last injection of the completed course; verify renewal and exception branches.'},
 {id:'hmsa-gel-exception',evidenceId:'hmsa-gel-preference-2026',requestType:'Reconsideration / appeal',title:'HMSA Commercial/QUEST nonpreferred hyaluronate exception',
  fields:[['requestedProduct','Exact nonpreferred brand and requested course'],['preferredHistory','Euflexxa, Synvisc and Synvisc One treatment history, when applicable'],['exceptionBranch','Document ongoing course or intolerable adverse event exception'],['support','Dated supporting chart records']],
  notes:'Preference exceptions are alternatives, not a requirement to fail every preferred product.'},
 {id:'hmsa-prolia-initial',evidenceId:'hmsa-prolia-cq-2026',requestType:'Initial',title:'HMSA Commercial/QUEST Prolia and biosimilars — initial',
  fields:[['indication','Indication-specific coverage branch'],['fractureRisk','DXA, fracture history and relevant risk evidence'],['priorTherapy','Prior therapies, response or contraindication'],['preferred','Jubbonti preference or supported exception for requested brand'],['safety','Calcium, renal and mineral risk review as clinically indicated'],['dose','Drug, dose, schedule and benefit channel']],
  notes:'Different indications have different branches. Do not impose all branches as simultaneous prerequisites.'},
 {id:'hmsa-prolia-continuation',evidenceId:'hmsa-prolia-cq-2026',requestType:'Repeat / continuation',title:'HMSA Commercial/QUEST Prolia and biosimilars — continuation',
  fields:[['priorApproval','Previous authorization and actual product'],['lastDose','Last administration date and planned next dose'],['response','Documented response and ongoing indication'],['continuity','Interruption/transition plan and monitoring'],['preferred','Current product preference and any supported exception']],
  notes:'Verify the exact continuation branch in the current policy before treating any item as a requirement.'},
 {id:'hmsa-evenity-initial',evidenceId:'hmsa-evenity-cq-2025',requestType:'Initial',title:'HMSA Commercial/QUEST Evenity — initial',
  fields:[['indication','Specific initial-treatment branch and fracture risk'],['dxa','DXA results, date and relevant fracture history'],['priorTherapy','Relevant prior treatment history'],['cardiovascular','Cardiovascular history and safety review'],['doses','Prior romosozumab exposure and planned monthly course'],['followOn','Planned sequential osteoporosis treatment']],
  notes:'Published DXA branch has an ambiguous comparator; obtain clarification, do not invent one.'},
 {id:'hmsa-evenity-continuation',evidenceId:'hmsa-evenity-cq-2025',requestType:'Repeat / continuation',title:'HMSA Commercial/QUEST Evenity — continuation',
  fields:[['dosesGiven','Number and dates of prior monthly doses'],['remaining','Planned remaining doses within the policy course limit'],['response','Ongoing indication and response'],['safety','Interval safety assessment'],['followOn','Planned follow-on therapy']],
  notes:'Public summary identifies fewer than 12 monthly doses for continuation; verify current policy and any exceptions.'},
 {id:'hmsa-tka',evidenceId:'hmsa-evolent-knee-2025',requestType:'Initial',title:'HMSA-linked Evolent knee arthroplasty — TKA',
  fields:[['branch','Identify the applicable primary TKA clinical branch'],['diagnosis','Diagnosis and laterality'],['imaging','Dated imaging supporting selected branch'],['symptoms','Pain and functional limitation'],['exam','Pertinent exam findings'],['treatments','Dated nonoperative treatment or documented exception'],['priorProcedures','Relevant injection/arthroscopy timing'],['contraindications','Review guideline contraindications'],['site','Surgeon versus facility authorization, site and bilateral requests']],
  notes:'July 2025 guideline adoption/supersession for 2026 requires confirmation. Do not treat these as verified current plan criteria.'}
].map(x=>Object.freeze({...x,fields:Object.freeze(x.fields.map(f=>Object.freeze({id:f[0],label:f[1]})))})));
export function documentationBranchesFor(evidenceIds=[],requestType='Initial'){
 return PAYER_DOCUMENTATION_BRANCHES.filter(b=>evidenceIds.includes(b.evidenceId)&&b.requestType===requestType);
}
