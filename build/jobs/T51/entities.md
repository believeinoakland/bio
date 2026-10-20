# entities (T51)

**Status** · session_01RV4G2Edww7FayCK93fNip7 · depth 2 · WORKING · handled B3

## Completion (T51-195)

**Entries applied.** The 46 findings of `build/plan/words-pass/entities.md` (17 left by the conversion, 29 `plain`) are fixed by the words rule. Every sentence this module's refusals and reads draw is a `localize('entities.index.<slug>', en, vars)` call with its English as it was (no text changed; a value is filled through a `{name}` placeholder, and the `(…)` and `{field}` fills are the same words). The one sentence a words row already holds (`duties.why.read_names_member`) is read through `word`. Five test copies compare by equality with `word(...)`: `refusal.ENTITY_NO_NOTE`, `refusal.NOT_A_PROCEEDING` and `entities.clean_label.registered_captured_document` (with its `{sha}`, `{extent}`, `{number}`). The hand-list in `ops.test.mjs` is replaced by the keys of this module's own map (`entitiesOps`, R40). No requirement text changed; no id, refusal code or grade changed.

**Readings (BOB may correct).**
1. A refusal's `detail` is a sentence a member reads (setup-words R13; K3964, K3974), so every such sentence is keyed. None was judged unread by a member, so nothing is listed in a REPORT.
2. The ids are `entities.index.<slug>`, one per sentence. The proceeding facet's "names no {field}" sentence is one id at its two sites (the same sentence).
3. `civil-time` answers an undetermined `why` as `{key, vars}` (K3958). `neighbours` (`undetermined.why`) and `entityByIdentifier` relay it as given. The scheme-identifier `method` sentence reads it through civil-time's `reasonText` (English, the same words as before). The four reds this brought in are fixed in the tests: `t33` R44 and R9 read the keyed reason through `reasonText`; `t33` R47 and its conformance battery accept a string or a keyed reason. A `why` at an unparseable date stays a string, as `#validOn` already answers it.

**Deferred.** None.

