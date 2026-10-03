/* strength's grading method, pure (requirements: `build/requirements/strength.md`, R1–R5, R29–R34; DEC-112 (2)(3)(6)):
 * one level of the walk composed from legs whose grades and inherited answers are already resolved, the judgement of
 * which legs credited anonymously something independent bears out, the method's version and its plain words, and the
 * recomputation of a pair from the facts a case file states. The live walk (`index.mjs`) resolves each leg against the
 * record and then composes here, and `recomputePair` resolves each leg from the case file's facts and composes here, so
 * a grade recomputes the same by construction (Publication §5C). Nothing here reads a store, writes, or throws on a
 * leg it cannot read: `case-checker` imports this file alone.
 *
 * EVERY `why` BELOW IS MEMBER-FACING (R28, D-269): no word of DEC-32 clause 1's family. */

import { TESTIMONY_GRADE } from "../record-grammar/grades.mjs";
import { STRENGTH_AXES, DOCUMENT_AXES, DEPTH_BOUND, axisResult } from "./arithmetic.mjs";

/** R31: the version of the grading arithmetic of R1–R5, R29, R30 (with R33's and R34's arms, as built in T28). It
 *  changes whenever any of them changes; a case states it (`case-grammar` R11) and a checker recomputes at it. */
export const GRADING_METHOD_VERSION = "bio-grading/1";
/** R32: every version this module has published, oldest first; `recomputePair` answers for each. */
export const GRADING_METHOD_VERSIONS = Object.freeze([GRADING_METHOD_VERSION]);

/** R29 (DEC-102): the credit levels a caller may state; the first two credit anonymously. */
export const CREDIT_LEVELS = Object.freeze(["group", "project", "cover", "name"]);
export const ANONYMOUS_LEVELS = Object.freeze(["group", "project"]);
export const NAMED_LEVELS = Object.freeze(["cover", "name"]);

/* R5: the sentence a hunch leg is named with, on every path. */
export const HUNCH_WHY = "this leg is marked as a hunch, so it is visible here and does not count as evidence";
/* R29: the sentence an anonymous observation nothing independent stands beside is named with. It names no author. */
export const UNCORROBORATED_WHY = "this leg is a member's observation credited anonymously, and nothing independent in what "
  + "this rests on bears it out, so it is visible here and does not count as evidence";
/* R34: the same for a document whose off-the-record capture a member attests anonymously. It names no member. */
export const UNCORROBORATED_EVIDENCE_WHY = "this leg rests on material from an unnamed source that a member attests "
  + "anonymously, and nothing independent in what this rests on bears it out, so it is visible here and does not count "
  + "as evidence";

/** R29, R34: the levels a caller gave, as a frozen map of observation id or capture SHA-256 → level, keeping only the
 *  entries naming a level of `CREDIT_LEVELS`; null when none was given (not an object), which is today's answer. */
export function levelsGiven(levels) {
  if (!levels || typeof levels !== "object" || Array.isArray(levels)) return null;
  return Object.freeze(Object.fromEntries(Object.entries(levels)
    .filter(([id, lv]) => id && CREDIT_LEVELS.includes(lv))));
}

const LEG_KINDS = Object.freeze(["document", "observation", "inquiry", "imported"]);
/* A leg that inherits an answer (R2, R33): the target is a question or another group's finding, not a document. */
export const inheritsAnswer = (kind) => kind === "inquiry" || kind === "imported";

/* An inherited axis as the arithmetic reads it: an axis answer, or (R33) the per-axis pair an accepted edition
   publishes, a letter or `{state, grade}`. Absent or unreadable is unrated: an edition that publishes nothing on an
   axis is never stronger there than nothing (DEC-96 item 1). */
export function axisAnswerOf(a) {
  if (typeof a === "string") return GRADE_LETTERS.has(a) ? { state: "graded", grade: a } : { state: "unrated", grade: null };
  if (!a || typeof a !== "object") return { state: "unrated", grade: null };
  if (a.state === "undetermined") return { ...a, grade: null };
  if (GRADE_LETTERS.has(a.grade)) return { ...a, state: "graded" };
  return { ...a, state: "unrated", grade: null };
}
const GRADE_LETTERS = new Set(["A", "B", "C", "D"]);

