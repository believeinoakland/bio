# case-carriage (T51)

**Status** · session_01TiUC4aAJHXVFiQ6sXRqvjg · depth 2 · COMPLETE · handled B2

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
