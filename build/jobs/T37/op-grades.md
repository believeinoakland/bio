# op-grades (T37)

**Status** · session_01MLFSULGPPdKyw9vxcdawPM · depth 2 · WORKING · handled B0

## Completion (T37-26)

**Entries applied** (N776; N755's follow-on; N757; N669; K2201's `to_english`):
- R18: `phoneOf` answers `false` for every op in `IRREVERSIBLE_WEIGHT`, read from that frozen array at the call (`IRREVERSIBLE_WEIGHT.includes(op)`, after the alias is resolved), never copied; `standardrelease` moves to `false` (`index.mjs` `phoneOf`, its comment and `LARGER_SCREEN_ACTS`' comment re-worded, DEC-181).
- R26: `personexpunge` leaves `LARGER_SCREEN_ACTS`, which holds `filingsent` alone; `phoneOf("personexpunge")` still `false`, through the weight. No op is in both sets.
- R25: `JUSTIFICATION_REFUSALS` gains `AI_KEEP_AWAY_NO_REASON` (credentials R51, C-29.32); `aikeepaway`'s backing in `t36.mjs` names it; `NO_REASON` stays.
- R27: new `t37.mjs` (imports nothing), spread into `RUNGS`, `RUNG_ABSENT`, `NON_ACTS` before the aliases: `obscuremark`, `translationdraft`, `translationmark` `undetermined`; `setpassword` `caller-owned`; `subscriptionsignin`, `translationgrant` `credential`; `translationadopt`, `translationconfirm`, `translationrevert` `reversible`; R27's `NON_ACTS` sentences word for word, and `read:` rows for `photomarks`, `translations`, `interfacewords`. None in `MACHINE_REFUSALS`; no statement, vocabulary or prompt.
- Own flaws fixed: `t35.mjs`:8's comment said `subscriptionsignin` has no grade (now: graded in `t37.mjs`); `index.mjs`'s header named neither R23–R27 nor `t37.mjs`.

**Deferred:** none.

**Found in other modules (all expected re-pins after my merge; none is a flaw of theirs against their requirements):**
- `control-plane` `totality.test.mjs`:17 (R2, R41): `stale` names my R27 ops (`interfacewords`, `obscuremark`, `photomarks`, `setpassword`, `subscriptionsignin`, `translation*`), graded before op-declarations declares them. Red until T37-31, as B1 said.
- `affordances` (T37-27, after me), each pinning an exact set my amended requirements change: `t31.test.mjs`:27 (R36: its phone oracle lacks `IRREVERSIBLE_WEIGHT`, so `standardrelease` differs) and :49 (R36: pins `["filingsent", "personexpunge"]`); `catalogue.test.mjs`:110 (R2: RUNGS' `reversible` list lacks `translationadopt`, `translationconfirm`, `translationrevert`) and :479 (R27: the exact `undetermined` set lacks `obscuremark`, `translationdraft`, `translationmark`); `t36.test.mjs`:49 (R48: `owed_<op>` keys now naming ops graded here, e.g. `owed_subscriptionsignin`, `owed_obscuremark`). Red 14 (`t36-backing.test.mjs`:76) as B1 said.

**Reading set:** over 300 KB (requirements 46 KB, code 225 KB, tests 60 KB, plus the owners' requirements), so: I read whole my requirements, layer 11's row of `build/layers.md`, my entry and B1, `t36.mjs`, `t36.test.mjs`, the new `t37.mjs` and `t37.test.mjs`, `index.mjs`'s header, imports, `JUSTIFICATION_REFUSALS` (:100–189), `CONSEQUENCE_STATEMENTS`' tail, `LARGER_SCREEN_ACTS`, the spreads, `IRREVERSIBLE_WEIGHT`, the alias block and `phoneOf`, `ladder.test.mjs`'s R18 test, `t35.mjs`:1–9 and `t35.test.mjs`:78–112; DEC-157, DEC-180, DEC-181, DEC-182 whole; K1957, K2159, K2171, K2175, K2200, K2201; case-carriage R9, R10, R12; credentials R3, R43, R51; instance-setup R67, R69–R74 (and R68, the Terms); agent-worker R66. A worker read the rest of `index.mjs`, `t33.mjs`, `t34.mjs`, `t35.mjs`, `ladder.test.mjs`, `owners.test.mjs` and `t35.test.mjs` whole and wrote a ~7 KB summary, each statement citing file:line (table layout and spreads :241–273, :293–580, :591–782, :829–1465; alias assignment :1480–1483 after `IRREVERSIBLE_WEIGHT`; the tests my change breaks: `ladder.test.mjs`:164, :166–170; `t35.test.mjs`:106–107; t36.test.mjs:139, :145; the stale t35.mjs:8). What it left out (owners' per-op grades in T33–T35, not touched by this entry) did not matter.

**Tests run:** op-grades (5 files): 35 pass, 0 fail. Users: `affordances` 183/34 (29 before my change; the 5 new named above), `control-plane` 179/1 (totality, above), `plane/wizards` 4/0.
**Checks:** format: 136 modules, 135 requirements files; 0 failures. architecture: 11 product files, 16 relative imports; 0 failures. coverage: 27 of 27 live requirement ids named by a test; 0 failures. ownership: see the line below, run after commit.

Size (session_01MLFSULGPPdKyw9vxcdawPM): test runs 9, module lines 2307
