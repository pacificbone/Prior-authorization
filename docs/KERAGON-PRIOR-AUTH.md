# PBJ prior authorization: existing Keragon + ModMed, TriZetto-first

**Updated November 7, 2026 | Synthetic Coverage Desk trial. This documentation does not establish a live PA integration or authorize PHI processing.**

## What PBJ already has (reported by the practice)

1. **Keragon is already connected to ModMed EMA.** Reuse the connection; do not request a second ModMed integration or new FHIR credentials unless testing shows an actually missing permission.
2. **PBJ already uses TriZetto for billing/clearinghouse services.** That fact does not prove TriZetto's Keragon eligibility action, separate prior authorization service, payer enrollment, or an automation API is included or activated.
3. **Optum is NOT a required component.** It is a separate healthcare technology/administrative service. Keragon advertises Optum create authorization, status and determination actions, but that is a possible optional route, not proof Optum is available or needed for PBJ.
4. **Coverage Desk remains synthetic-data-only** and has no Keragon/ModMed patient connection or authorization submission; it can copy a non-PHI, payer/service-scoped workflow blueprint for Keragon's AI builder.

## Clear division of responsibilities

| System | Actual/current role | Authorization use or unknown |
| --- | --- | --- |
| ModMed EMA | Source of clinical chart, medication ordering and insurance data | Prescriber-side pharmacy ePA if enabled for the PBM; current FHIR scopes and writeback must be checked within existing Keragon connector |
| Keragon | Already connected to ModMed per PBJ | Workflow triggers/logic, staff checklists, exceptions, documentation and follow-up; no assumption it itself determines coverage |
| TriZetto | Existing PBJ billing/clearinghouse vendor per practice | Keragon lists a **Submit eligibility request** action. TriZetto separately sells prior authorization products including 278 and FHIR-based CRD/DTR/PAS. PBJ subscription, payer participation and Keragon connection are unverified |
| Actual insurer/PA delegate | Final authority for clinical policy and authorization requirements | Use verified exact payer/product/benefit/policy and review before any PA filing |
| Optum | Optional separate connector; no PBJ account assumed | Do not add to the default workflow or assume need to buy it |
| Coverage Desk | Synthetic plan/drug/procedure reference and optional conditional cost worksheets | Not a PHI/EHR app; it is NOT a live ePA platform or a payer cost/benefit source |

