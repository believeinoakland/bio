# case-authoring (T30)

**Status** · session_01KRZJePotSWg7xtiYtCJpak · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied.** N536 (B1): the dependency hand-through in `caseAuthoringOf` and the `get attestation()` pass-through are dropped.
- `CaseAuthoring`'s constructor no longer takes `contradiction`, `provenance`, `attestation`, `capture`, `sources`, `extraction`, `caseImport` or `promotion`. Its private `#handed` is gone. The `disclosures` getter is `caseDisclosuresOf(host)`: the one instance on the host, which the composition builds. The plane builds it first, at store.mjs 179, K1355. A test may still hand `disclosures` in.
- `get attestation()` is gone. Nothing read it through this module. The `w.attestation` reads in `preflight.test` are the fixture's own `attestationOf` instance and are unchanged. The plane's `split.test` and `disclosures.test` read `caseDisclosuresOf(ctx).attestation`.
- The fixture now builds `caseDisclosuresOf(host, {...})` before `caseAuthoringOf`, as the plane does. A test's stand-in for a module that case-disclosures reads goes to it: `deps: {attestation}` in preflight, `deps: {contradiction}` in tensions, disclosures and preflight. `inquiry` and `strength` go to both modules, and every other dep goes to case-authoring. The header comment says the same.

**Deferred.** None.

**Found in other modules.**
- `bio-plane/dist/bio-plane.bundled.mjs` is stale, because its input `src/case-authoring/index.mjs` changed. `fleetbundles.test` says STALE BUNDLE for bio-plane; every other member passes. It is owned by `not_product`, and you regenerate it at the layer close (mechanics §14). I did not write it.
- Requirements, for your file only: `build/requirements/case-authoring.md`'s Suggestions P6 still says "Until `plane` re-points, a one-line `get attestation()` passes through". That is now history. Its header at line 47 of index.mjs no longer describes a hand-through. No requirement changes meaning.

**Tests and checks.**
- `node --test bio-plane/test/m/case-authoring/`: tests 122, pass 122, fail 0.
- Users and neighbours (`test/m/<dir>/`):

  | module | pass | fail |
  |---|---|---|
  | plane | 76 | 0 |
  | review | 35 | 0 |
  | affordances | 156 | 0 |
  | control-plane | 147 | 0 |
  | case-disclosures | 46 | 0 |
  | publication | 108 | 0 |

- `civicos-ui/test/statement-ack.test.mjs`: 11 pass, 1 fail. The failure is the recipient's acknowledgement timing out, the inherited DEC-88 UI red. It is identical on the base with my change stashed.
- `bio-plane/test/system/fleetbundles.test.mjs`: 1 fail, the stale bio-plane bundle above.
- No layer tests are named in the manifest.
- format: 97 modules, 96 requirements files; 0 failures.
- architecture: 22 product files, 117 relative imports; 0 failures.
- coverage: 39 of 39 live requirement ids named by a test; 0 failures.
- ownership: 3 files changed by case-authoring between tranche/T30 and HEAD; 0 failures.

Size (session_01KRZJePotSWg7xtiYtCJpak): test runs 13, module lines 2924
