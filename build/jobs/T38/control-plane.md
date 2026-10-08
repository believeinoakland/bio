# control-plane (T38)

**Status** · session_01L6n1QKr1FBq4RCADwXEj7g · depth 2 · RUNNING until 2026-10-08T19:57:35Z (migrate-released on my branch and on tranche/T38, compared) · handled B3

## Completion

**Entries applied:**
- **T38-16 (N788; K2300, K2318), R67 amended.** `obscuremarkwithdraw` is routed with no route code. The plane spreads `caseCarriageOps` (`plane/store.mjs`:556–558). The `by` stamp comes from op-declarations' `OP_FAMILIES["case-carriage"]` through `OP_STAMPS` (`control-plane/index.mjs`:904–926). The session-only gate comes from the spec's `machineClasses: []` (admission). No file in `src/control-plane/` names the op. Once op-declarations was merged (B3, K2327), the new door test runs over the real declaration. It is `t38-door.test.mjs`, two tests titled R67, in `t37-door.test.mjs`'s pattern. They check:
  - the founder's and a member's session reach case-carriage's route of the op's own name, with `by` and `viewer` from the session;
  - a caller's `by` is never used, whether sent in the address, in the body or not at all;
  - `captureSha`, `mark` and `reason` are kept from the body;
  - every binding class and an `ai` bearer holding every write are refused before any store request;
  - case-carriage's refusal is answered as given.

  The shared drive (`callers`, `routesForSessions`) moved out of `t37-door.test.mjs` into a new helper, `door-routes.mjs`, which both files import. Before the declaration was merged, both tests failed (UNKNOWN_OP).
- **A flaw fixed in this module (R29, R67).** The door deleted a caller's `by` and `viewer` from the address but passed them on in a POST body. So for every op whose `by` or `viewer` the door stamps in the address (`OP_STAMPS`), the owner's map received the caller's own statement of who is acting. Case-carriage reads `by` from the query only, so nothing used the forged value, but R29 says no handler receives one. The body strip (`index.mjs`, at the R17/R29 body block) now also removes those two keys when the op declares them. `t38-door.test.mjs` asserts this. A body `by` on hand-stamped ops (for example `inboxpullfile`, `doorbell.test.mjs`:184) is unchanged, because those ops are not in `OP_STAMPS`.
- **B2 (K2326, from ADMISSION #7 J1).** On a public op, `index.mjs`:654 asked `sourceOf` again whenever the window gave no source. Since T38-24, with the fingerprint key unbound, that is a second store request on a store fault. The fallback now runs only when `KNOCK_FINGERPRINT_KEY` is bound, where `sourceOf` makes the fingerprint in process. Otherwise the source is `null`, as admission R21 states for a store that cannot be asked. I did not drop the fallback outright: with the key bound it keeps the right source on a window fault at no store cost. The new test, titled R58 in `t38-door.test.mjs`, checks:
  - the window's source is stamped when the window answers;
  - on a fault (non-JSON or a throw) with the key unbound, the store is asked once and no source is stamped, the caller's included;
  - with the key bound, a 32-hex fingerprint is stamped and the store is still asked once.

  Negative control: with the old line restored, the test fails ("the store is asked once").

**Deferred:** none.

**Found in other modules:** none caused by this job. The whole plane tree, `node --test test/` in `bio-plane`, ran 9,034 tests: 8,985 pass, 38 fail.
- I re-ran the files holding 37 of the failures on a worktree of `origin/tranche/T38` without my commits (affordances, plane, `conclude-project`, `d526-refusal-order`, `mk6-bundle-names-no-author`, `stats-disclosure`, `fleetbundles`, `row-census`). The same 37 fail by name there (372 tests, 335 pass, 37 fail on both trees).
- The 38th failure, `test/system/migrate-released.test.mjs`, fails alike on both trees (1 test, 0 pass, 1 fail).
- I leave matching all of these to rule 6 to BOB.

**Reading (mechanics §17, option 3; K2304).** The set is over 300 KB: own requirements 48 KB, code 249 KB and tests about 490 KB.
- **Read whole myself:**
  - `build/requirements/control-plane.md`;
  - layer 11's row of `build/layers.md`;
  - K2300 and K2318;
  - `draft-T38-L11.md` §9 and §§0, 2;
  - `t37-door.test.mjs`, the test my entry changes;
  - the used services my entry names: op-declarations R21 and R40, and case-carriage R14;
  - the code my changes touch: `index.mjs`:640–665, :895–935 and :2180–2210; admission's `sourceOf`, `storeSource` and `doorWindowGate`; the case-carriage family in `op-declarations/index.mjs`:405–420; and `plane/store.mjs`:550–566.
- **Read by my workers, every line:** two workers read the rest in full and wrote summaries citing file and line throughout.
  - The code summary (about 2,000 words) covers all four source files, 249,280 bytes: the op's path from request to forward, stamps, class refusals, every hard-coded op list, and the flaws found.
  - The tests summary (about 2,300 words) covers the 40 other test files, 465,541 bytes: the harness, the tests that iterate all ops, a requirement-id map, and weak tests.
- **What the summaries left out:** nothing that mattered. They found the body-`by` pass-through (fixed above) and the `doorbell.test.mjs`:184 assertion, which I checked the fix does not touch.
- **Further weak spots the tests summary named, left as they are, outside this entry:**
  - `routesForSessions` checks a machine refusal only by status and `ok`, not by code;
  - no `contribute`-less session is driven for this op;
  - `r53-routes.test.mjs`:99 silently skips 401s and 403s.

**Tests and checks:**
- `node --test test/m/control-plane/ test/m/op-declarations/` on the merged tranche: 311 tests, 311 pass, 0 fail. `t38-door.test.mjs`: 3 of 3 pass.
- The whole plane tree: as above.
- `checks/format.mjs`: 137 modules, 136 requirements files; 0 failures.
- `checks/architecture.mjs control-plane`: 47 product files, 190 relative imports; 0 failures.
- `checks/coverage.mjs control-plane`: 41 of 41 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs control-plane tranche/T38`: 5 files changed; 0 failures.

Size (session_01L6n1QKr1FBq4RCADwXEj7g): test runs 14, module lines 3,270 (code; tests 6,755)
