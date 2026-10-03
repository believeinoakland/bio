# docket (T29)

**Status** · session_01CSkgoq9z5tRnMWZZnTMGfA · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** L8 docket (N533; K1331, K1337): R2's two pressure codes are this module's own, `DOCKET_PRESSURE_MARKED` (C-129.12) and `DOCKET_PRESSURE_REFUSED` (C-129.13), numbers kept, in place of `PRESSURE_MARKED` and `PRESSURE_REFUSED` (action-grammar's C-117.17, C-117.15). Rows re-keyed in `src/docket/checks.mjs` with their translations unchanged (the refusals' meaning and order are unchanged); the three call sites in `docketPressure` use the new codes. R22: a new test reads every other product module's exported `*_CHECKS` table and checks no docket code is held there (negative control: action-grammar's pressure codes are seen; verified failing with the old key restored). The R2 test checks both new codes with their rows and that the old codes and checks have no row here.

**Deferred.** None.

**Found in other modules (for BOB).**
- `control-plane`: `test/m/control-plane/families.test.mjs:237` asserts "docket still holds PRESSURE_MARKED" (the pre-N533 state) and now fails (145 pass, 1 fail; 146/0 on the tranche base). Its L11 move (R43's docket clause: `CHECK_FAMILY_FILES` reads docket at its module-order place) owns the fix; the families.mjs comment at lines 71–79 also describes the old sharing.
- `row-census` (`test/system/row-census.test.mjs`): fails as planned (red 2 until T30's stamp): C-129.12 and C-129.13 arrive as `DOCKET_PRESSURE_*` and depart as `PRESSURE_*`, census sha 06602e6d… vs pin bc45a9ec….
- Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) still carries docket's old codes; BOB regenerates at layer close.
- `gate.mjs:657`'s comment names the two old codes as T30's stamp, still accurate.

**Tests and checks.**
- `node --test bio-plane/test/m/docket/`: tests 39, pass 39, fail 0.
- Users' tests: `test/m/public-read`: pass 105, fail 0; `test/m/control-plane`: pass 145, fail 1 (above); `test/system/row-census.test.mjs`: fail 1 (above, planned).
- `format`: 97 modules, 96 requirements files; 0 failures. `architecture docket`: 8 product files, 41 relative imports; 0 failures. `coverage docket`: 23 of 23 live requirement ids named by a test; 0 failures. `ownership docket tranche/T29`: 5 files changed; 0 failures.

Size (session_01CSkgoq9z5tRnMWZZnTMGfA): test runs 6, module lines 1299
