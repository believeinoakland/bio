# wizard-scripts (T51)

**Status** · session_01WMjLF8CWtt2TqjEkixFjxh · depth 2 · COMPLETE · handled B8

## J1 · BLOCKED

BLOCKED · cause: needs Bob (NEEDS BOB). T51-139 is not COMPLETE; the rest is done and pushed (commit 49666011ce on job/T51/wizard-scripts).

DONE
- R44 (T51-139's registry re-take): `source/registry.json` is the registry at 8c5e692e19 (77 screens, 441 acts: 286 declared, 132 function, 23 owed); the old file kept as `source/registry-7be06eb4cb.json`; `build-data.mjs` pins 8c5e692e19 and writes `screen-registry.mjs` (the only generated file that changed); the library and the front doors are unchanged (`--check` green). data.mjs carries no registry pin (its pins are the doors' and the library's), so the R44 pin lives in build-data.mjs only. New test `t51.test.mjs` names R44.
- Words: every sentence that equals a words.json row now reads `word(key)`: the 42 refusal translations (`refusal.<CODE>`, the row the list gives each code; the code's own text was the older wording), the script names (`wizard.<id>.name`), the R22 and R30 rows, and the copies in the tests. Handlist: the other-module op lists are read from the registry file (library.test) or from the module's own list (invariants.test).
- K4065: the wizard fixture runs project-roster's migrate() as the host's boot does; queue-producers' wizard.test.mjs is green (4/4).
- Historic tests (R35, R38, R41 in t47, t48, t50) keep their history and now name the current pin and counts where they describe the current file.
- Module suite: 106 pass, 0 fail (tap run). format 0 failures; coverage 44 of 44 live ids named; ownership 0 failures.

NEEDS BOB (1): 64 sentences have no row in words.json, and wizard-scripts is a drawn module, so `localize` is refused there (checks/words.mjs `marker`); the only compliant reading is a word(key) row. The design stream owns words.json. Please ask the design stream for rows (keys `wizard-scripts.<area>.<slug>`, or the words-pass ids) for the sentences below, or tell me another route. Eight of them carry `{}` placeholders (the number or name that goes in); the rows need named placeholders. Two rows exist already (`wizard-scripts.why.draft`, `wizard-scripts.why.step_carries_screen`) but their English is not what the code says: the first holds `{text}`, `{template}`, `{machine}` as text, which word() would read as placeholders.
Sentences (file:line, the English as the code has it):
- data.mjs:55 "Comment for the group" (a script name; no row)
- data.mjs:59 "Update your group's Civicsmith" (a script name; no row)
- index.mjs:166 "a step is {screen, act, what, why, draft?, via?}"
- index.mjs:177, :317 "a draft is one of {text}, {template} or {machine}" (row exists; braces, see above)
- index.mjs:299 "a script has at least one step"
- index.mjs:311 "the step does not say what the member does and why"
- index.mjs:335 "the script has one step"
- index.mjs:339 "an offered script walks the same screens and acts"
- index.mjs:454 "no member is named as the one acting: this call carries nobody"
- index.mjs:463 "no wizard script by that id is readable here; one you may not see answers the same"
- index.mjs:489 "a Civicsmith script is read-only to every team: teams cannot edit or retire it"
- index.mjs:495 "the script was already retired" / "the version was already withdrawn"
- index.mjs:792 "the registration is made once per construction, and it was"
- index.mjs:864 "a recording is a list of {screen, act}"
- index.mjs:869 "a recorded step holds its screen and act, never a typed value"
- index.mjs:915 "a script is drafted by a joined participant of its project"
- index.mjs:919 "a draft starts from one of a recording, a source or a copy"
- index.mjs:968 "a draft is revised by its author"
- index.mjs:1014 "no stamped proposer: a proposal names who made it"
- index.mjs:1058 "a draft is submitted by its author"
- index.mjs:1092 "an administrator makes a script team-wide"
- index.mjs:1102 "an administrator approves a team-wide script" / "an owner of the script's project approves it"
- index.mjs:1106 "you are the version's author and its only member contributor: another member approves it"
- index.mjs:1131 "granting the advanced wizard editor"; :1154 "revoking the advanced wizard editor"
- index.mjs:1135 "no member by that id"; :1157 "no editor grant by that id"
- index.mjs:1187 "an administrator retires a team-wide script" / "an owner of the script's project retires it"
- index.mjs:1201 "a version is withdrawn by its author"
- index.mjs:1528 "the assistant does not help word this field"
- index.mjs:1537 "the assistant's draft is not served yet: nothing was drafted and the field is unchanged"
- index.mjs:1567 "use is counted as start, step or finish: stopping is not an event"
- index.mjs:1570 "only a step reached names a step"
- index.mjs:1586 "a script's use is read by the owners of its project and its authors"
- index.mjs:1613 "candidates are read by project owners and administrators"
- start.mjs:86 "a rumour part is proposed as a question: it is proposed as a lead"
- Placeholder sentences (the name of the thing goes in; `{}` in the check): index.mjs:163 "a script has at most {} steps" (and :865); :168 "a step carries only screen, act, what, why, draft and via, not '{}'"; :174 "'{}' is text of at most {} characters"; :178 "a draft's text is 1 to {} characters"; :266 "no script '{}' is offered here to go to"; :276 "the side trip to '{}' leads back to this script, so it would never return"; :306 "no screen '{}' is registered"; :309 "the screen '{}' offers no act '{}'"; :318 "no filing template '{}' is offered here"; :319 "'{}' is not a registered machine draft" and "a draft's text is 1 to {} characters"; :330 "the assistant never helps word the act '{}': it is refused to a machine or cannot be undone"; :332 "the act '{}' is refused to a machine: no draft is placed on it but ..."; :453 "'{}' is a machine identity: a machine proposes steps, labelled, and ..."; :479 "the version is {}, past draft: its steps are fixed"; :1030 "say why in 1 to {} characters"; :1090 "the version is {}: only an approved project script is widened"; :1100 "the version is {}, not submitted"; :1182 "give the reason in 1 to {} characters"; :1255 "state is offered or one of {}"; :1532 "tell the assistant what to say, in 1 to {} characters"; :1569 "a step reached is one of the script's, 1 to {}"; :926 "a script is named in one line of 1 to {} characters"
- The 36 `plain` findings in build/plan/words-pass/wizard-scripts.md are these same sentences judged by the same rule (K3957).

NEEDS BOB (2): the fixture imports project-roster, and wizard-scripts does not declare it in `uses`, so checks/architecture.mjs fails (`bio-plane/test/m/wizard-scripts/fixture.mjs`). K4065 directs that the fixture run the roster's migrate(). Please say whether a test-only edge `project-roster` goes into wizard-scripts' `uses` in modules.json (BOB's), or name another route. Without it, architecture shows 1 failure.

NOT MINE (K3986, reported, not changed): other modules' test copies of wizard script names, which the words check counts in their own jobs: screens-daily (contract.test.mjs:102, :109; home.test.mjs:304, :305; join.test.mjs:16), screens-wizards (fixtures.mjs:23; guide.test.mjs:286; library.test.mjs:161; page.test.mjs:129; t48.test.mjs:11, :15); queue-producers' index.mjs:2287 and :2530 are its own sentences.

SIZE (session_0192jMRKKhCkVUkwJyJXBS3f): test runs 14, module lines 2673 (own code, the three generated files excluded).

After Bob's rows and the uses edit: convert the 64 to word(key), run the suite and the checks, and post COMPLETE.

## J2 · REPORT

REPORT · B2 (CHANGE) applied in commit 63b6c5fb57 on job/T51/wizard-scripts: registry and front doors at 20c8001300 (pins in build-data.mjs and data.mjs; the generated files rewritten by build-data.mjs; --check green). The library at 20c8001300 has the same bytes as 7be06eb4cb, so the 16 re-taken scripts now name 20c8001300 as their source. Module suite 106 pass, 0 fail. Still blocked on J1 (the 64 rows and the uses edge), no change to that.

## J3 · REPORT

Confirmed: the pin is 20c8001300 (B2, commit 41fedd10b8 on job/T51/wizard-scripts): build-data.mjs and data.mjs, the generated files rewritten, --check green. Waiting on the rows from the UX-DESIGN HANDOFF and the CHANGE that carries them, and on the uses decision for the fixture (J1 item 2).

## J4 · QUESTION

QUESTION · B4 (the 48 rows) is done in commit 629d894a89 on job/T51/wizard-scripts: 46 sentences now read `word(key, vars)` (named placeholders from the row, the row's English wins). Suite 106 pass, 0 fail; format 0; architecture 0 (the fixture's uses edge is clean); coverage 44/44; ownership 0; setup-words --check matches.

One thing I could not do as B4 says: data.mjs:55 "Comment for the group" and data.mjs:59 "Update your group's Civicsmith" (B4 item 1 names them as rows to convert). They are not display text; they are match keys. LIBRARY_ADDED and LIBRARY_RETAKEN look up library entries by name in the vendored files at 3f40899950 and 4664e8efd4, and those files hold the old names ("Comment for the group", "Update your group's Civicsmith"). The rows are the current names ("Comment for the team", "Update your team's Civicsmith"). Converting them made the build fail ("'Comment for the team' is added but the file at 3f40899950 does not hold it"), so I put the literals back. The words check then shows exactly these 2 inline failures in my module.

Options, your ruling:
(a) Treat them as identifiers (K3971: a string the code compares is an identifier, not a localize sentence), and the words check exempts or accepts them.
(b) Let me match by the script id instead of the name (WIZ-f06504b9133b8d61 and WIZ-7de505135a9ecd4f; both ids are in the vendored files), so no name literal is needed. This changes adoptedLibrary's matching inside my module. I recommend (b): it removes the name from the code entirely and needs no exemption. I will do it on your word.

## J5 · COMPLETE

COMPLETE · T51-139 wizard-scripts. Head: the commit that carries this (job/T51/wizard-scripts).

Applied: R44 and B2 (registry, front doors, library at 20c8001300; pins in build-data.mjs and data.mjs); B3/B4 (the 46 sentences read by key, word(key, vars) with the row's English); B5 (adoption and addition match by script id: WIZ-f06504b9133b8d61, WIZ-7de505135a9ecd4f; no name literal in data.mjs); the fixture runs project-roster's migrate() (K4065; B4 item 2 ruled uses clean).

Checks on job/T51/wizard-scripts (merged tranche/T51):
- module suite: 106 pass, 0 fail
- words: 0 failures (inline 0, plain 0, testcopy 0, handlist 0; dev 8, unkeyed 7 as the design lists them)
- format 0 failures; architecture 0; coverage 44 of 44; ownership 0
- setup-words --check: rows.mjs matches words.json and the source
- checks/run.mjs over the whole product is red in other modules (answer-envelope architecture; coverage in affordances, agent-harness, agent-runner; testcopy and handlist in screens-investigate, screens-settings, screens-wizards, signin-door, tasks; words elsewhere). None of it is wizard-scripts. Reported, not changed (P7).
- Cross-module (K3986): the wizard script-name copies in screens-daily and screens-wizards test files belong to those jobs.

Size (session_0192jMRKKhCkVUkwJyJXBS3f): test runs 21, module lines 2674 (own code; the three generated files excluded).

## J6 · COMPLETE

COMPLETE · T51-139 wizard-scripts, after B6 (CHANGE, the design at 2a64c5ae77). Head: the commit that carries this (job/T51/wizard-scripts).

Applied B6: tranche/T51 merged; the registry at 2a64c5ae77 (77 screens, 442 acts: 287 declared, 132 function, 23 owed; the new act actionholdrelease on hold is registered); the pins in build-data.mjs and data.mjs moved; the doors and library regenerated (the library's content is unchanged, so the 16 re-taken scripts name 2a64c5ae77); counts re-pinned in t48, t50 and t51; the R44 test names 2a64c5ae77.

Checks on job/T51/wizard-scripts:
- module suite: 106 pass, 0 fail
- words: 0 failures (inline 0, plain 0, testcopy 0, handlist 0)
- format 0 failures; architecture 0; coverage 44 of 44; ownership 0 (no change to the module's paths in this round)
- setup-words --check: rows.mjs matches words.json and the source
- build-data.mjs --check: green

Size (session_0192jMRKKhCkVUkwJyJXBS3f): test runs 24, module lines 2674 (own code; the three generated files excluded).

## J7 · COMPLETE

COMPLETE · FR-46 / K4196 · R45 met (commit 782a0c9c4d on job/T51/wizard-scripts, pushed).

APPLIED
- Registry re-taken at 958d998ccb by `build-data.mjs` (SOURCES.registry, header): 83 screens, 554 acts (426 declared, 83 function, 45 owed). The six new screens bias, contradiction, objective, about-knocker, leads and watching are in SCREEN_REGISTRY, so interface-shell's checkScreens admits them. Vendored: `source/registry.json` is the new file; the old one kept as `registry-2a64c5ae77.json`. Every owed act stays R13's (carried in `owed`, registered as its op only once declared; none served).
- library.json did NOT change between 2a64c5ae77 and 958d998ccb (git diff empty; byte-identical to library-2a64c5ae77.json), so by R42's rule no script gets a new version and the front doors are unchanged (DOORS_SOURCE and LIBRARY_RETAKEN stay at 2a64c5ae77). `--check` green.
- Flaw fixed in my module: the new file lists `expertiseconfirm` twice on `members` (Confirm / Withdraw an expertise). The plane's release suite (screenFailures) fails "an act repeated". `screensFromFile` now carries an op once per screen (registeredScreens already did); the owed `at` index follows. Reported below as a design-file note.
- Tests: new `R45` in t51.test.mjs (pin, counts, the six screens with name/purpose/acts, library and doors unchanged, `--check`, one-byte control); R44's test now describes its own commit from the kept vendored copies; historic pins in library, t47, t48, t50 re-pointed to the current file (counts, the new screens, the owed set derived from the file, no hand-list of ops).

REPORT (other modules, for BOB; none is mine to change)
- interface-shell suite run after my change: 192 pass, 0 fail, 0 skipped (its R106 crumb arm now runs for the six screens).
- Reds that the new registry brings in other modules' suites (each waits for its owner in wave 2; none failed before my change):
  * op-declarations t50/R73 test 210: registryActGaps now lists 37 owed ops with no declaration (taskdecide, capturecredential*, declareorigin, rerunread, rerunpair, rerunstart, projectclose, citeimported, withdrawimported, casedetails*, importregrade, namedrequests, namedrequestset, sweepset, sweepratify and the rest of DEC-374 to DEC-383), screen by screen.
  * plane test 72 (R24): `screen.bias.purpose` (and the other new screens' name/purpose keys) are not yet in the words list; setup-words regenerates rows.mjs at the layer close.
  * screens-intake test 64 (R8): "capture draws capturerequestretry": the registry's capture acts are not all drawn yet.
  * affordances test 235 (t36:321, R57/R61): ACT_HELP does not hold the new acts' help yet.
- Design-file note: registry.json at 958d998ccb gives two acts on `members` the same op (`expertiseconfirm`); I carry it once. If the design means a second op for "Withdraw an expertise", it should say so.
- Not stale: no other module's generated artifact is made stale by this change except those that bundle the plane (bio-plane dist) and interface-assets/setup-words rows, regenerated by BOB at the layer close.

CHECKS
- module suite: 107 pass, 0 fail (tap). `build-data.mjs --check` green.
- checks: format 0 failures; architecture 0 failures; coverage 45 of 45 live ids named; words 0 failures (dev 8, unkeyed 7); ownership 0 failures (11 files). `setup-words build --check`: stale words-unreviewed.json note only (expected), no refusal naming my module.

Size (session_01WMjLF8CWtt2TqjEkixFjxh): test runs 14, module lines 2838

## J8 · COMPLETE

COMPLETE · B8 (K4197) applied on top of J7: registry, library and front doors re-taken at 840099da7c (R45 as amended); commit 0b06a8f9b5 on job/T51/wizard-scripts, pushed. Tranche merged first.

APPLIED
- build-data.mjs registry pin and `newer` list at 840099da7c; DOORS_SOURCE 840099da7c; LIBRARY_RETAKEN gains {840099da7c, BOB, 2026-10-20, K2241}. Vendored: registry.json and library-840099da7c.json new; registry-958d998ccb.json kept. Counts unchanged (83 screens, 554 acts); the registry change is a label ("Open the item" to "Mark it done"), not carried.
- Library: only WIZ-7db08189cc0e58c3 (Welcome a new member, step 4 wording, DEC-384) changed: it is now version 3 (source 840099da7c, approved BOB 2026-10-20 K2241), versions 1 and 2 kept whole. The doors are identical in content. `--check` green.
- Tests re-pinned to 840099da7c (registry, doors, library sources, welcome at version 3, T50's 16 gained scripts now 15 + welcome); R45 test extended (only welcome changed, its earlier versions, doors source). Module suite: 107 pass, 0 fail.

CHECKS: format 0; architecture 0; coverage 45 of 45; words 0 failures (dev 8, unkeyed 7); ownership 0 failures (15 files); `checks/run.mjs` whole-repo: format, architecture, words 0 failures; its 7 coverage failures are other modules' (not wizard-scripts).

REPORT (others' suites; none mine)
- interface-shell: 191 pass, 1 fail (new since the tranche merge, not from my change): test 32, R64, "promote: the weight's own name" expects 'Reasoned', gets 'Asks for a reason' (words.json changed in the design merge; rows.mjs stale until the layer close or the test reads the old word).
- Still red from J7, awaiting wave 2: op-declarations 210 (owed ops undeclared), plane 72 (new screens' words), screens-intake 64 (capture draws capturerequestretry), affordances 235 (ACT_HELP).
- screens-wizards 59/0, instance-setup 194/0, translations 32/0: green.

Size (session_01WMjLF8CWtt2TqjEkixFjxh): test runs 24, module lines 2840
