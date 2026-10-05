# Study: ANALYSIS (calculation in code, spreadsheets, datasets, reproducible numbers)

BOB #110 construct study, phase 2 (analyst: ANALYSIS), 2026-10-05. Read whole: `constructs-brief.md`, `ANALYSIS-PROTOCOL.md`, `digest/ANALYSIS.md` (830 lines), `digest/DOCTRINE-REGISTER.md` (2,814), `digest/CROSS-REGISTER.md` (1,049), and the `## Modules` sections of `notes/M1.md`–`M5.md`. §9 lists the primary sources and URLs.

How sources are cited: digest bullets by their reader's source and section (for example "journeys J6 L230"); `Dnnn` and `Xnnn` are entries in the doctrine and cross-construct registers; `K` and `DEC` are rulings.

**Bob's question, in one paragraph.** Code-level and spreadsheet-level analysis should be **one record construct with two engines**, not two features.

- A *calculation* is a record object. It names its inputs (captured documents, cells, typed tables, other calculations), its method, its results and the grade facts its results inherit.
- **Code-level** calculations are *recipes*. A recipe is written in a small, closed, versioned grammar: filter, count, sum, share, difference, date span, threshold test. The plane evaluates it itself, over typed tables made from captured CSV, XLSX or portal data. Recipes cover the everyday "is the city's 90% true?" work. The standalone case checker recomputes them with the same pure code.
- **Spreadsheet-level** calculations are *workbooks*. The member does the comprehensive work in any spreadsheet program, then brings the file into the record:
  - its input ranges are **bound** cell for cell to captured sources;
  - a pinned open engine **recomputes** every formula and compares the result with the values the member's program saved;
  - deterministic **lint** looks for the known failure modes, such as a range that stops short of the data (Reinhart–Rogoff);
  - the member writes the **method**, and a second member's **check** is disclosed;
  - the workbook travels **whole** in the case, so any stranger can open it in their own spreadsheet program.
- The two connect in both directions. A recipe can be exported as a formula workbook to continue in a spreadsheet. A workbook's named output cell is an operand that a recipe, a finding's leg or a consequence part can cite.
- The machine proposes recipes and flags workbook defects. Only the evaluator computes, and only a member adopts.
- "In code" means the product's own evaluator. Members do not write code in the plane (D17, no general eval endpoint).

## 1. Anticipated needs

Centrality: **core** means a main journey cannot finish without it; then **regular** and **occasional**.

**A. Checking a government claim against its own records**
- A1 **core**: test a percentage or target claim against the city's own per-record data. *"The city says it filled 90% of reported potholes this year. Is that true?"* (journeys J6 L154–165; journeys §3 potholes and dumping L60–61; wizard "Check a claim" L472–477).
- A2 **core**: pin down the claim's terms and period before computing. An undefined term is a stated undetermined. *"What counts as 'filled', and over which year?"* (J6 step 2; D273).
- A3 **core**: set a member spot-check sample beside the city's records, with counts and denominators. *"Of 40 closed reports we visited, 11 were not repaired."* (J6 steps 5–6; CSD §4.4 UI-62; audit attribute sampling, https://ww2.amstat.org/meetings/proceedings/2019/data/assets/pdf/1199463.pdf).
- A4 **core**: threshold tests, meaning a share, balance or interval against a legal or promised bar.
  - *"Certified at 61.8% when two-thirds was required"* (view matter-page L18).
  - *"The balance fell below the statutory floor"* (CM 763).
  - *"Minutes later than 21 days in 38 of 41 meetings"* (CF §13.1 src 1558–1567).
- A5 **regular**: compare an open dataset with what was promised or required. *"Does the service-request data show the promised response times?"* (journeys §3 L75).

**B. Money: budgets, actuals, funds, contracts**
- B1 **core**: budget against actuals. *"Overtime keeps running past the budget: by how much, each year?"* (journeys §3 L63; FA L2 Fn2 L271–276).
- B2 **core**: fund flows and shares across fiscal years, as in the founding case. *"$52.6 million diverted over nine fiscal years, about 10% of sewer charge revenue"* (RM §1 L219–223, L234–239; SR §1.1 INFO-2026-0002; CF §12 src 1173).
- B3 **regular**: reconcile two sources of one figure. *"The ACFR's transfer does not match OpenGov."* (FA L2 Fn2; SR §3.1 src 566; SR §4.6 src 990–991).
- B4 **regular**: contract checks over amounts: signed amount different from the award, amendments past a threshold, payments past the term, a single bidder (CF §8.2 src 909–921; progressions R32, deferred as T32 A37).
- B5 **regular**: put a size on a breach's effect, for the audit form's Effect (DEC-84.10) and for `consequences`. *"$100,000,000 of bond debt authorised, computed from the resolution and bond schedule"* (view matter-page L27–33; consequences R2).
- B6 **occasional**: set fee quotes side by side (CM §2 D-148; actions R27).

**C. Datasets and records over time**
- C1 **core**: filter, count, total and group a dataset's rows. *"Closed ÷ reported, by month, 2025."* (u41 G5.2; journeys §3 L75).
- C2 **regular**: a figure that changed between versions, or a dataset that changed between captures. *"$4.2M became $2.8M between drafts"* (DEC-11 src 589–593; TAD §7.4 keyed field-level diff).
- C3 **regular**: counts over the group's own record: exposure, hunch debt, searched coverage, objective progress such as "41 of 58 contracts at Grade B" (IS §14c; CF §12 src 1213–1216; intent R4).
- C4 **occasional, but blocking when it occurs**: large inputs. Examples: a 39.6 MB budget book, the Stop-Data workbooks past the 20 MiB bound, CSV files past 8 MiB (MS M6 L323; OF Incomplete L11; D-593).

