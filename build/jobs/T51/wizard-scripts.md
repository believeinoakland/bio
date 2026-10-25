# wizard-scripts (T51)

**Status** · session_019XFUSYv3eS4JuzAcTX5AsX · depth 2 · RUNNING until 2026-10-25T09:50:51Z (impact-set tests (plane, interface-shell, screens-wizards, queue-producers, translations)) · handled B21

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

## J9 · COMPLETE

COMPLETE · B9 (K4198) applied; supersedes J8's commit. Registry, library and front doors re-taken at 1cc4a957f0 (R45 as amended); commit 4511117260 on job/T51/wizard-scripts, pushed; tranche merged first.

- Pins, vendored files (registry.json, library-1cc4a957f0.json; library-840099da7c.json removed) and tests moved from 840099da7c to 1cc4a957f0. 83 screens, 554 acts. Only WIZ-7db08189cc0e58c3 (Welcome a new member) differs in the library, so it is version 3 (source 1cc4a957f0, BOB 2026-10-20 K2241), versions 1 and 2 kept whole; the doors are unchanged in content. `--check` green. expertiseconfirm carried once on members, as ruled.
- Module suite 107 pass, 0 fail. format 0; architecture 0; coverage 45 of 45; words 0 failures; ownership 0 failures (15 files).
- Others: interface-shell 191/1 (R64 test 32 'Reasoned' vs 'Asks for a reason', words change from the design merge, not mine); screens-wizards 59/0. Wave-2 reds from J7 unchanged (op-declarations 210, plane 72, screens-intake 64, affordances 235).

Size (session_01WMjLF8CWtt2TqjEkixFjxh): test runs 28, module lines 2840

## J10 · REPORT

**B10 entry 1 (K4204; R45 amended by FR-49): done, tested, pushed** (commit `13fd41af12` on `job/T51/wizard-scripts`).

- The registry is re-taken at `aa8bdcd0b4`, the newest design merge on `tranche/T51` (`60ff18e4b2`, "merge design … @ aa8bdcd0b4 (U419, DEC-386; K4204)"). `SOURCES.registry.commit` and the header in `build-data.mjs` name it; `source/registry.json` is the file at that commit.
- The library and the front doors are unchanged: `library.json` at `aa8bdcd0b4` is byte-identical to the one at `1cc4a957f0`, so `civicsmith-library.mjs` and `front-doors.mjs` are not rewritten. `build-data.mjs` changes `screen-registry.mjs` only, by two lines (`SCREEN_REGISTRY_SOURCE`).
- What the design changed in the registry: on `members`, the duplicate `expertiseconfirm` (the one the file listed twice, which B9 said to carry once) is gone, and `expertisewithdraw` (DEC-386) is an owed act there. Counts at `aa8bdcd0b4`: 83 screens, 554 acts (425 declared, 83 function, 46 owed); the owed ops are 42.
- `expertisewithdraw` is owed on `members` and is not served as an op until `op-declarations` declares it (R13); a test pins that.
- Tests: the suite `node --test bio-plane/test/m/wizard-scripts/*.test.mjs` is **108 pass, 0 fail**. The pins that named the current registry commit or its counts (library, t47, t48, t50, t51) now name `aa8bdcd0b4`, the counts above, and the owed-op count 42. The R45 control in t51 now flips `aa8bdcd0b4` (not `1cc4a957f0`). A new test in t51 names R45 amended (FR-49): the pin, `expertisewithdraw` owed on `members`, and the old pin no longer carried. The duplicate-act control in t51 now asserts the file lists `expertiseconfirm` once.
- Checks: `format` 0 failures; `architecture` 0; `coverage` 45 of 45 live ids for wizard-scripts; `ownership` 0 failures (9 files); `words` 0 failures across the product (`checks/run.mjs`).
- Not yet done: the census in entry 2 (K4202). See the QUESTION that follows.

## J11 · QUESTION

**B10 entry 2 (K4202, the census): BOB's ruling needed before I can finish it.** The rest of the job is done; this is the one part that waits.

What is stuck, op by op (from `build/plan/pass-T51/RECORD-C.md` and the words check):

1. **`writinghelp`**: already held in `op-declarations`' wizard-scripts family (`op-declarations/index.mjs` lines 481–483, `writinghelp: "ownread"`) and in `op-grades` (`index.mjs` line 1548; `marks.mjs` line 220). The door routes it (`store-door/dispatch.mjs` line 475, `wizardScriptsOf(ctx).writingHelp`) with the fields `op`, `field`, `told`, `draftHeld`. My reading: nothing new to declare in `DECLARED_OPS`; the door's route is the declaration. Recommend: confirm that, and I record it as declared by its owner rather than adding a second declaration. If you want a `DECLARED_OPS` entry in this module anyway, say so and I will write it with `accepts: [field, told, draftHeld]`, `requires: [field, told]`.
2. **`wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire`**: the words check's **testcopy** arm fails. `op-grades`' own test (`owners.test.mjs:118`) copies the start of the hand description these five share, so a repeated description in my declaration fails it. That test is op-grades', so I cannot change it here.
3. **`wizards`, `startfrom`**: no registry label key exists for them, and `wizard-scripts` is a drawn-screen module, so a `localize` call fails the **marker** arm and a raw sentence fails the inline arm.

