# explore (T51)

**Status** · session_01DhoM1bGsPDhJhF74swQt5C · depth 2 · COMPLETE · handled B2

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
