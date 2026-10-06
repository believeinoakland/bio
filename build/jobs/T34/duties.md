# duties (T34)

**Status** · session_014ixgrBsw1FVLTqwG8JKK7B · depth 2 · WORKING · handled B1

## Completion

**Entries applied (T34-22).**
- N608 (R2, R6, R12; K1679): `MEMBER_ACT_ONLY`, `NO_REASON` and `NO_SUCH_PROPOSAL` re-keyed to `DUTY_MEMBER_ACT_ONLY`, `DUTY_NO_REASON` and `DUTY_NO_SUCH_PROPOSAL`, keeping their rows C-133.19, .21 and .24. Checked against control-plane's `CHECK_FAMILY_FILES`: every duties code is held by one family and `dec49Row` decorates it with duties' own row, so K1679's accepted red on `NO_SUCH_PROPOSAL` is cleared from this side.
- N581 (R8, R9): an `INTERNAL` read, or an act's own checks, reaches every other module as `SYSTEM_VIEWER` (`class:daemon`), never as the symbol. One mapping is used for standards (`inForceAt`, `standardRead`), events, money and the registered sources and listeners. `occurrencesOf({viewer: INTERNAL})` and the transitions R13's consumer records now carry the law's real in-force answer.
- N595 (R16, K1649): a registered trigger source is called `fn({duty, from, to, viewer})` with its reader's viewer (the member's own; `class:daemon` for an internal read), so actions R67's source answers. R12's evidence listeners get the same `viewer`; calculations' `occurrenceEvidence` already takes it.
- N561 (R1, R4): the statuses are read from the active profiles' `vocabulary.response_statuses` (jurisdictions R58). **A defect fixed:** the module read `view.response_statuses` at the top level, where no profile puts it, so against any real profile every reported status was refused. The fixture had the same misplacement; it now uses the `vocabulary` key, and a test runs against the held test profile through `combine`.
- N567: `relate` imported from calc-grammar's index.
- N583 (R24): `OCCURRENCE_KEY_RE` exported, frozen, `^OCC-[0-9a-f]{32}$`. `matchEvent` and `recordTransition` check a key's form first, so a malformed key is refused without a four-year derivation.
- N601 (R25): `noSuchDuty(dutyId, extra?)` exported at module level, on `entities.noSuchEntity`'s pattern (fixed fields, one fixed sentence, `extra` beside and never over, never throws). `duty_id` is the id as asked; it was cut to 80 characters before.
- N605 (R26): `onDutyTracked(module, fn)`, registered through `membership.listenerRefusal`; `fn({duty: <id>})` is called once after the transaction of an adoption, declaration, revision or withdrawal (not after a refused act or a repeated withdrawal). A throwing listener never undoes the act, and the notice writes nothing.
- My own module, DEC-149 (K1784): C-133.9's translation said "an item a part of this copy records". Reworded to "an item the group's own work records". T34-78 did not list it; it was the only such string in duties.

**Deferred.** None.

**Found in other modules.**
1. **op-declarations** (L11): its `reasoned` table names `NO_REASON` as the justification code for `dutyrevise`, `dutywithdraw` and `dutymatch`. After N608 its test `R19: duties' dutyrevise, dutywithdraw, dutymatch and dutytransition …` (test/m/op-declarations) is red: actual `DUTY_NO_REASON`, expected `NO_REASON`. The fix is in op-declarations: name `DUTY_NO_REASON`.
2. **calculations** (running, CALCULATIONS #2): `registrations.test.mjs` `R19 at start …` is order-dependent. `occurrenceEvidence` lists by `calc_id`, which is random, and line 46 expects `[false, true]`. It failed 4 of 6 runs both with and without this job's change. It is calculations' test flaw (sort by creation, or assert by `calc_id`), not caused by duties.
3. **control-plane** R43 (`catalogue-end.test.mjs`): still red, now first on `ADMINS_FIRST lost its row`. That is identical on the tranche without this change, so it is inherited (K1708), not duties'.
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product) bundles the plane's source, which includes duties, so it is stale until BOB regenerates it at L5's close (§14).

**Tests and checks.**
- duties: `node --test test/m/duties/` → tests 37, pass 37, fail 0 (30 before; a new `exports.test.mjs` names R1, R2, R4, R6, R8, R9, R12, R16, R24, R25, R26).
- Every module that uses duties (people, explore, retrieval, calculations, leg-earning, strength, answers, actions, action-plans, scheduler, affordances, notice-producers, op-declarations, control-plane, plane, system migrate-released) → tests 1249, pass 1242, fail 7. Six are inherited or not duties': answers R1 copy test (K1764), scheduler R12 (K1708), op-declarations R19/R6 (K1764), calculations R4 (K1732), control-plane R43 (K1708; item 3), calculations R19 (flaky; item 2). One is caused by this change: op-declarations' duties `reasoned` codes (item 1).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs` → 126 modules, 125 requirements files; 0 failures. `architecture.mjs … duties` → 10 product files, 44 relative imports; 0 failures. `coverage.mjs … duties` → 26 of 26 live requirement ids named by a test; 0 failures. `ownership.mjs … duties tranche/T34` → 9 files changed; 0 failures.

Size (session_014ixgrBsw1FVLTqwG8JKK7B): test runs 23, module lines 1549
