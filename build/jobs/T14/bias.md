# bias (T14)

**Status** · session_01FxFMrSi4LKTy8hY2B34bNu · depth 2 · COMPLETE · handled B1

## Completion

**Applied** (on `tranche/T14` at 31b0b69355):
- **N326, R44 `settled({gate, since, limit})`.** It answers the debts settled at or after `since` whose context `gate` admits (R43's `#gateOver`), newest settled first, ties by run. `limit` is 1–1,000 (default 200), and `truncated` is measured by reading one more. Each debt carries `run`, `context_type`, `context_id`, `settled_kind` (null for a debt settled before the kind was kept), `settled_at`, `actor` and `reason`. The settling settlement is the run's last one, read only when its kind is the debt's. Only a `resolved` settlement has an actor and a reason; `lens_returned`, `rerun` and an unkinded debt carry null for both. `since` is an instant: a number of ms, or a string `Date.parse` reads (record-core R48's "readable instant"). It is compared as an instant, taking the first whole second at or after it, because every settlement is stamped to the whole second. Anything else answers none with `since: null` and says so. A read that fails answers none, `undetermined: true`. The answer also echoes the `since` it used.
- **N327, R11.** The instance-scope adoption by a non-administrator answers through `membership.notAnAdmin(member, INSTANCE_ADOPTION_ACT, {remedy: INSTANCE_ADOPTION_REMEDY, scope: "instance"})`. That gives `code: NOT_AN_ADMIN`, `check: C-96.1`, the fixed act "adopting a bias set for the whole instance", and the remedy "A project's owners set the lens over that project's work: adopt this set for a project you own, or ask an administrator to adopt it for the whole instance." `message` is C-96.1's translation, a space, then the remedy. The order of refusals is unchanged, and the adoption stays signed (R12). C-26.20's row is gone from `BIAS_CHECKS`, with a comment saying it is retired and its number is not reused.
- **N343, R45 `migrate()`.** It first adds `BIAS_ADDITIVE_COLUMNS` (`bias_debts.settled_kind TEXT`, nullable) to a table that exists and lacks it, and never fills it. It then runs this module's own `BIAS_SCHEMA` (`IF NOT EXISTS`) for the five tables and five indexes. It is idempotent and answers `{ok, added}`. It is not called from `biasOf`: the host calls it in its boot (legacy-store, layer 10).
- **Own flaw fixed:** `biasDebtRerun` stored its caller's `at` verbatim (any string). It now stamps a readable instant to the whole second, and anything else as now, so R44 compares every settlement as an instant. ai-runs already passes whole seconds, so its answers are unchanged.

**Tests** (`bio-plane/test/m/bias/`)
- **R44** (`debt.test.mjs`, two new tests):
  - The three settling acts in one world give the full answer, pinned whole.
  - `since` excludes an earlier settlement: at `since` is included, and the ms, sub-second and number spellings work.
  - The gate hides a debt on an unseen context: alice, cora, a denied viewer and malformed gates.
  - A `lens_returned` or `rerun` settlement has `actor: null`.
  - A `since` that is not an instant answers none and says so.
  - An unkinded debt has null kind, actor and reason.
  - A re-raised debt is not listed, and a second settlement is the one read.
  - A failed read is undetermined.
  - 201 real `lens_returned` settlements give `truncated: true`; ties are ordered by run; the limit is clamped.
- **R45** (new `migrate.test.mjs`, three tests):
  - An older `bias_debts` holding a settled debt gains the column (TEXT, nullable), the row stays unfilled, `biasDebt` answers `kind_state: undetermined` and `settled` lists it with a null kind.
  - A second `migrate()` changes nothing, after a migration and after the schema pass.
  - A fresh store gets all five tables, their indexes and the column, identical to the schema pass, and the module works over them.
  - `world.mjs` gained a `biasSchema` option (`legacy`, `none`) for this.
- **R11** (`adopt-manifest.test.mjs`, rewritten):
  - For each non-administrator (a member, a project owner, a class identity), the answer deep-equals `notAnAdmin(...)` and carries `code`, `check`, `translation`, `by`, the fixed act in its detail, `remedy` and `message`.
  - Not authored and not proposed are still asked first, for a non-administrator too.
  - The op answers the same.
  - Nothing is written, and the adoption stays signed.
