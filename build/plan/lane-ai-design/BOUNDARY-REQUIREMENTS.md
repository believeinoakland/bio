# AI provider boundary: requirements for BOB (Q3)

**Status.** 2026-10-21, AI-DESIGN #1. Requirements for the neutral boundary between the assistant's harness and any AI, derived from `AI-PROVIDER-REQUIREMENTS.md` (the product requirements) and from what exists today (`NOTES.md` §Q1). Nothing here is code or a ruling. Packaging (which module holds what) is BOB's; §10 gives options. Ids **BR-n** are for traceability; AIR ids refer to `REQUIREMENTS.md`.

## 1. What does not change
The harness control table and fences, the plane's checks (report shape, citation resolution, quote-in-document, forbidden acts), the run object and its bounds, the run log, the credential and grant machinery, the cascade rule (project, else member, else team), keep-away limits, disclosure before first paid use, live progress and checked answers (K3602), and the canon's boundary rules: the machine proposes and the member authors; machine work is labelled; no machine credential attests; the endpoint surface is the fence. The boundary adds nothing to the trust model: an AI is a callee that returns text and tool calls, never an actor.

## 2. Layers and their responsibilities
| Layer | Holds | Is data or code |
|---|---|---|
| **Catalogue** | providers, hosts, plans, models, capability and effort sets, prices, evidence, lifecycle, guidance, credential means, runtime constraints, binding terms, policy tags | data (signed channel, AIR33) |
| **Provider interface** | the one neutral contract the harness calls (§3) | code, stable |
| **Adapters** | one per API family: OpenAI-compatible (configured by host profile), plus bespoke ones where an API differs | code, ships with releases |
| **Credential resolver** | turns an account's credential means into a usable secret at call time (§5) | code, one resolver per means |
| **Account resolver** | cascade, ordered list, limits, consent; chooses the account for an act (§6) | code (extends today's account resolution) |
| **Usage and limits** | neutral usage record, limits, estimates, thresholds (§7) | code (extends `ai-use`) |
| **Evidence and test** | conformance suite, raw-exchange capture, bundle sealing, canaries (§9) | code + signed suite data |

## 3. The provider interface
**BR1. One call shape for a model turn.** Request: catalogue entry id (never a raw provider model string); neutral messages (system, user, assistant, tool use, tool result) with an **opaque continuation** slot carrying whatever the provider needs returned unchanged (reasoning items, thought signatures); tools as JSON-schema functions with a tool-choice setting; an optional output schema; effort chosen from the entry's own allowed set; maximum output; a **session key** and **cache hints** (append-only prefix boundary); data-handling requirements (no retention, zero-retention required where the entry has it, host pin); timeout; an idempotency key.
**BR2. One response shape.** Normalised outcome (`result`, `silent`, `refused`, `error`) with the provider's stop reason mapped to a neutral set (end, tool call, length, refusal, filtered); text and tool calls; **usage** (§7); **served identity** (provider, host, model version, provider request id, fingerprint where given); rate-limit information (remaining, reset, retry-after) where given; error class (§8); the opaque continuation to return on the next turn. Never throws; a malformed answer is `silent` with detail, as today.
**BR3. Capability introspection.** The interface answers, per entry: tool calling and parallel calls; schema output and whether combinable with tools; image input; streaming and tool-call streaming; provider-held state; caching mode; batch; the effort set and default; context window and maximum output. The harness asks before assigning a role; an unsupported control is refused at the boundary by name (AIR5, AIR8).
**BR4. Conversation helper.** The existing multi-turn helper (`converse`) stays, built only on BR1/BR2: bounded turns and bytes, every tool call gets a result, endings `stopped`, `exhausted`, `answer`.
**BR5. Streaming.** Progress events (reading, composing, checking) reach the member as they happen without exposing unchecked answer text (K3602); an adapter without streaming falls back to turn-level progress and says so in its capability answer.
**BR6. Estimate and health.** `estimate(entry, task profile)` returns a range from the entry's measured cost of standard tasks; `health(account, entry)` returns the current state from the circuit breaker (§8).
**BR7. Record text only as data.** As today, record text appears only inside tool results, never in system or user text (injection defence), for every adapter.

## 4. Adapter requirements
**BR8.** An adapter maps neutral to provider and back and does nothing else: no provider-specific logic above it, no policy, no retries beyond the boundary's (§8), no retention, secrets used for the call and never kept.
**BR9. A generic OpenAI-compatible adapter** configured by a **host profile** (base URL, auth style, parameter and usage-field mappings, which features exist, known quirks such as returning reasoning content unchanged) serves every compatible host; a **custom-endpoint profile** serves local and private endpoints, usable only through the test flow until a release lists them (AIR12, Bob).
**BR10. Bespoke adapters** only where an API genuinely differs (expected: Google native, Cohere, a Responses-style API, and today's Anthropic paths); the existing Anthropic code is carried as adapters behind this interface (AIR23), not rewritten above it.
**BR11. An adapter test kit** that every adapter must pass against a fake provider: field mapping, error classification, null-not-zero usage, no secret in output or logs, refusal of unsupported controls, host-pin and served-identity checks, idempotent retry.
**BR12. Host pinning and served-identity check.** For aggregators and gateways the adapter sends the pin (only this provider, no fallbacks, collection denied, zero-retention routing where offered, required parameters) and verifies the served identity against the entry; a mismatch is refused and recorded (AIR18). Where a provider cannot report the serving host, the entry cannot pass the sub-processor point of Gate 0 (open item for OpenRouter).

## 5. Credentials
**BR13. Three credential means**, each with a resolver: **sealed** (held by Civicsmith, today's mechanism), **reference** (a pointer to a token kept in a password manager, secrets manager or other permitted store, resolved at call time and never stored by Civicsmith; only the reference is stored), **provider-issued** (a documented sign-in/connect flow returning a user-owned token). An entry states which means each plan allows (AIR32).
**BR14. Runtime constraints.** A plan states where requests may originate (a shared team Worker, a member-controlled runtime, a member's device) and where a token may live; the boundary refuses a call whose deployment cannot meet it (AIR37).
**BR15.** A resolved secret never appears in logs, records, bundles, health reports or error text; a reference resolving to nothing is the `auth revoked/removed` class (§8).
**BR16. No hidden precedence.** A call uses exactly the credential its account names; no ambient credential in the environment can override it (today's lesson: a stray API key silently outranking a subscription).

## 6. Accounts, cascade, order, consent
**BR17.** An account = (owner level and id, provider, plan, credential means, entry allow-list, limits, switches). The resolver returns the account for an act by project, else member, else team, as today.
**BR18. Ordered list [Bob: failover allowed].** An owner may declare an ordered list at their scope; the resolver walks it only when the current account is at a limit (Civicsmith-side or provider-side), unavailable (circuit open), or its entry is lapsed or retired or cannot serve the role. A hop requires: the next entry passed Gate 0 and Gate 1 for the run's mode; privacy tier not weaker; the same owner, or another owner's explicit standing consent; at a step boundary only.
**BR19.** Every hop is a recorded event (reason, from, to, payer change) shown to the member, who can decline to continue; the run record is the source of truth for continuation and provider-held state is not carried across.
**BR20. Refusal text names who can act** (raise a limit, add an account, change the order) in the words people read ("team", K3472); an exhausted list refuses, never loops.
**BR21. Narrowing only.** A lower level can remove entries from what a higher level allows, never add; keep-away limits are judged before the account is chosen and bind every account.

## 7. Usage, cost and limits
**BR22. A neutral usage record** per call: input, output, cached read, cached write, reasoning tokens, calls, cost as reported (with unit), cost as estimated from the catalogue price (with the price's date), and a flag for what the provider did not state (null, never zero). Plans reporting no money record tokens and calls and show "not measurable in money".
**BR23. Limits** keep today's shape (owner, scope, unit, period, inclusive) and add **recognition of provider-side limits** (spend cap hit, quota or rate limit, plan allowance window) as limits reached with the provider's reset time; Civicsmith-side limits are judged before the call, provider-side after, and both feed the same refusal.
**BR24. Thresholds and alerts** at owner-set levels; reconciliation of Civicsmith's totals with provider-reported usage where the provider offers it; the added cost of a switch (cold cache) is part of the estimate shown before the hop is offered.
**BR25. Efficiency levers are the adapter's to expose, the harness's to use:** append-only prompts and cache hints; session keys; batch for non-interactive work; priority tiers off by default.

## 8. Errors, retries, outages
**BR26. Error taxonomy** (identical for every adapter): rate limit; spend or quota cap; overload or 5xx; timeout; auth revoked or removed; model not found or retired; content refusal; malformed answer; privacy-pin violation; unsupported control. Each class has one defined handling:
| Class | Handling |
|---|---|
| rate limit | bounded retry honouring retry-after, then circuit counts it |
| spend or quota cap | limit reached (BR23), not an error; offer the next account if the owner declared one |
| overload, timeout | bounded retry with backoff, circuit breaker per (account, entry) with cooldown |
| auth revoked or removed | stop; tell the owner; run credentials revoked as today |
| model not found or retired | entry moves to lapsed; refuse; failover per BR18 |
| content refusal | returned as the model's refusal, never reworded (R43 today) |
| malformed answer | `silent` with detail, plane checks decide |
| privacy-pin violation | refuse and record |
**BR27. Interactive asks** fail fast with plain choices (wait, switch, continue without AI); **non-interactive runs** (standing, explore, extract) may pause and resume on recovery; **partial results survive** and a run resumes from its log; **retried turns cannot duplicate writes** (idempotency key plus the plane's existing dedup); never a silent degrade.
**BR28. Health state** per (account, entry) shown to members; uptime evidence from characterization sets defaults.

## 9. Provenance, labelling and evidence
**BR29. Machine output is always typed and labelled** (K1364 B3; Capability Ladders "Labelled drafts"): every result carries the producing AI's identity (provider, host, model version, effort, account level and owner) and is stored apart as a proposal until a member keeps it; a script or an AI never says or submits anything as the member; a draft is refused on any act a machine is refused. The label survives failover (each result names the AI that produced it) and is the same for every provider.
**BR30. Raw-exchange capture** is available only in the test container and the Civicsmith canary runs: request and response bodies, headers with provider request ids and rate-limit data, usage, timings; production runs record only what the run log records today. **Health reports** (opt-in) are content-free counts per entry.
**BR31. Evidence is first-class data**: each catalogue entry and plan carries grade, source, date and, for terms, version and effective date including future ones (AIR11, AIR39).
**BR32. The conformance suite runs through the same interface and adapters** as production use, against a stub plane with a synthetic case; scoring uses the plane's own checks; the suite version and the pack version are recorded in every result.

## 10. Packaging options for BOB (the lane proposes; BOB decides)
- **Option 1 (recommended): evolve existing modules, add two.** `agent-model` becomes the provider interface plus adapters (its Anthropic paths become adapters); `ai-accounts` gains plan, credential-means, order and consent; `ai-use` gains the neutral usage record and provider-side limits; **new `ai-catalogue`** (data, signed channel, advisories, lifecycle) and **new `ai-gate`** (suite, canaries, bundle, central results). Keeps the module count low and the harness untouched.
- **Option 2: a new `ai-provider` layer** holding interface, adapters and resolvers, with `agent-model` retired; cleaner names, more migration.
- **Option 3: split adapters into separately versioned units** so a new API family can ship without a full release; adds release complexity; worth it only if bespoke adapters are expected to arrive often.
The existing size limit on `agent-worker` (4,077 lines, N1205) argues against putting adapters there.

## 11. Boundary tests required
A fake provider and fault-injection suite exercising every class in BR26; the adapter test kit (BR11); a pinned-host mismatch test; a no-secret-in-output scan across logs, records, bundles and health reports; a run resumed on a different adapter yielding an identical record; failover refused to a weaker tier and to another owner without consent; null-not-zero usage; effort and capability refusals; labels naming the producing AI after a switch.

## 12. Questions for BOB / Bob
1. Packaging: Option 1, 2 or 3 (§10)? Recommended Option 1.
2. Consent for cross-owner failover (BR18): a standing opt-in by the other owner, or never? Recommended: standing opt-in only, off by default.
3. Streaming (BR5): is "progress without unchecked text" satisfied by turn-level progress for adapters without streaming? Recommended: yes, stated in the capability answer.
4. Provider-side health reports (BR30): opt-in per team, content-free; confirm this is acceptable as a drift signal. Recommended: yes.
