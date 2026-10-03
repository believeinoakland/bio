# public-read (T28)

**Status** · session_0181u3c6mH6hCT6JNt1c6phB · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Four interface gaps between public-read R23/R24 and the modules it reads; each needs another job's spelling, so BOB's to settle (§4). My best reading for each; I build on it meanwhile.

1. **Grading facts and passages (R23 "each finding … with its grading facts and its passages", "from the published projection only").** Nothing puts them in the published projection: `publication` R57 holds only `materials:` bytes, and no requirement says where `case-authoring` writes `strength` R35's facts (its START says it writes them; K1305). **Best reading:** `case-authoring` writes them inside the signed `/6` document as two flat blocks (K549), so they are signed and published with it, for every member and every finding a member's chain reaches: `finding_grading_facts:` `{finding, facts_b64}` (the canonical JSON of `gradingFacts`' answer, base64 as `capture_accounts`' `text_b64`) and `finding_passages:` `{finding, content_id, capture_sha, extent, quoted}`; `case-grammar` reads them back (`gradingFactsOf(fm)`, `passagesOf(fm)`, one spelling). I then write one `grading_facts` and one `passages` file per finding from them. Alternative: `publication` R57 also holds them per finding at the commit.

2. **The case file's files served by hash (R24, R5).** `op=publishedbytes` serves only hashes `published_shas` names, which `publication` writes; today `recordCaseManifest` (its R15) registers only the manifest. **Best reading:** `publication` R15's `recordCaseManifest` also registers, in the same transaction, every file the `bio-case-file/1` manifest lists (`files[]`: path, sha256, bytes, kind), and the Worker (mine) puts each new file's bytes (complete edition, grading facts, passages, signatures) in the published bucket before recording, as it does the manifest's today. Needs `publication` R15 widened (its job is running now).

3. **Attestations (R23 "the attestations the block lists").** A `co_attestation` row's timestamp token or co-archive record is not in the published projection (`publication` R57 names documents, extracted text and observations only). **Best reading:** widen `publication` R57 to hold, by SHA-256, each attestation's bytes a `material_attestations:` row names (`member` accounts are already in the document's `capture_accounts:`); until then I carry one `attestation` file per row stating what the signed document states of it (the row, and for a `member` row its account text and signature), and nothing I cannot read from the projection.

4. **`case-grammar` R13's part fingerprint and `completeEditionOf`'s input (for case-checker to agree with me).** (a) A part cannot list its own SHA-256 inside the manifest it carries (a fixed point). **Best reading:** a part's `sha256` and `bytes` are over the canonical JSON (`JSON.stringify(v, null, 1)`) of its file list `[{path, sha256, bytes}]` in manifest order; every file is checked by its own hash anyway. (b) The manifest's `parts` depend on the complete edition's size, so `completeEditionOf` cannot take the manifest. **Best reading:** it takes `{format, group, case, edition, case_document_sha, keys, files: [{path, kind, sha256, bytes, content}]}`, every file but the complete edition, with no `part` and no `parts`. Both are `case-grammar`'s to spell; I follow whatever it merges.

Mine, decided (P17, reported): files under `<case>/` (`case/document.md`, `case/document.sig`, `complete-edition.html`, `findings/<id>/…`, `materials/<sha>`, `materials/<sha>.text`, `attestations/<n>.json`); a split case file is served as `op=publishedbytes&sha256=<manifest>&format=zip&part=<index>` (index 1 by default), each part a stored ZIP with the same manifest at its root; files are packed in manifest order and a new part opens before a file that would pass 64 MiB; a single file over 64 MiB sits alone in its part, which then answers `CONTAINER_TOO_LARGE` (C-98.7) while the file stays served by hash. Containers already published (`bio-case-container/6`) are served as stored.

## J2 · REPORT

A spelling conflict in the case file's ZIP layout, between two jobs that are not mine (seen on their pushed work in progress; the format is `case-grammar`'s, R13):

- `case-grammar` (job branch, `casefile.mjs`): the manifest is `manifest.json` (`CASE_FILE_MANIFEST_PATH`) at each part's root; file paths are `caseFilePath`'s (`case.md`, `findings/<id>/finding.md`, `materials/<ref>/document`, …), files listed in path order, a part's digest `casePartDigest(files, index)` (one line per file, `<path> <sha256> <bytes>\n`), and `caseFileManifestCheck` refuses any manifest field outside `format, group, case, edition, case_document_sha, keys, parts, files` (so no `layout`).
- `case-checker` (job branch, its reader): looks for `MANIFEST.json` at the part's root and reads each file at `<case>/<path>` (or a `layout.root`).

I build to `case-grammar`'s spelling, since it owns the format: `manifest.json` at each part's root, and each file at its `caseFilePath` path directly under the part's root, with no `<case>/` prefix (my R6's "each file under the root at its path"). `case-checker` would then read the same. Its reader, and K1315's reading (3) of the part digest (canonical JSON of the rows), differ from what `case-grammar` built: whichever BOB keeps, I follow `case-grammar`'s exports, so only `case-checker` needs telling.

## J3 · REPORT

Found while doing T28's public-read share. None of these blocks my merge; each is another file's owner's to act on.

