# Cloudflare synthetic trial deployment

This document describes an **optional, manually triggered deployment**. It has not been executed in the practice's Cloudflare account. No Cloudflare API tokens, account IDs, Access policies, or enterprise BAA status were available for verification. No real patient information may be entered.

## Deploy with GitHub Actions

1. Create a Cloudflare API token scoped to Workers edit/deploy for the intended account. Do not commit it.
2. In the GitHub repository's `synthetic-trial` environment (or repository secrets), set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Consider GitHub environment approval requirements for deployment.
3. Open **Actions → Deploy Coverage Desk synthetic Cloudflare trial → Run workflow** and explicitly confirm the fictional-data acknowledgment. It does not run on push.
4. The workflow runs syntax validation, automated tests, and a static asset build before `wrangler deploy` (pinned to an exact Wrangler version). It exports `SYNTHETIC_ONLY_ACK=true` into the build step from the acknowledged input.
5. After deployment, independently verify the URL, TLS, access restrictions, safe response headers, and that AI is disabled by default. Never use a real patient record to test. Set the two Access secrets (see "The Worker enforces Access itself") before the first deploy, or the Worker answers 503 to everything.

## Automatic publishing from `main` (owner's chosen path, 2026-11-16)

The owner chose automatic publishing: every merge into `main` is published to the `prior-authorization` Worker by Cloudflare Workers Builds. The repository enforces the safeguards; the dashboard settings below are the owner's to make and have not been verified from here.

Workers & Pages → `prior-authorization` → Settings → Builds:

1. Connect the GitHub repository and set the production branch to `main`.
2. Turn **off** builds for non-production (preview) branches, so feature branches never publish.
3. Deploy command: `npx wrangler deploy`. Leave the build command empty or set it to `npm ci`; `wrangler.jsonc` already makes every deploy run `npm run check && npm test && npm run build` first, so a failing test stops the publish.
4. Build variable `SYNTHETIC_ONLY_ACK` = `true`. Workers Builds sets `WORKERS_CI=1`, and `npm run build` fails closed when that is set without this acknowledgment. Removing the variable is the off switch for automatic publishing.

Also protect `main` in GitHub (pull request required, the `test` and `browser` checks required) so nothing reaches the production branch unreviewed. `preview_urls` is false in `wrangler.jsonc` and `npm run check` asserts it. The manual GitHub workflow above remains available as a fallback.

## Exposure and access configuration

The checked-in Wrangler configuration provides a `workers.dev` hostname by default, which may be public. This GitHub workflow **does not** configure Cloudflare Access, disable that hostname, install a private custom domain, or verify that only PB&J staff can open the result. The Worker itself refuses every request without a valid Access JWT (next section), but the Access application, its identity policies and the two Access secrets still have to be created by the account owner.

For a staff-only trial, establish an Access-protected custom hostname and identity policies, test that unauthenticated users are denied, and disable alternate public Worker hostnames/routes. Configure and validate the Worker routing with the Cloudflare account owner *before* claiming the app is private. The trial remains **fictional-data only** even when Access is configured.

## The Worker enforces Access itself

