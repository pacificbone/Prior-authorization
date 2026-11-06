import {hawaiiPolicies,coverageProfiles,formularyLists} from './hawaii-sources.mjs';
export {coverageProfiles,formularyLists};
// Manually reviewed public sources, checked 2026-11-06. These are not member benefits.
export const payers = ['HMSA', 'HMAA', 'HMA', 'MDX', 'UHA', 'UnitedHealthcare', 'Humana', 'Devoted Health', 'AlohaCare', 'Kaiser', 'Curative', 'Medicare', 'Other'];
export const carrierChoices=['','HMSA','HMAA','UnitedHealthcare','Humana','Devoted Health','UHA','Aetna','Cigna','DMBA','Self-funded / employer plan','Other'];
export const lines = ['Commercial', 'Individual Exchange', 'Medicare Advantage', 'QUEST / Medicaid', 'Traditional Medicare'];
export const drugs = [
  {id:'evenity', name:'Evenity', generic:'romosozumab-aqqg', category:'Bone-forming therapy', family:'romosozumab'},
  {id:'prolia', name:'Prolia', generic:'denosumab', category:'RANK ligand inhibitor', family:'denosumab'},
  {id:'bildyos', name:'Bildyos', generic:'denosumab-nxxp', category:'Denosumab biosimilar', family:'denosumab'},
  {id:'enoby', name:'Enoby', generic:'denosumab-qbde', category:'Denosumab biosimilar', family:'denosumab'},
  {id:'stoboclo', name:'Stoboclo', generic:'denosumab-bmwo', category:'Denosumab biosimilar', family:'denosumab'},
  {id:'jubbonti', name:'Jubbonti', generic:'denosumab-bbdz', category:'Denosumab biosimilar', family:'denosumab'},
  {id:'alendronate', name:'Alendronate', generic:'alendronate sodium · Fosamax', category:'Bisphosphonate', family:'alendronate'},
  {id:'zoledronic-acid', name:'Zoledronic acid', generic:'Reclast', category:'Bisphosphonate', family:'zoledronic-acid'},
  {id:'teriparatide', name:'Teriparatide', generic:'Forteo / generic', category:'Bone-forming therapy', family:'teriparatide'},
  {id:'tymlos', name:'Tymlos', generic:'abaloparatide', category:'Bone-forming therapy', family:'abaloparatide'}
];
export const policies = [
  {
    id:'uhc-evenity-2026-11', title:'Evenity · initial therapy', payer:'UnitedHealthcare',
    lines:['Commercial','Individual Exchange'], benefit:'Medical', kind:'medical-policy',
    drugIds:['evenity'], policyNumber:'2026D0080M', effective:'2026-11-01', reviewed:'2026-11-06', expires:null,
    url:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/evenity-romosozumab-aqqg.pdf',
    locator:'Coverage Rationale, page 1', formularyStatus:'unknown', preferred:[],
    summary:'Initial-treatment policy for postmenopausal osteoporosis with high fracture risk. A medical-necessity policy does not establish member benefits or a formulary tier.',
    limitations:'Initial therapy only. Review full policy, FDA labeling, benefit documents, exclusions and any site-of-care rules. Do not apply this commercial policy to Medicare Advantage or Community Plan.',
    criteria:[
      {id:'diagnosis', label:'Postmenopausal osteoporosis diagnosis', help:'Identify the diagnosis in the clinical documentation.'},
      {id:'risk', label:'High fracture risk', help:'Document fracture history, risk factors, or prior-treatment failure/intolerance supporting high risk.'},
      {id:'dose', label:'Regimen consistent with FDA labeling', help:'Clinician must verify the requested regimen against current labeling.'},
      {id:'duration', label:'Requested authorization no longer than 12 months', help:'Document the requested authorization period.'}
    ]
  },
  {
    id:'uhc-denosumab-2026-10', title:'Denosumab · initial osteoporosis therapy', payer:'UnitedHealthcare',
    lines:['Commercial','Individual Exchange'], benefit:'Medical', kind:'medical-policy',
    drugIds:['prolia','bildyos','enoby','stoboclo','jubbonti'], policyNumber:'2026D0068U',
    effective:'2026-10-01', reviewed:'2026-11-06', expires:null,
    url:'https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/denosumab-prolia-xgeva.pdf',
    locator:'Preferred Product and Diagnosis-Specific Criteria, page 2', formularyStatus:'unknown',
    preferred:['Bildyos','Enoby','Prolia','Stoboclo'],
    summary:'For medical-necessity plans, this policy lists Bildyos, Enoby, Prolia and Stoboclo as preferred. Jubbonti is typically excluded; exceptions depend on law and plan terms. Non-medical-necessity plans differ.',
    limitations:'Initial osteoporosis therapy only; other indications and renewals have different requirements. Nonpreferred requests require a separate exception review. Verify plan applicability, excluded-drug rules and the complete source.',
    criteria:[
      {id:'diagnosis', label:'Osteoporosis diagnosis', help:'Document the relevant osteoporosis diagnosis.'},
      {id:'risk', label:'High fracture risk', help:'Document the clinical basis for high risk.'},
      {id:'dose', label:'Regimen consistent with FDA labeling', help:'Clinician verifies current product labeling.'},
      {id:'duration', label:'Authorization no longer than 12 months', help:'Document the requested period.'},
      {id:'product', label:'Product preference or exception reviewed', help:'Confirm the member’s plan type and preferred-product requirements; document exception evidence when needed.'}
    ]
  },
  ...hawaiiPolicies
];
export const sourceDirectory = [
  {name:'UHC medical drug policies', payer:'UnitedHealthcare', url:'https://www.uhcprovider.com/en/policies-protocols/commercial-policies/commercial-medical-drug-policies.html', note:'Use the policy for the exact line of business and benefit.'},
  {name:'HMSA Essential Drug Formulary', payer:'HMSA', url:'https://www.hmsa.com/prc/pharmacy/hmsa-essential-drug-formulary-and-coverage-codes/', note:'Formulary landing page checked November 6, 2026. Drug entries have not been imported; coverage remains unknown.'},
  {name:'HMSA specialty medical policies: M–Z', payer:'HMSA', url:'https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/', note:'Find the specific product and Commercial, QUEST or Medicare Advantage version.'},
  {name:'Medicare Coverage Database', payer:'Medicare', url:'https://www.cms.gov/medicare-coverage-database/search.aspx', note:'Check applicable national and local coverage, jurisdiction, billing articles and benefit category.'},
  ...Object.entries(coverageProfiles).filter(([payer])=>!['HMSA','UnitedHealthcare'].includes(payer)).flatMap(([payer,profile])=>profile.urls.map(([name,url])=>({payer,name,url,note:profile.note})))
];
export const defaultScope = {payer:'HMSA', line:'Commercial', benefit:'Medical', plan:'', planCode:'',carrier:''};
