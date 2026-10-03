<!-- Seam read for publication's third split (N532, K1322, P6), written for BOB #106 on 2026-10-03 on tranche/T28 by a worker. Uncommitted; BOB reviews it. -->
# publication — third split (seam read, N532)

**Status** · DRAFT for BOB #106, 2026-10-03, on `tranche/T28`, uncommitted. Why: publication measures 3,996 lines at its T28 merge (K1322), at P6's ~4,000 mark. Read whole: every file under publication's `paths` (`deliverer.mjs`, `publication/index.mjs`, `schema.mjs`, `checks.mjs`, `door.mjs`; `publication/worker.mjs` is `public-read`'s by the most specific path) and its tests, `build/requirements/publication.md`, its `modules.json` entry, `requirements/README.md`, `extraction/publication-split.md`, K1316, K1317, K1322, K1024, and the Purpose and Provides of the uses the moved code calls. Users found by grep over `bio-plane/src` and `bio-plane/test`. Line numbers are `tranche/T28` today.

**Size today (most specific path):** `index.mjs` 2,996, `schema.mjs` 709, `checks.mjs` 144, `door.mjs` 92, `deliverer.mjs` 55 = **3,996**.

## 0. The answer

**Split at the named seam, widened by one method:** R57's holding, R59's re-read **and R51's re-read** (`#sourcesLapsed`, 21 lines, the same "re-read at the commit" pattern R59 copies) go to a new module **`case-carriage`**: what a case carries at its commit. This is the heading publication.md already gives R57.

