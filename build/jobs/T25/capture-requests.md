# capture-requests (T25)

**Status** · session_0113zrDaPdg9qvGBAGsWubQr · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T25 L6, capture-requests: N515. R45's scope check is named as `link-sweep`'s throughout, no longer `monitoring`'s: `index.mjs` (the `#sweepScope` field note, `registerSweepScope`'s comment, now "registered once at start by `link-sweep` (its R12)", the sweep's sources as "link-sweep R1", `#sweepAdmits`' comment, `SWEEP_NAME`'s "link-sweep R1"); `checks.mjs` C-28.19's comment ("`link-sweep`'s (its R12)"); `schema.mjs`'s `sweep` column comment; `test/m/capture-requests/sweep.test.mjs` registers under "link-sweep" (every site, including the LISTENER_DECLARED holder) and its header and stand-in comments name link-sweep R12 and R1. No change of meaning (N469's rule): comments and a test's module name only. Deferred: none.

**N502/N508 re-scan** of my paths and tests: nothing else stale. `checks.mjs`:6–7 and :297 already name their stamps (1.49.0, 1.50.0, 1.54.0); `index.mjs`:2, `schema.mjs`:2 and test `fixture.mjs`:127 name `legacy-store` as past history; `schema.mjs`:17 names `op-declarations`, a live module. The two `monitoring` words left are not the module: `checks.mjs`:41 (a monitoring re-check as a purpose a source can tell apart) and `index.mjs`:856 (the information bundle's `monitoring:` frontmatter field). No catalogue row added or changed (nothing for red 6).

**Found in other modules / artifacts:**
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) hashes `src/capture-requests/*` as inputs, so this comment-only change stales it: `test/system/fleetbundles.test.mjs` fails bio-plane's D-298 arm, byte identity, manifest sha and the comment-only arm; with my three source files reverted it passes (0 fail). Not regenerated (manifest §14); for BOB's layer-close rebuild.
- `build/requirements/capture-requests.md` Status line still says R45's check is "registered at start by `monitoring`" (its R45 text already says `link-sweep`, its R12). BOB's file; for BOB if wanted.

**Tests and checks** (on `job/T25/capture-requests` @ fe1f5a4ed6):
- `node --test bio-plane/test/m/capture-requests/`: 72 tests, 72 pass, 0 fail.
- whole `bio-plane/test/m`: 5330 tests, 5244 pass, 75 fail, none in capture-requests, all among the accepted reds: case-authoring `preflight` (13), filings `outward`/`packet` (3), network-notices `activity`/`post`/`prepare`/`reads`/`seals` (54), scheduler `consumers`:198 (NOTICE_NO_INSTANCE_KEY), affordances `sources` (reattest through provenance's `attest`): red 7; control-plane `families` and `catalogue-end`: red 8; promotion `write-path` R53 (plane store, as RETRIEVAL #10 recorded): red 9. The four not in the failure counts of the provenance users were also run on the base without my change: same 4 fail.
- `test/system/fleetbundles.test.mjs`: bio-plane stale (above); the other members pass.
- `node checks/format.mjs`: 91 modules, 0 failures. `architecture.mjs … capture-requests`: 10 product files, 0 failures. `coverage.mjs … capture-requests`: 45 of 45 live ids named, 0 failures. `ownership.mjs … capture-requests tranche/T25`: 5 files, 0 failures.

Size (session_0113zrDaPdg9qvGBAGsWubQr): test runs 6, module lines 3565
