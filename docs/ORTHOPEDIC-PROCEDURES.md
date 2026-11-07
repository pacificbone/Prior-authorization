# Orthopedic procedure prior-authorization workspace

**Pacific Bone & Joint — synthetic-data trial, November 7, 2026.** This page is a staff **preparation and source-navigation workflow**, not a decision engine, billable coding authority, EHR interface, live insurer portal, or prior authorization submission system. Do **not** enter PHI or real member identifiers.

## What is in the app

Open the new **Orthopedic procedures** sidebar page. Select a procedure category, precise procedure, insurer/administrator, line of coverage (e.g., commercial, QUEST, Medicare Advantage, traditional Medicare), site of care (office, ASC, outpatient hospital, inpatient hospital), and request stage (initial, continuation or appeal). Enter only an insurer plan **product name** if desired, never a member number. For knee gel injections also select the brand and whether ultrasound was used.

The app shows:

1. **Candidate CPT/HCPCS codes**, correctly distinguishing injection administration from brand-specific product J-codes. Codes and number of units are not automatically payable; confirm current year, laterality, billing units, modifiers, dispensing model and actual documented technique.
2. **Procedure-specific document checklist**: whether the needed source records have been located for OA injections, primary/revision hip or knee arthroplasty, two-stage MACI, carpal tunnel, ACL reconstruction or meniscus repair. Checking a box is **not evidence** that a clinical criterion is satisfied.
3. **Scoped public payer sources**: a current required-PA code lookup, an applicable medical policy or authorization route, with its role made explicit.
4. **Unresolved blockers** and two downloadable **synthetic-only** text files: a gap worksheet and an authorization outline. These files contain no pasted medical notes or member details and are **not submitted**.

Regardless of how many boxes are checked, the system **never** marks a service approved, covered, not requiring prior auth or ready for submission. Real eligibility, current payer rules, care setting, documentation, medical necessity and clinician review remain required.

## Specific workflows

| Area | Example codes | Key distinctions |
| --- | --- | --- |
| Knee hyaluronic acid / gel | 20610 or 20611, **plus product-specific** J7318, J7320–J7329, J7331–J7332 as applicable | Gel product, dosage units, prior series/response, knee OA indication, payer product preferences, office vs pharmacy supply and procedure guidance |
| Primary total knee / partial knee | 27447 / 27446 | Verify joint diagnosis, imaging, functional limitations, treatment history, side, setting and current exact plan |
| Primary total hip | 27130 | Hip-specific policy; not a knee policy. Anterior approach/robotics do not establish separate authorization or payment |
| Revision knee / revision hip | 27486–27487 / 27134, 27137, 27138 | Component-specific and stage-specific code selection, failure mechanism, instability/loosening/infection investigation |
| MACI stage 1 / stage 2 | S2112 for arthroscopic cartilage harvest where payer recognizes it; 27412 plus J7330 for implantation | Stage authorization, lesion location/size, alignment, prior care, chondrocyte product and facility coverage must be independently verified |
| Open / endoscopic CTR | 64721 / 29848 | Technique-specific. Professional billing and medical necessity vary |
| Balloon-assisted percutaneous CTR | 64728 | **Only the described intracarpal balloon-dilation technique with included ultrasound guidance**; do not separately add 76942 for 64728; certain payer policies classify it as unproven |
| Non-balloon ultrasound-guided CTR | **No candidate code assigned** | Do **not** automatically assign 64728 to non-balloon SX-One or other technique; obtain device-/payer-specific coding guidance |
| ACL / meniscus | 29888 / 29882–29883 | Separate ACL/graft, meniscus repair and other concurrent procedures as documented |

Product/code mappings are examples based on publicly reviewed references. See current authoritative CMS and payer publications for current descriptors, units and coverage. Code selection and filing must be reviewed by trained coding/billing staff.

## Public payer and Medicare sources

