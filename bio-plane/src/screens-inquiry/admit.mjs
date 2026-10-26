/* screens-inquiry R139 (T51 fix round 10; DEC-439): whether interface-shell's `checkScreens` will admit an act on a screen of this module. A screen's act is admitted when
 * the screen registry lists it for that screen (wizard-scripts' `SCREEN_REGISTRY`) or `interface-shell` names it a re-point (`RE_POINTS`, as it names `readheld` on `document`).
 * An act the design has worded and its owner declared but no registry row admits yet is held apart and carried only once it is admitted: carried earlier it would stop every
 * screen of the product, and drawn without its button it would be words with nothing to press. `leggrade` on `question` (citation R24) and `resolve` on `document`
 * (entities R11) are such acts until the registry rows (or the re-points) arrive. */

import { SCREEN_REGISTRY } from "../wizard-scripts/index.mjs";
import { RE_POINTS } from "../interface-shell/index.mjs";

/** @param {string} screen a screen id @param {string} op an op name @returns {boolean} */
export function admitted(screen, op) {
  const row = SCREEN_REGISTRY.find((r) => r && r.id === screen);
  return !!row && ((Array.isArray(row.acts) && row.acts.includes(op)) || (Array.isArray(RE_POINTS[screen]) && RE_POINTS[screen].includes(op)));
}
