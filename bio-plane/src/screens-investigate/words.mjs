/* screens-investigate: the module's own keyed words (interface-shell R5; DEC-179 (5)). Each row is `[key, en,
 * protected]`: a screen's own sentence `screen.<id>.<part>`, with `{placeholders}` filled from the screen's data, and
 * `screen.help.purpose`, a `WORD_ROWS` key whose English names the group's Civicsmith bare, held here in DEC-149's form
 * (interface-shell R5's rule). The English is the mockups' (`mock-screens.js` at the design stream's PR #33 head) where
 * they say it, else BOB's wording in `build/requirements/screens-investigate.md`. A protected row is a warning before an
 * irreversible act or says who can see something (DEC-157 (4)). They go to the design stream as a HANDOFF. */
import { PEOPLE_WORDS } from "./people.mjs";
import { PERSON_WORDS } from "./person.mjs";
import { EXPLORE_WORDS } from "./explore.mjs";
import { TIMELINE_WORDS } from "./timeline.mjs";
import { MONEY_WORDS } from "./money.mjs";
import { CALCULATION_WORDS, HELP_WORDS } from "./calculation.mjs";
import { PROCEEDING_WORDS } from "./proceeding.mjs";
import { DUE_WORDS } from "./due-date.mjs";
import { STANDARD_WORDS } from "./standard.mjs";
import { TIES_WORDS } from "./ties.mjs";

export const SCREEN_WORDS = Object.freeze([...PEOPLE_WORDS, ...PERSON_WORDS, ...EXPLORE_WORDS, ...TIMELINE_WORDS, ...MONEY_WORDS,
  ...CALCULATION_WORDS, ...HELP_WORDS, ...PROCEEDING_WORDS, ...DUE_WORDS, ...STANDARD_WORDS, ...TIES_WORDS]);
