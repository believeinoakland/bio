# Draft: retiring `legacy-tests` (a recut of its files to real owners)

**Status** · DRAFT by a worker for BOB #89, 2026-10-01, on `tranche/T21` (clean at `origin/tranche/T21`), for BOB's ruling (P17: file ownership, `uses` edges and helper or legacy modules are BOB's, decided and reported). Nothing has been edited except this file.

**Method.** Every tracked file whose owner today is `legacy-tests` was listed with the checks' own `ownerIndex` (most specific path wins), its relative imports resolved with `architecture.mjs`' own `importsOf`/`resolveImport`, and every fixture's readers found by grep (fixtures are read by `fs`, not imported, so no check sees them). The proposed `modules.json` below was then applied in memory and the architecture check's logic, the format check's "uses are earlier" rule and the coverage check's id scan were rerun over the whole tree: **75 files re-owned, 0 unowned, 0 import failures, 0 uses-order failures, and no requirement id newly "covered" by a moved file** (the moved suites' plain `Rn` mentions add no false coverage to any new owner; plane's R11 gap exists today and is unchanged).

**How the checks treat test files** (civicos-process `checks/`): `architecture.mjs` checks *every* owned source file's relative imports, whatever the role (`paths` or `tests`), against its owner: the target must be the owner itself, or earlier in the order and declared in `uses` (`*earlier` for a legacy module only). `ownership.mjs` treats `paths` and `tests` alike as the job's own. `format.mjs` refuses a path string claimed by two modules (a more specific path inside another's directory is allowed). So a test owner must declare every module its test imports, including `test-support` for `stdio.mjs`/`sandbox.mjs`; today no `bio-plane/test/m/` suite imports those two, so most new owners gain `test-support` (index 2, before everything).

**The deleted paths.** All 11 of `legacy-tests`' `paths` are gone from the tree (`civicos-ui/check-refusal-codes.mjs`, `civicos-ui/check-semantics.mjs`, `bio-plane/scripts/{battery,armdecay,budgetsweep,control-register,finallyexit,identity-claims,pensweep,residue}.mjs`, `tools/fw21-onpoint-probe.mjs`). They are dropped with the module; nothing needs a new owner.

## 1. File → owner

`T/` is `bio-plane/test/`. "Imports" lists the file's relative imports with each target's owner; "check" is the result under the proposed `uses`.

### Plane suites and helpers in `bio-plane/test/`

| file | owner | reason | imports → check |
|---|---|---|---|
| `T/cap13-reuse-pages.test.mjs` | capture | CAP-13: `siteAssets`' reuse floor counts document addresses (`documents`, `documents_undetermined`), capture R24, through `op=acquire` | test-support, subresources → ok with `+test-support` (subresources declared) |
| `T/d57selflink.test.mjs` | capture | D-57: `resolveLinks` (capture `index.mjs`:1050, `op=links`) on a self-linked page | test-support, subresources → ok with `+test-support` |
| `T/d526-refusal-order.test.mjs` | promotion | its header: "promotion R39, K84 (2)"; the refusal order of registered checks before the write | test-support → ok with `+test-support` |
| `T/system/row-census.test.mjs` | promotion | promotion R50's census suite (its header; `gate.mjs`:86, :603 name it) | test-support, `row-census.mjs`, promotion's `gate.mjs` → ok with `+test-support` |
| `T/system/row-census.mjs` | promotion | the census computation only `row-census.test.mjs` imports | none |
| `T/fixtures/row-census-1.51.0.jsonl` | promotion | the stamp's lines `row-census.test.mjs` diffs against | data |
| `T/members.test.mjs` | membership | the roster and its sight: `memberadd`, `enroll`, `memberlist`'s cover projection (D-157), `memberset`, `claim`; also logins and sessions (credentials) and the lease stamp (control-plane R38) | test-support → ok with `+test-support`. *Alternative:* credentials (also valid); membership is where most arms land |
| `T/mk6-bundle-names-no-author.test.mjs` | provenance | MK-6: an authored observation (`op=testify`, provenance R28) names its author only as `observer:<testimony id>` in every published part | test-support, `publishingproject.mjs`, `adoptable-reading.mjs` → ok with `+test-support` |
| `T/publishingproject.mjs` | provenance | helper; its only importer is the MK-6 suite | none |
| `T/adoptable-reading.mjs` | provenance | helper; its only importer is the MK-6 suite | none |
| `T/stats-disclosure.test.mjs` | record-core | `op=stats` through the caller's sight, record-core R64/R65 (`stats` at record-core `index.mjs`:999) | test-support → ok with `+test-support` |
| `T/pdfstructure.test.mjs` | pdf-reader | Tier 1 link graph and text extraction of `src/pdfstructure.mjs` | test-support, pdf-reader, subresources → ok with `+test-support` (subresources declared) |
| `T/fixtures/cpdf20/` (4 PDFs, `PROVENANCE.md`) | pdf-reader | real council PDFs read by `pdfstructure.test.mjs` (pdf-reader), `m/extraction/convert-tiers.test.mjs`, `tier2-wire.test.mjs`, `tier-pagewise.probe.mjs` (extraction) and `pdf-worker/test/table-recognition.probe.mjs` (by path). Shared: given to the **earliest** reader, so no reader reads a later module's file | data |
| `T/fixtures/cpdf20/tier2-recorded.json` | extraction | written by `tier-pagewise.probe.mjs`, read by `tier2-wire.test.mjs`, both extraction's; a file entry, more specific than pdf-reader's directory | data |
| `T/fixtures/legistar-agenda-1425405.pdf` | pdf-reader | shared: `pdfstructure.test.mjs` (pdf-reader), `m/extraction/convert-chain.test.mjs`, `m/entities/naming-convert.test.mjs`; earliest reader | data |
| `T/tier2-wire.test.mjs` | extraction | REC-98/D-283: the Tier-2 per-page rule reached through `op=pdfstructure` and `op=acquire` (extraction's ops; `mergeTier2Text` in `extraction/pipeline.mjs`) | test-support, pdf-reader, text-chain → ok with `+test-support`, **`+pdf-reader`** (text-chain declared) |
| `T/tier-pagewise.probe.mjs` | extraction | the measurement that writes `tier2-recorded.json` for `tier2-wire` | pdf-reader, text-chain → ok with `+pdf-reader` |
| `T/system/pdf-worker-binding.test.mjs` | extraction | `op=pdfstructure` escalating to the pdf-worker over the service binding (`needsTier2` in `extraction/pipeline.mjs`) | test-support → ok with `+test-support` |
| `T/d606-perpage-ocr.test.mjs` | extraction | D-606: `tier3Extend` asks the OCR member once per deferred page (extraction R5, its re-pins say so; `OCR_INVOCATIONS_PER_REQUEST` in `extraction/pipeline.mjs`) | test-support, `ocr-worker/test/memberworker.mjs` (ocr-worker) → ok with `+test-support` (ocr-worker declared) |
| `T/fixtures/d460/` (`agenda-p1.pdf`, `agenda-p2.pdf`, `walk-tier3-manifest.json`) | extraction | read by `d606-perpage-ocr.test.mjs` and `m/extraction/convert-ocr.test.mjs` (`ocr-worker` has its own copy); `walk-tier3-manifest.json` has no reader (deletion candidate) | data |
| `T/fixtures/fw20/` (2 PDFs) | extraction | **no reader**: `m/extraction/staffdirectory.test.mjs` reads its own copies in `m/extraction/fixtures/`. Owned here until deleted; recommend extraction's next job deletes it | data |
| `T/ocr-measure-probe.mjs` | ocr-worker | CPDF-9 instrument, "is OCR reachable at all?", calibrated against the plane's `cpu.mjs` burn; not a suite | runtime-limits → ok with **`+runtime-limits`** on ocr-worker. *Alternative:* delete it (a dated measurement, network and npm-installing; nothing runs it) |
| `T/conclude-project.test.mjs` | **queue** (see 4, unsettled) | a project's own conclusion (basis-versions `conclude`, `conclusionOf` R22) **and** its queue item `shared-inquiry-concluded-by-another-project` (queue-producers / `queuestate.mjs`) | test-support, `docdates.mjs`, `src/queuestate.mjs` (**queue**, index 77) → ok under queue with `+test-support`; **invalid under basis-versions** (queue is later) |
| `T/docdates.mjs` | with `conclude-project.test.mjs` | helper; its only importer | none |

### System and release suites in `bio-plane/test/` (bundler, installer, plane)

| file | owner | reason | imports → check |
|---|---|---|---|
| `T/system/fleetbundles.test.mjs` | bundler | FL-9: each member's committed artifact is fresh (`scripts/fleet-bundle.mjs`) | test-support, bundler, signatures (`embed-signpage.mjs`) → ok with `+test-support` (signatures declared) |
| `T/fleetbundles.control.mjs` | bundler | the negative-control driver of `fleetbundles.test.mjs` (agent-worker's controls mention it in comments only) | none |
| `T/system/deploybindings.test.mjs` | bundler | D-202: `scripts/derive-bindings.mjs` | test-support, bundler, `T/jsonc.mjs` → ok with `+test-support` |
| `T/jsonc.mjs` | bundler | helper; its only importer is `deploybindings`. Note: bundler already owns `bio-plane/scripts/jsonc.mjs`, so its job may re-point the suite and delete this copy | none |
| `T/system/resolveversion.test.mjs` | bundler | DS-2/D-116: `scripts/resolve-version.mjs` | test-support, bundler → ok with `+test-support` |
| `T/system/bundle.test.mjs` | bundler | `livefire` against the shipped `dist/bio-plane.bundled.mjs`: the bundle runs. *Alternative:* plane (it is the plane's artifact) | test-support → ok with `+test-support` |
| `T/system/newgroup-bundle-fresh.test.mjs` | installer | DIST-13: `newgroup/dist/newgroup.bundled.mjs` equals a fresh build of `newgroup/src` | test-support → ok with `+test-support`. (May move to `newgroup/test/` in installer's job; not needed for ownership) |
| `T/system/migrate-released.test.mjs` | plane | boots each released `bio-plane.bundled.mjs` from git and migrates forward: the migration pass (plane R3) | test-support → ok with `+test-support` |

### UI suites (`civicos-ui/test/`) and the two plane-test helpers only they use

| file | owner | reason | imports → check |
|---|---|---|---|
| `civicos-ui/test/` (all 32 files: 29 `.test.mjs`, `extract.mjs`, `analyst-vocabulary.mjs`, `run.mjs`) | legacy-ui | each tests `app.html` (`extract.mjs` pulls its script) or the UI's own runner; none is clearly another module's. `stdio-census.test.mjs` is a census of the UI estate's suites (D-282), still the UI's | test-support, bundler (`scripts/provenance.mjs`), affordances, queue, queue-producers, and the two helpers below → ok (`*earlier`; all earlier than legacy-ui at 83) |
| `civicos-ui/test/fixtures/fw18-doctypes.json`, `fw20-staff-directory.json` | legacy-ui | **no reader**: docprofile's suites read their own copies in `docprofile/test/fixtures/`. Deletion candidates | data |
| `T/budget.mjs` | legacy-ui | M0-107 helper; importers are `review-copy.test.mjs` and `statement-ack.test.mjs` only | none |
| `T/caseceremony.mjs` | legacy-ui | CASE-5b helper; its only importer is `several-cases-choice.test.mjs` | none |

The UI check scripts (`check-refusal-codes.mjs`, `check-semantics.mjs`) are deleted; `civicos-ui/check-mock-envelope.mjs` is already legacy-ui's by `paths`.

## 2. The `modules.json` edit

As a JSON-patch description (paths by module id; append to the end of each list):

```json
[
  { "op": "add", "path": "/modules[id=legacy-ui]/tests/-", "value": ["civicos-ui/test/", "bio-plane/test/budget.mjs", "bio-plane/test/caseceremony.mjs"] },

  { "op": "add", "path": "/modules[id=pdf-reader]/tests/-", "value": ["bio-plane/test/pdfstructure.test.mjs", "bio-plane/test/fixtures/cpdf20/", "bio-plane/test/fixtures/legistar-agenda-1425405.pdf"] },
  { "op": "add", "path": "/modules[id=pdf-reader]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=bundler]/tests/-", "value": ["bio-plane/test/system/bundle.test.mjs", "bio-plane/test/system/deploybindings.test.mjs", "bio-plane/test/system/fleetbundles.test.mjs", "bio-plane/test/system/resolveversion.test.mjs", "bio-plane/test/fleetbundles.control.mjs", "bio-plane/test/jsonc.mjs"] },
  { "op": "add", "path": "/modules[id=bundler]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=ocr-worker]/tests/-", "value": ["bio-plane/test/ocr-measure-probe.mjs"] },
  { "op": "add", "path": "/modules[id=ocr-worker]/uses/-", "value": "runtime-limits" },

  { "op": "add", "path": "/modules[id=record-core]/tests/-", "value": ["bio-plane/test/stats-disclosure.test.mjs"] },
  { "op": "add", "path": "/modules[id=record-core]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=membership]/tests/-", "value": ["bio-plane/test/members.test.mjs"] },
  { "op": "add", "path": "/modules[id=membership]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=promotion]/tests/-", "value": ["bio-plane/test/d526-refusal-order.test.mjs", "bio-plane/test/system/row-census.test.mjs", "bio-plane/test/system/row-census.mjs", "bio-plane/test/fixtures/row-census-1.51.0.jsonl"] },
  { "op": "add", "path": "/modules[id=promotion]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=provenance]/tests/-", "value": ["bio-plane/test/mk6-bundle-names-no-author.test.mjs", "bio-plane/test/publishingproject.mjs", "bio-plane/test/adoptable-reading.mjs"] },
  { "op": "add", "path": "/modules[id=provenance]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=capture]/tests/-", "value": ["bio-plane/test/cap13-reuse-pages.test.mjs", "bio-plane/test/d57selflink.test.mjs"] },
  { "op": "add", "path": "/modules[id=capture]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=extraction]/tests/-", "value": ["bio-plane/test/d606-perpage-ocr.test.mjs", "bio-plane/test/tier2-wire.test.mjs", "bio-plane/test/tier-pagewise.probe.mjs", "bio-plane/test/system/pdf-worker-binding.test.mjs", "bio-plane/test/fixtures/d460/", "bio-plane/test/fixtures/fw20/", "bio-plane/test/fixtures/cpdf20/tier2-recorded.json"] },
  { "op": "add", "path": "/modules[id=extraction]/uses/-", "value": ["test-support", "pdf-reader"] },

  { "op": "add", "path": "/modules[id=queue]/tests/-", "value": ["bio-plane/test/conclude-project.test.mjs", "bio-plane/test/docdates.mjs"] },
  { "op": "add", "path": "/modules[id=queue]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=plane]/tests/-", "value": ["bio-plane/test/system/migrate-released.test.mjs"] },
  { "op": "add", "path": "/modules[id=plane]/uses/-", "value": "test-support" },

  { "op": "add", "path": "/modules[id=installer]/tests/-", "value": ["bio-plane/test/system/newgroup-bundle-fresh.test.mjs"] },
  { "op": "add", "path": "/modules[id=installer]/uses/-", "value": "test-support" },

  { "op": "remove", "path": "/modules[id=legacy-tests]",
    "note": "the whole entry: its 11 paths are all deleted; its tests bio-plane/test/ and civicos-ui/test/ are replaced by the entries above" },

  { "op": "replace", "path": "/status", "value": "<current text> + AMENDED by a worker for BOB #89 on tranche/T21, 2026-10-01 (K…): legacy-tests retired, its files re-owned …" }
]
```

New `uses` edges, all to earlier modules: `test-support` on pdf-reader, bundler, record-core, membership, promotion, provenance, capture, extraction, queue, plane, installer; `pdf-reader` on extraction; `runtime-limits` on ocr-worker.

**What must change with it, outside `modules.json`** (the checks or tests fail otherwise):

1. **`build/layers.md`**: layer 11's row drops `legacy-tests` (`format.mjs` compares each layer row to `modules.json`); the legacy-modules table's `legacy-tests` row is marked retired, as legacy-checks', legacy-store's and legacy-index's are.
2. **`bio-plane/src/membership/index.mjs`:183**: `MODULE_ORDER` lists `"legacy-tests"`, and membership R83's test (`bio-plane/test/m/membership/module-order.test.mjs`) holds the list equal to `modules.json`. Dropping the module turns that test red until membership's job removes the id. The committed `bio-plane/dist/bio-plane.bundled.mjs` (line 18501) carries the list, so the bundle is rebuilt with it (bundler R7 freshness, `fleetbundles.test.mjs`). So it lands as one change: the `modules.json` edit plus membership's one-line removal and the rebuild.
3. Stale comments only, with no effect on any check: `bio-plane/src/gate.mjs` (:191–:431 "legacy-tests' re-pin", :603 "legacy-tests' census suite") is promotion's to reword at its next job. The `(T3, legacy-tests; …)` provenance notes in the moved suites are history and can stay.

**The `regression` workflow** (`.github/workflows/regression.yml`, `workflow_dispatch` only; `.github/` is not_product). It `npm ci`s and `npm test`s each package (bio-plane's `npm test` is `test/m/**/*.test.mjs` only), then a "kept suites" step runs `node --test bio-plane/test/*.test.mjs bio-plane/test/system/*.test.mjs civicos-ui/test/*.test.mjs`. It names legacy-tests **only in a comment** ("The suites outside test/m that T20 kept (N466, K932; LEGACY-TESTS #18)"). No files move under this recut, so its globs still run exactly the same suites. The only edit is optional: reword the comment to "the suites outside `test/m`, each owned by its module (K…)". Note that `.probe.mjs`, `.control.mjs` and the helpers are not run, as today.

## 3. Unsettled, with a recommendation

- **`conclude-project.test.mjs`**: by behaviour it is mostly basis-versions' (the per-project `conclude` and `conclusionOf`, R22), but it imports `queuestate.mjs` (queue, layer 11) for one arm about the queue item it raises. So basis-versions cannot own it as it stands. **Recommend queue** (valid now, and the suite really drives `op=queue`/`op=queuemute`). Alternative: basis-versions, after its job drops the `queuestate.mjs` import (two literal assertions) and moves the "told, never moved" arm to queue's tests.
- **`members.test.mjs`**: membership (recommended) or credentials. Both are valid. It is the roster's suite, with sessions mixed in.
- **`bundle.test.mjs`**: bundler (recommended, the artifact's suite) or plane.
- **`ocr-measure-probe.mjs`**: ocr-worker with `+runtime-limits` (recommended), or delete it as a spent measurement.
- **Orphan fixtures** (no reader anywhere): `bio-plane/test/fixtures/fw20/`, `bio-plane/test/fixtures/d460/walk-tier3-manifest.json`, `civicos-ui/test/fixtures/fw18-doctypes.json` and `fw20-staff-directory.json`. Owned as above so nothing is unowned. Recommend deleting them in the owners' next jobs.
- **Shared fixtures** (`cpdf20/`, `legistar-agenda-1425405.pdf`) go to pdf-reader as the earliest reader. Extraction's, entities' and pdf-worker's suites read them by path, which no check judges, and which reads an earlier module's file. The other option is test-support. That is not recommended, because test-support's R-ids would have to state fixtures it does not test.

## 4. scheduler R10's `todo`: can it be armed?

**Yes.** Its stated condition is met.

- The todo (`bio-plane/test/m/scheduler/rank.test.mjs`:80) waits on "monitoring R19/R20 take it in its own T11 job, N224, and the ordering is each owner's to test".
- `build/requirements/monitoring.md` R19 and R20 carry their N224 clauses (`cadenceTick(now, rank)`, `archiveTick(now, rank)`) with **no** `(not yet met …)` mark. Neither does scheduler R10.
- The code takes the rank: `monitoring/index.mjs`:1514 `archiveTick(now, rank = null)` and :1587 `cadenceTick(now, rank = null)`. Scheduler hands it to the four `RANKED` consumers (`scheduler/index.mjs`:123, :126, :256).
- Each owner tests the ordering, and all pass on this tree:
  - monitoring `ticks.test.mjs`:71 "R19 (N224) given the scheduler's rank … checks its batch in the rank's order" and :148 "R20 (N224) … takes its batch in the rank's order";
  - capture-requests `drain.test.mjs`:512 (R12);
  - bias `debt.test.mjs`:280 (R33).
- Run here: `node --test test/m/monitoring/ticks.test.mjs test/m/scheduler/rank.test.mjs` gives 20 pass, 0 fail, 1 todo.

To arm it, scheduler's job replaces the todo with a real test. Two ways:

- **Narrow:** build the rank as the alarm does (`world(...)` and `onAlarm`, as the test at :55 does), hand it to a stub consumer whose due work exceeds its batch, and assert the batch taken is the rank's head.
- **Composed (preferred):** scheduler uses monitoring, so it may import monitoring's test fixture (`bio-plane/test/m/monitoring/fixture.mjs`). The test drives the real `cadenceTick` with the scheduler's rank over more due subjects than one batch, and asserts the checked set is the rank's first batch. Either way, the todo's "(not yet met …)" text goes, and nothing in `scheduler.md` needs a mark changed.
