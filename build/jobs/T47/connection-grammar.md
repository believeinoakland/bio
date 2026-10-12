# connection-grammar (T47)

**Status** · session_01G4kGikmgsoaj9zsvzXXe1r · depth 2 · COMPLETE · handled B1

## Completion (CONNECTION-GRAMMAR #4)

**Entry applied** · T47-3 (N948): R21 met. `isRecordId(v)` (exported from `index.mjs`) already behaved as R21 states, as B1 expected, so no behaviour changed; only its doc comment now states R21. New test file `record-id.test.mjs` (4 tests, each naming R21) checks it at the interface against **every** `ID_TABLE` row, not a sample. Each prefix's own form, and its legacy form (CALC, ACD), is accepted alone and with slugs. The controls, each refused: a core outside its prefix's form (sequential 3 digits, opaque 15/17 characters, upper case, `_`, wrong year), an empty or malformed slug (`-`, `--`, upper case, `_`, space, non-ASCII), unknown and inherited-name prefixes (`__proto__`, `constructor`), other text (a newline, an annotation id), and non-strings (a boxed String, a Symbol, a BigInt, a hostile `toString`). A test also confirms that `checkConnection` (R1) accepts `from`/`to` exactly when `isRecordId` does.

**Read** · whole, myself: `build/requirements/connection-grammar.md`; the public parts of `record-grammar` and `civil-time`; layer 1's contract in `build/layers.md`; my entry in `build/plan/current.md`; all module code (`index`, `shape`, `registry`, `reads`, `bounds`, `walk`, `conformance`) and all tests (`shape`, `registry`, `invariants`, `neighbours`, `conformance`, `hub-by-kind`, `bounds-walk`, `fixtures/owner.mjs`) (P20).

**Flaws found in my module** · none that affect a requirement. **Deferred** · nothing. **Found in other modules** · nothing; no service changed, so no user's tests needed re-running (B1: steps, standards, hypotheses, law-relations, explore and contradiction need no change).

**Tests and checks**
- `node --test test/m/connection-grammar/`: tests 37, pass 37, fail 0.
- `checks/format.mjs`: 0 failures; `architecture.mjs … connection-grammar`: 0 failures; `coverage.mjs … connection-grammar`: 21 of 21 live ids named, 0 failures; `ownership.mjs … tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3058 files), channels 0; coverage 2 failures, neither mine (record-grammar R61 R62, jurisdictions R88: their T47 marks, rule 5.1).

Size (session_01G4kGikmgsoaj9zsvzXXe1r): test runs 1, module lines 692
