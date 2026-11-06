# Coverage Desk — Pacific Bone & Joint

A working **synthetic-data trial** for two clinical workflows:

1. Inspect a medication’s plan-specific formulary record and the separately scoped medical-necessity policy.
2. Build a clinician-reviewed authorization-support attachment using exact passages from the source note, with missing evidence clearly identified.

**This version is not cleared for PHI or patient submission.** No configuration flag enables patient-data processing. Local storage, a cloud account, encryption, or an AI vendor’s BAA alone does not make the application HIPAA compliant. See [the production release requirements](docs/HIPAA-RELEASE.md).

## Run on your computer

Requires Node.js 22 or newer. There are no application dependencies to install.

```bash
git clone https://github.com/pacificbone/Prior-authorization.git
cd Prior-authorization
npm start
```

Open **http://localhost:3000**. The normal server binds only to `127.0.0.1`. `npm run dev` binds to all interfaces for isolated preview environments; do not use that command on an untrusted network. The app runs without AI credentials.

Start in **Formulary explorer**, select payer, line of business and benefit, then choose a medication. **Try sample case** opens a completely fictional HMSA Evenity case with a selected qualifying pathway and linked evidence (or the UHC example when UHC is selected). Build a draft, review the facts and scope, then download text or use **Print / PDF**. Every trial export is marked synthetic and unsigned.

## What is implemented

- Responsive medication explorer with brand/generic search and explicit coverage unknowns.
- Separate medical-policy and exact-plan formulary records. No coverage inferred from a medical-necessity policy.
- Hawaiʻi payer/administrator profiles for HMSA, HMAA, HMA/Verdegard, MDX, UHA, UHC and Humana; separate carrier and benefit context for delegated or employer-specific rules.
- Four reviewed HMSA initial osteoporosis medical-policy records: Evenity and denosumab, with separate Commercial/QUEST and Medicare Advantage versions, alternative clinical pathways and drug-specific exception requirements.
- Five HMAA entries from the July–December 2026 OptumRx Premium pharmacy formulary. Staff must explicitly select the published list and verify plan adoption.
- MDX/UHC Medicare Advantage drug PA-list context, restricted to that carrier/line; the missing printed effective date is shown as unverified. A PA list cannot serve as clinical criteria or a formulary.
- Reviewed UHC Commercial/Individual Exchange initial-therapy extracts for Evenity and denosumab.
- HMA/Verdegard stays group-specific; the known EUTF source is supplemental coverage and is not generalized to primary plans. **HMSA pharmacy formulary drug tiers are not imported.** See [Hawaiʻi payer scope](docs/HAWAII-PAYERS.md).
- Staff source-entry form, JSON import/export, scope validation, effective/expiration dates, stale-source warnings and conflict blocking.
- Criterion-by-criterion note evidence, explicit missing/not-met states, deterministic letter drafts and review-gated text/print exports.
- Optional server-side OpenAI Responses and Bedrock Converse adapters. External AI is restricted to server-owned fictional HMSA/UHC sample IDs and returns validated exact quotations, not medical coverage decisions or invented narratives.
- Browser memory by default. Explicit encrypted local file or browser copy using AES-256-GCM, random salt/IV and PBKDF2-SHA256 with 600,000 iterations. Passphrases/keys are not persisted. Ten-minute inactivity lock clears active app state and DOM content; this is not a forensic memory erasure guarantee.
- No analytics, remote fonts, session replay, patient upload API, automatic claim submission or automatic email/fax.
- Local Node server, Cloudflare Worker configuration and an AWS Lambda API Gateway v2 adapter sharing the same application logic.

## Connect AI for the fictional trial

Copy `.env.example` to `.env.local` and configure **one** provider. Keep this file out of source control. Use a model actually enabled for your provider account; there is intentionally no guessed default model.

For OpenAI set `AI_PROVIDER=openai`, `AI_MODEL`, `OPENAI_API_KEY`, `AI_TRIAL_ENABLED=true` and a randomly generated `TRIAL_ACCESS_TOKEN` of at least 32 characters. Restart the server. For Bedrock set `AI_PROVIDER=bedrock`, `AI_MODEL`, `AWS_REGION`, AWS credentials, `AI_TRIAL_ENABLED=true` and the trial token. Temporary session credentials include `AWS_SESSION_TOKEN`; refresh them when they expire. In Lambda, use the execution role’s temporary credentials rather than long-lived keys.

In **Security & connection**, enter **only the trial token**. Provider keys never belong in the browser. Load the bundled sample and choose **AI extract evidence**. Editing its note or changing its medical scope disables the AI sample path. Local letters can still be drafted from fictional custom examples without an AI call.

