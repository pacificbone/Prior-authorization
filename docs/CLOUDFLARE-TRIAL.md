# Cloudflare synthetic trial deployment

This document describes an **optional, manually triggered deployment**. It has not been executed in the practice's Cloudflare account. No Cloudflare API tokens, account IDs, Access policies, or enterprise BAA status were available for verification. No real patient information may be entered.

## Deploy with GitHub Actions

1. Create a Cloudflare API token scoped to Workers edit/deploy for the intended account. Do not commit it.
2. In the GitHub repository's `synthetic-trial` environment (or repository secrets), set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Consider GitHub environment approval requirements for deployment.
3. Open **Actions → Deploy Coverage Desk synthetic Cloudflare trial → Run workflow** and explicitly confirm the fictional-data acknowledgment. It does not run on push.
4. The workflow runs syntax validation, automated tests, and a static asset build before `wrangler deploy` (pinned to an exact Wrangler version). It exports `SYNTHETIC_ONLY_ACK=true` into the build step from the acknowledged input.
5. After deployment, independently verify the URL, TLS, access restrictions, safe response headers, and that AI is disabled by default. Never use a real patient record to test.

## Automatic Workers Builds are refused

If Cloudflare Workers Builds is connected to this public repository, it runs on every push to every branch with `WORKERS_CI=1` and would bypass the manual acknowledgment above. `npm run build` therefore fails closed when `WORKERS_CI` is set and `SYNTHETIC_ONLY_ACK` is not exactly `true`; only the gated GitHub workflow exports that value. Disconnect Workers Builds from this repository, or leave it connected knowing every automatic build will fail by design. `wrangler.jsonc` also sets `preview_urls: false` so no per-version preview hostname is published; `npm run check` asserts that setting.

## Exposure and access configuration

The checked-in Wrangler configuration provides a `workers.dev` hostname by default, which may be public. This GitHub workflow **does not** configure Cloudflare Access, disable that hostname, install a private custom domain, or verify that only PB&J staff can open the result.

For a staff-only trial, establish an Access-protected custom hostname and identity policies, test that unauthenticated users are denied, and disable alternate public Worker hostnames/routes. Configure and validate the Worker routing with the Cloudflare account owner *before* claiming the app is private. The trial remains **fictional-data only** even when Access is configured.

## Service and AI boundaries

The `wrangler.jsonc` trial configuration sets `AI_PROVIDER=none` and `AI_TRIAL_ENABLED=false`. The unauthenticated `/api/status` reply reports only `provider`, `configured`, `mode` and `phiRelease`, and client-facing errors no longer name server variables. To connect the synthetic AI extraction, the server operator sets `AI_PROVIDER` (`openai` or `bedrock`), `AI_MODEL`, the provider credential (`OPENAI_API_KEY`, or `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`), `AI_TRIAL_ENABLED=true` and a `TRIAL_ACCESS_TOKEN` of at least 32 characters as deployment secrets, never in the repository.

`wrangler.jsonc` binds the synthetic Worker to the private `cup-optimize` Worker through the `CUP_PRICE_SERVICE` service binding. The `cup-optimize.internal` host used by the staff rate bridge is a non-resolvable placeholder that only names the request inside that binding; it is not a reachable URL. The three staff-pricing settings (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `CUP_PRICE_BRIDGE_TOKEN`) are Worker secrets set by the account owner and are never set by the workflow. The default synthetic deploy therefore depends on that private Worker existing in the same Cloudflare account; without the binding and secrets the staff rate route answers 503 and serves no fallback data. See `docs/PRIVATE-CUPTOMIZE-PRICING.md`. The manual workflow does not install provider credentials, turn on arbitrary-note AI calls, connect ModMed, create shared clinical storage, or make an application HIPAA compliant. Local AES-GCM saves are still under the end user's control.

For real ePHI, follow `docs/HIPAA-RELEASE.md`. In particular, confirm the executed BAA, exact covered Cloudflare products, any AI vendor contracts and retention controls, staff identity/MFA, server-side roles, clinical audit trails, key management, backup/restore, risk analysis, and independent review. A synthetic deployment must not be relabeled production by changing a runtime flag.

## AWS transition

The shared application code and API adapters remain separate from Cloudflare. The current AWS Lambda adapter is an architectural starting point, not a deployed authenticated EHR or member-data service. See `docs/AWS-MIGRATION.md`.
