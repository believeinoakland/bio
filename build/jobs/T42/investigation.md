# investigation (T42)

**Status** · session_019Hq9peCLMijcPKpNYfPUpH · depth 2 · COMPLETE · handled B2

## Completion (INVESTIGATION #2)

**Reading set** (mechanics §17). START measured 625 KB, over 300 KB. Read whole myself: my requirements (11 KB); layer 7's row of `build/layers.md`; my plan entry T42-21; `draft-T42-reqs.md` N843 and N846; K2566, K2572, K2608 (and K2524 for R18's history); the code the entry changes, `index.mjs` and `checks.mjs`; the tests it changes, `plan.test.mjs`, `interview.test.mjs`, `quiet.test.mjs` and `fixture.mjs` (about 158 KB in all). Used services: `intent` R7 and its `watchSet` (read in full); `monitoring`'s `#reportArrivals` (its R70, my user) read to confirm what it reads of `watchedProjects` and `watchArrival`. A worker read whole the rest of my module, `schema.mjs`, `claims.test.mjs`, `milestones.test.mjs` and `reports.test.mjs`, and wrote a summary (about 4 KB, each statement citing file and line): no table, trigger or test there names the re-coded codes, `watchArrival`, `watchedProjects` or `watchSet`, or relies on `milestonesOf` answering a failed read as absent; the schema needs no change.

**Entries applied (T42-21).**
- (N843) R12 and R23: C-146.21 re-coded in place `NO_SUCH_PROPOSAL` → `NO_SUCH_PLANNING_PROPOSAL` (`planAccept`), C-146.26 `NARRATIVE_NOT_A_LEG` → `INTERVIEW_NOT_A_LEG` (the check registered with `promotion`); numbers, `where`s and translations unchanged (K238).
- (N846) R18: `watchArrival` writes the arrival, then takes each read (`quiet`, `standing`, `milestones`) after the write; a read that throws, or that refuses the plane's own viewer (who sees every project that exists; `milestonesOf` answers a failed storage read as `NO_SUCH_PROJECT`), is answered `{unread: <why>}` in its place, and nothing throws after the write. A refusal, or a failure before the write (the transaction rolled back), records nothing. `watchedProjects()` follows `intent` R7's `cursor` to the end (`#watchSetWhole`): entities and progressions from the first page, every page's captures; it answers `watch: null` with `watch_unread` when a page cannot be read, is not R7's shape, repeats its cursor, when intent says its measure was cut (`measure_truncated`, so the entities are not whole), or past `WATCH_CAPTURES_MAX` (100,000) captures.

