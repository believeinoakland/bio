# case-grammar — requirements

**Status** · In force: split from `publication` for size (K617, K651), meaning unchanged: R1 is `publication` R20, retired there; R6 and R7 copies of its R28 and R34; DEC folds approved by Bob (K1019), R9's first lens sentence Bob's (DEC-117). R21 is a copy of `case-disclosures` R28's block spelling, so `ratification` R41 reads the signed document's ties (K1816). Last changed T36 (T36-25: R13 `bio-case-file/2`, R22; K2129, K2144) and T37 (T37-40: R12, R13 (`bio-case-file/3`, the `obscured` kind), R14 amended; N757; K2108, K2171, K2206; DEC-180) and T39 (T39-9: R12–R14 worded for a member document's copy; N806; K2333). Last changed T40 (T40-16a: R12, R14 amended; N798; DEC-185; K2394); those marked not yet met (T37, T40), every other requirement met. Last changed T41 (T41-34's text: R23–R26 new, R13 and R14 amended, R14's T40 text kept; N820; D56–D61, D63; K2405, K2417, K2418); marked not yet met (T41).

**Size (P6).** About 425 lines. Pure: it reads no table and holds no store.

## Public

### Purpose

The case document's grammar, one spelling for every module: the formats and their predicates, the `/5` blocks and the tension section, the section locators and the attribution run's text, the signed citations, and the edge set a finding "rests on". Text in, values out.

### Provides

#### The formats and the `/5` blocks

- **R1** (was `publication` R20) `CASE_DOCUMENT_FORMAT` is `bio-case-document/5`; `/4`, `/3`, `/2` and `/1` are accepted as written (`CASE_DOCUMENT_FORMATS_ACCEPTED`). `caseDocumentStatesMemberBlocks(fm)` is true for `/5`, `/4`, `/3`, `/2`; `caseDocumentRequiresDisclosures(fm)` for `/5`, `/4`, `/3`; `caseDocumentRequiresV4Disclosures(fm)` for `/5` and `/4` (the three predicates hold for `/5` as they hold for `/4`); `caseDocumentRequiresTensionSection(fm)` for `/5` only. Pure; never throw. They are the one reading of a document's shape for every module. `/5` also states two blocks (DEC-81 item 1, DEC-78 item 5): `captures:`, one row per capture a member rests on, `{capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only}`, an acknowledged capture adding `acknowledgement_reason, acknowledged_by, acknowledged_at, sentence` (`case-disclosures` R3's fixed sentence), read back as `acknowledgement: {reason, acknowledged_by, at, sentence}`; `capture_accounts:`, one row per signed account `{capture, by, at, text_b64, signature_b64}` (the exact bytes, so the signature verifies), read back on each capture as `accounts: [{by, at, text, signature}]`; and `sources:`, `{capture, stated, basis}` (K549, K553: the grammar holds flat rows only). No `/5` document is stored anywhere yet, so the blocks join `/5` and no `/6` is needed. `/5` also states R8's "What changed" block and R9's lens blocks, on the same reading. (DEC-101, DEC-103; K1019) From T28, `CASE_DOCUMENT_FORMAT` becomes `bio-case-document/6`, and `/5`–`/1` are accepted as written. `/6` states everything `/5` states, plus R11's `method:` block and R12's `materials:` and `material_attestations:` blocks, which `caseDocumentRequiresMaterials(fm)` (true for `/6` only) makes required. The other predicates hold for `/6` as they hold for `/5`. (DEC-112 (3); K1268, BOB's decision 2) From T31, `CASE_DOCUMENT_FORMAT` becomes `bio-case-document/7`, and `/6`–`/1` are accepted as written. `/7` is identical in fields to `/6`: it states exactly what `/6` states, and every predicate (`caseDocumentRequiresMaterials` included) holds for `/7` as it holds for `/6`. The two differ only in the product name the complete edition renders (R14). (DEC-124; K1365 (1))

#### The sections a later act re-authors, and the attribution run

- **R2** (K651: the spelling behind `publication` R17) `ATTRIBUTION_LEVELS` is `group`, `project`, `cover`, `name`, most protective first. `ATTRIBUTION_PROSE_HEAD` is `## Whose Words These Are`. `attributionFrontmatterLines(rows)` answers the run `observation_attributions:` with, per row, its `observation` (or, for an off-the-record capture's attesting member, `capture`, the capture's SHA-256, in its place: `publication` R60; K1315), its `level` (`null` when none is chosen), `shown` (quoted, or `null`) and `chosen_at_edition`; `attributionBodyLines(rows)` answers the section under the head: the count of firsthand observations the case rests on, the sentence that what it shows of who said each one is that member's own choice for this edition, and one line per observation stating the level and what is shown, or, where no level is chosen, that none is and why, and that the edition cannot be signed until its author chooses one. A value written on one front-matter line has its line breaks folded to a space and its double quotes and backslashes made apostrophes (`fmSafe`). They are the one spelling of the attribution section: `publication` R17's `attributionStatements` answers it, and `case-authoring` R14 writes it. Pure; never throw.
- **R3** (K651: the locators behind `publication` R21) `REAUTHORABLE_SECTIONS` is `attribution`, `acknowledgements`, `attestations` (K1317). Each is located in a document's lines as a front-matter run and a prose run: `attribution`, from `observation_attributions:` to the next top-level key, and from R2's head to the next `## ` heading; `acknowledgements`, from the line beginning `  statement_sha: ` to `completeness_excluded:`, and from the line beginning `**Who else read this statement.**` to the blank line before `## What Was Searched`; `attestations`, from `material_attestations:` to the next top-level key, with no prose run (K1317). A document carrying no such run answers null for it, so `publication` R21's `reauthorSection` leaves that document as it is. Pure; never throw.

#### What a signed document cites, and what a finding rests on

- **R4** (K651: the citations `publication` R1 answers) `signedCitations(text)` answers, for a document of a format R1's `caseDocumentRequiresV4Disclosures` holds for and carrying a `case_citations` list, `{state: "signed", rows}` with that list as signed; for every other document, `{state: "undetermined", rows: null, stated}`, the sentence that it was signed before a case's citation edges were pinned to the capture they were made against and carries neither (R6). Pure; never throws.
- **R5** (K651; D-431, `BIO_Publication_v0_1.md` §3 rule 2, the second note) `publishedGraphEdges(fm)` answers the edge set a finding rests on, from its front matter: one edge per `references[]` entry naming a string `target`, `{to: target, kind, disclosure: "serve"}` with `kind` the entry's `rel` (`cites` when it names none); then, name-only, `{to, kind: "division_parent", disclosure: "name"}` for a `division_parent` that is a string other than `"null"`, and `{to, kind: "division_sibling", disclosure: "name"}` for each non-empty string of `division_siblings`. A finding rests on exactly the targets of its `serve` edges. It is the one spelling of that set: `ratification` builds the published graph from it (its R4, R5) and `publication` R38's `ratifiedFindingsRestingOn` asks it of each pinned finding's bytes. Pure; never throws, answering `[]` for no front matter.

#### What changed in this edition, and the lens it was produced under (DEC-101, DEC-103; K1019)

- **R8** The case document's "What changed" block, one spelling for every module. `what_changed:` holds `{statement_sha, began_as, draft, adopted_as_drafted}`: `began_as` is `member` or `machine_draft`; `draft` names the machine draft (`case-authoring` R39; null for `member`); `adopted_as_drafted` is true when the member signed the draft's words unchanged, false when they rewrote them, null for `member`. The statement itself is the body section under `## What Changed in This Edition, and Why`, and `statement_sha` is the SHA-256 of its text. `whatChangedOf(fm, body)` reads both back as `{statement, began_as, draft, adopted_as_drafted}`, null for a document carrying neither. Pure; never throws. (DEC-101 (1)(2); Publication §5A; K1019)
- **R9** The case document's lens blocks, one spelling. `lens_statements:` has one row per statement in force, `{bundle, id, kind, subject, text, justification, withheld}`, `withheld` the count of that statement's citations not printed; `lens_citations:` one row per printed citation, `{statement, citation}` (flat rows, as R1's blocks). The body prints them under `## The Lens This Case Was Produced Under`: the bias acknowledgement first; then each statement, its kind in plain words, its subject and its text, with its justification, its printed citations and its withheld count (never which) beneath; then these two sentences, verbatim: "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the most dangerous kind." and "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it looked at the material." (DEC-103; DEC-117; K1019). With no manifest in force the section states that none was. `lensOf(fm)` reads the blocks back, in the document's order; a document without them answers null. Pure; never throws. (DEC-103; DEC-117, N524; K1019)

#### The project reference a case carries (DEC-111; K1019, K1031)

- **R10** (DEC-111; `network-notices` R19) A case document may carry `working_on`, a notice id, and nothing else about the notice; a notice id is record-core R6's opaque-id shape, its counter read from `record-grammar`'s one id table (`idPattern`, S0-1), so a counter of four or more digits is accepted, `^[A-Z]+-\d{4}-\d{4,}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$` (as `signatures` R38, K1115; S0-12), and `isNoticeReference(value)` answers whether a value is one (K1119); a signed case document carrying a four-digit id still passes. When it is present, the published case shows it as the project reference. A malformed value is refused by `case-catalogue` R3 (was `ratification` R38, K1824). It is an optional field of `bio-case-document/5`, with no new format version: a `/5` document without it names no notice (K1114).

#### The case's method, its materials and the case file (DEC-112; DEC-119)

- **R11** The case document's `method:` block, `{grading, checks}`. `grading` is the grading method's version (`strength` R31). `checks` is the catalogue version the document was checked under (`promotion`'s `CATALOG_VERSION`). `methodOf(fm)` reads it back. A document without it answers null. Pure; never throws. (DEC-112 (3): "the version of the method and checks inside the signed case")
- **R12** The case document's `materials:` block has one row per document or observation that any member's chain reaches: `{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under}`.
  - `kind` is `document` or `observation`.
  - `included` is true when the material travels whole, and false when only its fingerprint, origin and archived copy travel.
  - `rests_under` is `load_bearing` when any load-bearing member's chain reaches it, else `supporting`.

  `material_attestations:` holds one row per attestation, `{ref, by_kind, by, level, at, signature, recorded_in}`. `by_kind` is one of:
  - `member`: a capturing member's signed account, or an observation's author, each stated as their attribution level allows. `level` is the level in force (`group`, `project`, `cover` or `name`), or null where no level applies. At `group` or `project` the row carries no handle, key or signature;
  - `co_attestation`: a trusted timestamp or a co-archive;
  - `project`: the project's record holds the material. `by` is the project the case states, `at` is when the record registered it, and `recorded_in` is the bundle that holds it. `signature` is null;
  - `group`: the group vouches for the material by signing the case. `by` is the group's slug, and `signature` is the literal `case`: the case document's own signature covers the row.

  The rows are flat, as R1's blocks are (K549). `materialsLines(rows)` and `materialAttestationLines(rows)` write them, the one spelling (K1317); `materialsOf(fm)` reads both blocks back. A document without them answers null. Pure; never throws. Material whose source's identity is withheld is listed like any other material. (DEC-112 (3)(4)(5); DEC-119 (1); K1134 Q6, BOB's decision 15; K1275, K1277)

  (T37; N757; DEC-180 (4), K2108, K2206; T38: N779, K2248) A `document` row may state `obscured`: the material is carried as its copy, never whole. That is either a photo (`case-carriage` R11), carrying nothing of the original but its pixels, with its marked areas, if any, covered, or (T39; N806, K2333) a member document's cleaned copy (`case-carriage` R15), every picture in it and the document itself carrying none of their details. A published case states it for every photo it carries, and for every member document it carries as its copy. The row then states `included: false`, and its `sha`, `text_sha`, `origin` and `archived_copy` stay the original's, which the group keeps with its metadata. `obscured` is written flat on the row as `obscured_copy` and `obscured_label`, as R1's acknowledgement fields are, and `materialsOf` reads it back as `obscured: {copy, label}`: `copy` the SHA-256 of the copy (`case-carriage` R11), `label` the sentence the published case shows beside the material: for a photo, `case-carriage`'s `OBSCURED_LABEL` when it is marked, else (T40; DEC-185 (1)) its `PUBLISHED_LABEL` (a copy with nothing covered; null in an edition signed before T40); for a member document, `case-carriage`'s `COPY_CLEANED_LABEL`. A row without it answers `obscured: null`. It is an optional field of the current case document format, with no new format version, as R10's `working_on` and R22's `subject_entity` are: a document without it reads as before. Pure; never throws.

  (T40; N798; DEC-185 (1); K2394) The row also states `obscured_marked`, optional and flat, as `obscured_label` is, and `materialsOf` reads it back as `obscured: {copy, label, marked}`. A row without it reads `marked` by its label: non-null marked, null unmarked, so every earlier edition reads and renders byte for byte.
- **R13** `CASE_FILE_FORMAT` is `bio-case-file/3` (T37; N757, K2206). `bio-case-file/2` (T36; N717, K2004) and `bio-case-file/1` case files are read as written: a `/2` manifest names no `obscured` file and a `/1` manifest none of the kinds `/2` adds, and a manifest naming a kind its format lacks is a departure.
  - **The manifest** names: the format; the source group's slug; the case, edition and case document's SHA-256; the signing keys with their fingerprints; each part (one file of a case file that is split), with its index, SHA-256 and bytes, where a part's SHA-256 is over the lines `<path> <sha256> <bytes>\n` of its files in path order and its bytes are the sum of its files' bytes (a part holding the manifest cannot list its own digest; `casePartDigest(files, index)` is the one spelling, K1315, K1318); the manifest is `manifest.json` (`CASE_FILE_MANIFEST_PATH`) at each part's root, and each file sits at its `caseFilePath` path directly under the root, files listed in path order (K1318); and every file, with its path, SHA-256, bytes, part and kind.
  - **The kinds** are:
    - `case_document`, `case_signature`, `complete_edition`;
    - `finding` (a finding's published bytes) and `finding_signature`;
    - `grading_facts` (one finding's facts that `strength` R32 reads, as recorded at the act);
    - `passages` (one finding's relied-on passages, each `{content_id, capture_sha, extent, chain, quoted}`, `chain` the passage's chain as `content` R3 hashes it, null when none (K1317), the extent in `content`'s canonical form);
    - `document` (captured bytes, whole), `extracted_text` and `observation` (its text, whole);
    - `attestation` (a signed account, a timestamp token, a co-archive record);
    - `calculation` (one calculation a member's chain reaches, as R18's row, with each input it names travelling as the file its input hash names).
        - `archive` (the captured bytes, whole, of the archive a carried member document was unpacked from, `case-carriage` R8) and `container` (that member's `container` record as `case-carriage` R8 holds it, `record-grammar`'s canonical JSON naming the member and its archive by SHA-256); each under the ref of the material whose chain it belongs to, the same pair again for that archive's own archive, outward to the outermost; an `archive` or `container` file under a ref that carries no `document` is a departure. The archive's timestamp tokens stay `attestation`. (CASE-CARRIAGE #3; K2004)
        - `criteria` (the edition's criteria rows, as `publication` R72 froze them and its R53 answers them, in canonical JSON), at most once in a case file; absent for an edition whose criteria were not recorded (committed before T35). It lets the rows a case measures against be read offline. (N717; K1941)
        - `obscured` (T37; N757; DEC-180 (4)): the copy of a material carried in place of its original (a photo's, R12; or a member document's cleaned copy, T39), its bytes whole at the SHA-256 the photo's `materials:` row names as `obscured.copy` (R12), under that row's ref. An `obscured` file no row names, a row naming a copy no file carries at that SHA-256, and, for a row stating `obscured`, a `document`, `extracted_text`, `archive` or `container` file under its ref at the original's digests (the original never travels) are each a departure.
  - **The check.** `caseFileManifestCheck(manifest)` answers every way a manifest departs from this rule, each named, or none. Pure; never throws.

  This is the one spelling of the format for `public-read` R23, `case-checker` and `case-import`. Its readable specification is `case-checker` R14 (K1134 (1)). (DEC-112 (3); Publication §5C)

  (T41; N820; D56–D61; K2418) The case file carries R23–R26's blocks inside the case document (no new file kind).
- **R14** `completeEditionOf(caseFile)` renders the complete edition from a case file's other files: `caseFile` is `{format, group, case, edition, case_document_sha, keys, files: [{path, kind, sha256, bytes, content}]}`, every file but the complete edition, with no part (K1315). The result is one HTML file with every style inline, no script and no external reference, so it opens with nothing installed and no network. There is no length limit and nothing is left out for length. (K2538; DEC-185 (1): every photo a published case carries is labelled) A material carried as its copy (R12's `obscured`) is printed with its copy's label and as travelling with the case, never as "NOT INCLUDED". Its order is:
  1. the claims;
  2. each finding, opening with its standing line (R15), then its two grades with their plain meanings (DEC-82), then its chain down to the exact passages relied on, each quoted with its location. A chain reaching an imported finding reference (`inquiry-grammar` R11) prints, at that leg: the acceptance (who accepted which edition, when and why); the recreation result and gaps; each disclosed flag; and the source case file named by group, case, edition and manifest SHA-256, as the place to check that finding. The chain stops there. The words are the UX stream's; until it gives them, one plain sentence for each (DEC-96 item 4; N522);
  3. every document and observation in `materials:`, with its fingerprint, origin and archived copy (one not included says so), and its attestations (R12). For material from a source whose identity is withheld, the source is shown as "Withheld" with its reason (`case-disclosures` R4) (DEC-119 (1), K1275). (T37; N757) A material carried as its copy (R12's `obscured`: a photo, or a member document's cleaned copy) is listed with the original's fingerprint, the copy's fingerprint and its label, word for word, when it has one (an unmarked photo's copy signed before T40 has none); (T40; N798; DEC-185 (1); K2394) whether it is listed by the copy line or the unmarked line is picked by R12's `marked`, then its label is printed word for word when there is one; an edition whose document states no `obscured` renders exactly the bytes it rendered before T37;
  4. what was searched;
  5. the declared bias (the lens section, R9);
  6. disclosed contradictions;
  7. the strength section, opening "a case has two strengths, never one";
  8. the grading method in plain words (`strength.gradingMethodText` at the document's `grading` version, with the product name below);
  9. "How to check this case yourself", in plain language, naming the checker's public read (`case-checker` R15).

  Every page carries the identifying notice: the case, edition, group, declared bias, both floors, and the case document's hash with where to verify it (DEC-34). The same case file always gives the same bytes. The words of the sentences and headings are the UX stream's: the text above is used until the stream gives its words. Pure; never throws. (DEC-112 (2); Publication §5C; DEC-96 item 4) The complete edition is always light: it sets its own colours and declares only the light colour scheme, so a reader's dark setting does not restyle it. (DEC-122 (2)) The declaration is rendered for `/7` and later formats; a `/6` or earlier edition renders byte for byte as before T31, light in effect through its own colours and no `prefers-color-scheme` rule, so every published `/6` case file still re-verifies (K1365 (1); K1381).

  The product's name in the rendered words (the credit at the foot, the line saying the case can be checked without the product, and the grading method's text, item 8) is chosen by the case document's format: a `bio-case-document/6` document, or an earlier one, renders "CivicOS", byte for byte as before T31; a `/7` document renders "Civicsmith". A test proves that a complete edition rendered from a `/6` case file before T31 re-renders byte-identical, and that a `/7` case file renders "Civicsmith" in those three places. (DEC-124; K1365 (1))

  (T41; N820; D56, D58, D59, D60, D61; K2418) The complete edition prints the account (R23) after the claims, each bias-framed sentence marked and its statement named, the included review comments (R25), and the approvals (R26).
- **R15** `standingOf({role, bar, pair})` answers `{role, bar, meets, line}`.
  - `bar` gives each declared axis its grade, and null for an undeclared axis.
  - `meets` answers as follows: for a load-bearing member, `true` when the pair reaches the bar on every declared axis, else `false` naming each axis it falls short on; for a supporting member, `not_asked`; with no bar, `no_bar`.
  - `line` is one sentence naming the role and the bar with its per-axis grades. It never says "meets" without the bar it is measured against, and it composes no case-level strength.

  The line's words are the UX stream's: DEC-112's example "Relied on · meets this project's bar (capture B, connection C)" is used until the stream gives them. Pure; never throws. (DEC-112 (4)(1); Publication §5C "The public page")

#### Another group's work a case rests on (DEC-96 item 4; N522)

- **R16** The `/6` document's `accepted_work:` and `accepted_work_flags:` blocks. They are flat rows, as R1's blocks are (K549).
  - `accepted_work:` has one row per (member, leg) whose chain reaches an imported finding reference: `{member, leg_of, ref, group, case, edition, finding, manifest_sha, pair, result, gaps, accepted_by, accepted_at, reason}`.
  - `accepted_work_flags:` has one row per open flag disclosed: `{ref, edition, flag, issue, flagged_at, words, acknowledged_by, acknowledged_at}`.
  - `acceptedWorkOf(fm)` reads both back. A document without them answers empty lists.
- **R17** The `/6` document's `grading_facts:` and `passages:` blocks, flat rows as R1's blocks are (K549), the one record of what `public-read` R23 carries per finding (K1315):
  - `grading_facts:` one row per leg of each finding a member's chain reaches: `{finding, ord}` and the fields `strength.gradingFacts` (its R35) answers for that leg, as recorded at the act, each list or map field as its canonical JSON (`record-grammar`'s) in one quoted value;
  - `passages:` one row per relied-on passage: `{finding, ord, content_id, capture_sha, extent, chain, quoted}` (`chain` null when none, so `content_id` recomputes, K1317), the extent in `content`'s canonical form;
  - `gradingFactsLines(rows)` and `passagesLines(rows)` write them; `gradingFactsOf(fm)` and `passagesOf(fm)` read them back, each finding's rows in `ord` order (null when the block is absent).
  - `extractedTextOf(units)` is the one spelling of a document's extracted text: the canonical JSON of `extraction`'s units in `seq` order, each `{extent, ref, text}`; `text_sha` (R12) is its SHA-256. `publication` R57 holds it, `case-disclosures` R6 and R7 read whether it is whole, and `case-checker` R4 finds a passage at its extent in it.

  Pure; never throw. (DEC-112 (3); K1305, K1315)

  Neither block is required when no chain reaches a ref. Pure; never throws. (DEC-96 item 4; K1273)

#### Calculations in the case file (C:A-12; K1448)

- **R18** The case document's `calculations:` block has one row per calculation any member's chain reaches: `{calc, recipe, inputs, method_version, results, result_key, recompute, disclosed}`. `recipe` is the recipe's canonical JSON (`calc-grammar`'s `bio-calc/1`) in one quoted value; `inputs` each input's name and SHA-256 (the canonical bytes `calc-grammar` evaluates); `method_version` the engine's version; `results` the stored results by key; `result_key` `calc-grammar.resultKey(recipe, inputs)`; `recompute` the status recorded at the act (`agrees`, `differs`, `unbound`); `disclosed` the disclosure the publisher made of a differing or unbound load-bearing calculation (`case-authoring`'s pre-flight), null when none was needed. The rows are flat, as R1's blocks are (K549). `calculationsLines(rows)` writes them, the one spelling, and `calculationsOf(fm)` reads them back; a document without the block answers an empty list. Pure; never throws. (K1639, from CASE-AUTHORING #17 J3 (3)) A workbook row (`calc` its capture's SHA-256, `result_key` null, `inputs` empty, `method_version` its engine and version) may also state `recompute: not_recomputed` (workbooks R7, never a gate, K1506); `calculationsLines` and `calculationsOf` carry it.
- **R19** (scope §1 ANALYSIS: PROV-O for inputs and outputs) `provOf(rows)` answers, for R18's rows, a W3C PROV-O rendering as JSON-LD: each calculation an `Activity` that `used` each input (an `Entity` named by its SHA-256) and `generated` each result (an `Entity` named by the calculation and result key), with the recipe and method version as the activity's plan. It is a rendering of carried data and adds no fact. The same rows always give the same bytes. Pure; never throws.

#### The published timeline (C11; K1494)

- **R20** The case document's `timeline:` block has one row per timeline item: `{lane, ord, when, label, ref, source}`. `lane` is `they_did` (the world's events concerning the case's findings) or `we_did` (the group's own acts), and the two lanes are written apart, each in its own order, never interleaved into one list. `when` is the item's `when` as held (with its precision, or `undetermined` with its bounds, or `nowhere` for an item placed nowhere); `source` the capture, extent or record entry it rests on, and an item without one is not written. `timelineLines(rows)` writes the block, the one spelling, and `timelineOf(fm)` reads it back, the lanes apart; a document without it answers both lanes empty. People in an item are written only as `case-disclosures` passes them (DR6, K1483). Pure; never throws.

#### The people and member-ties blocks (K1816; was `case-disclosures` R28's spelling)

- **R21** `peopleLines(rows)` and `memberTieLines(rows)` spell the case document's `people:` block (one row per person: `{person, places, basis, citation, words}`) and `member_ties:` block (one row per tie a signer attests: `{row, signer, at, entity, kind, level, shown}`), flat as R1's blocks; `peopleOf(fm)` and `memberTiesOf(fm)` read them back from parsed front matter, each field a string or null, answering empty lists for a document without them. Pure; never throws.

*A member's subject* (T36; N717; K2002, K2004)
- **R22** Each `case_roles:` row (one per member finding, `case-authoring` R14) may state `subject_entity`: the entity id the member's pinned bytes state as their own `subject_entity`, or null when they state none. `memberSubjectOf(fm, finding)` answers it from that member's `case_roles:` row, else from its `case_conclusions:` row, else null. It is an optional field of the current case document format, with no new format version, as R10's `working_on` is: a document that states no member's subject answers null for each, and `case-checker` R21 then reads every body's rows of that member's standards (K2002). Pure; never throws. (N717; K2002, K2004)

#### The account, bias applications, review comments and approvals (T41; N820; `draft-T41-investigation.md` §3.6; K2405, K2417, K2418; D56–D63)

- **R23** (D56, D58) The case document's `account:` block: one row per sentence `{ord, text, cites, kind, bias_statement?, began_as}`, `cites` the findings, legs, passages or materials it rests on, `kind` `account` or one of the four statements (D63), `bias_statement` set only for framing marked as following a printed bias statement, `began_as` `member` or `machine_draft` with the draft named; `accountLines`, `accountOf`. The body prints the account with each bias-framed sentence marked in the text.
- **R24** (D59) The `bias_applications:` block: one row per application recorded at a leg or conclusion of a finding a member's chain reaches (`inquiry-grammar` R18, `basis-versions` R48), `{finding, ord?, target, statement, effect, from, to}`; `biasApplicationsOf`.
- **R25** (D61) The `review_comments:` block: the reviewers' comments the publisher chose to include, each `{reviewer, text, at}` as `review` holds it; and `review_comments_left_out`, the count left out, stated, or null when it could not be determined (K2533). `reviewCommentsOf`.
- **R26** (D60) The `approvals:` block: the group's approval rule in force at signing and each approval `{by, at}`; `approvalsOf`. (K2528) `approvalSubjectSha(text)` answers the sha-256 of a case document with its R26 block (`approval_rule`, `approvals:`) removed, so an approval names the document as the approver saw it, and the same digest is computed before and after the block is written.

## Private

### Uses

- `record-grammar`: `parseFrontmatter` (R1's blocks and tension section, R4).
- `strength`: `gradingMethodText` (its R31, with the product name; R14). Index 47 is before 57 (DEC-112; K1268).
- `calc-grammar` (T33-60): `resultKey` and the recipe's canonical form (R18).
- `record-grammar`: `idPattern` (R10; S0-12).

### Invariants

- **R6** (copied from `publication` R28) Undetermined is stated and never filled: a citation's version in a document older than `/4` (R4), an acknowledgement a block is silent about.
- **R7** (copied from `publication` R34) No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §3 rule 2 (the second note: what "rests on" means, R5), rule 12 (what a case document states about each member, R1), rule 16 (what the case states about itself, R1's `/5`), §3 rule 7 and §7 (the attribution section's spelling, R2, R3).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (MK-7 attribution levels, R2).
- N345 and N364 (R1's `/5`, its tension section and its `captures:`, `capture_accounts:` and `sources:` blocks): DEC-76 item 4, DEC-78 item 5, DEC-81 items 1 and 3; `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10.
- D-431, D-442.
- DEC-112 response 4 (1)–(5) and `BIO_Publication_v0_1.md` §5C (R11–R15), with K1134 (1) and Q6, and DEC-119 (R12, R14; K1275); DEC-117 (R9, N524).
- DEC-96 item 4 (R14's leg on another group's work, R16; N522, K1273).
- DEC-122 (2) (R14: print and the complete edition are always light; N528).
- DEC-180 (4) (Bob, K2108): the copy a published case carries, labelled, the original kept inside the group (R12–R14; N757, K2206).
- K2315, K2333 (N806): R12–R14's wording.
- DEC-185 (1) (N798; K2394): R12, R14 (every published photo's copy labelled; `obscured_marked`).
- DEC-101 (1)(2) and `BIO_Publication_v0_1.md` §5A (R8); DEC-103 and `BIO_Declared_Bias_v0_1.md`, "RULED 2026-10-01 by Bob (DEC-103)" (R9; its two closing sentences drafted by BOB from that document's "Why this exists" and "The two-audience choice, made knowingly"); K1019.

### Suggestions

- **The seam (K651).** Every name here is re-exported unchanged by `publication` (`index.mjs` and `checks.mjs`), so no importer changes in T18; a later job of an importer may import this module directly (`case-grammar` is earlier than each).
- **`/5` or `/6` (K1019).** R8's and R9's blocks join `/5` because no `/5` document is stored yet; the job checks that at its start and reports one found to BOB before adding a block.
- **R9's plain words for the three kinds** (BOB's, from Declared Bias's own definitions): `scrutiny` "a source this group checks more closely before relying on it"; `inference` "an inference this group allows or refuses to draw"; `pattern` "a pattern this group has evidence an institution or source follows". The withheld count is per statement.
- **Tests:** R8 and R9 round-trip, each with a negative control (a document without the blocks answers null; a withheld citation is counted and never named). R1's arms from `test/m/publication/`' `casedoc`, `sources` and `tensions` suites (a `/5` document's blocks and tension section round-trip; a `/4` and older answer as R1 states); R2 and R3 by the attribution renderer and `REAUTHORABLE_SECTIONS` arms, with a document carrying no run answering null; R4 a `/4` and a `/3` document; R5 the D-431 arms `ratify-authority.test.mjs` §8 pins (a `relates_to` reference counts; a division disclosure is never a `serve` edge).
- **R14's light-only edition (DEC-122 (2)).** `<meta name="color-scheme" content="light">` in the head, beside the inline light colours; a test that the declaration is present and that no `prefers-color-scheme` rule is.
- **R14 and R15 are here (DEC-112; K1268, BOB's decision 4),** not in `public-read`, so that the plane, the checker and import render one way, and `public-read` stays well under the mark. Tests: R11–R13 round-trip, each with a negative control. R14 gives byte-identical output twice, and a reordered input gives the same bytes. R15 covers the four `meets` arms. R16 round-trips, and a document without the blocks answers empty lists.
- **T33-60 (open technical details, BOB's).** Whether R18 and R20 raise the case document format (a `/8`) or join the current one is the job's START question, on R1's precedent (a block joins a format only while no document of it is stored). Whether the complete edition (R14) prints the timeline and the calculations, and where in its order, is open: C11 says a published case carries the timeline, so the job proposes a place to BOB. R19's JSON-LD context is the W3C PROV-O namespace; its file name in the case file is the job's.

## Open for Bob

None: the split is BOB's (K617, K651).
