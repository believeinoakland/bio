# inquiry-grammar (T20)

**Status** · session_01FE7geAT18GTqA8kB2o6acr · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (B1 START; `build/plan/current.md` T20 layer 6, K850; CONTROL-PLANE #10 J3 (1)). R7's table is renamed `INQUIRY_GRAMMAR_ROWS` → `INQUIRY_GRAMMAR_CHECKS` in `bio-plane/src/inquiry-grammar/checks.mjs`, rows, numbers, `where`s and translations unchanged (no row changes, nothing `awaiting stamp`); `index.mjs` re-exports the new name. The old name is kept in both files, one line each, headed as kept for its readers, as the same frozen object (`INQUIRY_GRAMMAR_ROWS = INQUIRY_GRAMMAR_CHECKS` in `checks.mjs`; `export { INQUIRY_GRAMMAR_ROWS } from "./checks.mjs"` in `index.mjs`). Its deletion waits for the last of its readers to re-point; BOB places it.

**Re-scan for readers** of the old name (`bio-plane/src`, `bio-plane/test/m`, `agent-worker/`, also `bio-plane/checks`, `bio-plane/scripts`): exactly the ones B1 names, no other: `src/control-plane/families.mjs`:94 (comment :93), `src/inquiry/grammar.mjs`:9, :20, `test/m/inquiry/grammar.test.mjs`:198, `src/skilldoctrine.mjs`:90, :253, `test/m/skills/fixture.mjs`:12, :21 (comment :19). None in `agent-worker/`.

**Composition unchanged.** `families.mjs` spreads this file's namespace and adds `INQUIRY_GRAMMAR_CHECKS: INQUIRY_GRAMMAR_ROWS`; after the rename the namespace already carries `INQUIRY_GRAMMAR_CHECKS`, the alias overrides it with the same object, and `INQUIRY_GRAMMAR_ROWS` has no `_CHECKS` suffix so `compose()` skips it. `CHECK_FAMILIES` is the same; control-plane can drop its alias with no other change (its L11 job).

**Tests.** `test/m/inquiry-grammar/grammar.test.mjs` re-pointed to `INQUIRY_GRAMMAR_CHECKS` (the destructure, R7, R8, R10), and one new test: "R7 the old name INQUIRY_GRAMMAR_ROWS … is the same frozen object as INQUIRY_GRAMMAR_CHECKS, from both faces, and is not a `*_CHECKS` family" (both `index.mjs` and `checks.mjs`: `===`, frozen; the file's suffix-found families are exactly `INQUIRY_GRAMMAR_CHECKS`, `LEAD_CHECKS`). No old suite deleted (K619).

**Deferred.** Nothing in this module.

**Found in other modules, for BOB.**
1. *Generated artifact staled:* `bio-plane/dist/bio-plane.bundled.mjs` / `.bundle.json` (`not_product`) hashes `src/inquiry-grammar/checks.mjs` and `index.mjs`; both changed, so the plane bundle is stale until BOB regenerates it at the layer close (manifest §14). No other member's bundle reads these files.
2. *Pre-existing:* `node --test bio-plane/test/system/fleetbundles.test.mjs` fails (1 test, 0 pass, 1 fail) identically on the untouched branch (stashed, at `c7999af3f2`): its pdf-worker arm's expected input list still names `../bio-plane/checks/bio-checks.mjs` and other legacy paths. Not this change; it belongs to whoever owns that system test / the pdf-worker manifest.
3. `src/inquiry/grammar.mjs` (`INQUIRY_ROWS = INQUIRY_GRAMMAR_ROWS`) and its test can re-point to `INQUIRY_GRAMMAR_CHECKS` now (inquiry's L6 job); skills' `skilldoctrine.mjs`:90, :253 and `test/m/skills/fixture.mjs`:12, :21 (no T20 job) are then the last readers of the alias besides control-plane's L11 alias.

**Tests and checks run** (from `/home/user/bio`, process repo at `/home/user/civicos-process`):
- `node --test test/m/inquiry-grammar/` (in `bio-plane/`): tests 24, pass 24, fail 0.
- Readers of the name (the service changed in name only, alias kept): `test/m/inquiry/` tests 157, pass 156, fail 0, todo 1 (inquiry's own R31, MK-5, pre-existing); `test/m/skills/` tests 39, pass 39, fail 0; `test/m/control-plane/` tests 85, pass 85, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs /home/user/bio`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio inquiry-grammar`: 8 product files, 21 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio inquiry-grammar`: 10 of 10 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio inquiry-grammar tranche/T20`: 4 files changed by inquiry-grammar between tranche/T20 and HEAD; 0 failures.

Size (session_01FE7geAT18GTqA8kB2o6acr): test runs 7, module lines 1447

## J1 · COMPLETE

Applied B1: INQUIRY_GRAMMAR_ROWS renamed INQUIRY_GRAMMAR_CHECKS in checks.mjs (rows, numbers, wheres, translations unchanged; nothing awaiting stamp); index.mjs re-exports it. The old name is kept, one line in each file, as the same frozen object, for its readers (control-plane families.mjs:94, inquiry grammar.mjs:9,:20 and its test :198, skilldoctrine.mjs:90,:253, skills fixture.mjs:12,:21; re-scan found no other). Its deletion waits for the last of those readers to re-point; BOB places it. CHECK_FAMILIES is unchanged (control-plane can drop its alias with no other edit). Tests re-pointed, plus one asserting the alias is the same object from both faces and the file's suffix families are exactly INQUIRY_GRAMMAR_CHECKS and LEAD_CHECKS. inquiry-grammar 24/24; inquiry 156 pass 0 fail (1 pre-existing todo), skills 39/39, control-plane 85/85; format, architecture, coverage (10/10), ownership: 0 failures. STALED: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (hash inquiry-grammar/checks.mjs and index.mjs). Pre-existing, not mine: fleetbundles.test.mjs fails identically on the untouched branch (pdf-worker arm still expects legacy paths such as checks/bio-checks.mjs). Ready to merge: inquiry's L6 job can re-point now. Record: build/jobs/T20/inquiry-grammar.md.
