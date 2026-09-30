# basis-versions (T18)

**Status** · session_01XmH3VGCrsiUyCTE8fqQAsk · depth 2 · COMPLETE · handled B2

## Completion (BASIS-VERSIONS #5)

**Entries applied.**
- **N411:** `#moveVersionState`'s three relayed refusals (the case-member fact, the project write, the promotion) now state `ok: false` and their `reason`/`code` literally rather than only through the spread (903088b828). The DEC-49 guard's INHERITED VERDICT line names no basis-versions site now; `inheritedVerdicts` reads 3 against its ceiling of 4. The ceiling is the guard's (legacy-tests'), re-pinned at the release (K619), not here.
- **N242's share and N249's clause:** already met before this job, confirmed on the tree. `NO_BASIS` (C-33.40) is minted only at inquiry's `actNoBasis > is-act-no-basis`, which this module imports (N186). C-33.40's `where` has named that site since T8 (4eced5be37). This module mints no `FACT_UNAVAILABLE` (N204). The guard prints neither code at a basis-versions site. No row changed in this job, so no row is `awaiting stamp` from it.
- **Converts:** all eight, as requirement-named module tests under `test/m/basis-versions/`, one file per old suite. None of the old suites was deleted (K619):
  - `conclude-project`: R31, R18, R22, R17, R16, R11, R23, R19.
  - `current`: R9, R11, R13, R15, R31.
  - `d216-sharing` (from the probe): R11, R13, R15, R31.
  - `sufficiency-state`: basis-versions' answer, R3 and R6 (C-25.6 with SUFFICIENCY_UNCLAIMED and a blank asserter).
  - `versions`: R1–R3, R5, R6, R8, R9, R29, R34, R35.
  - `versionstate`: R4, R12–R14, R35.
  - `conclude-project-arm`: R16, R17, R18, R11, R23.
  - `project-discoverable`: R33, R13, R16, R20.
  - Also carried: `conclude-project`'s withdrawal arms, in `conclude.test.mjs` (R20, R11, R18).