- [HMSA Required PA Code List](https://www.hmsa.com/prc/medical/required-prior-authorization-code-list/) (page updated August 2026) reports **Evolent** delegation for selected hip and knee MSK surgery, and CVS Caremark/Novologix for medical specialty drugs; distinguish code-list routing from a covered-benefit decision.
- [UHA Medical Services PA Search](https://www.uhahealth.com/providers/medical-services-prior-authorization-requirements-search) requires an exact current code lookup; it notes several setting/geographic exceptions. A search result is not a benefit guarantee.
- [UHC commercial sodium hyaluronate policy](https://ams-gateway.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sodium-hyaluronate.pdf) includes knee OA symptoms, 3-month conservative care, functional limitations, imaging, prior treatments, brand/dose/course as relevant. The official directory must be checked for changes, plan-specific preference and application.
- [UHC Surgery of the Knee, effective September 10, 2026](https://ams-gateway.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf) references primary/partial/revision TKA, arthroscopy, MACI and InterQual criteria. [UHC commercial policy directory](https://www.uhcprovider.com/en/policies-protocols/commercial-policies/commercial-medical-drug-policies.html) lists a distinct **Surgery of the Hip** policy. InterQual may require separately licensed access; the app does not import private criteria.
- [UHC Community Plan Surgery of the Knee](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/surgery-knee-cs.pdf) is a separate QUEST/Medicaid pathway; state/plan adoption must be confirmed. Medicare Advantage has its own policy and authorization list, not the commercial criteria.
- [UHC Commercial Omnibus Codes](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/omnibus-codes.pdf) and [UHC Medicare Advantage Omnibus Codes](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/omnibus-codes-mamp.pdf) list restrictions concerning balloon-assisted percutaneous CTR (64728). These findings do **not** extend to all open, endoscopic, or non-balloon ultrasound-guided approaches.
- [MACI manufacturer's billing guide](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) confirms code pathways for S2112, 27412, and J7330. The manufacturer guide does **not** create insurer coverage.
- [CMS Hospital OPD prior authorization](https://www.cms.gov/data-research/monitoring-programs/medicare-fee-service-compliance-programs/prior-authorization-pre-claim-review-initiatives/prior-authorization-certain-hospital-outpatient-department-opd-services) has a **specific** list; not every total joint replacement or orthopedic surgery requires national CMS OPD PA. Use [CMS Medicare Coverage Database](https://www.cms.gov/medicare-coverage-database/search.aspx), benefit category, MAC jurisdiction, site and any special program as separate checks.
- [Noridian JE Part B October 1, 2026 announcement](https://med.noridianmedicare.com/web/jeb/article-detail/-/view/10525/multiple-lcds-published-for-review-and-comments) identifies **DL40456** for hyaluronic acid injections as **proposed**, with comments through November 14, 2026. **This is not a finalized active LCD.** The directory labels it proposed; never apply proposed criteria as current Medicare requirements.
- [CMS billing/coding reference for hyaluronan](https://www.cms.gov/medicare-coverage-database/view/article.aspx?articleid=56157) includes brand/J-code unit examples; applicability to Hawaiʻi must be separately established.

The remaining payer entries (Kaiser, AlohaCare, HMAA, Curative and other employers, TRICARE, VA Community Care) are primarily **official public portal links**, not integrated code-level authorizations or medical-necessity policies. Specific benefit and plan documentation must be verified manually.

## Next phase — actual authorization automation

1. Import *reviewed current payer and plan-specific medical policies*, not just source URLs, including selected CPT/HCPCS, effective/review/expiration dates, applicable plans and settings, treatment exceptions, and clearly distinguished PA requirement versus clinical medical necessity. Handle payer conflicts and version changes by failing closed.
2. Build an **evidence map** from clinician-approved documentation with direct source quotations and provenance rather than generated claims. Stage-specific MACI and gel prior-treatment/series histories need structured, clinician-reviewed evidence.
3. Only after HIPAA release requirements and contracts are met, add authenticated EHR connections, eligibility/benefit and payer portal/EDI submission, staff access/RBAC, BAAs, auditing, encrypted storage and redaction. There is no PHI release flag in the current code.
4. Track submissions, decisions, denials and appeals without assuming approval from a payer policy or procedure code.

For the clinical/technical boundary and migration, see [HIPAA release requirements](HIPAA-RELEASE.md) and [AWS migration design](AWS-MIGRATION.md).
