# BOB to record-grammar (T41)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 1, record-grammar: T41-1 (N820; D3, D8, D32). Read also K2405, K2418, K2420, K2422 (their lines in `build/rulings.md`) and `docs/architecture/BIO_Investigation_v0_1.md` §3 and §5 (steps; the one accepting act).
Your requirements: `build/requirements/record-grammar.md` (read whole). Marked `*(not yet met: T41)*`: R51 `ID_TABLE` gains `STP` (owner `steps`, form `opaque`) and `isStepId`; R52 `ACCEPTANCE_FORMS` (frozen) and `acceptanceRecord`, with `ACCEPT_MUST_REAUTHOR`; R53 `GUD` (owner `reading-guides`) and `isGuideId`. The owning modules (`steps`, `reading-guides`) are new in `modules.json` with no code yet: name them as owners only. Test every new id explicitly, each with a negative control (K874). Run your users' tests too (record-grammar is used by nearly every module): report any red, naming the test.
Reading set (mechanics §17): measured at this START: 180 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: none (independent). L1 holds exactly two jobs; after L1 the tranche holds on Bob's direction (K2422), so finish, merge and stay available.
Inherited reds: the plan's "Rules at the opening" list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
