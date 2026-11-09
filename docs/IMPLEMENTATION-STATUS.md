# Implementation status — November 8, 2026 (Hawaiʻi policy day)

Branch `claude/determined-faraday-grbpp3`, built on the unmerged draft PR #14 lineage; `main` is still at commit 79fc27a. This page reports five things **separately**, because a green test suite says nothing about payer-policy completeness, and a complete payer registry says nothing about HIPAA readiness. Dates follow the application's policy day (Pacific/Honolulu).

Everything below describes a **synthetic-data trial**. No exact-plan adoption, member eligibility, authorization approval, patient quote, medication order or PHI processing is asserted anywhere in the application.

## 1. Feature implementation

| Area | State | What exists / what does not |
| --- | --- | --- |
| Staff workup (insurer → plan → service → requirements → cost → packet → blank addendum) | Implemented, synthetic | Six numbered steps on one screen; payer-scoped plan lists; plan-year availability enforced; unsupported lines (Part D, federal/postal, delegated administrators) produce an explanation instead of a cost case. |
| Clinical addendum templates | Implemented | 68 templates (16 gel products, 14 bone-health products, 27 procedures, 1 cell product, 4 injections, 4 diagnostics, 2 therapy/DME) with scaffolds by service type; blank by design, completed only in an approved clinical system. |
| Payer evidence registry and verification worksheet | Implemented | 18 public references: 8 fingerprinted PDF snapshots and 10 directory or web-document entries, labelled differently on the printed worksheet. Documentation branches are scoped by request type and product. |
| Traditional Medicare (Noridian JE) | Implemented as web-document references | LCDs L36575, L34163, L39810 with L39462, proposed DL40456 marked not in effect, and a dated negative search for Part B osteoporosis drugs. No prior authorization exists for these services under Original Medicare; records support claim-level documentation only and never apply to Medicare Advantage. |
| Coverage matrix | Implemented, generated | `npm run matrix` writes [COVERAGE-MATRIX.md](COVERAGE-MATRIX.md) from the registries for 21 payers × their coverage lines × 44 priority services; `npm run matrix:check` and a test fail on drift. |
| Patient cost estimator | Implemented, fail-closed | Components follow the service type; payer and plan line must be consistent; Original Medicare OPPS facility and pharmacy-benefit deductibles are never pre-filled; every total carries a confidence label (assumption-only / staff-verified inputs / cash scenario) and is never a quote. |
| Public formulary lookups | Implemented, live reads | 12 exact plan/year machine-readable files (3 QUEST, 9 Kaiser Marketplace plan/years) fetched from allowlisted URLs at runtime; the HMSA QUEST key is a file plan key, not a HIOS ID. |
| Keragon workflow plan | Plan only | Generates a non-PHI draft for Keragon's builder from catalog records. Coverage Desk has **no** Keragon, ModMed or TriZetto connection; vendor-capability statements are dated as published on 2026-11-07 and not re-verified. |
| Cuptomize price evidence bridge | Implemented, **not activated** | Worker-to-Worker bridge returning public rate evidence only, behind Cloudflare Access, a service binding and a shared secret. Never autofills a price. |
| AI evidence extraction | Adapters only | OpenAI Responses and Bedrock Converse adapters exercised with mocked transports; restricted to bundled fictional samples. No live provider call has been made. |
| Encrypted local vault, idle lock, print flows | Implemented | AES-256-GCM / PBKDF2-SHA256 600,000 iterations; 10-minute lock; browser suite exercises all 68 addenda. |
| Live eligibility, PA submission, patient quotes, PHI storage, ModMed/Keragon/TriZetto connections | **Not implemented** | By design for this trial; see sections 4 and 5. |

## 2. Tests and verification

| Check | Result at the latest commit on this branch |
| --- | --- |
| `npm run check` | 84 JavaScript modules pass syntax validation; `wrangler.jsonc` keeps preview URLs disabled. |
| `npm test` | 404 tests pass, including the server-hardening, deployment-gate, local-server, adapter and documentation-link tests added on November 8. |
| `npm run matrix:check` | Committed matrix documents match the registries for 2026-11-08 (now also run in CI). |
| `npm run build` and its guards | Build succeeds; `PATIENT_DATA_ENABLED=true` is refused; `WORKERS_CI=1` without `SYNTHETIC_ONLY_ACK=true` is refused. |
| `npm run test:browser` | 68 print/download/reset/mobile/lock flows pass against the local server with no external requests or data writes. |
| GitHub Actions "Verify trial application" | Green on every push to this branch through 3ddd75f (runs 289–293). |

