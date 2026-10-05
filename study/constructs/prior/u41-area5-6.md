# U41: Areas 5 and 6, checked against requirements and code

Repo `/home/user/bio`, branch `tranche/T32` @ `cd7a0b9c9e`. Read-only.

---

## AREA 5: Calculation

### Built (with requirement ids)
- **consequences R1–R15 are built and wired.** Code is in `bio-plane/src/consequences/` (1,105 lines). Tests are in `bio-plane/test/m/consequences/` (computed, assessed, addressed, reads, record). The requirements file has no unmet marks. Ops are mounted at `bio-plane/src/plane/store.mjs:391`. The module is used by `filings` (`filings/index.mjs:205`) and `escalation` (`escalation/index.mjs:1313`).
  - R2 arithmetic: the five ops are at `consequences/figures.mjs:10` and the module's own arithmetic at `figures.mjs:54-71`. Each operand is graded with `provenance.captureGrade`, and the part takes the weakest grade, named (`index.mjs:488`, `521-533`).
  - Only after a noncompliant determination: `CONSEQUENCE_NOT_NONCOMPLIANT` at `index.mjs:396` (R1, `build/requirements/consequences.md:21`).
  - R7 adds totals only within one state, unit and currency (`figures.mjs:75`).
- **office-readers** (all requirements met in T2; `build/requirements/office-readers.md:3`). Code: `bio-plane/src/formats-xlsx.mjs`, `csv.mjs`, `docx.mjs`, `pptx.mjs`.
  - R10 (`office-readers.md:113-117`): an xlsx formula is kept **with the file's cached `<v>` value held beside it**, never evaluated. Hidden rows, columns and sheets are recorded as evidence.
  - R9 (`:88-97`): defined names and table parts become `sheet-range` units.
  - R11 (`:137`, `:153-170`): docx `tables` with row and column counts; xlsx sheets with their used range; **CSV as a grid with no header assumed**. R14 (`:193`): CSV dialect and encoding detection.
- **odf-reader R44** (`odf-reader.md:222`): ODS named and database ranges become range units.
- **content**: the extent kinds `sheet-cell`, `sheet-range` and `doc-table` exist, so a member can cite a cell, a range or a table (`content.md:15`; `text-chain` R72, R92).
- **retrieval R25** (`retrieval.md:69`) and **reading-pipeline R15** (`reading-pipeline.md:64`): a workbook is searchable at sheet grain.

### Claim corrections
1. **Mostly right, but it overstates what R2 can do.** Exact limits:
   - **`count` counts the operands cited, not rows in a dataset** (`figures.mjs:63`). It cannot count rows that meet a condition.
   - **One op per part, with no composition.** A percentage would be a ratio times 100, which takes two ops.
   - **A "90%" figure cannot be an operand.** The figure pattern accepts no `%` (`figures.mjs:14`), so it is refused as unreadable. A ratio comes back as a fraction to 15 significant digits.
   - **The author types each figure as read.** The module checks only that the passage text contains that string (`figures.mjs:41-45`, `index.mjs:493-500`). It does not address or read a cell value itself.
2. **"Reachable only after a noncompliant determination": true.** The claim leaves out two things:
   - a member author must be joined to the project, while a machine may record computed parts (R1, R2);
   - **no UI calls it**: `civicos-ui/app.html` has 0 references to consequences, so today it is reachable by op only.
3. **"Only calculation":** other arithmetic exists, but none of it works on members' figures: strength's grade arithmetic, progressions' counts and deadlines (`progressions.md:90`, R24), and membership's `adminMath` (R5).
4. **What the claim missed in office-readers:** CSV is read as well as xlsx, docx tables are walked, and the cached formula result is held. A member can therefore cite the city's own computed cell, which the product does not recompute.

