<!-- Seam read for publication (K617, K649 (3)), written for BOB #75 on 2026-09-30 on tranche/T18 by a worker. Uncommitted; BOB reviews it. -->
# publication — split proposal (seam read)

**Status** · DRAFT for BOB #75, 2026-09-30, on `tranche/T18`. Why: publication is 6,185 lines of own code, past K617's mark, and K649 (3) asks whether a seam through `publication/index.mjs` holds K637's test before layer 8, so that publication's entries can run in T18. Read whole: `bio-plane/src/publication/` (every file), `container.mjs`, `inband.mjs`, `deliverer.mjs`, `build/requirements/publication.md`, publication's `modules.json` entry and users, `layers.md`, K617, K624, K625, K637. Every method's calls and SQL tables were listed by script and the moving ones read.

**Answer.** A three-way split holds for T18: **`case-grammar`** (before publication, ~425), **`publication`** (~3,700), **`public-read`** (after publication, ~1,915) and **`project-stage`** (after publication, ~340). No new module reads a table publication writes except through a stated read contract (R40, widened), and it calls only public methods publication already has. Publication calls nothing in either later module, and its only use of `case-grammar` is a set of pure functions it re-exports. Nobody reads anybody else's private state. One condition, §6: `filings`' single registration line and two of its tests re-point in filings' own layer-9 job, and publication keeps a 17-line named copy of `registerEvidenceBlock` until then (K625).

## 1. What the module is today

