# instance-setup (T51)

**Status** · session_018SUX5UvD4QojUdVCPkUvFj · depth 2 · WORKING · handled B7

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
