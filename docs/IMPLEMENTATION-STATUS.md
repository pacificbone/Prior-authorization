# Implementation status — November 15, 2026 (Hawaiʻi policy day)

Branch `claude/determined-faraday-grbpp3`, built on the unmerged draft PR #14 lineage; `main` is still at commit 79fc27a. This page reports five things **separately**, because a green test suite says nothing about payer-policy completeness, and a complete payer registry says nothing about HIPAA readiness. Dates follow the application's policy day (Pacific/Honolulu).

Everything below describes a **synthetic-data trial**. No exact-plan adoption, member eligibility, authorization approval, patient quote, medication order or PHI processing is asserted anywhere in the application.

## 1. Feature implementation

| Area | State | What exists / what does not |
| --- | --- | --- |
| Staff workup (insurer → plan → service → requirements → cost → packet → blank addendum) | Implemented, synthetic | Six numbered steps on one screen; payer-scoped plan lists; plan-year availability enforced; unsupported lines (Part D, federal/postal, delegated administrators) produce an explanation instead of a cost case. |
| Clinical addendum templates | Implemented | 68 templates (16 gel products, 14 bone-health products, 27 procedures, 1 cell product, 4 injections, 4 diagnostics, 2 therapy/DME) with scaffolds by service type; blank by design, completed only in an approved clinical system. |
| Payer evidence registry and verification worksheet | Implemented | 33 public references: 27 fingerprinted PDF snapshots and 6 web-document entries (the Noridian Medicare records), labelled differently on the printed worksheet. Documentation branches are scoped by request type and product. |
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
| `npm test` | 406 tests pass, including the server-hardening, deployment-gate, local-server, adapter, documentation-link and UHC line-isolation tests. |
| `npm run matrix:check` | Committed matrix documents match the registries for 2026-11-08 (now also run in CI). |
| `npm run build` and its guards | Build succeeds; `PATIENT_DATA_ENABLED=true` is refused; `WORKERS_CI=1` without `SYNTHETIC_ONLY_ACK=true` is refused. |
| `npm run test:browser` | 68 print/download/reset/mobile/lock flows pass against the local server with no external requests or data writes. |
| GitHub Actions "Verify trial application" | Green on every push to this branch through 3ddd75f (runs 289–293). |

What the tests do **not** establish: no live AI provider or Cuptomize call was made, and the 20-case clinical validation the handoff requires before any clinical rollout has not been performed (protocol and scoring sheet: [CLINICAL-VALIDATION.md](CLINICAL-VALIDATION.md)). Payer documents were re-fetched on November 15 from www.hmsa.com (PDFs via documents.hmsa.com and global-downloads.webdamdb.com), www.uhcprovider.com and www1.radmd.com; medquest.hawaii.gov is on the network allowlist but the site itself answers automated requests with 403, and medicare.gov is not allowlisted.

## 3. Payer policy completeness

The generated [coverage matrix](COVERAGE-MATRIX.md) is the authoritative statement. Counts for 2026-11-15:

| Status | Cells |
| --- | --- |
| REVIEWED (fingerprinted or reviewed source applies) | 213 |
| PARTIAL (directory entry, web document or incomplete reference) | 33 |
| LIVE FORMULARY (exact plan/year file lookup) | 12 |
| ROUTE ONLY (official PA route link, no criteria) | 815 |
| MISSING | 379 |
| n/a (line not sold or service not applicable) | 88 |

Register: 29 snapshots in [policy-source-checksums.json](policy-source-checksums.json) — 27 bound to their evidence records and 2 catalog-only extracts (HMAA formulary, MDX drug list). On November 15 every previously registered HMSA and UHC digest was re-downloaded and matched byte-for-byte, the HMSA Evolent joint-surgery matrix was re-bound after matching its registered digest, and nine documents were fingerprinted for the first time: UHC Surgery of the Knee (2026T0553JJ), Surgery of the Hip (2026T0503KK), Sodium Hyaluronate (2026D0081M), Evenity (2026D0080M), Denosumab (2026D0068U), Sacroiliac Joint Interventions (2026T0621P), Omnibus Codes (2026T0535XXX, CPT 64728) and the two HMSA Medicare Advantage hyaluronate documents.

Priority gaps that need payer-site access or documents this environment cannot reach:

Findings from the November 15 retrieval that change staff guidance:

