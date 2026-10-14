# instance-setup (T47)

**Status** · session_01RtPw7v4BWuC6SZ3yKqdReZ · depth 2 · COMPLETE · handled B4

## Completion (INSTANCE-SETUP #22)

**How the set was read (mechanics §17).** My requirements whole; my code whole (`setup.mjs` 3,3xx lines, `setup-fleet.mjs`, `livefire.mjs` by its R19 tests and exports); my tests whole where I changed or relied on them (`fixture`, `exports`, `page`, `t46`, `reports`, `worker-reports`, `profiles`, `identity`, `group`), the rest run and read by their titles and failures; of the used modules, the services named: `credentials` R22, R64 (`registerDisclosureRead`, `disclosureDue`) and its T47 test, `membership` R132 and `members.test.mjs`'s REC-41 arms, `public-read` R34 (`registerGroupIdentity`, `groupFields`: which keys it copies), `record-core` `setSetting`/`getSetting`, `jurisdictions` R37 (`locale`), `store-door` `dispatch` (byte answers and streamed bodies). Drafts read for the sections named: L11 fold §A, §B (instance-setup, control-plane, screens-entry, screens-settings, op-declarations); `registry.json`/`mock-acts.js`/`words.json` for `grouplogoset` and `grouplanguagesset` (DEC-205). No helper digests were needed.

**Entries applied (T47-75).**
- R82 (N989, N982): `op=bootstrap` answers `part_signin`, `part_scanner`, `part_safe_view` as flat scalars, no `parts`; a store answer naming any of these keys or `test_instance` sets nothing. Scanner and safe view follow `FILE_SCANNER` alike. Membership's REC-41/R132 reds clear: `bio-plane/test/members.test.mjs` 98 pass, 0 fail.
- R54 (N981, K3030): `disclosureReadOf(m)` and `DISCLOSURE_READER` exported for the composition root's `credentials.registerDisclosureRead`; this module registers nothing itself. Tested with the real `credentials`: `DISCLOSURE_DUE` at `accountreferenceset`, then the key held once `disclosureShown` records it.
- R83 with R86/K3144: `SETUP_HTML` and `groupLine` removed; `setupPage` stays exported, retiring, until T47-65 drops control-plane's import; R83's test is a `test.todo` naming T47-65 (page.test.mjs). `HOSTING_CONTROL`, `hostingControlBlock` re-exported from `setup.mjs` (the leaf stays the one holder). The `setup-page` edge is still used by the retiring `setupPage`: drop it at the CHANGE, not at this merge.
- R84 with R86: `groupLogoSet({raw, rawType, by})` (`op=grouplogoset`): administrators only (`NOT_AN_ADMIN`, machines included); PNG or JPEG by magic bytes, at most 200,000 bytes (the stricter reading of "200 KB"), a `rawType` that contradicts the magic bytes refused; `raw: null` clears; `LOGO_REFUSED` C-64.30 (awaiting T48's stamp). `raw` is bytes or the request's stream (read only up to the bound), or base64 inside JSON. Each act appended to the new table `group_logos` (purge-exempt, declared). `groupidentity` (R10, R11) answers `logo: true|false`. Store-internal route `grouplogo` answers the bytes with `content-type`, `no-store`, `nosniff`, or 404; `groupLogoAsset(env, storeName, io)` relays it for control-plane R84 (a silence is a silence, never 404).
- R85 with R86: `groupLanguagesSet({languages, by})` (`op=grouplanguagesset`): administrators only; 1–20 tags `isLocale` accepts, canonical, each once, else `LANGUAGE_MALFORMED` (C-119.12); recorded through `setSetting('group_languages')`; profiles unchanged. `groupLanguages()` (`op=grouplanguages`) answers `{ok, languages}`: the set list, else the active profiles' `locale`s in order.

**Own code read whole (P20); flaws found and dealt with.** None beyond the above. The test fixture's frame now passes a Response through as store-door R13 does.

**Found in other modules (REPORT).**
1. `store-door`: `dispatch` parses every non-streamed POST body as JSON, so R86's raw logo body reaches the store only if `grouplogoset` joins `STREAMED_BODY_OPS` (the route then takes `rawType` from the query, stamped by control-plane from the content-type), or control-plane sends `{raw: <base64>, rawType}` as JSON. Both forms are accepted here.
2. `control-plane` (T47-65): drop `setupPage` from its import (index.mjs:47); serve `/app/assets/group-logo` through `groupLogoAsset`; route `grouplogoset`, `grouplanguagesset`, `grouplanguages`.
3. After T47-65: `answer-envelope`'s `page-policy.test.mjs` and `newgroup/test/requirements.test.mjs` import `setupPage` and need re-pointing before the CHANGE removes it.
4. `setup-page`'s page script reads the nested `parts` (its `PART_WORDS`), which `op=bootstrap` no longer answers; its tests pass (87) because they stub the answer. Moot with its delete (T47-74).
5. The plane bundle is stale from this change (generated artifact, regenerated at the layer close).

**Deferred.** R83's removal of `setupPage` (BOB's CHANGE after T47-65).

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/`: tests 165, pass 164, fail 0, todo 1 (R83, K3144) — the one failure in the run (R30's row census, C-64.30 new) was fixed and its file re-run: 9 pass, 0 fail.
- Users of changed services: `test/members.test.mjs` 98 pass 0 fail; `test/m/credentials/` 201/0; `test/m/public-read/` 196/0; `test/m/setup-page/` 87/0; `test/m/answer-envelope/page-policy.test.mjs` 6/0.
- `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage 25 failures, all other modules' T47 ids (rule 5 (1)), instance-setup 68 of 68; channels 0 failures. `ownership.mjs instance-setup tranche/T47`: 13 files, 0 failures.

