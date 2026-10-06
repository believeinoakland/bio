/* hypotheses — THE ROWS (requirements: `build/requirements/hypotheses.md` R1, R2, R5, R6; K1467, K1473, K1487).
 *
 * Each row is `{check, where, translation}`, a new family C-134, minted here and awaiting `promotion`'s next stamp. The
 * acts' rows (R1, R2) are this module's own answers; the leg rows (R5, R6) are carried inside `BASIS_REFUSED` by the
 * check this module registers with `promotion`. No translation names a place. This file imports nothing. */

const act = (fn) => `src/hypotheses/index.mjs ${fn}`;
const leg = "src/hypotheses/index.mjs legRefusals";

export const HYPOTHESES_CHECKS = {
  NO_SUCH_BUNDLE: { check: "C-134.1", where: act("hold"),
    translation: "There is no inquiry here by that id that you can see. Nothing was written." },
  NOT_AN_INQUIRY: { check: "C-134.2", where: act("hold"),
    translation: "A hypothesis is held in an inquiry, and this record is not one. Hold it in the inquiry it belongs to. Nothing was written." },
  MACHINE_CANNOT_HYPOTHESISE: { check: "C-134.3", where: act("hold"),
    translation: "Only a member holds a hypothesis. A signal the machine raised can be taken up by a member as a hunch. Nothing was written." },
  UNKNOWN_HYPOTHESIS_KIND: { check: "C-134.4", where: act("hold"),
    translation: "A hypothesis is one of: cause, identity, relation, flow or other. Nothing was written." },
  NO_STATEMENT: { check: "C-134.5", where: act("hold"),
    translation: "Say what you think, in your own words. Nothing was written." },
  BAD_ABOUT: { check: "C-134.6", where: act("hold"),
    translation: "Name what the hypothesis is about by the record's own ids; a cause, an identity or a relation names exactly two, from and to. Nothing was written." },
  NO_REASON: { check: "C-134.7", where: act("revise"),
    translation: "Say why you are changing or withdrawing this hypothesis. Nothing was written." },
  NO_SUCH_HYPOTHESIS: { check: "C-134.8", where: act("revise"),
    translation: "There is no hypothesis here by that id that you can see. Nothing was written." },
  HYPOTHESIS_WITHDRAWN: { check: "C-134.9", where: act("revise"),
    translation: "This hypothesis was withdrawn. Hold a new one if you think it again. Nothing was written." },
  HYPOTHESIS_NOT_A_LEG: { check: "C-134.10", where: `${leg} > is-hypothesis-leg`,
    translation: "A hypothesis is never part of what a finding rests on. Keep it in the inquiry as a hypothesis, and rest the finding on evidence. Nothing was written." },
  LEAD_NOT_A_LEG: { check: "C-134.11", where: `${leg} > is-lead-leg`,
    translation: "This connection was derived through a declared grouping or a hunch, so it is a lead, never something a finding rests on. Find a source for each step. Nothing was written." },
  LEG_NOT_REDERIVED: { check: "C-134.12", where: `${leg} > is-rederived-leg`,
    translation: "This derived connection could not be worked out again from its derivation, so a finding cannot rest on it. Nothing was written." },
};
