# calculations (T34)

**Status** · session_01Mw67tJ7nrb4VadYNLsCpUT · depth 2 · COMPLETE · handled B2

## Completion (CALCULATIONS #2, T34-27 and calculations' share of T34-78)

**Entries applied**
- **T34-27 (N619), R8.** A refused `accept` writes nothing: it recomputes through the private row recompute, not `recompute()`, and on any refusal (`CALC_RECOMPUTE_DIFFERS`, `MEMBER_ACT_ONLY`, `NO_SUCH_CALCULATION`) no recompute status, recompute record or acceptance is written. An agreeing accept writes the agreeing recompute (status `agrees`, its record) and the acceptance in one transaction.
- **T34-27 (N576), R30 and R31.** `gradeFactsOf({calcId, viewer})` → `{found: true, accepted, capture, inputs, method}`, the same grade facts `read` answers, or `{found: false}` alike for not held, withheld (R10) and no viewer; `calcStatusOf({calcId, viewer})` → `{held, visible, accepted}`. Both synchronous, write nothing, never throw (any argument). Not ops (R31; R30 states none).
- **T34-27 (N571), R1.** `TABLE_MAX_CELLS` is 1,000,000. A held table is now read row by row from its canonical text (`tables.mjs` `textTable`) and bound to calc-grammar as its streamed table (its R22), never as row objects; the text cache is bounded by characters (24 Mi), not by count. Measured: a 1,000,000-cell table declared and evaluated (sum, select and count, group, sort, evaluate) in a heap capped at 128 MB; heap held after declaring 30.1 MB, growth over it 4.0–4.6 MB per act.
- **T34-27 (K1734), R4.** A table result calc-grammar answers streamed is stored and answered as the same table of row objects (`rowObjects`), so the stored result does not depend on how the input was bound; tested against calc-grammar's row-object answer for select, group and sort.
- **T34-27 (K1732), R4.** The `CALC-` id is minted opaque by record-core from `ID_TABLE`; the test now expects the opaque form, and a sequential `CALC-2026-0001` row is still read, taken as an input, graded and accepted.
- **T34-27 (N596), R9.** Each input `read` answers (`calculation.inputs[]`) states `sha`, the SHA-256 of its canonical bytes as computed over: a table's canonical CSV; for a figure, typed value, money facts, frozen set, draw and threshold the canonical JSON the calculation's hash was already taken over (so result keys are unchanged); for another calculation the canonical JSON its own result key is the SHA-256 of. The hashes are recorded at `create` (new column `calculations.input_shas_json`, added by the migration to an existing table), and `calc-grammar.resultKey(recipe, {name: sha})` equals the stored `result_key`. A threshold appears as one more entry, `kind: "threshold"`. A calculation created before T34 answers `sha` null for a non-table input (nothing was recorded).
- **T34-78 (DEC-149).** `index.mjs`'s one member-facing string: `NO_EVIDENCE_STORE`'s why now says "your group's Civicsmith has no evidence store bound…"; a test names it. No other string in the module names the Civicsmith (the control plane's stamp named to a caller without one stays, as the entry says).
- **B2 (CHANGE, K1788).** The R19 test matches the evidence answers by id, not place. The code also now answers them, and the R11 staling, in creation order (`created_at, rowid`), not `calc_id` order, which opaque ids made random.

**Readings (BOB's, reported):** R9's bytes are also put in the evidence store under their SHA-256 at `create` (a table's already were), so publication (its R22) can commit them; a failed put refuses `EVIDENCE_WRITE_FAILED` with nothing written; with no evidence store bound nothing is put. The value input's grade facts now carry `ref` (the typed text), so R30's "each input's name, kind, reference" holds for every kind.

**Deferred:** none in this module. `readTable` still answers the whole table as row objects in `table.rows` (workbooks' shape, K1563 (6)); over a 1,000,000-cell table that read alone is heavy. Changing the shape is a requirement change touching workbooks; left as is.

**Found in other modules**
- `consequences` `computed.test.mjs:176` (R2) turns red with this merge: it asserts `alice.out_of_view === true` once calculations has `gradeFactsOf`, but alice created the calculation, so R10 (and R30) admit her and consequences rightly shows the operand. The test's expectation is inverted; it is green on `tranche/T34` only because `gradeFactsOf` was absent. Clears with T34-49 (consequences, L9).
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (calculations' source), regenerated at the layer's close.

**Tests and checks**
- calculations: `node --test bio-plane/test/m/calculations/*.test.mjs` → pass 38, fail 0 (six consecutive runs; the R19 test five more alone).
- users of calculations, on this branch: workbooks 25/1, strength 138/0, answers 30/1, reevaluation 135/0, case-authoring 137/0, consequences 37/1, affordances 192/0, op-declarations 68/1, plane (with `migrate-released`) 111/0. The reds: workbooks R15 (K1732), answers R1 copy test (K1764), op-declarations t33 R19/R6 (K1764), each red on `tranche/T34` too; consequences R2 above, the only new one.
- `node checks/format.mjs .` → 0 failures; `architecture.mjs . calculations` → 0 failures; `coverage.mjs . calculations` → 31 of 31 live ids named, 0 failures; `ownership.mjs . calculations tranche/T34` → 0 failures.

Size (session_01Mw67tJ7nrb4VadYNLsCpUT): test runs 31, module lines 2411

## J1 · COMPLETE

T34-27 and calculations' share of T34-78 applied; B2 done (R19 test matched by id; code answers in creation order). calculations 38/0; format, architecture, coverage 31/31, ownership 8 files: 0 failures. New red from this merge: consequences computed.test.mjs:176 (R2) — its test expects alice out_of_view once gradeFactsOf exists, but alice created the calculation, so R30 admits her; inverted expectation, clears with T34-49. Stale: the plane bundle. Readings to note: R9 input bytes are also put in the evidence store at create (for publication R22); new column calculations.input_shas_json via migration. Details in my record.
