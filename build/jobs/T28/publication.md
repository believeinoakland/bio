# publication (T28)

**Status** · session_01XULTB98f6bHiUb3Y9gRxug · depth 2 · WORKING · handled B3

## J1 · QUESTION

QUESTION (four points; my best reading for each, which I am building now; only (1) can change what I build next).

(1) R57: what "the extracted text" of a document is, and how the published projection holds texts and bytes.
  - Best reading: a document's extracted text is the canonical JSON (record-grammar `canonicalJson`) of `extraction.unitsOf(capture).units`, each `{seq, extent, ref, text, truncated}`, in seq order, and the materials row's `text_sha` is its SHA-256. It is held only when the index state is `whole` and the hash matches. case-authoring R45 (which writes `text_sha`), case-checker R4 (which finds passages in it) and public-read R23 (which carries it) must use the same definition; no requirement states one today. Please confirm or name the definition, and tell those three jobs.
  - Best reading, holding: commitCaseEdition writes, in its transaction, one `published_shas` row per held material (`kind` `document`, `extracted_text` or `observation`; `bundle_id` the material's `ref`; `path` `materials/<sha>`), and keeps each text (an extracted text; an observation's whole text; a document's bytes when the register holds them inline as text) in a new purge-exempt table `published_material_texts (sha256, kind, text, bytes, published)`, served by a new read `publishedMaterialText(sha)` for public-read (as `publishedCaseDocumentText` serves D-734's). That needs R40 to name the table, or R57 to name the read.
  - A document's captured bytes held only in the evidence store (R2) cannot be copied by the commit (a synchronous transaction). Best reading: the commit answers `materials: [{ref, kind, sha256, held: "text" | "evidence"}]`, and ratification's caseratify Worker copies each `evidence` one into the published bucket after the commit, as op=ratify copies captures today. That is a ratification change (REPORT to follow if you agree).
  - A listed `included: true` material this copy cannot hold at its stated digest: best reading, the commit is not refused (no row exists for it); it answers `materials_unheld` naming each, and the case file is then incomplete. Alternative: refuse with a new row.

(2) R60: which captures an edition "reaches", and where the choice is stored.
  - Best reading: a capture is off-the-record for an edition when the edition's `sources:` block has a row for it with no basis (the Withheld statement, case-authoring R37). C-92.4 when that is not so for the named edition's document; C-92.5 when `by` is not among the capture's actors (`capture.captureAccountsOf(sha).actors`, read whole). C-92.7 then has no separate capture arm.
  - Stored in a new table `capture_attributions (case_id, edition, capture_sha, level, chosen_by, chosen_at, reason)`, declared to purge (whole store). `attributionInForce(case, edition, sha)` answers it for a 64-hex id.
  - The attribution section (case-grammar R2's run) carries one row per such capture beside the observations, `observation: <capture sha>`, so ratification R2's stated-against-current comparison reads both alike. `attributionFacts.reached` and `.current` gain the capture shas. The section must exist for the act to re-author it: case-authoring must write the run when an edition reaches such a capture even if it reaches no observation (REPORT).

(3) R59: the viewer the commit reads accepted work as is `member:<attestorMember>` (the signer). case-import R16 answers null to a viewer who is not an active member.

(4) R59 flags: a flags read that is `complete: false` counts as not in force (C-122.3), as absent and unreadable do.
