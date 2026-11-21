# 20-case validation before clinical use

The handoff requires a 20-case validation before Coverage Desk is relied on by staff. This page is the protocol; [validation-worksheet.csv](validation-worksheet.csv) is the scoring sheet (opens in Excel or Google Sheets). Nothing here has been run yet.

## Ground rules

- **No patient information goes into the app or the worksheet.** The app needs only the insurer, the plan, the service and the setting. The worksheet records a case number, the month of service and outcomes; keep any key that links a case number to a chart inside ModMed or another approved system, never in this repository.
- Use **completed** authorizations from the last six months, so the real outcome is known.
- Score what the app showed on the day of the test. Policies change; note the app's "reviewed" date if a mismatch looks like a policy revision.

## Roles

| Role | Who | What they do |
| --- | --- | --- |
| Clinical owner | A physician or PA who signs authorization requests | Judges whether the documentation checklist matches what the payer actually asked for; decides whether an error is unsafe |
| Authorization / billing owner | The lead who submits authorizations and reads EOBs | Picks the 20 cases, re-runs them in the app, records route, PA requirement, codes and cost |

## Case mix

The worksheet pre-assigns 20 slots so every focus payer, line and service family is covered: HMSA Commercial (4), HMSA QUEST (2), HMSA Medicare Advantage (3), UnitedHealthcare Commercial (2), UnitedHealthcare or MDX Medicare Advantage (2), UnitedHealthcare QUEST (1), Kaiser (1), Traditional Medicare (2), and three service-driven slots for MACI, hand surgery and revision or partial knee. Substitute a similar case if the practice has none for a slot, and say so in the notes.

## Steps for each case

1. In **Staff workup**, choose the insurer, the plan the member actually had, the year, the service and the setting. Do not type anything else.
2. Record what the app showed: the authorization route, whether it indicated a PA requirement, the candidate codes, and the documentation prompts.
3. Enter the real allowed amounts and benefit values from the EOB into the cost step (amounts only) and record the app's scenario figure next to the patient's actual responsibility.
4. Compare with what really happened and fill in the match columns.
5. Mark **unsafe error = Y** if the app implied coverage, approval or no-PA where that was wrong, attached another payer's or another line's rule, suggested a wrong code as settled, or showed a cost figure as verified when its inputs were not.

## Pass criteria (proposed; the two owners should confirm or change them before starting)

| Measure | Threshold |
| --- | --- |
| Unsafe errors | 0 of 20 |
| Authorization route matches | at least 18 of 20 |
| PA requirement matches, where the app states one | at least 18 of 20 |
| Codes match what was billed | at least 18 of 20 |
| Documentation checklist would have covered the payer's request | at least 16 of 20 |
| Cost scenario within 10% of actual responsibility, for cases where every input was verified | report only; no threshold until five such cases exist |

Any unsafe error stops the validation until it is fixed and that case, plus two similar cases, pass on a re-run.

## After the 20 cases

1. Send the completed worksheet (no identifiers) for fixes; each miss becomes a regression test.
2. Run a four-week pilot with one or two staff using the app alongside the current process, with a weekly review of discrepancies using the same columns.
3. Name an owner for the 90-day source review: every payer record carries a review-due date and shows as overdue after it.
4. Keep patient data out of the app. Any workflow that would store or transmit patient information is a separate project governed by [HIPAA-RELEASE.md](HIPAA-RELEASE.md).
