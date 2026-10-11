# action-plans (T45)

**Status** · session_01TfC1CmNozvRZtyciH6cRgT · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Three refusals the T45 text needs but does not name. My best reading for each, which I am building now; tell me if you want otherwise.

1. **R40 `look_again` that is not a `YYYY-MM-DD` day.** R40 lists only R20's refusals and `PLAN_NOT_OPEN` / `PLAN_NOT_PAUSED`. Reading: a new C-124 row `LOOK_AGAIN_REFUSED` ("A day to look again is written year-month-day. Nothing was written."), asked after `PLAN_NO_REASON` and before `PLAN_NOT_OPEN`.
2. **R20 closing `note` over 4,000 characters.** Reading: a new C-124 row `CLOSE_NOTE_TOO_LONG` ("A closing note is at most 4,000 characters. Nothing was written."), asked after `PLAN_NO_REASON`. The note may span lines and hold quotes (it is prose, kept in the log's JSON), unlike a reason.
3. **R41 `optionAdopt({plan, offer: {subject, kind}})` naming no standing offer of that plan** (the matter is not in the plan, not an infraction matter, or `kind` is neither `document_infraction` nor `chance_to_fix`). Reading: answered by the existing `NO_SUCH_PLAN_PROPOSAL` (C-124.22), the detail saying no such offer; no new row. An offer is adopted as often as a member chooses (the chance to fix is re-offered); the option records the offer it came from, and that is how R42 knows a matter's documentation option.

Both new rows go in C-124 (this module's own family), after the six T45 names, for the stamp.

## J2 · QUESTION

Three findings against other modules, with my reading for each; I build on the reading meanwhile.

1. **`paused` is not a state of `action_plan` in record-grammar** (`src/record-grammar/document.mjs`:398–403, its R35: `open → closed` only), and `promotion` refuses an undeclared move (`STATE_MOVE_UNDECLARED`). R40 names State Rules §4.4's `paused`, so record-grammar's table owes `paused` with the edges open→paused, paused→open, paused→closed. record-grammar is layer 1, closed this tranche. **My reading (built now):** the plan's document keeps `current_state: open` while paused; the pause and resume are entries of its Plan Log, and the plan's state (`plans.state`, every read, R17, R40) is derived from that log (`paused` after a pause until a resume or the close). Closing from paused moves the document open→closed as today. When record-grammar gains the edges, the document's `current_state` can follow in a later job; no read changes. If you would rather hold R40 until then, say so.
2. **R45's consumer does not exist.** No requirement of `ai-runs`, `skills` or `agent-worker` reads `closingNotesOf`; agent-worker R51 reads plans only through `op=plan` / `op=plans`, and R53/R78 fix its `PLANE_OPS`. **My reading:** I build `closingNotesOf({project, viewer})` as R45 states it, and also answer each closed plan's `note` in `planRead`'s `closed` block and in `plansFor` items (state `closed`), so the planning run sees the notes through the ops it already reads. Owed (not mine): an op for `closingNotesOf` if wanted (op-declarations), and agent-worker/skills text naming the notes as planning input.
3. **R43's `marks` and `cause` have no shape anywhere** (plan-work R10 names none). **My reading:** `planMark({plan, marks, cause})`, `cause` the response recorded, `{action, ord}` (also accepted as `"<action>#<ord>"`); each mark `{kind, why, option?, scenario?, phase?, routes?}`, `kind` one of `option_changed` (with `option`), `phase_start_holds` (with `scenario`, `phase`), `next_routes` (with `routes`, a list of up to 20 profile route names), `why` 1–500 characters. A malformed mark is skipped and named in the answer, never minted as a refusal (the op is in-process, plan-work's only); an absent plan answers `noSuchPlan`, a closed one `PLAN_CLOSED`. plan-work R10 also writes "the chance to fix re-offered" as a mark, while R41 derives `offered_again` on read: I derive it on read (R41) and accept no such mark kind. plan-work's job should know this shape.

Also for your record: the re-worded C-124.30 (`SCENARIO_OUT_OF_RANGE`) turns answer-envelope's `catalogue-end.test.mjs`:17 and `envelope.test.mjs`:253 (the `rows-before-r43.json` snapshot) red, and my new ops turn affordances `catalogue.test.mjs` (layer 9's op set) red until T45-39/45; op-declarations owes specs for `scenariosetaside`, `scenariorestore`, `planpause`, `planresume`.

## J3 · COMPLETE

