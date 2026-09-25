# runtime-limits — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/cpu.mjs`,
`bio-plane/src/tokens.mjs`. No row of the old plan and no entry in `build/plan/next.md` targets this
module; every requirement below is met by the code as it stands.

## Public

### Purpose

Two runtime facts a Worker cannot get any other way. `cpu.mjs` measures what a capture spends in CPU:
Cloudflare freezes `Date.now()` during synchronous execution, so a Worker cannot time its own compute,
and it counts calls and bytes instead of fabricating a millisecond figure; it also finds the CPU ceiling
the runtime enforces, by a stepped probe that checkpoints after every step so the trail survives the
isolate being killed mid-probe. `tokens.mjs` is token hygiene: whether a secret value is live rather than
a value that has ever been published in this repository, and the status of the two instance-level
credentials an instance may hold as deploy secrets (the Anthropic account that pays for a run, and BIO's
own `ai` credential that resumes one). Neither half holds a store, reads the network, or has any way to
set a credential.

### Provides

**makeMeter() → meter**
- **R1** Returns an object with three methods: `sync(label, fn, bytes?)`, `cpuAwait(label, fn, bytes?)`
  and `report()`.
- **R2** `sync` and `cpuAwait` each record one call under `label` — creating that segment on first use —
  and add `bytes` to its byte total when `bytes` is a finite number, before running `fn` (`cpuAwait`
  awaits it) and returning its result. The call is counted before `fn` runs, so a throwing `fn` still
  leaves it counted.
- **R3** `report()` returns `{work_calls, work_bytes, segments, measured_ms: null, note}`: `work_calls`
  and `work_bytes` are the sums, over every label used on this meter, of each segment's calls and bytes;
  `segments` is a copy keyed by label, each `{calls, bytes}`; `measured_ms` is always `null`; `note` is a
  string stating these are counts, never times, because Cloudflare freezes the clock during synchronous
  execution.
- Errors: never throws on its own account. Propagates whatever `fn` throws or rejects with.

**burn(iterations) → number**
- **R4** Runs a fixed, allocation-free arithmetic loop `iterations` times and returns the final value. The
  same `iterations` does the same amount of work every time; the returned number carries no meaning
  beyond that.
- Errors: never throws.

**cpuProbe({checkpoint, startStep, maxStep, iterationsPerStep, budgetMs, now}) → Promise<{completed, elapsed_ms, reason}>**
- **R5** Defaults: `startStep` 0, `maxStep` 40, `iterationsPerStep` 2,000,000, `budgetMs` 20,000, `now`
  `Date.now`. `checkpoint` has no default.
- **R6** Reads `now()` once, at the start, as `t0`. Starting from `step = startStep`, repeats: `burn`
  `iterationsPerStep` iterations, compute `elapsed = now() - t0`, then `await checkpoint(step + 1,
  elapsed)`. `checkpoint` is called exactly once per completed step, strictly in ascending step order,
  and is always awaited before the next step's `burn` begins.
- **R7** Immediately after a checkpointed step whose `elapsed >= budgetMs`, returns `{completed: step + 1,
  elapsed_ms: elapsed, reason: "BUDGET_REACHED"}` without starting another step.
- **R8** If `maxStep` is reached without the budget being reached, returns `{completed: maxStep,
  elapsed_ms, reason: "MAX_STEP_REACHED"}`, `elapsed_ms` from the last completed step.
- Errors: throws when `checkpoint` is not callable. Otherwise never throws on its own logic; propagates
  whatever `checkpoint` throws or rejects with.

**sha256hex(v) → Promise\<string\>**
- **R9** Returns the SHA-256 digest of the UTF-8 encoding of `v`, as 64 lowercase hex characters.
- Errors: never throws for any string `v`, including the empty string.

**liveToken(v) → Promise\<boolean\>**
- **R10** Returns `false` when `v` is not a string, or is the empty string.
- **R11** Otherwise returns `false` when `sha256hex(v)` is a member of `PUBLISHED_TOKEN_HASHES`, and
  `true` otherwise.
- Errors: never throws.

**PUBLISHED_TOKEN_HASHES**
- **R12** An exported `Set` of SHA-256 hex strings, the denylist. `liveToken` and every credential-status
  service below treat a value whose hash is in the set exactly as an empty one. A caller may also test
  membership directly (`PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))`) and gets the same answer
  `liveToken(v)` would give.

**instanceClaudeStatus(env) → Promise\<{level: "instance", configured, reason, detail}\>**
- **R13** Reads `env.INSTANCE_CLAUDE_TOKEN` (the name is also exported as `INSTANCE_CLAUDE_BINDING`).
  Missing, or the empty string: `{level: "instance", configured: false, reason: CASCADE_UNSET, detail:
  <string>}`.
- **R14** A non-empty string whose hash is in `PUBLISHED_TOKEN_HASHES`: `{level: "instance", configured:
  false, reason: CASCADE_PUBLISHED, detail: <string>}`.
