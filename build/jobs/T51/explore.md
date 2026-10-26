# explore (T51)

**Status** · session_017reTzAgYSiDVCzRpif7dhJ · depth 2 · COMPLETE · handled B7

## Completion (EXPLORE #7)

**Entries applied.** T51-196 (the words pass, K3949): every finding in `build/plan/words-pass/explore.md` fixed, and the check (`checks/words.mjs explore`) shows 0. The three test copies of "declared, not evidenced" compare with `DECLARED_LABEL`. The inline and plain sentences are read through `localize` with fixed ids: `explore.answer.viewer_missing`, `explore.answer.bad_date_detail`, `explore.answer.date_named_why`, `explore.rederive.scope_derived`, `explore.rederive.scope_chain`, `explore.rederive.step_is_neither`, `explore.walk.kinds_is_list`, `explore.walk.sort_by_names`, `explore.walk.scope_names_one`, `explore.graph.rings_is_one_or_two`, `explore.presets.no_to_named`, `explore.timeline.set_is_over`, `explore.timeline.no_events_record`. The viewer sentence's en equals `duties.why.read_names_member`'s row; explore's own id reads it (BOB may prefer `word` on the duties row). The three "a scope is {inquiry}" sentences are reworded "a scope names one inquiry": `{inquiry}` would read as a placeholder.

