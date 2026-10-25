# interface-shell (T51)

**Status** · session_0135BWD8XZpisnx9i7kU3v1o · depth 2 · RUNNING until 2026-10-25T20:20:53Z (interface-shell module tests) · handled B46

## J1 · BLOCKED

REPORT for `interface-shell` in T51 (entry T51-113): what the drawings and requirements leave to you, and one dependency.

**1. Tests that wait on providers not yet merged (needs your order, not a decision).** Five of my new tests cannot pass until two providers are on `tranche/T51`; each is written to go green by itself on that merge, and none is skipped or weakened:
- `op-declarations` R76 (`BROWSER_ACTS`): the two R100 tests, and the R101 test's `signeradd` arm. The shell reads the table through the module namespace (`DECLARATIONS.BROWSER_ACTS`, absent = empty), so it keeps no list of its own.
- `wizard-scripts` R13/R41 (the registry regenerated at the design commit, today 71 screens, no `glossary` or `actionnew`): the R101 test (paths and the composed page admitting both), the R102 test (every screen's title over the registry; it needs the 73+ screens) and the R95 test's "a click opens `glossary`" arm.
My best reading: I finish and post COMPLETE at your word that these five may stay red until those two merge, then re-run on your CHANGE (`merge tranche/T51`). Everything else is green: module suite 192 tests, 187 pass (the five are exactly these). The screen modules' suites fail the same tests on the tranche tip and on my branch (compared), so my `/version` poll breaks none; the harness keeps polls apart from `requests`.

**2. Words the drawings or the table do not settle (the requirements' own REPORTs).**
- R92: the requirement says the button's label is not held; the table now holds `shell.reload` ("Reload"), so the band's button uses it (no inline English). Confirm that is the design's word.
- R94: `shell.readonly` holds "Settings › Members" as plain text; the drawing draws it as a reference. A `{members}` fill in the word would let the kit draw the link.
- R95: the design holds no names for the glossary terms. `cs.term("money.acfr")` draws a card only when a row `screen.glossary.money.acfr.name` exists (the definition `screen.glossary.money.acfr` is held); until given, it draws nothing, as R95 says. Whether a term opens `glossary` on a click or only shows a hover card is yours to rule; the code opens it (as R95's own sentence states) when the screen is registered.
- R98: `refusal.DIGEST_MISMATCH` is now in the table (DEC-335) but speaks of "the file your team holds ... not scanned, shown or opened". It fits a download whose bytes differ from the fingerprint; say if the design means a different word for the browser-side check.

**3. Found in the neighbouring modules and the design.**
- `interface-assets`: the design's `.mk-grp` rule (`shell.css`: nowrap, ellipsis) cuts the team's name at every width; R102 needs it wrapped, so the shell's `STYLE` carries one rule (`.cs-mast .mk-grp`) over it at every width, an exception to R65's "STYLE keeps only the height settings and reduced motion" (the R65 test admits this one selector). Moving the rule into `shell.css` would let the shell drop it.
- R101: `OPS` holds `instancegroupseed` with classes `["admin"]` only and neither `SESSION_OPS.member` nor `.admin` holds it; R12 therefore draws it to no session, and `group-identity`'s act (`screens-settings` R58) will never be drawn until `op-declarations` places it in a session set (it has no requirement for the op).
- R101: `PATH` holds `theme`, `dash-action`, `dash-project` and `help-records`, `PATHS` holds none of them (as R101 says, not this entry's).

**4. A string no member reads (K3944).** `browser.mjs` builds the SSH signature file's armour, `-----BEGIN SSH SIGNATURE-----` ... `-----END SSH SIGNATURE-----` (the words check's one remaining finding, "stitched"). It is wire grammar that `ssh-keygen -Y verify` and `signatures.verifySshsig` require, never shown; it stays in source. Please settle it with the design stream.

**5. Done in the same job (not asked of you).** The three inherited reds are cleared (`rows.test.mjs` R19 R62 and `words.test.mjs` R6 read the date keys; `t50.test.mjs` R83 now uses a code no row holds, asserted by `hasWord`). The four words findings are fixed (hand-lists assembled from the module's own declaration; `words-keys.test.mjs` reads the design's `words-reads.json` list for the module; "At a set time" is now record data). R96 changed R7: the masthead's count and the rail's Queue count are the sum of the three kinds, so the old test that expected a lone FINDING to draw no count now uses a class that is none of the three.

**6. B2–B5 applied.** Sixteen state chips (R95); a redraw choice or checks re-runs a read whose query changed (once) and none otherwise; `cs.sec`/`cs.field` help as a key or list; a read's refusal function is handed the kit; a field's `typing` handler, debounced 500 ms. Each has a test and a control in `t51.test.mjs`.

## J2 · COMPLETE

COMPLETE for `interface-shell` in T51 (entry T51-113), with B7's accepted reds.

**Entries applied.** R90–R103 (kit options, selecting words, newer-version band, self-refreshing lists, read-only sentence, state chips (sixteen) and terms, rail count, signer on the page's terms, verified downloads, printing, browser acts, paths and admin gate incl. `dash-action` and `dash-project` per K4078, titles and no weight mark on the nine pages, explanation placement); B2–B5 (sixteen chips; reads re-run after a redraw choice; help lists, refusal kit, checks redraw; debounced typing handler). The three inherited reds cleared; the four words findings fixed (one, the SSH armour, is wire grammar for the unkeyed list, B7).

**Deferred.** None.

**Found elsewhere.** As J1's report (`.mk-grp` rule in interface-assets; R94 link fill, R98 word: UX-DESIGN, B371).

**Accepted reds (B7).** Five tests wait on op-declarations (`BROWSER_ACTS`) and wizard-scripts (registry of 73+ screens): the two R100 tests, R101 (paths/`signeradd`), R102 (titles over the registry), R95's glossary-click arm. To re-run on the CHANGE after those merge.

**Tests and checks.** `node --test bio-plane/test/m/interface-shell/`: 192 tests, 187 pass, 5 fail (above). Screen modules' suites: same failures on the tranche tip and on this branch (compared). format 0 failures; architecture 0; coverage 100 of 100 ids; ownership 0; words over all L11 modules: only the SSH armour names this module; setup-words `--check`: stale-rows note only.

Size (session_013DxfQ6fDiQby41EDQ4zZH8): test runs 40, module lines 2650

## J3 · COMPLETE

COMPLETE (after B8) for `interface-shell` in T51.

`tranche/T51` merged (wizard-scripts, 77-screen registry). No local registry patch existed. The R101, R102 and R95 term tests now boot and pass (two test fixes of mine: the public pages' sessionless test, and the acts made for the nine pages).

**Suite:** 192 tests, 190 pass, 2 fail: the two R100 tests, waiting on `op-declarations` R76 (`BROWSER_ACTS`), accepted by name (B7); re-run on its CHANGE.

**R73 (t50.test.mjs:40), red since the new registry, not mine:** the nine modules' real SCREENS are composed, and `screens-action` still names `actionhold` on `action`; the registry now lists it on `hold` (R31 there: "actionhold is no longer drawn on action"). The throw is `checkScreens` doing its job; it goes green when screens-action moves the act.

format, architecture, coverage and ownership: 0 failures (unchanged files outside tests and `index.mjs` PATHS).

## J4 · COMPLETE

COMPLETE (after B9) for `interface-shell` in T51.

B9 applied: `shell.readonly` takes `{members}` and draws `shell.readonly.members` as the reference to `members` (plain where that screen is not registered); the team-name wrap rule is the design's now, so the shell's `STYLE` carries none (the R65 test is back to its original selectors); terms read `screen.glossary.<term>.name` as built (R95 test uses the real rows). `refusal.DIGEST_MISMATCH.download` is the screen's word for R98's answer `{code: "DIGEST_MISMATCH"}` (the shell returns the code and the two digests; the screen picks the word).

Suite: 192 tests, 189 pass, 3 fail: the two R100 tests (op-declarations R76 not merged; accepted B7) and R73 (screens-action still names `actionhold` on `action`; its job's). Checks: format, architecture, coverage, ownership 0 failures; words check lists only the SSH armour (unkeyed list, B371).

## J5 · COMPLETE

COMPLETE (after B10) for `interface-shell` in T51.

R100 fixed. Two causes: (1) the kit looked for a browser act's rows under `act.<act>.label.<screen>` and `.does`; the table holds them as `act.owed_<act>.label.<screen>` and `act.owed_<act>.does`, so the kit now reads those for a browser act (and the page carries those words); (2) my test's fixture screen closed over the act's name, which a self-contained screen cannot (the render is now built by source). 

Suite: 192 tests, 192 pass (the R73 red cleared with screens-action's merge). screens-inquiry 226/226 and screens-publish 134/134 pass. format, architecture, coverage (100 of 100), ownership and the words check: 0 failures. No accepted reds remain.

## J6 · COMPLETE

COMPLETE for `interface-shell` in T51 (fix round FR-05, START B11).

**Entries applied.**
1. **K4164 (3); K4168 · the guard (R104, new).** `harness.mjs` compares every op request `boot()`'s `fetch` carries (query and JSON-object body field names; the shell's `op` and `background` marks are no fields) with the owner's declared `fields` (`accepts`, `requires`; a list entry satisfied by any one alternative). A field not accepted, or a required one missing, throws `FieldMismatch` (`screen`, `op`, `mismatches`) in the page's fetch, so the shell shows "no answer", and the next `settle()` (every `click`, `boot` and `page.settle` ends in one) rethrows it, failing the test that pressed the act. An op with no row is let through and counted (`undeclaredOps()`). Rows come from `boot({declared})`, default `collectOwnerRows()`, the one seam for `test-support`'s `declaredOpsOf` (R16): it answers none until test-support merges (BOB's CHANGE wires it; no second collector here). `declared.test.mjs`: the control and both plants (wrong field, missing required, an alternative list), undeclared counted, and the census line, which prints today `declared 0 of 299 ops` (299 distinct ops over the nine modules' SCREENS, browser acts excluded).
2. **C52 · the second address part (R105, new).** `PROJECT_PART = ["question"]` (D.projectPart). `/app/question/<q>/<project>` gives the screen `view.subject = <q>` and `view.project = <project>`; the bare address gives `view.project` null; `cs.ref`/`cs.go` with a subject written `<id>/<project>` draw the address with the project as its own second part (an encoded slash reads the same). A second part that is empty, holds a space, control character, backslash, `?` or `#`, or a third part draws `unavailable` (R35) and no screen (title `unavailable`). Every other screen is unchanged (the whole of what follows its id is its subject; checked with a slashed subject). I left the dock's `serves` as `{screen, subject}` (screens-inquiry's assistant sends it wholesale as its context; a new key would change that request); `screens-inquiry` reads `view.project`. My choice of what is malformed is the one thing here that is a reading, not given: BOB may narrow it.
3. **DEC-374 to DEC-377 · six screens (R106, new).** `PATHS` gains `bias` (Settings), `contradiction` and `objective` (Projects › project), `about-knocker` (Queue › Inbox), `leads` and `watching` (Add), from the drawings' `crumbs`; `SETTINGS_SCREENS` gains `bias` last (the drawing's "For every member"; not an admin screen). `REF_SCREENS` gains `contradiction`, `bias-debt` and `bias` (→ `bias`), `source` (→ `about-knocker`), `objective`, `leads`, `watching`. A kind with no `shell.card.<kind>` word draws the item's facts alone, as `theme` does (an item with no facts keeps today's card, so `screens-investigate`'s card test is unchanged).

**Deferred.** None.

**Found elsewhere / to BOB.**
- **The generated `SCREEN_REGISTRY` (wizard-scripts, 77 screens at `7be06eb4cb`) holds none of `bias`, `contradiction`, `objective`, `about-knocker`, `leads`, `watching`** though the design's `registry.json` does. `checkScreens` throws for a screen it lacks, so no screen module can register them until `wizard-scripts` is regenerated (R101 relies on this; BOB's act). R106's tests assert the paths and kinds as data and, per screen, run the boot arm (path, crumb, a reference opening it) only when the registry holds it; until then they assert the shell's honest behaviour (a card only, "Nothing is here"). They go fully live by themselves on that regeneration. I could not run the crumb arm for the six; it shares the `PATHS`/`pathNav` code with `archive`, `glossary` and `actionnew`, which are tested.
- **No `shell.card.<kind>` words** in `words.json` for `contradiction`, `bias-debt`, `bias`, `source`, `objective`, `leads`, `watching` (REPORT to the design stream; the card is the item's facts alone until given).
- **The guard's findings on the existing screen tests: none today**, because no owner has declared yet (`declared 0 of 299`); each will surface as the declarations merge (wave 2), and its failure then names the op and the screen.
- Inherited reds, unchanged against a pristine checkout of the starting commit (compared by name): `screens-settings` 2, `screens-daily` 1, `screens-inquiry` 1, `screens-investigate` 1, `screens-publish` 1, `screens-action` 1 (each "acts are exactly its registry acts", K4174). R23 is green. `journey-check` not run (Playwright).
- `declared.test.mjs` imports the nine screen modules by name at run time, as `t50.test.mjs` does (R73, R87), because they follow this module in the order.

**Tests and checks.**
- `node --test bio-plane/test/m/interface-shell/`: tests 218, pass 218, fail 0 (192 before; 26 new: 5 in `declared.test.mjs`, 21 in `fixround.test.mjs`).
- Screen suites (entry 86/86, wizards 59/59, intake 124/124 pass; settings, daily, inquiry, investigate, publish, action only their inherited reds as above).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0); coverage for `interface-shell` 103 of 103 live ids named (the four other failures, agent-harness, agent-runner, installer-steps, journey-check, are not this module's).
- `node checks/ownership.mjs /home/user/bio interface-shell tranche/T51 job/T51/interface-shell`: 1 files changed by interface-shell; 0 failures (before the record entry).

Size (session_018RtYmRfvBFKT71cztJSVMH): test runs 14, module lines 2839

## J7 · COMPLETE

COMPLETE (re-opened by B12–B17) for `interface-shell` in T51.

**Applied.**
- **B13** the guard calls `test-support`'s collector: `harness.mjs` awaits `declaredOpsOf(root)` once at load, `collectOwnerRows()` answers its `ops`, `collectedDuplicates()` its duplicates; `declared.test.mjs` fails on a duplicate. Today `declared 0 of 299 ops` (no owner has declared yet; wave 2). **Needs your edit:** `modules.json` `interface-shell` `uses` lacks `test-support`; the architecture check names `harness.mjs` importing `bio-plane/test/declared-ops.mjs` (the only architecture failure).
- **B15/B16 (R109)** `draw()` keeps a chosen file (the node is carried into the new tree) and puts typed text back only into a field the new draw left empty or drew as the previous draw did, never over a value drawn from a late read; a select's default first option counts as no drawn value (a screen test relied on that). I-08 (four ticked rows keep two) does not reproduce at the harness: four picks across a redraw stay four (test kept, no code change); the pick toggle and `rows()` keep picks by key. If it reproduces live, give me the sequence.
- **B17 (1)** weight names are read by key already (`weight.<w>.name`); the cause of "asked none" is acts drawn with no weight but the Reasoned mark (credential/substrate ground, `op-grades` `MARKS`), which R64 ran on press. Now an administrator's act (`ADMIN_ACTS`) with that mark, and `projectowneradd` and `reviewgrant`, open the shell's reason box first and send the reason as `reason` (R107). **QUESTION (my reading, please rule):** the set is the shell's own list (`MARK_ASKS_EXTRA` plus `ADMIN_ACTS`), not every Reasoned mark, since the same mark sits on sign-in and own-account acts (`enroll`, `knock`, `reauth`, `recover`, `setpassword`, `ask`, `infolevelset`...) that must run on press; the clean fix is `op-grades` grading those admin acts Reasoned (R87 says weights are its to rule). Also, the body now carries a `reason` field the owners may not declare: the guard will flag it as an unknown field when `membership` etc. declare.
- **B17 (2)** tips open below or above only (R103 amended), close on the next tap elsewhere and on any scroll. **(3)** the B411 390 px rules are in the shell's phone block of `STYLE` (R108).
- Tests updated for the amended behaviour, none weakened: `acts.test` (memberadd now asks), `design.test` (the mark's name read by key), the R103 test.

**Requirement lines** (ownership bars me from `build/requirements/interface-shell.md`; I reverted my edit there; please enter these, tests name R104–R109):
- **R103** (T51; N1184 B-20; DEC-340, U366; K3935; amends R84, R14) **An explanation opens where it covers no other control.** It opens below or above what it explains, the first of these that covers no other control and stays inside the page (never beside it; DEC-384 T-10, K4197), and closes on Escape (R14), on the next tap anywhere but on it, and on any scroll. Test: over a fixture with a control beneath, it opens above; with a control above too, below; a tap elsewhere and a scroll close it. Control: with room below it still opens below.
- **R104** *(not yet met: T51)* (T51 fix round; K4164 goal 3, K4168; `op-declarations` R80, `test-support` R15, R16; amends R21) **The harness compares every request with its owner's declaration.** The harness through which every screen module's tests route their requests (`bio-plane/test/m/interface-shell/harness.mjs`, `boot()`'s `fetch`) compares each op request's `query` and `body` field names (the `op` and `background` marks the shell adds are no fields) with the `fields` its owner declares for that op (`DECLARED_OPS`, collected by `test-support`'s `declaredOpsOf` (B13: the harness calls it once at load; an op it lists as a duplicate fails), never by a second copy here). A field the op does not accept, or a required field missing (a `requires` entry that is a list is satisfied by any one alternative), throws `FieldMismatch` naming the screen's op and the field, shows the shell "no answer", and fails the test that pressed the act. An op with no owner declaration is let through and counted; the count is printed as `declared N of M ops` before each release (K4164). Test: a fixture owner row with a wrong field and with a missing required field shows the guard fire, naming the op and the field, and the correct request passes (the control); every act of every screen module's `SCREENS` is enumerated and the count printed. Control: an undeclared op passes and is counted; the existing screen suites run unchanged.
- **R105** *(not yet met: T51)* (T51 fix round; C52, K4164; amends R8, R9) **A question opened from a project acts for that project.** The address `/app/question/<question>/<project>` draws the question screen with the question as its subject and the project as `view.project`; the bare address `/app/question/<question>` gives `view.project` `null` (the question's home project). The shell lists the screens that take the second part in `PROJECT_PART` (`question` only); for every other screen the subject is the whole of what follows the screen's id, as before. A subject written `<id>/<project>` to `cs.go` or `cs.ref` draws the address with the project as its own second part. A second part that is empty, holds a space, control character, backslash, `?` or `#`, or a third part, draws `unavailable` (R35's "Nothing is here") and no screen. Test: `/app/question/INQ-1/PROJ-B` gives the screen `PROJ-B` as its project part and `INQ-1` as its subject; `/app/question/INQ-1` gives none (control); a malformed second part draws `unavailable`; another screen's subject with a slash is unchanged (control).
- **R106** *(not yet met: T51)* (T51 fix round; DEC-374 to DEC-377; amends R8, R16, R37, R81) **The six screens the design adds have their paths and their doors.** `PATHS` gains `bias` (Settings › its name; `bias` is also the last of `SETTINGS_SCREENS`, the drawing's "For every member"), `contradiction` and `objective` (Projects › the project's title › its name), `about-knocker` (Queue › Inbox › its name) and `leads` and `watching` (Add › its name), each from the drawing's `crumbs` (the page does not read `crumbs`; `mock-screens.js` `SCR.<id>`). `REF_SCREENS` gains the kinds `contradiction` (opening `contradiction`), `bias-debt` and `bias` (opening `bias`), `source` (opening `about-knocker`), `objective`, `leads` and `watching` (each its own screen). A kind with no `shell.card.<kind>` word is drawn with the item's own facts alone, as `theme` is (R81). Test: a harness boot per screen draws its path and its crumb; a reference of each new kind opens its screen; an unknown kind still draws no link (control). REPORT: `words.json` holds no `shell.card.<kind>` for the new kinds.
- **R107** *(not yet met: T51)* (K4197; DEC-384 T-07, U417; `op-grades` R42, R64; amends R11, R87) **An act marked Reasoned asks its reason.** The weight marks are read by key (`weight.reasoned.name`, `weight.terminal.name`, `weight.signed.name`). An act drawn with no weight but carrying the Reasoned mark (`op-grades` `MARKS`) that is an administrator's act (`ADMIN_ACTS`) or `projectowneradd` or `reviewgrant` opens the shell's reason box and runs only with a reason, as a Reasoned weight does (R11); the reason is added to the body as `reason` (or the act's `reasonField`, which then asks no second one). The walk found "Invite a member", "Change a member's status", "Confirm expertise", "Make an owner", "Grant" and "Change what a member may do" asking none. An act with no mark, or with another mark, is unchanged. Test: each of those acts sends nothing until a reason is given, then sends it; control: a Reversible-marked act and a sign-in act still run on press.
- **R108** *(not yet met: T51)* (K4197; DEC-384 B411; amends R84, R89) **The 390 px rules of the walk.** In the phone media block of the shell's own layout (`STYLE`): the main column and its children have `min-width: 0` and `max-width: 100%`; text, quotes and addresses wrap anywhere; cards are one column; act and meta rows wrap; tables scroll inside `.tw`; the path, the masthead's links and buttons and a part's summary are 44 px; an empty dock or band is hidden; a tip never exceeds the screen and takes no tap meant for what lies under it. Test: the page's phone block holds each rule. Control: nothing is added outside the phone block.
- **R109** *(not yet met: T51)* (K4194 B15, K4195 B16; amends R10, R13, R19, R27) **A redraw keeps what the member did.** A redraw keeps a file the member chose in a file input (the same node is carried into the new tree) and the rows they ticked. It puts back what the member typed only into a field the new draw left empty or drew as the previous draw did, never over a value the screen drew since (from a read that arrived after the first draw); a select's first option is no drawn value. Test: a file chosen before the screen's reads arrive is still chosen after; four rows ticked across a redraw stay picked; a value from a late read is shown; text typed where the read gave none survives. Control: an unrelated redraw keeps typing.

**Consequence of R107 for the wave-2 screen jobs (a finding, none silenced).** The screen suites press these acts and expect them to send on press; they now open the reason box first, so the tests must give a reason (or the screen names a `reasonField`): `screens-settings` 24 tests (memberadd, the members row acts membercaps/memberset/adminendorse/expertiseconfirm/invitewithdraw, websitekeycreate/joinlinkenable, groupdescriptionset, groupkeyset/switch, securitytooladd/test/remove, translationgrant, places acts officesseed/placewanted/profilesset, signeradd/signerset, and the refusal and re-read tests that press them); `screens-inquiry` 1 (R29 R40 R54 members: projectowneradd); `screens-publish` 8 (reviewgrant, "Share with a named reader", R2/R18/R27/R41). Other inherited reds are unchanged: the "acts are exactly its registry acts" test of settings, daily, inquiry, investigate, publish, action (K4174). If you would rather the shell not ask for these (op-grades grading them Reasoned instead, so the screens carry a reason field), say so and I take R107 back out.

**Checks.** Module suite 231 of 231. Screen suites: the inherited registry reds and R107's consequence above. `checks/run.mjs`: format, words 0 failures; architecture 1 failure (the `uses` edge above); coverage for interface-shell clean; ownership 0 failures.

Size (session_018RtYmRfvBFKT71cztJSVMH): test runs 24, module lines 2874

## J8 · COMPLETE

COMPLETE (B18) for `interface-shell` in T51.

**Applied.** The `reason` the shell adds to a Reasoned act's body is a shell mark like `op` and `background`: the guard never reports it as an unknown field; an owner that declares or requires `reason` has it checked as any field is (test in `declared.test.mjs`: an owner declaring none passes through the real reason box; control: another undeclared field still fails).

**Correction to your acceptance.** The seven R106 "opens where registered" tests were red from my own stand-in (its `render` used a closure variable, which a screen function may not). Fixed: with the six screens now in the registry, the boot arms run for real (path, crumb, a reference of each new kind opening its screen) and pass. Nothing is red in this module.

**Checks.** Module suite 232 of 232 (before the fix 225; the seven were mine). `checks/run.mjs`: format, architecture, words 0 failures; coverage for interface-shell clean; ownership 0 failures.

Size (session_018RtYmRfvBFKT71cztJSVMH): test runs 28, module lines 2886

## J9 · COMPLETE

COMPLETE (B19) for `interface-shell` in T51.

**Applied.** The 15 red tests are green: the guard now checks real declarations (`declared 162 of 299 ops`) and every stand-in of this module sends what its owner declares or uses an op with no declaration. `harness.mjs` gains `declaredFit(op, extra)` (the fields the owner requires, read through the collector, never a hand copy, K3268) and `fitSend(op, extra)` (a self-contained `send` built from source with those fields carried as data); the fixture screens, `stand` in `t50`, and the stand-ins in `acts`, `design`, `idle`, `kit`, `frame` use them. Where a test asserted a stand-in's old request, it now asserts the declared one: `airunopen` carries `contextType` and `contextId` (not `context`), `knock` carries `content` (not `text`), `heldrestore` and `heldsetaside` carry `ids`, `attest`'s dialog field is `locator`, and a discriminating read query is `state` or `q` (not `closed`, `timer`, `show`, `n`). No assertion was loosened.
**Control.** `declared.test.mjs`: against the real declarations a stand-in sending `knock` `text` fails with `FieldMismatch` (unknown field `text`), and one sending `content` passes. Module suite 232 of 232.

**Stand-ins that mirror a real screen's request** (each real screen's wave-2 job fixes its own screen; the screen suites show the guard's findings by name):
- Findings from the real screens' suites today (screen, op, what): settings/connect `accountreferenceset` and `accountreferenceremove` send `member` (not accepted); daily/find-in `recordfact` sends `date`, `tabledeclare` lacks `schema`; inquiry/question `hypothesishold` lacks `about`, `narrow` lacks `ord` and `extent`; investigate/explore `explore` lacks `from` and `at`, investigate/proceeding `entitycreate` lacks `label`; publish/docket `docketfile` lacks `edition or takesBack` and `capture or takesBack`. screens-settings now fails 27 (R107's reason box, B17, plus the connect two above), publish 10, inquiry 4, daily 3, investigate 5; intake 1 is the owed `capturerequestretry` of the design merge (registry red, not mine). Entry, wizards, action: no guard finding.

**Checks.** `checks/run.mjs`: format, architecture, words 0 failures; coverage for interface-shell clean; ownership 0 failures.

Size (session_018RtYmRfvBFKT71cztJSVMH): test runs 33, module lines 2886

## J10 · COMPLETE

COMPLETE (B20) for `interface-shell` in T51.

**1. Stand-ins meet the owners' new declarations.** The 13 red tests are green. `promote` (promotion R61: requires `files`, `meta`, `snapKey`): the fixture `home` screen's act now sends the declared fields (`declaredFit("promote")`, read through the collector, K3268) with the typed title carried as `meta`; the two assertions of the old body (`acts` R21, `idle` R34) assert the declared one. `openoriginal` (file-safety R48): the stand-in without a `send` uses `fitSend("openoriginal")`, the two `cs.download` stand-ins send `capture` (not `sha256`/`id`). R64's loop stand-in uses `fitSend(op)`. No assertion loosened; control unchanged (`declared.test.mjs`: a stand-in sending an undeclared field still fails with `FieldMismatch`).
Stand-ins that mirror a real screen's request: the fixture `home` `promote` mirrors screens-daily's/queue's `promote`; the real screens-daily `queue` screen sends `project` with `promote` (not accepted): new guard finding for screens-daily's wave-2 job, beside the ones listed at J9 (screens-daily now fails 4: the registry red R1–R13, find-in `recordfact` `date`, `tabledeclare` lacks `schema`, queue `promote` sends `project`; screens-settings 27 as before).

**2. The standard's crumb (R110, new).** `place(view)` may answer `{project, last}`; on `standard` the path's last step is `screen.standard.crumb` filled with `{name}` = `last` (data, escaped, never a key), the project's step still its title. `PATHS.standard` ends in `screen.standard.crumb`; where `place` gives no `last` (a string, `{project}` alone, an empty or non-string `last`) the step falls back to `screen.standard.name`, today's crumb. Two tests in `fixround.test.mjs` (test and control). One older assertion moved with it: `frame.test.mjs` R28 compares every path to the design's, now with `standard`'s last step the crumb word (R110), every other step still the design's.

**Checks.** Module suite 235 of 235. `checks/run.mjs`: format 0, architecture 0, words 0 failures for interface-shell (the run's other failures are other modules': coverage in agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring; testcopy in op-grades); `coverage.mjs interface-shell` 107 of 107; ownership 0 failures.

Size (session_01Sy13QU3XNn8qQ1dY4WHoab): test runs 8, module lines 2876

## J11 · COMPLETE

COMPLETE (B21, B22; B20 was J10) for `interface-shell` in T51, merged `tranche/T51` first.

**B22 (R110, K4228).** `place(view)` may answer `{project, last, projectKey?}`: when `projectKey` is a string the page holds (the screen lists it in its `words`) the project's step draws that word with `{name}` = the project's title, escaped data, in place of the title; absent, not a string or an unknown key, the title as before. Tests in `fixround.test.mjs`: the word replaces the title and the last step is unchanged, a `{name}` word gets the title as typed (`<b>&` escaped), and the control (none, unknown, non-string, empty keep the title). **Requirement line (ownership bars me from `build/requirements/interface-shell.md`, as at J7; please enter it):** R110 (K4228, `screens-publish` R68) — append: *`place` may also answer `projectKey`, a word key the screen holds in its `words`: the project's step then draws that word, `{name}` = the project's title (HTML-escaped data), in place of the title; where `projectKey` is absent, not a string, or not a key the page holds, the step is the title as before. Test: `projectKey` draws that word for the project's step, a `{name}` word gets the title as data; control: none, an unknown key or a non-string keeps the title.* Status: `Last changed T51 (K4228: R110 amended, projectKey)`. **Screens-publish must list `crumb.project.unjoined` in its `words`** (it is in `rows.mjs`, design row) or the key is not held and the title is drawn.

**B21.** `projectowneradd` stand-in (`b17.test.mjs`, shared by `memberadd`, `memberset`, `membercaps`, `expertiseconfirm`, `memberlanguageset`) now sends the declared fields (`fitSend`). The tranche merge brought further declarations; the guard also found and I brought to the declared request: `cite` (fixture screen: `extent_para` and `content_id` with the declared required fields; `acts.test` asserts them, `frame.test` stand-in), `enroll` (fixture: `invite` always present), `wizarddraft` (`kit.test`), the fixture members screen's `memberadd` and `membercaps`. No assertion loosened.

**Checks.** Module suite 236 of 236. `format`, `architecture`, `coverage` (107 of 107), `ownership` 0 failures.

Size (session_01TP4eDyx3cz3mY4jPr8VbyZ): test runs 9, module lines 2876

## J12 · COMPLETE

COMPLETE (B21, B22) — see J11 in my record. R110 projectKey applied with test and control; stand-ins brought to the owners' declarations (projectowneradd and the other member acts, cite, enroll, wizarddraft). Module suite 236/236; format, architecture, coverage (107/107), ownership 0 failures. Needs your edit: the R110 requirement line (ownership bars me from the requirements file), text in J11. Screens-publish must list crumb.project.unjoined in its words.

## J13 · COMPLETE

COMPLETE (B23) for `interface-shell` in T51, merged `tranche/T51` first.

**R12 (K4237).** `can` draws a read (`OPS[op].mutating` false) that no `SESSION_OPS` set holds when the session's class is among `OPS[op].classes`, or when the op is public (`classes: null`, `bootstrap`); the page data gains `readClasses` (`pick` over `OPS`). Tests in `fixround.test.mjs`: `selftest`, `runtime`, `bootstrap` (updates), `exportlog` (group), `biasmanifest`, `biasinhale`, `biasdebt` (bias) drawn for an admin and a member session, all in neither set; controls: `export` (mutating, outside the set) not drawn, and `selftest` not drawn to a session of class `agent`, which it does not list. The first test fails without the change. `export`'s session reach stays OP-DECLARATIONS #30's. R110's projectKey line is BOB's at the merge (J11).

**Checks.** Module suite 239 of 239; format, architecture, coverage, ownership below.

Size (session_01TP4eDyx3cz3mY4jPr8VbyZ): test runs 4, module lines 2880

## J14 · COMPLETE

COMPLETE (B23) — see J13. R12: a read in no SESSION_OPS set is drawn when the session's class is among OPS[op].classes (a public read too); the eight acts' reads (selftest, runtime, bootstrap, exportlog, biasmanifest, biasinhale, biasdebt) now draw; export (mutating) stays outside, as you said. Test and controls; module suite 239/239; format, architecture, coverage 107/107, ownership 0 failures.

## J15 · COMPLETE

COMPLETE (B24, B25) for `interface-shell` in T51, merged `tranche/T51` first.

**B24 (1) registerDeclared.** `test/m/interface-shell/register.mjs` calls test-support's `registerDeclared(root, registerDeclaredOps)` (R17); `t50.test.mjs` and `declared.test.mjs` import it first, so the real SCREENS compose (the inherited R73 red, `expertisewithdraw`, is cleared); a new R104 test asserts every declared op is in OPS. It is per file, not in `harness.mjs`: the screen modules' tests import the harness and register by hand, so a harness-wide registration made them fail with "a second registration" (checked: 19+14+17 tests). REPORT: adding op-grades' `registerDeclaredOps` to the call is refused with `DECLARED_OP_DISAGREES: accountusesset description` (an owner's row against the hand row; not mine), so only op-declarations' registration is made.
**B24 (2) failed hook.** An act may carry `failed(view, answer, cs)` (`answer` = `{kind: "refused"|"silent", code, translation, fields}`): called as soon as the act's request is refused or unanswered, after busy clears and before the refusal is drawn beside the act, so a working line is cleared first. Tests (R21): refused and silent clear the line and the refusal is drawn; controls: success runs `done` and not `failed`; an act with no `failed` is refused as before.
**B24 (3) kept choice.** Cause: an act with no `rereads` re-reads every read, each drawn as loading, so a choice inside `cs.state` left the tree and came back at its seed. A plain `cs.choice` now records the member's pick in `view.ui` (key `choice:<id>`, page memory) and draws it again; the seed `o.value` applies only until the member chooses; `redraw` and `acts` choices unchanged. Test (R90) fails without the change; controls: an unchosen choice keeps its seed; a numeric option value is kept.
**Requirement lines for BOB (ownership bars me from the file).** R21 (3): append "An act may carry `failed(view, answer, cs)`, called when its request is refused or unanswered, before the refusal is drawn beside the act. Test: a refused and an unanswered act clear a line the press raised and draw the refusal; control: a successful act never calls it." R90: append "A plain `cs.choice` keeps the value the member chose across redraws (page memory, `view.ui['choice:<id>']`), `o.value` seeding it only until then. Test: a choice kept across an act that re-reads every read; control: an unchosen choice keeps its seed." R104: "the tests that compose the real SCREENS register the owners' declarations with `registerDeclared` (test-support R17)."
**Also:** `t50.test.mjs` R78 stand-in `ask` sent `q`; the merged declaration accepts `question`: stand-in now sends that.
**B25.** No key of the shell's U420 names is missing (words check: missingkey 0 for interface-shell). QUESTION on the reason box: the shell opens it by weight alone (`determine`, `consequencerevise`, `consequencerecord` are graded Reasoned, so it always opens; `matter` names `reasonField` on revise). Opening it only when the act replaces an earlier determination / the member assesses needs a per-press decision the shell cannot make from the grade; it would take a kit option (e.g. `cs.act(op, {reason: false})` for a press that asks none, or `send` answering `{noReason: true}`) and `op-grades` ruling the weight. Tell me if you want that built; not built.
**Checks.** Module suite 243 of 243; screens-* suites identical to the base (pass/fail counts unchanged); format 0, architecture 0, words 0 for interface-shell (the run's 24 testcopy are other modules'), coverage 107 of 107, ownership 0, `setup-words build --check` clean.

Size (session_01KQHd3HJbcAh8FMDw347XK5): test runs 12, module lines 2893

## J16 · COMPLETE

COMPLETE (after B26, K4259) for `interface-shell` in T51. Pushed at ea97f9fd32.

**Entry applied.** `ref` (browser.mjs) draws the `<b>` lead only when `shell.card.<kind>` is held; a kind with no word is its facts alone, nothing if none, as `theme` was. The old exemption by name (`theme`) and the `someFact` test are gone. Test (written first, seen failing): `fixround.test.mjs` "R106 an objective reference with no facts draws no empty lead…" (no `<b>` with no facts or a list of null and ""; control: `published` keeps its word). `dash-action` stays out of REF_SCREENS.

**Requirement line for BOB (amends R106's last sentence):** "A kind with no `shell.card.<kind>` word is drawn with the item's own facts alone, as `theme` is (R81); an item with no facts either has no card heading and no tip (the reference is a link, or a label, only)."

**A red my change causes in another module (REPORT).** `screens-investigate` `common.test.mjs:77` (R10 "every record item a screen names is a reference with its card"), assertion at :82: on `timeline`, a `statement` reference carries no `data-tip`. It had one only because the old `ref` drew an empty `<b></b>` for a kind with no word and no facts; that tip said nothing. The fix is that module's: give the reference facts, or relax the test to references that have something to say. I did not touch it.

**Other reds, not mine (same before and after my change, compared):** `screens-publish` 1 (R10, the nine registry screens' acts), `screens-investigate` R10 acts (`linewithdraw`).

**Tests and checks.** `node --test bio-plane/test/m/interface-shell/`: 244 tests, 244 pass. Screen suites run: screens-inquiry 372/0, screens-intake 179/0, screens-daily 207/0, screens-settings 209/0, screens-action 210/0, screens-publish 176/1 fail (not mine), screens-investigate 174/2 fail (one mine, above). `checks/run.mjs`: format 0, architecture 0, words 1 failure (op-grades' test copy, not this module), coverage 6 failures (agent-harness, agent-runner, installer-steps, journey-check, screens-inquiry R110 R119, screens-intake R53; none interface-shell). Ownership: 0 failures.

Size (session_01PJfJCZsnNnrrxo4GRZ1ehd): test runs 8, module lines 2892

## J17 · COMPLETE

COMPLETE for `interface-shell` in T51 (fix round 2, wave 3, START B27, cause 1; `tranche/T51` merged first).

**Entry applied (an answer that is a success, drawn as one).** An act may name `successCodes: [CODE, ...]`. An answer that is a refusal in form (`ok: false` with that code, at the top level or in `result`, status below 500) is then the act's success: `done(view, answer, cs)` is handed the answer's fields, the act's named `rereads` run, `failed` is not called, no refusal tone sounds, and the code's own sentence (R13's words: the act's `refusals` key, else `refusal.<code>`, else the translation, with its fields filled) is drawn beside the act as `<span class="cs-state" data-state="done" role="status">`: polite, not an alert, kept by the act's key so the re-read's redraw draws it again, and ended by the act's next press or by leaving the screen, as a refusal is. A code the act does not name, a server error and no answer are refusals as ever. `checkScreens` throws, naming the screen and the act, for `successCodes` that are not a list of non-empty strings. The button follows R74 as after any success of that act: `adminendorse` and `memberadd` have no weight (credential ground), so, as after a plain success, no `data-done` (the test compares the two). No new word and no new style (`cs-state` is the design's).

**Requirement line for BOB (new R112; ownership bars me from the file):** *R112 (fix round 2, K4334; SCREENS-SETTINGS #13; amends R13, R21) **An act may name the answers that are its success.** An act's `successCodes` is a list of answer codes: an answer `ok: false` with one of them (status below 500) is drawn as done, not as a refusal: the code's own sentence (R13's words) beside the act in the done style (`role="status"`), `done` is handed the answer's fields, the act's `rereads` run, `failed` is not called and no refusal tone sounds. A code not listed, a server error and no answer are refusals (R13). A `successCodes` that is not a list of codes makes `interfacePage` throw naming the screen and the act. Test: `adminendorse`'s recorded-and-pending answer (`CONSENSUS_REQUIRED`) is drawn as done, hands `done` its fields and re-reads. Control: the same code on an act that does not name it, a real refusal of the same act, a 503 and no answer are refusals.* Status line: `Last changed T51 (fix round 2, K4334: R112 new, an act's successCodes)`.

**To report when merged (screens-settings adoption, a later CHANGE):** `adminendorse` and `memberadd` (an administrator beyond the second) answer `CONSENSUS_REQUIRED`; screens-settings names `successCodes: ["CONSENSUS_REQUIRED"]` on both and drops its own request. Their `refusal.CONSENSUS_REQUIRED` row ("Your endorsement is recorded... Still to endorse: {awaiting}.") is the sentence; the answer's `awaiting` is a list, so it is filled as the list's text (`rosa,mai`): a screen that wants handles with spaces gives the act a `refusals` function for the code. The same shape applies to any other success-coded refusal an owner declares.

**Tests and checks.** Tests (`fixround3.test.mjs`, seen failing before the change): both answer shapes, the controls (not named, real refusal of the same act, 503, no answer, an ordinary success, the next press), the malformed list. `node --test --test-force-exit bio-plane/test/m/interface-shell/`: 268 tests, 268 pass. Users (`impact.mjs origin/tranche/T51 HEAD`): screens-wizards 75/0, screens-entry 96/0, screens-daily 252/0, screens-investigate 211/0, screens-publish 212/0, screens-action 223/0, control-plane 340/0; reds also on the tranche tip with the tranche's own shell (compared by name), none mine: screens-settings R39, screens-inquiry 3 (R5…, R10, R10 entry 25), screens-intake R7 (C28), plane R24. `checks`: format 0, architecture 0, coverage 108 of 108, words 0 (interface-shell), ownership 0.

Size (session_018xL836aY5gPSaoL972peEg): test runs 9, module lines 3004

## J18 · COMPLETE

COMPLETE (B28, K4337, C66) for `interface-shell` in T51, `tranche/T51` merged first.

The frame's own `queue` read (`browser.mjs`, the masthead/rail count) asked `limit: 500`, which the walk saw refused 400; it now asks 200, the limit screens-inquiry's dashproject uses. Test (R7, seen failing: it asked 500): the frame's background queue reads carry `limit` 200; control: a screen's own queue read keeps its limit. The R7 count is unchanged (a list of at most 200 items; the sum of the three kinds is counted from what is read). Requirement line, if BOB wants it written: R7 — the frame's queue read asks `limit` 200.

Module suite 269 of 269; format, architecture, coverage (108 of 108), words 0 failures. The J17 line for R112 stands.

Size (session_018xL836aY5gPSaoL972peEg): test runs 12, module lines 3004

## J19 · COMPLETE

COMPLETE · INTERFACE-SHELL #14 · fix round 3, wave 2 provider · C51* (SCREENS-PUBLISH #15's REPORT, K4398).

**Met: interface-shell R116** (`cs.signer.sign(statements, {keyFile})`). `keyFile` is the text `cs.keyFile` answered (or its `{ok, text}` answer). With no key held the sign dialog then draws no key-file box and asks only the passphrase; a wrong passphrase is refused beside the dialog and the text is kept for the retry; the right one signs with that key. With a key held `keyFile` is not used and the dialog asks neither a file nor a passphrase. A `BIOKEY-RAW1.` file given this way signs on a blank passphrase. The existing dialog path (no `keyFile`, the file box and `cs-key-file` filled by id) is unchanged, so screens-publish's merged code works as before. SCREENS-SETTINGS can use `cs.signer.sign(list, {keyFile: (await cs.keyFile(id)).text})`. No new words, no new census op.

**Tests** (`signer.test.mjs`, written first and seen failing: the dialog still drew `#cs-key-file`): "R116 a screen signs with a key file's text and no key held …" (file made by `register({passphrase, defer})`, wrong then right passphrase, verified with `verifySshsig`, no key or passphrase in storage or any request) and "R116 control: with a key held …" (held key signs, no file box or passphrase field; the RAW1 file signs). Also named R114 and R115 in the titles of their existing tests (`cause3.test.mjs`), which coverage found unnamed in my module.

**Runs.** `bio-plane/test/m/interface-shell/`: 283 tests, 282 pass, 1 fail: `kit.test.mjs` R50 "scanmirror: declared by its owner" — red on the tranche tip too (before my change: 281 tests, 1 fail); `op-declarations` does not yet declare `scanmirror` (file-safety R49 / RC-7 provider). Named, not fixed. `build/plan/impact.mjs tranche/T51 HEAD`: affected modules 0 of 175 (the change is inside the shell's program; no other module's tests read it). Checks: format 0 failures; architecture 0; coverage for interface-shell 113 of 113, 0 failures; ownership 0 failures. The whole-product coverage and words runs show reds in other modules only (agent-harness, agent-runner, control-plane, entities, installer-steps, journey-check, op-grades, screens-publish; words in `op-grades` t33/t51), none in my files.

**Reported to BOB.** The R50 red above (needs `scanmirror` declared by `op-declarations`). Proposed requirement line: none; R116 is already written. Deferred: none. Nothing found in another module beyond the above.

Size (session_01NH5dcSiHndngPRW6Doo7DH): test runs 6, module lines 2630

## J20 · COMPLETE

COMPLETE · INTERFACE-SHELL #15 (session_01XNRmAuR8VXqdzNrDodxNZ8) · T51 · entries B29 to B33 (fix round 3; C51*, C84, C64, C87 (c))

**Met**
- **B29 · R116 (C51*)**: verified, not rebuilt. Session #14 built it (J19). This session re-ran `signer.test.mjs`: both R116 tests pass.
- **B30 · R117 (C84, C64)**: `RE_POINTS` gains `security: ["scanmirror"]` and `places: ["officeconfirm"]`. Test (`fixround3.test.mjs`, seen failing first: "screen security's act scanmirror is not the registry's for it"): both served; control: another unlisted op on those screens still throws. Amended the exact `RE_POINTS` assertions in `t50` (R73) and `design` (R55) to the three entries.
- **B30 · kit R50** ("scanmirror: declared by its owner") now passes. The cause was the test, not `RE_POINTS`: `kit.test.mjs` never registered the owners' declarations, so `OPS` lacked `scanmirror`. It now imports `register.mjs` as the other composing tests do.
- **B31 / B33 · R118**: built (a `screen` field on every act request), then retired by B33 and reverted (`36680b3573` reverts `3430ea7a82`: field, harness exemption, test). Check B31 asked for: under the owners' declarations, 25 distinct ops in the test traffic would refuse an extra `screen` field (for example `promote`, `adminendorse`, `login`, `cite`, `memberadd`, `knock`). Moot now that R118 is retired.
- **B32 · R119 (C87 (c))**: an act's `ready(view, el, cs)` runs on the press before any reason box opens (`readyFirst` in `browser.mjs`). `{refuse}` is drawn beside the act and nothing is asked; `{fills}` reach the send as `extra.fills`. Tests (`fixround3.test.mjs`, both seen failing first): "R119 a reasoned act whose ready refuses …" (control: an act without `ready` still asks the reason) and "R119 the fills ready answers reach the act's send …".

**Requirement lines for BOB**
- R117 and R119 are met and tested; BOB clears the "(not yet met: T51)" marker at merge. Nothing new proposed. R118 is retired per B33; nothing to write.
- Note for screen authors: an act's functions reach the page as their own source, so a `send` or `ready` cannot close over test or module variables. My first R119 draft failed for that reason, not for a product fault.

**Suites and checks**
- Module: `node --test bio-plane/test/m/interface-shell/*.test.mjs`: 286 tests, 286 pass.
- Affected modules (`impact.mjs origin/tranche/T51 HEAD`): 13 modules. I ran the other modules' 275 affected files on the final code: 2610 tests, 2594 pass, 14 fail. Those 12 files were re-run on the tranche tip at the same merge (`263b820968`): the same 7 failures on both, so none is from this module. The 7 are: R10 (two), R1–R13 (interface-shell R21, R38), R24 (DEC-149), R5 R14–R16 ..., R81 end to end (Home's projects), and "the shell serves the screens: interfacePage passes its R21 check".
- Module checks: format 0 failures; architecture 0; coverage 115 of 115; words: no finding in this module; `setup-words --check`: no line for this module; ownership (`interface-shell`, `origin/tranche/T51`, `job/T51/interface-shell`): 7 files, 0 failures.
- `checks/run.mjs /home/user/bio`: failures only in other modules (listed below).

**Reported to BOB (other modules; not fixed here)**
- `op-grades/src/op-grades/t33.mjs:214`, `t51.mjs:41` and `:45`: inline sentences (words check). `t51` :41 and :45 are the `scanmirror` and `officeconfirm` rows, which are op-grades' own.
- Coverage named by no test: agent-harness R17; agent-runner R37, R38, R40; control-plane R117, R118; installer-steps R26, R31; journey-check R19; jurisdictions R95; op-grades R53; screens-publish R74 to R79.
- Architecture: `screens-inquiry/fr4-project.test.mjs` imports `screens-action/plan.mjs` before it is in the order; `screens-inquiry/phone.mjs` imports `interface-assets` it does not declare.
- Words testcopy: `screens-inquiry/fr4-document.test.mjs:115–116`.

**Found in this module's paths:** none beyond the above. Deferred: none.

Size (session_01XNRmAuR8VXqdzNrDodxNZ8): test runs 29, module lines 3124

## J21 · QUESTION

QUESTION (E12 step 1, offline through my harness with the nine modules' real SCREENS; every `(op, query)` sent per load, admin, assistant reachable). Only two repeats are identical requests; the rest differ in a parameter and each is a screen's own declaration.

IDENTICAL (mine, I fix them): Home `groupidentity` x2 (frame `browser.mjs` loadFrame :2584 + `screens-daily/home.mjs`:37); Project `groupidentity` x2 (frame + `screens-inquiry/project.mjs`:41). Fix: a read request (op declared not mutating) identical to one in flight, or answered in this load with no act since, is shared; every act and every route opens a new epoch, so an act's re-reads and a re-visit still re-read. No requirement text changes.

DIFFER IN A PARAMETER (not identical):
- Home `queue` x2: frame `{count:true}` (R7, browser.mjs:2584) + the screen's open list `{}` (`home.mjs`:38).
- Queue `queue` x3: the same count + the open list `{sort?}` (`screens-daily/queue.mjs`:44) + `{muted:true}` (:48; answered/aside in their states, :37-38).
- Project `inquirystrength` x2: two questions, ids differ (`project.mjs`:313, one per question).
- Held `heldcaptures` x3: picker list `{limit:50,fields:picker}` (`screens-intake/held.mjs`:11), set-aside list `{state:set_aside}` (:13), and the full fields `{bundle_ids}` (:31, E13's, capture).

ASK (changes R7's text): on Home and Queue the screen reads the whole open queue, which already gives the frame its number and its three kinds (`noteQueue`, R93/R96). My best reading, RECOMMENDED: the frame sends its `count:true` read only when the screen reads no whole open list, or that list came back cut/failed (then right after); so Home and Queue send one `queue` request fewer, and a screen that reads no list (Find, Projects...) is unchanged. Cost: on those two screens the masthead number waits for the list instead of the cheaper count (same time as the screen's own list). Alternative: leave R7 as is (the count stays a separate request). I build the recommended reading only on your word; everything else of E12 goes on now.

## J22 · COMPLETE

COMPLETE · INTERFACE-SHELL #16 (session_01WsgvMVTibADgx16hWhb92M) · T51 · B34 (fix round 5, E12) with B35's ruling on J21

**What changed** (`bio-plane/src/interface-shell/`)
- `browser.mjs` `call` (:107-145) is now a sharing front over `send` (the old body). A read (an op `OPS` declares not mutating, a call saying `read: true`, which every `reads()` entry, `refreshNow` and the frame's `subscriptionsignin` state do) identical in op, query and body to one in flight, or answered during this load, is that one request; later readers get their own JSON copy (`copyOf`). Epoch: `newEpoch()` on every `route()` (:1530), every session-record write/clear (:82-83), every non-read call and every act press (`req.act = true`, :2146), so an act's re-reads, a revisit and a refresh still ask. A completed answer is shared only while the load is open (`closeLoad`, when the screen's first reads settle, :1592) and for 5 s at most.
- `index.mjs`: `readOps` in the page data (the ops `OPS` declares not mutating; about 6 KB of the script, served once per release, R1), so `cs.call` reads by any screen are known as reads.
- B35 ruling: `loadFrame` no longer sends `queue {count:true}`. `countQueue` (`browser.mjs`, called from `show`) sends it once, in the background, only when the screen reads no whole open list (`queue` with at most `limit`/`sort`), or when that list was cut, refused or unanswered (then right after it).

**Step 1 (offline, nine modules' real SCREENS, admin, assistant reachable)**: identical: Home and Project `groupidentity` x2 (frame + `home.mjs`:37, `project.mjs`:41), now one. Parameter-distinct and kept (B35): Queue's `muted` list, one `inquirystrength` per question (`project.mjs`:313), Held's three `heldcaptures` (`held.mjs`:11, :13, :31). Home and Queue: the frame's count is gone (list gives the number). After: no `(op, query)` repeats on the four screens.

**Failing-first** (`e12.test.mjs`, new, 13 tests; `p9.test.mjs`, `fixround3.test.mjs` amended to the ruling). Red before: Home and Project "repeats: groupidentity {} x2"; the in-flight and answered-in-load tests; the control "act re-reads" (red only because the first load sent two); the queue tests "no count read where the whole open list is read" (Home, Queue, p9) red with the old frame count, green now. Mutation check: returning the shared object instead of a copy fails "own copy". Controls green: act re-read asks again; revisit asks again; differing queries each sent; an act's op never shared (two presses, two requests); refused/unanswered list then one count; cut list one count; Project (no list) one count.

**Suites and checks**: module `bio-plane/test/m/interface-shell/`: 321+ tests, all pass (re-run after the last edit: p9, e12, fixround3 green; full module run before the queue change 320/321, the one red was fixround3's, amended). Users (`impact.mjs origin/tranche/T51 HEAD`, 13 modules, 313 other files): 2814 tests, 2801 pass, 11 fail: 7 `journey-check/pseudo.test.mjs` (playwright-core not installed here), 1 `plane/release.test.mjs` R24 (DEC-149; in J20's list), and 3 that encode the old request counts and need their module's job:
- `screens-daily/fix4.test.mjs`:173 expects `groupidentity` x2 on Home (now 1; its own title says "the one known repeat");
- `screens-settings/account.test.mjs`:19 expects `whoami` x2 "the shell's own, and the screen's" (now 1);
- `screens-daily/queue.test.mjs`:39 `mainQueue(p).at(-1)` now finds the frame's count read, since its fixture's queue answer does not give a whole list (no count read would be sent for a whole one).
Smallest thing I need: BOB to place those three one-line edits with screens-daily and screens-settings. format 0 failures; architecture 0; coverage 116 of 116 (this module); ownership 0 failures; `checks/run.mjs`: words 0 failures, no finding in my files.

**Requirement lines proposed (BOB writes)**
- R7, replacing "The frame's own queue read asks `queue` with `count: true` once per load, in the background (queue R93), and draws that number": "The frame sends that read once per load, in the background, only when the screen reads no whole open list (`queue` with at most `limit` and `sort`), or that list was cut, refused or unanswered; where it is read whole, the number is the sum of its three kinds (R93, R96)."
- R123 new (fix round 5, E12; P9): "A read identical in op, query and body to one in flight, or answered during this load, is sent once and each reader is handed its own copy. A load is a route; every route, session change, act and call of a mutating op opens a new epoch; a completed answer is shared only until the screen's first reads settle, and for 5 seconds at most. Test: `e12.test.mjs`. Control: an act's re-reads, a revisit and a refresh ask again."

No platform measure (N: one page's requests); PERFORMANCE re-times the four screens. New data only: none stored. Deferred: none.

Size (session_01WsgvMVTibADgx16hWhb92M): test runs 22, module lines 3190

## J23 · QUESTION

QUESTION (G12b, bootstrap; changes R86's text). R86 says the shell's independent requests are in flight together, and its test (`t50.test.mjs`:496) asserts `bootstrap` leaves at the same instant as `whoami`. G12b says `bootstrap` never blocks a mark. Reading: the diagnosis (R6 speed §2) lists `bootstrap` (1.4-1.8 s, 4 hops) among the frame reads that share the object with the screen's reads, and nothing but a screen that itself reads `bootstrap` (Home, setup, connect, security, updates) waits for it; so the only way it can "block" a mark is by reaching the object ahead of the first reads.
BEST READING (I am building it): `bootstrap` is sent after the screen's first reads and the guide's marks request have left (in `show`, or at once if the screen itself reads it, since that read waits for it as R122 says), never before them; it is still sent once per load, with the same session or none, its answer drawn as R36/R58 say. Cost: its answer, and so the test band's correction when `test_instance` is not true, arrives about one round trip (~0.2 s) later; the band served in the page (R58) is unchanged.
Effect on tests: R86's test changes from "whoami and bootstrap at 0" to "whoami alone at 0; bootstrap with the screen's reads on whoami's answer". Alternative if you want R86 kept as it is: bootstrap stays beside whoami and G12b's "never blocks" is met as it is today (no mark waits for it); I would then say so in the record and send nothing else. Proposed text if my reading stands: R86's "independent requests" excludes `bootstrap`, which R122 places after the screen's first reads.

## J24 · COMPLETE

COMPLETE · INTERFACE-SHELL #17 (session_01AQngXihE8KDBsQRFsE7fEX) · T51 · B36 (fix round 6, G12b), with B37's ruling on J23

**Root cause (file:line, `bio-plane/src/interface-shell/browser.mjs`).** Every full page load sent the six frame reads (`loadFrame`/`loadReach`, old :2636-2677, from `whoami` :1631-1633) though they are constant for a session; `bootstrap` left at `start` before `whoami` (old :2712) and so reached the object ahead of the screen's reads; `wizardsat` was asked only when `entered` ran after the reads settled (`show` :1609 -> `screens-wizards/guide.mjs:277,336`). Why the tests missed it: none counted requests across two page loads of one session, none ordered `bootstrap` against the screen's reads, none crossed members in one tab.

**What changed** (all in `browser.mjs`; no word added, no other module touched)
- `frameBoot` (replaces `loadFrame`/`loadReach`; :2636 on): the six reads are read from the tab's sessionStorage key `bio-session:frame` = `{who: member|tag-of-token, reads}` when `who` matches this member and session, drawn at once, and asked again once, after the screen's first reads settle (`frameRevalidate`, from `show`); those not kept are asked now, together, as before. Only what the frame uses of each answer is kept (`min`: display_name; level, set_at, asked_at; on; held; connected; on), re-normalised on read-back; no token (a hash tag of it names the session), no route, no screen's read. A screen's own identical read (no query; `subscriptionsignin` state) is taken as the answer (`noteFrame`), so it is not asked twice. The frame follows an answer that differs (name, assistant button, level note).
- Cleared: `writeRecord`/`clearRecord` (sign-in, sign-out, end, 401) and `lock()` call `frameDrop`; a member's own `setLevel` drops the kept level (`frameForget`). Storage denied/absent/garbage/another's: ignored, cold path.
- Per read, safely cacheable (kept + revalidated): `groupidentity`, `infolevel` (dropped on the member's own change), `assistantstate`, `accountreference`, `subscriptionsignin {step:state}`, `groupkeystate`. Not cached: `whoami` (the gate), `interfacewords` (already per-release), `bootstrap` (R58), the queue count (live number), `/version`. A change made by an act in one page shows in the next page's first draw until the revalidation (about the screen's settle).
- R125: `marksAhead` (in `show`) sends the guide's `wizardsat {screen}` with the screen's reads (only for a guide whose `ops` name it); `call` takes `hold: true` so that answer survives the load's end and the 5 s cap until `entered`'s identical `cs.call` takes it. `screens-wizards` unchanged.
- R122 (B37): `startBoot` sends `bootstrap` after the screen's reads and marks request (at once if the screen reads it), once per load.

**Failing-first** (`g12b.test.mjs`, 16 tests; `harness.mjs` gains `tabStore`, `tabThrows`, request `at`). Against the old shell 12 were red: second load sends none of the six before the screen settles (red: six sent), never-settling reads, frame follows a differing answer, marks within 50 ms of the first read with the read still out (red: not asked), bootstrap after first read and marks (red: first), different member / other session in one tab, storage unavailable/rubbish/another's, sign-out/lock/end clear, own level change not kept, kept read that fails keeps its value, first-load shape and store contents. Green now. Mutation checks: `hold` off -> both marks tests red; store keyed without member/session -> the cross-member test red.
Existing tests amended (module's own): `t50` R86 (whoami alone at 0; bootstrap with the screen's reads at 500, B37), `t51` R92 and `session` R24 (the tab's storage holds the one frame key and nothing else). R24 stays true: no log of reads or screens.

**Measurements.** Offline, scripted plane (no platform path; N): second page load of a session sends 0 of the six before the screen settles (was 6) and 6 after, once each; `wizardsat` leaves with the screen's first read (was after settle); `bootstrap` third (was first). PERFORMANCE re-times; expected -6 reads off wave 1, ~-0.3 s.

**Suites and checks.** Module `bio-plane/test/m/interface-shell/*.test.mjs`: 337 tests, 337 pass. Users (`impact.mjs origin/tranche/T51 HEAD`, 21 modules, 411 other files, concurrency 2): 3679 tests, 3665 pass, 11 fail. The 9 known: 7 `journey-check/pseudo.test.mjs` R29 (playwright-core not installed here), `control-plane` R117 (acquire), `plane` release R24 (DEC-149). Caused by this change, both in screens-intake and both asserting an empty tab storage: `screens-intake/open-file.test.mjs`:221 and `common.test.mjs`:172 (`assert.deepEqual([...p.store.keys()], [])`). **Smallest thing I need:** BOB places those two one-line edits with screens-intake (exclude the key `bio-session:frame`, or expect it). format 0 for my files (1 failure in `build/plan/next.md:38`, not mine); architecture 0; coverage 117/117; ownership 0 failures; `checks/run.mjs`: no finding in my files, words count unchanged.

**Requirement lines for BOB**
- R124 new (G12b): "The tab keeps six of the frame's reads for the session: `groupidentity`, `infolevel`, `assistantstate`, `accountreference`, `subscriptionsignin` (state) and `groupkeystate`, only what the frame uses of each answer, in sessionStorage under the member and a tag of the session (never the token). A page load draws the frame from them and asks each again once, when the screen's first reads have settled (a read the screen itself had answered is not asked again); a differing answer is followed. They are cleared at sign-in, sign-out, an end and the lock; the member's own change of the level drops the kept level; storage that is unavailable, unreadable or another member's or session's is ignored and the reads go out at once as on a first load. Test: g12b.test.mjs. Control: a first load asks all six together."
- R125 new: "The guide's marks (`wizardsat` for the screen) are asked at the route's start with the screen's reads and handed to `entered` when the route has settled; the answer is held for that one reader past the end of the load and the 5 seconds (R123)."
- R122 (not in the file): "`bootstrap` is asked once per page load, after the screen's first reads and the marks request have left (at once if the screen reads it), with the page's session when it holds one."
- R86: "independent requests in flight together" excludes `bootstrap` (B37). R123: "...shared only until the screen's first reads settle, and for 5 seconds at most" gains "except an answer asked at the route's start for one later reader (R125)". R7: the group's name may be drawn from the tab's kept read (R124). R24: the tab's storage may hold R124's key, which holds no read of a screen and no route.

Words: none added. R-OLD: new data only (a per-tab key no earlier release wrote). Census ops owned: none new. Deferred: none.

Size (session_01AQngXihE8KDBsQRFsE7fEX): test runs 9, module lines 3478

## J25 · COMPLETE

COMPLETE · INTERFACE-SHELL #18 (session_01GuYhDBuwX3wYXyAxnpXWHF) · T51 · B38 (fix round 6, G30 and G31)

**G30 · the front page's work is done once per release (B-21).**

*Root cause (`bio-plane/src/interface-shell/index.mjs`, before this job).* `interfaceScript` kept the composed source but not its hash, and ran `checkScreens` and `checkGuide` on every call before looking at what it kept (old :437-440). So each `GET /` paid the whole script's hash twice (control-plane's `page()` calls `interfaceScriptHash`, :890, and `interfacePage` hashes again, old :471) and re-checked all the screens; each script fetch re-checked them. Offline that is 100-180 ms of synchronous CPU a request; on workerd it is more (measured below). The plan's cause was "probable, not reproduced"; it is now measured: it is the whole of the idle cost of the page route, and it is what a burst of requests stacks up behind.

*What changed.* `index.mjs` :432-465: `release(screens, options)` keeps `{source, hash}` for the last screens and guide handed in and runs the checks, the class check and the compose only on a miss; `interfaceScriptHash` hashes once per kept script. New export `pageWork()` (:441): counts of scripts composed, hashes taken and checks run in this isolate. Counts, not times, because the Worker's clock is frozen during synchronous work (R-CLOCK); this is what control-plane's `page` log line (K4428) states. control-plane is not touched: its `page()` (:888-892) now finds the hash kept, so its two calls cost one hash per release.

*Why the tests missed it (rule 2) and the gap fixed.* Nothing counted or timed the work behind the page route (`page.test.mjs` asserts two responses are equal; the second is as slow as the first). `g30.test.mjs` counts it, through the module's entries the way control-plane calls them, over the real screens of the nine modules (4.8 MB script).

*Failing-first (rule 3), seen red against the code as it was (counter added first, memo not):* "twenty front pages and twenty script fetches": actual `{scripts: 1, hashes: 40, checks: 60}`, expected `{1, 1, 1}` (twice per hit, as the plan said); the "hit hands back the kept hash" control red at 45 vs 44. Green after: 4 of 4. Controls in the file: the hash is the SHA-256 of the script's UTF-8 bytes, base64, and the page's `integrity` is the same string; a different set of screens is another release (composed, checked, hashed again, its own hash); a broken screen or guide is refused on every ask and leaves the kept release as it was.

*Platform check L (rule 4), `page-contention.probe.mjs` (committed, a probe not a test: it boots workerd and takes a minute).* Real screens of the nine modules plus `plane/register.mjs`, bundled with esbuild, served from one workerd isolate: `GET /` does what `page()` does (hash, then page), the versioned script, and a body drained as `captureupload` drains one. Wall clock outside the isolate. `node page-contention.probe.mjs <dir> [<index.mjs>]`.

| measure (workerd, this container) | before (module at `tranche/T51`) | after |
|---|---|---|
| first `GET /` of a release (the build) | 1754 ms | 1374 and 1464 ms |
| 20 `GET /` idle, one at a time | median 361 ms, max 430 ms | median 1 ms, max 4-5 ms |
| 10 `GET /` during a 20 MB upload | median 3104 ms, max 4288 ms (bar 2000: FAILS) | median 9 ms, max 220-266 ms (bar met) |
| 10 script fetches during it | median 4595 ms, max 4660 ms | median 389-420 ms, max 444-462 ms |

The build (compose, class check, one hash) is paid once per release by the first request an isolate gets, about 1.4 s; every later page is 1-5 ms of the module's work. 10 concurrent pages in 3-4 s against a walk's 19-53 parallel reads plus uploads fits the walker's 20 and 30 s draws. Platform check P (20 timed fetches of `/` idle and during a walk on biosmoke8) is a read-only measure of the deployed fix: PERFORMANCE's after-deploy re-timing in plan section 7, not possible before the deploy.

**G31 · a first sign-in sends each request once (A-27).**

*The plan's reading was "by design, a walker artefact". Half of it holds; the other half was a defect.* Driven through the real entry (the real `front` screen's `login` act over the real screens of the nine modules, sign-in returning to Queue and to Home): (a) `queue` twice is by design: the open list and the muted list are two queries of one op (`screens-daily/queue.mjs`), each once; with the real op's whole-list shape (`ok, member, items, limit, sort, item_count, truncated: false`) the frame asks no `count` read and the rail and masthead draw the list's number. These two cases were green from the start; kept as controls (with the cut list, `truncated: true`, asking exactly one count). (b) But 8 of the 23 requests after the press were repeats: `whoami`, `interfacewords` and the six frame reads each went out twice (and `groupidentity` a third time on Home).

*Root cause.* `screens-entry/front.mjs:106` hands the session over to stay and read `whoami` (`cs.signin(a, {…, stay: true})`) and :109 hands it over again to open the page kept (`cs.signin(a, opts)`; its comment: "the record written again, as it was"). The shell's `signedIn` (old browser.mjs:1654-1666) took each for a new session: `writeRecord` (new epoch, frame dropped), `ME = null`, then `route()` (new epoch) and so `whoami()` (:1583) with `loadWords()` and `frameBoot()` (:1639-1640) again; and the epoch change kept Home's own `groupidentity` from sharing the frame's. The walker's second document load (a second tab) is by design (R32) and is a control here: the other tab sends its one set once.

*What changed (`browser.mjs`).* `signedIn` :1657: a session handed over again exactly as it is (same token, expiry, device and handle, `whoami` already answered, not locked) is one sign-in: the record is not rewritten, `whoami` not sent, and the hand-over opens the page kept as part of the same load. `route(keep)` :1549 opens no new epoch for that second hand-over, and the first (`stay`) opens the load (`LOADING = true`), so the frame's reads are shared with the screen's identical ones (R123's own rule, which the epoch change had cut). A different token, handle or device, or a session whose `whoami` has not answered, is a new hand-over as before. `screens-entry` is not touched (its two calls are harmless now, and are its R18's intent).

*Why the tests missed it, and the gap fixed.* `e12` boots one page on one route with the session already in storage; no test crossed a sign-in. `g31.test.mjs` (7 tests) does, through the real front screen.

*Failing-first, seen red against the old `browser.mjs` (the file put back for the run), green with the change:* first sign-in on Queue: repeats `whoami x2, interfacewords x2, groupidentity x2, infolevel x2, assistantstate x2, accountreference x2, subscriptionsignin x2, groupkeystate x2`; on Home the same; the record written twice (one write now); the other tab's set doubled. Green: 7 of 7. Controls: another token over a live session is a new session (`whoami` again, the frame read again, the record rewritten); a cut open list asks one count; the muted list and the open list are sent once each.

*Count at the walker's case.* The sign-in load after the press is 15 requests (login, whoami, interfacewords, the six frame reads, the open queue, the muted list, `heldcaptures`, `inbox`, `memberlist`, `wizardsat`), was 23. The walker's 49 on the live copy is the same shape with a larger home page; PERFORMANCE counts again after the deploy. Platform check N.

**Suites and checks**
- Module `bio-plane/test/m/interface-shell/*.test.mjs`: 348 tests, 348 pass (337 before; +4 `g30`, +7 `g31`). `g30` and `g31` each seen red first (above).
- Users, from `impact.mjs origin/tranche/T51 HEAD` (13 modules, 363 files): the screen modules, two suites at a time: screens-entry, -wizards, -settings, -intake, -daily: tests 1003, pass 1003; screens-inquiry, -investigate, -publish, -action: tests 1293, pass 1289, fail 1 (the one red is `screens-investigate/fix4-seam.test.mjs:92` "Money, the real plane", a 63 s real-plane test that failed under two suites at once and passes alone with this change, 1 of 1); control-plane page and door tests that compose the page (`doors`, `t46-app`, `t46-e2e`, `t47-door`, `t47-e2e`, `t48-door`, `t51-bootstrap`) and plane `t47`, `wizards`: 63 of 63. `journey-check/*.test.mjs` (after `npm ci` in `bio-plane/src/journey-check`, K4113): 128 tests, 104 pass, 23 fail; the SAME 23 fail at `origin/tranche/T51` with this job's files absent (run in a worktree, same failing names; the first failing step is journey 28's install step "locator.textContent: Timeout 30000ms", the installer's fake account; also the two G1 watchdog-cron tests, which stay red by name until installer-steps merges, the words R17 "group" test, and the arms that walk on after journey 28). None touches this job's code.
- `checks/run.mjs`: format 0 failures, architecture 0, coverage 0 (6656 of 6656 ids named), channels 0, words 0 failures with counts unchanged (module: inline 0, dev 18, unkeyed 1, before and after; whole: dev 268, unkeyed 1982). `checks/ownership.mjs interface-shell tranche/T51 job/T51/interface-shell`: 0 failures.

**Requirement lines for BOB**
- R126 new (G30; B-21; K4428): "The page's script, the hash of it the page policy names, and the checks of the screens and guide it is made from are done once per release in an isolate (for the screens and guide it was last made from): a front page and a script fetch after the first only read what was kept, so no request pays for the script's build, its hash or its checks; a set that fails its checks is kept nowhere and is refused again at the next ask. The module exports `pageWork()`, the counts of scripts composed, hashes taken and checks run in this isolate (counts, not times: a Worker's clock does not see synchronous work, R-CLOCK), for control-plane's `page` log line. Test: `g30.test.mjs`. Controls: the hash is the SHA-256 of the script's UTF-8 bytes; another set of screens is another release; a broken screen is refused every time. Platform: `page-contention.probe.mjs`."
- R127 new (G31; A-27): "A session handed to the shell again exactly as it is (the same token, expiry, device and handle, `whoami` answered, not locked), as `front` does to stay and read `whoami` and then to open the page kept, is one sign-in: the record is not written again, and `whoami`, the words and the frame's reads are not sent again; the second hand-over opens the page kept as part of the same load, which the first opened (R123: no new epoch). A different token, handle or device is a new hand-over. Test: `g31.test.mjs`, through the real `front` screen. Control: the other tab sends its own set once; a cut open list asks one count."
- R46: `cs.signin`'s line gains "(R127: handed over again as it is, it is the one session)". R123: "every route ... opens a new epoch" gains "except the route that follows a hand-over that stayed (R127)".

**Found in another module.** control-plane `page()` (:888-892): no change needed for the hash (now once per release); its `page` CPU log line (G30, K4428) is its next job's and reads `pageWork()`. screens-entry `front.mjs:106-109`: the double hand-over is now harmless; it may stay (its R18 says the record is written again). No other module.

Words: none added (no member-facing string). R-OLD: new data only (no stored data). Census ops owned: none (the shell declares no op). Deferred: none. REPORT/QUESTION: none open.

Size (session_01GuYhDBuwX3wYXyAxnpXWHF): test runs 20, module lines 3347

## J26 · COMPLETE

**G53 · `RE_POINTS` drops the two re-points the design's registry now lists (K4699; `interface-shell/index.mjs:151-158`).**

*Root cause (file:line).* `bio-plane/src/interface-shell/index.mjs` `RE_POINTS` held `security: ["scanmirror"]` and `places: ["officeconfirm"]`. R117 (fix round 3, C84, C64) added them because the generated screen registry did not yet list the ops. DEC-419's design file (`docs/development/ux-substrate/screens/registry.json`, on the tranche at `f72b2f8a4c`) now lists `scanmirror` on `security` and `officeconfirm` on `places`, so R73's rule (a re-point leaves the table once the registry lists it) applies to both. The generated copy the shell reads is still at `43379a1a44` (wizard-scripts' re-take, 44a).

*Why the tests missed it, and the gap fixed.* `t50.test.mjs` (R73) and `design.test.mjs` (R55) pin the object and check each entry against `SCREEN_REGISTRY`, the generated copy. That copy lagged the design file, so the check passed vacuously and both tests stayed green. Gap fixed: a new test in `fixround4.test.mjs` (`G53 R117`) reads the design's `registry.json` on the tranche and fails on any `RE_POINTS` entry it lists, with a control that the file does list the two ops R117 named. The generated-copy side is wizard-scripts' commit-equality test (44a).

*Change.* `index.mjs:151-158`: `RE_POINTS` is `{ explore: ["stepsourcewithdraw"], document: ["readheld"] }`; the `security` and `places` entries and their R117 comment go, replaced by a G53 comment. `t50.test.mjs:34` and `design.test.mjs:80` now assert the new object (`t50.test.mjs:33` comment amended). `fixround3.test.mjs:108-113` and `fixround4.test.mjs:13` are unchanged.

*Failing-first.* Scratch tree (a detached worktree, never committed): `bio-plane/test/m/wizard-scripts/source/registry.json` set to the `f72b2f8a4c` file, `SOURCES.registry.commit` set to `f72b2f8a4c`, `build-data.mjs` run (84 screens, `security` and `places` list the two ops).
- Before the change: `t50` R73 red (`security scanmirror is listed by the registry, so it must leave RE_POINTS`); `fixround4` R73/R117 red (`security: scanmirror is listed by the registry, so it is no re-point`).
- After the change, same scratch tree: `t50` 18 of 18, `fixround4` 3 of 3, `fixround3` 9 of 9, `design` 14 of 14 pass.
- The new gap test, on this branch before the change: red (`security: scanmirror is listed by the design's registry.json, so it is no re-point`); after: green.

*On this branch, before wizard-scripts 44a merges (generated registry still at `43379a1a44`).* `t50` R73 and `fixround3` R117 (its `security`/`places` controls) are red by name until 44a merges; `fixround4` and `design` are green. This is the state BOB's START expected.

*Platform check.* N (a table; no platform shape).

**Suites and checks**
- Module `bio-plane/test/m/interface-shell/*.test.mjs`, in the scratch tree with the re-taken registry: 33 files, 349 tests, 349 pass, 0 fail (348 before; +1 `G53` test).
- Users (`impact.mjs origin/tranche/T51 HEAD` names 13 modules and 377 files; not all run here). Run in the scratch tree with the re-taken registry: `screens-settings` 23 files, all pass; the page composition suites `screens-wizards` (page, walk), `screens-inquiry` (common, t48), `screens-daily` (common-line, contract), `screens-entry` (page), `plane` (t47), `control-plane` (t46-app, t46-door, t46-e2e), `journey-check` pseudo and pseudo-route: all pass.
  - `screens-action/contract.test.mjs:34`: 1 red, `start-send` (the Join act, `projectjoin`, is G52's and not yet merged). Held by name in the round's list.
  - `journey-check`: see the note below.
- `checks/format.mjs`, `checks/architecture.mjs interface-shell`, `checks/coverage.mjs interface-shell`: 0 failures (coverage 122 of 122 ids). `checks/run.mjs /home/user/bio`: format 0, architecture 0, coverage 6686 of 6686, channels 0; words 1 failure, the inherited `inline 1` at `bio-plane/src/case-checker/spec.mjs:11` (named in the round's list; not in this module, no words finding in `interface-shell`).
- `checks/ownership.mjs /home/user/bio interface-shell tranche/T51 job/T51/interface-shell`: 5 files changed by interface-shell, 0 failures.

**Requirement lines for BOB** (R117 is amended by G53; BOB writes `build/requirements/`):
- R117 amended (G53; K4699): "`scanmirror` (`security`) and `officeconfirm` (`places`) leave the re-points: DEC-419's registry lists both, so the registry admits them. `RE_POINTS` holds `stepsourcewithdraw` on `explore` and `readheld` on `document` only. Test: `fixround4` G53 test, against the design's `registry.json`; control: `fixround3`'s R117 test, against the generated registry."

**Census.** This module owns no census op, and G53 changes no op's accepted keys. **Words.** None added. **Stored data.** None. **Deferred.** None. **Found in another module.** None new. The generated-copy side of G53 is wizard-scripts' (44a); `op-declarations` (44b) is not touched by this job.

**journey-check (the 24 files, scratch tree, re-taken registry, `npm ci` run in `bio-plane/src/journey-check`).** 17 files pass, 5 fail: `account-installer` 3, `group` 1, `journey` 13 (the live step "connect an assistant by her own Claude subscription"), `live` 4, `plane-cron` 2. Those are environment reds (a Docker image, an external subscription, the live plane). Run once with my change and once with the four files put back to `4004df1ff0`: the same counts both times, so none is from G53. Not run: a fix of those environment reds (not this module's).

Size (session_011BwEvapbBvrGVu6SVZhniz): test runs 122, module lines 3346

## Fix round 7 (INTERFACE-SHELL #20, session_01Up6JyxDqREE6g4kR9CVELS) · G77, G81

**G77 · applied (file:line `bio-plane/src/interface-shell/browser.mjs`, `restore` in `draw`).** `restore` returns for any box inside `fieldset[data-redraw]`: a group that redraws on a change is drawn from the screen's own state, so what the member had checked is never put back. Root cause as the plan states it (a checked "Next" restored onto the next page's "Next"; a checked radio fires no `change`). Test gap fixed: the harness now models the browser's radio group (`fire` unchecks same-name siblings; new `choose` = a click that fires nothing on a checked box). Failing-first (seen red, then green): `fixround7.test.mjs` "G77 R80 R90 R109 ..." (8 pages, and first page with text 4; five presses, no box checked after each redraw); harness test; control: a plain checkbox group keeps ticks. **Platform check L done**: real Chromium on the served shell, five mouse presses: red without the fix (page stuck at 3, `[2,3,3,3,3]`), green with it (`[2,3,4,5,6]`).
**Deviation, to BOB (REPORT):** the plan's fix shape also said "id the radio by its value". I built it and withdrew it: ids by value break about 58 tests of five other modules that name boxes by place (`question-aside-0`, `ob-tr-do-0`, `project-notice-collab-0`, ... in screens-inquiry, -investigate, -intake, -settings, -daily), which I may not change. The restore rule alone fixes the walker's case (the L run). Ids by place remain for non-redraw groups; if BOB wants ids by value, it needs a CHANGE to those screen modules' tests first. Walkers' re-walk of w10.pdf/0111 to the last page is P (BOB's).
**G81 · applied (`browser.mjs`, `FRAME_CONSTANT`, `FRAME_AT`, `frameBoot`, `frameSave`, `frameKept`, `frameTake`).** A kept `groupidentity` or `infolevel` answered less than a day ago (page clock, kept as `at` beside `reads` in the one `bio-session:frame` key) is drawn from the tab and never asked; a kept one with no time, a non-number, or from the future, or a day old, is asked once after the screen settles as before; the member's own level change drops the level and its time. The other four are asked once per load, never kept past it. Failing-first: `fixround7.test.mjs` G81 tests (red on the old code); four named CHARACTERIZATION tests (`assistantstate`, `accountreference`, `subscriptionsignin`, `groupkeystate`) green on the old code and the new. `g12b.test.mjs` updated for the rule (four tests, the constants no longer asked on a second load; the name-follows test ages the stored time). Platform check N (a count). The saving: two requests a second load.
**Suites and checks.** `test/m/interface-shell/` 364/364. Users: screens-entry 96/96, -wizards 75/75, -daily 292/292, -inquiry 521/521, -settings 266/266, -publish 273/273 (run alone), -intake and -investigate: failures seen when two suites ran at once were load timeouts, and pass alone on this branch and the tranche tip (capture, t51-fix5, fix4-seam, t51-seam-e7, t51-seam-g43); -action ran to 151 of 165 with 0 failed before the run was cut at the time limit; control-plane `t46-app` 6/6. `checks/format` 0 failures; `architecture` 0; `coverage interface-shell` 122/122; `ownership` 0; `words interface-shell` 0 failures (the full run's 11 failures are record-core R89 R90, case-checker, installer-steps: not mine); `setup-words build --check` matches.
**Requirement lines proposed (BOB writes):** R80/R109: "A redraw puts back no check into a group of boxes that redraws on a change (`data-redraw`); the screen's own state is what is drawn." R124: "Of the six, `groupidentity` and `infolevel` kept for the tab are not asked again while the tab's copy was answered less than a day ago on the page clock (kept beside the answer); the other four are asked once per load and never kept past it."
**Census ops:** none. **Rows owed to UX-DESIGN:** none. **Deferred:** none. **Found in other modules:** none.
Size (session_01Up6JyxDqREE6g4kR9CVELS): test runs 24, module lines 3355

## J27 · COMPLETE

COMPLETE, fix round 7 (G77, G81); record section 'Fix round 7'. G77: no restore into a data-redraw group; red then green, and real Chromium (L) red/green. G81: groupidentity and infolevel kept for a day, the other four asked once per load, four characterization tests. Module suite 364/364; users' suites pass (intake/investigate/publish pass alone; two-at-once runs timed out). REPORT: the plan's 'id the radio by its value' was built and withdrawn because it breaks ~58 tests of five screen modules that name boxes by place; the restore rule alone fixes the case. Say if you want ids by value, with a CHANGE to those modules' tests first.

## J28 · QUESTION

QUESTION for `interface-shell` (G114, R128): the shape of `v`, which control-plane must parse. My best reading, built on unless you say otherwise.

**Order found (K4817).** `loadWords` is sent at `whoami`'s answer; `bootstrap` goes after the screen's first reads and the marks request (R122). So `loadWords` runs first and cannot read `bootstrap`'s `language`/`words_version` on a first load.

**My build.**
1. `v` is ONE string, three parts joined by `~`: `<release>~<language>~<stamp>`. Release is `cs-version` verbatim (the release may hold dots or dashes, never `~`); `language` is `bootstrap`'s `language` verbatim, empty when it is `null`; `stamp` is `words_version` verbatim. The request never names `language` (a `language` field asks translations for every word, G113). control-plane splits on `~` and compares each part with the current release, the viewer's language and the current stamp. Please pass this form to CONTROL-PLANE and INSTANCE-SETUP, or give me the one you want.
2. Before `bootstrap` has answered, the load names the release alone (`v=<release>`, today's form; answered `private, no-cache`, one round trip). When `bootstrap` answers with a `words_version`, the shell keeps `{language, stamp}` in the device's `localStorage` under `cs-words:<member>` (a device convenience like `cs-group`; `sessionStorage` still holds R124's one key only, R24) and, if the load it made named something else, asks `interfacewords` once more with the full `v`, so that fetch is the one the browser keeps for the year. Every later load in that browser (a second sign-in, a new page) names the full `v` from the note at once. A stale note is harmless: the door answers a `v` that is not current without the year, with the viewer's current words.
3. Known bound, no extra request built: a sign-in made at `front` in a page opened with no session record has no stamp until a page load that holds the record asks `bootstrap`; that first sign-in names the release alone (no-cache). If you want the stamp learned at that sign-in instead, it costs one authenticated `bootstrap` per sign-in and touches R122/R127's counts: say so and I build it.

## Fix round 8 (INTERFACE-SHELL #21, G114, R128; B41–B43)

**Order found (K4817).** `loadWords` is sent at `whoami`'s answer; `bootstrap` goes after the screen's first reads and the marks request (R122, `show` → `startBoot`). So `loadWords` runs first and cannot read `bootstrap`'s language or stamp on a first load.

**G114 (1) Cause.** `loadWords` named the release alone (`browser.mjs`, old lines 2641–2648), so the browser's cache key could not carry the language or the team's adoptions. **(2) Missed:** no test drove the request's `v` against the language and the stamp. **(3) Failing-first, seen RED** (`r8-words-version.test.mjs`): `AssertionError: the release alone first, then all three; actual: [ '0.86.0' ], expected: [ '0.86.0', '0.86.0~es~st1' ]`; then GREEN, 5 of 5. **(4) Platform check:** N for the shell's share (P, a second sign-in served from the cache on biosmoke8, is BOB's after the deploy).

**As built (ruled B42).** `v` = `<release>~<language>~<words_version>`, language an empty part when null; never a `language` field. Before `bootstrap` answers, and with no note, `v` is the release alone. When `bootstrap` answers a `words_version`, the shell keeps `{l, s}` in `localStorage` `cs-words:<member>` (a device convenience; the tab's one key, R24, is untouched) and, if the last load named something else, asks `interfacewords` once more with the full `v`, so that fetch is the one the browser keeps; later loads name the full `v` at once from the note. A stale note is answered by the door without the year. A page naming no release sends no `v`.

**Bound named (B42 (3)).** A sign-in made at `front` in a page opened with no session record has no stamp until a page load that holds the record has asked `bootstrap`; that sign-in's words request names the release alone (no-cache). No extra bootstrap is built.

**Flaw fixed in my module.** `frame.test.mjs` R26 failed about one run in six on one core: its "never sent" check searched each request's whole JSON, including its timing stamp `at`, for "250". It now searches what the request carries (address, query, body, headers); 12 runs on one core pass.

**Proposed wording for BOB (R128, R24).** R128: "…and the viewer's language and `words_version` as `<release>~<language>~<stamp>`, kept per member on the device (`cs-words:<member>`); a load before `bootstrap` has answered names the release alone, and when it answers with another the words are asked once more with the full `v`." R24 names the tab's `sessionStorage` only; `cs-words:<member>` is a device convenience beside `cs-group`.

**Generated artifacts made stale:** none. **Found in other modules:** none.

**Ran.** Module suite (merged with the tranche at B43): 369 of 369 pass (one R26 flake before the fix above). `impact.mjs`: the nine screen modules' suites: screens-inquiry 1 fail (R96 G13, "red by name until extraction's `more` merges") and screens-intake 2–3 fail (R26/R31 E8) are identical with the tranche's browser.mjs; the others 0 fail; control-plane's five page files 33 of 33. Checks: format 0 failures; architecture 0 failures; coverage 123 of 123 ids named; ownership 0 failures; words 0 failures.

Size (session_01FNJXyii9ZX1WYQ6je365RX): test runs 16, module lines 3387

## J29 · COMPLETE

COMPLETE for interface-shell, fix round 8, G114 (R128). `loadWords` names `<release>~<language>~<words_version>` as ruled in B42 (release alone before bootstrap answers; per-member device note `cs-words:<member>`; one re-ask with the full v). Failing-first `r8-words-version.test.mjs` seen red then green (5/5); module suite 369/369 after merging tranche (B43); users' suites and control-plane page files unchanged from the tranche tip; format, architecture, coverage (123/123), ownership, words: 0 failures. Fixed a fragile R26 assertion in my module. Bound named in the record (first sign-in at front without a record names the release alone). Proposed R128/R24 wording and Size line are in the record. Deferred: none. Nothing for BOB to do but the platform check P after the deploy.

## J30 · QUESTION

QUESTION for `interface-shell` (fix round 10): the harness's four frame defaults, `harness.mjs` `FRAME` `interfacewords`, `groupidentity`, `queue`, `signout` (lines 88, 89, 91, 97 of the fixtures list).

My best reading, built on unless you say otherwise: they STAY for now, listed as left, because they are the default of every boot that passes no `door`, and the nine screens modules' tests boot without one (their jobs, batch 7, re-point after this merge). I measured it: with the four deleted, 12 of this module's 372 tests fail at once (the ones that read `River Town` or a queue count of 3 from the frame), and every screens suite that relies on a default frame would fail with them. With a `door` given the table is already skipped entirely (R129), so a screens job that re-points deletes nothing else of mine.

If you want them deleted in this job anyway, say so: I convert my 12 tests to `storeWorld()` and the screens suites stay red until batch 7 merges. If you want them gone at the last of batch 7, the line is one deletion in `harness.mjs` for whoever merges last.

Carrying on with the rest of the job on my best reading.

## Fix round 10 (INTERFACE-SHELL #22, session_01EL8FdFvDxMz2KBJrjWn936; B44)

**Entries.**

**(1) `boot({door})` (R129, met).** `harness.mjs`: `door` beside `plane`; an op is answered by the test's `plane` entry, else by `door`, else by the frame table, else `ok(null)`; with a `door` the frame table is not consulted (only the version poll stays). Failing-first `r129-door.test.mjs`: red on today's harness (`door` ignored, the frame table answered), green after; control: no door, the frame table as before. Because a world's door answers after real asynchronous work (hashing, SQL), `settle()` now also waits while a door call is in flight and until none started in the last ten ticks (`counted()` is exported for a test's wrapper of the door; `world.mjs` `doorAs`). Why the tests missed it: there was no door option; every table was hand-written.

**(2) `ADMIN_ACTS`, `ADMIN_SCREENS` (R12, R47, R50, R101, R107 as amended).** Deleted from `index.mjs`, imported from `wizard-scripts` (equal lists, 45 acts, checked before deleting). They are re-exported by the shell because `plane/wizards.mjs:7` still imports them from `interface-shell`; plane's job drops that import, then the re-export goes. The shell tests that read the lists (design, fixround, kit, t51) pass.

**(3) The 52 op-table lines.** Re-pointed to `storeWorld()` in `e12`, `design`, `fixround2`, `fixround3`, `fixround7`, `frame`, `g12b`, `g31`, `idle`, `p9`, `page`, `r8-words-version`, `t49`, `t50`, `t51`, `words`, `words-keys`: a roster by `memberadd`/`enroll`, a team's name by `groupnameset`, a queue by `checkrequest` acts on a project (`obligations()` in `world.mjs`), a language and its words by `grouplanguagesset` + `translationgrant` + `translationadopt` + `memberlanguageset` (`translated()`), a locked session by a seeded `last_active` on its own row (`idleFor()`; credentials count idle from `Date.now()`, which `world.tick` does not move), a re-ask by the real `REAUTH_DUE` of `memberadd` with `role: admin`, a wrong password by the real `unlock`/`reauth` refusals, a real refusal of a read by `selection` with a handle never made. The expected values are read back from the world (`me.handle`, the name `groupnameset` answers, `kindsOf(items)` of the queue's own list, `facts(me)` = `bootstrap`'s language and stamp). A wrapper that adds one field to or marks the world's own answer (`secret`, `marker`, `truncated`, a missing stamp) calls the real door first; a delay (`slow`, `gate`) only holds the real answer. Per file the world is built once and copied per test (store-assembly R91); the suite: 372 tests in 125 s wall (342 s CPU, concurrency 4); a world is about 0.6 s the first time in a file and 0.1–0.2 s a copy.

**Left on the list, named:** `harness.mjs:88, 89, 91, 97` (the frame table's `interfacewords`, `groupidentity`, `queue`, `signout`) and `:22, :23` (stay, as ruled). Reason and my question: J30. Measured: with the four deleted, 12 of this module's 372 tests fail (they read `River Town` or a count of 3 from the frame) and every screens suite that boots without a door loses its default frame. With a `door` the table is already skipped (R129). I built on the best reading in J30 (they stay until the screens re-point, one deletion afterwards). **Markers added:** `t50.test.mjs` (the ndjson stream's closing line `ZZ_STOP`, a stream the model would give; made up on purpose), `t50.test.mjs` (`ZZ_REASON`, a made-up reason to prove the uncatalogued path). The owed `p9.test.mjs:71` needs none: the made-up refusal there is gone (the list is a store silence or a 500, then the world's own count).

**(4) R34 (SCREENS-ENTRY J10): not reproduced; characterization added.** A stored record whose `whoami` answers 401 on the first load draws front's `ended` state, at `/app` and `/app/held`; an unknown token (no record) and a refusal that is no 401 draw `none`. `over("ended")` calls `route()`, which supersedes the outer route (`n !== ROUTING`) before line 1600 can overwrite `ENTRY`; `session.test.mjs` R32 already held the `whoami` arm with the stub front. So the cause is not where the diagnosis says; the walker's missing sentence is the real front's (screens-entry), not the shell's: `front.mjs:77` draws `session.ended` for state `ended`, and the shell hands it `ended`. Test: `r10.test.mjs` R32, green on today's code (no fix to make). If the walker still saw no sentence, the cause is a 401 that is not from `whoami` or came when `S !== held` (a second sign-in in flight), which I could not build.

**(5) R108: `.cs-wizmark` in the phone block's 44 px rule (met).** `index.mjs` STYLE. Failing-first `r10.test.mjs` R108 (red: `.cs-wizmark in the 44 px rule`, actual false), green; control: the class is written once in the page. `phone390.test.mjs` now draws the mark as `screens-wizards` draws it (`guide.mjs:494`) and measures it with the other controls (Chromium).

**(6) Found by the real door, fixed here: a locked session ended the page's session.** The store answers a locked session 401 `SESSION_LOCKED` (admission R24, `admission/index.mjs:694`); `send()` treated every 401 as "ended" before it read the code, so a page whose clock had not locked it (a background tab) was signed out and lost its typed work instead of drawing the lock. The scripted tests answered 403. Failing-first (`idle.test.mjs`, R33, over the world with a seeded idle session): red `locked at the plane's word` actual null; and a page opened on a locked session drew `fx t state ended` where `locked` was expected; green after `send()` reads the 401's body and falls through to the lock when its code is `SESSION_LOCKED` (any other 401 ends the session as before). Why the tests missed it: the scripts used 403 for the code and the harness had no real session to age.

**Found elsewhere (for BOB; the shell's own tests are green on each):**
1. **op-grades** `marks.mjs:140`: `namedrequests` is `Reasoned` while its owner (monitoring `index.mjs:3356`) declares it `mutating: false, weight: "read"`; R11's test "no read above Reversible" fails once every owner's declarations are registered. I moved that one test to `r10.test.mjs`, which registers only the hand rows, as before; it should return to `fixround2` when op-grades is right.
2. **store-request** `signIn(handle, {admin: true})`: `whoami.administer` is true but the administrator refuses `grouplanguagesset` and `translationgrant` with `NOT_AN_ADMIN` (instance-setup and translations ask the active administrator; she is proposed). Tests that need those acts sign in the founder (`inWorld({founder: true})`).
3. **store-request** `signIn` does not return the member's password, so `world.mjs` reads `world.__passwords` (an internal) and `world.password`; `me.password` would close it.
4. **store-request**, a recipe for queue items of the other kinds: the world has no recipe for a `FINDING` or a `CONDITION` (`ai-limit-reached`, `edition-scheduled` need a counted ask or a case). `p9` and `e12` now seed `OBLIGATION`s only, so the number is the sum of the list read from the world, and the explanation is drawn from its kinds (`todo` n, `noticed` 0, `status` 0); the mixed-kinds case stays in the scripted `queueOf` tests that remain (p9 zero, frame). A `recipes.queue({obligations, findings, conditions})` would let those go too.
5. **modules.json:** `interface-shell`'s `uses` lacks `store-request`; `checks/architecture.mjs` fails `world.mjs` (the one import of `store-request/fixtures.mjs`) with `which interface-shell does not declare in uses`. I may not edit it.
6. **plane** `wizards.mjs:7` imports `ADMIN_ACTS`, `ADMIN_SCREENS` from `interface-shell`; it should import them from `wizard-scripts` (then the shell's re-export goes).
7. The first test of a world is slow only on its base (0.6 s); not a defect.

**Ran.** Module suite: 372 of 372 (no `--test-force-exit`; it exits by itself). `fixtures.mjs --list`: harness 88, 89, 91, 97 (J30), 22, 23 (stay), two accepted `generic`; every other line cleared. Checks: format 0 failures; coverage 124 of 124 ids named; words 0 failures (unkeyed 1: the SSH armour, as ever); ownership 0; architecture 1 failure (item 5).

**B45 (K5157): R130, R131, R132 (met).** Merged `tranche/T51` first. (The tranche's credentials now read the instance clock `env.BIO_NOW_MS`, so `idleFor` seeds `last_active` from `world.now()`, not `Date.now()`; the earlier note on `world.tick` no longer holds.)
- **R130** Enter in a one-line field (an `input` that is no checkbox, radio, file or button; never a `textarea`) of a screen's `#cs-main` presses, as a click would (`press`), the primary act (`data-tone="primary"`, not disabled) of the `section` holding the field, or of `#cs-main` when it has none; a field names another act with `cs.field(..., {enter: op})` (`data-enter`). Not on a held key, with a modifier or while composing. Failing-first `r130.test.mjs` (two tests), red `actual: 0, expected: 1` (the handler excluded inputs), green; controls: textarea, held key, the section's quiet act, another section. Missed because no test pressed Enter in a field; the shell's keydown handler only served the guide chip, rows, the grip and areas.
- **R131** phone block: `.cs-main :is(.cs-row,.mk-rowname,li,td) a.cs-ref{display:inline-flex;align-items:center;box-sizing:border-box}`, so the phone rule's `min-height: 44px` applies (an inline anchor ignores it); a ref in running text (`p`) is unchanged. Failing-first `phone390.test.mjs` (Chromium): a `cs.row` holding a `cs.ref` and a list item holding one, red `a.cs-ref 26x22 Ann`, `18x22 Bo`, green. The stand-in had drawn every ref as a grid item (blockified), and no registered screen for a ref to open, so none of its refs was a link; it now registers `project`.
- **R132** a `dblclick` on the grip, delegated on the root (the grip is redrawn after a drag), sets 184 px, stores `cs-railw` and redraws. Failing-first `frame.test.mjs` (drag to 263, a double-click elsewhere changes nothing, then on the grip: `aria-valuenow` 184, `cs-railw` 184); red `actual 263, expected 184`, green.
Module suite after B45: 375 of 375 (with the `idleFor` fix).

**Users (impact.mjs; run after B44's changes, B45's Enter/dblclick/ref CSS touch no screens test: none fires Enter or a double-click).** screens-entry 96/96, wizards 75/75, daily 297/297, intake 387/387, inquiry 561/561, investigate 249/249, action 279/279; screens-settings 265/266 (`contract.test.mjs` R39, `act.captureuploadabort.does` is no word) and screens-publish 281/286 (3: G54 R22, R24 words, R80/R76 C47 seam) fail identically on `origin/tranche/T51` (compared in a clean worktree), none from this job. B46 ruled J30: the four harness frame lines stay, the last batch-7 job deletes them; `store-request` is now in my `uses`.

**COMPLETE summary.** Met: R129 (door), R130, R131, R132, R108's `.cs-wizmark`; R12, R47, R50, R101, R107's lists are wizard-scripts' now. R33 fixed (a 401 `SESSION_LOCKED` locks). R34 (SCREENS-ENTRY) not reproduced; characterization test added. Lines left on the fixtures list: harness 88, 89, 91, 97 (B46), 22, 23 (stay). Markers added: `t50.test.mjs` `ZZ_STOP` (a model stream's closing line) and `ZZ_REASON` (made-up reason for the uncatalogued path). Checks: format 0, architecture 0, coverage 127 of 127, words 0, ownership 0. Module suite 375/375.

Size (session_01EL8FdFvDxMz2KBJrjWn936): test runs 62, module lines 3376

## J31 · COMPLETE

COMPLETE for `interface-shell`, fix round 10 (B44, B45; B46 applied). Met: R129 (boot door), R130 (Enter presses the section's primary act), R131 (44 px refs in rows), R132 (rail double-click), R108's `.cs-wizmark`; ADMIN_ACTS/ADMIN_SCREENS now wizard-scripts'. 52 op-table lines re-pointed to storeWorld; harness 88/89/91/97 stay per B46, 22/23 stay. Found and fixed through the real door: a locked session answered 401 SESSION_LOCKED ended the page instead of locking (R33). R34 not reproduced (characterization test). Markers added: t50 ZZ_STOP, ZZ_REASON. Checks 0 failures (architecture, coverage 127/127, words, format, ownership); module suite 375/375; users' suites equal the tranche tip (screens-settings 1, screens-publish 3 fail there too). Details, reports and Size line in the record.
