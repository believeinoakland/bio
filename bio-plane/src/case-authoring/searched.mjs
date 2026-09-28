/* REC-96 / D-196 / IC-112 — THE COMPLETENESS STATEMENT'S `searched` SECTION (R17). Moved from `airun.mjs` (K82 (5),
 * N138), where `ai-runs`' later job deletes its copy; nothing there calls it.
 *
 * `OBSERVATION-LOG-DESIGN.md` §6: *at case signing: which levels were searched for the case's subjects, under which
 * authorities, with which outcomes and where each stopped — computed from the log, published with the case.*
 *
 * WHAT A LIAR WOULD DO: the cheapest way to make a coverage section green is not to forge a row but to choose the
 * SUBJECT SET. Computed over every subject the observation log holds a row for, every case is 100% searched by
 * construction and the document says nothing about the case. So the subject source must be one of
 * `ratification`'s `SEARCHED_SUBJECT_SOURCES` (only `case_basis`: the subjects come DOWN from the case's members,
 * never up from the log), and a section computed from another is refused, never published.
 *
 * Two more lies are fenced here: a level with no identified subject never reads as searched (`no_subjects`: zero of
 * zero is not 100%), and `never_looked` is the hardest value to reach, never the default. A subject with no row has
 * three causes (Observation Log §5.1) and only the third licenses a positive statement; where the meaning level's
 * pre-log evidence is one-sided (`MEANING_EVIDENCE_IS_ONE_SIDED`) cause (3) is unreachable, so the section says
 * `undetermined` instead, deciding that by consulting the constant, so a subject kind added later fails closed. */

import { OBSERVATION_LEVELS, OBSERVATION_SUBJECT_KINDS, MEANING_EVIDENCE_IS_ONE_SIDED } from "../observation-log/index.mjs";
import { SEARCHED_SUBJECT_SOURCES } from "../ratification/index.mjs";

/** R17: what a level's answer can be. `no_subjects` and `undetermined` exist so the other three cannot be reached
 *  dishonestly. */
export const SEARCHED_LEVEL_OUTCOMES = Object.freeze({
  searched:     "every subject this case names at this level has an observation: the record can say "
              + "what was looked for and what came of it",
  partial:      "some of this case's subjects at this level have an observation and some do not, or "
              + "some could not be identified at all -- the coverage is stated and is not complete",
  never_looked: "no subject this case names at this level has ever been looked at, and cause (3) of "
              + "section 5.1 is ESTABLISHED for every one of them. This is the one outcome that "
              + "licenses a positive statement about the absence",
  undetermined: "no subject this case names at this level has an observation, and the pre-log or "
              + "purge cause cannot be excluded -- so whether anybody looked is not knowable from "
              + "this record, and that is stated rather than resolved in either direction",
  no_subjects:  "this case names no subject this level could be computed over. This is NOT coverage: "
              + "zero of zero is not 100%, and a level that reports it is saying the question was "
              + "not askable here rather than that it was answered",
});

/** R17: the section, computed. Pure; touches no table.
 *
 *  `levels` is one entry per (level, subject_kind) partition the caller identified from the case, each carrying
 *  `subjects` (`{subject, state, cause}` per subject the CASE names: `state` its latest observation state or null,
 *  `cause` the §5.1 key when `state` is null) and `unidentified` (the case's referents at this level that could not be
 *  resolved to a subject at all, counted and published rather than dropped).
 *
 *  It answers `{ok: false, why}` rather than a section when it cannot compute honestly (R11): a case document that
 *  cannot say what was searched fails the ceremony rather than publishing a blank. */
