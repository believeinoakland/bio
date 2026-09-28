/* inquiry — the grammar (requirements: `build/requirements/inquiry.md`, R1–R10, R38). The catalogue's own functions
 * and rows, held in `legacy-checks` because the catalogue's `checkBundle`, its basis-version and action grammars and the
 * case gate call them and `legacy-checks` is earlier in the order (K138's pattern, as `content/extent.mjs` is for the
 * extent grammar). This file is their one public face: every caller of the inquiry's grammar reaches it here. */

import { STATES, BASIS_ROLES, GROUND_LABEL_RE, INQUIRY_TITLE_MAX, deriveInquiryTitle, inquiryQuestionOf,
         checkInquiryBasis, checkLegExtentGrammar, leadLegFindings, supersedesEdgeFindings, divisionDisclosureFindings,
         checkBundle, LEAD_CHECKS, ACT_SHAPE_CHECKS, MACHINE_FENCE_CHECKS } from "../../checks/bio-checks.mjs";

export { BASIS_ROLES, GROUND_LABEL_RE, INQUIRY_TITLE_MAX, deriveInquiryTitle, inquiryQuestionOf, checkInquiryBasis,
         checkLegExtentGrammar, leadLegFindings, supersedesEdgeFindings, divisionDisclosureFindings };

/** R1: the inquiry's state machine, `{legal, edges}` — the catalogue's own table, never a copy. */
export const INQUIRY_MACHINE = STATES.inquiry;

/** R38: the rows this module's acts and checks mint, by code, as the catalogue holds them (K6). */
export const INQUIRY_ROWS = Object.freeze({
  LEAD_NOT_EVIDENCE: LEAD_CHECKS.LEAD_NOT_EVIDENCE,                 // C-54.1
  NOT_INQUIRIES: ACT_SHAPE_CHECKS.NOT_INQUIRIES,                     // C-33.13
  SELF_BASIS: ACT_SHAPE_CHECKS.SELF_BASIS,                           // C-33.22
  BASIS_CYCLE: ACT_SHAPE_CHECKS.BASIS_CYCLE,                         // C-33.23
  MACHINE_CANNOT_DIVIDE: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_DIVIDE, // C-32.7
  MACHINE_CANNOT_GROUND: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_GROUND, // C-32.8
});

/** R2, R3 (C-2.8, C-6.1): an inquiry document's entry requirements, judged by the catalogue's own inquiry extension
 *  over the document as `checkBundle` reads it. `bundleMd` is the document's text; `opts` are `checkBundle`'s facts
 *  (`publishedRegistry`, `earnedRegistry`), null blinding the arms that need them. Answers the error findings, each
 *  `{check, severity, message, repairs?}`. Never throws. */
export async function checkInquiryEntry(bundleMd, opts = {}) {
  try {
    const text = String(bundleMd ?? "");
    const id = (/^id:\s*(\S+)/m.exec(text) || [])[1] || "";
    const r = await checkBundle({ folderName: id, files: new Map([["bundle.md", text]]),
                                  publishedRegistry: opts.publishedRegistry ?? null,
                                  earnedRegistry: opts.earnedRegistry ?? null });
    const all = r && Array.isArray(r.findings) ? r.findings : [];
    return all.filter((x) => x && x.severity === "error");
  } catch (e) {
    return [{ check: "C-2.8", severity: "error", message: `the entry requirements could not be judged: ${e && e.message}` }];
  }
}