Options, with my recommendation:
- (A, recommended) The design stream adds one description row per op (`wizard-scripts.declared.<op>`, seven rows), and the five drafting ops take their own rows, so the testcopy arm sees distinct text. I write the seven declarations against those keys, with the `declared-ops.test.mjs` the census asks for.
- (B) A ruling that the testcopy arm does not apply to the drafting ops in `op-grades`' test, so I may repeat the hand text. That is a change to another module's test, so it would go to that module's job.
- (C) Leave all eight undeclared for this round and carry them to the next tranche. Recommended only if (A) cannot land before T51 closes.

I have not written any declaration for these eight yet, so nothing is half-done in the module. Please answer which of A, B or C, and confirm item 1.

## J12 · COMPLETE

COMPLETE · FR-49 wizard-scripts (K4202, the census; B11 and B12). Head: c6dcda9ec2 (tranche/T51 merged in), pushed on job/T51/wizard-scripts. Code commit b6303a196f.

APPLIED
- B12 / K4202: `DECLARED_OPS` beside the ops map (src/wizard-scripts/index.mjs) for the eight ops: wizards, startfrom, writinghelp, wizarddraft, wizardrevise, wizardsubmit, wizardapprove, wizardretire. Class, machine classes and mutating flag are op-declarations' hand rows; weight is the op's grade; description is each op's `act.<op>.does` word (word(), no localize, no new row).
- B11 (K4210): NEW R46 written by me in build/requirements/wizard-scripts.md, no "not yet met" marker, since its tests now name it.
- Test: test/m/wizard-scripts/declared-ops.test.mjs, 18 tests: each row held true against the op as the door runs it (declaredOpHolds over the real fixture), each description equal to its act word, and a control that a required field the arm never reads is named.

DEVIATIONS FROM B12 (decided here, for BOB to confirm)
1. writinghelp requires `told` only, not `field` and `told`. The arm never refuses a missing field: writingHelp answers ASSISTANT_DRAFT_UNAVAILABLE with or without it, so a `field` requirement would be a claim the arm does not hold. `field` and `draftHeld` are accepted. If you want `field` required, the arm has to refuse a missing field first: a behaviour change, not made here.
2. wizarddraft requires a project, or `from`, or `copy`, not `name`: a blank start is refused WIZARD_SCOPE_REFUSED without a project; the arm's other paths do not need one.
3. wizardretire requires a version or a script, and a reason. wizardrevise, wizardsubmit and wizardapprove require their version (and wizardrevise its steps). A missing id answers NO_SUCH_WIZARD, one answer for version and script; the test reads that answer as naming the field it stands for.
4. Ruling entries for 1–3 belong in build/rulings.md; that file is outside this job's write set, so I have not written them. Please record them there.

REGISTRATION (the agreement checks, one op per process, `op-declarations` and `op-grades`)
- op-declarations: all eight agree (classes, machine classes, mutating). No op is declared by two owners, and none of the eight is in the product-wide duplicates list.
- op-grades: the weight agrees for all eight. DECLARED_OP_DISAGREES on the DESCRIPTION for ALL EIGHT: wizards, startfrom, writinghelp, wizarddraft, wizardrevise, wizardsubmit, wizardapprove, wizardretire. op-grades' hand sentences (index.mjs around 1523–1548 and 825–828; its `wizards` and `startfrom` in t34.mjs:73) differ from the act words. Those are op-grades' to fix (B12 item 2); please route it to its job as a CHANGE. I have not messaged op-grades' job.
- B12's testcopy point (owners.test.mjs:118): the current whole-product words run lists op-grades' testcopy findings at owners.test.mjs:84 and in its t36, t41, t46, t47, t48 and t49 tests; none is at :118 now, and none is in wizard-scripts.

DEFERRED: none.

FOUND IN OTHER MODULES (not changed, P7)
- op-grades: the description disagreements above; testcopy at owners.test.mjs:84, t36, t41, t46–t49.
- strength (bio-plane/src/strength/method.mjs:349): inline sentence.
- coverage, whole product: agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19; link-sweep R13 R14 R15 are named by no test.
- op-declarations' whole-product registration stops at `citeimported`: NEEDS_MISSING (R80), an op declared by another module, not mine.

CHECKS
- node --test bio-plane/test/m/wizard-scripts/: 126 pass, 0 fail (declared-ops 18 pass).
- format: 175 modules, 175 requirements files; 0 failures.
- architecture (wizard-scripts): 0 failures.
- coverage (wizard-scripts): 46 of 46 live ids named by a test (R46 included).
- ownership (wizard-scripts): 1 failure, build/requirements/wizard-scripts.md, outside the module's paths. B11 accepts that listing at your merge.
- checks/run.mjs (whole product): words 0 findings for wizard-scripts' files; the other findings are listed above and are not this module's.

Size (session_01AYSJWKsStw1JQe2TLgDQwt): test runs 5, module lines 2701

## J13 · COMPLETE

Re B13 (CHANGE, K4227). Done and pushed on job/T51/wizard-scripts (commits d943943a89, 0467eb7804). `tranche/T51` merged first (fast-forward of its K4227 commits, ed9d7a119b).

