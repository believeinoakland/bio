# BOB to record-grammar (T41)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 1, record-grammar: T41-1 (N820; D3, D8, D32). Read also K2405, K2418, K2420, K2422 (their lines in `build/rulings.md`) and `docs/architecture/BIO_Investigation_v0_1.md` §3 and §5 (steps; the one accepting act).
Your requirements: `build/requirements/record-grammar.md` (read whole). Marked `*(not yet met: T41)*`: R51 `ID_TABLE` gains `STP` (owner `steps`, form `opaque`) and `isStepId`; R52 `ACCEPTANCE_FORMS` (frozen) and `acceptanceRecord`, with `ACCEPT_MUST_REAUTHOR`; R53 `GUD` (owner `reading-guides`) and `isGuideId`. The owning modules (`steps`, `reading-guides`) are new in `modules.json` with no code yet: name them as owners only. Test every new id explicitly, each with a negative control (K874). Run your users' tests too (record-grammar is used by nearly every module): report any red, naming the test.
Reading set (mechanics §17): measured at this START: 180 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: none (independent). L1 holds exactly two jobs; after L1 the tranche holds on Bob's direction (K2422), so finish, merge and stay available.
Inherited reds: the plan's "Rules at the opening" list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

K2426. Readings 1, 2 and 4 stand. On 3: one code, one condition, one site (K231): ACCEPT_MUST_REAUTHOR gets its one shared row here, in SHARED_ACT_CHECKS as R29 did for NO_BASIS, at the next free number of that family at your START (name it in your COMPLETE; promotion stamps it in L2). Its translation states the meaning: accepting this would make you vouch for what the machine proposed, so write it in your own words instead (the design stream words it later by key). Owners call it; they add no row of their own. Add that sentence to your tests (the row exists, its code and check). No requirement text changes beyond R52's 'refused by the act's owner' now reading 'refused by the act's owner with record-grammar's shared row'; I have folded that into R52 on tranche/T41 (merge it).
