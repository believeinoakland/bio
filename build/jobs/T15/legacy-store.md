# legacy-store (T15)

**Status** · session_01AciCMuth1cZd2DkRivax4t · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`bio-plane/src/store.mjs`; `schema.mjs` read whole, unchanged). Net change: 11 lines added, 47 removed.
- (1) N342's drop (K445): `#counts` no longer reads queue's tables. Its literal keys `tasks`, `findingDispositions`, `queueState` and `queueItemMutes` go, with their comments. `op=stats` and purge's `before`/`after`/`removed` now take those four from queue's registration through `...recordOf(this.ctx).counts(hid)` (record-core R63, queue R42). `#MINT_LEDGER_LIVE` loses `["TASK", "tasks", "id"]`: queue seeds its own TASK row at start and before its first mint (R42).
- (2) N352's share: `#hiddenBundles` is gone. `#counts` computes `hid` as `viewer === undefined ? null : hiddenBundles(viewer)` (membership R88), passes that `{sql, args}` (or null) to every subtraction and hands it on as R63's `hid`. A viewer that was never sent (a direct internal call, purge's proof) is not asked and stays whole, as before (R88: "what an absent viewer means stays the caller's"). `hiddenBundles` is added to the existing `./membership/index.mjs` import; membership is earlier in the order (`uses: *earlier`).
- (3) PUBLICATION #5's report (K500): the unused `CASE_DOCUMENT_FORMAT` import and its CASE-5b comment are gone.

**Proof** (a scratch probe on the real plane under Miniflare, run on `tranche/T15` and on this branch; not committed, since legacy-store has no `tests` path). `op=stats` for the admin, member and probe classes, and `op=purge` (`before`, `after`, `removed`) give the same keys and the same figures in both runs, compared with sorted keys and `dbBytes` set aside. **One stated difference: key order.** The four queue keys now come last in the `op=stats` and purge objects, because the spread comes after the literal keys, where they used to sit in place. They are JSON object keys, so I read their order as outside the interface. No suite run depends on it: `stats-disclosure`, `purge`, `project-sight`, `d266scope`, `d125-findingmute` and `queue-state` all pass.

**Deferred.** Nothing.

**`not yet met` marks met.** None: legacy-store has no requirements file, and membership R88, queue R42 and record-core R63 carry no mark.

**Check rows.** None added, moved or retired, so nothing awaits promotion's stamp.

**`civicos-ui/` and affordances' lists.** No hit for `#hiddenBundles`, `#MINT_LEDGER_LIVE` or `CASE_DOCUMENT_FORMAT` in `civicos-ui/` or `bio-plane/src/affordances.mjs`.

**Found in other modules (legacy-tests': reported, not edited).**
- `bio-plane/test/bias.test.mjs`:335 (`CORPUS PRINTED`): its floor `STORE_SRC.length >= 212_573` fails because `store.mjs` now reads 210,035 characters. Needs a re-pin. It passes on the tranche.
- `bio-plane/test/d484-refusal-translation.test.mjs`:133: the same `store.length >= 212_573` floor; 31 pass, 1 fail. Needs a re-pin. It passes on the tranche.
- `bio-plane/test/project-sight.control.mjs`:220–223 (`stats-whole-store`) and :292–293 (`subtract-for-everyone`): both arms patch `    return gate && gate.scope !== "member"` in `store.mjs`, which is gone, and now report `ARM DID NOT ARM`. That line now lives in `membership/index.mjs` `hiddenBundles` as `if (gate.scope === "member") return null;`, so the arms move there, widened so one patch guards the store, queue and retrieval (N352). The suite already failed on the tranche, from its retrieval-anchored arms `indexcheck-whole-index` and `selectionbytes-whole` (RETRIEVAL's N352 share). Its comments at :238, :381, :397 and :405 describing the store's `#hiddenBundles` are stale.
- `bio-plane/test/run-conditions.test.mjs`:397: the comment still names the store's `#hiddenBundles`. Text only; the suite passes (59/0).
- `bio-plane/test/mint-ledger.test.mjs` S8 (N342): still passes (26/0). Its corpus reads the store's `#MINT_LEDGER_LIVE` together with every module's `seedMintLedger([...])` literal, and queue's `[["TASK", "tasks", "id"]]` covers TASK. U6 TASK passes too: a legacy TASK id is still learned. Only its comments (:73–77) still describe TASK beside the store's seed.
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) are stale because `store.mjs` changed. Left for BOB's layer-close rebuild.
- **Working tree.** Some old-battery controls hit their timeouts while running and left patched files behind: `bio-plane/src/airun.mjs`, `bio-plane/dist/*`, `agent-worker/dist/agent-worker.bundle.json`, `civicos-ui/test/run.mjs`, `civicos-ui/check-refusal-codes.mjs` and `civicos-ui/test/refusal-codes.test.mjs` (deleted), and two `store.mjs.*pristine*` copies. My permission check refused discarding them. They are uncommitted, and none of them is in any commit on this branch: only `store.mjs` and this record are staged. The shared tree is left as it is.

**Tests.** legacy-store has no `tests` path, and `build/manifest.md` names no layer tests. For the old battery, I ran every suite outside `test/m/` that reads `store.mjs` or touches stats, purge or the ledger: 320 suites (`bio-plane/test/` and `civicos-ui/test/`), in chunks under ten minutes. 236 exit 0 and 84 do not. Of the 84, 82 fail the same way on `tranche/T15` without this change (re-run in a separate worktree). The other 2, `bias.test.mjs` and `d484-refusal-translation.test.mjs`, are the two size floors above. `project-sight.control.mjs` fails on both, and gains the two arms above. Named results on this branch: `purge` 14/0, `stats-disclosure` 36/0, `project-sight` 254/0, `mint-ledger` 26/0, `queue-state` 66/0, `d125-findingmute` 42/0, `d266scope` 38/0, `gate-reads` 168/0, `hygiene` 1358/0, `run-conditions` 59/0.

**Checks** (from the process repository):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture legacy-store`: 3 failures, all from before this job and the same as T14's (`schema.mjs` imports queue's schema; `store.mjs` imports affordances and queue).
- `coverage legacy-store`: 0 of 0 live requirement ids; 0 failures.
- `ownership legacy-store tranche/T15`: 1 file changed; 0 failures.

Size (session_01AciCMuth1cZd2DkRivax4t): test runs 406, module lines 3,190
