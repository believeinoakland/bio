# explore — requirements

**Status** · In force: a new product module, reviewed (K1505; T33-37; banner cleared K1583); its meaning the canon ladders' and Bob's rulings (K1442, K1469–K1471, K1473, K1486, K1487). Last changed T36 (T36-42: Terms' bounds and R5 amended, R20 new, hubs judged per kind; K1566, K1726, K2063, K2092); R5, R20 marked not yet met (T36), every other requirement met (K1795).

**Size (P6).** New. Expected 1,200–1,800 lines. M-X1a (the synthetic chain at real volumes) runs inside the job; M-X1b (real data) only tunes the budget constant after the release.

## Public

### Purpose

The one read across every owner of a relationship (K1469): a bounded, as-of exploration from a node over the owners registered with `connection-grammar`, each hop cited and graded in the one connection shape, the weakest hop governing, with presets (organisation chains, flows, event links, overlaps between people, the path between two nodes) as kind sets. It writes nothing, asserts no connection, ranks nothing and logs no one's exploring.

### Provides

Terms. A **hop** is one connection in `connection-grammar`'s shape `{id, from, to, kind, owner, valid, evidence, grade: {assertion, ends}, derived}`, as its owner's `neighbours` answers it. A **path** is a sequence of hops; its **grade** is its weakest hop's. A **class** is the kind's registry class: evidentiary, derived, declared or hunch. The **bounds** are `connection-grammar`'s: depth 8 by default and at most 10; a fan-out of 1,000 items per page of an owner's answer; a hub bound per kind (`connection-grammar.hubBoundOf(kind)`: 4,000 for `event_voted`, 1,000 for every other kind; its R10); 5,000 visited nodes; a time budget. A **viewer** is the control plane's stamp; it fails closed when absent. A **scope** is an optional `{inquiry}`: the working inquiry whose hunch hops may be walked. *(not yet met: T36)*

**explore({from, to?, kinds?, at, depth?, sortBy?, scope?, viewer})** (`op=explore`)
- **R1** Refusals, in order: `NO_NODE` (no `from`), `BAD_NODE` (`from` or `to` not an id `record-grammar` knows), `NO_DATE` (no `at`; an exploration is always as of a stated date and never of "now"), `BAD_DATE` (`civil-time`'s refusal), `UNKNOWN_KIND` (a kind no owner registered, naming it), `DEPTH_OVER_MAX` (above 10, `connection-grammar.depthOf`), `UNKNOWN_QUANTITY` (a `sortBy` no kind in the walk states).
- **R2** It walks breadth-first from `from` over every owner registered for the asked kinds (all registered kinds when `kinds` is absent), calling each owner's `neighbours({node, kinds, at, page, viewer, scope})` with at most 100 nodes per call. Without `to` it answers every path found up to `depth`; with `to`, only the paths that end at `to`.
- **R3** Each path is answered with its hops in order, each hop as its owner answered it, and with the path's grade, the weakest hop's on each axis (`connection-grammar.chainGrade`). Paths are ordered by `connection-grammar.orderPaths`: hop count, then the earliest validity, then the hops' ids; with `sortBy`, by that stated quantity, the quantity named in the answer. No score, rank or measure across mixed kinds of link is computed or answered (K1471).
- **R4** Only hops valid at `at` (`civil-time.validAt`) are walked. A hop whose validity does not settle `at` is walked and marked `undetermined` at that date, and a path through it is `undetermined`, never shown as holding.
- **R5** Bounds: an owner's answer for a node is read page by page (`next`) to its end, so a kind's set within that kind's hub bound (`connection-grammar.hubBoundOf`) is walked whole, never cut at one page's fan-out. Items of one kind that an owner pages beyond that kind's bound are not walked, and `fanout_truncated` names the node and the kind. A node its owner answers as a hub (`connection-grammar`'s `neighbours` contract, R6 there) is named in `hubs` as "too common to walk", with the kind (R20), that kind's bound, its set size and why, and is not expanded for that kind. When 5,000 nodes are visited or the time budget runs out, the walk stops and answers `connection-grammar.exhausted` (`truncated: true`, `undetermined: true`, the reason), with the paths complete so far marked complete and none partial shown as complete. The answer always states `visited`, `depth`, `budget_ms` and `elapsed_ms`. (N566; K1566, K2063) *(not yet met: T36)*
- **R6** Labels (K1487): a hop of class `declared` is marked "declared, not evidenced" at the lowest grade; a hop of class `hunch` is walked only when `scope` names the inquiry holding it and the viewer may see that inquiry, and is marked a hunch with no grade; any path with either hop is labelled a lead (`connection-grammar.chainLabel`), with the sentence that no finding rests on it until each such hop is replaced by evidence. A derived hop carries its derivation.
- **R7** Sight: a hop the owner withholds from the viewer is not walked, and nothing in the answer counts or reveals it, `visited` included.
- **R8** An answer with no path states its level in `observation-log`'s vocabulary (the record's held facts searched as of `at`, and to what depth) and lists what each owner reports as "held as a table, not read" for the nodes visited, so an absence is never stated beyond the record's reach (D59).
- **R9** It writes nothing: no table of any module, `observation-log` included, gains or changes a row through an exploration, and nothing records who explored what (D68).

