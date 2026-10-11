# case-disclosures (T43)

**Status** · session_018GVoxZK3C1A3DkJm7htB9G · depth 2 · COMPLETE · handled B0

## Record: T43-22 (K2710)

**Read.** B1 START. Read whole: `build/requirements/case-disclosures.md`; every file under `src/case-disclosures/` and `test/m/case-disclosures/`; the plan's rule 4 and entries T43-22 and T43-12; K2708, K2710. The used modules' public parts (718 KB, with doorbell's 18 KB; over K2700's limit with my own set) were read whole by one helper in this session, which wrote a digest of what this entry needs, each statement citing its section (mechanics §17 (3)); the sources stayed binding. Its findings matched the code: doorbell R25 creates its six tables (`inbox` among them) when `doorbellOf(ctx)` first builds the one instance for a storage; capture R58 and R87 create none of them since T43-8; sources R1 reaches the doorbell lazily (`doorbellOf(ctx)`) on its first read of pulled knocks.

**Entry applied.** T43-22: `fixture.mjs` builds the doorbell's tables before any knock is inserted into `inbox` (`knocked`) and before any snapshot. Doorbell is no module case-disclosures uses, so the fixture does not import it (the architecture check refuses that import): it reaches the doorbell's one instance through `sources`, a used module, by one `sourceOf` read of a capture no knock was pulled into, which builds the instance (`doorbellOf(ctx)`, the same one every later read gets), answers `NO_SUCH_SOURCE` and writes nothing; the fixture then asserts the `inbox` table exists. The `knocked` helper's comment now cites doorbell R13, R18 (was capture R65, R72). Tests only for the entry; no assertion changed.
- Rule 4 (12)'s four case-disclosures reds pass with their assertions unchanged: `captures.test.mjs`:217 (R4), `carries.test.mjs`:139 (R7), `carries.test.mjs`:195 (R9, R10), `seam.test.mjs`:264 (R23).
- Improvement in my own module: in `src/case-disclosures/index.mjs`, `photoLabel`'s comment stood above `citeKey`; moved above `photoLabel`. Comment only; no behaviour changed.

**Deferred.** None.

**Found in other modules.** None new. The users' reds below are already accepted by rule 4.

**Tests.**
- case-disclosures: 95 pass, 0 fail (was 91/4).
- Users: case-account 21/0; plane (with `test/system/migrate-released.test.mjs`) 185/0; case-authoring 180/4, all four `no such table: inbox` from its own `fixture.mjs`:444 (`carries.test.mjs`:59, 79; `preflight.test.mjs`:301, 425), rule 4 (12), T43-12's; answer-envelope 25/5 (`catalogue-end.test.mjs`:17, `envelope.test.mjs`:63, `families.test.mjs`:49, 377, 424), each missing doorbell's family (`DOORBELL_CHECKS`, `KNOCK_CHECKS`; C-85, C-118 rows), rule 4 (9), until T43-14.

**Checks** (process repository): format 0 failures; architecture case-disclosures 0; coverage case-disclosures 31 of 31, 0; ownership case-disclosures `tranche/T43` 0.

Size (session_018GVoxZK3C1A3DkJm7htB9G): test runs 12, module lines 5746
