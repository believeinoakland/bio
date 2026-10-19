# public-read (T51)

**Status** · session_01FPRrUF9Cu3BMKX1o1aFaK6 · depth 2 · RUNNING until 2026-10-19T08:06:06Z (two workers converting test regex copies) · handled B4

## J1 · QUESTION

Two readings in R38 I took on my best judgement; I carry on with them and will change on your answer.

1. `pinned: false`. A case's pin names the finding edition by hash, so for a pinned member `finding.bundle_sha` equals `version_sha` by construction and `false` could never occur. My reading: when the pin names bytes nothing published holds, the case document's own stated member edition (`case_roles[].edition`) is used, if that edition is published at other bytes: the entry lists that edition as `finding` with `pinned: false` (the pin does not match the bytes published at the edition the case states). If the document states no published edition either, the case is not listed (it pins no published edition of the finding). Pin-less member (legacy) answers `pinned: null`.
2. `signed_by` is the signer of the case document of the edition (always, when a signed document is held), with `strength_from` saying whether the pair is stated in that document (`case_document`) or in the member's own signed bytes (`member_bytes`, a pre-/2 document); `finding_signed_by` is the finding's own signer. The two are never copied from each other.

Also: R38's `detail`, `strength_detail` and `signer_detail` are inline sentences in the module (as `NOT_PUBLISHED`'s are); I cannot add keys to the word table (`setup-words` is not mine).

## J2 · COMPLETE

**Entries applied (T51-75).**
- R38 `publishedFrozen({id})` / `op=publishedfrozen`: new store read in `public-read/index.mjs`, one set-based read of the pins and one `caseEditionState` per case edition, no finding bytes fetched; added to `publicReadOps` and `PUBLIC_READ_OWN_OPS` (`reads.mjs`). Readings taken are in J1 (QUESTION), awaiting your answer.
- R39: no code needed; `finding-page.test.mjs` gives it its own explicit tests (identity and signing, body incl. override, unavailable/withheld body, basis served/named/edition-named, graph and division, verification, store silence refused whole, several-cases resolution).
- Stale comments restated: `credit.mjs`:11, `index.mjs`:1159, `publication/worker.mjs`:322.
- `served.mjs` (test helper) gains the `publishedfrozen` answers so the voice/place/word rules cover them.

**Deferred:** none. **Found in other modules:** none. The op is declared and routed by `op-declarations` (T51-107) and `control-plane` (T51-123); until then it is reachable only through the plane store's op map.

**Tests/checks:** `node --test test/m/public-read/`: 226 pass, 0 fail (20 new: frozen.test.mjs 10, finding-page.test.mjs 10). format: 0 failures; architecture public-read: 0 failures; coverage public-read: 39 of 39 ids named, 0 failures; ownership: 8 files, 0 failures. `checks/run.mjs`: 23 failures, all in other modules (none public-read).

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 7, module lines 3767

## J3 · REPORT

Word rows for R38's four sentences (no placeholders in any). Keys and English, as the module now says them inline:

- `public-read.frozen.detail.cases`: "Each entry is one published case edition's own frozen reading of this finding, as that case's signed document states it; no case's reading stands for another, and none is combined with any other."
- `public-read.frozen.detail.none`: "This finding is published and no published case edition pins it, so no case froze a reading of it."
- `public-read.frozen.strength_detail.none`: "This case edition records no frozen pair for this finding, and none is supplied here."
- `public-read.frozen.signer_detail.unstated`: "A signer this answer does not state is one no signed document held here names; the case document's signer and the finding's own are two facts, and neither stands in for the other."

(The first two share `detail`: `cases` when the answer holds a case, `none` when `cases` is empty.) Keeping the inline English until the rows land; I will switch to `word(key)` on your CHANGE.

## J4 · COMPLETE

CHANGE B3 processed. Merged `tranche/T51`. R3's `closing` now reads through `lensClosingSentencesOf(doc.fm)` (`index.mjs`), so each document speaks in its own format's words. The three failing tests now pin the format they mean: `edition-statements.test.mjs` builds `/5` documents and expects `/5`'s closing sentences (its section builders given `format: "bio-case-document/5"`); `standing.test.mjs` pins `CASE_DOCUMENT_FORMAT_V7` for its `/7` arm.

Tests: `node --test test/m/public-read/`: 226 pass, 0 fail. format, architecture, coverage (39 of 39), ownership: 0 failures. Still inline English for R38's four sentences until the design rows land.

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 10, module lines 3769

## J5 · COMPLETE

CHANGE B4 processed (B3 was done in J4). Merged `tranche/T51`. R38's four sentences (`detail` cases/none, `strength_detail`, `signer_detail`) are now read through `word(key)`; no inline English remains. `frozen.test.mjs` asserts the answers equal `word(key)` and `hasWord` for each of the four keys, with a control that reaches `strength_detail` and `signer_detail`.

Tests: `node --test test/m/public-read/`: 227 pass, 0 fail. format, architecture, coverage (39 of 39), ownership: 0 failures.

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 12, module lines 3769