What the tests do **not** establish: payer web documents could not be re-fetched from the build environment (hmsa.com, uhcprovider.com, radmd.com and medquest.hawaii.gov return 403 through the proxy), so no PDF was re-fingerprinted on November 8; no live AI provider or Cuptomize call was made; the 20-case clinical validation the handoff requires before any clinical rollout has not been performed.

## 3. Payer policy completeness

The generated [coverage matrix](COVERAGE-MATRIX.md) is the authoritative statement. Counts for 2026-11-08:

| Status | Cells |
| --- | --- |
| REVIEWED (fingerprinted or reviewed source applies) | 61 |
| PARTIAL (directory entry, web document or incomplete reference) | 126 |
| LIVE FORMULARY (exact plan/year file lookup) | 12 |
| ROUTE ONLY (official PA route link, no criteria) | 873 |
| MISSING | 380 |
| n/a (line not sold or service not applicable) | 88 |

Register: 11 snapshots in [policy-source-checksums.json](policy-source-checksums.json) — 8 bound to their evidence records, 1 pending re-verification (the HMSA Evolent joint-surgery matrix, de-linked on 2026-11-08 after the digest was found copied onto unrelated records), 2 catalog-only extracts (HMAA formulary, MDX drug list).

Priority gaps that need payer-site access or documents this environment cannot reach:

- Reclast (zoledronic acid) medical policies for HMSA, UHC and Kaiser; Enoby and Stoboclo HCPCS codes.
- UHC commercial sodium hyaluronate policy 2026D0081M (reviewed on November 7 per the audit record but never entered the registry; UHC commercial gel stays PARTIAL), UHC Surgery of the Hip PDF, UHC Evenity and denosumab fingerprints.
- Commercial and Medicare Advantage policies for SI joint fusion, carpal tunnel release (including balloon 64728), trigger finger, partial knee and revision arthroplasty beyond HMSA/UHC knee.
- Kaiser, AlohaCare and ʻOhana medical policies for procedures; plan-specific Medicare Advantage rules for every MA payer.
- Re-download and re-fingerprint of the HMSA Evolent matrix.

Standing rules preserved throughout: PA code lists are not clinical criteria; a pharmacy formulary is not medical coverage; unverified stays blank or unknown; no approval or coverage is inferred.

## 4. HIPAA / PHI boundary and security

- The application is synthetic-only. The build guard refuses PHI or production flags; the release-boundary report is served by `/api/status`; no request bodies are logged; no patient upload, case persistence or ordering endpoint exists.
- **Repository history scan (all 18 refs, 238 commits, 364 blobs, every path ever committed):** no API keys, tokens, JWTs, private keys, PHI, member identifiers, contracted rates, payer PDFs or `.env` files were ever committed. Items to decide on: `.openai/hosting.json` carries an OpenAI static-hosting project id (not a credential) for an undocumented preview host; 229 historical commits carry the practice mailbox as git author (metadata only — set a GitHub no-reply address going forward); the branch's commit trailers carry an AI session URL (accept or squash at merge); README names the practice's EHR, integration and clearinghouse vendors.
- **Server hardening (November 8, committed on this branch):** formulary fetch timeout, 60-second negative cache and a per-isolate search limiter; Cuptomize bridge responses built from an allowlist with strict per-row typing (no zero or malformed amount can render as a price), https-only sources, ASC/office requests refused against a hospital file, the placeholder facility refused; validator-only error messages; Access key-refresh limited to one forced refetch per team per minute; preview-mode Host validation; Worker catch-all and uniform Lambda replies; `/api/status` reduced to provider, two configuration booleans, mode and PHI state; provider responses read through the bounded reader and the bundled-sample identity guard; build guard against unattended Workers Builds; `preview_urls:false` asserted by `npm run check`; Wrangler pinned to 4.158.0. See [CLOUDFLARE-TRIAL.md](CLOUDFLARE-TRIAL.md).
- Everything in [HIPAA-RELEASE.md](HIPAA-RELEASE.md) remains required before any PHI use: BAAs, managed identity and MFA, roles, protected persistence, durable audit, risk analysis and independent review. Code checks do not establish compliance.

