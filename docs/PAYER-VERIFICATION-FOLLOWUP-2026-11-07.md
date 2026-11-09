# Payer verification follow-up — November 7, 2026

> Historical record of the November 7 state. Since then the evidence registry has grown to 18 records (8 fingerprinted PDF snapshots and 10 directory or web-document entries), the register in `docs/policy-source-checksums.json` holds 11 snapshots (8 bound, 1 pending re-verification, 2 catalog-only extracts), and the **HMSA joint-surgery utilization matrix digest listed below was de-linked from its evidence record on 2026-11-08** after the same digest was found copied onto unrelated records; it is pending re-download and re-verification and is printed as "not bound" on the staff worksheet. The other 2026-11-07 digests remain bound. Current counts and open items are in [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

This follow-up supersedes the inaccessible-document status in the earlier audit. The application remains a synthetic-only trial. No exact-member coverage, procurement, production release, merge or deployment is approved.

## Resolved or reduced blockers

**HMSA document retrieval:** Direct retrieval succeeded for the hyaluronate preference and clinical policies that the web reader could not open. Prolia and Evenity documents were also retrieved and checked against their actual titles, coverage lines, dates and relevant pages. The Prolia/Evenity fingerprints match the repository's earlier snapshots. PDFs remain outside the repository; only short manually written summaries, source identifiers, locations and SHA-256 fingerprints are committed.

**HMSA surgical source access:** The official [HMSA Evolent page](https://www1.radmd.com/all-health-plans/hmsa) exposes a public 2026 joint-surgery matrix and a July 2025 HMSA guideline compilation. Both were retrieved. The knee arthroplasty section is guideline 1763, PDF pages 58–72. This provides a public source for HMSA research, but the July 2025 guideline's adoption/supersession for a 2026 service still requires confirmation. A generic 2026 Evolent file was not substituted. Licensed UHC InterQual criteria remain outside this implementation.

**Supplier/reimbursement research:** The [UHC medical-benefit sourcing protocol](https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/UHC-Admin-Drug-Chart.pdf) was downloaded as publication PCA-1-26-01739-E&I-QRG_09102026. The downloaded document is newer than one web-reader extract at the same URL. This illustrates why URL equality alone is insufficient. For drugs/settings actually subject to the protocol, the designated pharmacy bills the medical-benefit drug and the provider bills administration only; excluded plan entities and state exceptions must be checked. No absence-from-list inference, supplier mandate or contracted acquisition reimbursement was invented for a specific PBJ member.

## Source register

Seven public references were represented in `shared/payer-policy-evidence.mjs` on November 7 and cross-checked against `docs/policy-source-checksums.json` (18 records today; see the banner above and the generated [coverage matrix](COVERAGE-MATRIX.md)).

| Reference | Reviewed version and location | Scope boundary |
| --- | --- | --- |
| HMSA Hyaluronate Products — Exceptions Criteria | January 1, 2026; pages 1–2; document 203275332 | HMO/PPO/QUEST medical-policy reference; preference does not establish pharmacy formulary status or procurement. |
| HMSA Hyaluronate Products — Clinical Policy | June 26, 2026; pages 1–3; document 203625776 | HMO/PPO/QUEST; initial, renewal and adverse-reaction switch branches differ. Do not reuse these clinical rules for MA. |
| HMSA Prolia and Biosimilars | April 1, 2026; pages 2–4; document 203599459 | HMO/PPO/QUEST; preferred-product exception and indication-specific branches remain distinct. |
| HMSA Evenity | December 19, 2025; pages 1–2; document 203599176 | HMO/PPO/QUEST; alternate initial branches and continuation review. Missing DXA comparator remains a clarification blocker. |
| HMSA joint-surgery utilization matrix | January 1, 2026; pages 1–4 and 6 | Primary/associated-code groupings; professional versus facility review remains separate. |
| HMSA-linked Evolent knee arthroplasty guideline | July 2025, revised November 2024; PDF pages 58–72 | Distinct TKA, partial and revision branches; current adoption/version still unverified. |
| UHC Commercial sourcing protocol | Publication code ending 09102026; page 1 and relevant drug/site table | Commercial-only general sourcing reference; the publication code is not treated as an effective date. |

HMSA drug sources are located through its [#–L directory](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) and [M–Z directory](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/). Temporary download query tokens are not committed. Source identity was checked against the downloaded content; a mismatched download was rejected instead of being used under a Prolia label. The snapshot checker now rejects wrong files or changed bytes for the expected source. A changed hash calls for renewed title/scope/version review; it does not prove that the new file is invalid.

## Implemented verification workflow

The staff addendum panel now displays matching public references after a valid service date, plan and treatment are selected. Matching respects payer, coverage line, benefit, product and published effective date where known. Overdue snapshots and the surgical version-confirmation requirement remain visible. The new payer verification worksheet prints source versions, document fingerprints, clinical evidence prompts and the unresolved plan, supplier and reimbursement checks. It accepts no patient data or clinical free text. Changing treatment clears the date and print content so a previous selection cannot silently carry over.

Reference retrieval and plan adoption are separate states. All public reference records have `planAdoptionVerified: false` and `orderingAllowed: false`.

The fulfillment resolver additionally requires:

- Exact payer, plan product, medication, benefit, coverage line, service setting, state and service date.
- A versioned policy with reviewed document fingerprint and bounded effective/review windows.
- Separate adoption evidence bound to that exact scope, policy ID/version and document fingerprint, plus its own dated source, fingerprint, reviewer and reference.
- A unique applicable record; duplicates, malformed records and unverified overlapping records fail closed.

Adoption verification still does not establish a patient's enrollment, benefit coverage, approval, provider participation, supplier contract or payment. Patient-specific and route-specific evidence remains separate. Pharmacy-benefit coverage cannot authorize buy-and-bill, while specialty-pharmacy supply can legitimately be billed under a medical benefit. Every offline result keeps ordering disabled.

The evidence/adoption modules are trusted offline review scaffolding. They are not an authenticated ingestion service, a signature/attestation authority or a live eligibility integration. No operative payer fulfillment or member adoption records have been populated.

## Security work completed

Cloudflare Access verification for the existing private rate bridge now requires a signed subject, strict integer token dates, coherent time windows, configured issuer/audience and a valid signature. It rejects unsupported critical JOSE extensions, malformed identity claims, oversized key material, duplicate key identifiers and excessive key sets. Key retrieval uses the configured issuer only, a timeout and redirect rejection. This does not configure workforce MFA or authorize clinical case access.

A release-boundary report was included in the status API at the time (since November 8 the unauthenticated `/api/status` reply is minimized to provider, configuration booleans, mode and `phiRelease:"blocked"`; the release-boundary module itself is unchanged and still enforced at build time). Every production control remains blocked until actually implemented and externally validated. Mutating the report or setting environment flags cannot grant PHI permission. The build now rejects attempts to enable patient data or label the artifact a production/clinical release. CI also verifies the negative PHI-build case. No patient upload, case persistence, policy upload or ordering endpoint was added.

[Cloudflare's JWT verification documentation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) informed the token validation. [HHS's Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html) describes administrative, physical and technical obligations; local code checks do not establish compliance.

## Validation

Counts in this section are the November 7 snapshot (commit c880cb9); the live totals are in [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

- 330 automated tests pass, up from 248 at the previous draft commit.
- 64 JavaScript modules pass syntax validation; the ordinary synthetic build passes.
- The actual build command with `PATIENT_DATA_ENABLED=true` exits unsuccessfully before generating artifacts, as required.
- All seven downloaded PDFs match the committed reference fingerprints; the mismatched download is rejected.
- Browser verification exercises all 67 addenda plus matching payer references, the payer verification worksheet, date/print reset, medical/pharmacy separation, mobile visibility and lock cleanup. No patient information is entered, no payer queries are sent, and no data-write or external requests are permitted in this test.

Reproduce ordinary checks with `npm test`, `npm run check`, `npm run build` and the existing `npm run test:browser` instructions. For an independently retrieved public file, use `node scripts/verify-policy-snapshot.mjs SOURCE_ID PUBLIC_PDF_FILE`. This checks identity against the curated snapshot, not current member applicability. Keep payer PDFs and extraction/preview artifacts outside the repository and public build.

## Blockers that still require outside evidence or infrastructure

| Requirement | What remains necessary | Program behavior now |
| --- | --- | --- |
| Exact-plan adoption | Exact product/plan documents and applicable dates linking the member's adopted benefit to the policy version. Do not supply patient identifiers to this trial. | Adoption unverified; ordering blocked. |
| Supplier and reimbursement | Applicable PBJ/payer contracts, supplier/site/network permissions, drug versus administration payment, authorized exceptions and cost sharing. | General public sourcing guidance only; no contracted rate or acquisition permission inferred. |
| Surgical rules | Current HMSA adoption/supersession confirmation and licensed/delegated criteria for other payers, including UHC InterQual when applicable. | Public HMSA sources available; no completed clinical-criteria certification. |
| Production security | Managed identity/MFA and access lifecycle, roles/practice isolation, protected persistence/backup, durable protected auditing and tested recovery. | Synthetic-only; private pricing authentication hardened but no patient-data service. |
| Practice/vendor release | Signed and scoped BAAs, risk analysis, device controls, incident response, retention procedures and independent security/clinical review. | Production release blocked; see HIPAA-RELEASE.md. |

None of these remaining requirements can be closed by an unverified checkbox, a public formulary entry or an environment switch. No deployment or merge is part of this follow-up.
