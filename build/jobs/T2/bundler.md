# T2 · bundler — job record

Session: `session_015mpX96po6BkGDjNJ5AVwMB` (BUNDLER #1). BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T2`.

**Status** · COMPLETE, 2026-09-26. Branch `job/T2/bundler`, with `tranche/T2` merged in (@ 0f976daa, which carries K41). No open question for BOB.

## Entries applied

- **T2-3** · Requirement-named tests for every live id: `bio-plane/test/m/bundler/bundler.test.mjs`, 19 tests naming R1–R10, each at the interface. Builds run over a fixture member in a temporary directory (two first-party files, one vendored dependency, a lockfile, the declared externals); esbuild comes from the plane's install; R9 runs against a temporary git repository. No test reads source text. Each test was checked to fail against the code as it stood before this job where that code did not meet the requirement (R1, R7, R9, R10).

## Flaws fixed in this module (step 4)

- **R1** · `discoverMembers` gave no entry point; each member now carries `entry` (the marker's `entry`, else its bundle's). The order was `localeCompare`, which depends on the locale; it is now code-point order by name, then directory. A marker that did not parse was silently skipped, so a member could stop being guarded unseen; it is now an error naming the file (a directory with no marker, or a plain file, is still not a member). `planeMember` carries `entry` too.
- **R7** · `verifyFresh` had no "could not check" answer: with the dependencies absent it threw an esbuild error, and nothing in its result distinguished checked from not. It now returns `checked: true` with its findings, or `checked: false` with a `reason` and `findings: null` (never an empty list a caller could read as fresh) when the committed manifest names vendored inputs that are not installed, or when the source does not build here. The legacy gate calls `freshBuildRunnable` first and is unaffected (96 pass as before).
- **R9** · Provenance stated only whether a path is in the commit, staged or untracked; it could not say "changed" (its header said so). `readGitProvenance` now also reads `git diff --relative --name-only HEAD`; `contentStateOf` answers "unchanged", "changed" or "UNVERIFIED" for a committed path; `classifyDiscovered` gives each row a `content` and a `changed` list; `reportProvenance` names changed files on their own line. `stateOf`, `off` and `inCommit` keep their meaning (an arrival, by path), so every legacy walk's reproducible count is unchanged.
- esbuild's own stderr is silenced in `buildMember` (a failure arrives as the thrown error); one `isAllowed` helper replaces the two copies of the externals match.
- The plane pre-step comment named `tools/sign-release.html`; it now names `src/sign-release.html` (K33; forwarded from SIGNATURES #1).

Deferred: none.

## Found elsewhere (REPORT)

- **legacy-tests / not_product, at T7 when `tools/` is retired:** every remedy sentence in `fleet-bundle.mjs` names `node tools/bundles.mjs`, and `bio-plane/test/fleetbundles.test.mjs` arm (j) asserts at least four findings name it. When `tools/bundles.mjs` goes, the remedy should name each member's `npm run build` (as `build/manifest.md` does) and the legacy assertion change with it, in one step. Not changed now: the command exists and changing the text alone turns the legacy gate red.
- **Generated artifacts:** none staled. No member's bundle reads these two files; `fleetbundles.test.mjs` 96 pass, 0 fail after the change.
- **Pre-existing failures, not caused by this job** (identical with this job's changes removed): `bio-plane/test/owed-controls.test.mjs` (47 pass, 2 fail: A10b, A13b); controls `provenance-floor.control.mjs` (58 of 59, arm 3: planning's walk with git unavailable reads `tools/plancheck.mjs`), `walkfloor.control.mjs` (1 arm not as declared), `d301-census.control.mjs` (2 arms not as declared).

## Tests and checks run

- `node --test bio-plane/test/m/bundler/` · tests 19, pass 19, fail 0 (on the merged branch).
- Layer tests: none named in `build/manifest.md`.
- No module in `modules.json` uses `bundler`. Its legacy callers' tests, run before and after the change with identical exit codes: `battery-provenance`, `battery-residue`, `battery-verdict`, `bounds`, `bundles`, `case-opened`, `check-firing`, `coverage-provenance`, `fleetbundles` (96 pass, 0 fail), `gateverdict`, `hygiene`, `identity-claims`, `m025-arm-anchor-witness`, `machine-fences`, `machinefences-dec49`, `op-claims`, `planning-hygiene`, `register-grammar`, `statepaths`, `walkfloor` all exit 0; `owed-controls` exit 1 both times; `fleetbundles.control.mjs` exit 0.
- `checks/format.mjs` · 61 modules, 23 requirements files; 0 failures.
- `checks/architecture.mjs` · 3 product files, 5 relative imports (2 naming no tracked file, not judged); 0 failures.
- `checks/coverage.mjs` · 10 of 10 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` (tranche/T2) · 4 files changed by bundler between tranche/T2 and HEAD; 0 failures.

## Questions to BOB

- **Q1 (R8)** · answered by K41 (R8 reworded: static `import`/`export … from` specifiers; dynamic `import()` checked by `verifyFresh`). The tests follow it.

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_015mpX96po6BkGDjNJ5AVwMB,job,bundler,8861129,137725,124,44510,62,12,797
```
