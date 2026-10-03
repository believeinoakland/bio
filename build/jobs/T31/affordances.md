# affordances (T31)

**Status** · session_01NyuAEg64kEcRvME5QxKPv5 · depth 2 · WORKING · handled B3

## J1 · QUESTION

R37's last bullet (the no-target answer gains `screens` and `wizard_scripts`) needs a reach into `wizard-scripts`, which is not built yet (WIZARD-SCRIPTS #1 merges first in L11). My best reading, which I will build unless you answer otherwise:

1. **How it is asked.** `affordancesOps` gains one in-process route, `affordancescreens` (DO-internal, as `affordancefacts`; `control-plane/dispatch.mjs` spreads the map lazily, so no other module changes and it has no `NEEDS` row). It reaches `wizard-scripts` through its factory on the same host (replaceable by a test's `deps`) and answers `{screens: registeredScreens(), wizard_scripts}`. The door's arm (`affordancesOp`) asks it on the untargeted call only, with the `viewer` stamp, after `actionkinds`; a silence or refusal is answered as `actionkinds`' is (REC-52). A targeted answer carries neither key (R17's targeted shape unchanged).
2. **What `wizard_scripts` holds.** For each registered screen, `wizardsAt({screen, viewer})` (its R11) passed in unchanged, concatenated in registry order, keeping only the offered ones: entries marked `draft: true` (the caller's own drafts) are left out, since R37 and `skills` R9 say "the offered scripts". Before registration both keys are `[]`.
3. **Timing.** I build the grading half of R37 now (RUNGS, RUNG_ABSENT, NON_ACTS, JUSTIFICATION_REFUSALS, none in MACHINE_REFUSALS) from R37's text, and the reach once `wizard-scripts` is on `tranche/T31`, against the factory name and method names its job exports (`registeredScreens`, `wizardsAt`). I will report COMPLETE only after that merge.

Is (1)–(2) right, or should the screens be reached another way (for instance a `wizard-scripts` route the door asks directly)?

## J2 · REPORT

Progress, pushed on job/T31/affordances: R36 (phone flag in decorate, LARGER_SCREEN_ACTS, VOCABULARIES.larger_screen_acts), R37's grading half and R38 (importwatch, importunwatch reversible; K1394's red turned green). Affordances 162/162. Users' tests with R36's new key: queue, tasks, plane green on it. One red my tables make until op-declarations merges (plan rule 3's pattern): control-plane 'R2, R41 ... affordances unaccounted' reads stale for importwatch, importunwatch and the 15 wizard ops, which op-declarations R15/R16 add to the door's table; the three case-import reds of K1383 stand as before. Remaining: R37's no-target screens/wizard_scripts and wizardretire's backing at wizard-scripts' interface, on your CHANGE after its merge.

## J3 · COMPLETE

**Entries applied** (L11):
- N528 R36: `decorate` adds `phone` (false at terminal, attested, irreversible, a `credential` absence, and `LARGER_SCREEN_ACTS`, frozen `["filingsent"]`; true otherwise), so every decorated act, capture act and set act and every queue option carries it; `phoneOf(id)` exported; `VOCABULARIES.larger_screen_acts` is the same array.
- N528 R37: `wizardretire` `reasoned` (`WIZARD_REASON_REFUSED` joins `JUSTIFICATION_REFUSALS`); the five drafting acts `undetermined`; the editor grant and revoke `credential`; `wizardprogress` `observational`; NON_ACTS for all 15 ops as R37 words them; none in MACHINE_REFUSALS. The no-target answer gains `screens` and `wizard_scripts` by J1's reading (K1396): the in-process route `affordancescreens` in `affordancesOps` (wizard-scripts' `registeredScreens()` and, per screen, `wizardsAt` for the viewer, drafts left out), asked by `affordancesOp` on the untargeted call with the `viewer` stamp; a silence or refusal answered as the kinds' are. A targeted answer is unchanged.
- N534 R38: `importwatch`, `importunwatch` `reversible`, R35's NON_ACTS sentence, none in MACHINE_REFUSALS; K1394's red is green.

**Deferred:** none.

**Found in other modules** (each turns green with its own L11 merge after mine, plan rule 3's pattern):
- control-plane test "R2, R41 ... affordances' unaccounted over the door's op table" reads `stale` for `importwatch`, `importunwatch` and the 15 wizard ops until op-declarations R15/R16 add them to the door's table.
- plane `test/m/plane/door.test.mjs` "R2, R5 (N13)" expects affordances' map to be `["affordancefacts"]`; it is now `["affordancefacts", "affordancescreens"]` (R37). The plane job updates its expectation.
- Red on `tranche/T31` before my merge, not mine: control-plane R22 (CHECK_FAMILIES, wizard-scripts' rows), control-plane R49 and the case-import reds of K1383, and wizard-scripts' own "R5 a proposal is labelled proposalLabel(proposer, "wizard")".

**Tests and checks:**
- affordances: 167 pass, 0 fail (`t31.test.mjs` new: R36, R37, R38, wizardretire's backing at wizard-scripts' interface, R38's reversibility at case-import's; existing suites updated for R36's key and R37's untargeted shape).
- Users and providers (queue, conclude-project, docdates, tasks, op-declarations, control-plane, plane, migrate-released, wizard-scripts, skills): 534 pass, 7 fail — the seven named above.
- format: 98 modules, 97 requirements files; 0 failures. architecture (affordances): 14 product files, 148 relative imports; 0 failures. coverage (affordances): 38 of 38 live ids named by a test; 0 failures. ownership (affordances vs tranche/T31): 10 files; 0 failures.

Size (session_01NyuAEg64kEcRvME5QxKPv5): test runs 14, module lines 3362