**Red tests (K3958, civil-time's keyed reasons): green.** A path's `undetermined.why` is now a list of `{hop, why}`, each `why` the reason as civil-time gives it (`{key, vars}`), not a joined string; overlaps' `why` and a date refusal's undetermined reason pass on the same way. Walk R4 and graph-chain R6/R4 assert the key `civil-time.end_stated`.

**Tests asserted by key, not by text.** The timeline refusal is exported as `NO_EVENTS_RECORD` and compared by equality (`verify-timeline-ops`). `order.by`, `order.quantity`, `absence.reach`, `note`, `stopped_sentence`, `depth_sentence` and the tampered-id `why` are compared with `word`, `PATH_ORDER`, `QUANTITY_OF_PATH` or the same `word` key, not a regex on their text.

**Not done / deferred.**
- Regex fragments of connection-grammar's `exhausted` reasons (`time budget`, `5000 nodes`, `visited its bound of 5000 nodes`) are another module's words. Left.

**Found elsewhere (REPORT to BOB).**
1. `connections` (not explore): `src/connections/stepsources.mjs:179` and `src/connections/mentioned.mjs:131` answer `undetermined: { why: <plain string> }`. connection-grammar's neighbours contract (K3958) requires a keyed reason, so explore refuses `connections` as `OWNER_NONCONFORMING` and `real-connections.test.mjs` (R24 over the real owners) stays red. Its fix belongs to `connections`.
2. `checks/run.mjs` on the whole repo: 3,786 words failures in other modules (`wizard-scripts` test copies, 2,107 unkeyed, 247 dev). None in explore.
3. `setup-words build.mjs --check`: `rows.mjs` is stale, as expected until BOB regenerates it. It names the new explore ids as missing rows; no refusal names explore.

**Environment.** The M-X1a wall-clock tests pass on this container this session: 6 of 6, the 4,000-vote walk in 1,799 ms of 10,000 (K1726 chain 266–283 ms). The last session's note that they fail here is not reproduced.

**Tests and checks.** `node --test test/m/explore`: 54 pass, 0 fail, excluding `real-connections.test.mjs` (1 test, red for the connections reason above). M-X1a: 6 pass. Checks: format 0 failures (175 modules); architecture explore 0 failures; coverage explore 26 of 26 live ids named; words explore 0 failures, rerun after the tranche merge; ownership explore `tranche/T51` → `job/T51/explore` 0 failures. Tranche merged (43dbc5e937, no change to explore or connections paths).

Size (session_01DhoM1bGsPDhJhF74swQt5C): test runs 10, module lines 1094

## Completion (EXPLORE #6)

**Entries applied.** T51-39 / R26: every hop an answer lists carries `from_label` and `to_label` (the canonical label of the registered entity for an `ENT-` end through `entities.labelsOf`, R56; `null` for an unnamed entity, an event or any non-entity end; never the id). Applies to `explore` paths (R3), the presets (R10, being the same walk), `overlaps`' hops, and `exploregraph`'s steps (R21). New `labels.mjs` reads the distinct ends once per answer in reads of at most 500; `graph.mjs` now reads nodes and step ends in one pass (R25's node labels unchanged). A hop the viewer cannot see is never listed, so it names nothing (R7). Answers data only (K3665).

**Not done / deferred.** `exploreverify`'s `rests_on[].connection` and chain hops are not named: R26 lists paths, presets and graph steps only. If BOB wants them named, it is a requirement change.

**Found elsewhere.** `ai-use` tests (6 R13 tests, `words.json` fixture comparisons) fail in this checkout: not explore's, not touched by this job.

**Environment.** The wall-clock M-X1a tests (`mx1a.test.mjs`, `mx1a-events.test.mjs`: 4,000-vote walks within the 10,000 ms budget) fail on this container with or without my change (baseline measured with the change stashed: 13,753 ms and 19,973 ms elapsed; with it 10,098 ms). Not recorded as an R20 re-measure; the K1726 comparison needs a faster desk.

**Tests and checks.** `hop-names.test.mjs` (4 tests, R26; all pass); `walk.test.mjs` R3 test now strips the two labels before comparing to the owner's hop. All non-M-X1a explore tests: 49 pass (after that fix, 0 fail). hypotheses, plane t33: pass. Checks: format 0 failures; architecture explore 0 failures; coverage 26 of 26 ids named; ownership 0 failures.

Size (session_0116nsZX4FFi5h4wdkKtE4rd): test runs 14, module lines 1081

## J1 · COMPLETE

R26 met: from_label/to_label on every hop of explore paths, presets, overlaps and exploregraph steps. Checks clean (format, architecture, coverage 26/26, ownership). Open: M-X1a wall-clock tests fail on this container with or without my change; ai-use R13 words tests fail (not mine). Details in my record.

## J2 · REPORT

connections' step-source and mentioned answers carry plain-string undetermined reasons (src/connections/stepsources.mjs:179, src/connections/mentioned.mjs:131: undetermined: { why: UNDATED }). connection-grammar's neighbours contract (K3958) now requires a keyed reason, so explore refuses connections as OWNER_NONCONFORMING and real-connections.test.mjs (R24 over the real owners) stays red. Not explore's to fix: connections should key both reasons. Explore's own tests are green otherwise (54 of 54 excluding that file; M-X1a 6 of 6). Details in the record, section EXPLORE #7.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J3 · COMPLETE

T51-196 applied: every words finding in build/plan/words-pass/explore.md converted (checks/words.mjs explore: 0 failures). Red tests against civil-time's keyed reasons (K3958) green: a path's undetermined why relays each civil-time {key, vars} as given. Format, architecture (explore), coverage (26 of 26), ownership: 0 failures each. Left open, in the record: regex assertions on explore's sentence fragments in about 15 tests (not counted by the words check), and connections' plain-string reasons (REPORT). A ruling is recorded as K3992. Size (session_01DhoM1bGsPDhJhF74swQt5C): test runs 10, module lines 1094.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J4 · COMPLETE

CHANGE B3 applied. (1) Regex assertions on explore's own sentences converted: each compares by equality with word(key), with the product's exported builders (othersWords, stepNeitherWhy, sharesNoRecordWhy) or with nodeRefusal's why; the rest of the regexes match values or connection-grammar's words, which are not explore's. (2) connections' plain reasons: not touched here; real-connections.test.mjs stays red until you say to re-run it after connections' merge. (3) build/rulings.md reverted to tranche/T51's (my K3992 removed); the rulings are recorded for BOB in the record. Gates: words explore 0 failures; format 0; architecture explore 0; coverage 26 of 26; ownership 0. Tests: explore suite 48 pass (real-connections excluded, red for connections' reason), M-X1a 6 pass. Size (session_01DhoM1bGsPDhJhF74swQt5C): test runs 13, module lines 1094.

---
_Generated by [Claude Code](https://claude.ai/code)_

## J5 · COMPLETE

## Completion (B4 and B5; B3 read)

**Entries applied.**
- B4 (FR-59, K4206): `exploreverify` is declared in `DECLARED_OPS` (`bio-plane/src/explore/ops.mjs`), beside `explore` and `explorepreset`. Classes `admin`, `member`, `probe`; `mutating` false; weight `read`; description `read: whether a derived connection re-derives to its id, and which hops it rests on; writes nothing` (the op-grades `R` sentence). Fields: `accepts` = `chain`, `from`, `to`, `kind`, `as_of`, `method`, `id`, `scope`; `requires` = `[["from","chain"],["to","chain"]]`, so a chain alone (the screen's call, `screens-investigate/explore.mjs:186`) or one derivation's two ends satisfy it.
- Why `kind`, `as_of`, `method`, `id` are not required: R12 says a derivation that cannot be recomputed answers `matches: false` with the reason, never a guess. The arm does exactly that for a missing field, and the reason names it (`explore.no.stated_derivation_recomputed`, "{f} is not stated..."). That is a deliberately uniform answer, so the arm is unchanged and no refusal is added or weakened. Missing `from` or `to` already refuses naming the field (`NO_NODE`).
- Requirement: NEW R28 in `build/requirements/explore.md`, written by me (B5, K4210). Marker dropped because its tests now name it. R27 is unchanged; its marker is still on the file, for BOB to clear at layer close.
- B3 (CHANGE: regex assertions, the connections reasons): applied in J4 earlier. Nothing new this round. The connections reason is no longer red: see below.
- Tranche: merged `origin/tranche/T51` (de71331bb1) into the job branch. No conflict. `build/rulings.md` is untouched.

**Tests (R28, written first and seen red, then green).** `bio-plane/test/m/explore/declared-ops.test.mjs`:
- `R28 explore declares exploreverify: ...`: `declaredOpHolds` through the ops map as the door calls it, with `viewer` stamped. Red before the declaration (the declaration was missing); green after.
- `R28 exploreverify answers a chain alone, as the screen sends it`: a one-hop chain answers `matches: true` with no refusal.
- The control for the declaration is the red run before the row was added.

**Not done / deferred.** None for R28.

**Found elsewhere (REPORT to BOB).** None new from explore's side. `checks/run.mjs /home/user/bio` on the merged branch shows failures only outside explore: coverage in `agent-harness` (R17), `agent-runner` (R37, R38, R40), `installer-steps` (R26, R31), `journey-check` (R19) and `link-sweep` (R13 to R15); inline in `bio-plane/src/strength/method.mjs:349`; 15 test-copy findings in `op-grades` tests (for example `t36.test.mjs:47`). Explore's own test directory is green, including `real-connections.test.mjs` on the merged tranche, so the connections reason in J2 and J3 no longer shows as red here.

**Environment.** Before the test run, `node_modules` was missing in `agent-runner`, `file-scanner`, `sheet-worker`, `site` and `journey-check` (not explore's). I did not install them, since they are not in explore's reach.

**Tests and checks.**
- `node --test test/m/explore/` (bio-plane): 59 pass, 0 fail (4 runs of the declared-ops file and the directory in this job).
- `node checks/run.mjs /home/user/bio`: format 0 failures (175 modules); architecture 0 failures; coverage 28 of 28 explore ids named; words: explore 0 failures (inline 0, testcopy 0, unkeyed 0). The overall run exits 1 for the other modules listed above.
- `node checks/architecture.mjs /home/user/bio explore`: 23 files, 0 failures.
- `node checks/coverage.mjs /home/user/bio explore`: 28 of 28, 0 failures.
- `node checks/words.mjs /home/user/bio explore`: 0 failures.
- `node checks/ownership.mjs /home/user/bio explore tranche/T51 job/T51/explore`: 1 failure, `build/requirements/explore.md` outside explore's paths, tests and job record. That is the R28 line written under K4210, and it is accepted at the merge.
- `test-support` is in explore's `uses` (`build/modules.json`), so BOB has nothing to add.

Size (session_01MBWcpq5eLEyiijWPhxG9Zx): test runs 4, module lines 1115

## J6 · COMPLETE

**Applied (B6, the two fixture lines).** `bio-plane/test/m/explore/verify-timeline-ops.test.mjs:83` and `:158` no longer hand-build events' timeline answer. Both now take events' published `timelineAnswer()` (`bio-plane/test/m/events/fixtures.mjs`, the empty-world shape; the same shape the hand-built literal had), through `timeline: () => timelineAnswer()`. One import added at the file head. Commit 6ac6a220db, pushed to `job/T51/explore`. Tranche T51 merged into the job branch before the change (no conflict).

**Tests.** The timeline file's five tests pass before and after the change (behaviour unchanged; the fixture is the only difference). The fixture check was red before (`checks/fixtures.mjs /home/user/bio explore --list`: 2 failures, `[op-table timeline]` at :83 and :158) and is green after (0 failures).

**Checks** (run with absolute root `/home/user/bio`): format 0 failures (178 modules); architecture explore 0 failures; coverage explore 28 of 28 live ids named; ownership explore (merge-base to HEAD) 0 failures; words explore 0 failures; `checks/fixtures.mjs ... explore --list` 0. Explore suite (`node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/explore/*.test.mjs`): 59 tests, 59 pass, 0 fail. Impact (`node build/plan/impact.mjs origin/tranche/T51 HEAD`): 0 of 178 modules affected, 0 of 2981 test files.

**Found elsewhere (REPORT to BOB).** `checks/run.mjs /home/user/bio` on the whole repo: 16 words failures and fixture findings outside explore; none in explore. The one that touches an explore-facing file: `bio-plane/test/m/screens-investigate/explore.test.mjs` lines 112 (op-table `allocid` -> record-core, and `promote` -> promotion), 162 (op-table `stepsource` -> connections), 190 and 209 (op-table `entityidonly` -> entities). That file belongs to screens-investigate, not explore; the fixtures there should come from those providers' published fixtures. Not touched by this job.

**Deferred.** None for this entry.

Size (session_017Lam1WDA8ZqRqYcHHMJK64): test runs 3, module lines 1115

## Completion (EXPLORE #11, fix round 10, B7)

**Entries applied.** Walk C C-M8 (1), requirement R29 (K5271): `exploregraph`'s node `label` now names an `EVT-` node by its kind and date ("meeting · 2026-02-10"; "award · undated" when the event holds no date or `undetermined`) and an `INFO-` node by its document's title, else `null` as before. A hop's `from_label`/`to_label` stay R26's (entities only; an event end `null`): the screen draws nodes by `label` (`parts.mjs` ~:275), so the Person page's Connect no longer draws "Not yet named" for an event.
- `bio-plane/src/explore/labels.mjs:35-70` `readNodeNames` (new): events by `ctx.events().readEvent({eventId, viewer})` (the owner keeps the viewer's sight, R7); documents by `ctx.documents.titlesOf({ids, viewer})` in reads of at most 500 ids; sentences `explore.label.event` and `explore.label.event_undated` through `localize`; a title or label never the id.
- `bio-plane/src/explore/graph.mjs:79,87` the node names merged with the entity names; only the nodes the answer lists are read, so a withheld hop names nothing.
- `bio-plane/src/explore/index.mjs:35,43` `exploreOf` takes `deps.documents` (none by default: document nodes stay unnamed).
- Test, `bio-plane/test/m/explore/node-labels.test.mjs` (3 tests, names R29 R25 R7; fixtures-own: the events and documents readers are doubles of the two reads, fed by the test): RED first (event and document nodes `null`; the viewer-pass assertion false; documents never read), GREEN after.

**REPORT to BOB (outside my paths).** (1) `store-assembly/assemble.mjs:277` builds `exploreOf(ctx, { events, money })`: events are live, so event nodes are named live now; document titles need the assembly to pass `documents: { titlesOf({ids, viewer}) → {titles}}` reading `bundles.title` for a bundle the viewer may see (record-core's `bundleInfo` plus membership's `viewerPredicate`; explore's Uses name neither, so a module edge or a provider is BOB's call). Until then an `INFO-` node stays "Not yet named". (2) The second half of C-M8 (`parts.mjs:336` drawing `capture:<sha>` evidence raw) is `screens-investigate`'s. (3) Not mine, red on the tranche tip as well: `store-assembly/declarations.test.mjs` R83 (modules exporting DECLARED_OPS not in the assembly), and `screens-investigate/common.test.mjs` cancelled by timeout (4 pass, 1 cancelled, same with `bio-plane/src/explore` restored to `origin/tranche/T51`).

**Deferred.** None in my module.

**Tests and checks.** explore: 62 pass, 0 fail (12 files). `impact.mjs origin/tranche/T51 HEAD`: 19 modules, 418 files; run together 1836 pass, 8 fail, 225 cancelled ("event loop already resolved", K5124); each of the 225 flagged files run alone: 223 clean, the two above red also on the base. `checks/run.mjs`: no finding in explore's files (89 stub failures in capture, doorbell, file-safety, monitoring, test-support, none in mine); words 0. `format` 0 failures; `architecture explore` 24 files, 0 failures; `coverage explore` 29 of 29 live ids named, 0 failures; `ownership explore` 5 files, 0 failures.

**Met requirement ids.** R29 (and R25, R26, R7 unchanged and still met).

Size (session_017reTzAgYSiDVCzRpif7dhJ): test runs 11 (+1 impact run of 418 files and 225 single-file reruns), module lines 1154
