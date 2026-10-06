# agent-model — requirements

**Status** · Reviewed (K1505; banner cleared K1599). New module, split from `agent-worker` by copy (K617, K1439; `plan/draft-T33-plan.md` T33-55; entries C Q0-1 seam (iii) and Q0-2), then extended. R1 is `agent-worker` R40, amended as T33-55 and K1502 rule (the member's own reference; the model per mode by measurement). R2–R10 are new: the two providers (K1429, K1502), caching and `usage` (ladders §9.4 Q0), and the conversation `model.mjs` performs today, which no `agent-worker` requirement states (its R40, R41 and D-611 rest on it). Layer 6, after `agent-harness`, before `agent-runner`. Whether `agent-worker` keeps R40 re-worded (T33-57 names "R35 and R40 per audit") or retires it as moved here is open (Suggestions).

| old (`agent-worker`) | new | |
|---|---|---|
| R40 | R1 | amended (K1502; model per mode by measurement) |
| — | R2–R10 | new |

**Size (P6).** `agent-worker/src/model.mjs` 240 lines today; with both providers about 600–900 (entries C P6 table). Well under 4,000.

## Public

### Purpose

How a model turn reaches Claude. Given one member's own account reference, it sends a conversation's turns either to the Messages API (an API key) or to Claude Code running unmodified in the `agent-runner` container (a Claude subscription), returns each turn's outcome and its `usage`, and keeps the segment within its turn and byte bounds. It holds no credential: the reference arrives per call and is never kept.

### Provides

Terms. An **account reference** is `{kind: "apikey", key}` or `{kind: "subscription", token}`, one member's own (K1502); its secret is the `key` or `token`. A **meter** is `segmentMeter({turnsBound, bytesBound})`'s plain object. An **outcome** is exactly one of `{result}`, `{silent: {detail}}`, `{refused: {status, type, message}}`.

- **R1** (was `agent-worker` R40, amended; K1502) A run's model turns run under the account reference of the member whose act started the run (a standing question's, its author's), with the skill pack the run names, within the segment bound. The model a turn asks for is the one `MODEL_FOR_MODE` names for the run's mode, set by measurement (M-Q1, M-Q9); no request body or judgement chooses it, and changing an entry is a reviewed edit (as `agent-worker` R42). *(not yet met: T33-55)*

**modelCall(reference, request, {runner?}) → outcome** (one turn)
- **R2** (K1429, K1502) The provider follows the reference's `kind`: `apikey` sends the turn to the Messages API at `MODEL_ENDPOINT`, the key in the `x-api-key` header and nowhere else; `subscription` sends it to `agent-runner` through the Container Durable Object binding passed as `runner`, the token in the request's credential field and nowhere else. A reference that is absent, of another `kind`, or with an empty secret answers `refused` with type `ACCOUNT_REFERENCE_UNUSABLE`, and a `subscription` reference with no `runner` answers `refused` with type `RUNNER_NOT_CONFIGURED`; neither makes any call. *(not yet met: T33-55)*
- **R3** Never throws. A call that throws, or answers a body that is not JSON, is `silent` with a detail of at most 200 characters. A status other than 200 is `refused` with the status, the provider's error `type` and its message cut to 300 characters; a 429 (a rate limit, or `enforced_spend_limit_reached`) is such a plain refusal, never retried here. A model's own refusal (`stop_reason: "refusal"`) is `refused` with type `refusal`. *(not yet met: T33-55)*
- **R4** (ladders §9.4 Q0: `cache_control`) On the `apikey` path every request marks the system prompt, the tool definitions and the skill pack's resident layer as cacheable (`cache_control`), so a request repeating that prefix is billed as a cache read. *(not yet met: T33-55)*
- **R5** (ladders §9.4 Q0: `usage` on every call; K1450) Every outcome that reached the provider carries `usage` `{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_cost_usd}`, on both paths. A figure the provider did not state is `null`, never 0; `total_cost_usd` is stated only where the provider states it. *(not yet met: T33-55)*

**converse({reference, runner?, mode, meter, system, messages, tools, finalTool, onTool, maxTurns}) → `{answer, usage}` | `{stopped}` | `{exhausted, usage}` | outcome** (one conversation)
- **R6** (D-611; `agent-worker` R40, R41) A conversation ends when the model calls `finalTool` (its input is the `answer`), or `stopped: "turns"` or `"bytes"` when sending the next request would take the meter past `turnsBound` or `bytesBound` (counted as the serialized request's length, before sending; the segment stops, never the run), or `exhausted` after `maxTurns` turns (12 by default), or with a turn's `silent` or `refused` outcome. Every other tool call is performed by `onTool` and its result returned to the model; every tool call in a turn gets a result, so the transcript stays one the provider accepts. `usage` is the sum over the conversation's turns, with `null` where any turn's figure is `null`. *(not yet met: T33-55)*
- **R7** (K1502; M-Q4 relay) On the `subscription` path the tools the model may call are only those `tools` names, and each call the runner relays is performed by `onTool` and its result sent back over the same connection, so `agent-worker`'s table keeps every decision (R16, R39 there); R6's endings hold unchanged. *(not yet met: T33-55)*

## Private

### Uses

- `runtime-limits`, as Rule 3's table names it (see Suggestions). The runner is reached over its binding only, never imported (it is a later module).

### Invariants

- **R8** (`agent-worker` R36; K1429, K1502) A reference's secret is used for the one call it came with and kept nowhere: no module state, log, answer, outcome, `usage` or error carries it. A test passes a sentinel secret and finds it in no returned value and no console output, and a second call without a reference makes no call. *(not yet met: T33-55)*
- **R9** (K1502: the group's copy binds no Claude credential) It reads no environment variable or binding for a credential: with a key present in `env` (`INSTANCE_CLAUDE_TOKEN` included) and no reference, every call is refused by R2 and nothing is sent. *(not yet met: T33-55)*
- **R10** No place is named in its behaviour or outward text, and it reaches no address but `MODEL_ENDPOINT` and the `runner` binding. *(not yet met: T33-55)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (the member's own reference; `usage` recorded from stage 0), §2 "Cross-cutting rulings" (the member's own account), §9.4 (Q0: the subscription path through the Agent SDK, the API-key path through the Messages API, `cache_control`, `usage`; the cost paragraph), §10 "A module fits in one reading".
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (K1502's re-scope).
- `docs/development/INVESTIGATIVE-SESSION.md` §14a (a separate process through the same interface).
- DEC-55; K1429, K1450, K1502, K1503; D-611.

### Suggestions

- **Files.** `agent-model/src/model.mjs` copied from `agent-worker`, then the providers beside it (`apikey.mjs`, `subscription.mjs`). `parentSystem`, `rowPrompt`, `rowFacts`, `judgeTools`, `planJudgeTools`, `subsessionSystem`, `subsessionTools` and `LOAD_LAYER` sit in `model.mjs` today; they shape prompts from the table's state and could go to `agent-harness` instead (BOB's; the draft leaves them here, as Q0-1 places `model.mjs` whole).
- **Open for BOB.** (1) `agent-worker` R40: re-worded in the shell (T33-57) or retired as moved to R1 here; one home is better. (2) The refusal types `ACCOUNT_REFERENCE_UNUSABLE` and `RUNNER_NOT_CONFIGURED`, and the runner binding's name, are this draft's. (3) `MODEL_FOR_MODE`'s values before M-Q9: today's `claude-opus-5` default, or a value marked provisional; the measurement picks the cheapest model passing K1504's bar (assistant-substrate §7). (4) Rule 3 lists `runtime-limits`; nothing here needs it once the cascade (R32) is the shell's and K1502 removes the group token; drop the edge or name its use.
- **Caching shape.** One breakpoint after the tools, one after the system prompt (pack resident layer inside it); assistant-substrate §4 notes only uncached input counts toward ITPM.
- **The relay.** The runner holds one long-lived connection per conversation from the Container DO (assistant-substrate §2, M-Q4 GO relay); `defer` is not used.
- **Tests.** R2: each kind routes to its stub, a bad reference makes no call; R3: throw, non-JSON, 429, refusal; R4: the request body's `cache_control` marks; R5: `null` figures stay `null`; R6: the four endings; R8/R9 as stated.
