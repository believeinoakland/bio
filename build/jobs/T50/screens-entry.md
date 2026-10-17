# screens-entry (T50)

**Status** · session_01SPnXeuBWixFqDaAKUnfxj4 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on (T50-28); answer only if either is wrong.

1. **Part 3's languages (R22 "3 Where your team works (places and languages)").** The registry lists no languages act for `setup` (only `profilesset` and `placewanted`; `grouplanguagesset` is Settings'), and common.test's contract check refuses an act the registry does not list for the screen. My reading: part 3 draws the place (the design's single "Your place" select, "Somewhere else" opening `placewanted`) and no language field; languages stay under Settings.
2. **"The part is shown as skipped while the page is open" (R23).** No key in `words.json` says "Skipped" (the design's `skipPart` is drawn in no setup state). My reading: a skipped part is drawn closed, marked `data-skipped`, its state words unchanged, and "Skip for now" (`setup.skip`, `setup.skip_does`) stays checked inside it; a key for the word "Skipped" goes to the design lane through you (REPORT follows).

## J2 · REPORT

Found while building T50-28 (screens-entry), for other modules and the design lane:

1. **interface-assets (T50-26), the dependency my merge needs.** The served `civicsmith.css` at `ASSETS_COMMIT` f498560a37 defines neither `.cs-part` nor `.cs-choice` (nor `.chev`, `.sum`), which R22 requires setup to draw (DEC-279). `interfacePage` therefore refuses the composed page (interface-shell R56) until T50-26 moves `ASSETS_COMMIT` to the design merge (92331996be holds both rules). Until then screens-entry's page tests and R12's class test are red on my branch; merge order already puts interface-assets first.
2. **interface-shell, a control with no op.** The kit has no control that changes a screen without an op (a choice of radios that opens fields, a "Skip for now" that records nothing). Setup's `.cs-choice` radios and "Skip for now" checkboxes are therefore watched on the page's clock (`cs.later`, 250 ms) as `join` watches its handle, and the screen redrawn on a change. A kit control (radios or a toggle redrawing on `change`, as `choice` does for a select under R49) would remove the poll. Also: `cs.act` takes no explanation key, so "Invite a second administrator" is explained by `setup.admin.invite_does` on a wrapper the shell's R15 absorption merges with `act.memberadd.does`.
3. **Design lane (through you): two missing words.** (a) No key says a setup part is "Skipped" (R23); (b) `words-reads.json`'s generator lists no `act.<op>.label.<screen>` key and none of T50's `screen.setup.*` part keys, so R24 is met by its second route: the module's own declared keys against `hasWord`, every drawn key declared.
