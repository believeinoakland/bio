# case-checker — requirements

**Status** · In force: a new product module, placed by BOB (K1256, K1257); folded at T28's opening (N519, N520; K1268, K1277), R18 N522's (K1273). It runs `case-catalogue`'s pure case-document checks (K1824). Last changed T35 (T35-58: R21), T36 (T36-51: R14, R22; K2129) and T37 (T37-20: R1, R8, R14, R22 amended; N757, N763; K2140, K2206; DEC-180); those marked not yet met (T37), every other requirement met (CASE-CHECKER #6, K2013).

**Size (P6).** About 900–1,300 lines, well under 4,000: the checks, the result composer, the readable specification and the build of the standalone program.

## Public

### Purpose

Anybody can check a published case, and recreate its findings, without a Civicsmith copy (DEC-112 (3); Publication §5C). This module is the one checker. It is a pure function that Civicsmith runs on import (`case-import`), built from the same check code Civicsmith runs. It is also a standalone program that anyone runs offline against a case file. Recreating shows a case intact and consistent, not true.

### Provides

Terms. The **case file**, its **manifest**, **parts** and **files** are `case-grammar` R13's. A **finding** is a member of the case edition, or a finding a member's chain reaches. A **result** is one of `recreated`, `recreated_in_part` or `did_not_recreate`.

**checkCaseFile({parts, documents?, keys?})**