**Presets: presets(), chain({from, at, viewer}), flowsFrom({from, at, period?, viewer}), relationsOf({event, at, viewer}), pathBetween({from, to, at, depth?, viewer}), overlaps({a, b, at | period, kinds?, viewer})** (`op=explorepreset`)
- **R10** `presets()` answers each preset by name with its kind set; each preset is R2–R9's walk over that set, never a walker of its own: `chain` the structure kinds of `lines` (`part_of`, `reports_to`, `oversees`, `appoints`, `funds`) and `duties`' powers; `flowsFrom` the money kinds; `relationsOf` the event relations; `pathBetween` every registered kind with `to` given. A kind an owner registers later joins the preset that names its class and family with no change here.
- **R11** `overlaps` answers, for two persons, each node both reach in one hop of the same kind (a shared post, board, school, employer, event or stated tie) whose two hops' validities intersect at `at` or within `period` (three-valued through `civil-time`), each with both hops, the intersection, and the size of the shared set: how many other persons hold a hop of that kind to that node in that span ("with 5,000 others held"). A hub is named as R5 says. An overlap is a cited fact and is never stated as the two knowing each other.

**rederive({kind, from, to, as_of, method, id, scope?, viewer})** (`op=exploreverify`)
- **R12** It recomputes a derived connection from its parameters through its owner and answers whether its deterministic id (`connection-grammar.derivedId`) equals `id`, with the hops it rests on and whether any is declared or a hunch. A derivation that cannot be recomputed answers `matches: false` with the reason, never a guess. It writes nothing.
- **R19** (N582; K1607) `scope` is R2's optional `{inquiry}`: the inquiry the leg naming the derived connection belongs to. `rederive` reads the derivation's two ends and the hops its inputs name with that `scope` passed to every owner, so a hunch hop of that inquiry the viewer may see is read and reported as a hunch in what the derivation rests on (R6), and the connection is seen as resting on a lead (`hypotheses` R6). An input it cannot read (no owner answers it, it is withheld from the viewer, or it is a hunch outside `scope`) is answered `undetermined` with the reason, naming nothing the viewer may not see (R7); while any input is undetermined the answer is `matches: false` with `undetermined: true` and never `matches: true`, so a caller refuses it as a derivation that cannot be re-derived. Without `scope`, no hunch hop is read (R6). An input **names a hop** only when it is an object carrying `connection` or `id`, or a string that is a record id (`record-grammar`) or a derived connection id (64 hex); one of the derivation's own two ends is the end, not a hop; any other object (`{entity}`, `{end, capture, ref}`, `{source}`) is a cited record and any other string (an occurrence key) a value the method names, neither read as a hop (K1787). A malformed `scope` (not `{inquiry}`) is refused `BAD_SCOPE`.

**timelineOver({set, from?, to?, viewer})** (`op=exploretimeline`)
- **R13** For a set of entity ids a caller passes (an inquiry's or project's subjects), it composes `events.timeline` over the set with the payers and payees of the money facts concerning those events (`money`), each item cited, in `events`' order, the lanes "what they did" and "what we did" kept apart as `events` answers them (R-3 I-6). It reads no project or inquiry itself.

**The ops map**
- **R14** The module publishes `exploreOps(explore, url, body)`, route arms for the ops above, reads only.

