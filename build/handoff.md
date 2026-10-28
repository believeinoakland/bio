# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #329 (`session_018BhcefYrW3vwL3mYqzy8xd`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #330, 2026-10-28 ~06:45Z, at 39 % of its window (refresh.md). No step is half done. **T53 round R1 is OPEN** (the one build round, K5567). **Layers 1 and 2 are closed** (layer 2: 67352bb1ba, its 8 sessions archived with their rows, its plan block in `plan/archive/T53-R1-layer2-merged.md`). **Layer 3 is running**: 10 jobs started 06:13Z (K5690); 3 merged. Read whole: K5681, K5690, K5691, K5692, K5693, K5694 (`build/rulings.md`), then `build/plan/current.md`'s Layer 3 block.

## Bob's direction now

- **One round, R1** (K5567). Work found goes to its module's open job, else a not-started layer's START, else the completion round.
- **New this session, Bob's (K5681, 2026-10-28: "yes, option 2"):** BOB adds a module's entry to `docs/development/ux-substrate/screens/words-reads.json` itself, only for a key whose words are already in the UX stream's `words.json`, and tells the stream; never wording. In `rulings-active.md` §4 and the manifest. Used twice (member-roster, ai-catalogue).
- **The AI catalogue key ceremony waits for Bob** (Bob, 2026-10-27 ~23:10Z: "We can do the key ceremony when I get back."). Route K5625: the offline page `bio-plane/scripts/catalogue-keys.html` (SHA-256 87f1993cb4e726ecaed5d7101b05ef8ad018fe55cbea17496421e9c89738fcf5); steps in `build/plan/key-ceremony.md` (K5625 overrides it where they differ). When Bob is back: one rendered page with the download link, the SHA-256 and the plain steps of sitting 1. Sitting 2 once ai-catalogue's seed payload exists (T53-75 `[waits: key ceremony]`; ai-catalogue merged K5673, R39 unmet by that wait).
- Questions page https://claude.ai/artifact/SrK7xHyWMbW8TJntxkKzkv: **none open**.

## Your takeover

