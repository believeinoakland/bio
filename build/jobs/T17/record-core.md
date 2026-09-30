# record-core (T17)

**Status** · session_015Z2ibFGipKFWMV5BopFcPH · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

N376 against R62's text. R62 says `prefix` is "the gated prefix asked (R3's set)" and `detail` names "a project, case, draft, grant or task id"; its caller list is promotion R19, case-authoring R7, review R27, tasks R1. `SRC` is not in R3's gated set (`allocIdOp` does not refuse it), and sources (`src/sources/index.mjs`:159, :181) is not among the named callers. So N376 widens a service I provide, and step 5 says BOB words the requirement first.

My best reading, which I am building now: R62 answers for "a prefix whose ids are minted opaque by `mintOpaqueId`: R3's set, and `SRC`", `detail` naming "a project, case, draft, grant, task or source id", and sources joins the callers (sources' R that mints). `prefix` echoes `SRC`. `SRC` stays out of R3's gated set: gating `allocIdOp` for it is not N376's ask (a caller stepping the `SRC-<year>` counter learns nothing, since sources never read `seq`). No catalogue row or translation changes: C-59.6's `check`, `where` and `translation` are untouched; only `detail` for `SRC` changes (from "a free id" to "a free source id"). So nothing is `awaiting stamp`.

Please word R62 accordingly (or tell me otherwise).

## Completion

**Entries applied.** N376 (K540; SOURCES #1 J2 (3)): `MINTED_OBJECT` (`src/record-core/index.mjs`:86–88) gains `SRC: "source"`, so `mintExhausted("SRC")` answers `detail` "the plane could not find a free source id: every one it drew was already taken. Nothing was written." in place of the unnamed "a free id". The function's comment now says a prefix neither in R3's set nor `SRC` is named by no object. Built on J1's reading (R62 widened to name `SRC` and sources among its callers; `SRC` stays outside R3's gated set); BOB words R62.

**Rows.** None changed: C-59.6's `check`, `where` and `translation` are as they were, and no row was added, moved or retired. Nothing is `awaiting stamp`.

**Tests.** `test/m/record-core/record-core.test.mjs`: R62's per-prefix test now covers `SRC` beside R3's five (six fixed sentences; the null-mint condition checked for each, nothing written); a new test "R62 (N376)" pins `mintExhausted("SRC")` whole, that near spellings (`SRCE`, `src`, `SRC-X`, ` SRC`) name no source, that `extra` never replaces its fields, that a transaction whose minter answers null answers through it with nothing written, and that `SRC` is not gated and the row table is unchanged. Both fail without the change (2 fail, 61 pass) and pass with it. The stale caller list in the comment after R62's tests (queue R23) now reads tasks R1, and sources for `SRC`.

**Deferred.** None.

**Found in other modules.** None.

**Run.**
- `node --test test/m/record-core/` (from `bio-plane/`): tests 63, pass 63, fail 0.
- A changed service (R62's `detail` for `SRC`), so every user of `mintExhausted`: `node --test test/m/sources/ test/m/case-authoring/ test/m/tasks/ test/m/review/ test/m/promotion/`: tests 256, pass 256, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 72 modules, 67 requirements files; 0 failures.
- `node checks/architecture.mjs … record-core`: 5 product files, 8 relative imports; 0 failures.
- `node checks/coverage.mjs … record-core`: 63 of 63 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … record-core tranche/T17`: 3 files changed by record-core; legacy-store: 0 added, 0 removed; 0 failures.

Size (session_015Z2ibFGipKFWMV5BopFcPH): test runs 5, module lines 1162
