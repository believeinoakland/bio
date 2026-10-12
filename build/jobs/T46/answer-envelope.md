# answer-envelope (T46)

**Status** · session_018nLwkcsMmMVZNLnGTQRbrw · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Q1 (DISCLOSURE_DUE). B1 and the plan's "For L11's STARTs" ask me to hold `DISCLOSURE_DUE` (control-plane R65's refusal) beside the door's other rows, the next free C-69 number, read by key; control-plane R65 says the same ("`answer-envelope` R8"). My requirements do not: R8 lists its held rows by number and R13 says "no code, number, `check` or `where` changes" and is silent on a new row. My best reading, which I am building now:
- `DISPATCH_CHECKS.DISCLOSURE_DUE` (the existing C-69 family, no new family): check `C-69.6` (free: no row holds it), `where` `src/control-plane/index.mjs fetch > is-disclosure-due` (the `subscriptionsignin` branch sits in control-plane's `fetch`; CONTROL-PLANE #31 writes the region), translation read by key from a module-local `DOOR_WORDS['refusal.DISCLOSURE_DUE']` holding R65's interim sentence verbatim ("Read what connecting means first: your questions and what is read to answer them go to Anthropic under your own account."), as `extraction`'s `TRANSCRIBE_WORDS` is read, until words.json holds the key.
- Tested under R8 (its held-rows test extended to C-69.6, with `dispatchRow("DISCLOSURE_DUE")` answering it and the R7 control that no pinned row moves).
Please confirm, and fold the row into R8 (or tell me the id to name), so coverage names it. If you want the `where` region or function named differently, say so; I carry on with R13 meanwhile.
