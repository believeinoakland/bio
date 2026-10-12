# instance-setup (T46)

**Status** · session_01EPvxKT2MKmJtAzSrEjcCNN · depth 2 · COMPLETE · handled B2

## Completion (INSTANCE-SETUP #21)

**Entries applied (T46-50).**
- **R79** `infoLevelSet({level, asked?, by})` and `infoLevel({viewer})`, ops `infolevelset` (`by` from the query) and `infolevel` (`viewer` from the query), R29. Levels `INFO_LEVELS` `prompt`/`pause`, default `INFO_LEVEL_DEFAULT` `prompt`. New append-only table `member_info_levels` (exempt from purge, R64's class: admin-only export, version chain); each set appended with when; `asked: true` sets `asked_at` only when none is recorded and every later row carries it forward. Refusals, each writing nothing: C-64.28 `MACHINE_CANNOT_SET_INFO_LEVEL` (empty `by` or `record-grammar.isMachineIdentity`), C-64.29 `INFO_LEVEL_UNKNOWN` (a level other than the two, or an `asked` other than absent, `true`, `false`), as K2996 folded (J1, B2); words mine, awaiting T47's stamp and the design stream.
- **R80** `op=bootstrap` answers `test_instance` from `ai-runs`' own `testInstance` (`AiRuns.prototype.testInstance` called over the Worker's env, since bootstrap is answered at the Worker and the method reads only `this.env`; a throw is `false`; exported `testInstanceOf(env)`). Set after the store's answer is spread, so nothing the store answers sets it. **New edge `instance-setup` → `ai-runs`** (already in `modules.json`).
- **R81** `op=bootstrap` answers `parts` `[{part: "signin"|"scanner"|"safe_view", present}]`, always (not only with `members=1`, since `setup-page` R30, R33 read it before sign-in), from R17's `agent-runner` answer and `file-scanner`'s (`SERVING` true, `UNBOUND` false, else null). With `members=1` the members' answers are reused (each member asked once). Exported `PARTS`, `partsReport`.
- **R17** `memberVersions`' `agent-runner` is read from agent-worker's `/version` `runner` (`{binding: "AGENT_WORKER", via: "agent-worker", state, version?}`): `SERVING` with agent-worker's version on `true`, `UNBOUND` on `false`, agent-worker's own state otherwise. An agent-worker that served but said nothing of `runner` (a build before its R30) answers `SILENT` with why, never `SERVING` (my reading of the requirement's gap; signin `null`). `FLEET_BINDINGS` (the installer's leaf) unchanged.
- **R54** `disclosureOf` already answers only from `disclosureShown`'s rows, never from an account's state, so it answers `shown: false` before a sign-in as before a reference: behaviour unchanged, comments and a test added.

**Read.** My requirements and `setup.mjs`, `setup-fleet.mjs`, `livefire.mjs` whole, by me; the plan entry and the sources' sections (interface §2.2, §5, §6; trial §1.2, §2.2, §3.2). The rest of the reading set was read in full by two helpers in this session, each writing me a cited digest (K2032, mechanics §17 (3)): (1) every file of my tests (21 files), with a run; (2) the Public parts of the 23 used modules, and the requirements of the later L11 users of my services (setup-page whole, interface-shell whole, screens-settings whole, op-declarations R50, control-plane R65/R76) and agent-worker R30/R34, file-safety's scanner parts, with the code of `testInstance`, agent-worker's `handleVersion` and file-scanner's `/version`.

**Flaws in my own module, fixed (P8).** `memberVersions`' comment said the anonymous answer fans out to no member (now true only of the full map; R81 asks two). In my tests: `draft.test.mjs` asserted `before <= mark` (cannot fail), now a check that the first refusals write nothing; two titles (`assistant.test.mjs`, `group.test.mjs`) claimed every table exempt though the four seed ledgers are cleared, now true. Left as they stand (not flaws I can fix inside the job without a ruling): the DEC-49 region tests read `setup.mjs`' source for region markers (`translations.test.mjs`), the convention's own check; a few tests read recorded SQL text.

**Deferred:** none.