Official documentation: [Keragon's TriZetto connector](https://www.keragon.com/integrations/trizetto), [TriZetto traditional PA portal](https://www.trizettoprovider.com/solutions/patient-engagement/prior-authorization), [TriZetto Provider Electronic Prior Authorization](https://www.trizettoprovider.com/interoperability-solutions/trizetto-provider-electronic-prior-authorization).

## The operational workflow to build

1. **Trigger:** Reuse existing approved Keragon–ModMed connection. A verified Coverage/ServiceRequest trigger or manual case queue starts authorization screening. Only read the resources that the actual connection is authorized to access.
2. **Identify plan:** Confirm carrier, exact plan/product/benefit, group/PBM/delegate and requested NDC or CPT/HCPCS, units, laterality and care setting. No HMSA/VA or other insurer cross-matching.
3. **Check eligibility:** First ask the existing TriZetto service if PBJ is enrolled in its Keragon real-time 270/271 workflow. If not, use the existing approved eligibility process. Eligibility does not prove PA requirements, insurer-allowed professional/facility charges, or deductible/OOP accumulators.
4. **Check PA rules:** Retrieve or have staff verify official, dated payer criteria for drug/medical benefit and CPT/NDC, step therapy, history and supporting documentation. Prevent unsupported plan-family entries from showing as a member-specific determination.
5. **Choose submission:**
   - **Retail pharmacy:** ModMed ePrescribing ePA or approved member PBM portal, *not* TriZetto medical PA or Optum by default.
   - **Office-administered Evenity, Prolia or gel:** Medical-benefit prior authorization with exact product, J code, route/units and setting. Check TriZetto's separately licensed PA service and payer coverage; use payer portal if unsupported.
   - **Joint replacement, MACI, CTR/TFR, ACL/meniscus, SI fusion, MRI, etc.:** Medical procedure PA through approved TriZetto 278/FHIR solution only if it is enabled and payer/claim support is verified. Otherwise use payer/delegated portal/RCM with Keragon task tracking. Verify surgeon *and* facility needs.
   - **VA, TRICARE, work comp or delegated MDX:** Verify their own program/claim/underlying carrier; do not use commercial clearinghouse shortcuts without evidence.
6. **Clinical approval:** Require staff to locate actual records in ModMed and clinician to approve accurate medical necessity documentation; never auto-send AI-drafted assertions without review.
7. **Track:** Store real payer submission reference and verified statuses: needs benefit confirmation, missing records, ready for review, submitted, payer follow-up, approved, denied, appeal, expired. Do not label "approved" from a workflow run.
8. **Patient cost estimate:** Separate from PA. Verify member eligibility/network, remaining deductible and OOP, actual surgeon and facility allowed charges, anesthesia/implants/products and applicable site of service. Public machine-readable or Cuptomize rates are benchmarks, not member quotes.

## What to check with your existing TriZetto contact

Because TriZetto has a PA product, **ask the current relationship manager before buying Optum**:

- Does PBJ currently subscribe to TriZetto **Prior Authorization Services**, the **278 electronic authorizations** product, or the newer **FHIR CRD/DTR/PAS** product? What is included in our current arrangement versus new cost?
- Does TriZetto accept electronic PA for HMSA commercial/QUEST/MA, UHA, HMAA, Curative, UHC, Kaiser, AlohaCare/ʻOhana, traditional Medicare when applicable, VA/TRICARE, and workers comp? Request a transaction-level list by benefit and exact plan/code, not a generic claims payer list.
- Is *Keragon's TriZetto integration* enabled in PBJ's account for eligibility? Its public connector advertises only one action, **Submit eligibility request**. Does TriZetto support an **approved API/service account or secure handoff** for PA status and submissions from Keragon? Do not invent endpoints without contract and vendor support.
- Are there distinct professional and facility authorization references for outpatient arthroplasty, MACI, carpal tunnel release, imaging and gel/J-code buy-and-bill? How are attachments and denials handled?
- What patient responsibility estimations and deductible/OOP accumulators can TriZetto actually verify for members? What is the source and freshness of the *allowed amount*, and can estimates distinguish surgeon/facility/anesthesia?
- What BAAs, HIPAA scope, audit access, approved test cases, per-transaction cost and staff permissions are required?

Do not interpret the size of TriZetto's **claims** payer network as equivalent to its authorization or patient-cost network.

## Keragon build / privacy boundary

Coverage Desk's **Copy Keragon workflow instructions** produces a synthetic prompt reflecting the selected public insurer/plan, medication/procedure and medical/pharmacy context. It explicitly tells the AI builder to reuse the current ModMed connection, avoid Optum as a required step, verify TriZetto capabilities, keep all live actions disabled and require human approval.

For a future PHI-enabled production integration: validate the existing Keragon BAA and ModMed scopes, TriZetto account agreements, role-based access, audit logs, encrypted service credentials, secure webhook origin/signature checks, duplicate prevention, state reconciliation, human approval and a documented HIPAA risk assessment. Do **not** connect this public synthetic trial to real records simply by setting a flag. See [HIPAA release requirements](HIPAA-RELEASE.md).

## Primary sources

- [Keragon ModMed](https://www.keragon.com/integrations/modmed)
- [Keragon TriZetto](https://www.keragon.com/integrations/trizetto)
- [TriZetto Prior Authorization](https://www.trizettoprovider.com/solutions/patient-engagement/prior-authorization)
- [TriZetto Provider Electronic Prior Authorization](https://www.trizettoprovider.com/interoperability-solutions/trizetto-provider-electronic-prior-authorization)
- [TriZetto payer list / supported transaction types](https://www.trizettoprovider.com/resources/payer-list)
- [Keragon Optum, optional reference only](https://www.keragon.com/integrations/optum)
