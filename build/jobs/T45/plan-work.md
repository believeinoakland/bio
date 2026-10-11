# plan-work (T45)

**Status** · session_01KvuonAaLKfAEaHnozQTt17 · depth 2 · COMPLETE · handled B9

## J1 · QUESTION

Seven points the requirements leave open. I am building on the reading given for each and carry on; none stops the job.

1. **R10's run, its open arguments.** `ai-runs.open` needs `run`, `principalPlane`, `principalClaude`, `skillVersion` and `bounds`; nothing names them for a re-examination. Reading: `run` = `RXM-<day>-<12 hex of sha256(plan|response)>`; `principalPlane` and `principalClaude` = the recording member (`member:<id>`, also `actor` and `viewer`), so ai-runs R52 picks the project's account first, else hers; `skillVersion` a constant here, `"planning@1"` (`REEXAM_SKILL`); `bounds` `[{proposals: 20}, {wallclock: 600000}]` (fetches and subsessions 0, R46). Any refusal (mode not deployed, no account, `AI_RUN_REEXAM_OPEN`) is kept in the re-examination's record and never undoes the marks or the entry. "Where AI is enabled" = `open` does not refuse.
2. **R43's mark shape** (action-plans not yet merged). Reading: `planMark({plan, marks, cause})`, each mark `{kind, why, ...}` with `kind` one of `premise_changed` (`option`), `date_changed` (`option`, `date`), `phase_started` (`scenario`, `phase`), `next_route` (`guide`, `route`, `citation`, `after`), `chance_to_fix` (`subject`); `cause` `{response: "<action>#<ord>", action, ord, at}`. I adopt action-plans' names at its merge.
3. **R1's text.** `PLAN_NO_REASON` is action-plans' (C-124, its `refuseReason`, max 500). Reading: R1 answers through `refuseReason` and states `max: 1000` beside it; no second minting site.
4. **Texts R4, R5, R6, R8 name no code** (review entry 1–4,000, preparation item, comment 1–4,000, report 1–8,000). Reading: one C-151 row, `PLAN_WORK_TEXT_REFUSED`, with `field` and `max`; a preparation item's text 1–500 (action-plans R4's rule), a target date `YYYY-MM-DD` else the same row.
5. **R11's item.** Reading: `{kind: "clock", action, entry}`, `{kind: "checkpoint", plan, scenario, phase}`, `{kind: "escalation_stage", escalation, stage}`, `{kind: "hold", target, ord?}` or `{kind: "hold", project}`; visible when its owner's read answers it to the member (actions, action-plans, escalation `proposed`, action-holds `holdsOf`). A take-up records `{item, by, at, target?}`, appended; `takeUpsFor` lists them oldest first with `cursor`.
6. **`OPTION_KEY_REFUSED`** (R5, R11) is action-plans' (`refuseKeys`). Reading: answered through `refuseKeys`, with `keys: ["for"]` when `for` names another member; `for` naming the author herself lands.
7. **Who may act; a closed plan.** Reading: any member who sees the plan (`action-plans.planRead` answers her) acts; no joined fence, since R1 lists none. Every write here refuses `PLAN_CLOSED` (through `action-plans`' own answer) on a closed plan; a paused plan takes every act (action-plans R40). R4's rhythm zone: the `zone` given, else `actions.place()`'s; none is `REVIEW_RHYTHM_REFUSED`.

## Completion (T45-34)

**Entries applied.** T45-34: `plan-work` built fresh (no ids move), R1–R13 (R8 system-assembled only, its assistant arm left out of T45; R9 registered by `following` alone; R13 reconciliation R18). J1's seven readings as confirmed by B2 (K2845); B3 (K2848) applied: R10's marks are action-plans R43's `option_changed`, `phase_start_holds`, `next_routes` (up to 20 route names), `cause {action, ord}`, `why` 1–500; the chance to fix is never marked (action-plans R41 derives it).

**Files added** (BOB adds them to `modules.json` before the ownership check, plan rule 3): `bio-plane/src/plan-work/index.mjs`, `checks.mjs`, `schema.mjs`; `bio-plane/test/m/plan-work/fixture.mjs`, `matters.test.mjs`, `timeline.test.mjs`, `prep.test.mjs`, `stands.test.mjs`, `reexam.test.mjs`, `takeup.test.mjs`, `invariants.test.mjs`, `ops.test.mjs`.

**Rows.** C-151.1–.8: `MATTER_NOT_OF_PLAN`, `REVIEW_RHYTHM_REFUSED`, `NO_SUCH_ITEM`, `PLAN_WORK_TEXT_REFUSED`, `NO_SUCH_PREP_ITEM`, `PREP_ITEM_DONE`, `COMMENT_TARGET_REFUSED`, `PLAN_WORK_PROVIDER_UNAVAILABLE` (`PLAN_WORK_CHECKS`, `src/plan-work/checks.mjs`, for answer-envelope's `CHECK_FAMILY_FILES`, T45-49). Relayed, not minted: `NO_SUCH_PLAN`, `PLAN_CLOSED`, `PLAN_NO_REASON`, `OPTION_KEY_REFUSED`, `NO_SUCH_OPTION` (action-plans' sites), `LISTENER_*` (membership).

**Ops** (`planWorkOps`, for op-declarations T45-45, op-grades T45-38, affordances T45-39, plane T45-47): acts `matteroutcomeset`, `planreviewrhythm`, `planreviewrecord`, `prepitemadd`, `prepitemtakeup`, `prepitemdone`, `plancomment`, `statusreportsave`, `itemtakeup`; reads `matters`, `plantimeline`, `planreviewopen`, `planreviews`, `prepitems`, `plancomments`, `whereitstands`, `statusreportdraft`, `statusreports`, `matterpromiseduties`. In-process (no op): `planReviewsDue`, `takeUpsFor` (action-producers), `registerWatchReader` (following), `closeSnapshot`, `onResponse`, `reexaminations`. A missing viewer or author stamp reads as `""`, never as the module's own sight.

**Built against readings, pending providers' merges (L9 order: they merge before plan-work).** `action-plans` R43 `planMark`, R44 `registerCloseSnapshot`, `marks` in `planRead`, R39's set-aside scenarios (read as `scenarios[].set_aside`); `actions` R95 `registerResponseListener`, R80 `receipts`, R18's `owed_by` on clock entries; `action-holds` R2/R3/R7; `action-replies` R2; `conformance` R37 `curesOf`; `escalation` R31 `stopped_pursuing`; `filings` R37/R38 purposes (`filingsFor` already answers `purpose`). Tests stand in for these in their Provides' shape (the fixture header says which); each registration at start is made only where its provider offers it (`registered` answers which). `action-holds` and `action-replies` are reached through `deps` (no factory import until their files exist); the plane composes them (T45-47) or I import their factories at their merge's CHANGE.

**Deferred.** None of this module's requirements. Smaller than P6's estimate (about 1,320 code lines against 1,800–2,300): every read is derived through its owner, nothing cached.

**Found in other modules (REPORT J2).** (a) `actions`/`action-plans`: an action started by `action-plans.optionStart` carries no `project` (`record.bundleInfo(id).project` is null), so `actions`' sight (`membership.viewerPredicate`'s "outside every project" arm) answers it to any member: in the test world dave, outside P, reads P's plan's action through `actionRead`. Against action-plans R25 (never published; read only by who may see its project) and DEC-36. (b) `action-plans` exports no one site for `MACHINE_CANNOT_PLAN` (C-124.1; `#member` is private), so plan-work relays its row from `ACTION_PLAN_CHECKS` in `machineCannotPlan()` (a second site for the code, K231); an exported `machineCannotPlan(extra?)` in action-plans would make it one.

