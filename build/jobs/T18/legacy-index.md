# legacy-index (T18)

**Status** · session_01LkPKEan57umKVtgyg8qesS · depth 2 · NEEDS BOB · handled B2

## Work

**NEEDS BOB:** approve, in this session (LEGACY-INDEX #11), the deletion of these legacy-index files with `git rm`: `bio-plane/migrate/` (`migrate.mjs`, `local-plane.mjs`, `README.md`), `bio-plane/scripts/coverage.mjs`, `scripts/declared-source.mjs`, and the four dead probes `scripts/d460-fixture.mjs`, `d460-perpage-ocr.mjs`, `fw20-decode-census.mjs`, `ua-probe.mjs`. Why: the entry (N401/K582, K636 BOB-4, K649 (8)) is these deletions; the permission check refused `git rm` of them as irreversible local destruction. They stay recoverable from git history.

Done meanwhile: `bio-plane/package.json` loses the 61 scripts that name a file no longer in the repository (T17's finding). Waiting on the approval: `test:migrate` and `test:coverage` (they name files the refused act deletes), and the stale `coverage.mjs` row and runner name in `scripts/budgetsweep.mjs` and the comments naming it in `scripts/battery.mjs`.

Checked before deleting: `regression.yml` runs `npm test` (`battery.mjs`), which discovers `test/*.test.mjs` and fleet suites and reads neither `coverage.mjs` nor `declared-source.mjs`; no product file, no `test/m/` test and no workflow imports any file to be deleted. Importers left are old suites (not run, K619), `test/system/hygiene.test.mjs` naming `migrate/migrate.mjs`, and comments elsewhere.

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: approve, in LEGACY-INDEX #11 (session_01LkPKEan57umKVtgyg8qesS), the git rm of bio-plane/migrate/ (migrate.mjs, local-plane.mjs, README.md), bio-plane/scripts/coverage.mjs, scripts/declared-source.mjs and the four dead probes (d460-fixture.mjs, d460-perpage-ocr.mjs, fw20-decode-census.mjs, ua-probe.mjs). Why: the entry is these deletions (N401/K582, K636 BOB-4, K649 (8)); the permission check refused them as irreversible local destruction. Done meanwhile and pushed: package.json drops the 61 scripts naming absent files. The rest (test:migrate, test:coverage, budgetsweep's coverage row, battery.mjs comments) waits on the approval. Nothing else in the entry is independent of it.