**Applied**
- `DECLARED_OPS.writinghelp` (R46): `fields` is now `accepts: ["op", "field", "told", "draftHeld"]`, `requires: ["op", "told"]`. The arm (`writingHelp`) reads the body's `op`; without it, `writingHelpAt` answers `WRITING_HELP_REFUSED`.
- Checked the other seven rows against their arms through the door (`declaredOpHolds`): `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire`, `startfrom`, `wizards` all hold, none needed a change.
- `declared-ops.test.mjs`: the writinghelp call now passes the body's `op` (it had hard-coded `casenote`, so the missing op was never seen). A refusal naming `op` is recognised by the answer's echo of the missing `op` as `null` (the arm's `asked`). New control `R46 control: a writinghelp body without op is refused naming it`.

**Not applied: R46's requirement wording.** The requirements file is outside this job's paths (`checks/ownership.mjs` refused it), so I reverted my edit in 0467eb7804 rather than widen the job. BOB, please amend R46's line (K4210) to read, in place of "`writinghelp` requires `told` (its arm never refuses a missing `field`)":
> `writinghelp` accepts `op` and requires `op` and `told` (its arm refuses a body without `op`, naming it, and never refuses a missing `field`; K4227, K4210)

and add to its control sentence: "; a `writinghelp` body without `op` is refused naming it."

**Observation for BOB (not changed):** the `wizards` row declares `state` as an accepted field, but its arm reads `state` from the query string (`q("state")`), not the body. The declared-ops test passes, since it only checks requires and refusals. Whether the door also carries body fields to it is for the door's owner to say; I did not change the row.

**Checks** (from `civicos-process`, product `/home/user/bio`)
- `node checks/format.mjs`: 175 modules, 175 requirements files; 0 failures
- `node checks/architecture.mjs wizard-scripts`: 48 product files, 93 relative imports; 0 failures
- `node checks/coverage.mjs wizard-scripts`: 46 of 46 live ids named by a test; 0 failures
- `node checks/ownership.mjs wizard-scripts tranche/T51`: 2 files changed by wizard-scripts; 0 failures

**Tests**
- `node --test bio-plane/test/m/wizard-scripts/declared-ops.test.mjs`: 19 pass, 0 fail
- `node --test --test-reporter=tap bio-plane/test/m/wizard-scripts/`: 127 pass, 0 fail, 0 skipped

**Deferred:** none.

Size (session_013WdFBpJB3QxNd3fyYaBmQF): test runs 2, module lines 14

## J14 · COMPLETE

B14 (CHANGE, K4231) applied in commit 67a1f9d926 on job/T51/wizard-scripts (tranche/T51 merged first, at cbbe26555f).

DONE
- DECLARED_OPS.wizardrevise: requires ["version", ["steps", "adopt"]]. accepts already holds adopt, so it is unchanged.
- Every row rechecked against its arm's every path:
  - wizards: no required field; the arm reads only state. Holds.
  - startfrom: no required field; message and parts are both optional. Holds.
  - writinghelp: requires op and told (B13). Holds.
  - wizarddraft: [project | from | copy]. Every valid path carries project or from (a blank, recorded or copy start needs project; a from needs from). Holds. Loose by one case: a copy with no project passes the guard, and the arm refuses it naming the project (a scope refusal). No valid call is refused, so I left it; tightening to [["project", "from"]] is a one-line option if Bob wants it.
  - wizardrevise: version always; steps or adopt (steps alone, adopt alone as a proposal id or as {base}, or both). Fixed as above.
  - wizardsubmit, wizardapprove: version always (the arm resolves only a version). Holds.
  - wizardretire: reason always (both the script and the version paths refuse without it); script or version (either names the script). Holds.
- Control: declared-ops.test.mjs gains "R46 control: wizardrevise with adopt and no steps is not refused: the proposal's steps are the revision". It adopts a machine proposal through the door with no steps and asserts ok, the adopted id, and no refusal naming steps. The harness's base case only ever sends steps, so this is the only check of the adopt path.

R46 WORDING (for Bob to place): in R46's sentence on the declarations, after the `wizarddraft` clause, add: "`wizardrevise` requires a version and either steps or `adopt` (its arm takes a proposal's, or a copy base's, steps whole when no steps are sent; K4231)."

TESTS AND CHECKS
- node --test test/m/wizard-scripts/declared-ops.test.mjs: 20 pass, 0 fail.
- node --test "test/m/wizard-scripts/*.test.mjs": 128 pass, 0 fail.
- node --test test/m/screens-wizards/library.test.mjs (the file B14 names): 12 pass, 0 fail.
- checks/format.mjs /home/user/bio: 175 modules, 175 requirements files, 0 failures.
- checks/architecture.mjs /home/user/bio wizard-scripts: 48 product files, 0 failures.
- checks/coverage.mjs /home/user/bio wizard-scripts: 46 of 46 live requirement ids named by a test, 0 failures.
- checks/ownership.mjs /home/user/bio wizard-scripts tranche/T51: 1 file changed by wizard-scripts, 0 failures.

DEFERRED: none.
FOUND IN ANOTHER MODULE: none new.

Size (session_014e6RbaKdqhKwbmmyknKp2v): test runs 3, module lines 2701 (own code, build-data.mjs included, the three generated files excluded: civicsmith-library.mjs, front-doors.mjs, screen-registry.mjs). The four checks ran in addition to the three test runs.

## J15 · COMPLETE

COMPLETE for CHANGE B16 (replaces B15): the registry is re-taken at the design commit 09fbb247eb (R41). Pushed at 1f0c95222f on job/T51/wizard-scripts, after merging tranche/T51 (fa8d8a4e84).

APPLIED
- source/registry.json is the design file at 09fbb247eb (83 screens, 556 acts: 427 declared, 83 function, 46 owed). The previous file is kept as source/registry-aa8bdcd0b4.json.
- build-data.mjs pins 09fbb247eb; screen-registry.mjs regenerated (the only generated file that changed). civicsmith-library.mjs and front-doors.mjs are unchanged; build-data.mjs --check passes.
- Current-pin and current-count assertions in library, t47, t48, t50 and t51 moved to 09fbb247eb and 556 acts. Historical test titles keep their history.

REGISTRY DIFFERENCES FROM THE PREVIOUS COMMIT
- person: gains linewithdraw. screens-investigate does not draw it yet (the held act).
- docket: gains writinghelp. screens-publish does not draw it yet.
- start-send: loses release. screens-action draws no release on it, so nothing to change there.

SCREENS WHOSE ACTS DIFFER FROM WHAT THEIR MODULE DRAWS (now, across the nine screen modules; every other screen agrees)
- person (screens-investigate): linewithdraw declared, not drawn.
- docket (screens-publish): writinghelp declared, not drawn.
- home, queue (screens-daily): release and filingapprove declared, not drawn.
- join (screens-entry): memberlanguageset declared, not drawn.
- document (screens-inquiry): captureprogressions declared, not drawn.
- assistant (screens-inquiry): ask declared, not drawn.
- timeline (screens-investigate): instance and progression declared, not drawn.
- explore (screens-investigate): draws stepsourcewithdraw, which the registry does not name.
The first two are new from this re-take; the rest were already there at aa8bdcd0b4.
Owed acts drawn by a module are not listed: checkScreens admits them.
Registry screens no nine-module screen draws: site, install, update, more, unavailable (served elsewhere, not checked here).

TESTS AND CHECKS
- wizard-scripts suite: 128 pass, 0 fail (node --test test/m/wizard-scripts/*.test.mjs).
- interface-shell suite: 243 pass, 0 fail (node --test test/m/interface-shell/*.test.mjs), including checkScreens over the composed screens.
- format: 175 modules, 0 failures. architecture (wizard-scripts): 0 failures. coverage: 46 of 46 live ids named, 0 failures. ownership against tranche/T51: 10 files, 0 failures.

DEFERRED: none.


Size (session_01PZ9Gu5FRgJY1fJyGfYx9Tz): test runs 5, module lines 2865

## J16 · REPORT

REPORT · B17 (fix round 2, K4311): what the re-take of the registry at 0310c4953d brings in other modules' suites. Nothing in another module was changed (P7).

The new registry holds seven acts that other modules do not yet draw or mark. Their suites now fail; each waits for its owner's job in fix round 2 (wave 1 or 2 in build/plan/fix-round-2-T51.md):
- op-grades R42 and R46 (2 failures): `capturerequests`, `casedrafts` and `contradictionflag` have no mark in MARKS. For op-grades' job.
- screens-intake R8 (1): capture does not yet draw `capturerequests`. For screens-intake's job (wave 2).
- screens-publish R10 (1): case-editor does not yet draw `casedrafts`. For screens-publish's job (wave 2).
- screens-inquiry R10 (entry 25 and document), R5 R14 to R41 (3): project does not draw `heldcaptures`; document does not draw `resolvetestify` or the owed `contradictionflag`. For screens-inquiry-2's job (wave 2).

Failing on the tranche tip as well (run on a clean worktree of origin/tranche/T51 before my commit), so not from this change: store-door R17 (groupdescriptiondraft), interface-shell R23 (a place name in the shell's program text), screens-settings R39 (screen.bias.adoptfor.label is a key the module reads), plane R24 (screen purpose words).

Dependencies: journey-check failed only for lack of node_modules (playwright-core); I ran `npm ci` in bio-plane/src/journey-check, as the START requires. Its suite then gave 72 pass, 7 fail, all in the local-arm journey walks and one words row for "group".

REQUIREMENT FOR BOB (K4311): R47 is in my test file and not yet in build/requirements/wizard-scripts.md, because that file is outside this job's paths. Proposed text, for Bob to write or to tell me to write:
"R47 (T51 fix round 2; K4311; DEC-394; amends R45) The registry is re-taken at `0310c4953d`. SCREEN_REGISTRY_SOURCE becomes `0310c4953d` (the design commit DEC-394 merged into tranche/T51 by K4311): 83 screens and 563 acts (433 declared, 83 function, 47 owed; 43 owed ops). The acts DEC-394 draws are registered on their screens (casedrafts on case-editor, ceremony and review-copy; heldcaptures on project; capturerequests on capture; resolvetestify on document), and its owed contradictionflag is carried apart on document (R13). capture's three owed capturecredential acts are unchanged. The earlier file is kept beside the carried one. Test: t51.test.mjs (R47): the pin, the counts, the named acts, the owed set, and a changed generated registry fails --check."

## J17 · COMPLETE

COMPLETE · B17 (fix round 2, K4311) · wizard-scripts. Head: the commit that carries this (job/T51/wizard-scripts), on top of tranche/T51 (merged first).

CAUSES: CAUSES.md names no CODE cause in wizard-scripts. Its one line (S-15, the welcome wizard's six side-trip steps) is WORDS, deferred to T52's later-ux.md. The job's work is the mechanical entry only (R47).

APPLIED
- The registry re-taken at 0310c4953d (DEC-394). source/registry.json is that file (sha256 e63249fe1ab5cad5...); the earlier one is kept as registry-09fbb247eb.json. build-data.mjs pins 0310c4953d (SOURCES.registry, header). screen-registry.mjs is regenerated: the only generated file that changed. The library and the front doors are unchanged; build-data.mjs --check is green.
- Counts: 83 screens, 563 acts (433 declared, 83 function, 47 owed; 43 owed ops). Before: 556 acts (427, 83, 46).
- Added acts (7): capture: capturerequests (declared; capture-requests, op-declarations). document: resolvetestify (declared; entities, op-declarations) and the owed contradictionflag (DEC-394; carried apart, R13). project: heldcaptures (declared; capture). case-editor, ceremony, review-copy: casedrafts (declared; op-declarations, review). capture's three owed capturecredential acts were already owed at 09fbb247eb and are unchanged.
- No census op of this module's is added; DECLARED_OPS (R46) is unchanged. No sentence of this module changed.
- Tests: R47 added to t51.test.mjs. Written first and seen failing (the pin still 09fbb247eb). Older pins that described the previous commit re-pinned in library, t47, t48, t50 and t51 (counts, owed ops 43, t50's owed set 39). The R47 control: a flipped pin in the generated file fails --check.
- Requirement text: R47 is not in build/requirements/wizard-scripts.md (outside this job's paths). Its proposed text is in the REPORT (J16) for BOB to write or to tell me to write.

CHECKS (job branch)
- node --test bio-plane/test/m/wizard-scripts/: 129 pass, 0 fail.
- build-data.mjs --check: green.
- checks/format: 0 failures. checks/architecture: 0 failures. checks/words (whole product): 0 inline, plain, testcopy, missingkey or handlist findings. checks/coverage: wizard-scripts' live ids all named; the product has 11 coverage failures, none in wizard-scripts. checks/ownership (wizard-scripts, tranche/T51): 10 files, 0 failures.

IMPACT (build/plan/impact.mjs origin/tranche/T51 HEAD names 26 other modules; run at two at once; baselines on a clean worktree of origin/tranche/T51)
- Pass: pdf-worker, tasks, queue-producers, queue, translations, affordances, op-declarations, admission, answer-envelope, signin-door, instance-setup, screens-entry, screens-wizards, screens-daily, screens-investigate, screens-action, control-plane (314).
- Caused by the new acts (their modules do not yet draw or mark them; owners' jobs in the fix round): op-grades R42 and R46 (2); screens-intake R8 (1); screens-publish R10 (1); screens-inquiry R10 entry 25 and document, R5 (3). Detail is in the REPORT (J16).
- Failing on the tranche tip as well: store-door R17, interface-shell R23, screens-settings R39, plane R24.
- journey-check: first failed only for lack of node_modules; I ran npm ci in bio-plane/src/journey-check (the START's rule). Then 72 pass, 7 fail: R1(a), R9, R10, R11, R17, R20 and the R20 control. The local arm's first failure is the installer's Cloudflare step ("page.waitForURL: Timeout 180000ms"). The clean baseline fails at file level (journey.test.mjs, plus R17), so I cannot show the local-arm failures are pre-existing. They look environmental, not from the registry, but it is not established. A re-run by the JOURNEYS lane, or on biosmoke8, would settle it.

DEFERRED: none of the job's own work. The other modules' reds are reported, not changed (P7).

Size (session_01JThqS87JjBveokSN6hH16A): test runs 39, module lines 2701 (own code: the .mjs files under bio-plane/src/wizard-scripts/, the three generated files excluded)

## J18 · COMPLETE · re B18

COMPLETE · B18 (ANSWER to J16) · wizard-scripts, fix round 2. Head: c9131f7289 on job/T51/wizard-scripts (pushed). It supersedes J17: tranche/T51 is merged in (merge d513b205e4); R47 is now met.

DONE, as J17 says: the registry re-take at 0310c4953d (commit 95cec52e08 before the merge); the 7 added acts; the pins and the R47 test. The R47 marker is removed (c9131f7289), since its tests name it and pass, as R46 did.

CHECKS on the merged head
- node --test bio-plane/test/m/wizard-scripts/: 129 pass, 0 fail.
- build-data.mjs --check: green. checks/format: 0 failures. checks/architecture: 0 failures. checks/coverage (wizard-scripts): 47 of 47 live ids named, R47 among them.
- checks/words (whole product): 0 failures. checks/ownership (wizard-scripts, tranche/T51 to HEAD): 0 failures.
- Impact (J17): the reds in other modules are as J16 reports; I changed none of them. The journey-check first failure was missing node_modules; npm ci was run in bio-plane/src/journey-check.

Size (session_01JThqS87JjBveokSN6hH16A): test runs 40, module lines 2701 (own code, the three generated files excluded)

## J19 · COMPLETE

COMPLETE · fix round 2, cause 1 (registry re-take at 654a735535, DEC-396, U431). Commit 660410cedd on job/T51/wizard-scripts (merged tranche/T51 first).

APPLIED
- SCREEN_REGISTRY_SOURCE and SOURCES.registry move to `654a735535` (`build-data.mjs`, `screen-registry.mjs` regenerated: the only generated file that changed; library and front doors unchanged). The vendored `source/registry.json` is the file at 654a735535 (83 screens, 563 acts: 434 declared, 83 function, 46 owed, 42 owed ops). The file it replaces is kept whole as `source/registry-0310c4953d.json`.
- `contradictionflag` is a declared act on document (no owed row) and is no longer carried apart.
- Tests: new R48 in `t51.test.mjs`, seen failing first (red at the pin). R47's test now reads the kept file at 0310c4953d; R45, R47, R48 and the pin and count assertions in library, t47, t48, t50 name the carried pin and counts. Historic claims are unchanged except where they described the carried file.

DEFERRED: none.

FOUND IN OTHER MODULES: none turned red by this change. Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): 27 modules, 546 test files. I ran the 545 bio-plane files and the one pdf-worker file. All pass on my branch except 104 tests in 23 files (journey-check, store-door, screens-settings, screens-publish, screens-intake, screens-inquiry, plane, op-grades, affordances). The same 104 fail at origin/tranche/T51 (worktree run of those 23 files: identical failing titles). These reds are on the tranche tip and are named, not fixed: op-grades R17, R42, R46 (and t48, t50); journey-check (walker, journey, live, dec340, pseudo, design29, group, names, frames, words, own-reading); plane release and r42-entry; affordances catalogue; screens-inquiry fr28; store-door declared-ops.

FOR BOB TO WRITE (build/requirements/wizard-scripts.md), after R47:
- **R48** (T51 fix round 2; U431, DEC-396; amends R47) The registry is re-taken at `654a735535`. SCREEN_REGISTRY_SOURCE becomes `654a735535`: 83 screens and 563 acts (434 declared, 83 function, 46 owed; 42 owed ops). `contradictionflag` is a registered act on document and no longer carried as owed. The earlier file is kept whole beside the carried one at `0310c4953d`. Test: the pin, counts and owed set; `--check` passes on the committed files; control: a one-byte change to the generated registry fails it.

TESTS AND CHECKS
- Module suite: `node --test --test-force-exit bio-plane/test/m/wizard-scripts/*.test.mjs`: 130 tests, 130 pass, 0 fail.
- `build-data.mjs --check`: passes ("match their sources").
- format: 175 modules, 0 failures. architecture (wizard-scripts): 0 failures. coverage (wizard-scripts): 47 of 47 live ids named, 0 failures (R48 is named by a test; BOB writes its line). ownership vs tranche/T51: 0 failures. words (wizard-scripts): 0 failures.
- Impact run as above.

Size (session_01HJALQNVYJCEBKqDywwPMoe): test runs 9, module lines 2865

## J20 · REPORT

REPORT · reds after the registry re-take at 43379a1a44 (job head 0ace868859)

1. `interface-shell` R1–R6 (R21, R38) turns red, and it is caused by this job's registry change. `request` now registers `entitycreate` (DEC-402), but the `screens-action` screen does not yet serve that act. Owner: `screens-action` (its C64 half: "Name the office yourself" and `entitycreate` in request's acts). It stays red until that job lands. I changed no other module.

2. Not verified against the tranche tip, and not touched by this change: `plane/release` R24 (`screen.objective.purpose` is not in the words list; objective is a screen from the 1cc4a957f0 registry) and one `store-door` declared-ops test (`groupdescriptiondraft` as a hand row disagrees with op-grades' owner row, K4247 / op-grades R49). Owners: `op-grades` and the words owner. Named, not fixed.

3. `journey-check` (journey.test, group.test: 14 tests) fails in the live-instance and browser walks. It ran after `npm ci` in bio-plane/src/journey-check. Not verified against the tip; the walk needs a live instance. Named, not fixed.

4. Cleared in this job: `screens-wizards` (3 tests). My first small-2 change dropped `state` from the body the screen sends. Fixed at 0ace868859: the arm reads state through `pick` (body, then query) and the declaration accepts it.

Proposed line for BOB to write (R49, T51 fix round 3; C64; DEC-401, DEC-402; K4356; amends R47, R48): The registry is re-taken at 43379a1a44: SCREEN_REGISTRY_SOURCE becomes 43379a1a44, 83 screens and 564 acts (435 declared, 83 function, 46 owed; 42 owed ops); `request` registers `entitycreate`. The earlier file is kept whole beside the carried one at 654a735535. Test: the pin, the counts, `request` lists `entitycreate`, and `build-data.mjs --check` passes; a one-byte change to the generated registry fails it.

## J21 · COMPLETE

COMPLETE · fix round 3 of T51, wave 1 (job head 0ace868859 on job/T51/wizard-scripts, merged tranche/T51 first).

CAUSES MET
- C64 (its part): the registry re-taken at 43379a1a44 (DEC-401, DEC-402). Test R49 (new; the line is proposed in the REPORT above for BOB to write): seen failing first (the pin), with a control (a one-byte change to the generated registry fails --check). The carried file is at 43379a1a44 (83 screens, 564 acts: 435 declared, 83 function, 46 owed; 42 owed ops). The earlier file is kept whole as source/registry-654a735535.json. Only screen-registry.mjs changed among the generated files; the library and the front doors are unchanged. build-data.mjs --check passes.
- Small 2 (K4230, K4208): the declaration census test (R46) seen failing first. The screen sends state in the body and the arm read it from the query only, so the picker was broken; the first fix (drop the field) broke screens-wizards. Corrected at 0ace868859: the arm reads state through pick (body, then query); the declaration accepts state; the tests cover the body and the query, with the query control.

TESTS AND CHECKS
- Module suite: node --test --test-force-exit bio-plane/test/m/wizard-scripts/: 134 tests, 134 pass, 0 fail.
- Pins and counts in library, t47, t48, t50 and t51 repointed to 43379a1a44 and 564/435 (carried-file claims only; historic claims read their kept files).
- Impact (build/plan/impact.mjs origin/tranche/T51 HEAD): 27 modules, 519 test files. Run once, interrupted by the background limit (1746 tests), then rerun in full at 0ace868859's predecessor: 4614 tests, 4591 pass, 21 fail. The 21 are: screens-wizards (3, my bug, fixed; re-run green); screens-action contract (interface-shell R1–R6, caused by entitycreate on request, see REPORT item 1); plane/release R24 and a store-door declared-ops test (not verified against the tip, see REPORT item 2); journey-check (14, live walks, see REPORT item 3).
- checks/run.mjs: architecture 0 failures; words 0 failures; coverage: wizard-scripts is not among the failures; format: one failure, build/rulings.md:4346 (BOB's file, not this job's). ownership (tranche/T51 to job/T51/wizard-scripts): 13 files, 0 failures.
- journey-check dependencies installed (npm ci in bio-plane/src/journey-check, not committed).

DEFERRED: none.

FOUND IN OTHER MODULES: screens-action (its C64 half: request's entitycreate act is not served by the screen) and op-grades / the words owner (REPORT items 1–2); journey-check (REPORT item 3). I changed none of them.

WORDS: no new member-facing sentence.

Size (session_015FfhtgWHE6mdMnqa5TBkFo): test runs 10, module lines 2569

## G53 · WIZARD-SCRIPTS #24 · work record (fix round 6; K4694, K4699)

Merged tranche/T51 first (6eb35d19b8). Entry: G53 in `build/plan/fix-round-6-T51.md`, merged first of its three owners (wizard-scripts 141, op-declarations 153, interface-shell 159).

**Cause (R-FOUR).** `bio-plane/src/wizard-scripts/build-data.mjs:29` (`SOURCES.registry.commit`) stood at `43379a1a44` (R49) while the design's `registry.json` on the tranche is DEC-419's (`f72b2f8a4c`). `interface-shell` `checkScreens` (index.mjs:197-215) admits a page's act only when the generated registry holds it. **Why tests missed it:** the screens' contract tests read the design file, which was green; the shell reads the generated copy; nothing compared the vendored/generated registry with the design file on the tranche. **Gap fixed:** `t52g53.test.mjs` asserts the vendored `source/registry.json` equals `docs/development/ux-substrate/screens/registry.json` byte for byte, and that the generated `SCREEN_REGISTRY_SOURCE.sha256` names that file. Seen red first (all three R50 tests failed before the re-take), green after.

**Built.**
- `SOURCES.registry.commit` is `f72b2f8a4c`; `source/registry.json` is the tranche's file; the old one kept whole as `source/registry-43379a1a44.json`; `screen-registry.mjs` regenerated (only generated file that changed; the library and the front doors are unchanged: `--check` green, `library.json` is byte-identical to `library-1cc4a957f0.json`).
- Counts at `f72b2f8a4c`: 84 screens, 609 acts (448 declared, 83 function, 78 owed; 62 owed ops, 58 without the installer's four). The diff 564 to 609 adds acts only, and one screen, `registers` (declared `search`, `explore`); every act registered at `43379a1a44` is still registered (tested).
- Pin sites moved (found: all as BOB listed, plus these): `t50:26` `REG_COMMIT`, `t50:113/118/130/126/186` (84 screens; 62 owed ops, 58 net of the installer's four; `registers` among the screens new since R38), `t51:33/37-38/42/79/92/119-120/124-125/141`, `t51fr3:29-32/52`, `library.test:83/85/149/154`, `t47:64/66`, `t48:98/103-105/108`. The one-byte arms (`t51:79,141`, `t51fr3:52`) now flip `f72b2f8a4c`, so they test something.

**Through the door (note 6), scratch worktree never committed** (my head + `origin/job/T51/screens-action` at f9656cfc0c): `checkScreens` admits `projectjoin` on `start-send`, `request` and `action`, and refuses it on `docket` (control). control-plane and plane impact files (126 files): 746 tests, 745 pass, 1 fail: plane `release` R24 (accepted). The scratch worktree is removed.

**Census (note 7).** Newly registered declared/function ops between the two files: `scanmirror` (security) and `officeconfirm` (places); both are already used by shipped modules (screens-settings, file-safety) and `registryActGaps` names no gap for them. The 31 newly owed T52 ops (`registersearch`, `followfrom`, `explore*`, `register*`, `alertconnect`, `installcheck`...) show as gaps in op-declarations `t50:391` until 44b merges (its `OWED_BY_FIX_ROUND`). No op's accepted keys change; `DECLARED_OPS` unchanged.

**Tests and checks.**
- Module suite: 137 tests, 137 pass, 0 fail (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/wizard-scripts/`).
- Impact set (`build/plan/impact.mjs origin/tranche/T51 HEAD`, 27 modules), one process at a time: control-plane and plane in the scratch tree as above; the other 24 modules (453 files) in my tree: 4287 tests, 4280 pass, 4 fail, all expected, none mine: screens-action `contract.test.mjs:34` (G52, held until G53 merges: green once this merges, per the scratch run), interface-shell `t50:32` and `fixround4:17` (`RE_POINTS.security` still lists `scanmirror`: 44c), op-declarations `t50:391` (the owed T52 ops: 44b). journey-check was not run (live walks; accepted-by-name set unchanged by this diff).
- checks/run.mjs: format 0, architecture 0, coverage 0 (6686 of 6686), channels 0, words 1 failure: `case-checker/spec.mjs:11` inline 1 (accepted by name). ownership (tranche/T51 to job/T51/wizard-scripts): 12 files, 0 failures. `setup-words/build.mjs --check` not run: no words, no word row changed.

**Proposed requirement line for BOB to write (R50), amending R49:**
- **R50** (T51 fix round 6; G53; DEC-419; K4393, K4691; amends R49) The registry is re-taken at `f72b2f8a4c`: `SCREEN_REGISTRY_SOURCE` becomes `f72b2f8a4c`, 84 screens and 609 acts (448 declared, 83 function, 78 owed; 62 owed ops); `start-send`, `request` and `action` register `projectjoin`; the new screen `registers` is carried (its declared acts `search`, `explore`). The earlier file is kept whole beside the carried one at `43379a1a44`. The library and the front doors are unchanged. Test: the vendored `registry.json` equals the design's `docs/development/ux-substrate/screens/registry.json` on the tranche byte for byte, so a design merge that moves the registry fails until it is re-taken; the pin, the counts, `projectjoin` on the three screens, every act of `43379a1a44` still registered, and `build-data.mjs --check` passes; a one-byte change to the generated registry fails it.

**Deferred:** none. **Found in other modules:** none beyond the 44b/44c reds above. **Words:** no new member-facing sentence. Declarations: no census op changed.

Size (session_01H5ogzKbBJfic7Cqb8K8bF6): test runs 14, module lines 2866

## J22 · COMPLETE

COMPLETE · G53 (fix round 6): registry re-taken at f72b2f8a4c (84 screens, 609 acts: 448 declared, 83 function, 78 owed), vendored file equals the tranche's design file (commit-equality test t52g53, seen red then green), projectjoin admitted by checkScreens on start-send/request/action (scratch tree with screens-action merged: control-plane+plane 745/746, only plane release R24 accepted). Module suite 137/137. Impact: other reds are 44b/44c's and G52's held contract.test:34 only. Library and doors unchanged. R50 text proposed in my record. Checks: format/architecture/coverage 0, ownership 0, words only case-checker inline 1. Size (session_01H5ogzKbBJfic7Cqb8K8bF6): test runs 14, module lines 2866

## K5046 (c) · WIZARD-SCRIPTS #25 · work record (fix round 10, Wave A batch 1; B22)

**Entry.** `ADMIN_ACTS` and `ADMIN_SCREENS` move to this module (R51 names both; no QUESTION needed).

**Built.**
- `bio-plane/src/wizard-scripts/admin.mjs` (new): both constants copied verbatim from `interface-shell/index.mjs:93,163` (names, members, order, `Object.freeze`, requirement ids in the comments); exported from `index.mjs`. interface-shell keeps its pair until its Wave B job deletes it and imports these.
- `startFrom` still takes the acts and screens as the plane hands them in `wizardRegister` (`adminActs`, `adminScreens`; R51: "the plane's registration hands both at start"). I did not default the registration to these constants: R40's test ("with no administrator acts registered nothing is withheld, and the registration reads the acts from what it is given, never a list of its own") forbids it. The plane's wiring re-points to the exported pair in its own job.
- `bio-plane/test/m/wizard-scripts/fixtures.mjs` (new): `noSuchWizard()`, the real `wizardRead` refusal for an unknown id, made when called.
- `bio-plane/test/m/wizard-scripts/r51.test.mjs` (new, 4 tests): both sets equal the 45 names / `updates` and are frozen; a line naming `bio-plane/src/interface-shell/index.mjs`'s pair and comparing it (the Wave B job deletes this test with its pair); `startFrom` with the real constants omits the setup script for a plain member and lists it for an administrator; `noSuchWizard` is `NO_SUCH_WIZARD`.

**Fixtures.** `node checks/fixtures.mjs . wizard-scripts --list`: 1 line left, `writing-help.test.mjs:217` `LIMITS_UNREADABLE` (FIX-E, provider `answers`, arrives as a CHANGE). `fixtures-own` / `fixtures-generic` markers added: none. `noSuchWizard`'s user (screens-wizards `fixtures.mjs:55`) re-points in its own job.

**Words.** No new member-facing sentence; nothing for UX-DESIGN.

**Found in another module / generated artifact (REPORT).** `t52g53.test.mjs:30` (R50, "the vendored registry.json is the design's registry.json on the tranche, byte for byte") fails on `origin/tranche/T51` as merged, with and without my change (verified on a clean stash): the design's `registry.json` now carries owed `installregion K4746` and `installaddress K4937` that `source/registry.json` lacks. This is the registry's generated copy going stale after a design-files merge; the re-take (`build-data.mjs`, new counts in R41/R50 and the pin sites) is not in this entry, so I left it. BOB to decide whether it goes in this job.

**Deferred:** none of mine.

**Tests and checks.**
- Module suite: 141 tests, 140 pass, 1 fail (the t52g53 R50 failure above, not mine); r51: 4/4.
- format: 178 modules, 0 failures. architecture: 98 relative imports, 0 failures. coverage: 51 of 51 live ids named, 0 failures. ownership (tranche/T51..HEAD): 1 file changed by the module before my commit counted, 0 failures.
- impact (`impact.mjs origin/tranche/T51 HEAD`): 26 of 178 modules; the change adds exports only, so I ran the direct users' tests (see below).
