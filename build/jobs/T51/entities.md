# entities (T51)

**Status** · session_01UFnpNcKqgfLJ5Ee7BwZ3WN · depth 2 · WORKING · handled B11

## Completion (T51 fix round 3, ENTITIES #18)

**Causes met.** C64 (the provider's part; DEC-401, DEC-402 @ 43379a1a44): **R63** an office a non-administrator member registers carries `named_by_member: true` (an administrator's or a machine's carries `false`; an office held before the mark reads unmarked); `readEntity`, `entitiesByAlias` and `entitiesOfKind` answer `named_by_member`, `confirmed_by` (and `readEntity` `confirmed_at`) for an office, `null`/absent for any other kind; an office also holds `contact` (`{kind: address|email|portal, value}`) and `law` (K4364): `law` is the `citation` or `name` of a `records_laws` entry of the active profiles' view, held as its citation, an unknown one refused `UNKNOWN_LAW` naming the laws, a bad contact `BAD_CONTACT`, either on another kind `OFFICE_FIELD_NOT_FOR_KIND`, each before an id is allocated; `null` when not stated. **R64** `confirmOffice({entityId, by, viewer})` (`op=officeconfirm`): refusals in order `NO_ENTITY`, `NO_SUCH_ENTITY`, `NOT_AN_ADMIN` (membership's, a `class:` caller included), `CONFIRM_NOT_AN_OFFICE`, `NOT_NAMED_BY_A_MEMBER` (K4364: the two catalogue rows C-91.10 and C-91.11 of this module; `refusal.CONFIRM_NOT_AN_OFFICE`, `refusal.NOT_NAMED_BY_A_MEMBER`), each writing nothing; otherwise clears the mark, records `confirmed_by` and `confirmed_at`, answers `{ok, entity_id, named_by_member: false, confirmed_by, at}`; a repeat (by anyone) answers `already: true` with the first confirmer. **R62**: `officeconfirm` declared (classes admin/member/probe, `machineClasses: []`, mutating, weight `reversible`, `stamps: ["viewer","by"]`, `needs: null`, fields accepts/requires `entityId`); `entitycreate`'s accepts gain `contact`, `law`. The arm reads `by` and `viewer` from the address (the stamps), never from the body (tested: a body `by` is not read). C60 (test only): a vouched memo naming a registered organisation resolves to it and is held by `strongestByCapture` and `concerns` (what `connections.derive`, the `connect` act, reads) and found by `namingDocuments`; the test passes first time: **no defect in `entities`**; `connect` itself is `connections`' and the screen's (`person.mjs` `connect` reads `r.documents` and `r.connections`), so the walk's 0 is a lag or those modules' (as C60's own note says).

**Readings (BOB may correct; J6 asked, B7 answered).** (1) R63's "from the request screen only" is the door's grade (`op-grades`, cause-shell-3); entities marks every office a non-administrator member (not a machine, not `null`) registers and refuses nothing by screen. (2) `officeconfirm`'s weight `reversible` and `needs: null` (an administrator's act the module itself enforces, as `memberadd`, `expertiseconfirm`). (3) `createEntity`'s own answer is unchanged (no `named_by_member` in it, so its key list is as before). (4) `contact.value` is trimmed and cut at 500, not validated by kind. (5) `law` is matched as `actions` matches a law (`citation`, else `name`).

**Stand-ins (they join the design's batch).** `refusal.CONFIRM_NOT_AN_OFFICE`, `refusal.NOT_NAMED_BY_A_MEMBER` (the rows' translations, `localize` defaults in `checks.mjs`; `t50.test.mjs` takes the design's row when it lands); `entities.index.an_office_is_confirmed_by`, `entities.index.confirming_an_office_a_member` (the act phrase `NOT_AN_ADMIN` names), `entities.index.only_an_office_a_member`, `entities.index.this_office_was_not_named`, `entities.index.where_requests_go_and_the`, `entities.index.where_requests_go_is_a`, `entities.index.the_law_requests_go_under`, and the op description `entities.declared.officeconfirm`. Not in `WORD_KEYS` (that list is the design's `reads`).

**Deferred.** None.

**Found in other modules.** (a) `op-declarations` / `control-plane` (L11, wave 2) must route `officeconfirm`: its declared row is taken (NEEDS_MISSING gone with `needs: null`); the family hand rows are theirs. (b) `request` screen: `entitycreate` from `request` sends `contact` and `law` (DEC-402's "where requests go" and "the law it goes under"); `screens-action` should send `law` as a `records_laws` citation, and the first profile must hold the federal records law (FOIA) in `records_laws` for DEC-402's choice to be accepted: today `oakland-alameda` holds the state law only (`jurisdictions`' to add). (c) Retrieval-browse's fixture builds `entities` from `ENTITIES_SCHEMA` without `migrate`: the schema now holds the new columns, so nothing to do there. (d) Stale generated artifacts (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` (and the release copy) embed entities' source; not regenerated here.

**Tests and checks.**
- `node --test --test-force-exit bio-plane/test/m/entities/`: 152 pass, 0 fail (`t51r3.test.mjs` 10 new; `ops`, `registry`, `t35`, `t50` updated for the office keys, the two rows and the new op). Seen failing first: every new test failed before the code (7 of 8 on the first run; the C60 test passed first time as above; the contact/law and row tests failed before they were built).
- Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`, `DECLARED_OPS` is a shared table: 101 modules, 1,440 test files): first run 274 fail, all `op-declarations: officeconfirm: NEEDS_MISSING (R80)` (fixed by `stamps`/`needs`) plus 3 in retrieval-browse (fixed by the schema holding the columns); the 201 files that failed, re-run: 13 fail, the same 13 failing tests as on `origin/tranche/T51` (a worktree of the tip), none names entities or officeconfirm. After the last merge of `tranche/T51` (which holds op-grades' own `officeconfirm` hand row, K4379: weight `reversible` and a description my declaration had to equal, `DECLARED_OP_DISAGREES`, now equal), op-declarations, op-grades, answer-envelope, store-door, plane and retrieval-browse: 822 tests, 14 fail, the same 14 as on `origin/tranche/T51` (op-grades R42/R46 marks, answer-envelope families, wizard-scripts' registry gaps, store-door's `groupdescriptiondraft`, other modules'); none names entities; `officeconfirm` is in none of their failures.
- format 0 failures; architecture 0 failures; coverage 64 of 64; words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); ownership 0 failures; `setup-words --check`: the stale-rows note only, none names entities.

Size (session_01Sh4ALdMiG1TkftB8H71Tn6): test runs 20, module lines 2,560

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

## Completion (B5, K4337)

**Entries applied.** Cause 1: `resolutionsFor` (R14) also answers `unresolved: [{ref, label, page}]` and `unresolved_truncated`: the capture's references (each at its first place) that no resolution row holds, in reading order (the reading's write order), at most the op's `limit`, by reading one past; `page` as R61 (null where the reading cannot say). A fully resolved reading, and a capture with no reading, answer `[]`. A testimony resolves a reference. `op=resolutions` carries it. Also declared `resolutions` in `DECLARED_OPS` (read, accepts `sha256`, `limit`; requires `sha256`, refused `NO_SHA`; K4208) with its `declared-ops` test.

**Requirement lines for BOB to write.**
- R14: "`resolutionsFor` also answers `unresolved: [{ref, label, page}]`, the references of the capture that no entity resolution holds, one per reference (at its first place), in reading order, at most `limit`, with `unresolved_truncated` by reading one past; `page` as R61 (null when the reading cannot say); `[]` for a fully resolved reading. Sight is R14's. Test: a reading with three unmatched names answers them in order; a testimony removes one; control: a fully resolved reading answers `[]`."
- R62's list gains `resolutions` (accepts `sha256`, `limit`; requires `sha256`).

**Readings (BOB may correct).** (1) "Reading order" is the order the reading wrote its references (row order). (2) `label` is the reference's own label, `null` if it holds none; no fallback to the key. (3) A reference counts as unresolved when no entity has any resolution (including D) for it.

**Deferred.** None. **Found in other modules.** None new.

**Tests and checks.** New tests seen failing first; negative control (dropping the "no resolution" condition) fails 2 tests. `node --test --test-force-exit bio-plane/test/m/entities/*.test.mjs`: 142 pass, 0 fail. Direct users of entities (all test dirs of modules whose uses name it): 2 fail, identical to the tranche tip (`R24` DEC-149 words, `R17` groupdescriptiondraft); same test names, no new red. format 0 failures; architecture 0; coverage 62 of 62; words 0; ownership 0 (HEAD ca83658d7a).

Size (session_012itnSuHrePTTFaLFKMtKqc): test runs 6, module lines 2447

## J5 · COMPLETE

B5 (K4337 cause 1) done, pushed. resolutionsFor/op=resolutions answers unresolved [{ref,label,page}] + unresolved_truncated (reading order, bounded, [] when fully resolved); resolutions declared in DECLARED_OPS. entities tests 142/0; direct users: same 2 reds as tranche tip; format/architecture/coverage 62of62/words/ownership clean. Requirement lines for R14 and R62 in my record (Completion B5). Size: test runs 6, module lines 2447.

## J6 · QUESTION

QUESTION (C64, entities R63/R64; carrying on with my best readings, nothing blocks):
1. NOT_AN_OFFICE already exists as another module's code: duties mints it with the word row `refusal.NOT_AN_OFFICE` ("Powers are read for an office...") and lines refuses it inline. A catalogue row of mine under that key would say the wrong thing at my site, so `confirmOffice` answers `NOT_AN_OFFICE` and `NOT_NAMED_BY_A_MEMBER` as plain `{ok:false, reason, detail}` (no `code`/`check` row), each detail its own sentence, like entities' UNKNOWN_SECTOR/NOT_AN_ORGANISATION. If you want catalogue rows (R29), name the keys (my proposal: `refusal.OFFICE_NOT_AN_OFFICE_TO_CONFIRM`, `refusal.NOT_NAMED_BY_A_MEMBER`) and a different code than duties' for the first.
2. Stand-in sentences (localize defaults, no word row yet): `entities.index.an_office_is_confirmed_by`, `entities.index.confirming_an_office_a_member` (the act phrase NOT_AN_ADMIN names), `entities.index.only_an_office_a_member`, `entities.index.this_office_was_not_named`, and the op description `entities.declared.officeconfirm`.
3. DEC-402 draws "where requests go" and "the law it goes under" beside the office's name on `request`, but `entitycreate` accepts only kind, label, note, aliases, sector, proceeding, forum_kind: the entity holds no address or law. I register what the screen sends as kind/label/note/aliases and hold nothing else. If the office is to carry its recipient address and law, that is a requirement line for BOB (where it lives) before the screen can rely on it.
4. R63's "from the request screen only" is the door's grade (op-grades, cause-shell-3): entities cannot see a screen, so it marks every office a non-administrator member (not a machine) registers and refuses nothing by screen. My reading of `officeconfirm`: weight `reversible`, classes admin/member/probe (the module refuses a member), `by` stamped into the body like `entityidentify`'s; op-declarations/control-plane must route it (L11).

## J7 · COMPLETE

COMPLETE (fix round 3, ENTITIES #18). C64 provider's part met: R63 (`named_by_member` on an office a non-administrator member registers, read by readEntity/entitiesByAlias/entitiesOfKind; office `contact` and `law`, K4364) and R64 (`confirmOffice`, `op=officeconfirm`; rows C-91.10 CONFIRM_NOT_AN_OFFICE and C-91.11 NOT_NAMED_BY_A_MEMBER, K4364); R62 declares officeconfirm (stamps viewer,by; needs null; weight reversible; description equal to op-grades' hand row). C60 test added and passes first time: no defect in entities (connect is connections' and the screen's). Entities 152 pass, 0 fail (t51r3.test.mjs new). Impact over 101 modules/1,440 files: the only new reds were officeconfirm NEEDS_MISSING and a retrieval-browse fixture, both fixed; the rest equal the tranche tip's reds. format, architecture, coverage 64/64, words, ownership 0 failures. Tranche/T51 merged (through 3033d0015a).
Requirement lines for BOB: R63/R64 as written plus: (1) `named_by_member`, `confirmed_by` also in entitiesByAlias items; `confirmed_at` in readEntity; non-office kinds answer null (readEntity) or omit them (entitiesOfKind); (2) `law` is a `citation` or `name` of an active profile's `records_laws` entry, held as its citation; refusals UNKNOWN_LAW, BAD_CONTACT, OFFICE_FIELD_NOT_FOR_KIND, each before an id is allocated; (3) the confirm's stamps are the address's `by` and `viewer` (a body `by` is never read); (4) R62 lists officeconfirm (accepts/requires entityId).
Found elsewhere: (a) DEC-402 needs the federal records law (FOIA) in the first profile's `records_laws` (jurisdictions): today it holds the state law only, so `law` from the request screen would be refused UNKNOWN_LAW for FOIA; (b) screens-action sends `law` as that citation and `contact` as {kind: address|email|portal, value}; (c) control-plane/wave 2 routes officeconfirm; (d) stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs and the release copy embed entities' source. Stand-in sentences listed in my record (they join the design's batch).
Size (session_01Sh4ALdMiG1TkftB8H71Tn6): test runs 20, module lines 2,560

## J8 · COMPLETE

COMPLETE again (B8): officeconfirm's description was already your sentence word for word (commit 'officeconfirm's description is op-grades'), declared through localize entities.declared.officeconfirm; behaviour matches it. Merged tranche/T51 again; entities 152 pass, op-grades cause3 clean of entities reds. Nothing else changed.

## J9 · QUESTION

QUESTION (C64-more, entities). Built and green in my module: `entitycreate` of an office by a non-administrator member (the R63 marked path) first looks for a held office of the same folded name (a live alias; one that states another law does not match) and answers it with `existed: true`, writing nothing; an administrator's or a machine's creation is unchanged (they may register two offices of one name, e.g. the Town Clerk of two towns). New tests `t51r4.test.mjs` (R65, seen red then green). Entities suite 156 pass.

The conflict: `actions/t33.test.mjs` "R9 R47 actionCreate fills an office arm's entity id..." registers a second "Town Clerk" office through `createEntity` with `declaredBy` a plain member (the fixture has no members row, so she reads as a non-administrator), to test the ambiguous case. With the look-first it gets the first office back, so that test fails (the only failure in 25 suites run; the others failing there also fail on the tranche tip). I cannot change `actions`.

Best reading and my plan unless you say otherwise: keep look-first as the default for a member's office (your instruction), and the `actions` job (or you) makes that test's twin through an administrator's or a machine's stamp (the one-line change: `declaredBy` a machine for the twin). Alternative if you would rather no other test moves: I make the look-first opt-in by an `accepts` field `reuse: true` on `entitycreate`, which `screens-action`'s "Use this office" would send; the seam test there then needs that field. I recommend the default (no new field).

## Completion (T51 fix round 4, ENTITIES #19)

**C64-more (provider).** (1) Root cause: `entitycreate` created without looking (`entities/index.mjs` `#create`, the insert after R63's `marked`); the screen's one-box comma split is `screens-action`'s (`request.mjs:204`). Fix: a non-administrator member's office (the R63 marked path) is first looked up by its folded name among the live aliases of offices (a withdrawn alias matches nothing, R8); an office that states a different law does not match; a hit answers `{ok, existed: true, entity_id, kind, label, alias_count, at, sector}` and writes nothing (no entity, no alias, no mark change). An administrator's or a machine's creation is unchanged (twins stay theirs to make). A refusal still comes first. (2) Gap: no test named an office twice; `t51r4.test.mjs` does (and the control kinds, law, administrator twin). (3) Failing-first: `node --test .../t51r4.test.mjs` with the source change stashed: 3 fail, 1 pass (the control that a refusal comes first); with it: 4 pass. (4) N.

**Reading (BOB answered B10: default look-first, no new field).** Matching is the module's fold (`normAlias`: case and whitespace; punctuation is not folded, as R6). Kind other than office, and an administrator's or a machine's office, are not looked up.

**Expected red (B10):** `actions/t33.test.mjs` "R9 R47 actionCreate fills an office arm's entity id from the one office entity held..." (its twin office is made by a plain member; BOB fixes it with a machine's stamp at merge). Not touched.

**Proposed requirement line (BOB writes):** R65 (T51 fix round 4, C64-more; amends R63) `createEntity` of kind `office` by a non-administrator member (the R63 marked path), when a held office has the same folded name as its label or a standing alias (R6's fold; a withdrawn alias, R8, matches nothing) and does not state another `law` than the one given, registers nothing and answers that office with `existed: true`; an administrator's or a machine's office is registered as before. Test: a member names an office twice (also with other casing and spacing, and by another member): both answers name the first, no row written; control: an administrator's twin is a new entry, a different name, a person of the same name, and an office under another law are new entries; a refusal is answered first.

**Tests and checks.** `node --test --test-force-exit bio-plane/test/m/entities/`: 156 pass, 0 fail. Users run (offices created): actions 147/1 (the expected red above), duties, instance-setup, filings, escalation, conformance, consequences, following, people, screens-action 229, screens-settings 246/1, retrieval-browse, op-grades, op-declarations 244/1, affordances, money, lines, events, calculations, wizard-scripts, inquiry, bias, case-disclosures, screens-entry, screens-investigate: all pass but the three named; screens-settings (R15 C84) and op-declarations (R34) fail identically on `tranche/T51`'s tip. format, architecture, coverage (64 of 64), words, ownership: 0 failures. No generated artifact edited; `bio-plane/dist` still embeds entities' source (stale, BOB regenerates).

Size (session_01KsYNk1nPchfRUwMdahprpu): test runs 12, module lines 3,150

## J10 · COMPLETE

COMPLETE (ENTITIES #19): C64-more provider met (look-first for a member's office, existed:true, nothing written); four fields, proposed R65 line and counts are in build/jobs/T51/entities.md. Entities 156 pass; checks 0 failures. One expected red: actions t33 'R9 R47 actionCreate fills an office arm's entity id...' (B10). No open question.

## Completion (T51 fix round 6, G55, ENTITIES #20)

**G55 (provider, tier 1).** (1) Root cause: `Entities.view()` (`entities/index.mjs` `view()`, was :2054) ran `jurisdictions.combine` on every call, and `entityByIdentifier` (:1222) called it first, so a money ingest paid the combine per row. (2) Gap: R44 was written for one lookup; nothing counted builds. `g55-view.test.mjs` counts them through `viewBuilds()`. (3) Failing-first: with the hold removed, `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/entities/g55-view.test.mjs` gives 4 fail, 1 pass ("builds rose by 1000"); on the base the five fail (`viewBuilds` absent); with the change 5 pass. (4) L: calculations' job.

**What changed.** `view()` re-reads `jurisdiction_profiles` on every call (one `getSetting` statement), keys it as `JSON.stringify` of the list (a non-array, null or unreadable value is keyed `[]`, as before), and returns the same deep-frozen object while the key is equal. `viewBuilds()` counts builds; the held view, its key and the count are `#` fields. **Bound: one entry per instance, about 145 KB, replaced when the key changes, never accumulated; dropped with the object.** `jurisdictions` is untouched (`get` hands out clones, so nothing it holds is frozen; a test says so).

**Readers of `view()` (all inside this module; no other module calls it).** :585 (`records_laws`), :1124, :1189, :1222, :1258, :1338, :1442 (`#idContext`), :2032, :2098, and through them `id-spaces` (`idSpaces`, `recogniseId`, `judgePair`, `systemOf`, `parcelStanding`) and `civil-time` (`validAt`). None mutates it; the freeze would throw if one did, and the whole entities suite and the suites of events, lines, money, calculations, connections, duties, people and retrieval pass. Nothing needed copying.

**Proposed requirement lines (BOB writes).** R20: the view `jurisdictions.combine` makes of the active profiles is held by the instance while the `jurisdiction_profiles` setting, read on every call, is unchanged (keyed by its parsed value, a non-list as `[]`); the held view is frozen to its depth and a reader that changes one copies it; `viewBuilds()` answers how many views were built. R44: a lookup (`entityByIdentifier`) reads the setting and the identifier row and builds no view while the setting is unchanged. Tests: `g55-view.test.mjs` (R20, R44).

**Census.** No op declared or changed (`DECLARED_OPS` untouched).

**Tests and checks.** entities 161 pass, 0 fail (`g55-view.test.mjs` 5 new). Users run: events 93, lines 36, money 92, calculations 86, connections 146, duties 75, people 79, retrieval 183: all pass. `checks/run.mjs`: format, architecture, coverage 0 failures (entities 65 of 65); words: one failure, the inherited `case-checker/spec.mjs:11`, none in entities; ownership 0 failures. No generated artifact edited; `bio-plane/dist` embeds entities' source and is stale (BOB regenerates).

Size (session_01Liu7BL68LjcrB4XrvLNv3e): test runs 14, module lines 2,589

## J11 · COMPLETE

COMPLETE (ENTITIES #20): G55 tier 1 met. view() is held while the jurisdiction_profiles setting is unchanged (key JSON.stringify of the list, non-list as []), deep-frozen, viewBuilds() added; bound about 145 KB, one entry per instance. No reader of view() mutates, so none changed. g55-view.test.mjs 5 tests, seen red (1000 builds) then green; entities 161 pass; users events, lines, money, calculations, connections, duties, people, retrieval pass; checks 0 failures in entities (inherited words failure case-checker/spec.mjs:11). Proposed R20/R44 lines and counts in build/jobs/T51/entities.md. Size (session_01Liu7BL68LjcrB4XrvLNv3e): test runs 14, module lines 2,598 (the record line says 2,589; this is the right count). No census op changed.

## Completion (T51 fix round 10, Wave A batch 4, ENTITIES #21)

**Causes done.** Three fixtures published in the new `bio-plane/test/m/entities/fixtures.mjs`, each made by entities' real code when called, each called and checked by a test in the new `fixtures.test.mjs`: `entitiesWorld` (real `Entities` over the test profile with a person, a second person and an office, and a succeeding `addIdentifier` act `w.ok`; the real refusals UNKNOWN_KIND, ENTITY_NO_LABEL, ENTITY_NO_NOTE, NO_SUCH_ENTITY, UNKNOWN_SCHEME, SCHEME_NOT_FOR_KIND, NO_BASIS, IDENTIFIER_TAKEN), `namingInRefused` (`code`: NO_KIND, UNKNOWN_KIND, NO_SHA, TOO_MANY_CAPTURES; the default is UNKNOWN_KIND), `unreadable` (`entitiesOfKind` over a registry whose table is dropped: `{ok:false, reason:'UNREADABLE', detail}`).
**Lines done.** `fixture.mjs:62` (promotion/makePromotion, FIX-E): the hand-built `promotionStub` is gone; `world()` takes `makePromotion().p` from promotion's published fixtures. `fixtures.mjs --list` for entities: stub 0, 0 failures. Left: none. No `fixtures-own` or `fixtures-generic` marker added.

**For BOB (one failing check, a `modules.json` line only you write).** `checks/architecture.mjs . entities` fails: `bio-plane/test/m/entities/fixture.mjs` imports `promotion/fixtures.mjs` of promotion, which entities does not declare in `uses`. Entities does use promotion through extraction and provenance; add `"promotion"` to entities' `uses` (as lines' entry has it). Nothing else in that check fails.

**Not mine.** `node bio-plane/src/setup-words/build.mjs --check` is stale on `control-plane.declared.subscriptionsignin` (a row of control-plane's declarations; I changed no word).

**Tests and checks.** Entities' module tests (`bio-plane/test/m/entities/*.test.mjs`): 164 tests, 164 pass, 0 fail. format: 0 failures. fixtures (entities): 0 failures. coverage: 65 of 65 ids named, 0 failures. ownership: 0 failures. architecture: 1 failure (above). `impact.mjs origin/tranche/T51 HEAD` names 107 modules; my change is test files only (no source line), so no user's behaviour moved, and I ran only my own module's tests.
Size (session_01UFnpNcKqgfLJ5Ee7BwZ3WN): test runs 4, module lines 0 (source); test lines +118