## 5. Deployment

| Item | Status |
| --- | --- |
| Sanctioned deploy path | Manual `workflow_dispatch` in `.github/workflows/deploy-cloudflare-trial.yml`, gated by `synthetic_only_ack` and the `synthetic-trial` environment. Never run from this branch. |
| **Cloudflare Workers Builds integration** | Attached to this public repository and runs on every push to every branch, outside the gated workflow. It currently fails within a second (configuration stage: `wrangler.jsonc` names `pbj-prior-authorization-trial` while the Cloudflare Worker is `prior-authorization`; `dist/` is not committed). The build now fails closed whenever `WORKERS_CI` is set without `SYNTHETIC_ONLY_ACK=true`, so an accidental fix of that misconfiguration cannot auto-deploy. **Owner action:** disconnect Workers Builds or restrict it to the gated path. |
| Worker name | Mismatch between `wrangler.jsonc` and the Worker that holds the Access and bridge secrets; choosing the name is a deployment decision left to the owner (see [PRIVATE-CUPTOMIZE-PRICING.md](PRIVATE-CUPTOMIZE-PRICING.md)). |
| Public hostname | `workers_dev` is not disabled; an Access-protected custom hostname is required for a staff-only trial (owner decision; `preview_urls` is now false). |
| Private dependency | The synthetic Worker binds to the private `cup-optimize` Worker; that service and three secrets must exist in the same account before `wrangler deploy` succeeds. |
| OpenAI static preview | `.openai/hosting.json` describes a static copy of `dist/`; undocumented reach and status — confirm or retire. |
| AWS | `server/lambda.mjs` is an adapter starting point; Access verification and the pricing bridge are Cloudflare-specific and need adapters ([AWS-MIGRATION.md](AWS-MIGRATION.md)). |
| Deployments performed from this branch | None. |

## 6. Integration status

| Connection | Recorded status |
| --- | --- |
| Keragon ↔ ModMed EMA | connected (practice-reported, not verified here) |
| TriZetto clearinghouse / billing | in use (practice-reported, not verified here) |
| Keragon → TriZetto eligibility action | not verified |
| TriZetto electronic prior authorization (278 / FHIR PAS) | not verified — verify the agreement before relying on it; the staff panel phrases this as a check, not a capability |
| Optum authorization connector | not required; not verified |
| Coverage Desk ↔ Keragon live bridge | not connected |
| Cuptomize price evidence | implemented, not activated (Access application, service binding and shared secret required) |
| AI provider | adapters only; no live call |

## 7. Audit record (November 8)

A nine-lens audit (staff UI, payer/plan data, clinical criteria evidence, templates and coding, cost logic, security/HIPAA, secrets history, docs-vs-code, integration claims) produced 179 findings. Fixes landed in small commits on this branch:

| Commit | Scope |
| --- | --- |
| 570fffd, dd59eca, 7d70178 | PR #14 head repaired (missing comma, non-allowlisted UHC host), stale tests, CommonJS Playwright entry |
| 98bd3b5, a164efb | Coverage matrix generator, compact export, drift test |
| 5b01d2c | Noridian JE Medicare records, SI fusion codes, MACI cell-product stage |
| 8e9cb21 | Plan-year availability, payer aliases, PA routes, registry rows |
| fa4298b | Staff screen: honest cost hero, visible PA routes, ordered steps, safer resets |
| 6092199 | Templates by service type, stage-distinct MACI codes, trigger finger and SI fusion |
| 3ddd75f | Evidence register: fingerprinted vs directory-only records, scoped branches, catalog extracts |
| 1e48346 | Cost estimator consistency, components, confidence labels |
| bc31a72, 35eb873 | Keragon router and panel, documentation reconciliation, this status page, CMS OPPS cost tool |
| (next commit) | Server hardening batch listed in section 4 |

Findings not fixed here, because they need the practice's accounts, documents or decisions: everything in section 3's gap list, the Workers Builds / Worker-name / hostname decisions in section 5, the OpenAI preview host, the historical author-email exposure, and the 20-case clinical validation.