**Tests and checks.**
- `node --test bio-plane/test/m/plan-work/`: tests 37, pass 37, fail 0. Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs .`: 153 modules, 152 requirements files; 0 failures.
- `node checks/architecture.mjs . plan-work`: 12 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs . plan-work`: 13 of 13 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . plan-work tranche/T45`: 0 failures.
  (architecture, coverage and ownership run with `modules.json` naming the two paths above in a working copy only, not committed: BOB adds them.)

Size (session_01KvuonAaLKfAEaHnozQTt17): test runs 14, module lines 1318

## J2 · REPORT

Two findings in other modules (also in my record).
(a) actions / action-plans: an action started by `action-plans.optionStart` carries no `project` (`record.bundleInfo(id).project` is null), so `actions`' sight (`viewerPredicate`'s "outside every project" arm) answers it to any member. In plan-work's test world dave, outside project P, reads P's plan's action through `actions.actionRead`. Against action-plans R25 (a plan is read only by who may see its project) and DEC-36. plan-work's own reads withhold it only where `actionRead` does.
(b) action-plans exports no one site for `MACHINE_CANNOT_PLAN` (C-124.1; `#member` is private). plan-work relays its row from `ACTION_PLAN_CHECKS` in `machineCannotPlan()`, a second site for the code (K231). An exported `machineCannotPlan(extra?)` in action-plans would make it one; I would then answer through it.

## J3 · COMPLETE

T45-34 complete on `job/T45/plan-work` @ the record's commit: plan-work R1–R13 built fresh, B2's readings and B3's mark shape (K2848) applied. 37 tests pass; format, architecture, coverage (13 of 13) and ownership 0 failures, the last three with `modules.json` naming `bio-plane/src/plan-work/` and `bio-plane/test/m/plan-work/` in a working copy only: please add them (plan rule 3). Files, rows (C-151.1–.8), ops and the providers built against readings (action-plans R43/R44/R39, actions R95/R80, action-holds, action-replies, conformance R37, escalation R31) are listed in my record. On each provider's merge CHANGE I merge the tranche and switch the tests' stand-ins to the real module. Findings: J2.

## B5 (CHANGE: conformance merged, K2852)

