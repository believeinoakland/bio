# case-carriage — requirements

**Status** · DRAFT by a worker for BOB #106, 2026-10-03, on `tranche/T28` (N532; K617, P6; seam read `build/extraction/publication-split-2.md`). Split from `publication` with no change of meaning: its R57's holding with `heldMaterialsOf` and `publishedMaterialText` (here R1–R3), R59's and R51's re-reads (R4, R5), R31's clause on the held materials (R6), R34 copied (R7). Layer 8, directly before `publication`, which creates it (K1024's form). Code today: `bio-plane/src/publication/index.mjs` 894–1054 and `schema.mjs` 571–596 on `tranche/T28`. A product module with no `from`. Not yet met: R1–R7 (T29). Folded by a fold worker for BOB #106 on `prep/T29-folds`, 2026-10-03, entry N532, ruling K1332, from the seam read's Appendix A, with K1332's two wording fixes: R1's tokens are those the capture's `provenance.json` names, as built (K1322), not tokens a `co_attestation` row names; the `register` read contract (`provenance` R48) lists `bytes`. R51's re-read is taken with R57's and R59's (K1332).

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
  - **each timestamp token** the capture's home `data/provenance.json` names for such a document (`timestamp.token_file`, and `attestations[].file` of kind `rfc3161`), read from that file as built (K1322, K1332), as text when inline, else as `evidence` under its blob digest. Co-archives are locators and hold no bytes, so none is held (K1315, K1322).

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
- **As built (R1's tokens).** R1 states the code as built (K1322, K1332): the token files are those the capture's home `data/provenance.json` names for that capture. Co-archives are locators and hold no bytes.
- **For callers.** `publication` registers R1's `files` in `published_shas` in the same transaction, and raises C-122.1 on R5 and C-122.3 or C-122.4 on R4 (its R51, R59). It answers its own `heldMaterialsOf` and `publishedMaterialText` through R2 and R3, so `ratification` R39 and `public-read` R23 read unchanged.
- **Tests.** A negative control for each withdrawn and undisclosed arm of R4, and for each lapse of R5. An arm that R1 writes nothing for a material not included. A purge arm for R6.

