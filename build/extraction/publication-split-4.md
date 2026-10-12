# publication → edition-index — split map (N909, contingent)

**Status** · Draft by a helper for BOB #162, 2026-10-12; N909; reviewed by BOB #162; ruled K2982.

**Why.** `plan/next.md` N909 and K2841: "publication reads 4,465 lines (its Size line)".

**Read whole:** `requirements/publication.md`, its `modules.json` entry (index 101) and every user's entry, every file in its own `paths` (`src/deliverer.mjs`; `src/publication/index.mjs`, `schema.mjs`, `checks.mjs`, `door.mjs`), and `extraction/agent-worker-split.md` (the format).
**Read in part:** callers, by grep over `bio-plane/src` and `bio-plane/test` (bundles excluded). Tests were mapped by their headers and greps.
**Line numbers:** `tranche/T46` today.

## 0. The answer

**Publication is under the mark by the rule in force. Recommended: no split. Correct N909's figure with one line.**

| file in publication's `paths` | lines (with comments) | owned by (most specific path, K1821 (5)) |
|---|---|---|
| `src/publication/index.mjs` | 2,744 | publication |
| `src/publication/schema.mjs` | 614 | publication |
| `src/publication/checks.mjs` | 111 | publication |
| `src/publication/door.mjs` | 109 | publication |
| `src/deliverer.mjs` | 55 | publication |
| **publication's own code** | **3,633** | |
| `src/publication/worker.mjs` | 833 | **`public-read`** (its own path entry) |
| what N909 counted | 4,466 | |

- N909's 4,465 adds `worker.mjs`, which `modules.json` gives to `public-read` by the more specific path. That is the miscount K2424 already corrected once ("publication measures 3,835 by K1821 (K2418's 4,668 counted public-read's `worker.mjs`)").
- Publication is **3,633**, about 2,900 without comment-only and blank lines: about 370 under ~4,000 with comments.
- **Reading:** strike N909's premise (one K: "publication 3,633 by K1821 (5); no split") and carry the cut below as headroom for the next capability that would take it past ~3,900, as K2513 kept agent-worker's map.

**If BOB wants the headroom now,** the seam is the read services publication answers *to later modules* over ratified editions, and the court-order stamps beside them. None of it is called by publication's own acts:
- R37 `publishedEditionsOf`;
- R38's third read `ratifiedFindingsRestingOn`;
- R41 `caseCitedParts`, R43 `ratifiedCases` and their registration with `reevaluation`;
- R42 `restingCapturesOf`;
- R62 `stampEdition`, `stampsOf`, the court-order source, and the table `edition_stamps`;
- R64 `stampedEditions`.

They go to a new module **`edition-index`**, placed **directly after** publication. Publication calls none of it, so the edge runs only new → publication.

| | lines (with comments) |
|---|---|
| publication after | about **3,280** (`index.mjs` ~2,405, `schema.mjs` ~597, `checks.mjs` 111, `door.mjs` 109, `deliverer.mjs` 55) |
| edition-index | about **470** (`index.mjs` ~420, `schema.mjs` ~45) |

An alternative seam, the published criteria (R72, R75: `#criteriaOf` … `#entityName`, 104 lines), would have to sit *before* publication, because `commitCaseEdition` calls it, and it frees only about 130 lines (doubt 2).

## 1. The new module

