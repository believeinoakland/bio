# op-grades (T36)

**Status** · session_018EabQi5zSA3RkWTcx2iV9M · depth 2 · WORKING · handled B0

## Completion

**Entries applied (T36-30, as B1 and K2130 word it).** Every grade is in a new `bio-plane/src/op-grades/t36.mjs`, beside `t35.mjs`. `index.mjs` spreads it into `RUNGS`, `RUNG_ABSENT`, `NON_ACTS` and `CONSEQUENCE_STATEMENTS`. The module still imports nothing (`uses: []`, K2130).
- **R23** (K2092):
  - `reasoned`: `standardinforcethrough` and `standardinforcethroughwithdraw` (`STANDARD_NO_REASON`, standards R50), and `spotcheckvisit` (`NOT_TESTIMONY`, calculations R38).
  - `NON_ACTS` gives R23's sentences to the three acts and `read:` reasons to `inforcethroughof` and `spotcheck`.
  - None is in `MACHINE_REFUSALS`, and all three are phone acts.
- **R24** (all 23 ops of `fileSafetyOps`, BOB's review (1); Choices made 2):
  - `releasescanhold` is `reasoned` (`HOLD_NO_REASON`).
  - `undetermined`: `deepercheck`, `safecopyrequest`.
  - `observational`: `openoriginal`, `openwithwarning`, `scanbatch`, `deeperbatch`.
  - `substrate`: `renderbatch`, `securityforward`, `securitytooltest`.
  - `credential`: `securitytooladd`, `securitytoolremove`. These two are the only ones with `phone: false`.
  - Each of the 12 writes carries R24's `NON_ACTS` sentence, and each of the 11 reads a `read:` reason. No reason begins `capture-directed:`, which would make the op one of `affordances`' `CAPTURE_ACTS`.
  - `CONSEQUENCE_STATEMENTS.openwithwarning` is `{friction: "dialog", statement}` with DEC-173 (2)'s content: the file is high risk for the reasons shown beside it; what opening it risks (the member's own device, that device's protections, their sign-in to the group); the two confirmations, word for word; and that who opens which file, or who confirmed, is never recorded. It sits beside the op's ground; no rung is added.
- **R25**:
  - `aikeepaway` is `reasoned` (`NO_REASON`, credentials R51), with its setting sentence; `aikeepawaystate` gets a `read:` reason.
  - `securitycount` is ungraded.
  - `assistantset`'s `RUNG_ABSENT` and `NON_ACTS` rows are removed from `t33.mjs`. `assistantstate`, a read, stays.
- **R26**: `LARGER_SCREEN_ACTS` is now `["filingsent", "personexpunge"]`, so `phoneOf("personexpunge")` answers `false`. Its rung (`reasoned`), its Irreversible weight and its statement are unchanged. `standardrelease` stays `phone: true` (K2130).
- `JUSTIFICATION_REFUSALS` gains `NOT_TESTIMONY` and `HOLD_NO_REASON`. A comment says why `NOT_TESTIMONY` joins the family by name: it refuses a visit whose testimony is not the visitor's own authored observation, the visitor's account in its own words (R23, as `testify`'s `TESTIMONY_NO_WORDS`). It is not one of the object-demanding codes the family excludes.
- Tests: a new `t36.test.mjs` names R23–R26, each checked in full at the exports. Three pins in the existing tests are moved to the requirements as they now stand: `ladder.test.mjs` (R4's statement keys gain `openwithwarning`; R18's set gains `personexpunge`) and `owners.test.mjs` (R13's T33 writes lose `assistantset`).

**Deferred.** None.

**Reds my change makes in other modules' tests (for BOB to accept by name; none is a flaw in those modules).** Each test pins the tables as they stood before R23–R26:
1. `affordances` `catalogue.test.mjs`:107 (R2, R38: `RUNGS`' assignment pinned). It now holds T36's five `reasoned` ops. Clears at T36-31.
2. `affordances` `catalogue.test.mjs`:470 (R27: the `undetermined` count pinned at 25). It now holds `deepercheck` and `safecopyrequest` as well. Clears at T36-31.
3. `affordances` `catalogue.test.mjs`:909 (R31, R4: `CONSEQUENCE_STATEMENTS`' keys pinned). It now holds `openwithwarning`. Clears at T36-31.
4. `affordances` `plane.test.mjs`:614 (R19: the backing drives reach every `reasoned` op). The five new `reasoned` ops have no drive in affordances yet. Clears when T36-31 drives `STANDARD_NO_REASON`, `NOT_TESTIMONY`, `HOLD_NO_REASON` and credentials' `NO_REASON` at their owners. Of the four owners, affordances already uses `file-safety` (rule 4); the other three are for T36-31's START to confirm.
5. `affordances` `t31.test.mjs`:49 (R36: `LARGER_SCREEN_ACTS` pinned to `filingsent`). It now holds `personexpunge`. Clears at T36-31.
6. `affordances` `t33.test.mjs`:161 and :197 (R40: `t33.mjs`'s tables pinned with `assistantset`). Clear at T36-31.
7. `affordances` `t33.test.mjs`:214 (R40, R12, R24: `assistantset` unpublished and unranked against op-declarations' rows). `op-declarations` still declares it (`src/op-declarations/index.mjs`:315). Clears at T36-35, the 9th merge (B1's sequencing).
8. `control-plane` `totality.test.mjs`:17 (R2, R41: the door's real op table, through `affordances` R12's `unaccounted`):
   - stale: the 30 new ops (5 + 23 + `aikeepaway`, `aikeepawaystate`) are graded here but are not yet in the door's table;
   - unpublished and unranked: `assistantset`.
   It clears once T36-35 declares the 30 ops and retires `assistantset`, and T36-37 routes them.

Unchanged by my change: inherited reds 19 (`t33.test.mjs`:144) and 20 (`catalogue.test.mjs`:583) still fail, now because the five ops are graded but not yet pinned. T36-31 re-pins both, as planned. op-declarations' three failures (reds 13 and 17: `t33`:192, `t34`:135, `t35`:196) are the same before and after my change. `plane` `wizards.test.mjs` passes, 4/0.

**Found in other modules (REPORT).** Nothing beyond the reds above.

**Reading (mechanics §17, B1's fix).**
- Read whole myself:
  - my requirements;
  - the B1 START;
  - the plan's T36-30 entry and rules at the opening;
  - K2130's line, and the draft's op-grades section, "Choices made" and "BOB's review" (with For BOB);
  - `file-safety`'s public part;
  - `standards` R50, `calculations` R38–R39 and `credentials` R51–R52;
  - DEC-173 (`DECISIONS.md`);
  - `t35.mjs` and `t35.test.mjs`;
  - the parts of `index.mjs` my entry changes: header, imports, `JUSTIFICATION_REFUSALS`, `RUNG_ABSENCE_GROUNDS`, `CONSEQUENCE_STATEMENTS`, `LARGER_SCREEN_ACTS`, `RUNGS`' and `RUNG_ABSENT`'s heads and spreads, `MACHINE_REFUSALS`, `NON_ACTS`' head and spreads, `IRREVERSIBLE_WEIGHT` and `phoneOf`;
  - `fileSafetyOps` (`file-safety/index.mjs`:1381–1411).
- Not read whole: layer 11's row of `build/layers.md`. My change adds no import and no edge.
- A worker read the rest in full and wrote a summary of about 1,100 words, each statement citing a file and line: `index.mjs` 280–560, 585–775 and 809–1440, plus `t33.mjs`, `t34.mjs`, `ladder.test.mjs` and `owners.test.mjs`. It cites:
  - the existing `assistantset` and `assistantstate` rows (`t33.mjs`:157, :372, :378);
  - every pin my change breaks (`ladder.test.mjs`:129–131, :163; `owners.test.mjs`:157);
  - the conventions for rows and reasons, including the `capture-directed:` prefix trap (`ladder.test.mjs`:145–146);
  - the family's exclusion doctrine (`index.mjs`:95–106), which led to `NOT_TESTIMONY`'s comment;
  - the `op-declarations` row for `assistantset` (:315).
- It left out `index.mjs` 31–83 (ladder prose) and 776–808 (`MACHINE_REFUSALS`), which I read myself; nothing it left out mattered.

**Tests and checks.**
- `node --test bio-plane/test/m/op-grades/`: tests 32, pass 32, fail 0. Baseline before the change: 26/0. `build/manifest.md` names no layer tests.
- `node --test bio-plane/test/m/affordances/`: pass 198, fail 10. Two are the inherited reds 19 and 20; eight are the reds 1–7 above.
- `control-plane` `totality.test.mjs`: 0/1 (red 8 above).
- `op-declarations` tests: 90/3, the same before and after.
- `plane` `wizards.test.mjs`: 4/0.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `checks/architecture.mjs op-grades`: 7 product files, 11 relative imports; 0 failures.
- `checks/coverage.mjs op-grades`: 26 of 26 live ids named by a test; 0 failures.
- `checks/ownership.mjs op-grades tranche/T36`: 7 files changed; 0 failures.
- P6: 2,233 lines in own `paths` (was 2,091), well under 4,000.

Size (session_018EabQi5zSA3RkWTcx2iV9M): test runs 12, module lines 2233