1. **My requirements' Uses line (BOB's to word).** `build/requirements/public-read.md`'s Uses doesn't yet name what this job reads:
   - `publication`'s `publishedMaterialText` (its R57, K1316);
   - `case-grammar`'s `methodOf`, `materialsOf`, `standingOf`, `gradingFactsOf`, `passagesOf`, `caseFilePath`, `casePartDigest`, `completeEditionOf`, `CASE_FILE_FORMAT`, `CASE_FILE_MANIFEST_PATH` and `caseDocumentRequiresMaterials` (its R1, R11–R15, R17);
   - `record-grammar`'s `canonicalJson`.

   No new module edge: all three are already in `uses`.
2. **A generated artifact made stale.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) bundles the Worker and store source this job changed. BOB regenerates it at the layer close (manifest §14).
3. **My tests need `publication`'s fixture to run.** They use `signLegacy`, `w.units` and its `/6` default `caseDoc`, which arrive with `publication`'s merge, and it merges before mine in L8. On `publication`'s job branch @ 3d1b8fadf2 merged over this branch, public-read is 105/105. On this branch alone, the tests that sign a pre-`/6` edition fail until `publication` is merged.
4. **Dependents measured against the same merge.** network-notices 63/0, filings 60/0, plane 65/0 and op-declarations 43/0 all pass. ratification (40 failing), control-plane (2) and affordances (1) fail the same tests by name with and without this job's changes:
   - ratification: `publication` R58 (ratification's own L8 job);
   - control-plane: accepted red 6;
   - affordances R19: not this job's.

   The new internal store op `casefilefacts` trips no op-coverage test.

## J4 · COMPLETE

**Entries applied** (`build/plan/current.md` T28 L8, public-read; N520's DEC-112 share; K1315–K1318). All six are written and tested; their marks are BOB's to strike at the merge.

- **R3.** A `/6` document's `method` and `materials` are answered as signed, through `case-grammar`'s `methodOf` and `materialsOf`; any other format answers null for both.
- **R22.** Each member's `standing` is `case-grammar.standingOf` over three things read from the signed document only: the member's role (`case_roles`), the bar it records (`required_strength`, where an undeclared bar is none) and its frozen pair (`case_strength`). A document stating no member blocks answers null. There is no case-level standing (R11).
- **R23.** `PublicRead.caseFileFacts`, with its internal store op `casefilefacts` that no door routes, gathers from the published projection:
  - the signed document;
  - each member, and each finding a member's chain reaches, with its published row at the edition its leg names;
  - their `grading_facts:` and `passages:` rows (`case-grammar` R17);
  - each included material, as text held inline (`publishedMaterialText`) or by hash in the bucket;
  - each attestation row: a `member` row with its signed account where the row may name one, and a `co_attestation` row with each token `publication` held for that material.

  The new `public-read/casefile.mjs` builds the files at `caseFilePath`'s paths, adds the signing keys (one line each, `SHA256:` fingerprint) and the complete edition, and packs the files in path order into parts under the bound, each part with `casePartDigest`.
  - Bytes that don't hash to the stated digest are never carried. Such a material is listed in `unheld`, so the checker shows it missing.
  - A finding's bytes the bucket can't produce mean the case file is not built: the assembly states `CASE_FILE_NOT_ASSEMBLED`, naming what is missing, and records nothing.
- **R24.** The complete edition is `completeEditionOf` over every other file. Its SHA-256 is in the manifest, and like every file it is served by hash (`publication` R15 registers the files).
- **R6.** A `/6` edition is assembled as its case file once, when it completes: each file is put in the bucket first, the manifest's hash is taken with `inbandQuartet`, and the manifest is recorded through `recordCaseManifest`. Each part is a stored ZIP with fixed timestamps and `manifest.json` at its root (`container.mjs`: a layout may have an empty root). An edition signed before T28 keeps its container unchanged.
- **R5.** A case file is served one part at a time with `&part=<n>` (1 by default). A part the manifest doesn't list is the required-argument refusal, naming the parts it does list. A file held at another hash refuses the part with `PART_MISSING` (C-98.5) at its one governed site (`containerEntries`). `CONTAINER_TOO_LARGE` (C-98.7) now applies to one part. A file larger than the bound sits alone in its own part.

**Rows.** None added and none changed: no catalogue row awaits a stamp.

**Deferred.** Nothing.

**Found in other modules.** See J3: my Uses line, the stale plane bundle, the tests needing `publication`'s fixture, and the dependents measured.

**Tests and checks.** These ran on this branch with `publication`'s job branch @ 3d1b8fadf2 merged locally, never pushed, because `publication` merges before me:

| what | result |
|---|---|
| public-read (`test/m/public-read/`) | 105 pass / 0 fail, adding `casefile.test.mjs` (7 tests) and `standing.test.mjs` (3) |
| dependents | network-notices 63/0, filings 60/0, plane 65/0, op-declarations 43/0 |
| dependents already red | ratification 159/40, control-plane 137/2, affordances 152/1: the same failures by name without my changes |
| layer tests | none in the manifest |
| `checks/format.mjs` | 0 failures |
| `checks/architecture.mjs` | 0 failures |
| `checks/coverage.mjs` | 24 of 24 live ids named; 0 failures |
| `checks/ownership.mjs` against tranche/T28 | 16 files; 0 failures |

Size (session_0181u3c6mH6hCT6JNt1c6phB): test runs 16, module lines 2890
