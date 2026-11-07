# Cloudflare synthetic trial deployment

This document describes an **optional, manually triggered deployment**. It has not been executed in the practice's Cloudflare account. No Cloudflare API tokens, account IDs, Access policies, or enterprise BAA status were available for verification. No real patient information may be entered.

## Deploy with GitHub Actions

1. Create a Cloudflare API token scoped to Workers edit/deploy for the intended account. Do not commit it.
2. In the GitHub repository's `synthetic-trial` environment (or repository secrets), set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Consider GitHub environment approval requirements for deployment.
3. Open **Actions → Deploy Coverage Desk synthetic Cloudflare trial → Run workflow** and explicitly confirm the fictional-data acknowledgment. It does not run on push.
4. The workflow runs syntax validation, automated tests, and a static asset build before `wrangler deploy`.
5. After deployment, independently verify the URL, TLS, access restrictions, safe response headers, and that AI is disabled by default. Never use a real patient record to test.

## Exposure and access configuration

The checked-in Wrangler configuration provides a `workers.dev` hostname by default, which may be public. This GitHub workflow **does not** configure Cloudflare Access, disable that hostname, install a private custom domain, or verify that only PB&J staff can open the result.

For a staff-only trial, establish an Access-protected custom hostname and identity policies, test that unauthenticated users are denied, and disable alternate public Worker hostnames/routes. Configure and validate the Worker routing with the Cloudflare account owner *before* claiming the app is private. The trial remains **fictional-data only** even when Access is configured.

## Service and AI boundaries

The `wrangler.jsonc` trial configuration sets `AI_PROVIDER=none` and `AI_TRIAL_ENABLED=false`. The manual workflow does not install provider credentials, turn on arbitrary-note AI calls, connect ModMed, create shared clinical storage, or make an application HIPAA compliant. Local AES-GCM saves are still under the end user's control.

For real ePHI, follow `docs/HIPAA-RELEASE.md`. In particular, confirm the executed BAA, exact covered Cloudflare products, any AI vendor contracts and retention controls, staff identity/MFA, server-side roles, clinical audit trails, key management, backup/restore, risk analysis, and independent review. A synthetic deployment must not be relabeled production by changing a runtime flag.

## AWS transition

The shared application code and API adapters remain separate from Cloudflare. The current AWS Lambda adapter is an architectural starting point, not a deployed authenticated EHR or member-data service. See `docs/AWS-MIGRATION.md`.
