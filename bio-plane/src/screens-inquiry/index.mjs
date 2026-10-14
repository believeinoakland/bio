/* screens-inquiry (T46-58; N897 (1), (2); N919; T47-61): the investigation's working screens, a project's home, one
 * question, one captured document, the assistant's panel beside them, and (T47) the project's own AI account. Pure:
 * every read and act is an op the plane serves, called from the browser through `interface-shell`'s kit (its R21's
 * screen contract, K2996, K2998). Requirements: `build/requirements/screens-inquiry.md`. */

import { PROJECT_SCREEN } from "./project.mjs";
import { QUESTION_SCREEN } from "./question.mjs";
import { DOCUMENT_SCREEN } from "./document.mjs";
import { ASSISTANT_SCREEN } from "./assistant.mjs";
import { PROJECTAI_SCREEN } from "./projectai.mjs";
export { SCREEN_WORDS } from "./words.mjs";

/** interface-shell R21: the five registry screens this module draws, `project`, `question`, `document`, `assistant`
 *  and (R14) `projectai`. */
export const SCREENS = Object.freeze([PROJECT_SCREEN, QUESTION_SCREEN, DOCUMENT_SCREEN, ASSISTANT_SCREEN, PROJECTAI_SCREEN]);
