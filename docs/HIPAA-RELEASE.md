# PHI release boundary

This is a development handoff, **not a HIPAA certification, legal opinion or production release approval**. The practice must evaluate the actual system and its operations. PHI must not be entered into the current trial.

## Current data flow

| Data | Current handling | Boundary |
| --- | --- | --- |
| Public policy summaries | Static reviewed extracts; custom entries in browser memory | No automated claim that a source applies to a member |
| Fictional notes and drafts | Browser memory | No upload endpoint accepts them |
| Saved workspace | Explicit AES-GCM encrypted file or browser ciphertext | Password-derived key; no recovery service or shared record storage |
| External AI | Server-owned fixed fictional sample only | Extra request fields and custom notes rejected before any provider call |
| Exported text, clipboard, PDF | User-directed plaintext output | Outside vault protection; all exports marked synthetic |
| Session activity | Action names and timestamps in memory, no note content | Not durable, tamper-resistant or adequate for production auditing |
| Secrets | Server environment or deployment secret store | Browser receives no provider credentials |

Normal local hosting binds to loopback and validates the Host header. APIs require same-origin requests and a trial token for billable AI operations. The app applies CSP, no-referrer, no-store, frame blocking and content-type protections. It does not contact external analytics, fonts or session replay services. The trial uses client encryption, not a production medical-record retention system.

## Required production work

Before adding a PHI ingestion path or using actual clinical notes:

1. **Map data and vendors.** Include hosting, AI inference, backups, observability, DNS/CDN/proxy traffic, support access, exports and every subcontractor that may create, receive, maintain or transmit ePHI. Complete the required BAAs and verify exact service/feature scope. Customer-managed encryption does not remove a cloud business associate’s obligations.
2. **Use unique staff identity.** Implement managed sign-in, MFA, server-side authorization on every case operation, role definitions, account lifecycle, session expiry and tested tenant/practice isolation. A shared trial token is not a production identity system.
3. **Build protected persistence.** Use private encrypted storage, KMS-managed keys, limited service roles, controlled restore, retention/deletion policies and tested encrypted backups. Keep identifiers and free text out of URLs, metrics and general logs.
4. **Implement durable auditing.** Record actor, action, case reference, timestamp, authorization decision, policy version, evidence version, AI model/prompt version, export and reviewer approval. Protect audit records from ordinary user modification and monitor access without logging raw notes. Define retention based on applicable obligations and practice policy; do not invent a universal medical-record retention term.
5. **Harden AI.** Validate the BAA, retention configuration, model, region, endpoints and any cross-region inference/subprocessor flows. Do not enable tools, browsing, file stores or third-party telemetry by accident. Treat notes and payer documents as untrusted inputs. Validate structured output, fail closed, version prompts and require human review. `store:false` controls an API feature; it does not itself establish compliant retention.
6. **Harden the endpoint and devices.** Managed encrypted workstations, patching, screen lock, access restrictions, malware defenses and controlled backups/downloads. Review browser extensions, clipboard, print destinations and OS/cloud sync of exported documents.
7. **Test security and clinical workflow.** Threat modeling, dependency/static review, authentication and authorization tests, upload handling, prompt-injection cases, leakage tests, failure recovery and independent security review appropriate to deployment. Validate clinician interpretation of criteria and the reliability of extracted facts; do not infer clinical safety from quote matching.
8. **Complete practice operations.** Document risk analysis and management, access review, workforce training, incident/breach response, vendor management and release approval. Reassess when adding integrations or changing providers.

The current patient-data lock is deliberate. Releasing PHI requires implementing these controls and replacing the fixed-sample API with an authenticated, reviewed ingestion workflow, not changing a boolean environment variable.

## Hosting / AI facts checked November 6, 2026

- [HHS cloud-computing guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html): a cloud provider handling ePHI is generally a business associate even without the encryption key; appropriate agreements and safeguards are still necessary.
- [Cloudflare US privacy FAQ](https://www.cloudflare.com/trust-hub/us-privacy-compliance/): Cloudflare states it enters BAAs only with enterprise customers. Confirm the exact services covered by a signed contract before any PHI deployment.
- [AWS HIPAA eligible services](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/): eligibility is subject to the shared-responsibility model and appropriate configuration. A listed service does not certify the application. Confirm the executed AWS BAA and intended features at deployment time.
- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data): endpoint/features, account approval and retention settings matter under a BAA. Verify the current contract and the eligible account configuration. This implementation does not establish those prerequisites.

No vendor contracts or BAA status were verified in the user’s actual accounts during this build.
