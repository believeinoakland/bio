/* case-check's refusal rows (requirements: `build/requirements/case-check.md`, R2, R3), family C-148 (K2794). DEC-49:
 * every refusal this module mints carries its code, its row and the member's translation. A held, void or undetermined
 * check is a state, never a fault (R5): no row exists for one. R1's refusals are case-authoring's, passed unchanged. */

import { word } from "../setup-words/index.mjs";

const at = (fn, region) => `src/case-check/index.mjs ${fn} > ${region}`;

export const CASE_CHECK_CHECKS = Object.freeze({
  NO_SUCH_CASE: {
    check: "C-148.1",
    where: at("caseCheckOf", "is-case-check-case"),
    translation: word("refusal.NO_SUCH_CASE"),
  },
  NO_ID: {
    check: "C-148.2",
    where: at("heldFindingVersions", "is-case-check-finding"),
    translation: word("refusal.NO_ID"),
  },
});
