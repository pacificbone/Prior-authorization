# Offline authorization audit follow-up — November 7, 2026

> Historical record of the November 7 state. Counts below (67 templates, 248 tests) are superseded; the current catalog, test totals and open items are reported in [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

Development only. Draft PR #14 remains the review boundary. No deployment, merge, patient-data ingestion, order, authorization submission or payer account access is part of this change.

## Implemented

- Fixed the escaped date expression that rejected ordinary ISO service dates. Strict calendar validation now rejects impossible dates and timestamps.
- Fulfillment matches exact payer, exact plan product, requested medication, benefit and service date. Plan-family precision is rejected. Effective dates, policy ID/version, reviewer, HTTPS source and a bounded review window (at most 90 days) are mandatory. No undated or open-ended range is assumed. Review must cover today and the service date. Duplicate or overlapping records, even unverified records, block selection; malformed dates in a matching scope block review.
- Separate procurement checks require scope- and policy-version-bound eligibility, approved PA or evidenced no-PA requirement, supplier/network/site, dose/units, cost-sharing and duplicate-claim checks. Buy-and-bill requires drug reimbursement evidence. Specialty pharmacy requires its designated supplier, allowed white-bagging and chain-of-custody evidence. Brown-bagging is unsupported. Both-permitted still requires choosing one route.
- Every resolver and procurement result keeps `orderingAllowed: false`. This offline trial has no authoritative patient-specific verification service. Evidence objects are review scaffolding, not an order API or authentication boundary.
- Expanded the catalog to 67 clinical templates: 16 gel products, 14 bone-health formulations/products and 37 additional procedures/services. Included the extra staff procedure catalog, denosumab products and bone-health medications. Each has a product/technique-specific documentation prompt. Codes remain candidates; unknown technique codes remain empty.
- Staff workup selects the matching template automatically, with an independent full library. Preview, text download and browser Print / Save as PDF use the same note generator. New UI accepts no patient identifiers, clinical free text or findings. Blank fields remain explicitly undocumented. Located-record checkboxes never become findings. Templates are completed only in an approved clinical system.
- Boolean/object/placeholder values do not satisfy clinical fields. Completion stays distinct from payer criteria, coverage, medical necessity and approval. Catalog output and legacy addenda carry synthetic labels. HTML output escapes untrusted values. Print content is cleared after printing, template/date changes and session lock.

## Authoritative public source review

These are research observations, **not exact-plan coverage or procurement records**. None was promoted into the fulfillment registry. Public policy and formulary sources cannot prove member eligibility or a supplier mandate.

| Official source | Review result | Operational boundary |
| --- | --- | --- |
| [HMSA current PA code lookup](https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/) | Source separates pharmacy authorization from medical code lookup and explicitly requires separate eligibility/benefit verification. Participating-provider context matters. | A code result cannot establish coverage or procurement. |
| [HMSA specialty pharmacies and lists](https://www.hmsa.com/prc/pharmacy/specialty-pharmacies-and-specialty-drug-lists/) | Page distinguishes medical and pharmacy specialty lists and Commercial, QUEST and Medicare Part B preference lists. It lists contracted specialty pharmacies. | A supplier directory does not establish an exact member/product supplier mandate or permission to buy and bill. |
| [HMSA medical specialty drug directory](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | Commercial/QUEST and Medicare Advantage hyaluronate entries are separate. Two linked Commercial/QUEST hyaluronate documents redirected to inaccessible downloads during this review. | Actual preference criteria and supply restrictions remain unverified. Do not infer rules from directory headings or effective-date listings. |
| [UHC sodium hyaluronate policy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sodium-hyaluronate.pdf) | Retrieved policy 2026D0081M, effective October 1, 2026, Commercial/Individual Exchange, pages 1–2. Durolane, Euflexxa and Gelsyn-3 have conditional clinical criteria; the document says PA is not required for that scope. Other listed brands are typically excluded, with plan/law-dependent review. Initial and repeat-course requirements differ. | These statements do not establish the member's adopted benefit, pharmacy formulary, supplier or reimbursement. Do not extrapolate to QUEST, MA or another payer. |

[UHC denosumab](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/denosumab-prolia-xgeva.pdf) was rechecked as 2026D0068U, effective October 1, 2026. The policy distinguishes Medical Necessity Plans from Non-Medical Necessity Plans and separates initial therapy from continuation. [UHC Evenity](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/evenity-romosozumab-aqqg.pdf) was rechecked as 2026D0080M, effective November 1, 2026; it addresses initial treatment and use beyond 12 months. Both are Commercial/Individual Exchange medical-benefit references. Neither establishes an exact member's adopted benefit or medication procurement route.

Review date is local Hawaiʻi date. Source URLs can change in place. Human review of the full authoritative version and exact plan adoption remains required; the offline review window does not detect remote revisions.

## Validation

- Baseline: 125 tests passed.
- Follow-up: 248 unit/integration/security tests passed, including all 67 templates; date boundaries; mismatched payer/plan/product/benefit; invalid/stale/future reviews; overlapping policies; denied/pending/expired authorization; wrong suppliers; prohibited bagging; duplicate claims; placeholders; escaped output; and synthetic-only procurement.
- Syntax validation and local build passed.
- Automated browser verification passed all 67 staff print flows, blank text download, selection/date handling, print-only visibility, mobile visibility and session-lock cleanup. No browser errors, external requests or data-write requests were observed in those flows. Print calls were intercepted; print media CSS was tested. This does not certify physical printer output or every browser.
- Existing tests continue to enforce disabled PHI mode even with an environment override, fixed-sample AI input, origin/token checks and encrypted vault boundaries.

## Remaining release blockers

1. Obtain exact member plan/product identifiers, adopted benefits, effective policy versions and supplier/reimbursement rules for each Hawaiʻi combination. Broad plan-family directory rows are insufficient. No live fulfillment policies are loaded; the staff page therefore remains unknown and ordering-blocked.
2. Resolve inaccessible HMSA documents and licensed/delegated surgical criteria. No unreviewed medical thresholds, product preferences or coverage exclusions were invented for missing sources.
3. Clinician review is still required for template content, current labeling, formulation/dose, billing units, procedure/device coding, individual clinical evidence and exceptions. Field completion is not clinical validation.
4. Keep synthetic-only mode. Managed staff identity/MFA, server authorization, protected persistence, durable audit logging, signed BAAs, risk analysis and production security/clinical validation remain open as described in HIPAA-RELEASE.md. No new PHI path or compliance certification was added.

## Reproduce checks

Run `npm test`, `npm run check` and `npm run build` on Node 22 or later. For browser verification, start `node server/local.mjs --port 3088` in a separate terminal, make Playwright available, then run `npm run test:browser`. Optional `PBJ_PLAYWRIGHT_MODULE` and `PBJ_CHROME_PATH` select an existing Playwright installation and browser. `PBJ_QA_DIR` saves a rendered blank Prolia PDF and panel screenshot outside the source tree. Browser tests deliberately send no patient data and do not contact payer APIs. Playwright is an optional development tool, not a production dependency.

## Subsequent blocker-resolution pass

The previously inaccessible HMSA hyaluronate files have now been retrieved and reviewed directly. Public HMSA/Evolent surgical sources were also obtained. See [the follow-up verification record](PAYER-VERIFICATION-FOLLOWUP-2026-11-07.md) for the updated source inventory, exact-plan adoption gate, supplier/reimbursement boundaries, security hardening and remaining external requirements. This supersedes the earlier retrieval blocker; it does not clear exact-member coverage or production release.
