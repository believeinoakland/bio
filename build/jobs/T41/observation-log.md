# observation-log (T41)

**Status** · session_01P7RDCwo1zaafZ1wjYhW3J1 · depth 2 · RUNNING until 2026-10-09T22:43:42Z (users' suites of observation-log (21 modules), with and without the change) · handled B2

## J1 · QUESTION

R37 (`onLookAnswered`), three points where the text admits two readings. I am building on my best reading of each; an answer changes only these lines.

1. "an earlier row ... stands LOOKED_ABSENT or LOOKED_INDETERMINATE": every such earlier row, or only those not already answered? Best reading: only the absences since the latest earlier `PRESENT` at that subject and level (an absence an earlier `PRESENT` answered no longer stands), so a second `PRESENT` does not re-notify the same absences (`steps` R23 keys its entries per step and observation; re-firing would mint a later_found entry per later PRESENT for one dead end).
2. "subject and level": the subject as this module identifies one everywhere else (R9's frontier and R10's `verification`): (`subject_kind`, `subject`) at a level. A row with a null subject has no subject and calls nothing.
3. "in the append's transaction": the append and every listener's call run in one `record-core.transact`; a listener that throws rolls back the row and its own writes and the throw propagates to the writer (as R30's testimony row does); a listener's return value is ignored. Listeners are called in `membership` R83's `MODULE_ORDER` order, then by name; with none registered, `observe` is unchanged.

## Completion (OBSERVATION-LOG #12)

**Reading set** (mechanics §17): BOB measured 597 KB. The module's own code (~218 KB) and tests (~160 KB) are over 300 KB on their own, so this job took the over path (K2304). Read whole myself: `build/requirements/observation-log.md` (and R37 again after K2467); plan entry T41-11; K2442, K2448; `steps` R9, R18, R23 (the provider side of R13 and R37); membership's Terms, R43, R44, R80, R81, R83, R88, R120 (the services R13 and R37 use); `index.mjs`, `vocabulary.mjs`, `fence.test.mjs`, `fixture.mjs` (the code and tests the entry changes). A worker read the rest whole: `checks.mjs`, `schema.mjs`, and the other nine test files. Its summary is about 10.5 KB; every statement cites a file and line. It covers each test, every place that lists authority kinds, every use of the founder or an administrator, every transaction, and the module's flaws. Two of its points mattered and are applied (the C-22.9 translation and the `subject_kind` comment). Nothing it left out mattered.

**Entries applied (T41-11).**
- **R1**: `OBSERVATION_AUTHORITY_KINDS` gains `step` with its sentence: "a step a member or your group's Civicsmith took in pursuit of a question, and the look it made" (R36's words kept). `schema.mjs`'s column comment names it.
- **R13**: `RESOLVED_AUTHORITY_KINDS` is `sweep`, `run`, `step`; `step` is held under `steps`. A `step` row is decided by the resolver `steps` R18 will register. With no resolver it falls back to a bundle of that id, and since a step id never names one, the row is withheld. A resolver's yes never overrides a hidden referent. The resolution itself is `steps`' (layer 6, not yet built).
- **R37**: `onLookAnswered(module, fn)`, as K2467 worded it:
  - one registration per module, through `listenerRefusal`; listeners ordered by `MODULE_ORDER`, then by name;
  - a `PRESENT` with a subject runs its append and the listener calls in one `record.transact`, through one index walk on `observation_log_frontier`;
  - each earlier `LOOKED_ABSENT` or `LOOKED_INDETERMINATE` row since the latest earlier `PRESENT` at (level, `subject_kind`, `subject`) is passed, oldest first, as `{earlier, observation}`;
  - a throw rolls back the row and the listener's own writes, and the throw reaches the writer; a return value is ignored;
  - with no listener registered, or for any other state, the append is unchanged.
- **D54** (K2408, K2442): `fence.test.mjs`:95 re-stated. The founder's viewer names a person, so a `lead`, `objective` or unknown-kind row is withheld from it, and a credential with no person behind it still sees every row. No product code changed for D54: R13 already gates through membership's `inSight`, which carries D54.
- **Flaws fixed in this module**:
  - C-22.9's translation listed 5 of the 9 authority kinds; it now names all 10.
  - `schema.mjs`'s `subject_kind` comment lacked `reference`.

**Tests.**
- `vocabulary.test.mjs` R1 pins the ten kinds.
- `fence.test.mjs` adds:
  - the `step` arm (no resolver; the resolver's yes and no; a hidden referent; a second registration; and the negative control that the step resolver answers only `step` rows);
  - three D54 tests: the founder (both spellings) and an administrator neither invited nor joined see no row naming a hidden project, at every bundle-named kind and through every resolver. Negative controls: an invited administrator, the founder once invited, a joined participant, a machine, and a discoverable project at FULL for the founder and every administrator.
- New `answered.test.mjs`:
  - R1/R2: `step` is appended, and near-miss kinds are refused C-22.9 (negative control);
  - R37's calls, with the earlier rows unchanged;
  - negative controls: no earlier absence, `partial`, another level, subject or subject kind, a refused `PRESENT`, and no subject;
  - an absence already answered is not told again;
  - the transaction: a throw rolls back the row and the listener's write, and the caller's rollback takes both;
  - registration refusals and `MODULE_ORDER`.
- Mutation checks:
  - with the listener call removed, `answered.test.mjs` fails 5;
  - with `step` dropped from the resolved kinds, `fence.test.mjs` fails 3.

**Ran.**
- `node --test bio-plane/test/m/observation-log/*.test.mjs`: tests 77, pass 77, fail 0. Before the change: 67 tests, 1 red (`fence.test.mjs`:95, D54). The manifest names no layer tests.
- Users' suites: the 21 modules whose `uses` name observation-log. Their tests ran with this change and again on `origin/tranche/T41` alone:
  - 67 failing test titles each time, an identical set: affordances 33, ai-runs 11, plane 8, case-authoring 5, answers 3, inquiry 3, answer-envelope 2, retrieval 1, skills 1;
  - every one is red on the tranche alone (the plan's rule 4 inherited reds); none is mine.
- Checks:
  - `format`: 0 failures;
  - `architecture observation-log`: 0 failures;
  - `coverage observation-log`: 37 of 37;
  - `ownership observation-log tranche/T41`: 0 failures.
- `fleetbundles`: the **agent-worker bundle is stale**. `checks.mjs` and `vocabulary.mjs` are its inputs through `run-rules` (manifest §14), and both changed. The plane bundle is stale as at every merge (rule 4 (14)), and `program.mjs` holds C-22.9's old translation. All are BOB's to regenerate at L5's close; this job wrote none of them. `newgroup-bundle-fresh`: pass.

**Deferred.** None.

**Found in other modules.**
- The agent-worker bundle, which this change staled (above).
- `run-rules` imports `OBSERVATION_AUTHORITY_KINDS` (`rules.mjs`:123): `step` now reaches it. Its suite shows no new red.

Size (session_01P7RDCwo1zaafZ1wjYhW3J1): test runs 16, module lines 3,286