**Found in other modules.** `checks/run.mjs` over the tree: words 3755 failures in 174 modules (inline 2802, plain 1122, testcopy 780, handlist 173), and coverage 30 failures (live ids named by no test) in other modules' tests. None names entities. These belong to their modules' jobs. `setup-words --check`: `rows.mjs` is stale for the new `entities.index.*` ids, a stale-rows note as the check says to expect; BOB regenerates it at the layer close. Stale generated artifact (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` and the release copy still embed entities' source (noted at T51-30); not regenerated here.

**Tests and checks.**
- `node --test bio-plane/test/m/entities/*.test.mjs`: 131 pass, 0 fail (4 reds from the civil-time change fixed as above).
- `node checks/words.mjs /home/user/bio entities`: 0 failures (inline 0, plain 0, testcopy 0, handlist 0, marker 0).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; no line for entities in coverage or words.
- `node checks/ownership.mjs /home/user/bio entities tranche/T51 job/T51/entities`: 1 file changed by entities, 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only; no refusal names entities.

**Re-completion (B3, K3998).** After the merge of `tranche/T51`, `t48.test.mjs` held events' sentence "status as of a date is read of an entity of kind proceeding" (events' `localize('events.index.status_as_of_a_date', …)`) as a test string, which K3986 counts as a copy. That sentence has no words row, and events exports neither it nor its key, so the test cannot take it by equality. The test now passes its own caller sentence through `notAProceeding` and asserts it comes back unchanged, which is what R53 requires (the caller's detail named). Words check for entities: 0 failures; entities tests 131 pass, 0 fail; `checks/run.mjs`: format and architecture 0 failures; ownership 1 file.

Size (session_015aYMNxepX61Evw4qN8aqmA): test runs 5, module lines 2402

## Completion (T51-30)

**Entries applied.** R58 `matched_by` on every resolution (written with it, taken by a raise, kept by an equal or weaker grade; `identifier` when the identifier tier matched the entity, else `reference`, `reference_key`, `label`; `testimony`), a store written before gets the column once, filled from the tier the method sentence names, `null` where no known sentence; `resolutionsFor` answers `names` and `names_truncated`. R57 `onlyByIdentifier` (`op=entityidonly`, `ids` comma list), R59 `subjectsNamed` (`op=subjectsnamed`), R60 `similarSubjects` (`op=entitysimilar`), all three arms in `entitiesOps`. R61 `page` on `namingDocuments` and `namingIn` candidates. `NO_ALIAS` now minted at one site (`noAlias`, its row's `where` updated; registry test updated for the string).

**Readings of the requirements (BOB may correct).**
1. An entity matched by both an identifier and an alias fold of the same reference is `identifier` (as its method sentence says).
2. `names` ties at one grade take `MATCHED_BY`'s order (identifier first).
3. `page` is given for `pdf-page` positions only (index + 1); sheet, slide and paragraph positions answer `null`.
4. R59 and R60 scan the registry in code (no index serves a term test over names); bounded by the group's registry size.
5. R59 pages by cursor `<label fold>|<entity_id>` in `next`/`after`.

**Deferred.** None.

**Found in other modules.** `retrieval/words.test.mjs` is red at base: its key list lacks `monitoring.reason_given`, `retrieval.column_why`, `retrieval.extent_why`. 29 further consumer-test reds (notice-producers, op-declarations, escalation, scheduler, queue-producers, duties date/word tests) are red identically on `tranche/T51` (31 there). Stale generated artifacts (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed entities' source.

**Tests and checks.** Entities: `node --test bio-plane/test/m/entities/*.test.mjs` 131 pass, 0 fail (new `t51.test.mjs` 13; ops, reads and registry tests updated). Consumers of entities (all 40 test dirs in `modules.json` uses): 3584 pass, 31 fail, same reds as base. Checks: format 0 failures; architecture 0 failures; coverage 61 of 61; ownership 0 failures.

Size (session_01BRhBQme4TGHsPej7wEteGu): test runs 9, module lines 2,432

## J1 · COMPLETE

T51-30 applied: R57-R61 met (matched_by/names, onlyByIdentifier, subjectsNamed, similarSubjects, page). entities tests 131/0; format, architecture, coverage 61/61, ownership 0 failures. Consumers: same reds as base (retrieval words keys; date/word tests), none new. Stale generated: bio-plane/dist bundle and release copy. Readings and details in my record.

## J2 · COMPLETE

T51-195 (entities, words pass) is done and pushed at cddeabe61b. The 46 findings of build/plan/words-pass/entities.md are fixed by the words rule: 0 failures from checks/words.mjs for entities. entities tests: 131 pass, 0 fail (4 civil-time keyed-reason reds fixed in t33). checks/run.mjs: format and architecture 0 failures; ownership 0 failures; setup-words --check gives only the stale-rows note. Readings, none unread-member strings, and other-module findings are in build/jobs/T51/entities.md under Completion (T51-195). Size: test runs 4, module lines 2402.

## J3 · COMPLETE

B3 (K3998) done and pushed. t48.test.mjs no longer holds events' status sentence: it passes its own caller sentence through notAProceeding. Words check for entities: 0 failures. Entities tests 131 pass, 0 fail. checks/run.mjs: format and architecture 0 failures. Ownership: 1 file. Size: test runs 5, module lines 2402. Re-completion in build/jobs/T51/entities.md.

## J4 · COMPLETE

## Completion (B4, K4243)

**Entries applied.** B4 (K4243): `entitybyalias` is declared in `DECLARED_OPS` (`bio-plane/src/entities/index.mjs`, after `resolutiondefect`), in the round's shape. Classes and `mutating: false` are the hand row's (`op-declarations`); `weight: "read"` is the read weight other modules' read rows use (the hand row carries none). Fields: `accepts: ["alias"]`, which the arm reads whole; the viewer is the control plane's stamp and is not an accept. `requires: []`: a call without `alias` answers `count: 0`, not a refusal, so no field is required (the test helper requires a refusal naming each required field). No behaviour change. Test: `R62 entities declares entitybyalias` in `bio-plane/test/m/entities/declared-ops.test.mjs`, with `declaredOpHolds` (only its requires, a field outside its accepts), naming R62. Commit 5d9d8ba312.

**Requirement line for BOB.** R62's declared-op list (`build/requirements/entities.md`) should read `…resolutiondefect, entitybyalias`. I have not edited the requirements.

**Readings (BOB may correct).**
1. `weight: "read"` for a read row, as the other modules' read rows carry it. The hand row has no weight field, so there is nothing to copy.
2. `requires: []` rather than `["alias"]`: the arm answers `count: 0` without `alias`, so no refusal names it; with `["alias"]` the helper's requires check would fail.

**Deferred.** None.

**Found in other modules.** `node --test bio-plane/test/m/op-declarations/*.test.mjs` has 2 failures, both red on the base too (checked with my change stashed): `R10, R6` (link-sweep's ops map against its spec) and `R19, R6` (each module's ops map against its family spec). Neither names entities. These belong to the owning jobs, or to BOB.

**Tests and checks.**
- `node --test bio-plane/test/m/entities/*.test.mjs`: 139 pass, 0 fail.
- `node --test bio-plane/test/m/op-declarations/*.test.mjs bio-plane/test/m/screens-settings/bias.test.mjs bio-plane/test/m/control-plane/routes.test.mjs`: 254 pass, 2 fail (the two base reds above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs entities`: 0 failures. `checks/coverage.mjs entities`: 62 of 62 live ids named by a test. `checks/words.mjs entities`: 0 failures. `checks/ownership.mjs entities tranche/T51` (on 5d9d8ba312): 2 files changed by entities, 0 failures.

Size (session_01RV4G2Edww7FayCK93fNip7): test runs 3, module lines 2425