**D. Spreadsheets as the working medium**
- D1 **regular**: the government's own workbook, where the formula is the finding. *"Which cells feed the 'budgeted' figure; what is on the hidden sheet?"* (OF L117–128: "the DERIVATION is frequently the finding").
- D2 **regular**: a member's own spreadsheet analysis for "more comprehensive challenges" (Bob, in the brief). An accountant member checks it (journeys J8; journeys §3 L63, L71; MA §1.3).
- D3 **regular**: figures read off PDFs. Most budgets and ACFRs are PDFs. PDF table recognition was measured NO-GO (EBD §3.3 M-55), and an academic benchmark puts table F1 at 0.28–0.47 (https://arxiv.org/pdf/2303.09957).

**E. Publication and reproducibility**
- E1 **core**: every number a case relies on recomputes without Civicsmith. *"Anybody can review, and even recreate, the case for themselves"* (DEC-112; Pub §5C L399–408; X119).
- E2 **regular**: charts that tell the story, survive print and are accessible (UK L177–179, L212–216; DEC-99; DEC-122; PR §8 L135).
- E3 **occasional**: a partner group reruns the analysis. "Forks at fact or analysis signal a reproducibility issue" (DR §5; audiences L1163).

**F. Patterns and progress**
- F1 **regular**: objective progress over amounts and funds. CF §12 src 1199–1216 asks for it; intent R4 today evaluates only `entity_kind`.
- F2 **occasional**: measurable pattern statements with a denominator the registry defines, reported whichever way they cut (CF §13.1; D331).
- F3 **regular**: lateness across a body's acts (X129; shared with TIME).

**How the work is done in the real world, and how it fails.**
- Practice:
  - Keep the raw file untouched, work on a copy, keep a data log, write the methodology, spot-check (ProPublica, https://www.ire.org/?p=44398).
  - "Build, bulletproof, show your work", with data and code published (The Markup, https://themarkup.org/about).
  - Audit documentation must let an experienced outsider "understand … the nature, timing, extent, and results of audit procedures performed; the evidence obtained; and its source" (GAGAS, https://gaoinnovations.gov/yellowbook/2024/audit-documentation-1.html).
  - Data is assessed for accuracy, completeness and applicability before anyone relies on it (GAO-20-283G, https://www.gao.gov/products/gao-20-283g).
- Failure modes:
  - A short range. Reinhart–Rogoff averaged rows 30–44 instead of 30–49 and dropped five countries; −0.1% became 2.2% (https://retractionwatch.com/2013/04/18/influential-reinhart-rogoff-economics-paper-suffers-database-error/).
  - Errors are found in about 94% of field-audited spreadsheets and in 1–5% of formula cells (Panko, https://arxiv.org/pdf/0801.3114.pdf).
  - Silent type conversion. About a fifth of genomics papers with Excel gene lists were corrupted (https://genomebiology.biomedcentral.com/track/pdf/10.1186/s13059-016-1044-7).
  - Engines disagree in floating point (https://exceljet.net/articles/floating-point-errors-in-excel; https://help.libreoffice.org/latest/om/text/scalc/01/calculation_accuracy.html).
  - A sample is read as a census (CSD §4.4).

**What groups can actually get.**
- Socrata and Tyler portals answer filtered and grouped queries (`$group` with sum, count, avg, min, max; https://dev.socrata.com/docs/queries/group).
- CKAN offers `datastore_search` and `datastore_search_sql` (https://docs.ckan.org/en/ckan-2.1.5/datastore.html).
- ArcGIS layers page with `resultOffset` and `exceededTransferLimit` and offer `outStatistics` (https://www.fairfaxcounty.gov/gisint1/rest/services/PLUS/PLUSGISRecords/FeatureServer/0/query?f=help).
- Budget platforms export CSV (https://www.route-fifty.com/digital-government/2016/02/machine-readable-budget-in-a-human-friendly-format/299552/).
- ACFRs will stay PDFs for years. FDTA Phase 1's final rule was published 8 June 2026, Phase 2 is due 1 October 2028, and the MSRB has no deadline (https://www.gfoa.org/fdta).
- All of this is free. The cost is the group's time and the PDF problem (D3).

## 2. Levels of support

| level | what a member can do |
| --- | --- |
| **L0 Cite a figure** | Capture a document and point a leg at the passage, cell, range or table holding a number. Formulas and hidden sheets are visible as evidence. |
| **L1 Arithmetic over cited figures** | Sum, difference, count, product and ratio over figures read in cited passages. The plane computes them, grades them by the weakest input and labels them; they can be recomputed. |
| **L2 Reproducible calculation over a dataset** | Turn a captured CSV, workbook range or portal export into a typed table. Filter, count, total, group, and take shares, date spans and threshold tests in a recipe that a finding cites. It is recomputed on read and flagged when an input changes. It is carried in the case and recomputed by a stranger's checker. |
| **L3 Spreadsheet analysis in the record** | Bring one's own workbook in. Its inputs are bound to captured sources, its formulas are recomputed by a pinned engine, and its defects are flagged. The method and a second member's check are recorded, and the workbook is carried whole. |
| **L4 Longitudinal and comparative analysis** | Budget against actuals across fiscal years, joined by fund and program keys. Reconcile two sources. Follow a dataset's revisions. Draw a recorded random sample with its interval. Measure patterns and objective progress over amounts. Put charts in the published case. |
| **L5 Assistant-assisted analysis** | Ask in plain words. The assistant proposes a recipe, a table's types or a PDF table's structure, and flags workbook defects, all labelled. The member adopts. |

Which level serves each need in §1:
- **L0**: A2, B6, D1.
- **L1**: B5 as built, part of A4.
- **L2**: A1, A4, A5, B4, C1, C3, D3 (through typed transcriptions), E1.
- **L3**: B1 for one year, D2, and C4 as the honest route for oversized inputs.
- **L4**: B1 across years, B2, B3, C2, A3 as an estimate, E2, E3, F1, F2, F3.
- **L5**: any question asked in plain words. It speeds the work up but is never required.

The target is L2, with L3's import close behind, because the core needs A1, A4, C1 and E1 sit at L2.

## 3. What exists now

| module (layer) | what it provides (R ids) | built | member reach (op / screen) | AI |
| --- | --- | --- | --- | --- |
| office-readers (1) | R9 defined names and tables as `sheet-range` units; R10 formula beside its cached value, never recalculated; hidden rows, columns and sheets; R11 sheet text tab-joined, CSV "row 1 is row 1"; R12–R13 20 MiB guard; R14 dialect. No typed cells, no header meaning. | yes (T2) | inside `op=acquire` (UI 7–9 calls); no op of its own | none |
| odf-reader (1) | R15 formula kept verbatim beside the displayed value; R16 hidden and filtered ranges; R44 named and database ranges; R45 repeat bound | yes | inside acquire | none |
| reading-pipeline / extraction (4) | R15 one text unit per sheet, at its used range (D-672); extraction R22 units capped at 128 KiB, 4,096 units, 2 MiB; R36 `unitsOf` | yes | `reading` UI 1 | EXTRACT built, mode not deployed |
| content (4) | R1 `sheet-cell`, `sheet-range`, `doc-table` extents; R46 `passageText`; R24–R25 typed transcription with a second member's attestation | yes | content ops UI 0; a part is cited inside `cite` (UI 6) | machine may mark a passage citable (R36) |
| retrieval / query-language (5) | R6 `count` mode; R7 facets; R14 tallies with stated bounds; R18–R20 selections (a query digest, or enumerated ids with shas, alive 300 s); R25 sheet-grain search; QL R12 bounds | yes | search 24, select 20 UI calls | agent-worker calls `search` and `meaningrows` |
| progressions (5) | R18 per-stage counts; R31 cardinality; R32 junction checks over amounts | R32 has no code (T32 A37, "no amounts or funds as values") | progression screens | none |
| strength (6) | R4 grade arithmetic (DEC-32); R31 `GRADING_METHOD_VERSION` "bio-grading/1"; R32 `recomputePair`, pure ("a grade recomputes the same by construction", `strength/method.mjs`). This is the template a calculation should copy. | yes | inquirystrength and versionstrength, UI 2 each | run-productions checks pairs |
| intent (7) | R4 a three-valued share over progression instances; its filter evaluates only `entity_kind` | yes | 18 ops, UI 0; `objective-gap` queue items are visible | `workObjective` opens a run |
| consequences (9) | R2 computed part `{op ∈ sum, difference, count, product, ratio; operands = content ids}`, graded by the weakest operand's capture; R3 assessed; R4 undetermined is never zero; R7 totals only within one state, unit and currency; R11 no composite | yes (1,105 lines, 24 tests). `figures.mjs`: no `%`; the figure must appear verbatim in the passage; `count` counts the operands given; one op per part; product and ratio to 15 significant digits | 6 ops, UI 0; refused `CONSEQUENCE_NOT_NONCOMPLIANT` without a live noncompliant determination, which itself rests on a published finding | a machine may record a computed part (K102), but no agent op writes one |
| actions (9) | R27 `actionQuotes`, parsed fee quotes by counterparty | yes | UI 0 | none |
| case-grammar / case-checker (8) | checker R5 recomputes pairs at the stated method; R13 one-file offline program; R16 byte-identical answers | yes (29/29, K1412) | public `casechecker`, `casefilespec` | none. It carries no calculation. |
| publication / public-read (8) | R26 no case-level strength; R30 renderings verified by pixels | R30 not met (T32 A41) | — | none. No chart, table or derived-number construct. |
| corpus-export (8) | whole-corpus export with counts | yes | admin only | none. No dataset export. |
| agent-worker / skills / run-productions (6) | modes check, investigate, extract, plan; only `check` deployed; writes `suggest`, `capturerequest`, `optionpropose`; R5 labels answer fields `record`, `derived`, `call` | yes | no UI opens a run (`airunopen` UI 0) | no tool computes |
| record-grammar (1) | `OBJECT_TYPES` (types.mjs:20): information, inquiry, project, action, bias, standard, determination, consequence, escalation, aspiration, goal, action_plan | yes | — | — |

`record-grammar` has no dataset or calculation type.

**Verified in code.** `content.passageText` of a single-cell row answers null. The reason given in `content/notice.mjs` (`heldTextAt`) is that "only whole indexed units — a PDF page, a paragraph, a slide — carry text". So a cited cell is a pointer whose value the record cannot read back. A whole-sheet range works only under 128 KiB, and then only as "the figure appears somewhere in the sheet's text" (`passageHolds` is a substring test). The consequences Suggestion that a spreadsheet cell is "the natural operand" therefore does not work in practice.

`consequences` is used only by filings, escalation, affordances, control-plane and plane (`modules.json`). No module in layers 4–8 holds a number as a value (X166). The brief's structural observation holds for calculation.

**Where the system sits on the ladder.**
- Built: **L1**, but only inside layer 9 after a breach is determined, plus counts over the record.
- What a member can use today: **L0**. A member can cite a document or a sheet range in a leg and read facet counts in search.
- Nothing at L2–L5 exists. The design stream records the same gap ("Calculating over a dataset … the only calculation in the product comes after a breach has been determined", journeys §6 L369).

## 4. Gaps

| need | missing capability | severity |
| --- | --- | --- |
| A1, A5, C1 | typed tables from captured datasets; filter, count and group over rows; a calculation object a leg can cite | **blocks core work** |
| A4 | a computed share or comparison before publication; the figure parser has no `%`; comparison exists only as a member's determination in layer 9 | **blocks core work** |
| E1 | the case file carries no calculation; the checker recomputes grades only; a number written in prose cannot be recomputed | **blocks core work** (any numeric finding) |
| B2, D3 | budget and financial-report readers (EBD rows 5–6 "no reader is written"); PDF tables NO-GO; typed transcriptions are not usable as operands outside consequences | **blocks core** for the founding case; degrades B1 when the city publishes no XLSX/CSV |
| D2 | importing a member's workbook as analysis: bindings, recompute, lint, method note, check | **blocks** Bob's "spreadsheets for more comprehensive challenges" (regular) |
| A2 | a definition or period on the calculation; "Undetermined, because the city does not define it" exists only as journey text | degrades |
| A3 | a recorded sample design or draw; counts with denominators exist only in prose | degrades; a population estimate is nice to have (Bob's §8.6) |
| B3, C2 | keyed dataset diff; version notices compare text, not values | degrades |
| B4, F1 | amounts as values for progressions R32 and intent filters (T32 A37) | degrades |
| B5 | consequences built but not reachable (UI 0) and only after a determination | degrades (layer 9's interface work) |
| C4 | streaming or bounded evaluation of large inputs; refused honestly today | degrades (workbook route) |
| D1 | no check that the city's cached values follow from its formulas | degrades |
| E2 | no chart construct; description-as-truth (SR §2.3) designed, not built; publication R30 not met | degrades |
| E3, F2, C3 beyond built | cross-group rerun of numbers; the measurable form (D-88 deferred) | nice to have |
| L5 | no assistant tool proposes or explains a calculation; FIND not built | nice to have now |
| reach | consequences, intent progress and selection lists all have no screen | degrades everything above |

## 5. Proposed architecture

**Target level and why.** Build L2 first, then L3 (stages 1–2), then L4 (stage 3), then L5 (stage 4).
- Every core need sits at L2.
- Bob named spreadsheets. Importing and checking a member's workbook (L3) is far cheaper and safer than growing the product into a spreadsheet or BI tool.
- L4 waits on new readers and measurements; L5 waits on the assistant being deployed.

**What to adopt from the real world.**
- **Tables.** Use the W3C CSVW model and the Frictionless Table Schema for declared column types and null markers. The canonical form is CSV (RFC 4180, UTF-8) plus a schema, with a "sha256:" hash as in a Frictionless Data Package (https://www.w3.org/TR/tabular-metadata/; https://framework.frictionlessdata.io/docs/resources/table.html). This builds the canon's "normalised dataset hashed, not the raw capture" (FA L1 Fn3; TAD §7.2; SR §4.1; Int §2 L248–251).
- **Budgets.** Use the Fiscal Data Package's column types: administrative, functional and economic classification, and phase plan/actual (https://specs.frictionlessdata.io/fiscal-data-package/). This matches BOB #32's split of budget (a plan) from financial report (actuals). Fiscal-year boundaries and fund codes come from the jurisdiction profile (D196).
- **Provenance export.** Use W3C PROV-O (`used`, `wasGeneratedBy`, `wasDerivedFrom`) to describe a calculation's inputs and outputs in the case file (https://www.w3.org/TR/prov-o/).
- **Formula semantics.** OpenFormula (ISO/IEC 26300-2) is the reference for "equivalent results if given equivalent inputs".
- **Engine: IronCalc.** It is Rust compiled to wasm, MIT/Apache-2.0, reads xlsx and has 300+ functions (https://github.com/ironcalc/IronCalc). Rejected alternatives:
  - HyperFormula: GPLv3 or a commercial licence (https://hyperformula.handsontable.com/docs/).
  - The Google Sheets API: ruled out by DEC-67 and sovereignty (D201).
  - DuckDB-Wasm as the plane's engine: it would be a second query language beside `query-language` (D155) (https://duckdb.org/2021/10/29/duckdb-wasm.html).
- **Portal queries.** A SoQL, CKAN or ArcGIS query URL is the "stable query definition" a dataset snapshot is keyed to (TAD §7.2). When the portal computes an aggregate itself, its answer may be captured and cited like any document ("let the source compute").
- **Charts.** A Vega-Lite JSON spec is the authoritative description and the rendering is regenerated from it (SR §2.3; https://www.microsoft.com/en-us/research/?p=449646). A data table serves as the text alternative (DEC-99).
- **Practice.**
  - The GAGAS documentation test sets the bar for a method note.
  - GAO's three questions (accuracy, completeness, applicability) are what a table declaration answers.
  - The workbook checks are aimed at the documented failure modes listed in §1.

**Data model.**
- **Table.** A table is derived content over a capture, with these fields:
  - `table_id = sha256(capture_sha, extent, schema_sha)`, `capture_sha`, and the extent: a `sheet-range`, a whole CSV, or a portal snapshot;
  - `schema {header_rows, columns[{name, from, type ∈ integer|number|decimal|date|datetime|string|boolean, nulls[], unit?, currency?}]}`;
  - `canonical_sha`, `rows`, `parse_failures[{cell, why}]`;
  - the chain plus a step `normalise(schema_sha)`, `derivation_cap`, `declared_by`, `at`, `stale`.

  Rules:
  - A header is a declaration, never assumed (OF CSV).
  - A value that does not parse as its declared type is listed as undetermined and never coerced. This is the guard against the Ziemann failure.
  - Office cells are read losslessly through a new typed-cell service in office-readers and odf-reader. CSV states its dialect (REC-218).
  - PDF tables enter only through typed transcriptions (content R24–R25), or through `table(engine)` once a measurement says GO (EBD §3.1).
- **Calculation**, a record object `CALC-` (record-grammar gains the type `calculation`), with these fields:
  - `question` in the member's words; `terms[{term, definition | undetermined "because … does not define it"}]`; `period`;
  - `inputs[{name, ref: table_id | content_id | calculation output | frozen record set {ids+shas, query, scope}}]`;
  - `kind: recipe | workbook`, with either a `recipe` or a `workbook {capture_sha, engine{name, version}, bindings[{range, input, verified}], unbound[{range}], outputs[{name, range}]}`;
  - `method_version` ("bio-calc/1");
  - `results[{name, value | range | true/false/undetermined, unit, currency?, denominator?, sample?{design, n, N, seed?}, why}]`;
  - `recompute {status: matches|differs|undetermined, differs[], unsupported[], volatile[]}`, `lint[]`;
  - `grade_facts {inputs[{capture_grade, derivation_cap}], weakest, unbound_count}`;
  - `method_note` (a reasoned act), `checks[{member, note, at}]`, `labels{machine_work, proposed_by?}`, `author`, `at`, `supersedes`.

  Rules:
  - It is append-only.
  - Results are derived on read and frozen when a version is accepted or published (progressions R24; DEC-12).
  - It is the record's "analysis" layer made structural: the inputs are facts that can be verified, the calculation is analysis that can be reproduced, and the finding is a judgement that can be argued (FA L2 Fn3; it covers UC-027, which no requirement covers today).
- **The recipe grammar is closed.** Its steps:
  - `select(table, where[{column, op, value}])`, `count`, `sum(column)`, `difference`, `ratio`;
  - `share(part, whole)`, which always carries its denominator;
  - `group(by, agg)`;
  - `span(from, to, days | business_days)`, using the TIME construct's profile calendar;
  - `compare(a, op, b)`, giving true, false or undetermined;
  - `round(n, rule)`;
  - `join` only through an id-space or a captured crosswalk (D184).

  It has no user code, no eval and no network (D17). Each step's output can be inspected. Sorting is allowed; a rank or score column is refused (DEC-89, D353).
- **Relations.**
  - A leg of kind `calculation` cites an output (Bob's §8.3).
  - A consequences R2 operand may be a calculation output.
  - A threshold input may cite a standard's captured passage (a content id). The `standards` object stays in layer 9.
  - `reevaluation` gains a cause, `calculation_input_changed`: flag only, never recompute into the record (the consequences R8 rule).
- **As-of.** Every input pins its capture sha, or for a portal query the query and its retrieved instant. A newer capture leads to a successor calculation by a member's act, and the old one stands (D283).

**Grade, with no new scale** (X131, D58, and DEC-4's precedent D70).
- A result's capture axis is the weakest capture grade among the documents its inputs reach (DEC-21; consequences R2).
- Each input's derivation caps it (D92): OCR at C, AI-extracted at most B, an unmeasured step undetermined.
- The arithmetic itself is not a weakening step, because it is recomputed rather than trusted. This is the same reason strength's walk is not a step.
- Unbound workbook inputs and figures typed by a member enter as testimony (D, D109), each named.
- The connection axis is the leg's own.
- Whether the method is sound is not graded. It is recomputed by machine and checked by a person, and both are disclosed (DEC-82, D95).

**How the two levels divide and connect** (the division rule is BOB's to set).
- **Recipe** is the default, offered first, when the work fits the grammar and the bounds (one or two tables within the table bound, a bounded number of steps).
- **Workbook** is for:
  - work the grammar cannot express: multi-year models, allocations, many joins, iterative cleaning;
  - a professional member who prefers a spreadsheet;
  - inputs past the plane's bounds (C4).
- An analysis done in code outside the product (a notebook) enters as data files plus an attached method, marked "not recomputed here".
- **Connection:**
  - A recipe exports as an XLSX in which the input cells carry their table shas as named ranges and the formulas reproduce the recipe. A member continues in their own spreadsheet, and re-import binds the inputs back automatically.
  - A workbook output is a named range that recipes, legs and consequence parts can cite.
  - Both are `CALC-` objects, with one leg kind, one grade rule, one way of being carried in a case and one checker obligation.

**How a spreadsheet analysis becomes cited, reproducible and checkable.**
1. Inputs are captured as public documents with provenance, or as a portal query snapshot.
2. Tables are declared, normalised and hashed, with parse failures listed.
3. The member downloads a starter workbook of the inputs, with named ranges that carry the table shas, or uses their own copy.
4. The member works in any spreadsheet program; nothing ties them to a vendor.
5. The member uploads the file as an *analysis workbook*: an information object of member origin, never presented as a publisher's document. The same office readers read it, so its formulas, cached values and hidden sheets are disclosed too.
6. **Bind.** Each input range is paired with a table range or content id, and typed values are compared cell by cell. Equal cells are bound; differences are named; unbound cells are listed as typed by the member.
7. **Recompute.** The pinned engine recalculates every formula and compares each result with the cached value. It names differences, unsupported functions, volatile functions (NOW, RAND, INDIRECT) and external links. Macros are never run. The result is stated as agreement between two engines, not as accuracy (D110).
8. **Lint.** Code checks produce proposals only and never block. They look for:
   - a formula range that ends before its contiguous data block (the Reinhart–Rogoff check);
   - constants typed inside formulas;
   - inputs in hidden rows;
   - numbers stored as text;
   - error values;
   - totals that do not cross-foot.
9. **Method note** (reasoned and required, measured against the GAGAS test) and named outputs. A second member may record a check with a note, as in content R25. Without one, the calculation reads "not checked by a second member".
10. **Cite and publish.** Legs cite outputs. The case file carries the workbook bytes, the tables, the bindings, the recompute report, the engine version and the note. For each number, the complete edition says how to check it yourself:
    - open the workbook in any spreadsheet program;
    - compare the input fingerprints;
    - or run the checker. Bindings and recipes recompute in pure code; recomputing a workbook uses the engine shipped beside the checker as a fingerprinted file, after measurement.

**Module changes** (checked against `modules.json`; no existing module moves).
- **New `calc-grammar`** (layer 1, pure, no store).
  - It holds the figure parser (moved from `consequences/figures.mjs`), typed values, units and currencies, the recipe grammar and its evaluator, `CALC_METHOD_VERSION`, `calcMethodText`, and `recompute(recipe, inputs, version)`.
  - It uses record-grammar and is used by calculations, consequences and case-checker. The checker imports it as pure code, as it does `strength/method.mjs`.
  - About 800–1,200 lines.
- **New `calculations`** (layer 5, last, after retrieval).
  - It holds tables, `CALC-` objects, bindings, recompute requests, lint, grade facts and ops, and registers retrieval fields and a reevaluation cause.
  - It uses record-grammar, calc-grammar, record-core, membership, promotion, provenance, extraction, content, office-readers, odf-reader, format-registry, observation-log, query-language and retrieval.
  - It is used by inquiry-grammar, inquiry, strength, reevaluation, case-grammar, case-checker, publication, consequences, affordances, op-declarations, control-plane and plane.
  - About 2,000–3,000 lines, which keeps it within P6.
- **New `sheet-worker`** (layer 1, a standalone Worker like `ocr-worker`; stage 2).
  - It wraps IronCalc as wasm. Bytes go in and a hashed recompute report comes out, with no bindings, no network and no store.
- **Extensions:**
  - office-readers and odf-reader: a typed-cell service;
  - content: a cell's typed value read through its table;
  - record-grammar: the `calculation` type;
  - inquiry-grammar and inquiry: the leg kind;
  - strength: grade facts for a calculation leg. `bio-grading/2` is needed only if the arithmetic changes;
  - reevaluation: the new cause;
  - case-grammar and case-checker: carriage and recompute;
  - publication and public-read: outputs and charts in the complete edition;
  - consequences: calculation outputs as operands (an R2 meaning change, for Bob);
  - intent R4 and progressions R32: amount filters, at stage 3;
  - affordances, op-declarations, control-plane and plane: the acts `tabledeclare` and `calculationrecord` (reasoned), `calculationpropose` (reversible) and `calculationcheck` (reasoned);
  - agent-worker: at stage 4.
- Membership's `MODULE_ORDER` is re-pinned, as it was for docket.

**The AI's role.**
- It works through propose ops only, inside a future investigate or plan mode or the FIND assistant: `tabledeclarepropose`, `calculationpropose` (a recipe from the member's question), `workbookcheck` (lint explained), and EXTRACT `table(engine)` proposals once measured.
- The model never produces a number that enters the record; the evaluator computes (D44; DEC-60: "the calculation stays as simple as it already is").
- A number the assistant states in conversation is labelled `derived` and not stored (run-productions R5). It is kept only by becoming a recipe.
- The member decides the question, the definitions, the inputs, adoption, the note and publication.
- The machine never states significance, a rank or a verdict on a person or office, and makes no population claim without a recorded draw.

**Doctrine kept.**
- The machine proposes, a member decides, words are a labelled draft, proposals are stored apart: D1, D3, D4, D14, D53.
- No general eval endpoint; a fence is code; no new machine write path: D17, D44, D38.
- The surface renders the plane's number and never computes one: D22, DEC-51, DEC-58.
- Undetermined is never zero and is counted apart: D55–D57, D144, D151.
- No single score, case-level strength or composed figure: D58, D64, D65, D154 / consequences R11.
- Derivation steps weaken; corpus fidelity is agreement, not accuracy; inputs that would yield plausible invention are refused: D92, D110, D130.
- Counts are pinned in tests: D131.
- Counts disclose existence and run through `query-language` under the viewer's gate: D136, D147, D155.
- Show the denominator: D146.
- No private individual singled out: D172, D176 / consequences R10.
- No jurisdiction in product code: D196.
- Sovereign instances, vendor neutrality, nothing loaded from outside the group's copy: D201, D204, D356.
- Recreatable without Civicsmith: D202, D304 / DEC-112.
- No significance or rank: D353 / DEC-89.
- A fact is stated in one place, so a published number is a rendered output, never retyped: D364, D368.
- Sequence is not causation: D75 / DEC-14.
- A number carries its filter: DEC-40, DEC-60.
- The bound is always stated: DEC-57, DEC-64.

**Runtime and deployment.**
- Recipes run in the plane's Durable Object. The limits there are 128 MB per isolate; CPU 30 s by default, configurable to 5 min; SQLite rows of at most 2 MB; statements of at most 100 KB; at most 100 bound parameters (https://developers.cloudflare.com/workers/platform/limits/; https://developers.cloudflare.com/durable-objects/platform/limits/).
- So canonical tables live as bytes in the evidence store (R2), not as SQL rows, and the evaluator streams them.
- BOB's starting bound is one input of at most 20 MiB canonical or about 1,000,000 cells, to be measured. Past the bound the answer is undetermined with its reason, and the workbook route is offered.
- `sheet-worker` is a separate fleet member on the instance's own account (the `ocr-worker` precedent), reached by service binding with no network. Workers Paid is already required (DEC-42).
- There is no vendor key and no cloud spreadsheet.
- The standalone checker ships `calc-grammar`, and the engine as a separate fingerprinted file if measurement allows.

## 6. How to proceed

**Stage 1: "Check a claim" (L2 and typed tables).**
- Unlocks:
  - journey 6 end to end: the 90% claim, its terms, the city's records, a recipe, spot-check counts with denominators, and a conclusion with its strength against the bar;
  - budget against actuals for one year where the city publishes XLSX or CSV;
  - the bond measure's two-thirds test;
  - the dataset front door (A5);
  - the founding case's few load-bearing ACFR figures, through typed transcriptions attested by a second member (content R24–R25).
- Size: two new modules and about nine extended ones; about 55 requirements (calc-grammar about 14, calculations about 28, extensions about 13).
- Measure first:
  1. Recipe coverage: write every calculation in the journeys, the sewer case and the u41 front doors in the grammar, and report what does not fit.
  2. A dataset census of the corpus: formats, sizes against the 8 MiB and 20 MiB bounds, header shapes, and how often values fail to parse under declared types.
  3. What it costs a Durable Object to normalise and evaluate a 20 MiB table, measured with `cpuProbe`.
  4. Exactness against a decimal reference on fixtures.
  5. A walk through journey 6's "Work it out" step with the design stream.

**Stage 2: workbooks (L3).**
- Trigger: stage 1 in use, and either a real calculation the grammar cannot express (from measure 1) or a professional member's workbook in a real case.
- Adds `sheet-worker`, import, bindings, recompute, lint, the method and check acts, and export from recipe to XLSX.
- Measure first:
  - which functions the corpus's 288 workbooks use, and how often volatile functions appear;
  - how often IronCalc's recomputed values agree with the cached values on that corpus. That rate is the engine's cap, measured like OCR (D73);
  - the wasm's size in a Worker and in the checker.

**Stage 3: longitudinal and comparative (L4).**
- Trigger: a multi-year fund case (B2) or a reconciliation (B3) in a real project.
- Adds:
  - the budget and financial-report readers (EBD rows 5–6, in docprofile and extraction);
  - fund and program joins through id-spaces and captured crosswalks;
  - portal snapshots with keyed diffs (TAD §7.4);
  - recorded random draws, if Bob allows estimates (§8.6);
  - Vega-Lite charts, with publication R30;
  - amount filters for intent R4 and progressions R32, which clears T32 A37;
  - measurable pattern statements;
  - the PDF table engine, re-measured against M-55 with tools of the TATR class.

**Stage 4: the assistant (L5).**
- Trigger: an investigate or plan mode deployed with model turns (agent-worker R40, R48), and the acceptance-rate instrument (DEC-77.3).
- Adds the propose ops and explained workbook checks.

**Risks and how each is contained.**
- **False precision** (a sample read as a census, a number without its filter). Contained by denominators, sample labels, bound sentences from the plane, and negative-control tests in the DEC-44 style.
- **Members' spreadsheet errors.** Contained by recompute, lint, and disclosure of whether a second member checked.
- **Engine divergence.** Contained by a pinned version, comparison with cached values, and "agreement" wording.
- **Runtime limits.** Contained by bytes in R2, streaming, stated bounds and the workbook route.
- **Person-level rows** (overtime by officer, Stop-Data). Outputs are never grouped by a private person and never name one.
- **Drift into a BI or dashboard product** (DEC-48). Every stage must be justified by a journey; no performance-score dashboards.
- **Licence.** IronCalc is MIT/Apache; no GPL engine.
- **Module size (P6).** The pure grammar is split from the module with the store.
- **AI arithmetic.** The model never computes into the record.
- **Layer order.** Thresholds are read as captured passages until the LAW study settles where `standards` sits.

## 7. Interfaces with the other constructs

- **TIME.** Needs a pure calendar service low in the order: business days, office holidays, time zone, fiscal-year boundaries, all from the profile. `span` and period grouping use it. Calculation must not become a seventh deadline engine (X60).
  Supplies durations, lateness counts and period aggregates (F3, X129).
- **ORGANISATIONS.** Needs office, department, fund and program keys and captured crosswalks (id-spaces R20; entity kinds fund and parcel), with grouping by role, never by person.
  Supplies per-body aggregates, reconciliations, and counts of obligations met and unmet.
- **LAW.** Needs thresholds and defined terms (two-thirds, statutory floors, 21 days, what "filled" means) to be citable during investigation.
  Supplies the measured Condition for conformance, the Effect for the audit-style finding form (DEC-84.10), and three-valued threshold tests.
- **COURTS.** Needs settlement and consent-decree monitor figures and court-ordered metrics as inputs.
  Supplies computed figures to the counsel packet's chronology and to compliance tracking under a decree.
- **QUESTIONS.** Needs a run mode with propose ops and a tool that reads tables and calculations.
  Supplies computable, cited answers to "how many, how much, what share", with the search level and the bound. The assistant never states a number it did not compute through the evaluator.

## 8. Decisions for Bob

1. **One construct, two engines.**
   - Options: (a) built-in recipes only; (b) spreadsheet import only; (c) both, as one `calculation` construct, with recipes first.
   - **Recommend (c).** Recipes serve the core journeys within doctrine. Workbooks honour "spreadsheets for more comprehensive challenges" without the product becoming a spreadsheet. One construct keeps one grade rule and one checker.
2. **Where calculation sits.**
   - Options: (a) new product modules `calc-grammar` (layer 1) and `calculations` (end of layer 5), plus `sheet-worker` (layer 1) at stage 2; (b) inside `inquiry`, which already has 3,897 lines (P6); (c) widen `consequences`, which cannot be used before publication and fails journey 6.
   - **Recommend (a).** No existing module moves. Consequences R2 gains calculation outputs as operands.
3. **What a leg may rest on, and how a computed figure is graded.** D-181 says a leg rests on "information or another inquiry, nothing else"; strength R35's kinds already include observation and imported.
   - Options: (a) add a leg kind `calculation`. Its capture axis reaches the input documents, capped by how each input was extracted; unbound inputs count as testimony; the method is disclosed, not graded. (b) A new "computation" scale. (c) A calculation is only a description on its input legs.
   - **Recommend (a).** It is consistent with DEC-21, D70 and DEC-82's four scales.
4. **A second member's check.**
   - Options: (a) disclosed, never a gate; (b) required for a load-bearing calculation.
   - **Recommend (a).** "A group may be one person" (D370), and the record labels and discloses (D46). Journey 6 would read: "checked by a second member, or stated as not checked."
5. **At publication, a load-bearing calculation whose recompute differs or whose inputs are unbound.**
   - Options: (a) disclosed, with the pre-flight refusing only an undisclosed difference, as for RECORD contradictions (DEC-76.4); (b) refused; (c) ignored.
   - **Recommend (a).**
6. **Samples.**
   - Options: (a) counts with denominators only ("11 of 40 visited"); (b) also a population estimate, when the plane drew the sample at random from a frozen set and states an exact interval; (c) free.
   - **Recommend (b) from stage 3**, with stage 1 shipping (a).
7. **Person-level data.**
   - Options: (a) outputs grouped only by office, department or class; a private person is never named; an official is named only in official capacity, tied to a documented act; (b) per-person outputs allowed for officials.
   - **Recommend (a)** (Design Requirement 6, D176, consequences R10). It affects people outside the project, so it is Bob's.
8. **Spreadsheets as the working medium.**
   - Options: (a) file exchange in XLSX, ODS and CSV, not tied to any vendor; (b) live integration with a cloud spreadsheet.
   - **Recommend (a)** (DEC-67; D201).
9. **UX.** Recommend a "Work it out" step in the question workspace (journey 6, step 4), for the design stream. It would have three doors:
   - "Compute from the record";
   - "Bring my spreadsheet";
   - "Ask the assistant to propose" (stage 4).

   The step shows inputs, method, results with denominators and bounds, recompute status and checks.
10. **Charts in publications.**
   - Options: (a) an authoritative JSON spec, regenerated and verified, with a data table and a print form; (b) images uploaded by members.
   - **Recommend (a)** (SR §2.3), at stage 3.
11. **Order of work.** Approve stage 1 as the next ANALYSIS work, justified by journey 6 (Bob, 4 October), with the five measurements in §6 done first.

**Decided by BOB, reported here, not asked.**
- The engine is IronCalc.
- A canonical table is RFC 4180 UTF-8 CSV plus a Table Schema JSON, hashed with sha256.
- The method version is `bio-calc/1`.
- Sums are exact in decimal; ratios are given to 15 significant digits, with the rounding stated.
- Volatile functions are flagged, macros are never run, external links are refused.
- Bounds are always stated.
- The leg kind is named `calculation`.
- Every requirement gets a negative control (P7), including:
  - a planted Reinhart–Rogoff short range that lint must find;
  - a planted mismatch between a cached value and its formula that recompute must name;
  - a value that fails to parse as its type and must never be coerced.

## 9. Sources opened

**Primary sources:**
- `build/requirements/consequences.md` (whole); `bio-plane/src/consequences/figures.mjs` (whole); `consequences/index.mjs` 230–300.
- `build/requirements/content.md` (whole); `bio-plane/src/content/index.mjs` 1255–1290 (`passageText`); `content/notice.mjs` 85–140 (`heldTextAt`).
- `build/requirements/office-readers.md` 1–230; `reading-pipeline.md` R15; `extraction.md` R22, R36; `retrieval.md` R6, R7, R18–R20, R25, R59.
- `build/requirements/intent.md` R2–R5 and Bounds; `case-checker.md` (whole); `strength.md` R10, R31–R35; `bio-plane/src/strength/method.mjs` 1–20.
- `build/requirements/runtime-limits.md` (whole); `build/layers.md` (whole); `build/modules.json` (entries and users computed).
- `bio-plane/src/record-grammar/types.mjs` 15–25; `build/plan/archive/T32.md` rows A37, A41, B1, C2; `build/rulings.md` (searched: no ruling on calculation, spreadsheets or datasets).
- `bio-plane/package.json` (no runtime dependencies); `ocr-worker/package.json` (tesseract-wasm vendored).
- `journeys.html` on `origin/claude/gallant-brown-zg0wc1` (J6, §3, §6).
- Scratchpad `src/EXTRACTION-BREADTH-DESIGN.txt` 40–122; `src/OFFICE-FORMATS.txt` 95–139; `src/DECISIONS-archive-part2.txt` DEC-67 (1976–2014); `u41-area5-6.md` AREA 5.

**URLs:**
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/durable-objects/platform/limits/
- https://github.com/ironcalc/IronCalc
- https://hyperformula.handsontable.com/docs/
- https://npmjs.com/package/formulajs
- https://duckdb.org/2021/10/29/duckdb-wasm.html
- https://git.sheetjs.com/It/sheetjs
- https://www.ire.org/?p=44398
- https://themarkup.org/about
- https://gaoinnovations.gov/yellowbook/2024/audit-documentation-1.html
- https://www.gao.gov/products/gao-20-283g
- https://retractionwatch.com/2013/04/18/influential-reinhart-rogoff-economics-paper-suffers-database-error/
- https://arxiv.org/pdf/0801.3114.pdf
- https://genomebiology.biomedcentral.com/track/pdf/10.1186/s13059-016-1044-7
- https://exceljet.net/articles/floating-point-errors-in-excel
- https://help.libreoffice.org/latest/om/text/scalc/01/calculation_accuracy.html
- https://dev.socrata.com/docs/queries/group
- https://docs.ckan.org/en/ckan-2.1.5/datastore.html
- https://www.fairfaxcounty.gov/gisint1/rest/services/PLUS/PLUSGISRecords/FeatureServer/0/query?f=help
- https://docs.datasette.io/en/stable/sql_queries.html
- https://www.route-fifty.com/digital-government/2016/02/machine-readable-budget-in-a-human-friendly-format/299552/
- https://www.gfoa.org/fdta
- https://specs.frictionlessdata.io/fiscal-data-package/
- https://framework.frictionlessdata.io/docs/resources/table.html
- https://www.w3.org/TR/tabular-metadata/
- https://www.w3.org/TR/prov-o/
- https://www.iso.org/standard/88132.html (OpenFormula, ISO/IEC 26300-2)
- https://www.microsoft.com/en-us/research/?p=449646 (Vega-Lite)
- https://arxiv.org/abs/2410.09871
- https://arxiv.org/pdf/2303.09957
- https://ww2.amstat.org/meetings/proceedings/2019/data/assets/pdf/1199463.pdf
- https://rdrr.io/cran/PracTools/man/nAuditAttr.html