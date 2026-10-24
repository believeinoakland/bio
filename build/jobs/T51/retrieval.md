# retrieval (T51)

**Status** · session_01E8rJsiNPGQhSTzqHve1gec · depth 2 · COMPLETE · handled B14

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

## J9 · COMPLETE

**C21 met** (retrieval's part), as proposed R92 (see my QUESTION J8; no requirement line existed): each `search` page hit and each `meaningRows` `rows=passage` row carries `document {bundle_id, title}` (before R78's decorations, which cannot replace it); a question hit's text snippet is cut from its title and conclusion (frontmatter via bundle_projection.fm_json), never bundle.md; passage snippets, document snippets and other arms' rows unchanged (the content arm's key list is untouched). Tests: new `t51-fix2.test.mjs` (5, seen failing first: question excerpt clean and marked; title-only question; document-hit control; every hit and a passage hit named, decoration cannot replace; passage rows named, no viewer names nothing); `search.test.mjs`:30 gained `document` in the hit's key list. Suites: retrieval 178/178; answers 67, following 116, queue 206, question-explorer 46, retrieval-browse 51, citation 122, all pass. Checks (process repo): format 1 failure, build/rulings.md:4298 K4301 (not mine); architecture 0 failures; coverage: none of its 10 failures is retrieval (R92 is not a live id until you write it); words 0 failures; ownership retrieval 0 failures. Reported to BOB: the missing requirement line (QUESTION J8). Nothing deferred; no flaw found in another module. Wave 2 note: screens-daily already reads `r.document.title` for passage rows and `h.document.title` for hits. Size (session_01AcNMBgnQLd3Vea5jBvd9Lg): test runs 12, module lines 3000

## Completion (T51-F3, RETRIEVAL #25)

**Entries applied.** R93 (C16 P3; SCREENS-INQUIRY #19's finding (a)): each row `list` (`listBundles`) answers carries the bundle's `project` (`COALESCE(b.project, '')`, the empty text for a project-less bundle), read in the same statement as the rest of the row. Change: `bio-plane/src/retrieval/index.mjs` `listBundles` (one SELECT column, one comment line). The row's `project` cannot reveal a project the viewer could not already see: membership R43 admits a project's bundle only when the viewer would see that project, so the gate already ensures it.

**Test first.** `bio-plane/test/m/retrieval/roster.test.mjs`, `R93: each row listBundles answers carries the bundle's project …`, written first and seen failing (each row lacked `project`). Controls: a project-less bundle answers `""`; a viewer who may not see the project is not answered its question, nor the project's name on any row. The R63 row key list (`ROW_KEYS`, and the `own` comparison in the first R63 test) gains `project`, which is the same change, not a weakening.

**Requirements.** Nothing edited here. R93 is still marked `(not yet met: T51)` in `build/requirements/retrieval.md`; it is met by this job, for BOB to mark it.

**Deferred.** None.

**Found in other modules.** None caused by this change. Red on the tranche tip (not mine, not fixed):
- `op-declarations` `t50.test.mjs` `R73, R21` (registry acts with no declaration: `alertconnect`, `exploreall`, `explorepath`, …) fails identically at the parent commit `6dcc00f622` (the tranche merge), checked in a worktree before my commit.
- `checks/run.mjs`: architecture 2 failures (`screens-inquiry` `fr4-project.test.mjs`, `phone.mjs`); coverage 8 modules, none retrieval (`agent-harness`, `agent-runner`, `control-plane`, `entities`, `installer-steps`, `journey-check`, `op-grades`, `screens-publish`); words 5 failures (`op-grades` t33 and t51, `screens-inquiry` fr4-document). `format`: 0 failures.

**Tests and checks** (from `/home/user/bio`):
- `node --test --test-force-exit --test-concurrency=2 bio-plane/test/m/retrieval/`: 179 of 179 pass, 0 fail.
- Consumers of `op=list` rows, each run: `m/provenance-routes/table`, `m/store-door/pull`, `m/control-plane/doorbell`, `m/control-plane/inbox-door`, `m/control-plane/t50-door`, `m/op-declarations/t35`, `t51`: 84 of 85 pass; the one failure is `op-declarations/t50` `R73, R21`, the pre-existing red above. `mk6-bundle-names-no-author.test.mjs`: 1 of 1 pass.
- `build/plan/impact.mjs origin/tranche/T51 HEAD` names 79 modules and 1,225 affected test files. I ran the retrieval suite and the list-consumer suites above, not all 1,225; the change adds one key to each list row, and no other module's tests read that key set beyond those named here.
- `checks/ownership.mjs /home/user/bio retrieval tranche/T51 job/T51/retrieval`: 0 failures (3 files changed by retrieval).
- Coverage for retrieval: not in the failing list (its 80 live ids are named; R93 is named by its test).

**For BOB (not edited here).** Mark R93 met in `build/requirements/retrieval.md` (drop `(not yet met: T51)`). The `list` row shape in R63's text gains `project`; R93 is the requirement for it. The `op-declarations` t50 red and the check reds above are other modules' and need their owners.

Size (session_01LrQ9js5UiMGt6HCSH7ugeW): test runs 7, module lines 3002

## J10 · COMPLETE

R93 met (C16 P3, SCREENS-INQUIRY #19's finding (a)): each row `list` (`listBundles`) answers carries the bundle's `project` (the empty text for a project-less bundle), read in the same statement. Change: `bio-plane/src/retrieval/index.mjs` `listBundles` (one SELECT column). Test first, seen failing: `roster.test.mjs` `R93: each row listBundles answers carries the bundle's project …`; controls: a project-less bundle answers "", and a viewer who may not see the project gets neither the question nor the project's name. The R63 row key list gains `project` (same change, not a weakening). Requirement text unchanged here: R93 still reads "(not yet met: T51)" in build/requirements/retrieval.md; please mark it met.

Tests: `bio-plane/test/m/retrieval/`: 179 of 179 pass. List-consumer suites (provenance-routes table, store-door pull, control-plane doorbell/inbox-door/t50-door, op-declarations t35/t51): 84 of 85 pass; the one red is op-declarations t50 `R73, R21` (undeclared registry acts), which fails identically at the parent commit 6dcc00f622, so it predates this change. mk6-bundle-names-no-author: 1 of 1 pass. Impact names 79 modules and 1,225 test files; I ran the retrieval and list-consumer suites, not all of them.

Checks: ownership retrieval 0 failures; format 0 failures; architecture 2 failures and words 5 failures and coverage 8 modules, none in retrieval (screens-inquiry, op-grades, agent-harness, agent-runner, control-plane, entities, installer-steps, journey-check, op-grades, screens-publish).

Found in other modules: none caused by this change. Named, not fixed: the op-declarations t50 red and the check reds above.

Deferred: none.

Size (session_01LrQ9js5UiMGt6HCSH7ugeW): test runs 7, module lines 3002

## Completion (fix round 7, G62, RETRIEVAL #26)

**Entries applied.** G62's retrieval part, the logging alone: `zone({why: true})` answers `{zone, source, why}`; plain `zone()` (and `zone({why: false})`) answers the zone as before. Change: `bio-plane/src/retrieval/index.mjs` `zone` (now a thin read of the private `#zoneRead`, the same lookups in the same order). `source` is `local-facts` or `profiles`, null with no zone. With no zone `why` is a code, never a sentence: `no_profiles` (the `jurisdiction_profiles` setting unset or empty), `profiles_disagree` (profiles governing different zones), `no_zone_stated` (neither local-facts nor the combined profiles state one, or both threw); null when a zone is found. No retrieval fix planned or made (the plan's R-FOUR (1): cause unknown live; logging rides the deploy).

**Test first, seen RED, then green** (`bio-plane/test/m/retrieval/t51-round7.test.mjs`, two tests, named R69): (a) a zone from local-facts, a local correction, the profiles' own, and a local-facts that throws, each answering `{zone, source, why: null}`; (b) no profile, an empty list, two profiles disagreeing, a profile that states none, each `{zone: null, source: null, why}`. Red before the change: `zone({why:true})` answered the bare string / null. Controls in the same tests: plain `zone()` and `zone({why:false})` equal the zone alone, null in every no-zone case. Platform check **N** for this module (L and P are the seam's and BOB's).

**Tests and checks** (from `/home/user/bio`): `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/retrieval/` (from `bio-plane/`): 185 of 185 pass. Users: `ratification` and `case-authoring/signing.test.mjs`: 308 of 308 pass. `checks/run.mjs`: format 0, architecture 0, coverage 1 failure (record-core R89, R90, not mine), words 11 failures (case-checker spec.mjs, installer-steps; none in retrieval), channels 0. `checks/ownership.mjs retrieval tranche/T51 job/T51/retrieval`: 0 failures.

**Requirement line proposed for BOB to write** (retrieval R69 or a new id): `zone({why: true})` answers `{zone, source, why}`: the zone R69 gives, `source` `local-facts` or `profiles` (null when none) and, when none, `why` one of `no_profiles`, `profiles_disagree`, `no_zone_stated`; the plain `zone()` is unchanged. Test: `t51-round7.test.mjs`.

**Census ops** I own: none new (no op added or changed). **Rows owed to UX-DESIGN:** none (codes only; ratification and screens-publish word them). **Found in other modules:** none. **Deferred:** none.

Size (session_01FoEGtPsn2WnLGd9CYBxrwS): test runs 6, module lines 3043

## J11 · COMPLETE

G62 retrieval part (fix round 7) complete: zone({why: true}) answers {zone, source, why} (source local-facts|profiles, null with none; why no_profiles|profiles_disagree|no_zone_stated, null with a zone); plain zone() unchanged. Test first, seen red then green: t51-round7.test.mjs (2 tests, R69, with controls). Retrieval suite 185/185; ratification and case-authoring signing 308/308. Checks: format 0, architecture 0, ownership 0; coverage and words reds are other modules' (record-core R89/R90, case-checker, installer-steps). Proposed line for you to write: zone({why:true}) as above. Nothing deferred, no census op, no UX rows. Record: Completion (fix round 7, G62). Size (session_01FoEGtPsn2WnLGd9CYBxrwS): test runs 6, module lines 3043

## J12 · QUESTION

QUESTION · retrieval T51 round 9 · two reads I need and do not own; best reading below, I proceed on it.

(1) R95/R96: a `search` page hit is a bundle, and the passage snippet's unit (its kind, its extent) is chosen inside query-language's SQL (`query.mjs` page(), the `ps` subquery) with no column naming it; `rows=passage` rows carry capture_sha/extent_kind/extent but no `kind`. Query-language has no job this round. BEST READING (I build this in retrieval, no CHANGE needed): a row's `kind` is a keyed read of `capture_text` by the row's identity (like R92's `#documentsOf`), null when the column is absent (extraction-2 not merged) or the unit predates it; a hit whose `snippet_from` is `passage` gets the snippet unit's `kind`, `extent_kind`, `extent`, `ref`, `seq`, `capture_sha` from a second, gated `rows=passage` compile of the same `q` over the page's hit ids (picking the unit the snippet uses: least capture_sha, seq, extent_kind, extent), paged to a named bound `HIT_UNIT_PAGES_MAX`; a hit past that bound says kind null (undetermined). Every other hit says kind null. If you prefer, the cheaper fix is a CHANGE to query-language (expose the snippet unit and `kind` in its page/row columns); say so and I will read those instead.

(2) R97: I need, per capture in the tally, whether its reading is whole and its `read_through`/`total`. Today only `capture_text_state` (extraction's table: state, more, read_through, total) answers that without loading units; `unitsOf` loads a page of units per call and the job row is plane's. BEST READING: retrieval reads `capture_text_state` for the tally's captures (extraction's index-state read contract, R36) and counts `partial` when `more=1` or state is not `whole`. This misses a scan's owed pages (extraction R100, job row counters) until extraction-2 exposes a cheap `progressOf(shas)`; if you want that, ask extraction-2 (job 41) for `progressOf(shas) -> {sha: {state, through, total}}` and I will prefer it when present.

## Work notes and completion (fix round 9, G134d, G128h, G135f, R25, R94-R97, RETRIEVAL #27)

**First record, retrieval-browse:** no change found; `retrieval-browse` keeps its own `partsHeldIn` (`index.mjs:59`), so no CHANGE is asked for it. **Providers not merged** (extraction-2 job 41, reading-pipeline-1): tested against a stand-in, `fixture.mjs`'s `withKindColumn()` (extraction R107's `kind` column on `capture_text`) and `indexState()` (a row of `capture_text_state`, extraction R36/R90); both are in my tests dir.

**G134d (R95), the four fields.** (1) Root cause: `capture_text` carried no kind and neither a hit nor a row named one; the hit's snippet unit is chosen inside `query.mjs` `page()` (the `ps` subquery) with no column naming it. Fixed in my module: `#namedRows` reads `kind` by the row's address (`units.mjs` `kindsOf`, a keyed read like R92's `#documentsOf`); `#namedHits` names, for a hit whose `snippet_from` is `passage`, the unit the snippet uses (the least of the hit's matching units by capture, `seq`, extent, from a second gated `rows=passage` compile over the page's hit ids, `#snippetUnits`), as `kind`, `capture_sha`, `extent_kind`, `extent`, `ref`; every other hit says null for all five. A unit stored before the kind (no column, empty, or outside `PART_KINDS`) says null, never `body`. Search returns every kind (nothing here filters by kind). (2) Why the tests missed it: no requirement said which parts are text and no test followed a part from the reader to a hit; now `t51-round9.test.mjs` does for all eleven kinds. (3) Test first, seen RED against the unchanged source (5 R95 tests, `t51-round9.test.mjs`): `✖ R95: a passage search returns every kind of part by default ...` (hit `kind` undefined); then 195 of 195 green. (4) **L**: not run here (the seam section 10 and the corpus are control-plane's and BOB's).

**G128h (R96).** (1) Root cause: a search hit carried no extent at all (only `rows=passage` rows did), and the unit text's row numbers and empty cells are reading-pipeline/extraction's (R47/R107, unmerged). Retrieval's part: a passage hit answers the `sheet-range` extent of the block holding the match (`extent_kind`, `extent`, `capture_sha`), as the rows do. (2) Missed: searches asserted a hit, not the hit's extent. (3) RED then green: `R96: SHEET J-10 ...` (first, middle and last mark; each hit's extent contains the row and the mark's column; the unit keeps its row numbers and empty cells; the meaning row names the same extent) and the control `R96 control`. `cellsOf` of the extent is the seam's (extraction), not run here. (4) **L** as above.

**G135f (R97).** (1) Root cause: the tally and `says` (`levels.mjs`) knew only the observation-log's axis, so a text read to half read as searchable and an absence as an absence. Now `#contentAxisTally` counts the captures in scope whose index is not whole (`units.mjs` `partialReads`: `capture_text_state` `partial`, `more`, or `truncated`) as `partial` with `partial_reads [{capture_sha, through, total}]` (listed to `PARTIAL_LISTED_MAX` 20, `partial_truncated`), published under `scope`; `says` states "searched so far" with the summed `through` and `total` when every partial reading states them, else "only partly read", in place of an absence and after a hit; a whole reading says nothing of the kind. The sentences are stand-ins keyed `retrieval.levels.searched_so_far` and `retrieval.levels.searched_so_far_unmeasured` through `localize`; **rows owed to `later-ux.md`:** those two (plan section 5, "searched so far"). (2) Missed: no test of a half-read text. (3) RED then green: `R97: a search over a text read to half ...`, the unmeasured-extent test, the bound test. (4) **L** and **P** are BOB's.

**R25, R94 (amended).** R25 is met by the same hit/row extent (R96's test names the `sheet-range` block). R94: `provenance` R74 (merged) keeps a capture's parts in `register_parts`, so the register lists wholes alone; the frontier's part filtering (`#wholes`, `partsHeldIn`, the `multipart` column) was dead code and the R94 fixture (parts as register rows) the old shape. Seen RED before any change of mine (3 tests, `whole-rows.test.mjs`: `✖ R94: once the whole has its content and meaning rows nothing of the document stays ... expected [] actual [3 part shas]`); fixed by deleting the filter (`frontier.mjs`, `index.mjs`) and registering the fixture's capture as a whole with `parts` (R75); 4 of 4 green.

**Tests changed for the new keys** (not weakened): `search.test.mjs` R6 (the hit's keys now end `kind, capture_sha, extent_kind, extent, ref`), `meaningread.test.mjs` R11/R14 (the scope's keys gain `partial`, `partial_reads`, `partial_truncated`).

**Tests and checks** (from `bio-plane/`): `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/retrieval/`: 195 of 195 pass. Users run (retrieval-browse, citation, inquiry, content, filings, calculations, consequences, attestation, connections, query-language, screens-daily, action-clocks, civil-time, odf-reader, pdf-reader): 613 of 613 pass. `impact.mjs origin/tranche/T51 HEAD`: 80 of 176 modules affected; the ones that read a search hit or a meaning row were run as above, the rest read neither. Checks (civicos-process): format 0 failures, architecture 0, coverage 86 of 86 ids named, 0, words 0 (inline 0, testcopy 0, missingkey 0), ownership 0 (10 files).

**Census ops** I own: none new. **Generated artifacts made stale:** none by me (`dist/bio-plane.bundled.mjs` is regenerated by BOB at the round end; it contains retrieval). **Found in other modules:** query-language could expose the snippet's unit and `kind` in its page and row columns (cheaper than my second compile; J12 asks). **Deferred:** none.

Size (session_01E8rJsiNPGQhSTzqHve1gec): test runs 12, module lines 3127

## Completion after B13 (answer to J12; RETRIEVAL #27)

Applied B13. (1) The second compile is gone: `#namedHits` reads the unit by the `rowid` a hit names in `snippet_unit` (`query-language` R34, job 66; `units.mjs` `unitsByRowid`: `kind`, `capture_sha`, `extent_kind`, `extent`, `ref`), every other hit null. (2) `partialReads` asks `extraction.progressOf(shas)` (R108, job 41; calls of at most 500) when it exists, else `capture_text_state`; a reading with `owed > 0` is partial whatever its index says; `partial_reads` entries gain `owed`.

**Reds by name, accepted in B13 until the providers merge** (7 of 197): the six hit-side tests (`R95` x4, `R96`, `R96 control`) need `snippet_unit` from job 66; `R97, R108 (red until extraction job 41 merges)` needs `progressOf` on the real extraction. Verified green (195 of 197, the R6 key test aside) with `query.mjs` temporarily patched to emit `snippet_unit` as R34 words it, then reverted (`query.mjs` untouched in this branch). The scan-with-pages-owed case is green against a stand-in of R108's interface text.

Tests/checks: retrieval suite 190 of 197 (the 7 above); users run earlier unchanged by this step. format, architecture, coverage (86 of 86), words, ownership: 0 failures. Size (session_01E8rJsiNPGQhSTzqHve1gec): test runs 16, module lines 3097

## J13 · COMPLETE

COMPLETE · retrieval T51 fix round 9 (G134d, G128h, G135f; R25, R94-R97). B13 applied: hits read their unit by snippet_unit (query-language R34), partial readings by extraction progressOf (R108) else capture_text_state. Retrieval suite 190 of 197; the 7 reds are named in the record and wait on providers: six hit tests on job 66 (snippet_unit), one on job 41 (progressOf); all verified green with R34 emulated locally (reverted). R94 fixed (provenance R74 made the frontier's part filter dead; deleted, fixture re-shaped). Checks format, architecture, coverage 86/86, words, ownership: 0 failures. New file outside nothing: units.mjs is in paths. Rows owed to later-ux: retrieval.levels.searched_so_far, retrieval.levels.searched_so_far_unmeasured. Stale generated: dist bundle (BOB regenerates). Details and RED lines in build/jobs/T51/retrieval.md.

## Completion after B14 (job 41 merged; RETRIEVAL #27)

Merged `origin/tranche/T51`. The tally already asks `extraction.progressOf` when present, so no code change; the fixture's extraction stand-in now forwards `progressOf` to the real `extractionOf` over the same store (and `reading()` takes a body), and the red-by-name R108 test is now green through the real provider (`R97, R108: through the real extraction's progressOf ...`, a 30-page scan with `ocr_left` 6 counted partial, `owed` 6). One test claim changed: a capture indexed to `none` is not "not partial" under the real R108 (anything not whole is `partial`), so that claim is dropped.

Retrieval suite 191 of 197; the 6 reds are the hit-side tests waiting on `snippet_unit` (query-language R34, job 66), green with R34 emulated. format, architecture, coverage 86/86, words, ownership: 0 failures. Size (session_01E8rJsiNPGQhSTzqHve1gec): test runs 19, module lines 3097

## J14 · COMPLETE

COMPLETE · B14 applied: progressOf is read through the real extraction (job 41); R108 test green. Retrieval suite 191 of 197; the 6 reds are the hit-side R95/R96 tests waiting on query-language R34 snippet_unit (job 66), green with R34 emulated. Checks: 0 failures. Record: build/jobs/T51/retrieval.md.