- **R29** (`checks.test.mjs`): C-26.1–C-26.19, and C-26.20's code is gone.
- **Negative controls:** each of these turned the suite red, and each was reverted: ascending order, no ALTER, an actor on every kind, floor instead of ceil for `since`, and no remedy.

**Please strike** (my work meets these marks): R11 `*(not yet met: N327)*`, R44 `*(not yet met: N326)*`, R45 `*(not yet met: N343)*`, and in the Status line "N327 R11 … N326 R44 (`settled`); N343 R45 (`migrate()`); not yet met".
- R45's clause "No other module adds or alters a column of these tables" becomes true when legacy-store drops its `ADDITIVE_COLUMNS` line (`store.mjs`:733) at layer 10. A module test cannot check another module's source.

**Check rows, awaiting stamp** (R50, K408): **C-26.20 `BIAS_ADOPTION_NOT_AN_ADMINISTRATOR` retired** (its number is not reused). It is promotion's to stamp at T15's layer 2 (N318). No row was added or moved.

**Deferred:** nothing.

**Found in other modules** (sent to BOB as a REPORT):
1. **Stale, not rebuilt (§14):**
   - `agent-worker/dist/agent-worker.bundled.mjs`: fleetbundles fails on `src/bias/checks.mjs`, `index.mjs` and `schema.mjs`.
   - `bio-plane/dist/bio-plane.bundled.mjs`: its manifest names `src/bias/`.
2. **legacy-tests:** `bio-plane/test/bias.test.mjs` fails two arms, both expected and passing on the parent:
   - "TWENTY refusals are allocated" (:581): C-26.20 retired, so there are now 19.
   - "K102: an ORDINARY member's instance adoption is refused BY NAME" (:867): it now answers `NOT_AN_ADMIN` / C-96.1 with the remedy.
3. **legacy-tests and legacy-ui:** `civicos-ui/check-refusal-codes.mjs`' pins `rows` (:573), `census` (:656) and `reach` (:742) should each move by C-26.20's departure, for legacy-tests' guard re-pin. No other hit in `civicos-ui/` or affordances' lists for any name I added or retired: `settled`, `migrate`, `INSTANCE_ADOPTION_*`, `BIAS_DEBT_SETTLED_*`, `BIAS_ADDITIVE_COLUMNS`, `BIAS_ADOPTION_NOT_AN_ADMINISTRATOR`, C-26.20.
4. **legacy-store** (layer 10, N343): call `biasOf(ctx).migrate()` in the boot after the schema pass, and drop the `settled_kind` line from `ADDITIVE_COLUMNS`.

**Tests and checks run**
- `node --test bio-plane/test/m/bias/`: tests 54, pass 53, fail 0, todo 1 (R26, deferred by K102).
- Modules using bias, all as on the parent:
  - `ai-runs`: 49 tests, 49 pass, 0 fail.
  - `case-authoring`: 39 tests, 39 pass, 0 fail.
  - `scheduler`: 48 tests, 46 pass, 0 fail, 2 todo.
  - `queue`: 61 tests, 60 pass, 0 fail, 1 todo.
  - `control-plane`: 45 tests, 45 pass, 0 fail.
- `build/manifest.md` names no layer tests.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture bias`: 9 product files, 27 relative imports; 0 failures.
- `coverage bias`: 45 of 45 live requirement ids named by a test; 0 failures.
- `ownership bias tranche/T14`: 9 files changed; legacy-store and legacy-checks 0 lines added, 0 removed; 0 failures.

Size (session_01FxFMrSi4LKTy8hY2B34bNu): test runs 12, module lines 1803

## J1 · REPORT

Found outside bias (record, Found in other modules): (1) stale, not rebuilt: agent-worker/dist/agent-worker.bundled.mjs (fleetbundles fails on src/bias/{checks,index,schema}.mjs) and bio-plane/dist/bio-plane.bundled.mjs. (2) legacy-tests: bio-plane/test/bias.test.mjs fails two arms, both expected: 'TWENTY refusals are allocated' (:581, now 19) and 'K102: an ORDINARY member's instance adoption is refused BY NAME' (:867, now NOT_AN_ADMIN / C-96.1 with remedy). (3) civicos-ui/check-refusal-codes.mjs pins rows/census/reach (:573, :656, :742) move with C-26.20's departure. No other civicos-ui or affordances hit. (4) legacy-store at layer 10 (N343): call biasOf(ctx).migrate() in the boot after the schema pass; drop settled_kind from ADDITIVE_COLUMNS (store.mjs:733).