/** ONE LEVEL OF THE WALK (R1–R5, R29, R33, R34): each leg a member of the axis its grade names, each inheriting leg
 *  contributing its target's answer per axis, never crossed. `legs` are `{ord, target_id, role, grade, grade_axis,
 *  grade_source, ground}`; `opts`:
 *    kindOf(leg)            one of `LEG_KINDS`
 *    capCapture(leg, stated) `{grade, why}` bounding a stated capture letter by what the record earns (R1), or null
 *    inherit(leg)           for an inheriting leg: `{pair, from, another_groups?, through?}` (the target's answer) or
 *                           `{stopped: why, unknown?}` (the walk could not finish it, R2, R33)
 *    anonymous              Map of leg index → `{corroborated, kind}` (R29, R34)
 *    bound                  the depth bound stated in the answer
 *  Answers `{capture, connection, testimony}`, each `axisResult`. */
export function levelPair(bundleId, legs, { kindOf, capCapture = () => null, inherit, anonymous = new Map(),
                                             bound = DEPTH_BOUND }) {
  const members = Object.fromEntries(STRENGTH_AXES.map((a) => [a, []]));
  const exhausted = Object.fromEntries(STRENGTH_AXES.map((a) => [a, []]));
  for (const [i, leg] of legs.entries()) {
    const kind = kindOf(leg);
    const inherits = inheritsAnswer(kind);
    /* REC-42: the leg's ground travels on every member it produces, its own and the pair it inherits. */
    const site = { bundle_id: bundleId, ord: leg.ord, target_id: leg.target_id,
                   role: leg.role, grade_source: leg.grade_source ?? null, ground: leg.ground ?? null };
    /* R5: a hunch contributes nothing on any axis, whatever it states, and inherits nothing either. */
    const hunch = leg.grade_source === "hunch";
    const anon = anonymous.get(i);
    for (const axis of STRENGTH_AXES) {
      const onAxis = leg.grade_axis === axis;
      /* DEC-21: capture and testimony range over documents, so a grade on either authored on a leg to a question (or to
         another group's finding) has no referent; history is append-only, so it is named rather than thrown. */
      const noReferent = DOCUMENT_AXES.includes(axis) && inherits;
      if (noReferent && !onAxis) continue;
      if (hunch) { members[axis].push({ ...site, via: "leg", grade: null, why: HUNCH_WHY }); continue; }
      /* R29, R34: an anonymous leg nothing independent bears out is inert on its own axis, as R3's ungraded member. */
      if (onAxis && anon && !anon.corroborated) {
        members[axis].push({ ...site, via: "leg", grade: null,
                             why: anon.kind === "evidence" ? UNCORROBORATED_EVIDENCE_WHY : UNCORROBORATED_WHY });
        continue;
      }
      const stated = onAxis && !noReferent ? (leg.grade ?? null) : null;
      /* R1: a capture letter is capped by what its target earns, never raised. MK-2: a testimony leg is read at the
         one letter testimony is worth, which can only lower it. */
      const resolved = axis === "capture" && stated != null ? capCapture(leg, stated)
        : axis === "testimony" && stated != null && stated !== TESTIMONY_GRADE
        ? { grade: TESTIMONY_GRADE,
            why: `this leg carries testimony at ${stated}, and a member's firsthand observation is graded `
               + `${TESTIMONY_GRADE} on the testimony axis and at no other value, so it is read at `
               + `${TESTIMONY_GRADE} here` }
        : null;
      members[axis].push({ ...site, via: "leg",
        grade: resolved ? resolved.grade : stated,
        why: noReferent
          ? (kind === "imported"
              ? `the target is another group's finding, not a document, so a ${axis} grade on this leg has no referent`
              : `the target is an inquiry, not a document, so a ${axis} grade on this leg has no referent`)
          : leg.grade == null ? `the leg carries no grade`
          : resolved && resolved.why ? resolved.why
          : onAxis ? null
          : axis === "capture" && leg.grade_axis === "testimony"
          ? `this leg rests on a member's own firsthand observation, graded as testimony: the capture `
            + `grade measures how the record read a document in, and these words are the member's own, `
            + `so it does not apply here`
          : `the leg's grade is on the ${leg.grade_axis} axis` });
    }
    if (!inherits || hunch) continue;
    /* R2, R33: the target's own answer, per axis, never crossed. The weakest leg it names travels up with it. */
    const got = inherit(leg) || { stopped: "nothing here establishes what this leg rests on", unknown: true };
    if (got.stopped) {
      for (const axis of STRENGTH_AXES)
        exhausted[axis].push({ ...site, via: "inherited", grade: null, why: got.stopped,
                               ...(got.unknown ? { unknown: true } : {}) });
      continue;
    }
    const via = kind === "imported" ? "imported" : "inherited";
    for (const axis of STRENGTH_AXES) {
      const s = axisAnswerOf(got.pair ? got.pair[axis] : null);
      const from = got.from ?? leg.target_id;
      if (s.state === "undetermined") {
        const allUnknown = Array.isArray(s.undetermined_at) && s.undetermined_at.length
          && s.undetermined_at.every((e) => e.unknown);
        exhausted[axis].push({ ...site, via, grade: null,
          ...(got.another_groups ? { another_groups: got.another_groups } : {}),
          why: got.another_groups
            ? `${anotherGroupsWords(got.another_groups)}, and that edition publishes ${axis} as undetermined`
            : `${from} is undetermined on ${axis}: ${s.detail ?? "what lies below it is unknown"}`,
          ...(got.another_groups || allUnknown ? { unknown: true } : {}) });
        continue;
      }
      members[axis].push({ ...site, via, grade: s.grade,
        inherited_from: from,
        ...(got.another_groups ? { another_groups: got.another_groups } : {}),
        /* The actual leg, however deep: a weakest that was itself inherited already names it. R33: nothing past
           another group's finding is walked, so it names no leg below. */
        through: got.another_groups ? null : (s.weakest ? (s.weakest.through || s.weakest.target_id) : null),
        why: got.another_groups
          ? (s.grade == null
              ? `${anotherGroupsWords(got.another_groups)}, and that edition publishes no grade on ${axis}, so it is `
                + `not load-bearing here`
              : `${anotherGroupsWords(got.another_groups)}, counted at the grade that accepted edition publishes and `
                + `never above it`)
          : s.grade == null ? `${from} is UNRATED on ${axis}, so it is not load-bearing here` : null });
    }
  }
  return Object.fromEntries(STRENGTH_AXES.map((axis) => [axis, axisResult(axis, members[axis], exhausted[axis], bound)]));
}

