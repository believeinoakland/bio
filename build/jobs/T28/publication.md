# publication (T28)

**Status** · session_01XULTB98f6bHiUb3Y9gRxug · depth 2 · WORKING · handled B4

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

## J2 · REPORT

REPORT: what my T28 change does to other modules' tests (measured against a scratch stub of case-grammar's T28 names, the same stub on tranche/T28 as the baseline; 107 tests red with my change that are green without it).

1. R58 (C-122.2) refuses committing any case document that is not /6. Every other module whose test fixture signs a /4 or /5 document through `commitCaseEdition` goes red until its fixture writes /6 (with `method:` and `materials:`):
   - ratification (T28 L8 job): case-commit 6, caseratify-op 3, converted-a 6, converted-b 3, converted-c 1, converted-d 9, preflight 6, relays 1, seals 5.
   - public-read (T28 L8 job): edition-statements 6, project-reference 3, published 1, sources 1, tensions 2.
   - conformance (layer 9, NO job in T28): contradiction-cause 11, determine 18, helpers 4, reads 12, record 7. Its fixture signs a /4 case.
   - affordances (L11 job): backing.test.mjs R19, through a fixture that signs a /4 case.
   My own module's tests keep reading older signed documents through a fixture helper that writes their rows as a pre-T28 commit did (`signLegacy`); the same pattern serves any module that must keep reading an older edition.
2. R60 re-words C-92.4 and C-92.5's translations (they now cover a capture's attesting member): control-plane's `catalogue-end.test.mjs` (R43, R22) pins each decorated code's translation, so it goes red until control-plane's L11 job re-pins it. The rows also read `awaiting stamp` (accepted red 2), with C-122.2, C-122.3 and C-122.4.
3. P6: publication now measures 3,935 lines by its paths (was 3,633), near the 4,000 mark. The seam the draft named stands: R57's holding (`#holdMaterials`, `#tokenFiles`, `publishedMaterialText`, `heldMaterialsOf`, about 140 lines) and R59's re-read (about 50).
4. For public-read: R57's texts are read in-process with `publication.publishedMaterialText(sha)` (no op added); the commit's `materials` answer and `heldMaterialsOf` are as K1317 states.

I am otherwise built and green against the stub; I complete once case-grammar is merged and my tests run against its real code.
