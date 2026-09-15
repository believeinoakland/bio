# Extraction breadth — Part II §18 piece 4

**Status** · v0.1 DRAFT design, written 2026-09-14 by session BOB #11 under Bob's standing delegation (mechanism is the architect's). Not yet reviewed by Bob. Complete as a design of five of piece 4's six parts — readers beyond three, tables and images as content, the extraction half of the AI EXTRACT role, read-time re-extraction to tier 3 (D-319), the per-page tier-2 rule (D-283); the sixth, the external OCR tier, is DEC-74, answered 2026-09-14 at Bob's delegation (not funded); §6 records the decision and the trigger that reopens it. Every "as built" statement below is Part II §15–§16's, measured 2026-09-14 at the shas those sections name; nothing here re-measures the plane. as of 2026-09-14

**Place in the system** · Level 2. Serves construct 5 (the document profile and the extraction substrate — `BIO_Content_Framework_v0_10.md` Part I, approved 2026-07-30) and construct 4 (content, Part II). Depends on `OFFICE-FORMATS.md` (what the office axis extracts and does not), `DOCUMENT-PROFILES.md` (the recogniser engine and the content-type axis), `CONTENT-EXTENT-DESIGN-SPACE.md` §6 (the content row and IC-1's extent grammar this widens) and `OBSERVATION-LOG-DESIGN.md` §4.2 (the content-axis frontier that lists what is worth re-extracting). The AI EXTRACT role's whole design belongs to construct 11's level-1 document, `BIO_Assistant_and_AI_Roles_v0_1.md`; §4 here names only its extraction half. Supersedes nothing; it gives D-319 and D-283 their design and the two GESTURED rows of Part II §15 (tables, images) their extent.

**Incomplete sections** ·
- §2 — the order in which content types are written is set by a census count of document classes not yet taken; the argument for minutes first is stated and the count decides.
- §3.3 — table recognition on a PDF page waits on an engine measurement (GO / NO-GO); no table reader on PDF is designed past the measurement.
- §6 — the external OCR tier is not designed; DEC-74 is answered (not funded) and the section states only the trigger that would reopen it.

**Contents**
- [1. The frontier, as Part II measures it](#1-the-frontier-as-part-ii-measures-it)
- [2. Readers beyond three — the rule, and the order](#2-readers-beyond-three-the-rule-and-the-order)
- [3. Tables and images as content](#3-tables-and-images-as-content)
  - [3.1 What "as content" means, and what differs between the two](#31-what-as-content-means-and-what-differs-between-the-two)
  - [3.2 The extent grammar grows two arms and one reference](#32-the-extent-grammar-grows-two-arms-and-one-reference)
  - [3.3 Producers, in order](#33-producers-in-order)
  - [3.4 What a cited image resolves to](#34-what-a-cited-image-resolves-to)
- [4. The AI EXTRACT role — its extraction half](#4-the-ai-extract-role-its-extraction-half)
- [5. Read-time re-extraction, and the per-page rule](#5-read-time-re-extraction-and-the-per-page-rule)
  - [5.1 D-319: the tier-3 seam on the read path — opt-in, recorded, and listed](#51-d-319-the-tier-3-seam-on-the-read-path-opt-in-recorded-and-listed)
  - [5.2 D-283: the per-page rule for two decodes of one layer](#52-d-283-the-per-page-rule-for-two-decodes-of-one-layer)
- [6. The external OCR tier — DEC-74, decided on its narrowed premise](#6-the-external-ocr-tier-dec-74-decided-on-its-narrowed-premise)
- [7. The decomposition](#7-the-decomposition)
- [8. Negative controls the discipline demands](#8-negative-controls-the-discipline-demands)

---

## 1. The frontier, as Part II measures it

Part II §16's closing table names the ABSENT row in one cell: *extraction of tables or images; the AI EXTRACT role; read-time re-extraction reaching tier 3; a per-page rule for tier-2 replacement; an enumeration of the content-axis frontier.* And §15 carries two forms as GESTURED — **tables** and **images** — the only two rows in that table with nothing in the grain column. Everything else is built or specified. This document takes those cells one at a time; the frontier enumeration is `OBSERVATION-LOG-DESIGN.md` §4.2's and is consumed here, not redesigned.

## 2. Readers beyond three — the rule, and the order

Three content types are registered (`docprofile/doctypes/registry.mjs`): `meeting_calendar` and `meeting_agenda`, both measured, and `generic`, the honest fallback that reports change without describing it. The rule that governs a fourth is the registry header's own and it is kept: **a type is written from a page that was actually fetched and read**, because a type invented from what a document probably looks like reassures people about things it has not understood.

The candidates the design already names and none has measured: **meeting minutes**, a **regulation** (an ordinance or resolution's text), a **staff report**, a **staff directory**. The argument for minutes first is structural — an agenda names what a body WILL consider and the minutes what it DID, sharing the meeting identifier that earns a B connection (Part I §8.1), so the agenda→minutes pair is the first progression (Part I §8.2) the record could close from its own readings. But a count decides, not an argument: the order is set by the census of document classes over COFF-6's corpus (§7 item 1), and the count is recorded before the second reader is written.

Each new reader emits references as the two existing ones do, and — once FW-17 lands reading position on I2 — with WHERE the reference was read, so that the connections it earns are content-grain from the start rather than document-grain to be narrowed later (Bob's 5.4, second pass: specificity is worked for).

## 3. Tables and images as content

### 3.1 What "as content" means, and what differs between the two

A thing is content when an edge can point at it and it carries an extent and an extraction chain (Part II §14.2). For text that is settled. Tables and images differ from text and from each other in one respect each, and the differences are the design:

- **A table's TEXT keeps its container's chain; a table's STRUCTURE is either the container's own or a derivation.** In an office container the cells ARE the structure — the reader walks them from the XML — so a table there is a range of cells under the `layer` step with the document's cap. On a PDF page a table is pixels arranged as rows and columns, and recovering the structure is a machine step: `table(engine)`, a derivation that weakens like every other and is calibrated like OCR. The cells' text keeps the page's chain; the structure carries its own step.
- **An image cited AS ITSELF is bytes, not text.** A map, a signature, a photograph, a chart cited for what it shows rather than for words read off it has NO extraction chain: its fidelity is the capture's (the bytes are the record's own, grade A-able on the provenance chain), and any TEXT read off it is a separate content — OCR, tier 3, cap C — with its own extent over the same rectangle. So an image row carries no chain, and that null must not be read as *undetermined*: IC-83's rule that an extent with no chain is refused gains a stated exception, expressed as a column rather than an overloaded NULL (D-129's rule that an absence is never read as a value) — `cited_as: text | bytes`. A `bytes` row has no chain and no derivation cap; a `text` row has both or states them undetermined.

### 3.2 The extent grammar grows two arms and one reference

IC-1's union (`pdf-page` · `sheet-cell` · `slide-shape` · `doc-para` · `dom`) is I2's, FRAMEWORK's; the content table's `extent_kind` admits the same set (I5, RECORD's). Both grow together, in one IC per interface:

| arm | fields | what it addresses | producer |
| --- | --- | --- | --- |
| `sheet-range` | `{sheet, range}` — A1-style, a whole sheet when the range is the sheet's dimension | a table in a workbook, or a sheet as a unit (`CONTENT-SEARCH-DESIGN.md` §4.1's workbook unit) | the XLSX/ODS entries already know the sheet dimensions (the out-of-range refusal REC-85 builds uses them) |
| `doc-table` | `{table, cell?}` — the table's ordinal in the document, optionally one cell | a table in a word-processing document | the DOCX/ODT entries walk tables already; today they flatten them into paragraphs |
| `image` (a reference, not an arm of the union) | `{part}` (the content hash of the embedded media part, for a container) or `{page, rect}` (for a PDF page, the same fields as `pdf-page`) plus `mime` | a figure, map, signature or photograph as itself | office entries enumerate media parts; the PDF structure op reports image objects with their rectangles |

`covers` per new arm follows REC-85's shape: a `sheet-range` outside the sheet's dimensions, a `doc-table` ordinal past the table count, an `image` part not in the container, each refused from the container's own extent, by name.

### 3.3 Producers, in order

1. **Office (COFF):** `doc-table` from the DOCX/ODT table walk; `sheet-range` from the sheet dimensions and, where a defined table or a named range exists in the workbook, from it; `image` from the media parts, each hashed. No engine, no measurement owed; the evidence is in the container.
2. **PDF images (CONTENT-PDF):** `image` as `{page, rect}` from the structure op's image objects; the citation resolves to the capture's bytes plus the rectangle, and a crop for display is a derived rendition that says it is derived (the render companion's rule).
3. **PDF tables — measure first.** No table-recognition engine has been measured on the runtime. The measurement (§7 item 4) is GO/NO-GO on the same discipline CPDF-14 used for vision OCR: does the STRUCTURE reproduce across runs on identical bytes (the anchor rule), and what does the step cost. NO-GO until measured; a `table(engine)` step is minted by the measurement, not by this document. Until then a table on a PDF page is a `pdf-page` rectangle whose text is the page's — content, honestly, without the structure claim.

### 3.4 What a cited image resolves to

The capture's bytes and the extent, verified as the capture is. The viewer shows the crop; the crop is not the evidence. Nothing here touches the provenance chain, which is why an image row can reach A: it claims exactly what the capture claims and no more.

## 4. The AI EXTRACT role — its extraction half

DEC-24 names EXTRACT as the role that makes everything else addressable; Part II §14.5 records it DESIGNED, excluded from the pilot by name, with no item; Bob's 5.7 rules that the assistant may mark passages as citable on its own. The role's whole design — which credential, which surface, which loop, how its work is shown — is construct 11's and lives in `BIO_Assistant_and_AI_Roles_v0_1.md`. What belongs here is what the role may PRODUCE on the content axis and under which chain:

| production | what it is | its chain and label |
| --- | --- | --- |
| a proposed citable passage (SK-7, rowed) | a content row over an existing extent and the CURRENT chain — no new text | `minted_by` a machine credential; the row's chain is the capture's; labelled everywhere it is shown; never attested by it |
| an on-point candidate for a document-grain edge (Bob's 5.4 second pass; REC-86's candidate list) | the same row shape, proposed against a specific edge | as above; the member's choice is the authored act (NARROW) |
| a proposed reading — entities and facts the registered readers did not find | a reading with an `ai(function)` step in its chain, the DESIGNED step nothing emits today | a derivation that weakens: the reading's basis is `ai(function, version)`, its grade earned by what it names (an identifier in the text earns B as today; a name C); never A; labelled |
| a proposed table structure on a PDF page (§3.3 once GO) | a `table(engine)` step | a derivation; calibrated like OCR |
| cleaned or normalised text | a derivation step over the machine's output | weakens; never raises a cap (Part II §14.2); NOT a transcription — a person supplies text, a machine only transforms it |

What the role may never do is unchanged and enforced where it always was: it never attests (C-35.10), never touches the provenance chain, never chooses the question, and its rows are part of a finding only when a member cites them.

## 5. Read-time re-extraction, and the per-page rule

### 5.1 D-319: the tier-3 seam on the read path — opt-in, recorded, and listed

The gap, as CPDF-10 measured and asserted it: `op=acquire` reaches tier 3; the read-time structure op stops at tier 2, so an instance that installs the OCR member later has no route to the text of what it captured before, short of re-acquiring. The consumer code all exists and is driven; what is missing is the call site — and one decision, which D-319 correctly refused to make as a patch: a read that grows a ~10 s engine call must not do so unasked.

**Decided:** the seam is lifted into the read op behind the same `needsTier3`/`tier3Pages` predicates and the same page-wise merge, **opt-in by an explicit flag on the request**, never automatic, and:

- it produces a NEW chain for the capture, so the capture's text units are replaced (`CONTENT-SEARCH-DESIGN.md` §4.1) and its content rows go `stale` by REC-82's mechanism — a member who cited page 14 under `layer` sees the flag, and nothing moves under them (Bob's 5.8);
- it writes a content-level observation with `authority_kind = extract` and the member as `actor` (`OBSERVATION-LOG-DESIGN.md` §4.2), so *this document was re-read on this date at this member's request under this engine* is a fact the record holds;
- the LIST of what is worth re-reading — every capture whose latest content-level state is below what the fleet can now do (`tier3_candidate`; a chain older than its engine's calibration) — is the content-axis frontier read, so re-extraction is a choice made from a list, informed once at the act (DEC-69), and never a silent sweep. A bulk re-read is that list worked one document at a time by a member's act, each row-recorded.

The cost is stated at the affordance (≈10 s per image-only page on the deployed member, CPDF-10's measurement) and the honest branch stays: an instance with no OCR member bound refuses the flag by name rather than pretending.

### 5.2 D-283: the per-page rule for two decodes of one layer

Tier 1 and tier 2 are both `layer` derivations of the same source under the same null cap, so no cap is overclaimed when one replaces the other; what is unbounded is TEXT LOSS, because the escalation predicate is document-level and the replacement is wholesale — a document where tier 1 read page 0 well and failed page 1 escalates whole, and if tier 2 recovers page 1 and does worse on page 0 the plane keeps the worse page silently.

**Decided:** the winner is chosen PER PAGE — the decode with fewer undetermined characters on that page wins; a tie keeps tier 1 (fewer steps, the same cap, the same producer marker carried forward); the mixed-document chain the plane already composes (Part II §16, "The chain, composed as the path walks") records which tier produced each page, so the document's chain is honest about being a merge. **Measured first, not shipped first:** D-283 is stated as unmeasured because no fixture of partially-decodable PDFs exists; the item builds that fixture from the census sample (documents whose tier-1 reading carried undetermined pages), measures both decodes page-wise, and lands the rule behind the measurement with its negative control (a page tier 1 read well and tier 2 read worse is kept from tier 1).

## 6. The external OCR tier — DEC-74, decided on its narrowed premise

DEC-74 (open, for Bob, raised 2026-09-10) asked whether to fund an external OCR tier, direct the tesseract runtime probe first, or accept that image-only pages have no tier-3 path. Since it was raised, CPDF-10 delivered tesseract-wasm as the `ocr-worker` fleet member, GO on the deployed runtime, connected and taken on the project's own instance at 0.58.0 with a chain of `pixels → ocr(tesseract-wasm 0.11.0)` capped at C (Part II §16). So the recommendation the item carried — run the probe before funding anything — has been taken, and its second and third options are closed by measurement. What remained was narrower than the entry said: whether to fund a tier ABOVE C for the image-only class (13 of 1,458 censused pages, in two documents). **DECIDED 2026-09-14 by BOB #11 at Bob's delegation: not funded.** The tesseract member at cap C is the tier-3 path; the external tier is reconsidered only when an image-only document is LOAD-BEARING in a real case and C is below that project's bar — a funding request with the document and the bar attached, brought to Bob then, since DEC-35's word still governs spending. Nothing is designed or rowed.

## 7. The decomposition

Seven items, in dependency order, handed through the BOB INBOX (CONDUCT mints the ids). Milestones: M2 for readers and the tier rules, M4 for the extent arms, M5 for the frontier's consumers.

| # | owner | item | depends on | interface | design |
| --- | --- | --- | --- | --- | --- |
| 1 | M0 / FRAMEWORK | **the census of document classes** over COFF-6's corpus — agendas, minutes, staff reports, ordinances and resolutions, directories, other — by count, recorded in `MEASUREMENTS.md`; sets item 2's order | — | — | §2 |
| 2 | FRAMEWORK | **one content type per measured class**, in the census order (minutes first unless the count says otherwise), each written from a fetched and read page, each emitting references with position once FW-17 lands | item 1; FW-17 for position | none unless a reader changes the I2 shape | §2 |
| 3 | FRAMEWORK + COFF + RECORD | **the two arms and the image reference** — IC-1 gains `sheet-range` and `doc-table` and the `image` reference (I2, additive); the office entries emit them; the content table admits them with `covers` per arm and the `cited_as` column (I5, additive) | REC-85 (the three-arm `covers` this extends) | I2 (an IC; FRAMEWORK dormant — CONDUCT answers-for in writing or activates), I5 (an IC) | §3.1–3.3 |
| 4 | CONTENT-PDF | **PDF images as content, and the table measurement** — `image` as `{page, rect}` from the structure op; the crop as a derived rendition; and the GO/NO-GO measurement of a table-recognition step on the runtime (reproducibility of the structure across runs, cost) recorded before any table reader is rowed | item 3 | — | §3.3, §3.4 |
| 5 | CONTENT-PDF + RECORD | **D-319: read-time re-extraction to tier 3, opt-in** — the seam on the read op behind the flag and the existing predicates; the new chain replacing the text units and staling the content rows; the content-level observation; the frontier read as the candidate list; refused by name with no member bound; the negative control | `OBSERVATION-LOG-DESIGN.md` item 2 (the writer and the read); `CONTENT-SEARCH-DESIGN.md` item 4 (the units it replaces — ships without them if not yet landed, replacing nothing and saying so) | I3 (the flag, additive, an IC) | §5.1 |
| 6 | CONTENT-PDF | **D-283: the fixture, the measurement and the per-page rule** — a fixture of partially-decodable PDFs from the census sample; both decodes measured page-wise; the rule landed behind the measurement with the chain recording the winner per page | — | — | §5.2 |
| 7 | SKILL + RECORD | **AI-proposed readings** — the `ai(function)` step emitted for the first time, by the assistant's EXTRACT on a member's objective; graded by what it names; labelled; after the assistant's level-1 document places the role | SK-7; `BIO_Assistant_and_AI_Roles_v0_1.md` landed | I2 (the step is DESIGNED; its first producer confirms at IC-2) | §4 |

## 8. Negative controls the discipline demands

- a `sheet-range` past the sheet's dimensions, a `doc-table` ordinal past the count, an `image` part absent from the container — each refused by name from the container's own extent;
- an `image` row with `cited_as = bytes` carries no chain and no cap and is not refused; the same row with `cited_as = text` and no chain is refused (the two nulls are different facts);
- a table on a PDF page before the engine is measured is a `pdf-page` rectangle and no `table(engine)` step exists in any chain;
- re-extraction without the flag does not run the engine (the read's timing is the control); with the flag and no member bound it is refused by name; with both it writes exactly one observation and stales exactly the capture's content rows;
- the per-page rule keeps a page tier 1 decoded well when tier 2 decoded it worse; invert the comparison and the fixture's control page flips;
- a proposed reading carries an `ai(function, version)` step and never a grade above B; strip the step and the row is refused;
- the census count is recorded before the second reader's row is opened (plancheck's §4.7 arm: the row names §2 and the measurement).
