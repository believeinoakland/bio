ANALYSIS study, phase 2. The study file was not written: the Write tool refused it ("Subagents should return findings as text, not write report files"), and I did not get around that refusal through Bash. The full study is below. Please save it as `studies/ANALYSIS.md` in the study folder. My working notes are in `studies/ANALYSIS.md.work` in the scratchpad: every step, the read ranges, the primary sources and the URLs.

## Summary
1. The construct needs one record object with two engines. A **code-level recipe** uses a closed, versioned grammar (filter, count, sum, share, date span, threshold test) over typed tables made from captured CSV, XLSX or portal data. A **spreadsheet-level workbook** is the member's own file, brought into the record. Both are a `calculation` (`CALC-`) that a finding's leg, a consequence part or another calculation can cite.
2. How a spreadsheet becomes part of the record, in 10 steps:
   - capture the inputs and declare typed tables;
   - the member works in any spreadsheet program, then uploads the file;
   - every input range is checked cell for cell against the captured source (bound) or listed as typed by the member;
   - a pinned open engine (IronCalc, MIT/Apache) recomputes every formula and names any difference from the saved values;
   - code lint looks for known failures, such as the Reinhart–Rogoff short range;
   - the member writes a method note, and a second member's check is shown either way;
   - the workbook travels whole in the case, so a stranger can re-check it in their own spreadsheet program or with the checker.
3. The two engines connect both ways. A recipe exports as a formula workbook, and a workbook's named output is an operand that recipes and legs can cite.
4. What is built: only one narrow form of arithmetic (L1). `consequences` R2 does five operations over cited figures, in layer 9, after a noncompliant determination, with no screen (0 UI calls). It cannot read a percent sign. A figure must appear verbatim in the passage, and `count` counts the operands given.
5. What a member can use today: L0, which is citing a passage or a sheet range. I checked the code: `content.passageText` returns null for a single-cell citation (`content/notice.mjs`, `heldTextAt`). A cited cell is a pointer whose value the record cannot read back, so consequences' "natural operand" does not work for a single cell.
6. Core needs that are blocked:
   - journey 6's "is the 90% claim true?";
   - threshold tests (61.8% against two-thirds);
   - counts over a dataset;
   - recomputing a case's numbers outside the product (DEC-112).
7. Also blocked: the founding sewer-fund case past hand transcription. There is no budget or financial-report reader, and PDF table recognition was measured NO-GO (M-55).
8. Proposed modules:
   - `calc-grammar`: layer 1, pure. It takes over `figures.mjs` and is also used by `case-checker`.
   - `calculations`: end of layer 5. It holds tables, CALC objects, bindings, lint and grade facts.
   - `sheet-worker`: layer 1, a standalone Worker like `ocr-worker`, needed from stage 2.
   - No existing module moves. `consequences` keeps breach harm and reuses the grammar. This settles the brief's layer-order point for calculation.
9. Grading needs no new scale. A result takes the capture axis from its input documents and the caps on how each input was extracted. Unbound inputs count as testimony (D). The method is recomputed and disclosed, not graded (DEC-21, DEC-82, D70, D92).
10. Runtime: the plane's Durable Object allows 128 MB, 30 s to 5 min of CPU, 2 MB per row and 100 bound parameters. Tables are therefore stored as bytes in the evidence store, and a stated bound sends oversized inputs to the workbook route. The engine runs on the instance's own account, with no vendor key and no cloud spreadsheet (DEC-67, D201).
11. The AI proposes recipes, table types and workbook checks, all labelled and stored apart. It never computes a number into the record; only the evaluator does. That waits for a deployed investigate or plan mode.
12. Stages:
   - **Stage 1, L2.** Unlocks journey 6, one-year budget against actuals from XLSX, the bond-measure two-thirds test, and the dataset front door. Two new modules, about 55 requirements.
   - Measure before stage 1: how many real calculations the grammar can express, a dataset census, the Durable Object's CPU and memory at the bound, and exactness against a decimal reference.
   - **Stage 2, workbooks.** Measure first which functions the 288 corpus workbooks use and how often IronCalc agrees with their saved values.
   - **Stage 3, budgets over years and charts.** Budget and financial-report readers, fund joins, portal snapshots, Vega-Lite charts. This also clears progressions R32 (T32 A37).
   - **Stage 4, the assistant.**
13. Bob decides 11 points, in §8. Some of these are not yet ruled by anyone:
   - whether a leg may rest on a calculation (D-181 says information or inquiry only);
   - whether a second member's check is disclosed or required (D370 says a group may be one person);
   - whether a group may estimate a total from a spot-check sample;
   - person-level data;
   - the "Work it out" step in the interface.
14. External research is cited in the study: GAGAS and GAO data reliability, ProPublica and The Markup practice, the spreadsheet-error research (Panko, Ziemann), the Socrata, CKAN and ArcGIS APIs, FDTA status (Phase 1 final 8 June 2026), Frictionless/CSVW/PROV-O/OpenFormula, and the IronCalc and HyperFormula licences (HyperFormula is GPLv3 or paid, so I rejected it).

---

