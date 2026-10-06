# notice-producers (T33)

**Status** · session_017yxbe6zCxuzAzivuMU5Rbw · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three readings, none blocking; I build on each unless you answer otherwise.
(1) R2, R3 recipients and scope (Suggestions 2, still open): for each project the member participates in (joined or leaving; at most 50 in id order, the bound and `truncated` in `facts`, as queue-producers R4), I read `people.checkResults({project, viewer})` and `money-checks.noticed({project, viewer})`. A result either answers to this viewer is the member's item (both services already withhold a result resting on any input the viewer may not see, and apply the gate and the per-project switch). A group-wide check or detector (no project of its own) therefore reaches the members of each project where it is not switched off who may see every input; one item per result, keyed as R2/R3, homed under every such project of the member's. A machine credential (no member) gets none.
(2) R5 enumeration: `duties.dutiesOf` needs an entity, so I take the obligors from the `duties` table (its R20 read contract), call `dutiesOf({entity, as: "obligor", viewer})` for each (sight is duties'), and `occurrencesOf({dutyId, asOf: now, viewer})` with its default window; at most 500 duties per read, with `truncated` in `facts`. An `undetermined` occurrence is an item only when `civil-time.overdueOn({due, at: now, side: "body"})` answers POSSIBLY_OVERDUE (between the candidates, no match held); `due` is the latest candidate's local day (a body's due).
(3) R5 "raised once per occurrence and state" vs its key `FINDING::temporal-expectation-due::<duty>::<occurrence>` (no state): I follow the key as written, so one item per occurrence whose detail states "overdue" or "possibly overdue"; a member who disposed of the "possibly overdue" item is not told again when it becomes overdue. If you want a fresh item at the change, the key gains `::<state>` (as queue-producers R21's `<path>::<status>`).

## J2 · COMPLETE

**Entries applied.** T33-82 (K1466, K1473, K1481, K1491), with B1's settlements (R6 an OBLIGATION; money-checks' `noticed` shape, K1566; `uses` gain membership and civil-time; display gated) and B2/K1676 (R5's key gains `::<state>`, `overdue` or `undetermined`). New module, 493 lines: `noticeProducersOf(host, deps)` (K1563 (1)), exporting `noticeItems` (R1) and the class map `NOTICE_KINDS` of its five kinds for queue's `classOfKind` (T33-83). R1–R10 met:
- R1: one read; each producer's bound and `truncated` in `facts` (projects 50, standing answers 5 pages of 200, duties 500), `facts.failed` naming a provider that threw (it then contributes no item); writes nothing, never throws.
- R2/R3 (J1 (1), accepted): per project the member participates in, `people.checkResults` and `money-checks.noticed` under the viewer; one item per result across projects, homed under each; the machine's, `noticed`, hypothesis layer; detail states condition (people's `listChecks`), denominator and derivation; options only `hypothesishold` (R8). R9's second guard: a check answer without `gated: false`, or a detector result without a stated rate ≤ 0.2, raises nothing.
- R4: `answers.standingAnswersFor`, one item per run, to its author alone; the held-back condition in plain words.
- R5 (J1 (2), accepted): obligors from duties' R20 read contract, `dutiesOf` per obligor, `occurrencesOf` as of the read's instant; `overdue`, or possibly overdue (`civil-time.overdueOn` → POSSIBLY_OVERDUE, no match held); `due` the latest candidate's local day; adopter, else project owners, else administrators; a group checkpoint never an item.
- R6: `inquiry.datedWaits` state `due`, OBLIGATION keyed `<inquiry>::<date>` (waits sharing a day named together), to the setter alone, offering `waitlook`.
**Paths and uses (for modules.json at the merge).** `paths` `bio-plane/src/notice-producers/`; `tests` `bio-plane/test/m/notice-producers/`; final `uses`: record-grammar, jurisdictions (R10's test reads the profiles' place names), civil-time, membership, money-checks, duties, people, inquiry, answers. `queue-producers` is dropped: nothing is imported from it (the item shape is matched, not read).
**Deferred.** Nothing in this module.
**Found in other modules (for BOB; no REPORT needed beyond this):** queue (T33-83) must call `noticeItems` beside `feedItems`, publish its `facts` (bounds, `failed`), add the five kinds to `classOfKind` (`NOTICE_KINDS`), and its dispositions for them (K1522). people's `checkResults` answers no gate rate on a result, so R9's second guard there rests on `gated: false` alone. No generated artifact is staled (nothing bundled imports this module yet).
**Tests and checks.** Tests over the real modules on each provider's own test world (people, money-checks, duties with civil-time, answers, inquiry), stand-ins only for R1's failure and bound cases: `node --test bio-plane/test/m/notice-producers/` → tests 36, pass 36, fail 0. No layer tests are named in the manifest. Checks, run on a scratch copy with the paths above filled into `modules.json` (on this branch they are still empty, BOB's to write): format 0 failures (126 modules); architecture 8 product files, 31 imports, 0 failures; coverage 10 of 10 live ids, 0 failures; ownership 9 files vs tranche/T33, 0 failures. Without the paths, architecture and ownership would report the files unowned.
Size (session_017yxbe6zCxuzAzivuMU5Rbw): test runs 16, module lines 1225

## J3 · COMPLETE

B3 (K1688) applied, after merging tranche/T33 (queue merged).
- `ageFrom` takes a zone: a date-only `since` starts at its local midnight through `civil-time.dayRange`. With no zone held, the age is undetermined (`no_zone`), never computed on the UTC day.
- R6's age is read in inquiry's own answered `zone` (`datedWaits`' `zone`). I did not add the instance-zone fallback through `actions`. It cannot be reached: inquiry answers a wait `due` only when it holds a zone (its R55; with none the wait reads `undetermined` and raises no item). It would only add an unused `actions` edge. If inquiry ever answers `due` without a zone, the age is undetermined.
- R5 had the same flaw (its age ran from the due day's UTC midnight). It now reads the due day in the due's own zone: the latest candidate's zone when overdue, the first candidate's when possibly overdue.
**Tests:** a west-of-UTC boundary test for R6 (Los Angeles, 07:00Z is age 0 and 08:00Z is one hour), R6 with no zone (undetermined), and R5 in Halifax. `node --test bio-plane/test/m/notice-producers/`: tests 39, pass 39, fail 0. queue's tests (`test/m/queue/`): 124 pass, 0 fail.
**Checks** on the real tree (paths now in modules.json): format 0 failures; architecture 8 files, 32 imports, 0 failures; coverage 10/10, 0 failures; ownership 3 files vs tranche/T33, 0 failures.
Uses unchanged.
Size (session_017yxbe6zCxuzAzivuMU5Rbw): test runs 19, module lines 1265
