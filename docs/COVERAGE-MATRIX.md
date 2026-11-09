# Coverage matrix — payer × coverage line × PBJ priority service

Generated from the application registries on **2026-11-09** by `npm run matrix`. Do not edit by hand; edit the registries and regenerate. The test suite fails if this file drifts from the registries.

> No cell verifies exact-plan adoption, member eligibility, prior authorization approval, payment or a medication supply route. REVIEWED means a reviewed public source exists for the payer, line and product; staff must still confirm the member product and the current source version.

## Legend

- **REVIEWED** — fingerprinted public snapshot or reviewed criteria extract for this payer, line and product; exact-plan adoption still unverified
- **STALE** — a reviewed record exists but its review window, effective date or version no longer covers the as-of date
- **PARTIAL** — directory-level reference, policy link, code-list entry or restrictive note without extracted criteria
- **LIVE FORMULARY** — pharmacy-benefit drug on a line with an exact-plan machine-readable formulary lookup (tier and PA/ST/QL flags at runtime); not member eligibility
- **ROUTE ONLY** — only a PA lookup or submission route is known; no policy content
- **MISSING** — no record of any kind for this payer, line and service
- **n/a** — the coverage line cannot pay for this service type (for example Part D for surgery)
- `(n)` is the number of non-routing records behind the cell; `ver?` means the source version must be confirmed; `proposed` means a proposed rule that is not in effect; `restrictive` means a published policy that limits or excludes the service; `no code` means the technique has no validated candidate code.

## Summary

| Status | Cells |
| --- | ---: |
| REVIEWED | 62 |
| STALE | 0 |
| PARTIAL | 113 |
| LIVE FORMULARY | 12 |
| ROUTE ONLY | 825 |
| MISSING | 407 |
| n/a | 86 |

Registries behind the matrix: 11 public payer evidence records (6 fingerprinted PDF snapshots, 5 directory-only), 6 reviewed medical-policy criteria extracts, 5 transcribed pharmacy formulary entries, 1 published PA code list, 59 plan/source directory entries, 12 exact-plan machine-readable formulary lookups, and **0 verified exact-plan procurement (buy-and-bill / specialty pharmacy) policies**.

## Priority gaps (focus payers)

Services with no reviewed or partial source for a focus payer and line. Each is a research task: retrieve the exact payer policy, record its version and fingerprint, and scope it to the line before the staff screen can show more than a routing link.


### Osteoporosis injections

- **Prolia (denosumab) J0897** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Jubbonti (denosumab-bbdz) biosimilar** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Bildyos (denosumab-nxxp) biosimilar** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Evenity (romosozumab) J3111** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Reclast (zoledronic acid) J3489** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

### Osteoporosis oral / pharmacy benefit

- **Alendronate (oral, pharmacy benefit)** — HMSA (Commercial, Individual Exchange, Medicare Advantage, Medicare Part D, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, Medicare Advantage); Kaiser Permanente (Commercial, Medicare Advantage); UHA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage, Medicare Part D)
- **Teriparatide / Forteo (pharmacy benefit)** — HMSA (Commercial, Individual Exchange, Medicare Advantage, Medicare Part D, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, Medicare Advantage); Kaiser Permanente (Commercial, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage, Medicare Part D)
- **Tymlos (abaloparatide, pharmacy benefit)** — HMSA (Commercial, Individual Exchange, Medicare Advantage, Medicare Part D, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, Medicare Advantage); Kaiser Permanente (Commercial, Medicare Advantage); UHA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage, Medicare Part D)

### Viscosupplementation

- **Durolane (J7318)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Euflexxa (J7323)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Gel-One (J7326)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Gelsyn-3 (J7328)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **GenVisc 850 (J7320)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Hyalgan (J7321)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Hymovis (J7322)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Monovisc (J7327)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Orthovisc (J7324)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Supartz FX (J7321)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Synvisc (J7325)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Synvisc-One (J7325)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **TriVisc (J7329)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Synojoynt (J7331)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Triluron (J7332)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)
- **Visco-3 (J7321)** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Humana (Medicare Advantage)

### Arthroplasty

- **Primary total knee arthroplasty 27447** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Partial / unicompartmental knee 27446** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Revision total knee 27486 / 27487** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Primary total hip arthroplasty 27130** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Revision total hip 27134 / 27137 / 27138** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

### MACI

- **MACI stage 1 cartilage harvest S2112** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **MACI stage 2 implantation 27412 + cell product J7330** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

### Sports knee

- **ACL reconstruction 29888** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **BEAR ACL repair / implant** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Meniscus repair 29882 / 29883** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Meniscus root repair** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Arthroscopic partial meniscectomy 29881** — HMSA (Individual Exchange, Federal employee / postal); UnitedHealthcare (Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

### Hand

- **Open carpal tunnel release 64721** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Endoscopic carpal tunnel release 29848** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Balloon-assisted ultrasound-guided CTR 64728** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (QUEST / Medicaid); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Non-balloon ultrasound-guided CTR (no code)** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Trigger finger release, open 26055** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)
- **Percutaneous / ultrasound-guided trigger finger release** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

