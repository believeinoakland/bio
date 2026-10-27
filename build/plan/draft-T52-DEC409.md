# Draft T52: DEC-409, follow the trail in every dimension, alpha part

**Status** · DRAFT for BOB (N1260, K4393), written 2026-10-21 by a planning worker on `tranche/T51` (nothing committed, nothing else touched). Only the alpha part (Bob: "The choice is A today, but B in the first beta"). The first beta's part (combined walks across dimensions, the assistant's research) is NOT planned here. Code statements are as of this checkout; every figure about Oakland data is from the repository's own papers and is marked "measure" where I could not check it on the test copy.

**What I read, and what I did not.** Whole: DEC-409 (`docs/development/DECISIONS.md:6312-6325`); Capability Ladders §2 CONNECTIONS, the "RULED 2026-10-21" paragraph and "Cross-cutting rulings" (lines 138-163); `build/plan/draft-T52-DEC406.md` (whole, not only 3 and 7); rulings K1471, K1473, K4354 (`build/rulings.md:1473`, :1475, :4351); N1260 (`build/plan/next.md:33`); `build/requirements/explore.md` and `connection-grammar.md` whole (Public and Private); `screens-investigate.md` Public (R1-R59) and Uses whole; `modules.json` id, layer and `uses` of every module asked. NOT whole, stated plainly: the Ladders file (306 KB: I read §2 CONNECTIONS and the lines I cite, not §5A-§10 whole); `screens-daily.md` (Provides R1-R17 only), `screens-inquiry.md`, `screens-publish.md`, `screens-action.md`, `screens-intake.md`, `screens-settings.md`, `screens-entry.md`, `screens-wizards.md` (Purpose only, plus greps for "chain"); `lines`, `people`, `money`, `events`, `entities`, `retrieval-browse`, `connections`, `law-relations`, `standards`, `duties`, `affordances` requirements (Purposes, the `neighbours` requirement and the lines I cite, not Provides whole). Code read: `bio-plane/src/explore/walk.mjs`, `reader.mjs`, `ops.mjs`, `presets.mjs` (the parts cited), `connection-grammar/walk.mjs`, `money/index.mjs:1137-1176`. The jobs read all of these whole at START (P20); what a whole reading changes is theirs to REPORT.

---

## 1. What the alpha part requires, item by item

