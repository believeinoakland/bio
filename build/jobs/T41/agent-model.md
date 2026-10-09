# agent-model (T41)

**Status** · session_01NsCtCCGmUZaz2mWuWvuQc4 · depth 2 · WORKING · handled B2

## J1 · QUESTION

R13's `null` figure "priced at the model's highest rate, never as zero" (K2376) names a rate but no count: a `null` figure is a count the provider did not state. My best reading, built meanwhile:

1. **The count is bounded by the request.** On the `apikey` path this module holds the request it sent. The input-side figures together (`input_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`) are at most the request's UTF-8 byte length, since a token covers at least one byte. `output_tokens` is at most the request's `max_tokens`. If any input-side figure is `null`, the unknown remainder (the byte length less the input-side figures that were stated, never below 0) is priced at the model's highest rate. A `null` `output_tokens` is priced as `max_tokens` at that rate. The "highest rate" is the largest of the model's four rates (today the output rate). The result is an over-estimate, never zero.
2. **This covers an outcome with no `usage` stated.** Examples are a non-200 response or a body that is not JSON. The estimate is then the whole bound at the highest rate (about $0.40 for one 16,000-`max_tokens` request on `claude-opus-5`), because R13 says "every outcome's `usage`". Outcomes that never reached the provider carry no `usage`, as R5 says.
3. **A model `MODEL_PRICES` does not hold.** `modelCall`'s caller names the model in its body. If that model is not priced, every figure, stated or bounded, is priced at the highest rate in the whole table: never zero, never refused.
4. **`estimated_cost_usd` sits beside R5's five figures and is not one of them.** `USAGE_FIGURES` stays five. `converse` sums it over turns as R6 sums the others.
5. **`MODEL_PRICES` holds the 5-minute cache-write rate,** since R4's marks are `ephemeral` with the default TTL. The source is Anthropic's published rates as of 2026-10-06: `claude-opus-5` $5 input, $25 output, $0.50 cache read, $6.25 cache write per million tokens. The table also cites that source.

If you mean something else, for example a `null` figure leaving `estimated_cost_usd` `null`, or failed requests costing 0, say so and I'll change it.
