# screens-wizards (T48)

**Status** · session_01Qp58hwvG5avLezx8s8j93H · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R11 names the keys wizard.marks.chip, wizard.marks.chip.one and wizard.mark.recommended, but docs/development/ux-substrate/screens/words.json holds none of them (it holds wizard.guide.elsewhere and .elsewhere_link, which setup-words has not yet re-taken into WORD_ROWS). My best reading, carried on with: hold the three rows in screens-wizards' SCREEN_WORDS under exactly those keys (English: '{n} wizards start here', '1 wizard starts here', 'Recommended for everyone'), as this module already holds ai.label.untested, so they move to words.json with no code change when the design stream adds them. If you want them added to words.json first, say so and I will use WORD_ROWS' key only. The two elsewhere keys I read from WORD_ROWS; my tests need them, so they pass once setup-words merges. Also: R12 renames cs-note to mk-note (as other screens do) and I draw no cs-form; the shell's shell.css does not exist yet, so my R12 test audits my classes against civicsmith.css plus the shell's current STYLE until R56's check lands.

## J2 · COMPLETE

Entries applied (T48-70): R10 (startfrom read once per run start; wizard.guide.elsewhere on every step of a script a door names, its link opening elsewhere via cs.go, sending nothing, run kept; a failed read draws none), R11 (one cs-wizmark chip, count of scripts whose step acts all pass cs.can, own drafts counted, none = no chip, list beneath on press with Start, wizard.mark.recommended for required, finished count only above zero, Home's welcome band kept), R12 (cs-note→mk-note, cs-form gone, labelled selects via cs.choice, no 'finished by 0', no chooser without projects, failed read still failed).
Read: requirements, my guide/library/words/index, shell kit (can, field, choice, state, ref), wizard-scripts startFrom, tests I changed.
Deferred / depends on others: (1) words.test fails on 4 keys until setup-words (T48-61) re-takes wizard.guide.elsewhere, .elsewhere_link, screen.elsewhere.name, .purpose into WORD_ROWS; it passes then. (2) Held rows wizard.marks.chip, .chip.one, wizard.mark.recommended in SCREEN_WORDS (my J1 QUESTION; move when words.json holds them). (3) R12 test audits classes against civicsmith.css + shell STYLE, mk-* accepted by prefix, until interface-shell R56/shell.css lands; re-point to the shell's check then. (4) Marks chip sits in cs-guidemarks until the shell's R59 puts it in the title row.
Other modules: none found.
Tests: node --test test/m/screens-wizards/*.test.mjs: all pass except words.test (above). Checks: format 0 failures; architecture 11 files 0 failures; coverage 12 of 12 ids named; ownership 0 failures. checks/run.mjs: 22 coverage failures, none mine (other modules).
Size (session_01Qp58hwvG5avLezx8s8j93H): test runs 8, module lines 871