**Found in other modules (also in my REPORT J2).**
1. plane `door.test.mjs` "R1, R5 … instance-setup's thirty-four routes" pins 34 routes and drives each; with `infolevelset` and `infolevel` there are 36, so it is red from my merge until plane (T46-62) re-pins it and adds the two drives. It is the only difference between the users' suites on my branch and on `tranche/T46`.
2. Requirement text, BOB's: R17 still cites `membership` R72 for `bootstrapState`, which is now `credentials` R2; R54's first paragraph says `credentials` reads `disclosureOf` — neither its requirements nor its code do, only `control-plane` R65 (a sign-in's `start`), so nothing on the server orders the disclosure before an API-key reference is set; R81 says the `connect` screen reads `parts`, which `screens-settings`' requirements do not list.
3. `file-scanner`'s `/version` names no separate renderer, so `safe_view` always equals `scanner` (R81 as worded).
No generated artifact staled beyond the plane bundle every merge stales (rule 5 (4)).

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/`: tests 157, pass 157, fail 0 (new `t46.test.mjs`: 10, naming R17, R28, R54, R79, R80, R81, each refusal with a control; five older tests re-pinned: the bootstrap body and agent-runner entry in `reports.test.mjs` and `worker-reports.test.mjs`, the ops map in `exports.test.mjs`, the C-64 rows in `group.test.mjs` and `translations.test.mjs`).
- Users, mine vs `tranche/T46` @ a922a00d96 (failing titles compared): op-declarations 133/7 vs 133/7; answer-envelope 31/1 vs 31/1; store-door 45/0 vs 45/0; control-plane 221/2 vs 221/2; plane 209/2 vs 210/1 (item 1); system (`migrate-released`, `newgroup-bundle-fresh`) 2/0 vs 2/0; newgroup 51/0; stewards 23/0.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … instance-setup`: 24 product files, 100 relative imports; 0 failures. `checks/coverage.mjs … instance-setup`: 63 of 63; 0 failures. `checks/ownership.mjs … instance-setup tranche/T46`: 8 files; 0 failures. `checks/run.mjs`: architecture 0 failures over the product; coverage's 15 failures all other modules' ids marked not yet met (rule 5 (1)); channels 0.

Size (session_01EPvxKT2MKmJtAzSrEjcCNN): test runs 7, module lines 3592

## J1 · QUESTION

R79 says its two refusals take "a new row of C-64 (codes and words BOB's at the job's START, numbered then)", but B1 names neither. My best reading, which I build on unless you answer otherwise:
- `MACHINE_CANNOT_SET_INFO_LEVEL`, C-64.28 (R64's `MACHINE_CANNOT_SET_LANGUAGE` pattern; refused for an empty `by` or a machine identity, `record-grammar.isMachineIdentity`): "How quickly explanations open on your screens is your own choice, made from your own signed-in session, never by another member or a machine. Nothing was changed."
- `INFO_LEVEL_UNKNOWN`, C-64.29 (a `level` other than `prompt` or `pause`, or an `asked` other than absent/`true`/`false`): "Explanations open either promptly or on a longer pause, and what was sent is neither. Nothing is ever hidden at either. Nothing was changed."
Both in `INSTANCE_SETUP_CHECKS`, awaiting T47's stamp; words.json holds no `refusal.` key for either (checked on main), so the words are mine for your channel act. Also my reading of the asked-question shape: `asked: true` sets `asked_at` only when none is recorded yet (the first answer's instant is kept).

## J2 · REPORT

Found outside my module (details in my record's Completion):
1. plane `door.test.mjs` "R1, R5 … instance-setup's thirty-four routes" pins 34 routes and drives each; with `infolevelset` and `infolevel` there are 36, so it is red from my merge until plane (T46-62) re-pins it and drives the two. It is the only difference between the users' suites on my branch and on tranche/T46 (plane 209/2 vs 210/1; op-declarations, answer-envelope, store-door, control-plane, system, newgroup, stewards identical).
2. Requirement text, yours: R17 still cites membership R72 for `bootstrapState` (now credentials R2); R54's first paragraph says credentials reads `disclosureOf`, but neither its requirements nor its code do — only control-plane R65 at a sign-in's `start` — so nothing server-side orders the disclosure before an API-key reference is set (only the screen's order); R81 says the `connect` screen reads `parts`, which screens-settings' requirements do not list.
3. file-scanner's `/version` names no separate renderer, so `safe_view` always equals `scanner` under R81 as worded.
4. Also my reading of a gap in R17: an agent-worker that serves but answers no `runner` (a build before its R30) reports agent-runner `SILENT` with why, never `SERVING` (parts' signin null).

## J3 · COMPLETE

T46-50 applied: R79 infolevelset/infolevel (C-64.28, C-64.29 per K2996; table member_info_levels), R80 test_instance (via ai-runs' own testInstance; edge instance-setup → ai-runs, already in modules.json), R81 parts (always answered), R17 agent-runner through agent-worker's runner, R54 tested (behaviour already met). New exports: INFO_LEVELS, INFO_LEVEL_DEFAULT, testInstanceOf, partsReport, PARTS. No file outside my paths. Module tests 157/157; format, architecture, coverage (63/63), ownership 0 failures; run.mjs architecture 0. One red outside the module, plane door.test's route count, for T46-62 (REPORT J2). Record: Completion section.
