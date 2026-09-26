# agent-worker — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `062e69f6`): `agent-worker/src/index.mjs` 1,255 lines (512 without comments and blanks), `harness.mjs` 844 (299), `subsession.mjs` 587 (251), `cascade.mjs` 94 (38); `wrangler.jsonc` 87, `fleet-member.json` 14, `scripts/build.mjs` 44; the generated `dist/agent-worker.bundled.mjs` (1,390) and its manifest (build/manifest.md, generated artifacts). It already sits at its paths: nothing of it is in `store.mjs`, `schema.mjs`, `index.mjs` or `bio-checks.mjs` (the plane's dispatch to it, `#aiRunWake`, is `ai-runs`'; its binding list is `control-plane`'s), so it has no extraction map. Not yet met: R40, R41 (model turns and sub-sessions do not run; D-218, D-611), R47 (unmeasured). Measured 2026-09-26: its six suites pass (agent-worker 139, harness 258, fanout 184, cascade 29, versions 22, wire-vocabulary 83; 0 fail).

**Size (P6).** 2,780 lines of source (1,100 without comments and blanks), plus 145 of configuration and build. Its tests and controls are 7,452 lines. Under the 4,000 at which BOB reports a module; a job reads the four source files whole with the public parts of its uses.

## Public

### Purpose

The fleet member that performs an AI run for the plane. It is called by the plane over a service binding with a run to continue and the run's `ai` credential, and it calls the plane back under that credential. It walks a deterministic control-flow table (the pass count, the four-level fan-out, dedup before any write, the log after every step, adjust-never-retry, the bounds): the model decides what to search for and what reports mean, inside a step, and never when the loop stops. It writes nothing itself: every change is made by the plane at an op the credential's member-authored scope admits, and every write is a suggestion, a log entry, a capture request or the run's close. It resolves which Claude account pays (member, then project, then instance) and states the answer without a secret. It never attests, concludes, accepts or publishes.

### Provides

Terms. A **refusal** is `{ok:false, reason, code, detail, worker:"agent-worker", …extra}` with `reason` equal to `code`. The **plane** is `env.PLANE`. A plane answer is **silent** when the binding throws or its body is not JSON, **refused** when the status is not 200, the envelope's `ok` is not `true`, or the innermost `result` that states an `ok` says `false`; otherwise it is the result. A plane refusal is passed on with its code, its C-number and the plane's body unchanged; this member rewords none.

**`POST /run`** (path `run` or the empty path) — body `{run_id, store, credential, claude_accounts?, turns?, judgements?, max_steps?}`. Checked in this order, and no plane call is made before R1–R8 pass:
- **R1** When `env.PLANE.fetch` is not a function: 503 `PLANE_NOT_CONFIGURED`, before the body is read.
- **R2** A body that is not JSON: 400 `BAD_BODY`.
- **R3** `run_id` not a non-empty string of at most 200 characters: 400 `BAD_RUN_ID`. This member mints no run id.
- **R4** `store` not a string: 400 `BAD_STORE` (no namespace is assumed). A string not exactly `bio` or `scratch` (case-sensitive; `""` included): 400 `NAMESPACE_UNKNOWN` with `asked` (at most 80 characters) and `namespaces` (the two, in order). The set equals the plane's.
- **R5** `credential` absent or empty: 401 `NO_CREDENTIAL`. Not `aik-` followed by 64 lowercase hex: 400 `BAD_CREDENTIAL_SHAPE`. This is a shape test only; liveness and scope are the plane's.
- **R6** `claude_accounts` present and not a plain object: 400 `BAD_CLAUDE_ACCOUNTS`. Present and no level resolves (R36): 409 `NO_ACCOUNT_RESOLVED` with `capability:"unavailable"` and every level's state.
- **R7** The segment bound is `env.MAX_TURNS_PER_SEGMENT` when a positive number, else 120. `turns` absent means the bound; not a finite number ≥ 1: 400 `BAD_TURNS`; above the bound: 400 `SEGMENT_OVER_BOUND` with `turns_requested`, `turns_bound`, `bound_source`. Refused, never clamped.
- **R8** `op=whoami` under the credential: silent gives 502 `PLANE_SILENT` with `detail_from_binding`; refused gives 403 `PLANE_REFUSED` with `run_id`, `store`, `plane_status` and the plane's body.

The run's facts come from the record, never the body:
- **R9** `op=airun` for the run: silent 502 `PLANE_SILENT`; refused 403 `PLANE_REFUSED`; no session 404 `NO_SUCH_RUN`. Mode, budget, pass limit and context are read from it; a `mode` in the body has no effect.
- **R10** When accounts resolved (R6) and the run's recorded payer (`session.principal.claude`) is not the resolved level: 409 `RUN_NAMES_A_DIFFERENT_PAYER` with `recorded`, `resolved` and `levels`, before any step.
- **R11** `op=airunlog` for the run: silent 502, refused 403. `resumed_from` is the number of entries it holds, and a resumed run continues rather than restarting.
- **R12** The target is the run's context: an inquiry context's id; for a project context, the one question in its published `context.questions`; otherwise `null`, with a `basis` stating why (UNDETERMINED: none, several, not published, or an unread context kind). Never a project id.

