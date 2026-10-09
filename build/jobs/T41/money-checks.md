# money-checks (T41)

**Status** · session_01QVjSp42ywbNdzv9ts1aHcs · depth 2 · COMPLETE · handled B2

## Completion (T41-12a, tests only)

**Entries applied.** T41-12a (N822, K2442): the two tests rule 4 (11) lists for this module, red since membership's merge, re-stated for D54.
- `noticed.test.mjs` R13 (was :109, "an administrator sees every bundle"): `dave`, an active administrator invited to P but neither invited nor joined to the hidden project, gets no result and no count, and the hidden input's id appears nowhere in the answer; P itself, hidden, asked by `bob` (an administrator outside it) or the founder (`admin`), is refused with no `items` and no input id. Controls still at `FULL`: `bob`, invited to P and joined to the hidden project, sees the one result; once the hidden project is set discoverable by its owner (membership's own `projectVisibilitySet`), `dave` sees it whole (K2409).
- `run.test.mjs` R6 (N607) (was :135): `bob`, an administrator neither invited nor joined to the hidden alpha, is refused the switch, nothing is written and the detector still runs; joined to alpha (still at `FULL`), his switch-off stands and the run goes over nothing, as before.
- The fixture gains `participate(project, member, state)` (joined or invited) and `discoverable(project, owner)`. No product code and no requirement changed.

**Deferred.** None of the entry. Two flaws in this module's own code, not fixed because neither is in my requirements' text (BOB's, reported as J1):
1. Every read and act naming a project (`switchDetector` index.mjs:508, `noticed` :775) answers a caller at `EXISTENCE` with `NO_SUCH_PROJECT` (`noSuchProject`), where membership's Terms and R44 (and R77, "every act … asks it") call for `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1, with `owners` for an administrator at a hidden project's `EXISTENCE`). Pre-dates D54 (a member outside a discoverable project got the same). My new assertions check `ok: false` and no contents, not the code, so they hold either way.
2. `switchDetector` admits any viewer R43 lets see the project (index.mjs:508), so an active administrator outside a discoverable project may switch a detector there; membership R60 says an administrator's sight is never a position and their only project act is `project-roster` R5. R5 here says only "a member's act per project".

**Found in other modules.** None.

**Reading set (mechanics §17).** Measured as mechanics §3 asks: own requirements 11.6 KB, own code and tests 136 KB, the twelve used modules' Purposes ~7 KB, the services my Uses names (membership Terms, R43, R44, R45, R60, R77, R78, R81, R84, R85, `viewerPredicate`'s and `projectVisibilitySet`'s code; money R7, R8, R10, R14, R19, R21; progressions R34 and `readInstance`; record-core R21, R37, R77; record-grammar R48) ~25 KB, layer 5's row: about 180 KB, at most 300 KB, so read whole myself: all of the above, every file under `bio-plane/src/money-checks/` and `bio-plane/test/m/money-checks/`, the plan's T41-12a and rule 4, K2442, K2448, and membership's record line naming my two reds.

**Tests and checks.**
- `node --test bio-plane/test/m/money-checks/`: tests 46, pass 46, fail 0 (44/46 before). No layer tests named in the manifest. No service changed, so no user's suite to run.
- `format`: 145 modules, 0 failures · `architecture money-checks`: 0 failures · `coverage money-checks`: 17 of 17 live ids, 0 failures · `ownership money-checks tranche/T41`: 0 failures.

Size (session_01QVjSp42ywbNdzv9ts1aHcs): test runs 2, module lines 1013

## Completion after B2 (T41-12a re-opened; K2467)

**Entries applied.** B2's CHANGE: my J1's two flaws, now money-checks R5 and R13 text (tranche/T41 @ 5349f5e4bf, merged into this branch).
- R5: `switchDetector` (index.mjs:508-516) asks, after its own detector and project checks, `membership.existenceAct` (existence-only sight answers C-70.1 through membership's one site, with `owners` at a hidden project), then R43's sight (`NO_SUCH_PROJECT` at `NONE`), then `membership.participation` (any state): a non-participant, an administrator who sees the project whole included, is refused through `notAParticipant` (R87). Sight before position (membership R61); the switch's own value is asked after.
- R13: `noticed` (index.mjs:782-786) asks `existenceAct` before its sight check, so a project seen at existence only answers C-70.1, never `NO_SUCH_PROJECT`; at `NONE` it still answers as an id naming nothing; with no viewer sent, existence is not asked.
- New `sight.test.mjs`, one test each for R5 and R13, with negative controls: a participant (joined or invited, administrator or not) still switches; a discoverable project's administrator outside it is refused `NOT_A_PARTICIPANT` but still reads `noticed` at `FULL` (a read, not an act); a member at `NONE` gets the same answer as an absent id; a `FULL` viewer reads as before. Both fail against the code before this change (0/2) and pass after it.

**Deferred.** None. The two requirement marks `*(not yet met: T41)*` on R5 and R13 are in `build/requirements/money-checks.md`, outside my paths: BOB strikes them.

**Users' suites (P11; I changed two services I provide).** With my change, and on tranche/T41 without it: scheduler 122/0, notice-producers 74/0, control-plane 195/0, op-grades 37/0, `migrate-released` 1/0 (all green); affordances 187/33, op-declarations 109/8, answer-envelope 26/2, plane 147/8: the failing tests are by name the same set with and without my change (compared by title), so none is mine.

**Tests and checks.**
- `node --test bio-plane/test/m/money-checks/`: tests 48, pass 48, fail 0.
- `format`: 0 failures · `architecture money-checks`: 0 failures · `coverage money-checks`: 17 of 17 live ids, 0 failures · `ownership money-checks tranche/T41`: 0 failures.

Size (session_01QVjSp42ywbNdzv9ts1aHcs): test runs 7, module lines 1023

## J1 · REPORT

Two flaws in money-checks' own code, found while re-stating for D54; not fixed, since neither is in my requirements' text (yours to word, or to rule not needed):
1. `switchDetector` (index.mjs:508) and `noticed` (:775) answer a caller at `EXISTENCE` with `NO_SUCH_PROJECT`; membership's Terms, R44 and R77 call for `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1, with `owners` for an administrator at a hidden project's `EXISTENCE`). Pre-dates D54. My tests assert `ok: false` and no contents, so they hold either way.
2. `switchDetector` admits any viewer R43 admits, so an active administrator outside a discoverable project may switch a detector there, against membership R60 (an administrator's sight is never a position). money-checks R5 says only "a member's act per project".

## J2 · COMPLETE

T41-12a done (tests only). noticed R13 and run R6 (N607) re-stated for D54 with negative controls (an administrator invited/joined still at FULL; a discoverable project seen whole by an administrator outside it). 46/46; format, architecture, coverage 17/17, ownership 0 failures. No product code or requirement changed. Two own-code flaws reported as J2. Details in my record.
