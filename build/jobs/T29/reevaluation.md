# reevaluation (T29)

**Status** · session_01NTpQJf5vp8NWhH7MCRQXe9 · depth 2 · WORKING · handled B0

## Completion

**Entry applied.** N531 (K1319, K1337): R31's telling reads the acceptance detail as the plane. `acceptanceWithdrawn` passed `class:admin` as the viewer of `accepted-work.acceptedFinding`, which `case-import` R16 answers null (a machine is no active member), so every told cause's `group` and `case` read null. It now asks with no viewer (the plane reading for itself, `case-import`'s `#sees`), and each told dependent carries `group`, `case` and `detail` beside `{bundle_id, ord, role, state, target}`, so the event names the source group and case per dependent as R31 says (before, the told dependents carried no detail at all). The read paths (`changesOf`, the obligation; `index.mjs` `#acceptanceOn`) keep the asking viewer. One more fix found on the way: a read path called with no viewer passed `null` through, which `case-import` answers as the plane. No leak followed from it (such a viewer is DENY, so every dependent is withheld before a cause is shown), but a read now asks a missing viewer as nobody (`""`), never as the plane.

**Tests** (`acceptance.test.mjs`): the case-import stand-in answers a viewer never sent, as `case-import` R16 does, and logs the viewers it is asked for. New: "R31 (N531): the telling reads … as the plane", where no member is a seer, each told dependent names group and case, a single withdrawal's dependents only, and a negative control (import not held: null, detail names neither). New: "R31 R9 R20 (N531): the read paths keep the asking viewer". A non-member who sees the dependent (owen) and a machine credential read `group`/`case` null in `changesOf` and the obligation, and owen's read is asked as owen. A member (ann) reads them on both paths. A read with no viewer answers nothing and never asks as the plane. The R8 telling test's expected dependents gain `group`, `case` (detail checked separately). Negative control: on the old source, 3 of the 9 acceptance tests fail (both new tests and the R8 one).

**Re-scan (N502/N508 kind).** Two comments named the retired check catalogue as live: `index.mjs` `CAUSE_SOURCES` ("the catalogue's `REEVAL_SOURCES`", now C-10.1's in `./checks.mjs`) and `checks.mjs` `checkReevalPending` ("as the catalogue's `checkBundle` takes them"; only this module calls it). Both re-worded, meaning unchanged. `src/plane/store.mjs` (op map) is live; the header's "Extracted from … `store.mjs`" is history.

**Deferred.** None.

**Found elsewhere.** The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change. `fleetbundles.test.mjs` passes on `tranche/T29` and fails after; it needs regenerating at L7's close.

**Tests and checks run.**
- `node --test test/m/reevaluation/`: tests 113, pass 113, fail 0.
- Users of the changed telling: case-import pass 52 fail 0; accepted-work 19/0; conformance 54/0; consequences 30/0.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `checks/architecture.mjs … reevaluation`: 17 product files, 68 relative imports; 0 failures.
- `checks/coverage.mjs … reevaluation`: 32 of 32 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … reevaluation tranche/T29`: 4 files changed by reevaluation between tranche/T29 and HEAD; 0 failures.

Size (session_01NTpQJf5vp8NWhH7MCRQXe9): test runs 9, module lines 2,439 (`index.mjs`; `checks.mjs` 185, `schema.mjs` 170)