Size (session_01RtPw7v4BWuC6SZ3yKqdReZ): test runs 16, module lines 3,831

**After B3 (K3148; CHANGE: wizard-scripts T47-47 and op-grades T47-48 merged).** `tranche/T47` merged (3109927b7e); `node --test bio-plane/test/m/instance-setup/`: tests 165, pass 164, fail 0, todo 1 (R83, K3144). Checks: format, architecture, coverage (68/68), ownership: 0 failures each.

**After B4 (K3171; CHANGE: control-plane merged, R82 serves `interfacePage` at `/`).** `tranche/T47` merged (ecb6b55c00). R83 applied: `setupPage` removed with the import of `setup-page`, so this module no longer uses `setup-page` (the `modules.json` edge can go); `HOSTING_CONTROL` kept. R83's test is live (page.test.mjs). `node --test bio-plane/test/m/instance-setup/`: tests 164, pass 164, fail 0, todo 0. Former importers: `test/m/control-plane/` 257/0, `test/m/answer-envelope/` 36/0, `newgroup/test/requirements.test.mjs` 53/0. Checks: format, architecture, coverage (68/68), ownership: 0 failures each. Deferred: none.

## J1 · QUESTION

R83 (remove `setupPage`, `SETUP_HTML`, `groupLine`'s page use) and the L11 merge order (instance-setup before control-plane T47-65).

Fact: `bio-plane/src/control-plane/index.mjs:47` imports `{ setupPage, instanceGroupOp, groupIdentityOp }` from `../setup.mjs` and uses it at line 626 (the `/` route). Once `setupPage` is no longer exported, that import fails at module load, so `control-plane` and everything that loads it (`plane`, the Miniflare plane every Worker-level test runs, `store-door`/`answer-envelope` tests that import through it) cannot load until T47-65 drops the import (its R82). Also importing `setupPage`/`SETUP_HTML` directly: `test/m/answer-envelope/page-policy.test.mjs:11` (answer-envelope, T47-54), `newgroup/test/requirements.test.mjs:15,536` (installer, T47-87). And `setup-page`'s own tests read the nested `parts` R82 retires (setup-page R30/R34; T47-74 deletes it).

My own `worker-reports.test.mjs` (R17–R19, R33–R42 through the real plane) can therefore not run green on my branch with R83 applied: it fails at load in control-plane, not in this module.

Best reading (what I am building): apply R83 as written (the requirement binds; its test is "no export names the page"), and the window from my merge to T47-65's is an accepted red BOB names at my merge (K2704): every test that loads control-plane. I will run worker-reports with control-plane's one import line patched in a scratch copy only, to show my module's behaviour green, and record that.

Alternative, if BOB prefers no window: control-plane merges its R82 (drop the import) before this job, or BOB lets me keep `setupPage` exported (marked retiring) until T47-65, with R83's test red until then. Say which; I carry on with the rest meanwhile.

## J2 · COMPLETE

T47-75 complete on `job/T47/instance-setup` (record's "Completion" section). R82 flat parts (membership REC-41/R132 green: 98/0); R54 `disclosureReadOf`/`DISCLOSURE_READER` for plane's registration, tested with real credentials; R83 per K3144: `SETUP_HTML`, `groupLine` gone, `setupPage` retiring, R83's test a todo naming T47-65 — keep the `setup-page` edge until your CHANGE; R84/R86 `grouplogoset` {raw, rawType} (C-64.30 `LOGO_REFUSED`, new table `group_logos`), store-internal `grouplogo` bytes route, `groupLogoAsset` for control-plane; R85/R86 `grouplanguagesset`/`grouplanguages` {languages}.
Tests: instance-setup 165 (0 fail, 1 todo); credentials 201/0, public-read 196/0, setup-page 87/0, page-policy 6/0. Checks: format, architecture, channels 0; coverage mine 68/68 (25 others' T47 ids); ownership 0.
REPORT items in the record: (1) store-door must stream `grouplogoset`'s body (STREAMED_BODY_OPS) or control-plane sends JSON base64 — both accepted here; (2) control-plane T47-65 drops `setupPage`, serves via `groupLogoAsset`, routes the three ops; (3) page-policy and newgroup tests import `setupPage`, to re-point before the CHANGE; (4) setup-page's script reads nested `parts` (moot at its delete); (5) plane bundle stale.

## J3 · COMPLETE

B3 (K3148) applied: tranche/T47 merged (wizard-scripts T47-47, op-grades T47-48); instance-setup 165 tests, 164 pass, 0 fail, 1 todo (R83, K3144); format, architecture, coverage 68/68, ownership 0 failures. J2's REPORT items stand.
