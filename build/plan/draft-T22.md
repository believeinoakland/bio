# Plan: tranche T22

**Status** · DRAFT for T22, written by a worker for BOB #87, 2026-10-01, on `tranche/T21` while T21 runs (layer 1 closed, K940; layer 2 running). Written from the work that remains (P19 as amended 2026-10-01): every entry of the new `next.md` (after T21's opening housekeeping) and the rows T21's layers 3–11 leave `awaiting stamp` (`current.md` T21, rule 4). Lines marked **[T21]** depend on T21's outcome and are re-checked against its close before T22 opens.

**Cut from** · the new `next.md` (12 entries, every one LEFT OUT of T21 with a hard reason); `current.md` (T21) rules 3–4, its roster, "next.md: every entry" and its carried-over table rows; rulings K921–K940; `build/plan/starts-T21/` (provenance, filing-templates, filings, local-facts, intent, action-clocks, promotion, legacy-tests); `requirements/filing-templates.md` R23, `local-facts.md` R8, `filings.md` "Rows"; `plan/t21-requirements-notes.md` 9; `bio-plane/src/filings/checks.mjs`; `bio-plane/test/system/row-census.test.mjs`; `build/jobs/T20/legacy-tests.md`, `build/jobs/T21/*.md`.

**T22's priorities (BOB's, P17):** every entry that can safely be done (P19). At this draft, that is the stamp of T21's layers 3–11 (P8: promotion's one job is in layer 2, so rows changed after it wait for the next tranche's layer 2), and whatever T21's layers 2–11 leave or file (P10) **[T21]**. Every `next.md` entry has a hard reason against T22 (below); none is held back for the tranche's size or a job's smallness.

## Rules at the opening

T21's rules hold (merge early, §4; one file, one editor, §12.2; a job names each `not yet met` mark it meets, BOB strikes it at the merge, K775 (6); no layer closes red except a red accepted by name; owners export, plane composes, K861).

