# connection-grammar (T33)

**Status** · session_01HtVdRtx6MjGMmTyLt1m2Ai · depth 2 · WORKING · handled B2

## Completion

**Entries applied.** T33-5 (B1a.1) in full: the connection shape and `checkConnection` (R1), the owner registry with the members' words (R2–R5, option (ii)), the `neighbours` contract (R6–R8), the registry's pass-through `neighbours` (R19, K1513), the exported battery `ownerConformance` (R9), `BOUNDS` and `depthOf` (R10), `derivedId` (R11), the walk semantics `chainGrade`, `chainLabel`, `orderPaths` and `exhausted` (R12–R15), and the invariants (R16–R18). All of it follows J1's readings as answered in B2 (K1513).

**Paths.** Code: `bio-plane/src/connection-grammar/` (7 files: `index.mjs`, `shape.mjs`, `registry.mjs`, `reads.mjs`, `bounds.mjs`, `walk.mjs`, `conformance.mjs`). Tests: `bio-plane/test/m/connection-grammar/` (5 test files and `fixtures/owner.mjs`, a sample owner with one switch per broken rule). **Final `uses`:** record-grammar, civil-time (unchanged).

**Interfaces relied on, not yet built upstream.** record-grammar `idPattern` (R47, T33-1), with `BASIS_GRADES`, `canonicalJson` and `sha256HexSync`. civil-time `validAt({valid, basis}, date)` (R22–R23) and `compare(a, b)` (R5), which answer `'before'`, `'after'` or an undetermined object (T33-3). The read's `at` goes to `validAt` unchanged as its date. Until T33-1 and T33-3 merge, the tests ran against local stand-ins written from those requirements, never committed (J1 Q6). After their merges, the job merges `tranche/T33` and re-runs steps 5–7 on the real modules at BOB's CHANGE.

**Beyond R19's list.** The pass-through also refuses an `out` item, an undetermined item left unmarked, and a hunch returned outside its scope. Those are the R6 and R8 rules a caller can check, judged by the same code as the battery. A throwing owner is refused `OWNER_FAILED`, and an unregistered one `OWNER_UNKNOWN`.

**Deferred.** None.

**Found in other modules.** None.

**Tests and checks run** (after merging `tranche/T33` with K1513's R19):
- `node --test test/m/connection-grammar/` (from `bio-plane/`): tests 26, pass 26, fail 0. The battery was also run over each broken sample owner (out, unmarked, sight, viewer, scope, paging, fanout, hub, partial hub, kinds, foreign kind, nodeless, derived id, label, nondeterministic, async, throws). Each fails with its check named.
- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … connection-grammar`: 14 product files, 32 relative imports (3 naming no tracked file, not judged: the civil-time import, until T33-3 merges); 0 failures.
- `node checks/coverage.mjs … connection-grammar`: 19 of 19 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … connection-grammar tranche/T33`: 15 files; 0 failures.
- The architecture, coverage and ownership checks ran with my paths written into `modules.json` locally, uncommitted (BOB writes them at the merge).

Size (session_01HtVdRtx6MjGMmTyLt1m2Ai): test runs 6, module lines 606

## J1 · QUESTION

My readings; I am building on them now. Only Q1 and Q2 change the interface others code against.

Q1 (how explore reaches an owner's read). `owners()` returns no `neighbours` function, so a caller cannot reach an owner's read through R4 alone. Reading: each registry also provides `neighbours({owner, node, kinds, at, page, viewer, scope})`. It refuses `VIEWER_MISSING` before it calls any owner, passes every argument to the owner unchanged, and checks what can be checked in the answer at the interface: R1 shape, the owner's own kinds within `kinds`, `node` at one end, no `out` item, at most `fanout` items, and a hub answered with no items. A non-conforming answer is refused whole as `OWNER_NONCONFORMING`, naming the check, and is never trimmed. This is a pass-through read, not a walker (R16).

Q2 (the item and fixture forms). (a) An `undetermined` item carries `undetermined: {why}`. (b) Owners' `neighbours` answer synchronously, as DO SQL does, so `ownerConformance` returns `{ok, failures}` directly; a thenable answer fails the battery ("must answer synchronously"). (c) A refusal is `{refused: CODE, why}`, as in civil-time. (d) The R9 fixture is `{node, at, kinds?, in, out, undetermined, viewers: {sees, blind}, fenced, expected, scope?, hunch?, hub?: {node, at}}`. Each id names one of the owner's connections at `node`. `expected` is the complete set of ids `sees` gets at `node`/`at` with `scope`. Pages are followed through `next`, joined, and compared with `expected`; for `blind` they must equal `expected` less `fenced`.

Q3 (R1 fields). Every key of the shape is present. `evidence` is a list of `{source}`, each `source` a non-empty string; an `evidentiary` kind needs at least one entry, and other classes may give `[]`. `derived` is `null` except on a `derived` kind, where it is `{method, inputs, as_of}`: `as_of` is R11's fifth field and has no other home in the shape. The declared and hunch labels go in a `label` field. A hunch's `grade` is `null`. `from` and `to` are R47 id cores of an `ID_TABLE` prefix, optionally followed by a bundle slug. `valid` is civil-time's validity value: `from` and `to` each `null`, a value string or `{event, edge, at?}`, with `precision` one of `day` `minute` `second` `edtf` and `zone` a non-empty string.

Q4 (R12–R14). `chainGrade` answers `{assertion, end}`. A path with a hunch hop answers `{assertion: null, end: null, why}`, because a hunch carries no grade (R18). An empty path is refused `PATH_EMPTY`. `chainLabel` answers `{label: 'lead', hops, basis_for_finding: false}` or `{label: 'evidenced'}`. For `orderPaths`, a path is an array of connections or `{hops, quantities}`, and `by` names a key of `quantities`; a path without that quantity orders after those that carry it. A path's earliest `valid.from` is the one its hops' froms all agree is earliest under `compare`. Otherwise it is undetermined and orders last. The input is first ordered by hop ids, so the result does not depend on input order.

Q5 (R17). The words also refused `WORD_FORBIDDEN`: "centrality" and "score", so that no word an owner registers can offer the measures R17 forbids. R3's five stay as listed.

Q6 (upstream not yet built). record-grammar's `ID_TABLE`/`idPattern` (T33-1) and civil-time's `validAt`/`compare` (T33-3) are not on any branch yet. My code imports them by their required names. Until they merge, I run my tests against local, uncommitted stand-ins written from their requirements. Before COMPLETE, or at a CHANGE after their merges, I merge `tranche/T33` and re-run on the real modules.

## J2 · COMPLETE

T33-5 done: R1–R19, per J1 as answered (K1513). Code: bio-plane/src/connection-grammar/. Tests: bio-plane/test/m/connection-grammar/. Final uses: record-grammar, civil-time. 26/26 tests pass; format, architecture, coverage (19/19) and ownership (15 files) report 0 failures, after merging tranche/T33. One caveat: record-grammar's idPattern (T33-1) and civil-time's validAt and compare (T33-3) are not merged yet, so the tests ran against local, uncommitted stand-ins written from their requirements (J1 Q6). After both merge, send a CHANGE and I will merge tranche/T33 and re-run steps 5–7 on the real modules. Details are in the record's Completion section.