- **R1** It answers `{format, case, edition, group, checker: {grading_versions, checks_version, calc_versions}, integrity, signatures, publication_checks, calculations, findings: [{finding, role, result, missing[], differs[], pair, bar_met}], complete_edition, statement}`. `parts` are the case file's parts as bytes. `documents` are bytes supplied later for missing material (R9). `keys` is the publishing group's public signing keys, as its copy serves them (`network-notices`). (T37; N757) The answer also carries `obscured: [{ref, sha, copy, label}]`, each row R8 judged as carried as its copy, in the document's order, `[]` for none. `statement` is the sentence that recreating shows the case intact and consistent, not true; the words are the UX stream's, and until it gives them, that plain sentence. It is pure: it reads nothing but its arguments, writes nothing, makes no network request and never throws. Malformed input answers `integrity` with each departure named and every finding `did_not_recreate`. (DEC-112 (3)(6); Publication §5C)
- **R2** Integrity. The manifest is checked by `case-grammar`'s `caseFileManifestCheck` (its R13). Every file's SHA-256 and byte length are checked against the manifest, and so is every part's SHA-256. When a part or file is absent, it is named in `missing` for each finding that needs it. When a hash differs, it is named in `differs` for each such finding. (DEC-112 (3))
- **R3** Signatures. The case document's signature is verified with `signatures.verifySshsig` over `caseRatifyStatement(case, edition, doc_sha)` in the ratify namespace. Each member finding's signature is verified over `ratifyStatement(id, sha)`. Each is checked against the key it embeds and the keys the case file lists (`case-grammar` R13). When `keys` is given, the answer also says whether each signing key is among them. When `keys` is absent, the answer states that the keys were not checked against the group's published list. A signature that fails is a `differs` entry for the case and for every finding it covers. Each `material_attestations:` row (`case-grammar` R12) is checked by its kind. A `member` row that carries a signature is verified over `signatures.captureAccountStatement(sha, text)` (its R41) in the ratify namespace. A `group` row is the case document's signature, already verified. A `project` row is checked to name a material the manifest lists. A failed row is a `differs` entry for each finding whose chain reaches that material. (DEC-112 (3)(5); Publication §5C "signatures and fingerprints check"; DEC-119 (1), K1275)
- **R4** Passages. Each passage a finding relies on (`case-grammar` R13's `passages` rows) must be found where it is said to be: its quoted text occurs in its document's carried extracted text at its stated extent, and its `content_id` recomputes by `content.contentIdFor` (its R3). If the passage is not found, that is a `differs` entry. If the document's extracted text is not carried, that is a `missing` entry. (Publication §5C "each passage is found where it is said to be")
- **R5** Grades. Each finding's pair is recomputed by `strength.recomputePair` (its R32) from the finding's carried grading facts, at the `grading` version the signed case document states (`case-grammar` R11).
  - A pair that differs from the pair the document records is a `differs` entry naming the axis, the recorded grade and the recomputed grade.
  - A version this checker does not hold (`UNKNOWN_METHOD_VERSION`) is a `missing` entry naming the version.
  - `pair` is the recomputed pair. Pairs are per finding and per axis, and nothing composes them (R12). (Publication §5C "each grade recomputes the same by the stated method version")
- **R6** The bar. A load-bearing member that reaches the bar the document records on every declared axis answers `bar_met: true`. Otherwise it answers `bar_met: false`, naming each axis, and that is a `differs` entry. A supporting member answers `bar_met: "not_asked"`, and a case with no bar answers `bar_met: "no_bar"`. (Publication §5C "each relied-on finding meets the declared bar"; `case-authoring` R6)
- **R7** Publication checks. `case-catalogue.checkCaseDocument` (its R1, pure; was `ratification` R8, K1824) runs over the case document. Arms that need the record (an absent member basis) are left unasked and named. `publication_checks` answers the findings, the catalogue version the document states (`case-grammar` R11's `checks`), and this checker's own version. When the two versions differ, it states that the checks ran at this checker's version, not the stated one (K1134 reading 5). A refusal it finds is a `differs` entry for the case. (Publication §5C "the case passes the same publication checks")
- **R8** Presentability. Every material a load-bearing member's chain reaches must be listed in the document's `materials:` block (`case-grammar` R12) as `included: true` and carried whole: its bytes and extracted text, or an observation's text. Missing carried bytes are a `missing` entry. A load-bearing chain reaching material that is not listed, or listed `included: false`, is a `differs` entry. Material from a source whose identity is withheld is checked like any other. (DEC-112 (4)(5); DEC-119 (1), K1275) (T37; N757; DEC-180 (4); K2206) A row carried as its copy (`case-grammar` R12's `obscured`) is presentable when a file of kind `obscured` is carried at its copy's SHA-256 (R2 checks its bytes), else it is a `missing` entry naming the copy; its extracted text and the original's bytes are not asked (the original never travels), and the answer states the row's label beside that material.
- **R9** Completion. Bytes in `documents` whose SHA-256 matches a material's recorded fingerprint fill that gap, and the finding is re-checked with them. (N599, K1646) Equally, bytes whose SHA-256 matches a calculation input's stated SHA-256 (`case-grammar` R18's `inputs`) that R20 names `missing` (absent from the case file, or carried with other bytes) fill that input: R20 recomputes the calculation with them, and every finding resting on it takes the new entries (R11), so a case completed with the same bytes reads alike here and in `case-import` (its R5, R21). Bytes that match no recorded fingerprint and no calculation input's hash are named in the answer and never used. (Publication §5C "a fetched document that matches its fingerprint completes it")
- **R10** The complete edition. `complete_edition` answers whether the carried complete edition's bytes equal the edition `case-grammar.completeEditionOf` (its R14) renders from the rest of the case file. When they differ, that is a `differs` entry for the case. (DEC-112 (2)(3)) The product's name in that render follows the case document's format (`case-grammar` R14): a `bio-case-document/6` case file renders "CivicOS" and a `/7` one "Civicsmith", so a case file published before T31 still compares equal. A test proves that a `/6` case file whose complete edition was rendered before T31 answers no `differs` entry here. (DEC-124; K1365 (1))
- **R11** Results. A finding is `recreated` when it has no `missing` and no `differs` entry, including none from the case-level checks R2, R3, R7 and R10, and none from a calculation its chain rests on (R20). It is `recreated_in_part` when it has `missing` entries and no `differs` entry. Otherwise it is `did_not_recreate`. Each entry names what is missing or what differs in words a reader can act on, for example a document to fetch, with its fingerprint and origin. (DEC-112 (6))

**The standalone program and the readable specification**

- **R13** The module builds one self-contained program file from the code of R1–R11 and R20, `calc-grammar`'s evaluator bundled into it (K1448), with nothing to install and no network access, that runs `checkCaseFile` on case-file parts a person gives it and prints R1's answer, each finding's result first. The same build produces the same bytes. The program file carries its own SHA-256. (DEC-112 (3): "a standalone open checker let[s] anyone recreate a case without CivicOS")
- **R14** The readable specification of each case-file format version (`bio-case-file/1` first) is a document held with this module. It is written from `case-grammar` R11–R13 and states every field, kind and rule a checker needs. Its version names the format it specifies. (K1134 (1); DEC-112 (3) "an open specification") (T36; N717, K2129) `bio-case-file/2` (`case-grammar` R13 as amended: the `archive`, `container` and `criteria` kinds) is specified beside `/1`, and `casefilespec` (R15) answers both. (T37; N757; K2206) `bio-case-file/3` (`case-grammar` R13 as amended: the `obscured` kind and R12's `obscured` field) is specified beside `/1` and `/2`, and `casefilespec` answers all three.
- **R15** At start, the module registers with `public-read` (its R18) two credential-free public reads: `casechecker`, which answers R13's program file, and `casefilespec`, which answers R14's specification for a named version (`version`). An unknown version is answered with the versions held. (DEC-112 (3); K1134 (1))

**Another group's work a finding rests on** (DEC-96 item 4; N522)

- **R18** A finding whose chain reaches an imported finding reference (a ref, `inquiry-grammar` R11) is recreated up to that leg.
  - R5 recomputes with the row's `pair` (`case-grammar` R16) as that leg's fact.
  - R4 and R8 do not follow past it.
  - The answer lists `rests_on_another_group: [{group, case, edition, finding, manifest_sha}]`, with the sentence that this part is checked against that group's own case file. The words are the UX stream's.
  - It adds no `missing` entry, and it is never `recreated` on that group's behalf.
- **R19** `readCaseFile(parts)` answers `{manifest, files: [{path, kind, sha256, bytes, content}], departures}` from a case file's parts (`public-read` R6's stored ZIPs), every way they depart from `case-grammar` R13 named in `departures`. It is the one reader of the format, used by R2 and by `case-import` (its R1, R5). Pure; never throws. (DEC-112 (3); K1315)

  (DEC-96 item 4; DEC-112 (6); K1273 reading 2)

**Standards a case measures against** (STANDARDS L2–L3; N648)

- **R21** (N648; K1723, K1739) `checkStandardsUse({text, criteria, materials, passages})` judges how a case document uses the standards it measures against. `text` is the case document; `criteria` its rows as `publication` R72 shapes them, each also carrying `captures`, the SHA-256s of the captures that hold the standard's text; `materials` the document's `materials:` rows (`case-grammar` R12); `passages` the case's passage rows (`case-grammar` R13's `passages`), each with the finding that relies on it. It answers `{ok: true}`, or `{ok: false, refusals}` naming every departure, never only the first:
  - `COPYRIGHTED_TEXT_CARRIED` `{standard, sha}`: a material listed `included: true` whose `sha` is one of the `captures` of a standard whose `access` is not `free` (the whole text would travel);
  - `COPYRIGHTED_PASSAGE_UNRELIED` `{standard, content}`: a passage of such a standard's capture that no finding relies on (only the passages a finding relies on are quoted, K1739);
  - `BENCHMARK_CALLED_NONCONFORMING` `{finding, standard, word}`: a member finding whose criteria rows are all `binds: false` (it rests on no standard that binds the body) and whose conclusion or claim, as the document states it (`case-authoring` R14), or the case's statement, uses `violated`, `violates`, `violation`, `nonconforming`, `non-conforming`, `nonconformity` or `nonconformance`, matched as whole words in any letter case (K1723: such a finding says "slower than" or "below").

  A criteria row with `stated: "not held"` is not judged and is named in `unjudged`. Pure, as R1: it reads only its arguments, the same arguments give the same answer, and it never throws (malformed arguments answer `{ok: false, refusals: [{code: "MALFORMED", field}]}`). The ceremony's refusal is its caller's (Suggestions).

- **R22** (T36; N717; K2129) When a case file carries a `criteria` file (`case-grammar` R13), R1 also answers `standards_use`: R21 over the case document, that file's rows, the document's `materials:` rows and its `passages`; each row carries `captures` as `publication` R72 froze them, only the captures the edition itself carries (T37; N763; K2140), so `COPYRIGHTED_TEXT_CARRIED` and `COPYRIGHTED_PASSAGE_UNRELIED` are judged offline over them, exactly as R21 judges them at the ceremony; a row frozen before T37 carries no `captures`, and a check that needs them is not judged for it and its standard is named in `unjudged` (stated, never filled). With no `criteria` file, `standards_use` is null. It changes no finding's result and is pure, as R1.

**Calculations a case carries** (C:A-13; K1448)

- **R20** Each row of the case document's `calculations:` block (`case-grammar` R18) is recomputed by `calc-grammar.evaluate` over the inputs the case file carries (`case-grammar` R13's `calculation` kind), each input first checked against its stated SHA-256, at the method version the row states. `calculations` answers, per calculation, `{calc, result: agrees | differs | not_recomputed, differs[], missing[]}`: a result or `result_key` that recomputes differently is a `differs` entry naming the result, the stated and the recomputed value; an input absent or whose bytes differ from its hash, or a method version this checker does not hold, is a `missing` entry naming it; a row the document discloses as unbound or differing is answered with that disclosure and is not a `differs` entry for being so. A finding whose chain rests on a calculation takes its entries (R11). A workbook, or a value from a third party's engine, is answered `not_recomputed` with the sentence that it was recomputed by the publishing copy's engine, never as agreeing (K1448). Pure, as R1.

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, canonical JSON.
- `signatures`: `verifySshsig`, `ratifyStatement`, `caseRatifyStatement`, `captureAccountStatement`, the ratify namespace (R3).
- `bundler`: the build of R13's program.
- `content`: `contentIdFor`, `canonicalExtent` (its R2, R3; R4).
- `strength`: `recomputePair`, `GRADING_METHOD_VERSION` (its R31, R32; R5).
- `case-grammar`: `caseFileManifestCheck`, `methodOf`, `materialsOf`, `completeEditionOf` and the format predicates (its R1, R11–R14).
- `public-read`: the public-read registration (its R18; R15).
- `case-catalogue` (K1824): `checkCaseDocument`, `CASE_MEMBER_ROLES` (its R1, R2; R7), imported from its pure `checks.mjs` (was `ratification`'s R8, R9).
- `calc-grammar` (T33-66): `evaluate`, `resultKey`, its method version (R20), bundled into R13's program.
- `case-grammar` (T33-66): `calculationsOf` (its R18).

### Invariants

- **R12** No answer composes a case-level strength or a single verdict on the case's truth. Pairs are per finding and per axis (DEC-44, DEC-21), and recreation is never stated as endorsement (Publication §5C).
- **R16** R1–R11 read only their arguments. The same arguments always give the same answer (byte-identical canonical JSON), on a Civicsmith copy and in the standalone program alike.
- **R17** No place is named in this module's behaviour or outward text.

### Satisfies

- DEC-112 response 4 (3) (the open specification and the standalone open checker) and (6) (recreation, the three results), as K1134 (1), (2) readings 1 and 5 read them; `BIO_Publication_v0_1.md` §5C ("The case file", "Import", "Off-the-record sources"); DEC-112 (5) as restored by DEC-119 (R3, R8; K1275). K1256, K1257 (the module).
- DEC-96 item 4 and DEC-112 (6)'s last clause (R18; N522, K1273).
- DEC-180 (4) (Bob, K2108): R1's `obscured`, R8's copy, R14's `/3` (N757, K2206). N763 (K2140): R22 offline over the frozen `captures`.
- `BIO_Capability_Ladders_v0_1.md` §6C.4 L2 ("`case-checker` refuses a publication that quotes more of a copyrighted standard than the passages a finding relies on") and L3 (a benchmark: "below", never "violated" or "nonconforming"); K1723, K1739 (R21; N648).

### Suggestions

- **The program's form** is BOB's at the START. One JavaScript file runnable by Node with no dependencies, which also works as an HTML page with the script inline, is one way to meet "nothing to install".
- **A program handed out before T31** does not know `bio-case-document/7`, so it may report a newer case's complete edition as differing (R10). The matching program is the publishing copy's `casechecker` read (R15); this is stated, not engineered around (DEC-124; K1365 (1)).
- **Import only pure code.** Import the pure check code from `ratification/checks.mjs` and `strength/arithmetic.mjs`, not their store-bound entry points, so the bundle stays small and offline.
- **T35-58 (open technical details, BOB's).** R21 is a pure check; the refusal at the ceremony needs a caller with the record: `case-authoring`'s pre-flight (its R34) or `ratification`'s R2 asks `standards` and `publication` for the criteria and refuses with R21's codes. Neither entry is in T35's plan; BOB names the caller (see the notes). `checkCaseFile` (R1) does not run R21 until the case file carries the criteria rows (`case-grammar` R13 has no such kind); adding them is a format change of `case-grammar`'s, not made here. The word list is BOB's under K1723 and may grow without a change of meaning.
- **Tests.**
  - A case file built by `public-read` R23 from a fixture case recreates every finding.
  - Each check has a negative control: a changed byte, a forged signature, a moved passage, a changed recorded grade, a bar not met, a missing part (`recreated_in_part`), a document supplied later that matches, and one that does not.
  - A case resting on material from a withheld source recreates like any other, and a forged attesting member's signature on it is a `differs` entry (K1275).
  - The standalone program and `checkCaseFile` give the same answer on the same parts.
  - A finding resting on another group's accepted finding recreates up to that leg, lists it under `rests_on_another_group`, and adds no `missing` entry (R18).
