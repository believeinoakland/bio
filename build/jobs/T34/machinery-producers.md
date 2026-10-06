# machinery-producers (T34)

**Status** · session_01B2rF1RrCAjrKyXJs9sb1xC · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (T34-95; K617, K624 (1), K1850; seam read `build/extraction/queue-producers-split.md`):
- `bio-plane/src/machinery-producers/index.mjs` (1,097 lines): class `MachineryProducers`, factory `machineryProducersOf(ctx, deps)`, one read `conditionItems({member, viewer, now, homesOf, optionsOf}) → {items}`. It holds `queue-producers/index.mjs` 353–771 (773–802 is `#leadBasisAbsence`'s comment, not moved per seam §2), 1842–1936, 1943–2027 and 3031–3236, with copies of `#rows`, `#one`, `#bundleGate`, `#bundleRedactor`, `#homesOf`, `#optionsOf`, `#homesAt`, `#ownedProjects`, the zone helpers, `ZONE_UNDETERMINED`, `DAY_MS` and the bounds. `QUEUE_OBJECTIVE_GAP_PAGE` (200) is copied too, because `#ownedProjects` reads under it. Every key, kind, recipient, bound and `basis` is unchanged. It imports only its Uses. Items come in the order R2 (catalogue order), R4, R5 (seam §7 (3)).
- **R9 (N550, DEC-131):** `basis.detail` "a signal is a fact about OUR OWN machinery" (qp :487, :2013) now reads "a status is …"; "a sweep's signal" (:3120) and "the sweep's signal" (:3126) now read "status". Codes are unchanged.
- **DEC-149 (T34-87):** :3197 now reads "so your group's Civicsmith could not sign"; :3226 reads "your group's Civicsmith signed the closing"; `ZONE_UNDETERMINED` reads "no time zone is held for it by your group's Civicsmith, …". :487's and :2013's "this instance's" (doctrine) stay, and a test pins each.
- My own flaws fixed in the copy (comments only): the stale "THREE KINDS" header and "The four generators" now name the kinds held. The comments' requirement ids are re-labelled to this module's ids.
- Tests: `bio-plane/test/m/machinery-producers/`. `world.mjs` is copied, dropping credentials (not in Uses; not needed) and the tables no moved producer reads. `conditions.test.mjs` is copied whole, `producers.test.mjs` from 137–209 and `sweeps.test.mjs` from 40–221. Each is re-labelled (R3→R2, R22→R3, R26→R4, R27→R5, R8→R1, R11→R6, R12→R7) and drives `conditionItems`. The new `invariants.test.mjs` covers R1, R6, R7, R8, R9 (the words), R9 (the DEC-149 strings) and R10.
- `build/modules.json`: my entry gains its `paths` and `tests`, as START directed (K1043's form).

**Deferred:** none.

**Found in another module:** `acquisition` (L3), `checks.mjs:94`, C-83.4's translation "… held by renders this instance is running right now …". It is member-facing: `render-deferred` (R2) carries it whole as its reason. DEC-149's L8–L11 grep did not reach it (N690's L1–L7 re-sweep, T35). My R9 test takes the carried translation out before its check. REPORT J2.

**Tests and checks:**
- `node --test bio-plane/test/m/machinery-producers/*.test.mjs`: tests 24, pass 24, fail 0.
- `format`: 129 modules, 128 requirements files; 0 failures.
- `architecture … machinery-producers`: 6 product files, 28 relative imports; 0 failures.
- `coverage … machinery-producers`: 10 of 10 live requirement ids named by a test; 0 failures.
- `ownership … machinery-producers tranche/T34`: 8 files; 1 failure, `build/modules.json`. That is the START's own edit (my entry's `paths` and `tests`, K1043), which the check does not allow for. It is BOB's to accept.
- Layer tests: none named in `build/manifest.md`.

Size (session_01B2rF1RrCAjrKyXJs9sb1xC): test runs 6, module lines 1097

## J1 · REPORT

acquisition (L3), `bio-plane/src/acquisition/checks.mjs:94`: C-83.4's translation says "… held by renders this instance is running right now …". It is member-facing: my R2's render-deferred carries it whole as its reason (and so does queue-producers' copy until its job). DEC-149's L8–L11 grep did not reach L3 (N690's L1–L7 re-sweep, T35). Nothing for this tranche unless you place it; my R9 test takes the carried translation out before its check.

## J2 · COMPLETE

T34-95 applied; R1–R10 met. `machinery-producers/index.mjs` 1,097 lines: `conditionItems` holds qp 353–771, 1842–1936, 1943–2027 and 3031–3236 with their helpers, every key, kind, recipient, bound and basis unchanged. R9's four 'signal'→'status' and DEC-149's three rows are applied, each pinned by a test. Tests: 24/24 (conditions whole, producers 137–209, sweeps 40–221 re-labelled; invariants R1, R6–R10). Checks: format, architecture and coverage (10/10) show 0 failures. Ownership shows 1 failure, `build/modules.json`: my entry's paths and tests, added as your START directed (K1043); the check has no allowance for it, so it is yours to accept. The tranche is merged in; no conflict. Ready to merge before queue-producers. Record: `build/jobs/T34/machinery-producers.md` § Completion; REPORT J2 (acquisition C-83.4 wording).
