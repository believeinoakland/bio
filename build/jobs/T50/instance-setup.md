# instance-setup (T50)

**Status** · session_019Fh9dotp8A2XoNVR5RYBUK · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

QUESTION (best reading below; I carry on meanwhile).

State: `tranche/T50` holds no `src/translations/` yet (T50-22 and T50-25 have not merged; their job branches hold only mail). My R94 delegates, the registration and `INTERFACE_WORDS` re-export import `./translations/index.mjs` (`translationsOf`, `registerMemberLanguageRead`), and the 17 rows leave only after `answer-envelope` lists translations' checks file.

Best reading: I do now everything that does not need the module (R92 the alarm's `now`; R93 forums in `officesSeed`; `recovery.test.mjs`:36; refusal rows read by `refusal.<CODE>` key through `word`; "labeled"/"team" in my own words), and write the R94 edit against the map's interface (map §3.2, review §6). I cannot run the split's tests until translations is in my tree. Please send a CHANGE when T50-22 (and T50-25 for the rows) have merged into `tranche/T50`, and I merge it, finish R94 and run everything. If you prefer I wait with the whole of R94 until then, say so.

Also (rule 6): inline `detail`/`note` sentences with no key in `words.json` stay as they are and I list them in my record for a REPORT; I will not mint English.

## J2 · REPORT

REPORT. R92, R93, R94 and the recovery test are built and pushed; the 17 rows wait for answer-envelope's CHANGE.

Done (tranche/T50 merged in, translations in my tree):
- R92: `updateCheckTick(now)` hands the alarm's `now` to the check; `update_checks.at` and the answered `at` are that instant; no `now`, the clock. Test in t48. Plane R12 (K3363) no longer fails.
- R93: `officesSeed` seeds each forum of `combine`'s view as a `body` entity with `forum_kind`, its ids as scheme identifiers (first through `#seedEntity`, the rest `addIdentifier`), `already` on a repeat, `unseeded` with why for a forum with no identifier; the answer lists them as `forums`. Tests in seeds (twice, and the no-forums control).
- N1103: `recovery.test.mjs`:36 recovers by `handle`.
- R94: workspace code, seven tables (declaration and DDL), constants, imports and `#isActiveMember` deleted; eleven delegates, `#translations()` (record, membership, ai-accounts as a lazy getter, `deps.jurisdictions`, `deps.now`; not `{env}`), the language read registered on first construction and reported at start (`out.language`), `INTERFACE_WORDS` re-export, nine route lines kept. R64 and R85 raise `LANGUAGE_MALFORMED` from `TRANSLATIONS_CHECKS`. Moved tests removed (translations.test, interface-words.test, t41's two R67 tests, t48's two R87 tests); new t50.test.mjs names R94 (nine routes, set language read, unstarted instance, no tables here).
- Rule 6: the 24 rows that stay read `refusal.<CODE>` through `word`; the tests that compared their English now compare the key. "labeled".
- setup.mjs 3,358 lines (3,678 over my paths) with the 16+1 rows still in; about 3,500 once they go.

Held (answer-envelope not yet merged): INSTANCE_SETUP_CHECKS still holds the 16 moved rows (C-64.11–.17, .19–.26, .31) and C-119.12 as English copies; my R30 walk and R63 test exclude `TRANSLATIONS_CHECKS` codes so they pass now and need no edit then. At the second CHANGE I delete the rows, trim group.test's R30 list (C-64.11–.26, .31) and t48's R90 rows test (`.31`), and re-run.

Unkeyed member-facing sentences for the design lane (rule 6; I left them, never minted English): every `detail:`/`note:` string in setup.mjs (profiles, seeding why's, assistant state, place and identity notes, language, info-level, update acts, draft notes, stake, logo, languages, runtime note, `RUNTIME_ASYMMETRY`), still saying "group"/"your group's Civicsmith" where words.json says "team"; and in `setup-fleet.mjs` `HOSTING_CONTROL`, `FORGOT_HELP`, `HOSTING_RECOVERY_DEPLOYER`. Keys for the hosting block and forgot help exist (`screen.hosting.heading/s1–s5/guide`, `screen.forgot.help.*`), but reading them in `setup-fleet.mjs` would pull setup-words' whole list into the installer's import-free leaf bundle (K405): your call (installer bundle size), I did not do it.

Checks: format 0 failures; architecture 0; coverage 66 of 66 ids named; ownership 0. instance-setup tests 182 pass, 0 fail. store-door, translations, op-declarations, screens-settings: 16 failures, the same 16 as on tranche/T50 untouched. plane + answer-envelope + installer: 16 failures, none from this module (public-read's `matter_stake` in plane t46 R40, K2046 capture drain, others inherited).

## J3 · COMPLETE

COMPLETE. Entries applied: R92 (the alarm's `now`), R93 (forums in `officesSeed`), R94 (the workspace leaves; eleven delegates, registration, `INTERFACE_WORDS` re-export, nine route lines kept; the 17 rows C-64.11–.17, .19–.26, .31 and C-119.12 deleted after B4; R64 and R85 raise `LANGUAGE_MALFORMED` from `TRANSLATIONS_CHECKS`), N1103 (`recovery.test.mjs`:36 by handle), plan rule 6 for the rows (the 22 that stay read `refusal.<CODE>` through `word`; "labeled").

Deferred, with why (J2 REPORT holds the detail): (1) every `detail:`/`note:` sentence in setup.mjs has no key in words.json, so it stays inline and says "group"; REPORT for the design lane. (2) `setup-fleet.mjs` `HOSTING_CONTROL`, `FORGOT_HELP`, `HOSTING_RECOVERY_DEPLOYER` stay inline: keys exist (`screen.hosting.*`, `screen.forgot.help.*`) but reading them would put setup-words' whole list into the installer's import-free leaf (K405): BOB's call.

Found in another module: answer-envelope's `families.test.mjs` pins my seven keyed rows by digest of their old English (GROUP_SLUG_MALFORMED C-64.2, GROUP_ALREADY_RECORDED C-64.3, GROUP_IDENTITY_NOT_ADMIN C-64.5, GROUP_DISPLAY_NAME_MALFORMED C-64.6, PROFILES_NOT_ADMIN C-119.1, UNKNOWN_PROFILE C-119.3, PROFILE_IS_TEST C-119.4); the sentences now come from words.json ("team"), so its R2/R7 pins ("pinned by its key", N1128) need those seven re-pinned by key: 4 failures in test/m/answer-envelope (two more there, action-plans C-124.30 and case-inputs' file list, are not mine). Also: public-read now answers `matter_stake`, so plane t46 R40's key list is red (public-read's).

Tests and checks: instance-setup 182 pass, 0 fail (new: t50 R94 ×4, t48 R92, seeds R93 ×2). With answer-envelope: 219 pass, 4 fail (the pins above). store-door, translations, op-declarations, screens-settings: 16 fail, identical to untouched tranche/T50. format 0 failures; architecture 0 (module 26 files; whole product 3502); coverage 66 of 66 ids named; ownership 0 (16 files); `checks/run.mjs`: architecture 0 failures, no instance-setup line in coverage failures.

Size (session_019Fh9dotp8A2XoNVR5RYBUK): test runs 22, module lines 3571
