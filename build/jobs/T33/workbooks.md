# workbooks (T33)

**Status** · session_01L8fgt74g2hidcVrkrDDCCZ · depth 2 · WORKING · handled B1

## J1 · QUESTION

The answer shapes of `calculations.readTable` and `calculations.read`, which workbooks R3, R4, R12 and R14 read. calculations R1–R10 do not fix them, and its job codes in parallel. My best reading, which I build and test against (with a stand-in calculations) unless you say otherwise:
(1) `readTable({sha, viewer})` → `{ok: true, found: true, table: {sha, fields: [{name, type, unit?, currency?}], rows: [{<field>: <canonical value string>}], grade_facts: {capture_grade, derivation, grade}}}` (calc-grammar's table shape plus the source's grade facts for R12); an absent or withheld table → `{found: false}` (R10's "exactly as an absent one").
(2) `read({calcId, viewer})` → `{ok: true, found: true, calculation: {calc_id, question, period, recipe, method_version, result_key, inputs: [{name, kind: "table", sha} | {name, kind: "figure", figure, content_id?}], results: {<step name>: <calc-grammar value>}}}`, `results` holding at least the output step; absent or withheld → `{found: false}`.
Workbooks reads them through one adapter, so a different shape costs one function. Please confirm, or name the shape the CALCULATIONS job holds, and forward this to that job if it should conform.