The API takes only known `sampleId` and `policyId` identifiers, for example `{ "sampleId": "hmsa-osteoporosis-evenity", "policyId": "hmsa-evenity-cq-2025-12" }`. It rejects extra fields, arbitrary notes, unknown samples, custom sources, cross-origin requests and invalid tokens. `X-Trial-Token` is separate from any future JWT `Authorization` header. Limits are per process/isolate, not a distributed production rate limiter. OpenAI requests use `store:false`, foreground mode and no tools; those settings are **not** a substitute for the vendor’s BAA and eligible account/retention configuration.

Live provider calls were not made during development because no provider credentials were supplied. Both adapters were exercised with mocked transports. Bedrock signing was independently compared with the official AWS Smithy signer for a model ID and an inference-profile ARN; fixed regression vectors are included. Do not represent this as a connected live service until the configuration is tested in your account.

## Save and restore

**Encrypted file** downloads a `.pbjvault` file; **Save in browser** saves only ciphertext. Restore decrypts and validates on the device. Use a strong passphrase of at least 14 characters, stored according to practice policy. A lost passphrase cannot be recovered. Plaintext `.txt`, clipboard and printed/PDF attachments are outside the encrypted vault and must be handled appropriately.

Refreshing without an explicit save loses the session. The browser copy is single-device, not a shared practice database. This trial has no cross-user synchronization. Do not put patient data, credentials, screenshots of real notes or member identifiers into this public GitHub repository, issues or CI artifacts.

## Cloudflare trial deployment

This repository supplies a standard Worker rather than requiring a particular hosted-site product.

```bash
npm run check
npm test
npm run build
npx wrangler@4 login
npx wrangler@4 deploy
```

Deploying with the checked-in configuration leaves AI disabled. For a provider connection, set `AI_PROVIDER`, `AI_MODEL`, `AI_TRIAL_ENABLED` and the exact HTTPS `APP_ORIGIN` in the Worker environment. Set `TRIAL_ACCESS_TOKEN` and provider credentials with **Wrangler secrets** or the Cloudflare dashboard, never in tracked `vars`. All asset requests pass through the Worker for security headers. `dist/` contains public client/shared modules only; it contains no server credentials.

Use Cloudflare Access and disable alternate unprotected origins for a staff-only trial. This is not a PHI deployment: Cloudflare currently states that BAAs are available only to enterprise customers, and the exact product/service coverage must be confirmed contractually. No D1, R2, KV or Workers AI service is used for clinical records. See [Cloudflare’s compliance FAQ](https://www.cloudflare.com/trust-hub/us-privacy-compliance/).

Cloudflare deployment credentials were not supplied, so no production deployment was performed. The Worker configuration and shared adapter are included for a reviewable trial deployment.

## Private review preview

An optional private review deployment serves the same browser workflow with AI explicitly unavailable. It contains public sources and fictional examples only. The `--static-preview` build sets a public runtime marker that prevents calls to a missing API. Configure actual AI on the local Node server or your own Worker deployment; this review preview cannot be converted to PHI use through settings.

## AWS migration

See [AWS migration design](docs/AWS-MIGRATION.md). The domain/evidence engine, browser UI and encrypted file format are independent of Cloudflare. `server/lambda.mjs` adapts API Gateway HTTP API v2 events and refuses requests without a gateway JWT-authorizer identity. This adapter is a starting point, not provisioned infrastructure or a complete login system. The frontend JWT login/token flow still needs implementation before that authenticated AWS path is usable.

## Verify

```bash
npm run check
npm test
npm run build
```

Tests cover scope isolation, unknown benefits, stale/future/expired/conflicting sources, source-note edits, missing evidence, appeal release blocking, AI quote validation, arbitrary-note rejection, token/origin checks, provider failure handling, encryption tampering, provider transport contracts and gateway identity enforcement. The GitHub Actions workflow runs the same checks without provider credentials.

## Boundaries

- No live formulary/PBM/eligibility feed; published-list extracts and directory links do not establish a member’s benefits. Payers listed in the selector without imported records remain unknown.
- No ModMed integration, OCR/document upload, payer submission or outcome feedback feed.
- Seed criteria cover selected **initial osteoporosis therapy**, not all indications, renewals or appeals. Appeal drafts remain unreleasable until the applicable workflow is implemented.
- Clinical quote extraction does not establish medical truth, prescribing suitability or fulfillment of a criterion. A clinician must interpret every linked passage.
- No approval probability or payment guarantee is shown. No clinical benefit or denial reduction has been measured.

Source provenance is in [docs/SOURCES.md](docs/SOURCES.md). No real patient records or the supplied messaging screenshot were included in the source repository.
