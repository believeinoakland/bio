# retrieval (T51)

**Status** · session_01AcNMBgnQLd3Vea5jBvd9Lg · depth 2 · COMPLETE · handled B8

## Work notes (RETRIEVAL #20)

- **R88 met** (`index.mjs`): `routesCrossed(ast)` over `query-language`'s parse (`plan.ast`, its R1: no new requirement needed there; a `meaning` node of arm `passage` is the passages route, every other leaf the fields route). `search` and `meaningRows` refuse `ROUTES_CROSSED` (`routes: ["fields","passages"]`, `detail` naming both) before any statement runs. Readings I took: an `OR` is crossed when one branch holds a passage term and another branch of the same `OR` holds any other term, at any depth, a `NOT` keeping its operand's route; the parse is the plan's own, so under `rows=passage` bare words are already passage words (query-language R31) and `sewer OR parks` is not crossed there, and under `rows=leg` bare words are dropped (R32). The widened (OR) reading of an empty conjunction is not offered when it would cross routes (`widen` null). Tests: `t51.test.mjs` (R88 twice).
- **R89 met**: `scope.existence_only_projects` (`[{project, name}]` from `membership.existenceAct`, never `owners`) and `scope.existence_only_count`, on every meaning arm. The key `existence_only_count` for "their count" is my choice. Three existing tests that deep-equal the scope's keys (`content-arm.test.mjs` x3 assertions, `meaningread.test.mjs`) gained the two keys. Tests: `t51.test.mjs` (R89 twice).
- Stale comment `checks.mjs`:73 reworded (no longer cites `app.html`).
- Waited for `retrieval-browse` (B3 CHANGE); merged `tranche/T51`.

## Completion (T51-42)

