# case-carriage — requirements

**Status** · In force: split from `publication` for size, BOB's (N532, K617, K1332), meaning unchanged. Last changed T35 (T35-53: R8) and T37 (T37-34: Purpose, R1, R8 amended; R9–R13 new; N757, N768; K2108, K2145, K2171, K2206; DEC-180); those marked not yet met (T37), every other requirement met (K2004).

**Size (P6).** About 270 lines.

## Public

### Purpose

What a case edition carries at its commit, prepared for `publication`'s commit, which calls it inside its own transaction.
- It holds, by SHA-256, the materials the signed document includes, so `public-read` carries them in the case file from the published projection alone (DEC-112).
- It re-reads what the document rests on that may have changed since it was prepared: what may be published of each source it states (N364), and another group's work it accepted (N522).

- (T37; DEC-180) It holds the marks members make on a photo a case relies on, of who and what to obscure, and the copy derived from the marks that stand, nothing of the original but its pixels, each marked area covered; a published case carries every photo only as this copy (T38; N779, K2248). A mark is withdrawn, never erased (DEC-183). Inside the group every photo stays as taken.

The refusals those re-reads lead to, and every write to the published projection's other tables, are `publication`'s. This module owns the two tables of held materials and the table of marks.

### Provides

Terms. A **material** is a row of the case document's `materials:` block (`case-grammar` R12). It is **included** when its `included` is `true` (or `"true"`).

- **R1** `holdMaterials(fm, {caseId, edition, at})` writes inside the caller's transaction and opens none of its own. For each included material of the front matter `fm`, it holds, by SHA-256:
  - **an observation**: its whole text, when the register homes its `sha` on a bundle that exists and record-core holds that file as inline text whose SHA-256 is `sha`;
  - **a document**: its captured bytes, as text when held inline at `sha`; else as `evidence` with the register's byte count, when the register homes it and no inline text is held (its bytes are only in the evidence store);
  - **a document's extracted text**, spelled by `case-grammar.extractedTextOf` (its R17) over `extraction.unitsOf(sha)`. It is held only when the index is `whole`, holds at least one unit and no unit is truncated, and only when the text's SHA-256 is the row's `text_sha`;
  - **each timestamp token** the capture's home `data/provenance.json` names for such a document (`timestamp.token_file`, and `attestations[].file` of kind `rfc3161`), read from that file as built (K1322, K1332), as text when inline, else as `evidence` under its blob digest. Co-archives are locators and hold no bytes, so none is held (K1315, K1322).

  - (T37; N757; DEC-180 (4)) **a photo carried as its copy**: a row listed `included: false` whose `obscured` names a `copy` (`case-grammar` R12): the copy's bytes as R11 holds them, `held` `derived`, kind `obscured`, under the row's ref. Nothing else of that row is held: not the original's bytes, its extracted text, its tokens, its archive or its container record (R8). A copy not held at the digest the row names is answered in `unheld` (`kind` `obscured`, why "the obscured copy is not held"). (T38; N779) A row listed `included: true` whose capture is a photo (R9's term) is not held: it is answered in `unheld` (`kind` `document`, why "a photo travels only as its copy"), so no original photo's bytes reach the published projection.

  Each text is written once to `published_material_texts` (`sha256`, `kind` `document`/`extracted_text`/`observation`/`attestation`, `text`, its UTF-8 byte length, `at`). A SHA-256 is held once per call; `files` names it once for each ref that carries it (R8).

  The list `[{sha, held}]` (`held` `inline`, `evidence` or, from T37, `derived`: an obscured copy, for `ratification` R39 to copy from where R11 holds it), in the order held, is written once for `(caseId, edition)` to `published_case_materials`; a second call for that edition writes nothing new.

  It answers `{materials, unheld, files}`:
  - `unheld`: `[{ref, kind, sha256, why}]`, at most 1,000, naming each included material, extracted text or token not held at its stated digest (no SHA-256, nothing captured, no such text, an index not whole, a token not held).
  - `files`: one `{sha256, ref, path: "materials/<sha>", kind, bytes}` per held item, for the caller to register by hash.

  Nothing is held for a material not included. A material it cannot hold is answered, never refused. Never throws.
