# case-grammar — requirements

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, on `tranche/T18` before layer 8 starts, for BOB's review; split from `publication` by K617 and K651 (seam read `build/extraction/publication-split.md` §3.1: a module whose code, or whose job, would pass about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1 is `publication` R20, moved whole with its meaning unchanged (`publication` retires it as moved). R2–R5 are new ids for spellings that `publication` holds today without an id of their own: R2 and R3 the grammar behind `publication` R17's `attributionStatements` and R21's `reauthorSection` (R17 and R21 stay `publication`'s, unchanged), R4 the signed citations `publication` R1 answers, R5 `publishedGraphEdges` (D-431; read by `ratification` R4, R5 and `publication` R38). R6 and R7 are copies of `publication` R28 and R34. T22's folds, by a worker for BOB #90 on `tranche/T22`, 2026-10-01 (K1019): R8 (the "What changed" block, DEC-101) and R9 (the lens blocks, DEC-103) added and R1 widened to carry them; not yet met (T22 layer 8). Layer 8, first of `case-grammar`, `publication`, `public-read`, `project-stage`. No `from`. Its code is taken by copy (K624 (1)): the format block (`publication/checks.mjs` 14–48), `fmSafe`, `SECTIONS`, `REAUTHORABLE_SECTIONS`, `signedCitations`, the attribution renderers and `publishedGraphEdges` (`publication/index.mjs` 188–320), and `publication/blocks.mjs` and `publication/tensions.mjs`, copied into `bio-plane/src/case-grammar/` with their one import re-pointed to this module's predicate; `publication`'s job, after this one merges, deletes its copies and re-exports this module, so `ratification`, `case-authoring`, `control-plane` and the tests import what they import today. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R10 (`working_on`, the notice id as the project reference; `build/plan/draft-network-notices.md`, DEC-111) added, not yet met (T23 L8); whether it needs a new document version is BOB's, at the opening (the plan's L8 line).

**Size (P6).** About 425 lines. Pure: it reads no table and holds no store.

## Public

### Purpose

The case document's grammar, one spelling for every module: the formats and their predicates, the `/5` blocks and the tension section, the section locators and the attribution run's text, the signed citations, and the edge set a finding "rests on". Text in, values out.

### Provides

#### The formats and the `/5` blocks

- **R1** (was `publication` R20) `CASE_DOCUMENT_FORMAT` is `bio-case-document/5`; `/4`, `/3`, `/2` and `/1` are accepted as written (`CASE_DOCUMENT_FORMATS_ACCEPTED`). `caseDocumentStatesMemberBlocks(fm)` is true for `/5`, `/4`, `/3`, `/2`; `caseDocumentRequiresDisclosures(fm)` for `/5`, `/4`, `/3`; `caseDocumentRequiresV4Disclosures(fm)` for `/5` and `/4` (the three predicates hold for `/5` as they hold for `/4`); `caseDocumentRequiresTensionSection(fm)` for `/5` only. Pure; never throw. They are the one reading of a document's shape for every module. `/5` also states two blocks (DEC-81 item 1, DEC-78 item 5): `captures:`, one row per capture a member rests on, `{capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only}`, an acknowledged capture adding `acknowledgement_reason, acknowledged_by, acknowledged_at, sentence` (`case-authoring` R36's fixed sentence), read back as `acknowledgement: {reason, acknowledged_by, at, sentence}`; `capture_accounts:`, one row per signed account `{capture, by, at, text_b64, signature_b64}` (the exact bytes, so the signature verifies), read back on each capture as `accounts: [{by, at, text, signature}]`; and `sources:`, `{capture, stated, basis}` (K549, K553: the grammar holds flat rows only). No `/5` document is stored anywhere yet, so the blocks join `/5` and no `/6` is needed. `/5` also states R8's "What changed" block and R9's lens blocks, on the same reading. (DEC-101, DEC-103; K1019)

