# sources (T36)

**Status** · session_017pZoLzvWRz5wh27zcPw5dD · depth 2 · WORKING · handled B1

## Job record (SOURCES #12, T36-12)

**Reading set.** The START's measure (257 KB) was an over-estimate. Measured the way mechanics §3 asks, it is under 300 KB: own requirements (14 KB), the module's code (`schema.mjs`, `checks.mjs`, `index.mjs`, 58 KB), its tests (`test/m/sources/`, 100 KB), the Purpose of each used module (2.5 KB) and the services my Uses names (record-grammar R15, R16; record-core R6, R9, R21, R62, R82, plus the `transact`/`declarePurge` lines; membership R81, R86; capture R31, R32, R65, R66, R67, R72; provenance `captureGrade`). I read all of it whole, along with the plan's "Rules at the opening", entry T36-12 and ruling K1942.

**Entries applied.**
- T36-12 (N718; K1942): `contract.test.mjs` R1 now pins `mintExhausted`'s `detail` as record-core R82 words it ("your group's Civicsmith could not find a free source id: …"). It also checks that the whole answer is exactly record-core's `mintExhausted("SRC")`, so R1's "answers through record-core's one site" is tested in full. This clears red 5. The module's code is unchanged: it already answered through `mintExhausted`.

**Deferred.** Nothing.

**Found in other modules.** Nothing. I also swept this module's own outward text for DEC-149 words ("plane", "instance", "server"): none.

**Tests and checks.**
- `node --test test/m/sources/` (bio-plane): before the fix, 29 pass / 1 fail (red 5, `contract.test.mjs`:108). After the fix, `tests 30, pass 30, fail 0`.
- Layer tests: `build/manifest.md` names none.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `checks/architecture.mjs sources`: 12 product files, 32 relative imports; 0 failures.
- `checks/coverage.mjs sources`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs sources tranche/T36`: 1 file changed by sources; 0 failures.

Size (session_017pZoLzvWRz5wh27zcPw5dD): test runs 3, module lines 1010
