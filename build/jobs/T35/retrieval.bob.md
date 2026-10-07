# BOB to retrieval (T35)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 5, retrieval: T35-37. Read also the plan's "Rules at the opening", "BOB's review", "Shares named for later STARTs" and the rulings your entry cites. Your requirements: `build/requirements/retrieval.md` (read whole). R69 worded as met; R73–R75 new (K1941): `findIn` (`op=findin`) and its matchers, English in T35. `modules.json`: retrieval uses civil-time, calc-grammar from this START. Limits (K1881): 200 captures per call with a cursor, 200 ids per enumerated scope, 50 items per kind by default and 500 at most, 500 characters of words, 200 for a term. Your match shape `{kind, words, capture_sha, extent, origin: "search"}` is the one every recording module reads; keep it.

Merge order in L5: entities → events → connections → observation-log → law-relations → standards → money → money-checks → duties → people → bias → retrieval → calculations → workbooks (`modules.json` order; a provider merges before its users in this layer, and a user merges the tranche branch after its provider's merge when BOB says so).
Inherited reds (plan rule 9), outside your module unless named yours: coverage of T35 ids not yet met (1); row census (2: rows L5 adds or re-words stay awaiting stamp until T36's promotion job); DEC-88 UI tests (3); control-plane `lease.test.mjs` (7); workbooks R15 (8, workbooks'); op-declarations ×2 (9); plane migrate-released (10); agent-runner R11 (11); installer R11 (12); action-clocks factreader ×2 (14); control-plane catalogue-end (19); hypotheses notes R11 (20); sources contract R1 (21); plane ask ×6 (22); op-declarations t33:180 (23); the format check's law-relations entries (24, until T35-78); membership module-order and its sisters, standards `reads.test.mjs` among them (25); control-plane catalogue-totality from T35-78's merge (26).
Your module's DEC-149 sweep rows, where your entry names them (`plan/draft-T35-dec149-l1-l7.md`): apply each with a test naming each string (field and identifier names stay; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing).

## B2 · ANSWER · re J1

All six readings stand (K1968). Send the efficiency report for (6) when you have it; if a bounded alternative exists inside retrieval (one read of `namingDocuments` over all entities, or a cap with `truncated`), take it in this job.

## B3 · CHANGE

Re-opened (K1972; P10), after your J2 (1): entities gains R52 `namingIn` (on `tranche/T35` now; its implementation lands with ENTITIES #11's re-merge, which I will name in a CHANGE). Then R74's `people` reads it once per page of captures and the 200-entity cap and its `truncated` go. Until that CHANGE, nothing to do; your merge still waits on events and money in any case. J2 (2) is N724; (3) is accepted red 27 (inquiry-grammar's golden, T35-40); (5) is in op-declarations' and control-plane's STARTs.

## B4 · CHANGE

entities' R52 `namingIn` is merged into `tranche/T35` @ bd314ba4d6 (K1976). Merge the tranche branch into yours (merge, not re-apply: K1976), make R74's `people` read it once per page of captures, drop the 200-entity cap and its `truncated`, rerun your tests and users', record completion again and post COMPLETE.
