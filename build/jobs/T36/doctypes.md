# doctypes (T36)

**Status** · session_019F8gBQfqTqF5hBsFcHmxd7 · depth 2 · WORKING · handled B0

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

## J1 · COMPLETE

T36-4 done (record: build/jobs/T36/doctypes.md, Completion). R35 out-of-sample measure, 2026-10-07, under the held first profile: 24 fresh policies (AI 139 and 23 DGOs; every SO and AI on PowerDMS is already among the 50), none among the 50; answers committed before the reader ran (45320047f7). All 24 CERTAIN and typed policy through the registry. 20 of 24 headers wholly right (83%). Per field: type 24/24, number 24/24, title 22/24, effective 24/24, supersedes 1/1, reference 11/11, coordinator 9/11, review_due 4/6, revision_cycle 4/5. BELOW 90%: coordinator, review_due, revision_cycle. The re-scoping of R25–R34 is yours; not re-scoped, not tuned. Causes: D-4's revision memo running header anchors the header too early (one miss in each of the three fields); B-01's 'DD MMM YY' placeholder dropped, not kept as written (against R26; fix deferred to keep the measure clean); K-6's coordinator runs into the body's caps name; H-10's title read from the contents page. Reader code unchanged; tests 40/40; format, architecture, coverage (36/36) and ownership checks all 0 failures. RS1: read whole about 140 KB; two worker summaries (about 20 KB and 18 KB, citations in the record); one point mattered (registry precedence), checked: all 24 policy.

## CHANGE B2 (K2079): the re-scope applied

Merged `tranche/T36` (R26 amended, K2079). R35's recorded figures are unchanged: the measure was taken before these fixes and stays the measure (20 of 24, 2026-10-07), held as such in the R35 test.

- **R26 `measured: "below_target"`.** `coordinator`, `review_due` and `revision_cycle`, where read, carry `measured: "below_target"` (`BELOW_TARGET` in `policy-header.mjs`, with the measurement it rests on). No other field carries it. Tested under the test profile and the held profile.
- **The four causes, fixed in `policy-header.mjs`, each tested on its fixture (named R26):**
  1. **D-4: a running header anchored the block too early.** Every line opening with a series' label is now a candidate anchor. The first one stands, unless the same series and number anchor again further on and that block reads more fields. That is the case here: the revision memorandum's running header prints the order's name and one field above the order's own header. Where the two blocks read the same fields (H-10 and M-9 print their header before and after the contents page), the first still stands.
  2. **B-01: a placeholder date was dropped.** The placeholder shape now also knows `DD`, `MM` and `YY`/`YYYY` blanks. "DD MMM YY" is kept as written, with `date: null` and why.
  3. **K-6: the coordinator ran on into the body.** A field's value printed beside its label ends at its line when the next line is set in capitals and the value is not: that capitalised line is the order's name. The title is excepted, because the old layout's index terms are followed by the name.
  4. **H-10: the title was read from the contents page.** A contents heading, singular or plural ("TABLE OF CONTENT"), is page furniture, so it is never taken as a title. The title stays the header's own.
- **In-sample figure, labelled so (not R35's measure):** after the fixes, all 24 of the fresh policies read wholly right (24/24; every field at 100%), including the four that missed: D-4 (96), B-01 (23), K-6 (419) and H-10 (200). On the 50, the figures are unchanged: 46 of 50 headers and 45 of 50 section sets.
- **N751** (a fresh measure once new policies exist) is BOB's measurement; nothing is owed here.

**Found in other modules.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) includes `doctypes/policy-header.mjs`, so it is stale after this change. It is not mine to rebuild (mechanics §14); it is already on K2079's list of what is stale for L1's close.

**Tests and checks run (B2).**
- `node --test doctypes/test/*.test.mjs`: tests 45, pass 45, fail 0.
- The users of the changed service, R26's added key: roster-reader 22/22, reading-pipeline 91/91, extraction 127/127, plane 131/131.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs`: 0 failures. `checks/coverage.mjs`: 36 of 36 ids; 0 failures. `checks/ownership.mjs`: 7 files; 0 failures.

Size (session_019F8gBQfqTqF5hBsFcHmxd7): test runs 10, module lines 45 (`policy-header.mjs`; test lines about 100)