The control-flow table (`CONTROL_FLOW`, `nextStep`, pure):
- **R13** Rows `gate-mode`, `resume`, `plan`, `fanout`, `collect`, `compose`, `dedup`, `submit`, `adjust`, `next-pass`, `close`; each declares the steps it may go to, and `nextStep` never returns a step outside them. There is no edge from `compose` to `submit` and none from `submit` back to itself on a refusal. An unknown step closes with `completed` and says so.
- **R14** `gate-mode` is first. A mode that is not deployed closes the run with bound `mode-not-deployed` at its first step, after only the run and log reads (R9, R11) and before any fan-out, request or suggestion; its log entry and close are still written; its `why` distinguishes a mode the table holds and has not deployed from a word it does not hold, and names the deployed modes. `check` is deployed; `investigate` and `extract` are not.
- **R15** Above every row after the gate, `stopBecause` asks `fetches`, `subsessions`, `wallclock` in that order and closes on the first whose consumed ≥ its positive allowance; an absent or non-positive allowance never stops a run. Then pass count ≥ the pass limit closes `completed`. The pass limit is the run's `max_passes` when positive, else 3; a pass counts when it is done (`next-pass`).
- **R16** Judgements are taken in order, one per judged row (`plan`, `collect`, `compose`, `dedup`, `adjust`); a row with none carries the state on. A judgement naming `pass`, `maxPasses`, `step`, `budget`, `mode`, `bound`, `run`, `store` or `target`: 400 `JUDGEMENT_OVERREACH` with `step` and `fields`. Only `targets`, `reports`, `candidates`, `queue`, `adjusted`, `submission`, `level`, `observed`, `governed`, `condition` are applied.

