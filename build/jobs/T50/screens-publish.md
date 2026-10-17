# screens-publish (T50)

**Status** · session_012WaKzFosNcsr8EvNnZ3p4h · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; tell me if any is wrong (J1 — QUESTION).

1. R27, the zone at the first share. `review` R35 puts `zone` on each roster row (member door) and on the recipient's own grant; a draft with no grant yet has no row, so the member's first share has no zone to read. My reading: `reviewgrant` takes the zone from the copy answer (a top-level `zone` if `review` adds one, else any roster row's), and only when neither exists (no row yet) falls back to the `publishpreflight` zone as today, so the first share is not refused for good. With a zone of `null` on a row, or none anywhere, the share is refused with `screen.review-copy.until.nozone` / `.member` in the fold. Better: `review` R35 also answers `zone` at the member copy's top level — a REPORT to you for that module.
2. R35, "Draft the account with the assistant" (`accountpropose`). The op stores a draft and needs a `run` and a non-blank `text` (case-account R1); the screen can supply neither, since the text is the assistant's. My reading: the act sends `{kind: "case_account", framing}` for the case, drawn only when the assistant may run, and every refusal (`BAD_ACCOUNT_DRAFT`, `BAD_ACCOUNT_FRAMING`, `NO_SUCH_ACCOUNT_DRAFT`) is drawn by its key; the draft's text reaches the screen through `accountdrafts` once the assistant has produced it (the remote proof, unbuilt: K3717).
3. R30, the confirmation's explanation. The kit's `cs.act` has no way to name an act's in-place explanation (`act.publish.here.ceremony` in place of `act.publish.does`); nothing in interface-shell R73–R88 adds one. I will swap the two keys' words inside the button's explanation from the screen (a part helper), so the explanation equals the key's word today; if interface-shell later adds an option, the helper becomes a one-line call.
