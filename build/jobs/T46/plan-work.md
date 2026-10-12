# plan-work (T46)

**Status** · session_01QnyQWJJonW3PETrFRksgee · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R14: "`statusReportSave`'s `from` records that the text began as the assistant's draft, labelled machine work (`record-grammar`'s `proposalLabel`)". `proposalLabel(proposedBy, subject)` throws for any subject not in `PROPOSAL_STATES`, and none of its 17 subjects is a status report (the nearest, `filing_draft` and `communication`, say "approve or send", which misleads for a report kept with the plan and never published). record-grammar is not mine to change.

My best reading, which I am building now: `from` takes, besides today's one-line string, `{assistant: true}` (the member's word that the text began as the assistant's draft); the row keeps `{draft: "assistant", label}`, where `label` is `{by: "class:assistant"-style machine identity, state, machine_work: true, says}`, its `state` from record-grammar's `lawProposalState` and its `says` this module's own sentence ("the assistant drafted this report from the items where the plan stands; machine work, labelled as machine work, and the report kept is the member's"), shaped exactly as `proposalLabel` answers, so a later `status_report` subject in `PROPOSAL_STATES` replaces it at one site. If you would rather record-grammar gain `status_report` (a REPORT to its owner), say so and I switch to `proposalLabel(by, "status_report")`.

## Completion (T46-40)

**Read whole** (P20; mechanics §6 step 2; B1): `build/requirements/plan-work.md`; the public parts of action-plans, actions, action-holds, action-replies, action-clocks, escalation, filings, conformance, duties, reading-guides, ai-runs, civil-time, membership, record-core and record-grammar; layer 9's contract in `build/layers.md`; `build/plan/study-T46-assistant.md` §2; my entry T46-40 and the plan's notes on N920/N921; all of `bio-plane/src/plan-work/` and `bio-plane/test/m/plan-work/`. No entry names built work on the snapshot branch.

**Entries applied.**
- (N920) R14: `statusReportAssist({plan, nowMs, viewer})`, op `statusreportassist` in `planWorkOps` (read as the stamped viewer, like `statusreportdraft`). Past sight it answers `{ok, plan, as_of, items}` (and `out_of_view` where R7 withholds), `items` exactly R8's, assembled by the one helper `reportItems` that `statusReportDraft` now uses too; a plan the viewer may not see answers `noSuchPlan`. No AI refusal, no model call, no run, no edge to `run-rules` (K2953: the door gates; control-plane's `draftDue` is to recognise this items answer, plan note on T46-59). `statusReportSave`'s `from` takes, besides R8's one line, `{assistant: true, as_of?}`, kept as `{draft: "assistant", as_of, label: ASSIST_LABEL}`, the label shaped as `proposalLabel` answers, its state `lawProposalState("class:ai")` (`machine_proposed`), its sentence this module's (J1: record-grammar holds no status-report subject; one site to switch when it does). Any other `from` is `PLAN_WORK_TEXT_REFUSED` (field `from`), writing nothing.
- (N921) R15: `matterPromiseDuties` answers `met_at`: when `all_met`, for each occurrence of each duty, the start of the run of `met`/`met_late` readings ending its recorded transitions (`duties.transitionsOf`, its R13/R14, at the reader's sight, `DUTIES_INTERNAL` for the module's own read), its `as_of`; the latest over all occurrences. Null when not all met; null with `met_at_why` when an occurrence's recorded readings do not end met (derivation ahead of the recorder), or cannot be read. Never derived from `occurrencesOf` or evidence (following R27).

**Deferred.** None. One reading open with BOB: J1 (the label's subject).

**Found in other modules / for BOB.**
- `plan-work` requirements' Uses names `duties`: `dutiesArisingIn` only; R15 reads `duties.transitionsOf` (R14) too, same edge. The Uses line could name it.
- `record-grammar`: no `PROPOSAL_STATES` subject fits a status report (J1).
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundles plan-work's source); BOB regenerates at the layer close.
- The new op `statusreportassist` opens the reds plan rule 5 already names (op-declarations, op-grades, affordances, control-plane and plane totality and route-map tests) until T46-51, -44, -45, -59, -62.

**Tests and checks.**
- `node --test bio-plane/test/m/plan-work/`: tests 45, pass 45, fail 0 (new: R14 ×3 in `stands.test.mjs`, R15 ×2 in `takeup.test.mjs`; `ops.test.mjs` reads `statusreportassist`; the fixture's duties stand-in gains `transitionsOf` in R14's shape). Layer tests: none named in `build/manifest.md`.
- Users of plan-work, unchanged and green: `following/` 73 pass, `affordances/t45` 4, `affordances/plane` 30, `action-producers/` 36, `action-plans/t45` 12, `actions/t45` 28, `skills/action` 11, `membership/module-order` 10; 0 fail each.
- `node checks/format.mjs`: 159 modules, 158 requirements files; 0 failures.
- `node checks/architecture.mjs . plan-work`: 12 product files, 48 relative imports; 0 failures. `checks/run.mjs`: architecture 0 failures over the product (coverage's 29 failures are other modules', none plan-work's).
- `node checks/coverage.mjs . plan-work`: 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . plan-work tranche/T46`: 0 failures.

Size (session_01QnyQWJJonW3PETrFRksgee): test runs 6, module lines 1415
