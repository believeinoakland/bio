# signatures (T33)

**Status** · session_01Rj1YY4SJGHnLERzjPXfZoY · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

Two points on T33-7. Each has my best reading. I am carrying on with the job on both readings.

1. **`modules.json`: signatures' `uses` is still `[]`** on `tranche/T33` @ a5abf18fa6. The requirements (Uses), START and S0-13 all name the new edge to `record-grammar`. `checks/architecture.mjs` will fail on `sshsig.mjs` importing `record-grammar/index.mjs` until the row reads `"uses": ["record-grammar"]`. That file is yours. Best reading: you add the edge on the tranche, and I merge it before my checks.

2. **How the pattern is read from record-grammar.** R38 and R40 accept any `[A-Z]+` prefix, with the counter in record-grammar's sequential form. R46 and R47 give `ID_TABLE` and `idPattern(prefix)` but no prefix-free piece. The page (R42) needs a regex literal. Best reading: `sshsig.mjs` takes the first `sequential` entry of `ID_TABLE` and reads `idPattern(thatPrefix).source`. It requires that source to be `^<PREFIX>…$` and throws at load otherwise, so a test catches any drift. It swaps `^<PREFIX>` for `^[A-Z]+`, appends the optional slug, and exports the result as `OPAQUE_ID_RE`. `embed-signpage` writes that same regex into `sign-release.html`'s copy and then renders `SIGN_HTML`, so the page and the plane hold one derivation. This relies on `idPattern`'s source starting with `^` plus the literal prefix. If you would rather record-grammar export the counter's own source, tell RECORD-GRAMMAR #8 and I will read that instead.