#### The sections a later act re-authors, and the attribution run

- **R2** (K651: the spelling behind `publication` R17) `ATTRIBUTION_LEVELS` is `group`, `project`, `cover`, `name`, most protective first. `ATTRIBUTION_PROSE_HEAD` is `## Whose Words These Are`. `attributionFrontmatterLines(rows)` answers the run `observation_attributions:` with, per row, its `observation`, its `level` (`null` when none is chosen), `shown` (quoted, or `null`) and `chosen_at_edition`; `attributionBodyLines(rows)` answers the section under the head: the count of firsthand observations the case rests on, the sentence that what it shows of who said each one is that member's own choice for this edition, and one line per observation stating the level and what is shown, or, where no level is chosen, that none is and why, and that the edition cannot be signed until its author chooses one. A value written on one front-matter line has its line breaks folded to a space and its double quotes and backslashes made apostrophes (`fmSafe`). They are the one spelling of the attribution section: `publication` R17's `attributionStatements` answers it, and `case-authoring` R14 writes it. Pure; never throw.
- **R3** (K651: the locators behind `publication` R21) `REAUTHORABLE_SECTIONS` is `attribution`, `acknowledgements`. Each is located in a document's lines as a front-matter run and a prose run: `attribution`, from `observation_attributions:` to the next top-level key, and from R2's head to the next `## ` heading; `acknowledgements`, from the line beginning `  statement_sha: ` to `completeness_excluded:`, and from the line beginning `**Who else read this statement.**` to the blank line before `## What Was Searched`. A document carrying no such run answers null for it, so `publication` R21's `reauthorSection` leaves that document as it is. Pure; never throw.

#### What a signed document cites, and what a finding rests on

- **R4** (K651: the citations `publication` R1 answers) `signedCitations(text)` answers, for a document of a format R1's `caseDocumentRequiresV4Disclosures` holds for and carrying a `case_citations` list, `{state: "signed", rows}` with that list as signed; for every other document, `{state: "undetermined", rows: null, stated}`, the sentence that it was signed before a case's citation edges were pinned to the capture they were made against and carries neither (R6). Pure; never throws.
- **R5** (K651; D-431, `BIO_Publication_v0_1.md` §3 rule 2, the second note) `publishedGraphEdges(fm)` answers the edge set a finding rests on, from its front matter: one edge per `references[]` entry naming a string `target`, `{to: target, kind, disclosure: "serve"}` with `kind` the entry's `rel` (`cites` when it names none); then, name-only, `{to, kind: "division_parent", disclosure: "name"}` for a `division_parent` that is a string other than `"null"`, and `{to, kind: "division_sibling", disclosure: "name"}` for each non-empty string of `division_siblings`. A finding rests on exactly the targets of its `serve` edges. It is the one spelling of that set: `ratification` builds the published graph from it (its R4, R5) and `publication` R38's `ratifiedFindingsRestingOn` asks it of each pinned finding's bytes. Pure; never throws, answering `[]` for no front matter.

#### What changed in this edition, and the lens it was produced under (DEC-101, DEC-103; K1019)

