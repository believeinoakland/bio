# intent (T14)

**Status** · session_01FqpsV7C2NPXUooqgeT942u · depth 2 · WORKING · handled B0

## Completion

**Applied** (on `tranche/T14` at 212a6370b8):
- **N327 (DEC-83), R9 and the Uses `membership` line.** A `group` aspiration declared, revised (a dead end) or retired by anyone but an active administrator (the founder included) now answers through `membership.notAnAdmin(author, GROUP_ASPIRATION_ACT, {remedy: GROUP_ASPIRATION_REMEDY})` (its R84), in `#aspirationAuthority`. That is the one path for all three acts and for a raw promotion of an aspiration, through intent's registered check. The answer is `code: NOT_AN_ADMIN`, `check: C-96.1` and `by` as stamped. The fixed act is "declaring, revising or retiring an aspiration the whole group holds". The remedy is the next step C-111.16's translation gave: "Ask an active administrator: they declare, revise or retire an aspiration the whole group holds in their own name, and the act carries their name and date." `message` is C-96.1's translation, a space, then the remedy. Both phrases are exported constants, following bias's pattern.
- The order is unchanged: a machine is still refused first (`MACHINE_CANNOT_DECLARE_ASPIRATION`), and a member's (`NOT_YOURS`) and a project's (`NO_SUCH_PROJECT`, `PROJECT_ACT_NOT_A_PARTICIPANT`) aspirations answer as before.
- `GROUP_ASPIRATION_NOT_ADMIN`'s row (C-111.16) is gone from `INTENT_CHECKS`, and its DEC-49 region `is-group-aspiration-admin` is removed. The header of `checks.mjs` says it is retired and its number is not reused.

**Tests** (`bio-plane/test/m/intent/`)
- **R9** (`pursuits.test.mjs`, rewritten arm):
  - A member (bob) and an inactive administrator (eve) are refused on declare; bob on a dead end, eve on a retirement, and bob on a raw revision through promotion.
  - Each answer deep-equals `notAnAdmin(by, act, {remedy})` and carries `code`, `reason`, `check` C-96.1, membership's `translation`, `by`, the fixed act at the head of `detail`, `remedy`, and `message` equal to the translation, a space, then the remedy.
  - No refusal writes anything (snapshot).
  - A machine is still refused first; an active administrator and the founder succeed.
  - `NOT_YOURS` and the project arms are unchanged.
- **R22** (`objective.test.mjs`): `GROUP_ASPIRATION_NOT_ADMIN` has no row; intent holds no `NOT_AN_ADMIN` row; C-111.16 is not reused; membership's row is C-96.1.
- **Negative controls:** dropping the remedy, and admitting a non-administrator, each turned the suite red (8 pass, 1 fail); both were reverted.

**Please strike** (my work meets this mark): R9 `*(not yet met: N327)*`, and in the Status line "N327 R9 answers through `membership.notAnAdmin` (C-111.16 retires, its number not reused); not yet met".

**Check rows, awaiting stamp** (R50, K408): **C-111.16 `GROUP_ASPIRATION_NOT_ADMIN` retired**, its number not reused. It is promotion's to stamp at T15's layer 2 (N318). No row was added or moved.

**Deferred:** nothing.

**Found in other modules** (sent to BOB as a REPORT, J2):
1. **Stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` still carries `GROUP_ASPIRATION_NOT_ADMIN` and C-111.16 (:69085, :69654). It is not_product's, regenerated at the layer close.
2. **legacy-tests:** `civicos-ui/check-refusal-codes.mjs` is already red on the tranche (17 failures, the same set before and after this change). This change moves exactly these of its measured figures, each down by one: `rows`, `census`, `reach`, `governedSites`, `regions`, `codesChecked` and `refusalsJudged`. `regionLines` falls by 4. They are for legacy-tests' re-pin of `FLOOR` (:573, :656, :742 …).
3. No suite under `bio-plane/test/` outside `m/intent/` names `GROUP_ASPIRATION_NOT_ADMIN`. `bio-plane/test/fixtures/row-census-1.43.0.jsonl` lists C-111.16 as a frozen census of catalogue 1.43.0, which stays as it is until promotion's next stamp.
4. There is no other hit in `civicos-ui/` or affordances' lists for any name I added or retired: `GROUP_ASPIRATION_NOT_ADMIN`, C-111.16, `GROUP_ASPIRATION_ACT`, `GROUP_ASPIRATION_REMEDY`.
5. **Requirements wording (QUESTION J1):** R22 says every refusal intent.md names gets a row in this module, except `NO_SUCH_PROJECT` and `NO_SUCH_ENTITY`. R9 now names `NOT_AN_ADMIN`, whose one row is membership's (R84), and R2 already names `PROJECT_ACT_NOT_A_PARTICIPANT`, which is membership's too. My reading: R22's exceptions gain both, and the code follows R84.

**Tests and checks run**
- `node --test bio-plane/test/m/intent/`: tests 51, pass 51, fail 0.
- Modules using intent, all green:
  - `monitoring`: 58 tests, 52 pass, 0 fail, 6 todo.
  - `scheduler`: 48 tests, 46 pass, 0 fail, 2 todo.
  - `affordances`: 76 tests, 76 pass, 0 fail.
  - `queue`: 61 tests, 60 pass, 0 fail, 1 todo.
  - `control-plane`: 45 tests, 45 pass, 0 fail.
- `build/manifest.md` names no layer tests.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture intent`: 11 product files, 40 relative imports; 0 failures.
- `coverage intent`: 28 of 28 live requirement ids named by a test; 0 failures.
- `ownership intent tranche/T14`: 0 failures, with legacy-checks and legacy-store 0 lines added and 0 removed.

Size (session_01FqpsV7C2NPXUooqgeT942u): test runs 10, module lines 1864

## J1 · QUESTION

R22 wording (not blocking; built on my reading): R22 says every refusal intent.md names gets a row in this module except NO_SUCH_PROJECT and NO_SUCH_ENTITY. R9 now names NOT_AN_ADMIN, whose one row is membership's C-96.1 (R84), and R2 already names PROJECT_ACT_NOT_A_PARTICIPANT, also membership's. My reading: R22's exceptions gain both (N327 for NOT_AN_ADMIN), and the code follows R84 (no intent row for either). Nothing to change in code if you agree.
