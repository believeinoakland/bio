/* reevaluation's invariants and refusal rows (requirements: `build/requirements/reevaluation.md`, R10, R15, R16, R22,
 * R23). DEC-49: every refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids and translations unchanged (K6, R23): C-10.1 (`reeval_pending`'s
 * shape, `checkReevalPending`, which ran inside the catalogue's core frontmatter check) and C-80.1, C-80.2 (the notice's
 * subject). C-80.3 is `content`'s (its `passageNotice`) and stays in the catalogue's `VERSION_NOTICE_CHECKS` until
 * content takes it. The member acts R15 and R16 add are this module's own family, C-110. */

import { ISO_TS_RE } from "../../checks/bio-checks.mjs";

const at = (fn, region) => `src/reevaluation/index.mjs ${fn} > ${region}`;

const finding = (check, severity, message, repairs) =>
  ({ check, severity, message, ...(repairs ? { repairable: true, repairs } : {}) });

/* ===========================================================================
 * C-10 — CASCADE HYGIENE (State Rules v1.5 §3, §5.4; spec v1.2). R22.
 *
 * `reeval_pending` is a `{flag, since, source}` record. A legacy bare boolean is accepted (old bundles validate
 * against the contract they declared) but a true flag with no `since` cannot be staleness-checked, so it is surfaced.
 * When `since` is present and the flag is true, a `since` older than the policy age is a surfaced finding (info, not
 * load-bearing). The obligation this module derives on read (R1–R6) is a different statement and never writes this
 * field; the field is what a document ASSERTS about itself.
 * ========================================================================= */

/** R22: the four cascade events a document's own `reeval_pending.source` may name (§5.4). */
export const REEVAL_SOURCES = Object.freeze(["deletion", "source_status", "wp_retraction", "annotation"]);
/** R22: the age past which a raised flag with no recorded re-evaluation is reported, unless set. */
export const REEVAL_POLICY_AGE_DAYS = 30;

/** R22 (C-10.1): the findings for one document's front matter. `nowMs` and `maxReevalAgeDays` as the catalogue's
 *  `checkBundle` takes them. Pure; never throws. */
export function checkReevalPending(fm, { nowMs = Date.now(), maxReevalAgeDays = REEVAL_POLICY_AGE_DAYS } = {}) {
  const out = [];
  const rp = fm && typeof fm === "object" ? fm.reeval_pending : undefined;
  if (rp === undefined) return out; // C-2's core-field presence handles absence
  const ageDays = maxReevalAgeDays ?? REEVAL_POLICY_AGE_DAYS;
  if (typeof rp === "boolean") {
    if (rp === true)
      out.push(finding("C-10.1", "warn", "reeval_pending is a legacy boolean true with no since/source; staleness cannot be checked",
        ["migrate reeval_pending to {flag, since, source}"]));
    return out;
  }
  if (rp === null || typeof rp !== "object" || Array.isArray(rp)) {
    out.push(finding("C-10.1", "error",
      `reeval_pending must be a {flag, since, source} record or boolean, got ${rp === null ? "null" : Array.isArray(rp) ? "array" : typeof rp}`));
    return out;
  }
  if (typeof rp.flag !== "boolean") {
    out.push(finding("C-10.1", "error", "reeval_pending.flag must be boolean"));
    return out;
  }
  if (rp.flag === false) {
    if (rp.since != null || rp.source != null)
      out.push(finding("C-10.1", "warn", "reeval_pending.flag is false but since/source are not null",
        ["reset since and source to null when clearing the flag"]));
    return out;
  }
  /* The flag is true: since and source are required and meaningful. */
  if (!ISO_TS_RE.test(typeof rp.since === "string" ? rp.since : "")) {
    out.push(finding("C-10.1", "error", "reeval_pending.flag is true but since is not an ISO-8601 UTC instant",
      ["stamp since with the cascade event time"]));
  } else {
    const ageMs = (nowMs ?? Date.now()) - Date.parse(rp.since);
    if (ageMs > ageDays * 86400000)
      out.push(finding("C-10.1", "info",
        `reeval_pending set ${Math.floor(ageMs / 86400000)}d ago (policy age ${ageDays}d) with no recorded re-evaluation`,
        ["perform and record the re-evaluation", "record an explicit accept-risk note (policy permitting)"]));
  }
  if (!REEVAL_SOURCES.includes(rp.source))
    out.push(finding("C-10.1", "error", `reeval_pending.source '${rp.source}' is not one of: ${REEVAL_SOURCES.join(", ")}`));
  return out;
}

/* ===========================================================================
 * C-80 — THE CROSS-VERSION NOTICE'S REFUSALS (D-394; `BIO_Content_Framework_v0_10.md` §18.1). R10.
 *
 * THE READ TAKES EXACTLY ONE SUBJECT, and every refusal here is about the subject rather than about the answer. The
 * answer itself is never refused: a citation whose document's version chain cannot be read is ANSWERED, with
 * `newer: null` and the reason, because a refusal there would read as "nothing to report" to a surface that renders
 * refusals quietly — the record knowing less than it says it does.
 *
 * ABSENT AND INVISIBLE ARE ONE ANSWER on both lookups, as on every gated read in this plane: a question or a passage in
 * a project the caller was never invited to refuses byte-identically to one that does not exist. The third row,
 * C-80.3 (`VERSION_NOTICE_NO_CONTENT`), is `content`'s `passageNotice`, which this module's passage arm returns as it
 * comes.
 * ========================================================================= */
