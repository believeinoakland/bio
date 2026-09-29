# legacy-store (T14)

**Status** · session_01Dx3FYgfzfhAU44B9xY9RCc · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`bio-plane/src/store.mjs`).
- N331's line: `filingsOf` is built with `actions`, `conformance`, `standards` and `consequences` only; its `producingGroup` argument is gone, so filings reads promotion's `fact("producingGroup")` itself (its R3). `promotion` stays in the constructor for its other readers.
- N342's share (K445): `#counts` ends with `...recordOf(this.ctx).counts(hid)` (record-core R63), after every literal key, so `op=stats` and purge's `before`/`after` carry every registered figure; a registered key of a literal's name replaces it in its place. The four reads of queue's tables (`tasks`, `findingDispositions`, `queueState`, `queueItemMutes`) and `#MINT_LEDGER_LIVE`'s `TASK` row are unchanged, until T15.
- N343: the boot calls `biasOf(this.ctx).migrate()` (bias R45) after progressions' `migrate()`, beside the other modules' calls; `ADDITIVE_COLUMNS` loses `["bias_debts", "settled_kind", "TEXT"]` with its REC-207 comment. The schema pass's splice of bias's schema stays (K445).

**Proof** (a scratch probe on the real plane under Miniflare, run before and after the change; not committed, since legacy-store has no `tests` path):
- `op=stats` (admin, member, and a direct call with no viewer) and `op=purge` (one bundle, then the whole store: `before`, `after`, `removed`) answer byte-identical JSON before and after: keys, order and figures (`dbBytes` set aside; it moves in pages).
- With a probe registration of `["tasks", "probeOnly"]` put in the constructor for one run: `tasks` answers the registered 42 in its own place in all three stats answers and in purge's `before`, and `probeOnly` comes last. So when queue registers its four at layer 11, the keys and their order stay.
- An older store (the schema text with `bias_debts` lacking `settled_kind`, persisted and booted by the host) has the column after the boot, `TEXT`, nullable, before and after the change. Control: with the new `biasOf(...).migrate()` line disabled, the column is absent, so it now arrives through bias alone.

**Deferred.** Nothing.

**Found in other modules, and stale artifacts (reported, not changed).**
- legacy-tests: `test/bias.test.mjs`'s `CORPUS PRINTED` floor now reads `store.mjs` at 212,573 characters (213,098 on the tranche; -525). Red until legacy-tests re-pins it. Its other two failures (TWENTY refusals: 19; K102's refusal now `NOT_AN_ADMIN`/C-96.1) and `project-sight`'s one (`projectownerrescue` answers `NOT_AN_ADMIN`, want `ADMIN_ONLY`) fail the same on the tranche without this change (N327, N335: legacy-tests' re-pins).
- `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`): stale by this change to `store.mjs`, for BOB's layer-close rebuild.
- Check rows added, moved or retired: none, so nothing awaits promotion's stamp.
- `civicos-ui/` and affordances' lists: no hit for `settled_kind`, `ADDITIVE_COLUMNS` or `registerCounts`; `producingGroup` appears only in comments at `civicos-ui/test/reopened-finding.test.mjs`:87 and `declared-flow-surface.test.mjs`:145, about instance-setup's registration, which this change does not touch.
- No requirement ids (legacy-store has no requirements file): no `not yet met` marks, no interface tests.

**Tests.**
- `node --test test/m/` (from `bio-plane/`), whole: tests 2799, pass 2784, fail 0, todo 15.
- Old battery: `purge` 14 passed, 0 failed; `stats-disclosure` 36 pass, 0 fail; `mint-ledger` 26 passed, 0 failed; `migrate` 49 passed, 0 failed; `rec207-bias-debt-settle` 37 pass, 0 fail; `d86-bias-debt` 20 pass, 0 fail; `project-sight` 254 passed, 1 failed (the same on the tranche); `bias` 135 pass, 3 fail (136/2 on the tranche; the third is the size floor above).

**Checks** (from the process repository):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture legacy-store`: 3 failures, all before this job (`store.mjs` imports queue and affordances, `schema.mjs` imports queue's schema).
- `coverage legacy-store`: 0 of 0 live requirement ids; 0 failures.
- `ownership legacy-store tranche/T14`: 2 files changed; 0 failures.

Size (session_01Dx3FYgfzfhAU44B9xY9RCc): test runs 20, module lines 3,226
