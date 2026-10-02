# record-core (T23)

**Status** · session_01SBgoW9ZuHi7sweUzgkmrmk · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (START B1; tests only, no module code changed; head `f51a8c8bf9`)
- (1) **N484, R37.** Two tests named R37 in `bio-plane/test/m/record-core/record-core.test.mjs` (section "T23 layer 2"). The first commits two bundles through `commit` (three commits on one: its title changed then given none, a blob file, two manifest entries tied on `created` whose snap keys sort against write order; one commit on the other naming no state, title or times) and reads them with corpus-export's own four queries as `exportManifest` states them (`bundles` :74–75, `files` :80, `manifest` with `ORDER BY created, rowid` :93, `history` :95). `bundles`' `title` (the last commit's, NULL when it gave none; R34's) and `bundle_sha` (R41's `bundleSha`, the digest of the last commit's `bundle.md`) are checked first, then every column of every row of the four reads against an expectation derived only from the calls given to `commit` and its answers. The second is the negative control: each of the 24 read columns (and `files.content` behind `inline`) is set wrong, one at a time inside a savepoint, and the read is shown to differ, then to agree again once rolled back; and the manifest re-recorded out of write order (the `rowid` tie-break) is caught. Every column holds what R37 states: no QUESTION. R37's `*(not yet met: T23 …)*` mark is BOB's to strike at the merge. `refs`, which the export also reads, is connections' (R31) and not tested here.
- (2) **N497.** The tests no longer name the retired `legacy-store` as a live module: `registerStatsSource` at :1827, :1851, :1902, :1905–:1907, :1911, :1977 now registers `"plane"` (`plane/stats.mjs`:17, :41); the case tables at :1933–:1934 are declared by `"publication"` (`publication/schema.mjs`:574–583, `index.mjs`:2647), its comment re-worded; the comment at :1918–:1920 names the seeds the boot now reads (plane's `MINT_LEDGER_LIVE`, ratification's and publication's R70 seeds). No assertion changed meaning; one was kept as strong as before: :1906's detail check (`includes("plane")` alone would also pass if the detail named the refused `control-plane`) now also asserts it does not name `control-plane`.

**Deferred**: none.

**Found in other modules**: none. No generated artifact staled (tests only); regenerated nothing.

**Tests and checks**
- `node --test bio-plane/test/m/record-core/`: tests 94, pass 94, fail 0.
- `node --test bio-plane/test/stats-disclosure.test.mjs`: tests 1, pass 1, fail 0.
- Whole `bio-plane/test/m`: tests 5020, pass 5004, fail 4, cancelled 0, skipped 0, todo 12. The four are accepted by name: red 2 (`membership/module-order.test.mjs`:12, `membership/t9-notice-sight-bounds.test.mjs`:185, `promotion/registry.test.mjs`:58) and red 9 (`control-plane/inbox-door.test.mjs`:81). No other red.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures. `architecture.mjs … record-core`: 6 product files, 11 relative imports; 0 failures. `coverage.mjs … record-core`: 74 of 74 live requirement ids named by a test; 0 failures. `ownership.mjs … record-core tranche/T23`: 2 files changed; 0 failures.

Size (session_01SBgoW9ZuHi7sweUzgkmrmk): test runs 7, module lines 1686
