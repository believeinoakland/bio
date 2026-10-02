# record-core (T24)

**Status** · session_01GDBx64mMFCCwSytRPN41WV · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R75 `recordOpaqueId`, three readings I am building on (carrying on; none blocks the job):
1. **Rows.** Its three refusals are this module's own rows in `RECORD_CORE_CHECKS`, taking C-59's next free numbers beside C-59.5/.6 (the id-allocation family): C-59.7 `OPAQUE_ID_MALFORMED`, C-59.8 `OPAQUE_ID_SPENT`, C-59.9 `OPAQUE_ID_NO_TRANSACTION`, each `where` naming `recordOpaqueId`'s DEC-49 region, translations BUILD-FAULT-style for MALFORMED and NO_TRANSACTION (a caller's defect) and a member's sentence for SPENT. All three `awaiting stamp` for promotion's T24 L2 stamp (1.54.0); listed in my COMPLETE.
2. **Never throws, store failure.** If the ledger cannot be read or the INSERT fails (no table, a primary-key clash a lost read let through), it answers `OPAQUE_ID_SPENT` naming the id, recording nothing: fail closed, so a caller never uses an id the ledger has not taken. The detail says the ledger already holds it or could not confirm it free.
3. **Malformed** is read literally: not a string, or the empty string. A whitespace-only or any other non-empty string is accepted as an opaque id (the requirement names no grammar; the consumer's own id form is its business). The ledger row's `source` is `'chosen'`.

## J2 · REPORT

Outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my edits to `bio-plane/src/record-core/index.mjs`, `checks.mjs` and `schema.mjs` are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close (`fleetbundles.test.mjs` names exactly these three: "STALE BUNDLE — the source src/record-core/… has changed"). I regenerated nothing. The other bundles (agent-, ocr-, pdf-worker, newgroup) take no record-core input and stay fresh.
2. **Red found in the whole `test/m`, not mine and already in hand:** 3 failures, all membership's `MODULE_ORDER` lacking `link-sweep` after the opening's N506 fold (`membership/module-order.test.mjs`:12 R83, `membership/t9-notice-sight-bounds.test.mjs`:185 R79, `promotion/registry.test.mjs`:58 R39/R45/R46). BOB added membership's L2 job for it (K1185); nothing for me to do.

## J3 · COMPLETE

**Entries applied** (START B1; ANSWER B2 = K1185; commits `0a33955d65`, `22357f02c2`, merged `tranche/T24` at `196769d595` for the plan's change)
- (1) **N503, R75 `recordOpaqueId(id)`** (`index.mjs`, beside `mintOpaqueId`): one plain `INSERT` into `minted_ids` (`source` `'chosen'`) inside the caller's open `transact`, so a rollback (throw, refusal, or a refused savepoint under a committing outer) takes it back; once committed R6 never draws it and R8 holds through both purges (the ledger is exempt). Answers `{ok: true, id}`. Refusals, each recording nothing, in one DEC-49 region `is-opaque-id-refused`: `OPAQUE_ID_MALFORMED` (not a string, or `""`), `OPAQUE_ID_NO_TRANSACTION` (no `transact` open, naming the id; a held `afterCommit` call is outside too), `OPAQUE_ID_SPENT` (naming the id: drawn, recorded or seeded, decided by the ledger's primary key itself, so no read can be lost between asking and recording; an INSERT the ledger cannot take for any reason fails closed as spent, K1185). Never throws. Checked inside a real Durable Object (Miniflare, scratch probe deleted): a caught key refusal leaves the caller's transaction writable, a throw rolls the record back.
- **Rows, `awaiting stamp` for promotion's T24 L2 stamp (1.54.0)**, new in `RECORD_CORE_CHECKS` (`checks.mjs`), each `where` `src/record-core/index.mjs recordOpaqueId > is-opaque-id-refused`:
  - C-59.7 OPAQUE_ID_MALFORMED awaiting stamp
  - C-59.8 OPAQUE_ID_SPENT awaiting stamp
  - C-59.9 OPAQUE_ID_NO_TRANSACTION awaiting stamp
- **Re-scan for the N502/N508 kind** (N469's rule; every module file read whole). Re-worded: `checks.mjs` header (C-87.12 "retires into it in review's job" → retired in T13, K434, stamped 1.44.0; the catalogue's copies "leave the catalogue when promotion and ratification hold theirs" → removed in T19, K783, stamped 1.49.0, the catalogue deleted at T19's close, K855; "queue" → tasks and sources as `mintExhausted`'s callers); `checks.mjs` C-102.15 comment ("the catalogue's `checkBundle`" → record-grammar's); test `record-core.test.mjs`:1857 ("the store's op map reaches `stats`" → this module's route map, `recordCoreOps`, R72). Left alone: past-tense history (`index.mjs`:10 "Extracted from `legacy-store` … in T3"), the extraction-map citations, and "the catalogue" used for the check catalogue generally. No `awaiting stamp` note of a past stamp in the module.
- Also: `schema.mjs`'s ledger comment names the `'chosen'` source; the module header cites R1–R75.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J2): the plane bundle staled by my three source files (regenerated nothing); the whole-suite red is membership's `MODULE_ORDER` (K1185's L2 job). Requirements note for BOB's file, if wanted: R72 and R73 still describe today's behaviour as "`store.mjs`' explicit arms" and "as `store.mjs`' `auditPass` gates it" — the N508 kind in the requirements text (history, no change of meaning).

**Users** (`grep mintOpaqueId|minted_ids` under `test/m`: case-authoring, tasks, review, ratification, network-notices, publication, plane, sources, calibration, promotion): all green in the whole-suite run below; `mintOpaqueId` unchanged.

**Tests and checks**
- `node --test bio-plane/test/m/record-core/`: tests 99, pass 99, fail 0 (5 new R75 tests: the rows; record + R6/R8 through both purges; rollback by throw, refusal and savepoint; each refusal recording nothing, with a positive control for the same ids unspent; never throws, fail closed on a missing table, a failing read, an unwritable ledger, hostile input).
- Negative controls (mutations of `recordOpaqueId`, each restored): no transaction check → 1 fail; `""` accepted → 1 fail; catch rethrows → 1 fail; `INSERT OR IGNORE` (spent accepted) → 2 fail; recorded as `'mint'` → 2 fail.
- `node test/stats-disclosure.test.mjs` (Miniflare, the real plane): 36 pass, 0 fail.
- Whole `bio-plane/test/m`: tests 5223, pass 5209, fail 3 (membership's `MODULE_ORDER` only, above), todo 11.
- `fleetbundles.test.mjs`: fails only on the plane bundle's staleness from my three files (reported).
- `node checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both `link-sweep`'s absent directories (accepted red 4). `architecture.mjs … record-core`: 6 product files, 11 relative imports; 0 failures. `coverage.mjs … record-core`: 75 of 75 live requirement ids named by a test; 0 failures. `ownership.mjs … record-core tranche/T24`: 5 files changed; 0 failures.

Size (session_01GDBx64mMFCCwSytRPN41WV): test runs 15, module lines 1730
