# interface-shell (T51)

**Status** · session_013DxfQ6fDiQby41EDQ4zZH8 · depth 2 · COMPLETE · handled B7

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