`proc takeover --tranche T53 …` owes a `TAKEN OVER` message to me; I delete my routines (backstop `trig_01ASF55RnFZHrUukX2n3endM`, 07:14Z) and reply. In this checkout: `git fetch -q --deepen=2000 origin tranche/T53` (run it in the background: it can pass 2 minutes), `npm ci` where `node_modules` is missing (`site/` and `reader-container/` were missing here; reader-container's lack makes fleetbundles SKIP-fail). A batch of merges runs as ONE command; never write the tranche while it runs, nor while a worker runs there. **A worker never runs in `/home/user/bio`**: give it its own `git worktree add --detach <scratch>` (a UX checker rewrote `registry.json` in place here; restored before any commit).

## Layer 3: state (`proc status` for each)

| module | session | state |
| --- | --- | --- |
| provenance, attestation, provenance-routes | (live to the close) | merged K5695, K5696, K5697 |
| capture-sources | `session_018Bhcef6NZJ89Tvrn2YSfS2` (haiku) | WORKING: told to do its whole K5565 entry incl. B sites (a key given in source, no behaviour change); BLOCKED on a real judgement means restart it on sonnet (`proc job route`) |
| acquisition | `session_018BhcefbymZskaMPXAgDmRQ` | WORKING |
| capture | `session_018BhcegWsU96peK7X9pCQCk` | **WAITING: a question** (T53-102, T53-105 name no requirement line of capture). Answer it first: read its record's WAITING line and `build/plan/T53-R1/capture.md` |
| file-safety | `session_018Bhcef6MZXe2rVPpsmTu8D` | WORKING; carries K5691's CHANGE: new R71 `safeViewOfBytes` for doorbell; it asked to name its export and codes in its report |
| doorbell | `session_018BhcecgyadihJwzejgvKmY` | WAITING on file-safety's merge: then send it a CHANGE (merge the tranche, R31 seam tests real, complete). Its push form: bare `git push origin job/T53/doorbell` (K5694) |
| mail-door | `session_018Bhced233u828vot13hTyX` (default model, new module) | WAITING on capture's merge (R5 calls capture R116): then a CHANGE. R12's email() entry stays a todo naming M1 (a P19 deferral unless M1 is made); its codes are family C-157 (next new family C-158) |
| sources | `session_018BhcegmVJVqgECaQJcGU5q` | COMPLETE, held: merge after capture and doorbell (upstream first, K1965) |

- Merge order (`modules.json`): capture-sources, acquisition, capture, file-safety, doorbell, mail-door, sources.
- At each merge lower `build/tests-english-baseline.json` for the module's converted files (a file the words check still counts stays: run the check after removing; never raise). Owed: sources' `consent.test.mjs`; doorbell removed its own two.
- **A job that sets "WAITING: COMPLETE … available for a CHANGE"** is refused by `proc merge`: tell it to run `proc job complete` again and leave COMPLETE (happened twice: credentials, provenance).
- At the close: `proc layer close --layer 3`, archive its 10 sessions with rows (`proc job archived` each), move the Layer 3 block to `plan/archive/T53-R1-layer3-merged.md`.

## Before layer 4's START (BOB writes these lines)

- Layer 4: content R63-R64 from `build/plan/beta/planning/lines-A8-typed-page.md` (T53-529). Check `origin/bob/T53-req-l2-3` and the planning drafts for any other layer-4 lines; apply three-way just before the START (`git diff <merge-base> <branch> -- <files> | git apply -3`, K5377).
- Layer 5: events, confirm N1259-c R38's keys of `followedRegister` (T53-530). Layer 6: reading-guides' line for jurisdictions R126 (T53-531). Layer 9: filing-templates R15, R35 reworded to cite jurisdictions R126 (T53-532). Layer 11: plane T53-546.
- New modules in later layers: set `paths`/`tests` in `modules.json` at their START by a text edit of the one line (never re-serialise the file: it is hand-formatted).
- Models (K3518): haiku only where an entry is truly test-only with every key already in the words (check the rows file's model line first: it names sonnet where B sites need source keys); sonnet otherwise; the default for a new module.

## Process changes owed (civicos-process; P3: each certified by a fixture red on the old code)

1. `tools/hooks.mjs` PUSH reads a redirect after `git push` as a ref (`git push origin <own branch> 2>&1` refused; bare form passes; K5694). Strip redirections before reading refs.
2. `roles/JOB.md` line 23 ("your record must name the wait") leads jobs to replace COMPLETE with WAITING; say COMPLETE is itself an allowed end state and is never replaced.
3. `proc ruling --files` fails on a path already `git rm`ed (it `git add`s it): stage deletions first, or accept them.
4. Still open from #327: after `job archived`, `job route` titles a successor `#1`.

## Lanes and the design stream

- UX-DESIGN #45 (`session_018BhceeRn5Di4Q4kwmEsXF9`) answered and is merged through U521 (K5672, K5685: DEC-479 to DEC-488). B570 answered its question on the 15 registry acts ai-accounts retired (10 re-pointed to R61's ops, `projectsigninset` retired). Nothing owed by BOB.
- Other lanes: nothing new since 03:05Z (last commits all before 01:00Z). PLATFORM #2 may ask BOB to deploy plat-s1 steps 1d-1f (`deploy-plane-only.mjs plat-s1`, account 20b5…7f72 only).

## Rulings this session (K5667-K5698)

K5672 UX U512-U519 merged at layer 2; K5673-K5674 ai-catalogue merged, parameters folded, C-156; K5675 member-roster R85/R86 tests at five (wording); K5676 member-roster's users; K5677 credentials held, findings placed (T53-552 to T53-555); K5678-K5679 ai-accounts merged, T53-556; K5680 record-core R92 live check on biosmoke8 (complete, read-only); K5681 Bob's reads-list ruling; K5682-K5684 member-roster and membership merged; K5685 UX U520-U521, ai-catalogue's reads; K5686-K5689 credentials and promotion merged, row-census 1.80.0 removed; K5690 layer 2 closed, layer 3's lines (capture R121 previewMore, doorbell R31 KNOCK_BYTES_CHANGED, sources R23, mail-door paths); K5691 file-safety R71; K5692 mail-door's four answers (R7 reworded, C-157); K5693 doorbell uses runtime-limits, C-85.6, T53-557 to T53-561; K5694 the push hook fault; K5695-K5698 provenance, attestation, provenance-routes merged, R69, T53-562.

## Deferrals to name in the round's report (P19)

record-core T53-68 (study S1-S4, Bob's decision); ai-catalogue T53-75 / R39 (key ceremony); mail-door R12's email() (M1 not yet made).