| # | item | words (DEC-409 "the design"; Ladders §2 CONNECTIONS "RULED 2026-10-21") |
|---|---|---|
| F1 | Each dimension's tools | People, organizations, money, donations, events, documents, law: a member can look at each, singly (Ladders: "People, Timeline, Money trail, Explore connections, Find") |
| F2 | The registers | DEC-406: **drafted, not repeated here** (`draft-T52-DEC406.md`) |
| F3 | "Follow from here" | "from any person, organization, payment, donation, event or document, a member follows it into any other dimension in place" (DEC-409 item (2)); "across the dimension screens" (N1260) |
| F4 | All meaningful connections | "between two things, `explore` lists every meaningful connection within its bounds, not only the first found, each cited and graded, with hops through a hub 'too common to walk' and declared-only hops marked as they are now" |
| F5 | The most direct path | "fewest hops; among equals, the strongest weakest hop; then date", "a fact-based ordering, never a score standing for a judgment (K1471, K1473)" |
| F6 | The simplified chain | "A chain a member built step by step is 'simplified': when a shorter cited path between its ends exists, the member is shown it beside their own" |
| F7 | Robust, measured on a real matter | "a real Oakland matter with a known answer (the Sewer Service Fund transfers first)" |
| F8 | Speed | "every screen and act within K4354's 2 seconds" (K4354: every screen within 2 s, every act answers within 2 s, on the test copy at 1280 px) |
| F9 | Acts counted | "the acts a member takes ... counted against a target set before the walk" |
| G | Guardrails stand | K1471 (rankings by a stated, measured quantity are analysis; no judgment score, no centrality or "most connected" across mixed kinds); K1473 (a judgment score is only a signal, never cited, never moves a grade); K1486 (no "knows", "network", "conflict", "suspicious", "most connected" in words); K1487 (declared and hunch hops are leads); explore R9 (writes nothing, logs no one's exploring); "Blocks: a second walker or a stored path" |
| X | Out of the alpha | Combined walks (donors to an official whose department paid a vendor), the assistant's research across dimensions (first beta, N1258) |

---

## 2. What exists today, and what is missing

| item | exists (module, requirement, code) | missing |
|---|---|---|
| F1 people, organizations | `screens-investigate` `people` R12, R13, R25, R37, R40; `person` R1, R21, R32, R38, R41, R50, R53; `people` L1-L3 (DEC-406 draft section 2, I9) | Nothing structural. Organization page has no events, money or law section (R50 draws only "Records its offices keep") |
| F1 money | `money` screen R4 over a **project's set** (`moneyset`, `moneyof`); `money.moneyOf({entity,...})` exists (`money.md` Provides); `money` R18 graph with the set as centre | No view of **an entity's** money (a person, organization or fund opened from anywhere). The screen takes a set id (`screens-investigate/money.mjs:132-136`, `cs.go("money", set_id)`) |
| F1 donations | `money` kinds include `contribution` (`money/vocab.mjs:5`); DEC-406 gives register rows (donations) but a row is **not a connection until a member's request reads rows into facts** (Ladders §2 CONNECTIONS (9); DEC-406 draft section 2, I9) | No donation view or read by donor, recipient, period. **Money registers ONE connection kind** (`money/index.mjs:1141`, `CONNECTION_KIND`), so "donations" cannot be asked for apart from payments in `explore`'s `kinds`, and the hub bound (1,000 per kind) applies to all money at a node together |
| F1 events | `timeline` R3, R20, R33 over a project's set; `events.eventsFor({entity,...})` (`events.md` Provides); `events` owner R35 (took part, concerns, within, five links; `event_voted` hub 4,000) | No view of **an entity's** events from a person or organization page (person R1 draws positions, career, credentials, memberships, interests, statements; no events) |
| F1 documents | `finder` R4 (`search`, `select`, `findin`), `find-in` R5 over a capture, a held set, a project; `entities.concerns`, `namingDocuments` (`entities.md` Provides); person R32 "Documents that may name them"; `connections` co-mention (`mentioned_together`, derived, hub past 32 documents, `connections.md` R2, R65; `connections/mentioned.mjs:17`) | A **document is not a hop's end in `explore`**: no owner registers an entity-to-document kind (`entities` registers three declared kinds, `entities/index.mjs:64`; `connections` registers `mentioned_together` and `step_source`, `connections/index.mjs:1401`). Documents (`INFO-`, `record-grammar/ids.mjs:41`) are valid node ids but nothing reaches them. Co-mention is capped at 32 documents an entity (X110), so an entity named in more (the City, a big fund) cannot be walked through documents |
| F1 law | `standard` R8, R51 (was it in force on a date), `proceeding` R6; `law-relations` kinds `law_*`, `court_*`, `in_force_at_event` (`law-relations/index.mjs:59-64`); `duties` owner R18 (owes, power held by an office, met by) | No "law that concerns this fund, payment or event" read from a non-law item. Law is reached only from a project's Standard or Proceeding screen |
| F3 Follow from here | Partial and one-way: `person` and `people` rows open `explore` at that subject (`person.mjs:125,313,323`; `people.mjs:106,189-191`); the graph (R18) on explore, person and money recentres on a node by press | The phrase and the capability appear nowhere in code or `screens-*` requirements (grep: only `next.md`, `rulings.md`, DECISIONS, Ladders). No "from this item into dimension D" control; no per-dimension counts before opening; no dimension grouping (`affordances` R59-R60 have six **kind** groups `pos, part, money, ment, same, step_source`: none for events, documents, law, donations, and `part` is "part of", not "took part") |
| F4 all connections | `explore` R2: breadth-first from `from` only; `traverse` keeps a node's first level and **skips any hop into a node already reached at an equal or shorter level** (`explore/walk.mjs:137`, `if (lv !== undefined && lv <= d) continue`), and builds each node's paths from **one best path per parent** (`:111-113`). Result: only shortest-level routes, one chain per (parent, hop). `to` stops the walk the level it is reached (`:152`) | Longer alternative routes are never listed; the walk is one-directional (no meeting in the middle); parallel hops of one kind between the same two nodes (40 payments fund to vendor) are separate paths, so listing "every" route would explode; no definition of "meaningful"; no paths bound; no "n more not listed" |
| F5 most direct | `connection-grammar.orderPaths` (`connection-grammar/walk.mjs:77-104`): hop count, then earliest `valid.from`, then hop ids (R14; explore R3) | **No strength tie-break**: "strongest weakest hop" is absent between hop count and date (R14 says "hop count, then the earliest `valid.from`"). `chainGrade` exists (R12) but is not an ordering key. DEC-409 amends R14 and explore R3 and the Ladders line "ordered by hop count then date" (Ladders line 142 text) |
| F6 shorter path | `exploreverify` with `chain` (explore R23) checks a drawn chain's derived hops and `CHAIN_BROKEN`; `promote` "Open a question from this chain" (`screens-investigate` R2) | Nothing finds a shorter cited path between a chain's ends. The member's "chain" today is a drawn path of a walk, a graph trail (R18, page memory only) or a question's derived-connection legs (`inquiry-grammar` R17); no step-by-step builder exists |
| F7 real matter | M-X1a: the synthetic seven-hop chain at real volumes, 266-283 ms (explore R20); M-X1b (real data) "only tunes the budget constant after the release"; M-119 (`docs/development/measurements/M-119.md`) holds real Oakland joins from 31 bundles on `biosmoke7`: fund code 3100 in the Legistar staff report 10-0219 (2010) and the budget book, resolution/ordinance 13035 in the Auditor's report and Legistar 09-1299-1 (passed 2010-07-27) | No real-matter walk test exists. The joins M-119 found are identifier-space matches, not connections `explore` walks. **A fund with more than 1,000 money facts is answered as a hub with no items** (`money/index.mjs:1155`, `rows.length > BOUNDS.hub`), and that read loads every fact of the node before filtering by date (`:1150-1163`): the Sewer Service Fund, the founding case's own node, may be "too common to walk" (measure, M-F1) |
| F8 2 s | K4354 and the performance lane (`build/plan/lane-performance/CHARTER.md`: the re-walk shows screens at 5-10 s, 50-120 requests, C14-C16) | `BOUNDS.time_budget_ms` is **10,000** (`connection-grammar/bounds.mjs:25`); `exploreOf` may lower it only by a dependency, not by an op argument (`explore/index.mjs:38`, `ops.mjs:14-23`). A walk may legally take 10 s |
| F9 acts counted | `journey-check` (L11) walks journeys; the JOURNEYS lane counts steps of walks | No act count, no target, no recorded method for "an act" |
| G guardrails | explore R3, R9, R15, R16, R17; connection-grammar R3, R14, R17; `affordances` words | Every new read and every new sentence must keep them (tests, section 4) |

---

## 3. The entries, in module order

Model sonnet-5-5, medium effort unless noted. Hours are wall-clock job estimates, wide ranges, from T51's jobs of like size. Module order is `modules.json` order (index in brackets).

### 3.0 Measure first (read-only, BOB's walker, before wave A)

- **M-F1** On the test copy (`biosmoke8`) and the `biosmoke7` corpus M-119 used: how many money facts the Sewer Service Fund (code 3100) holds as a party or fund, by kind and year; how many a General Purpose Fund holds. Decides entry `money` (kind split, filtered read) and whether the walk is a hub on day one.
- **M-F2** Time of one `neighbours` call per owner on a node of 100, 1,000 and 5,000 items on the test copy, and the share of a screen's 2 s the plane round trip already takes (performance lane P-findings).
- **M-F3** Re-run M-X1a (266-283 ms) with the `to`-given walk bidirectional and with the Sewer fixture (a fund of 1,001 facts) once entry D4 exists.
- **M-F4** Route count between the walk's two ends at depth 4, 6 and 8 on the real corpus, after parallel hops are grouped (how many "meaningful connections" a real pair has).

### 3.1 Entries

**L1 [5] connection-grammar** · **D1** (≈3 h)
- R-amended R14 `orderPaths`: hop count, then the **strongest weakest hop** (`chainGrade`'s assertion rank, then the weakest end rank; a declared hop is the lowest, R12), then the earliest `valid.from`, then ids. Tests re-pinned. `by` (stated quantity) still first when given.
- R-new `pathStrength(path)` → `{assertion, ends, rank}`, pure; the same function `chainGrade` and the ordering share (one definition of "strongest weakest hop").
- R-new `groupParallel(hops)`: hops of one kind joining the same two nodes are one **connection** `{from, to, kind, members: [hop...], count}`, each member still cited and graded; the connection's grade is its strongest member's on each axis (the weakest-hop rule applies between connections, not within a bundle). Pure.
- R-new `BOUNDS.paths` (listed connections per pair): default 50, at most 200. Amended R10: `time_budget_ms` default **1,500** for a member's act (K4354 leaves 0.5 s for the round trip; BOB's number, M-F2); the 10,000 stays as the ceiling a caller may ask for.

**L5 [55-56] entities, events, lines, [57]** · no entry. They already register `neighbours` with both ends indexed (explore Terms; `lines` R14, `events` R35, `entities` R47). A job REPORTs if the Sewer fixture shows an unindexed end (Ladders §2: "Both ends of every owner are indexed").

**L5 [59] connections** · **D2** (≈3 h; conditional on B-3's recommendation and BOB's reading of K1470)
- R-new kind `named_in` (evidentiary; grade the resolution's, `entities` strongest-resolution grade), an entity and a document (`INFO-` id): a **document is a hop's end**. `neighbours` answers from `entities.concerns`/`resolutionsFor` both ways (entity to documents, document to entities), sight as the document's (R33), its own hub per kind (separate from the 32-document co-mention hub, R65), paging to the kind's bound. Class evidentiary for a resolution a member or the machine graded; declared-only never. Passes `connection-grammar.ownerConformance`.
- R-amended R65: the co-mention hub is judged on `mentioned_together` alone and no longer hides `named_in`.

**L5 [64] money** · **D3** (≈4 h)
- R-amended R16: registers **finer kinds**, one per family of `MONEY_KINDS` (for example `money_transfer`, `money_payment`, `money_contribution`, `money_revenue`), so `explore`'s `kinds` can ask for donations apart from payments and each kind has its own 1,000 hub bound. `affordances` R59's totality test must be satisfied by D7 in the same wave.
- R-amended R16: `neighbours` filters by `at` and `kinds` **in the query** (index `(party, period)`, `(fund, period)`), and the hub is judged on the set valid at `at` and of the asked kinds, not on the node's whole history (`money/index.mjs:1150-1155`). A node still over the bound answers `hub` with its measured set size.
- R-new `moneyByParty({entity, role: payer|payee|either, kinds?, period?, limit, after, viewer})` (`op=moneyby`): the facts an entity paid or received, paged, each with its kind, source and grade; this is the read the "money" and "donations" dimension view of an entity draws (`moneyOf` exists, `money` Provides; this adds the direction and the kind filter). Writes nothing.

**L5 [61-62, 66, 67] law-relations, standards, duties, people** · no entry expected. `standards` R48 and `duties` R18 already register. A job REPORTs if a standard cannot be reached from a fund, a payment or an event: the link "this standard restricts that fund" is a `lawRelate`/`duties` fact a member records (B-4), not a derivation.

**L5 [68] explore** · **D4** (≈10-14 h; the long pole; P6: today ≈1,115 lines in `explore/`, expected +600 to +900, so about 2,000 of the 4,000 allowed)
- R-amended R2/R3 (F4): with `to`, the answer lists **every meaningful connection** within the bounds, not the shortest-level ones only. Meaningful, as BOB defines it (B-ruling 1): a **loop-free** sequence of connections (R-new `groupParallel`, D1), each valid or `undetermined` at `at` (R4), of the asked kinds, **not through a node named a hub for that kind** (the path is not walked; the hub is named in `hubs` as today, R5), with declared and hunch hops walked and labelled as R6 says. Answered ordered by D1's order, at most `BOUNDS.paths`; the answer states `connections_listed`, `connections_more` (or `connections_at_least` when the bound stopped counting) and never calls the rest absent.
- R-new `traverse` for a given `to`: **bidirectional** breadth-first (both ends expand, the smaller frontier first, hops followed against their direction as `explore` already does for undirected kinds), so the depth each side needs is about half and the 5,000-node bound is met later; stops at the first meeting level and then widens by one level for the all-connections list. Same bounds, hubs, sight (R7), labels, time budget, `exhausted` shape. One walker still (R15); this replaces the one-directional loop, it is not a second walker.
- R-amended R10 `pathBetween`: answers `{most_direct, connections, ...}`: **`most_direct`** the first path under D1's order with its ties (every path equal on hop count and strength listed, then date decides which leads), each hop cited and graded, a lead labelled a lead; never a score, rank or "most connected" (R16, K1471). Where the most direct path rests on a declared or hunch hop, the answer also names the most direct **evidenced** path if one exists (K1487: no finding rests on a lead).
- R-new `shorterThan({chain, kinds?, at, scope?, viewer})` (`op=exploreshorter`): `chain` as R23 takes it; finds the most direct paths between the chain's two ends over `kinds` (default: every kind registered) and answers `{shorter: null | [path...], chain_hops, searched: {kinds, depth, visited}, complete}`: a path **shorter than the chain**, each hop cited and graded, ordered as D1 orders, with the labels R6 gives (a path through a declared hop is a lead and says so); `shorter: null` states what was searched ("none found in <kinds> to depth <d>; not searched: <hubs>"), never "none exists". An equal-length path with a strictly stronger weakest hop is listed apart as `stronger` (not as shorter). `CHAIN_BROKEN`/`BAD_CHAIN` as R23. It never edits, replaces or grades the member's chain; writes nothing; logs no one's exploring (R9).
- R-amended R21 `neighbourhood`: with `rings` 1 it also answers `by_kind: [{kind, count, hub?}]` (counts of the hops of each kind at the centre, within bounds), so "Follow from here" can show how much is held per dimension without walking (D7 maps kinds to dimensions). `count` is a fact of the record; a hub is named with its set size.
- R-amended R5/R14: every walk op takes `budget_ms` (lowers the default, never raises past the ceiling); a walk stopped by time answers `time` exhaustion with the connections found so far each whole, and a `resume` token (the two frontiers and `visited` set, signed, no stored state, no log) a second act may pass to continue another slice; the token expires with the viewer's session. (B-ruling 3 / B-5.)
- R-amended R27, R28: `DECLARED_OPS` gains `exploreshorter`; `explore` and `explorepreset` accepts gain `budget_ms`, `resume`.
- Tests in section 4. M-X1a gains the Sewer fixture (section 4).

**L5 [71] retrieval-browse** · no entry. `findIn`'s scope "a set of ids" (Purpose) takes the capture digests `entities.concerns` returns; the documents dimension is a screen composition (D10, D11). A job REPORTs if the scope cannot take 500 digests.

**L11 [142] affordances** · **D7** (≈2 h)
- R-new R68 (amends R59): `connection_kinds` answers each kind's **dimension**, one of `people`, `organizations`, `money`, `donations`, `events`, `documents`, `law`, from a frozen map covering every kind the registry holds (the same totality test as R59, now including D3's money kinds and D2's `named_in`). A kind that belongs to two (a payment is money; a contribution is donations) belongs to its own family only; the map is data, the dimension names are words by key (DEC-410).
- R-new `DIMENSION_ONWARD`: for each item kind (person, organization, fund, payment, donation, event, document, law) the dimensions "Follow from here" offers; every dimension is offered from every kind except itself (DEC-409: "into any other dimension"), a cell with nothing held says so by the screen's empty state, never absent.

**L11 [141, 151, 152, 154] op-grades, op-capabilities, op-declarations, answer-envelope** · **D8** (haiku, ≈1 h each; shared with DEC-406's E18/E19, section 7)
- The new ops `exploreshorter`, `moneyby` (and D2's none) get grades, capabilities, `DECLARED_OPS` rows (K4168) and answer-envelope check-table rows; `affordances` check stays green.

**L11 [158] interface-shell** · **D9** (≈3 h; only if the "in place" control is a kit element, which DEC-410 decides)
- R-new kit element `cs.follow({item, dimensions})` and the in-place panel: a screen opens a dimension's reading **on the same page** (a fold or side panel, back returns), keeping the item as the start and the trail in page memory (as R18's `trail`). Refusals and `state.failed` as R10.

**L11 [163] screens-daily** · **D11** (≈4 h)
- R-new on `finder`/`find-in`: a result of kind person, organization, event, payment or document offers "Follow from here" (R-D10 the shared control); "Find in this" can take an entity as the scope (the documents that name it, via the `concerns` digests). Finding records nothing (K1468).

**L11 [164] screens-inquiry** · **D12** (≈3 h)
- R-new on the document page: "Follow from here" from a document into people, organizations, events, money, law (what it names, its dated facts, its figures); on a question's chain of derived-connection legs, the shorter-path offer beside it (`exploreshorter` with the legs' ends).

**L11 [165] screens-investigate** · **D10** (≈10-14 h; **P6**: 2,662 lines today, R40-R47 add 400-600, this adds about 600-900, which reaches the 4,000 line; B-1 asks whether the cross-dimension view is its own module)
- R-new R60 "Follow from here": on `person` (people, organizations, funds, ordinances, offices, contracts), `timeline` (events), `money` (payments, donations), `proceeding`, `standard`, an item that is a reference offers the other dimensions with `by_kind` counts (D4); pressing one opens that dimension's reading for that item in place (D9), as a person's events (`eventsFor`), an entity's money and donations (`moneyby`), the documents that name it (`concerns`), the law that concerns it (`lawrelationsof`, `dutiesof`, standards it is addressed by). Each reading is a section only when it holds something (R22), with its source and grade; an item the viewer may not see is neither listed nor counted (R7).
- R-new R61 an **entity's own** money and events views (the screens today take a project's set): `money` and `timeline` open for an entity or a fund as well as a set (the set stays the default), with `period`/`from`/`to` and the explored-as-of date the member's, never "now" (R18).
- R-amended R2 `explore`: with an end chosen, draws **"Most direct"** first (its hops, grade, lead label), then "All connections" (each connection once, parallel members folded with "and n more from the same source kind", paged, `connections_more` said), a stop said as R18 says it; "Check this chain" gains **"A shorter path"** beside the chain (R-new, from `exploreshorter`), the member's chain unchanged and unmarked; a `time` stop offers "Keep looking" (second act with `resume`). No score, rank or "most connected" is drawn (K1486).
- R-new R62 the registers (DEC-406 screen) row opens "Follow from here" like any item (a filer, a licensee, a donor row with a linked entity); a row with no entity link says so and offers only "Look for this name" (member's act, K1484).

**L11 [168, 169] control-plane, plane** · **D13** (≈2 h each; shared with E22) · route `exploreshorter`, `moneyby`; stamps; `budget_ms` accepted.

**L11 [174] journey-check** · **D14** (≈3 h; shared with E23) · the Sewer Service Fund journey (section 4), the act counter, and a 2 s assertion against a recorded run (K4354 measured on the test copy by the performance lane, not asserted on a developer machine).

**L1 [0] setup-words** · **D15** (≈2 h; shared with E20) · the words of the above, **after DEC-410 gives them** (section 5); until then jobs REPORT each sentence.

---

## 4. The tests

Each has a control (the same call without the fault passes). Unit tests use the test profile and fixtures, never Oakland's names in code (explore R18); the Sewer walk uses real captures only on the test copy.

| item | test |
|---|---|
| F5 order | three equal-length paths: the one with the stronger weakest hop leads; two equal on both: the earlier `valid.from` leads; all equal: ids. Control: a shorter path with a weaker hop still leads (hop count first). Property: order is total and stable under input shuffle |
| F4 all connections | a graph with a 2-hop, a 3-hop and a 4-hop route between two nodes lists all three (today: only the 2-hop); a node visited twice is never in one path (loop-free); 40 parallel payments between two nodes are **one** connection with `count` 40 and 40 cited members; `BOUNDS.paths` reached says `connections_more`; a route through a node over a kind's hub bound is not walked and the hub is named. Control: the same graph asked with `kinds` excluding the 3-hop's kind lists two |
| bidirectional | over 200 random graphs the bidirectional shortest set equals the one-directional (a reference walker kept in the test), hop for hop; with the 5,000-node bound a 6-hop pair that exhausted before now answers whole; the money direction rule (`direction: 'out'`) holds |
| F6 shorter | a 3-hop chain with a cited 2-hop alternative: `shorter` lists it, each hop cited and graded, the chain untouched; a chain already most direct: `shorter: null` with `searched` stated; a chain through a declared hop with an evidenced 2-hop alternative: alternative offered, not labelled a lead; an alternative through a declared hop is labelled a lead; an equal-length stronger path is under `stronger`, not `shorter`; a hidden hop never shortens anything and `visited` is unchanged; `CHAIN_BROKEN`; no score, rank, "best" or "better" key in the answer (scan) |
| G guardrails | scan every new answer and every new word for `score`, `rank`, `central`, `most connected`, `knows`, `network`, `conflict`, `suspicious` (as explore R16, connection-grammar R3); row counts of every table before and after every new op (R9); no observation-log row from any walk |
| F3 Follow from here | a matrix over item kinds (person, organization, fund, payment, donation, event, document, law) by dimension (7): each of the 8 x 7 minus own-dimension cells opens in place for a fixture item, shows its source and grade, or its designed empty state; never absent, never an empty heading (R22). Controls: an item hidden from the viewer is not offered and counts for nothing; a register row with no entity link offers the name look-up only; "in place" returns to the same screen with the trail kept |
| money split | `explore` with `kinds: [money_contribution]` returns only contributions; a fund with 1,001 facts of which 3 are valid at `at` and of the asked kind is **not** a hub; with 1,001 valid it is, with its measured size. Control: the old single kind is no longer registered, and the affordances totality test fails until D7 maps the new kinds |
| F8 2 s | the Sewer fixture on the synthetic volumes of M-X1a plus a fund of 1,500 facts: the walk answers within `budget_ms` (1,500) or answers `time` with complete connections and a `resume` token that a second call continues to the same set as one uninterrupted long budget. On the test copy: each screen and act of the journey below within 2 s at 1280 px (the performance lane's method), recorded in `journey-check` output |
| F7 the Sewer Service Fund walk | see below |
| F9 acts counted | the journey counts every press, choice and field submission sent as an op or as navigation (`cs.go`), and fails when the count passes the target stated in the K-line made before the first walk |

### The Sewer Service Fund walk and its act target

The matter is the founding case (Ladders B1, L2 example; `BIO_State_Rules_Consistency_v1_5.md:844`: "whether post-FY21 Sewer Service Fund transfers continue the unauthorized franchise fee under new labels"). The material the repository already holds, from which BOB (not I) fixes the **known answer** at START by reading the held captures, then records it in a K-line before the first walk: M-119's joins (fund code 3100 in the 2010 Legistar staff report 10-0219 and in the FY25-27 budget book, `M-119.md:78`; ordinance/resolution 13035 in the Auditor's report and Legistar 09-1299-1 passed 2010-07-27, `:79`), the ACFR and OpenGov transfer series (Ladders B1, L2), and the law the architecture papers name (Municipal Code 13.04.080; Prop 218 Art. XIII D §6(b)(2), `BIO_Functional_Architecture_v3.md:255-262`). I have **not** verified any of these against the captures or the test copy.

Proposed walk (alpha; single-dimension steps joined by "Follow from here", not a combined walk):
1. Open the Sewer Service Fund (fund, code 3100). Count 1.
2. Follow from here to money: its transfers out, FY series, to the General Purpose Fund (and donations: none expected). Count 2. Known answer to check: the series and years the held sources state, each with its page.
3. Follow to law: the standards that restrict its use (the code section and the amendment history). Count 3.
4. Follow to events: the council action that set the charge (ordinance 13035). Count 4.
5. Follow to documents: the staff report that names Fund 3100 (10-0219). Count 5.
6. Open Explore connections from the fund to ordinance 13035 (end chosen): the answer must show the **most direct** path, every other meaningful connection within bounds, and, after the member builds a longer chain through the budget book and the staff report, "a shorter path". Counts 6 and 7.

**Proposed act target: 7 acts, each answered within 2 s**, with the screen drawn within 2 s. BOB sets the final number and the pair before the first walk (K-line); the first walk may only report, and a second walk after fixes is measured against the same target. The count of a pair that needs `resume` (a second slice) is one more act and is reported, not hidden.

---

## 5. Dependencies on DEC-410 (the drawing and the words)

DEC-410 is the next design DEC ("Follow from here", all connections, most direct path and 'a shorter path' drawn; DEC-409 "owed: Design"). Backend entries D1-D4, D7 (the map's code), D8 and D2/D3 do **not** need it **except the words** (the sweep clause forbids member-facing English in a module, as the DEC-406 draft section 5 says). Needed before wave D (screens):
- "Follow from here": the control, where it appears on each item, **in place** (fold, side panel, or the same page re-centred) and how a member returns; the per-dimension counts and the empty state per dimension.
- The seven dimension names and marks (people, organizations, money, donations, events, documents, law) and whether "donations" is its own dimension or a kind of money (B-2).
- Explore: "Most direct" and "All connections" layout; the folded parallel members; `connections_more`; the `time` stop and "Keep looking"; the lead label on a path.
- "A shorter path" beside a member's chain: its wording (never "better", "wrong" or "roundabout") and layout; the "none found" sentence with what was searched; the "stronger" line.
- An entity's own money and events views (R61) and the documents and law sections on a person or organization page; the donation view.
- The list of ops each control calls, and the words by key (`words-reads.json`, R30). Without them a job REPORTs each sentence and the screens wait.
- Shares DEC-407's wait (the registers screen): the registers screen's row control is this part's "Follow from here" (R62), so the two drawings should land together; if DEC-410 comes later than DEC-407, wave D splits.

---

## 6. Open questions

### Bob's (P17: values, legal exposure, money, how real groups behave, architecture, UX)

Each to be put in plain words by BOB with options and a recommendation.

- **B-1 Where "Follow from here" lives (architecture, `layers.md` ruling 5).** A: inside `screens-investigate` (it already owns People, Timeline, Money trail, Explore, Standard, Proceeding). B: a new L11 module `screens-follow` for the control, the in-place panels and the entity views, leaving `screens-investigate` at its size. C: split `screens-investigate` by copy first. `screens-investigate` is 2,662 lines + R40-R47 (400-600) + this part (600-900) = about 4,000, the P6 limit. Recommend **B**. Cost: one new module (a job of its own, ≈10 h, parallel to D10).
- **B-2 What a "dimension" is (UX, vocabulary).** Seven names are in DEC-409. Options: A, seven as DEC-409 lists them (donations apart from money); B, six (donations a filter on money); C, add "policies/discretion" now. Recommend **A**: Bob named donations apart, and D3 makes the split possible; DEC-410 draws it.
- **B-3 The shorter path and legal exposure.** A shorter path may rest on a thin hop (a "mentioned together" co-mention, a declared relation). Option A: offer only paths whose every hop is evidenced, and say "no shorter cited path" otherwise; B: also offer paths through leads, labelled a lead (K1487); C: offer both, evidenced first. Recommend **C**. Also: the wording must never say the member's chain is wrong or the machine's path is "better" (a defamation and trust exposure when a chain names a person); and whether to show the offer unprompted or only on a press ("Look for a shorter path"). Recommend unprompted beside the chain, silent when none (no empty line).
- **B-4 Money and the founding case (how groups behave).** Is "the law that restricts this fund" (Municipal Code 13.04.080 on the Sewer Service Fund) a link a **member records** (`lawRelate`/`duties`, as the papers describe) or one the record **proposes** from text? Recommend a member records it (K1468: nothing extracted into facts unasked). No Cloudflare cost is expected from this part (reads only, no stored paths); the measure M-F2 confirms.
- **B-5 When 2 s is not enough (the speed bar, K4354 is his).** A walk across dense kinds may not finish in 2 s. Option A: stop at the budget, show what was found whole, say "undetermined beyond", offer "Keep looking" as a second act (the `resume` token, no stored state); B: raise explore's bar to 5 s with a progress line (an exception to K4354); C: only answer pairs found within the budget. Recommend **A**; K4354 said the bar may be reduced further after the alpha workflow, not raised.
- **B-6 The act target as a measure of "efficient" (UX).** BOB proposes 7 acts for the Sewer walk (section 4); is that Bob's idea of efficient? Recommend BOB sets it and reports, because the number defines no value (Bob's rule: acts counted "against a target set before the walk"); Bob is told the number.
- **B-7 The matter's known answer.** Bob knows the founding case; the "known answer" (the series, the years, the passages) is facts BOB derives from the held captures. Recommend BOB derives and records it, and shows Bob the rendered answer once, so Bob can say whether it is the case he means (I did not verify it).

### BOB's (decided and reported, not asked)

- "Meaningful connection" defined as loop-free, valid or undetermined at the date, of the asked kinds, parallel hops grouped, not through a hub (D4); the strength tie-break as `chainGrade`'s ranks (D1); `BOUNDS.paths` 50 and 200; the default time budget 1,500 ms (D1, after M-F2).
- Bidirectional search replaces the one-directional loop inside the one walker (D4); no stored path, no cache, no precomputed route (Ladders "Blocks").
- The money kind split (D3) and the filtered `neighbours`; the dimension map lives in `affordances` (L11), not in an owner (D7); `named_in` lives in `connections` (D2) rather than `entities`.
- `exploreshorter` as an op beside `exploreverify` rather than a field of it; `by_kind` on `neighbourhood` for counts.
- Which jobs run parallel, the model and effort of each, merge order, the suite per wave.
- Measures M-F1 to M-F4 run before wave A; their results may drop D2 (if documents are reached by `concerns` alone) or add a money index.

---

## 7. Size and how it combines with DEC-406

| | jobs | layers | job-hours |
|---|---|---|---|
| DEC-409 alone, unconditional | D1, D3, D4, D7, D9, D10, D11, D12 = **8 new jobs** | L1 (1), L5 (2), L11 (5) | about 42 to 56 |
| shared with DEC-406 (extra work in a job DEC-406 already opens) | D8 (op-grades, op-capabilities, op-declarations, answer-envelope), D13 (control-plane, plane), D14 (journey-check), D15 (setup-words) = **about 9 module touches** | L1, L11 | +1 to +3 h each, about +10 to +16 |
| conditional | D2 (`connections`, B-ruling on documents), B-1 B (`screens-follow`, ≈10 h) | L5, L11 | +3 to +13 |
| total | **8 to 10 new jobs plus 9 shared touches** | 3 of 11 layers | **about 52 to 85** |

Compared with DEC-406 (23 to 30 jobs, 80 to 110 job-hours, chain waves A to D, 25 to 30 hours of job time, three to four working days added to T52, `draft-T52-DEC406.md` section 7):

- **Shares jobs:** `setup-words` (E20), `op-grades`/`op-capabilities` (E18), `answer-envelope` (E19), `plane`/`control-plane` (E22), `journey-check` (E23): one job each carries both parts when both drawings are in; E18/E19 are haiku, so little added. No shared **source** module otherwise: DEC-406 builds `registers`, `register-readers`, `following`, `acquisition`, `content`, `scheduler`; DEC-409 builds `connection-grammar`, `money`, `explore`, `affordances`, the screens. The one seam is the registers screen's row (R62).
- **Overlaps in time:** wave A (L1-L4: E1-E7) can carry D1 (L1), D2, D3 (L5, independent of DEC-406's L1-L4 changes) at no wall-clock cost (10 jobs, 3 to 4 h). Wave B is `registers` (E8, 10 to 14 h, the long pole) and **D4 explore (8 to 12 h) runs beside it** (they share no code), so wave B does not lengthen if BOB runs two long jobs at once (fix round 3 ran 20 and 8). Wave C (E9-E14, 5 h) carries D7 and D9. Wave D (L11) is DEC-406's 4 to 6 h; DEC-409 adds D10 (10 to 14 h, one big screen module, plus D11, D12 in parallel): **wave D becomes 10 to 14 h instead of 4 to 6 h, about +8 h.**
- **Combined T52 date effect:** DEC-406 alone is about three to four working days over T52's other work. With DEC-409's alpha part run beside it as above, the critical path is A (4 h) + B (12-14 h) + C (5 h) + D (12-14 h) + merges and suites = about 35 to 40 hours of job time, **about four to five working days, i.e. about one working day more than DEC-406 alone** (not the 5 to 7 working days it would be if the two parts ran one after the other). Add the measure-first half day (M-R1-M-R6 with M-F1-M-F4 together), the Sewer walks after the merge (≈half a day on the test copy, JOURNEYS lane), and the hold for DEC-410 (wave D waits like DEC-407; if the drawings come in separate weeks, wave D splits and the screens land later than the backend).
- **What moves the date:** B-1 (a new module adds a parallel job, no wall clock), M-F1 (a Sewer fund over the hub bound adds D3's filtered read as a must, it is in the plan), the performance lane's fixes to screens at 5-10 s (C14-C16: Follow from here cannot meet 2 s on screens that already take 5-10 s; the lane's fix round must merge before the walk is measured), and the unknown: whether bidirectional search plus 1,500 ms fits real volumes (M-F3).
- P6: `explore` (≈1,115 lines + 600-900) and `screens-investigate` (≈4,000 on this path) are the modules BOB reports at 4,000; the pre-agreed relief is B-1 option B and, for `explore`, a split of the all-connections lister by copy.
