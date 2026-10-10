/* hypotheses — THE ROWS (requirements: `build/requirements/hypotheses.md` R1, R2, R5, R6, R11, R13; K1467, K1473,
 * K1487; DEC-136).
 *
 * Each row is `{check, where, translation}`, family C-134, minted here. The acts' rows (R1, R2) are this module's own
 * answers, under codes of its own (N608, DEC-49 arm A: `HYPOTHESIS_NO_STATEMENT`, `HYPOTHESIS_NO_REASON`, numbers and
 * translations unchanged); the leg rows (R5, R6) are carried inside `BASIS_REFUSED` by the check this module registers
 * with `promotion`; the notes' rows (R11, R13; T34, K1807) answer a member's own notes, and (T35, DEC-144) C-134.13–C-134.16 name
 * `noteRevise` and `noteDelete` too, with no new code. Rows changed or added in T34 and T35 await
 * `promotion`'s next stamp; (T41) C-134.20–C-134.28 the system's proposals and a note's share, awaiting the stamp too. No
 * translation names a place. This file imports nothing. */

const act = (fn) => `src/hypotheses/index.mjs ${fn}`;
const acts = (...fns) => fns.map(act).join("; ");
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
  MACHINE_CANNOT_NOTE: { check: "C-134.13", where: acts("noteWrite", "noteRevise", "noteTurn", "noteDelete"),
    translation: "Only a member keeps a note of their own. Nothing was written." },
  NOTE_NO_TEXT: { check: "C-134.14", where: acts("noteWrite", "noteRevise"),
    translation: "Write the note in your own words. Nothing was written." },
  NOTE_TOO_LONG: { check: "C-134.15", where: acts("noteWrite", "noteRevise"),
    translation: "This note is longer than one note can hold. Split it into shorter notes. Nothing was written, and nothing was cut." },
  NO_SUCH_NOTE: { check: "C-134.16", where: acts("noteTurn", "noteRevise", "noteDelete"),
    translation: "There is no note of yours by that number. Nothing was written." },
  NOTE_TURN_UNKNOWN: { check: "C-134.17", where: act("noteTurn"),
    translation: "A note becomes an observation, a hunch or a question. Nothing was written." },
  NOTE_TURN_NOT_MADE: { check: "C-134.18", where: act("noteTurn"),
    translation: "Name what you made from this note by the record's own id: the observation or the question your act made. Nothing was written." },
  NOTE_TOO_LONG_FOR_HUNCH: { check: "C-134.19", where: act("noteTurn"),
    translation: "This note is longer than a hunch can hold. Hold a shorter hunch in your own words, and keep the note as it is. Nothing was written, and nothing was cut." },
  /* T41 (T41-16; D33, D46 A, D3, D18): the system's proposals (R16–R18) and a note's share (R19–R21) */
  PROPOSAL_NO_HOW: { check: "C-134.20", where: act("hypothesisPropose"),
    translation: "A proposal of the system's says how it was worked out. Nothing was written." },
  PROPOSAL_NO_RATE: { check: "C-134.21", where: act("hypothesisPropose"),
    translation: "A proposal of the system's carries its measured false-alarm rate, a share between 0 and 1. Nothing was written." },
  PROPOSAL_NO_RUN: { check: "C-134.22", where: act("hypothesisPropose"),
    translation: "A proposal of the system's names the run that made it. Nothing was written." },
  NO_SUCH_PROPOSAL: { check: "C-134.23", where: acts("hypothesisTakeUp", "hypothesisSetAside"),
    translation: "There is no proposal here by that id that you can see. Nothing was written." },
  PROPOSAL_NOT_OPEN: { check: "C-134.24", where: acts("hypothesisTakeUp", "hypothesisSetAside"),
    translation: "This proposal was already taken up or set aside. Nothing was written." },
  PROPOSAL_FORM_UNKNOWN: { check: "C-134.25", where: act("hypothesisTakeUp"),
    translation: "Take a proposal up as proposed, take it up edited, or write your own instead. Nothing was written." },
  PROPOSAL_NO_REASON: { check: "C-134.26", where: act("hypothesisSetAside"),
    translation: "Say why you are setting this proposal aside. Nothing was written." },
  NO_SUCH_SHARE: { check: "C-134.27", where: act("noteUnshare"),
    translation: "There is no share of yours standing by that id. Nothing was written." },
  NARRATIVE_NOT_A_LEG: { check: "C-134.28", where: `${leg} > is-narrative-leg`,
    translation: "A shared note is a member's narrative, never something a finding rests on. Rest the finding on evidence. Nothing was written." },
};
