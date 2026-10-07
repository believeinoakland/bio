# store-door (T35)

**Status** · session_01MXpTEk4ANkFVxAzUYMNVuY · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings I am building on; nothing stops while you answer.

1. **R9's header (F1).** `control-plane` R59 says the grant reaches the store "in the request's body or a header" but names neither. The store's internal request is built fresh by the Worker (no caller header reaches it), and a body field would mix with the route's own arguments (R11 logs the body as `args`). My reading: the door reads an ask's grant only from the header `x-bio-grant` (exported as `GRANT_HEADER` from `store-door/dispatch.mjs`), for every read under a grant (R11) and for `askcheck`; never from the query, never from the body. `control-plane` (T35-72) sets that header where `index.mjs`:1089 sets `?grant=` today. The door reads no session itself (the `session` stamps read by `credentials`' `signout` routes and `capture`'s are those modules' maps, not this door's). If you want `Authorization: Bearer` instead, it is a one-line change.
2. **`DISPATCH_CHECKS`.** I import it from `../answer-envelope/checks.mjs`, assuming T35-80 copies `checks.mjs` whole under that name (the split plan's C-1 row). If ANSWER-ENVELOPE names it otherwise, I re-point after its merge.
3. **The step's name (R5).** `plane/store.mjs`:94 `STEP = "control-plane"`; `STEP_ORDER` filters the name out of `MODULE_ORDER` and inserts it before the first layer-11 module, so `plane` can register under `"store-door"` by changing that one constant, rank unchanged. My tests register it under `"store-door"` at that rank. Whether plane renames it is T35-73's (reported in my record).
