# connection-grammar (T33)

**Status** · session_01HtVdRtx6MjGMmTyLt1m2Ai · depth 2 · WORKING · handled B1

## J1 · QUESTION

My readings; I am building on them now. Only Q1 and Q2 change the interface others code against.

Q1 (how explore reaches an owner's read). `owners()` returns no `neighbours` function, so a caller cannot reach an owner's read through R4 alone. Reading: each registry also provides `neighbours({owner, node, kinds, at, page, viewer, scope})`. It refuses `VIEWER_MISSING` before it calls any owner, passes every argument to the owner unchanged, and checks what can be checked in the answer at the interface: R1 shape, the owner's own kinds within `kinds`, `node` at one end, no `out` item, at most `fanout` items, and a hub answered with no items. A non-conforming answer is refused whole as `OWNER_NONCONFORMING`, naming the check, and is never trimmed. This is a pass-through read, not a walker (R16).

Q2 (the item and fixture forms). (a) An `undetermined` item carries `undetermined: {why}`. (b) Owners' `neighbours` answer synchronously, as DO SQL does, so `ownerConformance` returns `{ok, failures}` directly; a thenable answer fails the battery ("must answer synchronously"). (c) A refusal is `{refused: CODE, why}`, as in civil-time. (d) The R9 fixture is `{node, at, kinds?, in, out, undetermined, viewers: {sees, blind}, fenced, expected, scope?, hunch?, hub?: {node, at}}`. Each id names one of the owner's connections at `node`. `expected` is the complete set of ids `sees` gets at `node`/`at` with `scope`. Pages are followed through `next`, joined, and compared with `expected`; for `blind` they must equal `expected` less `fenced`.

Q3 (R1 fields). Every key of the shape is present. `evidence` is a list of `{source}`, each `source` a non-empty string; an `evidentiary` kind needs at least one entry, and other classes may give `[]`. `derived` is `null` except on a `derived` kind, where it is `{method, inputs, as_of}`: `as_of` is R11's fifth field and has no other home in the shape. The declared and hunch labels go in a `label` field. A hunch's `grade` is `null`. `from` and `to` are R47 id cores of an `ID_TABLE` prefix, optionally followed by a bundle slug. `valid` is civil-time's validity value: `from` and `to` each `null`, a value string or `{event, edge, at?}`, with `precision` one of `day` `minute` `second` `edtf` and `zone` a non-empty string.

Q4 (R12–R14). `chainGrade` answers `{assertion, end}`. A path with a hunch hop answers `{assertion: null, end: null, why}`, because a hunch carries no grade (R18). An empty path is refused `PATH_EMPTY`. `chainLabel` answers `{label: 'lead', hops, basis_for_finding: false}` or `{label: 'evidenced'}`. For `orderPaths`, a path is an array of connections or `{hops, quantities}`, and `by` names a key of `quantities`; a path without that quantity orders after those that carry it. A path's earliest `valid.from` is the one its hops' froms all agree is earliest under `compare`. Otherwise it is undetermined and orders last. The input is first ordered by hop ids, so the result does not depend on input order.

Q5 (R17). The words also refused `WORD_FORBIDDEN`: "centrality" and "score", so that no word an owner registers can offer the measures R17 forbids. R3's five stay as listed.

Q6 (upstream not yet built). record-grammar's `ID_TABLE`/`idPattern` (T33-1) and civil-time's `validAt`/`compare` (T33-3) are not on any branch yet. My code imports them by their required names. Until they merge, I run my tests against local, uncommitted stand-ins written from their requirements. Before COMPLETE, or at a CHANGE after their merges, I merge `tranche/T33` and re-run on the real modules.