### SI joint

- **Minimally invasive SI joint fusion** — HMSA (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Federal employee / postal); UnitedHealthcare (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); Kaiser Permanente (Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage); UHA (Commercial); HMAA (Commercial); AlohaCare (QUEST / Medicaid, Medicare Advantage); ʻOhana / Wellcare (QUEST / Medicaid); Traditional Medicare (Traditional Medicare); Humana (Medicare Advantage)

## HMSA

Carrier / managed care. Lines with plan sources: Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage, Medicare Part D, Federal employee / postal.

| Service | Commercial | Individual Exchange | QUEST / Medicaid | Medicare Advantage | Medicare Part D | Federal employee / postal |
| --- | --- | --- | --- | --- | --- | --- |
| **Osteoporosis injections** |  |  |  |  |  |  |
| Prolia (denosumab) J0897 | REVIEWED (2) | ROUTE ONLY | REVIEWED (2) | REVIEWED (2) | n/a | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | REVIEWED (2) | ROUTE ONLY | REVIEWED (2) | REVIEWED (2) | n/a | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | REVIEWED (2) | ROUTE ONLY | REVIEWED (2) | REVIEWED (2) | n/a | ROUTE ONLY |
| Evenity (romosozumab) J3111 | REVIEWED (2) | ROUTE ONLY | REVIEWED (2) | REVIEWED (1) | n/a | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | n/a | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |  |  |  |  |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY | LIVE FORMULARY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY | ROUTE ONLY | LIVE FORMULARY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY | LIVE FORMULARY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| **Viscosupplementation** |  |  |  |  |  |  |
| Durolane (J7318) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Euflexxa (J7323) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Gel-One (J7326) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Gelsyn-3 (J7328) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| GenVisc 850 (J7320) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Hyalgan (J7321) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Hymovis (J7322) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Monovisc (J7327) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Orthovisc (J7324) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Supartz FX (J7321) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Synvisc (J7325) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Synvisc-One (J7325) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| TriVisc (J7329) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Synojoynt (J7331) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Triluron (J7332) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| Visco-3 (J7321) | REVIEWED (3) | ROUTE ONLY | REVIEWED (3) | PARTIAL (3) | n/a | ROUTE ONLY |
| **Arthroplasty** |  |  |  |  |  |  |
| Primary total knee arthroplasty 27447 | REVIEWED (2) · ver? | ROUTE ONLY | REVIEWED (2) · ver? | REVIEWED (2) · ver? | n/a | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | REVIEWED (2) · ver? | ROUTE ONLY | REVIEWED (2) · ver? | REVIEWED (2) · ver? | n/a | ROUTE ONLY |
| Revision total knee 27486 / 27487 | REVIEWED (2) · ver? | ROUTE ONLY | REVIEWED (2) · ver? | REVIEWED (2) · ver? | n/a | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | PARTIAL (1) | ROUTE ONLY | PARTIAL (1) | PARTIAL (1) | n/a | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | PARTIAL (1) | ROUTE ONLY | PARTIAL (1) | PARTIAL (1) | n/a | ROUTE ONLY |
| **MACI** |  |  |  |  |  |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) | n/a | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | PARTIAL (2) | ROUTE ONLY (1) | PARTIAL (2) | PARTIAL (2) | n/a | ROUTE ONLY |
| **Sports knee** |  |  |  |  |  |  |
| ACL reconstruction 29888 | PARTIAL (1) | ROUTE ONLY | PARTIAL (1) | PARTIAL (1) | n/a | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | n/a | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | PARTIAL (1) | ROUTE ONLY | PARTIAL (1) | PARTIAL (1) | n/a | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | n/a | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | PARTIAL (1) | ROUTE ONLY | PARTIAL (1) | PARTIAL (1) | n/a | ROUTE ONLY |
| **Hand** |  |  |  |  |  |  |
| Open carpal tunnel release 64721 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | n/a | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | n/a | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | n/a | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | n/a | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | n/a | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | n/a | ROUTE ONLY · no code |
| **SI joint** |  |  |  |  |  |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | n/a | ROUTE ONLY · no code |