**Hubs judged per kind** (T36; N566; K1566, K1726, K2063)
- **R20** (N566; K1566, K1726, K2063; connection-grammar R6, R10 as amended by T36-40) A hub is judged per kind in every walk, the presets' period walks included (R10, R11). A hub answer names no kind. So when an owner answers `hub` to a call that names more than one of its kinds, the walk asks that node again for each of those kinds alone (R2's call, with the same `at`, `viewer` and `scope`). A kind its owner then answers in items is walked (R5), and only a kind answered as a hub when asked alone is named in `hubs`. A hub answer to a call naming one kind names that kind. These calls count toward the time budget. No call is made for a kind the walk did not ask, and the calls reveal nothing R7 hides. **Proven by** M-X1a re-measured at the desk (K1726's measure). It uses the chain fixture (Bob's seven-hop chain, explore's Suggestions) in which one council member holds 4,000 `event_voted` connections valid in the walk's window, read through `events`' registered owner as T36-14 leaves it (merged before this module in L5). The walk answers within `connection-grammar`'s `time_budget_ms` (`elapsed_ms` below `budget_ms`, no `time` exhaustion), with the 4,000 votes walked, the member not in `hubs` and no `fanout_truncated` for `event_voted`, and no owner call binding more than 100 nodes (R2). Where the 5,000-node bound is met, the walk answers R5's `nodes` exhaustion, never `time`. With 4,001 votes, the member is named in `hubs` with kind `event_voted`, bound 4,000 and set size 4,001, and the walk's other kinds from that member are still walked. The job records the measured `elapsed_ms` beside K1726's 266–283 ms (chain). *(not yet met: T36)*

## Private

### Uses

- `record-grammar`: `idPattern` (R1).
- `civil-time`: `validAt`, three-valued intersection (R4, R11).
- `connection-grammar`: `owners`, `kindOf`, each owner's `neighbours`, `BOUNDS`, `depthOf`, `chainGrade`, `chainLabel`, `orderPaths`, `exhausted`, `derivedId` (R1–R6, R12). Since T36, `hubBoundOf` (R5, R20). *(not yet met: T36)*
- `observation-log`: its level and absence vocabulary (R8).
- `entities`, `events`, `lines`, `standards`, `progressions`, `money`, `duties`, `people`, `connections`: as registered owners, reached through the registry; `events.timeline` and `money`'s facts by event (R13). Since T36, `events`' registered owner also as M-X1a's vote fixture (R20); no new edge. *(not yet met: T36)*

### Invariants

- **R15** One walker: no other module walks across owners; every cross-owner read is this module's walk or one of its presets (K1469, R-3 S-1).
- **R16** Never machine-asserted: no answer states that two nodes are connected beyond the cited hops, and no outward text uses "knows", "network", "conflict", "suspicious" or "most connected" (K1486, K1471).
- **R17** Constitutive relations (`entities`' declared relations) are walked only as R6's declared hops and never resolve a reference or carry a grade of their own (entities R26 as reworded, K1487).
- **R18** No place is named in this module's behaviour or outward text; hub thresholds and the budget are owner data or constants, never a place's.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 CONNECTIONS, PEOPLE ("Overlaps are presets of `explore`"), ORGANISATIONS ("Walks are presets"), "Cross-cutting rulings" (exploration); §5A.5 L4 (overlaps, `pathBetween`); §10 rows "Declared relations walked as labels; lines evidentiary", "One connection shape, one bounded as-of exploration, never machine-asserted", "Hypotheses have a place, never in findings".
- Bob's rulings K1469, K1471, K1473, K1486, K1487; BOB's K1442, K1470.
- D53, D59, D68, D91 (no "knows", absence at its level, no logging of looks, no ranking).

### Suggestions

- **Factory.** `exploreOf(ctx)`; the walk is synchronous on the instance's one thread, so the budget is checked between owner calls.
- **Budget.** A constant published with the answer (R5); provisional until M-X1b.
- **M-X1a.** A generator at real volumes (10,000–60,000 lines; about 32,000 events a year; a 5,000-employee employer and a city-wide fund as hubs) with fixture owners for kinds not yet built, running Bob's seven-hop chain (donor → committee → councilmember → vote → award → contract → vendor, with the payer fund), with R20's arm: a council member holding 4,000 `event_voted` connections read through `events`' registered owner, the walk answering within `time_budget_ms` with the votes walked and no owner call binding more than 100 nodes, the 5,000-node bound met answered as R5's `nodes` exhaustion, and 4,001 votes naming the member in `hubs` (T36-42). *(not yet met: T36)*
- **Tests.** R5 each bound; R6 a declared hop and a hunch hop outside and inside scope; R7 a hidden hop leaves `visited` unchanged; R9 row counts of every table before and after; R11 an overlap at a hub; R12 a tampered id. (T36; K2092) R5 a 3,400-vote set paged whole across four pages; R20 a mixed call (votes over their bound beside meetings under theirs) re-asked per kind. *(not yet met: T36)*

## Open for Bob

None: the meaning is the ladders' and Bob's rulings. Open technical points for BOB are in the drafting report.
