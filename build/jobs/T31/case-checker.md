# case-checker (T31)

**Status** · session_01DbmGw6aXDCHDt4jNqGVCsU · depth 2 · WORKING · handled B3

## J1 · REPORT

Progress, and one hazard in case-grammar for BOB to pass on.

Done on `job/T31/case-checker` (0d24e01e91): the program's header line and `spec.mjs` text name Civicsmith; the spec reads `/7` and `/6` as identical in fields and states the name by format (§4, §6); DEC-112's quote in `build-program.mjs:2` kept verbatim (K1365 (7)). R10 tests: (a) a whole `/6` case file built and packed on `main` @ d2b7451b80 (T31's opening point) kept as bytes (`case-file-6-before-T31.zip`) must recreate every finding with its complete edition equal; (b) a `/7` case file renders "Civicsmith" and compares equal, and the CivicOS words on it differ. Both red now, as expected: the `/6` render already moved with strength's L6 merge (its edition now differs from the pre-T31 bytes) until case-grammar passes the name by format. `program.mjs` is regenerated after I merge case-grammar.

Hazard (case-grammar R14, against its own last paragraph and my R10): R14 adds the light-only declaration (DEC-122 (2), `<meta name="color-scheme" content="light">`) to every complete edition, but also requires a `/6` edition rendered before T31 to re-render byte-identical. Both cannot hold for `/6` unless the declaration is rendered only for `/7` (or for any format other than `/6` and earlier). My reading: case-grammar renders the declaration for `/7` only, `/6` byte for byte as before. If case-grammar adds it to `/6` too, my R10 test (a) stays red and no pre-T31 case file recreates. Please confirm with case-grammar's job before its merge.

I wait for case-grammar's merge (your START), then merge the tranche, rebuild `program.mjs` and finish.

## J2 · REPORT

B3 done: merged `tranche/T31` (case-grammar at a59794cee4) and rebuilt `program.mjs` (sha256 1bc1a8283e…, 352,605 bytes). case-checker 29/29 green, both R10 tests included; case-import's tests 52/52 against it; format, architecture, coverage (19/19) and ownership 0 failures. Pushed as 6640302f0c on `job/T31/case-checker`.
My same-layer providers still to merge: public-read and ratification (its `/7` reading feeds R7). I post COMPLETE after your CHANGE carrying them: merge, rebuild `program.mjs` again (ratification's `checks.mjs` is bundled into it), re-run.
