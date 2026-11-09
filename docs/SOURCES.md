# Source register

Checked November 6, 2026. Only short, manually written extracts are included; the original documents remain authoritative. No payer PDFs are redistributed. Additional Hawaiʻi source scopes and snapshot verification are documented in [HAWAII-PAYERS.md](HAWAII-PAYERS.md).

| Source | Version / scope used | Treatment in this app |
| --- | --- | --- |
| [UHC Evenity medical policy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/evenity-romosozumab-aqqg.pdf) | 2026D0080M; effective 2026-11-01; Commercial / Individual Exchange; initial postmenopausal osteoporosis therapy; page 1 | Brief criteria extract, medical benefit only; no formulary tier or member eligibility inferred |
| [UHC denosumab medical policy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/denosumab-prolia-xgeva.pdf) | 2026D0068U; effective 2026-10-01; Commercial / Individual Exchange; selected initial osteoporosis criteria and product-preference context; page 2 | Brief selected-scope extract; full source and plan type required for exceptions, other indications and continuation |
| [HMSA Essential formulary landing page](https://www.hmsa.com/prc/pharmacy/hmsa-essential-drug-formulary-and-coverage-codes/) | Landing page checked; linked downloadable formulary was inaccessible through retrieval | Directory link only; no imported drug tiers or preferred-product claims |
| [HMSA specialty medical directory M–Z](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/) | Directory only | No policy criteria assumed from a directory row |
| [Cloudflare US privacy FAQ](https://www.cloudflare.com/trust-hub/us-privacy-compliance/) | BAA availability | Deployment planning only; account/contract not checked |
| [AWS HIPAA service list](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/) | Current public list, updated 2026-10-15 | Architecture planning only; feature eligibility and BAA must be verified before deployment |
| [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) | Account/endpoint retention controls | `store:false` is not represented as a BAA or compliance guarantee |
| [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | Responses API JSON schema | Evidence extraction schema and server validation |
| [Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) | Request / response contract | Fictional-data provider adapter |
| [AWS SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv-create-signed-request.html) | Signing protocol | Web Crypto signer for a fixed Bedrock endpoint; no arbitrary provider URL |
| [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/binding/) | Worker asset binding and routing | Standard portable Worker configuration |
| [Noridian JE LCD L36575 Total Knee Arthroplasty](https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=36575&ver=21) | v21; revision effective 2025-11-06; contractor information lists Hawaiʻi; Billing and Coding Article A57685 | Directory-level Traditional Medicare reference with documentation prompts; web document identified by ID/version, no PDF fingerprint; Original Medicare only |
| [Noridian JE LCD L34163 Total Hip Arthroplasty](https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=34163&ver=33) | v33; revision effective 2025-11-06; Article A57683 | Same treatment as L36575 |
| [Noridian JE LCD L39810 Minimally Invasive Arthrodesis of the SI Joint](https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39810&ver=13) | v13; revision effective 2025-10-23; Article A59695 (01/01/2026 descriptor changes to CPT 27278/27279) | Transfixation technique only; incorporates L39462 criteria; Original Medicare only |
| [Noridian JE LCD L39462 Sacroiliac Joint Injections and Procedures](https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=39462&ver=9) | v9; revision effective 2026-03-05 | Prerequisite injection criteria cited by L39810 |
| [Noridian JE proposed LCD DL40456 Hyaluronic Acid Injections for Knee Osteoarthritis](https://www.cms.gov/medicare-coverage-database/view/lcd.aspx?lcdid=40455&ver=5) | Proposed; MCD page updated 2026-09-23; no effective date | Recorded as proposed / not in effect; never applied as current criteria |
| [CMS Medicare Coverage Database](https://www.cms.gov/medicare-coverage-database/search.aspx) search, 2026-11-09 | LCD/article keyword search and SAD exclusion list by HCPCS J0897, J3111, J3489 | Documented negative result for Noridian osteoporosis drug policies; dated, not a coverage guarantee |

The generated [coverage matrix](COVERAGE-MATRIX.md) shows, for every payer, coverage line and priority service, which of these sources (and the records in `shared/payer-policy-evidence.mjs`) actually apply.

Do not extrapolate the UHC commercial extracts to Medicare Advantage, Community Plan, a different payer, a pharmacy benefit or a particular employer plan. Policies may change at the same URL. This trial flags extracts after 90 days; it does not automatically detect remote changes. A clinician must review the full relevant policy and current product labeling before clinical use.