Merged `tranche/T45`. R2's `fixed` reads `conformance.curesOf`'s real shape (`standards: [{standard, link, ended}]`): a standing link is fixed; a link whose curing determination is superseded (`cure_standing: false`) or ended is not. The fixture's stand-in answers that shape; a new test reads `fixed` through the real conformance (its own test world: link, supersede, unlink). Tests 38 pass, 0 fail; format, architecture, coverage (13 of 13), ownership 0 failures (modules.json paths in a working copy only, as before).

Size (session_01KvuonAaLKfAEaHnozQTt17): test runs 17, module lines 1314

## J4 · COMPLETE

B5 applied: tranche/T45 merged; R2's fixed reads conformance R37's real curesOf shape (cure_standing false is no cure), with a test through the real conformance. 38 tests pass; the four checks 0 failures (paths in a working copy only). Record updated.

## B6 (CHANGE: action-holds merged, K2856)

Merged `tranche/T45`. plan-work reaches action-holds through its factory (`actionHoldsOf`); R7 reads `projectHolds`' `projects` and `holdsDue`'s `items` (the plan's actions and project only), R11 a hold item through `holdsOf`'s `holds`. The stand-in is dropped: the tests place real holds and pressure marks. A hold on a plan-started action is seen by every member (J2 (a): the action carries no project), so the take-up tests hold the project instead. Tests 38 pass, 0 fail; the four checks 0 failures (paths in a working copy only).

Size (session_01KvuonAaLKfAEaHnozQTt17): test runs 23, module lines 1312

## J5 · COMPLETE

B6 applied: tranche/T45 merged; action-holds reached through its factory, the stand-in dropped, tests on real holds and marks. 38 pass; the four checks 0 failures. Note: a hold on a plan-started action is visible to every member, J2 (a)'s consequence.

## B7 (CHANGE: actions merged, K2859)

Merged `tranche/T45`. The actions stand-ins are dropped: R10 is driven by actions' real `registerResponseListener` (registered at start, `{ok, module}`), and R13 reads real captures registered in the record. Two fixes found by the real wiring:
- actions' R95 passes `project` as `record.bundleInfo(action).project`, null for an action started from a plan (J2 (a)); R10 now takes the response's project from the action's plan when it has none, else no plan was ever re-examined.
- the re-examination is claimed (its `pw_reexams` row, with the marks) in the same synchronous step as its marks, before the run's opening is awaited; the run goes to a new append-only table `pw_reexam_runs` (declared to purge). So a response re-examines a plan once even when called again meanwhile. The run id's hash is `record-grammar.sha256HexSync` (no await).
Found in another module (REPORT J6): `action-plans` R18 composes `premise_override: {reason}` only, which `actions` R74 now refuses `OVERRIDE_NO_GROUND`; action-plans' own `start.test.mjs` R18 and `preview.test.mjs` R37 are red on the merged tranche (2 of 63).
Tests 39 pass, 0 fail; the four checks 0 failures (paths in a working copy only).

Size (session_01KvuonAaLKfAEaHnozQTt17): test runs 30, module lines 1329

## J6 · REPORT

Found with actions merged (K2859): action-plans R18 composes premise_override {reason} only, which actions R74 now refuses OVERRIDE_NO_GROUND (action-grammar R15's ground_kind/ground_what/ground_when, or legal_deadline's). On the merged tranche action-plans' own tests are red: start.test.mjs 'R18: a breach action on an inquiry-only subject...' and preview.test.mjs 'R37: each refusal is R18's own...' (61 pass, 2 fail). Also: actions R95 passes project = bundleInfo(action).project, null for every plan-started action (J2 (a)); plan-work now takes it from the action's plan.

## J7 · COMPLETE

B7 applied: tranche/T45 merged; actions real (its R95 listener drives R10; R13 on real captures). Two fixes from the real wiring: a plan-started action's project from its plan, and the re-examination claimed before the run's await (new table pw_reexam_runs). 39 pass; the four checks 0 failures. Finding in action-plans: J6.

## B8, B9 (CHANGEs: action-holds again K2860; action-clocks, action-replies K2862)

Merged `tranche/T45`. action-holds' second merge needs nothing here (plan-work reads `projectHolds`, `holdsDue`, `holdsOf`, unchanged in shape). action-clocks: plan-work reads clock entries, their basis and `owed_by` through `actions.actionRead`, so nothing to switch. action-replies: reached through its factory (`actionRepliesOf`), the stand-in dropped; the tests record real `aroseFromLink`s.
Reading applied (R10, "the projects linked to it by `arose_from` both ways"): a link is recorded on a response after that response is held, so a new response never carries links of its own. "It" is read as the response's project: forward, the projects (or plans' projects) that arose from any response of the responded action or of an action started from one of that project's plans (`aroseFrom` with no `ord`); backward, the projects of the responses the project arose from (`arisenFrom({project})`). Tests 39 pass, 0 fail; the four checks 0 failures (paths in a working copy only).

Size (session_01KvuonAaLKfAEaHnozQTt17): test runs 34, module lines 1339
