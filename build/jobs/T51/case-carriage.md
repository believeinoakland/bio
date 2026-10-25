# case-carriage (T51)

**Status** · session_01VR43LyTQS6cPbKEumGEzr6 · depth 2 · WORKING · handled B9

## J1 · BLOCKED

BLOCKED (cause: needs Bob) — one act to unblock: add `setup-words` to case-carriage's `uses` in `build/modules.json`.

Entries applied: T51-70 (the entry's red, #31, and its other work per plan rule 6: the module reads its labels by key).
- `bio-plane/src/case-carriage/checks.mjs`: the seven words the module holds are read from setup-words' list by key (`word`, and placeholders left as written for the screen); no sentence is copied. Pushed as 9f22b3e8f9 on `job/T51/case-carriage`.
- `bio-plane/test/m/case-carriage/marks.test.mjs` (R11): the two literal label assertions and the "BOB's draft" negative control are dropped (they quoted sentences, K3810); the key-to-en check stays.
- No change to any exported value: OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL and the four refusal translations are equal to before.

Deferred: none. Not changed: requirements' wording ("the group holds the original", R11, R14) is BOB's (plan rule 7); a stale "group" in the requirement text is noted, not edited.

Tests (own module, `node --test test/m/case-carriage/*.test.mjs`): 88 tests, 88 pass, 0 fail. case-disclosures `documents.test.mjs` and `photos.test.mjs` (the R22 reds): 23 pass, 0 fail. So the red is green after the change.

Checks (from civicos-process, product /home/user/bio):
- format: 174 modules, 173 requirements files; 0 failures.
- coverage case-carriage: 22 of 22 live requirement ids named by a test; 0 failures.
- ownership case-carriage tranche/T51 job/T51/case-carriage: 2 files changed by case-carriage; 0 failures.
- architecture case-carriage: 1 FAIL, not mine to clear: `bio-plane/src/case-carriage/checks.mjs` imports `setup-words`, which case-carriage does not declare in `uses`. setup-words is layer 1 and uses nothing, so the edge is the only fix. It is in build/modules.json, which this job may not write.

Needs Bob: add "setup-words" to the uses array of the case-carriage entry in build/modules.json (the same act as the other modules that already declare it, e.g. case-checker, membership). Once BOB's commit is on tranche/T51 I will merge it, re-run architecture, and post COMPLETE.

Not opened: a pull request. The job role says open none; BOB merges from the tranche.
Size (session_01X6mu5tbjL2pAmrUPvxveWL): test runs 5, module lines 1660

## J2 · COMPLETE

COMPLETE. J1 BLOCKED is answered by B2: `setup-words` is in case-carriage's uses (merged from tranche/T51 on this branch), and R11's wording is "team" (BOB's edit, merged).

Entries applied: T51-70. checks.mjs reads its seven words by key from setup-words' list (placeholders left for the screen); marks.test.mjs drops the literal sentences (K3810). Deferred: none.

Tests: case-carriage, 88 of 88 pass; case-disclosures documents.test.mjs and photos.test.mjs (R22), 23 of 23 pass; both green after the merge.

Checks (product /home/user/bio): format 0 failures; architecture case-carriage 0 failures (after the merge); coverage case-carriage 22 of 22 live ids named, 0 failures; ownership tranche/T51 to job/T51/case-carriage 0 failures (3 files: checks.mjs, marks.test.mjs, this record).

Found in other modules: none.

Size (session_01X6mu5tbjL2pAmrUPvxveWL): test runs 7, module lines 1660

## J3 · COMPLETE

COMPLETE. T51-225 (words, K3949 and K3957) is applied on `job/T51/case-carriage` at a223553815, merged with `tranche/T51` (6c98dc6386). Entries applied: T51-225. Deferred: none.

**Applied.** Every finding in `build/plan/words-pass/case-carriage.md` is fixed; the words check reports no case-carriage finding.
- `index.mjs`: the member-read refusal details that were inline sentences are now `localize("case-carriage.index.<slug>", en, vars)`. The ids are new and fixed once: `no_photo_you_can_see` (4 sites), `a_mark_is_made_by`, `that_capture_is_not`, `areas_is_not_a_list`, `area_i_is_not_an` (`{i}`, the inline finding), `a_mark_is_withdrawn`, `no_mark_of_that`, `an_area_lies_wholly`, `no_evidence_store_is`, `no_provenance_onreceipt`. The plain findings' other sentences were already read by key.
- Tests: `archive.test.mjs` takes `authority_basis` from `word("acquisition.authority_basis.file_cut_out", { at })`, the acquisition module's own declared key. `obscured.test.mjs` compares with `word("photo.state.nothing")`. `documents.test.mjs` and `marks.test.mjs` have the copied "the original is unchanged" assertion message reworded to "original digest unchanged".

**Judgment calls (for BOB to confirm or move).**
1. `index.mjs:1190`, the `NO_RECEIPT_NOTICE` detail in `start()`, is a developer diagnostic. I converted it to `localize` rather than listing it as a REPORT, because its sibling `REGISTRATION_UNANSWERED` at `index.mjs:1195` is already localized, and `faults()` is the surface that answers it. If BOB rules it developer-only, it moves to `unkeyed`.
2. `documents.test.mjs:440` (the R18 case) compares the detail with `localize(id, en)` by equality, the form K3810 allows, so the test holds no copy.
3. The rewording in (Tests) above is my choice: no row carries the "original is unchanged" sentence in full, so there was no `word(key)` to read.

**Found in other modules (P9; for BOB).** The full `checks/run.mjs` run reports failures outside case-carriage: the words check has 2,248 failures across modules; coverage has 25 failures across modules, none in case-carriage. In `wizard-scripts` the words check flags test copies at `t47.test.mjs:92, 141, 142, 150, 152, 221, 237`, `t48.test.mjs:55, 142, 169, 170, 180, 198` and `writing-help.test.mjs:204, 205`. Not changed by this job.

**Checks (from civicos-process, product /home/user/bio, after the merge).**
- format: 176 modules, 175 requirements files; 0 failures.
- architecture case-carriage: 0 failures.
- coverage case-carriage: 22 of 22 live requirement ids named by a test; 0 failures.
- ownership `case-carriage` `tranche/T51` → `job/T51/case-carriage`: 6 files changed by case-carriage; 0 failures.
- words: no finding in case-carriage (`checks/words.mjs`).
- `setup-words/build.mjs --check`: exits 1 with a stale-rows note naming the new ids (`rows.mjs` is stale until the layer close). This is the expected note, not a refusal.
- Module tests (`node --test test/m/case-carriage/*.test.mjs`): 88 of 88 pass, 0 fail, after the merge.
- `checks/run.mjs`: 0 failures in format and architecture; the other failures are the other-module findings above.

Size (session_013V7QhsFKttVRZGCkN2oybJ): test runs 4, module lines 1659

## J4 · COMPLETE

COMPLETE: B4 (G9 provider). case-carriage gains `copyNow`, the awaited, bounded `copyBatch` for named documents.

**What changed** (`bio-plane/src/case-carriage/index.mjs`; commit on `job/T51/case-carriage`)
- :101 `COPY_NOW_MAX_BYTES` (2 MiB, exported).
- `copyNow({shas, maxBytes})` (:1301) and `#copyNow` (:1307). Of `shas` it takes those queued; each is made exactly as `copyBatch` makes it (same `#copyOne`, same recording, same `DOCUMENT_COPY_NO_STORE` refusal with no store or bucket). A document over `maxBytes` (capped at 2 MiB), by its register byte count or the store's `head` size, is answered `skipped`: not read, left queued for the alarm. It ignores the retry delay (the act asked), is serial with `copyBatch` (same chain), never rejects. Answer `{ok, copied, clean, public, refused, failed, skipped, remaining}`.
- `#copyRows` (:1270): the per-document loop, moved out of `#copyBatch` unchanged and shared. `copyBatch`'s answer keeps its shape (no `skipped`).
- `#copyOne` takes `maxBytes` (default unbounded, so `copyBatch` behaves as before).
- `documentCopy` is unchanged and synchronous. `copyNow` is a service, not an op: no route, nothing to declare (K4208); `DECLARED_OPS` unchanged.

**Live binding** (asked by the START): yes, the live worker binds both. `plane/store.mjs:163` hands record-core `env.CAPTURES` as its evidence bucket (so `evidenceStore()` is non-null), and `store.mjs:283` hands publication `bucket: env.CAPTURES`, which its factory forwards to this module (`publication/index.mjs:285`); `bio-plane/wrangler.jsonc:42` binds `CAPTURES`. So `copyWake` is null only if `CAPTURES` is missing. The re-walk checks it live.

**Tests** (`bio-plane/test/m/case-carriage/documents.test.mjs`, both named R15)
1. "copyNow: a queued 356-byte text document is made in the act...": queue a 356-byte text file and a 5 MB one; `documentCopy` answers `pending` (the prepare's own answer); `copyNow` answers the small one `clean` (`{clean: 1, skipped: 1, remaining: 1}`), the next `documentCopy` answers `clean` with no scheduler tick; the 5 MB one is never read (no `get` on it), stays queued and `copyBatch` (the alarm) makes it.
2. "copyNow keeps copyBatch's rules": only named and queued documents; a copy is held as `copyBatch` holds it; a doc-clean refusal is recorded; `maxBytes: 1e12` is held to 2 MiB; a failed read leaves it queued; no store: `DOCUMENT_COPY_NO_STORE`, nothing written; bad arguments never reject.
Red then green: before the change the file failed to load (`COPY_NOW_MAX_BYTES` and `copyNow` do not exist; SyntaxError on the import), after it both pass. The through-the-door walker case (the real `publish` op over case-carriage and case-disclosures) is case-authoring's seam test, G9 owner; it is written first and stays red by its name until this merges. Why missed: documents tests drive `copyBatch` by hand.

**Measurements:** none needed (plan G9 (4) is N): the bound is 2 MiB, one awaited R2 read plus doc-clean on at most 2 MiB; P at the re-walk.

**Suites** (`node --test --test-force-exit`): case-carriage 92 tests, 92 pass, 0 fail. Users: case-disclosures + case-check 143/143; scheduler + publication + case-authoring 514 pass, 0 fail, 1 todo (already there). `impact.mjs` names 980 test files because `DECLARED_OPS` is a shared table; I ran the modules that call this module's copy path, not all 980.

**Checks** (`checks/run.mjs`): architecture 0 failures; coverage 6617 of 6617 ids; words 0 failures, no finding in my module (inline 0, plain 0, testcopy 0); channels 0 failures; ownership case-carriage `tranche/T51..job/T51/case-carriage`: 1 file changed... 0 failures. format: 1 failure, `build/plan/next.md:38` (N1265 names no P19 hard reason), BOB's file, not mine, not caused by this job.

**Proposed requirement lines** (BOB writes `build/requirements/`), under R15 after copyBatch:
- **copyNow.** `copyNow({shas, maxBytes})` (no route; `case-authoring`'s prepare) makes the queued documents among `shas` as `copyBatch` does, awaited, ignoring the retry delay, except a document whose register byte count or stored size is over `maxBytes` (default and bound `COPY_NOW_MAX_BYTES`, 2 MiB, exported), which it leaves queued unread for the alarm. It answers `{ok: true, copied, clean, public, refused, failed, skipped, remaining}` or `DOCUMENT_COPY_NO_STORE`; it is serial with `copyBatch`, never rejects, and `documentCopy` stays synchronous. Controls: a 356-byte text document is `clean` after it with no tick; a 5 MB document is skipped, never read, and the alarm makes it.
- Header: "Last changed T51 (G9: R15)" and the R23 note unchanged.

**Words:** no new sentence; no row owed.
Deferred: none. Found in another module: none. No QUESTION open.
Size (session_01TiUC4aAJHXVFiQ6sXRqvjg): test runs 9, module lines 1706

## G47t (CASE-CARRIAGE #15, session_01C7Ti52rsnFVf8d7G9TFirt; B6)

**Changed** (`bio-plane/src/case-carriage/index.mjs`, `holdMaterials`): a per-call `capture` variable set to the material's sha at the top of the loop (:246); `hold` stamps `capture_sha` on the `files` entry of kind `attestation` only (an archive's tokens are held inside the same iteration, so they carry the member's sha); `named` is now a Map from `(sha, ref)` to the pushed entry, and `stamped` keeps the set of captures that named each token: a second, different capture sets that entry's `capture_sha` to null, never back (A, B, A ends null); the same capture again changes nothing. No other answer, text or table write changed. Nothing stored by me changes (R-OLD); no census op changes (`DECLARED_OPS` untouched).

**Failing-first** `test/m/case-carriage/g47t-token.test.mjs` (6 tests; (a) two captures of one ref, (b) shared token both orders, (c) archive token = member's sha, (d) duplicated row, provenance+archive of one capture, A, B, A, (e) single capture, controls: observation/token-less document and non-attestation kinds carry no key). Seen red with `index.mjs` reverted: 5 fail (the control passes); green with it: 6/6. `archive.test.mjs`:129 (the existing full-entry check of an archive token) accounts for the new key (`capture_sha: memberSha`); the `hold.test.mjs` token test compares fields, passes unchanged.

**Suites:** case-carriage 98/98; users: publication 158 (157 pass, 0 fail, 1 todo already there), public-read 244/244. `impact.mjs` lists the shared-table fan-out; the only readers of `files` are those two.

**Checks:** `checks/run.mjs`: format, architecture, coverage (6685 of 6685), channels, words all 0 failures (words count not risen); ownership `origin/tranche/T51..job/T51/case-carriage`: 0 failures.

**Proposed lines** (BOB writes): R1's `files` bullet (requirements/case-carriage.md:38) gains: "A `files` entry of kind `attestation` also carries `capture_sha`, the lowercase SHA-256 of the capture it stamps (an archive's token: the member material it is shown under); null when two different captures named that token in the call. No other kind carries the key." And "For callers" (:158): `publication` registers `capture_sha` beside each token (G47t). Header: "Last changed T51 fix round 6 (G9: R15; G47t: R1)".

**Words:** no new sentence. Census ops: none changes. Deferred: none. Found in another module: none. No QUESTION open.
Size (session_01C7Ti52rsnFVf8d7G9TFirt): test runs 7, module lines 1715

## J5 · COMPLETE

COMPLETE (G47t, B6): every attestation token's files entry now carries capture_sha (the capture's sha, lowercase; an archive's token: the member's); null when two different captures name it (A, B, A stays null); other kinds carry no key. index.mjs holdMaterials; g47t-token.test.mjs 6 tests seen red (5 fail with the change reverted) then green; archive.test.mjs:129 accounts for the key. Suites: case-carriage 98/98, publication 157 pass 0 fail 1 todo, public-read 244/244. checks/run.mjs 0 failures; ownership 0 failures. Census ops: none changes. Proposed requirement lines are in my record. Nothing deferred, no QUESTION open.

## Round 9 · G136c (case-carriage #16, session_01VyoeUd2RteSyDN2p9gjFYw)

Entry: G136c's case-carriage piece, `tried` stamped before the clean (X21). R14 (BOB's amendment) concerns `READ_BOUNDS` and touches no code of this module (it holds none of those three figures).

1. Root cause: `bio-plane/src/case-carriage/index.mjs` `#copyRows` stamped `tried` only after `#copyOne` returned, so a cleaner that dies mid-clean (worker killed, no throw) left `tried` null and `copyWake` answered `now` on every wake.
2. Why the tests missed it: every R15 test cleaned to completion or failed on the read; none looked at the queue row while the clean ran. Gap fixed by the test below, which reads the row inside the clean.
3. Fix: `#copyOne` stamps `tried` in `document_copy_queue` immediately before `this.clean(bytes)` (after the cheap gates: photo, fetched, too large, skipped, bytes read and verified, so a skipped or refused-unread document is not stamped). A failure to stamp counts as `failed`. Both `copyBatch` and `copyNow` go through it. A successful clean after a stamped attempt stores as before (the queue row is deleted).
4. Failing-first test (`documents.test.mjs`, R15 G136c): RED `AssertionError [ERR_ASSERTION]: tried is stamped before the clean is called`; green after. It also checks: a throwing clean is called once, `copyWake` = now + `DOCUMENT_COPY_RETRY_MS`, the next wake does not call it, it is called again at the back-off; `copyNow` stamps before.
   DOCS C1 (real merged doc-clean, 70,009-entry DOCX, crash after the work): attempted once, not looped, copy made at the back-off, written entry count (ZIP64 field) equal to the read count. Green.
5. Platform check: **L** (local). No P step.
New ids: none. Requirement wording proposed: none. Words: no new sentence. Files outside paths: none. Generated artifacts made stale: none.
Deferred / found in other modules: none.

Tests: `cd bio-plane && node --test --test-force-exit test/m/case-carriage/`: 100 tests, 100 pass, 0 fail. Users: scheduler 163 pass, case-authoring 249 pass, 0 fail (`impact.mjs origin/tranche/T51 HEAD` names publication, public-read, ratification et al. through the shared DECLARED_OPS table, which I did not change).
Checks: format 0 failures; architecture (case-carriage) 16 files, 0 failures (the first run failed on a test import of `ooxml`, which I removed); coverage case-carriage 23 of 23, 0 failures; words case-carriage 0 failures; ownership 0 failures.

Size (session_01VyoeUd2RteSyDN2p9gjFYw): test runs 9, module lines 1718

## J6 · COMPLETE

COMPLETE · G136c (case-carriage piece): tried is stamped before the clean runs (case-carriage/index.mjs #copyOne). Failing-first test seen red then green; DOCS C1 (70,009-entry DOCX, crash after the work) green with merged doc-clean. Module 100/100, scheduler 163/163, case-authoring 249/249; format, architecture, coverage, words, ownership 0 failures for my files. New ids none; files outside paths none; stale artifacts none; nothing deferred. Record: build/jobs/T51/case-carriage.md 'Round 9'.

## J7 · COMPLETE

COMPLETE (fix round 10, Wave A batch 2; START B8). Commit `01b9b9d0f1` on `job/T51/case-carriage`, pushed.

**Entries applied.** The three published fixtures, in `bio-plane/test/m/case-carriage/fixtures.mjs`. Each is made by the module's real code when the test runs and is never stored. `fixtures.test.mjs` calls each and checks the real answer (3 tests).
- `copyReadStates()` (async), users now case-disclosures 1: answers `{copy, photo, refused, undetermined, unknown}`, each `{capture, answer}` with `answer` as `documentCopy` gives it. `copy` is `{state: "copy", copy, refused: null, obscured: {copy, label: COPY_CLEANED_LABEL, kind: "document"}}`. `photo` is `{state: "photo"}`. `refused` is `IMAGE_NOT_CLEANABLE`. `undetermined` is the state with its table unreadable. `unknown` is `pending` (see Found).
- `copyTickRefusals()` (async), users now scheduler 1: answers `{capture, batch, wake, queued}`. `batch` is DOCUMENT_COPY_NO_STORE (C-141.11), `wake` is null, and `queued` holds the document untried.
- `onCopyWorkRegistrarRefusals()`, users now scheduler 1: answers `{first, twice, malformed}`, the first `{ok: true, module}`, then LISTENER_DECLARED and LISTENER_MALFORMED.

**Shared helper moved.** `supplied()` moves from `documents.test.mjs` into `fixture.mjs`, exported. `documents.test.mjs` imports it. No test changes meaning.

**Causes.** None: a fixture job. **Deferred.** None.

**Markers added (K5060).** None (no `fixtures-own` or `fixtures-generic`). **Words.** No new sentence.

**Found in this module (a question for BOB; not changed).** `documentCopy` on a digest the record holds nowhere queues it (R16: "a miss is queued") and answers `pending`. `copyBatch` then reads nothing, answers failed, and retries it every `DOCUMENT_COPY_RETRY_MS` for ever, so the queue never drains. This is from reading `documentCopy`, `#enqueue` and `#copyOne` in `index.mjs`, not from running it. The `unknown` fixture makes exactly this row. Is a digest the register does not hold a member document to queue? My recommendation: no. A digest with no capture should be answered `undetermined` (or a refusal) and queue nothing. That is BOB's call; I have changed nothing.

**Found in other modules.** None. The users' hand-built answers stay for their own jobs, as the START says.

**Tests.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/case-carriage/*.test.mjs`: 103 tests, 103 pass, 0 fail (100 before, plus the 3 fixture tests). Modules that import `fixture.mjs` from outside: `scheduler/copies`, `affordances/t38-backing`, `plane/t51`, `plane/disclosures`: 28 pass, 0 fail.

**Checks** (civicos-process, product `/home/user/bio`, absolute root: the relative `.` root reads nothing, K5066):
- format: 178 modules, 178 requirements files; 0 failures.
- architecture case-carriage: 16 product files; 0 failures.
- coverage case-carriage: 23 of 23 live requirement ids named by a test; 0 failures.
- words case-carriage: 0 failures.
- ownership case-carriage `tranche/T51` to `job/T51/case-carriage`: 5 files changed by case-carriage; 0 failures.
- fixtures case-carriage `--list`: 0 failures (the module has no live lines of its own).
- impact `origin/tranche/T51 HEAD`: names 119 modules and 2084 test files, from the tranche's own movement. My change reaches only the tests that import `fixture.mjs`, run above. I did not run the 2084.

Size (session_016jr2sKapnMAJpzphgBXm9Q): test runs 5, module lines 1719

## Fix round 10, follow-up 14: cause R24 (b2), the filing stall (START B9; CASE-CARRIAGE #18)

**Root cause.** `index.mjs` `#copyOne` (the read of a queued document's bytes) verified them with `createSha256().update(bytes).hex()`, the one-shot pure-JS SHA-256 of `record-grammar`, run synchronously over the whole file. Over an 8 MB text that held the object's thread for about half of the stretch (PLANE #61 J62's profile: 524 ms, 268 ms with a native digest). The same pattern verified an original in `#original` (photo, up to `COVER_MAX_BYTES`) and digested a derived copy's bytes in `#derive` and `#copyOne`.

**Why the tests missed it.** No test measured the work of a large copy: every copy test used a document of a few hundred bytes to 5 MB that `copyNow` skips unread, and none counted which digest ran.

**Change.** `NATIVE_DIGEST_MIN_BYTES` (1 MiB, exported) and one method `#digest(bytes)`: over the bound it asks `crypto.subtle.digest('SHA-256', ...)` (the constructor's `nativeDigest` seam), else, or when the native digest throws or answers anything but 64 hex digits, the pure-JS hash (the `jsDigest` seam). Both answer the same lower-case hex, so the identifier is unchanged (R-OLD: nothing stored changes). It replaces the four `createSha256().update(bytes).hex()` calls over file bytes (`#original`, `#derive`'s cover, `#copyOne`'s read check and its copy). `shaOf` (short text strings) is unchanged.

**Tests** (`copy-digest.test.mjs`, new; `fixture.mjs`'s `world(extra)` passes deps through, so a test supplies the counting seam). Failing first: seen red (native digest asked 0 times, not once) against the old code with only the constant added.
- R15: a 2 MiB document: native digest called once with 2 MiB, pure-JS zero; the document is made `clean`; its digest equals node's SHA-256 of the input and the old pure-JS output (byte for byte).
- Controls: a 356-byte document: JS once, native zero, same digest as before; exactly 1 MiB is small, 1 MiB + 1 is large; native throwing, or answering "not a digest", falls back to the pure-JS hash with the same result; stored bytes that are not the capture's digest are still `failed` and stay queued, over the bound too.

**Owed by plane (named for BOB).** `r10-filing-stall`, plane's own platform-side check (plane's tests, merged with plane's coupled merge): not mine, not run here.

**For BOB (requirements).** R15 says nothing of how the bytes are digested; it may want one clause (the native digest over 1 MiB, the same digest). I changed no requirement.

**Deferred.** None. **Found in other modules.** None (`record-grammar`'s `createSha256` stays pure-JS for small inputs by design; other modules that hash large bytes with it are not mine to judge).

**Markers added (K5060).** None (no `fixtures-own` or `fixtures-generic`). **Words.** No new sentence.

**Tests run.** case-carriage: 106 tests, 106 pass, 0 fail (103 before, plus 3). Impact set, modules using case-carriage: case-disclosures 115/115, case-authoring 256/256, case-check 34/34, scheduler 185/185, public-read 307/307, publication 179 pass of 180 (0 fail; the rest not a fail). Not run: affordances, op-declarations, answer-envelope, control-plane, plane (they reach this module only through its declared ops, unchanged).
**Checks** (civicos-process, absolute root `/home/user/bio`): format: 0 failures; architecture case-carriage: 18 product files, 0 failures; coverage case-carriage: 23 of 23 ids named, 0 failures; ownership: see the push; `checks/run.mjs`: fixtures 2622 failures and words 1 failure (progressions) are inherited, identical with my change stashed, none in my files.

Size (session_01VR43LyTQS6cPbKEumGEzr6): test runs 12, module lines 1740
