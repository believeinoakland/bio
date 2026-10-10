# intent (T41)

**Status** · session_016rUmfMrmYSH7jvWKmSEXgc · depth 2 · COMPLETE · handled B0

## Completion (INTENT #14)

**Reading set** (mechanics §17): BOB measured 686 KB; intent's own code (5 files, 132 KB) and tests (10 files, 187 KB) alone are over 300 KB, so the over path (K2304). Read whole myself: `build/requirements/intent.md`; layer 7's row and section of `build/layers.md`; plan entry T41-32 and the opening's rule 4; K2442, K2451, K2483, K2505 (and K2408, K2304, K874); inquiry R59 and its code (`personsInNoPublicRole`, `personWarning`, `#personWarningAt`, `personFacts`, `#publicRole`, `inquiry_person_warnings`); promotion R39 (`registerStep`'s check and projection, and `promote`'s step loop); hypotheses R19's use of the warning; membership's `projectVisibilitySet`; every file of `bio-plane/src/intent/` except `doc.mjs` and `grammar.mjs` (whose `conditionOf` and exports I read as used); the tests the entry changes (`fixture.mjs`, and `amount.test.mjs` and `objective.test.mjs` in the parts changed, with their helpers). A worker read the other six test files in full (`bounds`, `grammar`, `invariants`, `pursuits`, `reasons`, `serves`; ~110 KB) and wrote a ~6 KB summary citing file:line for each statement: no administrator sight of a hidden project there (D54 touches only amount:153 and objective:313); the constraints a change must keep (exact `objective_condition` keys, invariants:57; reads and refusals write nothing, invariants:66, grammar:267, reasons:51; one revision and log entry per `setCondition`, reasons:82, :90, :103; no column of an `INTENT_TABLES` table named for progress, invariants:49; exact `servesOf` entries, serves:239, :251). Each was kept; nothing it left out mattered.

**Entries applied (T41-32):**
- **R32** (D13): a registered projection (promotion R39) on every project promotion that states its `objective` (creation) or revises it, or sets or changes its condition, asks inquiry R59's test through `inquiry.personFacts` and its pure `personWarning`: the objective's text, and the condition's entity as a subject. R16's `adopt` asks the same test over the proposal's question, its basis's entity and its instances' entities (at most 20). The act is never refused. The warning is answered (`warning`, with `act` and `choice`) and recorded in a new table `intent_person_warnings` (declared to purge, keyed by `project_id`) with her choice: `went_on` when the act says she saw it first (`personWarningSeen: true` on `setCondition`, `triage` or the promotion package), else `warned_at_act`; a machine's promotion records `pending`. Removing a condition, or a revision that leaves the objective and condition alone, asks nothing.
- **R33** (H30 (1)): `registerNoneExistsReader(reader)`, K31's pattern: once only, a function (refusals `NONE_EXISTS_READER_MALFORMED` C-111.30 and `NONE_EXISTS_READER_DECLARED` C-111.29, new rows). In the measure (R4), a required stage that is not placed is met when the reader answers a non-empty list for `{progression, entity, stage, viewer}`. It is stated beside the instance as `none_exists: [{stage, action, ord, at, says: "answered: none exists"}]`, from the first answer. It is computed on every read and never stored. With no reader, or an answer of `[]`, a throw or no `action`, nothing is met this way. A stage met this way places no document, so a required grade stays the record's (undetermined below two placed stages). `progress`, `gaps` (the gap's basis carries `none_exists` beside any still missing), `watchSet` (no viewer) and `servesOf` (the plane's sight) all read through it.
- **D54** (rule 4 (11), yours): `amount.test.mjs`:153 and `objective.test.mjs`:313 re-stated. The administrator is invited to the hidden project, so she sees it at `FULL`. Each test has two negative controls: the same administrator, neither invited nor joined, sees the bundle and fact as null (counts unchanged); and the project made discoverable, she sees them again.

**Tests:** new `t41.test.mjs` (8 tests; R32 ×4, R33 ×4, each with negative controls). The intent suite gives 82 pass, 0 fail. The users' suites (monitoring, scheduler, affordances, queue-producers, answer-envelope, store-door, control-plane, plane, `migrate-released`) give 963 tests, 905 pass, 58 fail, with the same 58 failing titles on `tranche/T41` alone: none is new.

**Checks** (civicos-process): `format` 145 modules, 0 failures; `architecture` 15 files, 0 failures; `coverage` 33 of 33 live ids, 0 failures; `ownership` 8 files, 0 failures.

**Final `uses`:** unchanged from `modules.json`; no new edge (`inquiry` was already listed: R32 adds `personFacts` and `personWarning`). Not imported by intent's code: `content` (the requirements already propose dropping it), `credentials`, `extraction`, `events`; I leave them for BOB to decide.

**Deferred:** none.

**Found in other modules:**
- `inquiry`: R32 reads `inquiry.personFacts`, an instance read hypotheses R19 also calls. Inquiry's requirements name only the pure `personWarning` and `personsInNoPublicRole` (R59), not `personFacts`. Proposed: name it in inquiry's Provides under R59.
- The plane bundle and `program.mjs` are stale from this merge (rule 4 (14)).

Size (session_016rUmfMrmYSH7jvWKmSEXgc): test runs 8, module lines 2263

## J1 · COMPLETE

T41-32 done. R32: the warning at an objective's or condition's promotion (registered projection) and at adopt, never refused, recorded in intent_person_warnings with her choice. R33: registerNoneExistsReader (C-111.29/.30 new rows), met stage stated as 'answered: none exists'. D54: amount:153 and objective:313 re-stated with negative controls. intent 82/82; users' suites identical to tranche (905/58, same titles); checks 0. Final uses unchanged. Found: inquiry.personFacts is read by intent R32 and hypotheses R19 but not named in inquiry's Provides. Record: build/jobs/T41/intent.md.
