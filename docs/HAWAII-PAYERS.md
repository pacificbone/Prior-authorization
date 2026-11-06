# Hawaiʻi payer / administrator scope

Reviewed November 6, 2026. The app starts with HMSA. Organization selection is distinct from the actual carrier, exact plan, formulary and benefit channel.

| Organization | Implemented source-backed content | Still requires verification / integration |
| --- | --- | --- |
| HMSA | Separate initial Evenity and denosumab clinical-policy extracts for Commercial/QUEST and Medicare Advantage; selected clinical pathways; product-specific exceptions; formulary-variant and PA-resource directory | Exact member plan, exclusions, eligibility, full applicable policy and prescribing safety; pharmacy tiers have not been imported |
| HMAA | Five drug entries from the published OptumRx Premium July–December 2026 list; tier/restriction display; routing distinguishes OptumRx’s formulary role from RxBenefits medication review and HWMG medical-service resources | Confirm employer plan adopts this list; medical-benefit injectables cannot be decided from pharmacy tiers |
| HMA / Verdegard | Separate administrator profile; underlying carrier and exact employer/group code required for rule imports; official identity/EUTF source links | No universal HMA formulary established. The reviewed EUTF resource is a supplemental plan; obtain the particular group’s primary-plan/PBM documents |
| MDX Hawaiʻi | Delegated-administrator profile; underlying carrier required; published UHC MA drug PA-list context for selected drugs; Humana transition notice linked | Verify delegated group, service date, plan and current routing. The drug list’s printed effective date is absent, so applicability stays unverified. Obtain actual carrier/plan clinical criteria and pharmacy formulary |
| UHA | Official drug/medical PA lookup and reviewer-routing resources | No drug-level formulary or clinical policy extract imported yet |
| UHC | Separate Commercial/Individual Exchange initial Evenity and denosumab clinical-policy extracts | No substitution into Medicare Advantage or Community Plan; member-specific benefits remain unknown |
| Humana | Official pharmacy PA and medical PA-search links with MDX routing caution | Actual plan, current delegation and drug-specific criteria/formulary |
| Other selectable organizations | Devoted, AlohaCare, Kaiser, Curative, traditional Medicare and custom organization workflow | Selector availability is not a live integration or a claim that drug records have been loaded |

## Sources and provenance

- [HMSA medical drug policies #–L](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/): Evenity HMO/PPO/QUEST effective 2025-12-19 and Medicare Advantage effective 2025-06-27. The linked PDFs were downloaded and the relevant pages reviewed. The Commercial/QUEST source’s C.1.a prints “DEXA score -3.0” without a comparator; the app blocks release under that branch pending clarification. Other branches remain separate choices.
- [HMSA medical drug policies M–Z](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/): Prolia/biosimilars HMO/PPO/QUEST effective 2026-04-01 and Medicare Advantage effective 2026-10-01. Preferred-product and exception rules differ by version. The PDFs were reviewed; stable directory URLs plus version/page locators are provided rather than long-lived reliance on temporary document-download URLs.
- [HMSA formulary variants](https://www.hmsa.com/prc/pharmacy/formularies/) and [pharmacy PA resources](https://www.hmsa.com/prc/pharmacy/hmsa-pharmacy-benefit-manager-has-pharmacy-benefit-drug-prior-authorization-forms/).
- [HMAA prescription plan information](https://www.hmaa.com/healthplans/prescription-plan-info/), [OptumRx July 2026 formulary](https://www.hmaa.com/wp-content/uploads/2026/06/OptumRx-Formulary-List-07-2026.pdf), printed pages 4 and 40, and [HMAA provider forms/routing](https://www.hmaa.com/providers/forms-and-information/). `HMAA-OPTUMRX-PREMIUM-2026-H2` is the app’s internal source-list key, **not** an official member or group identifier. No absent drug is automatically labeled excluded.
- [Verdegard identity/EUTF FAQ](https://verdegard-hi.com/wp-content/uploads/2026/04/FAQ_EUTF_2026_FINAL.pdf), page 1, and [EUTF resources](https://verdegard-hi.com/eutf/). The app’s HMA label refers to Hawaiʻi Mainland Administrators / Verdegard, not HMAA.
- [MDX health-plan resources](https://mdxhawaii.com/health-plan-customer-service/) and its [published UHC MA drug PA list](https://mdxhawaii.com/wp-content/uploads/2026/05/2026-MDX-UHC-Drug-Prior-Authorization-List-Effective.pdf). J0897/J3111/Q5136/Q5157 entries were checked; no efficacy or coverage conclusion is inferred from their presence.
- [MDX Humana notice](https://mdxhawaii.com/wp-content/uploads/2026/01/Humana-Update-Letter-from-MDX-Providers-2026.pdf). The notice includes conditional transition language. The app asks staff to verify current delegation rather than hard-coding a permanent destination for every Humana member.
- [UHA drug and medical PA lookup](https://www.uhahealth.com/providers/online-prior-authorization-pa).

The PDF checksums in `policy-source-checksums.json` identify the public snapshots reviewed. The PDFs themselves are not redistributed. Public sources can change at the same URL; these records are manual extracts, not a background synchronization service.

## Clinical pathway handling

An authorization policy may accept **any one** of several clinical pathways, while requiring **all** elements within the chosen pathway. The app requires an explicit pathway selection and then constructs only that branch’s checklist. Conditional product-exception criteria are added for the requested drug. Every item still needs an exact source-note passage plus clinician interpretation. No numerical risk score is inferred from text, and no undocumented trial, contraindication, adverse event or absence is invented.
