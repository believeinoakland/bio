# journey-check (T51)

**Status** · session_01MdLNC4RWKfjZejBoGhZ5iF · depth 2 · WORKING · handled B15

## Completion record (JOURNEY-CHECK #7)

**Entries applied (T51-131)**
- Words: walker.mjs refusal sentences and the three step-label test copies, the two runner/live test copies, converted or compared by equality; my two R17 rows reworded ("retired word", ids `journey-check.walker.pathname_uses_the_retired_word`, `.the_designs_rule_for_the_retired`; the old ids stay in `rows.mjs` until BOB regenerates it). `group.test.mjs` :30 and :68 now use fixture text of the test's own. After B2 (DEC-355) `group.test.mjs`:19 fails only on those two stale ids.
- R20: one switch, `assistant` (default false; `--assistant` on the command line). Off: R9 steps 4, 9, 10, 11, all of R10 and journey 29's five `only: "ai"` steps are `walk.notWalked(...)` notes; each screen's not-ready state is asserted (`notReady`: no `subscriptionsignin`, `disclosureshown`, `accountconnect`, `airunopen`, `planask`, `ask` act and no dock button; a reason drawn is never a code); 13 of 18 pairs. R9 step 12 is made on the member's own reading. R11/R15 controls are re-scoped to the switch (set, and fault bound: step 9 fails by name, or the walk says where it stopped).
- R22: `EXCEPTED` is `site` alone; `walkDashboards` opens `dash-project` and `dash-action` from Home's doors in both arms. R23: `firstPage` step and the `PAGE_ZERO` scan on every step. R25: `walkSignGone`; the `OLD_PAGE` trip-wire unchanged. R26: asserted by the existing GROUP scan.
- R21: `states.mjs` (20 carried states, the mock's own controls via `designMock.drawState`) and pairs where a `reach` function puts the live screen in the state. R24: `published.mjs`, case path from `JOURNEY_PUBLISHED_CASE`. R27: `pseudo.mjs`, pseudo words made in memory (`pseudo` of setup-words' build) into the served page; reported once per text. R28: `checks.mjs` (title, weight marks on the nine public pages, masthead name, covering explanations, Projects' names, no-connection person), live arm at both widths plus `publicPass` signed out.

**Deferred, and why**
- R21: no `reach` function is written for any state yet, so every state is a note "not reached on this instance" on both arms (the requirement says the local arm fails by name; I did not make the local arm red for 20 states I cannot yet reach). Each needs the live screen's own DOM markers; BOB's call whether a follow-up job writes them.
- R24/R28: selectors for the published controls, the graph and the Explore door are my reading of the words and shell source; confirm on BOB's live walk. R28's "four new screens' drawn states" ride R21's states.
- Plain labels (my new step labels, states table) stay in source as walk text; listed in the REPORT.

**Found in other modules (REPORT to BOB)**
1. `connect` draws `disclosureshown` (and then `subscriptionsignin`) while the plane has no sign-in route: R20's not-ready assertion fails by name on R9 and R10 (screens-settings / signin-door).
2. `dash-project` draws "Nothing is here" from Home's door (R22's control; screens-inquiry R79).
3. `/sign` still answers 200 with a non-interface page (R25; control-plane T51-123/124).
4. R27 finds hard-coded sentences, mostly the setup screen's scanner labels ("MetaDefender Core server address" ...), "City of Oakland and Alameda County", and others on home, security, places, group, elsewhere, finder, held, people.
Accepted reds by name until those land: R1 (a) (aggregate), R20, R22, R25, R27.

**Tests and checks**: format 0 failures; architecture 0; ownership 0; coverage 27 of 28 (R19, conditional, unmet). Words check: the old plain findings plus my new labels, listed in the REPORT.

Size (session_01DySLHCA8d6vPi2gDtHEtm3): test runs 9, module lines 3226

## J1 · COMPLETE

T51-131 applied; details in build/jobs/T51/journey-check.md ("Completion record").

Done: words findings; R17 fixtures and my two rows (old ids stay in rows.mjs until you regenerate); R20 (one switch, assistant steps noted not walked, 13 of 18 pairs, not-ready asserted); R22, R23 (passes), R25, R26; R27 pseudo walk; R28 checks; R21 mechanism + 20 states; R24 (JOURNEY_PUBLISHED_CASE).
Checks: format, architecture, ownership 0 failures; coverage misses only R19 (conditional). B2 merged.

Defects found in other modules (accepted reds by name until fixed): (1) connect draws disclosureshown/subscriptionsignin while no sign-in route exists: R20 fails on R9 and R10 connect; (2) dash-project draws "Nothing is here" from Home: R22; (3) /sign answers 200 with a non-interface page: R25; (4) R27 finds hard-coded sentences: setup screen's scanner labels (MetaDefender, ICAP, Glasswall, Splunk...), "City of Oakland and Alameda County", and more on home, security, places, group, elsewhere, finder, held, people. R1 (a) is red in aggregate for these.

