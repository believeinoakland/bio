# connections (T18)

**Status** · session_01JLEr53cMreJB9heGcirz1s · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

The linkproject move (legacy-index map §4.4, your B1) edits bio-plane/src/index.mjs, which is legacy-index's path. connections' from in build/modules.json (on tranche/T18 too) is [legacy-store, legacy-checks], so ownership would fail that file as outside my paths. Extraction carried legacy-index in its from for its pdfstructure move. Best reading, which I am building on: you add legacy-index to connections' from in modules.json (tranche/T18), and I merge the tranche before my ownership check. Everything else goes on meanwhile.

## J2 · COMPLETE

**Entries applied** (layer 5, connections; `current.md` connections bullet, B1, B2/K667):
- **✱ C-74.** `CONNECTION_CHOICE_CHECKS` (C-74.1–.4) moved into `src/connections/checks.mjs`, rows, codes, `where`s and translations unchanged; the catalogue's copy deleted (52 lines with its header). `index.mjs` imports it from there and still re-exports it. No other product importer. R35 met for C-74 (a new test in `read.test.mjs`: the module's own table, every refusal carries its row, and the catalogue no longer exports it).
- **N242's share:** the DEC-49 guard, run on this branch, prints no `THEME_CHECKS` duplicate of C-81.11–.14 and no failure naming connections, so nothing is left to take ("if printed").
- **`linkproject` (legacy-index map §4.4, K649 (7)):** the handler left `src/index.mjs` for `src/connections/ops.mjs` (`CONNECTIONS_OPS`, `connectionsOp`, `linkProjectOp`). The viewer and identity stamps are handed in by the same expressions as before and stay the control plane's. `src/index.mjs`: 4 lines added (the import and the dispatch line), 28 removed. Tested under R24, R26 and R27 (`converts-links.test.mjs`), both with a stub store and end to end over `connectionsOps`. The `author` stamp is not handed: `projectlinks` never read one (its Session Log names the identity).
- **Converts** (connections' shares, at the interface, requirement-named). Every behavioural assertion of connections' share is carried or already proved; the other owners' shares are listed below.
  - `converts-derivation.test.mjs` (d241-derivation-stated, connection-derive-sweep): 5 tests.
  - `converts-position.test.mjs` (reading-position, reading-position-occurrences): 7 tests.
  - `converts-reads.test.mjs` (content-reads, d280-strengthbar, d216-sharing.probe): 5 tests.
  - `converts-links.test.mjs` (subresources' linkproject arms, and the moved op): 12 tests.
  - Old suites are not deleted (K619). `test/reading-position-occurrences.test.mjs` imports the catalogue's `CONNECTION_CHOICE_CHECKS` and stays unrun (K653).
- **Own flaw fixed (found by the subresources convert):** R28's `references[]` entry for a `links_to` edge carried only rel, target, status and note. C-6.1's `links_to` arm refused the source document for lacking `asserted_by: source`, the address and a contemporaneity verdict, and R24 says the edge is asserted by the source. The entry now carries all three: the verdict is the link's own when it is contemporaneous, superseded or undetermined, and otherwise undetermined. `edges.test.mjs`' R28 pin is updated to the full entry. A stale comment in `portionAxes` (said a `document` row was not answered; R52 and the code answer it) is corrected.

**Rows `awaiting stamp` (T19):** C-74.1–.4 moved to `src/connections/checks.mjs` (rows and `where`s unchanged).

**Deferred:** nothing of this module.

**Found for other modules / BOB (REPORT):**
1. Stale generated artifacts (§14): the plane bundle (`bio-checks.mjs`, `src/index.mjs`, `src/connections/` changed) and the agent-worker bundle (it takes `bio-checks.mjs`). I rebuilt neither.
2. `civicos-ui/test/onpoint-choice.test.mjs` (legacy-tests, L11) imports `CONNECTION_CHOICE_CHECKS` from the catalogue. It is broken by the ✱ deletion and stays unrun (K653); its re-point is to `bio-plane/src/connections/index.mjs`. The DEC-49 guard (release only) harvests `*_CHECKS` from the catalogue, so C-74 now reads unregistered there; control-plane's `CHECK_FAMILIES` should list `src/connections/checks.mjs` (its L11 entry already names connections' table).
3. The store wraps every answer as `{ok: true, result}`, so R27's refusals (`NO_SUCH_BUNDLE`, `PROJECT_ACT_NOT_A_PARTICIPANT`) reach an `op=linkproject` caller as `{ok: false, reason}` at HTTP 200, not as a relayed refusal. This is behaviour as it was before the move, and it is the store dispatcher's envelope (control-plane).
4. `bio-plane/src/gate.mjs`:147 mentions `CONNECTION_CHOICE_CHECKS` in a comment only (no import).

**Tests and checks:**
- `node --test test/m/connections/`: tests 96, pass 96, fail 0 (8 repeat runs, 0 failed).
- `node --test "test/m/**/*.test.mjs"` whole: tests 3581, pass 3558, fail 1, todo 22. The one failure is control-plane's R36 (`doorbell.test.mjs`, capture R65), known and not from this job.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture connections`: 18 product files, 62 relative imports; 0 failures.
- `coverage connections`: 59 of 59 live requirement ids named by a test; 0 failures.
- `ownership connections tranche/T18`: 12 files changed; legacy-store 0 added, 0 removed; legacy-checks 0 added, 52 removed; legacy-index 4 added, 28 removed; 0 failures.

Size (session_01JLEr53cMreJB9heGcirz1s): test runs 37, module lines 2338
