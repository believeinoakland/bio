# op-declarations (T36)

**Status** · session_01R1mcyGcTaZ5XaLSgxAAfv5 · depth 2 · COMPLETE · handled B3

## Work (T36-35)

**Reading (mechanics §17, N739).** The set is over 300 KB (`index.mjs` 254 KB, tests 174 KB, requirements 42 KB before the used services), so option (3): read whole myself — `build/requirements/op-declarations.md`; layer 11's row of `build/layers.md`; `index.mjs` (all 3,092 lines); the tests this entry changes (`t33`, `t34`, `t35`); the plan's rules at the opening and T36-35's entry; K2130's line and `draft-T36-L11-reqs.md`'s op-declarations section, "Choices made", "For BOB" and "BOB's review"; K2084, K2092, K2093, K2152; `file-safety`'s Purpose and Provides (R1–R38) and `fileSafetyOps`; `credentials` R50–R52 and its map's keep-away arms; `standards` R50 and `calculations` R38, R39 and their maps' arms; `affordances` R48, R49; PR #13's `registry.json` owed and `assistantset` acts, `library.json`'s owed marks, `mock-acts.js`'s 207 keys. A worker read the other eight test files (`gate`, `purity`, `t23`, `t24`, `t27`, `t28`, `t31`, `tables`) whole and summarised them for this task (about 9 KB, every statement citing file:line); it named the pins my additions break (`tables.test.mjs`:51 daemon, :94 unattended), the helpers to reuse, and that no other file mentions `assistantset` or `ACT_HELP`. Nothing it left out mattered: the full suite ran green over them.

**Applied.**
- Terms/R2: no `machineClasses` names `member` (none did); a test over `OPS` and every `OP_KINDS` spec (`t36`).
- R17: `assistantset` retired — gone from `instance-setup`'s family, so from `OPS`, both sets, `NEEDS`, `OP_STAMPS`; t33's R17 test re-pinned.
- R21: `t34.test.mjs`:135 re-pinned to PR #13's registry: nineteen owed acts declared (ten earlier, nine of R32/R33), seven unserved, `owed:placewanted` gone (red 13 cleared). No table holds "The assistant".
- R27 (T36): `subscriptionsignin`, `translationconfirm` unspecced (t34, t36).
- R31: standards' `standardinforcethrough`, `standardinforcethroughwithdraw` (`member`, author/viewer), `inforcethroughof` (`read`); calculations' `spotcheckvisit` (`member`, `by` stamped as R31 says beside the viewer calculations reads as its actor, R24), `spotcheck` (`read`).
- R32: a `file-safety` family of 19 session ops, and the four wakes `scanbatch`, `renderbatch`, `deeperbatch`, `securityforward` in `OPS` (admin, probe, daemon; in no session set; present null `NEEDS` rows as `moneydetectorsrun`'s, since op-grades grades them; `UNATTENDED_BY_DECISION` citing file-safety R4, R12, R36, R35). New kind `sightact` (a session's act, `machineClasses: []`, null, the viewer alone stamped) for `openoriginal`, `openwithwarning`, `deepercheck`, `safecopyrequest`, so nothing they stamp names who asked (file-safety R10). `releasescanhold` `member` (contribute, `by`); tool reads `ownread`, acts `admin` (`by`); `findingkind` `settingread` (nothing stamped).
- R33: `aikeepaway` (`admin`, by), `aikeepawaystate` (`settingread`, nothing stamped); `securitycount` named among credentials' in-process routes (`t33`:68, `t35`:210) — red 17 cleared.
- R34: frozen `ACT_HELP_ABSENT`, four groups each with one-sentence ground, exported. Arithmetic on PR #13's `mock-acts.js` read as affordances R48 holds it: `SESSION_OPS.member` 605 ops; 179 explained; 426 absent = 28 aliases + 161 reads + 5 acts no control offers (`allocid`, `lease`, `airuntick`, `answercheck`, `wizardprogress`) + 232 acts the design has not explained (named back to the design stream). No owed-act ground: every owed act declared has its text. Keys of `mock-acts.js` naming no op: `assistantset` (retired), `projectcreated`, `setpassword`, `countask`, `registerproceeding`, `deadlinecompute`, and the seven unserved `owed_` keys.
- Red 22's op-declarations half: control-plane `r53-routes.test.mjs`:70 now passes on this branch.

