# Keragon-first prior authorization orchestration for PBJ

**Reviewed November 7, 2026. Design and synthetic app handoff only.**
The prior-authorization trial does not connect to Keragon, ModMed, TriZetto, Optum, a payer, or a live patient record; no patient information may enter Coverage Desk. The built-in **Copy workflow instructions for Keragon** button creates a plan/service-only blueprint for Keragon's workflow builder, not a working import file or submission.

## System boundaries

- **ModMed EMA:** clinical system of record, notes, orders, electronic prescribing and native pharmacy ePA where configured. The Keragon ModMed integration is a separate credentialed FHIR interface; not every ModMed feature is exposed over FHIR.
- **Keragon:** operational orchestrator for triggered workflows, branching, eligibility action, conditional PA submission, status monitoring, exception routing, staff alerts and human approval steps.
- **TriZetto in Keragon:** published **Submit eligibility request** action. A payer 270/271 eligibility response does not necessarily include the actual surgeon or facility allowed charges, accumulator balances or individual out-of-pocket cost.
- **Optum in Keragon:** published **Create authorization request**, **Get authorization status** and **Get authorization determination** actions. Existence of an action does NOT prove coverage of all Hawaiʻi insurers, specific CPT/HCPCS, drugs, sites, or professional/facility requests.
- **Coverage Desk:** sourced formulary/plan selection, medical policy references, insurer-specific documents, source-checklist and separate conditional surgeon/facility/other charges. It does not receive PHI, return a member-specific quote, submit a PA or use Keragon credentials.

Flow after security/procurement:
  ModMed Coverage / ServiceRequest event
    -> Keragon (exact payer/benefit match)
    -> TriZetto eligibility IF supported
    -> plan/medical-policy, source review and evidence collection
    -> staff/clinician approval gate
    -> Optum authorization IF the payer/service is supported; otherwise native ModMed ePA or verified payer portal
    -> payer-status poll and human exception queue
    -> confirmed result in approved system; member-specific financial counseling remains separate

## Set up Keragon ModMed

1. Request a Keragon integration from ModMed at **practicesolutions@modmed.com**. Keragon's setup guide instructs requesting **Firm URL Prefix**, **FHIR Username**, and **FHIR Password**. Confirm actual ModMed interface fees with ModMed, not with the previous SamaCare order form.
2. In the approved Keragon account, go to the ModMed connector and create its authentication using the ModMed-issued credentials. Never enter credentials into this public GitHub repository or Coverage Desk browser.
3. Check the exact approved ModMed scopes. Keragon's published ModMed FHIR guide includes Patient read/write; Practitioner read/search; Location read/search; MedicationStatement create/read/search/update; Appointment create/read/search/update; Coverage create/read/search/update; ChargeItem create/read/search; ServiceRequest read/search; Encounter read/search.
4. ModMed ServiceRequest is **read/search** in that guide. Do not assume that writing a PA determination, updating a clinical note, creating an eRx order, attaching an authorization document or changing EMA clinical status is permitted just because other ModMed resources have a write scope.
5. Choose a supported Keragon event trigger such as **Coverage created/updated** or **Service request created/updated**; alternatively use a manual queue. Confirm correct event semantics and no duplicate-trigger loops on coverage updates.
6. If an approved scope is missing, contact ModMed. Keragon's guide states additional resource approvals may take 2–3 weeks; that is a vendor estimate, not a guaranteed timeline.

Public source:
- https://help.keragon.com/hc/en-us/articles/26577409886098-ModMed
- https://www.keragon.com/integrations/modmed

## Keragon workflow branches

**A. Prescribed oral/subcutaneous retail pharmacy benefit (alendronate, celecoxib, apixaban, etc.)**

1. Confirm actual pharmacy-benefit administrator/PBM and exact medication, dose, form and pharmacy program.
2. Coverage Desk's verified public formulary records may support selection, but nonimported or plan-family entries remain unknown.
3. Route pharmacy ePA through an activated ModMed ePrescribing/ePA transaction or the specific PBM portal. Keragon's Optum *medical* authorization action is not proof of retail ePA compatibility.
4. Collect required documentation from the approved ModMed workflow and staff review. Track received ePA responses and follow-up tasks through approved integrations only.

**B. Physician-administered medications and viscosupplementation (Evenity, Prolia, gel)**