**Flaws fixed in this module** (found by the converts):
- `withdrawConclusion` answered NOT_A_PROJECT at a discoverable project where membership R44 wants C-70.1. It now asks `existenceAct` as `conclude` and make-current do. B2 confirmed this.
- VERSION_ACT_UNWRITABLE (C-25.31) was detected only at write time, so it was out of R12's order and `preview` said ok (R14). It is now checked in its place, on the question's row and, for `current`, on the project's block. See J2.
- A reject or consider reason of 1–7 characters passed the act and its preview, then the promotion refused it as VERSION_DISPOSITION_UNATTRIBUTED (C-25.19's 8-character floor). It is now C-25.32 at the act (`VERSION_REASON_MIN`). J2 asks BOB to confirm this reading and R12's wording.

**Deferred.** None.

**Found in other modules** (not carried; from the old suites):
- queue-producers R2 (`current`, `conclude-project`: basis.elsewhere, pointer, homes, age, purge silencing).
- strength R14 and `op=versionstrength` (`d216`, `conclude-project`).
- connections (`d216`'s `op=cite`/`op=sever`, the refs count through `op=stats`).
- affordances R14/R15/R23 (`conclude-project-arm`, `versionstate`).
- control-plane (`versionstate`: the six ops in NEEDS `contribute`, author overwrite; `versions`: `op=stats`).
- membership (`project-discoverable`: directory, setting, contents reads).
- citation, queue, publication (`project-discoverable`'s other acts).
- legacy-checks (`sufficiency-state`'s `sufficiencyClaimState` classifier, the catalogue's STATES).
- `conclude-project`'s op=audit C-5.1 over a rewritten `conclusions` history: its owner is C-5.1's, not this module's.

Every source-text arm in the eight suites is dropped: tests check behaviour at the interface.

**Generated artifacts.** None made stale: no bundle takes basis-versions' files as input (manifest).

**Tests and checks run.**
- `node --test bio-plane/test/m/basis-versions/`: tests 109, pass 109, fail 0. No layer tests are named in the manifest.
- The DEC-49 guard, run for N411: no failure at a basis-versions site. Its floors and ceilings (legacy-tests') print as before, plus `inheritedVerdicts` slack 1.
- `node checks/format.mjs`: 0 failures.
- `node checks/architecture.mjs … basis-versions`: 0 failures.
- `node checks/coverage.mjs … basis-versions`: 42 of 42 live ids named, 0 failures.
- `node checks/ownership.mjs … basis-versions tranche/T18`: 0 failures; legacy-store and legacy-checks each 0 added, 0 removed.

Size (session_01XmH3VGCrsiUyCTE8fqQAsk): test runs 16, module lines 2,075

## J1 · QUESTION

`op=basisversions&project=<P>` when the viewer's sight of P is EXISTENCE (P discoverable, viewer not a participant). The old `project-discoverable` suite (§3l) expected C-70.1 for this read, and membership R44 says "a read naming the project's own id is refused PROJECT_SEEN_NOT_A_PARTICIPANT". basis-versions R8/R11/R33 say an invisible project answers as an absent one. Today the read answers ok with `current: null`, `conclusion: null`, `conclusion_stance: "none"`, `conclusion_history: []`, the same as for an unseen project. It does not refuse the whole read.

My best reading, which I am carrying out: leave it as it is. The read names the inquiry's id. The project is only a qualifier that adds fields, so R44's "a read naming the project's own id" does not reach it, and refusing would deny the inquiry's versions to a viewer who may see them. If you rule the other way, R11 needs a clause, e.g. "a named project at EXISTENCE answers membership's existenceAct in place of the read". I would then make the change and test it.

Done in the same area without asking: `withdrawConclusion` now asks `existenceAct` before NOT_A_PROJECT, as `conclude` and make-current already do (membership R44 for an act), tested under R20 and R33 (c8fb79e65e).

## J2 · QUESTION

Two readings of R12 and R14, found while converting `versionstate`. Both are applied in 13b2cb2f86 and tested.

(1) R12 lists VERSION_ACT_UNWRITABLE (C-25.31) straight after VERSION_ACT_NO_SUCH_VERSION. The code only detected a version row it could not rewrite at write time, after the receipt. That broke two things. The order: a missing reason, an illegal edge or a case member was answered first. And R14: preview said ok for an act that would then refuse. Now the row's writability, and for `current` the project's `current_versions`, is checked right after the version is located, in R12's place. Preview therefore answers it.

(2) The catalogue's C-25.19 stores a `state_reason` only at 8 characters or more. The act had no floor, so reject or consider with a 1–7 character reason passed the act and its preview, then the promotion refused it as BASIS_VERSION_REFUSED / VERSION_DISPOSITION_UNATTRIBUTED. That is not an R12 refusal. My reading: such a reason "arrived and cannot be stored", which is C-25.32 VERSION_REASON_MALFORMED. So the act refuses it there, preview agreeing, only where the state needs a reason (VERSION_REASON_MIN = 8, exported).

If you agree, R12's C-25.32 parenthesis could read "(500 characters, no quote, backslash or newline; at least 8 where the state needs a reason)". If you would rather make it a new row, or drop the floor from C-25.19, say so and I will follow.

## J3 · COMPLETE

All entries applied; details in my record's Completion. N411: the three #moveVersionState relays state their verdict; the guard names no basis-versions site (inheritedVerdicts 3/4, the ceiling is the guard owner's). N242/N249: already met (one NO_BASIS site at inquiry; no FACT_UNAVAILABLE mint); no row changed, none awaiting stamp. All eight converts carried as requirement-named module tests. Three flaws in this module fixed along the way: withdrawConclusion C-70.1 at EXISTENCE (your B2); C-25.31 in R12's place and seen by preview; the reason floor at the act (J2 awaits your ruling on the reading and R12's wording). Tests 109/109; format, architecture, coverage, ownership 0 failures.
