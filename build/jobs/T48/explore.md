# explore (T48)

**Status** · session_014rGkXcRSMxdpN4dTqo3FKh · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R22's test and control read as contradictory if "three-hop chain" means four nodes A–B–C–D: walked to depth 3, D is reached at depth 3 and not expanded, so by R22's own rule ("whenever a path reached `depth`") the answer is `depth_stopped: true` naming D, not `false`. Making it `false` would need the walk to ask D's owners for hops it then does not walk, which R22 forbids ("it was not asked").

My best reading, which I am building on: `depth_stopped` is true exactly when the walk's last level is `depth` and holds at least one node (those nodes, unexpanded, are `at_depth`); no owner is asked about a node at `depth`. The test's chain is three nodes (two hops, "the second node" counted from the start's neighbour): walked to depth 2 it answers `true` naming the far node (`at_depth`); walked to depth 3 it answers `false`, because no node lies at depth 3. If you mean instead that a node at `depth` is probed (one owner read, items not walked) so a dead end answers `false`, say so and I will add it.

Two small readings I am also taking, no answer needed unless you disagree: R21's `id_kind` is the id's prefix as `record-grammar`'s grammar reads it (`ENT`, `EVT`, …), taken through `connection-grammar.isRecordId` since explore has no `record-grammar` edge; and R24's substitution is done whenever a declared hop is walked and `step_source` is registered, reading `step_source` at that node even when the asked kinds do not name it (otherwise `chain` and kind-limited walks would still show a sourced declared hop as a lead).

## J2 · REPORT

For `connections` (T48-20), against its R69 and `connection-grammar` R1/R19: R69 gives a `step_source` hop `evidence: [{capture_sha, extent, basis, relation}]`. `connection-grammar`'s shape check (shape.mjs:112, R1 "an evidence entry ... names its cited source") requires every evidence entry to carry a non-empty `source`, and the registry's `neighbours` refuses a nonconforming answer whole (`OWNER_NONCONFORMING`, R19). As R69 is worded, every `connections` answer holding a `step_source` hop would be refused, so explore would never see one and R24 could not hold, and `ownerConformance` (R69's own last clause) would fail.

Suggested fix, in R69's text and connections' job: each evidence entry also names `source` (the cited capture's bundle id or the capture citation `connections` already gives its evidentiary hops), keeping `relation` there. explore reads only `evidence[0].relation`; my fixture's `step_source` hop carries `{source, capture_sha, extent, basis, relation}`, and explore's R24 tests pass against it. Nothing in explore depends on which value `source` takes.

## J3 · COMPLETE

**Entries applied.** T48-24 (N1027; DEC-215 (2), K3138; N1030, K3145, K1487 (3); K3243):
- **R21** `neighbourhood({centre, at, rings?, kinds?, scope?, viewer})`, new `src/explore/graph.mjs`: R2's one walk (`traverse`, shared with `explore` and the presets) to depth `rings` (1 or 2, default 2), reshaped as `nodes` `{id, ring, id_kind}` (id_kind the id's prefix through `connection-grammar.isRecordId`, K3243), `steps` once each `{id, from, to, kind, word, class, grade, evidence, valid, label?, undetermined?}` (plus `derived` for a derived step and `backs` for R24), and `stopped` (`ring`, `hub` with kind, bound and set size, `fanout`, `nodes`, `time`) with the sentence; R1's refusals with `centre` named, then `BAD_RINGS`.
- **R22** every walk (`explore`, `chain`, `flowsFrom`, `relationsOf`, `pathBetween`, R21) answers `depth_stopped`, and when true `at_depth` (≤ 500, `at_depth_truncated` past that, in path order) and `depth_sentence`; no owner is asked about a node at the depth (K3243's reading).
- **R23** `rederive({chain, scope?, viewer})`: `BAD_CHAIN`, `CHAIN_BROKEN` (naming the step), each derived step answered exactly as the single call (R12, R19, scope passed), each other step `{rederived: false, class}`, `lead`, `matches` and `undetermined`; without `chain` the answer is unchanged.
- **R24** a declared step backed by a `step_source` hop the viewer may see is walked as that hop, carrying `backs`, read at the node even when the asked kinds omit it (K3243); otherwise the declared step stands (R6).
- **R14** `exploreOps` gains `exploregraph`; `exploreverify` reads `chain` from the body.

**Read whole (P20):** my requirements, every file of `src/explore/` and `test/m/explore/`, `connection-grammar`'s public part, the plan entry and BOB's START. Reading set as BOB measured, 251 KB, read whole. **Flaws found and dealt with in my code:** the walk's level loop is now one `traverse` reused by R21 (no second walker, R15); the exhaustion stop now records the node it stopped at (for R21's `stopped`). Nothing deferred.

**Found in other modules:**
- `connections` R69 (J2): `step_source` evidence entries carry no `source`, so `connection-grammar`'s shape check refuses the whole answer; explore's fixture adds `source`.
- **Reds my new op opens, until L11 declares and grades `exploregraph`** (the requirement's Suggestions: `op-declarations` declares it, `control-plane` routes it): `affordances` `test/m/affordances/t33.test.mjs`:151 (R12, explore's op map holds exactly its graded ops) and `control-plane` `test/m/control-plane/r53-routes.test.mjs`:70 (R53, every served op has a spec and an `OP_STAMPS` entry). Both pass on `tranche/T48` without this change. `affordances` `t36.test.mjs` fails 2 both before and after (not mine).

**Tests and checks run:**
- `node --test test/m/explore/`: tests 47, pass 47, fail 0. M-X1a (R20, desk): through `events`' owner, 4,000 votes 1,688 ms of 10,000, 4,001 votes 663 ms (hub named); fixture chain 290 ms (K1726: 266–283 ms).
- users: `test/m/hypotheses/` pass 51, fail 0; affordances t33/t36/t41 and control-plane owner-ops/r53-routes as above.
- `checks/format.mjs`: 0 failures; `architecture.mjs bio explore`: 0 failures; `coverage.mjs bio explore`: 24 of 24 live ids named, 0 failures; `ownership.mjs bio explore tranche/T48`: 10 files, 0 failures; `checks/run.mjs bio`: format 0, architecture 0, coverage 45 failures (other modules' not-yet-met ids, rule 5 (1); none explore's), channels 0.

Size (session_014rGkXcRSMxdpN4dTqo3FKh): test runs 12, module lines 1012
