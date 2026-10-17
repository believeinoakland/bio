# screens-entry (T50)

**Status** · session_01SPnXeuBWixFqDaAKUnfxj4 · depth 2 · WORKING · handled B5

## J1 · QUESTION

Two readings I am building on (T50-28); answer only if either is wrong.

1. **Part 3's languages (R22 "3 Where your team works (places and languages)").** The registry lists no languages act for `setup` (only `profilesset` and `placewanted`; `grouplanguagesset` is Settings'), and common.test's contract check refuses an act the registry does not list for the screen. My reading: part 3 draws the place (the design's single "Your place" select, "Somewhere else" opening `placewanted`) and no language field; languages stay under Settings.
2. **"The part is shown as skipped while the page is open" (R23).** No key in `words.json` says "Skipped" (the design's `skipPart` is drawn in no setup state). My reading: a skipped part is drawn closed, marked `data-skipped`, its state words unchanged, and "Skip for now" (`setup.skip`, `setup.skip_does`) stays checked inside it; a key for the word "Skipped" goes to the design lane through you (REPORT follows).

## J2 · REPORT

Found while building T50-28 (screens-entry), for other modules and the design lane:

1. **interface-assets (T50-26), the dependency my merge needs.** The served `civicsmith.css` at `ASSETS_COMMIT` f498560a37 defines neither `.cs-part` nor `.cs-choice` (nor `.chev`, `.sum`), which R22 requires setup to draw (DEC-279). `interfacePage` therefore refuses the composed page (interface-shell R56) until T50-26 moves `ASSETS_COMMIT` to the design merge (92331996be holds both rules). Until then screens-entry's page tests and R12's class test are red on my branch; merge order already puts interface-assets first.
2. **interface-shell, a control with no op.** The kit has no control that changes a screen without an op (a choice of radios that opens fields, a "Skip for now" that records nothing). Setup's `.cs-choice` radios and "Skip for now" checkboxes are therefore watched on the page's clock (`cs.later`, 250 ms) as `join` watches its handle, and the screen redrawn on a change. A kit control (radios or a toggle redrawing on `change`, as `choice` does for a select under R49) would remove the poll. Also: `cs.act` takes no explanation key, so "Invite a second administrator" is explained by `setup.admin.invite_does` on a wrapper the shell's R15 absorption merges with `act.memberadd.does`.
3. **Design lane (through you): two missing words.** (a) No key says a setup part is "Skipped" (R23); (b) `words-reads.json`'s generator lists no `act.<op>.label.<screen>` key and none of T50's `screen.setup.*` part keys, so R24 is met by its second route: the module's own declared keys against `hasWord`, every drawn key declared.

## Completion (T50-28)

**Entries applied.**
- (N1152 = U1, DEC-279) R22: `setup` redrawn as the design draws it. Numbered `.cs-part` cards (number, name, `screen.setup.part.<part>.why`, state `needed`/`done`/`optional`/`off`), opening and closing. Before the claim only part 1 is open (`claim.intro`, the one-time password, the handle, the password twice, "Claim it and become its administrator"); the seven later parts are shown closed under `screen.setup.coming`, the head showing the short name. After the claim `screen.setup.after` heads the eight parts in the design's order, the hosting account moved into part 8 (HOSTING_CONTROL's words stay at the claim, folded, before the password: R4, R6). Each state comes from its own read (`groupidentity`, `profiles`, `entitieskind` office, `aikeepawaystate`, `courtnotice`, `securitytools`, `memberlist`); a read that fails or does not answer leaves its part optional. The choices are `.cs-choice`: website (no/yes), assistant (yes/no; "no" sends `aikeepaway` with its reason, then every other AI element is hidden and `screen.setup.ai.off` drawn), who pays (only after "yes"; the key, switch, `key.told` and limit only for "your team pays"), the place (a select; "Somewhere else" opens `placewanted`, and offices then say they are added by hand). The saved name draws `screen.setup.name.now` with the accepted mark and replaces the short name in the head. The long explanations (`otp.tip`, `handle.tip`, `name.tip`, `site.tip`, `leaves.what`, `key.tip`, `court.matters`) sit behind explained terms (`.cs-card`). The founder-handle step (state b) and the member's state (d) now draw their heading as the page's one `h1`. The steps' keys are no longer read.
- (N1106) R23: every part after part 1 carries "Skip for now" (`setup.skip`, explained by `setup.skip_does`), a checkbox that sends and records nothing and draws the part closed, `data-skipped`, while the page is open. Part 8's act is `setup.admin.invite`, explained by `setup.admin.invite_does`, sending `memberadd` with `role: "admin"`; no other invitation is offered. `join` state e: a dead link draws `screen.join.dead` with `dead.what`; the daily cap is drawn in its own fold (`join.cap.says`), open whenever drawn (K3742).
- (N1146) R24 (and R21's re-run): the second route R24 names. Each screen's declared keys are each held by `hasWord`; every key drawn in every state the tests reach is declared; the retired keys are in neither (common.test). `words-reads.json` lists neither act labels nor T50's setup keys (J2 (3), N1233).
- (N1112) the retired readers: none read (`screen.forgot.handle.help`, `screen.setup.taken`, `signin.founderhint`).
- Plan rule 6: no member-facing English held; "labeled" (none spelled otherwise); no `act.<op>.here.<place>` act here; D29 holds (a claim, codes or tool test answered `ok: true` carrying `ok: false` is not success); "team" comes from the words.
- BOB's answers (B2, K3767): J1's two readings accepted; the `cs.later` watch and the explanation wrapper stand for T50 (N1232 for T51).

**Deferred.** None in this module.

**Found in other modules.**
- screens-settings: after merging `tranche/T50` (interface-assets at 7be06eb4cb), `interfacePage` refuses the composed page because screen `members`'s act `groupkeyset` is not the registry's for it nor a named re-point (interface-shell R73). It turns plane `t47.test.mjs` R48 and control-plane `t46-app.test.mjs` R75/R81 red; screens-entry's own page composes (its page tests pass). That module's job is in progress.
- interface-shell: `R28` and `R7` red on `tranche/T50`'s base too (not from this change).
- journey-check: it finds the claim by `[data-state="claimed"]`, the codes by `pre[data-codes]` and the name by `#su-name`; all are kept (the claimed marker is on part 1's line), so its walk needs no change.

**Tests and checks** (on `job/T50/screens-entry` with `tranche/T50` merged @ d1e6a4e9ca):
- `node --test bio-plane/test/m/screens-entry/*.test.mjs`: tests 84, pass 84, fail 0 (red only before T50-26 merged: the page tests and R12's class test, from `.cs-part`/`.cs-choice`).
- Users of the screens: instance-setup `page.test.mjs` 3 pass, 0 fail; interface-shell 147 pass, 2 fail (base reds above); plane `t47.test.mjs` 7 pass, 2 fail and control-plane `t46-app.test.mjs` 1 pass, 4 fail (screens-settings' `members`, above).
- `node checks/format.mjs`: 171 modules, 170 requirements files; 0 failures. `node checks/architecture.mjs … screens-entry`: 16 product files, 21 relative imports; 0 failures. `node checks/coverage.mjs … screens-entry`: 24 of 24 live requirement ids named by a test; 0 failures. `node checks/ownership.mjs … screens-entry tranche/T50`: 8 files changed; 0 failures. `node checks/run.mjs`: format, architecture, channels 0 failures; coverage 25 failures, all other modules' ids not yet met (rule 5 (1)), none screens-entry's.

Size (session_01SPnXeuBWixFqDaAKUnfxj4): test runs 22, module lines 1077

## J3 · COMPLETE

T50-28 complete on `job/T50/screens-entry` (tranche/T50 merged @ d1e6a4e9ca): R22 (setup as the design draws it), R23 (Skip for now; the second administrator; join state e), R24 (declared keys against hasWord, every drawn key declared). screens-entry 84 pass, 0 fail; format, architecture, coverage (24/24), ownership 0 failures. Found elsewhere (record, "Found in other modules"): screens-settings' `members` act `groupkeyset` is not the registry's for it, so `interfacePage` refuses the composed page after the merge (plane t47 R48, control-plane t46-app R75/R81 red); interface-shell R28, R7 red on the base too. Details and Size line in my record.

**B3 (CHANGE, K3771) re-run.** `tranche/T50` merged @ 9a6c50dfc5 (wizard-scripts' SCREEN_REGISTRY from design 7be06eb4cb): screens-entry tests 84 pass, 0 fail; format, architecture, coverage (24 of 24), ownership (8 files) 0 failures. No code change needed.

Size (session_01SPnXeuBWixFqDaAKUnfxj4): test runs 23, module lines 1077

## J4 · COMPLETE

B3 applied: tranche/T50 merged @ 9a6c50dfc5 (the regenerated SCREEN_REGISTRY); screens-entry 84 pass, 0 fail; format, architecture, coverage 24/24, ownership 0 failures. No code change.

**B4, B5 (CHANGE, K3776, K3777) re-run.** `tranche/T50` merged with op-declarations, interface-shell and instance-setup. screens-entry 84 pass, 0 fail, `page.test.mjs` (the real shell's harness and page, no stand-in) 6 pass, 0 fail; no stand-in of an unmerged module remains (the temporary interface-assets regeneration used before B2 was never committed). The module's other tests drive `SCREENS` through `kit.mjs`, the shell's kit as interface-shell R21 states it, by design. Format, architecture, coverage (24 of 24), ownership 0 failures. The composed page's remaining red (plane t47 R48, control-plane t46-app R75/R81, interface-shell R73) is screens-settings' `members` act `groupkeyset`, which merges first.

Size (session_01SPnXeuBWixFqDaAKUnfxj4): test runs 25, module lines 1077
