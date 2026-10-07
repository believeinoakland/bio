# doctypes (T36)

**Status** · session_019F8gBQfqTqF5hBsFcHmxd7 · depth 2 · COMPLETE · handled B0

## Completion (T36-4)

**Entry applied: T36-4 (N709; K1924, K1902 (5), K1862 (1)), R35's out-of-sample measure.** No reader code changed: the measure is of the reader as T35 built it.

- **Capture.** 24 fresh policies of the 50's issuers and series, none among the 50 (by id and by sha256), fetched 2026-10-07 and read as the plane reads them by `doctypes/test/capture-policies.mjs` (unchanged reading; it now takes the fixture's name as a second argument): `test/fixtures/policies-fresh.json`, chosen as `test/fixtures/policies-fresh-pick.json` records. Every Special Order and City Administrative Instruction on OPD's public PowerDMS index is already among the 50, so the fresh set is: the City's own copy of **AI 139** (`oaklandca.gov`), the one City AI found that the 50 lack, and **23 Departmental General Orders** taken at an even step through the alphabetical list of the 135 numbered DGOs on PowerDMS not among the 50 (two non-orders in the DGO folder, an evidence-envelope sheet and a roster, excluded as not policies). All 24 read by Tier 2 (unpdf 1.8.0 merged by `mergeTier2Text`); no scan.
- **The member's reading** (`test/fixtures/policies-fresh-answers.json`), written by me from each document's text under the conventions of the 50's answer key and **committed (45320047f7) before the reader was run on any of them**. One convention added for a case the 50 did not have: a placeholder date ("Evaluation Due Date: DD MMM YY") is the text as written, as R26 says.
- **Measurement, 2026-10-07, under `jurisdictions`' held first profile (its series and labels, R67, R69), no page list:** all 24 detected `policy` at CERTAIN; **20 of 24 headers read wholly right (83%)**. Per field (right / policies whose header prints it): type 24/24, number 24/24, title 22/24 (92%), effective 24/24, supersedes 1/1, reference 11/11, **coordinator 9/11 (82%)**, **review_due 4/6 (67%)**, **revision_cycle 4/5 (80%)**.
- **Below 90%, named (R35): `coordinator`, `review_due`, `revision_cycle`.** Re-scoping R25–R34 is BOB's; I have not re-scoped them and have not tuned the reader on these 24 (that would make the measure in-sample again). The misses, by cause:
  1. DGO D-4 (96), coordinator, review_due, revision_cycle, title: a revision memorandum in front of the order whose second page ends in a one-line running header ("DEPARTMENTAL GENERAL ORDER D-4 Effective Date: / … 1 Apr 10"). The reader anchors there, before the order's own boxed header further on, and reads only type, number and effective. One document accounts for one miss in each of the three named fields.
  2. DGO B-01 (23), review_due: "Evaluation Due Date: DD MMM YY". The reader's placeholder shape knows `XX` and `MMM` but not `DD`/`YY`, so the field is dropped as "no calendar date", not kept as written. This is against R26 ("a placeholder … is kept as written"), a flaw in the reader rather than a limit of label reading. It is the one fix I could make without guessing, but making it now would tune on the out-of-sample set. Left for BOB's re-scoping decision (deferred, below).
  3. DGO K-6 (419), coordinator: the value runs on into the order's capitalised name on the next line ("… Instructor Staff DEPARTMENT RIFLES"), with no page furniture between header and body.
  4. DGO H-10 (200), title: the order's name is read off the contents page ("TABLE OF CONTENT", singular, which the furniture shape does not know) instead of page 1.
  Without D-4 alone, coordinator would be 9/10, review_due 4/5, revision_cycle 4/4. With 5–11 documents printing each of these fields, one document moves a field by 9–20 points.
- **Tests.** `doctypes/test/policy.test.mjs` gains "R35 measured out of sample …": the set's provenance, none among the 50, series the 50 measured, every one CERTAIN and typed `policy` through the eight-type registry (no earlier type takes any), 20 of 24 whole, each field as recorded, and the below-90% fields named. Fixture loaders in `test/policies.mjs` (`FRESH`, `FRESH_ANSWERS`). Section boundaries were not re-measured out of sample (R35 asks for header fields only).

**Deferred.** (1) Placeholder dates in `DD MMM YY` form (cause 2): a reader fix, held until BOB rules on R25–R34, so the out-of-sample measure stays clean. (2) Causes 1, 3, 4: reader layout gaps, likewise BOB's to weigh in the re-scoping.

**Found in other modules.** None.

**Tests and checks run.**
- `node --test doctypes/test/*.test.mjs`: tests 40, pass 40, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `checks/architecture.mjs … doctypes`: 34 product files, 64 relative imports; 0 failures.
- `checks/coverage.mjs … doctypes`: 36 of 36 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … doctypes tranche/T36`: 5 files changed; 0 failures.

**Reading set (RS1 evidence; START B1, `dryrun/CERTIFICATION.md` RS1).** Read whole myself: about 140 KB. That is my requirements (19 KB); `build/layers.md` §"No jurisdiction in the product" and layer 1's row; `jurisdictions`' Purpose, R63, R67, R69, and its profile's policy series and `policy_headers` entries; `policy.mjs`, `policy-header.mjs`, `sections.mjs`, `test/policy.test.mjs`, `test/capture-policies.mjs` and `test/fixtures.mjs` (109 KB); and also `test/policies.mjs` (4 KB, the scoring the measure uses), the plan's T36-4 entry and Rules at the opening, and rulings K1862, K1902, K1924 and K1930.

My own workers wrote two summaries for this task only, not kept. Each statement in them cites a file and line, or a requirement id.
- **Rest of `doctypes/` and `doctypes/test/`**, about 20 KB. It cites `index.mjs` (31–59), the docprofile seam (`docprofile/doctypes/index.mjs` 137–218, `registry.mjs` 51–113, `readtext.mjs` 149–332), `site-profiles/recogniser.mjs` 54–66, the CERTAIN paths of regulation, staff_report, meeting_* and staff_directory, and the tests `doctypes.test.mjs` R1, R2, R4, R18, R20 and R21, plus `read.mjs` and `golden-cases.mjs`. The large JSON fixtures were described from their structure, not read whole.
- **Public parts of civil-time, docprofile, site-profiles, pdf-reader, text-chain and the rest of jurisdictions**, about 18 KB. It cites pdf-reader R1–R14 and R34, text-chain R15, R31, R73–R78 and R102, docprofile R4, R5 and R18–R25, site-profiles R1–R15, civil-time R2–R6, R22 and R23, and jurisdictions R1–R4, R6, R14–R16, R23, R31, R41, R50 and R63–R69.

What the summaries added that mattered: one point. A fresh policy could be taken by an earlier CERTAIN type, or a misread number could turn it into `generic`. I then checked all 24 through the registry, and every one is `policy`. Nothing they left out mattered to the measure. Re-reading a cited source was not needed.

Size (session_019F8gBQfqTqF5hBsFcHmxd7): test runs 4, module lines 0 (reader code unchanged; test and fixture lines added: about 50 of test code, 3 fixtures)
