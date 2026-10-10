# actions (T41)

**Status** · session_01To13zdek2Zn7rXSM6hPTP7 · depth 2 · WORKING · handled B0

## J1 · QUESTION

R70/R71 against action-grammar R13 (T41-46a, not yet merged): R13 leaves two things to its job that my write must match: (1) the shape of `facts` that `seeksFindings(fm, facts, findings)` takes, and (2) the code of its row. My best reading, which I build on until your CHANGE brings the merged grammar: `facts` is what I read per distinct progression key through `progressions.readProgression({progressionKey})` — for each key `{found, stages: [stage_key…]}` (a key not held reads `found: false`, which is R70's "a progression it does not hold" finding); and I refuse with the first error finding's own `code`/`check` (whatever R13's row names it), carrying all findings, before any write. R52–R60 and the t34 re-point go ahead now; R70/R71 are wired when the CHANGE lands. If action-grammar's job settles a different `facts` shape, the CHANGE saying so is all I need.
