# hypotheses (T46)

**Status** · session_01MXHAyHBp7fQrcxs8MPUFgy · depth 2 · COMPLETE · handled B2

## Completion (HYPOTHESES #7)

**Reading set** (mechanics §17): measured at START at 467 KB with my tests, under 600 KB. I read all of it myself: `build/requirements/hypotheses.md`; the plan's entry T46-65; the layer contracts in `build/layers.md`; every file of `bio-plane/src/hypotheses/` (`index.mjs`, `schema.mjs`, `checks.mjs`) and of `bio-plane/test/m/hypotheses/` (the fixture and all eight test files), not only what I changed (P20). For the plane's runtime I also read `src/plane/store.mjs`'s constructor (where `hypothesesOf` is built at boot) and the plane suites' Miniflare harness (scheduler, capture-requests' `plane-world.mjs`, `test/sandbox.mjs`). K2926 is the cause.

**Entry applied** (T46-65; commit 8a5a73fb8f).
- R23: the one-word fix from the cut (`CREATE TABLE member_notes_map`, not `TEMP`, created and dropped inside the renumbering's one transaction) was already on the tranche. It is now held by a test on workerd. `workerd.test.mjs` boots the plane's own Durable Object (`Store` from `src/plane/store.mjs`, unchanged) under Miniflare with SQLite storage. `workerd-entry.mjs` seeds the store before the plane's constructor runs, in two shapes. (a) The notes are numbered from one AUTOINCREMENT sequence shared across members, as 0.81.0 left them: seven notes from two members, interleaved; two deleted; five turns, two of them on one note; `revised` set on some. (b) The same notes in T34's shape, without `revised`. There is also a fresh store. The test checks:
  - the runtime itself refuses `CREATE TEMP TABLE` with `SQLITE_AUTH`;
  - each member's notes are renumbered from 1, with `text`, `at` and `revised` kept and the turns following their notes;
  - the store is keyed by `(member, note_id)`, each member's mark is set, and no `sqlite_sequence` row, working map, old table or old index is left;
  - the acts carry on from each member's own mark; deleting a note takes its turns with it;
  - after a real restart (workerd stopped and started over the persisted storage, so the plane's constructor runs again) the store is unchanged and a deleted number is never taken again;
  - the T34-shaped store gains `revised` and is renumbered too.
- **Negative control, measured:** with the cut's defect put back (`CREATE TEMP TABLE member_notes_map`), the two renumbering tests fail with `Error: not authorized: SQLITE_AUTH`, as 0.82.0 did on biosmoke7, and the fresh-store test passes. The source was restored afterwards, sha256 `00630587…` identical. The existing node:sqlite suite cannot see this defect, because node:sqlite allows `TEMP`.
- R14 read whole against the fix: the renumbering keeps no old number, no shared mark and no copy, and it runs as one act. That still holds, now on workerd as well. In `index.mjs` I changed only a comment on `#renumberNotes`, naming R23.

**Flaws found in this module (P8).** I found none needing a change after reading the code and tests whole. The renumbering's other statements (`ROW_NUMBER() OVER`, `CREATE TABLE … AS`, `ALTER … RENAME`, `DELETE FROM sqlite_sequence`, `PRAGMA table_info`, `ALTER … ADD COLUMN`) are now shown to be authorized on workerd by the test itself.

**Tests and checks run.**
- `node --test bio-plane/test/m/hypotheses/`: tests 51, pass 51, fail 0 (the 48 earlier tests plus 3 new ones, about 25 s for the workerd file). The manifest names no layer tests. I changed no service, so no user's suites are owed (JOB step 5).
- `format`: 0 failures (159 modules). `architecture hypotheses`: 0 failures. `coverage hypotheses`: 23 of 23 live ids, 0 failures. `ownership hypotheses tranche/T46`: 4 files, 0 failures.

**Deferred.** None.

**Found in other modules.**
- Generated artifact (§14), not mine to write: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is staled by my comment-only change to `src/hypotheses/index.mjs`. Regenerating it at layer close covers it.
- Requirements: R23's `*(not yet met: T46)*` marker is BOB's to strike.

Size (session_01MXHAyHBp7fQrcxs8MPUFgy): test runs 5, module lines 1110

## J1 · COMPLETE

T46-65 complete (8a5a73fb8f; record 7cd5df844e). R23 held by test on workerd: workerd.test.mjs boots the plane's own Durable Object (Store, unchanged) under Miniflare over a store seeded before the constructor runs: notes numbered from the shared AUTOINCREMENT sequence (2 members interleaved, 2 deleted, 5 turns, revised set), the same in T34's shape without revised, and a fresh store. Asserts: the runtime refuses CREATE TEMP TABLE (SQLITE_AUTH); each member renumbered from 1, turns following, marks set, no sqlite_sequence row/working map/old table or index left; acts continue from each member's mark; a real restart over persisted storage changes nothing; T34 shape gains revised. Negative control measured: with CREATE TEMP TABLE put back, the two renumbering tests fail 'not authorized: SQLITE_AUTH' (as 0.82.0), the fresh test passes; source restored, sha identical. Source change: one comment on #renumberNotes naming R23. P8: no flaw found. hypotheses 51/51 (48 + 3); format, architecture, coverage (23/23), ownership (4 files) 0 failures; no service changed. Stales the plane bundle (comment-only; §14, layer close). R23's not-yet-met marker is BOB's to strike.

## Change B2 (K2950; HYPOTHESES #7)

**Applied** (commit 75670089cd, after merging `tranche/T46`). R23's workerd test no longer boots the plane's `Store` (layer 11, P4). `workerd-entry.mjs` is now a Durable Object of this module's own (`cloudflare:workers`' `DurableObject`). It boots `hypotheses` over Durable Object SQLite as the plane does: `recordOf(ctx).migrate()`, `membershipOf(ctx).migrate()`, then `hypothesesOf(ctx)`, whose making runs every boot migration of this module, R14's renumbering among them. It imports nothing later in the order. The seeded shapes are unchanged: interleaved members, deletions, five turns, T34's shape, a fresh store. The TEMP refusal, the real restart and every assertion are kept. `workerd.test.mjs` imports `test-support` (`stdio.mjs`, `sandbox.mjs`), now a declared use.

**Negative control, re-measured:** with `CREATE TEMP TABLE member_notes_map` put back, the two renumbering tests fail `not authorized: SQLITE_AUTH` and the fresh-store test passes. The source was restored, sha256 `0ed74b83…` identical before and after.

**Ran.** `node --test bio-plane/test/m/hypotheses/`: tests 51, pass 51, fail 0. `checks/run.mjs .`: format 0 failures; architecture 0 failures (2,944 product files); channels 0 failures. Coverage has 8 failures, none of them this module's (agent-harness R10, agent-worker R79 R80, ai-runs R78, case-account R15 R16, case-authoring R73, case-carriage R19–R21, installer R48, skills R47 R48: other modules' open entries). `ownership hypotheses origin/tranche/T46`: 0 failures.

Size (session_01MXHAyHBp7fQrcxs8MPUFgy): test runs 8, module lines 1110
