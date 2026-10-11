# escalation (T45)

**Status** · session_01HztAVfrFX3rGVayQh2NyNt · depth 2 · WORKING · handled B1

## J1 · QUESTION

R31's state `stopped_pursuing` is not a state of the `escalation` type in `record-grammar` R35 (`STATES.escalation`: legal `open suspended ended`; edges open→suspended ended, suspended→open ended). An escalation is a promoted document (R21) and promotion R15 refuses a `current_state` outside the catalogue's table, and promotion's history check (C-4.2) marks an undeclared edge an error; escalation's own R21 test asserts `STATES.escalation.legal` too. So R31 cannot land as written without a `record-grammar` change, and no T45 entry gives one (K2780 amended State Rules §4.4; `affordances` R?'s vocabulary list already names "escalation states with `stopped_pursuing`").

My best reading, which I am building on now: `record-grammar` R35 gains `stopped_pursuing` for `escalation`: legal `open suspended ended stopped_pursuing`; edges open→suspended ended stopped_pursuing; suspended→open ended stopped_pursuing; stopped_pursuing→open; ended none. Until that lands my R31 test (the stop written as the document's `current_state`) is red, as an inherited red named to `record-grammar`'s change. Options for you: (a) a small `record-grammar` job/addition in T45 (or BOB's own act on that table) with the edges above — my recommendation; (b) R31 amended so the document stays `open`/`suspended` and `stopped_pursuing` lives only in escalation's own row and log (I would not recommend: the record's state would disagree with the module's). Which one?
