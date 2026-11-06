import {defaultScope} from './catalog.mjs';
// Entirely fictional. No patient identifiers or real clinical records.
export const samples = {
  'osteoporosis-evenity': {
    id:'osteoporosis-evenity',policyId:'uhc-evenity-2026-11',carrier:'',pathwayId:'', label:'Synthetic osteoporosis example', drugId:'evenity',
    payer:'UnitedHealthcare', line:'Commercial', benefit:'Medical', plan:'Synthetic commercial plan', planCode:'DEMO',
    requestType:'initial', rationale:'',
    note:'SYNTHETIC TRAINING CASE — not a real patient.\n\nDiagnosis: postmenopausal osteoporosis. DXA dated 2026-09-10 shows a femoral neck T-score of -3.2. History includes a low-trauma vertebral compression fracture in 2025.\n\nAlendronate was stopped after documented esophagitis. The clinician considers the fracture history and low bone density to represent high fracture risk.\n\nRequested treatment: Evenity 210 mg subcutaneously monthly, with a requested authorization period of 12 months. The clinician has checked this regimen against current FDA labeling.\n\nRecent myocardial infarction/stroke history, calcium status, vitamin D status and treatment sequencing require separate clinician confirmation before prescribing. This example is not a prescribing recommendation.',
    evidence: {
      diagnosis:{status:'documented', quote:'Diagnosis: postmenopausal osteoporosis.'},
      risk:{status:'documented', quote:'History includes a low-trauma vertebral compression fracture in 2025.'},
      dose:{status:'documented', quote:'The clinician has checked this regimen against current FDA labeling.'},
      duration:{status:'documented', quote:'Requested treatment: Evenity 210 mg subcutaneously monthly, with a requested authorization period of 12 months.'}
    }
  }
};
samples['hmsa-osteoporosis-evenity']={...structuredClone(samples['osteoporosis-evenity']),id:'hmsa-osteoporosis-evenity',policyId:'hmsa-evenity-cq-2025-12',payer:'HMSA',plan:'Synthetic HMSA commercial plan',pathwayId:'t-score-fracture-bisphosphonate',evidence:{
  diagnosis:{status:'documented',quote:'Diagnosis: postmenopausal osteoporosis.'},
  dose:{status:'documented',quote:'The clinician has checked this regimen against current FDA labeling.'},
  duration:{status:'documented',quote:'Requested treatment: Evenity 210 mg subcutaneously monthly, with a requested authorization period of 12 months.'},
  dexa:{status:'documented',quote:'DXA dated 2026-09-10 shows a femoral neck T-score of -3.2.'},
  fracture:{status:'documented',quote:'History includes a low-trauma vertebral compression fracture in 2025.'},
  bisphosphonate:{status:'documented',quote:'Alendronate was stopped after documented esophagitis.'}
}};
export const blankCase = () => ({...defaultScope,id:'custom',pathwayId:'',label:'New synthetic case',drugId:'evenity',requestType:'initial',note:'',rationale:'',evidence:{}});