1. **The stamp (P8).** Promotion (L2) moves `CATALOG_VERSION` over every row change since T21's stamp (T21's promotion job, 1.50.0 → its new version), with a stamp note in the previous notes' form, and re-pins `ROW_CENSUS` (R50) to the tree, module tables only; `GATE_VERSION`'s literal kept (R34). The rows are the list below, as T21's job records name them `awaiting stamp` (each job lists them in its COMPLETE, per its START). **[T21]**
2. **The census suite.** `bio-plane/test/system/row-census.test.mjs` (legacy-tests' `tests`) holds the pin against the tree with its `AWAITING_STAMP` declarations and a fixture of the stamp's own lines (`fixtures/row-census-<version>.jsonl`). After T22's stamp the declarations made for T21's layers 3–11 are retired and the new version's fixture added (K884's pattern: PROMOTION #21 with LEGACY-TESTS #18). **[T21]** (see For BOB 2).
3. **Rows changed in T22's layers 3–11**, if any T21 leftover adds one, are `awaiting stamp` for T23 (P8).

## Rows awaiting stamp (T21's layers 3–11), for T22's promotion job

Each **[T21]**: confirmed against the job's COMPLETE; the requirements govern where `current.md` rule 4 differs.

| owner (T21 layer) | row | change | source |
|---|---|---|---|
| provenance (L3) | C-53.13 `CAPTURE_HELD_BY_ANOTHER_BUNDLE` | translation re-worded ("record", N458); code kept | `starts-T21/provenance.txt`; K899 (1) |
| filing-templates (L9) | C-115.31 | moved from filings, re-keyed `MACHINE_CANNOT_DRAFT_TEMPLATE`, translation re-worded | filing-templates R23 |
| filing-templates (L9) | C-115.32, .33, .35, .37 | moved from filings with their numbers; `where` now this module's site | R23 |
| filing-templates (L9) | C-115.36 | moved, re-keyed `TEMPLATE_TIER3_FILE`, translation re-worded | R23 |
| filing-templates (L9) | C-115.38 `NO_SUCH_TEMPLATE` | moved; filings passes its answer through | R23; t21-notes 9 |
| filing-templates (L9) | every C-125 row | new family (K933): its other codes (R1–R25, e.g. `TEMPLATE_RETIRED`, `TEMPLATE_NOT_OFFERED`, `MACHINE_CANNOT_APPROVE_TEMPLATE`, `MACHINE_CANNOT_REVIEW_TEMPLATE`, R25's) | R23; K927, K933 |
| local-facts (L9) | every C-126 row | new family (K933) | local-facts R8 |
| filings (L9) | C-115.6 `KIND_NO_TEMPLATE`, C-115.17 `NOT_TIER3` | retired; numbers never reused | filings "Rows"; K921 §5 |
| filings (L9) | `TEMPLATE_USE_BRIEF`, `TEMPLATE_USE_FILE`, `TEMPLATE_AND_TEXT` | new C-115 rows | filings "Rows" |
| filings (L9) | C-115.40 `TEMPLATE_NOT_NAMED` | translation re-worded (a filing without a template) | filings "Rows"; t21-notes 3 |
| filings (L9) | C-115.34 `TEMPLATE_FROM_UNAPPROVED` | stays in filings; its `where` (`templateSave`, retired with R26) moves to R32's site, if the job moves it | `filings/checks.mjs`:154; R32 |
| intent (L7) | `PROJECT_GRAMMAR`'s registration ids `['C-2.9']` | behaviour, no row (a composition: declared, not a census row) | `starts-T21/intent.txt` |
| action-clocks (L9), and any other L3–L11 job | any row its COMPLETE names | add, move, re-key or re-word | its START |

Not stamped: jurisdictions' codes are not catalogue rows (t21-notes 10; `starts-T21/promotion.txt`); escalation's trigger-id form (N462) and connections' `out_of_view` (N459) change no row.

## Roster (by layer; the [T21] lines are fixed at the opening)

- **L1** none.
- **L2** promotion (the stamp, rule 1). **[T21]** the version it stamps from is T21's promotion job's.
- **L3–L10** none at this draft. **[T21]** any entry or share a T21 job leaves open rejoins here in its module's layer; any entry T21's layers 2–11 file in `next.md` (P10) is placed by its own hard reasons.
- **L11** legacy-tests (rule 2: the census suite's declarations retired and the new fixture, if the stamp needs it). **[T21]** joins only if T21's own legacy-tests job (N469) does not leave the suite re-pinned for the next stamp; see For BOB 2.

## STARTs, sketched (BOB writes the final ones)

**L2**
- **promotion** · The stamp (rule 1): move `CATALOG_VERSION` (`src/gate.mjs`) over the rows above, as T21's L3–L11 records name them (read each `build/jobs/T21/*.md` and `*.bob.md` of layers 3–11 for "stamp"); re-pin `ROW_CENSUS` (R50) to the tree; keep `GATE_VERSION`. Proof: R34, R50 tests; `row-census.test.mjs` green with the new pin. Merge early.

**L11**
- **legacy-tests** (if needed) · `row-census.test.mjs`: retire T21's `after: "<T21 version>"` declarations (stamped), add `fixtures/row-census-<T22 version>.jsonl` reproduced on the stamp commit; the negative control drives `compare` as before. Proof: the 47 kept suites green, no SKIP.

## next.md: every entry (12), each LEFT OUT of T22

| entry | module | hard reason | note |
|---|---|---|---|
| DIST-14 | office-readers | deploy | the CSV bound measured on a deployed plane |
| N75 | image-codecs | deploy | the 61.3 MB bound measured on a deployed plane; code met (K281) |
| N34 | pdf-worker | deploy; dependency not yet built | the bound measured on a deployed plane; PPM/PPT JBIG2 waits on a fixture encoder. A split review precedes a job that grows pdf-worker (P6) |
| N144, N232 | affordances, legacy-ui (N232 also skills) | Bob's (K899 (2)) | wait for the new interface |
| N68, N70 (legacy-ui shares) | legacy-ui | Bob's: UX (K633) | `app.html`'s stale docprofile copy |
| N241, N371 | legacy-ui | Bob's: UX (K633) | |
| N437 (legacy-ui share) | legacy-ui | Bob's: UX (K633) | `app.html` comments |
| N461 (release share) | legacy-ui, at the release | deploy (the next signed release build, Bob's act) | `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs`, `newgroup/dist/newgroup.bundled.mjs` |
| N467 (legacy-ui share) | legacy-ui | Bob's: UX (K633) | `civicos-ui/check-mock-envelope.mjs` |

**Rows carried over (not N entries), each LEFT OUT, as `current.md` (T21) states them:** office-readers R28/R29 retired (deploy: each migration runs at every instance); `MODES.plan` deployed (deploy); newgroup installer with N336 (deploy, Bob's act); contradiction R41 and the K5 arms (deploy); `PLN-` affordances, plan-page surface, joint action (Bob's, K608 (4), K600 (c)); N389, N-A13 (Bob's: UX, K633). Also not entries: the first profile's facts without a source (the Civil Grand Jury's, the Controller's, the Council's and the State Controller's hours; any 2027 year; the City's 09-09 and 11-11; M-188's county list): measurements (K925, K934); a member's confirmation reaches them through local-facts.

## Depends on T21's outcome

- Every row in the stamp table (each from its job's COMPLETE), and the stamp's starting version.
- Every entry T21 carries (N452, N453, N456, N457, N458, N459, N460, N462, N463, N464, N465, N468, N469 and K921's filing templates and local facts): any share a T21 job does not meet rejoins `next.md` and is placed in T22 by its layer, unless a hard reason holds.
- Every accepted red by name that T21 does not close (K936, K939, `current.md` rule 3).
- Every entry filed during T21's layers 2–11 (P10).
- Whether legacy-tests joins L11 (rule 2).

## For BOB

1. **Rule 4's list in `current.md` is stale on filings' rows.** It says "filings' C-115.31–.37 moving"; the requirements (filing-templates R23, filings "Rows", K927's adopted notes 9) move C-115.31–.33, .35–.38 and keep .34, .39, .40 in filings. The table above follows the requirements.
2. **The census suite across T21's layers.** `row-census.test.mjs` fails on any row changed after the pin unless `AWAITING_STAMP` declares it (its header). T21's provenance (L3) and filing-templates, filings, local-facts (L9) change rows, and the suite now runs in CI (N466, K932); T21 promotion's stamp (L2) also needs the suite's pin moved, in a file legacy-tests owns. T21's legacy-tests START (N469 only) does not name these declarations, nor intent's L7 registration change, which is a composition the suite declares apart (`COMPOSITIONS_AWAITING`, R50, K464). Recommended (BOB's, P17): name them in T21 now, through P9 to legacy-tests' L11 job (the declarations for T21's L3–L11 rows, and the fixture for T21's stamp if PROMOTION #22 does not add it), or accept the suite red by name from each merge until it; then T22's legacy-tests line is needed only to retire those declarations after T22's stamp.
3. **N469's legacy-ui notes have no `next.md` home.** The legacy-tests START leaves `civicos-ui/app.html`, `README.md` and `check-mock-envelope.mjs` to legacy-ui (Bob's UX, K633), and N469 was filed only into T21's plan. Recommended: add them to N467's legacy-ui share at T21's close (same kind, same reason), or file a new entry; this draft adds none.
4. **Carried entries moved early.** The housekeeping moves T21's carried entries while it runs, unlike K424 and K411; its Status says a share T21 leaves open rejoins at the close. Record that once (P15) if adopted.
5. **JURISDICTIONS #5's note on K925 (3)** (`jobs/T21/jurisdictions.md`:20): R33 makes a listed year complete, so the City's 2026 entry without 09-09 and 11-11 counts them as business days for the Controller, the Council and the Auditor. No ruling answers it yet; it is K925's reading, not an entry. Confirm or file one.
6. **A thin tranche.** At this draft T22 holds one job for certain (the stamp) and one conditional. That is P8's hard reason, not the tranche's size; T21's close will add what its layers leave.