/* R33 (DEC-92): another group's finding named with its group, case and edition. The words are the UX stream's; until it
   gives them, this plain sentence. The finding's own id, which is that group's and looks like one of this record's, is
   carried in `another_groups.finding` and never in the sentence, so R6's sweep of record ids cannot mistake it. */
export function anotherGroupsWords(g) {
  return `this leg rests on another group's finding, in that group's case ${g.case ?? "(not stated)"} at edition `
    + `${g.edition ?? "(not stated)"}, published by ${g.group ?? "that group"}`;
}

/** R29, R30, R34 (DEC-102 items 1, 2; DEC-119 (3)): for each leg of ONE basis credited anonymously, keyed by its
 *  position in `legs`, whether something independent in the same basis bears it out, and what. A leg is credited
 *  anonymously when it is a testimony leg on an observation `levels` states at `group` or `project` (R29), or a capture
 *  or connection leg on a document one of whose captures `levels` states at those levels (R34). What bears it out is a
 *  counted leg on a document (not an observation, not a question, not another group's finding) that is not itself
 *  credited anonymously, or, for an anonymous observation only, a counted testimony leg on an observation stated at
 *  `cover` or `name` that another member authored; in either case sharing no origin with it (R12). An origin list cut
 *  at R12's limit, or an author not known, bears nothing out. `f`:
 *    kindOf(leg)  one of `LEG_KINDS`;  ownGrade(leg)  the grade the walk would count on its own axis, or null;
 *    originsOf(leg) `{set, complete}`;  authorOf(leg)  an author's key or null (never answered);
 *    capturesOf(leg) the capture SHA-256s its target holds;  seen(leg)  whether it may bear anything out (R30).
 *  Answers Map index → `{kind: "testimony"|"evidence", level, capture?, corroborated, by: [{ord, target_id}]}`. */
