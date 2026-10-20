# interface-shell (T51)

**Status** · session_018RtYmRfvBFKT71cztJSVMH · depth 2 · WORKING · handled B17

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
