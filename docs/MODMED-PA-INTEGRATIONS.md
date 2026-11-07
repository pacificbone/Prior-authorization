# ModMed + prior authorization vendor handoff

**Reviewed November 7, 2026. Synthetic trial only. No patient chart access, payer submission, or vendor connection is live.** Read with the HIPAA release checklist (docs/HIPAA-RELEASE.md).

## Routing inside PBJ Coverage Desk

The existing staff workflow remains: insurer -> plan/year -> service -> benefit channel -> payer criteria -> itemized costs -> documentation. The ModMed handoff now appears inside the Formulary / PA section. It does not create a second staff workflow.

| Selected request | First destination | Optional partner to evaluate | Guardrail |
| --- | --- | --- | --- |
| Pharmacy-benefit medication | ModMed EMA ePrescribing and Surescripts ePA / real-time prescription benefit | Develop Health medication automation and API | Actual PBM, medication and enrollment must be checked; none connected to Coverage Desk |
| Medical-benefit drug, injection or gel | Insurer/delegate medical benefit check, HCPCS/J code, dose/units, site and preference | SamaCare medical-benefit workflow with ModMed demographics/documents | Pharmacy formulary tier does not establish buy-and-bill coverage |
| Surgery or imaging: joint replacement, MACI, CTR/TFR, knee surgery, MRI | Payer medical authorization / revenue cycle or clearinghouse | SamaCare only after a live demonstration for exact orthopedic procedures | No published claim of universal surgical PA support |
| VA, TRICARE and workers compensation | Program referral, claim or designated authorization channel | None assumed | These are not HMSA commercial plans |
| Delegated MDX, Medigap, Original Medicare Part B used as pharmacy benefit, or Part D used for surgery | STOP: identify underlying primary coverage | None yet | Never borrow unrelated payer criteria or prices |

## Vendor capabilities evidenced by public documentation

**Develop Health:** [2026 ModMed overview](https://www.develophealth.ai/blog/prior-authorization-modmed) describes medication PA automation in EMA, evidence extraction, submission, follow-up and appeals. [Develop API introduction](https://docs.develophealth.ai/introduction) describes benefit verification, PA preparation/submission/status, bearer tokens and a separate sandbox account. These are vendor statements, not a PBJ connection or proven local Hawaiʻi coverage.

**SamaCare:** [Provider overview](https://www.samacare.com/providers) describes medical-benefit PA workflows and human review. [ModMed integration guide (Sept 11, 2026)](https://help.samacare.com/modmed-integration-guide) documents patient demographics, downloading ModMed documents into SamaCare and uploading SamaCare documents into **Patient Chart > Manage Attachments**. It states the ModMed integration order requires **$20 per provider per month**. That figure is an interface fee and is not a confirmed total vendor subscription. The guide does not establish a general-purpose surgical PA submission API or ModMed determination writeback.

**ModMed:** [ePrescribing](https://www.modmed.com/what-we-do/eprescribing/) supports medication ePA and real-time prescription benefits; participation varies by PBM. Review licensed features and exact vendor access. Read-only FHIR exports cannot be treated as writeback permission.

## Administrator activation checklist

1. Confirm active EMA ePrescribing, native ePA queue and real-time benefits for eligible PBMs, including pharmacy initiation and fallback routing.
2. For SamaCare, write **practicesolutions@modmed.com** with **ehr_accounts@samacare.com** cc'd. Ask for the order form, interface scope, the published $20/provider/month price, and whether ModMed EMA orthopedic use is supported. This app includes a pre-addressed email link. Share ModMed-issued integration credentials only through approved secure vendor handoff, never in GitHub, this app or plain email.
3. Ask Develop Health for a demo in ModMed, API sandbox, exact medication/PBM scope, pricing, BAA, human review rules, denial/appeal performance and evidence of PA status writeback.
4. For surgery/imaging, choose and verify an authenticated payer/RCM workflow that handles exact CPT/HCPCS, inpatient/outpatient/ASC, professional vs facility, denial and appeal requirements.
5. Before any patient data is transmitted: execute applicable BAAs, security review, access controls, MFA, audit logging, encrypted clinical data storage, limited secrets, signed webhooks and tested vendor authorization. Do not enable a PHI switch in the current trial.
6. Keep individual patient cost separate: use member eligibility, remaining deductible/OOP and **actual member-specific allowed amounts** for surgeon, facility, anesthesia, products and other billed lines. Published MRF/TiC benchmarks are never patient quotes.

## Future integration contracts, not yet implemented

- ModMed: authorized patient and encounter retrieval, approved document exchange/writeback, and signed-approval history.
- Develop Health: server-side benefit verification, PA preparation, clinician-review checkpoint, submission, status and webhook processing, after vendor sandbox validation.
- SamaCare: vendor-operated UI with documented ModMed demographics/document transfer; only build additional API adapters if SamaCare supplies a contract and supported API specification.
- Surgery: payer/delegate integration or clearinghouse for procedures; keep exact plan/program routing and separate physician/facility status when applicable.
- Status dashboard: not started, gathering evidence, ready for review, submitted, payer follow-up, additional information, approved, denied, appeal, expired. No “approved” label without verified payer response. Audit actor, source and decision reference without logging raw PHI.

## Vendor demo acceptance checks

- Can it identify the **exact Hawaiʻi insurer + plan + benefit/PBM** without cross-payer leakage?
- For Evenity/Prolia and gel injections: can it submit **medical-benefit**, J-code and unit-specific requests to the correct payer?
- For TKA/THA, MACI and carpal tunnel: can it actually request and track professional and facility PA, with denial/appeal and ModMed writeback? Require demonstration, not marketing.
- Can it show cited clinical evidence and require staff/clinician review before sending?
- Can it show member-specific estimated pharmacy price separately from surgery/facility costs?
- What are the exact security, BAA, retention, audit, delegated-user/API and fees?

**Nothing in this change submits a prior authorization or transmits PHI.**
