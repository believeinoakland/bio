# screens-entry (T51)

**Status** · session_015gSwauMbsH62NN9H8Dt6EX · depth 2 · WORKING · handled B12

## Completion (T51-114)

**Entries applied.** T51-114 whole:
- R25: a part skipped with `setup.skip` shows `screen.setup.state.skipped` in the place of its state mark, with `screen.setup.state.skipped.help` as the tip on the word; it is closed, sends and records nothing, and un-skipping restores the state its read gives (`setup.mjs`, `part()`). The state word is drawn as `S + "state." + …` so the generator sees the dotted head. Part 1 has no skip.
- `words.mjs`: `state.skipped` and `state.skipped.help` added to the `screen.setup.` list of `READS.setup`; the header comment on `words-reads.json` being generated from T49's code is gone.
- `setup.mjs`: the stale comment citing `setup-page` R30 is gone. `front.mjs`:35 `group-logo` is an asset path (`/app/assets/group-logo`): recorded, nothing to change.
- Words finding (W): the one handlist, `front.test.mjs`:55, now takes its keys from the module's own declared list (`o.spec.words`). `checks/words.mjs` shows 0 failures for screens-entry; run over every module together, no line names screens-entry.

**Deferred.** Nothing.

**Found in other modules.** None. For BOB and the design lane: `docs/development/ux-substrate/screens/words-reads.json` lists neither `screen.setup.state.skipped` nor `.help` for screens-entry until the design lane regenerates it from the changed source (DEC-258's run). R24's test reads the module's declared list against `hasWord`, so it passes now and needs nothing from the regeneration.

**Tests and checks.**
- `node --test bio-plane/test/m/screens-entry/`: tests 85, pass 85, fail 0 (R25's new test is in `setup.test.mjs`).
- `checks/format.mjs bio`: 0 failures. `checks/architecture.mjs bio screens-entry`: 0 failures. `checks/coverage.mjs bio screens-entry`: 25 of 25 live requirement ids named by a test, 0 failures. `checks/ownership.mjs bio screens-entry tranche/T51 job/T51/screens-entry`: 0 failures.
- `checks/run.mjs bio`: 0 lines name screens-entry; its other failures are other modules' (wizard-scripts and others).
- `setup-words/build.mjs --check`: rows match words.json and the source.

Size (session_01YHA4ZoaUaEuD38r56tWV9k): test runs 8, module lines 1080

## J1 · COMPLETE

T51-114 applied: R25 (a skipped setup part reads screen.setup.state.skipped with .skipped.help), both keys added to READS.setup, stale comments gone, the one handlist finding fixed; words check 0 failures for screens-entry, and no line names it over all modules. Module tests 85/85; format, architecture, coverage (25 of 25) and ownership 0 failures. For the design lane: words-reads.json lists neither new key until regenerated (DEC-258); R24 passes meanwhile. Details in build/jobs/T51/screens-entry.md.

## Change B2 (K4093)

Merged `tranche/T51`. No local stand-in of a provider (`BROWSER_ACTS`, shell options, patched registry) is held in the module or its tests; the test kit's stand-in of the shell's kit is the module's interface harness, unchanged. Module tests: tests 85, pass 85, fail 0. format, architecture, coverage (25 of 25), words (0 failures) and ownership: 0 failures. Nothing fails; nothing of another module's found.

## J2 · COMPLETE · re B2

B2 applied: tranche/T51 merged; no provider stand-in to drop; module tests 85/85 against the real providers; format, architecture, coverage, words and ownership 0 failures.

## Change B3 (K4097)

Merged `tranche/T51`. `setup.mjs` named the scanner list's legends, the held tools and the test result by `name || label || provider_id`; each is now the provider's display name, vendor and product from the catalogue read (`offered`, `held` or `refused`), never its id; a held tool the catalogue does not name draws no line. The catalogue's own labels and hints are drawn as read. New test in `setup.test.mjs` with controls (no provider id drawn, in legends, held list or test result; the fixture catalogue now has `vendor` and `product`). Module tests: tests 86, pass 86, fail 0; format, architecture, coverage (25 of 25) and words 0 failures.

## J3 · COMPLETE · re B3

B3 applied: setup's scanner legends, held tools and test result draw the catalogue's vendor and product, never a provider id; test with controls; module tests 86/86; format, architecture, coverage, words, ownership 0 failures.

## Completion (FR-24)

**Entries applied.**
- Entry 1, C11 (R26): `setup`, under the website the founder enters, draws the fold `screen.domainfile.summary` once the team holds a claim (`groupidentity`'s `domain_claim`): the file from `domain_claim.well_known` (`{path, body}`; named by the last segment of `path`, text the `body`, never built here), a save (`cs.save`, `screen.domainfile.download`) and a copy (`cs.copy`, `shell.copy`), the numbered steps (`{folder}` the first segment of the path, `{address}` the claimed website with the path), the daily line and the refusals fold (all five by key). The claim's latest check `absent`/`mismatched`/`undetermined` draws its sentence beside the act; `groupdomainset` refused `GROUP_DOMAIN_MALFORMED` or `NOT_AN_ADMIN` draws `.malformed` / `.notadmin`. A null `well_known` draws no file, save or copy, and drops steps 2 and 4 (they need the path); no claim draws no fold.
- Entry 2, T-19 and T-18 (R30): the form's invitation-read button is labelled `screen.join.invite.reread`; setup's hosting line reads `screen.group.hosting.now.setup` / `.system` when `recorded_by` is the setup or the system (same rule as `screens-settings`' `originOf`), `screen.setup.hosting.now` for a member or an unstated recorder.
- Requirements: ownership forbids my writing `build/requirements/screens-entry.md`, so R26 and R30 are proposed in my REPORT for BOB to write; the tests name them. `words.mjs`: `DOMAINFILE` keys, `shell.copy`, the two `screen.group.hosting.now.*` keys, `screen.join.invite.reread`.

**Reading of the instance-setup answer (FR-39 not merged when I wrote this).** The answer's shape is the one the START and instance-setup's own START give: `groupdomainset` and the credentialed `groupidentity` (`domain_claim.well_known`) answer `{path, body}` or null. My tests use that shape from a fake plane. If FR-39 names the field differently, only `domainFile()` in `setup.mjs` changes.

**Deferred.** Nothing.

**Found in other modules (for BOB / the design lane).**
- R10 is red on a design word: `screen.domainfile.refused.malformed` holds the example "lakeshoretenants.org", which R10's guard (it matches `Lakeshore`) reads as a place. The word is the design stream's, so I did not weaken the guard. Needs the design lane to reword the example (e.g. a neutral name such as `exampleteam.org`) or a ruling; see QUESTION.
- T-19: on `join` the invitation-read button is drawn only inside the form, that is, after the read has answered, so "before the read, the old key" has no state to show; the button always draws the reread key. See QUESTION.
- `docs/development/ux-substrate/screens/words-reads.json` lists none of the new keys for screens-entry until the design lane regenerates it (DEC-258); R24 passes now on the module's declared list.

**Tests and checks.**
- `node --test bio-plane/test/m/screens-entry/`: tests 92, pass 91, fail 1 (R10, the design word above). New tests fail without the source change (6 fail) and pass with it.
- `checks/format.mjs bio`: 0 failures. `architecture.mjs bio screens-entry`: 0. `coverage.mjs bio screens-entry`: 25 of 25 live ids named (R26 and R30 are for BOB to write, see REPORT), 0. `words.mjs bio screens-entry`: 0. `ownership.mjs bio screens-entry tranche/T51 job/T51/screens-entry`: see the push below. `checks/run.mjs bio`: no line names screens-entry.

Size (session_017xaHGAS9HLwMSL3PYNVsLE): test runs 6, module lines 1127

## J4 · QUESTION

FR-24 is built and pushed (job record: "Completion (FR-24)"); three things need you before COMPLETE.

1. **R26 and R30 are not in the requirements file.** The ownership check forbids my writing `build/requirements/screens-entry.md` (it fails on it), so please write both lines. The tests already name R26 and R30. Proposed text, in the file's style, is in the job branch's scratch copy of the file; in short:
   - R26 (T51; C11, DEC-374; `instance-setup` R100; amends R6, R22): `setup`, under the website the founder enters, once the team holds a claim (`groupidentity`'s `domain_claim`), draws the fold `screen.domainfile.summary` from the answer only: the file `well_known {path, body}` (named by the last segment of `path`, text the `body`, never built here), a save (`screen.domainfile.download`) and a copy (`shell.copy`), the steps `screen.domainfile.step1`–`step5` (`{folder}` the path's first segment, `{address}` the website plus the path), `.daily`, and the refusals fold (`.malformed .absent .mismatched .undetermined .notadmin`). The latest check absent, mismatched or undetermined draws its sentence beside the act; `groupdomainset` refused `GROUP_DOMAIN_MALFORMED` or `NOT_AN_ADMIN` draws `.malformed` or `.notadmin`. A null `well_known` draws no file, save or copy and drops steps 2 and 4 (they need the path); no claim draws no fold.
   - R30 (T51; T-19, T-18, DEC-384; amends R7, R6): on `join` the invitation-read button is `screen.join.invite.reread`; on `setup` the hosting line reads `screen.group.hosting.now.setup` / `.system` when `recorded_by` is the setup or the system, `screen.setup.hosting.now` for a member or an unstated recorder.
   (`screens-entry` plus the same R-numbers I used; if you number them differently I rename the tests' ids.)

2. **R10 is red on a design word, not on my code.** `screen.domainfile.refused.malformed` (words.json, DEC-374) gives "lakeshoretenants.org" as its example; R10's guard reads `Lakeshore` as a place, which is right (it is a real street). I did not weaken the guard. Needs the design lane to reword the example to a neutral name, or your ruling. Until then `node --test bio-plane/test/m/screens-entry/` is 91/92, the one failure being that.

3. **T-19 reading (replaces nothing; first question).** On `join` the "Read the invitation" button is drawn only inside the form, that is, after the read has answered, so "before the read it draws its old key" has no state. My reading: the button always draws `screen.join.invite.reread`; the test checks that, that nothing to read is drawn while the read is pending, and that the old label is not drawn. Say if you meant something else.

Also: FR-39 (instance-setup) had not merged when I built; I used the answer's shape from its START (`domain_claim.well_known` on the credentialed `groupidentity`, `well_known` on `groupdomainset`). If it lands under other names, only `domainFile()` in `setup.mjs` changes.

## Completion (FR-24, restart #7)

Re-opened after restart: BOB's B7 answered J4. Merged `tranche/T51` (instance-setup R100's `domain_claim.well_known {path, body}` / `well_known` match `domainFile()`; nothing to conform). R26 and R30 are now written by me in `build/requirements/screens-entry.md` (K4210), marked *(not yet met: T51)*; the tests name them. T-19 stands as B7 ruled.

**Deferred / other modules.** R10 stays red on the design word `screen.domainfile.refused.malformed` ("lakeshoretenants.org"), accepted by name at merge until the design lane rewords it (B7 (2)); BOB hands it to UX-DESIGN.

**Tests and checks.** `node --test bio-plane/test/m/screens-entry/`: tests 92, pass 91, fail 1 (R10, the design word). `checks/format.mjs`: 0. `architecture.mjs screens-entry`: 0. `coverage.mjs screens-entry`: 27 of 27 ids named, 0. `words.mjs screens-entry`: 0. `ownership.mjs screens-entry tranche/T51 job/T51/screens-entry`: 6 files, 0 failures. `checks/run.mjs`: no line names screens-entry (26 words failures are other modules').

Size (session_011edZAMwB3Jh7b7Kg9KXTCE): test runs 2, module lines 1127

## J5 · COMPLETE

FR-24 complete. R26 and R30 written by me in build/requirements/screens-entry.md (K4210); tranche/T51 merged, instance-setup R100's shape matches domainFile(), nothing to conform. Module tests 91/92: the one red is R10 on the design word screen.domainfile.refused.malformed, accepted by name per B7 until UX-DESIGN rewords it. format, architecture, coverage (27 of 27), words, ownership: 0 failures; checks/run.mjs: no line names screens-entry. Details in build/jobs/T51/screens-entry.md.

## Completion (B8, restart #8)

Re-opened by B8 (CHANGE, K4248): the design's U420 (DEC-387) and U422 (DEC-388) are merged into `tranche/T51`. This branch takes that tip (`62d21aa378`, the merge of `origin/tranche/T51`). No local stand-in of a provider to drop, and no code change in this round.

**Entries applied.** B8 (yours, B417 1): `screen.domainfile.refused.malformed` now draws the malformed website-file refusal from the word row as reworded by DEC-387 ("such as example-tenants.org"). R10's guard stands as it was; its red is green. No requirement line changed: R26 and R30 (K4210) stand, both named by tests that pass.

**Deferred.** Nothing.

**Found in other modules.** None. The words check over every L11 module together (`checks/run.mjs`) names no line of this module; its 24 failures are op-grades' test copies (`t47`–`t49`).

**Tests and checks.**
- `node --test bio-plane/test/m/screens-entry/`: tests 92, pass 92, fail 0.
- Dependencies (K4113): `npm ci --ignore-scripts` in each tracked `package-lock.json` directory that had no `node_modules`.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio screens-entry`: 16 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio screens-entry`: 27 of 27 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio screens-entry tranche/T51 job/T51/screens-entry`: 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: `rows.mjs` and `words-unreviewed.json` match `words.json` and the source.

**Requirement lines for BOB.** None this round.

Size (session_01C8fgWb9DkH29Qwidmkqkxo): test runs 1, module lines 1127

## J6 · COMPLETE · re B8

B8 applied: tranche/T51 (U420 DEC-387, U422 DEC-388) merged; no code change. R10 green: screen.domainfile.refused.malformed now reads the DEC-387 row (example-tenants.org). Module tests 92/92; format, architecture, coverage (27 of 27), ownership, setup-words check: 0 failures; checks/run.mjs names no screens-entry line. Requirement lines: none this round. Details in build/jobs/T51/screens-entry.md (Completion (B8, restart #8)).

## Completion (B9, K4259)

**Entries applied.** Entry 1, `join`: `memberlanguageset` is now named by the module's acts and drawn as the design draws it (`mock-screens.js` `choice(…, {act: 'memberlanguageset'})`): the language field carries `data-act="memberlanguageset"`, with no button of its own, since the person has no session until `enroll` answers; `enroll` still sends the language once, after `login` (R7). No language offered draws neither field nor mark. (`join.mjs`.)
**Requirement lines for BOB.** I wrote R31 in `build/requirements/screens-entry.md` myself (K4210), marked *(not yet met: T51)*: `join` draws the language choice with its act; test `R31` in `join.test.mjs`, seen failing before the change, with the no-languages control. R26 and R30 were written by BOB (B7); R10 is green since B8 (suite 93/93).
**Deferred / found in other modules.** Nothing. No act of the registry is left undrawn on my screens for lack of a drawing or a row.
**Tests and checks.** `node --test bio-plane/test/m/screens-entry/`: tests 93, pass 93, fail 0. format 0 failures; architecture (screens-entry) 0; coverage 28 of 28 live ids named, 0; words (screens-entry) 0; ownership 0. `checks/run.mjs`: no line names screens-entry; its other failures are other modules' (screens-intake R53 uncovered; op-grades t37.test.mjs:32 testcopy).

Size (session_01G5kaQEiscMUfxNCvhoTCB3): test runs 4, module lines 1135

## J7 · COMPLETE

B9 applied: join names memberlanguageset in its acts and draws the language choice as the design does (data-act on the choice's field, no button; enroll still sends the language once after login). R31 written by me in build/requirements/screens-entry.md (K4210; the ownership check lists that one file, accepted at merge). Test R31 seen failing, with control. Module tests 93/93 (R10 green since B8); format, architecture, coverage (28 of 28), words 0 failures. Nothing deferred; nothing undrawn for lack of a drawing. Details in build/jobs/T51/screens-entry.md.

## Completion (B10, fix round 2, wave 2)

**Entries applied.** Merged `tranche/T51` (wave 1 in). I wrote R32 and R33 in `build/requirements/screens-entry.md` myself (K4210), marked *(not yet met: T51)*; each test names its id and was seen failing before the change.
- **C82 (R32).** `reset` now reads `groupidentity` (public, as `front` does) beside `passwordresetlook` and fills `{name}` of `screen.reset.keeps` with the team's name, else the unnamed-team word `screen.entry.group` (never the short name). The live, set and dead pages draw no `{`. The R5 tests that listed the requests and read the link out of every body were updated for the second read.
- **C83 (R33), my part.** `setup` step 7 reads `scanstatus` (the administrator's own read; asked unconditionally because the shell computes `reads` once per load, so a read gated on `bootstrap` would never fire for a returning founder) and draws, only while `part_scanner` is `true`: signatures held (no `no_signatures`) → `screen.setup.security.scanner`, "checked"; `no_signatures` → since when and why from the answer's keys (`file-safety.index.no_signatures_since` with `{date}`, `signatures_refused` with `{status}`, or the answer's own words where the list lacks a key), never the scanner's code and never "checked"; the read not answering, or the scanner unreachable → nothing is claimed. The five `file-safety.index.*` keys are declared in `words.mjs`.

**Deferred / asked.** What the administrator can do about a scanner with no signatures has no word row: nothing in `words.json` says it, and I wrote none (QUESTION J-posted to BOB: a row like "ask whoever installed your team's Civicsmith to check the scanner's signature download" for `setup` step 7 and, for screens-settings, the Security page). The Security page itself is screens-settings'.

**Found in other modules.** `build/rulings.md:4298` fails `checks/format.mjs` (K4301 records an approval but no standing-list decision, §16): BOB's file, not touched.

**Tests and checks.**
- `node --test --test-force-exit bio-plane/test/m/screens-entry/`: tests 96, pass 96, fail 0.
- Users: `journey-check/pseudo.test.mjs` 7/7 (after `npm ci --ignore-scripts` in `bio-plane/src/journey-check`, K4113), `instance-setup/page.test.mjs`, `interface-shell/declared.test.mjs`, `interface-shell/t50.test.mjs`, `plane/t47.test.mjs`, `plane/t50.test.mjs`, `control-plane/t46-app.test.mjs`: all green.
- `checks/format.mjs`: 1 failure, `build/rulings.md:4298` (not mine). `architecture.mjs screens-entry`: 0. `coverage.mjs screens-entry`: 30 of 30 ids named, 0. `words.mjs screens-entry`: 0 (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, unkeyed 0). `ownership.mjs screens-entry tranche/T51 job/T51/screens-entry`: 0 failures.

Size (session_0174THkG52z2ZaHHouaMb9q7): test runs 7, module lines 1158

## J8 · QUESTION

C83 (R33): the true scanner state is drawn on Setup step 7 (since when, why, from scanstatus's own keys), but 'what the administrator can do' has no word row. words.json holds nothing that says it, and I wrote none. Needed: one row, for Setup step 7 and for screens-settings' Security page, such as 'Ask whoever installed your team's Civicsmith to check why the scanner cannot download its signatures; files wait, unscanned, until it can.' Best reading: the design lane adds it; I will then draw it under the no-signature lines in setup.mjs (scannerState). Nothing else waits on this: I carry on and post COMPLETE.

## J9 · COMPLETE

B10 applied: C82 (R32) reset fills {name} (the team's name from groupidentity, else the unnamed-team word; no '{' on the live, set or dead page); C83 (R33, my part) Setup step 7 reads scanstatus and draws the checked sentence only when signatures are held, else since when and why from the answer's keys, nothing when unread or unreachable. R32 and R33 written by me in build/requirements/screens-entry.md (K4210; the ownership check lists that one file, accepted at merge as at J7). Module tests 96/96; journey-check pseudo 7/7 and the other users green; architecture, coverage (30 of 30), words, ownership (requirements file only): as stated. Not mine: checks/format.mjs fails at build/rulings.md:4298 (K4301 lacks a standing-list decision, BOB's file). One QUESTION open: the word row for what the administrator can do (above). Details: build/jobs/T51/screens-entry.md (Completion B10).

## Fix round 10 (B11 · START, batch 5)

**R34 (minor, first-load `whoami` 401 draws no `session.ended`): not fixable in screens-entry; needs `interface-shell`.** Root cause: `front.mjs:77` draws `session.ended` when `view.session.state === "ended"`, and it would. On a first load with a stored record, `whoami`'s 401 reaches `call` (`interface-shell/browser.mjs:161`), which runs `over("ended")` and sets `ENTRY = { state: "ended" }`. `whoami()` then returns `"none"` (`browser.mjs:1637`, `!S`), and the caller at `browser.mjs:1600` runs `ENTRY = { state: null, handle: null }` before `showFront()`, overwriting the state. So `front` receives `state: "none"` and draws no sentence. Why the tests missed it: front's tests set the session state directly; no test loads a page with a stored record whose `whoami` answers 401. The fix is at `browser.mjs:1600` (keep the `ended` state `over` set; an unknown token, which holds no record, stays null). No change to this module's code is needed; its `ended` branch is already tested. Reported to BOB (REPORT). The requirement line R34 is not in `build/requirements/screens-entry.md` (the file ends at R33); asked in the REPORT.

**Fixture lines done (2).** `setup.test.mjs`:542 `MEMBER_EXISTS` -> `EXISTS` (member-roster `memberAdd`, checks.mjs:234, index.mjs:926); `setup.test.mjs`:573 `NOT_ALLOWED` -> `NOT_AN_ADMIN` (member-roster checks.mjs:25). member-roster publishes no fixture for either refusal, so the real code replaces the invented one (K5044 (5)). The `checks/fixtures.mjs . screens-entry --list` lines at :542 and :573 remain as `op-table` answers; they are re-pointed by the later CHANGE (store-request, interface-shell `boot({door})`), as B11 says. No `fixtures-own` or `fixtures-generic` marker added.

**Tests and checks.** `node --test` on `bio-plane/test/m/screens-entry/`: tests 96, pass 96, fail 0. format 0 failures; architecture 0; coverage 30 of 30; words 0; ownership 0 failures.

Size (session_01Uwcy7zezKuV2SK7J8enJ5J): test runs 3, module lines 1158

## J10 · COMPLETE

Fix round 10 (B11): the 2 fixture lines done (setup.test.mjs:542 EXISTS, :573 NOT_AN_ADMIN: real member-roster codes, no provider fixture exists for either); module tests 96/96; format, architecture, coverage (30 of 30), words, ownership 0 failures. R34 is NOT fixable in screens-entry and needs interface-shell (for BOB): front.mjs:77 already draws session.ended for state ended; on first load whoami's 401 makes call() run over('ended') (browser.mjs:161) setting ENTRY ended, then browser.mjs:1600 (got === 'none') overwrites ENTRY with {state:null}, so front gets 'none' and draws no sentence. Fix there: keep the ended state set by over(); an unknown token (no record) stays null. Failing-first test belongs in interface-shell (page loaded with stored record whose whoami is 401 draws session.ended; control: unknown token draws none). Also: R34 is not in build/requirements/screens-entry.md (ends at R33); BOB to add it. The two op-table lines at :542/:573 wait for the storeWorld CHANGE. Details in the record.
