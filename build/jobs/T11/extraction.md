# extraction (T11)

**Status** · session_01C1JzBJzAyWM9NPi1FuZxsZ · depth 2 · WORKING · handled B1

## Work (EXTRACTION #4)

Read whole: `roles/JOB.md` and mechanics §6, §13, §16; B1; the plan's opening paragraph and layer 4; N294 in `next.md`, K337 and K343; `build/requirements/extraction.md`; layers.md's contract and rulings; membership's R81 and R83, record-core's `transact` (a nested call joins the caller's as a savepoint); `src/extraction/index.mjs`; the tests' `fixture.mjs` and `store.test.mjs`; legacy-store's `#testimonyWithin` (what R61 replaces for it).

**Applied** (76b742ffc3):
- **N294.** R61 `indexTestimony({bundleId, captureSha, words, author}) → indexed` and R62 `onIndexed(module, fn)`, methods of `extractionOf(ctx)` (`src/extraction/index.mjs`). R61 runs in `record-core.transact`, which joins the caller's transaction; replaces the capture's index by R22's own writer (`indexUnits`) over one unit, the words at `{kind: "document"}`, `seq` 0, chain null; writes no reading, history, reference, name term or text-source row; calls no R24 listener; raises R62 to every registered listener in `MODULE_ORDER`, a throw failing the write and the caller's. R62's registration shares R24's (`#register`, through `membership.listenerRefusal`), in its own slot. The provided part was pushed early (f688b385fb) and said so (J1). One detail beyond the wording, my reading, reported in J1: a call naming no bundle or capture digest writes nothing, calls no listener and answers `written: 0` with a `why`, since R61 throws only when a listener does.
- **The fixture at the plane's shape** (B1, K316, K313): `sql.exec` now answers workerd's cursor (read once; `toArray()`, `one()`), never an array, and refuses a LIKE/GLOB pattern over 50 bytes, literal or bound. The whole module suite passes on it; the module holds no LIKE/GLOB.
- **Tests** (`test/m/extraction/testimony.test.mjs`): R61 (the one unit replacing a held index, the answer's keys, R22's per-unit cap, the FTS index, glyphless and non-string words, unnamed ids, no reading-table write, no R24 call, the caller's rollback), R62 (registration refusals equal to `listenerRefusal`'s, `MODULE_ORDER`, the exact payload, run inside the write, a throw failing the write and the caller's, none from R19's writer). `test.todo` for R63 and for R31's `evidenceAbsent` clause, both N285 (T12, K347).

**Marks met, for BOB to strike:** R61's `(not yet met: N294; …)` and R62's `(not yet met: N294)`. The requirements file is not mine to write. R63 and R31's N285 mark stay.

**Found in other modules:** none new. legacy-store's `#testimonyWithin` still calls `indexUnits` and observation-log's `observeIndexed` directly; that is its own layer-10 share of N294 (and observation-log's R7 at layer 5), which can now be built against R61/R62.

**Stale generated artifact (mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`), whose inputs include `src/extraction/index.mjs`. Not rebuilt.

**Tests and checks run** (on 76b742ffc3):
- `node --test bio-plane/test/m/extraction/`: tests 83, pass 81, fail 0, todo 2.
- `node --test bio-plane/test/m/` (every module, the users of extraction included): tests 2453, pass 2426, fail 0, todo 27.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture`: 15 product files, 57 relative imports; 0 failures. `coverage`: 58 of 58 live requirement ids named by a test; 0 failures. `ownership`: 4 files changed by extraction between tranche/T11 and HEAD; legacy-checks, legacy-store and legacy-index 0 lines; 0 failures.

**Deferred:** nothing.

Size (session_01C1JzBJzAyWM9NPi1FuZxsZ): test runs 6, module lines 3473

## J1 · REPORT

Provided part pushed early (§4): R61 `indexTestimony({bundleId, captureSha, words, author}) → indexed` and R62 `onIndexed(module, fn)` are on `job/T11/extraction` @ f688b385fb, methods of `extractionOf(ctx)`, as worded. observation-log (layer 5) can register R62 and legacy-store (layer 10) call R61 against it. One detail beyond the wording, decided on my reading: a call naming no bundle or capture digest writes nothing, calls no listener, and answers `written: 0` with a `why` (R61: it throws only when a listener throws). Tests and the rest of the job follow.
