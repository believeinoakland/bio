# review (T37)

**Status** · session_01DttDRmaX4Aw5sCLrbvM1Uo · depth 2 · RUNNING until 2026-10-08T11:53:49Z (whole test/m, with my change and on tranche/T37) · handled B0

## Completion (T37-22)

**Reading (mechanics §17, N739):** I measured the set as §3 asks: my requirements 15 KB, my code 68 KB (`index.mjs` 53, `checks.mjs` 10, `schema.mjs` 6), my tests 98 KB, and of the used modules only what my Uses names. That comes to under 300 KB, and I read it whole myself. Also read whole: layer 8's row of `build/layers.md`, the plan's T37-22 entry, rules 4 and 6 (with item 17's census line), K2129 and K2175 (their lines), and credentials' R53 with its op-map read (`credentials/index.mjs`:2095–2101) as the pattern. My change touches only the op map, which calls no used service, so I read no used module's text beyond that.

**Entries applied (T37-22):**
- R29 (N761; K2129, K2175): `reviewOps` takes `secretSha` from the internal request's body only, for `reviewgrant` (the new grant's fingerprint) and for the grant doors of `reviewcopy` and `reviewcomment`. A `secretSha` in the query is never read. `bySecret`, `author` and `viewer` stay query stamps. The comment at `index.mjs`:768 is reworded.
- `acts.test.mjs` R22: the grant and the recipient's comment now carry the fingerprint in the body. The negative control stays: `bySecret` sent in the body opens no door.
- New test "R29" (K874), with negative controls:
  - A query-only fingerprint is refused `REVIEW_NO_SECRET` on a grant, writing nothing.
  - Where query and body differ, the body's fingerprint is the one recorded.
  - Copy and comment open on the body's fingerprint. On a query one they answer the dead answer, byte-identical, and write no comment.
  - `bySecret`, `viewer` and `author` sent in the body are not read.
- Both tests fail against the code before this change and pass after it.

**Rule 4's interim reds (N761), by name.** `control-plane/index.mjs`:2836 and :2858 still stamp the grant fingerprint in the query until T37-33.
- No `test/m` test drives these ops through control-plane with a grant. I confirmed this on my branch: no `test/m` test changes colour at my merge (below).
- Two legacy-ui tests outside `test/m` do drive them, and go red at my merge until T37-33:
  - `civicos-ui/test/review-copy.test.mjs`: green on `tranche/T37`, red with my change. Its fixture's `reviewgrant` is refused `REVIEW_NO_SECRET`, and its `deadPage` then throws at :471.
  - `civicos-ui/test/statement-ack.test.mjs`: already red on `tranche/T37`, with an 8000 ms timeout at "the recipient's acknowledgement is drawn" (M0-107, not mine). With my change it fails earlier, at its fixture's `reviewgrant` (`REVIEW_NO_SECRET`).

**Found in other modules (REPORT with my COMPLETE):**
- legacy-ui: `statement-ack.test.mjs` is red on `tranche/T37` before my change. Its recipient acknowledgement step times out (M0-107). No rule 6 item names it.
- No generated artifact is made stale by this change beyond the plane bundle.

**Deferred:** none. The requirements' Status and R29's marker are BOB's to update.

**Tests and checks:**
- `node --test test/m/review/`: 39 pass, 0 fail.
- Every module test, `test/m/**`, with my change: 8,818 tests, 8,749 pass, 56 fail. The same run on `tranche/T37` @ `0303f8861b`: 8,803 tests, 8,730 pass, 60 fail.
  - The one failure only in my run is capture-requests `plane.test.mjs` R19, accepted red 15. Its sibling R48 failed only in the base run instead: the same five-test setup, a different test reaching it first.
  - Failed only in the base run: process-cleanup R2, `convert-tiers` in extraction and reading-pipeline, and `staffdirectory`. None touches review; I take them as environment or timing differences, as CREDENTIALS #8 found.
- The 21 test files outside my module that name these ops (control-plane, op-grades, op-declarations, publication, case-authoring, admission, affordances, filing-templates, plane, legacy-ui): 197 of 199 pass. The 2 failures are the legacy-ui reds above.
- `format`: 136 modules, 0 failures. `architecture`: 8 product files, 37 imports, 0 failures. `coverage`: 29 of 29 live ids, 0 failures. `ownership` vs `tranche/T37`: 0 failures.

Size (session_01DttDRmaX4Aw5sCLrbvM1Uo): test runs 8, module lines 1028