**P6.** 3,245 lines (one file), under 4,000.

**Deferred.** None.

**Found in other modules.** (1) plane `release.test.mjs` R19: "Set up and claim" step 11 names `assistantset` — red 31 (B2), not worked around. (2) control-plane R2/R41's affordances-unaccounted test lists the 30 new ops as unpublished/unranked and `assistantset` stale until op-grades (T36-30) and affordances (T36-31) merge. (3) `admission`'s `BODY_ONLY_FIELDS` has no `securitytooladd` entry; control-plane R60's `securitytooladd` line carries the body-only rule there, so nothing is owed by admission unless BOB reads R32's "as `groupkeyset`'s key (R24)" as admission R19's.

## J1 · REPORT

Built on job/T36/op-declarations @ 39a63e5a28; details in my record's Work section. Applied R2, R17, R21, R27, R31–R34: 23 file-safety ops (19 in a new family, 4 wakes in OPS, unattended by citation, present null rows), keep-away, K2092's five; assistantset retired; ACT_HELP_ABSENT exported. Reds 13 and 17 are cleared, and control-plane r53-routes:70 (red 22) passes here. Module tests 105/1. The one red is R34's partition test (t36), which reads affordances' ACT_HELP, not on tranche/T36 yet. Checks: format, architecture, coverage (34/34), ownership: 0 failures. R34's arithmetic on PR #13's mock-acts.js: 605 member ops, 179 explained, 426 absent = 28 aliases + 161 reads + 5 no-control steps + 232 acts the design has not explained. Users' tests: admission 32/0; control-plane 163/4 (base 163/4: red 22 gone, its affordances-unaccounted test is new and waits on T36-30/31); plane 126/4 (red 31 as B2, plus base reds 27). Waiting for your word to merge tranche/T36 after wizard-scripts', affordances' and instance-setup's merges, then I re-run and post COMPLETE.

## Completion (after B3: `tranche/T36` merged, with affordances', wizard-scripts' and instance-setup's merges)

**Entries applied.** T36-35 whole (see Work): Terms/R2, R17, R21, R27, R31, R32 (all 23 ops), R33, R34. Nothing deferred.

**Tests.** `node --test bio-plane/test/m/op-declarations/`: 106 pass, 0 fail (R34's partition now read against affordances' `ACT_HELP`: holds both ways). Reds 13 (`t34`:135) and 17 (`t33`:192, `t35`:196) cleared. Users' tests:
- admission: 32 pass, 0 fail.
- control-plane: 162 pass, 5 fail; the merged tranche tip without my commits is 160 pass, 7 fail. Cleared here: red 22 (`r53-routes`:70), my share; red 30 (`totality`:17), op-declarations' share. The 5 left also fail on the tip: R2 N402, R30 casedocument (26), R53 ask's four (23), R57 ×2 (32).
- plane: 115 pass, 15 fail; the tip is 112 pass, 14 fail. New here: red 31 only, the two release R19 tests. The rest also fail on the tip: reds 27 and 32.
- affordances: 217 pass, 0 fail (the tip: 1 file fail), so red 29 is cleared. op-grades: 32 pass, 0 fail.

**Checks** (from the process repository): format: 135 modules, 134 requirements files; 0 failures · architecture: 13 product files, 76 relative imports; 0 failures · coverage: 34 of 34 live requirement ids named by a test; 0 failures · ownership: 7 files changed by op-declarations between tranche/T36 and HEAD; 0 failures.

Size (session_01R1mcyGcTaZ5XaLSgxAAfv5): test runs 13, module lines 3245

## J2 · COMPLETE

T36-35 complete on job/T36/op-declarations with tranche/T36 merged (B3). Module tests 106 pass, 0 fail: R34's partition holds against affordances' ACT_HELP. Reds 13 and 17 cleared; red 22's and red 30's op-declarations shares cleared; affordances 217/0, so red 29 clears too. Against the merged tranche tip, users' tests are worse only by red 31 (plane release R19 x2) and otherwise better. control-plane is 162 pass, 5 fail (tip 160/7), the 5 all on the tip. plane is 115 pass, 15 fail (tip 112/14): red 31 added, the rest also on the tip. admission 32/0, op-grades 32/0. Checks format, architecture, coverage (34/34), ownership: 0 failures. 3,245 lines. The record's Completion section has the detail.