**Entries applied.** T45-33 whole (N855 6b, N861, N885, N887, N890; D19, D25–D27; l9b §5.2), with B2 (K2845), B3 (K2848) and the CHANGE B4 (K2851):
- R14 any number of scenarios (`SCENARIO_OUT_OF_RANGE` only for a non-positive-integer; C-124.30 re-worded).
- R39 `scenarioSetAside` / `scenarioRestore` (ops `scenariosetaside`, `scenariorestore`): kept whole with reason, checkpoints never due (R17, and `checkpointRecord` answers `CHECKPOINT_NOT_DUE`), checks not run (R19).
- R40 `planPause` / `planResume` (ops `planpause`, `planresume`), `look_again`, `plansToLookAgain` (one item per pause, `pause` naming it); paused derived from the Plan Log, the document staying `open` (K2848; record-grammar's edges are N914). A paused plan still holds its matters (R3), takes every other act, and names what it set running (actions, escalations).
- R20 / R44 close: reason, optional `note` (≤4,000, may span lines), frozen summary from `registerCloseSnapshot` (one registration via `membership.listenerRefusal`; no reader or a throwing one → `undetermined`, close lands). `planRead` answers `closed: {by, at, reason, note, summary}` and `close_note_prompt: "plan.close.lessons"` while not closed.
- R45 `closingNotesOf({project, viewer})`, and each closed plan's note in `planRead` and `plansFor` (`closing_note`) (K2848; consumer text is N915).
- R41 offers derived on read (`document_infraction` first, `chance_to_fix` while not fixed via `conformance.curesOf` when present, `offered_again` from the latest action sent, filing sent or escalation advance); `optionAdopt({plan, offer})` records the offer on the option; unmatched → `NO_SUCH_PLAN_PROPOSAL` (now minted at one site, `refuseNoSuchProposal`).
- R42 `why_first` / `DOCUMENT_FIRST_NO_REASON`, asked after the contact check and before any write, kept in the start entry and the decision log.
- R43 `planMark` (in process), table `plan_marks` (declared to purge), shape as K2848; R24 marks decide nothing (byte-identical test).
- R6 `pause`, `set_aside`, `offers`, `marks`, `decisions`; R17, R24, R31, R33, R34 as amended.
- K2851: (a) the action an option starts states `project:` (the plan's), so it is fenced by the project's sight, tested through `actions.actionRead`; (b) `machineCannotPlan(extra?)` exported, the one site of C-124.1.
- New rows awaiting stamp: C-124.58 `NO_SUCH_SCENARIO`, .59 `SCENARIO_ALREADY_SET_ASIDE`, .60 `SCENARIO_NOT_SET_ASIDE`, .61 `PLAN_NOT_OPEN`, .62 `PLAN_NOT_PAUSED`, .63 `DOCUMENT_FIRST_NO_REASON`, .64 `LOOK_AGAIN_REFUSED`, .65 `CLOSE_NOTE_TOO_LONG`; re-worded: C-124.30, C-124.1 (now names set aside, pause, resume); `where` moved: C-124.1 (`machineCannotPlan`), C-124.22 (`refuseNoSuchProposal`).

**Read.** My requirements, code and tests whole (P20); the draft §5.2, K2780, K2781, K2787, the plan's reconciliation and rule 4. The used modules' public parts over the limit were read by a helper in this session, in full, with a cited digest (membership R81, escalation, filings, actions, plan-work, record-grammar R35, v0.2 §3–§4, ai-runs/skills/agent-worker, op-declarations).

**Deferred.** None.

**Found in other modules** (reported in J2, answered B3): record-grammar `action_plan` lacks `paused` (N914); no consumer of closing notes (N915); new ops lack specs/grades (op-declarations, op-grades, affordances; T45-38/39/45); the plane's route of the four new ops follows from `actionPlansOps` (no change needed).

**Tests and checks.**
- `node --test bio-plane/test/m/action-plans/`: 75 pass, 0 fail (new file `t45.test.mjs`; existing tests brought in line: R14's fourth scenario, R42's `why_first` in other starts, ops keys).
- Dependents compared against `tranche/T45`: new reds only affordances `catalogue.test.mjs` "R1 R12 … layer 9's op maps hold exactly …" (new ops; rule 4 (11)/(12)) and answer-envelope "R7, R2, R10: every code decorated before the catalogue's end …" (C-124 re-wordings; rule 4 (14)); queue-producers 84/0, following 50/0, op-grades 51/0, op-declarations, control-plane, plane unchanged.
- format: 0 failures; architecture: 0 failures; coverage: 45 of 45 live ids named; ownership: 15 files, 0 failures.

Size (session_01TfC1CmNozvRZtyciH6cRgT): test runs 13, module lines 3275

## J4 · COMPLETE

**B5 applied.** `tranche/T45` merged (conformance T45-23). The offers' "fixed" read (R41) now reads conformance R37's real answer: a matter is fixed when its standard's `link` (the standing cure) is non-null; an ended link fixes nothing. The fixture keeps conformance as its stand-in (the module's tests control determinations through it, as since T18); the stand-in's `curesOf` now answers R37's real shape, and the test adds the control that an ended cure leaves the chance to fix offered.

**B6 noted.** I fix the fixture (steps / observation-log tables) when action-clocks' merge CHANGE reaches me.

Tests: `bio-plane/test/m/action-plans/` 75 pass, 0 fail. Checks: format 0 failures; architecture 0; coverage 45 of 45; ownership 15 files, 0 failures. Everything in J3 otherwise stands.

Size (session_01TfC1CmNozvRZtyciH6cRgT): test runs 14, module lines 3274
