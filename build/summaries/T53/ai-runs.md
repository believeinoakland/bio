# Task summary · T53 · ai-runs

This summary stands for the ai-runs job's reading set (SESSIONS §6.3): `build/requirements/ai-runs.md` whole; the used modules' Purposes and named service blocks; observation-log R29, R40, R41 and run-rules R19 (cited); `build/plan/current.md` (Layer 6, ai-runs) and `build/plan/T53-R1/ai-runs.md` (no trims). The sources stay binding; read any cited section in full when the work touches it. Compressed (T = test, C = control); requirements outside the entries reduced to their gist.

## ai-runs (own requirements)

Status: in force (K102); T53 as marked. Size (P6) under 4,000.

Purpose: the AI run: a durable, bounded, attributed object a member opens over a question or project; records the conditions it was formed under, holds the budget, logs the search, ends through one exit, is reaped when it dies; accepts, attests, concludes, captures nothing.

Terms. **Run** fields include `principal_plane`, `principal_ai`, `principal_ai_ref`, `skill_version`, `bias_manifest`, `standard_pair`, `lens_at_open`, `rerun_of`, `state`, `plan`. Context `inquiry` or `project`. `principal_plane` `member:<id>/<tokenId>` or `class:<cls>`; `principal_ai` the paying level. Bounds `fetches`, `subsessions`, `wallclock`, `runtime`, `mints`, `surfaces`, `proposals`, `lease`; endings `completed`, `cancelled`, `mode-not-deployed`. Lease 3,600,000 ms, extended per tick. Invisible runs answer as absent. Refusals carry `code`, `check`, `translation`.

- R1, R2, R3, R4, R5, R6, R7, R8, R44 · retired: moved to `run-rules` (K617). R48, R49, R50, R51 · retired: moved to `ai-use` R1–R4 (T40). R79 · retired (T53, K5457): the dispatch carries no secret. R80 · retired (T49, K3347).

