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

Do not extrapolate the UHC commercial extracts to Medicare Advantage, Community Plan, a different payer, a pharmacy benefit or a particular employer plan. Policies may change at the same URL. This trial flags extracts after 90 days; it does not automatically detect remote changes. A clinician must review the full relevant policy and current product labeling before clinical use.
