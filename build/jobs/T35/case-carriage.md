# case-carriage (T35)

**Status** · session_0135Aih7kZEH3wwKzzpukHAF · depth 2 · WAITING ON BOB (J2) · handled B2

## Work (CASE-CARRIAGE #3)

**Entry applied: T35-53 (N688; K1844, K1941), R8.** An included document whose home's `data/provenance.json` entry has `capture.method` `unpacked` and a `container` block is carried with three more things:
- its `container` record, as `canonicalJson` text of kind `container`;
- its archive, held as a document's bytes are (inline, else `evidence` with the register's byte count), under kind `archive`;
- the archive's own timestamp tokens, of kind `attestation`.

The walk repeats outward, through each enclosing archive, to the outermost. Every file is answered under `materials/<sha>` in `files`, so `publication` registers it and ratification R39 copies the evidence. Each failure is answered in `unheld`, never refused: a container block naming another document or no archive digest, an archive not held, a token not held. A document that is not a member is held exactly as R1 states. An archive already walked in the same call ends the walk, so a cycle cannot loop. The readings of the open points are in J1. The code is `index.mjs`: `#holdArchives`, with `#holdTokens` and `#entriesFor` factored out of R1's token read and no change to R1's behaviour. `schema.mjs` names the two new kinds in its comments; the column has no CHECK constraint, so no migration is needed.

**Does case-grammar R13 need `archive` and `container` kinds? Yes (N717).**
- `CASE_FILE_KINDS` (`case-grammar/casefile.mjs`:36) lacks both, and `caseFileManifestCheck` refuses any other kind (:183).
- `public-read/casefile.mjs`:105–113 carries only the `materials:` rows' document, extracted text and observation, plus the `co_attestation` tokens registered under a material's ref (`public-read/index.mjs`:1133). The archive's token, registered under the member's ref with kind `attestation`, therefore reaches the case file today. The archive and the `container` record do not: they are registered in `published_shas` (so `op=verify` and the published bytes answer them), but are not written into the case file.
- For the case file to carry all three, R13 needs the two kinds, and `public-read` needs a share that carries each `published_shas` row of kind `archive` or `container` under the material's ref. Both are outside this module: reported, not done.
- The alternative, filing the archive as `document` and the record as `attestation`, would misname the archive as the material itself, so I do not recommend it.

**Found in other modules.**
- `case-grammar` R13 and `public-read` R23, above.
- `modules.json`: case-carriage needs a `test-support` edge (J2).

**Deferred:** nothing.

**Tests and checks** (after commit `case-carriage R8`):
- `node --test bio-plane/test/m/case-carriage/`: 29 pass, 0 fail, 0 skipped. The 7 R8 arms are in `archive.test.mjs`. The outsider's three steps ran with the real `sha256sum -c`, `unzip -p` and `openssl ts -verify` against a throwaway TSA's token over the archive; in-process equivalents stand in where a runner lacks a tool.
- The users' suites, `node --test bio-plane/test/m/publication/ bio-plane/test/m/public-read/ bio-plane/test/m/ratification/`: 456 tests, 455 pass, 0 fail.
- `format`: 0 failures. `coverage`: 8 of 8 live ids, 0 failures. `ownership`: 4 files, 0 failures.
- `architecture`: 1 failure, the `test-support` edge in J2 (BOB's `modules.json`).

Size (session_0135Aih7kZEH3wwKzzpukHAF): test runs 6, module lines 392

## J1 · QUESTION

R8's wording leaves four small points open. I am building on the readings below and carrying on; answer only if one is wrong.
1. **Order held.** For a member: the document, its extracted text, its own tokens (R1), then its `container` record, its archive, the archive's tokens; then the same three for the archive's archive, outward.
2. **`sha256` in an `unheld` row of kind `container`** is the member document's SHA-256. The record's own digest is not useful here, because the record is not held. For kind `archive`, and for an archive token not held, it is the archive's `archive_sha256`.
3. **An archive not held** (no home, or inline text at another digest) is named once, and the chain stops there. Its tokens and its own archive are not read, since nothing can be checked against an archive that is not carried. A malformed `container` block also stops the chain, after naming it.
4. **The `container` record** is the whole block as the entry states it, `name_shared` and `path_unsafe` included, in `canonicalJson`. `member_sha256` and `archive_sha256` are compared case-insensitively. A `sha256:` prefix on `member_sha256` is ignored, as R1 already ignores one on `capture.sha256`.

## J2 · QUESTION

**An edge is needed: `case-carriage` uses `test-support`.** R8's suggestion says to build the test archive with `test-support`'s `make-zip.mjs`, and `bio-plane/test/m/case-carriage/archive.test.mjs` does. The architecture check fails on exactly that import: "imports bio-plane/test/make-zip.mjs of test-support, which case-carriage does not declare in uses". `test-support` is in layer 1, so the edge points earlier (P4). This is the same edge plan rule 8 gave ooxml and acquisition.

My reading: add `test-support` to case-carriage's `uses` in `modules.json`, and to its requirements' Uses as "`make-zip.mjs` (tests only; R8)". Nothing else is waiting on this. Every other check is clean: format 0, coverage 8/8, ownership 0, and 29/29 tests pass. J1 still stands.

If you would rather not add the edge, say so and I will write the archive in-process inside the test instead.
