# case-checker (T31)

**Status** · session_01DbmGw6aXDCHDt4jNqGVCsU · depth 2 · COMPLETE · handled B4

## J1 · REPORT

Progress, and one hazard in case-grammar for BOB to pass on.

Done on `job/T31/case-checker` (0d24e01e91): the program's header line and `spec.mjs` text name Civicsmith; the spec reads `/7` and `/6` as identical in fields and states the name by format (§4, §6); DEC-112's quote in `build-program.mjs:2` kept verbatim (K1365 (7)). R10 tests: (a) a whole `/6` case file built and packed on `main` @ d2b7451b80 (T31's opening point) kept as bytes (`case-file-6-before-T31.zip`) must recreate every finding with its complete edition equal; (b) a `/7` case file renders "Civicsmith" and compares equal, and the CivicOS words on it differ. Both red now, as expected: the `/6` render already moved with strength's L6 merge (its edition now differs from the pre-T31 bytes) until case-grammar passes the name by format. `program.mjs` is regenerated after I merge case-grammar.

Hazard (case-grammar R14, against its own last paragraph and my R10): R14 adds the light-only declaration (DEC-122 (2), `<meta name="color-scheme" content="light">`) to every complete edition, but also requires a `/6` edition rendered before T31 to re-render byte-identical. Both cannot hold for `/6` unless the declaration is rendered only for `/7` (or for any format other than `/6` and earlier). My reading: case-grammar renders the declaration for `/7` only, `/6` byte for byte as before. If case-grammar adds it to `/6` too, my R10 test (a) stays red and no pre-T31 case file recreates. Please confirm with case-grammar's job before its merge.

I wait for case-grammar's merge (your START), then merge the tranche, rebuild `program.mjs` and finish.

## J2 · REPORT

B3 done: merged `tranche/T31` (case-grammar at a59794cee4) and rebuilt `program.mjs` (sha256 1bc1a8283e…, 352,605 bytes). case-checker 29/29 green, both R10 tests included; case-import's tests 52/52 against it; format, architecture, coverage (19/19) and ownership 0 failures. Pushed as 6640302f0c on `job/T31/case-checker`.
My same-layer providers still to merge: public-read and ratification (its `/7` reading feeds R7). I post COMPLETE after your CHANGE carrying them: merge, rebuild `program.mjs` again (ratification's `checks.mjs` is bundled into it), re-run.

## J3 · COMPLETE

case-checker T31 complete at 2887427d5d on `job/T31/case-checker` (tranche/T31 merged at b195e03059, every same-layer provider in).

**Entries applied** (plan L8, N538): R10 met: the complete edition compares by the case document's format; a test proves a whole `/6` case file built and packed on `main` @ d2b7451b80, before T31, kept as bytes (`bio-plane/test/m/case-checker/case-file-6-before-T31.zip`), recreates every finding with no `differs` entry and its edition equal, and a `/7` case file renders "Civicsmith" and compares equal, while either format carrying the other's words differs. R16: the requirement's wording only (the behaviour unchanged; its test stands). The program's first line and `spec.mjs` say Civicsmith; the spec reads `/7` and `/6` as identical in fields and states the name by format (§4, §6), with a test; comments in `index.mjs` and `main.mjs`; DEC-112's quote in `build-program.mjs:2` kept verbatim (K1365 (7)). `program.mjs` rebuilt after the last merge: sha256 c8146184ec3c3d882833fbe99290d0ea18c1dc60c3630da35e121202fa371653, 352,496 bytes.

**Deferred:** none.

**Found in another module:** case-grammar R14's light-only declaration against `/6` byte identity (J1), settled at K1381; nothing else.

**Tests and checks:** case-checker 29 pass, 0 fail; case-import (my user) 52 pass, 0 fail; `checks/format` 0 failures; `architecture` 0 failures; `coverage` 19 of 19 ids, 0 failures; `ownership` 10 files, 0 failures.

Size (session_01DbmGw6aXDCHDt4jNqGVCsU): test runs 7, module lines 1003