- **Denosumab codes corrected.** The UHC denosumab policy code table lists Bildyos Q5162, Stoboclo Q5157 and Enoby Q5167; the catalog previously carried Q5157 for Bildyos and no code for Enoby or Stoboclo.
- **HMSA Medicare Advantage gel preferences differ from Commercial/QUEST.** MA prefers Durolane, Euflexxa, Gelsyn-3 and Supartz FX (Synvisc and Synvisc-One are non-preferred); Commercial/QUEST prefers Euflexxa, Synvisc and Synvisc One. The MA policy also states hyaluronates must be billed by a contracted Part B provider as a medical claim. The earlier directory-only record described the MA program as "Synvisc and Synvisc One" and has been replaced.
- **UHC and HMSA disagree on Jubbonti.** UHC prefers Bildyos, Enoby, Prolia and Stoboclo and typically excludes Jubbonti; HMSA Commercial/QUEST prefers Jubbonti.
- **UHC gel:** only Durolane, Euflexxa and Gelsyn-3 are covered (the policy says without prior authorization); the other brands are typically excluded.
- **UHC SI joint fusion:** proven only with a titanium triangular implant under InterQual criteria; other devices unproven. **UHC CPT 64728** (balloon-assisted or ultrasound-guided percutaneous carpal tunnel decompression) is unproven.
- **HMSA/Evolent scope:** the 2026 joint-surgery matrix lists hip, knee and shoulder codes only. SI joint fusion, carpal tunnel release and trigger finger are not Evolent-managed and go through HMSA's own PA code list.
- **UnitedHealthcare has three different preferred lists.** Commercial prefers Bildyos, Enoby, Prolia and Stoboclo (Jubbonti typically excluded). The Community Plan (QUEST) prefers Bildyos, Enoby and Jubbonti, with Prolia and Stoboclo non-preferred. Medicare Advantage step therapy prefers Jubbonti, Prolia and Stoboclo, and puts Evenity behind them. Gel differs too: Medicare Advantage prefers Durolane, Gelsyn-3 and Synvisc/Synvisc-One and makes Euflexxa non-preferred. Nine more UHC documents (six Community Plan, three Medicare Advantage) were fingerprinted for these lines.
- **UHC Medicare Advantage joint surgery** follows the Noridian LCDs (L36575 knee, L34163 hip) for Hawaiʻi, so the documentation standard is the same as Original Medicare; the authorization route and any delegate remain a separate check.
- **Reclast:** neither HMSA's medical specialty drug directories (#–L and M–Z) nor UHC's commercial medical and drug policy directory lists a zoledronic acid policy. This is a dated negative search, not proof that no authorization or coverage rule applies.

Gaps that remain:

- UHC InterQual thresholds (licensed) for knee, hip and SI joint surgery.
- HMSA's own rules for SI joint fusion, carpal tunnel release and trigger finger (the required-PA code lookup is an interactive tool, not a document).
- Kaiser, AlohaCare and ʻOhana: their public provider pages offer authorization lookup tools, manuals and code lists (already cataloged as routes) but no published procedure criteria documents; their clinical criteria are licensed (MCG or InterQual) or internal. Plan-specific Medicare Advantage rules for other MA payers.
- Med-QUEST member cost-sharing page (site refuses automated requests; needs a manual download).

Standing rules preserved throughout: PA code lists are not clinical criteria; a pharmacy formulary is not medical coverage; unverified stays blank or unknown; no approval or coverage is inferred.

## 4. HIPAA / PHI boundary and security

- The application is synthetic-only. The build guard refuses PHI or production flags; the release-boundary report is served by `/api/status`; no request bodies are logged; no patient upload, case persistence or ordering endpoint exists.
- **Repository history scan (all 18 refs, 238 commits, 364 blobs, every path ever committed):** no API keys, tokens, JWTs, private keys, PHI, member identifiers, contracted rates, payer PDFs or `.env` files were ever committed. Items to decide on: `.openai/hosting.json` carries an OpenAI static-hosting project id (not a credential) for an undocumented preview host; 229 historical commits carry the practice mailbox as git author (metadata only — set a GitHub no-reply address going forward); the branch's commit trailers carry an AI session URL (accept or squash at merge); README names the practice's EHR, integration and clearinghouse vendors.
- **Server hardening (November 8, committed on this branch):** formulary fetch timeout, 60-second negative cache and a per-isolate search limiter; Cuptomize bridge responses built from an allowlist with strict per-row typing (no zero or malformed amount can render as a price), https-only sources, ASC/office requests refused against a hospital file, the placeholder facility refused; validator-only error messages; Access key-refresh limited to one forced refetch per team per minute; preview-mode Host validation; Worker catch-all and uniform Lambda replies; `/api/status` reduced to provider, two configuration booleans, mode and PHI state; provider responses read through the bounded reader and the bundled-sample identity guard; build guard against unattended Workers Builds; `preview_urls:false` asserted by `npm run check`; Wrangler pinned to 4.158.0. See [CLOUDFLARE-TRIAL.md](CLOUDFLARE-TRIAL.md).
- Everything in [HIPAA-RELEASE.md](HIPAA-RELEASE.md) remains required before any PHI use: BAAs, managed identity and MFA, roles, protected persistence, durable audit, risk analysis and independent review. Code checks do not establish compliance.

## 5. Deployment

| Item | Status |
| --- | --- |
| Publishing path | Owner decision 2026-11-16: automatic publishing of `main` to the `prior-authorization` Worker through Cloudflare Workers Builds, production branch only, with `SYNTHETIC_ONLY_ACK=true` as a build variable. Every deploy runs check, tests and build through `wrangler.jsonc`. The manual `workflow_dispatch` workflow remains as a fallback. Dashboard settings not verified from here. |
| Cloudflare Workers Builds integration | Disconnected by the owner on 2026-11-16 and to be reconnected for `main` only (see [CLOUDFLARE-TRIAL.md](CLOUDFLARE-TRIAL.md)). Builds without the acknowledgment variable fail closed. |
| Worker name | Resolved 2026-11-16: `wrangler.jsonc` now uses `prior-authorization`, the existing Cloudflare Worker that holds the Access and bridge secrets. |
| Public hostname | Owner is putting the `workers.dev` address behind Cloudflare Access (in progress, not verified from here); `preview_urls` is false. |
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