<details><summary>Records behind HMSA (15)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [HMSA Prolia and Biosimilars — HMO/PPO/QUEST](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/) | reviewed-snapshot | 2026-04-01 · 2026-04-01 | due 2027-02-05 | — |
| [HMSA denosumab · initial postmenopausal osteoporosis](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/) | reviewed-extract | Prolia and biosimilars · HMO/PPO/QUEST · 04/01/2026 · 2026-04-01 | reviewed 2026-11-06 | 6 alternative pathways |
| [HMSA Prolia and Biosimilars — Medicare Advantage](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | directory-reference | 2026-10-01 · 2026-10-01 | due 2027-02-05 | — |
| [HMSA denosumab · Medicare Advantage osteoporosis treatment](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/) | reviewed-extract | Prolia and biosimilars · Medicare Advantage · 10/01/2026 · 2026-10-01 | reviewed 2026-11-06 | — |
| [HMSA Evenity — HMO/PPO/QUEST](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | reviewed-snapshot | 2025-12-19 · 2025-12-19 | due 2027-02-05 | — |
| [HMSA Evenity · initial postmenopausal osteoporosis](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | reviewed-extract | Evenity · HMO/PPO/QUEST · 12/19/2025 · 2025-12-19 | reviewed 2026-11-06 | 6 alternative pathways, pathway-needs-clarification |
| [HMSA Evenity · Medicare Advantage initial therapy](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | reviewed-extract | Evenity · Medicare Advantage · 06/27/2025 · 2025-06-27 | reviewed 2026-11-06 | — |
| [HMSA Hyaluronate Products — Exceptions Criteria](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | reviewed-snapshot | 2026-01-01 · 2026-01-01 | due 2027-02-05 | — |
| [HMSA Hyaluronate Products — Clinical Policy](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | reviewed-snapshot | 2026-06-26 · 2026-06-26 | due 2027-02-05 | — |
| [HMSA medical specialty drug policies: hyaluronates, by line and product](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | policy-link | — | checked 2026-11-07 | — |
| [HMSA Hyaluronates — Medicare Advantage](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies/) | directory-reference | 2026-03-13 · 2026-03-13 | due 2027-02-05 | — |
| [HMSA Hyaluronates Preferred Drug Program — Medicare Advantage](https://www.hmsa.com/prc/pharmacy/medical-specialty-drug-policies-m-z/) | directory-reference | 2026-01-01 · 2026-01-01 | due 2027-02-05 | — |
| [HMSA Joint Surgery Utilization Review Matrix 2026](https://www1.radmd.com/sites/default/files/2025-12/HMSA%20Joint%20Surgery%20Utilization%20Review%20Matrix%202026%2001.01.26.pdf) | directory-reference | 2026-01-01 · 2026-01-01 | due 2027-02-05 | — |
| [HMSA-linked Evolent Clinical Guideline 1763 — Knee Arthroplasty](https://www1.radmd.com/sites/default/files/2025-07/2025%20Evolent%20Musculoskeletal%20Surgery%20Guidelines%20-%20HMSA%20FINAL%20eff%20070125.pdf) | reviewed-snapshot | July 2025; revised November 2024 · 2025-07-01 | due 2027-02-05 | version-confirmation-required |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link; Individual Exchange: source-link; QUEST / Medicaid: live-source (22780AA1111111); Medicare Advantage: source-link; Medicare Part D: source-link; Federal employee / postal: source-link.

## Kaiser Permanente

Carrier / integrated delivery. Lines with plan sources: Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage.

| Service | Commercial | Individual Exchange | QUEST / Medicaid | Medicare Advantage |
| --- | --- | --- | --- | --- |
| **Osteoporosis injections** |  |  |  |  |
| Prolia (denosumab) J0897 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |  |  |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY | LIVE FORMULARY | LIVE FORMULARY | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY | LIVE FORMULARY | LIVE FORMULARY | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY | LIVE FORMULARY | LIVE FORMULARY | ROUTE ONLY |
| **Viscosupplementation** |  |  |  |  |
| Durolane (J7318) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| **Arthroplasty** |  |  |  |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| **MACI** |  |  |  |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) | ROUTE ONLY (1) |
| **Sports knee** |  |  |  |  |
| ACL reconstruction 29888 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| **Hand** |  |  |  |  |
| Open carpal tunnel release 64721 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code |
| **SI joint** |  |  |  |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code | ROUTE ONLY · no code |

<details><summary>Records behind Kaiser Permanente (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link; Individual Exchange: live-source (60612HI0110006, 60612HI0110017, 60612HI0110018, 60612HI0110019, 60612HI0110020, 60612HI0110017, 60612HI0110018, 60612HI0110019, 60612HI0110020); QUEST / Medicaid: live-source (KP-HI-QUEST Medicaid); Medicare Advantage: source-link.

## AlohaCare

Carrier / managed care. Lines with plan sources: QUEST / Medicaid, Medicare Advantage.

| Service | QUEST / Medicaid | Medicare Advantage |
| --- | --- | --- |
| **Osteoporosis injections** |  |  |
| Prolia (denosumab) J0897 | ROUTE ONLY | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| **Viscosupplementation** |  |  |
| Durolane (J7318) | ROUTE ONLY | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY | ROUTE ONLY |
| **Arthroplasty** |  |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY | ROUTE ONLY |
| **MACI** |  |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) | ROUTE ONLY (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY (1) | ROUTE ONLY (1) |
| **Sports knee** |  |  |
| ACL reconstruction 29888 | ROUTE ONLY | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY | ROUTE ONLY |
| **Hand** |  |  |
| Open carpal tunnel release 64721 | ROUTE ONLY | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code | ROUTE ONLY · no code |
| **SI joint** |  |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code | ROUTE ONLY · no code |

<details><summary>Records behind AlohaCare (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: QUEST / Medicaid: source-link; Medicare Advantage: source-link.

## Aetna

Plan-specific verification. Lines with plan sources: Commercial, Medicare Advantage.

| Service | Commercial | Medicare Advantage |
| --- | --- | --- |
| **Osteoporosis injections** |  |  |
| Prolia (denosumab) J0897 | MISSING | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING | MISSING |
| Evenity (romosozumab) J3111 | MISSING | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |  |
| Alendronate (oral, pharmacy benefit) | MISSING | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING | MISSING |
| **Viscosupplementation** |  |  |
| Durolane (J7318) | MISSING | MISSING |
| Euflexxa (J7323) | MISSING | MISSING |
| Gel-One (J7326) | MISSING | MISSING |
| Gelsyn-3 (J7328) | MISSING | MISSING |
| GenVisc 850 (J7320) | MISSING | MISSING |
| Hyalgan (J7321) | MISSING | MISSING |
| Hymovis (J7322) | MISSING | MISSING |
| Monovisc (J7327) | MISSING | MISSING |
| Orthovisc (J7324) | MISSING | MISSING |
| Supartz FX (J7321) | MISSING | MISSING |
| Synvisc (J7325) | MISSING | MISSING |
| Synvisc-One (J7325) | MISSING | MISSING |
| TriVisc (J7329) | MISSING | MISSING |
| Synojoynt (J7331) | MISSING | MISSING |
| Triluron (J7332) | MISSING | MISSING |
| Visco-3 (J7321) | MISSING | MISSING |
| **Arthroplasty** |  |  |
| Primary total knee arthroplasty 27447 | MISSING | MISSING |
| Partial / unicompartmental knee 27446 | MISSING | MISSING |
| Revision total knee 27486 / 27487 | MISSING | MISSING |
| Primary total hip arthroplasty 27130 | MISSING | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING | MISSING |
| **MACI** |  |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) | MISSING (1) |
| **Sports knee** |  |  |
| ACL reconstruction 29888 | MISSING | MISSING |
| BEAR ACL repair / implant | MISSING · no code | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING | MISSING |
| Meniscus root repair | MISSING · no code | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING | MISSING |
| **Hand** |  |  |
| Open carpal tunnel release 64721 | MISSING | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code | MISSING · no code |
| Trigger finger release, open 26055 | MISSING | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code | MISSING · no code |
| **SI joint** |  |  |
| Minimally invasive SI joint fusion | MISSING · no code | MISSING · no code |

<details><summary>Records behind Aetna (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link; Medicare Advantage: source-link.

## Cigna

Plan-specific verification. Lines with plan sources: Commercial.

| Service | Commercial |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

<details><summary>Records behind Cigna (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link.

## Anthem Blue Cross and Blue Shield

Plan-specific verification. Lines with plan sources: Commercial.

| Service | Commercial |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

<details><summary>Records behind Anthem Blue Cross and Blue Shield (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link.

## UnitedHealthcare

Carrier / managed care. Lines with plan sources: Commercial, Individual Exchange, QUEST / Medicaid, Medicare Advantage.

| Service | Commercial | Individual Exchange | QUEST / Medicaid | Medicare Advantage |
| --- | --- | --- | --- | --- |
| **Osteoporosis injections** |  |  |  |  |
| Prolia (denosumab) J0897 | REVIEWED (2) | REVIEWED (1) | ROUTE ONLY | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | REVIEWED (2) | REVIEWED (1) | ROUTE ONLY | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | REVIEWED (2) | REVIEWED (1) | ROUTE ONLY | MISSING |
| Evenity (romosozumab) J3111 | REVIEWED (2) | REVIEWED (1) | ROUTE ONLY | MISSING |
| Reclast (zoledronic acid) J3489 | REVIEWED (1) | MISSING | ROUTE ONLY | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |  |  |  |
| Alendronate (oral, pharmacy benefit) | MISSING | MISSING | LIVE FORMULARY | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING | MISSING | LIVE FORMULARY | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING | MISSING | LIVE FORMULARY | MISSING |
| **Viscosupplementation** |  |  |  |  |
| Durolane (J7318) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Euflexxa (J7323) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Gel-One (J7326) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Gelsyn-3 (J7328) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| GenVisc 850 (J7320) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Hyalgan (J7321) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Hymovis (J7322) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Monovisc (J7327) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Orthovisc (J7324) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Supartz FX (J7321) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Synvisc (J7325) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Synvisc-One (J7325) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| TriVisc (J7329) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Synojoynt (J7331) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Triluron (J7332) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| Visco-3 (J7321) | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | ROUTE ONLY |
| **Arthroplasty** |  |  |  |  |
| Primary total knee arthroplasty 27447 | PARTIAL (2) | PARTIAL (1) | PARTIAL (1) | MISSING |
| Partial / unicompartmental knee 27446 | PARTIAL (2) | PARTIAL (1) | PARTIAL (1) | MISSING |
| Revision total knee 27486 / 27487 | PARTIAL (2) | PARTIAL (1) | PARTIAL (1) | MISSING |
| Primary total hip arthroplasty 27130 | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | MISSING |
| Revision total hip 27134 / 27137 / 27138 | PARTIAL (1) | PARTIAL (1) | ROUTE ONLY | MISSING |
| **MACI** |  |  |  |  |
| MACI stage 1 cartilage harvest S2112 | PARTIAL (2) | PARTIAL (2) | PARTIAL (2) | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | PARTIAL (3) | PARTIAL (2) | PARTIAL (2) | MISSING (1) |
| **Sports knee** |  |  |  |  |
| ACL reconstruction 29888 | PARTIAL (2) | PARTIAL (1) | PARTIAL (1) | MISSING |
| BEAR ACL repair / implant | ROUTE ONLY · no code | MISSING · no code | ROUTE ONLY · no code | MISSING · no code |
| Meniscus repair 29882 / 29883 | PARTIAL (2) | PARTIAL (1) | PARTIAL (1) | MISSING |
| Meniscus root repair | ROUTE ONLY · no code | MISSING · no code | ROUTE ONLY · no code | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | PARTIAL (1) | MISSING | ROUTE ONLY | MISSING |
| **Hand** |  |  |  |  |
| Open carpal tunnel release 64721 | ROUTE ONLY | MISSING | ROUTE ONLY | MISSING |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY | MISSING | ROUTE ONLY | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | PARTIAL (1) · restrictive | PARTIAL (1) · restrictive | ROUTE ONLY | PARTIAL (1) · restrictive |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code | MISSING · no code | ROUTE ONLY · no code | MISSING · no code |
| Trigger finger release, open 26055 | ROUTE ONLY | MISSING | ROUTE ONLY | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code | MISSING · no code | ROUTE ONLY · no code | MISSING · no code |
| **SI joint** |  |  |  |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code | MISSING · no code | ROUTE ONLY · no code | MISSING · no code |

<details><summary>Records behind UnitedHealthcare (12)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [UHC Commercial Medication Sourcing Protocol](https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/UHC-Admin-Drug-Chart.pdf) | reviewed-snapshot | PCA-1-26-01739-E&I-QRG_09102026 | due 2027-02-05 | general-reference |
| [Denosumab · initial osteoporosis therapy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/denosumab-prolia-xgeva.pdf) | reviewed-extract | 2026D0068U · 2026-10-01 | reviewed 2026-11-06 | — |
| [Evenity · initial therapy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/evenity-romosozumab-aqqg.pdf) | reviewed-extract | 2026D0080M · 2026-11-01 | reviewed 2026-11-06 | — |
| [UnitedHealthcare commercial medical-benefit sodium hyaluronate policy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/sodium-hyaluronate.pdf) | policy-link | — | checked 2026-11-07 | — |
| [UnitedHealthcare Individual Exchange sodium hyaluronate policy](https://www.uhcprovider.com/en/policies-protocols/exchange-policies/exchanges-medical-drug-policies.html) | policy-link | — | checked 2026-11-07 | — |
| [UHC Surgery of the Knee — Commercial and Individual Exchange](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf) | directory-reference | 2026T0553J · 2026-09-10 | due 2027-02-05 | — |
| [UnitedHealthcare Surgery of the Knee (September 2026)](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/surgery-knee.pdf) | policy-link | — | checked 2026-11-07 | — |
| [UnitedHealthcare Community Plan surgery of knee medical policy](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medicaid-comm-plan/surgery-knee-cs.pdf) | policy-link | — | checked 2026-11-07 | — |
| [UnitedHealthcare Surgery of the Hip (September 2026)](https://www.uhcprovider.com/en/policies-protocols/commercial-policies/commercial-medical-drug-policies.html) | policy-link | — | checked 2026-11-07 | — |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |
| [UnitedHealthcare omnibus codes: CPT 64728](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/omnibus-codes.pdf) | restrictive-review | — | checked 2026-11-07 | restrictive |
| [UnitedHealthcare Medicare Advantage Omnibus Codes policy (64728)](https://www.uhcprovider.com/content/dam/provider/docs/public/policies/medadv-mp/omnibus-codes-mamp.pdf) | restrictive-review | — | checked 2026-11-07 | restrictive |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link; Individual Exchange: source-link; QUEST / Medicaid: live-source (UCSHIQ1); Medicare Advantage: source-link.

## ʻOhana / Wellcare

Carrier / managed care. Lines with plan sources: QUEST / Medicaid.

| Service | QUEST / Medicaid |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

<details><summary>Records behind ʻOhana / Wellcare (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: QUEST / Medicaid: source-link.

## HMAA

Carrier / employer plan. Lines with plan sources: Commercial.

| Service | Commercial |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | PARTIAL (1) |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | PARTIAL (1) |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

<details><summary>Records behind HMAA (3)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [HMAA OptumRx Premium · alendronate](https://www.hmaa.com/wp-content/uploads/2026/06/OptumRx-Formulary-List-07-2026.pdf) | formulary-entry | 2026 OptumRx Premium formulary · July edition · 2026-07-01 | reviewed 2026-11-06 · expires 2026-12-31 | — |
| [HMAA OptumRx Premium · tymlos](https://www.hmaa.com/wp-content/uploads/2026/06/OptumRx-Formulary-List-07-2026.pdf) | formulary-entry | 2026 OptumRx Premium formulary · July edition · 2026-07-01 | reviewed 2026-11-06 · expires 2026-12-31 | — |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: partial-entry; Commercial: partial-list.

## UHA

Carrier / employer plan. Lines with plan sources: Commercial.

| Service | Commercial |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

<details><summary>Records behind UHA (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link.

## Curative

Carrier / employer plan. Lines with plan sources: Commercial.

| Service | Commercial |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

<details><summary>Records behind Curative (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Commercial: source-link.

## Humana

Carrier / Medicare plan. Lines with plan sources: Medicare Advantage, Medicare Part D.

| Service | Medicare Advantage | Medicare Part D |
| --- | --- | --- |
| **Osteoporosis injections** |  |  |
| Prolia (denosumab) J0897 | ROUTE ONLY | n/a |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY | n/a |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY | n/a |
| Evenity (romosozumab) J3111 | ROUTE ONLY | n/a |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY | n/a |
| **Osteoporosis oral / pharmacy benefit** |  |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY | ROUTE ONLY |
| **Viscosupplementation** |  |  |
| Durolane (J7318) | ROUTE ONLY | n/a |
| Euflexxa (J7323) | ROUTE ONLY | n/a |
| Gel-One (J7326) | ROUTE ONLY | n/a |
| Gelsyn-3 (J7328) | ROUTE ONLY | n/a |
| GenVisc 850 (J7320) | ROUTE ONLY | n/a |
| Hyalgan (J7321) | ROUTE ONLY | n/a |
| Hymovis (J7322) | ROUTE ONLY | n/a |
| Monovisc (J7327) | ROUTE ONLY | n/a |
| Orthovisc (J7324) | ROUTE ONLY | n/a |
| Supartz FX (J7321) | ROUTE ONLY | n/a |
| Synvisc (J7325) | ROUTE ONLY | n/a |
| Synvisc-One (J7325) | ROUTE ONLY | n/a |
| TriVisc (J7329) | ROUTE ONLY | n/a |
| Synojoynt (J7331) | ROUTE ONLY | n/a |
| Triluron (J7332) | ROUTE ONLY | n/a |
| Visco-3 (J7321) | ROUTE ONLY | n/a |
| **Arthroplasty** |  |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY | n/a |
| Partial / unicompartmental knee 27446 | ROUTE ONLY | n/a |
| Revision total knee 27486 / 27487 | ROUTE ONLY | n/a |
| Primary total hip arthroplasty 27130 | ROUTE ONLY | n/a |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY | n/a |
| **MACI** |  |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) | n/a |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) | n/a |
| **Sports knee** |  |  |
| ACL reconstruction 29888 | ROUTE ONLY | n/a |
| BEAR ACL repair / implant | ROUTE ONLY · no code | n/a |
| Meniscus repair 29882 / 29883 | ROUTE ONLY | n/a |
| Meniscus root repair | ROUTE ONLY · no code | n/a |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY | n/a |
| **Hand** |  |  |
| Open carpal tunnel release 64721 | ROUTE ONLY | n/a |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY | n/a |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY | n/a |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code | n/a |
| Trigger finger release, open 26055 | ROUTE ONLY | n/a |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code | n/a |
| **SI joint** |  |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code | n/a |

<details><summary>Records behind Humana (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Medicare Advantage: source-link; Medicare Part D: source-link.

## Devoted Health

Carrier / Medicare plan. Lines with plan sources: Medicare Advantage.

| Service | Medicare Advantage |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING (1) |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING (1) |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

<details><summary>Records behind Devoted Health (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [MACI manufacturer billing and staged authorization references](https://www.maci.com/healthcare-professionals/practice-resources/approval-billing-codes/) | reference | — | checked 2026-11-07 | — |

</details>

Pharmacy-benefit formulary access by line: Medicare Advantage: source-link.

## Traditional Medicare

Original Medicare benefit. Lines with plan sources: Traditional Medicare.

| Service | Traditional Medicare |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | n/a |
| Teriparatide / Forteo (pharmacy benefit) | n/a |
| Tymlos (abaloparatide, pharmacy benefit) | n/a |
| **Viscosupplementation** |  |
| Durolane (J7318) | PARTIAL (1) · proposed |
| Euflexxa (J7323) | PARTIAL (1) · proposed |
| Gel-One (J7326) | PARTIAL (1) · proposed |
| Gelsyn-3 (J7328) | PARTIAL (1) · proposed |
| GenVisc 850 (J7320) | PARTIAL (1) · proposed |
| Hyalgan (J7321) | PARTIAL (1) · proposed |
| Hymovis (J7322) | PARTIAL (1) · proposed |
| Monovisc (J7327) | PARTIAL (1) · proposed |
| Orthovisc (J7324) | PARTIAL (1) · proposed |
| Supartz FX (J7321) | PARTIAL (1) · proposed |
| Synvisc (J7325) | PARTIAL (1) · proposed |
| Synvisc-One (J7325) | PARTIAL (1) · proposed |
| TriVisc (J7329) | PARTIAL (1) · proposed |
| Synojoynt (J7331) | PARTIAL (1) · proposed |
| Triluron (J7332) | PARTIAL (1) · proposed |
| Visco-3 (J7321) | PARTIAL (1) · proposed |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

<details><summary>Records behind Traditional Medicare (1)</summary>

| Record | Kind | Version / effective | Review | Flags |
| --- | --- | --- | --- | --- |
| [Noridian JE: proposed hyaluronic acid LCD DL40456 (NOT FINAL)](https://www.cms.gov/medicare-coverage-database/search.aspx) | proposed-only | — | checked 2026-11-07 | proposed-not-active |

</details>

## Medigap

Supplement only; not primary coverage. Lines with plan sources: Traditional Medicare.

| Service | Traditional Medicare |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | n/a |
| Teriparatide / Forteo (pharmacy benefit) | n/a |
| Tymlos (abaloparatide, pharmacy benefit) | n/a |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

## Veterans Affairs

VA health system. Lines with plan sources: VA / Community Care.

| Service | VA / Community Care |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

Pharmacy-benefit formulary access by line: VA / Community Care: source-link.

## TRICARE

Military benefit. Lines with plan sources: TRICARE.

| Service | TRICARE |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | ROUTE ONLY |
| Teriparatide / Forteo (pharmacy benefit) | ROUTE ONLY |
| Tymlos (abaloparatide, pharmacy benefit) | ROUTE ONLY |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

Pharmacy-benefit formulary access by line: TRICARE: source-link.

## HMA / Verdegard

Third-party administrator (underlying plan required). Lines with plan sources: Delegated / claim-specific.

| Service | Delegated / claim-specific |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

Pharmacy-benefit formulary access by line: Delegated / claim-specific: source-link.

## MDX Hawaiʻi

Delegated administrator (underlying carrier required). Lines with plan sources: Delegated / claim-specific.

| Service | Delegated / claim-specific |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

Pharmacy-benefit formulary access by line: Delegated / claim-specific: source-link.

## Other employer / national

Employer/PBM must be identified. Lines with plan sources: Delegated / claim-specific.

| Service | Delegated / claim-specific |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | MISSING |
| Jubbonti (denosumab-bbdz) biosimilar | MISSING |
| Bildyos (denosumab-nxxp) biosimilar | MISSING |
| Evenity (romosozumab) J3111 | MISSING |
| Reclast (zoledronic acid) J3489 | MISSING |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | MISSING |
| Euflexxa (J7323) | MISSING |
| Gel-One (J7326) | MISSING |
| Gelsyn-3 (J7328) | MISSING |
| GenVisc 850 (J7320) | MISSING |
| Hyalgan (J7321) | MISSING |
| Hymovis (J7322) | MISSING |
| Monovisc (J7327) | MISSING |
| Orthovisc (J7324) | MISSING |
| Supartz FX (J7321) | MISSING |
| Synvisc (J7325) | MISSING |
| Synvisc-One (J7325) | MISSING |
| TriVisc (J7329) | MISSING |
| Synojoynt (J7331) | MISSING |
| Triluron (J7332) | MISSING |
| Visco-3 (J7321) | MISSING |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | MISSING |
| Partial / unicompartmental knee 27446 | MISSING |
| Revision total knee 27486 / 27487 | MISSING |
| Primary total hip arthroplasty 27130 | MISSING |
| Revision total hip 27134 / 27137 / 27138 | MISSING |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | MISSING |
| MACI stage 2 implantation 27412 + cell product J7330 | MISSING |
| **Sports knee** |  |
| ACL reconstruction 29888 | MISSING |
| BEAR ACL repair / implant | MISSING · no code |
| Meniscus repair 29882 / 29883 | MISSING |
| Meniscus root repair | MISSING · no code |
| Arthroscopic partial meniscectomy 29881 | MISSING |
| **Hand** |  |
| Open carpal tunnel release 64721 | MISSING |
| Endoscopic carpal tunnel release 29848 | MISSING |
| Balloon-assisted ultrasound-guided CTR 64728 | MISSING |
| Non-balloon ultrasound-guided CTR (no code) | MISSING · no code |
| Trigger finger release, open 26055 | MISSING |
| Percutaneous / ultrasound-guided trigger finger release | MISSING · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | MISSING · no code |

Pharmacy-benefit formulary access by line: Delegated / claim-specific: source-link.

## Workers compensation

Carrier/claim administrator required. Lines with plan sources: Delegated / claim-specific.

| Service | Delegated / claim-specific |
| --- | --- |
| **Osteoporosis injections** |  |
| Prolia (denosumab) J0897 | ROUTE ONLY |
| Jubbonti (denosumab-bbdz) biosimilar | ROUTE ONLY |
| Bildyos (denosumab-nxxp) biosimilar | ROUTE ONLY |
| Evenity (romosozumab) J3111 | ROUTE ONLY |
| Reclast (zoledronic acid) J3489 | ROUTE ONLY |
| **Osteoporosis oral / pharmacy benefit** |  |
| Alendronate (oral, pharmacy benefit) | MISSING |
| Teriparatide / Forteo (pharmacy benefit) | MISSING |
| Tymlos (abaloparatide, pharmacy benefit) | MISSING |
| **Viscosupplementation** |  |
| Durolane (J7318) | ROUTE ONLY |
| Euflexxa (J7323) | ROUTE ONLY |
| Gel-One (J7326) | ROUTE ONLY |
| Gelsyn-3 (J7328) | ROUTE ONLY |
| GenVisc 850 (J7320) | ROUTE ONLY |
| Hyalgan (J7321) | ROUTE ONLY |
| Hymovis (J7322) | ROUTE ONLY |
| Monovisc (J7327) | ROUTE ONLY |
| Orthovisc (J7324) | ROUTE ONLY |
| Supartz FX (J7321) | ROUTE ONLY |
| Synvisc (J7325) | ROUTE ONLY |
| Synvisc-One (J7325) | ROUTE ONLY |
| TriVisc (J7329) | ROUTE ONLY |
| Synojoynt (J7331) | ROUTE ONLY |
| Triluron (J7332) | ROUTE ONLY |
| Visco-3 (J7321) | ROUTE ONLY |
| **Arthroplasty** |  |
| Primary total knee arthroplasty 27447 | ROUTE ONLY |
| Partial / unicompartmental knee 27446 | ROUTE ONLY |
| Revision total knee 27486 / 27487 | ROUTE ONLY |
| Primary total hip arthroplasty 27130 | ROUTE ONLY |
| Revision total hip 27134 / 27137 / 27138 | ROUTE ONLY |
| **MACI** |  |
| MACI stage 1 cartilage harvest S2112 | ROUTE ONLY |
| MACI stage 2 implantation 27412 + cell product J7330 | ROUTE ONLY |
| **Sports knee** |  |
| ACL reconstruction 29888 | ROUTE ONLY |
| BEAR ACL repair / implant | ROUTE ONLY · no code |
| Meniscus repair 29882 / 29883 | ROUTE ONLY |
| Meniscus root repair | ROUTE ONLY · no code |
| Arthroscopic partial meniscectomy 29881 | ROUTE ONLY |
| **Hand** |  |
| Open carpal tunnel release 64721 | ROUTE ONLY |
| Endoscopic carpal tunnel release 29848 | ROUTE ONLY |
| Balloon-assisted ultrasound-guided CTR 64728 | ROUTE ONLY |
| Non-balloon ultrasound-guided CTR (no code) | ROUTE ONLY · no code |
| Trigger finger release, open 26055 | ROUTE ONLY |
| Percutaneous / ultrasound-guided trigger finger release | ROUTE ONLY · no code |
| **SI joint** |  |
| Minimally invasive SI joint fusion | ROUTE ONLY · no code |

Pharmacy-benefit formulary access by line: Delegated / claim-specific: source-link.

## How to close a gap

1. Retrieve the exact payer document for the line (not a plan-family page), record title, version, effective date, page locator and SHA-256 in `shared/payer-policy-evidence.mjs` and `docs/policy-source-checksums.json`.
2. Add documentation prompts in `shared/payer-documentation-branches.mjs` only for criteria the document actually states.
3. Keep exact-plan adoption, eligibility and procurement as separate, patient-specific gates; nothing in this matrix clears them.
4. Run `npm run matrix` and commit the regenerated file with the registry change.