export function anonymityOf(legs, levels, f) {
  const out = new Map();
  if (!levels) return out;
  const levelOf = (k) => (typeof k === "string" && Object.hasOwn(levels, k) ? levels[k] : null);
  const onDocument = (l) => typeof l.target_id === "string" && l.target_id && !inheritsAnswer(f.kindOf(l));
  const judged = legs.map((l) => {
    if (!onDocument(l)) return null;
    if (l.grade_axis === "testimony") {
      const level = levelOf(l.target_id);
      return ANONYMOUS_LEVELS.includes(level) ? { kind: "testimony", level } : null;
    }
    if (l.grade_axis !== "capture" && l.grade_axis !== "connection") return null;
    if (f.kindOf(l) === "observation") return null;
    const sha = (f.capturesOf(l) || []).find((c) => ANONYMOUS_LEVELS.includes(levelOf(c)));
    return sha ? { kind: "evidence", level: levelOf(sha), capture: sha } : null;
  });
  const independent = (a, b) => {
    const x = f.originsOf(a), y = f.originsOf(b);
    return !!(x && y && x.complete && y.complete) && ![...x.set].some((o) => y.set.has(o));
  };
  legs.forEach((leg, i) => {
    const j0 = judged[i];
    if (!j0) return;
    const by = [];
    legs.forEach((other, j) => {
      if (j === i || judged[j] || !onDocument(other) || !f.seen(other)) return;
      if (f.ownGrade(other) == null) return;
      let bears;
      if (other.grade_axis === "testimony") {
        const a = f.authorOf(leg), b = f.authorOf(other);
        bears = j0.kind === "testimony" && NAMED_LEVELS.includes(levelOf(other.target_id)) && a != null && b != null && a !== b;
      } else {
        bears = f.kindOf(other) !== "observation";
      }
      if (bears && independent(leg, other)) by.push({ ord: other.ord, target_id: other.target_id });
    });
    out.set(i, { ...j0, corroborated: by.length > 0, by });
  });
  return out;
}

/* ============================================================ the method in words (R31) */

/** R31 (DEC-124; K1365 (1)): the product's name when a caller gives none. The name is not part of the method: the
 *  same version under either name is the same method, and only the first line names it. */
export const PRODUCT_NAME = "Civicsmith";

/* Each version's words, as a function of the product's name. With "CivicOS" a version answers, byte for byte, the
   words it answered before T31 (a `bio-case-document/6` edition re-renders identically, `case-grammar` R14). */
const METHOD_TEXT = Object.freeze({
  [GRADING_METHOD_VERSION]: (product) => [
    `How ${product} grades a finding (method ${GRADING_METHOD_VERSION}).`,
    "",
    "1. Two strengths, never one. A finding has a capture strength (how faithfully the documents it rests on were "
      + "taken in) and a connection strength (how firmly they are tied to what the finding is about), with testimony "
      + "(a member's own firsthand account) graded beside them. Each is worked out on its own, from the legs graded "
      + "for it, and they are never combined into one figure. Grades run from A, the strongest, to D.",
    "2. Which legs count. A leg counts only for the strength its grade names. A capture grade is never above what the "
      + "record holds for that document; a testimony grade is always D. A leg with no grade, or one marked as a hunch, "
      + "is listed and counts for nothing: it never lowers or raises a strength. A capture or testimony grade written "
      + "on a leg to another question, or to another group's finding, has nothing to grade and is listed, not counted.",
    "3. Questions resting on questions. A leg to another question contributes that question's own strengths, worked "
      + "out the same way, up to six steps down. Past six steps, or where that question's strength is not known, the "
      + "strength is stated as undetermined: unknown, not low.",
    "4. Another group's work. A leg to a finding of another group's case that this group has accepted contributes the "
      + "strengths that accepted edition published for that finding, never more, and nothing below it is followed. If "
      + "that finding cannot be read, the strength is undetermined. Withdrawing the acceptance later changes no grade.",
    "5. Sets of reasons. Legs the author did not sort into sets of reasons are all needed together, so they are only "
      + "as strong as the weakest of them. A set of reasons is only as strong as the weakest leg in it. Where the "
      + "author named several sets that each carry the finding on their own, the strongest set is what counts. The "
      + "strength is then the weaker of the legs needed by every set and that strongest set.",
    "6. When a strength is undetermined. A strength is undetermined only when something it needs is unknown: one of "
      + "the legs every set needs, or every set at once. A set that is unknown beside a known one could only be "
      + "stronger, and is named. A strength with no counted leg is unrated, and says it rests on nothing established.",
    "7. Anonymous testimony and evidence. Testimony from a member credited only to the group or the project, and "
      + "material from an unnamed source that such a member attests, counts only when something independent beside it "
      + "bears it out; otherwise it is listed and counts for nothing. What bears it out is a counted leg on a document "
      + "that shares no origin with it (not the same document, not the same capture, not the same web address) and is "
      + "not itself credited anonymously; for anonymous testimony, also a member's testimony credited by cover name or "
      + "real name, by another member, sharing no origin with it. Testimony or material credited by cover name or real "
      + "name is graded as usual.",
    "8. What is named. Each strength names the leg that sets it, and every leg that does not count, with the reason. "
      + "It also states how many hunches it left out.",
  ].join("\n"),
});

/** R31: the method of `version` in plain words, complete enough to recompute a grade by hand, naming the product by
 *  `product` (a non-blank string, used as given), else `PRODUCT_NAME`; null for a version this module never published.
 *  Pure; never throws. */