What each row does against the plane:
- **R17** `fanout`: one `op=airunspawn` (`half=search`) per level, in the order `meaning`, `content`, `document`, `internet`. A payload carrying a `bias` field: 502 `SPAWN_PAYLOAD_CARRIES_LENS` with `level`; none: 502 `SPAWN_PAYLOAD_MISSING`; refused: 403 `PLANE_REFUSED`. Each sub-session's contract is built key by key (`level, run, context, mode, skill, standard_pair, standard, scope, returns`), frozen, shares no object with another, has `scope` `["meaningrows"]`, and is published. Spends 4 `subsessions`.
- **R18** `fanout`, the internet level: one `op=capturerequest` `{run, target, address}` per judged target at level `internet` (its own target, else the run's); each refusal is published; spends one `fetches` per request. This member never fetches.
- **R19** `collect`: every returned report is held to the report contract (R20); a refused one is published in `reports_refused` with its level and code and never becomes an absence. Each distinct cited address (at most 20) is re-read by address through `op=meaningrows` (`rows=leg`, `ids=[address]`); `citations_reread` counts reads that answered.
- **R20** A report has only the keys `level, state, observed_at, summary, citations, governed, condition`; `level` and `state` are required; `level` is one of the four; `state` one of `NEVER_LOOKED`, `LOOKED_ABSENT`, `LOOKED_INDETERMINATE`, `PRESENT`, `partial`; every state but `NEVER_LOOKED` needs `observed_at`; `PRESENT` and `partial` need a citation; at most 20 citations, each exactly `{address}`, non-empty, at most 200 characters; `summary` a string of at most 500; the whole at most `REPORT_MAX_BYTES`. Each breach is refused by its own code (`REPORT_UNKNOWN_FIELD`, `REPORT_INCOMPLETE`, `REPORT_LEVEL_UNKNOWN`, `REPORT_STATE_UNKNOWN`, `REPORT_UNLOCATED`, `REPORT_NO_CITATION`, `REPORT_OVER_BOUND`, …).
- **R21** `collect`, holdings: each cited address is looked up as a held bundle (`op=search`, `id:"…"`) and its source address, or taken as an address, and read through `op=versionchain`. `holdings` counts each document once by the record's `address_norm`, never by title or text; an item with no chain counts as itself; a refused read leaves that citation's document UNDETERMINED and published.
- **R22** `compose`: one `op=meaningrows` read (`rows=leg`); its note says the meaning layer was NOT READ when refused and UNDETERMINED when no rows list came back, never zero. One `level-empty` candidate per level a report found `LOOKED_ABSENT`, made by the table: `level` in the suggestion spelling (`document` → `documents`), `name` `level-empty-<level>`, `observed_at`, the run's target, and a description composed from those facts, with the report's summary appended when it has one.
- **R23** `dedup`, before any write: reads `op=basisversions` for the target and drops candidates aimed there whose name is held; candidates aimed at another question go on uncompared, counted in the note. A refused read sends every candidate on and the note says they were compared against nothing.
- **R24** `submit`: one candidate at a time, as formed, through `op=suggest` with the run and its target; a refusal goes to `adjust`. A verbatim resubmit the plane reports (`repeated: true`) is counted in `verbatim_resubmits`.
- **R25** `adjust`: the candidate is resent only when its canonical bytes differ from the refused submission; otherwise it is dropped and never resent, and the rest of the queue is still written.
- **R26** After every step, one `op=airuntick` carries one log entry `{level, subject:"<step> -> <next>", state, governed, condition, terminal, bound, detail}` (`detail` at most 500 characters; `state` `NEVER_LOOKED` unless judged) and the spend, with `runtime` = the plane calls of that step + 1. A step judged `PRESENT` is logged `LOOKED_INDETERMINATE` with the stated reason and counted in `present_unbacked`. `logged` counts entries the plane appended; each entry it refused is in `log_refused` and `refusals`. When the tick reports the run ended, the segment stops and `ended.by` is `"the plane's own exit"`.
- **R27** `close`: `op=airunclose` names the bound; `ended` is `{bound, by:"the table"}` only when the plane accepted, and `null` with the refusal published when it did not. `max_steps` (at most 400) bounds one invocation and is never reported as a run's bound.

The answer:
- **R28** 200 `{ok:true, run_id, store, stage:"harness", turns_run, judgement_source, judgement_note, claude_account, mode, trace, passes, ended, logged, log_refused, present_unbacked, submitted, refusals, adjusted, verbatim_resubmits, resumed_from, target:{id, basis}, fanout:{of_pass, levels, scope, contracts}, reports_taken, reports_refused, citations_reread, holdings, budget, segment, plane_says:{token_class, store, session}, principal, principal_source, plane:{version, op}, worker:{name, version}}`. `budget` lists the three spendable bounds as the record holds them after the segment.
- **R29** `claude_account` is `{available:true, level, ref, levels}` when accounts resolved and `{available:false, reason:"NO_ACCOUNT_MATERIAL_SUPPLIED", detail}` when none were supplied. `principal` is `null` with `principal_source` stating that no op an `ai` credential may call publishes its principal.

**`GET /version`**
- **R30** Answers 200 `{ok:true, name:"agent-worker", version: env.VERSION || "0.0.0"}`.

**Anything else**
- **R31** Any other path or method answers 404 `UNKNOWN`.

**The cascade** (`cascade.mjs`, pure).
- **R32** `resolveClaudeCascade(accounts)` judges `member`, `project`, `instance` in that order; each level is `unset` (no non-empty string `token`), `revoked_by_publication` (its SHA-256 is in `tokens.mjs`'s published hashes) or `available`; no shape check. The first `available` level resolves, with its `ref` or `null`; none gives `{available:false, reason:"NO_ACCOUNT_RESOLVED", levels, detail}`. The status never carries a token.
- **R33** `cascadeToken(accounts)` returns `{level, token}` for exactly the level R32 resolves, else `null`.

**`SURFACE`** and **`fleet-member.json`**
- **R34** `SURFACE` is `{run: POST, version: GET}`, both `mutating: false`; the manifest names the entry, the surface, the test directory and the bundle recipe.

## Private

### Uses

- `runtime-limits`: `PUBLISHED_TOKEN_HASHES`, `sha256hex` (`tokens.mjs`, a bundle input).
- `bundler`: `discoverMembers`, `writeMember` (the build).
- `skills`: `reportsAs` and `DEPLOYMENT_SEQUENCE` (tests only, R44).
- `ai-runs`, `query-language`, `legacy-checks`: tests only; the suites read `OBSERVATION_LEVELS`, `OBSERVATION_STATES`, `RUN_ENDINGS`, the plane's namespaces and `OPS` table, and `SUGGEST_LEVELS` from the plane's source to pin this member's copies (R44). At runtime it uses them only over the wire.

### Invariants

- **R35** Its only binding is the service binding `PLANE`; it has no Durable Object, R2 or secret binding, no plane URL, and reaches the plane by no other route.
- **R36** It holds no credential: the `ai` credential and `claude_accounts` arrive per call, are never stored, logged or echoed, and no response carries a token.
- **R37** It judges no scope: it has no op allow-list, scope or class. `PLANE_OPS` is exactly `whoami`, `airun`, `airunlog`, `airunspawn`, `meaningrows`, `basisversions`, `search`, `versionchain` (reads) and `airuntick`, `suggest`, `capturerequest`, `airunclose` (writes the plane makes); it calls no other op, and none of them returns document bytes.
- **R38** It never writes `runtime-ceiling-reached` or any ending itself; it spends, and the plane writes the condition at its own exit.
- **R39** No model judgement sets the mode, the step, the pass count or limit, the budget, a bound, the run, the namespace or the target (R16).
- **R40** A run's model turns run under the Claude account the cascade resolved and the skill pack the run names, within the segment bound. *(not yet met: `turns_run: 0`, judgements supplied by the caller; D-218, D-611 size the segment in bytes)*
- **R41** Sub-sessions run, one per level, each under its spawn contract (R17) and returning only reports (R20). *(not yet met: contracts are composed and published; reports are supplied by the caller)*
- **R42** Enabling a mode is an edit to `MODES` under review, never a request parameter.
- **R43** A refusal reaching the member is never reworded (R8, R9, R11, R17, R23, R24, R26, R27).
- **R44** Its copies equal their sources, both ways: `LEVELS` is the key order of `OBSERVATION_LEVELS`; `REPORT_STATES`' keys are `OBSERVATION_STATES`'; `REPORTING_LEVEL` is total over `LEVELS` and agrees with `skills.reportsAs`; `NAMESPACES` is the plane's; `MODES`' keys are `skills`' `DEPLOYMENT_SEQUENCE.order` and only its first member is deployed; the `mode-not-deployed` ending is one of the plane's `RUN_ENDINGS`.
- **R45** The committed bundle is byte-identical to a fresh build of `src/index.mjs`, and its manifest names every input, `bio-plane/src/tokens.mjs` included (the check is `bundler`'s).
- **R46** No place is named in its behaviour or outward text; its `account_id` is the project's one Cloudflare account.
- **R47** It is reachable only through the plane's service binding. *(not yet met: unmeasured; `wrangler.jsonc` does not set `workers_dev: false`, and every answer carries `access-control-allow-origin: *`)*

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §2 (CHECK first), §3 (reads broad, writes narrow; D-220, versions as versions), §4 (the fence; request, never capture), §9 (the `level-empty` kind), §11 (the log; D-129; D-104), §14 (the search half never receives the lens), §14a (a separate process through the same interface; the cascade and UNAVAILABLE stated; D-218), §14b.1 (reports, never documents; query, never load), §14b.3 (resumable), §14b.4 (scripted and judged), §14b.5 (the checks are the plane's), §14b.6 (bounded, the bound recorded), §14b.7 (versions as formed; resume).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 4, 5 and 10, §6 (the cascade, the fleet member, D-260), §7.3 (the extract mode, not deployed), §7.4.
- `docs/architecture/BIO_Distribution_v0_1.md` §5 (the fleet member).
- DEC-24, DEC-47, DEC-49, DEC-55, DEC-60, DEC-62; D-112, D-199.

### Suggestions

- `SEGMENT_OVER_BOUND`'s detail says the bound is where the isolate's MEMORY ceiling sits; D-312 (M-168) measured that CPU binds, not memory. Correct the sentence (BOB's).
- The plane publishes no `max_passes` on a run (grepped: no such column), so R15's limit is always 3. Either the run declares it or R15 says 3 is the table's (BOB's).
- `build/manifest.md` says this bundle's inputs come from `agent-worker` only; its manifest lists `bio-plane/src/tokens.mjs` too.
- Tests that name this module's behaviour outside `agent-worker/test/`: `bio-plane/test/d260-resume.test.mjs` and `fence-e2e.test.mjs` drive it with the plane; `fleetbundles.test.mjs`, `d116-serving-builds.test.mjs`, `memoryshare.test.mjs`, `m025-arm-anchor-witness.test.mjs`, `refusal-wire.test.mjs`, `resolveversion.test.mjs`, `owed-controls.test.mjs`, `airun.test.mjs` read its files; `skillsequencing.test.mjs` pins `MODES` (proposed to move here, `skills` Suggestions). The negative controls are `agent-worker/test/*.control.mjs`.

## Open for Bob

1. **Must a run's model be instructed by the pack the run names?** A run records a skill version when it opens, and nothing checks that the instructions a model is given are that version; model turns do not run yet (R40). *Recommendation:* yes: when turns land, this member renders the pack and refuses a segment whose run names another version, as it already refuses a run whose recorded payer differs (R10). It changes nothing until then.
2. **Should the record itself refuse a run in a mode that is not deployed?** Today the mode gate is one row in this member (R14); the plane stores any mode string, so a caller that never runs this member can open an `investigate` run. The canon says every "may not" must be a refusal in the plane (`INVESTIGATIVE-SESSION.md` §14b.4). *Recommendation:* yes: `ai-runs` refuses opening a run in a mode not deployed, by a catalogue code, reading the one deployment order; this member's gate stays as the first row.