- **R8** The case document's "What changed" block, one spelling for every module. `what_changed:` holds `{statement_sha, began_as, draft, adopted_as_drafted}`: `began_as` is `member` or `machine_draft`; `draft` names the machine draft (`case-authoring` R39; null for `member`); `adopted_as_drafted` is true when the member signed the draft's words unchanged, false when they rewrote them, null for `member`. The statement itself is the body section under `## What Changed in This Edition, and Why`, and `statement_sha` is the SHA-256 of its text. `whatChangedOf(fm, body)` reads both back as `{statement, began_as, draft, adopted_as_drafted}`, null for a document carrying neither. Pure; never throws. (DEC-101 (1)(2); Publication §5A; K1019)
- **R9** The case document's lens blocks, one spelling. `lens_statements:` has one row per statement in force, `{bundle, id, kind, subject, text, justification, withheld}`, `withheld` the count of that statement's citations not printed; `lens_citations:` one row per printed citation, `{statement, citation}` (flat rows, as R1's blocks). The body prints them under `## The Lens This Case Was Produced Under`: the bias acknowledgement first; then each statement, its kind in plain words, its subject and its text, with its justification, its printed citations and its withheld count (never which) beneath; then these two sentences, verbatim: "Every group works under some lens, and an undeclared lens is the most dangerous kind." and "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it looked at the material." (DEC-103; K1019; to be confirmed by the design session). With no manifest in force the section states that none was. `lensOf(fm)` reads the blocks back, in the document's order; a document without them answers null. Pure; never throws. (DEC-103; K1019)

#### The project reference a case carries (DEC-111; K1019, K1031)

- **R10** (DEC-111; `network-notices` R19) A case document may carry `working_on`, a notice id, and nothing else about the notice; a notice id is record-core R6's opaque-id shape, `^[A-Z]+-\d{4}-\d{4}(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$` (as `signatures` R38, K1115), and `isNoticeReference(value)` answers whether a value is one (K1119). When it is present, the published case shows it as the project reference. A malformed value is refused by `ratification` R38. It is an optional field of `bio-case-document/5`, with no new format version: a `/5` document without it names no notice (K1114).

## Private

### Uses

- `record-grammar`: `parseFrontmatter` (R1's blocks and tension section, R4).

### Invariants

- **R6** (copied from `publication` R28) Undetermined is stated and never filled: a citation's version in a document older than `/4` (R4), an acknowledgement a block is silent about.
- **R7** (copied from `publication` R34) No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Publication_v0_1.md` §3 rule 2 (the second note: what "rests on" means, R5), rule 12 (what a case document states about each member, R1), rule 16 (what the case states about itself, R1's `/5`), §3 rule 7 and §7 (the attribution section's spelling, R2, R3).
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (MK-7 attribution levels, R2).
- N345 and N364 (R1's `/5`, its tension section and its `captures:`, `capture_accounts:` and `sources:` blocks): DEC-76 item 4, DEC-78 item 5, DEC-81 items 1 and 3; `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10.
- D-431, D-442.
- DEC-101 (1)(2) and `BIO_Publication_v0_1.md` §5A (R8); DEC-103 and `BIO_Declared_Bias_v0_1.md`, "RULED 2026-10-01 by Bob (DEC-103)" (R9; its two closing sentences drafted by BOB from that document's "Why this exists" and "The two-audience choice, made knowingly"); K1019.

### Suggestions

- **The seam (K651).** Every name here is re-exported unchanged by `publication` (`index.mjs` and `checks.mjs`), so no importer changes in T18; a later job of an importer may import this module directly (`case-grammar` is earlier than each).
- **`/5` or `/6` (K1019).** R8's and R9's blocks join `/5` because no `/5` document is stored yet; the job checks that at its start and reports one found to BOB before adding a block.
- **R9's plain words for the three kinds** (BOB's, from Declared Bias's own definitions): `scrutiny` "a source this group checks more closely before relying on it"; `inference` "an inference this group allows or refuses to draw"; `pattern` "a pattern this group has evidence an institution or source follows". The withheld count is per statement.
- **Tests:** R8 and R9 round-trip, each with a negative control (a document without the blocks answers null; a withheld citation is counted and never named). R1's arms from `test/m/publication/`' `casedoc`, `sources` and `tensions` suites (a `/5` document's blocks and tension section round-trip; a `/4` and older answer as R1 states); R2 and R3 by the attribution renderer and `REAUTHORABLE_SECTIONS` arms, with a document carrying no run answering null; R4 a `/4` and a `/3` document; R5 the D-431 arms `ratify-authority.test.mjs` §8 pins (a `relates_to` reference counts; a division disclosure is never a `serve` edge).

## Open for Bob

None: the split is BOB's (K617, K651).
