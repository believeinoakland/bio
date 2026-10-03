# capture-requests (T31)

**Status** · session_01EdzfgSAti176MrfZd2aQyS · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (plan T31 L6, capture-requests): N538, R14 (DEC-124; K1365 (4), K1367).
- `checks.mjs`: `CAPTURE_UA_MODES` is now `civicsmith`, `member-browser`; new `CAPTURE_UA_MODE_ALIASES` (`{civicos: "civicsmith"}`, frozen) and `uaModeOf(mode)`, which reads an alias as the mode it names (own-property lookup, so `constructor` and the like are not aliases).
- `index.mjs`: the door writes `civicsmith` by default and writes a sent `civicos` as `civicsmith`; the standing answer (R6), every read through `project` (R23, R24, R26 and so the queue's feed items, R29, R43) answers a stored `civicos` row as `civicsmith`; conduct judges a stored `civicos` row as `civicsmith`. The agent is composed by acquisition's `civicsmithUserAgent` (re-pointed from the `civicosUserAgent` alias). Stored rows are not rewritten: they are read as the mode they name.
- `schema.mjs`: the `ua_mode` column's comment.
- Tests: a new R14 test drives the alias at the door (`ua_mode` and `uaMode`), three stored pre-T31 `civicos` rows through the standing answer, every read and the drain, and three near spellings (`CivicOS`, `CIVICOS`, `civic-os`) refused C-28.6; the vocabulary test names the alias and `uaModeOf`; the R14 agent test checks the exact Civicsmith string; the plane spine test (R16 R31 R14) checks the agent that left the instance is `civicsmithUserAgent("1.0.0", "cr-plane", "investigate")`.

**Deferred.** None.

**Found in other modules** (REPORT J1): `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`, manifest §14) is stale on `src/capture-requests/checks.mjs` and `index.mjs` after this change, as `fleetbundles.test.mjs` reports; regenerate at the layer close. Nothing else: `queue-producers` passes `ua_mode` through from R26's reads, so its feed items say `civicsmith` with no change of its own (its test stubs still write `civicos`, harmless).

**Reading.** Read whole: `build/requirements/capture-requests.md`, the module's three source files and seven test files, BOB's START, rulings K1361–K1370, the plan's L6 line, acquisition R24 and the layer-6 row of `build/layers.md`. Not read whole: the public parts of the other twelve modules in `uses`: the entry calls no service of theirs that changed; their callers' tests were run instead (below).

**Tests and checks run** (on `job/T31/capture-requests` at `acf0b55706`):
- `node --test test/m/capture-requests/`: tests 73, pass 73, fail 0 (plane test under Miniflare included).
- Users of this module, `node --test test/m/scheduler/ test/m/intent/ test/m/queue-producers/ test/m/link-sweep/ test/m/plane/sweep.test.mjs`: tests 238, pass 238, fail 0.
- Layer tests: none (`build/manifest.md`).
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: the bio-plane bundle reported stale on this module's two files (above); not regenerated (not this job's artifact).
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … capture-requests`: 10 product files, 37 relative imports; 0 failures.
- `checks/coverage.mjs … capture-requests`: 45 of 45 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … capture-requests tranche/T31`: 8 files changed by capture-requests; 0 failures.

Size (session_01EdzfgSAti176MrfZd2aQyS): test runs 5, module lines 1726

## J1 · REPORT

not_product's bio-plane/dist/bio-plane.bundled.mjs is stale on src/capture-requests/checks.mjs and index.mjs after this job (fleetbundles.test.mjs says so); regenerate at the layer close (manifest §14). Nothing else found: queue-producers passes ua_mode through from R26's reads, so its feed items say civicsmith with no change of its own.
