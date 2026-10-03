# public-read (T31)

**Status** · session_016SfTxv2owbWsyKBSjqM3an · depth 2 · WORKING · handled B1

## Completion

**Entries applied** · L8, N534: R25 (`op=docketpublic&case=<case>&captures=omit`).
- Store side (`src/public-read/index.mjs`): `docketPublic(caseId, captures)` hands `docket.docketPublic` `{case, captures: "omit"}` only when `captures` is exactly `"omit"`; any other value, or none, hands `{case}` alone (no `captures` key). `publicReadOps.docketpublic` passes the query's `captures`.
- Door (`src/public-read/door.mjs`): `publicReadDoorDocket` forwards `captures=omit` to the store for `docketpublic` only, and only when it is exactly `omit`; otherwise `case` alone, as R21 (R10's terms unchanged: no header, no other parameter). `docketfeed` forwards no `captures`.
- Tests (`test/m/public-read/docket.test.mjs`, three `R25` arms; K1369's real test): the docket is handed exactly `{case, captures: "omit"}` at the store op and through the door, and the answer is the docket's own (`captures: {}`, `captures_omitted: true`); thirteen other values and none hand `{case}` alone and answer the captures' bytes; an absent case is `NOT_PUBLISHED` with `publishedcase`'s bytes, no case is the argument refusal (store never asked), the store's refusal and silence relayed, the feed unchanged and not handed `captures`, nothing written. The fixture's docket (`fixture.mjs` `docketOn`) now answers `docket` R24's form (`captures` by hash for listed entries with a capture; `{}` and `captures_omitted: true` for `"omit"`) and records each argument whole (`publicAsked`). Negative control: with the code change stashed, the first R25 arm fails.

**Deferred** · none. No real-docket arm for R25 (`docket-real.test.mjs`): the real `docket.docketPublic` takes `captures` only once `docket`'s T31 job (its R24) merges, which is before this one in `modules.json` order; the arm over the fixture holds the interface `docket` R24 states. A real-docket arm can be added in this module's next job.

**Found in other modules** · none.

**Tests and checks**
- `node --test bio-plane/test/m/public-read/`: tests 108, pass 108, fail 0.
- Layer tests: none named in `build/manifest.md`. No provided service changed in meaning (the store op's `docketPublic` gained an optional argument), so no user module's tests to run.
- `format`: 98 modules, 97 requirements files; 0 failures. `architecture public-read`: 34 product files, 108 relative imports; 0 failures. `coverage public-read`: 25 of 25 live requirement ids named by a test; 0 failures. `ownership public-read tranche/T31` (after commit): 5 files changed; 0 failures.

Size (session_016SfTxv2owbWsyKBSjqM3an): test runs 4, module lines 2896