### Gaps confirmed
- **G5.1: no general, reproducible calculation outside consequences.** No module lets a member compute and cite a percentage, a difference or budget against actuals while investigating (inquiry legs, findings). A search of every `build/requirements/*.md` for calculat, percent, aggregate, ratio and sum found nothing else.
- **G5.2: no structured operations over a dataset.** Nothing filters or counts the rows of a CSV or xlsx grid (for example, service requests with status = closed ÷ all reported). The readers give text, a grid and cell addresses only.
- **G5.3: no budget or financial-report reader.**
  - `EXTRACTION-BREADTH-DESIGN.md:52-53` measured and ordered these classes (#5 budget or dataset, #6 financial report). BOB #32 ruled them two separate types, but "No reader is written from this; a reader is its own row."
  - `docprofile/doctypes/registry.mjs:51-86` registers 7 types, none of them a budget.
  - `consequences.md:5` says this as well: "the record holds no amounts or fund figures as values".
- **G5.4 (missed): no table structure in PDFs.** Most budgets and ACFRs are PDFs, and table recognition in PDFs was measured **NO-GO** (`EXTRACTION-BREADTH-DESIGN.md:90`, M-55). A PDF table is only a page rectangle of text.
- **Missed: the canon already asks for this, so these gaps are unmet canon, not new ideas.**
  - `BIO_Functional_Architecture_v3.md:147-155` (Function 2: "extract structured, analyzable data"; "Budget documents are formatted for reading, not analysis").
  - `:221-222` and `:561-562` (the Data Extraction Skill).
  - `:269-278` (cross-referencing the ACFR against OpenGov, and budget narrative against actual spending).
  - `:484-486` (field-level comparison for structured data).
  - The origin case itself is a percentage: "approximately 10% of sewer service charge revenues" (`BIO_Complete_Roadmap_v5.md:221-222`).
- **Doctrine any design must keep:**
  - no composed score or significance (consequences R11, K12);
  - computed values are never the author's (R2);
  - weakest-link grade (DEC-21);
  - an unknown is never read as zero (R4).

### Natural home for each gap
- **G5.1 general calculation:** split consequences' pure `figures.mjs` (its parser and arithmetic) into a small module of its own. Both `consequences` and `inquiry` (a computed leg or ground, through `inquiry-grammar`) would use it. Any machine-derived number would carry a derivation step in `text-chain`, on the model of `table(engine)` in EXTRACTION-BREADTH §3.1.
- **G5.2 row filters and counts:** `office-readers` (and `odf-reader`) would expose cell values and columns. The query or count over a grid would sit in the new calculation module, citing `sheet-range` extents (`content`).
- **G5.3 budget and financial-report readers:** `docprofile` doctypes, with structured output through `extraction`. `consequences.md:76` already assigns them there ("belongs to `extraction`/`docprofile`, not here"). The `id-spaces` `fund` space (`id-spaces.md:13`) and the budget data-set system in `jurisdictions` (`jurisdictions.md:82`) would connect a budget to an audit by fund.
- **G5.4 PDF tables:** `extraction` with `reading-pipeline`, which a new measurement must open first.
- The **EXTRACT** AI mode (`op=extractpropose`, built but not deployed; `agent-worker/src/harness.mjs:208-212`) could propose figures and readings for a member to accept.

---

## AREA 6: Plain-language questions

### Built (with requirement ids)
- **Opening a question:**
  - UC-047 is covered by "inquiry R1-R2; ai-runs R25-R27; intent R16" (`docs/development/ux-substrate/ux-experience.json:2799`).
  - The state rules have since moved to `inquiry-grammar` R1, R2 (`inquiry-grammar.md:18-19`; `surfaced_by` is `agent` or `human`).
  - intent R16 (`intent.md:55`) opens a question from a proposal.
  - ai-runs R25-R27 (`ai-runs.md:69-71`) record questions the assistant surfaces.
- **A lead can become a question:** contradiction R43 (`contradiction.md:306`: taking a lead up leaves it "a lead's inquiry"). A lead is never evidence (inquiry-grammar R5, `:28`).
- **A member's own search is built:**
  - `retrieval` (all met, `retrieval.md:3`) and `query-language` give four-level absence statements and the OR widening (R9, `retrieval.md:37`).
  - `entities.namingDocuments` (R17) finds the documents that name an entity.
  - `connections` answers who cites what, and backlinks.
- **Fetching outside documents:** `acquisition` R1-R3 fetch from a public address or an archive.
- **The pieces for "find the authorising law":**
  - `standards` R1-R6 hold an ordinance or regulation as captured text, with its citation, issuer and the period it was in force (`standards.md:22-29`).
  - `id-spaces` has an `enactment` space (ordinance and resolution numbers, R5, `id-spaces.md:23`) and a `fund` space.
  - A **`regulation` doctype** (ordinance or resolution) is registered (`docprofile/doctypes/regulation.mjs`, `registry.mjs:73`).
- **The AI investigation loop is built:**
  - `ai-runs` and `agent-worker` fan out over the four levels (agent-worker R17), send capture requests (R18) and submit suggestions only (R24).
  - **Model turns are built:** R40/R41 landed in T7 (commit `448317f6df`; `agent-worker/src/model.mjs`). The "not yet met: R40, R41" in `agent-worker.md:3` is a stale status line; the requirement body carries no unmet mark.

### Claim corrections
1. **"Question-to-search flow designed, not built": true for ASSISTANT-PILOT §2.** The pilot's own front matter says so (`ASSISTANT-PILOT.md:10`: no prompt entry point, no INTERPRET step, no FIND/HELP/CREATE/ACT classifier). So does `BIO_Assistant_and_AI_Roles_v0_1.md` §8 ("the assistant's flow … FIND end to end … DESIGNED, not built").
   - **The claim understates what is underneath.** FIND+PURSUE is built as the investigative session (the Roles doc's §2 table).
   - **That loop is not deployed for fresh questions.** Only the `check` mode is deployed; `investigate`, `extract` and `plan` are `deployed: false` (`agent-worker/src/harness.mjs:193-221`). A member cannot yet start an AI run that investigates a new question.
2. **"An inquiry can hold any question": true.** But an inquiry is answered by a *finding* with legs and a falsifier (inquiry-grammar R1), not by an explanation. An AI run's output is suggestions (agent-worker R24) and level reports with fixed keys (R20), never prose answering the member.

### Gaps confirmed
- **G6.1: nothing answers a question of meaning.** No module composes a plain-language explanation with citations, such as "this charge is levied under Ordinance X / rate schedule Y, in force since …". The pilot's FIND→ANSWER (with level named) is designed only. A search of the requirements for explain, plain language and interpret found only case-publication text and refusal translations.
- **G6.2: no bill, fee or rate-schedule reading.**
  - There is no doctype for a utility bill or a rate schedule (or a master fee schedule).
  - No mapping goes from a charge line to the enactment that imposes it.
  - `regulation` reads instruments, but nothing links a charge's name to one.
- **G6.3: the AI "investigate" mode is not deployed.** Even the search half of such a question waits on the VF-5 / SK-4 verification (`harness.mjs:186-196`).
- **Missed doctrine to carry into any design:**
  - INTERPRET shows its reading (DEC-27);
  - an answer must name the level it searched, and absence is stated per level (`ASSISTANT-PILOT.md` §2);
  - the assistant conducts and the member acts;
  - a machine never concludes.

### Natural home for each gap
- **G6.1 explaining with citations:**
  - the assistant's FIND request kind, carried by `ai-runs` (the run) and `agent-worker` (a FIND or answer mode in `MODES`, with a compose step answering under the pilot's level rule);
  - its instructions in `skills` (a pack layer);
  - the lookups through `retrieval`, `entities`, `connections` and `standards` (`standardRead`, in force at a date);
  - the member-facing entry point and flow, which belong to Bob's UX stream (the pilot's §2, `ASSISTANT-PILOT.md`).
- **G6.2 bill and rate-schedule reading:**
  - `docprofile` (a new doctype, on the same rule as G5.3: written from a page actually fetched);
  - `id-spaces` `enactment` for the ordinance-number link, and `connections` for the edge;
  - `standards` to hold the ordinance or schedule as the authority;
  - `acquisition` to fetch the municipal code text.
- **G6.3:** `run-rules` R9/R14 (`DEPLOYED_MODES`) and `agent-worker` R42: a reviewed edit after VF-5.
