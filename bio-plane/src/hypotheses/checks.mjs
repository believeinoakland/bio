/* hypotheses — THE ROWS (requirements: `build/requirements/hypotheses.md` R1, R2, R5, R6, R11, R13; K1467, K1473,
 * K1487; DEC-136).
 *
 * Each row is `{check, where, translation}`, family C-134, minted here. The acts' rows (R1, R2) are this module's own
 * answers, under codes of its own (N608, DEC-49 arm A: `HYPOTHESIS_NO_STATEMENT`, `HYPOTHESIS_NO_REASON`, numbers and
 * translations unchanged); the leg rows (R5, R6) are carried inside `BASIS_REFUSED` by the check this module registers
 * with `promotion`; the notes' rows (R11, R13; T34) answer a member's own notes. Rows changed or added in T34 await
 * `promotion`'s next stamp. No translation names a place. This file imports nothing. */

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
  HYPOTHESIS_NO_STATEMENT: { check: "C-134.5", where: act("hold"),
    translation: "Say what you think, in your own words. Nothing was written." },
  BAD_ABOUT: { check: "C-134.6", where: act("hold"),
    translation: "Name what the hypothesis is about by the record's own ids; a cause, an identity or a relation names exactly two, from and to. Nothing was written." },
  HYPOTHESIS_NO_REASON: { check: "C-134.7", where: act("revise"),
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
  MACHINE_CANNOT_NOTE: { check: "C-134.13", where: act("noteWrite"),
    translation: "Only a member keeps a note of their own. Nothing was written." },
  NOTE_NO_TEXT: { check: "C-134.14", where: act("noteWrite"),
    translation: "Write the note in your own words. Nothing was written." },
  NOTE_TOO_LONG: { check: "C-134.15", where: act("noteWrite"),
    translation: "This note is longer than one note can hold. Split it into shorter notes. Nothing was written, and nothing was cut." },
  NO_SUCH_NOTE: { check: "C-134.16", where: act("noteTurn"),
    translation: "There is no note of yours by that number. Nothing was written." },
  NOTE_TURN_UNKNOWN: { check: "C-134.17", where: act("noteTurn"),
    translation: "A note becomes an observation, a hunch or a question. Nothing was written." },
  NOTE_TURN_NOT_MADE: { check: "C-134.18", where: act("noteTurn"),
    translation: "Name what you made from this note by the record's own id: the observation or the question your act made. Nothing was written." },
};
