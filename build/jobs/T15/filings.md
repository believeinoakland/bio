# filings (T15)

**Status** · session_01X781cDNM8B9Gk9XTmbmYhE · depth 2 · WORKING · handled B0

## Completion

**Entries applied.** N355 (plan layer 9): the no-promotion fallback in the constructor (`src/filings/index.mjs`:136–138 at the tranche) is gone. `producingGroup` is now the handed-in reader or `null`; `#group` asks promotion's `fact("producingGroup")` itself, and when no promotion module is reachable (no host, none given) answers the `group` blank unfilled with "no promotion module is reachable here to answer the fact producingGroup, so the producing group is undetermined" (R3: undetermined, never unrecorded). Filings no longer spells `FACT_UNAVAILABLE` anywhere; its one remaining `FACT_*` literal is `#group`'s read of promotion's `FACT_FAILED` answer (worded, not minted). Behaviour at the interface is unchanged for every other case (a registered provider, one answering null, promotion's `FACT_UNAVAILABLE`/`FACT_FAILED`, a handed-in reader).

**`not yet met` marks my work meets** (K460): none; no requirement text changed.

**Rows.** No check row added, moved or retired; nothing for promotion to stamp.

**Deferred.** None.

**Found in other modules (REPORT J1).**
1. legacy-tests (`civicos-ui/check-refusal-codes.mjs`, K458): arm G's `MULTI_SITE_CLOSED` entry for `FACT_UNAVAILABLE` (:3830, "filings' second literal is its constructor's fallback…") is now stale: the guard prints `FAIL: arm G: FACT_UNAVAILABLE is declared in MULTI_SITE_CLOSED but is not multi-site on this tree`. This is the retirement N355 set up; the entry goes, and arm G's multi-site count falls by one (the ceiling 54 moves with it). Measured: the guard's failures on `tranche/T15` @ e44efa6b95 are 22; with this change 23, the one extra being this line. No other guard line moved.
2. Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) inlines filings (its line ~90988 holds the removed fallback); BOB regenerates at the layer close. Not rebuilt.
3. `civicos-ui/` and affordances' lists: no hit for anything this change adds or retires, other than (1). `civicos-ui/test/reopened-finding.test.mjs` and `declared-flow-surface.test.mjs` mention `producingGroup`/`FACT_UNAVAILABLE` of promotion and setup, not filings'.

**Tests and checks.**
- `node --test bio-plane/test/m/filings/`: 35 pass, 0 fail, 0 todo. R3's test gains the no-promotion arm (N355); negative control: against the tranche's source that arm fails (`prepare.test.mjs` 8/1), with this change it passes.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs bio filings`: 11 product files, 41 relative imports; 0 failures. `coverage.mjs bio filings`: 21 of 21 live requirement ids named by a test; 0 failures. `ownership.mjs bio filings tranche/T15`: 0 failures.
- `civicos-ui/check-refusal-codes.mjs` (legacy-tests', read only): 22 failures at base, 23 with this change (item 1 above).

Size (session_01X781cDNM8B9Gk9XTmbmYhE): test runs 4, module lines 2733