open (`op=airunopen`)
- R9 *(not yet met: T53)* · Refusals in order, nothing written: `AI_RUN_NO_CONTEXT` (C-33.30); membership's existence refusal (C-70.1); `run-rules` R7, R6; `AI_RUN_CAPABILITY_UNAVAILABLE` (C-33.29); R8; R3 over `bounds`; R45; `AI_RUN_ALREADY_OPEN` (C-33.31); `AI_RUN_RERUN_SELF`, `_UNKNOWN`, `_OTHER_CONTEXT` (C-33.45–47). (T53; K3472, BR29) Paying principal `principal_ai`, its member `principal_ai_ref` (columns; args `principalAi`, `principalAiRef`; answers `principal: {plane, ai, ref, skill}`); "Claude account" leaves requirement and outward text; R12's log actor is the AI principal; R10 answers `untested` (R78). Migration a rename. T: nothing names `claude`, every row kept; C: stale `principalClaude` refused.
- R10 *(not yet met: T53)* · One transaction: run (`running`, ticks 1, expires open + lease or `leaseMs`), bound rows, manifest and bar verbatim, the lens in force at open. → `{run, started, status, ticks, created, expires, rerun_of?, projectGate: {applied, ground, why, projects}}` (`projects` the viewer sees).
- R40 *(not yet met: T53)* · Refuses a mode not in `DEPLOYED_MODES` (`run-rules` R9, R14; R78's gate) by C-109.1 `AI_RUN_MODE_NOT_DEPLOYED`, after `run-rules` R8, before any write. (T53; AIR5, AD14) And a mode no entry of the opener's account has passed: `PART_NOT_PASSED` (a `run-rules` row, C-number BOB's), naming `part`. T: all entries `not_suitable` for `check` → refused, nothing written; C: `passes_with_limits` opens.
- R46 · `plan` mode takes `plan`; `AI_RUN_PLAN_REQUIRED`, `_UNEXPECTED`, `_NEEDS_PROJECT`, `_NEEDS_MEMBER`, `_NO_SEARCH`; nothing starts one by itself but R77.
- R47 · `registerOpenCheck(module, mode, fn)`, applied last; `LISTENER_MALFORMED`, `LISTENER_DECLARED`; `plan` with none `AI_RUN_MODE_UNCHECKED`.

tick (`op=airuntick`), close (`op=airunclose`), the one exit
- R11 · Order: absent `{found: false}`; `run-rules` R5, R6; not running `{ticked: false, status, bound}`; R3 over `consume`; R45.
- R12 *(not yet met: T53)* · The tick's transaction (append via observation-log's writer as the AI principal; figures; lease; `state`; ticks +1; exhausted bound → R14 `runtime-ceiling-reached`, `ended`). Restated with `read`/`disagree` in R99.
- R45 · `state` over `AI_RUN_STATE_MAX_BYTES` (262,144) → `AI_RUN_STATE_TOO_LARGE` (C-22.18), nothing written.
- R13 · Close ends through R14; `bias` told (R30), answer carried as `bias_debt`.
- R14 · The only exit: bound per `run-rules` R2, condition per C-22.4; terminal entry with rolled-up search state; status; then `credentials.aiRunCredentialsEnd({run})`.

reap, wake, dispatch
- R15 · `reap` ends lapsed leases (bound `lease`).
- R16 · The wait source extends leases, wakes completions (≤ 25 per tick).
- R17 · No wait source: `wakeDue` 0.
- R41 · `registerWaitSource(module, source)`; `WAIT_SOURCE_DECLARED`, `WAIT_SOURCE_MALFORMED`.
- R18 *(not yet met: T53)* · A woken run is dispatched only when `principal_plane` equals the instance organisation `ai` credential's `<principal>/<tokenId>`, on record, unrevoked; else withheld and named (`MEMBER_PRINCIPAL_RUN`, `NOT_THE_INSTANCE_CREDENTIALS_RUN`, `AI_PATH_NOT_READY` (R97), `AGENT_WORKER_UNBOUND`, `NAMESPACE_UNDETERMINED`, `NO_INSTANCE_AI_CREDENTIAL`, `NO_ACCOUNT`, `INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD`, `…_REVOKED`, `…_NOT_ORGANISATION`, `CREDENTIAL_RECORD_SILENT`); refused or incomplete → "still resumable" entry; no answer by the bound → `RUNNING`. A member's run is dispatched at her act by `dispatchMemberRun({run, by, at})` under a segment credential (`credentials` R63), for any account `ai-accounts.accountFor` answers for her act: her own, a personal subscription (hers only), the project's or the team's. `by` must be the run's member (`AI_RUN_NOT_PRINCIPAL`); the wake still withholds `MEMBER_PRINCIPAL_RUN`; mode not deployed or not passed for the account (R40) → `MEMBER_RUN_MODE_NOT_ADMITTED`. `DISPATCH_WAIT_MS`, R82 stand. K2892's "check and plan only" → "deployed and passed for the account". T: her `check` run on the team's account reaches the stub once with that `ai_account`, no secret; same on her personal subscription; C: other `by` `AI_RUN_NOT_PRINCIPAL`, no call; her subscription in another's run withheld; wake withholds. (T47 stands: no credential from the request; `credentials.aiRunCredentialMint({member, run, writes})` after all refusals, `writes` = frozen `AI_RUN_MODE_WRITES`; mint refusals unchanged, `dispatched: false`; token never answered, logged or written.)

reads, surfacing, producers
- R19 *(not yet met: T53)* · `op=airun`: absent `{found: false, session: null}`; `session`: `id`, `label`, `mode`, `status`, `ticks`, `created`, `updated`, `expires`, `context` (+ visible `questions`), `principal: {plane, ai, ref, skill}`, `budget`, `condition`, `bias`, `standard`, `state` (or null; never a transcript), `rerun_of` (if visible, else null).
- R20 · Lens block: `in_force`, `manifest`, `now`, `at_open`, `moved`, `moved_basis`, `hand`.
- R21 · Bar `basis` (`recorded`, `none-recorded`, `context-has-no-project`, `names-no-axis`, `unreadable`); `pair` only when recorded.
- R22 · `op=airuns` by context (C-36.1–3); newest first, `limit` [1, 1,000].
- R23 · `op=airunspawn` `spawnPayload`: `search` half with no lens field; `compose` adds R20.
- R24 · `op=airunlog`; restated with the fields in R100.
- R25 · Surfacing names a running run with a `surfaces` bound (C-66.1–4).
- R26 · Writes its row, consumes one.
- R27 · `surfacedIn(bundleId, viewer)`.
- R28 *(not yet met: T53)* · `runFor` → `{run, status, mode, context_type, context_id, principal_plane, principal_ai}` for a visible held run, null for blank, absent or invisible alike; never throws, writes nothing.
- R29 · `boundOf`, `consumeBound` (invalid `n` → `AI_RUN_CONSUME_INVALID` C-22.13); never ends a run.
- R30 · Each run registered with `bias` as a work product; closes told with `rerun_of`.
- R42 · `hiddenRuns(viewer) → {sql, args}`: the one hidden-run predicate, fail closed.
- R43 · `onRunOpened(module, fn)` listeners after each open commits.

Use and the account
- R52 *(not yet met: T53)* · (T53; AIR26, AIR41, BR19; replaces the sentences on which account is carried) A run, ask, draft or standing question carries the account `ai-accounts.accountFor` answers for the member's act (her own, a personal subscription, the project's or the team's), `kind` its use (`run`, `ask`, `draft`, `standing`), `project` the run's project context; none → `NO_ACCOUNT` (`AI_NO_ACCOUNT`, `run-rules` R20) before anything is written. First it asks `ai-use.useCheck` for that account's owner: `open` (R9), `tick` (R11), an ask, draft or standing question refused there (`ai-use` R3); after a hop the next account's own limits apply, never the first's. `tick`'s `usage` counted by `ai-use.countUsage` with that owner, the member and the use. `principal_ai` = paying owner (`member:<id>`, `project:<id>`, `group`), `principal_ai_ref` = the member; R19 answers both. The rest stands (standing question within its author's limits; group-key act is the member's; a draft held back before its first call). T: after a hop the second account's limit refuses, the first's not; C: both under limit proceed.
- R72 *(not yet met: T53)* · `tick` takes `usage`: one entry per conversation that reached a provider since the last tick, `{mode, entry_id, label, usage, calls}` (`agent-worker` R112; `usage` neutral, `agent-steps` R14; `calls` positive integer or `null`). Other shape, or `label` lacking a field → `AI_RUN_CONSUME_INVALID`, nothing counted. A spent-limit refusal is a limit reached (BR23), plain words, never an error. T: two good entries count; C: label lacking a field refused.

exploring, test bar, cost
- R73 · `origin: "explore"` runs open first, then their step (`steps.stepCreate`).
- R74 · `openMany`: one bounded run per step under one act and estimate, each judged alone.
- R75 *(not yet met: T53)* · Gate 1 verdict per (entry, part) is `ai-gate`'s (records, scores, publishes; `testBarRecord` moves there, id kept). `ai-runs` keeps the seam `partAdmitted(part, entry)` (R78) and the team's test set: `groupTestSet({part, matter, answers, by})`, `groupTestResults({part, viewer})`, results per (entry, part) with false-alarm rate; a team set never opens or closes a gate. Transcripts for grading only, never published. T: results per entry; C: a passing team set leaves `partAdmitted` unchanged.
- R76 *(not yet met: T53)* · At close a run answers its actual cost via `ai-use` R11's `actualOf` (ticks counted with `act` the run id; one store, K2482: money where reported, else tokens and calls; no copy kept), only to the paying owners (`principal_ai`): close and `session.cost` ask `actualOf({act: run, viewer})` with the reader's stamp, `final: true` once ended.
- R77 · `plan` re-examination run (`origin: "reexamination"`, `response`) within the recording member's act; `AI_RUN_ORIGIN_UNKNOWN`, `AI_RUN_REEXAM_NEEDS_RESPONSE`, `AI_RUN_REEXAM_OPEN`.
- R78 *(not yet met: T53)* · `testInstance()` true exactly when env `CIVICSMITH_TEST_INSTANCE` equals `INSTANCE_NAME`, both non-empty strings; else false; no op, body, query or table reaches it. (T53; AIR13, AD7) `partAdmitted(part, entry)` answers `run-rules.partAdmittedOn` (its R29) over `ai-gate`'s verdict for that entry and part with `{testInstance: testInstance()}` (replaces `#partDeployable`; tests keep `deps.testSet`). R40 admits a mode only when `partAdmitted(mode, entry).admitted` and its `DEPLOYED_MODES` flag; else C-109.1. R23's `investigateDeployable` reads `partAdmitted("investigate").admitted`. A run opened on the exception records `untested` at open, never later (R32); R10, R19's `session.untested`, R28 answer it (null when the bar admitted). Nothing differs for R75 records on a test instance. T: empty set, pair equal → `check` opens, `untested` recorded and in `runFor`; C: absent, empty or unequal pair → C-109.1, nothing written; body value ignored.

T49–T50 amendments
- R81 · Project gate asks `membership.participation` with the actor's id in any of three forms; unjoined `AI_RUN_NOT_PROJECT_MEMBER`.
- R82 · Dispatch waits only for acceptance, ≤ 10 s: accepted `RUNNING`, else resumable.
- R83 *(not yet met: T53)* · (T53; AIR28) Lease lapses `RUN_LEASE_MS` after the last tick or dispatch (was 10 minutes). A run held for an `ai_stop` (R94–R96) is extended as R16 extends, up to `pause_max` from the stop, then lapses as R15. T: held run survives past `RUN_LEASE_MS`, past `pause_max` reaped `lease`; C: unheld reaped at `RUN_LEASE_MS`.
- R84 *(not yet met: T53)* · (T53; AIR25, AIR28) `segment_end` `{by, done, refusals, error?, ai_stop?}` on `op=airuntick` appended at level `meaning` (subject `segment -> end`; refusal codes, `ai_stop`'s reason and class in `detail`). Own-bound stop, not done, bounds left → redispatched without a member's act under R18; `error` → not (lease ends it, R83); `ai_stop` → not by R84: R93 decides. T: own-bound redispatched; error logged, not; C: `done` not; `ai_stop` not.
- R85 · `search` half carries `subjects` (≤ 50).
- R86 · An inquiry in a project takes its bar.
- R87 · `trace`, `memberRef` only as `x-civicsmith-*` headers.
- R88 *(not yet met: T53)* · (T53; BR22, BR29) Each tick `usage` entry passed to `ai-use.countUsage` unchanged, `entry_id`, `label` beside `usage`; `session.cost` carries `by_entry` (`ai-use`'s entries and efforts with calls). `label.effort` not a lowercase word → `AI_RUN_CONSUME_INVALID`. T: passed unchanged; C: `"Low!"` refused.
- R89 · `open` takes `project` (joined), recorded, passed to the mint.

Segments, hops, a stop at the step boundary (T53; K5457)
- R91 *(not yet met: T53)* · `/run` answers 202 at once. `segment_end` `{by, done, refusals, error?, ai_stop?}`, `by` null on its own bound, `ai_stop` only under `agent-steps` R52 or R53. T: a `limit` outcome → `ai_stop.reason` `limit`, `done` false; C: bound end no `ai_stop`.
- R92 *(not yet met: T53)* · **Every hop recorded per segment.** A dispatch on another account than the last segment's writes in its transaction `hop_in = {run, step, from, to, reason, payer_change}` (`reason` ∈ `limit`, `unavailable`, `lapsed`, `capability`, `auth`, `member_switch`, `ai-accounts` R50; `payer_change` `{from_owner, to_owner}` or null per `hopFor`). Same account: none. Only at segment boundaries (no mid-segment mint); nothing written to `state`. T: `limit` stop on next account → one hop; C: same account none.
- R93 *(not yet met: T53)* · **The hop is `ai-accounts`' decision.** After `ai_stop` `limit`, `unavailable`, `lapsed`, `capability`, `auth`, or a member's switch, ask `ai-accounts.hopFor({member, act, from: {account_id, entry_id}, reason, at_step_boundary: true})` and act unchanged: next account (R92, R94) or refusal. `ai-accounts` alone applies its rules (ordered list, Gate 1, checks, same owner or opt-in, never another member's personal subscription, never a switched-off use). Exhausted → plain words naming who can act (`ai.refused.listexhausted`), run held (R95), never looped, never closed without the refusal logged. T: next account dispatched; `LIST_EXHAUSTED` held, key in log; C: switched-off use refused, no dispatch.
- R94 *(not yet met: T53)* · **The member may decline.** A hop is shown to the member (R91). With `payer_change` it waits for `op=aicontinue` or `op=aistop` (DEC-420), her act only (others `AI_RUN_NOT_PRINCIPAL`); decline ends `cancelled`, partial results kept; without, dispatched at once, cancellable. T: waits; decline `cancelled`; C: same payer no wait.
- R95 *(not yet met: T53)* · **Pause and resume.** `ai_stop` `unavailable` or `limit` with no hop (or refused, R93): held, not failed. Non-interactive (origin `explore`, standing question's AI half, mode `extract`) resumes when `op=aipathready` answers `ready` (`ok`, `half_open`) and, for `limit`, the reset has passed; a member-started run held with three choices (`ai.choice.wait`, `ai.choice.switch`, `ai.choice.without_ai`; ops `aiwait`, `aiswitchaccount`, `aiwithout`), `without_ai` closing with partial results. T: `open` nothing, `ready` once; C: past `pause_max` reaped `lease`.
- R96 *(not yet met: T53)* · **Notice before a new recipient.** `ai_stop` `disclosure` holds until `ai-accounts` records acceptance for that `{provider, host}` (`aisend`; refusal `aisendrefuse`); non-interactive waits, never accepted for anyone. T: withheld `RECIPIENT_NOTICE_DUE` until recorded; C: then one dispatch.
- R97 *(not yet met: T53)* · **Path not ready.** Withheld `AI_PATH_NOT_READY` (R18's family), resumable, when `op=aipathready` for the head account and entry is not ready or the Worker answers it. T: `auth_failed` → resumable, not dispatched; C: `ready` dispatches.
- R98 *(not yet met: T53)* · **Health probe** (scheduler R8): register consumer `ai-health-probe` (key `aihealthprobe`; taken → `CONSUMER_DECLARED`). `due`/`wake`: earliest probe instant of a pair with an open circuit (`reset_at`) or a held non-interactive run, null when none. `tick` probes ≤ `PROBE_BATCH` pairs by `op=aipathready` (no model call, no content); `ready` resumes waiting non-interactive runs via R95; else again after `PROBE_INTERVAL_MS`. → `{probed, resumed, still_down, remaining}`. T: not before `reset_at`; resumes once; batch cap; C: member runs never resumed; nothing held → `wake` null.

The run record (T53; N1219, DEC-466)
- R99 *(not yet met: T53)* · **Tick passes `read` and `disagree` through.** R12 in full: one transaction; each entry appended via observation-log's writer, `authority_kind: run`, `actor_class: machine`, actor the AI principal, carrying its `read` and `disagree` unchanged (observation-log R40); refused in `refused`, others appended; figures added; lease extended; `state` replaced if given; ticks +1; exhausted bound → R14 (`runtime`, `runtime-ceiling-reached`), `ended`. A field the writer refuses → that entry in `refused` with its code, rest stands. T: `read` `1 of 3`…`3 of 3` → three rows with fields; C: `n` > `total` → `OBSERVATION_FIELD_MALFORMED`, two appended.
- R100 *(not yet met: T53)* · **`op=airunlog` serves the fields.** R24 in full: absent or invisible `found: false`, no entries; else entries in order from 1, `result_ref` → ordinal, coverage, `read` and `disagree` as stored (`null` if none; screens draw "Reading {document} · {n} of {total}" from them and parse no `detail`, `screens-inquiry` R58); `limit` [1, 5,000] (200) with `truncated`; `stopped`; vocabulary (states, levels, bounds, endings, coverage). T: both fields in order; C: older entry both `null`; outsider `found: false`.
- R101 *(not yet met: T53)* · **Each segment is a part.** `ai_run_segments` (R91) holds per segment `label` (first conversation's, first of R91's `labels`) with `display_name` (R104), `provider`, `model_version`; account `{level, provider, plan}` (`member`, `project`, `group`; words say team) from `ai_account` at dispatch, never an account id or owner's name to the viewer; `from` = `started`, `to` = `ended` (null while running). Nothing not carried by the dispatch; label never composed here (BR2) or from a request. T: two segments, two accounts → two rows; C: body `label` ignored; first label not rewritten.
- R102 *(not yet met: T53)* · **Hop and refusal in the record.** Each R92 hop answered `{reason, from, to, payer_change}` (accounts as `{level, provider, plan}`, entries as `entry_id`, `payer_change` `{from_level, to_level}` or null). Her `op=aistop` on a payer-changing hop, in the act ending `cancelled`, writes on the segment she would have continued from `end_refusal` `{by, reason, from, to, payer_change, at}`; `aicontinue` and `LIST_EXHAUSTED` write none. T: own→team `limit` hop `{from_level: member, to_level: group}`; `aistop` writes `end_refusal`, `cancelled`, partials kept; C: none on accept or exhausted; same payer null.
- R103 *(not yet met: T53)* · **`runParts({run, viewer})` (`op=airunparts`), "How this run went".** Read, never throws, writes nothing, to the run's viewers (R91's: member and paying owners; else `{found: false, parts: []}`): `{found: true, run, status, parts, truncated}`, each part `{n, label: {display_name, provider, model_version}, account: {level, provider, plan, own}, from, to, hop_in, end_refusal}` (`own` the viewer's own; `hop_in` null for the first); ≤ `RUN_PARTS_LIMIT`, `truncated` measured. Keys `screen.run.parts.head`, `screen.run.part`, `screen.run.switch`, `screen.run.declined` (DEC-466 U2). No secret, account id, content word or other owner's name. Unreadable → `{unreadable: true, parts: null}`. Class member and admin, `machineClasses` [], read act, no rung; `accepts`/`requires` `run`; viewer from the stamp, never the body. T: three parts, two hops, declined `end_refusal`; one part `hop_in` null; owner sees same. C: non-viewer none; body viewer ignored; other's account `own: false`; no id or secret.
- R104 *(not yet met: T53)* · **The label names the AI, never the account.** Each `usage` `label` (R72, R88) must carry `display_name` equal to `ai-catalogue`'s `entryOf(entry_id).display_name`; missing or other → `AI_RUN_CONSUME_INVALID`, nothing counted. `{ai}` of `screen.machine.*.ai` from `label.display_name` alone (no account name, owner, level, id); rows read today keep their English (DEC-466 U1). The same label R101 stores, R103 answers, on every machine result (`draft-agent-run-path.md` R122). T: matching counted; team and own account same `{ai}`; C: missing, differing, or the account's provider-and-plan name refused.
- R105 *(not yet met: T53)* · **Wait a set time, then switch** (K5489). With provider down or slow (`aimoments` (d)) a fourth choice: `waitThenSwitch({run, member, wait})` (`op=aiwaitswitch`), `wait` ∈ `WAIT_THEN_SWITCH_CHOICES` (5, 15, 60 minutes; DEC-475, BOB #323); plain `aiwait` takes the same list, re-telling her if still down. Records `{run, member, wait, from, at}`; holds the step until the wait ends or `op=aipathready` `ready`; recovered → continue, no switch; else `ai-accounts.hopFor` reason `unavailable`, switch at the step boundary (R102), shown, stoppable by `aistop`; non-null `payer_change` still waits for `aicontinue` (K5477). Only the run's member. T: still down → hop `unavailable`; recovery → none; other owner waits for `aicontinue`. C: off-list `WAIT_INVALID`; another member refused (R103's viewers).
- R106 *(not yet met: T53)* · **A retried write is honoured once.** `spawnPayload` (`op=airunspawn`), `tick`, `close` accept `idem` `<run>:<pass>:<step>:<n>` (`agent-steps` R54). Bad shape or another run → `AI_RUN_IDEM_INVALID` (`run-rules` row, C-number BOB's), nothing done. The first call with an `idem` is done as R12, R13, R23 and its answer kept with the `idem` for the run's life (purged with it, R38); a repeat answers it verbatim plus `repeated: true` and does nothing (tick: no entry, figure (R29, R72, R88), lease, tick count or segment end (R84); close: no second end or `bias` notice; spawn writes nothing, same payload). `agent-steps` R12 counts `repeated: true` in `verbatim_resubmits`. A call refused before acting keeps nothing (retry judged afresh). No `idem`: as before. T: tick twice → effects once, second = first + `repeated: true`; close twice → one end, one notice; spawn twice same. C: new or no `idem` appends; other run refused; refused tick re-judged. `idem` in `accepts` where `op-declarations` declares them.
- R107 *(not yet met: T53)* · **Who produced a report entry.** A tick entry with a machine result may carry `produced_by`: deduplicated ordered labels of the producing conversations, copied unchanged, checked as R72, R104 (bad → `AI_RUN_CONSUME_INVALID`, entry in `refused`, others appended); stored, served by `op=airunlog` (R100), `null` if none; never composed or from a body. After a hop the new producer's label; repeated tick (R106) repeats it. T: hop between two stub adapters names each; C: script entry `null`; malformed refused.

Uses: the used modules below (`record-core` `transact`, `declarePurge`; `membership` `participation`, `existenceAct`, `listenerRefusal` (R81), `MODULE_ORDER` (R83), `notAnAdmin`; `promotion` `registerStep`; `bias` `biasManifest`; `ai-use` `useCheck`, `countUsage`; `credentials` mint and end). (T53) `ai-accounts` `hopFor` (R50), `aisend`, `aisendrefuse`; `ai-catalogue` `entryOf` (R104); `agent-model` `health` via `op=aipathready`; `scheduler`'s consumer slot; `run-rules` `partAdmittedOn`; `agent-harness` `ROLE_NEEDS`, `partOf`, `disclosureGate`.

Mismatch: Uses cite `membership` `listenerRefusal` (R81), `MODULE_ORDER` (R83), `notAnAdmin` (R84); membership reads those ids retired (to `member-roster`, T51).
Mismatch: R101 and R103 cite `ai_run_segments`, `labels` and the viewers rule as R91's; R91's text names none of them.

Invariants:
- R31 · One exit; log append-only.
- R32 · Conditions recorded at open.
- R33 · Never re-attributed.
- R34 · No lens in search.
- R35 · Each minted check (C-33.29–31, C-33.45–47, C-36.1–3, C-66.1–4) an invariant with its test, rows in `run-rules`.
- R36 · Hidden-run predicate registered with `retrieval`, observation-log.
- R37 · `contradiction`'s run gate from R28.
- R38 · `ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings` declared to purge; counts through sight.
- R39 · No place named.
- R54 *(not yet met: T53)* · (T53; K3472) Every member-facing string (refusal `note`, `detail`, row `translation`, a dispatch's `says` in `op=airunlog`) names the team's own Civicsmith by its word-table key, never "your group's Civicsmith" (nor "copy", "instance", "plane", "server"); the five rows stand (`index.mjs`:895, :1688, :1694, :1698, :1699); codes, op and field names, :867's operator note, comments stay. T: each row reads a key; C: old English fails.
- R53 · Tables declared via `declareTable`; `ai_usage` moved to `ai-use` R7.

Satisfies: INVESTIGATIVE-SESSION §11, §14; (T53) K5457, K5475, K5477, K5489: the T53-marked ids; N1219, DEC-466: R99–R105. Suggestions: factory `aiRunsOf(ctx, env)`; negative control per refusal. Open for Bob: none.

- R90 *(not yet met: T53)* · `DECLARED_OPS` (frozen, by door name, `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}`, fields from the arm whole): `airunopen`, `airunclose`; (T53) `aicontinue`, `aistop` (R94), `aiwait`, `aiswitchaccount`, `aiwithout` (R95), `aisend`, `aisendrefuse` (R96), `airunparts` (R103), `aiwaitswitch` (R105). T: `declaredOpHolds` each (`declared-ops.test.mjs`).

## Used services

record-grammar (`build/requirements/record-grammar.md`): the record's shared grammar; no store, network or clock.

civil-time (`build/requirements/civil-time.md`): the one civil-time engine; pure.
- civil-time R1 · `localDay(instant, zone) → YYYY-MM-DD`: the day in `zone`, across DST; unknown zone `ZONE_INVALID`.

runtime-limits (`build/requirements/runtime-limits.md`): runtime facts a Worker cannot get otherwise; no store, network or credential setting.

record-core (`build/requirements/record-core.md`): the record's storage: ids, leases, history, manifest, purge.
- record-core R21 · `declarePurge(module, tables, {exempt?})` is `declareTable`'s default form (`purge` `exempt` if listed else `clear`, `expunge` `none`, `export` `admin-only`, `sight` `bundle` if keyed else `group`, `derive` `stored`, `version_chain` false); `declareTable` entries name every class or are refused `TABLE_CLASS_MISSING`/`TABLE_CLASS_UNKNOWN`; declared twice `TABLE_DECLARED`.
- record-core R46 · A table is a name or `{name, keys, whole}` (also `clears`, K775).
- record-core R32 · `transact(fn)`: one transaction; throw or `ok:false` rolls back every row and spends no id; nested = savepoint; rethrows after rollback.

membership (`build/requirements/membership.md`): who the members are and may do; projects at setup; no credential.
- membership R74 · `participation(projectId, memberId)` → `{state, owner}` or null; never throws.
- membership R77 · `existenceAct(projectId, viewer)` → C-70.1 `PROJECT_SEEN_NOT_A_PARTICIPANT` when sight is existence only, else null (administrators also get `owners`); asked before any no-such-project answer; never throws.

promotion (`build/requirements/promotion.md`): the one all-or-nothing write path for bundles.
- promotion R39 · `registerStep(module, {check?, project?})`: once at start; check before the write, projection after, both in the promotion's `transact`; a check's refusal refuses the promotion as it came; order own refusals, checks (modules' order), `commit`, projections; twice `STEP_DECLARED`.
- promotion R40 · `registerFact`/`fact`: no provider `FACT_UNAVAILABLE`, throwing `FACT_FAILED`; never false, never throws.

connections (`build/requirements/connections.md`): the record's connections and citation edges.

bias (`build/requirements/bias.md`): declared bias sets and the effective lens in force, with its hash.
- bias R13, R14, R15, R16, R17, R18 · `biasManifest({scope, scopeId, viewer, limit, offset})` (`op=biasmanifest`, synchronous): unseen project scope or nothing in force → `in_force: false`, "no manifest was in force", never an empty lens; pins not `adopted` in `pins_proposed`; unreadable pin → `in_force: null`, `unresolved_pins`; group then project statements (locked kept, `lock_violations`); `statements_sha` over the whole set; `bundles`, `residue`, `statements` page (200, ≤ 2,000), `total`, `truncated`.

observation-log (`build/requirements/observation-log.md`): append-only record of looking: level, authority, what was found (or not); the one writer, vocabulary, sight fence.
- observation-log R29 · (T53-602's "R29's column list") `observation_log` columns `seq`, `at`, `actor_class`, `actor`, `authority_kind`, `authority`, `level`, `subject_kind`, `subject`, `state`, `governed`, `condition`, `bound`, `terminal`, `result_kind`, `result_ref`, `detail` (with `leads`, `lead_shares`): a stated read contract changed only with this requirement; writes stay observation-log's.
- observation-log R40 · An entry may carry `read` `{record, n, total, outcome}` (`1 <= n <= total`; `answered`/`refused`) or `disagree` `{record, levels}` (≥ 2 distinct levels, in order), at most one, only for authority `run` or `step`; `null` when absent; no state, coverage or sight change; refusals after C-22.4: `OBSERVATION_FIELD_MALFORMED`, `OBSERVATION_FIELD_NOT_ALLOWED` (new C-22 row, BOB's at START, by key). T/C as source.
- observation-log R41 · The fields have no sight of their own: the row is seen whole or withheld whole.

Mismatch: T53-602 says "R29's column list names them"; observation-log R29 as written names neither `read` nor `disagree`.

retrieval (`build/requirements/retrieval.md`): the query language over the record.

inquiry (`build/requirements/inquiry.md`): the inquiry's lifecycle.

contradiction (`build/requirements/contradiction.md`): pairs assertions.

run-rules (`build/requirements/run-rules.md`): the run's pure rules and refusal rows.
- run-rules R19 *(not yet met: T53)* · (named in the rows) Verification chain unchanged. (T53) The deploy gate reads the bar **per entry**: a fine part (`TEST_BAR_PARTS`) is deployable for an entry only with a Gate 1 record (`ai-gate` R37) for that entry and its gate part (`GATE_PART_OF`) at `passes` or `passes_with_limits`; `not_yet_rated`, `not_suitable` admit nothing. `ai-runs` R75 records kept per entry (`entry_id` added) are the accuracy measure: below bar on the current set refuses that part for that entry only (`PART_WITHDRAWN`) until a later pass (K5475).

credentials (`build/requirements/credentials.md`): the credentials people and the instance act by.

ai-use (`build/requirements/ai-use.md`): what each AI account has spent and may spend.

steps (`build/requirements/steps.md`): work toward a question's answer.

ai-accounts (`build/requirements/ai-accounts.md`): the AI accounts and which one serves an act, with the hop.

setup-words (`build/requirements/setup-words.md`): the word list as frozen data.

test-support (`build/requirements/test-support.md`): shared test sandbox and library.

agent-harness (`build/requirements/agent-harness.md`): the deterministic tables an AI run walks; pure.

agent-model (`build/requirements/agent-model.md`): how a model turn reaches a provider; outcome, `usage`, no credential.

ai-catalogue (`build/requirements/ai-catalogue.md`): what a copy knows of offerable AIs; no provider name in code.

## This task

- T53-203 · K5457 (K2892 as K5457 reads it) · `principal_ai`; the account per act; Gate 1 per (entry, part) through `partAdmitted`; segments, labels, hops; pause and resume; a recipient notice holds the run; ops `aicontinue`, `aistop`, `aiwait`, `aiswitchaccount`, `aiwithout`, `aisend`, `aisendrefuse` · `lane-ai-design/draft-agent-run-path.md` (ai-runs R91–R97, R105 `aiwaitswitch` with `WAIT_THEN_SWITCH_CHOICES` set at START (K5489), and the amended (the ids marked T53 above); R75's `testBarRecord` gains `entry_id`, named in run-rules R19, A48) (AI1, AI3 answered, K5475, K5477).
- T53-204 · N1219, DEC-466 · `read` and `disagree` passed through (R99), `op=airunlog` (R100), segments as parts, hops and refusals recorded (R101, R102), `op=airunparts` "How this run went" (R103), the label names the AI, never the account (R104) · `lane-ai-design/draft-run-record.md`.
- T53-205 · BOB · idem lines for `airunspawn`, `airunclose`, the ai-runs tick (R106; `[written: K5748: ai-runs R106]`).
- T53-206 · K5565 · English in tests (R54's keys): assertions read the product's word key and values, never a copied sentence; a B site first gets its key; a C site kept as input or removed with its reason; tests touched for other entries converted too. CENSUS: literal A/B 0/1; regex A/B/C 9/5/6 (11 files). Test: the words check's baseline loses the module's files; suite green.
- T53-602 · observation-log R40, R41 (K5786) · R99, R100 build on observation-log's writer and readers; `op=airunlog` serves the `read` and `disagree` columns; R29's column list names them.

Mismatch: R107 is marked not yet met (T53), but no entry above names it.
