# action-plans (T45)

**Status** · session_01TfC1CmNozvRZtyciH6cRgT · depth 2 · WORKING · handled B2

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
