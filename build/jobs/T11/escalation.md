# escalation (T11)

**Status** · session_01CE181yr6UPtvYZGABsN4KC · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N217: actions R43 `noSuchAction` is on neither `tranche/T11` nor `job/T11/actions` yet (ACTIONS #2 has just started). My reading: R9's `NO_SUCH_ACTION` is answered by `noSuchAction(action, extra)` imported from `src/actions/index.mjs` (the shape of membership's `noSuchProject(id, extra)`), and C-116.11 leaves ESCALATION_CHECKS (actions' row, with its `where`, replaces it); my R9 test then checks the answer is actions' row (code, check, translation, `action`, fixed `detail`). I need actions' branch merged into the tranche (§4) before I can make that change and run it. Meanwhile I apply N296 and N297 (the five three-line regions and my three unclassified `#edgeArgs` outcomes) and hold N217 last. Also for BOB (not mine to change, reported): the guard's arm G lists `NOT_PROPOSED` minted by escalation and membership, and `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT`, `NOT_A_PARTICIPANT` minted by escalation and other modules; K275 gives the determination codes to a conformance helper that its requirements do not yet provide, so escalation keeps minting them in T11.

## J2 · COMPLETE

**Entries applied.**
- N296: every live id R1–R21 confirmed against the suite (each named, by title, in a test that checks the whole requirement); every `not yet met: new module` mark holds, R1–R21, and the Uses line's `not yet met: N217` holds now (below). Marks to strike: all 22.
- N297 (my share, with N242): the five three-line regions (`is-named-response`, `is-end-once`, `is-suspend-once`, `is-resume-suspended`, `is-escalation-spliceable`) widened to the guard's floor, their details fuller (`ALREADY_SUSPENDED` carries `since`, `NOT_SUSPENDED` its `state`); `#edgeArgs` answers its refusals directly, so my three unclassified outcomes (is-edge-member, is-edge-open, is-edge-legal) are classified. The DEC-49 guard now reports no region failure and no unclassified outcome in `src/escalation/` (arm C 7 → 4; the 4 left are reevaluation's).
- N217 (K351): R9's `NO_SUCH_ACTION` is answered by actions' `noSuchAction(action)` (its R43, C-117.2); C-116.11 leaves `ESCALATION_CHECKS`, retired and not reused (said in checks.mjs' header). The R9 test checks the whole answer equals `noSuchAction(id)` with actions' row, for absent, not-an-action, unseen and none-named; real.test's R9 checks it over the real actions. Arm G's `NO_SUCH_ACTION` failure is gone.

**Deferred.** None of mine. Arm G's other five codes (`NOT_PROPOSED`, `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT`, `NOT_A_PARTICIPANT`) are routed to T12 (B2, N309).

**Found in other modules** (identical with my change stashed, so not caused by it):
- `monitoring`: 3 failing tests, R34, R44, R35 (`understanding.test.mjs:117`: `deadlineRecheck` answers no `marked` with `realActions: true`; R35 uses a stub escalation, so escalation is not in the path). Against monitoring R34/R35/R44, most likely actions' T11 change to `pendingClocks` or its clock marking.
- `affordances`: R19 fails (a `reasoned` op not refused with a JUSTIFICATION_REFUSALS code). `test/rung-ladder.test.mjs` (legacy-tests) fails its "NO UNBACKED CLAIM" arm, likely the same op.
- No generated artifact of another module made stale (only `src/escalation/` changed; agent-worker's and the plane's bundles are BOB's at layer close).

**Tests and checks.**
- escalation suite `test/m/escalation/*.test.mjs`: tests 28, pass 28, fail 0, todo 0.
- users' suites: monitoring 53 tests, 40 pass, 3 fail, 10 todo; affordances 74 tests, 72 pass, 1 fail, 1 todo; rung-ladder 1 fail (all identical before my change).
- DEC-49 guard `civicos-ui/check-refusal-codes.mjs`: 56 FAIL lines tranche-wide, none escalation's but the five arm-G codes routed to N309.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 10 product files, 37 relative imports; 0 failures. coverage: 21 of 21 live requirement ids named by a test; 0 failures. ownership: 5 files changed between tranche/T11 and HEAD; 0 failures.

Size (session_01CE181yr6UPtvYZGABsN4KC): test runs 9, module lines 1429
