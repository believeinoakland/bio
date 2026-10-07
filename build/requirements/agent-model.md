# agent-model — requirements

**Status** · In force: reviewed (K1505; banner cleared K1599). Split from `agent-worker` (K617, K1439; T33-55): R1 is its R40, amended (K1502), retired there (K1567); R2–R12 new. Last changed T35 (T35-48: R12); every requirement met (K1987).

| old (`agent-worker`) | new | |
|---|---|---|
| R40 | R1 | amended (K1502; model per mode by measurement) |
| — | R2–R10 | new |

**Size (P6).** `agent-worker/src/model.mjs` 240 lines today; with both providers about 600–900 (entries C P6 table). Well under 4,000.

## Public

### Purpose

How a model turn reaches Claude. Given the account reference that serves one member's act (the member's own, or the group's API key, K1755), it sends a conversation's turns either to the Messages API (an API key) or to Claude Code running unmodified in the `agent-runner` container (a Claude subscription), returns each turn's outcome and its `usage`, and keeps the segment within its turn and byte bounds. It holds no credential: the reference arrives per call and is never kept.

### Provides

Terms. An **account reference** is `{kind: "apikey", key}` or `{kind: "subscription", token}`, one member's own (K1502) or, for an `apikey` only, the group's (K1755), with its `level` (`member` or `group`) as `credentials.accountFor` answers it (its R35); its secret is the `key` or `token`. A **meter** is `segmentMeter({turnsBound, bytesBound})`'s plain object. An **outcome** is exactly one of `{result}`, `{silent: {detail}}`, `{refused: {status, type, message}}`.

- **R1** (was `agent-worker` R40, amended; K1502, K1755) A run's model turns run under the account reference that serves the act of the member who started the run (a standing question's, its author's): that member's own, or the group's API key, as `credentials.accountFor` answers it for that act (its R35), with the skill pack the run names, within the segment bound. The model a turn asks for is the one `MODEL_FOR_MODE` names for the run's mode, set by measurement (M-Q1, M-Q9); no request body or judgement chooses it, and changing an entry is a reviewed edit (as `agent-worker` R42). Since T35 (K1983) it holds an entry for `draft` (`agent-worker` R59), provisional and today's default model until M-Q9 measures it.

**modelCall(reference, request, {runner?}) → outcome** (one turn)
- **R2** (K1429, K1502) The provider follows the reference's `kind`: `apikey` sends the turn to the Messages API at `MODEL_ENDPOINT`, the key in the `x-api-key` header and nowhere else; `subscription` sends it to `agent-runner` through the Container Durable Object binding passed as `runner`, the token in the request's credential field and nowhere else. A reference that is absent, of another `kind`, or with an empty secret answers `refused` with type `ACCOUNT_REFERENCE_UNUSABLE`, and a `subscription` reference with no `runner` answers `refused` with type `RUNNER_NOT_CONFIGURED`; neither makes any call.
- **R3** Never throws. A call that throws, or answers a body that is not JSON, is `silent` with a detail of at most 200 characters. A status other than 200 is `refused` with the status, the provider's error `type` and its message cut to 300 characters; a 429 (a rate limit, or `enforced_spend_limit_reached`) is such a plain refusal, never retried here. A model's own refusal (`stop_reason: "refusal"`) is `refused` with type `refusal`.
- **R4** (ladders §9.4 Q0: `cache_control`) On the `apikey` path every request marks the system prompt, the tool definitions and the skill pack's resident layer as cacheable (`cache_control`), so a request repeating that prefix is billed as a cache read.
- **R5** (ladders §9.4 Q0: `usage` on every call; K1450) Every outcome that reached the provider carries `usage` `{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_cost_usd}`, on both paths. A figure the provider did not state is `null`, never 0; `total_cost_usd` is stated only where the provider states it.

