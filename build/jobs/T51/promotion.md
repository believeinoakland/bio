# promotion (T51)

**Status** · session_01S23cDmLAXaM3ApftGXzWGJ · depth 2 · COMPLETE · handled B10

## J1 · QUESTION

Item 2 (K3807, remove the `deploy-ui.mjs` and `check-*.mjs` patterns from `row-census.mjs`) cannot be met yet. I made the edit and ran `system/row-census`: with the patterns gone the census imports `civicos-ui/check-mock-envelope.mjs` (legacy-ui's `paths` still hold `civicos-ui/`, tracked until L11), which runs its check when imported and exits with "check-mock-envelope: 2 failures"; the census suite dies before it reads a row, so the stamp could never go green. Best reading: the patterns stay until T51-126 deletes `civicos-ui/`; then the patterns and the stale comment `gate.mjs`:342 go in that same act (BOB's, after legacy-ui merges, or my CHANGE then). I reverted my edit; nothing of item 2 is in my branch. If you want it done another way (for example the census skipping the whole `civicos-ui/` prefix until L11), say which and I will apply it. R58 (`bundleHistory`, `op=bundlehistory`, R54's fourth arm) is done with its tests; the stamp waits for your CHANGE.

## Completion (PROMOTION #49)

**Entries applied.** T51-15: (1) R58 `bundleHistory` and `op=bundlehistory`, R54's fourth arm (`promotionOps` holds four ops), with `bundlehistory.test.mjs` (7 tests naming R58) and the R54 test amended. (2) The stamp, `CATALOG_VERSION` 1.77.0 -> 1.78.0, `ROW_CENSUS` re-pinned: 1918 rows, `31b4a129bc1b2c99b586c27c455d014fe1570c4287e4cc77c501e071f0d5864f` (9 arrived, 327 changed, none retired; none of the 336 is a row this module moved); fixture `row-census-1.77.0.jsonl` renamed to `1.78.0` with the new lines; the census suite's header and anchors re-pinned. (3) K3807 item 2 (the `civicos-ui/` patterns, `gate.mjs`:342): not applied, by B2 (K3838): goes to T52's stamp (N1246).

**Deferred.** The `civicos-ui/` patterns and the `gate.mjs`:342 comment (B2, T52).

**Found in other modules (REPORT to BOB).** (a) `build/modules.json` promotion `tests` still names `bio-plane/test/fixtures/row-census-1.77.0.jsonl`, which the stamp renamed to `row-census-1.78.0.jsonl`: `checks/run.mjs` format and architecture each show 1 failure until BOB moves that entry (BOB's file). (b) case-checker's generated `bio-plane/src/case-checker/program.mjs` embeds `CATALOG_VERSION` and is stale after the stamp: 3 tests in `test/m/case-checker/program.test.mjs` (R13 build bytes, R13 R16 R20 R22, R25) fail until the case-checker job regenerates it with `node bio-plane/src/case-checker/build-program.mjs` (manifest §14; not mine to write). (c) Already red before this job, not mine: 2 R61 failures in `test/m/case-authoring`; 10 coverage failures in other modules (agent-harness, agent-runner, capture, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval).

**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 148 pass, 0 fail. `system/row-census`: pass (10 arms, 1918 rows, digest as pinned). Other suites run: plane, op-declarations, legacy-store (same 6 failures with and without my change, op-declarations' registry pins); ratification, case-disclosures, case-tensions: 0 fail. `checks/coverage promotion`: 58 of 58 ids named. `checks/ownership promotion tranche/T51 job/T51/promotion`: 0 failures. `checks/run`: format and architecture 1 failure each, both (a); coverage's 10 failures are other modules'.

Size (session_01QXX7F37mcmzDGf3WCEqdPU): test runs 14, module lines 3948

## J2 · REPORT

Two things the stamp 1.78.0 makes stale in files that are not mine. (a) build/modules.json: promotion's tests entry names bio-plane/test/fixtures/row-census-1.77.0.jsonl, now row-census-1.78.0.jsonl; checks/run format and architecture each fail on it until you move the entry (as for 1.77.0). (b) case-checker's generated bio-plane/src/case-checker/program.mjs embeds CATALOG_VERSION and is stale: 3 tests in test/m/case-checker/program.test.mjs (R13 build bytes, R13 R16 R20 R22, R25) fail until the case-checker job runs node bio-plane/src/case-checker/build-program.mjs. Details in my record.

## J3 · COMPLETE

T51-15 done: R58 bundleHistory/op=bundlehistory (R54 four arms) with tests; stamp 1.78.0, 1918 rows, digest 31b4a129...; system/row-census green; promotion tests 148 pass; coverage 58/58; ownership 0 failures. K3807 item 2 deferred to T52 (B2). Reports: modules.json fixture name, case-checker program.mjs stale. Record has the detail.

## J4 · COMPLETE

T51-262 done (words pass, B4). Commit df52436b63 on job/T51/promotion.

**Entries applied.** The four `plain` findings in `build/plan/words-pass/promotion.md`, each judged a member-readable sentence and read through `localize`, en unchanged: `gate.mjs` `promotion.gate.capture_absent_from_bucket` and `promotion.gate.capture_bytes_differ` (the two `PLANE_*` details); `promotion/index.mjs` `promotion.index.project_needs_name` (the `NO_TITLE` detail); `promotion/names.mjs` `promotion.names.give_project_title_unique` (the C-77.2 repair). The one `testcopy`, `converts.test.mjs:170`: the list now comes from the module's own `MECHANICAL_APPEND_FILES` (history.mjs) plus `snapshots/page.html`, so the test no longer copies a path that also sits in subresources' localized sentence. Two tests that would copy the converted sentences, `wording.test.mjs` (R19 and R38), now compare with `localize(id, en)` by equality; the unused `OURS` constant is removed. Nothing judged unread by any member, so no REPORT for those.

**Deferred.** None.

**Found in other modules (REPORT).** `system/row-census` (R50 pin, my suite) reports 1921 rows against the pin's 1918: arrived with no record C-25.37, C-25.38, C-25.39 (VERSION_COMPARE_*), changed with no record C-33.25 (NO_ALIAS). None of these rows is in promotion's files and this job touches no table row, so they belong to the rows other modules have added and that await CR-5's stamp. Not changed here (B4: no stamp in this job).

**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 148 pass, 0 fail. `wording` + `converts`: 23 pass, 0 fail. `system/row-census`: 8 pass, 2 fail (the R50 pin above, other modules' rows). `checks/format promotion` path: 0 failures (175 modules). `checks/architecture` over the tree: 0 failures (3592 files). `checks/coverage promotion`: 58 of 58 ids named. `checks/run.mjs /home/user/bio`: format and architecture 0 failures; coverage 33 failures, none in promotion (other modules). `setup-words/build.mjs --check`: the stale-rows note for `rows.mjs` only (expected; BOB regenerates at layer close), no refusal naming promotion. `checks/words.mjs`: no finding in promotion's files (the remaining failures are other modules'). `checks/ownership promotion tranche/T51 job/T51/promotion`: 0 failures.

Size (session_01R5Q8GiUFkdmFTFrNbWpmSr): test runs 7, module lines 3935

## Completion (PROMOTION #51, CR-5)

**Entries applied.** (1) R59: each `bundlehistory` revision states `capture_sha`, the `documents[0].capture.sha256` of that revision's own `data/provenance.json` (read from the bytes whose digest the revision's file list names, live or under the next snap key); absent when it names none; two new tests in `bundlehistory.test.mjs` (R59, R59 control). (2) Words (3 findings, `checks/words.mjs promotion`: inline 0, testcopy 0): `MACHINE_CANNOT_REOPEN`, `NOT_SET_DOWN` and `NAME_TAKEN` details now read through `localize("promotion.index.machine_cannot_reopen" | "not_set_down" | "project_name_taken", …)`; `wording.test.mjs` asserts `NAME_TAKEN` by `localize` equality. (3) Hand-lists: the check counts handlist 0 for promotion; nothing to convert. (4) K3807/N1246: the `civicos-ui/deploy-ui.mjs` and `civicos-ui/check-*.mjs` patterns and their header text removed from `row-census.mjs`; the `civicos-ui/` mentions in `gate.mjs` (the 1.44.0 note's `deploy-ui.mjs`, the 1.78.0 note's "stay until") removed. (5) The second stamp: `CATALOG_VERSION` 1.78.0 -> 1.79.0, `ROW_CENSUS` re-pinned: 1923 rows, `c5885eafaf5dbb471372fe8077398100993b6b49cae2be0c44d77d5f4e0a5d46` (5 arrived: C-117.59, C-117.60, C-25.37, C-25.38, C-25.39; 75 changed; none retired; none a row this module moved); fixture `row-census-1.78.0.jsonl` renamed `1.79.0` with the new lines; the suite's header and anchors re-pinned.

**Deferred.** None.

**Found in other modules.** (a) `build/modules.json` promotion `tests` still names `bio-plane/test/fixtures/row-census-1.78.0.jsonl`, now `1.79.0`: `checks/run` format shows "names no file" and architecture "owned by no module", and `checks/ownership` shows the new fixture "outside promotion's paths" until BOB moves that entry (BOB's file; as at each stamp). (b) case-checker's generated `bio-plane/src/case-checker/program.mjs` embeds `CATALOG_VERSION` and is stale after the stamp: 3 tests in `test/m/case-checker/program.test.mjs` (R13 build bytes, R13 R16 R20 R22, R25) fail until the case-checker job or BOB regenerates it with `node bio-plane/src/case-checker/build-program.mjs` (manifest §14). (c) Not mine, seen in `checks/run`: coverage 8 modules (agent-harness R17, agent-runner R36-R38 R40, credentials R80, extraction R77, installer-steps R26 R31, journey-check R19, screens-inquiry R81 R82, setup-words R19); words 12 inline findings in instance-setup `setup-fleet.mjs` (CR-12). (d) `build/requirements/promotion.md`: R59's "not yet met" marker is BOB's to clear.

**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 150 pass, 0 fail (`m/promotion` alone 149). `system/row-census`: 10 pass, 0 fail (1923 rows, digest as pinned). `checks/words promotion`: 0 failures. `checks/coverage promotion`: no promotion line failing (R59 named). `checks/run`: promotion's only failures are (a). `checks/ownership promotion tranche/T51 job/T51/promotion`: 1 failure, (a).

Size (session_01NQ73uXH2mGnUfNvX2qwAyZ): test runs 12, module lines 3951

## J5 · COMPLETE

CR-5 done: R59 capture_sha (with tests); the 3 words findings converted; civicos-ui census patterns and gate.mjs comments removed; second stamp 1.79.0, 1923 rows, c5885eaf..., system/row-census green; promotion tests 150 pass; words 0. Open for BOB: (a) modules.json promotion tests entry still names row-census-1.78.0.jsonl, now 1.79.0 (format, architecture and ownership each show 1 failure until moved); (b) case-checker program.mjs stale after the stamp (3 tests; regenerate with build-program.mjs); (c) R59's not-yet-met marker is BOB's to clear. Detail in my record.

## J6 · REPORT

Found in other modules, not changed here (B6, K4206):

(a) `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`, manifest §14) embeds promotion's source. It is stale after commit a28b7c1c96 until regenerated (`npm run build` in `bio-plane/`, or `bio-plane/scripts/bundles.mjs` at layer close). Not regenerated in this job.

(b) Three tests fail in `op-declarations` and `op-grades`: R73 (T50, every act of the registry has a declaration: a deep-equal list), R42 (MARKS is total over the rungless acts: a deep-equal list) and R46 (`expertisewithdraw` is rungless and has no mark). The same three fail with promotion's change reverted, so they are not caused by this job. Owners: `op-declarations`, `op-grades`, and whichever module owns `expertisewithdraw`.

(c) For your decision: registered steps of other modules read body fields that promote's declaration does not list: `intent` reads `personWarningSeen`, `ai-runs` reads `run` and `assistantPrincipal`, `provenance` reads its testimony key. `accepts` names only the fields promotion's own code reads (R80: "the fields the arm reads"). Say whether a step's reads belong in `accepts`.

## J7 · COMPLETE

**Entries applied.** B6 · K4206: `promote` declared in `DECLARED_OPS` (`bio-plane/src/promotion/index.mjs`), beside `reopen` and `projectfork`. Class, mutating flag and weight are its existing rows': classes `admin`, `member`, `probe`; `mutating: true`; weight `substrate` (its op-grades ground, the RUNG_ABSENT row). Description is its existing NON_ACTS sentence, `localize("promotion.declared.promote", "substrate: the one write path every act rides")`. Fields: `accepts` = `bundleId`, `base`, `files`, `meta`, `snapKey`, `author`, `replay`, `writer`, `operation`, `visibility`, `ownerMemberId`, `actorIdentity`, `actorViewer`, `actorMemberId`, `drop`, `register`; `requires` = `files`, `meta`, `snapKey`.

Decisions: (a) an absent `files`, `meta` or `snapKey` is already refused naming the field (R7, R11), so the arm is unchanged. (b) `bundleId` is accepted but not required: a project's creation mints it (R19), and a revision without it is refused `MALFORMED` naming it; `requires` cannot say "unless creating", so it is left out. (c) `refs` and `basis` are not accepted: the arm refuses them by name when sent (R7). (d) No `stamps`, `needs` or `machineClasses`: the existing hand row has none, and `needs` is only required for a mutating op with no hand row.

**Requirement for BOB (NEW R61).** Proposed text, to add to `build/requirements/promotion.md`: "**R61** (T51, K4206; op-declarations R80; op-grades R49; test-support R15) The module declares `promote` in `DECLARED_OPS`, its class, mutating flag and weight copied from its existing rows, its `fields.accepts` the package fields the arm reads and `fields.requires` `files`, `meta` and `snapKey`. Test: `declaredOpHolds` for `promote` in `declared-ops.test.mjs` (R61)." R60's text also names `reopen` and `projectfork` as the declared ops; `promote` joins them, and R60's not-yet-met marker is BOB's to clear.

**Deferred.** None.

**Found in other modules.** Reported in the REPORT before this entry: (a) the plane bundle is stale; (b) three registry tests fail, also with my change reverted; (c) the body-field question for steps.

**Tests and checks.**
- `test/m/promotion/` and `d526-refusal-order`: 153 pass, 0 fail. `declared-ops.test.mjs`: 3 pass (R60 reopen, R60 projectfork, R61 promote). The R61 test was seen failing first (no declaration). The probe compares answers without the minted project id and sha, since a creation mints a random suffix.
- `op-declarations/`, `op-grades/` and the sibling declared-ops suites: 389 pass, 3 fail (listed above; the same three fail with the change reverted).
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; words 0 failures; coverage's 7 failures are other modules' (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring).
- `checks/ownership.mjs /home/user/bio promotion tranche/T51 job/T51/promotion`: 0 failures.
- `checks/coverage.mjs /home/user/bio promotion`: 60 of 60 live ids named.
- `node_modules` installed for the five directories that lacked it (K4113).

**CR-5 (B5).** B5 was the CR-5 start; J5 (session #51) completed it, and its `promotion` tests pass in this job's suite (153). I did not re-run CR-5.

**Size.** Module lines counted as `wc -l` over `bio-plane/src/promotion/*.mjs` and `bio-plane/src/gate.mjs` (the module's paths): 3966.

Size (session_01FxMw8iuonFjynFMH9nWcSM): test runs 6, module lines 3966

## Fix round 7 · G74 (PROMOTION #53, session_017BterrfaggzcXm1vXYhTRC)

**What changed.** `bio-plane/src/promotion/index.mjs` in `#promote`, just before R56's stage fence (about :694): a non-replay promotion stamped with a session member (`actorMemberId`) whose document states a `project:` (R53's `projectOf`, a project's own bundle excluded) is refused through membership's `notAParticipant(project, member, {act:"promote"})` (its R87, row C-56.3, reason `NOT_A_PARTICIPANT`) when `membership.participation(project, member)` is null. Joined, owner, invited and leaving members pass (gathering stays open, K4557). Machine credentials (no `actorMemberId`) and replays are not asked. An absent project answers exactly as a project she is not in. The refusal runs inside the transaction, so nothing is written (R2). Old records (INFO-2026-0161) untouched.
**Why tests missed it.** The intake tests filed as the owner or the administrator; none acted as a member outside the project.
**Failing-first.** `test/m/promotion/r7-foreign-project.test.mjs` (8 tests, named R53 G74): seen RED before the edit (the walker's filing was accepted: `reason` undefined, expected `NOT_A_PARTICIPANT`), GREEN after. Controls: joined, owner, invited, document with no project, machine credential, replay.
**Platform check.** L (Miniflare door) belongs to the control-plane seam file `t51-round7-seam.test.mjs`; P at the re-walk (BOB's). Mine is the op-level test.
**Refusal wording.** No new `localize`, no new row, no new code: the served sentence is the held row `refusal.NOT_A_PARTICIPANT` ("You hold no place in this project ... An owner of the project can invite you to it."), the stand-in. **Row owed to UX-DESIGN:** a refusal row for filing into a project one is not in (DEC-83: the sentence, then the remedy: only the project's members can add to it; ask to join), keyed `refusal.NOT_A_PARTICIPANT` or a new key BOB assigns; the code then carries it.
**Proposed requirement line (BOB writes it).** R53 (G74): a promotion by a session's member whose document states a project she has no participation in (joined, invited or leaving) is refused `NOT_A_PARTICIPANT` through `membership.notAParticipant` (its R87), writing nothing; a machine credential and a replay are not asked. Test: `r7-foreign-project.test.mjs`.
**Census ops.** None new. No change to `promotionOps` or `DECLARED_OPS`.
**Suites and checks.** `test/m/promotion/`: 160 pass, 0 fail. Users: control-plane 447/447; monitoring, actions, project-stage, store-door, intent, strength, investigation and screens-intake: 1016/1018 under load, the two (`t51-fix5` R31 E8, `t51-check` R42) pass alone and with the change reverted, and `screens-intake` alone is 309/309. `checks/format`: 0 failures; `architecture promotion`: 0; `coverage promotion`: 61 of 61; `ownership promotion tranche/T51`: 0. An administrator filing into a project she has no participation in is now refused too, as the decision is worded (member or invited only); no exemption is made.
**Deferred.** None.

Size (session_017BterrfaggzcXm1vXYhTRC): test runs 9, module lines 3977

## J8 · COMPLETE

G74 done. promote refuses a session member stamped actorMemberId whose document states a project she has no participation in (NOT_A_PARTICIPANT via membership.notAParticipant, act promote); joined, owner, invited, machine, replay and no-project pass. Failing-first test r7-foreign-project.test.mjs seen red then green. promotion 160 pass; users green (two screens-intake tests flaked under concurrent load, pass alone); format, architecture, coverage 61/61, ownership 0 failures. No new row, code or localize; row owed to UX-DESIGN named in the record. Administrators who are not participants are refused too, as worded.

## Fix round 7 · G74 · B8 applied (PROMOTION #53)

B8 (U463, DEC-425): the refusal is now `reason`/`code` `PROMOTE_NOT_A_PARTICIPANT`, `act: "promote"`, `project` the id as sent, and `detail` the sentence keyed `refusal.PROMOTE_NOT_A_PARTICIPANT` via `localize` (rows.mjs is stale until BOB regenerates, so the design's sentence is the `en`, verbatim; the list wins once held). `{project}` is the project's name where she has at least existence sight of it, else as she sent it; the record's id is never given. `src/promotion/index.mjs` (the G74 block before R56's fence). The earlier stand-in (`refusal.NOT_A_PARTICIPANT`, membership's `notAParticipant`) is gone; the "row owed to UX-DESIGN" is now delivered. Tests: `r7-foreign-project.test.mjs` updated (name not id, sentence equals the keyed text, absent project refused alike); `test/m/promotion/` + `d526-refusal-order`: 161 pass, 0 fail. format, architecture, coverage (61/61) and ownership: 0 failures. No census row, no op change.

Size (session_017BterrfaggzcXm1vXYhTRC): test runs 12, module lines 3987

## J9 · COMPLETE · re B8

B8 applied: promote refuses with PROMOTE_NOT_A_PARTICIPANT, sentence keyed refusal.PROMOTE_NOT_A_PARTICIPANT with the design's text as en (rows.mjs stale until you regenerate), {project} by name where she has existence sight else as sent, never the record's id. promotion 161 pass; format, architecture, coverage 61/61, ownership 0 failures. Pushed.

## Fix round 10 · Wave A batch 2 (PROMOTION #54, session_01FjnskQoMLcMGgXpteLNQ1m)

**Fixtures published** in `bio-plane/test/m/promotion/fixtures.mjs`, each made by promotion's real code when called, each checked by `fixtures.test.mjs` (8 tests, each naming its requirement): `factUnavailable` (real `fact("unregistered")`, FACT_UNAVAILABLE), `groupUndetermined` (a `SUC-` success_record created with no producing group, GROUP_UNDETERMINED, C-64.1), `promotionOver({record, membership, host, now, roster})` with `registeredSteps(p)` (what `registerStep` accepted; refused registrations are not read back), `registrars()` (real STEP_DECLARED on a second step or fact, FACT_UNAVAILABLE, `onCommitted`), `projectActNotParticipant` (real project created, then revised by a non-participant), `snapKeyTaken` (SNAP_KEY_TAKEN, C-67.1), `retireCited` (CITED with offenders), `promoteControlled(decide)` (real `promote` over a real record; verdicts `succeed`, `stale`, `snapkey`, `outsider`, `throw`/`fail`; a spy log that delegates). `makePromotion` and `staleBaseRefusal` were already published.
**One finding about the fixture plan.** The plan says a throw "has no real cause in promotion and stays a fault". In fact `promote` never throws out: a record that fails inside the transaction is answered `PROMOTE_FAILED` (index.mjs `promote`, the catch), nothing written. `promoteControlled`'s `throw`/`fail` verdict therefore returns that real answer; a user that needs the door to see a thrown error must throw in its own double (a fault, not an answer).
**Markers added (K5060).** `converts.test.mjs:39` `// fixtures-generic: BIAS_FENCE`: the test registers the fence itself and makes it refuse; no provider's code. `bio-plane/test/system/row-census.test.mjs:482` `// fixtures-generic: CONTROL_ARRIVAL`: a census row made up for the negative control; no module gives it.
**Lines left (named).** `checks/fixtures.mjs . promotion --list`: 2 FIX-E lines, `fixtures.mjs:163` (`PROJECT_ACT_NOT_A_PARTICIPANT`) and `:166` (`PROJECT_VISIBILITY_UNKNOWN_SETTING`) in the `makeMembership` double, provider membership (`projectActRefusals`): not in this job, they arrive as a CHANGE.
**Deferred.** None. **Found in other modules.** None.
**Users run.** impact names ratification, monitoring, store-door, control-plane: their 8 affected test files, 103 pass, 0 fail.
**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 170 pass, 0 fail (the 8 new). `system/row-census`: 1 fail, the R50 pin against rows other modules added (C-102.34 ... C-130.22, CENSUS MOVED), awaiting the stamp (T52, accepted red by name); the same without my change, and my only edit there is a comment line. `checks/format`: 0 failures. `architecture promotion`: 0. `coverage promotion`: 61 of 61. `words promotion`: 0 failures. `fixtures . promotion --list`: 4 -> 2 failures (the two above).

Size (session_01FjnskQoMLcMGgXpteLNQ1m): test runs 7, module lines 3987

## J10 · COMPLETE

Fix round 10, Wave A batch 2 done. Published in bio-plane/test/m/promotion/fixtures.mjs, each made by the real code and tested in fixtures.test.mjs (8 tests): factUnavailable, groupUndetermined, promotionOver + registeredSteps, registrars, projectActNotParticipant, snapKeyTaken, retireCited, promoteControlled (verdicts succeed/stale/snapkey/outsider/fail; promote never throws out, a failing record is PROMOTE_FAILED, so the plan's 'throw stays a fault' is not needed for it). makePromotion and staleBaseRefusal already published. Markers added: converts.test.mjs:39 fixtures-generic BIAS_FENCE (fence the test registers itself); test/system/row-census.test.mjs:482 fixtures-generic CONTROL_ARRIVAL (row made up for the negative control). Lines left: 2 FIX-E (fixtures.mjs:163,166, provider membership projectActRefusals), arriving as a CHANGE. promotion 170 pass; users (ratification, monitoring, store-door, control-plane) 103 pass; format, architecture, coverage 61/61, words, ownership 0 failures; system/row-census has its accepted R50 red (other modules' rows await the stamp). Pushed.

## Fix round 10 · B10 applied (PROMOTION #54)

`makeMembership`'s `projectAuthority` and `visibilitySettingRefusal` now return membership's own answers from its published `projectActRefusals` (`test/m/membership/fixtures.mjs`, taken once at load; membership is in my uses): the invented literals at `fixtures.mjs:163,166` are gone. `checks/fixtures.mjs /home/user/bio promotion --list`: 0 failures (2 accepted generic markers). `test/m/promotion/` + `d526-refusal-order`: 170 pass, 0 fail. format, architecture, coverage (61/61), words: 0 failures. Markers I added, unchanged: `converts.test.mjs:39` BIAS_FENCE, `row-census.test.mjs:482` CONTROL_ARRIVAL. Nothing left or deferred.

Size (session_01FjnskQoMLcMGgXpteLNQ1m): test runs 9, module lines 3987

## J11 · COMPLETE

B10 applied: the membership double's projectAuthority and visibilitySettingRefusal now return membership's real answers from its projectActRefusals fixture; fixtures check (absolute path) 0 failures; promotion 170 pass; format, architecture, coverage 61/61, words, ownership 0 failures. Pushed.

## Fix round 10 · follow-up 51 · B11 applied (PROMOTION #54, session_01S23cDmLAXaM3ApftGXzWGJ)

**Root cause (K5130, with evidence).** `runGate` (`bio-plane/src/gate.mjs`, the register loop) asked only `hasCapture` for each register row and turned `present: false` into `PLANE_MISSING_BYTES` without looking at the image. A member's own testified observation (`provenance` `testify`) is held only as the inline file `snapshots/observation-<sha16>.txt` in the bundle, registered with that `capture_sha`, so signing a case reaching it was refused `GATE_REFUSED`/`PLANE_MISSING_BYTES` though the image held the very bytes.
**Fix (R28 amended).** When the bucket answers absent, a register row whose `path` in `image` is an inline string hashing (SHA-256 of its UTF-8) to `capture_sha` is present, with the string's UTF-8 length as its size, so the existing size check still yields `PLANE_SIZE` against `bytes`. A differing byte, a blob reference, a path the image lacks: the bucket's answer stands (`PLANE_MISSING_BYTES`). An unanswered probe still rejects; the probe is asked first.
**Why the tests missed it.** Every gate test gave every register row a bucket answer and no row whose path the image held; the image-held case was never built. Gap fixed: the new test in `gate.test.mjs`.
**Test.** `gate.test.mjs` "R28 (K5130) ...": an image whose register row names an inline file with matching bytes and a `hasCapture` answering absent is admitted (`ok` equals the same image with no register); the same with the text changed (same length) is `PLANE_MISSING_BYTES`; right hash with a wrong registered size is `PLANE_SIZE`; a blob reference, a path the image lacks, and a rejecting probe behave as before. Seen failing with `gate.mjs` stashed (1 fail), passing with it (9/9).
**Platform check.** None. **Deferred.** None. **Found in other modules.** None. Ids met: R28 (BOB strikes the mark). The case through the real door (testify, then caseratify) is ratification's seam test (follow-up 52).
**Tests and checks.** `test/m/promotion/` + `d526-refusal-order` + `system/row-census`: 171 pass, 1 fail: `row-census`, the R50 pin against rows other modules added (CENSUS MOVED), awaiting the stamp (follow-up 32, a later session); it fails identically without my change. `format` 0, `architecture promotion` 0, `coverage promotion` 61 of 61, `words` 0, `fixtures` 0 failures, `ownership` 0.

Size (session_01S23cDmLAXaM3ApftGXzWGJ): test runs 6, module lines 3987
