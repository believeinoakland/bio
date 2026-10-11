/* case-check's refusal rows (requirements: `build/requirements/case-check.md`, R2, R3), family C-148 (K2794). DEC-49:
 * every refusal this module mints carries its code, its row and the member's translation. A held, void or undetermined
 * check is a state, never a fault (R5): no row exists for one. R1's refusals are case-authoring's, passed unchanged. */

const at = (fn, region) => `src/case-check/index.mjs ${fn} > ${region}`;

export const CASE_CHECK_CHECKS = Object.freeze({
  NO_SUCH_CASE: {
    check: "C-148.1",
    where: at("caseCheckOf", "is-case-check-case"),
    translation: "There is no case by that name that you can see. A case being prepared in a project you are not part "
      + "of is answered exactly as one that does not exist.",
  },
  NO_ID: {
    check: "C-148.2",
    where: at("heldFindingVersions", "is-case-check-finding"),
    translation: "Say which finding to look for. Nothing was read.",
  },
});
