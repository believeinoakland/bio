# money-checks (T41)

**Status** · session_01QVjSp42ywbNdzv9ts1aHcs · depth 2 · WORKING · handled B0

## Completion (T41-12a, tests only)

**Entries applied.** T41-12a (N822, K2442): the two tests rule 4 (11) lists for this module, red since membership's merge, re-stated for D54.
- `noticed.test.mjs` R13 (was :109, "an administrator sees every bundle"): `dave`, an active administrator invited to P but neither invited nor joined to the hidden project, gets no result and no count, and the hidden input's id appears nowhere in the answer; P itself, hidden, asked by `bob` (an administrator outside it) or the founder (`admin`), is refused with no `items` and no input id. Controls still at `FULL`: `bob`, invited to P and joined to the hidden project, sees the one result; once the hidden project is set discoverable by its owner (membership's own `projectVisibilitySet`), `dave` sees it whole (K2409).
- `run.test.mjs` R6 (N607) (was :135): `bob`, an administrator neither invited nor joined to the hidden alpha, is refused the switch, nothing is written and the detector still runs; joined to alpha (still at `FULL`), his switch-off stands and the run goes over nothing, as before.
- The fixture gains `participate(project, member, state)` (joined or invited) and `discoverable(project, owner)`. No product code and no requirement changed.

**Deferred.** None of the entry. Two flaws in this module's own code, not fixed because neither is in my requirements' text (BOB's, reported as J2):
1. Every read and act naming a project (`switchDetector` index.mjs:508, `noticed` :775) answers a caller at `EXISTENCE` with `NO_SUCH_PROJECT` (`noSuchProject`), where membership's Terms and R44 (and R77, "every act … asks it") call for `PROJECT_SEEN_NOT_A_PARTICIPANT` (C-70.1, with `owners` for an administrator at a hidden project's `EXISTENCE`). Pre-dates D54 (a member outside a discoverable project got the same). My new assertions check `ok: false` and no contents, not the code, so they hold either way.
2. `switchDetector` admits any viewer R43 lets see the project (index.mjs:508), so an active administrator outside a discoverable project may switch a detector there; membership R60 says an administrator's sight is never a position and their only project act is `project-roster` R5. R5 here says only "a member's act per project".

**Found in other modules.** None.

**Reading set (mechanics §17).** Measured as mechanics §3 asks: own requirements 11.6 KB, own code and tests 136 KB, the twelve used modules' Purposes ~7 KB, the services my Uses names (membership Terms, R43, R44, R45, R60, R77, R78, R81, R84, R85, `viewerPredicate`'s and `projectVisibilitySet`'s code; money R7, R8, R10, R14, R19, R21; progressions R34 and `readInstance`; record-core R21, R37, R77; record-grammar R48) ~25 KB, layer 5's row: about 180 KB, at most 300 KB, so read whole myself: all of the above, every file under `bio-plane/src/money-checks/` and `bio-plane/test/m/money-checks/`, the plan's T41-12a and rule 4, K2442, K2448, and membership's record line naming my two reds.

**Tests and checks.**
- `node --test bio-plane/test/m/money-checks/`: tests 46, pass 46, fail 0 (44/46 before). No layer tests named in the manifest. No service changed, so no user's suite to run.
- `format`: 145 modules, 0 failures · `architecture money-checks`: 0 failures · `coverage money-checks`: 17 of 17 live ids, 0 failures · `ownership money-checks tranche/T41`: 0 failures.

Size (session_01QVjSp42ywbNdzv9ts1aHcs): test runs 2, module lines 1013
