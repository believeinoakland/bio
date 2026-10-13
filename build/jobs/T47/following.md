# following (T47)

**Status** · session_011oPFX7EfmEU5TjHmT2Tufx · depth 2 · WORKING · handled B0

## Work

**Read.** I read these whole myself: `build/requirements/following.md` (public and private); every file of my code (`index.mjs`, `checks.mjs`, `legistar.mjs`, `meetings.mjs`, `schema.mjs`, `snapshot.mjs`); every file of my tests (`body`, `checks`, `fixture`, `meetings`, `policy`, `portal`, `registers`, `tick`, `watches`); my plan entry T47-46 and the plan's "Rules at the opening". The reading set was measured at 881 KB, over the 600 KB limit (mechanics §17 (3), K2032). So a helper in my session read the Purpose, and the services my Uses names, of all 19 used modules, together with notice-producers R5, R18 and R21 and layer 10's contract in `build/layers.md`, and wrote me a digest citing each section. The sources stay binding. The digest confirms that an instant is record-grammar's `ISO_TS_RE` (civil-time Values) and that record-core R47 spells one. `watch_answers.at` is written by `stampInstant("second", …)`.

**Entries applied.**
- T47-46 (N967; R28, amending R25). New in-process read `dutyWatchEndAt(duty)`.
  - It answers null exactly when `dutyWatchEnd` does: no link, any link unanswered, or a link that cannot be read.
  - Otherwise it answers `{day, at}`. `day` is the latest end day the duty's answered links hold, the same day `dutyWatchEnd` answers. `at` is the latest recorded `watch_answers.at` among those links: the answer that made the end hold, after which no link stood unanswered. It is a whole-second `…:SSZ` instant.
  - Both reads now share one private derivation, `#dutyEnd`, so they cannot disagree. `dutyWatchEnd`'s answers are unchanged.
  - It writes nothing and never throws.
- New test "R28 dutyWatchEndAt answers null exactly when dutyWatchEnd does…" in `watches.test.mjs`:
  - Two links answered on different days. The earlier answer holds the later end day, so `day` and `at` come from different answers. It answers the latest day with the second answer's instant.
  - Control: with one link unanswered, null. A link added later and still unanswered turns the answer back to null.
  - A `stop` answers its day and its instant.
  - Absent and malformed duties answer null. It writes nothing.
  - An unreadable answers table answers null and does not throw (control: restored, it answers again).
- I read my own code and tests whole (P20). I found no flaw needing a change in this job. The items deferred at T46 still stand, with the same reasons: the R18 source-text checks beside the behavioural ones, and two harmless trailing fixture assertions.

**Found in other modules (for BOB; no change made).**
- Wording only. following R28 says "for `notice-producers` R18", but the reader of `at` is notice-producers R21 (T47-51), which amends R18. notice-producers' Uses already names R21.
- notice-producers R21 compares "at or before `at`". That is consistent with whole-second instants. Its code should compare as instants (record-core R48 `instantOrder`, or `Date.parse`, as its current R18 code does), not as text against a day bound.

**Tests and checks.**
- `node --test bio-plane/test/m/following/`: 76 pass, 0 fail.
- Users of `dutyWatchEnd`:
  - notice-producers: 98 pass, 8 fail. The 8 are identical with my change stashed. They are the R16 `accounts.test.mjs` reds that T47-51 clears (K3084), none mine.
  - scheduler: 129 pass, 0 fail.
  - action-producers: 45 pass, 0 fail.
- No layer tests are named in the manifest.
- Process checks, from the process repository:
  - `format`: 168 modules, 0 failures.
  - `architecture following`: 0 failures.
  - `coverage following`: 28 of 28 live ids named, 0 failures.
  - `ownership following tranche/T47`: 0 failures.
  - `run.mjs`: architecture 0 failures. Coverage has 26 failures, all in other modules' not-yet-met ids (rule 5 (1)); none is following's.

Size (session_011oPFX7EfmEU5TjHmT2Tufx): test runs 8, module lines 1846
