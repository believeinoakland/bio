# instance-setup (T13)

**Status** · session_01TEPER5SDgX1CbFrmvYAxBe · depth 2 · WORKING · handled B1

## Completion (INSTANCE-SETUP #2)

**Entry applied** · N10's remainder, R15's end-to-end half (B1). The `test.todo` at `profiles.test.mjs`:92 is now a test through the Worker's route: the real plane (`src/index.mjs` under Miniflare, as R19's canary runs) serves the page at `/`, and the page's own script, run over the document stand-in with its `fetch` answered by the Worker, claims the copy as the founder, is shown the active profiles, is offered every held non-test profile with none preselected (no test profile offered), is warned before `op=profilesset` and sends nothing until it confirms, sees the change by name, and later chooses none, is warned what that means and sees it shown. Through the same route: a second, enrolled administrator's own session sets the list (attributed to that member); an ordinary member signed in on a fresh page sees the profiles by name and no choice; the plane refuses that member's set (`PROFILES_NOT_ADMIN`) and an `ADMIN_TOKEN` bearer's (control-plane's `machineClasses: []`). Negative controls, run and reverted (source untouched): a preselected checkbox in the page, and `profilesSet` without its administrator check, each turn the test red.
- Test code: the page's document stand-in moved from `page.test.mjs` into `fixture.mjs` as `pageOver({html, hash, session, fetch})`, so the page-half tests and the end-to-end test run the same stand-in; `page.test.mjs`'s `load` is now a thin wrapper over it (its 8 tests unchanged, passing).
- No product code changed.

**For BOB to strike (requirements Status line)** · R15's `(not yet met: N10, K102)` mark, and in the Status line's "Not yet met" list: R12–R16, R24's counterparty shape, R25, R32, R34, R39 and R40 each have a passing test at the interface naming the id and no `test.todo` remains in the suite (the list predates T12's work). R42's "met in substance" parenthesis likewise has a passing test.

**Deferred** · none.

**Other modules** · none found. No check row added, moved or retired (nothing for promotion to stamp, N318). Grep of `civicos-ui/` and affordances' lists: no hit for code I added (test-only); `bio-plane/src/affordances.mjs`:829 and :2216 hold `profilesset`'s existing entries, unchanged and still true. No generated artifact made stale (no product source changed).

**Tests and checks run**
- `node --test test/m/instance-setup/` (bio-plane): `tests 53, pass 53, fail 0, todo 0` (28 s).
- `node checks/format.mjs`: `69 modules, 64 requirements files; 0 failures`.
- `node checks/architecture.mjs … instance-setup`: `11 product files, 38 relative imports; 0 failures`.
- `node checks/coverage.mjs … instance-setup`: `42 of 42 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs … instance-setup tranche/T13`: `0 failures` (re-run after commit, below).
- No layer tests are named in `build/manifest.md`.

Size (session_01TEPER5SDgX1CbFrmvYAxBe): test runs 10, module lines 2875
