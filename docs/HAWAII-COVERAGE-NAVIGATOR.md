# Hawaiʻi statewide coverage navigator

Reviewed for the synthetic trial on **November 7, 2026**. This is a directory of **public payer source pathways**, not a statewide patient-eligibility service. Sources may be replaced after their stated plan year. No real patient details may be entered in this trial.

## Open the navigator

1. Open **Hawaiʻi coverage** in the app sidebar (or **Hawaiʻi plans** in the formulary explorer).
2. Filter by **coverage program**, **payer**, and network or plan text.
3. Read the source status on the card and select the **official payer source**. Do not infer drug coverage merely from a card or a directory hit.
4. Where a **Search published drugs** button is present, it opens the verified machine-readable QUEST pharmacy source. Search drug name, generic, formulation or RxNorm; review strength, published tier and PA/ST/QL flags. Confirm exact plan/year and benefit.
5. To write an authorization letter, switch separately to the **Authorization letters** workspace. Policies and letters do not establish pharmacy benefits or medical coverage by themselves.

## Source status meanings

| Label in app | Meaning | Coverage claim permitted? |
| --- | --- | --- |
| Live published formulary lookup | Server fetches a validated official **public** JSON, filters by exact plan/year, and searches drug rows. | Published source entry only; no member eligibility, payment or actual claim status |
| Limited verified extracts | Only a **small manually transcribed set of drugs** exists locally for the selected list. | Only that reviewed extract; cannot infer other drugs |
| Official payer drug search / list | The payer maintains a search portal or published list the user must open. | No in-app drug-level conclusions |
| Official published source | Source PDF or official page is linked, but its full drug records are not imported. | No in-app drug-level conclusions |
| Exact benefit / plan required | No single drug formulary exists for this category; choose actual contract, employer, PBM, Part D plan, VA benefit or claim administrator. | None without more plan-specific verification |

**Never** present `no match` as `excluded`. A covered-drug entry may refer to only a particular strength, route, dose form, benefit type, location or date; confirm latest payer documents and member eligibility.

## Twelve exact-plan public pharmacy source entries (2026 and 2027)

