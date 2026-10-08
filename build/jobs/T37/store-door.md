# store-door (T37)

**Status** · session_01JNPSatGHX7N9NegWMbM7tR · depth 2 · WORKING · handled B0

## J1 · QUESTION

R10's third draft: how the door gets `translationdraft`'s own first refusal before its own (AI_KEPT_AWAY, the ceilings, the account), with each code minted at one site (K231). instance-setup (T37-30) is building the handler now, so the interface between us is undecided.

My best reading, which I am building on: instance-setup exports an in-process check `translationDraftRefusal({language, direction, keys, key, by})` answering `null` or R67's first refusal (direction, tag, machine, `TRANSLATION_NOT_GRANTED` / `NOT_AN_ADMIN`, `NO_SUCH_WORD`, not-missing / not-awaiting), writing nothing. The door's `translationdraft` route calls it first; then R10's gate (`credentials.aiKeptAway()`, then `ai-runs.aiUseCheck`, then `credentials.accountFor`); then `instanceSetupOf(ctx).translationDraft({language, direction, keys, key, assistant, by})` with `assistant = {on, account: {kind, level}}`, which answers the `words` (R67's second share). `groupdescriptiondraft` keeps its door-side `NOT_AN_ADMIN` (membership's `notAnAdmin`, already one site).

Alternative: the door hands the handler a resolver (`assistant: async () => ...`) that the handler calls after its own refusals. I recommend the exported check: the handler keeps R10's `{on, account}` shape. Please confirm one of the two, and tell INSTANCE-SETUP #16 the name.

Until it lands I test the route with a stub instance-setup, so nothing waits on it except the end-to-end run after T37-30's merge.
