// Offline clinical preparation guides. These are NOT payer determinations.
// Payer-specific rules must be separately verified against the exact member product.
export const OFFLINE_AUTH_GUIDES = Object.freeze({
  tka: {
    label: 'Total knee arthroplasty (TKA)', codes: ['27447'], kind: 'procedure',
    questions: [
      ['diagnosis','Diagnosis, laterality, and ICD-10-CM'],
      ['symptoms','Pain, functional limitations, and effect on daily activities'],
      ['imaging','Weight-bearing radiographs and radiographic findings (if available)'],
      ['treatment','Conservative treatment attempted, dates, duration, response, or contraindications'],
      ['exam','Physical examination and relevant deformity/ROM/instability'],
      ['plan','Surgeon recommendation, operative side, and proposed facility'],
      ['necessity','Why surgery is appropriate now and alternatives are insufficient']
    ],
    cautions: ['Do not impose a universal minimum duration of physical therapy or injections.', 'Check whether the selected plan requires prior authorization and site-of-service review.', 'Document clinical exceptions when conservative measures are unsafe or inappropriate.']
  },
  prolia: {
    label: 'Prolia (denosumab 60 mg)', codes: ['J0897'], kind: 'medication',
    questions: [
      ['diagnosis','Indication and ICD-10-CM (e.g., osteoporosis)'],
      ['risk','Fracture history, risk factors, and available bone-density results'],
      ['alternatives','Prior osteoporosis therapies, response, intolerance, or contraindications'],
      ['labs','Calcium and relevant mineral/renal evaluation; correction of hypocalcemia'],
      ['dose','Dose, route, schedule, and requested administration setting'],
      ['benefit','Confirm pharmacy versus medical benefit and applicable product'],
      ['safety','Document appropriate supplementation, dental considerations, and monitoring plan'],
      ['continuity','For ongoing therapy, last dose and plan to avoid unplanned interruption']
    ],
    cautions: ['Prolia has important hypocalcemia warnings, especially in advanced CKD; follow current labeling.', 'Coverage may depend on medical versus pharmacy benefit, diagnosis, and step therapy.', 'Do not equate an osteoporosis diagnosis with automatic authorization.']
  },
  evenity: {
    label: 'Evenity (romosozumab)', codes: ['J3111'], kind: 'medication',
    questions: [
      ['diagnosis','Osteoporosis diagnosis and fracture risk'],
      ['evidence','DXA results and fragility fracture history'],
      ['alternatives','Prior therapy and reason for requested agent'],
      ['cardiovascular','Cardiovascular history and current label precautions'],
      ['labs','Calcium assessment and supplementation plan'],
      ['duration','Proposed monthly course and follow-on antiresorptive plan'],
      ['benefit','Medical/pharmacy benefit and administration setting']
    ],
    cautions: ['Current label includes a boxed cardiovascular warning.', 'Verify plan-specific restrictions and duration limits.']
  },
  viscosupplementation: {
    label: 'Knee hyaluronic-acid injection', codes: ['20610','20611'], kind: 'medication/procedure',
    questions: [
      ['diagnosis','Symptomatic knee OA and laterality'],
      ['imaging','Available knee imaging and OA findings'],
      ['treatment','Prior treatments and response'],
      ['product','Requested product, dose, units, and HCPCS'],
      ['frequency','Prior injection dates and repeat-course interval'],
      ['benefit','Medical versus pharmacy benefit and buy-and-bill requirements']
    ],
    cautions: ['Some plans exclude viscosupplementation entirely.', 'Brand, product-specific HCPCS, and frequency rules vary by plan.']
  }
});
export function getOfflineGuide(key) { return OFFLINE_AUTH_GUIDES[key] || null; }
export function assessOfflinePacket(key, answers = {}) {
  const guide = getOfflineGuide(key);
  if (!guide) return {status:'unknown-service', missing:[], completed:[], payerVerified:false};
  const completed = guide.questions.filter(([id]) => String(answers[id] ?? '').trim()).map(([id,label]) => ({id,label}));
  const missing = guide.questions.filter(([id]) => !String(answers[id] ?? '').trim()).map(([id,label]) => ({id,label}));
  return {status:missing.length ? 'documentation-incomplete' : 'ready-for-payer-review',
    completed,missing,payerVerified:false,
    warning:'Clinical documentation readiness only. Not an insurance coverage or prior-authorization determination.'};
}
export function renderOfflineLetter(key, answers = {}) {
  const guide = getOfflineGuide(key);
  if (!guide) throw new Error('Unknown service');
  const assessment = assessOfflinePacket(key,answers);
  const lines = guide.questions.map(([id,label]) => label + ': ' + (String(answers[id] ?? '').trim() || '[NOT PROVIDED]'));
  return ['DRAFT — CLINICIAN REVIEW REQUIRED', 'Re: Request for medical necessity review — ' + guide.label,
    '', ...lines, '', 'Please evaluate this request under the member\'s applicable benefit and current medical policy.',
    'This draft does not certify that any payer criteria have been met.',
    'Missing documentation items: ' + assessment.missing.map(x=>x.label).join('; ')].join('\n');
}
