# reevaluation (T51)

**Status** · session_01CnPVmtafMcWuWKG1dLeF7L · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-224 (words) done. Commit 601a2b9d78 on job/T51/reevaluation.

**Entries applied**
- The 7 findings in `build/plan/words-pass/reevaluation.md`, the 19 `plain` findings and the 1 test copy of a code sentence in that file, all fixed by the words rule.
- The words check on the module as it stood at my START reported 32 failures (the conversion's left findings, plus the `copy` and `stitched` arms the check now counts). All are fixed: 28 sentences in `bio-plane/src/reevaluation/index.mjs` moved to keyed `localize` calls (`reevaluation.index.*`), the inline pieces of the leg-rests-on-group detail (key not listed, taken back) moved to their own keys, and the three test files now compare with `word`, `localize` or the translation key, never the text. The new ids are `reevaluation.index.<slug>`, fixed once.
- No string was judged unread by a member, so nothing is listed as unkeyed.

**Deferred:** none.

**Found in other modules (for BOB, not changed here):**
- `bio-plane/src/op-declarations/index.mjs:2511` and `bio-plane/src/queue-producers/index.mjs:1473` are flagged by the words check (`inline`). Each carries a sentence that cites reevaluation's text; they belong to their own modules.
- `checks/run.mjs` reports 25 coverage failures and 2,281 words failures across other modules; none is in reevaluation.

**Tests and checks**
- `node --test bio-plane/test/m/reevaluation/`: 145 tests, 145 pass.
- `node checks/words.mjs /home/user/bio reevaluation`: 0 failures (was 32).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio reevaluation`: 0 failures.
- `node checks/coverage.mjs /home/user/bio reevaluation`: 38 of 38 live requirement ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio reevaluation tranche/T51 job/T51/reevaluation`: 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: only the expected stale-rows note, naming the new `reevaluation.index.*` rows. No refusal names reevaluation.
- `node checks/run.mjs /home/user/bio`: its format and architecture arms report 0 failures; nothing in reevaluation is among its words or coverage findings.

Size (session_01LKowRiQWBdmqmB6pqf1KTq): test runs 2, module lines 3383 (index.mjs 3004, checks.mjs 171, schema.mjs 208).

## J2 · QUESTION

G36 (C69's "newer version" item): the seam is GREEN through the real Store; no change to reevaluation is needed. One placement I need from you.

**Result.** I drove the walker's chain through the real Durable Object (every module real): `acquire` a page, file it as the promotion files it, read it (`readHeld`), mark the passage (`op=contentmint`), rest an inquiry on it, wait one second, `acquire` the page again and file/read it, restart the object over a spent alarm (48 h old, older than every consumer's wake), fire the alarm as the platform does, read `op=queue`. On the merged tree: the restart sets the alarm afresh, `noticeSweep` raises one notice `(holder, content_id, capture_sha, newer_capture)` and `op=queue` holds `FINDING::newer-capture-affects-reference::<notice id>`; the sweep rests afterwards. Both orders of "newer capture read before / after the sweep" give the item. Control: the same recapture with no question on a passage raises nothing and the sweep is not pending. **Red on the deployed code `5ff8b5e01b`** (worktree): the two chain tests fail at "the restart set the alarm afresh" (the alarm stays the spent one, so nothing ever fires); the control passes. So the cause is the dead alarm (scheduler, merged), and `sweep.test.mjs`'s stand-in host is why the tests missed it; the gap is this seam test. No change to the module's code.

**What I need (the smallest thing).** The test cannot live in `bio-plane/test/m/reevaluation/`: it needs the plane's `Store` (plane is later in the order) and `capture`/`extraction` (not in my uses); `checks/architecture.mjs` refuses it (4 failures), and I may not write plane's tests. I committed it at **5767968f14** (`bio-plane/test/m/reevaluation/seam.test.mjs`, 3 tests, 153/153 of my suite green beside it) and took it off my head in the next commit so my branch passes its checks. As with extraction's round-6 seams (plane #51 took them over), please have the plane job (or you) take that file into `bio-plane/test/m/plane/` (rename e.g. `round6-reevaluation.test.mjs`; its imports are `../plane/fixture.mjs` -> `./fixture.mjs`, `./fixture.mjs` (reevaluation's `inquiryMd`, `infoMd`) -> import from `../reevaluation/fixture.mjs`, or inline the two md builders), with `git show 5767968f14:bio-plane/test/m/reevaluation/seam.test.mjs`. Its titles name R14 and R25. Say if you would rather I keep it here with `capture` and `extraction` added to reevaluation's uses and the plane import replaced; I do not see how, since plane's Store is the only real object.

Best reading: plane takes the file over. Meanwhile there is nothing else in my entry; I wait.