export const VERSION_NOTICE_SUBJECT_CHECKS = Object.freeze({
  /* Neither subject, or both. There is no default: the notice is about a CITATION, and a notice answered for no
     citation, or for two at once, is a list the caller did not ask for wearing the word "notice". */
  VERSION_NOTICE_NO_SUBJECT: {
    check: "C-80.1",
    where: at("versionNotice", "is-version-notice-subject"),
    translation: "That request did not say which citation to check. Ask about one question (target=) "
      + "to check every passage its evidence rests on, or about one passage (content=) — one of the "
      + "two, not both and not neither.",
  },
  /* The question named is not one this caller may read, or is not a question. */
  VERSION_NOTICE_NO_INQUIRY: {
    check: "C-80.2",
    where: at("versionNotice", "is-version-notice-subject"),
    translation: "There is no question by that id that you can read here. A question you may not see "
      + "answers exactly as one that does not exist, so nothing about it was checked.",
  },
});

/* ===========================================================================
 * C-110 — THE MEMBER'S CHOICE ON A NEWER VERSION, AND A RECORDED RE-EVALUATION (R15, R16).
 *
 * Bob's 2026-09-25 00:40Z version doctrine, rule 3: ADOPT writes a new version of the reference pinned to the newer
 * capture and the old one stays readable; KEEP records "stays on the earlier version" with who, when and an optional
 * why. Either act closes the notice, and a machine may take neither. State Rules §5.4: a re-evaluation obligation is
 * cleared only by a recorded re-evaluation, which is a named member's act. Each refusal writes nothing.
 * ========================================================================= */
export const REEVALUATION_ACT_CHECKS = Object.freeze({
  MACHINE_CANNOT_ADOPT_VERSION: {
    check: "C-110.1",
    where: at("adoptVersion", "is-version-choice"),
    translation: "Only a named member can move a reference to a newer version of a document. The assistant and "
      + "the plane's own credentials may say a newer version exists; they never choose which one a finding rests on.",
  },
  MACHINE_CANNOT_KEEP_VERSION: {
    check: "C-110.2",
    where: at("keepVersion", "is-version-choice"),
    translation: "Only a named member can record that a reference stays on the earlier version. That is a "
      + "judgement about the evidence, and a machine credential holds no judgement the record would stand behind.",
  },
  VERSION_NOTICE_NOT_FOUND: {
    check: "C-110.3",
    where: at("adoptVersion", "is-version-choice"),
    translation: "There is no notice by that id that you can read here. A notice about a question you may not see "
      + "answers exactly as one that does not exist.",
  },
  VERSION_NOTICE_CLOSED: {
    check: "C-110.4",
    where: at("adoptVersion", "is-version-choice"),
    translation: "That notice has already been answered: the reference was either moved to the newer version or "
      + "kept on the earlier one, and the answer stands as recorded. A yet newer version raises a notice of its own.",
  },
  VERSION_CHOICE_WHY_MALFORMED: {
    check: "C-110.5",
    where: at("keepVersion", "is-version-choice"),
    translation: "The reason is too long, or holds a quotation mark, a backslash or a line break, which the record "
      + "cannot store. Shorten it or leave those characters out.",
  },
  MACHINE_CANNOT_RECORD_REEVALUATION: {
    check: "C-110.6",
    where: at("recordReevaluation", "is-reevaluation-record"),
    translation: "Only a named member can record that a finding was looked at again. A re-evaluation is a judgement "
      + "about whether the finding still stands, and a machine credential holds no judgement the record would stand "
      + "behind.",
  },
  REEVALUATION_NO_SUCH_CAUSE: {
    check: "C-110.7",
    where: at("recordReevaluation", "is-reevaluation-record"),
    translation: "Nothing that finding rests on has moved in the way named, or the finding is not one you can read "
      + "here, so there is no second look owed to record. Ask for the finding's re-evaluations to see what is owed.",
  },
  REEVALUATION_NOTE_MALFORMED: {
    check: "C-110.8",
    where: at("recordReevaluation", "is-reevaluation-record"),
    translation: "A recorded re-evaluation says what was looked at and what was decided. The note is missing, too "
      + "long, or holds a quotation mark, a backslash or a line break, which the record cannot store.",
  },
  VERSION_ADOPT_UNWRITABLE: {
    check: "C-110.9",
    where: at("adoptVersion", "is-version-choice"),
    translation: "The reference could not be moved: the question's document no longer holds the leg this notice was "
      + "about, or the newer version could not be written into it. Nothing was written, and the notice stays open.",
  },
});

/** The row a code names, from either of this module's families. */
export function rowOf(code) {
  return VERSION_NOTICE_SUBJECT_CHECKS[code] || REEVALUATION_ACT_CHECKS[code] || null;
}
