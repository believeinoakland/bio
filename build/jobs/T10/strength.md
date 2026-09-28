# strength (T10)

**Status** · session_01TQhFSmtZmNQAvKiWVVjB19 · depth 2 · RUNNING until 2026-09-28T21:08:51Z (legacy suites before/after my change) · handled B0

## Completion

**Entries applied** (plan layer 6, BOB's B1):
- **N218** — the factory reaches `inquiry` and `basis-versions` itself when none is given: `inquiry` as `inquiryOf(host)` with the module's own `legCapped` (a lazy getter), `versions` as `basisVersionsOf(host)` on the first read naming a project. `strengthOf(host)` with no deps now answers (factory test drives it over the real inquiry's `inquiry_basis`).
- **N152** (strength's share, R17) — strength registers `inquiry.onGrounded("strength", …)` itself when its factory first builds (`registerGrounded`, answering the three axes of `strengthOf`); legacy-store's registration in its name and the inquiry adapter it passed are removed (§12.2: 4 lines removed, 1 added, `store.mjs:617` `strengthModule(ctx);`, listed by the ownership check for BOB's review).
- **N184** — (1) the walk names an ungraded leg with the arithmetic's own reason ("the leg carries no grade"), the record's reason staying in `ungraded` (K220); (2) `VERSION_LEGS_MAX` is no longer defined here: basis-versions' `BASIS_VERSION_LEGS_MAX` is imported and used, and re-exported under the old name for callers; (3) C-30.7 and C-30.8's `where` name `refusePairComposed`.
- **N208** — `strengthBarOf`'s absent-or-unseen project is `membership.noSuchProject(pid)` (R16, its R78); `BAD_GRADE` is strength's own row, C-107.2 (region `is-strength-bar-grade`), carrying code, check, translation and `axis`.
- R15's older mark (K102, administrators only) was already met (C-107.1 `STRENGTH_BAR_NOT_ADMIN`, tested); R15 and R16's `not yet met: T10, N208` and R17's `not yet met: T10, N152` now hold.

**Deferred:** none.

**Found in other modules** (reported to BOB):
- `legacy-tests`: `test/strengthpair.test.mjs` §7 "a missing line is a REFUSAL…" and "the two self-guards carry their OWN `where`…" pin the old `where` text `#refusePairComposed`, which N184 (3) corrects; they need re-anchoring to `refusePairComposed`. Its N184 (1) red ("the branch names each leg with the ARITHMETIC's reason") is now green: strengthpair 89 pass / 2 fail (was 90 / 1). `test/bounds.test.mjs`' two strength reds (`op=versionstrength` / `op=partitionindependence` bound shared) are now green.
- `legacy-store`: `store.mjs` 614's comment ("…; strength R28 here.") now describes a registration that moved to strength; left unedited (a comment line is not rewiring).
- No generated artifact rebuilt; `bio-plane/dist/bio-plane.bundled.mjs` is stale against these sources (regenerated at layer close).

**Tests and checks run**
- `node --test bio-plane/test/m/strength/` — 44 pass, 0 fail (40 before; new `factory.test.mjs`, R15/R16/R8/R9/R10 arms widened).
- Users of strength, and inquiry and basis-versions: run-productions 33/0, skills 29/0, reevaluation 39/0, case-authoring 38/0, review 29/0, conformance 29/0, consequences 22/0, inquiry 50/0, basis-versions 42/0 — identical to the baseline.
- 47 legacy suites naming strength's ops or constants, before (worktree at 292459ff6d) and after: same pass/fail lines; six red on the baseline too (bounds, hygiene, machine-fences, machinefences-dec49, meaning-bounds, strengthpair), content differences as above.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture strength`: 9 product files, 34 relative imports; 0 failures. `coverage strength`: 27 of 27 live requirement ids named by a test; 0 failures. `ownership strength tranche/T10`: 7 files; legacy-store 1 added, 4 removed; legacy-checks 0/0; 0 failures.

Size (session_01TQhFSmtZmNQAvKiWVVjB19): test runs 12, module lines 1045