Deferred for your call: R21 has no per-state reach functions, so all 20 states are notes "not reached on this instance" on both arms (not failures); R24/R28 selectors for published controls, graph and Explore are my reading, confirm on your live walk.
Words check still lists the 8 old plain strings plus my new walk labels and the states table, all harness text no member reads (for the design's unkeyed list, K3944), and ADMIN_READING (walk data).

## J2 · REPORT

REPORT (answers B3). B3 applied: connect's disclosureshown/subscriptionsignin are classified as the assistant's own step (noted not walked, no failure); R27 excludes jurisdiction profile names (read from jurisdictions/profiles), record references (a.cs-ref), the `elsewhere` directory (profile data) and the scanner catalogue's row names on security. Pushed.

NEW BLOCKER for my local arm (not mine): at tranche tip the install stops at "install: each step finishes": installer `readGroup` (newgroup/src/index.mjs:918-922) reads `j.group` at the top of the copy's `op=instancegroup` answer, but the plane answers {"ok":true,"result":{"ok":true,"group":"lakeshore-tenants"},"store":"bio"} (group under `result`). The installer reports "did not record the short name" though the copy holds it. Owner: installer R78 against instance-setup/control-plane's envelope; one of them reads or writes the wrong shape. Until fixed, journey-check's local arm cannot reach the copy (R1 (a), R9..R27 local tests all red on it); I cannot re-run them after B3. Please route and send CHANGE when merged.

R27 escaped texts (last full local walk, 1280 px; the 390 px pass repeats them), by screen, with the module that draws them:
- setup (36): form labels from the scanner provider catalogue, file-scanner/src/providers/catalogue.mjs (file-scanner's words finding, setup-words R13): "Azure storage account name"; "Blob container the files are scanned in"; "Cloudflare account ID"; "Connect over TLS"; "Data collection endpoint host"; "Data collection rule immutable ID"; "Glasswall Halo API address"; "Google Cloud project ID"; "ICAP server address"; "ICAP service name"; "Index the counts are written to"; "Log type the counts are imported as"; "MetaDefender Core server address"; "Microsoft Entra tenant ID"; "Path on the endpoint"; "Sandbox environment ID"; "Splunk HTTP Event Collector address"; "Stream name in the rule"; "Syslog collector address"; "The engines the tool runs, as its maker names them"; "The tool's statement of what it receives, keeps and shares"; "Where that statement is published"; hints "default civicsmith-security-counts", "host, or host", "one of cloud, core", "one of global, eu, jp, sg, uk, ca, au", "one of us" / "one of us, de" / "one of us, de, au" / "one of us, europe, asia-southeast", "over TLS, unless named", "the collector listens on", "yes or no"; legends "google-web-risk", "opswat-deep-cdr" (slugs drawn as text: also an R6 slug finding). Element: label / legend. Screen module: screens-settings draws them from the catalogue (the sentences live in file-scanner).
- held (1): span.meta "roof-repairs-at" (a slug drawn as text; screens-intake). 
- elsewhere ("Report-an-Issue-OAK", "get-legal-help", the *-Hyphenated-Names in span.muted): profile link slugs drawn as text (screens-daily or jurisdictions data): slugs, an R6 finding if a member sees them.
Not counted now, as data: profile display names, a.cs-ref record kinds ("Firsthand observation, observed"), the elsewhere organisation names, descriptions and addresses, the security catalogue row names ("Light and above" and the vendor names among them).

Harness text for the design's unkeyed list (K3944), no member reads it: step labels (investigation.mjs: "document: its first page reads Page 1", "document: the capture states no page, so none is drawn", "assistant not ready: the connect screen" / "the question's dock" / "the Ask screen" / "her connect screen" (run.mjs x2); journeys.mjs: "sign: /sign answers the nothing-is-here page", the 3 old labels at :197 :212 :328; published.mjs: "published: no case on this instance", "...a minimum strength, the filtered view and the way back", "...a finding's page, and back", "...Print the case, the browser's print stubbed"); the states table in states.mjs (descriptive state names, 7 flagged); diagnostics run.mjs:278 and :360, runner.mjs:94, :99, :100; ADMIN_READING (investigation.mjs, walk data typed into a form).

## B4–B6 (CHANGE K4105, K4107, K4111)
Merged `tranche/T51`; R1 (a) and the six tests after it were not run (B6, accepted red until BOB's one walk). Module's own suite without journey.test.mjs: 76 pass, 0 fail (group.test.mjs :19 now green after DEC-355). Checks: format, architecture, ownership 0 failures; words 0; coverage misses only R19.
Findings of the K4105 run, and their tests:
- R27 on `elsewhere`/`places` profile values: data (`pseudo.mjs` DATA, `[data-screen="elsewhere"|"places"] li`); test "R27 (K4086, K4111)" in dec340.test.mjs (profile values and the profile's display name not reported; a hard-coded sentence beside them reported; control).
- R27 on vendor/product names: data (`.mk-rowname`, `a.cs-ref`); same test (vendor names not reported, control).
- R27 on `setup` catalogue labels: file-scanner's (CR-17), not mine.
- `investigation.mjs`:422 fixture text: the walk's own reading is now `NOTICE_PASSAGE` (city.mjs fixture), no inline sentence; words check 0.
- `document` heading: step requires `document.read.title` (B5); same test requires it and rejects "Passages"; words.test.mjs key list updated.
- `dash-project` from Home: screens-daily's; my step unchanged (R22).
Other `setup`/screen strings that are neither profile data nor the catalogue: none left on `setup` except the legends "google-web-risk", "opswat-deep-cdr" (provider ids drawn as text: file-scanner catalogue / screens-settings). "Light and above" and "stated by the administrator" are catalogue row texts on `security` (file-scanner catalogue; excluded as `.mk-rowname`, so if BOB wants them keyed they are file-scanner's). Also not covered by me: `held` span.meta "roof-repairs-at" (a slug drawn as text; screens-intake) and `elsewhere` link slugs ("Report-an-Issue-OAK", "get-legal-help": profile data drawn as text).

## J3 · COMPLETE

COMPLETE (B4, B5, B6 applied). Findings of the K4105 run and my tests: R27 elsewhere/places profile values and R27 vendor names -> data classes in pseudo.mjs, test "R27 (K4086, K4111)" (dec340.test.mjs: profile values, profile name and vendor names not reported; hard-coded sentence beside them reported); investigation.mjs:422 -> reading is now the fixture's NOTICE_PASSAGE, words check 0; document heading -> step requires document.read.title, same test and words.test.mjs; setup catalogue labels -> file-scanner's CR-17; dash-project -> screens-daily. Own suite (without journey.test.mjs, per B6): 76 pass, 0 fail; group.test.mjs:19 green. Checks: format, architecture, ownership 0; words 0; coverage only R19.
Remaining strings not profile data or catalogue: none on setup but the legends "google-web-risk" and "opswat-deep-cdr" (provider ids drawn as text; file-scanner catalogue / screens-settings). "Light and above", "stated by the administrator" are catalogue row texts on security (file-scanner; I exclude them as .mk-rowname). Not covered by me: held span.meta "roof-repairs-at" (slug drawn as text, screens-intake) and elsewhere link slugs ("Report-an-Issue-OAK", "get-legal-help"; profile data drawn as text). Details in build/jobs/T51/journey-check.md.

## Completion record (JOURNEY-CHECK #8, CR-25)

**Entries applied**
- R22 (amended): `walkDashboards` (`journeys.mjs`) waits for Home's Investigation block, then opens `dash-action` from its door; when Home draws no Action block (DEC-219 (3), `screens-daily` R17) it asserts none is drawn (`[data-area="action"]` absent; an Action block drawn without its door fails by name), writes the note `ACTION_BLOCK_NOT_DRAWN` ("Action block: not drawn, the team holds no action", a `localize` sentence) and opens `dash-action` by its address. Fixture Home `doors: "project"` (no Action block) and `doors: "blockonly"` (block without door) in `fake-plane.mjs`; test "R22 (live arm)" in `live.test.mjs` (ok, `"project"` passes with the note, `"blockonly"` fails by name, `false` fails). R20's control echo was R22's failure in `stepFailures` and clears with it (no code of its own).
- R29 (`pseudo.mjs`), read from the real screens: (a) `pseudoRoute` now also answers the copy's `fetch`/`xhr` (JSON) with every keyed sentence made pseudo (`pseudoValue`/`pseudoString`: exact sentences of the list, and sentences with placeholders by pattern, a pattern needing 8 literal characters), beside the documents' word pairs; (b) `DATA` rewritten to the markup the real screens draw (`a.cs-ref`; `elsewhere`'s `.cs-row`; `places`' profile list, chooser `label[for^="pl-p-"]` and `.rec`; `#cs-main .mk-rowname`; `setup`'s `fieldset.mk-checks > legend`; `security`'s `dl[data-handling]`), and a pseudo sentence with the values filled into it (an outermost `[...]` holding a pseudo letter) is not an escape (`withoutPseudo`, applied per block so a value in a child element is inside its sentence); (c) `security`'s catalogue fold (`[data-screen="security"] details[data-fold="add"]`) is opened before the page is read. `run.mjs` unchanged (same calls).
- Group map (K4146): A = R22 above. B (`setup`'s catalogue read through `securitytoolcatalogue`) = (a) the fetched answer is pseudo, plus `setup`'s tool legends and `security`'s handling `dl` as data; the closed fold = (c). C (`elsewhere` `cs.row` divs; `places`' chooser labels with `covers`) = DATA. D (comma lists, fills of three words or more) = `withoutPseudo`.

**Proof (R29, `pseudo.test.mjs`)**: the REAL `setup`, `security`, `places`, `elsewhere` and Home (a team holding three places and three languages, with projects and a queue item so Home draws its areas) drawn through `interface-shell/harness.mjs`, over the real catalogue (file-safety's `securityToolCatalogue` through its `world()` fixture, file-scanner's providers) and the Oakland profile's own pointers, name and covers, under `pseudoBody` and `pseudoValue`, then read in Chromium with the interface's stylesheets: `escapedOnPage` reports none; each control puts a hard-coded sentence beside the data (inside the closed fold for `security`) and it is reported by screen and element; a catalogue answer left plain is reported on `setup`. A mutation check (DATA entries removed) fails the tests. `dec340.test.mjs`'s K4086 test, which invented `<ul><li>` markup for `elsewhere` and `places`, is replaced by the same proof on the real screens.

**Not run (K4111/B6-style rule of the round)**: `journey.test.mjs` (the walk), by BOB once.

**Other screens that draw fetched or filled text the walk could still report**: record text the walk did not type (project names, queue summaries on Home) is data only through the walk's `entered` list (the test passes its own); any other screen whose text arrives in a fill of a keyed sentence is inside that sentence's brackets and not reported. A fill of a word that is only its placeholder (`{field}`) is pseudo only when the value was keyed at its source (catalogue labels are, through the route). `held`'s slug and `elsewhere`'s link slugs are inside `.cs-row`/data. None found beyond these.

**Checks (CR-25)**: module suite without `journey.test.mjs` 83 pass, 0 fail (`pseudo.test.mjs` 7); format 0, words 0, ownership 0; coverage misses only R19. **Architecture: 8 failures, all `pseudo.test.mjs` imports** that `modules.json` `uses` for journey-check does not declare (interface-shell incl. its harness, interface-assets, screens-entry, screens-settings, screens-daily, file-safety's fixture, jurisdictions' Oakland profile). R29 requires the proof on the real screens through the interface harness, so the imports are the requirement's own; `uses` is BOB's file. Asked in QUESTION J4.

Size (session_01KEmRQzhT6pHFHNAtagKobP): test runs 8, module lines 3358

## J4 · QUESTION

CR-25 is done and pushed (R22 Action block by address; R29 pseudo walk proved on the real screens, pseudo.test.mjs; suite 83/83; format, words, ownership 0; coverage only R19). One red: architecture, 8 failures, all pseudo.test.mjs imports not in journey-check's uses in modules.json (interface-shell + its test harness, interface-assets, screens-entry, screens-settings, screens-daily, file-safety's test fixture, jurisdictions' Oakland profile). R29 requires drawing the real screens through the interface harness with the real catalogue and Oakland profile, so I need them. Please add them to journey-check's uses (modules.json is yours), then send CHANGE to re-run architecture; my best reading is that this is the only way to meet R29. Nothing else is open.

## COMPLETE (CR-25, after B8)
Merged `tranche/T51` (modules.json `uses` now covers the test's imports). Architecture 0, ownership 0, words 0, format 0; coverage only R19. Suite without `journey.test.mjs`: 83 pass, 0 fail; `pseudo.test.mjs` 7 pass after the fold narrowing.
Groups: A (Home without an Action door) → "R22 (live arm)" in live.test.mjs (`doors: "project"` passes with the note, `"blockonly"` fails); B (fetched catalogue sentences, `setup`/`security` data, closed fold) → pseudo.test.mjs "R29 (a)", "`setup`", "`security`"; C (`elsewhere` rows, `places` chooser with covers) → pseudo.test.mjs "`places`", "`elsewhere`"; D (comma lists, multi-word fills) → pseudo.test.mjs "R29 (b)" and "Home".
Size (session_01KEmRQzhT6pHFHNAtagKobP): test runs 9, module lines 3358

## J5 · COMPLETE

COMPLETE (B8 applied, tranche merged). R22 (Action block by address, noted) and R29 (fetched sentences pseudo, data by real markup, fold open) met. Groups: A → R22 (live arm) test in live.test.mjs; B → pseudo.test.mjs R29 (a), setup, security; C → pseudo.test.mjs places, elsewhere; D → pseudo.test.mjs R29 (b) and Home. Suite 83/83 without the walk; architecture, ownership, words, format 0; coverage only R19. Other screens: record text not typed by the walk (project names, queue summaries) counts as data only via the walk's entered list. Size (session_01KEmRQzhT6pHFHNAtagKobP): test runs 9, module lines 3358.

## Completion record (JOURNEY-CHECK #9, B9: FR-34 group E)

**Entries applied.** E (walk-E-trace): `pseudoString` remembers each string's answer in a module-level `Map`, and tries a sentence pattern only when the string starts with its first literal part, ends with its last and holds every other (kept on the pattern as `first`, `last`, `parts` when `sentences()` builds it); the result is the one of trying every pattern. `sentencePatterns()` is exported so the test can try every pattern as its reference.
**R30 line.** The START asked me to write it first, but the ownership check refuses `build/requirements/journey-check.md` as outside my paths (mechanics §7: requirements are BOB's), so I did not commit it. For BOB to place on the tranche branch (the header's "Last changed" line to name FR-34 too):

- **R30** *(not yet met: T51)* (T51 FR-34; K4161 group E, `build/plan/deadends-T51/walk-E-trace.md`; amends R29 (a)) **Making an answer pseudo is cheap.** Making an answer pseudo costs, for a body shaped like the `interfacewords` answer (about 67,000 strings: rows of `{key, text, en, fallback}`), at most 1,000,000 sentence-pattern tries, none for a string it has already made, and gives the same result as trying every pattern, so the walk's event loop is not held for seconds on each page (the stall that cancelled R1 (a)). Test: a body shaped like `interfacewords` through `pseudoJson`, with `RegExp.prototype.exec` counted for the anchored sentence patterns, tries at most 1,000,000 and a second call tries none and answers the same, and every string of it gets the result of trying every pattern; 300 sampled rows with placeholders, filled with a value, are still made pseudo (`escapedIn` finds nothing). Control: a string that is not a sentence of the list is left as it was.

**Tests.** `pseudo-cost.test.mjs` (a file of its own, so it runs without a browser and in a process where no string has been made yet; every title names R30): the budget (a body of 22,457 rows of `{key, text, en, fallback}`, 67k strings with a value filled into each, through `pseudoJson`: seen failing before the fix at 61,136,545 sentence patterns tried, passing after at no more than 1,000,000; the second call tries none and answers the same); the equivalence (every string that reaches the patterns gets the first matching pattern of the whole list); 300 sampled placeholder rows filled and still made pseudo (`escapedIn` finds nothing), control: non-sentences left alone. The walk was not run (K4111).
**Run.** pseudo-cost 3 pass; pseudo.test.mjs 7 pass; dec340 10 pass; words 3 pass; group.test.mjs 4 pass, 1 fail (below, not mine).
**Checks.** format 0 failures; architecture 0; words 0 (journey-check); coverage 28 of 29 live ids named (R19, conditional, unmet; R30 joins once BOB writes it); ownership 0 once the requirements file is out of my diff.
**Deferred.** None.
**Found in other modules.** `group.test.mjs`:19 (R17's row scan) fails on 15 rows of other modules, none mine: ai-accounts 5 (`declared.aikeepaway`, `declared.groupkeynoticeseen`, ...), intent 2, local-facts 3, strength 2, translations 3: rows of the declaration pass that say "group" for a team and are neither in `GROUP_SENSE` nor a `words.json` "team" row (the DEC-355 route, K4066). The failure does not depend on this job's change.

Size (session_01GuUGRavFSjzJBKRHYJajpp): test runs 7, module lines 3372

## J6 · COMPLETE

COMPLETE (B9, FR-34 group E). pseudoString remembers each string's answer (module-level Map) and tries a sentence pattern only when the string starts with its first literal part, ends with its last and holds every other; same result as trying every pattern. Test pseudo-cost.test.mjs, every title naming R30: a 67k-string body shaped like interfacewords through pseudoJson failed before at 61,136,545 pattern tries, passes after at <= 1,000,000, a second call tries none and answers the same; every string gets the all-patterns result; 300 filled placeholder rows still pseudo; control non-sentence untouched. Walk not run.

FOR YOU: R30 is not in build/requirements/journey-check.md: the ownership check refuses that file as outside my paths, so I left it out of my branch. Its line (ready to paste) is in my record under 'R30 line'; test names carry R30, so coverage reads it once you write it. Checks: format 0, architecture 0, words 0, ownership 0, coverage misses only R19 (conditional) plus R30 until written.

REPORT: group.test.mjs:19 (R17 row scan) is red on 15 rows of other modules, not mine and not caused by this change: ai-accounts 5 (declared.aikeepaway, declared.groupkeynoticeseen ...), intent 2, local-facts 3, strength 2, translations 3: declaration-pass rows saying 'group' for a team, in neither GROUP_SENSE nor a words.json 'team' row (the DEC-355 route, K4066).

## J7 · COMPLETE

COMPLETE (B10 CHANGE, K4295). Pushed `0e0fa0d6c2` on `job/T51/journey-check`.

**Entries applied.** `bio-plane/test/m/journey-check/pseudo.test.mjs`: the owners' declared ops are registered before any screen is loaded, through `screens-settings/register.mjs` (the suite the screens' own tests use, so `expertisewithdraw` is in `OPS`). The screens and the other modules are now imported after it (`await import(...)`), as `routed.test.mjs` does. Two attempts first, both recorded: a direct `registerDeclared` call at the top of the file failed ("registered after the first read (R81)", because a static import had already read the table); a static import of the screens after it failed the same way. Every control is unchanged; only the import order changed.

**Deferred.** None.

**Found in other modules.** None new. Coverage outside my module (not mine, not touched): agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31.

**Tests.** `pseudo.test.mjs`: 7 pass, 0 fail. `group.test.mjs`: 4 pass, 1 fail (R17, the expected red, T52, K4269); R17's other four tests pass.

**Checks** (run from the process repository on `/home/user/bio`): format 0 failures; architecture 0 failures (an earlier version importing op-declarations and test-support directly was refused as undeclared in journey-check's `uses`, so it now goes through screens-settings, which `uses` declares); words 0; channels 0; ownership `journey-check tranche/T51 job/T51/journey-check` 0 failures (one file changed: `pseudo.test.mjs`); coverage: journey-check R19 is the only id unnamed (conditional, unmet, as before).

Size (session_01Fueqh9zRCDKCheePb5TyFi): test runs 5, module lines 3372

## Working record (JOURNEY-CHECK #11, B11: fix round 4, wave 1; K4435)

**Cause 1: the local arm's moved fixture** (R1 (a)).
1. *Root cause.* The fake account (`account.mjs`) answered `containers/applications` with `[]`, the Durable Object namespaces with the one class `Store` for every script, and no `schedules` PUT. The installer's container members (agent-runner, file-scanner) therefore found no namespace for their classes ("no place set up for it to run") and the schedules PUT fell through to the unanswered 599, which the installer retries for its five-minute bound: the page's load did not end, so journey 28 step 6 timed out at 180 s. Reproduced in 2 s, without a browser, by driving the installer's own routes in process over `fakeAccount` (the fleet line said `2 left out: agent-runner (…no place set up…); file-scanner (…)`).
2. *Why missed, and the test-gap fix.* The fake was not updated when the installer began creating container applications; the installer's job ran its own fixture, not the local arm. New `account-installer.test.mjs` (R1 (a)): the installer's whole install runs over `fakeAccount` with the waits immediate; `account.unanswered` must be empty (a new call fails at once, by name), every member of the installer's own `RELEASE_MANIFEST.fleet` must be installed, and an application must exist for every class of every `Container` part, read from the manifest's descriptors as the installer fetches them. Control: with the application create hidden, the member is left out and the page says so.
3. *Red first.* Before the fix: test 1 failed `agent-runner is installed: 4 installed (…); 2 left out: agent-runner (…); file-scanner (…)`; test 2 failed `agent-runner AgentRunner: an application on docker.io/civicsmith/agent-runner@sha256:78b09547…`. After: 3 pass.
4. *Platform check.* L: the local arm itself (Miniflare), run five times (below).

**The local arm, run for what it then showed** (each defect below was behind the one before it; all are in this module):
- journey 28 now passes steps 1 to 8 (installer, hand-over); first run after the fixture: `the invitation form has no choice to let her start projects`: `journeys.mjs` named `#mi-cap-create_projects`, which `members` does not draw (it draws `input[name="mi-caps"][value="create_projects"]`). Fix: `START_PROJECTS_BOX`; test `invite-box.test.mjs` (R9), red (selector missing), green, with a control selector.
- 1,421 R27 reports "escaped the word list" on every screen: since interface-shell's fix round 3 (R1) the page's words stand in the shell's versioned external script, not the document, and `pseudoRoute` rewrote only documents and fetches. Fix: the route also answers a script of the copy's host through `pseudoBody`, and drops the document's `integrity` attribute on the script tag (the hash is of the English script, which a browser refuses the pseudo one against). Test `pseudo-route.test.mjs` (R29 (a)): red (route fell back on the script; integrity kept), green; controls: another host's script and a style sheet fall back, another tag's integrity is kept.
- R9 step 2: "Start a project" now asks who can find the project and chooses neither (`screens-daily` `start-project.mjs`); the walk's click found no project. Fix: the walk reveals the folded form and chooses hidden (`START_PROJECT_VISIBILITY`); test `start-project.test.mjs` (R9), red then green, against the real Projects screen through screens-daily's harness; it also asserts the screen refuses with neither chosen.
- R9 step 12 and R16: the question page now requires a reason before it concludes (`question-conclude-reason`). Fix: `concludeFields` gives it. Its test (`conclude-fields.test.mjs`, red then green at 371f901d77) needs `screens-inquiry` in journey-check's `uses`, which `modules.json` does not hold, so the architecture check refuses it; I withdrew the file (it is in history at 371f901d77) and ask BOB for the edge (QUESTION J8).

**Cause 2: R30** (`pseudo.mjs`).
1. The cap `s.length > 600` returned a longer string unchanged, so 12 long rows (606 to 904 characters; the plan named five) were never made pseudo. It is in no requirement.
2. The test sampled 300 rows by position. Now `pseudo-cost.test.mjs` takes every sentence row of the list (over 20,000), with a value filled into each placeholder, and asserts each is made pseudo and `escapedIn` finds nothing, and that the list holds a sentence over 600 characters (so the test cannot pass on a list without one); the cost test's reference no longer excludes long strings.
3. Red: 12 rows named (`prompt.inquiryground (606)` … `case-authoring.index.this_finding_is_already_a (904)`); green after removing the cap; the cost budget test still passes (at most 1,000,000 tries; second call none).
4. N.

**Last local-arm run (the fifth; 17 of 23 tests pass, `journey.test.mjs`).** Two causes remain red, neither in this module's source:
- `group`: `/app/security` says "the group's file scanner" in `act.scanmirror.does` (`bio-plane/src/affordances/act-help.mjs:135`, row also in `file-safety` and `op-grades`): R17's row scan names it too (the T52 acceptance, K4269, K4270); R17, R26 and the arm's `group` failure in R1 (a), R7's sweep, R9, R16 and R20 (their assertions list all failures) stay red until that row says "team".
- `GET …/api/?op=reading&sha256=d480cc23… answered found: false` on the question page after the capture by upload (R9 steps 8, 12, the dock, and R16), HTTP 200: the screen draws and the step's own acts all work (screenshot 34 shows the citation drawn), but the walk's R8 reads the `found: false` as a refusal. See QUESTION J8.

**Checks** (from the process repository, on the merged branch): format 0; words 0 (and journey-check alone 0); architecture 0 (after the withdrawal); ownership 0; coverage: 29 of 30 live ids named, R19 not (conditional, unmet, as before this job); impact: journey-check only (20 of 21 test files; no other module's test is touched).
**Tests.** Every test file of the module except `journey.test.mjs` and `live.test.mjs`: 79 tests, 78 pass, 1 fail (R17, the T52 red).

## J8 · QUESTION

QUESTION (B11, fix round 4, K4435). Two causes are fixed and tested (details in my record's "Working record (JOURNEY-CHECK #11)"): the fake account now models container applications, namespaces and schedules (the installer finishes in the local arm and journey 28 passes steps 1 to 8), and R30's cap is gone (test over every row). Running the local arm for what it then showed found four more defects in this module, all fixed with a test red first: the invitation selector, the pseudo route (the page's words now stand in the shell's script), "Start a project" asking who can find it, and the conclusion's reason box. The fifth run passes 17 of 23 tests. I need two answers (smallest things) to close:

1. `modules.json`: journey-check's `uses` lacks `screens-inquiry`. The test that checks the walk's conclusion-form fields against the real question page imports its harness, so the architecture check refuses it; I withdrew it (history: 371f901d77, `bio-plane/test/m/journey-check/conclude-fields.test.mjs`). Please add `screens-inquiry` to journey-check's `uses` (or tell me another way to test it); then I restore the test.

2. The remaining local-arm red that is not a word: after the capture by upload (R9 step 5), `GET /api/?op=reading&sha256=d480cc23…` answers `found: false` (HTTP 200) while the question page is open (steps 8, 12, the dock, and R16's two steps). The page draws and every act works; the walker's R8 counts `found: false` as a refusal. Is a held capture with no reading row, here and later, (a) an ordinary state (RC-R1: the reading follows) that R8's walker should excuse for `op=reading` on a capture the step has just made, which I then do (a change to what R8 reads, so yours to confirm), or (b) a defect of extraction/acquisition in the local arm (the stand-in workers answer only /version; the reading's alarm may never run in Miniflare), which I report and leave? My best reading is (a) for a reading read while the reading is pending, with the step still asserting the document's words by Find-in as step 7 does.

Not mine, for the record: `act.scanmirror.does` says "the group's file scanner" (affordances `act-help.mjs:135`), the one "group" the arm reports on /app/security; R17's scan names it too (T52).

## J9 · QUESTION

QUESTION (B13 answered; this replaces nothing in J8, it corrects its premise). Done as B13 says: the tranche merged, conclude-fields.test.mjs restored, and the walker excuses `op=reading`'s `found: false` while a capture the step made is stated pending (`reading_pending`), tested with controls. It does not clear the arm's last five reds, because the premise was wrong. Seen in the answers themselves (the world's route now prints them): the digest d480cc23… is the page captured by address (`op=acquire`, the stub city's notice 2026-118), answered with its reading at once (not deferred), and `op=reading` for it answers `{ok:true, result:{ok:true, found:true, reader_found:false, entity_count:0, reading:{found:false, entities:[], basis:"the generic reader found no entities in this document; recorded as an empty reading, never an emptied document", words_total:76, words_read:76 …}}}`. So the op found the reading (`found: true`); the nested `reading.found: false` is the generic reader's own statement that it found no entities in a stub page. Nothing is pending and nothing is refused; `walker.mjs` `refusalsIn` reads the nested `found: false` (at `result.reading`) as a refusal (R8's list: `found: false`).

What I need: a ruling on R8's reading of `found: false`. My best reading: it names a refusal only on the answer object that says whether the op found its subject (the answer's own top or its `result`); inside a `reading` object (the extraction's reading, whose `found` is whether the reader found entities, shaped `{content_type, reader_version, found, entities, …}`) it is data and never a refusal. Under it I change `refusalsIn` to skip `found` on an object that has `reader_version` and `entities` (a reading), test red first with the answer above as the fixture and controls (an `op=reading` that answers `found: false` at its top, for a digest never captured, still fails; the pending excuse of B13 stays). If you rule otherwise (for instance, that the walk's stub city page should be a notice the reader finds entities in), say which and I do that instead.

Also found while diagnosing, fixed and tested (route-encoding.test.mjs, red then green): the world's route and the pseudo route let the browser ask for compression and removed the header that names it, so every answer workerd compressed (`op=interfacewords`, others) reached the browser and the walker as gzip bytes and was never judged for a refusal; the routes now ask for none. No new refusal surfaced from it in the seventh run.

## Completion record (JOURNEY-CHECK #11, B11 to B14: fix round 4, wave 1; K4435, K4473, K4486)

**Cause 1 (the local arm's moved fixture) and cause 2 (R30): closed**, each with its four fields, in the working record above. Everything the arm then showed was in this module, each fixed test first (red then green) and each answered by BOB where a ruling was needed:
- the fake account's container applications, Durable Object classes, schedules (`account-installer.test.mjs`);
- R30's cap, every row (`pseudo-cost.test.mjs`);
- the invitation selector (`invite-box.test.mjs`); "Start a project" asking who can find it (`start-project.test.mjs`); the conclusion's reason box (`conclude-fields.test.mjs`, restored after K4473 added `screens-inquiry` to `uses`);
- the pseudo route answering the shell's script and dropping its `integrity` hash (`pseudo-route.test.mjs`); both routes asking the copy for no compression, which had left workerd's gzip answers unread and so unjudged (`route-encoding.test.mjs`);
- R8 (K4473): `op=reading`'s `found: false` is excused while the record states the reading pending for a capture the step made (`walker.test.mjs`, with controls); R8 (K4486): a reading's own `found` (whether the reader found entities) is data, never a refusal (`walker.test.mjs`, red with the answer the plane gave for d480cc23…, then green; controls: `found: false` at an answer's top or `result` still fails, an object not shaped as a reading keeps it, a refusal inside a reading is still seen).

**The local arm now.** `journey.test.mjs`, the eighth run: 23 pass, 0 fail (the walk of journey 28 through the installer and the hand-over, R9, R10, R11 and its control, R13, R15 and its control, R16, R18, R20 and its control, R22, R23, R25, R26 (its scan passes after the tranche's "team" wording), R27 and the rest). Stand-in workers: the local arm's `pdf-worker`, `ocr-worker`, `sheet-worker` and `file-scanner` answer only `/version`, as R1 (a) states; the capture by address and the upload are read by the plane itself, so no reading stayed pending here: B13's pending excuse is exercised by its walker test, and the live re-walk proves the reading of a real PDF.
**Not walked here:** `live.test.mjs` (the live arm, never run in a module job, K4149).

**Remaining red, by cause.** One test of the module's other files: `group.test.mjs` R17 (the row scan of `words.json` and `setup-words` finds rows that say "group" for a team, in other modules), the accepted red of T52 (K4269, K4270); nothing else.

**Tests and checks** (from the process repository, on the branch merged with `tranche/T51` as of B14's answer): all of the module's files except the two walks: 83 tests, 81 pass, 1 fail (R17 above); `journey.test.mjs`: 23 pass, 0 fail (eight runs; the first seven are in the working record); `node checks/format.mjs`: 0 failures; `words` (journey-check): 0 failures; `architecture` journey-check: 0 failures; `coverage` journey-check: 30 of 30 live ids named by a test (R19 is named by `unmet-parked.test.mjs`, which came with the tranche); `ownership` journey-check tranche/T51: 15 files changed by journey-check, 0 failures; `impact.mjs`: affected modules 1 of 175 (journey-check, 21 of 23 test files; no other module's test file is affected). No other module's tests are touched.

**Found in other modules.** None open. (`act.scanmirror.does` said "the group's file scanner"; the tranche's later wording cleared it.)

Size (session_013CXae57CSmbZXAkv1DtdMS): test runs 30, module lines 3450

## J10 · COMPLETE

COMPLETE (B11 to B14; K4435, K4473, K4486). Pushed on `job/T51/journey-check` (merged with `tranche/T51` as of B14's answer).

Cause 1, the local arm's moved fixture: the fake account models container applications, Durable Object classes and schedules; the installer's whole install runs over it in process, test first, and every call must be answered (`account-installer.test.mjs`). Cause 2, R30: the 600 cap is gone; the test takes every sentence row. Behind them the arm showed more, all in this module, each fixed test first: the invitation selector, the pseudo route (the page's words stand in the shell's script, and its integrity hash), "Start a project" asking who can find it, the conclusion's reason box, the routes asking the copy for no compression (gzip answers had gone unjudged), R8's pending-reading excuse (K4473) and a reading's own `found` as data (K4486).

`journey.test.mjs` (the local arm), the eighth run: 23 pass, 0 fail. The module's other files: 83 tests, 81 pass, 1 fail: R17 (T52, K4269). format, words, architecture, coverage (30 of 30), ownership: 0 failures; impact: journey-check only. The local arm's stand-in workers answer only /version, as R1 (a) states; the plane reads the capture and the upload itself, so no reading stayed pending here (the pending excuse is proved by its walker test; the live re-walk proves a real PDF's reading). `live.test.mjs` not run (K4149). Record: `build/jobs/T51/journey-check.md`, with each cause's four fields and the red-then-green evidence.

Size (session_013CXae57CSmbZXAkv1DtdMS): test runs 30, module lines 3450

## Fix round 6 — G1 provider (JOURNEY-CHECK #12, session_018cVQsZb9faqV2gGpjCfs1B)

**What changed**
- `account.mjs`: `fakeAccount({ refuseSchedules })` (true, a RegExp on the script name, or a function) answers a refused `PUT .../schedules` as Cloudflare answers a refusal (403, code 10000); `GET .../schedules` reads back what was set; `GET/POST .../deployments` answered (an update reads the deployment it replaces; the fake never served an update before). New exports `WATCHDOG_CRON` (`*/5 * * * *`), `statedCrons(source)` (reads `bio-plane-crons/1 <cron>` from the bytes the account holds, as the installer will) and `planeScheduleProblem(account, slug)` (null, or why: no statement, not the watchdog's cron, nothing set, or a different one set). Sentences go through `localize` (words check: inline 0).
- `run.mjs` (after `walkInstaller`): the local arm fails with kind `step`, `install: the plane's …`, when the installed plane holds no watchdog cron. Other checks unchanged.
- Tests: new `plane-cron.test.mjs` (6 tests); `journey.test.mjs` one new walk-level test.

**Tests: red, then green**
- The assertion at the account's interface (3 tests, green): a plane that states the cron and holds it reports null and reads back; none set, wrong cron, extra cron, no/two statements, absent script each report a problem; a refused script is refused and stays unset. Red-before: before `planeScheduleProblem` existed there was no assertion; shown by the control tests failing on the problem text when the schedule is removed.
- The seam (4 tests, **red by name, provider unmerged**): install sets the cron; update sets it again (schedules deleted between, so a PUT that clears them is covered); a refused schedule stops the install and the update each with one sentence and no `verify` ok; the local walk leaves the plane holding it. Today they fail with "the plane's bytes state no watchdog cron (bio-plane-crons/1: states none)": the built-in release carries no statement and the installer sets no schedule. They go green when installer-steps and control-plane have merged AND BOB has regenerated the plane bundle and the newgroup release so the embedded plane states the cron. No scratch copy with the installer change could be made: the installer verifies the embedded plane's sha, so a plane with the statement exists only after the regenerate.
- Not decided by me: the refusal sentence's key (stand-in: only "a sentence of 4+ words, no code/structure" is asserted); row owed for installer-steps' wording.

**Suite** (`node --test --test-force-exit bio-plane/test/m/journey-check/`, after `npm ci` in `bio-plane/src/journey-check`): 128 tests, 116 pass, 11 fail (full run, before the words fix), now by cause:
- G1 seam, 4 (above), expected red.
- `R20` local: red only because the local walk now carries the one G1 failure (its filter admits only the not-ready failures).
- `R1 (a)` aggregate: the same single failure (222 steps, 1 failure).
- Not mine, red on the unmodified `tranche/T51` too (checked in a scratch worktree): live arm `R9 · 2 · start a project`: `locator.check` timeout 30 s (the checkbox that lets her start projects is not found on the fake plane's invitation form): R12 ×2, R20 live ×2; and `R17` (words.json/setup-words say "group" for a team).
Checks: format 0 failures in my files (one in `build/plan/next.md:38`, not mine); architecture 0; coverage 30 of 30; ownership 0; words 0 failures, count not raised. `impact.mjs`: journey-check only (17 test files, all in the run above).

**Found in other modules**
1. Live arm R9 step 2 (screens-settings/screens-entry, whoever draws the invitation's "start projects" box): `locator.check` times out on the fake plane; also on `tranche/T51`.
2. R17: rows saying "group" for a team (setup-words / design).

**Requirement lines proposed** (BOB writes `build/requirements/`): *R31 (T51 fix round 6, G1; K4565, K4566, K4570; amends R1 (a)) After an install and after an update, the plane's script in the walk's fake account holds exactly the cron its signed statement `bio-plane-crons/1 <cron>` states (`*/5 * * * *`); the account reads schedules back; a refused schedule stops the install and the update each in a sentence; the local walk fails by name when the installed plane holds none. Test: the install and update over the account; control: a refused schedule; a plane stating none.*

Size (session_018cVQsZb9faqV2gGpjCfs1B): test runs 4, module lines 3496

## J11 · COMPLETE

G1 (journey-check part) applied; record section "Fix round 6 — G1 provider" in build/jobs/T51/journey-check.md.

Changed: account.mjs (refuseSchedules option, GET schedules read-back, deployments answered so an update can run over the fake, WATCHDOG_CRON, statedCrons, planeScheduleProblem; sentences by localize); run.mjs (local arm fails `install: the plane's ...` when the installed plane holds no watchdog cron). Tests: new plane-cron.test.mjs (6), one in journey.test.mjs.

Red then green: the assertion at the account's interface (3 tests) is green, with controls. The seam (install sets the cron; update sets it again with schedules cleared between; a refused schedule stops install and update each in a sentence; the local walk) is RED BY NAME, provider unmerged: "the plane's bytes state no watchdog cron (bio-plane-crons/1: states none)". It goes green only after installer-steps and control-plane merge AND you regenerate the plane bundle and the newgroup release (the installer checks the embedded plane's sha, so no scratch copy could show green). Tell me when merged and I merge tranche/T51 and re-run (CHANGE).

Suite: 128 tests, 116 pass; the 4 seam tests above, plus R20-local and R1(a)-aggregate red only through that one failure. Red on unmodified tranche/T51 too (checked in a scratch worktree), not mine: live arm R9 step 2 "start a project" locator.check timeout (R12 x2, R20 live x2), and R17 (group for a team). Checks: format (my files) 0, architecture 0, coverage 30/30, ownership 0, words 0 and count not raised.

Proposed requirement line R31 is in the record. Size (session_018cVQsZb9faqV2gGpjCfs1B): test runs 4, module lines 3496.

## Fix round 9, job 47 (K4847) · JOURNEY-CHECK #13 (session_01USyGMZHTJG6V897tNLHTHH)

**Entry applied.** `browser()` in `run.mjs` now launches `CHROMIUM` if set; else the pinned build when `chromium.executablePath()` exists; else `/opt/pw-browsers/chromium` when it exists; else today's behaviour (`chromiumPath`, exported, takes injected `exists`). Test: `chromium-path.test.mjs` (2 tests, titled R1, plus a launch with `CHROMIUM` unset). **No requirement names the Chromium choice** (R1 says only "Playwright (Chromium)"); BOB writes one, and the tests would then take its id.

**Failing first.** `walker.test.mjs`, `CHROMIUM` unset: `browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`. After: 17/0.

**The eleven files, `CHROMIUM` unset, one at a time (pass/fail):** dec340 10/0, design29 6/0, frames 4/0, names 4/0, own-reading 2/0, pseudo 7/0, walker 17/0, words 3/0 — green. **Not green, and not caused by the launch:**
- `group` 4/1: R17 finds "group" in rows of other modules (`ai-accounts`, `citation`, ...): words belong to K3811's pass and those modules' jobs (R26), not this one.
- `journey` 11/13: the browser launches; the local arm stops at "journey 28 · install: each step finishes, the checks pass" with `locator.textContent: Timeout 30000ms`. The same 11/13 with `CHROMIUM=/opt/pw-browsers/chromium`, so the launch is not the cause. Cause not found; I made no attempts to fix it (outside this entry).
- `live` 11/4 unset: R9 step 2 "start a project": `locator.check: Timeout 30000ms`. A re-run with `CHROMIUM` set printed 5/0 but was cut by my 500 s timeout, so it is not comparable. Cause not found.
Other module tests were not run separately (the eleven files are the module's browser tests; `impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 176, test files 13 of 2565, not run beyond the above).

**Checks:** format 0 failures; architecture 0; coverage 31 of 31 ids, 0; words 0 failures; ownership 0 (3 files).

**Found in other modules:** none beyond the "group" rows above.
**Deferred:** `journey` and `live` reds above: BOB to say whether they predate this entry.

Size (session_01USyGMZHTJG6V897tNLHTHH): test runs 7, module lines 13

## J12 · COMPLETE

K4847 applied: browser() falls back to /opt/pw-browsers/chromium when the pinned build is absent (walker 17/0 with CHROMIUM unset, was red at launch). Checks: format, architecture, coverage, words, ownership all 0 failures. NOT green, and not caused by the launch: group 4/1 (R17, 'group' in other modules' rows), journey 11/13 (install step timeout; identical with CHROMIUM set), live 11/4 (R9 step 2 timeout). Details in my record. No requirement names the Chromium choice: please write one.
