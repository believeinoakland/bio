# following (T50)

**Status** · session_01PPuBsoVTVYhEYoJL4H1GVK · depth 2 · COMPLETE · handled B1

## Completion · T50-77 following (R32–R35, plus rule 6)

**Entries applied.**
- R32 `watchItem` (`op=watchitem`): append-only `watch_marks` (item, member, on/off, instant); read back only to the setter (declared `sight: owner`, `export: never`, as `answers`' standing questions). Refusals in order `MACHINE_CANNOT_MARK`, `MARK_NO_ITEM`, `MARK_NO_SUCH_ITEM`; `existed: true` when nothing changes.
- R33 `secondLook`, `secondLookClear` (`op=secondlook`, `op=secondlookclear`): `second_looks` (one row per flag, cleared by `cleared_by`/`cleared_at` on the same row, kept in the history); `by` and `cleared_by` answered as handles through `membership.memberFacts`/`founderHandle`, null when none is held, never an id; note one line, at most 500 characters. New rows C-137.27–30 (`MARK_NO_ITEM`, `MARK_NO_SUCH_ITEM`, `SECOND_LOOK_NO_NOTE`, `SECOND_LOOK_NOT_OPEN`), translations by key.
- R34 `browseMarks` registered once at start with `retrieval.registerBrowseMarks("following", …)` (`f.marksRegistered`); a refusal by the door throws at start; a retrieval that cannot be reached answers `NO_BROWSE_DOOR`. A viewer membership does not recognise, and a machine viewer, get nothing.
- R35 `watchedBy(item)`: `{ok, watchers: [{member, at}]}`, `member` as the stamp spells her (`member:<id>`, the founder `admin`, as R24's recipients), `at` the last setting, oldest first.
- Rule 6 (words): every sentence the keys of `words-reads.json` hold for following is read through `word(key, vars)` in `index.mjs`, `checks.mjs`, `meetings.mjs`, `snapshot.mjs`; the refusal rows' translations are `word("refusal.<CODE>")`; the test that compared the English of the policy watch's note now compares the key's sentence.

**Deferred / for BOB (REPORT).**
1. `MACHINE_CANNOT_MARK` is sources' C-121.7 (its code is held in that family): answered here bare (`translation` = `word("refusal.MACHINE_CANNOT_MARK")`, `check: null`), no row minted, so no code is in two families. If a following row is wanted, the code needs a new name (as case-carriage's `MACHINE_CANNOT_MARK_PHOTO`).
2. Words with no key, left as they are for the design lane: `follows` item `unscheduled: "read only at its member's own act (R8); the tick fetches nothing"` (gated register); the fragments `both snapshots` / `earlier snapshot` / `later snapshot` passed as `{snapshot}` to `following.why.key_repeated_row`; refusal `detail` strings beside their codes (unkeyed by `words-reads.json`'s rule, DEC-258 (3)). `words-reads.json`'s following entry does not yet list `refusal.MARK_NO_ITEM`, `refusal.MARK_NO_SUCH_ITEM`, `refusal.SECOND_LOOK_NO_NOTE`, `refusal.SECOND_LOOK_NOT_OPEN`, `refusal.MACHINE_CANNOT_MARK` (keys exist in `words.json`).
3. The ops `watchitem`, `secondlook`, `secondlookclear` are in `followingOps`; they are declared and graded in L11 (T50-24, T50-18): the plane's ops-map and op-declarations tests may go red for them, accepted until L11.
4. Beyond the requirements, two in-process reads: `secondLooksOf({item, viewer})` (the flag history, open and cleared, to a viewer who sees the item; the only way the history is readable and tested) and `browseMarks` (the registered function itself). BOB may add them to R33/R34 or ask for them to go.
5. The plane builds `followingOf(ctx, {...})` without a `retrieval` dep: it reaches it by default as `retrievalOf(ctx)` (built earlier in `store.mjs`, line 218), so no plane change is needed; any other test that builds `followingOf` on a bare host now registers with a real, bare `retrieval` (a stub should be passed as `retrieval`; two following tests did).

**Found in other modules.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/following/`: tests 112, pass 112, fail 0 (19 new in `marks.test.mjs`, 4 driven rows in `checks.test.mjs`).
- Used by following and run: notice-producers 118/118; scheduler 125 pass, 4 fail; action-producers 50 pass, 3 fail; plane t33+t45 28 pass, 2 fail: the same counts without my change (inherited reds).
- `node checks/format.mjs ../bio`: 171 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs ../bio following`: 16 product files, 67 relative imports; 0 failures.
- `node checks/coverage.mjs ../bio following`: 35 of 35 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs ../bio following tranche/T50`: 0 failures.

Size (session_01PPuBsoVTVYhEYoJL4H1GVK): test runs 14, module lines 2,197

## J1 · REPORT

REPORT (T50-77 following; details in my record, "Completion"):
1. MACHINE_CANNOT_MARK is sources' C-121.7: answered bare (translation by key, no following row). A following row needs a new code name if you want one.
2. Design-lane words with no key: the gated-register `unscheduled` line in `follows`; the "both/earlier/later snapshot" fragments in following.why.key_repeated_row; words-reads.json's following entry lacks refusal.MARK_NO_ITEM, MARK_NO_SUCH_ITEM, SECOND_LOOK_NO_NOTE, SECOND_LOOK_NOT_OPEN, MACHINE_CANNOT_MARK (keys exist in words.json).
3. Ops watchitem, secondlook, secondlookclear are in followingOps; declared and graded in L11 (T50-24, T50-18): ops-map and op-declarations tests may go red until then.
4. Added beyond the requirements: in-process secondLooksOf (flag history) for R33's "history keeps both"; add it to R33 or tell me to drop it.
