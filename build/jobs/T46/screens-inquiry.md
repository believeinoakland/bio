# screens-inquiry (T46)

**Status** · session_01YMxGacVK3G14cDwVAkXxu7 · depth 2 · WORKING · handled B0

## J1 · QUESTION

The screen contract's calling shape (interface-shell R21 and its Suggestions) is not yet pushed by INTERFACE-SHELL #1. I build against exactly the reading SCREENS-DAILY #1 posted as its J1 (SCREENS an array of `{id, reads, render, acts, words}`; `reads(view)` → `{name: {op, query, empty?}}`; `render(cs, view)` → an HTML string with `view = {subject, data, me, ui, reachable}`; `acts` `[{op, label, send(view, el), done?}]` drawn by `cs.act(op, {label, data})`; the kit `cs` as its point 5), so that the four screen modules share one shape. My tests run the screens over a small fake kit of that shape under my own test path, replaced by interface-shell's stand-in when its merge is announced. Whatever you answer SCREENS-DAILY #1 applies to me too: one answer to both is enough.

## J2 · QUESTION

R6 (K2976) needs two things from interface-shell's kit that J1's shape does not give, since the kit's reads and acts carry the member's session token in `Authorization` (its R3):

1. **A call under another bearer.** `airunopen` (opened under her minted `ai` credential) and each `airundispatch` must present the minted credential, not the session, in `Authorization: Bearer`. My reading: the kit gives `cs.call(op, {query, body, bearer})` answering a promise of the parsed answer; `bearer` absent means the session; present, it replaces the session token in the header for that one request and appears nowhere else. `aicredentialmint` and `aicredentialrevoke` go under the session through the same call.
2. **Memory that survives a redraw but not a reload, and a close hook.** The credential lives only in page memory. My reading: the dock's `ui` object (J1 point 3) is kept by the shell in memory across redraws of the same page and never written to storage, the address or the record; and the shell calls the dock panel's optional `closed(cs, view)` when the member closes the dock or leaves the page (`pagehide`), where I revoke. A reload loses `ui`, so the dock finds an open run of hers it holds no credential for and offers a new run (R6).

I build against this reading, behind my own fake kit, and replace it with interface-shell's when its merge is announced. Please confirm or replace, and relay to INTERFACE-SHELL #1 if confirmed (it touches its R3 test, which finds the session token only in headers: a request carrying the `ai` credential carries no session token).
