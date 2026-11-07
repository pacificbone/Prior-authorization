# Staff workup — one payer, one plan, one service

**Pacific Bone & Joint · November 7, 2026 · synthetic trial / no PHI clearance**

The default app homepage is now **Staff workup**. Prior modules remain available only under **Advanced reference tools**, not as competing navigation paths.

## Five steps for front-desk / authorization staff

1. **Insurance first:** Choose the actual carrier (e.g., HMSA, UHC, Kaiser, UHA, Curative, AlohaCare, Aetna, Cigna, Anthem, VA, TRICARE, traditional Medicare, or an administrator). Choose the year. The next dropdown shows **only source pathways belonging to that insurer**, with no payer-crossing possibilities. Aetna, Cigna, and Anthem public plan pages are official links, not full imported plan formularies. Some choices are plan families; when a group, network, Part D contract, employer or PBM has not been verified, the screen explicitly says so. Do not interpret the family as the exact member product.
2. **Select the service:** Search medication, generic, orthopedic operation, imaging or injection. The service catalog includes primary/revision THA/TKA, partial knee, MACI, office carpal and trigger releases, meniscus root/BEAR/ACL, SI fusion, peripheral nerve stimulation, cryoneurolysis/genicular RFA, gel injections, PRP/BMAC/A2M, joint preservation, osseointegration, osteotomy, PT, DME, and common bone-health and postoperative drugs. Codes are candidates only. Procedures with no validated coding display a warning, not an invented CPT.
3. **Formulary / PA:** For an **exact, public 2026 pharmacy source**, staff can search the actual plan's published drug formulation, tier and PA/ST/QL flags. Four public exact-plan lookups currently exist: HMSA QUEST, UHC Hawaiʻi QUEST, Kaiser Hawaiʻi QUEST and one Kaiser Platinum Marketplace plan. Other medication plans remain **source-linked or partial**; they do not return invented “covered”, “excluded”, “preferred” or “no PA required.” **Medical-benefit drugs are not the same as pharmacy coverage.** For reviewed medical policies, display criterion references, preferred-product caveats and actual source links, not approvals. Procedures show available payer medical-policy / code-list routes scoped by payer and line. Original Medicare Part B is not a Part D formulary, and a PDP cannot authorize a hip replacement. VA is not shown as an HMSA plan.
4. **Patient costs:** In the same workflow, review surgeon professional allowed amount, facility allowed amount, anesthesia, gel product or cellular implant and optional separately billed services. Enter actual payer-allowed prices or dated quotes and verify deductible remaining, coinsurance/copay, *remaining* applicable medical out-of-pocket limit, network, facility and secondary coverage. Unverified **is blank**, not zero. A conditional scenario only appears when required figures are entered, and is never a verified patient quote. Original Medicare inpatient Part A benefit-period calculations are not approximated with outpatient percentages. For medical versus pharmacy medications, cost caps are not interchangeable.
5. **Documentation packet and patient explanation:** Check that each required record has been *located*, without assuming the chart supports it. Download an insurer/product-specific authorization worksheet including the source, relevant criteria, evidence placeholders, procedure codes where validated, and remaining verification items. A patient explanation script covers what is still unknown. Neither output is a completed patient letter, payer submission, claim, benefit quote or clinical fact extraction. **No patient names, member identifiers, birth dates, phone numbers or clinical notes may be pasted into the trial.** Enter real patient data only in ModMed or another HIPAA-approved system.

## Plan and source guardrails

- Selecting payer **A** cannot load a formulary, source or policy from payer **B**. Switching payer or year clears the previous plan, drug lookup results, costs and checkmarks. Switching the procedure or the medical/pharmacy benefit clears plan-dependent financial and coverage assumptions as appropriate.
- Every indexed live formulary source has an exact published plan ID, year and payer. Even a matching source entry is not member eligibility, authorization approval or final payment.
- MDX and HMA/Verdegard are delegated administrators, **not** universal formularies. The underlying health plan and employer/group/PBM must be identified first. Workers-comp depends on claim acceptance and administrator.
- Hawaiʻi ʻOhana QUEST plan membership ends December 31, 2026. Its 2026 source does not appear as a 2027 QUEST choice; verify the member's new plan.
- Out-of-area Blue Cross / Anthem home-plan benefits cannot borrow HMSA's formulary because care occurs in Hawaiʻi. The issuer, home state and product must be verified.
- Policy-only (clinical criteria), code-list-only (PA required), pharmacy formulary, medical benefits, authorization approval and patient cost are **five different facts**. None implies the others.
- A source that has not been imported is explicitly labeled **not verified**, not excluded. Missing plan data is never filled using an unrelated insurer's document.

## What is connected today

- Official source directory across payer programs, including public-source links for Hawaiʻi carriers.
- Four plan-validated public pharmacy machine-readable files from 2026, subject to availability and schema checks at runtime.
- Reviewed HMSA/UHC medication medical policies and selected payer procedure policy/code routing sources.
- A clinician-review template with record-location checklists.
- An itemized **staff-entered** cost scenario with a surgeon/facility distinction.

**Not connected yet:** a complete 2026/2027 statewide multi-payer formulary, authenticated PBM and medical-benefit eligibility queries, per-member deductible/OOP accumulators, actual member-specific prices, real payer PA submission/response, ModMed clinical records, production PHI approvals, or all proprietary criteria (including InterQual). The Cuptomize practice reimbursement/medical facility price data exists separately in a private repository and **has not been copied or publicly exposed**. A secure, rate-scoped source adapter is required for using that data automatically.

## Verification requirements for a future clinical release

First obtain HIPAA-cleared architecture and BAAs, insurer/credentialed portal access, audit trails and role restrictions, source version control, eligibility and claim benefits, plus authenticated submission. A real patient quote must be reviewed by the billing/financial counseling team. Clinical evidence and appeals need clinician approval. The synthetic trial cannot be made PHI compliant by adding a password or browser storage alone. See [HIPAA release requirements](HIPAA-RELEASE.md).

## Maintenance

- Source program directory: `shared/hawaii-plan-sources.mjs`
- Plan/payer matching and workup: `shared/staff-workflow.mjs`
- Core and peripheral procedure/medication list: `shared/orthopedic-procedures.mjs`, `shared/staff-service-catalog.mjs`, `shared/catalog.mjs`
- Cost estimator: `shared/patient-cost.mjs`
- Main staff screen: `public/staff-page.mjs`
- Tests: `tests/staff-workflow.test.mjs` and `tests/staff-ui.test.mjs`