**Rows, each `awaiting stamp` (T43's stamp; plan rule 4 (2)):**
- C-146.21 re-coded `NO_SUCH_PROPOSAL` → `NO_SUCH_PLANNING_PROPOSAL` (`where` and translation unchanged)
- C-146.26 re-coded `NARRATIVE_NOT_A_LEG` → `INTERVIEW_NOT_A_LEG` (`where` and translation unchanged)

**Tests** (each marked id explicitly, with a negative control, K874):
- R23, `plan.test.mjs`: absent, unnamed, non-numeric, unseen, another project's member and no stamp each answer `NO_SUCH_PLANNING_PROPOSAL` with C-146.21 and the kept translation; nothing written; `NO_SUCH_PROPOSAL` is neither minted nor answered. The negative control: a joined participant accepts the same proposal.
- R12, `interview.test.mjs`: the check's finding is `INTERVIEW_NOT_A_LEG`, C-146.26, translation kept; `NARRATIVE_NOT_A_LEG` is not minted here and is answered neither by the check nor through `promotion`. The negative control (an ordinary step passes) stands.
- R18, `quiet.test.mjs`, two new tests. (1) `projectStanding` throwing: the arrival is recorded and answered `ok` with `standing: {unread}`; storage failing for the reads after the insert: `quiet` and `milestones` unread, the arrival kept. The insert failing records nothing; a refusal records nothing. The negative control: a read that did not fail is never marked unread. (2) Three pages of captures carried whole, the cursor followed (`null`, `c2`, `c4`). Page 2 failing gives `watch: null` with `watch_unread`, never page 1 as whole (the negative control); so do a repeating cursor, a page not of R7's shape and `measure_truncated`; one page with no condition is whole.
- Own flaw fixed (found by the worker): R15's "to a reader who cannot see the record it names, the claim still reads as recalled" was stated in `claims.test.mjs` but not checked. It is now tested: Cat ties a hidden project's question, and Ann reads `as_recalled` with the record unnamed; the negative control is that Cat reads `found`.
- `fixture.mjs` exposes the `intent` stand-in as `w.intent`.

**Deferred** (own module, tests only; no behaviour in doubt): R1's "a project not at `FULL` answered as `membership` R44 says" has no test of its own (the gate is `#projectSeen`, shared and tested through stranger, invited and hidden cases). `milestones.test.mjs`:166 pins "the fixture's seven bundles", fragile to fixture growth. `reports.test.mjs` uses `NOWISH` (:19) before its declaration (:47). Each was left out because it is outside T42-21; each is a small test-only follow-up.

**Found in another module:** none. Generated artifacts staled: the plane bundle (`bio-plane/dist/`, regenerated at layer close, rule 4 (10)).

**Module tests:** investigation 31/31. **Users' suites (P11), from `bio-plane/`:** monitoring 124/124; queue 136/136; notice-producers 90/90; plane 166/166. answer-envelope 28/29, its one red `test/m/answer-envelope/families.test.mjs`:425 (`HELD_EARLIER` still lists C-146.21, C-146.26 and C-142.28 as held earlier), the plan's accepted red rule 4 (6) (K2651) until T42-27; red before this change too, and it now lists exactly those rows less. System `row-census.test.mjs` 7 pass, 1 fail: the census moves accepted as rule 4 (2), among them my two rows above.

**Checks** (from the process repository): format 0 failures (147 modules); architecture 0 failures; coverage 23 of 23 live ids named, 0 failures; ownership 0 failures.

Size (session_019Hq9peCLMijcPKpNYfPUpH): test runs 12, module lines 1526

## J1 · COMPLETE

T42-21 applied. N843: C-146.21 re-coded NO_SUCH_PLANNING_PROPOSAL (R23), C-146.26 INTERVIEW_NOT_A_LEG (R12), numbers and translations kept; both rows named awaiting stamp in my record. N846 (R18): watchArrival records then answers each read or {unread}, never throws after the write; watchedProjects follows intent R7's cursor to the end, watch:null + watch_unread when not whole. Tests: investigation 31/31, each marked id tested explicitly with a negative control; R15's untested 'reader who cannot see the record' clause also now tested. Users: monitoring 124, queue 136, notice-producers 90, plane 166 green; answer-envelope 28/29, red only families.test.mjs:425 (rule 4 (6), K2651); row-census red only rule 4 (2). Checks format, architecture, coverage 23/23, ownership: 0 failures. Deferred (test-only, own module): R1 not-at-FULL clause untested; milestones.test.mjs:166 fixture count pin; reports.test.mjs NOWISH order. Record: build/jobs/T42/investigation.md.

## B2 applied (INVESTIGATION #2)

**CHANGE B2 (K2667): the three deferrals done**, my own module's tests only, no behaviour changed:
- R1's "a project not at `FULL` answered as `membership` R44 says": a new test in `milestones.test.mjs` drives four sights, checked first through `membership.sight`: a discoverable project's stranger and a hidden project's administrator at `existence`, a stranger to a hidden project at `none`, and a joined participant at `full`.
  - At `existence`, `milestoneSet` and `milestonesOf` naming the project answer C-70.1 `PROJECT_SEEN_NOT_A_PARTICIPANT`. The answer carries the id and name and nothing else; to the administrator it also carries the hidden project's owners' handles.
  - At `none` the answer equals that for a project that does not exist (`NO_SUCH_PROJECT`).
  - The four acts naming a milestone inside the project answer `NO_SUCH_MILESTONE` at every sight below `full`, since R44 says nothing inside is widened. `milestonesOverdue` gives the administrator nothing, and nothing is written.
  - The negative control: at `full` a joined participant reads and revises the milestone.
- `milestones.test.mjs` R5 no longer pins "the fixture's seven bundles". It measures `bundles`, `observation_log`, `inquiry_basis` and `steps` before and after `milestoneSet` and asserts each is unchanged, so it holds whatever the fixture holds.
- `reports.test.mjs`: `NOWISH`, a fixed instant (no wall clock), is now declared at the top, before every test that uses it. Each of the file's five tests passes run alone (`--test-name-pattern`).

**Module tests:** investigation 32/32. **Users' suites (P11):** monitoring 124/124; queue 136/136; notice-producers 90/90; plane 166/166. answer-envelope 28/29, its one red `test/m/answer-envelope/families.test.mjs`:425, the accepted red rule 4 (6) (K2651), unchanged from J1.

**Deferred:** none. **Found in another module:** none.
Size (session_019Hq9peCLMijcPKpNYfPUpH): test runs 22, module lines 1526

**Checks:** format, architecture, coverage (23 of 23), ownership: 0 failures.

## J2 · COMPLETE · re B2

B2 (K2667) applied, tests only: R1's not-at-FULL clause tested at the interface across existence (discoverable stranger; hidden project's administrator, with owners), none (as absent) and acts inside the project (NO_SUCH_MILESTONE), negative control a joined participant at full; R5 measures bundles/observations/legs/steps before and after rather than pinning a fixture count; reports.test.mjs NOWISH declared first, fixed instant, each test passes alone. investigation 32/32. Users: monitoring 124, queue 136, notice-producers 90, plane 166 green; answer-envelope 28/29, red only families.test.mjs:425 (rule 4 (6), K2651). Checks format, architecture, coverage 23/23, ownership: 0 failures. Nothing deferred.