- **R8** (N688; K1844) An included document whose capture is an archive member is carried with its archive. A document is a **member** when the entry its home's `data/provenance.json` states for it (as R1 reads tokens) has `capture.method` `"unpacked"` and a `container` block. For each such document, R1 also holds, in the same call and the same ways:
  - **its `container` record**: the `container` block as that entry states it, in `record-grammar`'s canonical JSON (`canonicalJson`), as text of kind `container`;
  - **its archive**: the capture at `container.archive_sha256`, held as R1 holds a document's captured bytes (inline text, else `evidence`), under kind `archive`;
  - **the archive's timestamp tokens**, those the archive's own home `data/provenance.json` names for it, as R1 holds a document's tokens (kind `attestation`).

  When the archive is itself a member, the same is done for its archive, in turn, up to the outermost archive. Each is held under `materials/<sha>` in `files`, so the outsider's check is the bag's `manifest-sha256.txt`, then `unzip -p materials/<archive_sha256> <container.path> | sha256sum` against the member's SHA-256, then `openssl ts -verify` on the archive's token (Intake Doctrine §3b); the bag's writer is `public-read`'s and is unchanged.

  It answers in `unheld`, never refuses, each of: a `container` block whose `member_sha256` is not the document's SHA-256 or whose `archive_sha256` is not 64 hexadecimal digits (`kind` `container`, why "the container record does not name this document"); an archive not held at its digest (`kind` `archive`, why "the archive is not held"); an archive token not held (`kind` `attestation`). A document that is not a member is held exactly as R1 states.

  (T37; N768; K2145) An item two or more included materials carry (a `container` record, an archive, an archive's token) is answered in `files` once under each of their refs, so `publication` registers it under every ref that carries it; it is still written to `published_material_texts`, and listed in the edition's `[{sha, held}]`, once. (T37; N757; T38: N779, K2291) A photo, always carried as its copy (R1), carries none of R8's files, and an archive that also holds any image is carried for no material (it holds the original): each material whose walk reaches it answers it in `unheld` (`kind` `archive`, why "the archive holds an image, and an image leaves only as its copy"), and the walk stops there.
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

#### The marks on a photo and its copy (T37; N757; DEC-180 (2)–(5); K2108, K2206)

A **photo** is a document whose capture is an image. A **mark** is one `obscureMark` act; an **area** one rectangle of it. A photo is **marked** when any of its marks has an area.

- **R9** `obscureMark({captureSha, areas, by})` (`op=obscuremark`) records one mark on a photo. `areas` is a list of at most `MARK_AREAS_MAX` (exported) `{rect, kind, reason?}`: `rect` `[x0, y0, x1, y1]` in the photo's pixels as displayed (`image-cover` R1); `kind` `person` (someone not part of a finding), `plate` (a number plate) or `staff` (a city staff member at work); `areas: []` records "nothing to obscure". `by` is the control plane's stamp. Refusals, in order, each writing nothing: `MACHINE_CANNOT_MARK_PHOTO` (N790, K2238: its own code, no other family's) when `by` is absent or a machine identity (an assistant's proposal of areas is Bob's, DEC-180); `NO_SUCH_PHOTO` for a capture the record does not hold or `by` may not see, one answer (`membership`'s sight of a capture); `NOT_A_PHOTO` for a capture that is not an image; `MARK_MALFORMED`, naming the area (`areas` not a list or over the bound, a `rect` not four integers with `x0 < x1` and `y0 < y1`, an unknown `kind`); `STAFF_MARK_NO_REASON`, a `staff` area whose `reason` is absent, not a string, blank or over 2,000 characters (city staff at work are part of what a case is about, so one is obscured only with a reason); `image-cover`'s `AREA_OUTSIDE`, relayed with its detail. Otherwise it records the mark `{mark, capture, areas, by, at}` (`at` record-core's instant), derives the photo's copy from the marks that stand (R11), including after a mark with no area, and answers `{ok: true, mark, state, copy, refused}` as R10 answers them after the act. No act changes or erases a mark. A mark leaves the photo's copy only by a withdrawal (R14), and a later "nothing to obscure" never removes an area. Its refusals are rows of a family of this module's own, numbered at their stamp.
- **R10** `photoMarks({captureSha, viewer})` (`op=photomarks`) answers, to a member who may see the photo, `{ok: true, capture, photo: true, state, marks, copy, refused}`: `state` read over the marks that stand (none withdrawn, R14): `marked` when any has an area, `nothing_to_obscure` when some stand and none has an area, `unchecked` when none stands; `marks` each `{mark, areas, by, at, withdrawn}`, oldest first, withdrawn ones included, `withdrawn` `{by, at, reason}` or null; `copy` `{sha256, covered, width, height}` of the current copy (R11), or null; `refused` `{code, detail}` when `image-cover` refused the cover by name, else null. A capture that is not an image answers `{ok: true, capture, photo: false}`; one the viewer may not see, or the record does not hold, `NO_SUCH_PHOTO`. It is synchronous, reads only what this module and the record hold (no bucket read), writes nothing and never throws.
- **R11** (DEC-180 (2), (4); the design detail answering B97; T38: N779, K2248; DEC-183 (2)) After each mark and each withdrawal (R14) that leaves a mark standing, the photo's copy is derived by `image-cover.coverAreas` (its R1) from the original's bytes, read from the evidence store by digest (`record-core`'s `evidenceStore`, its R38), and every area of every mark that stands, with `areas: []` when none has an area (a copy with nothing covered and, as with any copy, no metadata: `image-cover` R2); when the act answers, the copy `photoMarks` answers is that derivation. A photo with no standing mark has no copy (null). The copy is held under its own SHA-256 outside `captures/`, labelled derived and naming its original; it is never registered (`provenance`), never a capture, never graded, never cited and never in a provenance chain. No act of this module changes, replaces or hides the original. When `image-cover` refuses the cover by name (`NOT_A_COVERABLE_FORMAT`, `UNSUPPORTED_JPEG_PROCESS`, `PNG_INTERLACED`, `PHOTO_TOO_LARGE`, `TRUNCATED_IMAGE_DATA`, `IMAGE_DATA_CORRUPT`), whether the photo is marked or not, the act stays recorded, no copy is made, and `refused` names the code: a case relying on the photo is refused until it is captured again in a format that can be covered or no longer relied on (`case-disclosures` R6; K2206). `OBSCURED_LABEL` is exactly "Faces and plates obscured for publication; the group holds the original", exported and held once here, protected words held for translation (DEC-179; DEC-180's owed line), which the design stream may re-word.
- **R13** (T37; N757; K2206) `marksLapsed(fm)` answers the `materials:` rows (`case-grammar` R12) of a case document whose photo's marks no longer match what the row states: a row stating `obscured` whose `copy` is not the photo's current copy (R11), so a withdrawal since preparation is a lapse, and a photo row carried whole (`included: true`), always, each `{ref, sha, why}`, at most 200; `[]` when none. A photo whose marks cannot be read is answered lapsed (fail closed). Synchronous; writes nothing; never throws. `publication` R57 refuses the commit on it.
- **R14** (T38; N788; DEC-183 (2); K2220) `obscureMarkWithdraw({captureSha, mark, reason, by})` (`op=obscuremarkwithdraw`, in `caseCarriageOps` beside `obscuremark`; `by` from the query only, the rest from the body) withdraws one mark on a photo. The act may be done by the mark's maker or by any member who may see the photo (R9's sight). Refusals, in order, each writing nothing: `MACHINE_CANNOT_WITHDRAW_MARK` when `by` is absent or a machine identity; `NO_SUCH_PHOTO` as R9; `NO_SUCH_MARK` when `mark` is not a mark on that photo; `MARK_ALREADY_WITHDRAWN`, naming when it was withdrawn and by whom; `WITHDRAW_NO_REASON` when `reason` is absent, not a string, blank or over 2,000 characters. Otherwise it records `{withdrawal, mark, capture, reason, by, at}` (`at` record-core's instant) beside the mark (R12), re-derives the copy (R11) and answers `{ok: true, mark, withdrawal, state, copy, refused}` as R10 answers after the act. The new codes are rows of C-141, numbered at their stamp; their translations are BOB's drafts, re-wordable by the UX stream.

## Private

### Uses

- `test-support`: `make-zip.mjs` (tests only; R8; K2002).
- `record-grammar`: `createSha256`; `canonicalJson` (T35, R8).
- `record-core`: `readFile` (R13), the `bundles` read contract (R37), `declarePurge` (R21).
- `membership`, `promotion`: only to construct `extraction`, `sources` and `accepted-work` through their factories.
- `provenance`: the `register` read contract (R48), for `capture_sha`, `bundle_id`, `path` and `bytes`.
- `sources`: `publishableAt` (R8), the `source_knocks` read contract (R15).
- `extraction`: `unitsOf` (R36).
- `accepted-work`: `acceptedFinding`, `openFlagsOn` (R2).
- `case-grammar`: `materialsOf` (R12), `extractedTextOf` (R17), `acceptedWorkOf` (R16), `caseDocumentBlocks` and `sourceRowsStanding` (R1).
- (T37) `image-cover`: `coverAreas`, `COVER_MAX_BYTES` (its R1–R3; R11). `record-core`: `evidenceStore` (its R38; R11), `declareTable`, `stampInstant` (R9, R12). `membership`: the sight of a capture (R9, R10). `record-grammar`: `isMachineIdentity` (R9).
- `acquisition`: the `archive_entries` read contract (its R45; R8, R1; K2307).

### Invariants

- **R6** (was `publication` R31's clause; K1316) `published_material_texts` and `published_case_materials` are declared to record-core's purge as exempt, as published bytes are. They are content-addressed and append-only: a held text or list is never rewritten or removed (as `publication` R24).
- **R7** (copied from `publication` R34) No place is named in this module's behaviour or outward text.
- **R12** (T37; DEC-180 (2), (3); T38: DEC-183 (2)) The marks and their withdrawals (R14) are declared to `record-core` (`declareTable`) with their classes and are append-only (`version_chain: true`). A withdrawal is its own row naming the mark, beside it, and never changes or removes the mark row: a test proves no act of this module rewrites or removes a mark or withdrawal row. No area's rectangle, kind or reason, no withdrawal's reason, and no maker leaves the group in a case's bytes: the copy carries only the covered pixels (`image-cover` R2).

### Satisfies

- DEC-112 (3), (4) (R1–R3, R6); `BIO_Publication_v0_1.md` §5C.
- DEC-96 items 1, 4; N522 (R4).
- DEC-78 item 5(d); N364 (R5).
- K1315, K1316, K1317.
- K1844 (ZIP archives; N688), `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3b (each step a stock tool): R8.
- DEC-180 (2)–(5), with its design detail answering B97 (Bob, K2108): R1, R8–R13; K2206. K2145 (N768): R8.
- DEC-183 (1), (2) (K2220), N779 (K2248), N788, N790 (K2238): R1, R8–R14; K2291.

### Suggestions

- **Factory.** `caseCarriageOf(host, deps)` keeps one instance per host. `publication`'s factory creates it eagerly, so its tables exist and are declared at every boot (K1024's form). A given `extraction`, `sources` or `acceptedWork` is used as is (test injection); otherwise each is reached lazily through its factory.
- **As built (R1's tokens).** R1 states the code as built (K1322, K1332): the token files are those the capture's home `data/provenance.json` names for that capture. Co-archives are locators and hold no bytes.
- **For callers.** `publication` registers R1's `files` in `published_shas` in the same transaction, and raises C-122.1 on R5 and C-122.3 or C-122.4 on R4 (its R51, R59). It answers its own `heldMaterialsOf` and `publishedMaterialText` through R2 and R3, so `ratification` R39 and `public-read` R23 read unchanged.
- **R8's kinds.** `published_material_texts.kind` gains `archive` and `container`; R3 answers either as stated. A test builds an archive with `test-support`'s `make-zip.mjs`, unpacks one member, publishes a case citing it, and runs the three steps of the outsider's check over the bag's files (with `unzip` and `openssl` where the runner has them, else their equivalents in-process).
- **(T37) The copy and the marks.** Hold the copy under `<store>/obscured/<sha>` in the evidence bucket, beside file-safety's `<store>/derived/` (its R12, R33), so the two owners' objects stay apart; name the key in the COMPLETE for `ratification` R39. Tell a photo by the type recorded with its capture (the home's `data/provenance.json` `capture.content_type`), else its register path's extension, so R10 stays synchronous (`case-disclosures` R23). Serialise derivation per capture (for instance a per-capture chain) so R11's guarantee holds when two members mark at once. Tests: N768's two materials sharing one archive; each R9 refusal's negative control; two members' marks both covered; a progressive JPEG and a HEIC (`refused`); a photo that is an archive member (R8); R12's append-only arm; R1 holds no byte of the original for a copy-carried row; R13's two lapses and its fail-closed arm.
- **(T38) The codes reach the wire (N790).** A test that the composed catalogue holds each of this module's codes (C-141) once, `MACHINE_CANNOT_MARK_PHOTO` and R14's among them.
- **Tests.** A negative control for each withdrawn and undisclosed arm of R4, and for each lapse of R5. An arm that R1 writes nothing for a material not included. A purge arm for R6.

