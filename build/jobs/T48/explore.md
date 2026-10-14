# explore (T48)

**Status** · session_014rGkXcRSMxdpN4dTqo3FKh · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R22's test and control read as contradictory if "three-hop chain" means four nodes A–B–C–D: walked to depth 3, D is reached at depth 3 and not expanded, so by R22's own rule ("whenever a path reached `depth`") the answer is `depth_stopped: true` naming D, not `false`. Making it `false` would need the walk to ask D's owners for hops it then does not walk, which R22 forbids ("it was not asked").

My best reading, which I am building on: `depth_stopped` is true exactly when the walk's last level is `depth` and holds at least one node (those nodes, unexpanded, are `at_depth`); no owner is asked about a node at `depth`. The test's chain is three nodes (two hops, "the second node" counted from the start's neighbour): walked to depth 2 it answers `true` naming the far node (`at_depth`); walked to depth 3 it answers `false`, because no node lies at depth 3. If you mean instead that a node at `depth` is probed (one owner read, items not walked) so a dead end answers `false`, say so and I will add it.

Two small readings I am also taking, no answer needed unless you disagree: R21's `id_kind` is the id's prefix as `record-grammar`'s grammar reads it (`ENT`, `EVT`, …), taken through `connection-grammar.isRecordId` since explore has no `record-grammar` edge; and R24's substitution is done whenever a declared hop is walked and `step_source` is registered, reading `step_source` at that node even when the asked kinds do not name it (otherwise `chain` and kind-limited walks would still show a sourced declared hop as a lead).

## J2 · REPORT

For `connections` (T48-20), against its R69 and `connection-grammar` R1/R19: R69 gives a `step_source` hop `evidence: [{capture_sha, extent, basis, relation}]`. `connection-grammar`'s shape check (shape.mjs:112, R1 "an evidence entry ... names its cited source") requires every evidence entry to carry a non-empty `source`, and the registry's `neighbours` refuses a nonconforming answer whole (`OWNER_NONCONFORMING`, R19). As R69 is worded, every `connections` answer holding a `step_source` hop would be refused, so explore would never see one and R24 could not hold, and `ownerConformance` (R69's own last clause) would fail.

Suggested fix, in R69's text and connections' job: each evidence entry also names `source` (the cited capture's bundle id or the capture citation `connections` already gives its evidentiary hops), keeping `relation` there. explore reads only `evidence[0].relation`; my fixture's `step_source` hop carries `{source, capture_sha, extent, basis, relation}`, and explore's R24 tests pass against it. Nothing in explore depends on which value `source` takes.
