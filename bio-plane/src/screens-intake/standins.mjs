/* Fix round 10 (R-WORDS; K3930, K3943, K4269): the sentences this module's causes need before the design's rows exist. Each is written once, here, as
 * `localize(id, en)`, and read by the screens by key (`cs.w(id)`); the list always wins, so the row UX-DESIGN supplies replaces the stand-in without a
 * change here (`fix-round-10-words.md` names the rows owed). A screen's `words` carries each one as `[id, en]`, the shape `interface-shell` R5 reads for
 * "a screen's own rows", so the page can draw it before `rows.mjs` is regenerated at the layer close. */
import { localize } from "../setup-words/index.mjs";

/* cause R14 (G3): beside a scanner's "Clean" on a file whose inside was not examined */
export const CHECK_INSIDE = ["screen.open-file.check.inside", localize("screen.open-file.check.inside", "Its inside could not be checked, so the scanner's result above does not cover it.")];
/* cause R35b (G7): an unread picture type (file-safety R56 `image.read === false`) */
export const IMAGE_UNREAD = ["screen.open-file.image.unread", localize("screen.open-file.image.unread", "This kind of picture is not read, and the structure check could not examine it, so the scanner's \"Clean\" does not stand for its structure.")];

export const OPEN_FILE_STAND_INS = Object.freeze([CHECK_INSIDE, IMAGE_UNREAD].map((r) => Object.freeze(r)));

/* cause R33 (G6; DEC-97 clause 1): the Held list is per member and pages by the answer's cursor */
export const HELD_STAND_INS = Object.freeze([
  ["screen.held.who", localize("screen.held.who", "Whose captures")],
  ["screen.held.who.mine", localize("screen.held.who.mine", "Mine")],
  ["screen.held.who.all", localize("screen.held.who.all", "Everyone's")],
  ["screen.held.next", localize("screen.held.next", "Show the next captures")],
  ["screen.held.back", localize("screen.held.back", "Back to the earlier captures")],
].map((r) => Object.freeze(r)));

export const ALL_STAND_INS = Object.freeze([...OPEN_FILE_STAND_INS, ...HELD_STAND_INS]);
