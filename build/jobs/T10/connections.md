# connections (T10)

**Status** · session_01AVYPLgv86VRTDdHGQmuQVk · depth 2 · COMPLETE · handled B1

## J1 · REPORT

These are things this job found in other modules and artifacts. I changed none of them.

1. **Generated artifact made stale** (mechanics §14). `fleetbundles.test.mjs` names `src/connections/index.mjs` and `src/connections/themes.mjs` as changed sources for `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`). `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) carries the same sources. Regenerate both at the layer's close.
2. **legacy-tests: the DEC-49 guard's THEME floor.** `civicos-ui/check-refusal-codes.mjs` notes that `THEME_CHECKS`' floor of 4 shared rows "falls by 4 in that landing" once connections re-exports C-81.11–C-81.14. This is that landing. The guard now reads `THEME_WITHDRAW_CHECKS` as "4 row(s) of THEME_CHECKS by reference", a view it does not count. The floor and its comment belong to legacy-tests. `civicos-ui/test/themes.test.mjs` still imports `THEME_WITHDRAW_CHECKS` from `connections/themes.mjs`. The name is kept as that view, and the test passes (1/0).

## J2 · COMPLETE

**Entries applied** (plan: the connections bullet, layer 5):
- **N125.** `src/connections/themes.mjs` no longer holds its copy of C-81.11–C-81.14. `THEME_WITHDRAW_CHECKS` is now a frozen view of the four `THEME_WITHDRAW_*` rows of the catalogue's `THEME_CHECKS`: the same objects, not copies. `#refusal` reads `THEME_CHECKS` alone. The name stays exported because legacy-tests' `themes.test.mjs` imports it. Test: R43's arm asserts each row is identical to `THEME_CHECKS[code]` and covers exactly C-81.11–C-81.14.
- **N131.** The `factory.test.mjs` arm that pinned capture's old first-caller-wins memo now asserts capture R58's refusal: a later `captureOf(host, {env: {}})` throws, naming `env` and R58. A caller passing the same env still reaches the first instance. m/connections was 59/1 before and is now green.
- **N213, this module's share (R58).** New test "R58 (N213)" in `edges.test.mjs` states the `refs` read contract:
  - the table has exactly `bundle_id`, `target_id` and `kind`, with no severance column;
  - R19's rows: one per (citing bundle, target, relation);
  - a severed entry is still a row, and severance is answered only by `edgeSevered`/`citesInto` (R22);
  - a reader's join as inquiry, publication and ratification write it;
  - R24's `links_to` row from a projected link.

  No code change was needed. R58's `not yet met: T10` mark can be struck. The requirements file is yours, so I did not strike it.
- **N202, this module's share (R3).** `onDerived` now asks membership's `listenerRefusal` (its R81), the one site that mints `LISTENER_MALFORMED` and `LISTENER_DECLARED`, and carries its catalogue row when one is held. Listeners run in `MODULE_ORDER` (membership R83), with an unknown module last in the order it registered. New test "R3 (N202)" covers four malformed shapes, a second registration, and the run order for listeners registered out of order. R3's mark can be struck.
- **Improvement (K313, K316).** The module's test fixture now answers at the plane's shape. `sql.exec` returns a cursor, and a LIKE/GLOB pattern over 50 bytes is refused, as workerd does. `asserted.test.mjs`'s read spy now re-wraps the cursor. The module's code needed no change: it reads every result by iterating it, and it builds no LIKE/GLOB pattern.

**Deferred:** none. **Other modules:** J1 (a stale agent-worker and plane bundle; the legacy-tests DEC-49 THEME floor).

**Tests run:**
- `node --test bio-plane/test/m/connections/`: pass 62, fail 0.
- The manifest names no layer tests.
- `onDerived`'s users and the modules that use connections in layer 5: observation-log 42/0, progressions 40/0, retrieval 58/0.
- `civicos-ui/test/themes.test.mjs`: 1/0.
- `fleetbundles.test.mjs` fails only on the stale agent-worker bundle (J1 1).

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 11 product files, 49 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 58 of 58 live requirement ids named by a test; 0 failures
- ownership: 9 files changed by connections between tranche/T10 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures

Size (session_01AVYPLgv86VRTDdHGQmuQVk): test runs 12, module lines 3786
