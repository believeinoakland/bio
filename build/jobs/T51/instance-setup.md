# instance-setup (T51)

**Status** · session_011ShJzhwLnZv3XLiooRzh1n · depth 2 · COMPLETE · handled B20

## J1 · REPORT · re B1

REPORT. What BOB or another module's job must do for T51-106; nothing here blocks my COMPLETE.

1. **The door must hand `bootstrap` the caller (R95; plane and control-plane, BOB's to place).** `bootstrapOp(url, env, fp, {stub, json, storeSilent, storeRefusal, doAnswer, caller})` and `bootstrapReport(..., {caller})` take `caller`: `{cls: "admin"}` for an admin-class token, `{administrator: true}` for an administrator's signed-in session, as the control plane resolved them. Without `caller`, or with another class, the answer is exactly membership R132's key set (tests prove it); plane's `publicOp` (`bio-plane/src/plane/door.mjs`:45) still passes none, so no caller is credentialed until it does.
2. **A new store-internal route, `bootstrapfacts`, in `instanceSetupOps` (no spec, as `grouplogo` is).** It makes plane's `test/m/plane/door.test.mjs`:140 red ("instance-setup's forty-four routes": 45 !== 44); plane's job lists the route there. op-declarations' internal-route list (`t47.test.mjs`:362, where `grouplogo` is named) is where `bootstrapfacts` belongs too; it is not red today.
3. **Decisions I made for the seven facts (technical, BOB's to record in `rulings.md`).** `count_projects`: the bundles of type `project`, paged whole through record-core's `listByType`. `count_documents`: `provenance.counts(null).register`, the captured documents registered. `count_published`: `publicRead.publishedList().cases.length`, every published case edition. `count_members`: the `active` rows of `membership.memberList({administer: false})` (the founder counts once claimed). `last_used_at`: the newest `sessions.last_active`. `credentials` offers no read of it, so the module reads that table, read only (an improvement for `credentials`: a `lastActivity()` service). `installed_at`: R89's `running.installed_at`. A read that fails is that key `null`; the store's route not answering states all seven `null`.
4. **Strings I judge no member reads (K3944; the check still lists them, 18 plain):** `livefire.mjs`:68, 74, 79, 89, 92, 93, 96, 101, 104, 105, 114, 116, 141, 142, 155, the assertion names and their reasons in `op=livefire`'s `failing` (R19 names them; the probe class reads them); `setup.mjs`:966, 1012, 1022, `start()`'s report details ("this module had already started...", "no producers to register with", "no public-read to register with"). **Not convertible, K405 (12 copies):** `setup-fleet.mjs`:30, 32, 35–38, 42, 44, 55, 64, 66, 67 are the leaf's texts: each carries its key (`HOSTING_CONTROL.keys`, `FORGOT_HELP.keys`, `HOSTING_RECOVERY_DEPLOYER_KEY`) and equals the row's `en` (R97, tested); the check lists them as `copy` for as long as the leaf imports nothing. Together: `checks/words.mjs` over the whole tree names 30 lines of this module, all of the kinds above; it names no test copy and no marker finding.
5. **Rows and placeholders.** `setup-words/build.mjs --check` says `rows.mjs` is stale, as it must (about 60 `instance-setup.setup.*` ids are new or gone; no refusal names this module). A row already in `rows.mjs` wins over the `en` at the call, so every id the codemod made keeps its placeholder names (`{String}`, `{v1}` in 12 sentences, e.g. `instance-setup.setup.the_governor_did_not_answer`, `.the_store_did_not_confirm`): rename them when BOB regenerates, with the call. `words-reads.json`'s instance-setup entry already lists every key the source names; my test (R96) proves it and needs no change from the design.
6. **Reds seen in other modules, none from this change but the first:** plane 2 (1 mine, item 2; 1 local-facts', as on the tranche tip), op-declarations 9, answer-envelope 4, screens-settings 2, all identical on `fe5d5656fb` without my files; the whole-tree architecture check's one failure is answer-envelope's `page-policy.test.mjs` importing `signpage.mjs` (K3835).

## J2 · COMPLETE

COMPLETE. Entries applied (T51-106): **R95** `op=bootstrap` states `team_name`, `installed_at`, `last_used_at`, `count_projects`, `count_documents`, `count_published`, `count_members` as flat scalars to a credentialed caller only, from the store-internal route `bootstrapfacts` (`InstanceSetup.bootstrapFacts`); a failed read is that key `null`, all seven `null` when the route is silent; no caller or another class is answered exactly R132's key set (the definitions I chose are in J1, item 3). **R96** every `detail`, `note` and `why` of the listed parts is read by key: the 30 `instance-setup.*.detail.*` rows, `setup.note.*`, `setup.why.*`, `setup.text.*`; every refusal's detail that was a stitched `{v1}` fragment is now one whole sentence per branch (`localize`, ids `instance-setup.setup.*`); the `notAnAdmin` phrases and the update acts' phrases are `localize`d; `PersonId`, forum and office citations by `localize` or `word`. **R97** `HOSTING_CONTROL.keys`, `FORGOT_HELP.keys` and `HOSTING_RECOVERY_DEPLOYER_KEY` in the leaf, which still imports nothing; the stale comments (`setup.mjs` header, `setup-fleet.mjs` header and the block's) corrected. Words (W): the 33 findings, the 67 plain findings and the 3 test copies of `words-pass/instance-setup.md` each fixed or judged (J1, item 4); `page.test.mjs`, `words.test.mjs`, `fixture.mjs`, `assistant`, `draft`, `group`, `language`, `places`, `profiles`, `seeds`, `t41`, `t45`, `t48` compare with `word`/`localize` by equality, none holds a sentence's text.

Deferred: none of my own. Left for BOB with reasons in J1: the 12 leaf texts (K405) and the 18 operator strings (livefire's assertion names, `start()`'s report details), listed for the design's `unkeyed`; the placeholder names of existing codemod ids until the rows are regenerated.

Found in another module (J1, items 1, 2, 3, 6): the door passes no `caller` to `bootstrapOp` (plane, control-plane); plane's `door.test.mjs`:140 counts instance-setup's routes (45 now, not 44; the one red this change adds); op-declarations' internal-route list names `bootstrapfacts` nowhere; `credentials` has no `lastActivity()`; the inherited reds in plane (1), op-declarations (9), answer-envelope (4, and its architecture import of `signpage.mjs`), screens-settings (2) are as on `fe5d5656fb`.

Tests and checks: instance-setup **193 pass, 0 fail** (182 at START; new: `t51.test.mjs` 11, R95 ×5, R96 ×4, R97 ×2). Used by this module, run: control-plane 324 pass; store-door 48 pass; admission 58 pass; screens-entry 84 pass; installer's t47, t48, requirements, t50 (91 tests, 0 fail); plane 258 pass, 2 fail (the above); op-declarations 209 pass, 9 fail (inherited); answer-envelope 37 pass, 4 fail (inherited); screens-settings 144 pass, 2 fail (inherited). `checks/format.mjs`: 0 failures. `checks/architecture.mjs instance-setup`: 27 files, 0 failures. `checks/coverage.mjs instance-setup`: 69 of 69 live ids named. `checks/ownership.mjs instance-setup tranche/T51 job/T51/instance-setup`: 18 files, 0 failures. `checks/run.mjs` whole tree: architecture's one failure is answer-envelope's; `checks/words.mjs` over the whole tree names 30 lines of this module (J1, item 4), no test copy, no marker finding. `setup-words/build.mjs --check`: `rows.mjs` stale, as expected; no refusal names this module.

Size (session_01BpRJeMjqjhQP41hsLRJzbh): test runs 34, module lines 3632

## J3 · COMPLETE

COMPLETE (re B2). Merged tranche/T51 (K4084). The twelve codemod calls now pass `reason:` and `next:` (`{what}` and `{confirmed}` unchanged), and seven tests with them (`words.test.mjs` among them). `setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match the source; no codemod id of this module is named by no call, so there was nothing to drop. instance-setup 193 pass, 0 fail. format 0; architecture 0; coverage 69 of 69; ownership 0 (2 files). `checks/words.mjs`: plain 0, testcopy 0, marker 0; inline 12 left, all the leaf's `setup-fleet.mjs` texts (:30, 32, 35–38, 42, 44, 55, 64, 66, 67): R97 requires them in the leaf with their keys (K405: it cannot read the word list), so only the design's `unkeyed` list or a check exemption clears them: BOB's call.

Size (session_01BpRJeMjqjhQP41hsLRJzbh): test runs 41, module lines 3637

## J4 · QUESTION

QUESTION (re B3, item 2): the leaf's twelve texts (`setup-fleet.mjs`:30–67) cannot be read by key as the code stands, and I have not changed them.

- R97 keeps the leaf importing nothing (K405), and its control says the import list is empty, so the leaf cannot call `word()`.
- Bundler R38 keeps the rows a literal `word(...)` call names, but the call needs `word` in scope.
- Fact against R97's own test premise: `newgroup/src/words.mjs` already imports `word` and `hasWord` from `bio-plane/src/setup-words/index.mjs`, so the installer bundle does pull `setup-words`.

Options:
A. Accept the twelve by name, as CR-12 says ("until then accepted by name"). No code change; `checks/words.mjs` keeps 12 `copy` findings for this module.
B. The leaf takes a lookup argument, and its callers pass `word`: `newgroup/src/index.mjs`:953 and `ui.mjs`:150 (installer's module), plus the plane's screens. Touches another module.
C. The leaf imports `setup-words/index.mjs` like the installer's `words.mjs` does. This amends R97 and K405 (the "imports nothing" rule), so it needs your ruling.

My recommendation: A now. C is one import and would clear the twelve, but it reverses K405, so it is your call, not mine.

Until you answer, the leaf keeps its texts as R97 has them. Everything else in B3 is done and reported in the COMPLETE.

## J5 · REPORT · re B3

REPORT (re B3): what I found in other modules while doing CR-12. None of it is changed by me.

1. `plane/src/ask.mjs`:369 calls `instanceSetupOf(ctx, env).readingLanguage(...)`. It is the one delegate caller left, so I kept `readingLanguage` (the other ten are gone). Plane's job re-points that call to `translationsOf(ctx).readingLanguage`; then I delete the last delegate and `#translations()` in my next job. Please sequence it.
2. `test/m/plane/door.test.mjs`:142 (the R1, R5 test "instance-setup's forty-five routes") is now red: instance-setup's map holds 36 routes, not 45, because the nine translation route lines left (CR-12). The test's drive list still counts the nine. Plane's job sets the count to 36 and drops the translation drives from the instance-setup comparison, since `translationsOps` answers them through `store.mjs`. This is the one failure I cause outside my module; I did not edit the test.
3. Reds in the whole-tree `checks/run.mjs`, not mine: coverage: agent-harness R17; agent-runner R36, R37, R38, R40; extraction R77; installer-steps R26, R31; journey-check R19; screens-inquiry R81, R82; setup-words R19. Words: `promotion/index.mjs`:194, 1151, 1184 (inline).
4. Test note for my own tests (no action for you): the fixture's default `credentials` stub is `{}`, so a `last_used_at` read through `boot()` answers null. The R95 test now hands a real `credentials` reader over the same store; the fixture is unchanged.

## J6 · COMPLETE · re B3

COMPLETE (re B3). CR-12 done in its two parts that are mine; item 2 waits on your answer to J4.

Entries applied:
- Item 1: `bootstrapfacts`' `last_used_at` reads `credentials.lastActivity()` (CR-16, K4116). The module's own `sessions` read (`#lastActivity`) is gone. The R95 test hands a real `credentials` reader over the same store and checks the instant (2026-10-14T17:45:00.000Z).
- Item 3: ten of the eleven translation delegates are deleted. `readingLanguage` stays, for `plane/src/ask.mjs`:369 (J5, item 1). The nine translation route lines leave `instanceSetupOps`; plane's `store.mjs` already answers those routes through `translationsOps`, which it did before. Search of the whole tree for callers of the removed delegates and routes found none except that one.
- R94's test now asks the nine routes of `translations` (the map instance-setup holds none of them); `exports.test.mjs`'s route list drops them.
- Item 2 (the leaf's twelve texts): not changed; see J4. R97 and its control are as they were.

Deferred: item 2 (J4). Found in other modules, reported in J5: plane's `ask.mjs` caller of `readingLanguage`; plane's `door.test.mjs`:142 red (45 → 36 routes); the whole-tree coverage and words findings.

Tests and checks:
- instance-setup: `node --test test/m/instance-setup/*.test.mjs`: 193 pass, 0 fail (t51: 11 pass).
- plane `door.test.mjs`: 5 pass, 1 fail (the R1, R5 route count, J5 item 2; not my file).
- `checks/format.mjs`: 175 modules, 0 failures.
- `checks/architecture.mjs instance-setup`: 27 product files, 0 failures.
- `checks/coverage.mjs instance-setup`: 69 of 69 live ids named by a test; 0 failures.
- `checks/ownership.mjs instance-setup tranche/T51 job/T51/instance-setup`: 5 files changed by instance-setup, 0 failures.
- `checks/run.mjs /home/user/bio`: instance-setup's findings are the twelve leaf copies (item 2) only; the rest are in other modules (J5 item 3).

Commit `b6401a7fff` on `job/T51/instance-setup`, pushed.

Size (session_014RUYYmkPmsWz2WmzcUC1Mk): test runs 5, module lines 3607

## J7 · COMPLETE · re B4

COMPLETE (re B4). R98 is met; the CHANGE's R99 waits for plane's CR-24, as you scheduled it.

Entries applied:
- R98 (B4, option C): `setup-fleet.mjs` imports `setup-words/index.mjs` and nothing else. Its twelve texts are `word(key)` of R97's keys (`HOSTING_CONTROL`, `FORGOT_HELP`, `HOSTING_RECOVERY_DEPLOYER`); the `keys` fields are unchanged. The installer's bundle carries those keys because `newgroup/scripts/build.mjs` keeps the literal `word("…")` calls of every bundled module.
- Tests: the R97 "imports nothing" control is replaced by R98's control (the only import is setup-words; no plane or store module). The N234 test loads the leaf as the module, not as a data: URL. Each text still equals `word(key)`.
- Tranche merged before the change (B4 names R98 there).

Checks and tests:
- instance-setup: `node --test test/m/instance-setup/*.test.mjs`: 193 pass, 0 fail.
- installer `requirements`, `t47`, `t48`, `t50`, `t51`: 101 tests, 96 pass, 0 fail. I did not run the whole installer suite, and `npm run embed` was not run. `newgroup/src/release.mjs` still embeds the earlier bundle text, which is a generated artifact: the installer's build should regenerate it. I did not touch it.
- `checks/format.mjs`: 175 modules, 0 failures.
- `checks/architecture.mjs instance-setup`: 27 product files, 0 failures.
- `checks/coverage.mjs instance-setup`: 70 of 71 live ids named; the gap is R99, which is due at the later CHANGE. Expected until then.
- `checks/words.mjs`: instance-setup has 0 inline findings. Seven testcopy findings remain, all in `file-safety`, not this module.
- `checks/ownership.mjs instance-setup tranche/T51 job/T51/instance-setup`: 6 files changed by instance-setup, 0 failures.

Found, not mine (no change made):
- Installer tests do not copy any leaf text. The only match is the generated `release.mjs` above.

Commit `55489f90f3` on `job/T51/instance-setup`, pushed.

Size (session_014RUYYmkPmsWz2WmzcUC1Mk): test runs 8, module lines 3607

## J8 · COMPLETE · re B5

COMPLETE (re B5). R99 is met: the last translation delegate is gone.

Entries applied:
- Merged `tranche/T51` (plane's CR-24 is on it; `plane/src/ask.mjs` now calls `translations`' `readingLanguage`).
- R99: `readingLanguage` and `#translations()` leave `setup.mjs`. No translation delegate remains. The member-language registration still runs at start, through a self-contained `#registerLanguage()`; an unstarted InstanceSetup registers nothing.
- Tests: the R99 test names the removal, asserts the module has no translation delegate, and controls that `translations`' `readingLanguage` still answers (LANGUAGE_NOT_SET for a member with no language). The R94 tests ask `translations` directly. `t48` no longer calls the removed delegate.

Checks and tests:
- instance-setup: `node --test test/m/instance-setup/*.test.mjs`: 194 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs instance-setup`: 0 failures. `checks/coverage.mjs instance-setup`: 71 of 71 live ids named; 0 failures.
- `checks/run.mjs /home/user/bio`: `words`: 0 failures, 0 findings for this module. `coverage`: 4 failures, none in instance-setup (other modules).
- `checks/ownership.mjs instance-setup tranche/T51 job/T51/instance-setup`: 3 files changed by instance-setup, 0 failures.
- Journey-check's walk not run, per your instruction.

Commit on `job/T51/instance-setup`, pushed.

Size (session_014RUYYmkPmsWz2WmzcUC1Mk): test runs 11, module lines 3589

## J9 · QUESTION

QUESTION (K4202, the census; pass §3 step 5). Two ops of the sixteen have no existing row I may copy, so I declare nothing for them yet and declare the other fourteen.

1. `runtime` and `selftest` (sent by registry/updates): `op-declarations` gives each its classes (`admin`, `member`, `probe`, `mutating: false`), but `op-grades` holds no row for either (no `RUNGS`, `RUNG_ABSENT` or `NON_ACTS` entry; reads need none today), so there is no weight and no description to copy. Fields are plain: `runtime` and `selftest` read nothing from the address or the body (their `cls` and `viewer` are stamps), so `fields: {accepts: [], requires: []}`.
   My best reading: declare both with `weight: "read"`, `mutating: false`, the classes above, `machineClasses` omitted, and a description of my own, `localize("instance-setup.declared.runtime", "read: what the instance was measured to cost and where its limits lie (the runtime's measurements, the CPU probe's trail, the subrequest ceiling)")` and `("instance-setup.declared.selftest", "read: whether the deployment is healthy (its bindings, the store's stats and a storage round trip); it never returns a secret")`, taken from R37 and R18. Please confirm that, or give the sentences.
2. `grouplogoset` is judgment only in shape: the screen sends the file as the request's body with `rawType` in the address (R86), or JSON `{raw, rawType}`; I declare `accepts: ["raw", "rawType"]`, `requires: ["raw"]` (`raw: null` clears). Its refusal for no file (`LOGO_REFUSED`, "the logo is sent as the file's bytes, and none was sent") does not name the field, so the test maps `raw` to that code (the pass's `named` table). Say if that is not acceptable.

## J10 · COMPLETE · re B6

COMPLETE (re B6, B7). Merged `tranche/T51` (twice; last at 4635d09d34 and later). Requirement lines R100 and R101 are written in `build/requirements/instance-setup.md` (the ownership check lists that one file, accepted per B7), not in this record.

Entries applied:
1. **C11 / R100.** One function (`groupWellKnownFile`) builds `{path, body: {instance, group}}` from the address and the producing slug. The verifier's comparison reads its body; `groupdomainset` answers it as `well_known` and `groupidentity` as `domain_claim.well_known`. With no slug or no address `well_known` is null and `well_known_detail` is the verdict's own sentence (`instance-setup.domain.detail.no_team_name` / `.no_address`). What the verifier accepts is unchanged (R7/R8/R11 tests pass). Tests (`wellknown.test.mjs`, seen failing first): path equals the path fetched, body planted verifies, another instance or group is `mismatched`, same file in `groupidentity` and for a later claim, null with the word table's reason and nothing fetched.
2. **K4202 / R101.** `DECLARED_OPS` declares the sixteen ops; rows copied from the hand rows. `registerDeclaredOps` of `op-grades` and `op-declarations` over my rows: 14 agreed, `runtime` and `selftest` registered, no disagreement; no op duplicated across owners (`declaredOpsOf`: 257 ops, 0 duplicates). `declared-ops.test.mjs` (`declaredOpHolds` per op, a naming test for the 16 new ids `instance-setup.declared.<op>`, and a control that a wrong declaration is rejected). Per B7: runtime/selftest read, `grouplogoset` accepts raw, rawType, requires raw (mapped to LOGO_REFUSED). `updateskip` also carries `refusal: UPDATE_SKIP_NO_REASON`.

Deferred: none. Found in other modules: `rows.mjs` is stale for the 16 new ids (BOB regenerates). Plane must register `DECLARED_OPS` of this module with the two `registerDeclaredOps` at composition if it does not collect owners itself (I did not check plane's wiring). op-declarations' `registryActGaps` test (R73, R21) is red on `expertisewithdraw`, not mine.

Tests and checks: instance-setup 216 pass, 0 fail. Consumers: control-plane 309, store-door 48, screens-entry 86, answer-envelope 41 all pass; op-declarations 241 pass, 1 fail (above). Not run: plane, installer, installer-steps, stewards (R100/R101 only add keys and an export). format 0; architecture 0; coverage 73 of 73; words 0 findings for instance-setup (whole tree: 9 testcopy in op-grades); ownership: 1 failure, the requirements file (accepted, B7).

Size (session_01HudVPERVJyVzstKHMw2ZzA): test runs 16, module lines 3668

## J11 · COMPLETE

COMPLETE (re B6, B7): R100 (the website file in groupdomainset and groupidentity) and R101 (sixteen ops declared) applied; requirement lines are in build/requirements/instance-setup.md. instance-setup 216 pass; consumers pass except op-declarations' registryActGaps (expertisewithdraw, not mine). Details in my record J10.

## J12 · COMPLETE

COMPLETE (re B8, fix round 4, C64-law). R12's new sentence is met; nothing deferred, nothing "not met".

**What changed.** `bio-plane/src/setup.mjs` `profileView` (~:2905-2920): the view also carries `records_laws` (each law whole, as `jurisdictions.combine` gives it), `records_help` and `name`, each absent when `combine` states none or cannot give the view; `deadlines`, `legal_organisations` and `venues` are unchanged (agent-worker R51). Header comment of `profileView` says so. Test: `bio-plane/test/m/instance-setup/profiles.test.mjs`: the new R12 test "profiles().view also carries records_laws..., records_help and name" (control: no active profile, none of the three; the first profile, `oakland-alameda`: `records_laws` deep-equals combine's three laws, each with `level, name, citation, response, stages, requesters`, the federal one `response: "foia_response"`, `name` present, `records_help` absent as combine gives none for it; the test profile: `records_help` present as combine gives it); the helper `viewOf` of the older R12/R16 test extended with the three.

**Failing-first.** Before the change: `profiles.test.mjs` 5 pass, 2 fail (the new test: `records_laws` undefined against combine's three laws; the older view test, whose expected view now holds the three). After: 7 pass, 0 fail.

**Suites.** instance-setup 218 pass, 0 fail. Users by `impact.mjs origin/tranche/T51 HEAD` (7 modules, 144 files): plane 296 pass, 1 fail (R24 words test); store-door 52 pass, 1 fail (R17 `groupdescriptiondraft`): both identical without my commit (checked by restoring the old `setup.mjs`); answer-envelope 43 pass; signin-door 15 pass; case-authoring 225 pass; control-plane 367 pass, 2 fail (R120/R121 PDF timings; R122 one `op=bootstrap` per load): neither touches `profiles()`; I did not re-run them on the old file (they wait on timing and the page, not on this view). agent-worker reads the three old facts; unchanged.

**Checks.** `checks/run.mjs`: no finding in my files; words: inline 0, plain 0, testcopy 0, missingkey 0, marker 0 (count not risen); architecture's 2 failures are case-authoring's `reload.test.mjs` imports; coverage's 11 are other modules. `checks/ownership.mjs ... instance-setup`: 3 files, 0 failures.

**Found in another module.** None. For BOB: requirement R12's "*(not yet met: T51)*" can now be lifted.

Size (session_018SUX5UvD4QojUdVCPkUvFj): test runs 14, module lines 3650

## J13 · REPORT

REPORT (re B9, G83, R102): the change is built and pushed (45ef9bf54f on job/T51/instance-setup), waiting only on runtime-limits' store-place.mjs (R27, R28), which is not merged. What changed: bio-plane/src/setup.mjs (the import, then publicInstanceGroup, instanceGroupOp, groupIdentityOp, groupLogoAsset, selftest's store read and instanceSetupOp's store() each call storeStub(env, storeName); selftest also states store_location (storeHint(env)), store_generation (storeGeneration(env)) and store_place_note, a localize sentence saying they are configuration, not where the room runs) and bio-plane/src/livefire.mjs (storeStub). Tests: new store-place.test.mjs (a recording env.STORE over every entry path above plus op=runtime, op=cpuprobe, op=livefire and livefire itself, for a hint wnam, generation 2 giving bio~g2/scratch~g2, both, neither, and malformed values; selftest's two fields and no secret) was RED against the unchanged source (hint and generation cases failed) and is GREEN now; worker-reports.test.mjs gains the one Miniflare run (L) of op=selftest with STORE_LOCATION=wnam answering it. I ran them against a local, uncommitted stand-in of R27/R28 (not on the branch): instance-setup 222 pass, 0 fail; format 0, architecture 0, coverage 74 of 74, words inline 0 plain 0 missingkey 0, ownership 0 failures. Not yet done, by design: the users impact.mjs names (screens-action, control-plane, plane and others, 164 files) and the final run with the real helper; and G84's re-point of setup.mjs:61's INTERFACE_WORDS re-export and t50.test.mjs to interfaceWords(), which wait on TRANSLATIONS' merge. I will do all three, and COMPLETE, when your CHANGE says runtime-limits and translations are merged. Requirement wording: none proposed. Stale generated artifacts: none made.

## J14 · COMPLETE

COMPLETE (re B9, B10; fix round 7, G83 and G84). R102 is met; nothing deferred. What changed: bio-plane/src/setup.mjs (import of store-place.mjs; publicInstanceGroup, instanceGroupOp, groupIdentityOp, groupLogoAsset, selftest and instanceSetupOp's store() all call storeStub(env, storeName); selftest states store_location, store_generation and store_place_note, configuration only; line 64 re-exports interfaceWords) and bio-plane/src/livefire.mjs (storeStub). Failing-first: bio-plane/test/m/instance-setup/store-place.test.mjs, a recording env.STORE over every entry path (hint wnam, generation 2 giving bio~g2 and scratch~g2, both, neither, malformed values) plus selftest's two fields; RED on the unchanged source, GREEN after. L: worker-reports.test.mjs runs op=selftest on the real Miniflare binding with STORE_LOCATION=wnam and answers it. Suites, with the real helper merged and before the G84 re-point: instance-setup 222 pass, 0 fail. Users named by impact.mjs: answer-envelope 43/0, store-door 56/0, signin-door 15/0, screens-action 278/0, plane 113 pass in the batch run (killed at its time limit) and worker.test.mjs alone 7/0, control-plane 446 pass, 1 fail: t51-round6-seam.test.mjs R123/R125 (G7) 'a 40 MB five-part upload ... no reading row owed' (the reading ledger; not in my module; not checked against the tranche tip, it fails on a re-run alone). The ONE red I name (G84): with the re-point of setup.mjs:64 and t50.test.mjs to interfaceWords, the instance-setup suite cannot load until translations merges (the tranche's translations/index.mjs still exports INTERFACE_WORDS only); it is red by that import alone. Checks: format 0, architecture 0, coverage 74 of 74, words inline 0 plain 0 testcopy 0 missingkey 0 unkeyed 0, ownership 6 files 0 failures. Found in other modules: none of mine; note store-door's routes.test.mjs imported INTERFACE_WORDS from setup.mjs: it must use translations' export or interfaceWords when you merge. Stale generated artifacts: none. Requirement wording: none proposed. Size (session_019X53EdmQwW5EaH384CWbSf): test runs 12, module lines 3684

## J15 · QUESTION

QUESTION (re B11; two seams at the door, best reading below; I carry on on it and COMPLETE on it unless you change it).

1. Signed-in caller (R103). `bootstrapReport`/`bootstrapOp` take `caller` already ({cls:"admin"} or {administrator:true}, R95). For a member's session I read `caller.viewer` (the signed-in member's id, as the control plane stamps `viewer` elsewhere): a non-empty `viewer` means signed in, and `language` (memberLanguage) and `words_version` (translations R20 `wordsVersion()`) are stated; none, neither key. The admin-class token with no viewer gets the seven facts and no language. So plane's door must pass `{viewer}` (and `administrator`/`cls` as now) to `bootstrapOp`. One store hop serves both: the store-internal route `bootstrapfacts` takes `facts=1` and/or `viewer=`.
2. Phase entries (R104). `bootstrapReport`/`bootstrapOp` take an optional `timing(name, ms)` in their io argument and call it as `timing("fleet", ms)` and `timing("facts", ms)` (ms of `partsReport`, 0 when kept; ms of the store hop); absent, nothing happens. Control-plane's phase clock should hand its module-stated-entry function as `timing` (the door passes it through `publicOp`). Please confirm that name/shape to control-plane, or give me the one it builds.
Not blocking: the tests for R103 use a stand-in `wordsVersion` until translations R20 merges.

## J16 · COMPLETE · re B11, B12

COMPLETE (re B11, B12; fix round 8, G118 and G114). R104 and R103 are built; the requirements' "(not yet met: T51)" marks can be lifted (BOB writes). One dependency stays by BOB's B12: `translations` R20 (`wordsVersion()`) is not merged, so my R103 tests use a stand-in `deps.translations`; after BOB's CHANGE I re-run on the merged service.

**G118 (R104).** (1) Cause: `bootstrapReport` awaited `partsReport`, which asked agent-worker and file-scanner `/version` (4 s bound each) on every call (`setup.mjs` `partsReport`). Fix: the parts are kept 60 s per environment (`PARTS_KEPT_MS`, `partsAnswer`); a call that finds the ask running shares it; `members=1` is not kept. The parts ask and the store's second hop now run together. `bootstrapReport`/`bootstrapOp` take `stateTiming(name, ms)` (B12) and state `fleet` (0 when kept) and `facts` (sum of the store hops). (2) Missed because no test counted the fleet calls of `bootstrap`. (3) `test/m/instance-setup/r8-parts-report.test.mjs`. RED before: `actual: { AGENT_WORKER: 2, FILE_SCANNER: 2 }, expected: { AGENT_WORKER: 1, FILE_SCANNER: 1 }`; entries `actual: [], expected: ['facts','fleet']`. GREEN after (6 pass). (4) P by BOB after redeploy.

**G114 (R103).** (1) Cause: `bootstrap` carried neither the viewer's language nor the adoptions stamp, so the shell could not name `v`. Fix: a non-empty `caller.viewer` (not a machine identity) means signed in; then `language` and `words_version` (each a string or `null`), else neither key; the store route `bootstrapfacts` takes `facts=0|1` and `viewer=` so one hop serves the seven facts and the viewer's two; the store's own bootstrap answer cannot set either key. (2) Missed: no requirement existed. (3) Same file, R103 tests; RED before: `actual: undefined, expected: 'es'`. GREEN after.

**Door to place (BOB, with plane and control-plane):** the door passes `caller.viewer` and `stateTiming` to `bootstrapOp`; plane's `publicOp` passes neither today.

**Words:** no new sentence. Stale generated artifacts: none made.

Tests and checks: instance-setup 228 pass, 0 fail. Users named by `impact.mjs` that touch bootstrap, run: control-plane `t51-bootstrap` 1/0, plane `door` 6/0, `worker` 7/0, `hosts` 4/0, op-declarations `t47` 13/0, credentials `t51` 5/0, `members` 1/0. format 0; architecture 0; coverage 76 of 76; words 0 (inline 0, plain 0, testcopy 0, missingkey 0); ownership 3 files, 0 failures.

Size (session_01SPUpVJsJxBhU7hbLvsUMXD): test runs 9, module lines 3700

## J17 · COMPLETE

COMPLETE (re B11, B12): R103 and R104 built, record J16. 228 pass; checks 0. Door must pass caller.viewer and stateTiming to bootstrapOp. Re-run on the merged translations R20 at your CHANGE.

## J18 · QUESTION

QUESTION (G118b; best reading below; I carry on with it).

I read the code before relying on the diagnosis: `keptParts` is a `WeakMap` by `env` (setup.mjs:160-186); it can only make "once a minute per isolate". I keep it as the first look and add the shared keep.

1. **Where the shared value lives and how it is read without an extra call.** The object visit `bootstrap` already makes is `/bootstrap` (credentials' route, not mine) and, for a signed-in caller, `/bootstrapfacts` (mine). I put the kept parts in the object's memory (a value with the object's own clock time; the age is answered by the object, so isolates' clocks never meet) and read them in the `/bootstrapfacts` visit a signed-in caller already makes, so a signed-in screen's hop count stays 4 (control-plane r8-hops) on a hit. Two consequences, tell me if you want otherwise:
   - (a) A stranger (the pre-sign-in poll) makes no `/bootstrapfacts` visit today (my R103 test says "a stranger costs no second hop"). To share for them too, `bootstrap` now makes that one visit for a stranger as well, beside the `/bootstrap` visit, not after it (wall time unchanged), answering the kept parts only, none of the seven. That is one more parallel hop for a stranger. The alternative that adds none is credentials' `/bootstrap` route carrying the kept value; that is another module's change, so I did not take it. If you prefer it, tell me and I make the stranger keep per-isolate only.
   - (b) On a miss (the isolate that asked the fleet) one write visit follows the ask, once a minute at most, to the same route (a POST of the three flat values; no new route, so plane's route-count test door.test.mjs:140 is not touched by this).
2. **`isolate;desc=<id>`.** The door's clock states a module's entry as `stateTiming(name, ms)`, a `dur` only (`control-plane/phase-clock.mjs:78`); a `desc` cannot be stated through it. I call `stateTiming("isolate", ageMs, id)` (a third argument the clock ignores today) and also state `isolate-<id>;dur=<age>`, which the clock carries as it is, so the next deploy shows the isolates with no other module's change. For the exact entry you asked for, control-plane's `stateTiming(name, ms, desc)` needs a one-line extension (I will REPORT it); nothing of mine waits on it.

## J19 · BLOCKED

BLOCKED (cause: needs Bob). NEEDS BOB: my permission check refused one Bash command at the end of the job, and I have not retried, split or reworded it. The command was a single compound line that (1) pushed my branch (git push origin HEAD:job/T51/instance-setup), (2) ran mail done --through B14, (3) wrote my completion text to a file in my scratchpad, (4) ran mail state --set COMPLETE and (5) mail post --kind COMPLETE. I do not know which of the five the check refused. The work itself is finished and committed on my branch locally (two commits, after 9d6b31cba8): G118b built as ruled in B14, instance-setup 234 pass 0 fail, users 377 pass 0 fail, architecture 0, coverage 76 of 76, words 0, ownership 0 failures; format shows 1 failure that is not mine (office-readers names bio-plane/src/office-xml.mjs, which does not exist yet). The code is not yet on origin, and the COMPLETE entry is not posted. What I need: say whether I may push my branch and post COMPLETE, or what to do instead. My state is NEEDS BOB.

## J20 · COMPLETE

COMPLETE (re B13, B14, B15; fix round 9, G118b). R104 is met as amended below; nothing deferred, no QUESTION open.

**G118b (R104): the fleet's 60 s keep missed on most calls live.**
(1) **Cause** (read in the code; same finding as the diagnosis): the keep was `keptParts`, a `WeakMap` by `env` in isolate memory (`setup.mjs:160-186` before; hit at :178-181). A Worker is served from many isolates, so it made "at most once a minute per isolate" only; a call reaching an isolate with no entry paid the whole ask (`partsAnswer` -> `askParts`, two bindings bounded at 4 s). Certain by arithmetic; how many isolates answered live was not shown: the new `isolate` entry shows it at the next deploy. **Fix (K4853, B14):** the answer is also kept in the team's object, a value with the object's own time (`InstanceSetup.keepFleetParts` / `keptFleetParts`, in memory; the object answers the age, so no two isolates' clocks meet), read in the `/bootstrapfacts` visit a signed-in caller already makes (`parts=1`, answered as `kept_parts`; the default answer is unchanged) and written once after an ask by a POST to the same route (`{keep}`; no new route). The isolate's `WeakMap` stays as the first look; a call that finds the ask running shares it. A stranger keeps per isolate only and makes no visit of its own. A fleet with neither member bound is not told to the object. A signed-in screen's hop count is unchanged on a hit (control-plane `r8-hops` green); a miss adds the one write.
(2) **Missed because** `r8-parts-report.test.mjs` and control-plane's fan-out test run in one isolate and count calls, so they could show only per-isolate memory. Gap fixed: the new test models isolates as different `env` objects over one object (one storage, one clock).
(3) **Failing-first** `bio-plane/test/m/instance-setup/r9-parts-kept-outside-isolate.test.mjs` (6 tests), through `bootstrapReport` with the real object frame. RED on the tree before the change: `AssertionError: red before the fix: 2 each, one ask for each isolate / actual: { AGENT_WORKER: 2, FILE_SCANNER: 2 }, expected: { AGENT_WORKER: 1, FILE_SCANNER: 1 }` (5 of 6 fail; the sixth passes: ten calls on one isolate already asked once), GREEN after (6/6). It also holds: a second isolate whose fleet never answers is answered at once with `fleet;dur` 0; the object keeps three flat values, refuses anything else, and answers `null` past 60 s by its own clock; the default `bootstrapfacts` answer is unchanged; a stranger is told none of the seven and makes no visit; a keep the object does not answer costs only a later ask; the isolate entry.
(4) Platform check **P** is BOB's at the redeploy: ten calls 2.5 s apart as a signed-in member, `fleet;dur` 0 after the first within a minute whichever isolate answers, and the number of distinct `isolate;desc` ids seen. **L** done (control-plane `r8-bootstrap-fanout` 2/2). New data only; nothing is stored durably.

**R-LOG.** `bootstrap` states `isolate` through the door's sink as `stateTiming("isolate", ageMs, id)`, the id made once per isolate at first use (8 hex digits), in every outcome including a store that does not answer (tested). No `isolate-<id>` entry (B14). For control-plane-1 (job 38): `phase-clock.mjs:78` `stateTiming(name, ms)` ignores a third argument today; the `desc` extension is its START's (B14).

**Tests changed (mine, none weakened):** `r8-parts-report.test.mjs`: the clock test boots the object on the same virtual clock as the Worker, the store-path recorder marks a POST, the sink takes three arguments and the entry names are `facts`, `fleet`, `isolate`. "A stranger costs no second hop" stands.

**Proposed wording, R104** (a job writes no requirement; BOB's): after "kept for 60 s in the isolate" read "kept for 60 s for the whole copy: in the isolate as the first look and, for a signed-in caller, in the team's object (a value with the object's own time, read in the visit `bootstrap` already makes for the caller's facts and told to it once after an ask; a stranger keeps in the isolate only)", and append "`bootstrap`'s `Server-Timing` states `isolate;desc=<an id made once per isolate>` with the isolate's age as `dur`. Test: two environments over one object within a minute ask each fleet binding once in all; the isolate entry exists."

**Found in other modules / stale artifacts:** (a) control-plane `phase-clock.mjs:78` as above. (b) `release/bio-plane.bundled.mjs` is a generated artifact my change made stale (bundler's). (c) `checks/format.mjs bio` reports 1 failure that is not mine: `build/modules.json` office-readers names `bio-plane/src/office-xml.mjs`, which does not exist yet. Plane's route count is unchanged (`bootstrapfacts` is still one route).

**Words:** no new sentence; `PARTS_NOT_KEPT` on the internal route is a code, not shown.

**Tests and checks.** instance-setup 234 pass, 0 fail. Users named by `impact.mjs` that touch `bootstrap`/`bootstrapfacts`, run with mine: control-plane `r8-bootstrap-fanout`, `r8-hops`, `t51-bootstrap`, `t51-hops`, `r8-phase-clock`; plane `door`, `r8-timing-hook`, `worker`; op-declarations `t47`; credentials `t51`; answer-envelope and store-door suites: 377 pass, 0 fail. format 1 (not mine); architecture 0; coverage 76 of 76, 0; words 0; ownership 4 files, 0 failures.

Size (session_0163P54gLUEcmDWPVLMFfvL7): test runs 17, module lines 3845

## J21 · COMPLETE

COMPLETE (re B16; fix round 10, Wave A batch 5: the fixture round). Test files only; no product code changed.

**Causes done.** Fixtures I publish, lines I re-pointed, contracts I run. Lines left, each named below.

**Published, `bio-plane/test/m/instance-setup/fixtures.mjs` (new), each made by the real code at test time, each called by a test in `fixtures.test.mjs` that checks the real answer:**
- `assistantState()` → `{notKept, kept}`: the real `assistantstate` answer over the real ai-accounts (`{ok:true, on:true, set_by/set_at/reason null}`; `on:false` with the setting's who, when and reason). Users now: screens-settings 1.
- `instanceGroupAnswer()` → `{recorded: {ok:true, group}, none: {ok:true, group:null, detail: NO_GROUP_RECORDED}}`. Users now: installer 2.
- `selftestAnswer()` → the real `selftest` body of a copy with its store binding unbound, with `status` (500): `ok:false`, `bindings.STORE:false`, `bindingsAllPresent:false`, `store: "ERR …"`. Users now: installer-steps 1.
- `fleetReports()` (K5071, installer R66's lag cases): the real `bootstrapReport` body, status included, for `serving`, `silent` (a member answering 500 and one that throws), `misnamed`, `unbound`, `storeVersionAbsent` (the store's answer carries no `storeVersion`) and `withoutMembers` (no `members=1`, so no `memberVersions`). Every case answers 200 with the real `memberVersions` states.
- Contract `group-identity-public`, run in `fixtures.test.mjs` (`// fixtures-run: public-read group-identity-public`): `groupIdentityPublic()` with no group recorded is `{ok:true, group:null, display_name:null, domain:null, domain_verified_at:null, logo:false, detail: NO_GROUP_RECORDED}`. **The real answer carries `logo: false`, which the START's value omits: the real one wins, public-read's hand-built value changes (REPORT below).**

**Own lines re-pointed (fixture.mjs, 21 listed → 3 left):**
- promotion/registrars (79, 82): `providers().promotion` is the real `registrars().p`; the stand-in `facts` map is gone. `group.test.mjs` R1 now reads the fact's module from promotion's own STEP_DECLARED on a second registration.
- entities/entitiesWorld (249–266) and lines/linesWorld (275–283): `registryOver` is now the real `Entities` and `Lines` of lines' published `linesWorld().w`; `ents`, `idents` and `lines` read their own tables back for the assertions (the world's own entities and lines are left out). Findings in the real code that changed the tests, not the product: the id spaces are a closed list (`idspaces`), so the seeds test's invented spaces `org`, `lb`, `lp`, `lo`, `court`, `docket` are now the real `institution`, `body`, `person`, `office` with a form of their own per scheme (`TEST_SPACES`); the test profile no longer repeats the held test profile's `ellery_body` and `ellery_office`-like scheme names (the module and the registry must read the same scheme); a line's source capture must be held by the record (`registryOver(view, captures)` holds them); real line ids are random (`noIds` in the N756 test); one assertion compared object identity and now compares the body's id. All 13 seeds tests pass unchanged in what they assert.
- translations/memberLanguageRead (`r8-parts-report.test.mjs`:161, and the same stand-in at :118): `registerMemberLanguageRead` answers translations' own `registered`.

**Lines left (`checks/fixtures.mjs … instance-setup --list`, 3 + 1):**
- `fixture.mjs:113` public-read/groupIdentityRegistrar: waits for public-read. Its `fixtures.mjs` (`groupIdentityRegistrar`) is on `job/T51/instance-setup`'s sibling branch `origin/job/T51/public-read` and not yet on `tranche/T51`; I merge it as a CHANGE and re-point.
- `fixture.mjs:186`, `:197` (`contract-no-run`, store-door's `store-replies`): `// fixtures-contract: store-door store-replies` placed on the line above each; waits for store-door's `fixtures-run: instance-setup store-replies`.
- `fixtures.test.mjs:49` `orphan-run` for public-read `group-identity-public`: waits for public-read's marker on its hand-built value.
- No `fixtures-own` or `fixtures-generic` marker added.

**Found in other modules (REPORT):** (1) public-read: its hand-built `groupIdentityPublic` no-group value lacks `logo: false` (real answer above). (2) lines' `linesWorld()` registers four entities and some lines before it hands the world over (a user counting entities or lines must subtract them; mine does). Neither blocks.

**Tests and checks (from /home/user/bio, process checks at civicos-process main):** instance-setup 239 pass, 0 fail (234 before, +5 fixtures); screens-action `join-seam-t51` and `seam-t51` (the only other importers of `instance-setup/fixture.mjs`) 4 pass. `checks/format.mjs`: 178 modules, 0 failures. `checks/architecture.mjs instance-setup`: 0 failures. `checks/coverage.mjs instance-setup`: 76 of 76 live requirement ids named, 0 failures. `checks/words.mjs instance-setup`: 0 failures (inline 0, plain 0, testcopy 0). `checks/ownership.mjs … instance-setup origin/tranche/T51 job/T51/instance-setup`: 7 files, 0 failures. `setup-words/build.mjs --check`: only the expected stale-rows note, none naming my module. `checks/fixtures.mjs instance-setup`: 21 → 3 answer lines + 1 orphan-run, all waiting as above.

Size (session_01Qqt8fVgM4Tk1A5Lz73WMQG): test runs 6, module lines 3846

## J22 · COMPLETE

COMPLETE (re B17). Merged origin/tranche/T51 (merge commit, no rebase) and re-pointed fixture.mjs:113: the stand-in public-read registration now answers with public-read's own `groupIdentityRegistrar()` results (malformed, first, declared), still recording the identity for the tests.

`checks/fixtures.mjs /home/user/bio instance-setup --list`: 0 failures; two lines listed as `accepted(store-replies)` (fixture.mjs:190, :201, store-door's run now on the tranche); the orphan-run at fixtures.test.mjs:49 cleared. No line left.

Tests: instance-setup 239 pass, 0 fail. format 0 failures; architecture, coverage (76 of 76), words, ownership 0 failures.

Size (session_01Qqt8fVgM4Tk1A5Lz73WMQG): test runs 8, module lines 3846

## J23 · COMPLETE

COMPLETE (re B18; follow-up 36, K5108). Published `bootstrapFacts` in `bio-plane/test/m/instance-setup/fixtures.mjs` (new export, test files only), with two tests in `fixtures.test.mjs`.

Signature: `bootstrapFacts({ team = "River Town", members = 3, projects = 2, documents = 5, published = 1 } = {})`, async, returns the real `m.bootstrapFacts()` answer (R95): the seven keys of `BOOTSTRAP_FACT_KEYS`, each a real read.

Set up by real acts: the team named by `groupNameSet`; the running release first seen at the boot clock (`installed_at` 2026-10-10T08:00:00Z); three held sessions, the newest the last use (`last_used_at` 2026-10-14T17:45:00Z); the counts the caller states. The other modules' counts (members, register, published cases) are stand-ins, as in t51's `copy`; the answer's shape and each count are the module's real read.

Markers: no `fixtures-own` or `fixtures-generic` marker added.

Tests: `fixtures.test.mjs` 7 of 7 pass (2 new); the instance-setup module 241 of 241 pass, 0 fail. Checks, absolute root `/home/user/bio`: format 0 failures; architecture 0; coverage 76 of 76; words 0; ownership 0 (3 files, the record included); `checks/fixtures.mjs … instance-setup --list` 0 failures, accepted 2 (fixture.mjs:190, :201, store-door's `store-replies`, unchanged from B17).

Found in other modules: none. Deferred: none. Installer's t50 (`newgroup/test/t50.test.mjs:272`) is its re-point to make.

Size (session_01EuQtSZAq5UjiGxgEKWZHMP): test runs 2, module lines 3846

## J24 · COMPLETE

COMPLETE. Re B19 (fix round 10, the final pass's causes; plan item 71 (3); K5148). B18 (follow-up 36) is superseded: it was merged at K5110, so I took no further action on it.

**Cause 1: the team's seed instant kept the wall clock under a pinned clock.** Applied in full.

1. **Root cause, with evidence.** `instanceGroupSeed` records `recorded_at` through `#iso()`, which read `#now()`: the injected clock, else `Date.now()`. `env.BIO_NOW_MS` was never read, so a world pinned by it recorded the wall time. Failing run: `actual: '2026-10-25T16:53:32.949Z', expected: '2031-03-04T05:06:07.000Z'`. The diagnosis is STORE-REQUEST #1 J3 (3) and K5132's rule; the `diag2-*` files do not cover it.
2. **Why the module tests missed it.** The R4 test boots with `env: {}`, so the pinned path never ran. Tests that pin a clock inject `now` through `boot({now})`, which bypasses `env`. No test read `recorded_at` against a pinned `BIO_NOW_MS`.
3. **Failing-first test.** `bio-plane/test/m/instance-setup/group.test.mjs`, the last test: "R4 instanceGroupSeed records its instant on the instance clock: pinned by env.BIO_NOW_MS it is that instant; unpinned, the wall clock". Red on today's code (above); green after the fix. Its control (unpinned) asserts the wall clock within a second.
4. **Owning module.** instance-setup (`bio-plane/src/setup.mjs`, `bio-plane/src/livefire.mjs`).

**Fix (commit `4815d2418f` on `job/T51/instance-setup`).**
- `setup.mjs`: new `#instant()`: the injected clock, else `env.BIO_NOW_MS` (an absent value falls through, never the epoch), else `Date.now()`. `#iso()` records through it. `#now()` is unchanged and stays the duration clock.
- `setup.mjs` update deadline (`updateLater`'s `now`, near `:2865`) moved to `#instant()`: it is a recorded date the schedule uses, not a duration.
- `livefire.mjs`: `instantOf(env)` (the same rule). Its `last_updated` (a stored canary row) and `ranAt` (the answer's instant) read it. `totalMs` and the timing reads stay on `Date.now()`.

**Every other recorded instant from the wall clock, listed as the cause asks.**
- Changed (they follow `#iso()` or `#instant()`): every `this.#iso()` call in `setup.mjs`, about twenty (the seed `recorded_at`, the profiles boot note, the lines and entity writes, the rows at `:1236`, `:1257`, `:1287`, `:1431`, `:1468`, `:1579`, `:1660`, `:1750`, `:1762`, `:1803`, `:1813`, `:2183`, `:2260`, `:2305`, `:2346`, `:2391`, `:2566`); the `:2588` fallback; the update deadline `:2865`; livefire `last_updated` and `ranAt`.
- Not changed, with why: `keptFleetParts` age and its stamp (`#now()`, `:2729`, `:2735`: a measured duration); `partsReport` and `bootstrapReport`'s default `now` parameters (report clocks, injected by their callers); the health answer's `time` (`:3353`: an answer, not a stored instant); the selftest scratch key (`:3387`: a key); the cpu-probe run id stamp (`:3437`: an identifier); livefire's `totalMs` and timing reads (durations).
- `BIO_NOW_MS` is read as the instance clock by about twenty modules already, and no deployment config sets it, so the fix matches the rest of the product.

**Checks and tests (with summary lines).**
- Module suite, `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/instance-setup/*.test.mjs` (run to its own exit, no force-exit): `tests 242, pass 242, fail 0, cancelled 0, skipped 0`.
- Neighbouring pinned-clock tests (store-assembly, plane, tasks, intent, progressions files that read `BIO_NOW_MS`), since they seed a group: `tests 101, pass 99, fail 0, todo 2` (the two todo are pre-existing `test.todo`s).
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio instance-setup`: 34 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio instance-setup`: 76 of 76 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio instance-setup origin/tranche/T51`: 0 failures.
- `checks/words.mjs /home/user/bio instance-setup`: 0 failures (no new sentence).
- `checks/fixtures.mjs /home/user/bio instance-setup --list`: 0 failures. Its two `accepted` lines (`fixture.mjs:190`, `:201`) are pre-existing; I touched no fixture.
- No new fixture export and no `fixtures-own` or `fixtures-generic` marker added.

**Requirement ids met.** R4 (the seed's recorded instant is the instance clock's). The rule the cause rests on is R-CLOCK (fix-round-7 §0) with K5132; no requirement in `build/requirements/instance-setup.md` carries the `not yet met: T51` mark, so I struck nothing. BOB: if the instant should be written into R4's text, say so and I will fold it.

**For BOB (REPORT, not blocking).**
- The bundles that include `setup.mjs` or `livefire.mjs` are now stale. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, and the copy in `release/bio-plane.bundled.mjs`) is one; I did not regenerate it (`bio-plane`'s `npm run build` at layer close).
- Two other modules have a pinned-world instant of their own, in their paths, not mine: credentials' claim `consumedAt` (STORE-REQUEST J3 (3)). Not touched.

Size (session_01Krcj2LG7HmHfw9eDsAuwvm): test runs 4, module lines 3860

## J25 · COMPLETE · re B20

COMPLETE (re B20; fix round 10, plan item 71 (3); K5148). Cause 1 was already fixed and merged before this START: `4815d2418f` (J24, re B19), on `tranche/T51` since K5155. I found no defect still open in the code, so this session changes one test file only.

**Cause 1: `instanceGroupSeed`'s `recorded_at` under a pinned clock.**

1. **Root cause, with evidence.** As J24: the seed's instant went through `#iso()`, which read the wall clock and ignored `env.BIO_NOW_MS`. Red on the code before `4815d2418f` (J24's run: `actual: '2026-10-25T16:53:32.949Z', expected: '2031-03-04T05:06:07.000Z'`).
2. **Why the module tests missed it.** As J24: the R4 test booted with `env: {}`, and tests that pinned a clock passed `now` through `boot({now})`, which bypasses `env`.
3. **Failing-first test.** J24's "R4 instanceGroupSeed records its instant on the instance clock: pinned by env.BIO_NOW_MS it is that instant; unpinned, the wall clock" (`group.test.mjs`): red before the fix, green after. **This session** adds "R4 instanceGroupSeed takes its instant from the clock handed in before env.BIO_NOW_MS; none handed, env; none at all, the wall clock" (`group.test.mjs`). It is a control: it passes on the code as it stands, because the handed clock was already read first (`#instant()`'s first branch). I did not fabricate a red for it.
4. **Owning module.** instance-setup (`bio-plane/src/setup.mjs`, `bio-plane/src/livefire.mjs`).

**The reading I kept (technical, recorded here).** The START says "a clock the module is handed (defaulting to the wall clock)". `#instant()` reads, in order: the handed `now`, then `env.BIO_NOW_MS` (store-assembly R5's rule), then `Date.now()`. I did not remove the env step. Reason: store-assembly (`bio-plane/src/store-assembly/assemble.mjs`:596) and plane (`bio-plane/src/plane/store.mjs`:576) build this module with `instanceSetupOf(ctx, env, deps)` and pass no `now`. Removing the env step now would make a pinned world record the wall time again, which is the cause itself, and would break the pinned-world tests of store-assembly and plane until those callers hand a clock. Dropping the env step is a change for BOB to order once they hand `now`.

**For BOB (REPORT, the line the START asks for).** To hand this module its clock, the two construction sites should pass `{ now: () => nowMs(null) }` in the deps object: `assemble.mjs`:596 (`instanceSetupOf(ctx, env, { queueProducers, now: () => nowMs(null) })`) and plane's `store.mjs`:576, the same. Both are outside my paths; store-assembly is later in the order, so I did not touch them.

**Checks and tests (with summary lines).**
- Module suite, `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/instance-setup/*.test.mjs` from the repository root (run to its own exit, no force-exit): `tests 243, pass 243, fail 0, cancelled 0, skipped 0, todo 0`.
- `node_modules`: installed in `bio-plane` (`npm ci`; the repository root has no `package.json`).
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio instance-setup`: 34 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio instance-setup`: 76 of 76 live requirement ids named by a test, 0 failures.
- `checks/words.mjs /home/user/bio instance-setup`: inline 0, plain 0, testcopy 0, marker 0, 0 failures.
- `checks/ownership.mjs /home/user/bio instance-setup tranche/T51`: 1 file changed by instance-setup, 0 failures.
- `checks/fixtures.mjs /home/user/bio instance-setup --list`: answer 0, stub 0, code 0, contract 0, accepted 2 (`fixture.mjs`:190, :201, pre-existing), 0 failures. No marker added.

**Requirement ids met.** R4 (the seed's recorded instant is the instance clock's, as J24 and this session's control). No requirement mark struck: R4's text carries no clock rule, and the clock rule is R-CLOCK (K5132), which other modules own.

Deferred: none of my own. Found in other modules: the two construction sites above (store-assembly and plane), and credentials' and capture's pinned-world instants (STORE-REQUEST J3 (3)), not touched here.

Size (session_011ShJzhwLnZv3XLiooRzh1n): test runs 1, module lines 3860

## J26 · COMPLETE

COMPLETE (re B20). Cause 1 (instanceGroupSeed's recorded_at under a pinned clock) was already fixed at 4815d2418f (J24, merged on the tranche). This session adds a control test for the handed clock (R4): 243 of 243 module tests pass. No defect remains open in the code; the env fallback is kept until store-assembly and plane hand their clock (see J25 REPORT in the record: assemble.mjs:596 and plane store.mjs:576 must pass { now: () => nowMs(null) }). format, architecture, coverage, words, ownership, fixtures: 0 failures. Commit 05aa616909 on job/T51/instance-setup. Record J25.
