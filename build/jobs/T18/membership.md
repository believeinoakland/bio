# membership (T18)

**Status** · session_016KLPct4R1vBrZYEAHVWJax · depth 2 · WORKING · handled B0

## Completion (MEMBERSHIP #11)

**Entry applied.** Layer 2, membership (K638; N415 in `build/plan/next.md`): `MODULE_ORDER` (R83) gains the five modules T18's fold added to `build/modules.json`, each at its place in the file's order: `record-grammar` (first, layer 1), `action-clocks` (after `actions`, layer 9), `action-plans` (last of layer 9), `op-declarations` and `admission` (after `instance-setup`, layer 11). `bio-plane/src/membership/index.mjs` only, 7 lines added and 6 removed (the list re-wrapped to the file's width). Nothing else, as BOB's START says: the membership split and its families are T19's (K637). No `not yet met` mark is met by this entry (R83 was met before the fold stale-dated it).

**Deferred.** None.

**Found, for BOB.**
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (`not_product`, the plane's source), since `membership/index.mjs` is one of its inputs. Not written by this job; regenerated at the layer close.
- Nothing found in another module against its requirements.

**Read, whole.** `build/requirements/membership.md`; `build/layers.md`; `build/plan/current.md`; this module's code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every file of its tests. The Uses' public parts were not re-read: the entry touches no service they provide.

**Tests.**
- `node --test test/m/membership/` (from `bio-plane/`): `tests 125, pass 125, fail 0` (R83's two tests and R79's two ordering tests among them).
- `node --test test/m/membership/ test/m/promotion/`: `tests 196, pass 196, fail 0`, promotion's `registry.test.mjs` (R39/R45/R46) included.
- Before the change, the same registry test on this branch: `pass 16, fail 1` (the stale order); after it, passing.
- No layer tests are named in `build/manifest.md`.

**Checks** (process repository @ a7155f0c4a):
- `format`: 77 modules, 72 requirements files; 0 failures
- `architecture membership`: 20 product files, 50 relative imports; 0 failures
- `coverage membership`: 91 of 91 live requirement ids named by a test; 0 failures
- `ownership membership tranche/T18`: 1 file changed; legacy-store and legacy-checks 0 lines added, 0 removed; 0 failures

Size (session_016KLPct4R1vBrZYEAHVWJax): test runs 3, module lines 13