- **Placement:** layer 8, directly **before** publication: `case-grammar`, `corpus-export`, **`case-carriage`**, `publication`, `docket`, … It must sit earlier because publication's `commitCaseEdition` calls it inside the commit's transaction. This is the `corpus-export` precedent (K1024): an earlier module, created eagerly by publication's factory, owning its own tables.
- **No cycle:** `case-carriage` reads no table of publication's and calls nothing of publication's (K637's test, both directions, §4).
- **Result:** publication about **3,820**, `case-carriage` about **270**.
- **Users:** none change code. Publication keeps one-line delegates for the two reads users make today (`heldMaterialsOf`: ratification; `publishedMaterialText`: public-read). No catalogue row moves.

**Is ~180 lines of headroom enough?** For T29, yes: `plan/next.md` holds no entry that adds to publication. It is not comfortable, though. T28's job alone added 363 lines (3,633 → 3,996). The larger coherent seam is the **attribution family** (R17, R39, R60: the `attribute` act, its two tables and rows C-92.1–.9 and .13, about 470 lines). It would leave publication at about 3,530 on its own, or about 3,350 together with this cut. But it costs six users' code, a catalogue version move and one back-edge (R2's attribution facts) that has to be cut (§8).

**Recommendation:** take `case-carriage` as N532 now. Hold attribution as the sized reserve cut, to take in the tranche that opens any publication entry over about 150 lines. A decision for BOB, §9.

## 1. What moves (`publication/index.mjs`, `schema.mjs`)

| moved | lines today | size | to |
| --- | --- | --- | --- |
| `#holdMaterials` (R57) with its comment | 894–953 | 60 | `case-carriage` R1 |
| `#registered`, `#fileRow`, `#tokenFiles` (R57) | 955–976 | 22 | R1 (private) |
| `heldMaterialsOf` (R57, K1317) | 978–986 | 9 | R2 |
| `publishedMaterialText` (R57, K1316) | 988–993 | 6 | R3 |
| `#acceptedWorkLapsed` (R59's re-read) | 995–1031 | 37 | R4, public as `acceptedWorkLapsed(fm, signer)` |
| `#sourcesLapsed` (R51's re-read) | 1033–1054 | 22 | R5, public as `sourcesLapsed(text, at)` |
| getters `acceptedWork`, `extraction`, `sources`; imports of their factories; the `sources` lines of the deps comment | 181, 182, 185; 64, 66, 68; 41–42 | 8 | the new factory |
| DDL `published_material_texts`, `published_case_materials` with comments | `schema.mjs` 571–596 | 26 | `case-carriage` (its own schema) |
| the two names in `PUBLICATION_EXEMPT` | `schema.mjs` 626 | 0 | its R6 declaration |

**Copied, not moved:** the small helpers `str`, `HEX64`, `shaOf`, `safeJson`, `#one`, `#rows` and `#fileText`. Each module keeps its own.

**What publication gains (~+19):**
- the import and a `caseCarriage` getter. It forwards a given `sources`, `acceptedWork` or `extraction` dep to `caseCarriageOf`, so every existing fixture runs unchanged.
- in `commitCaseEdition`, the gates call `this.caseCarriage.sourcesLapsed` / `.acceptedWorkLapsed` (lines 827 and 840). Lines 887–890 become: call `holdMaterials(docFm, {caseId, edition, at})`, then insert each answered `files` row into `published_shas`.
- the two one-line delegates, `heldMaterialsOf` and `publishedMaterialText`.
- `void p.caseCarriage` in `publicationOf`, so the tables exist and are declared at every boot (K1024's line, beside `void p.corpusExport`).

**What stays in publication.** The three refusals and their rows (C-122.1, .3, .4; raised in `commitCaseEdition`, K93 (3)). R58. Every write to `published_shas`, including the `materials/<sha>` rows. R52. `materialsOf` stays imported, since R60's `#reauthorCaptureAttestation` reads it.

## 2. Tables and their ownership

- **`case-carriage` owns** `published_material_texts` and `published_case_materials`. It creates them, declares them **exempt** to record-core's purge (record-core R21), and is their only writer and reader. No other module reads them in SQL: public-read reads `published_shas` and asks for texts through `publishedMaterialText`. So no read contract is needed.
- **The names, and so the rows, do not change.** It is the same Durable Object SQLite, and `CREATE TABLE IF NOT EXISTS` keeps every row. Ownership moves as `export_log`'s did (K1024).
- **Declaration overlap.** A table declared by two owners is refused. In production nothing calls `caseCarriageOf` until publication's job wires it, in the same change that drops the two names from `PUBLICATION_EXEMPT`. So the declaration never overlaps.
- **`case-carriage` writes nothing of publication's.** `holdMaterials` answers `files` (`{sha256, ref, path, kind, bytes}`) and publication registers them in `published_shas` in the same transaction. R40's "every write stays this module's" holds for every table R40 names.
- **Tables it reads under others' contracts:**
  - provenance's `register` (`capture_sha`, `bundle_id`, `path`, **and `bytes`**: see §7);
  - record-core's `bundles` (its R37);
  - sources' `source_knocks` (its R15: `source_id`, `capture_sha`, `received`, `knock_id`).

## 3. Requirement ids

| publication id | becomes |
| --- | --- |
| R57 | Stays, re-worded (no change of meaning): the commit holds through `case-carriage` R1, registers its files, answers `materials` and `materials_unheld`; `heldMaterialsOf` and `publishedMaterialText` are answered as its R2 and R3 answer. The holding itself is `case-carriage` R1–R3. |
| R59 | Stays (the refusal), re-worded: the re-read is `case-carriage` R4. |
| R51 | Stays (the refusal), re-worded: the re-read is `case-carriage` R5. |
| R31 | Loses its `published_material_texts` clause, which goes to `case-carriage` R6. |
| R34 | Copied as `case-carriage` R7. |
| R33, R52, R58, R60 | Unchanged. |

No publication id is retired, since each keeps its outcome at the commit. The new module's ids are R1–R7 (appendix A).

## 4. Services across the seam (K637's test)

- **publication → case-carriage** (earlier, allowed): `holdMaterials`, `heldMaterialsOf`, `publishedMaterialText`, `acceptedWorkLapsed`, `sourcesLapsed`.
- **case-carriage → publication:** nothing. It has no call and reads no table (`case_documents`, `published_*` other than its own two).
- **case-carriage → earlier modules**, the calls the moved code makes today:
  - `record-core` `readFile` (R13);
  - `extraction` `unitsOf` (R36);
  - `accepted-work` `acceptedFinding`, `openFlagsOn` (R2);
  - `sources` `publishableAt` (R8);
  - `case-grammar` `materialsOf` (R12), `extractedTextOf` (R17), `acceptedWorkOf` (R16), `caseDocumentBlocks` and `sourceRowsStanding` (R1);
  - `record-grammar` `createSha256`.
  - `membership` and `promotion` only to construct `extraction`, `sources` and `accepted-work` through their factories, as publication does today.
- **Nothing private crosses.** The four `#` members move whole; `#fileText` is copied.
- **publication's uses after the split:** it loses `sources`, `extraction` and `accepted-work` (no other code of its own calls them), and gains `case-carriage`. It keeps `capture` and `provenance` (R60, R17).

## 5. Tests

**None move.** Publication's own arms stay as integration tests of its re-worded R51, R57 and R59, and still pass unchanged, because they drive `commitCaseEdition`, `heldMaterialsOf` and `publishedMaterialText` through publication:
- `t28.test.mjs` 79–240;
- `sources.test.mjs` 78–152.

**One edit:** `invariants.test.mjs` 55–56 (R31). The two table names leave `PUBLICATION_EXEMPT`. The same test, or `case-carriage`'s, asserts they are declared exempt by `case-carriage`. `t28.test.mjs` 168–171 (the purge arm) passes as written.

**New: `bio-plane/test/m/case-carriage/`.** One arm or more per R1–R7, driven at its interface with its own fixture. It may not import publication's fixture, because publication is later in the order. The fixture holds record-core, a `register` row, an `extraction` stand-in, and real `accepted-work` and `sources` (as publication's fixture builds them). Each R4 and R5 outcome needs a negative control.

## 6. Users, and the order of jobs

- **Code users that must change:** none.
  - `ratification` (R39: `heldMaterialsOf`, `index.mjs`:791, 920) and `public-read` (R23: `publishedMaterialText`, `index.mjs`:991) keep calling publication's delegates.
  - They may re-point to `case-carriage` in a later job of their own. Each would gain the use; both are later in the order.
  - `control-plane` (`families.mjs` imports `publication/checks.mjs`) is unchanged, because no row moves.
- **`modules.json`, for the fold:**
  ```
  {"id": "case-carriage", "layer": 8, "paths": ["bio-plane/src/case-carriage/"],
   "tests": ["bio-plane/test/m/case-carriage/"],
   "uses": ["record-grammar", "record-core", "membership", "promotion", "provenance", "sources",
            "extraction", "accepted-work", "case-grammar"]}
  ```
  - Placed between `corpus-export` and `publication`. Every use is earlier (indices 0–58).
  - Paths and tests stay empty until its job creates them (K1043's form).
  - Publication's `uses`: remove `sources`, `extraction` and `accepted-work`; add `case-carriage`.
  - `layers.md`: add `case-carriage` to the L8 row.
- **Jobs (copy, then delete; K624 (1)):**
  1. `CASE-CARRIAGE #1` creates the module and its tests. It does not edit publication's paths, and nothing calls it yet.
  2. `PUBLICATION #17`, after that merge, wires the module (§1), deletes the moved ranges and the two DDL blocks, drops the two names from `PUBLICATION_EXEMPT`, and edits `invariants.test.mjs`.

  No accepted red is expected in between.

## 7. Resulting sizes, and risks

| | before | after |
| --- | --- | --- |
| publication `index.mjs` | 2,996 | ~2,846 (−169 moved, imports and getters; +19) |
| publication `schema.mjs` | 709 | ~683 |
| publication `checks.mjs`, `door.mjs`, `deliverer.mjs` | 291 | 291 |
| **publication** | **3,996** | **~3,820** |
| **case-carriage** (`index.mjs` with its schema) | — | **~270** (169 moved, ~30 header, ~45 class, factory, `migrate`, declaration, ~26 DDL) |

**Risks.**
1. **Thin headroom (~180).** The next DEC-driven publication entry may re-trigger P6. The reserve (§8) is sized and ready. A cheaper alternative is the K1317 (1) precedent: cut restating legacy comments. `index.mjs` has about 560 comment-only lines, about 250 of them in `commitEdition`'s CASE-5 and D-309 history. That trim adds no module, but publication's next job would carry it.
2. **`register.bytes` is read but not in provenance R48's listed columns.** `#registered` reads it for an evidence-held document's byte count. This gap already exists in publication and carries over unchanged. BOB can widen R48's wording (no change of meaning), or the job asks provenance for the byte count.
3. **R57's token wording and the code differ, as K1322 records.** R57 says a `co_attestation` row "names" the token. The code holds the token files the capture's home `data/provenance.json` names; co-archives are locators and hold no bytes. `case-carriage` R1 keeps R57's outcome, and its Suggestion states the code as built. Re-wording is BOB's call.
4. **Transaction.** `holdMaterials` writes inside publication's commit transaction on the same storage. It must not open its own transaction (`record.transact`), and R1 says so. A failure after it inside the commit rolls back its rows with the commit's.
5. **Duplicate coverage.** R57, R59 and R51 are tested both at publication's commit and at `case-carriage`'s interface. The duplication is intended (each module tests its own ids), with no shared fixture.

## 8. Reserve cut, sized: the attribution family

- **What:** module `attribution`, layer 8, directly after publication (before `docket`).
- **Moved code:**
  - `index.mjs` 1893–2227: `observationsNamingAuthor`, `attributionInForce`, `#observationsReachedBy`, `#capturesReachedBy`, `#attributedReachedBy`, `attributionStatements`, `#reauthorAttributions`, `attributionFacts`, `attributionStatedFor`, `attributeObservation`, `#reauthorCaptureAttestation`;
  - `#producingGroup` (213–218);
  - `ATTRIBUTION_REASON_MAX`;
  - `checks.mjs` `ATTRIBUTION_ACT_CHECKS` (C-92.1–.9, .13; 20–93);
  - tables `observation_attributions` and `capture_attributions` (schema 547–569, 597–614, and the `reason` additive column);
  - the op `attribute`.
- **Size and ids:** about 470 lines; ids R17, R39, R60.
- **Reads:** `case_documents` (R40) and `register`. It writes through `reauthorSection` (R21).
- **Cost:**
  - (a) One back-edge. `caseDocumentFacts` (R2) answers `attribution: this.attributionFacts(doc)`. R2 would drop it, and its two readers would ask the new module: `ratification/ops.mjs`:101 and `queue-producers`:2895. A registration (R23's pattern) is not recommended: an unregistered provider would read as an empty attribution, and the gate would fail open.
  - (b) Users re-point:
    - `ratification` (`index.mjs` 441, 442, 591, 657; `ops.mjs` 101);
    - `case-authoring` (`attributionStatements`);
    - `review` (`attributionInForce`);
    - `queue-producers`;
    - `control-plane` (`families.mjs`, the C-92 rows);
    - `plane` (the op map spreads `attributionOps`).
  - (c) The rows' `where` fields change, so `CATALOG_VERSION` moves (R33).
- **Result:** publication about 3,350 after both cuts.
- **Considered and not recommended:** the viewer-free reads publication serves to later modules (R37, R41–R43, R50; about 275 lines, after publication). It needs seven users to re-point (`conformance`, `filings`, `network-notices`, `docket`, `queue-producers`, `monitoring`, `plane`) and R40 widened to `published_held_references`.

## 9. Needs a decision (BOB's)

1. Including R51's re-read, beyond the entry's R57 and R59. Recommended: it is the same pattern, and it lets publication drop `sources`.
2. The name `case-carriage`.
3. Whether to take the attribution reserve in T29 as well, for comfort (~3,350), or only when a publication entry over ~150 lines is planned.
4. Risk 2 (R48's `bytes`) and risk 3 (R57's token wording).

---

## Appendix A — `build/requirements/case-carriage.md` (full text, draft)

# case-carriage — requirements

**Status** · DRAFT by a worker for BOB #106, 2026-10-03, on `tranche/T28` (N532; K617, P6; seam read `build/extraction/publication-split-2.md`). Split from `publication` with no change of meaning: its R57's holding with `heldMaterialsOf` and `publishedMaterialText` (here R1–R3), R59's and R51's re-reads (R4, R5), R31's clause on the held materials (R6), R34 copied (R7). Layer 8, directly before `publication`, which creates it (K1024's form). Code today: `bio-plane/src/publication/index.mjs` 894–1054 and `schema.mjs` 571–596 on `tranche/T28`. A product module with no `from`. Not yet met: R1–R7 (N532).

**Size (P6).** About 270 lines.

## Public

### Purpose

What a case edition carries at its commit, prepared for `publication`'s commit, which calls it inside its own transaction.
- It holds, by SHA-256, the materials the signed document includes, so `public-read` carries them in the case file from the published projection alone (DEC-112).
- It re-reads what the document rests on that may have changed since it was prepared: what may be published of each source it states (N364), and another group's work it accepted (N522).

The refusals those re-reads lead to, and every write to the published projection's other tables, are `publication`'s. This module owns only the two tables of held materials.

### Provides

Terms. A **material** is a row of the case document's `materials:` block (`case-grammar` R12). It is **included** when its `included` is `true` (or `"true"`).

- **R1** `holdMaterials(fm, {caseId, edition, at})` writes inside the caller's transaction and opens none of its own. For each included material of the front matter `fm`, it holds, by SHA-256:
  - **an observation**: its whole text, when the register homes its `sha` on a bundle that exists and record-core holds that file as inline text whose SHA-256 is `sha`;
  - **a document**: its captured bytes, as text when held inline at `sha`; else as `evidence` with the register's byte count, when the register homes it and no inline text is held (its bytes are only in the evidence store);
  - **a document's extracted text**, spelled by `case-grammar.extractedTextOf` (its R17) over `extraction.unitsOf(sha)`. It is held only when the index is `whole`, holds at least one unit and no unit is truncated, and only when the text's SHA-256 is the row's `text_sha`;
  - **each timestamp token or co-archive record** a `co_attestation` row names for such a document (K1315), as text when inline, else as `evidence` under its blob digest.

  Each text is written once to `published_material_texts` (`sha256`, `kind` `document`/`extracted_text`/`observation`/`attestation`, `text`, its UTF-8 byte length, `at`). A SHA-256 is held once per call.

  The list `[{sha, held}]` (`held` `inline` or `evidence`), in the order held, is written once for `(caseId, edition)` to `published_case_materials`; a second call for that edition writes nothing new.

  It answers `{materials, unheld, files}`:
  - `unheld`: `[{ref, kind, sha256, why}]`, at most 1,000, naming each included material, extracted text or token not held at its stated digest (no SHA-256, nothing captured, no such text, an index not whole, a token not held).
  - `files`: one `{sha256, ref, path: "materials/<sha>", kind, bytes}` per held item, for the caller to register by hash.

  Nothing is held for a material not included. A material it cannot hold is answered, never refused. Never throws.
- **R2** `heldMaterialsOf(caseId, edition)` answers the `[{sha, held}]` R1 wrote for that case edition, in its order. It answers `[]` for an edition that held nothing or was never committed. Writes nothing; never throws. (K1317)
- **R3** `publishedMaterialText(sha)` answers `{found: true, sha256, kind, text}` for a text R1 held (`sha` read case-insensitively), else `{found: false}`. A text no commit held is unreachable here. Writes nothing. (K1316)
- **R4** `acceptedWorkLapsed(fm, signer)` reads the `accepted_work:` and `accepted_work_flags:` blocks (`case-grammar` R16). It asks `accepted-work` (its R2) once per distinct `(ref, edition)`, as `member:<signer>`:
  - `acceptedFinding({ref, edition, viewer})`: a row is **withdrawn** when the answer is null, `absent`, `unreadable`, carries no `acceptance` object, or names another edition;
  - otherwise `openFlagsOn({ref, edition, viewer})`: a row is **withdrawn** when that answer is not an object, is `absent` or `unreadable`, has `complete` not `true`, or has `flags` not a list;
  - otherwise each open flag whose `(ref, edition, flag)` the flags block does not state is **undisclosed**: `{ref, edition, flag, issue}`.

  It answers null when the block states no row or every row stands, else `{withdrawn: [{ref, edition}], undisclosed}` (at most 200 undisclosed). Writes nothing. (K1316 (3), (4))
- **R5** `sourcesLapsed(text, at)` answers the `sources:` rows of a case document (`case-grammar` R1's `caseDocumentBlocks`) that no longer hold at `at`, judged by `case-grammar`'s `sourceRowsStanding`.
  - The sources behind a capture are the pulled knocks `sources` minted for it (its `source_knocks` read contract, R15), first received first.
  - Each is asked `sources.publishableAt({source, audience: "public", at})` (its R8).
  - A capture with no knock, or a source whose answer is not `ok` with a list of entries, answers nothing, so its rows lapse (fail closed).
  - A document stating no `sources:` row answers `[]`.

  Writes nothing.

## Private

### Uses

- `record-grammar`: `createSha256`.
- `record-core`: `readFile` (R13), the `bundles` read contract (R37), `declarePurge` (R21).
- `membership`, `promotion`: only to construct `extraction`, `sources` and `accepted-work` through their factories.
- `provenance`: the `register` read contract (R48), for `capture_sha`, `bundle_id`, `path` and `bytes`.
- `sources`: `publishableAt` (R8), the `source_knocks` read contract (R15).
- `extraction`: `unitsOf` (R36).
- `accepted-work`: `acceptedFinding`, `openFlagsOn` (R2).
- `case-grammar`: `materialsOf` (R12), `extractedTextOf` (R17), `acceptedWorkOf` (R16), `caseDocumentBlocks` and `sourceRowsStanding` (R1).

### Invariants

- **R6** (was `publication` R31's clause; K1316) `published_material_texts` and `published_case_materials` are declared to record-core's purge as exempt, as published bytes are. They are content-addressed and append-only: a held text or list is never rewritten or removed (as `publication` R24).
- **R7** (copied from `publication` R34) No place is named in this module's behaviour or outward text.

### Satisfies

- DEC-112 (3), (4) (R1–R3, R6); `BIO_Publication_v0_1.md` §5C.
- DEC-96 items 1, 4; N522 (R4).
- DEC-78 item 5(d); N364 (R5).
- K1315, K1316, K1317.

### Suggestions

- **Factory.** `caseCarriageOf(host, deps)` keeps one instance per host. `publication`'s factory creates it eagerly, so its tables exist and are declared at every boot (K1024's form). A given `extraction`, `sources` or `acceptedWork` is used as is (test injection); otherwise each is reached lazily through its factory.
- **As built (R1's tokens).** The token files are those the capture's home `data/provenance.json` names for that capture (`timestamp.token_file`, and `attestations[].file` of kind `rfc3161`). Co-archives are locators and hold no bytes (K1322).
- **For callers.** `publication` registers R1's `files` in `published_shas` in the same transaction, and raises C-122.1 on R5 and C-122.3 or C-122.4 on R4 (its R51, R59). It answers its own `heldMaterialsOf` and `publishedMaterialText` through R2 and R3, so `ratification` R39 and `public-read` R23 read unchanged.
- **Tests.** A negative control for each withdrawn and undisclosed arm of R4, and for each lapse of R5. An arm that R1 writes nothing for a material not included. A purge arm for R6.

---

## Appendix B — exact edits to `build/requirements/publication.md`

1. **Status, appended at the end of its paragraph:** "Third split for size (K617, P6; N532, K1322; seam read `build/extraction/publication-split-2.md`), by a worker for BOB #106, 2026-10-03, no requirement changing meaning: R57's holding, `heldMaterialsOf` and `publishedMaterialText` to `case-carriage` R1–R3; R59's and R51's re-reads to its R4 and R5; R31's held-materials clause to its R6; R34 copied as its R7. R51, R57 and R59 stay here, re-worded to call it. Uses lose `sources`, `extraction` and `accepted-work` and gain `case-carriage`."
2. **Purpose, last sentence.** Replace "and every table and every write stays here, except `export_log`, `corpus-export`'s since K1024." with "and every table and every write stays here, except `export_log`, `corpus-export`'s since K1024, and the two tables of held materials, `case-carriage`'s since N532, which holds what a case carries at its commit and re-reads its sources and accepted work there, called inside this module's commit."
3. **R51, replaced:** "**R51** `commitCaseEdition` re-reads, at the commit, what may be published of every source the document's `sources:` block states, through `case-carriage`'s `sourcesLapsed(text, now)` (its R5: `sources.publishableAt({audience: "public", at: now})` per source). Any row it answers lapsed (consent withdrawn since authoring) is `SOURCE_CONSENT_WITHDRAWN` (C-122.1), naming the captures (at most 200), and nothing is committed. The remedy is a new preparation." The row C-122.1 paragraph under it is unchanged.
4. **R57, replaced:** "**R57** At a case edition's commit (`commitCaseEdition`, R22), after every refusal and in the same transaction:
   - The commit holds the materials the document's `materials:` block (`case-grammar` R12) lists as `included: true`, through `case-carriage`'s `holdMaterials` (its R1). This holds, by SHA-256, the whole captured bytes and extracted text (`case-grammar.extractedTextOf`, its R17) of every included document, the whole text of every included observation, and the bytes of each timestamp token or co-archive record a `co_attestation` row of `material_attestations:` names for such material (K1315).
   - It registers every file `holdMaterials` answers in `published_shas` (`materials/<sha>`), so `public-read` can carry them in the case file from the published projection alone. Nothing is held for material listed `included: false`.
   - The commit answers `materials: [{sha, held}]` (`held` `inline` or `evidence`) and `materials_unheld` as `case-carriage` answers them. An `included: true` material that cannot be held at its stated digest does not refuse the commit; the case file then shows it missing (`case-checker` R8).
   - `heldMaterialsOf(case, edition)` answers as `case-carriage` R2 answers, so a retried ratification copies what is left (K1317). `publishedMaterialText(sha)` answers as its R3 answers, for `public-read` (K1316).
   - A document's bytes held only in the evidence store are copied to the published bucket after the commit by `ratification` R39.

   (K1316; DEC-112 (3)(4); Publication §5C: today's container "holds no rendering and no capture bytes")"
5. **R59, its first paragraph replaced** (the two rows and their translations unchanged): "**R59** At the commit, `commitCaseEdition` re-reads each `accepted_work:` row (`case-grammar` R16) through `case-carriage`'s `acceptedWorkLapsed(fm, signer)` (its R4). That reads `accepted-work`'s `acceptedFinding` and `openFlagsOn` as the signer's member (`member:<id>`). An acceptance it answers withdrawn is `ACCEPTANCE_WITHDRAWN_SINCE` (C-122.3), naming each; withdrawn means no longer in force, absent or unreadable, or a flags read answering `complete: false`. Otherwise, an open flag it answers undisclosed is `FLAG_OPENED_SINCE` (C-122.4), naming each. Either refuses the commit, and nothing is committed. (K1316) The remedy is a new preparation. This is R51's pattern. (DEC-96 items 1, 4; K1273)". The two-item list and its "A read that answers absent…" paragraph are folded into this sentence and removed.
6. **R31:** replace "`published_shas`, `published_material_texts` (R57, K1316), `published_cases`" with "`published_shas`, `published_cases`". Append: "(`published_material_texts` and `published_case_materials` are `case-carriage`'s, exempt under its R6, N532.)"
7. **Uses:** delete the bullets for `sources` (N364), `extraction` (DEC-112) and `accepted-work` (N522). Add after `case-grammar`: "- `case-carriage` (N532): `holdMaterials`, `heldMaterialsOf`, `publishedMaterialText`, `acceptedWorkLapsed`, `sourcesLapsed` (its R1–R5), for R51, R57 and R59; created by this module's factory so its tables exist at every boot (its R6)."
8. **Suggestions, "The tables are all this module's"** gains, before its closing period: "and `published_material_texts`, `published_case_materials` (`case-carriage`'s, N532)".
9. **Old ids, appended line:** "Moved by the third split (N532): R57's holding → `case-carriage` R1, `heldMaterialsOf` → R2, `publishedMaterialText` → R3; R59's re-read → R4; R51's re-read → R5; R31's held-materials clause → R6; R34 copied as R7. R51, R57 and R59 stay here, re-worded."
