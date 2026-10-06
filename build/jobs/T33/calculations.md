# calculations (T33)

**Status** · session_01J7MbcN7jruhwCaMiQMNKVG · depth 2 · WAITING ON BOB (J2) · handled B3

## Completion

**State of the work.** B3 (K1573) applied: the ingest writer sends `method: "table_binding"`; tranche/T33 merged again. Built and green against injected providers for the layer-5 modules not yet merged (K1563 (1)); not yet COMPLETE. B2 (K1563) applied: tranche/T33 merged at `e07becea`; `bindingOf` answers `capture_sha`; `readTable` answers WORKBOOKS #1's `table` shape and `read` its `calculation` shape. **Next step:** after money (T33-33), duties (T33-35), people (T33-36), events (T33-26) and the T33 jobs of entities (T33-25: `entityByIdentifier`), standards (T33-31: `inForceAt`), progressions (T33-32: out-of-order findings) and retrieval (T33-40: `runSaved`) merge, merge tranche/T33 and re-point the providers in `bio-plane/test/m/calculations/fixture.mjs` at the real modules, re-run steps 5–7, then post COMPLETE.

**Entries applied (T33-41).** C:A-2 whole: tables over captured sources as canonical CSV keyed by sha256, roles, vintages and `tablesAt` (R1–R3); `CALC-` create, evaluate, accept, recompute and read, results by `calc-grammar.resultKey`, recomputed never on a read (R4–R8), grade facts per K1447 (ii) (R9), withheld whole (R10), `onInputChanged` and staleness from money's `onFactChanged` and superseded vintages (R11). C:B-1: totals over money facts refused by money's summation rule with the interfund flag (R12), no fact from a `CALC-` (R13), the ingest writer at a member's request from an adopted binding (R14; shape K1563 (6)). C:B-2: joins only through an id space or a declared crosswalk (R15). K1471: unit cost and budget against actuals per the profile's fiscal periods with bases stated (R16), rankings by one stated quantity, `SCORE_NOT_A_FACT` (R17). K1448: recorded draws and estimates with the exact interval (R18). `registerOccurrenceEvidence` (R19) and `registerRosterSource` (R20). Counts over the record through frozen sets (R21). K1491, Choices 17: the five shipped patterns (flow order, lateness per occurrence and per meeting's posting, about an office, across proceedings), run within a budget into their own table, gated at ≤ 20% (R22, R23). The ops map (R24); invariants R25–R29.

**Paths for `modules.json`.** `paths`: `bio-plane/src/calculations/`; `tests`: `bio-plane/test/m/calculations/`. Final `uses`: record-grammar, jurisdictions (added: `combine`, for fiscal periods, business days and id spaces, R16, R15, R28), calc-grammar, civil-time, id-spaces, record-core, membership, promotion (the tests' fixture creates documents and projects through it), provenance (`captureGrade`, R9), content, entities, events, standards, progressions (added: R22's flow-order pattern), money, duties, people, retrieval; `lines` dropped (nothing reads it). The layer-5 modules are reached through injected deps (`calculationsOf(host, deps)`, `joinUpstream`), never imported, per K1563 (1).

**Choices made (mine, P17).** No refusal has a catalogue row (T34 stamps T33's rows): each is `{ok: false, reason, detail}`. A table's source is a content id: a sheet range through `content.cellsAt`, else `content.passageText` read as CSV, else (a `document` extent) the capture's bytes from the evidence store; its header row is dropped when it repeats the declared header. Roles are `{column: {role, space? | scheme? | crosswalk?}}`; a crosswalk is a table with `crosswalk_from` and `crosswalk_to` columns. A binding maps money roles to columns or one `{value}` each (kind, phase, stage, basis, currency, period). Inputs are `{name, table | money | figure | value | calculation | set | draw}`; a typed `value` is unbound, graded D. Kinds: count, total, share, ratio, difference, comparison, span, unit_cost, budget_against_actuals, ranking, estimate; unit_cost and budget_against_actuals compose their recipe when none is given. `accept` is a member's act; recompute runs under the machine's view. `NO_SUCH_PROJECT` and `BAD_EVIDENCES` are answered after R4's ordered refusals. Draw and set keys are sha256s (no new prefix). Pattern results rest on cited rows, each re-checked for the reader (`DUT-`, `EVT-`, `MNY-` through their reads; `ENT-` ungated, K102).

**Deferred.** R1's "streamed": a table is built row by row (scanned, canonicalised and hashed as it is read, so the rows are never held twice) and its bytes put to the evidence store in one call, since `content` answers a source as one string. Measured at the bound (990,000 cells, 8.4 MB): declaring fits a 128 MB heap; evaluating needs about 70 MB of heap over the caller's baseline, because calc-grammar takes a table as row objects (reported to BOB, J2).

**Found in another module** (reported, J2). (1) `record-grammar`'s `ID_TABLE` holds `CALC` as sequential, so a `CALC-` id's counter tells a reader how many calculations were minted before, withheld ones included (R10, DEC-36's withheld-as-absent); the gated prefixes are minted opaque for that reason (record-core R3). (2) R1's 1,000,000-cell bound against a Worker's 128 MB heap, as above: a requirement question (lower the bound, or a streaming `evaluate` in calc-grammar).

**Runs** (from `bio-plane/`): `node --test test/m/calculations/`: tests 31, pass 31, fail 0 (tranche/T33 @ e07becea merged). Layer tests: none named in `build/manifest.md`. No service of another module changed.

**Checks** (process repository, with this module's row's paths filled in a local, uncommitted copy of `modules.json`): format: 126 modules, 125 requirements files; 0 failures. architecture: 11 product files, 39 relative imports; 0 failures. coverage: 29 of 29 live requirement ids named by a test; 0 failures. ownership: 12 files changed between tranche/T33 and HEAD; 0 failures.

Size (session_01J7MbcN7jruhwCaMiQMNKVG): test runs 24, module lines 2,218 (source) + 1,445 (tests)

## J1 · QUESTION

The money ingest writer (calculations R14 → money R1, R2, R4) needs one shape both jobs agree on, and neither requirement fixes it: what a machine-written money fact names as its `source` when that source is a row of a canonical table, and what its `by` is.

My best reading, which I am building to unless you answer otherwise:
- `source` is `{table: <the table's canonical sha256>, row: <0-based data row>, binding: <the adopted binding's key>}`, money's "a canonical table's row as a derived view of captured bytes"; money checks the binding is adopted through a read I provide, `calculations.bindingOf(key)` → `{adopted, table, roles}` or null (money R4: "only from a table binding a member adopted").
- `by` is `class:daemon` (DEC-52, the machine's stamp); the requesting member is recorded on my side, in the ingest row, with the binding and the rows asked for.
- The parties are `{entity, as_written}`, `entity` the `ENT-` id the row's payer/payee value resolved to through the role's id space (`entities.entityByIdentifier`) or its captured crosswalk.

If money's job has already settled another shape, tell me and I will follow it. Nothing else in my job waits on this answer.

## J2 · REPORT

B2 applied (tranche/T33 @ e07becea merged; bindingOf → {adopted, table, roles, capture_sha}; readTable's `table` and read's `calculation` in WORKBOOKS #1's shapes). The module is built and green against injected providers: 31/31 tests, R1–R29 each named; format, architecture, coverage 29/29, ownership: 0 failures (paths filled in a local copy of modules.json). Record: build/jobs/T33/calculations.md, "Completion" (paths, final uses, choices).

Not COMPLETE yet, by K1563 (1): my tests re-point at the real money (T33-33), duties (T33-35), people (T33-36), events (T33-26), and the T33 parts of entities (entityByIdentifier, T33-25), standards (inForceAt, T33-31), progressions (out-of-order findings, T33-32) and retrieval (runSaved, T33-40) after each merges. Send me a CHANGE when they are on tranche/T33 (or name the subset you want me to re-point against now).

Two findings, outside my module:
1. record-grammar: ID_TABLE holds CALC sequential, so a CALC- counter tells a reader how many calculations were minted before, withheld ones included (R10's withheld-as-absent, DEC-36); record-core mints its gated prefixes opaque for that reason. Proposal: CALC opaque, as EVT/MNY are.
2. Requirement question (calculations R1, Bob's bound via the draft): at the bound, 990,000 cells (8.4 MB), declaring now fits a 128 MB heap (built row by row), but evaluating needs about 70 MB of heap over the caller's baseline, because calc-grammar takes a table as row objects; with the plane's own heap that may not fit a Worker's 128 MB. Options: lower R1's cell bound (about 500,000 keeps evaluation near 35 MB), or a streaming evaluate in calc-grammar (its job). Until then, a table near the bound may fail to evaluate.
