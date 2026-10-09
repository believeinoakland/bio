# contradiction (T41)

**Status** · session_01QHVLXdtMjHsZ4vfCKxRp7x · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R50 amended (D64), my reading, which I build on unless you answer otherwise:
1. "Another party" is any party of the conflict other than the notice's `project`. It is **named** when `membership.visibilityOf` is `discoverable` (R85) and the viewer's `sight` of it is not `NONE` (R44). A hidden party is never named, whatever the viewer's sight.
2. The notice carries `named: [{id, name}]` (every named party, id order; `name` the project's title) and, when that list is non-empty, the fixed sentence "Your project's conclusion conflicts with that project's" in place of today's sentence. With no party named (every other party hidden, or none readable) the notice is today's, byte for byte: `named: []` and today's sentence.
3. "With one the notice says only … as today" I read as "when no non-hidden party is named", **not** "when any hidden party exists": a notice naming a discoverable party P reads the same bytes whether or not a hidden party also exists (R55: a hidden party never counted). Reverting the whole notice whenever a hidden party is present would let a viewer infer the hidden party by the missing name.
4. Known residual inference, not this job's to close (pre-existing design, as draft §5 doubt 2 for D29): once every named party has opted in and no reveal follows, a viewer can infer an unnamed party. I build nothing for it; say if you want it raised to Bob.
5. A named party's opt-in state is not shown by name before R52 (`asked_by_another` unchanged); R52/R54 unchanged.

## J2 · QUESTION

Replaces J1 (same reading, point 1 narrowed, point 6 added).

R50 amended (D64), my reading, which I build on unless you answer otherwise:
1. "Another party" is a party reached through the side the viewer does NOT see (R49), other than the notice's `project`; a project reached only through the viewer's own side is on their side, not "that project's" conclusion, and is not named. It is **named** when `membership.visibilityOf` is `discoverable` (R85) and the viewer's `sight` of it is not `NONE` (R44). A hidden party is never named, whatever the viewer's sight.
2. The notice carries `named: [{id, name}]` (every named party, id order; `name` the project's title) and, when that list is non-empty, the fixed sentence "Your project's conclusion conflicts with that project's" in place of today's sentence. With no party named (every other party hidden, or none readable) the notice is today's, byte for byte: `named: []` and today's sentence.
3. "With one the notice says only … as today" I read as "when no non-hidden party is named", **not** "when any hidden party exists": a notice naming a discoverable party P reads the same bytes whether or not a hidden party also exists (R55: a hidden party never counted). Reverting the whole notice whenever a hidden party is present would let a viewer infer the hidden party by the missing name.
4. Known residual inference, not this job's to close (pre-existing design, as draft §5 doubt 2 for D29): once every named party has opted in and no reveal follows, a viewer can infer an unnamed party. I build nothing for it; say if you want it raised to Bob.
5. A named party's opt-in state is not shown by name before R52 (`asked_by_another` unchanged); R52/R54 unchanged.
6. The new sentence is stored as `NOTICE_NAMED_SENTENCE` = "Your project's conclusion conflicts with that project's." (a closing full stop added, as R50's other fixed sentence has).

## J3 · COMPLETE

T41-20 applied on my reading J2 (no answer yet; if your answer differs, send a CHANGE).

**Entries applied.** R50 amended (D64): `conflictNotices` adds `named: [{id, name}]` to each notice. A party is named when it is reached through the side the viewer does not see, is not the notice's own project, `membership.visibilityOf` reads `discoverable` and `sight` is not `none`. When any party is named, `says` is `NOTICE_NAMED_SENTENCE` ("Your project's conclusion conflicts with that project's."). Otherwise it is today's `NOTICE_SENTENCE`. The side, members and contents are not touched. R55: a hidden party is never named or counted, so a notice that names a party reads the same bytes with or without hidden parties beside it (tested).
- Code: `bio-plane/src/contradiction/index.mjs` (`NOTICE_NAMED_SENTENCE`, `#namedParties`, `conflictNotices`).
- Tests: `test/m/contradiction/projects.test.mjs` has a new test, "R50, R55 (T41, D64) …", with these negative controls: beta hidden; an administrator viewer at a hidden party's existence; a discoverable project only on the viewer's own side; a mixed discoverable and hidden set. `twoHidden` gains `discoverable`. `measures.test.mjs` R23 now also checks the new sentence.
- Mutation check: with the visibility test removed, 4 tests fail.

**Reading (mechanics §17, over 300 KB: 59 KB of requirements plus 516 KB of code and tests).** I read these whole myself: the requirements; layer 6's row of `layers.md`; the code and tests my entry changes (`index.mjs` 1300–1540 and 2730–3032, the helpers at 1240–1300, and `projects.test.mjs`); and the services I use (membership `sight`, `visibilityOf` and `#administratorView`, membership.R44/R85). A worker read the rest of the code and tests in full. Its summary is about 4 KB, and every statement cites file:line. It covers the helpers, every other half-seen answer (R27 `#marksOn`, R29, R25 `between_projects`: none needs a change), the fixture, and how the tests run. It left out a line-by-line read of the four gate data and harness files, which never touch notices or visibility, so nothing it left out mattered.

**Deferred.** Nothing.

**Found elsewhere (REPORT-worthy):**
1. `bio-plane/dist/bio-plane.bundled.mjs` is a generated artifact, and my change to `contradiction/index.mjs` makes it stale. I did not write it (mechanics §14).
2. My requirements' Uses (line 294) names membership `sight` but not `visibilityOf` (R85), which R50 now reads. That is a wording change for BOB.
3. Modules that use the notice, run before and after my change: queue-producers, queue, op-grades, op-declarations, affordances and store-door. Their failures are identical without my change, so they are not mine: queue-producers 4, op-declarations 9, affordances 34 failing test names. queue, op-grades and store-door pass.

**Tests and checks.**
- `node --test test/m/contradiction/`: tests 128, pass 120, fail 0, todo 8 (the K5 arms; not this job's).
- `format`: 0 failures. `architecture contradiction`: 0 failures. `coverage contradiction`: 59 of 59 live requirement ids named; 0 failures. `ownership contradiction tranche/T41`: 4 files; 0 failures.

Size (session_01QHVLXdtMjHsZ4vfCKxRp7x): test runs 9, module lines 3698

## J4 · REPORT

B2 applied: tranche/T41 merged into job/T41/contradiction (1ded3cc7f0). The built notice already matches R50's folded reading (K2479); no code change. Re-run after the merge: contradiction tests 128, pass 120, fail 0, todo 8; format, architecture, coverage (59 of 59) and ownership: 0 failures each. J3 COMPLETE stands.
