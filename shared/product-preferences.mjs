// Structured product preference and prior-authorization signals, transcribed ONLY from the fingerprinted
// payer documents behind shared/payer-policy-evidence.mjs. A row restates what one document says for one
// selectable product; it never asserts coverage, approval, eligibility or that the member's plan adopts it.
import {PAYER_POLICY_EVIDENCE,payerEvidenceFor} from './payer-policy-evidence.mjs';
import {orthoGelProducts} from './orthopedic-procedures.mjs';
import {AUTH_TEMPLATE_CATALOG} from './authorization-template-catalog.mjs';
import {policyDay} from './plan-adoption.mjs';
export const PREFERENCE_STATUSES=Object.freeze(['preferred','non-preferred','excluded','covered-on-criteria']);
export const PA_SIGNAL_TYPES=Object.freeze(['precertification-required','pa-not-required-per-policy','step-therapy','interqual-criteria','lcd-no-prior-auth','unproven','unproven-other-devices','not-reasonable-and-necessary','refers-to-commercial-policy']);
// Only these answer the prior-authorization question; the rest are coverage-criteria statements.
export const PA_ANSWER_SIGNALS=Object.freeze(['precertification-required','pa-not-required-per-policy','step-therapy','lcd-no-prior-auth']);
const G=(...ids)=>ids.map(id=>'gel-'+id),B=(...ids)=>ids.map(id=>'bone-'+id);
const rows=(evidenceId,status,productIds,exception=null)=>productIds.map(productId=>({evidenceId,productId,status,exception}));
const allGel=orthoGelProducts.map(p=>'gel-'+p.id);
const except=(list,ids)=>list.filter(p=>!ids.includes(p));
export const PRODUCT_PREFERENCES=Object.freeze([
 // HMSA Hyaluronate Products Exceptions Criteria, HMO/PPO/QUEST (effective 01/01/2026), table 1 and section B.
 // Synojoynt is not in table 1 (section B: new-to-market products are non-preferred until added): no row, see UNLISTED_PRODUCT_NOTES.
 ...rows('hmsa-gel-preference-2026','preferred',G('euflexxa','synvisc','synvisc-one')),
 ...rows('hmsa-gel-preference-2026','non-preferred',G('durolane','gel-one','gelsyn-3','genvisc','hyalgan','hymovis','monovisc','orthovisc','supartz','triluron','trivisc','visco-3'),
  'Section B: the policy provides coverage for a non-preferred product when the member is currently undergoing treatment and coverage is required to complete the current course, or has tried and experienced a documented intolerable adverse event to both preferred products (Euflexxa and Synvisc or Synvisc One).'),
 // HMSA Hyaluronate Products Exceptions Criteria, Medicare Advantage (effective 01/01/2026), product table and section B.
 // Synojoynt is not listed; the policy states its preferred drug criteria do not apply to an unlisted FDA-approved product: no row, see UNLISTED_PRODUCT_NOTES.
 ...rows('hmsa-gel-ma-preference-2026','preferred',G('durolane','euflexxa','gelsyn-3','supartz')),
 ...rows('hmsa-gel-ma-preference-2026','non-preferred',G('gel-one','genvisc','hyalgan','hymovis','monovisc','orthovisc','synvisc','synvisc-one','triluron','trivisc','visco-3'),
  'Section B: the policy provides coverage for a non-preferred product when the member received the requested product in the past 365 days, is currently undergoing treatment and coverage is required to complete the current course, or tried and had a documented intolerable adverse event to all four preferred products (Durolane, Euflexxa, Gelsyn-3 and Supartz FX).'),
 // HMSA Prolia and Biosimilars, HMO/PPO/QUEST (effective 04/01/2026), table 1 and exception criteria.
 // Also named and not selectable here: Bosaya, Conexxence, Ospomyv, Osvyrti (non-preferred).
 ...rows('hmsa-prolia-cq-2026','preferred',B('jubbonti')),
 ...rows('hmsa-prolia-cq-2026','non-preferred',B('bildyos','enoby','prolia','stoboclo'),
  'Exception criteria: a documented intolerable adverse event to Jubbonti that was not an expected adverse event attributed to the active ingredient.'),
 // HMSA Prolia and Biosimilars, Medicare Advantage (effective 10/01/2026), section B.
 // Also named and not selectable here: Bosaya, Conexxence, Ospomyv, Osvyrti (non-preferred).
 ...rows('hmsa-prolia-ma-2026','preferred',B('bildyos')),
 ...rows('hmsa-prolia-ma-2026','non-preferred',B('enoby','jubbonti','prolia','stoboclo'),
  'Section B: a documented inadequate response or intolerable adverse event with Bildyos that was not an expected active-ingredient adverse event, or treatment with the requested product in the past 365 days.'),
 // UHC Sodium Hyaluronate, Commercial and Individual Exchange (2026D0081M), coverage rationale.
 // Also named and not selectable here: Hymovis One (typically excluded).
 ...rows('uhc-gel-2026','covered-on-criteria',G('durolane','euflexxa','gelsyn-3')),
 ...rows('uhc-gel-2026','excluded',except(allGel,G('durolane','euflexxa','gelsyn-3')),
  'Typically excluded from coverage; coverage reviews may be in place if required by law or the benefit plan (see the Medical Benefit Therapeutic Equivalent Medications – Excluded Drugs policy and its preferred alternatives).'),
 // UHC Sodium Hyaluronate, Community Plan (CS2026D0081Q); preferred product criteria stated to apply in HI.
 // Also named and not selectable here: Hymovis One (non-preferred).
 ...rows('uhc-cs-gel-2026','preferred',G('durolane','euflexxa','gelsyn-3')),
 ...rows('uhc-cs-gel-2026','non-preferred',except(allGel,G('durolane','euflexxa','gelsyn-3')),
  'Preferred Product Criteria: minimal clinical response to an adequate trial of Durolane, Euflexxa and Gelsyn-3, or their failure, contraindication or intolerance, each with a physician attestation.'),
 // UHC Denosumab, Commercial and Individual Exchange (2026D0068U), preferred product section (medical necessity plans).
 // Also named and not selectable here: Bosaya, Conexxence, Ospomyv (typically excluded); Boncresa, Osvyrti, Ponlimsi (Review at Launch).
 ...rows('uhc-denosumab-2026','preferred',B('bildyos','enoby','prolia','stoboclo')),
 ...rows('uhc-denosumab-2026','excluded',B('jubbonti'),
  'Typically excluded from coverage; coverage reviews may be in place if required by law or the benefit plan (the policy refers to its separate Excluded Drugs policy, not captured here). Separately, on medical necessity plans the policy makes coverage of a non-preferred product contingent on the Preferred Product Criteria (minimal clinical response to, or intolerance, contraindication or adverse event with, Bildyos, Enoby, Prolia and Stoboclo, with a physician attestation) and the diagnosis-specific criteria.'),
 // UHC Denosumab, Community Plan (CS2026D0068Y), preferred products and preferred product criteria.
 // Also named and not selectable here: Bilprevda, Wyost, Xtrenbo (preferred); Aukelso, Bomyntra, Bosaya, Conexxence, Ospomyv, Osenvelt, Xbryk, Xgeva (non-preferred).
 ...rows('uhc-cs-denosumab-2026','preferred',B('bildyos','enoby','jubbonti')),
 ...rows('uhc-cs-denosumab-2026','non-preferred',B('prolia','stoboclo'),
  'Preferred Product Criteria: minimal clinical response with residual disease activity after adequate trials of two of Bildyos, Enoby and Jubbonti, or a contraindication, intolerance or adverse event to two of them, each with a physician attestation; and no loss of a favorable response after established maintenance therapy with Bildyos, Enoby or Jubbonti.'),
 // UHC Medicare Part B Step Therapy Programs (IAP.001.31): Hyaluronic Acid Polymers and Bone Density Agents – Osteoporosis tables.
 // Also named and not selectable here: Hymovis One (non-preferred hyaluronate); Conexxence, Ospomyv (non-preferred osteoporosis agents).
 ...rows('uhc-ma-partb-step-2026','preferred',G('durolane','gelsyn-3','synvisc','synvisc-one')),
 ...rows('uhc-ma-partb-step-2026','non-preferred',except(allGel,G('durolane','gelsyn-3','synvisc','synvisc-one')),
  'Step therapy: trial and failure of all of Durolane, Gelsyn-3 and Synvisc/Synvisc-One with minimal clinical response, intolerance or adverse event(s) to all of them, or continuation of prior therapy within the past 365 days.'),
 ...rows('uhc-ma-partb-step-2026','preferred',B('jubbonti','prolia','stoboclo')),
 ...rows('uhc-ma-partb-step-2026','non-preferred',B('bildyos','enoby','evenity'),
  'Step therapy: history of use of Jubbonti, Prolia or Stoboclo with minimal clinical response, a contraindication, intolerance or adverse event(s) to Jubbonti, Prolia or Stoboclo, or continuation of prior therapy within the past 365 days.')
].map(r=>Object.freeze(r)));
// The products one preference document classifies (its own table), for scoping that document's other statements.
const PRODUCT_PREFERENCES_TABLE=evidenceId=>[...new Set(PRODUCT_PREFERENCES.filter(r=>r.evidenceId===evidenceId).map(r=>r.productId))];
// A selectable product a preference document does not list: the document's own words for that case. No status is invented.
export const UNLISTED_PRODUCT_NOTES=Object.freeze([
 {evidenceId:'hmsa-gel-preference-2026',products:G('synojoynt'),text:'Section B states that new-to-market products will be considered non-preferred until they are added to this policy. Confirm this product\'s preference status with HMSA before choosing the exception documentation.'},
 {evidenceId:'hmsa-gel-ma-preference-2026',products:G('synojoynt'),text:'Section B states that its step therapy preferred drug criteria do not apply to any new or existing FDA-approved product that is not listed. Document the Medicare Advantage clinical policy criteria and confirm the review with HMSA.'}
].map(r=>Object.freeze({...r,products:Object.freeze(r.products)})));
// Scope statements a preference document attaches to its own table, shown next to the selected product's status
// (only for the statuses each one is about).
const EXCLUSION_LIST_NOTE='The exclusion refers to an Excluded Drugs policy titled for Commercial only; this policy does not say how that list applies to an Individual Exchange plan.';
const MEDICAL_NECESSITY_NOTE='The preferred list is stated for medical necessity plans; on non-medical necessity plans the policy approves any denosumab product on its diagnosis-specific criteria. The member\'s plan type is not verified.';
export const PREFERENCE_CAVEATS=Object.freeze([
 {evidenceId:'uhc-ma-partb-step-2026',statuses:PREFERENCE_STATUSES,text:'Step therapy does not apply to the plans this policy excludes (for example Hawaiʻi Dual Complete H6824-002 and all Employer Group HMO plans); confirm the member\'s contract first.'},
 {evidenceId:'uhc-denosumab-2026',statuses:['preferred'],text:MEDICAL_NECESSITY_NOTE},
 {evidenceId:'uhc-denosumab-2026',statuses:['excluded'],text:EXCLUSION_LIST_NOTE+' '+MEDICAL_NECESSITY_NOTE},
 {evidenceId:'uhc-gel-2026',statuses:['excluded'],text:EXCLUSION_LIST_NOTE+' The member\'s plan is not verified.'}
].map(r=>Object.freeze({...r,statuses:Object.freeze([...r.statuses])})));
const caveatFor=row=>PREFERENCE_CAVEATS.find(c=>c.evidenceId===row.evidenceId&&c.statuses.includes(row.status))?.text||null;
// Brands a preference document names that are not selectable in Coverage Desk, by product class.
export const ALSO_NAMED=Object.freeze({
 'hmsa-prolia-cq-2026':{bone:['Bosaya','Conexxence','Ospomyv','Osvyrti']},
 'hmsa-prolia-ma-2026':{bone:['Bosaya','Conexxence','Ospomyv','Osvyrti']},
 'uhc-gel-2026':{gel:['Hymovis One']},
 'uhc-cs-gel-2026':{gel:['Hymovis One']},
 'uhc-denosumab-2026':{bone:['Bosaya','Conexxence','Ospomyv','Boncresa','Osvyrti','Ponlimsi']},
 'uhc-cs-denosumab-2026':{bone:['Bilprevda','Wyost','Xtrenbo','Aukelso','Bomyntra','Bosaya','Conexxence','Ospomyv','Osenvelt','Xbryk','Xgeva']},
 'uhc-ma-partb-step-2026':{gel:['Hymovis One'],bone:['Conexxence','Ospomyv']}
});
const signal=(evidenceId,type,text,products)=>({evidenceId,signal:type,...(products?{products}:{}),text});
const precert='The policy\'s administrative guidelines state precertification is required.';
export const PA_SIGNALS=Object.freeze([
 // The exceptions documents cover only the products in their own tables, so their signals are scoped to those products.
 signal('hmsa-gel-preference-2026','precertification-required',precert,PRODUCT_PREFERENCES_TABLE('hmsa-gel-preference-2026')),
 signal('hmsa-gel-clinical-2026','precertification-required',precert),
 signal('hmsa-gel-ma-2026','precertification-required',precert),
 signal('hmsa-gel-ma-preference-2026','precertification-required',precert+' Medications considered formulary or preferred may still require a clinical prior authorization review.',PRODUCT_PREFERENCES_TABLE('hmsa-gel-ma-preference-2026')),
 signal('hmsa-prolia-cq-2026','precertification-required','The policy\'s administrative guidelines state prior authorization is required; preferred medications may still require a clinical prior-authorization review.'),
 signal('hmsa-prolia-ma-2026','precertification-required','The policy\'s administrative guidelines state prior authorization is required; preferred medications may still require a clinical prior authorization review.'),
 signal('hmsa-evenity-cq-2025','precertification-required',precert),
 signal('hmsa-evenity-ma-2025','precertification-required',precert),
 signal('hmsa-evolent-matrix-2026','precertification-required','The matrix states authorization is provided for the primary surgery requested and that joint surgery performed bilaterally on the same date requires separate authorizations; Evolent does not prior authorize or manage the facility precertification.'),
 signal('uhc-gel-2026','pa-not-required-per-policy','The policy states prior authorization is not required for Durolane, Euflexxa and Gelsyn-3; coverage is contingent on its diagnosis-specific criteria.',G('durolane','euflexxa','gelsyn-3')),
 signal('uhc-knee-2026','interqual-criteria','Medical necessity criteria are the licensed InterQual CP and client-defined criteria (not reproduced here).'),
 signal('uhc-hip-2026','interqual-criteria','Medical necessity criteria are the licensed InterQual CP and client-defined criteria (not reproduced here).'),
 signal('uhc-sij-2026','interqual-criteria','Minimally invasive fusion with a titanium triangular implant system and open fusion are referred to the InterQual SI Joint Fusion client-defined criteria.'),
 signal('uhc-sij-2026','unproven-other-devices','Fusion with any other device, or for other indications, is unproven and not medically necessary.'),
 signal('uhc-cs-knee-2026','interqual-criteria','Medical necessity criteria are the licensed InterQual CP and client-defined criteria (not reproduced here).'),
 signal('uhc-cs-hip-2026','interqual-criteria','Medical necessity criteria are the licensed InterQual CP and client-defined criteria (not reproduced here).'),
 signal('uhc-ma-joint-2026','refers-to-commercial-policy','The policy requires compliance with applicable LCDs/LCAs and lists no Noridian LCD for this procedure; for states/territories with no applicable LCD/LCA it refers to the UnitedHealthcare Commercial Medical Policy titled Surgery of the Knee. It does not itself name InterQual for the knee; confirm on the Medicare Coverage Database.',['procedure-acl-reconstruction','procedure-meniscus-repair','procedure-knee-meniscectomy','procedure-maci-implant']),
 signal('uhc-ma-partb-step-2026','step-therapy','Non-preferred under Part B step therapy; claims for a non-preferred product given without prior authorization may be denied. Excluded plans include Hawaiʻi H6824-002 and all Group HMO plans.',[...except(allGel,G('durolane','gelsyn-3','synvisc','synvisc-one')),...B('bildyos','enoby','evenity')]),
 signal('uhc-omnibus-carpal-2026','unproven','Percutaneous balloon-assisted or ultrasound-guided carpal tunnel decompression (CPT 64728) is listed as unproven and not medically necessary.'),
 signal('uhc-cs-omnibus-carpal-2026','unproven','Percutaneous balloon-assisted or ultrasound-guided carpal tunnel decompression (CPT 64728) is listed as unproven and not medically necessary.'),
 // The Medicare Advantage code-table row is CPT 64728 (balloon dilation) only; the non-balloon technique is out of its scope.
 signal('uhc-ma-omnibus-carpal-2026','not-reasonable-and-necessary','CPT 64728 is listed as not reasonable and necessary, with a reference to the UHC commercial Omnibus Codes policy.',['procedure-carpal-balloon']),
 signal('medicare-noridian-tka-l36575','lcd-no-prior-auth','Original Medicare has no prior authorization for this procedure; LCD L36575 governs medical-necessity review of the claim and record.'),
 signal('medicare-noridian-tha-l34163','lcd-no-prior-auth','Original Medicare has no prior authorization for this procedure; LCD L34163 governs medical-necessity review of the claim and record.'),
 signal('medicare-noridian-sij-fusion-l39810','lcd-no-prior-auth','Original Medicare has no prior authorization for this procedure; LCD L39810 (which incorporates L39462) governs medical-necessity review of the claim and record.')
].map(r=>Object.freeze({...r,...(r.products?{products:Object.freeze(r.products)}:{})})));
export function validateProductPreferences(prefs=PRODUCT_PREFERENCES,signals=PA_SIGNALS,records=PAYER_POLICY_EVIDENCE){
 const seen=new Set();
 for(const r of prefs){
  const s=records.find(x=>x.id===r.evidenceId),key=r.evidenceId+'|'+r.productId;
  if(!s||!s.products.includes(r.productId)||!PREFERENCE_STATUSES.includes(r.status)||seen.has(key)||!(r.exception===null||typeof r.exception==='string'&&r.exception.trim())||
   (r.status==='non-preferred'||r.status==='excluded')!==(r.exception!==null)||!productName(r.productId))throw Error('Invalid product preference '+key);
  seen.add(key);
 }
 for(const r of signals){
  const s=records.find(x=>x.id===r.evidenceId);
  if(!s||!PA_SIGNAL_TYPES.includes(r.signal)||typeof r.text!=='string'||!r.text.trim()||(r.products!==undefined&&(!Array.isArray(r.products)||!r.products.length||!r.products.every(p=>s.products.includes(p)))))
   throw Error('Invalid PA signal '+r.evidenceId+' '+r.signal);
 }
 // An unlisted-product note never sits on a product the same document already classifies.
 for(const r of UNLISTED_PRODUCT_NOTES){
  const s=records.find(x=>x.id===r.evidenceId);
  if(!s||!r.products.length||!r.products.every(p=>s.products.includes(p)&&!prefs.some(x=>x.evidenceId===r.evidenceId&&x.productId===p))||!r.text.trim())throw Error('Invalid unlisted-product note '+r.evidenceId);
 }
 for(const id of [...PREFERENCE_CAVEATS.map(c=>c.evidenceId),...Object.keys(ALSO_NAMED)])if(!records.some(x=>x.id===id))throw Error('Unknown preference document '+id);
 return true;
}
// Display names come from the selectable gel brands and the bone-health template names.
export function productName(productId=''){
 if(productId.startsWith('gel-'))return orthoGelProducts.find(p=>'gel-'+p.id===productId)?.name||null;
 return AUTH_TEMPLATE_CATALOG.find(t=>t.id===productId&&t.category==='bone-health')?.name||null;
}
const productClass=id=>String(id||'').split('-')[0];
// One glance at the evidence for a selection: references, PA signals and the preference list of the selected
// product's class. Scoping comes only from payerEvidenceFor, so nothing crosses payer, line or benefit.
export function evidenceAtAGlance(scope={},asOf=policyDay()){
 const refs=payerEvidenceFor(scope,asOf),ids=new Set(refs.map(s=>s.id)),cls=productClass(scope.productId);
 const prefs=PRODUCT_PREFERENCES.filter(r=>ids.has(r.evidenceId)&&!!scope.productId&&productClass(r.productId)===cls);
 const names=status=>[...new Set(prefs.filter(r=>r.status===status).map(r=>productName(r.productId)))];
 const own=prefs.find(r=>r.productId===scope.productId)||null;
 return Object.freeze({hasEvidence:refs.length>0,
  references:Object.freeze(refs.map(s=>Object.freeze({id:s.id,title:s.title,version:s.version,sourceUrl:s.sourceUrl,reviewState:s.reviewState,reviewDue:s.reviewDue,
   referenceType:s.referenceType||'policy',proposed:s.proposed===true}))),
  paSignals:Object.freeze(PA_SIGNALS.filter(r=>ids.has(r.evidenceId)&&(!r.products||r.products.includes(scope.productId))).map(r=>Object.freeze({evidenceId:r.evidenceId,signal:r.signal,text:r.text}))),
  preferred:Object.freeze(names('preferred')),nonPreferred:Object.freeze(names('non-preferred')),excluded:Object.freeze(names('excluded')),coveredOnCriteria:Object.freeze(names('covered-on-criteria')),
  selected:own?Object.freeze({productId:own.productId,displayName:productName(own.productId),status:own.status,exception:own.exception,evidenceId:own.evidenceId,caveat:caveatFor(own)}):null,
  unlisted:Object.freeze(own?[]:UNLISTED_PRODUCT_NOTES.filter(r=>ids.has(r.evidenceId)&&r.products.includes(scope.productId)).map(r=>Object.freeze({evidenceId:r.evidenceId,displayName:productName(scope.productId),text:r.text}))),
  alsoNamed:Object.freeze([...new Set(refs.flatMap(s=>ALSO_NAMED[s.id]?.[cls]||[]))]),
  planAdoptionVerified:false});
}
validateProductPreferences();
