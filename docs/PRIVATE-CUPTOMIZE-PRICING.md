# Protected Cuptomize staff rate-evidence connection

**November 7, 2026. Not a member-cost quote and not cleared for PHI.**

The PBJ Prior Authorization **Staff workup** now includes a single **Cuptomize price evidence** section under the existing patient cost estimate. Staff select insurer, actual plan/source, procedure, facility and code. The app asks a **private** Cuptomize Worker for *source-labeled market evidence*, not for a patient's benefits.

### Two distinct amounts, never confused

- **Facility:** Imported Cuptomize hospital machine-readable standard charges for the *same exact hospital*, *selected insurer's published payer label*, *billing code* and *inpatient DRG versus outpatient CPT* setting. Where the source expresses percentage of gross charges or a P10/median/P90 distribution, the API preserves that methodology rather than inventing an exact dollar allowed amount. Hospital data do not provide ASC contracts.
- **Professional:** Curated Cuptomize commercial Transparency in Coverage (TiC) *network benchmark ranges* with plan label, rate observation count and source date. This is **not** proof of the surgeon's participating TIN, specific PBJ negotiated reimbursement or patient copay; a median is not a signed fee schedule.

The service does **not automatically copy** these candidate prices to the patient calculator. A defensible patient-facing estimate requires PBJ's actual contracted allowed amount, separately billed facility/anesthesia/implant/drug components, plan-specific copay/coinsurance, network, deductible balance, remaining medical OOP maximum, any other coverage and confirmation of benefit and authorization.

**No patient data in this trial:** never enter names, DOB, member IDs, claim numbers, diagnosis narratives, EHR notes, screenshots, prescriptions or real statements. The pricing route accepts only short allowlisted insurer/plan ID/year/procedure code, facility and setting.

## Architecture / authorization

```text
Browser (public synthetic-only staff UI)
    POST /api/staff/rates   — plan ID, procedure code, facility ID only
    ▼
PBJ Prior Authorization Worker
    Verifies signed Cloudflare Access JWT (team issuer, audience, expiry,
    algorithm, signature, staff identity, not a forgeable email header)
    Enforces same-origin + exact payer-owned plan + service code + setting
    ▼
Cloudflare same-account Service Binding CUP_PRICE_SERVICE
    Passes one server-only secret CUP_PRICE_BRIDGE_TOKEN
    ▼
Private cup-optimize Worker
    Verifies private bridge secret (or its own independently validated Access)
    Returns <=12 facility rows and <=8 professional market benchmarks,
    stamped 'patientQuoteReady:false', no member data
```

If any required identity or bridge setting is missing, the route returns **403/503**, not fallback public data.

## Deployment requirements — not yet performed

1. **Deploy Cuptomize first**, with the new `/api/staff-pricing/evidence` private route and refreshed **private Worker-only** rate evidence index; its source file is generated from existing Cuptomize machine-readable hospital and professional files during `npm run build`. Ensure Worker bundle stays within Cloudflare size limits. Source data or internal pricing should not appear in `dist/` static assets.
2. Create a long cryptographically random secret in Cloudflare Workers & Pages → `cup-optimize` → Settings → Variables and Secrets: **`STAFF_PRICE_BRIDGE_TOKEN`** as **Secret**. Use the same secret on the `prior-authorization` Worker as **`CUP_PRICE_BRIDGE_TOKEN`**. **Do not commit or paste the secret into GitHub, chat, frontend JavaScript or `wrangler.jsonc`.**
3. In Cloudflare Zero Trust, protect the Prior Authorization staff application with an Access application and appropriate staff group/MFA policy. Set two server **secrets** on its Worker: **`ACCESS_TEAM_DOMAIN`** (the *actual* `*.cloudflareaccess.com` team domain) and **`ACCESS_AUD`** (the actual staff Access application audience tag). Neither is populated by this PR. The **public static pages alone are not authentication**; server verifies the JWT.
4. Prior Authorization `wrangler.jsonc` declares `services:[{binding:'CUP_PRICE_SERVICE',service:'cup-optimize'}]`. Both Workers must be in the same account and the service must exist before deploying. `cup-optimize` is the binding/service name and `cup-optimize.internal` in `server/pricing.mjs` is a non-resolvable placeholder host used only to address the binding; neither is a reachable URL.
5. Verify live requests for common codes (27447, 27130, 64721, 73721) and actual facilities. Test invalid/expired/no Access JWT, invalid bridge token, cross-origin calls, wrong-plan IDs, mismatched CPT/DRG and unclassified rates. Staff should see *source evidence or unavailable*, never an unreviewed patient dollar total.

These steps require the actual Cloudflare account and security configuration; a passing GitHub build cannot assert they were activated.

## Explicit limitations and source QA

- Source rows may be old, lack recent refresh, include payer-labeled products that do not match a particular member group, omit modifiers and surgeon/anesthesia bills, or represent percentile/charge-methodology data instead of an allowed rate.
- Inpatient hospital facility rate requires **verified DRG**, not simply CPT 27447; Original Medicare Part A patient share uses benefit periods and cannot be inferred from a commercial DRG rate.
- An ASC fee cannot be inferred from the nearest hospital's outpatient cost. In-office services should not invent a facility fee.
- Self-pay and uncovered treatments require actual practice cash price, appropriate written estimate and potentially a formal CMS Good Faith Estimate outside this synthetic tool.
- Cuptomize professional benchmarks are **market intelligence**. For a PBJ contract estimate, establish actual participating practice TIN/NPI, payer/product, effective period, procedure code, modifier and POS with the billing team.
- A pharmacy formulary, medical policy, authorization-code checker, paid claim and member's plan benefit are distinct. Pricing is never proof of coverage or authorization.
- This has **no patient-specific eligibility**, benefits API, signed payer contract feed, ModMed patient chart, payment/claim portal, AI patient note ingestion or PA submission. HIPAA release gates remain blocked until appropriate BAAs, identity/access, auditing, storage and clinical sign-off are completed.

## Relevant source and test files

**Prior Authorization:** `server/access.mjs`, `server/pricing.mjs`, `server/api.mjs`, `public/staff-page.mjs`, `tests/staff-rates.test.mjs`.

**Private Cuptomize:** `scripts/build-staff-price-index.mjs`, `worker/private-data/staff-rate-evidence.json` (regenerated during build), `worker/staffPriceApi.ts`, `tests/staffPriceApi.test.ts`.

The current trial is appropriate only for inspecting public pricing data and modeling fictional examples. **Do not use it to quote an individual patient or submit real authorizations.**
