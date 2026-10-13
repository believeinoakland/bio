# action-plans (T47)

**Status** · session_01Po9nWpxYmQwZZ27A9oJztP · depth 2 · COMPLETE · handled B1

## Record

**Entry** (T47-43): (N964) R48, R19's `date_past` and `date_before_phase` on the plan's local day, undetermined (R28) with no zone held; (N963, N992) R49, C-124.63 `DOCUMENT_FIRST_NO_REASON` kept for both of R42's arms, its translation read by key from DEC-199's sentence (no new code); (N966) R50, the public part names a closed plan's closing instant `closed.at`.

**How the reading set was read** (mechanics §17; K2032). I read these whole myself: `build/requirements/action-plans.md` and the module's code, all five files (`index.mjs`, `checks.mjs`, `doc.mjs`, `values.mjs`, `schema.mjs`). I also read whole `t46.test.mjs`, the R19 tests in `read.test.mjs` and the fixture's exports. The START put the set at 1050 KB, over the 600 KB limit. Two helpers in this session read the rest in full and each wrote a digest citing file and line; the sources stay binding:
- (a) every test file and the fixture under `bio-plane/test/m/action-plans/`;
- (b) civil-time's Purpose and `localDay` (R1) with its code; actions' Purpose, R68 (`place()`, `zoneOf`) and R100 with their code; `words.json`'s entries for `refusal.DOCUMENT_FIRST_NO_REASON`, `refusal.SCENARIO_OUT_OF_RANGE` and `plan.close.lessons`; DEC-199; following R24 and its plan watch (`#planClosedAt` reads `p.closed.at`); `build/layers.md` layer 9; the row census and its `awaiting stamp` syntax.

Points I relied on from the digests:
- `localDay` throws `TypeError` on a null zone and refuses `ZONE_INVALID` or `DATE_INVALID`, so the caller guards for both.
- `zoneOf(place())` is a plan's zone (R68, re-stated T47); R100's `actionZone` is an action's own clock, not a plan's.
- following reads `closed.at` only.

**Applied.**
- **R48.** `#checks` now takes the day from `#localDay(ms, zone)`, with the zone read once per read through `#zone()`: `zoneOf(actions.place())`, the read R46 (b) already uses. This replaces `dayOf`, the UTC day.
  - `date_past`: a pending option's date before the local day of the read's instant.
  - `date_before_phase`: a date before the local day of the phase's earliest start.
  - With no zone held, or a day that cannot be read, each such check is answered `{check, option, date, state: "undetermined", says}` (with `scenario` and `phase` for `date_before_phase`), giving the reason. It is never computed on the UTC day and never left out.
  - Every other check is unchanged. `plansToLookAgain` uses the same `#localDay`, its behaviour unchanged.
- **R49.** `PLAN_WORDS` holds `refusal.DOCUMENT_FIRST_NO_REASON` verbatim (DEC-199's sentence), and C-124.63's translation reads it by key. The code, number, `where` and behaviour are unmoved, and no code is added.
  - **Row awaiting stamp (T48):** C-124.63 `DOCUMENT_FIRST_NO_REASON`, its translation changed (plan rule 5 (2)).
- **R50.** No code change was needed. `planRead` already answered `closed: {at, by, reason, note, summary}` for a closed plan only (`close_note_prompt` otherwise), with `at` the close entry's instant from this module's clock. Comments now name R50, and a test pins it.
- **Tests.**
  - New `t47.test.mjs`, one test per requirement with controls:
    - R48 `date_past`, west (Halifax) and east (Tokyo) of UTC across local midnight, no zone, and no profile;
    - R48 `date_before_phase`, local start day against UTC, east-zone control, no zone, and a set-aside scenario;
    - R49, six arms (absent, empty, over 500, quote, backslash, line break) plus the preview each answering the key's sentence; control: a well-formed reason lands and no second code exists;
    - R50, `closed.at` equal to the close's instant across later reads, and no `closed` key while open or paused.
  - `t46.test.mjs`: R47's control on C-124.63 is re-stated, since R49 amends that clause of R47. Its new control: rows `words.json` does not hold keep their own words (`PLAN_NO_TITLE` checked). This changes no test's strength.

**Own code read whole; flaws (P8).** None found beyond the entry. Last tranche's deferred item, R19's UTC day (T46 J1 item 2), is this tranche's R48 and is done.

**Found elsewhere** (REPORT J1):
- `setup-words`: `bio-plane/src/setup-words/index.mjs:492`, generated from `words.json` at 3f40899950, still holds the old `refusal.DOCUMENT_FIRST_NO_REASON` sentence ("What happened isn't documented yet…"). It is stale against `words.json` (DEC-199) and is that module's to regenerate.
- The plane bundle and `program.mjs` are staled by this change (rule 5 (4)).
- C-124.63's changed row makes the row census red until T48's stamp (rule 5 (2)).

**Tests and checks.**
- `node --test bio-plane/test/m/action-plans/`: tests 83, pass 83, fail 0.
- Users of action-plans (`planRead`'s checks may now answer `undetermined`; P11):
  - Fully green: plan-work 45/0, following 75/0, action-producers 45/0, `test/system/migrate-released.test.mjs` 1/0.
  - With failures: affordances 238/7, op-declarations 144/12, answer-envelope 25/8, control-plane 235/7, plane 218/5.
  - Those 39 failing tests fail identically on `origin/tranche/T47` without my change (I ran both and diffed the failing titles), so they are inherited (plan rule 5) and none is mine.
- Process checks:
  - `node checks/format.mjs`: 0 failures.
  - `node checks/architecture.mjs … action-plans`: 19 product files, 0 failures.
  - `node checks/coverage.mjs … action-plans`: 50 of 50 live ids named by a test, 0 failures.
  - `node checks/ownership.mjs … action-plans tranche/T47`: 5 files, 0 failures.
  - `node checks/run.mjs` over the product: format 0; architecture 0 failures (3106 files); channels 0; coverage 36 failures, all other modules' ids (screens-*, setup-words, signin-door, tasks, wizard-scripts), none of them action-plans'.

Size (session_01Po9nWpxYmQwZZ27A9oJztP): test runs 10, module lines 3341

## J1 · REPORT

Findings from T47-43, for your record; nothing here blocks the job. (1) setup-words is stale against words.json: bio-plane/src/setup-words/index.mjs:492 (generated from words.json at 3f40899950) still holds the old refusal.DOCUMENT_FIRST_NO_REASON sentence ('What happened isn't documented yet...'), while words.json now holds DEC-199's sentence, which action-plans C-124.63 reads by key (R49). Regenerating it is setup-words' job. (2) C-124.63's changed translation is a row awaiting stamp (T48), so the row census stays red until T48's stamp (plan rule 5 (2)). This change also stales the plane bundle and program.mjs (rule 5 (4)). (3) planRead's R19 checks can now answer {check, option, date, state: 'undetermined', says} when no zone is held (R48). Users' tests: plan-work, following, action-producers and migrate-released are green. The reds in affordances, op-declarations, answer-envelope, control-plane and plane are the same 39 tests that fail on tranche/T47 without my change: inherited, none mine.