| file | lines | what | goes to |
| --- | --- | --- | --- |
| `publication/index.mjs` | 3,943 | the `Publication` class (every store-side service and op), its constants, the factory and `publicationOps` | split four ways (§3) |
| `publication/worker.mjs` | 711 | the Worker half: `bindPublishedPlane`, `publishedRoutes` (`op=publishedcase`, `op=publishedbytes`), `assembleCaseContainer`, the C-68.5/C-98 raisers | public-read |
| `publication/schema.mjs` | 672 | the 12 tables, migrations, purge lists | publication |
| `publication/checks.mjs` | 277 | R20's formats and predicates (lines 14–48); the rows C-44.2, C-68.5, C-98, C-92.1–.9, C-122.1 | formats → case-grammar; rows stay (§6) |
| `publication/blocks.mjs` | 164 | pure: the `/5` `captures:`/`sources:` block writers and reader | case-grammar |
| `publication/tensions.mjs` | 100 | pure: the `/5` tension-section reader | case-grammar |
| `container.mjs` | 195 | the stored ZIP (R15), uses `ooxml`'s `crc32` | public-read |
| `inband.mjs` | 68 | `inbandQuartet` (R16) | public-read |
| `deliverer.mjs` | 55 | `delivererOf`, `deliveringPrincipal` (R14) | publication (the case document's reads and `caseEditionState` use it) |
| **total** | **6,185** | | |

**Why a two-way cut does not get it under the mark.** The worker files (worker, container, inband: 974) plus the store-side public read path in `index.mjs` (~870) come to ~1,840 lines, which leaves ~4,345. Taking out `project-stage` as well leaves ~4,080. So three cuts are needed, as for control-plane (K624 (2)). The third, `case-grammar`, is pure code, sits earlier in the order and is re-exported by publication, so it costs no importer anything.

## 2. The order (P4)

Layer 8 becomes: **`case-grammar`, `publication`, `public-read`, `project-stage`**, `ratification`, `case-authoring`, `review`. No layer changes.

- `case-grammar` uses `legacy-checks` (`parseFrontmatter`, `createSha256` through its record-grammar re-export). It reads no table, holds no store, and uses nothing later.
- `publication` gains `case-grammar`. It loses `signatures` and `ooxml`, because `index.mjs` imports neither; only `worker.mjs` (`sshsig`) and `container.mjs` (`crc32`) did.
- `public-read` uses `legacy-checks`, `signatures`, `ooxml`, `case-grammar` and `publication`. Its code runs publication's public `caseEditionState`, `soleCase` and `caseDocMemberFrozen`, publication's `checks.mjs` (`rowOf`) and `deliverer.mjs`, and publication's tables under R40.
- `project-stage` uses `legacy-checks`, `record-core`, `membership`, `inquiry`, `basis-versions` and `publication` (R40's tables).
- The declared users gain edges: `legacy-store` gains `public-read` and `project-stage` (the op map); `legacy-index` gains `public-read` (its `src/index.mjs` imports `worker.mjs`, whose path does not change); `control-plane` gains `public-read` (it imports `inband.mjs`); `filings` gains `public-read` (R36); `legacy-tests` may use anything. `ratification` and `case-authoring` may keep importing the grammar from publication's re-export.

## 3. What goes where (line numbers in `publication/index.mjs` today)

### 3.1 `case-grammar` (new, before publication; ~425 lines)

**Purpose.** The case document's grammar, one spelling for every module: the formats and their predicates, the `/5` blocks and the tension section, the section locators and the attribution run's text, and the edge set a finding "rests on". Pure: text in, values out. It never throws.

| moved | from | lines |
| --- | --- | --- |
| `CASE_DOCUMENT_FORMAT`…`_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `formatOf` and the four predicates | `checks.mjs` 14–48 | ~35 |
| `fmSafe` | 188–190 | 3 |
| `SECTIONS`, `REAUTHORABLE_SECTIONS` | 208–232 | 25 |
| `signedCitations` | 244–251 | 8 |
| `ATTRIBUTION_LEVELS`, `ATTRIBUTION_PROSE_HEAD`, `attributionFrontmatterLines`, `attributionBodyLines` | 253–291 | 39 |
| `publishedGraphEdges` (D-431) | 293–320 | 28 |
| `blocks.mjs`, `tensions.mjs` whole | file-level paths, **the files stay where they are** (the pdf-worker precedent, K70) | 264 |

The new code goes in `bio-plane/src/case-grammar/index.mjs`. `blocks.mjs` and `tensions.mjs` change one import each, from `./checks.mjs` to `../case-grammar/index.mjs`. Publication's `index.mjs` and `checks.mjs` re-export all of it unchanged, so `ratification/checks.mjs`, `ratification/ops.mjs`, `case-authoring/document.mjs`, `control-plane`'s `M_PUBLICATION` namespace and the tests import exactly what they import today.

**Ids.** R20 whole. The spellings behind R17's `attributionStatements` and R21's `reauthorSection` get new ids here, while R17 and R21 themselves stay in publication, unchanged in meaning. `publishedGraphEdges` (unnumbered today, `ratification` R5's scope arm and publication R38) gets a new id. Also: Purpose, and R28 and R34 copied. **Tests:** the R20 arms of `casedoc`, `sources` and `tensions`; the attribution-renderer and `REAUTHORABLE_SECTIONS` arms.

### 3.2 `public-read` (new, after publication; ~1,915 lines)

**Purpose.** The published record served to anybody without a credential, and its packaging: the public reads by hash, by finding, by case, and the whole projection; the Worker's public routes and relays; the container and the in-band quartet; the evidence-package block beside a published case.

| moved | lines in `index.mjs` | size |
| --- | --- | --- |
| R36: `registerEvidenceBlock`, `#evidencePackage` | 406–437 | 32 |
| `publishedManifest` (R11) | 2413–2563 | 151 |
| `#frozenPairsByCase` | 2584–2620 | 37 |
| `verifySha`, `publishedList`, `publishedEditions`, `publishedCase` (R8–R10) | 2915–3367 | 453 |
| `#deliveredBy` (a one-line copy over `deliverer.mjs`; publication keeps its own) | 3369–3376 | 8 |
| `#looseEditionState` | 3377–3429 | 53 |
| `#resolveOneCase` (C-44.2's raiser) | 3531–3574 | 44 |
| `#casesOfSha` (its comment 3575–3650, body 3701–3714) | | 90 |
| op entries `publishededitions`, `publishedcase`, `publishedmanifest`, `verify`, `publishedlist` | 3922–3937 | ~8 |
| new: header, `PublicRead` class shell, `publicReadOf(host, deps)`, `publicReadOps` | | ~70 |
| `worker.mjs`, `container.mjs`, `inband.mjs`, at file-level paths, **not moved** | | 974 |

The store side is `bio-plane/src/public-read/index.mjs`.

**Tables read, all publication's, none written.**
- R40's tables as listed: `published_bundles`, `published_cases`, `published_case_members`, `cases`.
- Two more R40 does not list yet: `published_edges` (`publishedCase`'s graph) and `published_shas` (`verifySha`, `publishedManifest`).
- Columns of the listed tables that R40 does not name yet: `published_cases.bar, scope, manifest, manifest_sha`; `published_bundles.*`; `published_case_members.ord, version_sha, role`.

**Writes.** None. The one write on this path, `caseEditionState`'s `ratified_at` stamp when a case edition completes, stays publication's own code, run as publication's service (R24's "every write stays this module's" holds). `recordCaseManifest` (R15's third sentence) stays publication's; `assembleCaseContainer` reaches it through the op, as today.

**Ids.**
- **Moved:** R8, R9, R10, R11, R13, R16, R36 and R48 (the Worker's relays), plus R15's first two sentences (the container and its assembly).
- **Stays in publication:** R15's third sentence (`recordCaseManifest`).
- **Copied:** R25 (the credential-free path, R8–R11, R13), R26, R27, R28, R29 (the byte-identical `NOT_PUBLISHED`) and R34.
- **R12 stays in publication.** `publishedTargets` is a thin wrapper over `publishedRegistryFor` (R7, promotion's fact), and `excludedBy` reads `case_exclusions` and `inquiry`, so R25 stays in publication for R12 too, a copy as in the Old-ids precedent.

**Tests:** `worker.test`, `relay.test`, and the R8–R11/R36 arms of `published.test`.

### 3.3 `project-stage` (new, after publication; ~340 lines)

**Purpose.** A project's stage, what each stage has earned and still needs, and its work products' readiness, derived at the read (R44–R49).

| moved | lines | size |
| --- | --- | --- |
| `STAGE_QUESTIONS_MAX`, `WORK_PRODUCTS_MAX`, `PROJECT_STAGES`, `CLOSED_REASONS`, `COMPUTED_STAGES`, `CLOSED_RECORDED_MAX`, `STAGE_NEEDS`, `STAGE_SENTENCES`, `fillCounts`, `stageWhy`, `stageNeeds`, `earliestInstant`, `closedSince`, `READINESS_RUNGS` | 94–169 | 76 |
| `projectStage`, `#readHeld`, `#stages`, `#earliestLeg`, `#conclusionInstant`, `#workProducts` | 1330–1544 | 215 |
| op `projectstage` | 3941 | 1 |
| new: header, class, `projectStageOf`, `projectStageOps` | | ~50 |

**Reads.** It reads `record-core`'s `bundles` (`object_type`, under record-core R37) and publication's `cases (case_id, project_id)`, `case_documents (case_id, edition, text, sig_armored)` and `published_cases (case_id, edition, ratified_at)`, all already inside R40 as written. Its services are `membership.sight`/`existenceAct`/`noSuchProject`, `basisVersions.projectQuestions`/`conclusionOf`, `inquiry.basisFor` and `record.readFile`. **Nothing calls it except the op**, and its constants are imported only by `stage.test`.

**Ids.** R44, R45, R46, R47 and R49 move; R26, R28, R29 and R34 are copied. **Tests:** `stage.test` whole.

### 3.4 `publication` keeps (~3,700 lines: `index.mjs` ~2,720, `checks.mjs` ~250, `schema.mjs` 672, `deliverer.mjs` 55)

**What it keeps.**
- Every table and every write: R21, R22, R35, R24, R31.
- The case document and relation: R1–R7 and R12.
- The case-level reads: R14, R37, R38, R39, R40–R43 and R50.
- Attribution (R17), export (R18, R19, R32), R23, R30, R33, R51 and R52.
- `soleCase`, `caseEditionState`, `caseDocMemberFrozen` and `frozenFromPinningDocuments`, which it uses itself.

**New ids.** It gains ids stating `caseEditionState`, `soleCase` and `caseDocMemberFrozen` as services to a later module. R40 widens to the tables and columns listed in §3.2. No meaning changes. `modules.json`: `paths` drop `container.mjs` and `inband.mjs`; the rest resolve by most-specific path.

## 4. K637's test, both directions

- **Publication calls into the moved code?** No. From the call graph, the moved methods' only callers are each other and the op map. `#evidencePackage` is called only by `publishedCase`, `#resolveOneCase` and `#looseEditionState` only by `publishedCase`, `#casesOfSha` only by the three public reads, and `#frozenPairsByCase` only by `publishedManifest`. `projectStage`'s six methods are called only by each other.
- **Publication reads a new module's tables?** No. Neither `public-read` nor `project-stage` owns a table, and `case-grammar` holds no state at all.
- **The moved code reaches publication?** Only through public methods that exist today (`caseEditionState`, `soleCase`, `caseDocMemberFrozen`), `checks.mjs`' `rowOf`, `deliverer.mjs`, and read-only SQL on R40's tables.
- **Nothing private.** No `#` member is shared across a seam. `#deliveredBy` is a one-line wrapper over the exported `delivererOf`, and each side keeps its own.

## 5. Copy, then delete, in layer 8 (K624 (1))

1. **`case-grammar`, `public-read` and `project-stage` jobs, first and concurrent (P10), each merging early.**
   - Each copies its code and tests, without editing publication's paths.
   - `public-read` and `project-stage` each run against publication as it stands, since everything they call exists now. (The `action-clocks` precedent: later in the order, first in time.)
   - `case-grammar` takes its two files by path and re-imports their predicate. The format block is then held twice, in `checks.mjs` and `case-grammar`, until step 2.
2. **`publication`'s job, after those three merge.**
   - **Deletions:** it deletes every moved range (§3), `container.mjs` and `inband.mjs` from its paths, its copy of the format block, and the moved tests (`stage.test`, `worker.test`, `relay.test`, the moved arms of `published`, `casedoc`, `sources`, `tensions`).
   - **Re-exports:** it re-exports `case-grammar`.
   - **Re-points:** in `store.mjs`' op map it spreads `publicReadOps` and `projectStageOps` beside `publicationOps` (§12.2; publication's `from` includes `legacy-store`). It also points the `where` of C-44.2 and C-98.8 at `src/public-read/index.mjs`, which moves `CATALOG_VERSION` (R33).
   - **Then:** its own T18 entries.
3. **Callers, in their own jobs.**
   - `ratification` (layer 8, after publication): `ratify-op.test.mjs`:210–211 reads `publishedManifest`, `publishedList` and `publishedEditions` from `public-read`.
   - `filings` (layer 9): see §6.

## 6. The one condition, and what goes to T19

**`filings`.** Its code calls `publication.registerEvidenceBlock` at creation (`filings/index.mjs`:1087), and `test/m/filings/reads.test.mjs` and `packet.test.mjs` read `publishedCase`, `verifySha`, `publishedList`, `publishedManifest` and `registerEvidenceBlock` through publication. Filings' layer-9 job re-points all three sites to `public-read`.

Until then, publication keeps `registerEvidenceBlock` as a named copy (17 lines; K625's pattern) so that filings' creation does not throw. Its next job deletes that copy.

In the interval, `op=publishedcase` carries no available-actions block, and those filings arms fail. If BOB requires every module's tests green at every merge, the only way to avoid the gap is to keep the four reads as named copies. That holds publication at ~4,500 lines through T18, so this draft does not recommend it.

**Carried to T19.**
- The rows C-44.2, C-68.5 and C-98.1–.9 move to `public-read`'s own `checks.mjs` (K93 (3): rows follow their raisers), and `control-plane` re-points `M_PUBLICATION`'s C-68.5. They stay in publication in T18 to avoid a duplicate row id in the interval.
- The files `worker.mjs`, `container.mjs` and `inband.mjs` may move into `src/public-read/`; that would re-point `legacy-index`, `control-plane` and five row `where`s.
- Publication deletes its `registerEvidenceBlock` copy.

**Reserve cut, not needed.** Verified export (R18, R19, R32: `exportManifest`, `exportLog`, the `export_log` table, ~110 lines) touches no table of publication's. But it moves a table, and with it the table's purge exemption, and `queue-producers` imports `EXPORT_LOG_LIMIT_DEFAULT`. Use it only if publication's T18 entries push it past ~3,950.

## 7. `modules.json` (for the fold)

```
{"id": "case-grammar", "layer": 8,
 "paths": ["bio-plane/src/case-grammar/", "bio-plane/src/publication/blocks.mjs", "bio-plane/src/publication/tensions.mjs"],
 "tests": ["bio-plane/test/m/case-grammar/"], "uses": ["legacy-checks"]},
{"id": "publication", ... "paths": ["bio-plane/src/deliverer.mjs", "bio-plane/src/publication/"],
 "uses": [publication's today, less "signatures" and "ooxml", plus "case-grammar"]},
{"id": "public-read", "layer": 8,
 "paths": ["bio-plane/src/public-read/", "bio-plane/src/publication/worker.mjs", "bio-plane/src/container.mjs", "bio-plane/src/inband.mjs"],
 "tests": ["bio-plane/test/m/public-read/"],
 "uses": ["legacy-checks", "signatures", "ooxml", "case-grammar", "publication"]},
{"id": "project-stage", "layer": 8, "paths": ["bio-plane/src/project-stage/"],
 "tests": ["bio-plane/test/m/project-stage/"],
 "uses": ["legacy-checks", "record-core", "membership", "inquiry", "basis-versions", "publication"]}
```

Placed in that order around publication. `legacy-store`, `legacy-index`, `control-plane` and `filings` gain the edges named in §2. The moved tests import publication's `test/m/publication/fixture.mjs`, a test of a later module using an earlier module's fixture; or each new module copies it.
