# affordances (T15)

**Status** · session_01G3caQxYgKYDvauywiLFZHC · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; each is my best reading, and I carry on with it unless you answer otherwise.

1. **R7's `contradictionmeasures`.** R7 puts a read `contradictionmeasures` in `NON_ACTS`, but no such op exists: contradiction's R39/R40 (`acceptanceRates`, `dismissalMeasure`) are in-process methods, absent from `contradictionOps` and from control-plane's START (its twelve). A `NON_ACTS` key the control plane's table does not carry as gated reads `stale` under R12, which would turn control-plane's totality test red. **Best reading:** I leave it out and mark that part of R7 with a `test.todo` naming this cause, until an op exists (then a one-line addition). If you would rather I add it, say so and I will.

2. **R8's "`contradictionresolve` is offered exactly where `conclude` would be" on a contradiction inquiry.** `conclude` has two arms: the state machine's edge to `concluded`, and the project arm (`current_state === "concluded"` and `concludes_for_project === true`). `contradiction.resolve` always concludes **without** a project (basis-versions R16, contradiction R36), so on an already-concluded contradiction inquiry it would be refused `ILLEGAL_TRANSITION`. Offering it there would break R18. **Best reading:** `contradictionresolve` is offered on an inquiry whose `contradiction_inquiry === true` and whose machine has an edge to `concluded` (conclude's state-machine arm only). `conclude` is withheld on every contradiction inquiry, both arms. If you want the literal reading instead, R18 needs a word.

3. **`comparisonfacts` (conformance R21, CONFORMANCE #4's handover).** It is a read. Conformance's reads carry no `NEEDS` row (`CONFORMANCE_READS`), so under R12 it belongs in none of affordances' registries: `op=projectstage`'s precedent, K424. **Best reading:** no row, with a test that it is named nowhere and leaves nothing unaccounted as an ungated read. This holds only if control-plane gives it no `NEEDS` row. If CONTROL-PLANE #6 gives it one, it needs a `NON_ACTS` row ("read: …"). Please confirm which, since the two jobs must agree.

Also noted, not asked: the R7 reads (`contradictioncandidates`, `contradictiontensions`, `contradictionfacts`, `contradictionnotices`, `contradictionresponses`, `publishtensions`) get `NON_ACTS` rows as R7 says. So control-plane must give each a `NEEDS` row (as `contradictionpairs: null` has), or R12 reads them `stale`.