`wrangler.jsonc` sets `REQUIRE_ACCESS` to `"true"`. With that value the Worker verifies the Cloudflare Access JWT (the `Cf-Access-Jwt-Assertion` header or `CF_Authorization` cookie: RS256 signature against the team's published keys, issuer, audience, expiry and a signed subject) on **every** request — every asset as well as `/api/*` — before serving anything. A hostname or route that the Access application does not cover therefore still serves nothing to a signed-out browser.

- The owner must set two Worker secrets: `npx wrangler secret put ACCESS_TEAM_DOMAIN` (for example `yourteam.cloudflareaccess.com`) and `npx wrangler secret put ACCESS_AUD` (the Access application's Audience tag, from Zero Trust → Access → Applications → the app → Overview). Neither is committed.
- If either secret is missing or malformed, every request answers **503** with a JSON error and nothing is served. This is deliberate: a deploy without the secrets fails closed instead of going public.
- A request without a valid Access JWT answers **403** with a JSON error. Only an explicit `"false"` turns the gate off. An unset or empty `REQUIRE_ACCESS` (for example a var deleted in the dashboard, or an `env.<name>` stanza that does not repeat `vars`, since Wrangler does not inherit them) and anything other than `"false"` or `"true"` (for example `"TRUE"` or `"yes"`) are treated as a misconfiguration and answer 503. Gate replies carry the header `X-PBJ-Gate: access`, which is how the page tells them apart from a route's own errors.
- Local development (`npm start`, `server/local.mjs`) does not use the Worker, so the gate does not apply to it. `wrangler dev` reads `wrangler.jsonc`, so put `REQUIRE_ACCESS=false` in an uncommitted `.dev.vars` for it; the Worker tests pass `"false"` explicitly. `/api/status` reports `accessRequired: true` when enforcement is on.
- Access service tokens carry no email claim and are refused; only signed-in staff sessions pass.
- To test after a deploy, open the site in a private (signed-out) window: Access should send you to its login page; then call the `workers.dev` address and any other route directly with `curl -i` and confirm a 403 JSON reply and no HTML. Sign in as staff and confirm the app and `/version.json` load.

The staff rate bridge keeps its own Access check as a second layer.

## Build version and legacy tools

Every build writes `dist/version.json` with `commit` (from `WORKERS_CI_COMMIT_SHA` under Workers Builds, else `GITHUB_SHA`, else the checkout's short hash, else `unknown`), `builtAt` (ISO time of the build) and `policyAsOf` (the `asOf` date in `docs/coverage-matrix.json`). It is served behind the same Access gate. In local development `npm start` answers `/version.json` itself with the local short hash (or `local`), the server start time and the same policy date.

The "Advanced reference tools" — the note-paste letter builder, the AI evidence extractor and the encrypted vault — are **excluded from builds**: `public/index.html` carries `<meta name="pbj-legacy-tools" content="off">`, the build keeps it off, and `/api/ai/extract` answers 404 `Not available in this build.` unless `LEGACY_TOOLS` is `on` (`wrangler.jsonc` sets it to `off`). Only `npm run build -- --legacy-tools` (or `PBJ_LEGACY_TOOLS=on`) writes the meta as `on`, and only `npm start -- --legacy-tools` serves it on locally and opens the AI route to its own configuration checks. Do not deploy a legacy-tools build.

## Failure logging

Server catch blocks write one metadata-only line per failure: `{"event":"request_failed","route":…,"status":…,"error":"<error class>"}`. The route is one of the application's fixed paths (`/`, `/index.html`, `/version.json` and the four API routes); any other pathname is written as `/other` or `/api/other`. No error message, query string, request body, header, token or typed text is logged. Workers observability stays **disabled** (owner decision); if it were enabled, these lines are all it would surface from the application.

## Service and AI boundaries

The `wrangler.jsonc` trial configuration sets `AI_PROVIDER=none` and `AI_TRIAL_ENABLED=false`. The `/api/status` reply (behind the Access gate when `REQUIRE_ACCESS` is on) reports only `provider`, `configured`, `accessConfigured`, `accessRequired`, `pricingBridgeConfigured`, `mode` and `phiRelease`, all booleans or fixed labels, and client-facing errors no longer name server variables. To connect the synthetic AI extraction, the server operator sets `AI_PROVIDER` (`openai` or `bedrock`), `AI_MODEL`, the provider credential (`OPENAI_API_KEY`, or `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`), `AI_TRIAL_ENABLED=true` and a `TRIAL_ACCESS_TOKEN` of at least 32 characters as deployment secrets, never in the repository. Because the extractor is a legacy tool, it also needs `LEGACY_TOOLS=on` and a `--legacy-tools` build; the deployed trial uses neither.

`wrangler.jsonc` binds the synthetic Worker to the private `cup-optimize` Worker through the `CUP_PRICE_SERVICE` service binding. The `cup-optimize.internal` host used by the staff rate bridge is a non-resolvable placeholder that only names the request inside that binding; it is not a reachable URL. The three staff-pricing settings (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `CUP_PRICE_BRIDGE_TOKEN`) are Worker secrets set by the account owner and are never set by the workflow. The default synthetic deploy therefore depends on that private Worker existing in the same Cloudflare account; without the binding and secrets the staff rate route answers 503 and serves no fallback data. See `docs/PRIVATE-CUPTOMIZE-PRICING.md`. The manual workflow does not install provider credentials, turn on arbitrary-note AI calls, connect ModMed, create shared clinical storage, or make an application HIPAA compliant. Local AES-GCM saves are still under the end user's control.

For real ePHI, follow `docs/HIPAA-RELEASE.md`. In particular, confirm the executed BAA, exact covered Cloudflare products, any AI vendor contracts and retention controls, staff identity/MFA, server-side roles, clinical audit trails, key management, backup/restore, risk analysis, and independent review. A synthetic deployment must not be relabeled production by changing a runtime flag.

## AWS transition

The shared application code and API adapters remain separate from Cloudflare. The current AWS Lambda adapter is an architectural starting point, not a deployed authenticated EHR or member-data service. See `docs/AWS-MIGRATION.md`.
