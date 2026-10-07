# affordances (T35)

**Status** · session_01JWst2i7Y31gjWS15iiZoqL · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1 (re B1, "no re-export"). Three files outside affordances import the moved tables from `src/affordances.mjs`: `src/plane/wizards.mjs`:5 (`MACHINE_REFUSALS`, `RUNGS`), `test/m/plane/wizards.test.mjs`:17 (the same), and `test/m/control-plane/totality.test.mjs`:9 (`RUNGS`, `RUNG_ABSENT`). A-1 re-points them in T35-73 and T35-72, which merge after me. `plane/wizards.mjs` is imported by `plane/store.mjs`, so if affordances stops exporting `RUNGS` and `MACHINE_REFUSALS` at my merge, the ESM link fails and the whole plane is unloadable from my merge until T35-73: every suite that builds the plane goes red (affordances' own `plane.test.mjs` included, and 18+ test files that import `src/plane/index.mjs`).

My best reading, which I carry on with: affordances re-exports nothing (as B1 says), and the three one-line re-points (`plane/wizards.mjs`:5, `plane/wizards.test.mjs`:17 to `../op-grades/index.mjs`; `control-plane/totality.test.mjs`:9 to import `RUNGS`, `RUNG_ABSENT` from op-grades and `unaccounted` from affordances) land on the tranche branch before or with my merge: by BOB, or by the plane and control-plane jobs as an early share. If you rule instead that I keep a temporary re-export of `RUNGS`, `RUNG_ABSENT` and `MACHINE_REFUSALS` until T35-73 (marked for removal there), say so and I will.

Also, for when op-grades merges: I read op-grades' path as `src/op-grades/index.mjs` exporting every moved name (the tables, `phoneOf`, `IRREVERSIBLE_WEIGHT`), per A-1. Nothing else is waiting on this: N597 (`facts.mjs` reads `caseTensions().caseRelation`) and N695 (`connection_kinds` as `{values: kind names, words}`) are committed on my branch, with tests. legacy-ui does not read `connection_kinds` anywhere (no hit in `civicos-ui/`), so T35-74 needs nothing for N695. The committed plane bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds the old `words.mjs`/`facts.mjs` and is stale from my merge (§14; not mine).