**converse({reference, runner?, mode, meter, system, messages, tools, finalTool, onTool, maxTurns}) → `{answer, usage, calls}` | `{stopped}` | `{exhausted, usage, calls}` | outcome** (one conversation)
- **R6** (D-611; `agent-worker` R40, R41) A conversation ends when the model calls `finalTool` (its input is the `answer`), or `stopped: "turns"` or `"bytes"` when sending the next request would take the meter past `turnsBound` or `bytesBound` (counted as the serialized request's length, before sending; the segment stops, never the run), or `exhausted` after `maxTurns` turns (12 by default), or with a turn's `silent` or `refused` outcome. Every other tool call is performed by `onTool` and its result returned to the model; every tool call in a turn gets a result, so the transcript stays one the provider accepts. `usage` is the sum over the conversation's turns, with `null` where any turn's figure is `null`. (N588; K1621) Every answer that carries `usage` also carries `calls`, the number of model calls that reached the provider and whose `usage` that sum covers: on the `apikey` path each request answered with any outcome counts one (a request the meter stopped before sending counts none); on the `subscription` path it is the turns the runner states for the conversation (`agent-runner` R4's `num_turns`), and `null` where the runner states none, never 0. A caller can so count model calls, not conversations.
- **R7** (K1502; M-Q4 relay) On the `subscription` path the tools the model may call are only those `tools` names, and each call the runner relays is performed by `onTool` and its result sent back over the same connection, so `agent-worker`'s table keeps every decision (R16, R39 there); R6's endings hold unchanged.

**Record text as data** (F5; K1881)
- **R12** (F5) **Record text** is any text the plane answered (a read's result, a document's or page's words, a report or summary a sub-session wrote from its reads, a refusal's `detail`, a plan's or an earlier plan's text, a held candidate's words), as distinct from this repository's own text and the rendered pack. Record text reaches the model only inside a tool result: on the `apikey` path the `content` of the `tool_result` block answering the call it came from, as `text` blocks or, where the caller marks it as search results, `search_result` blocks (`{source, title, content}`, citations as data, ladders §9.4); on the `subscription` path the relay's `tool_result` (`agent-runner` R3). It is never placed in `system`, in a `user` turn's own `text` or in any other block. This holds for every prompt this module builds: `parentSystem` and `subsessionSystem` carry only the pack, the step's or contract's own fields set by the table, and this repository's words; `rowPrompt` carries the step and the row; the facts a judged row judges over (`rowFacts`: reports, holdings, the plan, earlier plans, reads, a refusal) arrive as the result of a tool call the conversation makes or is opened with. `converse` sends `system` and the caller's `messages` as it was given them, and moves no text of a tool result into either. A test puts a sentinel in every record field `rowFacts` and a sub-session contract read and in an `onTool` answer, and finds it in the sent requests only inside `tool_result` content.

## Private

### Uses

- `runtime-limits`, as Rule 3's table names it (see Suggestions). The runner is reached over its binding only, never imported (it is a later module).

### Invariants

- **R8** (`agent-worker` R36; K1429, K1502) A reference's secret is used for the one call it came with and kept nowhere: no module state, log, answer, outcome, `usage` or error carries it. A test passes a sentinel secret and finds it in no returned value and no console output, and a second call without a reference makes no call.
- **R9** (K1502, K1755: the group's copy binds no Claude credential in its environment; the group's API key lives in `credentials`' sealed table and arrives per call as a reference, R11) It reads no environment variable or binding for a credential: with a key present in `env` (`INSTANCE_CLAUDE_TOKEN` included) and no reference, every call is refused by R2 and nothing is sent.
- **R10** No place is named in its behaviour or outward text, and it reaches no address but `MODEL_ENDPOINT` and the `runner` binding.
- **R11** (K1755) A reference of `level` `group` is the group's API key: it is taken only with `kind` `apikey` and sent exactly as a member's `apikey` reference is (R2, R4, R5), kept as R8 keeps any; a `group` reference of any other `kind`, or a `level` present and other than `member` or `group`, answers `refused` with type `ACCOUNT_REFERENCE_UNUSABLE` and makes no call.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (the member's own reference; `usage` recorded from stage 0), §2 "Cross-cutting rulings" (the member's own account), §9.4 (Q0: the subscription path through the Agent SDK, the API-key path through the Messages API, `cache_control`, `usage`; the cost paragraph), §10 "A module fits in one reading".
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (K1502's re-scope).
- `docs/development/INVESTIGATIVE-SESSION.md` §14a (a separate process through the same interface).
- DEC-55; K1429, K1450, K1502, K1503, K1755; D-611.
- `plan/draft-T35-security-review.md` F5 (K1881): record text as data (R12); ladders §9.4 ("citations as data"; "record content treated as data against prompt injection (OWASP LLM01)").

### Suggestions

- **Files.** `agent-model/src/model.mjs` copied from `agent-worker`, then the providers beside it (`apikey.mjs`, `subscription.mjs`). `parentSystem`, `rowPrompt`, `rowFacts`, `judgeTools`, `planJudgeTools`, `subsessionSystem`, `subsessionTools` and `LOAD_LAYER` sit in `model.mjs` today; they shape prompts from the table's state and could go to `agent-harness` instead (BOB's; the draft leaves them here, as Q0-1 places `model.mjs` whole).
- **Open for BOB.** (1) Settled: `agent-worker` R40 stays retired to R1 here (K1567). (2) The refusal types `ACCOUNT_REFERENCE_UNUSABLE` and `RUNNER_NOT_CONFIGURED`, and the runner binding's name, are this draft's. (3) `MODEL_FOR_MODE`'s values before M-Q9: today's `claude-opus-5` default, or a value marked provisional; the measurement picks the cheapest model passing K1504's bar (assistant-substrate §7). (4) Rule 3 lists `runtime-limits`; nothing here needs it once the cascade (R32) is the shell's and K1502 removes the group token; drop the edge or name its use.
- **Caching shape.** One breakpoint after the tools, one after the system prompt (pack resident layer inside it); assistant-substrate §4 notes only uncached input counts toward ITPM.
- **The relay.** The runner holds one long-lived connection per conversation from the Container DO (assistant-substrate §2, M-Q4 GO relay); `defer` is not used.
- **T35 (T35-48).** One way to meet R12 for a judged row: open the conversation with an assistant `tool_use` of a fixed `read_facts` tool and the user's `tool_result` holding `rowFacts`, then the row's own prompt; the row's judge tool is unchanged. On the subscription path the same opening goes as the relay's first result. `search_result` blocks need the caller to mark a result as search results (e.g. `{search_results: [...]}` from `onTool`); without the mark, a result is `text`. `agent-worker`'s share of F5 is its own (it builds the ask's and draft's prompts; its T35 R). `MODEL_FOR_MODE` needs a `draft` entry for `agent-worker`'s `POST /draft` (R1's reviewed edit; provisional until M-Q9).
- **Tests.** R2: each kind routes to its stub, a bad reference makes no call; R3: throw, non-JSON, 429, refusal; R4: the request body's `cache_control` marks; R5: `null` figures stay `null`; R6: the four endings, and `calls` equal to the stubbed provider's requests on the `apikey` path and to the stub runner's `num_turns` on the `subscription` path; R8/R9 as stated.