1. Distinguish medical benefit buy-and-bill from pharmacy benefit; match J/HCPCS code, exact gel brand, units, route, office/facility and delegated PA owner.
2. Verify insurer policy, step therapy, previous therapy evidence, product preference and medical necessity checklist.
3. Keragon can conditionally attempt an Optum PA request only if the payer, medical service and authorization route are confirmed supported with active credentials and a human approval gate. Otherwise route to the plan's official medical PA portal.
4. Keep clinic administration code and drug acquisition/products separate when estimating cost.

**C. Surgical procedures and imaging (THA/TKA, partial/revision joint replacement, MACI, cartilage, CTR/TFR, ACL/meniscus, SI fusion, MRI)**

1. Identify exact CPT/HCPCS, lateral side, place of service, surgeon/facility identifiers and whether separate professional/facility authorizations are required.
2. Match the exact Hawaiʻi carrier, contract, product and delegate. An out-of-area BCBS plan is not automatically an HMSA plan.
3. Collect clinical justification and supporting dated imaging/prior treatments. Require clinician approval.
4. Create and track PA in Keragon/Optum **only** for supported payer/service workflows. For others use existing payer/RCM portals while Keragon assigns tasks, due dates and alerts.
5. Verify final payer determination, reference number, expiration and site-of-service; do not mark as approved from workflow completion alone.

**D. Special programs and delegates**

- Workers' comp: verify accepting claim administrator, covered body part, accepted condition and treatment approval. Do not assume Optum supports the claim.
- Veterans Affairs and TRICARE: use the actual referral/program authorization process and approved vendor route; never display VA as an HMSA plan.
- MDX or another delegated administrator: must identify the underlying carrier/product and responsible decision maker before sending.
- Original Medicare medical Part B and Part D retail coverage are different products. Medigap is supplemental, not the PA source for a medical service.

## Activation gates (not completed by this repository change)

- Confirm practice's Keragon subscription, BAA, unique identities/MFA, access roles, compliance scope, and retention/incident arrangements. Keragon's October 2026 release added self-serve BAA signing for new accounts created from Oct 27; existing accounts require verifying their own agreement status.
- Verify ModMed FHIR partner integration in the actual practice account and approved patient/coverage/service-request scopes.
- Confirm TriZetto transaction enrollment/payer IDs, endpoint eligibility access and actual data fields. Do not infer allowed amounts or deductible accumulators from a coverage-active response.
- Confirm Optum authorization capabilities for **each** Hawaiʻi payer, medical/pharmacy benefit and particular drug/procedure. Create a fallback when unsupported.
- Configure secure, authenticated data exchange among live systems, PHI-minimized logs, replay/idempotency, scoped secrets, signed or validated callbacks and error retry queues. Do not send PHI to unapproved AI tools, general email, GitHub or public trial endpoints.
- Require separate staff approval to transmit payer PA and clinical approval for the underlying evidence. Record verified decision provenance, dates and payer reference. Require billing review of actual benefits before any patient quote.
- Test synthetic cases, then approved clinical sandbox cases for HMSA (commercial, QUEST), UHC, Kaiser, UHA, AlohaCare, Curative, traditional Medicare, Medicare Advantage, VA/work comp, and delegated products as available; verify negative cases, missing scopes and denial escalations.
- Keep the existing Cuptomize public facility/professional price evidence a **benchmark**, not a patient-specific allowed amount. Authorization and patient-cost estimation are two linked but separate decisions.

## Reusable prompt for Keragon's AI builder

On the **Staff workup** page choose insurer, plan, treatment and benefit channel, then click **Copy workflow instructions for Keragon**. Paste those synthetic instructions into the Keragon AI builder. The text changes with pharmacy, medical-drug, procedure, or special-program routing and explicitly instructs Keragon **not** to publish or submit any live workflow until the administrator signs off.

## Relevant official references

- Keragon ModMed setup: https://help.keragon.com/hc/en-us/articles/26577409886098-ModMed
- Keragon ModMed triggers/actions: https://www.keragon.com/integrations/modmed
- Keragon TriZetto: https://www.keragon.com/integrations/trizetto
- Keragon Optum: https://www.keragon.com/integrations/optum
- Keragon October 2026 release: https://help.keragon.com/hc/en-us/articles/40377130429842-October-2026
- Keragon HTTP client: https://help.keragon.com/hc/en-us/articles/19894107858578-How-to-use-the-HTTP-Client-action-to-make-custom-API-requests
- Keragon HTTP webhook trigger: https://help.keragon.com/hc/en-us/articles/26592306434578-Using-the-HTTP-Webhook-Trigger
- ModMed ePrescribing: https://www.modmed.com/what-we-do/eprescribing/

See docs/HIPAA-RELEASE.md for the wider application security release conditions.
