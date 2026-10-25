# translations (T51)

**Status** · session_0125wgcLMbmJWHkUpq5Duamc · depth 2 · COMPLETE · handled B4

## Change B4 (K4822, from control-plane J47)

Every ok answer of `interfaceWords` (both arms, and the throwing-storage answer) now carries `words_version` (R20's `wordsVersion()`) beside `language`; a refused tag carries none. Test: "R20 every ok answer of interfaceWords ... carries words_version" (red before: the field was undefined). translations 42/42; instance-setup/t50, control-plane/t51-interfacewords, screens-settings/translations green; the module's bundle stays stale (BOB regenerates).

## Completion, fix round 8, G113 and G114 (TRANSLATIONS #3, session_0127cgdteY6TNWkhQcKQFfuz, START B3)

**G113 (R19, amends R8).** (1) Cause: `interfaceWords` (`bio-plane/src/translations/index.mjs`, the method, formerly :716-740) answered every word of the list as `{key, text, en, fallback}`, `fallback: true` for each word with no shown translation, whatever the request; the shell keeps only `fallback === false`. Now, with no `language` named, only the words the team shows in the viewer's language are answered (none held: `words: []`, a few dozen bytes); with a `language` named, every word as before (the settings screen's read). The error answer follows the same split (no word without a language, every word in English with one). (2) Missed because no test bounded what the answer holds against what the shell uses; now `r8-shown-words.test.mjs` asserts the answer is at most 4 KiB with no translation held, through the method and through the route. (3) Failing-first test `bio-plane/test/m/translations/r8-shown-words.test.mjs`, "R19 with no language named ...": seen RED against the old code (its first assertion, the empty `words` list against the 25,808-word answer, fails; the file failed), then green: 41 of 41. It covers none held, one adoption (exactly that word, `fallback: false`), an awaiting word not sent until confirmed, the `language` arm and the route answering every word, another language and a viewer with none. (4) **N** here (**P** after the redeploy is BOB's).

**G114, my half (R20).** `wordsVersion()` (in-process): `"<max adoption seq>.<max confirmation seq>.<max undo seq>"` read from the three append-only tables, e.g. `0.0.0`; it names no member and no word, is the same across reads and isolates (read from the storage alone), and changes at an adoption, a confirmation and an undo; a mark, a draft, a refused act and a read leave it. Test (failing-first, red against the old code: `wordsVersion` is not a function): "R20 wordsVersion() ...", green. instance-setup (R103) and control-plane (R127) call it; I added no op and no wire field.

**Existing tests changed (R8 amended, not weakened).** `translations.test.mjs` (the R8 `interfaceWords` test, the R4 shown-reading and the draft-is-no-state reading) and `reading.test.mjs` (R11) read the default arm and now assert the shown words alone; each keeps its every-word, never-blank assertions through a `language` named.

**Owed to BOB (outside my paths).**
- Requirements: R8's `interfaceWords` bullet should say what R19 says (default arm: only `fallback: false` words; `language` named: every word); R19 and R20 lose "not yet met".
- Word row (K4269): the op's declared description, `op-grades/t37.mjs:67` and its row in `setup-words/rows.mjs` (:21294), still reads "every interface word in a language ... never blank, with `en` beside it". Proposed: "the interface words the team shows in the member's language, each with the English beside it; with a language named, every word in that language, the English where none is shown". I did not touch either (not my paths).
- The settings screen asks the full list with `language` named (`screens-settings/translations.mjs:21`), which this change keeps; `translations/index.mjs` `translationsOps` already passes `language` from the query or body.

**Deferred.** None.

**Found in another module.** Nothing new.

**Stale generated artifacts.** `bio-plane/dist/bio-plane.bundled.mjs` (holds the old arm); `setup-words/rows.mjs` (description row above). BOB regenerates.

**Ran.**
- `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/translations/`: 41 tests, 41 pass, 0 fail.
- Users the impact names that read this op: `instance-setup/t50`, `control-plane/t37-door` and `t51-interfacewords`, `plane/t50`, `screens-settings/translations`, `op-grades/t37`: 38 tests, 38 pass. `node build/plan/impact.mjs origin/tranche/T51 HEAD`: 8 modules affected (instance-setup 26/26, answer-envelope 5/5, store-door 6/6, signin-door 2/2, screens-action 2/30, control-plane 70/87, plane 59/73, translations); I ran the files above, not the whole set.
- `checks/format.mjs`: 0 failures. `architecture` 0. `coverage` 20 of 20 live ids, 0. `words` 0. `ownership` (1 file as of the first commit) 0.

Size (session_0127cgdteY6TNWkhQcKQFfuz): test runs 6, module lines 1019

## Completion, fix round 7, G84 (TRANSLATIONS #2, session_01D3PnCpi1vCRCeUDnt7Sw8P, START B2)

**Applied: R2 as BOB rewrote it.** `INTERFACE_WORDS` is now `interfaceWords()` (`bio-plane/src/translations/index.mjs:37`), built at its first call and the same frozen array after; the key map (`wordByKey()`) is lazy likewise; `INTERFACE_WORDS_COMMIT` stays a constant. Every use inside the module and the seven test files that read the constant is re-pointed.

**Who else imports the old name** (`git grep -n INTERFACE_WORDS`, outside `build/`, `release/` and the generated bundle): `bio-plane/src/setup.mjs:61` (a re-export) and `bio-plane/test/m/instance-setup/t50.test.mjs:12,14,19,54,119`. Both are `instance-setup`'s, for INSTANCE-SETUP #28 to re-point. **Until it does, `setup.mjs` does not link** ("does not provide an export named 'INTERFACE_WORDS'"), so `instance-setup`, `answer-envelope`, `store-door` and `signin-door` tests (38 in all) fail at import, and so does anything that loads the plane from source. That is the planned order (B2); it is not a defect in this module. The bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (it holds the old constant); BOB regenerates it.

**Tests (K4426).** (1) `interface-words.test.mjs`: "R2 importing the module does no pass over the word list": a child process wraps 15 array methods and the array iterator, counts calls on `WORD_ROWS` made from this module's files, imports the module (0), then calls `interfaceWords()` (counter above 0, the control). Seen red against the old code (1 pass at import). "R2 interfaceWords() deep-equals the list of the old constant over the real table and answers the same frozen array on every call". (2) Why missed: `bundler` R31 only warns and no test bounded load-time work; the first test now bounds this module's. (3)-(4) **N**.

**L.** The count: 0 passes by this module at import (1 before). `measureStart` of the plane was not taken: the plane no longer links from source until `instance-setup` re-points (above) and its bundle is a generated artifact I do not write; BOB measures at the round end.

**Found in another module.** `record-grammar/document.mjs:22` calls `word()` at load, which builds `setup-words`' key table (`rowsByKey`, `setup-words/index.mjs:9`), one `WORD_ROWS.map` at import (about the size of the passes G84 removes). My test does not count it, since it is not this module's; BOB may want it lazy or off the load path.

**Declared ops.** Unchanged (`DECLARED_OPS`: translationgrant, translationadopt, translationconfirm, translationrevert); no op added.

**Ran.**
- `node --test bio-plane/test/m/translations/`: 38 tests, 38 pass, 0 fail.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected `translations` 7/7, `instance-setup` 25/25, `answer-envelope` 5/5, `store-door` 6/6, `signin-door` 2/2, `screens-action` 2/30, `control-plane` 69/85, `plane` 54/66. Of those I ran `instance-setup`, `answer-envelope`, `store-door`, `signin-door`: all fail at import for the `setup.mjs` re-export above and for no other reason; `control-plane`, `plane` and `screens-action` load the same chain and were not run.
- `checks/format.mjs`: 0 failures. `architecture` 0. `coverage` 18 of 18 live ids, 0. `words` 0. `ownership` (9 files) 0.

Size (session_01D3PnCpi1vCRCeUDnt7Sw8P): test runs 6, module lines 1004

## Completion (TRANSLATIONS #2, T51-105)

**Entries applied.**
- R17: `not_drafted[].why` is `{key, vars}`, a word key with its fills. The three reasons are `translations.not_drafted.not_answered`, `.not_one_line` (`vars: {max: TRANSLATION_TEXT_MAX}`) and `.placeholders_differ`. A word the assistant itself reported keeps `setup.why.assistant_draft` and replaces the other reason.
- The new `bio-plane/src/translations/words.mjs` holds the module's literal `word` calls (`say`, `why`, `keysRead`). `index.mjs` reads its notes and `why` words through it. Every key the source names is a word and is in the `translations` list of `words-reads.json`.
- Words findings, all 12 listed by `checks/words.mjs` plus the 7 plain ones in `words-pass/translations.md`. The check now shows 0 failures for the module.
  - All the strings are now `localize('translations.index.<slug>', …)`, including the two registration refusals and the draft-signal detail. I converted these diagnostics too, so no REPORT is needed.
  - Sentences assembled from fragments (`LANGUAGE_MALFORMED`, `NO_SUCH_WORD`, `TRANSLATION_NOTHING_TO_DRAFT`, `LANGUAGE_NOT_SET`) are whole sentences per case.
  - The route-keys handlist test now asserts counts, not a list.
- Tests: `words.test.mjs` is new and holds the R17 and key-list tests. The two existing assertions on `why` now compare keys.

**Deferred.** None.

**Found in other modules.**
- `screens-settings` has 2 failing tests at the tranche tip, also with my changes stashed: "the screens are the registry's … (interface-shell R38)" and "R39 words by key". Neither is mine.
- `answer-envelope/page-policy.test.mjs` imports `bio-plane/src/signpage.mjs` of control-plane, which fails the architecture check. Neither is mine.
- Screens-settings reads `why` now as `{key, vars}` (R17); I did not change that module.
- `setup-words` `rows.mjs` is stale against my new ids, as expected; BOB regenerates it at the layer close.

**Ran.**
- `node --test bio-plane/test/m/translations/`: 32 tests, 32 pass, 0 fail.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs … translations`: 0 failures.
- `checks/coverage.mjs … translations`: 17 of 17 live ids named, 0 failures.
- `checks/ownership.mjs … translations tranche/T51 job/T51/translations`: 0 failures.
- `checks/words.mjs … translations`: 0 failures.
- `setup-words/build.mjs --check`: only the expected stale-rows note.
- `node --test control-plane/t37-door screens-settings/`: 153 pass, 2 fail (both screens-settings, above).
- `checks/run.mjs`: format 0 failures; architecture 1 failure (answer-envelope's); words 1085 failures across other modules, none naming translations.

Size (session_01XjFJQ53dT8DEubR4duSRf2): test runs 8, module lines 988

## J1 · COMPLETE

T51-105 applied: R17 (not_drafted[].why as {key, vars}), words.mjs, all 12 words findings and 7 plain ones converted to localize (no REPORT needed). Tests 32/32, format/architecture/coverage/ownership/words 0 failures for translations. Found elsewhere: screens-settings 2 tests red at the tip without my changes (interface-shell R38 registry test; R39 words by key); screens-settings reads why as {key, vars} now. Details in build/jobs/T51/translations.md.

## J2 · COMPLETE

G84 / R2 applied: INTERFACE_WORDS is now interfaceWords(), lazy and frozen, key map lazy; 0 passes over WORD_ROWS by this module at import (1 before; failing-first test seen red). translations 38/38; format, architecture, coverage (18 of 18), words, ownership 0 failures. Only other users: instance-setup's setup.mjs:61 and test/m/instance-setup/t50.test.mjs; until INSTANCE-SETUP #28 re-points them setup.mjs does not link, so instance-setup, answer-envelope, store-door, signin-door (and chains through the plane) fail at import. Plane measureStart not taken (that chain does not link from source; bundle is yours to regenerate). Found elsewhere: record-grammar/document.mjs:22 calls word() at load, building setup-words' key table (one WORD_ROWS.map at import). Details: build/jobs/T51/translations.md.

## J3 · COMPLETE

Round 8 G113/G114 applied. R19: interfacewords with no language named answers only fallback:false words (none held: words [], well under 4 KiB; language named: every word). R20: wordsVersion() = '<max adoption seq>.<max confirmation seq>.<max undo seq>', changes at adopt/confirm/undo only. Failing-first tests seen red then green; translations 41/41, users 38/38; format, architecture, coverage (20 of 20), words, ownership 0 failures. Owed to you (outside my paths): R8 wording, R19/R20 'not yet met' marks, and the op description word row (op-grades/t37.mjs:67, setup-words rows.mjs:21294) with my proposed text; stale bundle and rows.mjs. Details: build/jobs/T51/translations.md.

## J4 · COMPLETE

B4 applied: every ok answer of interfacewords (both arms and the error answer) carries words_version beside language; test R20 added. translations 42/42, users green; format, architecture, coverage, words, ownership 0 failures. Record: build/jobs/T51/translations.md.

## Fix round 10, Wave A batch 1 (B5)

Entries applied: (1) `interfacewords` declared in `DECLARED_OPS` (`translations/index.mjs`, R21): `classes` admin/member, `machineClasses` [], `mutating` false, `stamps` viewer, `needs` null, `weight` read, `fields` accepts `language`, `v`, requires none, the description keyed `translations.declared.interfacewords` through `localize`, English as control-plane's. (2) Both `store-replies` lines of `fixture.mjs` carry `// fixtures-contract: store-door store-replies`.

Fixture published: `memberLanguageRead` in `bio-plane/test/m/translations/fixtures.mjs`, made by the real `registerMemberLanguageRead` and `wordsVersion` when the test runs; its test `fixtures.test.mjs` (R11 R20) calls it and checks the real answers, with a control that the stamp moves at an adoption. New R21 test in `declared-ops.test.mjs`.

Lines done and left: `fixtures.mjs … translations --list` shows only the two `fixture.mjs` lines, now `contract-no-run`, waiting for `store-door`'s `fixtures-run: translations store-replies`. No `fixtures-own` or `fixtures-generic` marker added.

**For BOB at the merge:** delete from `bio-plane/src/control-plane/owner-ops.mjs` the `interfacewords` row, lines 33–38 on this branch point (the R116 comment, lines 33–35, and the row itself): `interfacewords: { classes: ["admin", "member"], machineClasses: [], mutating: false, stamps: ["viewer"], needs: null, weight: "read", description: localize("control-plane.declared.interfacewords", "read: every interface word in a language, the group's shown translation or the English, never blank, with the English beside it; writes nothing"), fields: { accepts: ["language", "v"], requires: [] } },` — an op declared by two modules stops the plane's start (`plane/declarations.mjs:182-186`). R-WORDS for UX-DESIGN's HANDOFF: the word `translations.declared.interfacewords` has no row in `setup-words` (the English falls back from `localize`); it needs one, same English.

Tests and checks: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/translations/*.test.mjs`: 44 pass, 0 fail. `checks/format.mjs`: 0 failures. `checks/architecture.mjs … translations`: 0 failures. `checks/coverage.mjs … translations`: 21 of 21 ids named, 0 failures. `checks/ownership.mjs … translations tranche/T51`: 0 failures. `impact.mjs origin/tranche/T51 HEAD`: 8 modules, 200 test files (translations, instance-setup, answer-envelope, store-door, signin-door, screens-action, control-plane, plane). Run as is, 150 files fail, all from `op-declarations: interfacewords: declared by two owners, translations and control-plane (R81)` (answer-envelope, control-plane, plane, 2 instance-setup report files): the row BOB deletes at the merge. With that one row deleted in a scratch edit (reverted, never committed), those files run 941 tests, 924 pass, 2 fail: control-plane's R116/R112 interfacewords test (it asserts the row in control-plane's map; control-plane's to re-point) and an R24 screens-words test (not about this module); plane's g83-location, t42, t44–t47 files fail as files (g83 after 135 s), cause not examined by me. Words check run beyond the module's own words test: none.

Size (session_0125wgcLMbmJWHkUpq5Duamc): test runs 9, module lines 1023

## J5 · COMPLETE · re B5

B5 applied. (1) `interfacewords` declared in translations `DECLARED_OPS` (R21; same classes, weight read, stamps viewer, accepts language+v, requires none, description keyed `translations.declared.interfacewords`, same English; that key has no setup-words row yet, for UX-DESIGN's HANDOFF). (2) Both `store-replies` lines (fixture.mjs) marked `fixtures-contract: store-door store-replies`; they show contract-no-run until store-door's run is merged. Fixture `memberLanguageRead` published (fixtures.mjs, tested). No fixtures-own/generic marker added.
MUST LEAVE control-plane/owner-ops.mjs in the same merge: lines 33-38 on this branch point, the R116 comment (33-35) and the row `interfacewords: { classes: ["admin","member"], machineClasses: [], mutating: false, stamps: ["viewer"], needs: null, weight: "read", description: localize("control-plane.declared.interfacewords", ...), fields: { accepts: ["language","v"], requires: [] } },`. Until then 150 impacted files fail on R81 (declared by two owners); with it deleted: 924 of 941 pass; 2 fail, control-plane's own R116/R112 test (asserts the row there) and an R24 screens-words test; plane g83-location/t42/t44-t47 fail as files, cause not examined.
Module tests 44/44; format, architecture, coverage (21 of 21), ownership 0 failures. Record: build/jobs/T51/translations.md.
