# screens-wizards (T48)

**Status** · session_01Qp58hwvG5avLezx8s8j93H · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

R11 names the keys wizard.marks.chip, wizard.marks.chip.one and wizard.mark.recommended, but docs/development/ux-substrate/screens/words.json holds none of them (it holds wizard.guide.elsewhere and .elsewhere_link, which setup-words has not yet re-taken into WORD_ROWS). My best reading, carried on with: hold the three rows in screens-wizards' SCREEN_WORDS under exactly those keys (English: '{n} wizards start here', '1 wizard starts here', 'Recommended for everyone'), as this module already holds ai.label.untested, so they move to words.json with no code change when the design stream adds them. If you want them added to words.json first, say so and I will use WORD_ROWS' key only. The two elsewhere keys I read from WORD_ROWS; my tests need them, so they pass once setup-words merges. Also: R12 renames cs-note to mk-note (as other screens do) and I draw no cs-form; the shell's shell.css does not exist yet, so my R12 test audits my classes against civicsmith.css plus the shell's current STYLE until R56's check lands.
