# interface-shell (T51)

**Status** · session_01TP4eDyx3cz3mY4jPr8VbyZ · depth 2 · WORKING · handled B22

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
