# connections (T20)

**Status** · session_01Df1N2wW2RVBh2dLYgPDzeM · depth 2 · COMPLETE · handled B1

## Completion (CONNECTIONS #8, 2026-10-01)

**Entry applied** (B1; `build/plan/current.md` T20 layer 5, connections, K882, N454, K877): R61. `bio-plane/src/connections/index.mjs` exports `REFS_COUNT_KEYS` (`["refs"]`, frozen) and the instance method `refsCounts(hid)`, shaped as record-core R63's `counts(hid)`: `{refs}`, the rows of `refs` less those whose `bundle_id` or `target_id` is in `hid`, each key read as `COALESCE(k, '')`, a null `hid` counting whole. It is the same SQL as plane's stats sight (`bio-plane/src/plane/held.mjs`:66–:70, :79). R60's `counts` and `refsCounts` now share one private `#count`, so the two cannot drift; R60's figures are unchanged (its tests pass as before). Nothing new is registered: R60's registration keeps its five keys. Plane reads it as `connectionsOf(ctx).refsCounts(hid)` with `REFS_COUNT_KEYS`.

**Test:** `bio-plane/test/m/connections/refs-figure.test.mjs` (5 tests, each naming R61), on this module's fixture, with edges written by promotion (R19) and a project hidden from a member through membership's `hiddenBundles`. It covers: the key list and the shape; whole for a viewer never sent (null `hid`); a hidden project's refs left out on either key (cited by a visible bundle, or citing); every subset of the held bundles checked against a JS count of the rows; an unrecognised viewer (empty stamp) failing closed; a key naming no bundle never dropped; no new registration; synchronous; writes nothing.

**Not yet met → met:** R61 (*not yet met: T20 layer 5*), proven by `refs-figure.test.mjs`. BOB strikes the mark at the merge (K775 (6)).

**On "a NULL key never dropped":** `refs.bundle_id` and `refs.target_id` are `NOT NULL` in this module's schema, and always have been. So no stored row has a NULL key, and the test proves this (both NULL inserts are refused). The `COALESCE` reading is kept, as plane's copy has it. The test proves the empty key `''`, which is what that reading maps NULL to, is never dropped by any `hid`.

**Deferred:** none.

**Generated artifact this job stales** (§14; reported in J1): the plane bundle and manifest, `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json`, because `src/connections/index.mjs` is one of their inputs. On `tranche/T20` @ 44113880ce, `test/system/fleetbundles.test.mjs`' bio-plane arms pass. On this branch four of them fail: no staleness, byte-identical fresh build, manifest sha256, and comment-only byte-identity. They stay red until the L5 close regenerates the bundle. Three other failures are already on the tranche base and not this job's: agent-worker's 153 inputs, and the two (j) arms naming `node tools/bundles.mjs`.

**Found in other modules:** none beyond the above. Plane's T20 job (L11) switches its `refs` key in `held.mjs`:79 to this export.

**Tests and checks** (HEAD of `job/T20/connections`):
- `node --test bio-plane/test/m/connections/`: tests 107, pass 107, fail 0. There are no layer tests (`build/manifest.md`).
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … connections`: 19 product files, 68 relative imports; 0 failures.
- `node checks/coverage.mjs … connections`: 61 of 61 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … connections tranche/T20`: 0 failures.

Size (session_01Df1N2wW2RVBh2dLYgPDzeM): test runs 3, module lines 2672

## J1 · REPORT

Generated artifact this job stales (§14): the plane bundle and manifest, bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (src/connections/index.mjs is an input). fleetbundles.test.mjs' bio-plane arms pass on tranche/T20 @ 44113880ce and fail here (staleness, byte-identity, manifest sha256, comment-only) until the L5 close regenerates. Three failures there are already on the tranche base, not this job's: agent-worker's 153 inputs and the two (j) arms naming node tools/bundles.mjs.
