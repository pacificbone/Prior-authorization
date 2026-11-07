// Public, official, plan-scoped machine-readable pharmacy files only.
// These identifiers are source/plan IDs, never patient/member identifiers.
// Do not add a source until its URL, schema and plan identifiers are verified.
export const PUBLISHED_FORMULARIES=Object.freeze([
  Object.freeze({
    id:'hmsa-quest-2026-11',
    label:'HMSA QUEST · November 2026',
    payer:'HMSA',
    line:'QUEST / Medicaid',
    benefit:'Pharmacy',
    effective:'2026-11-01',
    year:2026,
    reviewAfterDays:90,
    sourcePage:'https://www.hmsa.com/prc/pharmacy/hmsa-quest-drug-formulary/',
    sourceUrl:'https://assets.contentstack.io/v3/assets/blt731834369e6b995a/blt1cfd921ba2fdcc8d/6ae4050ff59c3f1d3bce71fc/hmsa-quest-formulary-2026.json',
    planIdType:'HIOS-PLAN-ID',
    planId:'22780AA1111111'
  }),
  Object.freeze({
    id:'uhc-quest-2026-10',
    label:'UnitedHealthcare Community Plan Hawaiʻi QUEST · October 2026',
    payer:'UnitedHealthcare',
    line:'QUEST / Medicaid',
    benefit:'Pharmacy',
    effective:'2026-10-01',
    year:2026,
    reviewAfterDays:90,
    sourcePage:'https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-pharmacy.html',
    sourceUrl:'https://legacy.providerlookuponline.com/mrf/optumrx/drugs/2877216/JSON_Drugs_UHCCPHI.json',
    planIdType:'PLAN-ID',
    planId:'UCSHIQ1'
  })
]);
export const QUEST_FORMULARY=PUBLISHED_FORMULARIES[0];
export function getPublishedFormulary(id){
  return PUBLISHED_FORMULARIES.find(source=>source.id===id)||null;
}