| Official published payer file | Server source ID | Exact plan ID | Plan ID type |
| --- | --- | --- | --- |
| [HMSA QUEST](https://www.hmsa.com/prc/pharmacy/hmsa-quest-drug-formulary/) ([published JSON](https://assets.contentstack.io/v3/assets/blt731834369e6b995a/blt1cfd921ba2fdcc8d/6ae4050ff59c3f1d3bce71fc/hmsa-quest-formulary-2026.json)) | `hmsa-quest-2026-11` | `22780AA1111111` | `HIOS-PLAN-ID` |
| [UHC Community Plan Hawaiʻi QUEST](https://www.uhcprovider.com/en/health-plans-by-state/hawaii-health-plans/hi-comm-plan-home/hi-cp-pharmacy.html) ([published JSON](https://legacy.providerlookuponline.com/mrf/optumrx/drugs/2877216/JSON_Drugs_UHCCPHI.json)) | `uhc-quest-2026-10` | `UCSHIQ1` | `PLAN-ID` |
| [Kaiser Hawaiʻi QUEST](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([published Medicaid JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-medicaid.json)) | `kaiser-hi-quest-2026` | `KP-HI-QUEST Medicaid` | `QUEST Medicaid-CHIP Plan Description` |
| [Kaiser Hawaiʻi individual Platinum 0/5 Plus CAM](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([published drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs.json)) | `kaiser-hi-marketplace-platinum-2026` | `60612HI0110006` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2026 HIOS 60612HI0110017](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0017-2026` | `60612HI0110017` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2026 HIOS 60612HI0110018](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0018-2026` | `60612HI0110018` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2026 HIOS 60612HI0110019](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0019-2026` | `60612HI0110019` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2026 HIOS 60612HI0110020](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0020-2026` | `60612HI0110020` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2027 HIOS 60612HI0110017](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0017-2027` | `60612HI0110017` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2027 HIOS 60612HI0110018](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0018-2027` | `60612HI0110018` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2027 HIOS 60612HI0110019](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0019-2027` | `60612HI0110019` | `HIOS-PLAN-ID` |
| [Kaiser Standard Marketplace 2027 HIOS 60612HI0110020](https://healthy.kaiserpermanente.org/hawaii/pages/technical-information) ([Standard drug JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json)) | `kaiser-hi-standard-0020-2027` | `60612HI0110020` | `HIOS-PLAN-ID` |

The API accepts only **allowlisted exact public formulary source IDs** and a bounded drug search string; member identifiers, notes and user-supplied URLs are rejected. Each JSON file is schema-checked and independently filtered to its specific published plan ID and **2026 or 2027** year. The app returns a maximum of 40 displayed matching formulations. Where multiple Kaiser Standard HIOS plans share one official JSON URL, public-file downloads are deduplicated while plan-year filtering remains separate. The source is cached up to six hours per Node/Worker process. UHC's embedded `PART D` rows are excluded from QUEST. An unreadable or changed source is **unverified**, never presumed covered or excluded. Tests use mock sources, not live member data.

The internal 90-day warning is a **review reminder**, not a payer-defined expiration date. Kaiser files do not have a verified exact effective date in the app. Kaiser QUEST can publish plan years as strings, while individual plans may use `[2026, 2027]`; PA/ST/QL capitalization differs by source. Both are handled with exact-plan/year guards. For the four Standard HIOS IDs, the official 2026/2027 JSON contains separate plan-ID records; its marketing-name mapping was not verified for the current plan year, so staff must match the actual HIOS ID in the member's coverage document.

## Coverage programs represented

- **Commercial HMO / PPO**: distinct HMSA Select/Choice, Essential, Optimal, and employer variants; Kaiser employer HMO versus KPIC Added Choice PPO; UHC employer and UHA, HMAA/OptumRx, Curative and other employer/PBM programs. **HMO vs PPO is insufficient to identify the pharmacy formulary.** Group, network, benefit channel, coverage code and year can matter.
- **Marketplace / individual**: HMSA Metallic; Kaiser individual Platinum 0/5 Plus CAM (`60612HI0110006`) for 2026; and four Kaiser **Standard** individual HIOS IDs (`60612HI0110017`, `...0018`, `...0019`, `...0020`) with separate 2026 and 2027 searches. Other Kaiser individual products and UHC exchange variants require source-specific verification. An HIOS ID is not evidence of member enrollment. Individual plans must not borrow employer or Medicaid rules.
- **QUEST Medicaid**: HMSA, UnitedHealthcare Community Plan, and Kaiser have integrated exact-plan 2026 public pharmacy lookups. AlohaCare and ʻOhana retain separately linked official QUEST resources. AlohaCare lists separate primary pharmacy and wrapping/secondary benefits. Review the announced ʻOhana end-of-2026 QUEST plan transition before using a 2026 document for 2027.
- **Medicare Advantage HMO/PPO and D-SNP**: HMSA Akamai individual/group/Dual Care, Kaiser Senior Advantage/Dual, UHC MA/Dual, Humana, AlohaCare Advantage, Devoted if locally offered, and other contracts. Pharmacy Part D coverage requires the exact **contract/plan/segment/year**; physician-administered drugs may be medical-benefit items instead.
- **Traditional Medicare / Medigap**: Original Medicare **Part B** has drug benefit categories and separate CMS/MAC/NCD/LCD and prior-authorization rules, **not a single outpatient pharmacy formulary**. For ordinary outpatient prescriptions select the beneficiary's separate **Part D PDP**. Medigap does not itself supply Part D.
- **VA**: use the [VA National Formulary Advisor](https://www.va.gov/formularyadvisor/) and [VA Pharmacy Benefits Management (PBM) formulary/criteria-for-use documents](https://www.pbm.va.gov/PBM/NationalFormulary.asp). VA formulary status and VA Community Care authorization are distinct.
- **TRICARE**: use the [TRICARE formulary search](https://www.tricare.mil/FormularySearch). Tier, prior authorization and dispensing channel are separate from commercial employer lists.
- **Federal / postal**: HMSA federal, Postal Service and Postal Medicare PDP records are separated. Federal employee drug lists and Medicare Postal Part D cannot be generalized to HMSA commercial.
- **HMA/Verdegard, MDX, self-funded, workers' compensation**: these are administrators, claim systems or employer arrangements, not universal plan formularies. Verify the underlying carrier/PBM, group, authorization destination and benefit.

## Sources inspected but not imported

- **Kaiser Hawaiʻi Standard individual plans:** four published HIOS plan IDs were confirmed in the full [official Standard JSON](https://healthy.kaiserpermanente.org/content/dam/kporg/data/hi/drugs-individual-standard-plans.json), with both 2026 and 2027 plan-year rows. These eight exact plan/year lookups **are now integrated**. The 2026/2027 marketing names and exact benefit/eligibility are **not verified**; search only when the HIOS ID matches the actual policy.
- **AlohaCare QUEST:** the publicly linked [AlohaCare QUEST JSON](https://office.alohacare.org/userfiles/MONTHLY%20WEBSITE%20UPDATES/AlohaCare_Formulary_QUEST.json) timed out in the independent browser inspection. No drug entries or plan matches were imported from that source.

These availability/inspection results do not establish that a source is invalid, incomplete, or unavailable to ordinary users. Do not mark a plan live without a verified schema, plan-ID mapping, full-file source fetch and regression tests.

## What is not yet ingested

Full searchable drug rows for **HMSA Select/Choice, Essential, Optimal, Metallic, Medicare Advantage, commercial UHC, Kaiser plan variants other than the four Standard HIOS IDs plus the existing 2026 Platinum and QUEST entries, AlohaCare, ʻOhana, UHA, Curative, VA, TRICARE, Humana, Devoted, and other PDPs** are **not** in the app's indexed database yet. Those cards link to official payer sources only. The HMAA Premium extract remains explicitly **partial**, not a complete plan import. Connected payer eligibility, member ID lookups, credentialed formulary APIs and automatic claim submission are not active.

Recommended later imports: verify the exact PDF/JSON schema, published plan identifier, plan year, source license, and correct benefit; add a separate allowlisted importer and regression tests per payer. Never blanket-import without preventing cross-plan contamination.

## Clinical / security limitations

- The app is still a **synthetic-data trial, not PHI approved**. No patient records, members' identifiers, plan portal credentials, screenshots of notes or protected notes may be entered.
- Medical policy, preferred-drug list, formulary tiers, provider-administered drugs (Part B / medical benefit), Part D and pharmacy benefit are separate questions.
- Do not infer medical necessity or prescribing appropriateness from a lookup. A clinician must verify the treatment, dose, formulation, route and actual supporting documentation. A policy-only match cannot guarantee authorization or payment.
- See [HIPAA production requirements](HIPAA-RELEASE.md), [payer scope](HAWAII-PAYERS.md) and [AWS migration](AWS-MIGRATION.md).

## Maintenance

Update `shared/hawaii-plan-sources.mjs` when official URLs or programs change. Only add `live-drug-search` when a corresponding reviewed source ID exists in `shared/live-formularies.mjs`, schema and plan match are enforced in `server/formulary.mjs`, and the appropriate unit/real-source tests have been reviewed. Revalidate 2027 enrollments and formularies before presenting historical 2026 sources as current.
