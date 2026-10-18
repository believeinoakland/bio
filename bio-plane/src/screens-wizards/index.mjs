/* screens-wizards (T47-57; N897 (1); N821's runner, its screen side; N551, its share; N572; DEC-120, DEC-121, DEC-139 (4),
   DEC-140, DEC-148, DEC-158): the wizards a member walks on the real screens. Two parts:
   - `SCREENS`: the library, Settings › Wizards (`wizards`; R1, R8), per interface-shell R21's screen contract;
   - `GUIDE`: the runner, the wizard guide the shell docks beside any screen (interface-shell R31; R2–R7, R9), with the
     wizard marks it draws at the top of each working screen.
   Pure: every read and act is an op the plane serves, called through `interface-shell`'s kit; nothing here reads a
   table or writes, and nothing records which member walked, stopped or finished which wizard (R9).

   `words` lists, per part, the `WORD_ROWS` keys it draws (R13: it holds no English of its own, `SCREEN_WORDS` is empty).
   A Civicsmith script's words are `WORD_ROWS`' `wizard.<id>.*` (R2), carried whole. */
import { WORD_ROWS } from "../setup-words/index.mjs";
import { library, LIBRARY_STATES } from "./library.mjs";
import { guide, PARTS, GUIDE_OPS, WELCOME, FIRST_QUESTION, WELCOME_AT } from "./guide.mjs";
import { SCREEN_WORDS, LIBRARY_KEYS, GUIDE_KEYS, COMMON_KEYS } from "./words.mjs";

export { SCREEN_WORDS, LIBRARY_STATES, GUIDE_OPS, WELCOME, FIRST_QUESTION, WELCOME_AT };

/* R2: the Civicsmith library's names and step words (`wizard.<id>.name`, `wizard.<id>.step<n>.what`, `.why`) */
const LIBRARY_WORDS = WORD_ROWS.map((r) => r[0]).filter((k) => k.startsWith("wizard."));
const LABELS = (screen, ops) => ops.flatMap((op) => [`act.${op}.label.${screen}`, `act.${op}.does`]);

/* R13: keys only (`SCREEN_WORDS` is empty), listed by the part that draws them */
const WORDS = {
  wizards: [...COMMON_KEYS, ...LIBRARY_KEYS, ...LIBRARY_WORDS,
    ...LABELS("wizards", ["wizards", "wizarddraft", "wizardrevise", "wizardsubmit", "wizardapprove", "wizardretire"])],
  guide: [...COMMON_KEYS, ...GUIDE_KEYS, ...LIBRARY_WORDS],
};
const wordsOf = (id) => Object.freeze([...new Set(WORDS[id])]);
const freezeActs = (acts) => Object.freeze(acts.map((a) => Object.freeze({ ...a })));

/** The library screen (R1, R8), per interface-shell R21. */
export const SCREENS = Object.freeze([Object.freeze({ ...library, acts: freezeActs(library.acts), words: wordsOf("wizards") })]);

/** The runner (R2–R7, R9): the guide the shell docks (interface-shell R31), its shared steps as `parts`. */
export const GUIDE = Object.freeze({ ...guide, ops: GUIDE_OPS, acts: freezeActs(guide.acts), words: wordsOf("guide"), parts: Object.freeze({ ...PARTS }) });