export function gradingMethodText(version, product = PRODUCT_NAME) {
  if (typeof version !== "string" || !Object.hasOwn(METHOD_TEXT, version)) return null;
  return METHOD_TEXT[version](typeof product === "string" && product.trim() ? product : PRODUCT_NAME);
}

/* ============================================================ recomputation from a case file's facts (R32) */

/* One leg's facts as the walk's leg: `{target, kind, role, grade, grade_axis, grade_source, ground, answer?, origins?,
   origins_complete?, captures?, author_key?}`. Anything else is dropped; nothing is read from elsewhere. */
function factLeg(l, k) {
  const o = l && typeof l === "object" ? l : {};
  const target = typeof o.target === "string" ? o.target.trim() : "";
  const s = (v) => (typeof v === "string" && v ? v : null);
  return { ord: Number.isInteger(o.ord) ? o.ord : k, target_id: target,
           kind: LEG_KINDS.includes(o.kind) ? o.kind : "document",
           role: typeof o.role === "string" ? o.role : "",
           grade: s(o.grade), grade_axis: s(o.grade_axis), grade_source: s(o.grade_source),
           ground: typeof o.ground === "string" && o.ground.trim() ? o.ground.trim() : null,
           answer: o.answer && typeof o.answer === "object" ? o.answer : null,
           another_groups: o.another_groups && typeof o.another_groups === "object" ? o.another_groups : null,
           origins: Array.isArray(o.origins) ? o.origins.map(String) : null,
           origins_complete: o.origins_complete === true,
           captures: Array.isArray(o.captures) ? o.captures.map(String) : [],
           author_key: s(o.author_key) };
}

/** R32: the pair (R1–R5, R29, R30, R33, R34) from the facts a case file states for one finding, reading nothing else.
 *  Each leg gives its target's recorded grade, its axis, its grade source and its ground; a leg to a question gives that
 *  question's recorded `answer` (per axis), and a leg to another group's finding the `answer` its accepted edition
 *  publishes (`case-grammar` R16's `accepted_work:` row), with `another_groups` naming it. For R29 and R34, a leg
 *  gives `origins` (with `origins_complete`), `captures` and an opaque `author_key`; a fact not stated bears nothing
 *  out. `levels` is R29's map. Any version this module never published is `UNKNOWN_METHOD_VERSION`. Pure; writes
 *  nothing; never throws. */
export function recomputePair({ legs = [], levels = null, version = null } = {}) {
  if (!GRADING_METHOD_VERSIONS.includes(version))
    return { ok: false, reason: "UNKNOWN_METHOD_VERSION", version: typeof version === "string" ? version.slice(0, 80) : null,
             versions: [...GRADING_METHOD_VERSIONS],
             detail: "this grading method version is not one this copy holds, so the grade cannot be recomputed here" };
  try {
    const walkLegs = (Array.isArray(legs) ? legs : []).map(factLeg);
    const lv = levelsGiven(levels);
    const own = (l) => {
      if (l.grade_source === "hunch" || l.grade == null || !STRENGTH_AXES.includes(l.grade_axis)) return null;
      if (inheritsAnswer(l.kind)) return null;
      return l.grade_axis === "testimony" ? TESTIMONY_GRADE : l.grade;
    };
    const anonymous = anonymityOf(walkLegs, lv, {
      kindOf: (l) => l.kind, ownGrade: own,
      originsOf: (l) => (l.origins ? { set: new Set(l.origins), complete: l.origins_complete } : null),
      authorOf: (l) => l.author_key, capturesOf: (l) => l.captures, seen: () => true });
    const pair = levelPair("", walkLegs, {
      kindOf: (l) => l.kind,
      inherit: (l) => (l.answer
        ? { pair: l.answer, from: l.target_id, ...(l.kind === "imported" ? { another_groups: l.another_groups || {} } : {}) }
        : { stopped: "the case file states no answer for what this leg rests on, so it is unknown here", unknown: true }),
      anonymous });
    return { ok: true, version, depth_bound: DEPTH_BOUND,
             capture: pair.capture, connection: pair.connection, testimony: pair.testimony,
             hunches_left_out: walkLegs.filter((l) => l.grade_source === "hunch").length, ...(lv ? { levels: lv } : {}) };
  } catch (e) {
    return { ok: false, reason: "RECOMPUTE_FAILED", version,
             detail: String(e && e.message ? e.message : e).slice(0, 200) };
  }
}
