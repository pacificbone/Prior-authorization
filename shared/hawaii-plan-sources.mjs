/**
 * Public Hawai'i coverage-source navigator (no patient or member data).
 * "official-search" means the user must complete the lookup at the payer.
 * A source URL is NEVER a coverage determination or an imported drug list.
 *
 * Reviewed 2026-11-07. Source dates and plan variants must be rechecked.
 */
export const coveragePrograms = Object.freeze([
  {id:'commercial',label:'Commercial HMO / PPO'},
  {id:'exchange',label:'Individual / marketplace'},
  {id:'quest',label:'QUEST / Medicaid'},
  {id:'medicare-advantage',label:'Medicare Advantage / D-SNP'},
  {id:'part-d',label:'Medicare Part D / PDP'},
  {id:'original-medicare',label:'Traditional Medicare'},
  {id:'federal',label:'Federal employee / postal'},
  {id:'veterans',label:'VA / Veterans'},
  {id:'military',label:'TRICARE'},
  {id:'delegated',label:'Self-funded / delegated / work comp'}
]);
export const coverageSourceStatuses=Object.freeze([
  'live-drug-search','partial-verified-entries','payer-search','public-source','no-single-formulary'
]);
const R=(id,payer,name,program,network,sourceUrl,status,notes,year='2026',extra={})=>Object.freeze({
  id,payer,name,program,network,sourceUrl,status,notes,year,...extra
});
export const hawaiiCoverageSources=Object.freeze([
  // Hawaii Medical Service Association: never equate plan network (HMO/PPO) with formulary variant.
  R('hmsa-select-choice','HMSA','Select / Choice commercial formulary','commercial','HMO / PPO','https://www.hmsa.com/prc/pharmacy/hmsa-select-and-choice-drug-formulary-and-coverage-codes/','public-source','Match the three-character coverage code to Select or Choice. Current directory lists an October 2026 PDF.'),
  R('hmsa-essential','HMSA','Essential commercial formulary','commercial','HMO / PPO','https://www.hmsa.com/prc/pharmacy/hmsa-essential-drug-formulary-and-coverage-codes/','public-source','Check the member coverage code. The source page lists the October 2026 drug list.'),
  R('hmsa-optimal','HMSA','Optimal commercial formulary','commercial','HMO / PPO','https://www.hmsa.com/prc/pharmacy/hmsa-optimal-drug-formulary-and-coverage-codes/','public-source','The Optimal drug list is separate from Select/Choice, Essential and Metallic.'),
  R('hmsa-metallic','HMSA','Metallic / ACA plans','exchange','HMO / PPO','https://www.hmsa.com/prc/pharmacy/hmsa-metallic-drug-formulary-and-coverage-codes/','public-source','Official October 2026 Metallic PDF and machine-readable JSON are published; neither is ingested as live results yet.'),
  R('hmsa-quest','HMSA','HMSA QUEST Integration pharmacy','quest','Medicaid managed care','https://www.hmsa.com/prc/pharmacy/hmsa-quest-drug-formulary/','live-drug-search','Official November 2026 pharmacy JSON is searched by drug name/RxNorm. Confirm the published plan ID and current version.', '2026',{liveSourceId:'hmsa-quest-2026-11'}),
  R('hmsa-ma-individual','HMSA','Akamai Advantage individual 725 / 730 / 735 / 740','medicare-advantage','HMO / PPO as contracted','https://www.hmsa.com/prc/pharmacy/medicare-advantage-plan-formularies-and-pa-st-criteria/','payer-search','Separate 2026 and 2027 Part D formularies and PA/ST files. Select the individual contract/product.','2026–2027'),
  R('hmsa-ma-group','HMSA','Akamai Advantage group 545 / 745 / 750 / 830','medicare-advantage','Employer / group MA','https://www.hmsa.com/prc/pharmacy/medicare-advantage-plan-formularies-and-pa-st-criteria/','payer-search','Group Part D formulary differs from individual and dual plans. Select group number and plan year.','2026–2027'),
  R('hmsa-ma-dual','HMSA','Akamai Advantage Dual Care D-SNP','medicare-advantage','D-SNP','https://www.hmsa.com/prc/pharmacy/medicare-advantage-plan-formularies-and-pa-st-criteria/','payer-search','Dual-eligible plan pharmacy list and medical-benefit criteria require separate review.','2026–2027'),
  R('hmsa-fep','HMSA','Federal Plan 87 / Blue Cross FEP','federal','Federal employee','https://www.hmsa.com/prc/pharmacy/hmsas-fed-87-drug-formulary/','public-source','Federal plan 87 High/Standard commercial list is not the HMSA standard commercial formulary.'),
  R('hmsa-postal','HMSA','Postal Service commercial pharmacy','federal','Postal Service','https://www.hmsa.com/prc/pharmacy/hmsas-fed-87-drug-formulary/','public-source','Postal pharmacy coverage codes 154/155. Separate from Medicare Postal Part D.'),
  R('hmsa-postal-partd','HMSA','Medicare Postal Prescription Drug Plan','part-d','Postal Medicare PDP','https://www.hmsa.com/prc/pharmacy/hmsas-fed-87-drug-formulary/','payer-search','Different 2026 and 2027 Medicare Postal formularies; verify the plan code 151 or 153.','2026–2027'),

  R('kaiser-commercial','Kaiser Permanente','Employer small- / large-group HMO pharmacy','commercial','HMO','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary','public-source','Select the applicable Hawaii group and 2026 Marketplace formulary rather than assuming all Kaiser members share a list.'),
  R('kaiser-kpic','Kaiser Permanente','KPIC Added Choice employer plans','commercial','PPO / Added Choice','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary','public-source','KPIC Added Choice is a distinct pharmacy list; the source page lists a 2027 version.','2026–2027'),
  R('kaiser-individual','Kaiser Permanente','Individual / family Marketplace plans','exchange','HMO / Standard','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary','public-source','Marketplace Standard and other individual formularies are separate.'),
  R('kaiser-quest','Kaiser Permanente','Kaiser Hawaii QUEST Medicaid','quest','HMO Medicaid','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary','public-source','Kaiser posted a QUEST formulary effective November 2026; pharmacy eligibility still plan-specific.'),
  R('kaiser-ma','Kaiser Permanente','Senior Advantage HMO','medicare-advantage','HMO','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary/medicare-2027','payer-search','Select Senior Advantage Basic, Enhanced or island-specific plan and correct 2026/2027 year.','2026–2027'),
  R('kaiser-ma-dual','Kaiser Permanente','Dual Complete HMO D-SNP','medicare-advantage','HMO D-SNP','https://healthy.kaiserpermanente.org/hawaii/health-wellness/drug-formulary/medicare-2027','payer-search','Separate D-SNP Part D formulary; QUEST secondary pharmacy arrangements vary.','2026–2027'),

  R('aloha-quest','AlohaCare','AlohaCare QUEST Medicaid primary','quest','Medicaid managed care','https://www.alohacare.org/formulary','payer-search','Official public QUEST formulary, searchable drug finder, and machine-readable JSON are linked; JSON parsing still requires independent runtime validation.'),
  R('aloha-wrap','AlohaCare','AlohaCare QUEST pharmacy wrap / secondary','quest','Secondary / wrap','https://www.alohacare.org/formulary','public-source','Separate wrap-benefit PDF/JSON. Primary Medicare/other insurance coverage must be checked first.'),
  R('aloha-ma-plus','AlohaCare','AlohaCare Advantage Plus HMO D-SNP','medicare-advantage','HMO D-SNP','https://www.alohacare.org/formulary','payer-search','AlohaCare Medicare plus AlohaCare QUEST; separate Medicare drug list/PA/ST.','2026–2027'),
  R('aloha-ma','AlohaCare','AlohaCare Advantage HMO D-SNP','medicare-advantage','HMO D-SNP','https://www.alohacare.org/formulary','payer-search','AlohaCare Medicare primary with different QUEST secondary; plan-specific Part D.','2026–2027'),
  R('aloha-ccs','AlohaCare','AlohaCare Community Care Services','quest','Specialized Medicaid','https://www.alohacare.org/formulary','public-source','CCS is a separate specialized program; do not substitute QUEST pharmacy coverage.'),

  R('uhc-commercial','UnitedHealthcare','UnitedHealthcare commercial Choice / Options / tiered','commercial','PPO / employer-specific','https://www.uhc.com/member-resources/pharmacy-benefits/prescription-drug-lists','public-source','Commercial Advantage, Traditional, Access and Essential PDLs differ; verify exact list and year.','2026–2027'),
  R('uhc-exchange','UnitedHealthcare','Individual / Exchange (where offered)','exchange','Plan-specific','https://www.uhc.com/member-resources/pharmacy-benefits/prescription-drug-lists','public-source','Do not use a generic commercial PDL without matching member product and pharmacy list.','2026–2027'),
  R('uhc-quest','UnitedHealthcare','Community Plan Hawaiʻi QUEST','quest','Medicaid managed care','https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-pharmacy.html','live-drug-search','Official 2026 QUEST pharmacy PDL with plan ID UCSHIQ1; the medical-benefit and Part D entries require separate verification.','2026',{liveSourceId:'uhc-quest-2026-10'}),
  R('uhc-ma','UnitedHealthcare','AARP / UnitedHealthcare Medicare Advantage','medicare-advantage','HMO / PPO','https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans.html','payer-search','Select the exact Hawaii MA plan, year, and Part D formulary; provider medical-drug rules differ.','2026–2027'),
  R('uhc-dual','UnitedHealthcare','Dual Complete D-SNP / RP PPO','medicare-advantage','D-SNP / Regional PPO','https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-pharmacy.html','payer-search','Dual Complete RP R3175-003 has a separate PDL. Confirm plan identity and delegation.','2026–2027'),

  R('ohana-quest','ʻOhana / Wellcare','ʻOhana QUEST Medicaid','quest','Medicaid managed care','https://www.ohanahealthplan.com/members/medicaid/quest-medicaid/pharmacy-services.html','payer-search','QUEST 2026 PDL and drug finder. Verify 2027 Medicaid plan transition before applying this source.','2026'),
  R('hmaa-employer','HMAA','HMAA employer Rx / OptumRx Premium','commercial','Employer group','https://www.hmaa.com/healthplans/prescription-plan-info/','partial-verified-entries','A small subset of 2026 July–December OptumRx Premium drugs has been manually extracted. Confirm the employer uses that formulary.'),
  R('uha-employer','UHA','UHA employer Rx / Express Scripts','commercial','Employer plan','https://www.uhahealth.com/members/express-scripts','payer-search','UHA publishes a preferred drug list and a separate online PA lookup. Exact group benefits require confirmation.'),
  R('uha-medical-pa','UHA','UHA medical-benefit and pharmacy PA routing','commercial','Medical / pharmacy distinction','https://www.uhahealth.com/providers/online-prior-authorization-pa','payer-search','Drug PA lookup indicates reviewer/routing, not actual formulary inclusion or patient eligibility.'),
  R('curative-commercial','Curative','Curative employer commercial formulary','commercial','PPO / EPO / network-specific','https://curative.com/drugs','payer-search','Official 2026 public drug search and downloadable formulary, with tier information; verify member plan exclusions.'),
  R('humana-ma','Humana','Humana Medicare Advantage / Part D','medicare-advantage','HMO / PPO / SNP','https://www.medicare.gov/plan-compare/','payer-search','Select actual Humana Medicare contract, formulary ID, plan year and member-specific Part D coverage.','2026–2027'),
  R('humana-pdp','Humana','Humana stand-alone Part D plan','part-d','PDP','https://www.medicare.gov/plan-compare/','payer-search','Each stand-alone PDP has its own drug list. This does not apply to traditional Medicare Part B.','2026–2027'),
  R('devoted-ma','Devoted Health','Devoted Medicare Advantage (if enrolled)','medicare-advantage','HMO / PPO / SNP as contracted','https://www.medicare.gov/plan-compare/','payer-search','Confirm the plan is offered in the member’s county and its contract/year before checking covered drugs.','2026–2027'),
  R('other-ma','Other Medicare Advantage','Other Hawaiʻi MA / D-SNP / employer group','medicare-advantage','HMO / PPO / D-SNP','https://www.medicare.gov/plan-compare/','payer-search','Use exact CMS contract, plan, segment and year; no universal MA drug list.','2026–2027'),

  R('original-b','Traditional Medicare','Original Medicare Part B physician-administered drugs','original-medicare','Medicare FFS','https://www.medicare.gov/coverage/prescription-drugs-outpatient','no-single-formulary','No stand-alone Part B pharmacy formulary. Verify Part B drug benefit category, diagnosis, MAC LCD/NCD, billing and applicable PA separately.','2026–2027'),
  R('original-d','Traditional Medicare','Original Medicare + separate Part D plan','part-d','PDP','https://www.medicare.gov/plan-compare/','payer-search','Original Medicare by itself does not define Part D. Choose the separately enrolled PDP and its formulary year.','2026–2027'),
  R('medigap','Medigap','Medicare Supplement / Medigap','original-medicare','Supplement','https://www.medicare.gov/health-drug-plans/medigap','no-single-formulary','Medigap does not replace Part D; look up separate Part D coverage and Original Medicare Part B.','2026–2027'),

  R('va','Veterans Affairs','VA National Formulary','veterans','VA care / Pharmacy','https://www.va.gov/formularyadvisor/','payer-search','VA Formulary Advisor distinguishes formulary, PA-F, non-formulary and criteria-for-use statuses. Community Care may have separate rules.','2026–2027'),
  R('va-cfuses','Veterans Affairs','VA National Formulary documents and CFU','veterans','VA medical / pharmacy','https://www.pbm.va.gov/PBM/NationalFormulary.asp','public-source','Official national formulary files, changes and criteria-for-use. Confirm VA pharmacy eligibility and approval.','2026–2027'),
  R('tricare','TRICARE','TRICARE Pharmacy Benefit / Express Scripts','military','Military and dependents','https://www.tricare.mil/FormularySearch','payer-search','TRICARE formulary tool includes tiers, PA, medical-necessity forms and dispensing channel.','2026–2027'),
  R('hma-verdegard','HMA / Verdegard','Self-funded employer plan / TPA','delegated','Administrator, not one carrier','https://verdegard-hi.com/eutf/','no-single-formulary','Obtain the exact employer group, underlying carrier/PBM and primary plan. EUTF supplemental rules are not universal.'),
  R('mdx','MDX Hawaiʻi','MDX delegated group / Medicare Advantage','delegated','Delegated administrator','https://mdxhawaii.com/health-plan-customer-service/','no-single-formulary','MDX is not one pharmacy formulary. Select underlying insurer, contracted line, delegated group and year first.','2026–2027'),
  R('other-employer','Other employer / national','Aetna / Cigna / other self-funded commercial','delegated','HMO / PPO / EPO / self-funded','https://www.medicare.gov/health-drug-plans/','no-single-formulary','No one statewide list covers all out-of-area or employer-specific PBMs. Obtain the plan document/ID card and PBM formulary.'),
  R('workers-comp','Workers compensation','Hawaiʻi workers’ compensation pharmacy benefits','delegated','Claim / TPA specific','https://labor.hawaii.gov/dcd/home/about-division/workers-compensation/','no-single-formulary','Coverage authorization depends on the claim, applicable work-comp rules, carrier/TPA and medication; not a universal commercial formulary.')
]);
export function validateHawaiiCoverageSources(rows=hawaiiCoverageSources) {
  const ids=new Set(),known=new Set(coveragePrograms.map(p=>p.id));
  if(!Array.isArray(rows)||!rows.length)throw new Error('Empty coverage directory.');
  for(const row of rows) {
    if(!row||typeof row!=='object'||!row.id||ids.has(row.id)||
       !/^[a-z0-9-]+$/.test(row.id)||!known.has(row.program)||
       !coverageSourceStatuses.includes(row.status)||
       ![row.payer,row.name,row.network,row.notes,row.year].every(v=>typeof v==='string'&&v.length>0&&v.length<=1000))throw new Error('Invalid or duplicated coverage entry.');
    const url=new URL(row.sourceUrl);
    if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new Error('Invalid public source link.');
    if(row.status==='live-drug-search'&&!row.liveSourceId)throw new Error('Live lookup needs a source ID.');
    if(row.liveSourceId&&row.status!=='live-drug-search')throw new Error('Directory-only source cannot be marked live.');
    ids.add(row.id);
  }
  return true;
}
export function findHawaiiCoverageSources({program='all',text='',payer='all'}={}) {
  const q=String(text).toLowerCase().trim().slice(0,120);
  return hawaiiCoverageSources.filter(entry=>
    (program==='all'||entry.program===program)&&
    (payer==='all'||entry.payer===payer)&&
    (!q||[entry.payer,entry.name,entry.network,entry.notes,entry.program].join(' ').toLowerCase().includes(q))
  );
}
export function coverageDirectoryStats() {
  return {sources:hawaiiCoverageSources.length,
    imported:hawaiiCoverageSources.filter(x=>x.status==='live-drug-search').length,
    partial:hawaiiCoverageSources.filter(x=>x.status==='partial-verified-entries').length,
    official:hawaiiCoverageSources.filter(x=>['payer-search','public-source'].includes(x.status)).length,
    manual:hawaiiCoverageSources.filter(x=>x.status==='no-single-formulary').length};
}
validateHawaiiCoverageSources();
