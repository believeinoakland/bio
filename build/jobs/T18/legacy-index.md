# legacy-index (T18)

**Status** · session_01LkPKEan57umKVtgyg8qesS · depth 2 · COMPLETE · handled B2

## Work

**Approved by Bob in this session (2026-10-01): the NEEDS BOB act below is cleared and done.** (Was: NEEDS BOB: approve the `git rm` of `bio-plane/migrate/`, `scripts/coverage.mjs`, `scripts/declared-source.mjs` and the four dead probes; the permission check had refused it.)

**Entry applied (current.md layer 11, legacy-index; nothing deferred):**
- N401 (K582): `bio-plane/migrate/` deleted (`migrate.mjs` 609, `local-plane.mjs` 12, `README.md` 74); `package.json`'s `test:migrate` gone. `migrate/README.md` was in `not_product`: BOB drops it from `not_product` and `migrate/` from legacy-index's `paths`.
- K636 BOB-4: `scripts/coverage.mjs` (2,614) and `scripts/declared-source.mjs` (140) retired, with `package.json`'s `test:coverage`. Checked first: `regression.yml` runs `npm test` (`battery.mjs`), which discovers `test/*.test.mjs` and fleet suites and reads neither; no product file, `test/m/` test, bundle input or workflow imports either. `scripts/budgetsweep.mjs` drops `coverage.mjs`' ledger row and runner name; `battery.mjs`' VF-3 comment says it is retired.
- K649 (8): the four dead probes deleted (`d460-fixture` 83, `d460-perpage-ocr` 132, `fw20-decode-census` 158, `ua-probe` 123; 496).
- T17's finding: `package.json` drops the 61 scripts naming a file no longer in the repository (`test:store`, `test:capture`, … `probe:cite`, `bench`). `battery.mjs` names no removed suite: it discovers suites from the directory.
- `src/index.mjs` not edited. No catalogue row moved or changed: nothing `awaiting stamp`.
- Removed in all: ~3,960 lines (deleted files 3,945, `package.json` 63).

**Found in other modules (REPORT):**
- Old suites now broken by the removals, unrun (K619, K653): `test/migrate.test.mjs`; `test/system/hygiene.test.mjs` names `migrate/migrate.mjs` in two lists; `test/instrument-deps.mjs` defaults to `coverage.mjs`; the nc-*/control drivers and suites that spawn `coverage.mjs` (legacy-tests').
- Comments naming the retired files as live: `agent-worker/src/index.mjs`:244, `fleet-member.json` of agent-worker, ocr-worker and pdf-worker, `ocr-worker/src/index.mjs`:54, `contract.mjs`:10, `wrangler.jsonc`:9, `pdf-worker/src/index.mjs`:55, :61, `bio-checks.mjs` (three), `control-plane/checks.mjs`:477 and `index.mjs`:2999, :3031 (`migrate.mjs` as replay's sender: control-plane's K582 share), `civicos-ui/app.html` (`fw20-decode-census.mjs`, legacy-ui).
- Pre-existing, not this job's: `node bio-plane/test/system/fleetbundles.test.mjs` fails one arm, "agent-worker's 153 inputs are all recorded", identically on `origin/tranche/T18` without this change (agent-worker's input pin, stale since R48 stopped importing the catalogue, K683): agent-worker's or the layer close's regeneration.

**Tests and checks.** No module tests (`tests: []`). `fleetbundles.test.mjs` (the manifest's verify): every arm passes but the one above, which fails the same on the tranche branch. From the process repository: `format`: 82 modules, 77 requirements files; 0 failures. `architecture legacy-index`: 21 product files, 35 relative imports; 0 failures. `coverage legacy-index`: 0 of 0 live ids; 0 failures. `ownership legacy-index tranche/T18`: 13 files changed; 0 failures.

Size (session_01LkPKEan57umKVtgyg8qesS): test runs 3, module lines ~3,960 deleted, 3 written.
