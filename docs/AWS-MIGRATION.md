# AWS migration design

The current trial has no server-side case database and no Cloudflare-specific domain logic. Migration does not require rewriting the evidence or letter engine.

| Layer | Trial | Intended AWS production implementation |
| --- | --- | --- |
| Web UI | Static same-origin HTML/CSS/ES modules | Private S3 origin with CloudFront; security headers and controlled cache behaviors |
| API | Native Request/Response handler | API Gateway HTTP API plus Lambda; `server/lambda.mjs` is the payload-v2 adapter |
| Authentication | Trial token for fixed-sample AI; no real cases | Cognito/OIDC, MFA, verified JWTs, server-side roles and per-case access checks |
| AI | Optional OpenAI or Bedrock adapter | Bedrock with a narrowly scoped execution role and approved model/region; or eligible OpenAI API configuration under BAA |
| Cases and source versions | Browser memory / encrypted file | Encrypted DynamoDB or relational storage; transactions/version checks and explicit tenant ownership |
| Documents | No uploads | Private S3 objects using KMS, short-lived authorized access, upload validation and malware processing where applicable |
| Keys and secrets | Local environment / Worker secrets | KMS and Secrets Manager; IAM roles instead of long-lived AWS access keys |
| Audit / security telemetry | Nonpersistent action-only session list | Protected audit storage, CloudTrail and appropriate application/security logs with PHI redaction |
| Recovery | User-owned encrypted export | Encrypted backups with retention, access isolation and tested restoration |

Verify the exact service features against the current AWS HIPAA service list, execute the required BAA and configure each service appropriately. This design is not an assertion that infrastructure is provisioned or approved.

## Code boundaries already present

- `shared/catalog.mjs`: current catalog and public policy provenance.
- `shared/domain.mjs`: plan matching, source freshness, evidence validation and deterministic letters.
- `shared/vault.mjs`: portable encrypted workspace file format.
- `server/api.mjs`: same-origin trial API, input boundary and provider orchestration.
- `server/ai.mjs`: provider adapters with a common validated evidence result.
- `server/worker.mjs`, `server/local.mjs`, `server/lambda.mjs`: hosting adapters.

The Lambda adapter rejects events without `requestContext.authorizer.jwt.claims.sub`. API Gateway must be configured with a real JWT authorizer and a Lambda invocation policy restricted to that gateway. Do not expose the function via an unprotected Function URL. The frontend Cognito login and JWT refresh flow is **not implemented** in this trial. `Authorization` is available for JWTs; `X-Trial-Token` separately protects sample AI calls during transition.

## Suggested release order

1. Deploy the same fictional-data workflow privately on AWS; verify OIDC login, token expiry, response headers, CORS/same-origin behavior and logging configuration.
2. Implement case access control, encrypted record/document stores, immutable source versions and durable audit events. Exercise cross-user access denials and restore recovery.
3. Add public payer source ingestion with version checks and staff review. Keep payer source-fetch jobs separate from patient data and do not allow arbitrary server fetch URLs.
4. Add authenticated clinical-note ingestion only after the PHI release review. Minimize identifiers sent to AI and keep model processing in approved service/region boundaries.
5. Validate the clinical workflow with staff and clinicians. Release one payer/indication/request type at a time; preserve unknown coverage instead of substituting a nearby plan’s rules.
6. Pursue a contracted formulary/real-time-benefit integration and separately authorized ModMed workflow. Do not label public policy retrieval as member-specific benefits or real-time e-prescribing support.

AWS account details, domain, identity provider, BAA and approved model are required before concrete infrastructure deployment. None were supplied or assumed during the trial build.