| | `edition-index` |
|---|---|
| layer | 8 |
| place in `modules.json` | directly after `publication` (101): `publication`, **`edition-index`**, `publish-schedule`, `docket`, `public-read`, … Every user is later: docket 103, public-read 104, network-notices 106, ratification 108, conformance 116, filings 124, monitoring 128. |
| paths / tests | `bio-plane/src/edition-index/` / `bio-plane/test/m/edition-index/` |
| from | none (K624) |
| uses | `record-core` (`textAtSha`, `declareTable`, the `bundles` read contract), `publication` (`caseDocMemberFrozen`, its R55; R40's tables), `case-grammar` (`signedCitations`, `publishedGraphEdges`), `provenance` (`register` read contract, R42), `reevaluation` (`registerCaseParts`, its R26). Tests: `test-support`, publication's fixture modules. |
| entry point | `editionIndexOf(host, deps)` (K61). At creation it makes and declares `edition_stamps` (exempt) and registers `{parts, cases}` with reevaluation (moved from `publicationOf`:2703–2706). The plane composes it directly after publication, as it composes docket (`plane/store.mjs`:263). It has no op: `stampsOf` and the others are services, as today. |

## 2. What moves (by copy, K624)

| moved | from `publication/index.mjs` lines | lines | publication id |
|---|---|---|---|
| `EDITION_STAMP_EFFECTS` | 147–148 | 2 | R62 |
| `EDITIONS_OF_MAX` … `RESTING_PINS_MAX`, `pageOf`, `pinCursor`, `CITATION_NAMES_CAPTURE` | 149–174 | 26 | R37, R38, R41–R43 |
| `#orders`, `registerOrderSource`, `orderSource` | 218, 319–338 | 21 | R62 |
| `#signedEditions`, `stampEdition`, `stampsOf`, `stampedEditions` | 1366–1454 | 89 | R62, R64 |
| `publishedEditionsOf` | 1478–1514 | 37 | R37 |
| `caseCitedParts`, `ratifiedCases` | 1516–1574 | 59 | R41, R43 |
| `restingCapturesOf` | 1635–1705 | 71 | R42 |
| `ratifiedFindingsRestingOn` | 2425–2463 | 39 | R38 (third read) |
| reevaluation's registration | 2703–2706 | 4 | R41, R43 |
| `edition_stamps` DDL | `schema.mjs` 470–485 | 16 | R62, R31 |

**In the copy:**
- `this.#rows` and `this.#one` become the module's own (K57).
- `safeJson` is copied (1 line).
- `caseDocMemberFrozen` is called as `this.publication.caseDocMemberFrozen` (publication R55, already public).
- No answer, refusal (`MALFORMED`, `NO_ID`, `NO_SUCH_CASE_EDITION`, `STAMP_NO_ORDER`, `PROVIDER_*`) or bound changes.
- No catalogue row moves: none of these has one.

**Stays in publication:**
- R1–R3, R7, R12, R14, R15, R21–R23, R35, R40, R51–R61, R63, R65, R70, R72–R78;
- R38's `pinnedCaseEditionsOf` and `caseClaimsOf` (`commitEdition`:535, :692 and `#preparedClaim` call them);
- R63's `editionTimeline` (`#timelineOfText` serves R53);
- every other table;
- every commit.

**Removed with the copy:** the lines above. `PUBLICATION_EXEMPT` loses `edition_stamps` (`schema.mjs`:498). `reevaluationOf` leaves the imports, and **`reevaluation` leaves publication's `uses`**, since registration was its only use.

## 3. Requirement ids

| publication | edition-index | what |
|---|---|---|
| R37 | **R1** | `publishedEditionsOf` |
| R38 (its `ratifiedFindingsRestingOn` sentence) | **R2** | the paged rests-on read |
| R41 | **R3** | `caseCitedParts` |
| R42 | **R4** | `restingCapturesOf` |
| R43 | **R5** | `ratifiedCases` |
| R41's and R43's registration clause | **R6** | `registerCaseParts` at creation |
| R62 | **R7** | stamps, the court-order source |
| R64 | **R8** | `stampedEditions` |
| R31 (its `edition_stamps` clause) | **R9** | exempt from purge |
| R24, R34 (copies) | **R10, R11** | append-only; no place named |

**Retired in publication as "moved to `edition-index` R<n>":** R37 → R1, R41 → R3, R42 → R4, R43 → R5, R62 → R7, R64 → R8.

**Re-worded in publication:**
- R38 keeps `pinnedCaseEditionsOf` and `caseClaimsOf` (its third read is `edition-index` R2);
- R31 (stamps' clause);
- R40 gains the reader `edition-index`;
- Uses, Purpose, Status, Size.

**Wording only elsewhere:**
- `docket` R25;
- `public-read` R28;
- `ratification` R5's scope arms;
- `conformance` R2;
- `monitoring` R33;
- `reevaluation` R26;
- `network-notices`, `filings` (their read of R37, R41).

## 4. Users and what they re-point

| user (file:line) | calls today | re-points to | by |
|---|---|---|---|
| docket `src/docket/index.mjs`:842, :1184 (+ `test/m/docket/fixture.mjs`, `court.test.mjs`) | `publication.stampEdition`, `registerOrderSource`, `orderSource` | `edition-index`; `uses` gains it | docket's L8 job |
| public-read `src/public-read/index.mjs`:1487 (+ `fixture.mjs`, `court-orders.test.mjs`, `dates.test.mjs`, `published.test.mjs`) | `stampedEditions` | same | public-read's L8 job |
| ratification `src/ratification/index.mjs`:794, :1405 (+ `fixture.mjs`, `finding-commit.test.mjs`, `schedule.test.mjs`, `approvals.test.mjs`) | `stampsOf`, `ratifiedFindingsRestingOn` | same | ratification's L8 job |
| network-notices `src/network-notices/index.mjs`:736 | `caseCitedParts` | same | its L8 job |
| conformance `src/conformance/index.mjs`:702, :1228, :1437 (+ `fixture.mjs`) | `publishedEditionsOf` | same | L9 |
| filings `src/filings/index.mjs`:1642, :2116 | `publishedEditionsOf` | same | L9 |
| monitoring `src/monitoring/index.mjs`:2914 (+ `fixture.mjs`, `understanding.test.mjs`) | `restingCapturesOf` | same | L10 |
| plane `src/plane/store.mjs`:259–263 | composes publication | composes `editionIndexOf(ctx)` directly after it | L11 |
| membership `MODULE_ORDER` (:282), `module-order.test.mjs` | the ids | gains `edition-index` after `publication` | L2 |
| tests naming stamps: `action-holds` `readers.test.mjs`, `op-declarations` `t23`/`t24`/`t27`/`t28`/`t31`/`tables.test.mjs`, `control-plane` `stamps.test.mjs`, `r49-routes`, `r50-routes` | `stampsOf` on publication (fixtures) | the new instance | each module's own job (test-only) |

## 5. Tests

- **To `test/m/edition-index/`:**
  - `cases.test.mjs`, whole (R41–R43);
  - `relation.test.mjs`'s R37 arm (27–43) and the `ratifiedFindingsRestingOn` arms (45–150);
  - `t33.test.mjs`'s R62 arms;
  - `t34.test.mjs`'s R64 arm;
  - `convert-ratify-authority.test.mjs`'s rests-on arms (42–48);
  - `convert-mk6-bundle-names-no-author.test.mjs`'s R37 and R41 reads.
- **Stay, rewritten:** publication's tests may not import a later module. Three incidental uses of `publishedEditionsOf` read `published_case_members` in their own SQL instead, or move: `published.test.mjs`:208, `invariants.test.mjs`:176, `sources.test.mjs`:169.

## 6. Risks

1. **Reevaluation's case half.** From publication's delete until the plane composes `edition-index` (L11), nothing registers `registerCaseParts` in the running plane, so reevaluation R14 grades no case parts.
   - *Reading:* the plane's re-point is a one-line T47 entry merged with L8's close, or the gap is accepted by name.
   - The reverse order is not possible: publication cannot create a later module.
2. **The court-order source.** Docket registers it with publication today. From publication's delete until docket's re-point, every stamp answers `STAMP_NO_ORDER`. Both are L8; merge docket directly after publication's delete.
3. **The table's declaration window.** `edition_stamps` is declared by both while both live on one host (`TABLE_DECLARED`; publication keeps the answer, `purgeDeclaration`). Nothing composes `edition-index` until publication's delete lands in the same tranche (K624).
4. **No catalogue rows, ops or `where`s move.** `answer-envelope`, `op-declarations`, `op-grades`: no change.
5. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) list `src/publication/*.mjs`. They are stale until the layer close, and gain `src/edition-index/*.mjs`.

## 7. T47 job sequence (only if BOB splits)

1. **EDITION-INDEX (new, L8, first):** copy (§2), its tests (§5), `modules.json` row at 102, `requirements/edition-index.md`. Merges early.
2. **PUBLICATION (L8):** deletes the copies, drops `reevaluation` from `uses`, retires and re-words (§3).
3. **Re-points:** docket, public-read, network-notices, ratification (L8), merged in that order directly after 2. Then conformance, filings (L9); monitoring (L10); plane (L11; doubt 3). Membership's `MODULE_ORDER` (L2) at T47's opening.

## 8. Doubts for BOB

1. **The measure.** *Reading:* by K1821 (5) and K2424, publication is 3,633: no split in T47. One K corrects N909. This map is kept for when publication passes ~3,900.
2. **The criteria seam (R72, R75)** is the cohesive alternative. But it must sit before publication (the commit calls it) and frees about 130 lines. *Reading:* not worth a module.
3. **Two themes in one module.** The reads and the stamps are "what later modules ask of ratified editions, and what is stamped beside them". If BOB prefers one theme, a stamps-only module (`edition-stamps`, R62, R64, about 160 lines) is clean but small.