- **R15** Any other non-empty string: `{level: "instance", configured: true, reason: null, detail:
  null}`. No shape or format of the value is checked beyond presence and non-publication.
- **R16** `detail` is `null` exactly when `configured` is `true`, otherwise a string; the return value
  never carries the configured value itself.
- Errors: never throws.

**instanceClaudeToken(env) → Promise\<string | null\>**
- **R17** Returns `env.INSTANCE_CLAUDE_TOKEN` when `(await instanceClaudeStatus(env)).configured` is
  `true`, and `null` in every other case. Computed from `instanceClaudeStatus`'s own test, so the two can
  never disagree about the same `env`.
- Errors: never throws.

**instanceAiCredential(env) → Promise\<{token, reason}\>**
- **R18** Reads `env.INSTANCE_AI_TOKEN` (`INSTANCE_AI_BINDING`). Missing, or the empty string: `{token:
  null, reason: INSTANCE_AI_UNSET}`.
- **R19** A non-empty string that is not `liveToken`: `{token: null, reason: INSTANCE_AI_PUBLISHED}`.
- **R20** Any other non-empty string `v`: `{token: v, reason: null}`.
- Errors: never throws.

**The reason constants**
- **R21** `CASCADE_UNSET`, `CASCADE_PUBLISHED`, `INSTANCE_AI_UNSET` and `INSTANCE_AI_PUBLISHED` are
  exported string constants (`"NO_INSTANCE_ACCOUNT"`, `"INSTANCE_ACCOUNT_REVOKED_BY_PUBLICATION"`,
  `"NO_INSTANCE_AI_CREDENTIAL"`, `"INSTANCE_AI_CREDENTIAL_REVOKED_BY_PUBLICATION"`), stable across calls.
  They are the only values `reason` ever takes, besides `null`.

## Private

### Uses

- None. `runtime-limits` is Layer 1 with no `uses` entry in `modules.json`.

### Invariants

- **R22** Pure: no store, no network fetch, and (outside `cpuProbe`'s own injectable `now`) no clock.
  Every service gives the same answer for the same inputs; `cpuProbe`'s `elapsed_ms` is the one exception,
  since it depends on when it runs.
- **R23** No function here accepts or sets a credential. `env.INSTANCE_CLAUDE_TOKEN` and
  `env.INSTANCE_AI_TOKEN` reach this module only by already being present on the `env` object the caller
  passes at each call; nothing exported here can create, change or clear either one (DS-3, D-260 §6:
  minting and setting an account credential is a member act elsewhere, never a plane write path).
- **R24** `report()` never states a duration for synchronous work: `measured_ms` is always `null`, and
  `note` says why, rather than reporting a zero that would read as a measurement.
- **R25** No place is named in this module (`build/layers.md`, "No jurisdiction in the product"). It holds
  no local fact of any jurisdiction, and none of its behaviour depends on one.

No check in `bio-plane/checks/bio-checks.mjs` names `cpu.mjs`, `tokens.mjs`, or any function or constant
of either file — this module owns no C-numbered check today.

### Satisfies

- `BIO_Distribution_v0_1.md` §6 (D-260, DS-3): an instance may hold one organisation-principal `ai`
  credential as a deploy secret (`INSTANCE_AI_TOKEN`), never generated by this module, denylisted on
  publication like every other token.
- `BIO_Assistant_and_AI_Roles_v0_1.md` §6, D-260 (RULED by BOB #22, 2026-09-21): publication of a
  credential's value is revocation.
- The CPU-measurement half (`makeMeter`, `burn`, `cpuProbe`) rests on no canon design section; it is
  runtime instrumentation the code itself records discovering (2026-07-29: a Worker cannot time its own
  synchronous compute, so consumption is counted in work and the ceiling is found by a checkpointed
  probe instead).

### Suggestions

- Callers of `cpuProbe` (today, `legacy-index`'s `op=cpuprobe`) should make `checkpoint` itself durable
  (a store write) before it resolves: the whole design rests on the last completed step's checkpoint
  surviving an isolate kill that `cpuProbe` itself cannot detect or report, and a `checkpoint` that only
  buffers in memory defeats that.
- Today's callers: `subresources` uses `makeMeter`; `legacy-index` uses `cpuProbe`, `liveToken` (to admit
  `ADMIN_TOKEN`/`MEMBER_TOKEN`/`PROBE_TOKEN`/`DAEMON_TOKEN`) and re-exports `PUBLISHED_TOKEN_HASHES`;
  `legacy-store` uses `liveToken`, `sha256hex`, `instanceAiCredential` and `instanceClaudeToken`;
  `legacy-index`'s `livefire.mjs` checks configured bindings directly against `PUBLISHED_TOKEN_HASHES`.
  None of this module's own tests may depend on those legacy files; test each service directly.
- A caller combining this module's `cpuProbe`/meter output with other runtimes limits (for example the
  subrequest ceiling, `legacy-store`'s concern) is composing several modules' reports; that composition is
  not this module's requirement.