export function searchedSection({ at = null, subjectSource = null, levels = null } = {}) {
  if (typeof at !== "string" || at.trim() === "")
    return { ok: false, why: "a searched section requires the time it was computed at" };
  if (!Object.prototype.hasOwnProperty.call(SEARCHED_SUBJECT_SOURCES, String(subjectSource)))
    return { ok: false,
             why: `a searched section requires a subject source this vocabulary names (got `
                + `'${subjectSource}'; known: ${Object.keys(SEARCHED_SUBJECT_SOURCES).join(", ")}). `
                + `THE SUBJECT SET IS THE FENCE: a section computed over the observation log's own `
                + `subjects is 100% searched by construction and is a statement about the log `
                + `rather than about the case` };
  if (!Array.isArray(levels))
    return { ok: false, why: "a searched section requires a levels array, empty if the case names none" };

  const out = [];
  let totalSubjects = 0, totalLooked = 0, totalUnidentified = 0;

  for (const entry of levels) {
    const level = entry && entry.level;
    const kind = entry && entry.subject_kind;
    if (!Object.prototype.hasOwnProperty.call(OBSERVATION_LEVELS, String(level)))
      return { ok: false, why: `a searched section names a level this vocabulary does not: '${level}'` };
    if (!Object.prototype.hasOwnProperty.call(OBSERVATION_SUBJECT_KINDS, String(kind)))
      return { ok: false, why: `a searched section names a subject kind this vocabulary does not: '${kind}'` };

    const subjects = Array.isArray(entry.subjects) ? entry.subjects : [];
    const unidentified = Math.max(0, Math.floor(Number(entry.unidentified) || 0));

    /* §5.1's order and the one-sided refusal on top of it, asked of the constant: a meaning subject kind with no
       entry is one-sided (fail closed). The document and content levels' evidence is two-sided. */
    const oneSided = level === "meaning"
      ? (Object.prototype.hasOwnProperty.call(MEANING_EVIDENCE_IS_ONE_SIDED, String(kind))
           ? !!MEANING_EVIDENCE_IS_ONE_SIDED[String(kind)] : true)
      : false;

    const states = {};
    let looked = 0, neverLooked = 0, undetermined = 0, coerced = 0;
    for (const s of subjects) {
      if (s && typeof s.state === "string" && s.state !== "") {
        looked += 1;
        states[s.state] = (states[s.state] || 0) + 1;
        continue;
      }
      const cause = s ? String(s.cause) : "";
      if (cause === "never_looked") {
        /* THE COERCION: where the evidence is one-sided cause (3) cannot hold, and the honest answer is cause (2). */
        if (oneSided) { undetermined += 1; coerced += 1; } else neverLooked += 1;
      } else {
        undetermined += 1;
      }
    }

    const counted = looked + neverLooked + undetermined;
    /* An unidentified referent caps the level at `partial` however clean the identified half looks. */
    let outcome;
    if (counted === 0 && unidentified === 0)           outcome = "no_subjects";
    else if (counted === 0)                            outcome = "partial";
    else if (looked === counted && !unidentified)      outcome = "searched";
    else if (looked > 0)                               outcome = "partial";
    else if (neverLooked === counted && !unidentified) outcome = "never_looked";
    else                                               outcome = "undetermined";

    totalSubjects += counted;
    totalLooked += looked;
    /* THE MAXIMUM AND NOT THE SUM: an unresolvable referent is unresolvable at every level, so summing reported it once
       per level. The honest aggregate is the largest any single level could not resolve. */
    totalUnidentified = Math.max(totalUnidentified, unidentified);

    out.push({
      level, subject_kind: kind, outcome,
      subjects: counted, looked, never_looked: neverLooked, undetermined, unidentified,
      states,
      evidence_one_sided: oneSided,
      /* What the numbers mean, in the document, for a reader outside this project. */
      detail: SEARCHED_LEVEL_OUTCOMES[outcome]
            + (coerced
                 ? `. ${coerced} subject(s) could not be reported as never-looked-at because at this `
                 + `level and subject kind the evidence of a look exists only where the answer was `
                 + `YES: a look that found nothing leaves no trace, so *nobody looked* and *somebody `
                 + `looked and found nothing* are indistinguishable over the window before the log `
                 + `carried this level. They are reported as undetermined`
                 : "")
            + (unidentified
                 ? `. ${unidentified} referent(s) this case rests on could not be resolved to a `
                 + `subject at this level at all, so nothing is claimed about them either way`
                 : ""),
    });
  }

  return {
    ok: true,
    summary: {
      computed_at: at,
      subject_source: String(subjectSource),
      subjects: totalSubjects,
      looked: totalLooked,
      unidentified: totalUnidentified,
      levels_reported: out.length,
    },
    levels: out,
  };
}
