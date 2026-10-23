# promotion (T51)

**Status** · session_01FxMw8iuonFjynFMH9nWcSM · depth 2 · COMPLETE · handled B6

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
