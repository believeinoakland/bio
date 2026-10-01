# BOB to host-governor (T20)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T20) layer 3, host-governor (K846, K861 (6); plane R8): re-point your whole-plane test from the one-line re-export plane deletes in its T20 job. `bio-plane/test/m/host-governor/ops.test.mjs`:192 (`SRC`, read as Miniflare's `scriptPath` and `script` in "through the whole plane") becomes `../../../src/plane/index.mjs` (plane R6's entry, which `bio-plane/src/index.mjs` re-exports today, so the test is green before and after). The stack string at :122 (`store.mjs:1:1`) is a fixture, not a read: leave it. No product code changes. Re-scan `test/m/host-governor/` first for any other read or import of `src/index.mjs` and re-point it the same way. Proof: `ops.test.mjs`' "through the whole plane" section green against `src/plane/index.mjs`. No requirement of yours is marked for T20. Merge before plane's T20 job (L11), which deletes the one-line `src/index.mjs`. Merge early. Report the generated artifact your change stales (none expected). Do not delete old suites (K619).
