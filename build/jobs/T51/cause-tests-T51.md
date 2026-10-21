# cause-tests-T51 (T51)

**Status** · session_013Uk1PvTsixvPCzxY7RSnZQ · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · BLOCKED

Cause: needs Bob (item 3 of the START). Pushed at 04d3585164 on job/T51/cause-tests-T51.

Five of the six corrections are in, and the item-3 registration is in; item 3's test (#324) stays red for a reason a test edit cannot fix.

Applied (all in the four held modules' test paths; no src touched):
1. control-plane r53-routes.test.mjs: reproduced (`strengthbarset for admin: author`: got token:admin, expected class:admin). Now a declaration act's author is `token:<class>` for a caller with no session, the member for a session; the act list is op-declarations' DECLARATION_ACTIONS. File 6/6.
2. control-plane t46-e2e.test.mjs: the read after release now waits for finished.release > 0, as line 173 does. Not reproduced: the test passed before and after in my runs, so this is the race you describe, not a seen failure.
3. control-plane register-declared.mjs: now registers with op-declarations and op-grades, the plane's way (src/plane/declarations.mjs). Result below.
4. plane split.test.mjs: reproduced (NO_SUCH_BUNDLE on the list with bundleId=X-none). The list form is asked without a bundleId; the bundleId case is checked against provenanceRouteOf (and the same arms' chain and route with a bundleId). 5/5.
5. screens-intake capture.test.mjs: not reproduced (50/50 before and after). Applied a bounded wait for the promote request at :489. The same read at :498 in the same test had the same pattern, so it takes the same wait.
6. screens-settings kit.mjs: not reproduced (account 18/18 before and after). `press(..., {wait:true})` now waits up to 20 s, by time, for the request itself, not 200 polls.

Item 3, the stuck part. Before my change (op-declarations only) #324 failed with `export` unpublished. With the plane's two registrations, `export` is no longer unpublished, but the totality is still red, and it is red in the plane's own assembly too, not only in the test. Run from the plane's own declarations.mjs and the same table: unaccounted gives unpublished ["export"], unranked [], and 22 stale names: biasinhale, biasmanifest, bootstrap, captureprogressions, casedetailspublic, entitybyalias, exportlog, frontier, instance, invitelook, list, login, monitoring, monitorslate, pdfstructure, progression, provenanceroutes, reevaluations, runtime, search, selftest, verify. Those are RUNG_ABSENT or NON_ACTS entries that op-grades' registration writes from owners' rows, for ops the door's table does not carry as mutating (or gated). I did not edit op-grades or weaken #324.

Question for Bob, with options:
(a) The owners of those 22 rows, and of `export`, correct their DECLARED_OPS (the rows are wrong for a read, or the op is not an act). Owner modules are not mine.
(b) op-grades' registration takes only the rows the totality counts. A code change in op-grades, not mine.
(c) Something in your own reading that I have not seen.
Recommendation: (a), after a check of three or four of the 22 rows against their ops; I have not verified which rows are wrong. Until you rule, the register-declared.mjs change stays (it is the plane's way); revert it if you rule otherwise.

Found while running, not mine, reported only:
- screens-settings contract.test.mjs (R39): `screen.bias.adoptfor.label` is read by screens-settings' bias.mjs:141 and is not in the module's words. Fails at HEAD without my changes too. A code gap in the module, not a test: not fixed.
- plane R24: "screen.objective.purpose is held by the words list": the four purpose rows you already put to T52.
- checks/run.mjs: coverage red in agent-harness (R17), agent-runner (R37 R38 R40), installer-steps (R26 R31), journey-check (R19), screens-inquiry (R110). None is a held module.
- plane system suite test/system/migrate-released.test.mjs runs past 500 s here. It is running again in the background; its result follows in a later entry.

Checks (the checks at prep/cause-job-K4273, the multi-module ownership form; the main branch's ownership check takes one module only):
- format: 175 modules, 175 requirements files; 0 failures.
- architecture: control-plane, plane, screens-intake, screens-settings: 0 failures each.
- coverage: control-plane 83/83, plane 73/73, screens-intake 52/52, screens-settings 76/76 live ids named by a test.
- ownership control-plane,plane,screens-intake,screens-settings origin/tranche/T51 HEAD: 0 failures.

Suites (summary lines):
- control-plane: tests 324, pass 323, fail 1 (#324, item 3).
- plane: tests 280, pass 279, fail 1 (R24, not held here: T52).
- screens-intake: tests 181, pass 181, fail 0.
- screens-settings: tests 210, pass 209, fail 1 (R39 contract, pre-existing, see above).

Waiting on Bob's ruling for item 3. When it comes I finish: COMPLETE, the Size line, and the record.
