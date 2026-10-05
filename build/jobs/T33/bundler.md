# bundler (T33)

**Status** · session_01DSV3uLxG8oafXGYk7RWyay · depth 2 · WORKING · handled B3

## J1 · REPORT

T33-18a prepared and pushed on job/T33/bundler: fleetbundles.test.mjs pins [agent-worker, ocr-worker, pdf-worker, sheet-worker] and GUARDED_FLOOR = 4. job/T33/sheet-worker has no sheet-worker/ files yet, so the test cannot run green until SHEET-WORKER #1 merges into tranche/T33. Send a CHANGE (or RESUME) when it has merged; I then merge tranche/T33, run the test against the marker file, run the checks and post COMPLETE. Note for that run: section 7's boot list names only the three existing members; sheet-worker is walked by every generic per-member arm (static, byte, externals) but not booted under workerd. I will add it to the boot list if its /version answers {name, version} like the others, and say so in COMPLETE.

## J2 · REPORT

K1514 (B2) applied, pushed on job/T33/bundler (tranche/T33 merged first). R13: deriveBindings no longer takes or emits any Claude credential; deploy.mjs no longer sends INSTANCE_CLAUDE_TOKEN and, when one is set in the operator's environment, prints that it is IGNORED (never its value). Tests: release.test.mjs R13 and R18 now assert that no Claude binding is derived or sent even when one is offered; deploybindings.test.mjs's cascade block is now 'R13: no Claude credential is derived, whether or not one is offered'. Own fix found on the merge: signatures' T33-7 made src/sshsig.mjs import record-grammar, which broke my fixture repo (6 reds: R16, R22 x3, R23 x2). test/m/bundler/repo.mjs now copies sshsig's whole relative-import closure. Results: node --test test/m/bundler 45 pass / 0 fail; deploybindings 37/0; resolveversion 11/0; bundle.test livefire 19/19; checks format, architecture, coverage (23/23), ownership all 0 failures. fleetbundles: 91 pass / 7 fail. Two are T33-18a's pins, waiting on sheet-worker. Five are stale generated bundles, not mine to write (mechanics §14): agent-worker (../bio-plane/src/tokens.mjs) and bio-plane (docprofile, office-readers, odf, record-grammar, sshsig/signpage, tokens: other modules' T33 changes, staled before my change; my edits touch only scripts/, which no bundle includes). Those are yours to regenerate at L1's close (node bio-plane/scripts/bundles.mjs). Note: keep_bindings still preserves any INSTANCE_CLAUDE_TOKEN already on an instance; removing one is an instance act, not R13's. Waiting on your CHANGE after SHEET-WORKER #1 merges.

## Completion

**Entries applied.**
- T33-18a (K1513, K1531): `fleetbundles.test.mjs` pins the members `[agent-worker, ocr-worker, pdf-worker, sheet-worker]` and `GUARDED_FLOOR = 4`. Its workerd boot section now also boots `sheet-worker` with its wasm part and asks `engine_loaded` (K1515). `resolveversion.test.mjs` ARM 7b is re-pinned to the plane and four members, 10 sites (K1531).
- K1514 (B2), R13: `deriveBindings` takes and emits no Claude credential. `deploy.mjs` never sends `INSTANCE_CLAUDE_TOKEN` and names one in the environment as ignored, without printing its value. Tests: `release.test.mjs` R13 and R18, and `deploybindings.test.mjs`'s R13 block, assert the absence even when one is offered.
- An own fix: `test/m/bundler/repo.mjs` copies the whole relative-import closure of signatures' `src/sshsig.mjs`. It imports record-grammar since T33-7, which had made the R16, R22 and R23 fixture tests red.

**Deferred.** None.

**Found in other modules.** None of these are defects of mine.
- The committed bundles of agent-worker and bio-plane are stale against other modules' T33 changes: tokens, docprofile, office-readers, odf, record-grammar, sshsig and signpage. They are generated artifacts and BOB's to regenerate at L1's close (B4).
- A deploy keeps the instance's `secret_text`, so an `INSTANCE_CLAUDE_TOKEN` already on an instance stays until it is removed there. That is an instance act, not R13's.

**Tests and checks.**
- `node --test bio-plane/test/m/bundler/`: tests 45, pass 45, fail 0.
- `resolveversion`: 11 pass, 0 fail.
- `deploybindings`: 37 passed, 0 failed.
- `bundle.test` livefire: 19/19.
- `fleetbundles`: 105 pass, 5 fail. All 5 are the stale agent-worker and bio-plane bundles above. Every sheet-worker arm passes: static, byte, sensitivity, externals and boot. The member pin and the floor pass too.
- Checks: format 0 failures; architecture 0 failures; coverage 23 of 23, 0 failures; ownership 7 files, 0 failures.

Size (session_01DSV3uLxG8oafXGYk7RWyay): test runs 12, module lines 2442