**Entries applied.** R87, R88, R89, R90, the stale comment `checks.mjs`:73.
- **R90**: `findin.mjs` and `browse.mjs` deleted; from `index.mjs` `findIn`, `#findScope`, `registerRecordedBy`, `registerBrowseMarks`, `browseMarks`, `recordedReads`, `entitiesFor`, the four fields and the imports only they used. The constructor builds `retrievalBrowseOf` with `sql, membership, host, order, entities, recorders` and the five host reads (`sight`, `planOf`, `runQuery`, `localeOf`, `selectionRead`, bound arrows). `findIn`, `browse`, the two registrations and (kept because `answers`' and `citation`'s tests read it) `recordedReads` are one-line delegates; the `findin` and `browse` route arms are unchanged. Every old export is re-exported from `retrieval-browse` (identity-equal, tested), `BROWSE_SCOPES` and `BROWSE_ID_CHUNK` added. `words.mjs` is down to 49 keys; its test asserts `WORD_KEYS` equals `modules.retrieval.reads`.
- **R87**: `searchFields().scopes` (copies of `BROWSE_SCOPES`); `search` and `meaningRows` take `scope` (also the routes' `scope` query parameter). The scope is `scopeMembers`' ids for the viewer, intersected with any `ids` given, handed to the compile as its `ids` (an empty scope is the sentinel `[""]`, since the compile reads an empty list as no restriction). The answer states it in `query.scope` (null when none; this is the only change to a no-scope answer, and the `query` key-list assertions of R6/R11 gained `scope`), `query.scope_truncated` only when true, `query.scope_undetermined` (why) when the marks could not be read. Unknown key: `SCOPE_UNKNOWN` with `scopes`. I put the applied scope in `query` because `meaningRows` already answers a top-level `scope` (the four-level statement's).
- **R88, R89**: as in the work notes above.

**Tests.** `node --test bio-plane/test/m/retrieval/`: 167 tests, 167 pass. Moved out with the code (their copies are in `retrieval-browse`): `browse.test.mjs`, `findin.test.mjs`, `t50.test.mjs`, `t37.test.mjs` deleted; `t36.test.mjs` keeps R77 `selectionRead`, `findIn` over a real selection and the real-`recordedBy` test; new `delegation.test.mjs` (R90: op equality with an independently built module, a registered stub reaching both, second registration refused, the re-exports, `BROWSE_ID_CHUNK === SELECTION_ID_CHUNK`, no copy, under 4,000 lines, the five host reads); `t51.test.mjs` R87 x5, R88 x2, R89 x2. Others run: `answers` 64, `following` 112, `queue` 164, `question-explorer` 46 all pass; `citation` 90 pass, 1 fail (below).
**Checks** (process repo): format 0 failures; coverage retrieval 79 of 79 live ids named, 0 failures; ownership retrieval 0 failures; architecture: 2 failures, both "imports retrieval-browse, which retrieval does not declare in uses" (modules.json is BOB's). Size: `retrieval/*.mjs` 2,942 lines (was 4,001).

**For BOB (modules.json, K1043).** retrieval `uses`: add `retrieval-browse`; drop `civil-time` and `calc-grammar` (nothing of mine imports them any more, grepped); `events`, `standards`, `money`, `people`, `entities` stay as the table read contracts of R68 (their factories are no longer imported).
**Found in other modules.**
1. `citation` `test/m/citation/recorded.test.mjs`:7 imports `RECORDED_NONE_REGISTERED` from `src/retrieval/findin.mjs` (deleted): change it to `src/retrieval/index.mjs` (re-exported, identity-equal). It is the one red outside this module.
2. `op-declarations` (declares `search` and `meaningrows` params): `scope` is a new query parameter of both; `retrievalRoutes` reads it. Not edited here.
3. `query-language`: the `ids` restriction binds one SQL variable per id; a scope can hold up to 5,000 ids, and the Durable Object's SQL binds at most 100 per statement (the selections chunk at 64). The compile (not chunkable for sorted pages and facets) needs `ids` bound as one JSON parameter or a chunk-safe form. `meaningRows`' caller-given `ids` already had the same limit; scopes make it likelier.
4. Sentences with no key (REPORT'd by the design lane's list, mine): `ROUTES_CROSSED`, `SCOPE_UNKNOWN`, `scope_undetermined` `detail`/`why` are inline English beside their codes; no word key added (the reads list is the design lane's).
**Deferred.** None.

Size (session_01JxyVZhdF7dFTzuF5dsCwRc): test runs 14, module lines 2942

## J1 · REPORT

R88 and R89 are met and pushed (index.mjs, t51.test.mjs; module suite 197 pass, 1 fail). R88 needed nothing new from query-language: I read each term's route from plan.ast. R89 adds scope.existence_only_projects and scope.existence_only_count. The stale checks.mjs:73 comment is reworded. Three existing tests that deep-equal the scope's keys gained the two R89 keys. R87 and R90 both need retrieval-browse (BROWSE_SCOPES/scopeMembers; the delegation), which is not built yet, so I am waiting for your CHANGE after it merges. The one red is words.test.mjs 'keys are the owner's declared list': it clears when the 15 moved keys leave words.mjs with the R90 delete. Record: build/jobs/T51/retrieval.md, Work notes.

## J2 · COMPLETE

T51-42 retrieval complete (record: Completion (T51-42)). R87 (scopes on searchFields, search, meaningRows; the applied scope in query.scope), R88, R89, R90 (moved code deleted, delegation through retrievalBrowseOf with the five host reads, old exports re-exported), words test on 49 keys, stale comment fixed. Tests: bio-plane/test/m/retrieval 167/167 pass; answers, following, queue, question-explorer pass. Checks: format 0, coverage 79/79 ids 0, ownership 0, architecture 2 failures only because modules.json lacks retrieval-browse in retrieval's uses (yours to add; also drop civil-time and calc-grammar). One red outside the module: citation recorded.test.mjs:7 imports retrieval/findin.mjs, to re-point to retrieval/index.mjs (its owner). Also reported: op-declarations needs the scope parameter; query-language's ids binds one variable per id (scopes up to 5,000 vs the 100-variable bound). Source 2,942 lines (was 4,001). Size (session_01JxyVZhdF7dFTzuF5dsCwRc): test runs 14, module lines 2942

## Change B4 (K3872)

Merged `tranche/T51` (retrieval's `uses` now gain `retrieval-browse`, drop `civil-time` and `calc-grammar`). `bio-plane/src/retrieval/findin.mjs` is back as a one-line re-export of `retrieval-browse`'s findin, so `citation`'s `recorded.test.mjs` stays green; the R90 no-copy test now asserts the file is only that re-export. Reran: `bio-plane/test/m/retrieval/` and `citation/recorded.test.mjs` 179 pass, 0 fail; architecture 0 failures, format 0, coverage 79 of 79, ownership 0 failures. Source 2,942 lines.

Size (session_01JxyVZhdF7dFTzuF5dsCwRc): test runs 17, module lines 2942

## J3 · COMPLETE

B4 applied: merged tranche/T51, findin.mjs is a one-line re-export of retrieval-browse's findin (the R90 no-copy test now asserts exactly that). retrieval tests plus citation recorded.test.mjs: 179 pass, 0 fail. Architecture, format, coverage (79/79) and ownership: 0 failures. Source 2,942 lines. Size (session_01JxyVZhdF7dFTzuF5dsCwRc): test runs 17, module lines 2942

Ringing BOB for J3 failed (its session session_01SWiZCAUEHumgaPPppY3QhQ is archived: triggers bind only to active or paused sessions); J3 is pushed, and is the message for BOB's backstop (mechanics §13).

## Completion (T51-203)

**Entries applied.** The words findings in `build/plan/words-pass/retrieval.md`: the 1 handlist and the 19 plain findings (K3957), and the test copies named in B5.
- **Handlist** (`projection.test.mjs`, the route map's names): the test no longer hand-lists them. `RETRIEVAL_ROUTE_OPS` in `index.mjs` is the module's own list, and the test pins the map against it. A retrieval test cannot import `op-declarations` (the architecture check: it is later in the order), so the pin is against this list, not against the declaration; BOB may want an `op-declarations` check for the declared reads.
- **Converted through `localize`**, each `en` byte-identical to the text it replaces (checked against `HEAD`):
  - `frontier.mjs`: `FRONTIER_INTERNET_NOTE` (plain, line 31) → `retrieval.frontier.internet_note`; the two `not_read` reasons (plain, line 466, and the acquire reason beside it) → `retrieval.frontier.run_searches_not_read`, `retrieval.frontier.acquire_not_here`.
  - `index.mjs`: the OR-reading `widen` detail (plain, line 830) → `retrieval.index.no_record_matches_all`; the `content:` syntax sentences (plain, line 1049, and the sentence before it) → `retrieval.index.content_reaches_layer`, `retrieval.index.content_searches_citations`; and two bare syntax sentences the check does not count (`field:>value…`, `a meaning arm takes…`) → `retrieval.index.field_compare_range`, `retrieval.index.meaning_arm_takes`, since R13 binds them too.
  - Tests: `search.test.mjs` and `words.test.mjs` compare with `localize` by equality where they held the sentence in a string or a regular expression (K3965); the words test's "REPORTed" wording is gone.

**Not converted: REPORT to BOB** (15 plain findings, all in `index.mjs`; the check still counts them). Each is a refusal's `detail` beside its code, or a developer's registration diagnostic:
- Refusal `detail`, beside its code (DEC-258 (3): the shell draws `refusal.<CODE>`, never the detail): `NO_OWNER` "a selection is owned by the credential that made it" (1248); `BAD_KIND` "a selection is 'query' or 'enumerated'" (1252); `EMPTY` "an enumerated selection needs at least one id" (1257); `NOT_YOURS` "a selection is readable only by the credential that made it" (1329, 1348); the catch branch of `selectionRead` "the selection could not be read, so it is answered as one not held" (1350); `NOT_YOUR_QUERY` "no saved query of yours answers to that" (1471); `FIELD_DECLARED` "a field is registered once" (405); `FACTS_DECLARED` "the action facts are registered once" (296).
- Developer registration diagnostics (a module's start-up call, never a member's read): "a registration names its module and its function" (293, 306, 318, 331, 367).
- `NO_FTS_ID` "the record has no text index key" (1073): a finding's `detail` in `op=searchindexcheck`, an operator's check, read beside its code `NO_FTS_ID`.
The design's `unkeyed` list for `retrieval` holds only the prefixes of these (for example "a registration names its module"), so the check does not match the full texts. BOB to add the full texts (K3944), or to rule that they are not drawn.

**Found in this module, not flagged by the check, converted above:** the two syntax sentences listed under *Converted*. Not found in other modules.

**Deferred.** None.

**Tests and checks** (from `/home/user/bio`):
- `node --test` over all 22 files of `bio-plane/test/m/retrieval/`: 167 tests, 167 pass, 0 fail.
- `bio-plane/test/m/citation/recorded.test.mjs` (the `findin.mjs` shim): 12 pass, 0 fail.
- `checks/architecture.mjs retrieval`: 0 failures. `checks/format.mjs`: 0 failures. `checks/coverage.mjs retrieval`: 79 of 79 live ids named, 0 failures. `checks/ownership.mjs retrieval tranche/T51 job/T51/retrieval`: 0 failures.
- `checks/words.mjs retrieval`: 0 testcopy, 0 handlist, 0 missingkey, 0 marker; 15 plain (inline), all listed under REPORT above.
- `bio-plane/src/setup-words/build.mjs --check`: `rows.mjs` is stale, the expected note (the new `retrieval.*` ids are not in it yet; BOB regenerates it at the layer close). No refusal names `retrieval`.
- `checks/run.mjs` over all modules still reports other modules' words findings (not mine, not read).

Size (session_01D1NsgDVLk2pmKxqnUVzQKz): test runs 6, module lines 2924

## J4 · REPORT

Words check (B5, T51-203): 15 plain findings remain in retrieval/index.mjs, all in strings this job judges no member reads. I did not convert them and need BOB's settlement with the design stream (K3944):

- Refusal `detail` beside its code (DEC-258 (3): the shell draws refusal.<CODE>, never the detail): "a selection is owned by the credential that made it" (1248); "a selection is 'query' or 'enumerated'" (1252); "an enumerated selection needs at least one id" (1257); "a selection is readable only by the credential that made it" (1329, 1348); "the selection could not be read, so it is answered as one not held" (1350); "no saved query of yours answers to that" (1471); "a field is registered once" (405); "the action facts are registered once" (296).
- Developer registration diagnostics, read at a module's start-up only: "a registration names its module and its function" (293, 306, 318, 331, 367).
- A finding's detail in op=searchindexcheck, beside its code NO_FTS_ID: "the record has no text index key" (1073).

The design's unkeyed list for retrieval holds only prefixes of these (e.g. "a registration names its module"), so the check does not match the full texts. Please add the full texts, or rule that they are drawn and key them.

Also for your ruling, one judgement call: the route-name handlist in projection.test.mjs is now pinned against RETRIEVAL_ROUTE_OPS, the module's own list (index.mjs). A retrieval test cannot import op-declarations (architecture: later in order), so the pin does not check op-declarations' declaration.

Completion record: build/jobs/T51/retrieval.md, Completion (T51-203). Commit on job/T51/retrieval.

## J5 · COMPLETE

T51-203 retrieval (words) complete. Applied: the 1 handlist and 19 plain findings of build/plan/words-pass/retrieval.md, and the test copies. Converted through localize with en byte-identical to the text replaced (frontier internet note and not-read reasons; OR-widen detail; content and meaning syntax sentences). The 15 refusal-detail and developer strings still counted are in REPORT (J-REPORT, for your settlement).

Tests: node --test over bio-plane/test/m/retrieval: 167 of 167 pass. citation recorded.test: 12 of 12. Checks: architecture 0 failures; format 0; coverage 79 of 79 ids; ownership 0 failures; words for retrieval: 0 testcopy, 0 handlist, 0 missingkey, 0 marker, 15 plain (REPORTed); setup-words --check: rows.mjs stale, the expected note, no refusal naming retrieval.

Size (session_01D1NsgDVLk2pmKxqnUVzQKz): test runs 6, module lines 2924

## Completion (B6, K4002)

Localized through `localize`, each `en` byte-identical to its text: the refusal details at `index.mjs` 1248, 1252, 1257, 1329/1348 (one id, `retrieval.index.selection_readable_by_credential`), 1350, 1471, and the registration details 296 and 405; `NO_FTS_ID`'s detail at 1073. `search.test.mjs` compares that detail with `localize` by equality. The five start-up registration sentences (293, 306, 318, 331, 367) are left as B6 (2) says.

Tests: `bio-plane/test/m/retrieval/`, 167 of 167 pass; citation `recorded.test.mjs`, 12 of 12. Checks: words for retrieval shows only the five registration sentences; architecture 0 failures; format 0; coverage 79 of 79; `setup-words --check` names no retrieval refusal (rows stale, expected); ownership re-run below.

Size (session_01D1NsgDVLk2pmKxqnUVzQKz): test runs 9, module lines 2924

## J6 · COMPLETE

B6 applied (K4002). Localized: the refusal details at index.mjs 1248, 1252, 1257, 1329/1348, 1350, 1471, the registration details 296 and 405, and the NO_FTS_ID detail 1073, each en byte-identical. The search test compares the NO_FTS_ID detail with localize. The five start-up registration sentences are left, as you ruled.

Tests: retrieval 167 of 167 pass; citation recorded.test 12 of 12. Checks: words for retrieval shows only the five registration sentences; architecture 0 failures; format 0; coverage 79 of 79; setup-words --check names no retrieval refusal; ownership 0 failures. Pushed to job/T51/retrieval, record Completion (B6, K4002).

Size (session_01D1NsgDVLk2pmKxqnUVzQKz): test runs 9, module lines 2924

## J7 · COMPLETE

**Entries applied.** B7 (K4243): `list` declared in `DECLARED_OPS` (`bio-plane/src/retrieval/index.mjs`), under R91. Row: `classes` admin, member, probe; `mutating` false; `weight` "read" (as `findin` and `search`); `description` through `localize("retrieval.declared.list", …)`, English: "read: the bundles the viewer may see, in id order, each with its standing route; writes nothing" (`localize` falls back to that English until BOB's rows are regenerated). `fields`: `accepts` `type`, `state`, `after`, `limit` (read from the arm whole); `requires` none; `viewer` is the control plane's stamp, not an accept. No behaviour change. Test: `declared-ops.test.mjs`, "R91 retrieval declares list …", through `declaredOpHolds` (only requires, without each required, a field outside accepts). No other module declares a `list` op.

**Deferred.** None.

**Found in other modules.** None.

**Tests and checks** (from `/home/user/bio`):
- `node --test bio-plane/test/m/retrieval/declared-ops.test.mjs`: 6 of 6 pass.
- `node --test bio-plane/test/m/retrieval/`: 173 of 173 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio retrieval`: 0 failures.
- `checks/coverage.mjs /home/user/bio retrieval`: 80 of 80 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio retrieval tranche/T51`: 0 failures.

**For BOB (requirements, not edited here).** R91's list of declared ops (`findin`, `select`, `selectionrelease`, `frontier`, `search`) should now read `list` too. Commit `53847cb8f1` on `job/T51/retrieval`.

Size (session_0184iZt7rYVPmAExGqQUio3H): test runs 3, module lines 2941

## J8 · QUESTION

C21 has no requirement id in build/requirements/retrieval.md. I built to this proposed line, tested as R92 (t51-fix2.test.mjs); please write it (or reword) and I re-name the tests if the id differs. **R92** (T51 fix round 2; C21) Every hit names its document and a question's excerpt is its own words. `search`'s page hits and `meaningRows`' `rows=passage` rows each carry `document {bundle_id, title}` (the bundle holding the hit or the unit; the title as the record holds it), added before R78's decorations, which cannot replace it. A hit whose object type is an inquiry and whose `snippet_from` is `text` has its `snippet` cut from the question's title and frontmatter conclusion (same brackets, ellipsis and word bound as R6's snippet), never from `bundle.md`; a passage snippet and a document's text snippet are unchanged. Test: a question hit's snippet holds no heading, INQ- id, hash or log text; a passage hit and a passage row carry the document title; control: a document hit's snippet is unchanged. Note for the screen (wave 2): rows carry `document.title` and the screen already reads that. No words needed.
