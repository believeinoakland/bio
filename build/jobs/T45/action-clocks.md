# action-clocks (T45)

**Status** · session_01SzgSsYCCD2RfxoPSbTd8Rt · depth 2 · WAITING ON BOB (J2) · handled B5

## J1 · QUESTION

Five readings I am building on now (best reading first; I carry on unless an answer changes one).

1. R2 receipt and service. `actions` R80 names no read for another module. Reading: `actionRead`'s block (R25/R29) answers `receipts: [{ord, kind: "receipt"|"service", at, how, party?, ...}]`, oldest first. R2 counts `received` from the latest `kind: "receipt"` record on the first `sent` entry, else from that entry; `served` from the latest `kind: "service"` record on any `sent` entry, else undetermined. Please confirm the field name and shape with ACTIONS #16 (or name another read). Until `actions` merges, my fixture stands in for that field.
2. R18 "a member's statement of an entry through it". Reading: a new act `clockState({target, text, description, date, basis, basis_kind, owed_by?, stated_by?, held_in?, committed_by?, precedes?, lead?, why?, author, viewer})`, `op=clockstate`. It appends one entry through the action's revision, as R13 does. Refusals in order: `MACHINE_CANNOT_STATE_CLOCK` (new row C-123.7); `NO_SUCH_ACTION`; `CLOCK_ENTRY_REFUSED` (new row C-123.8, its detail naming the arm); then the revision's own refusals. `CLOCK_ENTRY_REFUSED` already exists, without a row, as R13's refusal of an amended date; the same row covers it. The new op stales op-declarations, op-grades, affordances and plane's route-map pins until their T45 jobs, as rule 4 (11) and (12) do; I will report it at COMPLETE.
3. R16 "not visible to every viewer of the step's place". Reading: the holder names `{action, position}` when the action belongs to no project (every member sees it), or when the step is placed in the action's own project. Otherwise it answers `{entry: "clock"}`. The holder reads the step's place and products with a machine viewer, in process. An arrival wait ties a step when its kind is the action's `action_kind` and its id is the action's id (steps' tests use `records_request`).
4. R18 `owed_by` at R13's adoption. The proposal's `owed_by` (from the deadline's, else `undetermined`) is written on the entry. The member may state `owed_by` in the act to replace it. `undetermined` is written as stated, never left to default.
5. R3 `due_at`. At adoption, a proposal whose due has minute precision writes `due_at` (`YYYY-MM-DDTHH:MM`) and `due_zone` on the entry. R3 answers `due_at` and `due_zone` from the entry where they are held, and null otherwise. `clockState` accepts them as well.

## J2 · REPORT

Built and pushed (efe82fe1ad): every T45 entry. action-clocks' tests: 66/66. I am waiting for your CHANGEs on the merges of conformance, action-grammar and actions, so I can re-run against them before COMPLETE. Found so far, for other modules:

1. `action-plans` R27, `test/m/action-plans/` "R27: no act rewrites a row of history … a purge empties it": red from this branch, "no such table: lead_shares". At start, action-clocks now registers with steps (R16). On a host where steps has not yet been made, that creates `stepsOf(host)`, whose default `observationLogOf(host)` declares observation-log's tables. action-plans' fixture never migrates them, so a whole-store purge fails. In the plane, steps is made first (`plane/store.mjs`:223) with its observation log migrated, so the product is unaffected. The fix is action-plans' fixture's: migrate observation-log's tables, or hand `actionClocksOf` a steps. ACTION-PLANS #9 can do it in its job, after this merge.
2. New op `clockstate` (R18, accepted in B2): affordances `catalogue.test.mjs` "R1 R12: … layer 9's op maps hold exactly its 41 mutating ops …" goes red (newly; it was green on the base). op-declarations "R19, R6" (already red under rule 4 (12)) now also lacks `clockstate`'s spec. The fix is op-declarations T45-45 (spec), op-grades T45-38 (grade, if it pins one), affordances T45-39, and the plane T45-47 (route map). No plane route-map pin went newly red.
3. Unchanged by me, and red on the base as well: filings R9 (rule 4 (7)); affordances' local-facts and filing-templates maps (4 (11)); answer-envelope family tests (4 (14)); the plane's two (4 (9), (11)); control-plane R2 and R53 (4 (12)).

## Completion (ACTION-CLOCKS #11)

**Read.** My requirements whole; my code (`index.mjs`, `count.mjs`, `ics.mjs`, `schema.mjs`, `checks.mjs`) and all ten test files whole (P20); the plan entry T45-28, its rules at the opening, the reconciliation (R1–R21) where it names this module, `draft-T45-l9b.md` §1 and §6–§9's lines on it; K2780, K2781, K2787, K2823. I read the public parts of `steps`, `duties`, `actions`, `action-grammar`, `local-facts`, `civil-time` and `jurisdictions` (with R74–R85) whole myself. For the rest of the set, which was over the 600 KB limit (mechanics §17 (3)), two helpers in this session each read whole the public parts of `record-grammar`, `record-core`, `membership`, `promotion`, `provenance`, `retrieval`, `conformance`, `standards` and `calc-grammar`, and wrote me digests citing each id. The sources stay binding.

**Applied** (readings confirmed by K2845, B2):
- R2: the deadlines are read from `local-facts.governingView`.
  - `received` counts from the latest receipt `actions` records on the first `sent` entry (its R80 `receipts`, the latest last). With none, it counts from that entry, saying "receipt not recorded: counted from sending".
  - `served` counts from the latest recorded service, and reads undetermined with none.
  - `start_from` and `start_note` say which event was used, in the answer and the trace.
  - A proposal carries `owed_by` from the deadline's, `undetermined` where it does not say.
- R3: each item carries `owed_by`, `due_at` and `due_zone` (null where the entry states no time), `steps` (R16), `noticed_by` (R17) and `says` (`OVERDUE_SAYS`: a question about a date, no finding). While `reply_owed: false`, no entry owed by the body is listed.
- R7: `stated` is the fifth kind, exported frozen in `BASIS_KINDS`. Its words name who stated it and where it is held, and never call it a law, rule or legal period. R2 never proposes one.
- R15: the group's own deadlines are those `owed_by: group`, plus dependencies and windows (`isGroupOwn`). A body's commitment, and a stated entry not marked the group's, are never counted. The answer now carries `counts` in place of `kinds`.
- R16: registered once at start as steps' due holder (`stepDueHolder`), and `clockForStep` added. A step is tied to an action by being its product, or by an arrival wait of the action's own kind.
  - The holder answers `{entry: "clock"}` unless the action is in no project, or the step is placed in the action's own project (K2823).
  - R3's and R5's items carry `steps`.
- R17: `noticed_by: {duty, occurrence}`, from the addressee office's duties (`dutiesOf`, then `occurrencesOf`). It is set when an occurrence is triggered by this action's own `sent` entry and its due date, or a candidate of it, is the entry's date. Withdrawn duties are passed over.
- R18:
  - `CLOCK_OWED_BY` is read from `action-grammar`.
  - R13's adoption writes `owed_by`: the proposal's, or the member's stated value. It also keeps a count's `due_at` and `due_zone`.
  - `clockState` (`op=clockstate`) is the member's statement of an entry. New rows: C-123.7 `MACHINE_CANNOT_STATE_CLOCK` and C-123.8 `CLOCK_ENTRY_REFUSED`, the latter now also covering R13's amended-date refusal, which had no row.
  - `ourDeadlines` added.

**Flaws fixed in my module.** `CLOCK_ENTRY_REFUSED` (R13) was minted without a catalogue row. It now has one (C-123.8), with its `arm`.

**Deferred.** None.

**Found in other modules** (REPORT J2; answered in B4):
1. `action-plans` R27's purge test fails: its fixture does not migrate observation-log's tables, which `stepsOf(host)` now declares when action-clocks starts. Forwarded to ACTION-PLANS.
2. The new op `clockstate` has no spec, grade or route yet (op-declarations T45-45, op-grades T45-38, affordances T45-39, plane T45-47). Accepted under rule 4 (11) and (12); against the current tranche it adds no red of its own.
3. Every other red in its users is on `tranche/T45` as well. I diffed, test by test, filings, action-plans, affordances, op-declarations, answer-envelope, plane and control-plane against a checkout of `origin/tranche/T45`: the only difference is (1).

**Tests and checks** (on `tranche/T45` with conformance, action-grammar and actions merged):
- `action-clocks`: 66 pass, 0 fail. The receipts come from actions' real `actionReceipt`; `duties` is a stand-in in R17's test (duties R7 and R9 shapes).
- Users and providers: monitoring 124/0, queue-producers 84/0, queue 136/0, steps 44/0, duties 62/0, actions 110/0, op-grades 51/0.
- With base-identical reds only: filings 35/35, affordances 218/8, op-declarations 132/1, answer-envelope 26/5, plane 188/8, control-plane 219/4.
- action-plans 60/3: base-identical except R27, which is (1).
- format: 153 modules, 0 failures.
- architecture: 16 product files, 76 relative imports, 0 failures.
- coverage: 18 of 18 live ids, 0 failures.
- ownership: 10 files, 0 failures.

Size (session_01SzgSsYCCD2RfxoPSbTd8Rt): test runs 24, module lines 2051
