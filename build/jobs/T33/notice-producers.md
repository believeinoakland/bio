# notice-producers (T33)

**Status** · session_017yxbe6zCxuzAzivuMU5Rbw · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings, none blocking; I build on each unless you answer otherwise.
(1) R2, R3 recipients and scope (Suggestions 2, still open): for each project the member participates in (joined or leaving; at most 50 in id order, the bound and `truncated` in `facts`, as queue-producers R4), I read `people.checkResults({project, viewer})` and `money-checks.noticed({project, viewer})`. A result either answers to this viewer is the member's item (both services already withhold a result resting on any input the viewer may not see, and apply the gate and the per-project switch). A group-wide check or detector (no project of its own) therefore reaches the members of each project where it is not switched off who may see every input; one item per result, keyed as R2/R3, homed under every such project of the member's. A machine credential (no member) gets none.
(2) R5 enumeration: `duties.dutiesOf` needs an entity, so I take the obligors from the `duties` table (its R20 read contract), call `dutiesOf({entity, as: "obligor", viewer})` for each (sight is duties'), and `occurrencesOf({dutyId, asOf: now, viewer})` with its default window; at most 500 duties per read, with `truncated` in `facts`. An `undetermined` occurrence is an item only when `civil-time.overdueOn({due, at: now, side: "body"})` answers POSSIBLY_OVERDUE (between the candidates, no match held); `due` is the latest candidate's local day (a body's due).
(3) R5 "raised once per occurrence and state" vs its key `FINDING::temporal-expectation-due::<duty>::<occurrence>` (no state): I follow the key as written, so one item per occurrence whose detail states "overdue" or "possibly overdue"; a member who disposed of the "possibly overdue" item is not told again when it becomes overdue. If you want a fresh item at the change, the key gains `::<state>` (as queue-producers R21's `<path>::<status>`).
