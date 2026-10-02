# intent (T22)

**Status** · session_016UvGqHeQmeB5Sdj9mw2LCb · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 7; B2 answered J1, K1068).
- **(1) DEC-88: R2 met.** `setCondition({project, condition, reason, author, viewer})` (`src/intent/index.mjs`) refuses a reason absent, not a string, blank or only whitespace `INTENT_NO_REASON` (R30, C-111.13 through `refuseNoReason`, its row unchanged), after `PROJECT_ACT_NOT_A_PARTICIPANT` and before `CONDITION_UNREADABLE`, a removal (`condition` null) included, so nothing is written. The reason, trimmed and unbounded (as R8's), is carried on the revision with the condition: the revision's Session Log entry reads `Reason: <the author's words>` beside the condition (a heading-like line set in, as every body text here), and the answer carries `reason`. One helper, `reasonOf`, judges both acts.
- **(2) DEC-88 (4): R18 met.** `workObjective({project, reason, author, viewer, run})` refuses `INTENT_NO_REASON` after `MACHINE_CANNOT_CHOOSE_THE_QUESTION` and before the project is read, with no run opened. The reason is recorded on the run's opening as ai-runs' `label` (stored at the open, never changed by a tick, answered by `read` and `listInContext` beside `budget` and `context`), winning over any caller `label` in `run`, and carried in `state.instructions.reason`; the answer carries `reason` (J1, confirmed B2, K1068). No ai-runs change. The dispatch passes the body whole, unchanged.
- **(3) progressions' `NO_BASIS` callers cleared:** `test/m/intent/fixture.mjs`:203 (`define()`) and `test/m/intent/invariants.test.mjs`:207 send a basis statement; with them `test/m/affordances/backing.test.mjs`:30 (R19) is green. No progressions or affordances file edited.
- **My tests:** every call that sets a condition or works an objective sends a reason (bounds, discovery, grammar, invariants, objective, serves), refusal-proving calls included where the refusal asked is earlier. New `test/m/intent/reasons.test.mjs`: R2 and R18 with negative controls (eleven non-reasons: absent, null, numbers, a boolean, objects, an array, empty, blank, whitespace; each refused C-111.13 with its row's translation, nothing written: the whole database, the project's document and its `bundleSha` unchanged for R2, a change, a removal and an unreadable condition alike; no run opened for R18, over a visible, hidden and absent project); machine, absent or unseen project and not-joined still refused first; a reasoned condition and removal carried on the revision's log entry and read back trimmed, unbounded; a reasoned run read back over the REAL ai-runs (built on ai-runs' own test world, read only) as `session.label` with its budget and its project scope, standing after a tick replaces the scratch, and in `listInContext`.
- **Re-scan (N469, N471, N480):** no note in my paths names a T20-deleted file, `tools/` or the plane's deleted `index.mjs` as live; the `legacy-checks` note in `index.mjs`'s header is provenance and stays.

**Deferred:** none.

**Other modules (REPORT J2):** the plane bundle stale (not regenerated); no caller of either act in another module (affordances and op-declarations name the ops only); affordances' `is` sentences for `objectivecondition` and `workobjective` do not mention the reason (its L11 job).

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/intent/`: tests 65, pass 65, fail 0 (R9's `pursuits.test.mjs`:103 and R11's :153 among them). Before my change: 31 pass, 29 fail (the fixture's missing basis).
- Users' suites: monitoring 79/0 fail; scheduler 52/1 (`plane.test.mjs`:85, accepted); affordances 138/0 (`backing.test.mjs` green); queue-producers 49/4 (`proposals.test.mjs`:39, accepted); control-plane 102/2 (`doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15, accepted).
- `node --test test/m/`: tests 4871, pass 4843, fail 9, all accepted by name (actions `t18.test.mjs`:299; scheduler `plane.test.mjs`:85; queue-producers `proposals.test.mjs`:39 ×4; case-authoring `members.test.mjs`:129; control-plane `doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15); none new.
- `test/system/row-census.test.mjs`: 7 pass, 1 fail (accepted red 3; no intent row listed, none changed). `test/system/fleetbundles.test.mjs`: bio-plane's member stale from `src/intent/index.mjs` (J2); every other member passes.
- `node checks/format.mjs`: 85 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … intent`: 14 product files, 54 relative imports; 0 failures
- `node checks/coverage.mjs … intent`: 30 of 30 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … intent tranche/T22`: 10 files changed; 0 failures

**For COMPLETE:** R2 and R18 met (their `not yet met: T22` marks are BOB's to strike); fixture.mjs:203, invariants.test.mjs:207 and affordances backing.test.mjs:30 cleared.

Size (session_016UvGqHeQmeB5Sdj9mw2LCb): test runs 17, module lines 1943

## J1 · QUESTION

R18's "the reason is recorded on the run's opening and shown with its budget and scope": ai-runs' `open` (R9, R10) offers two places that its `read` (R19) shows beside `budget` and `context`: `label` (stored at open, never changed by a tick; `bio-plane/src/ai-runs/index.mjs`:985–990, read at :1727) and `state` (shown, but replaced by any tick that sends one, R12, so it is not a durable record of the opening). Neither needs an ai-runs change.

My best reading, which I am building now: `workObjective` passes the member's reason (trimmed) as the run's `label`, which wins over any `label` the caller put in `run`, so `read` and `listInContext` answer it as `session.label` with `budget` and `context` for the run's life; it also carries `reason` inside `state.instructions` beside the objective, condition, gaps and authority, so the assistant reads it, and in its own answer. If you want it elsewhere (e.g. state only, or a field ai-runs adds), answer and I will bring it in line.

## J2 · REPORT

For acceptance or routing (P4), before my merge. (1) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) are stale from src/intent/index.mjs (fleetbundles §8: STALE BUNDLE, and a fresh build is not byte-identical); not regenerated (manifest, "Generated artifacts"). (2) Callers: re-grepped `setCondition(`, `workObjective(`, `objectivecondition`, `workobjective` over bio-plane/, agent-worker/, civicos-ui/ on job/T22/intent: no caller in another module. Only names: affordances (src/affordances.mjs:1176, :1181 the `is` sentences, :2622, :2645; RUNG_ABSENT, L11) and op-declarations (src/op-declarations/index.mjs:536, :552, :1134–1135, :2165, :2174), and test/m/affordances/catalogue.test.mjs:407–408. No red from this change. (3) An improvement in another module, for affordances' L11 job: its `is` sentences for `objectivecondition` (:1176) and `workobjective` (:1181) do not say the act now takes the member's reason (intent R2, R18; DEC-88), which its `reasoned` rung would name. (4) Reds in the whole test/m (4871 tests, 9 fail): all accepted by name, none new: actions t18.test.mjs:299; scheduler plane.test.mjs:85; queue-producers proposals.test.mjs:39 (4 tests); case-authoring members.test.mjs:129; control-plane doorbell.test.mjs:310 and catalogue-end.test.mjs:15. Cleared: intent's fixture (all intent tests) and affordances backing.test.mjs R19. row-census red as accepted (red 3); it lists no intent row: no row changed.
