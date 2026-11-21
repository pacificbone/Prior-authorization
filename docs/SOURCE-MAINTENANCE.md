# Keeping payer sources current

This page is for the person who owns Coverage Desk's payer documents. It explains the 90-day review, the two commands that tell you what needs attention, the weekly automatic check, and the once-a-year December task. You do not need to read code to follow it.

Coverage Desk is a **synthetic-data trial**. Everything below is about keeping the captured public documents honest. A current document, an unchanged fingerprint or a green check never means a patient is covered, approved or eligible, or that an employer or member plan has adopted a policy.

## What the 90-day review is

Every payer document the app shows has a **review-by date**:

| Kind of source | Where it lives | Review-by date |
| --- | --- | --- |
| Payer policy evidence (the fingerprinted PDFs and the Medicare web documents) | [shared/payer-policy-evidence.mjs](../shared/payer-policy-evidence.mjs) | Its recorded `reviewDue`, at most 90 days after it was retrieved |
| Older catalog criteria extracts (medication policies, the HMAA formulary extract, the MDX drug list) | [shared/hawaii-sources.mjs](../shared/hawaii-sources.mjs) and [shared/catalog.mjs](../shared/catalog.mjs) | 90 days after it was reviewed, or its printed expiry date if that comes first |
| Live formulary files (exact plan/year machine-readable files) | [shared/live-formularies.mjs](../shared/live-formularies.mjs) | 90 days after its recorded review date. A file with no recorded review date is listed as **undated**; no date is ever made up for it |

After the review-by date the app marks the source as overdue, and staff should treat it as unconfirmed. **Reviewing** a source means opening the payer's current document and confirming that the title, the lines of business it applies to, the version or effective date and the criteria summarized in Coverage Desk still match. If they do, a developer records the new review date. If they do not, the record is corrected first. Payer criteria text in the app must always come from the captured document; nothing is filled in from memory.

## The two commands

Both commands run from the repository folder on a computer with Node.js 22. Neither one changes any file.

### `npm run sources:due` — which reviews are coming due

```
npm run sources:due
npm run sources:due -- --as-of 2027-01-15 --horizon 14
```

It lists every source in four groups, each sorted by date:

- **OVERDUE OR EXPIRED** — the review-by date has passed (`OVERDUE`), or a catalog extract is past its printed expiry date (`EXPIRED`). Re-read these first.
- **DUE SOON** — due within the next 30 days (or the number of days given with `--horizon`). Plan the re-read.
- **CURRENT** — nothing to do yet; the list shows when each one comes due.
- **UNDATED** — no review date was recorded. Check these by hand and ask a developer to record the date you checked.

`--as-of` lets you look ahead ("what will be overdue on January 15?"). The command finishes with exit status 1 when anything is overdue or expired, otherwise 0; the weekly job uses that to decide whether to open an issue.

### `npm run sources:check` — has the payer changed a document?

```
npm run sources:check
```

It downloads each fingerprinted payer PDF again (UnitedHealthcare and Evolent/RadMD directly; HMSA through its two medical specialty drug policy directory pages) and compares the file's SHA-256 fingerprint with the one on record. Each document gets one result:

| Result | Meaning | What to do |
| --- | --- | --- |
| **UNCHANGED** | The payer's file is byte-for-byte the one that was reviewed. | Nothing. This does not replace the 90-day review. |
| **CHANGED** | The payer has revised the document. The new fingerprint is printed. | Open the new document and re-read its title, scope (lines of business, products, codes), version or effective date and criteria. Then have a developer update the record in [shared/payer-policy-evidence.mjs](../shared/payer-policy-evidence.mjs) **and** the digest in [policy-source-checksums.json](policy-source-checksums.json) together. Never accept a new fingerprint without that re-read: the tool deliberately never updates the registry itself. |
| **UNREACHABLE** | No usable download this time: an HTTP error, a time-out, a file over 20 MB, a page that was not a PDF, or an HMSA policy that is no longer listed in its directory. | Run it again later. If it keeps happening, open the source page in a browser. A policy missing from the HMSA directory may have been withdrawn or replaced, which needs the same re-read as CHANGED. |
| **SKIPPED** | Nothing to compare automatically: the Medicare LCD web pages have no file fingerprint, and a record without an HMSA document number cannot be found in the directory. | Re-read these by hand at their review date. |

Exit status: 1 if anything is CHANGED, 2 if nothing changed but something was UNREACHABLE, otherwise 0. On a network that requires an HTTPS proxy, run it as `NODE_USE_ENV_PROXY=1 npm run sources:check`.

Known gaps today: the two HMSA Medicare Advantage records (Prolia and biosimilars; Evenity) are SKIPPED because their records hold a file name instead of HMSA's document number. On November 21, 2026 their HMSA directory links (document numbers 203599464 and 203599181) matched the registered fingerprints byte for byte; a developer can record those numbers so the weekly check covers them. Two QUEST formulary files (HMSA and UnitedHealthcare Community Plan) have no recorded review date and show as UNDATED.

## The weekly automatic check

Every Monday at 17:00 UTC (7:00 a.m. in Hawaiʻi) GitHub runs the [Scheduled checks](../.github/workflows/scheduled-checks.yml) workflow. It runs the syntax check, the full test suite (also with the clock moved 45, 120 and 400 days ahead), `npm run sources:due` and `npm run sources:check`. Anyone with access can also start it from the repository's **Actions** tab: choose **Scheduled checks**, then **Run workflow**.

If anything fails, it opens **one** issue titled **"Scheduled checks need attention"** with both reports pasted in and a link to the run. If that issue is already open, it adds a comment instead of opening another. Work through the items above, then close the issue; the next problem opens a fresh one. Nothing is changed automatically.

## The December task: next year's plan documents

Plan years start on January 1, and many documents in Coverage Desk are tied to one year. Each December, collect next year's public documents and give them to a developer to capture (with a fingerprint and the date you obtained them), for example:

- **HMAA / OptumRx formulary for January 2027.** The current extract is the July–December 2026 OptumRx Premium list. It expires on December 31, 2026, and `npm run sources:due` will show its rows as EXPIRED from January 1, 2027 until the new list is captured.
- **QUEST formulary files** from HMSA and UnitedHealthcare Community Plan for 2027.
- **Kaiser Permanente Hawaiʻi** individual and QUEST formulary files: the 2027 individual files are already listed; confirm them and capture any replacement.
- **Medical and drug policies** that payers re-issue for the new year (UnitedHealthcare, HMSA and the Evolent joint-surgery matrix), and each Medicare Advantage plan's 2027 documents.

The due-date report does not mark a 2026 file as expired on January 1 unless the record carries a printed expiry date, so check the year in each formulary's name as well. Never carry a 2026 document forward as if it applied to 2027, and never enter a date or a criterion that is not in the payer's document; leave it blank or "not verified" instead.

See also: [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) for the overall state of the trial and [SOURCES.md](SOURCES.md) for the source list.
