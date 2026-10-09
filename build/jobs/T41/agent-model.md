# agent-model (T41)

**Status** · session_01NsCtCCGmUZaz2mWuWvuQc4 · depth 2 · WORKING · handled B2

## Completion

**Entry applied:** T41-30 (was T40-10; K2373, K2376): Purpose, R11, R13. Readings confirmed by BOB in B2 (K2479).
- **Purpose.** A turn reaches the provider the reference's `kind` names: Anthropic's Claude only today, with no `provider` field (B1). That holds at every level: a member's own key, a project's, or the group's. The reference arrives per call and is never kept (R8, unchanged). The refusal message now names a project's key too.
- **R11.** `LEVELS` gains `project`. A `project` or `group` reference is taken only with `kind` `apikey` and is sent exactly as a member's. Any other level, or a project or group reference of another kind, gets `ACCOUNT_REFERENCE_UNUSABLE` and no call is made.
- **R13.** `MODEL_PRICES` sits in `model.mjs` beside `MODEL_FOR_MODE`, frozen. It prices `claude-opus-5` at $5 input, $25 output, $0.50 cache read and $6.25 five-minute cache write per million tokens. `MODEL_PRICES_SOURCE` cites Anthropic's first-party rates as published 2026-10-06.
  - `estimateCost` adds `estimated_cost_usd` to every `apikey` outcome's `usage`, from `modelCall` and from each turn of `converse`.
  - A `null` figure gets a bound from the request sent, priced at the model's highest rate (B2's readings 1–3). The input side's unstated remainder is bounded by the request's UTF-8 bytes, `output_tokens` by its `max_tokens`.
  - A model the table does not hold is priced at the table's highest rate.
  - `usageOf` never takes an estimate the provider or runner states, so the estimate is always `null` on the `signin` path.
  - `sumUsage` sums the estimate with `null` kept.
  - `USAGE_FIGURES` stays R5's five, with `ESTIMATE` exported beside it.

**Reading set (§17, K2304).** I measured the set myself: the requirements (~12 KB), the code and tests (102 KB) and layer 6's row. `uses` is empty. About 115 KB, under 300 KB, and I read all of it whole myself with no workers. I also read K2373, K2376, K2448 and `draft-T40-N812.md` §0 and B4. The prices came from the Claude API reference.

**Deferred:** none.

**Found in another module (REPORT J2):**
- `agent-worker` (T41-31, next in L6's merge order). Its committed bundle `agent-worker/dist/agent-worker.bundled.mjs` inlines `agent-model/src/model.mjs` and `outcome.mjs`, so this change stales it: `requirements.test.mjs` R45, static and fresh checks. That is agent-worker's generated artifact (§14), so I did not regenerate it.
- `agent-worker/test/ask.test.mjs`'s "R54 (N588)" expects `usage` to hold exactly the five R5 figures. R13 adds `estimated_cost_usd`, so that assertion fails once agent-model merges.
- Every other agent-worker test passes with this change.

**Tests and checks** (all run from the job branch):
- `node --test agent-model/test/`: 18 tests, 18 pass, 0 fail. New tests: Purpose; R11 rewritten for `project`; four R13 tests, each with a negative control (K874). The R5, R6 and R7 usage comparisons now compare the five figures with the estimate beside them.
- Mutation checks: pricing a `null` figure as zero fails R13; dropping `project` from `LEVELS` fails Purpose and R11. Both restored.
- `node --test agent-worker/test/` (the user's tests): 10 of 12 files pass. The two that fail (`ask.test.mjs`, `requirements.test.mjs`) fail only for the two causes reported above; all 12 pass before this change.
- `format`: 145 modules, 144 requirements files, 0 failures. `architecture`: 0 failures. `coverage`: 13 of 13 live requirement ids named by a test, 0 failures. `ownership` (tranche/T41): 0 failures.

Size (session_01NsCtCCGmUZaz2mWuWvuQc4): test runs 9, module lines 833

## J1 · QUESTION

R13's `null` figure "priced at the model's highest rate, never as zero" (K2376) names a rate but no count: a `null` figure is a count the provider did not state. My best reading, built meanwhile:

1. **The count is bounded by the request.** On the `apikey` path this module holds the request it sent. The input-side figures together (`input_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`) are at most the request's UTF-8 byte length, since a token covers at least one byte. `output_tokens` is at most the request's `max_tokens`. If any input-side figure is `null`, the unknown remainder (the byte length less the input-side figures that were stated, never below 0) is priced at the model's highest rate. A `null` `output_tokens` is priced as `max_tokens` at that rate. The "highest rate" is the largest of the model's four rates (today the output rate). The result is an over-estimate, never zero.
2. **This covers an outcome with no `usage` stated.** Examples are a non-200 response or a body that is not JSON. The estimate is then the whole bound at the highest rate (about $0.40 for one 16,000-`max_tokens` request on `claude-opus-5`), because R13 says "every outcome's `usage`". Outcomes that never reached the provider carry no `usage`, as R5 says.
3. **A model `MODEL_PRICES` does not hold.** `modelCall`'s caller names the model in its body. If that model is not priced, every figure, stated or bounded, is priced at the highest rate in the whole table: never zero, never refused.
4. **`estimated_cost_usd` sits beside R5's five figures and is not one of them.** `USAGE_FIGURES` stays five. `converse` sums it over turns as R6 sums the others.
5. **`MODEL_PRICES` holds the 5-minute cache-write rate,** since R4's marks are `ephemeral` with the default TTL. The source is Anthropic's published rates as of 2026-10-06: `claude-opus-5` $5 input, $25 output, $0.50 cache read, $6.25 cache write per million tokens. The table also cites that source.

If you mean something else, for example a `null` figure leaving `estimated_cost_usd` `null`, or failed requests costing 0, say so and I'll change it.

## J2 · REPORT

Two findings in agent-worker (T41-31), caused by this job's R13 change and left for its own job:

1. **A stale bundle.** agent-worker's generated bundle `agent-worker/dist/agent-worker.bundled.mjs` inlines `agent-model/src/model.mjs` and `outcome.mjs`, so R13 stales it. agent-worker's `requirements.test.mjs` R45 (static and fresh checks) fails until the bundle is regenerated with `node bio-plane/scripts/bundles.mjs`. It is agent-worker's artifact (§14), so I did not regenerate it.
2. **A five-figure assertion.** `agent-worker/test/ask.test.mjs` "R54 (N588)" expects `usage` to hold exactly the five R5 figures. R13 adds `estimated_cost_usd` beside them on both paths (a number on `apikey`, `null` on `signin`), so the assertion fails once agent-model merges.

Every other agent-worker test passes with this change, and all pass on the tranche without it.
