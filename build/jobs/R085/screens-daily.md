# screens-daily (R085)

**Status** · session_01KMKGKQB8H39uXLhH43ccYQ · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**Entry R085-12 (screens-daily R35): applied.** Commit `a78cabfb4f` on `job/R085/screens-daily`.

**What changed.** Find's search (`finder.mjs`, `reads` and the `search` act) and the question's "Search here" (`answers.mjs`, `reads` and its `search` act, not reachable) now send the member's words both as words and as passages: `(work orders) OR (passage:work passage:orders)`, and `(pothole) OR (passage:pothole)` for one word. Each function is self-contained (interface-shell R21 (1)), so the same six-line helper is inlined in each. A query in the member's own syntax (a field, a quote, a leading `-`, `AND`/`OR`/`NOT`/`NEAR`) is sent as written. The search box keeps the words as typed; the `select` act's `q` is unchanged.

**Form check.** I compiled both forms with `query.mjs` `compile()` (not imported by a test, see below): no warnings, and the AST holds a `passage` arm for each term.

**Tests** (`test/m/screens-daily/`):
- `finder.test.mjs`: the R4 search test now expects the asked form (its words are the same); new R35 test, one word and two, the form pinned, a field sent as written, an empty search sends nothing.
- `answers.test.mjs`: "Search here" expects the asked form.
- `find-in.test.mjs` (R5 "See all in Find"): the search that follows the navigation is Find's own read, so its expectation moves to the asked form. find-in's own act is untouched.

**Deferred:** nothing.

**Not changed, by design:** Home's matching search (`home.mjs`, `door.front.matching`) and find-in's own `search` act are not in R35's scope; they send the words as before.

**Requirement marker:** R35 still reads "(not yet met: R085)" in `build/requirements/screens-daily.md`. I left the requirements file alone; BOB updates it.

**Found in another module:** `contract.test.mjs` "R1–R13 ... each screen's acts are exactly its registered acts" fails on `projects`: interface-shell's registry (`bio-plane/src/interface-shell/index.mjs:114`) offers `themeread` on `projects`, and screens-daily's `projects` screen does not draw it. The same failure is on the base commit and on `origin/tranche/R085`; it is not caused by R35. Needs BOB's ruling: either `projects` draws `themeread` (a screen decision, in my module) or the registry drops it (interface-shell's). I did not change either.

**Architecture note.** A test importing `query.mjs` fails `architecture.mjs` (query-language is not in screens-daily's `uses`), so I dropped that import; the test pins the exact form instead.

**Checks and tests (run from `/home/user/civicos-process`):**
- `node --test test/m/screens-daily/` (bio-plane): tests 109, pass 108, fail 1 (the `contract.test.mjs` failure above, pre-existing). `finder.test.mjs` and `answers.test.mjs` alone: tests 18, pass 18, fail 0.
- `node checks/format.mjs /home/user/bio`: 170 modules, 169 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio screens-daily`: 24 product files, 47 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio screens-daily`: 35 of 35 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio screens-daily tranche/R085`: 6 files changed by screens-daily between tranche/R085 and HEAD; 0 failures.

**No generated artifact of another module is stale** from this change (screens-daily's bundles are not in the manifest's list).

Size (session_01KMKGKQB8H39uXLhH43ccYQ): test runs 5, module lines 1802
