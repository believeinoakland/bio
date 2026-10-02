# run-rules (T22)

**Status** · session_01KLQFu3Y8HVYcxxLYqhE1jL · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1; comments only, no behaviour or row changed):
- N471: `checks.mjs`:369–:371 now says C-36 was minted "with the old process's `node tools/mintid.mjs C` (floor C-35; that tool was retired in T19)", in `inquiry-grammar/checks.mjs`:11–:12's form.
- N480: `rules.mjs`:646 (the capability floor applied `if (viaSession)`) and :837 (the `principal` stamp) now name `control-plane/index.mjs`. `rules.mjs`:9's `ai-runs/index.mjs` stays.
- Re-scan of the whole path (N469's kind): `checks.mjs`:375 "the battery" now says it was the old suite runner, `battery.mjs`, since deleted; :398 `civicos-ui/check-refusal-codes.mjs` (deleted in T20) now in the past tense; :330 `kickoffs/WORKER.md` now the old process's (retired). `rules.mjs`:41, :164–:165 and :285 named the deleted `store.mjs` as live: now `ai-runs` (once `store.mjs`). :70's `#schedConsumers` is now the scheduler's consumers (`scheduler/index.mjs`). :777 said `aiRunOpen` relays C-22.7 "from `skillpack.mjs`": it relays it from this module's `./skill-version.mjs`. Every other mention of a deleted file was already past-tense provenance and stays.
- No row's `where` changed, so the census is not touched.

**Deferred:** none.

**Found in other modules:** none. Generated artifacts made stale (REPORT J2): `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs`. Not regenerated.

**Tests and checks** (on `job/T22/run-rules` @ the code commit):
- `node --test bio-plane/test/m/run-rules/`: tests 16, pass 16, fail 0.
- `agent-worker/test/`: tests 8, pass 7, fail 1. `requirements.test.mjs`: 271 passed, 2 failed, both R45 (the static check, and a fresh build byte-identical to the committed bundle): the bundle is stale because `run-rules` changed. On the tranche base without this change: 273 passed, 0 failed. Clears when BOB regenerates the bundle at the layer close.
- `bio-plane/test/m` (all): tests 4846, pass 4782, fail 45, with and without this change, the same 45 tests. All are reds accepted by name in B1: ai-runs (6), intent's fixture (29), affordances `backing.test.mjs` R19, actions `t18.test.mjs`:299, scheduler `plane.test.mjs`:85, queue-producers `proposals.test.mjs` (4), control-plane `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, inquiry `content-legs.test.mjs`:395.
- `format`: 85 modules, 84 requirements files; 0 failures. `architecture run-rules`: 10 product files, 15 relative imports; 0 failures. `coverage run-rules`: 15 of 15 live requirement ids named by a test; 0 failures. `ownership run-rules tranche/T22`: 3 files changed; 0 failures.

Size (session_01KLQFu3Y8HVYcxxLYqhE1jL): test runs 9, module lines 1703

## J1 · REPORT

Generated artifacts made stale by this job's change under bio-plane/src/run-rules/ (comments only in checks.mjs and rules.mjs): bio-plane/dist/bio-plane.bundled.mjs (the plane's bundle) and agent-worker/dist/agent-worker.bundled.mjs (agent-worker's requirements.test.mjs R45 is red on it: 271 passed, 2 failed, both R45; 273/0 without the change). Neither regenerated (manifest, Generated artifacts).
