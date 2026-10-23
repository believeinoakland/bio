/* strength's arithmetic (requirements: `build/requirements/strength.md`, R1–R4, R18): the one composition of an
 * axis from its members, pure, over one axis's own population at a time. Moved from `store.mjs` at this module's
 * extraction (REC-12, REC-42 / DEC-32, MK-2), its comments shortened where they only restated the code.
 *
 * Strength is derived and never stated, and it is never one value (DEC-21, DEC-44): each axis is composed separately,
 * over its own population, by the same rule, and nothing here combines two axes.
 *
 * VOCABULARY (D-160). The state of an axis with no graded member is `unrated`; an axis a necessary part of which the
 * walk could not finish is `undetermined`. The retired word for the first is not written in this module, because in
 * SB-OUTPUT §5.1 it names the opposite behaviour. */

import { BASIS_GRADES } from "../record-grammar/grades.mjs";
import { word, localize } from "../setup-words/index.mjs";

/** The axes, named once so no site spells one and none can drift. MK-2 appended `testimony` (MEMBER-KNOWLEDGE-DESIGN
 *  §3): a member's authored observation is graded on the member's trust, which is not how a document was read in. */
export const STRENGTH_AXES = Object.freeze(["capture", "connection", "testimony"]);
/** The axes that range over DOCUMENTS: a grade on either, authored on a leg to another inquiry, has no referent. */
export const DOCUMENT_AXES = Object.freeze(["capture", "testimony"]);
/** The three states an axis answer is in, and no fourth (R3, R4): `graded`, `unrated`, `undetermined`. Defined here, where
 *  the arithmetic produces them, and read from here by every other module (ratification, R9). */
export const STRENGTH_STATES = Object.freeze(["graded", "unrated", "undetermined"]);
/** R2: the depth bound of the walk. Equal to the queue's ancestor depth, and this module's own (Suggestions). */
export const DEPTH_BOUND = 6;

/** A grade's rank, a function of the catalogue's vocabulary: strongest first there, so a higher number is stronger. */
export const GRADE_RANK = Object.freeze(Object.fromEntries(BASIS_GRADES.map((g, i) => [g, BASIS_GRADES.length - i])));

/* R4, the arithmetic half of DEC-18's two defences: the weakest member of one axis's population. A null grade is the
   absence of a grade, not a weak one, so it is skipped before any rank comparison. */
function weakestOf(members) {
  let weakest = null;
  for (const m of members) {
    if (m.grade == null) continue;
    if (weakest === null || GRADE_RANK[m.grade] < GRADE_RANK[weakest.grade]) weakest = m;
  }
  return weakest;
}

/** A member of a population as it is NAMED: the weakest leg, and every leg that is not load-bearing. A leg is
 *  addressable by (bundle_id, ord). `ground`, `inherited_from`, `through`, `another_groups` (R33: the group, case and
 *  edition of another group's accepted finding), `unknown` (an unfinished member stopped by something other than the
 *  depth bound) and `why` appear only when present, so a named member of an unstructured basis reads exactly as it did
 *  before DEC-32. */
export function namedMember(m) {
  return { bundle_id: m.bundle_id, ord: m.ord, target_id: m.target_id, role: m.role,
           grade: m.grade ?? null, grade_source: m.grade_source ?? null, via: m.via,
           ...(m.ground ? { ground: m.ground } : {}),
           ...(m.inherited_from ? { inherited_from: m.inherited_from } : {}),
           ...(m.through ? { through: m.through } : {}),
           ...(m.another_groups ? { another_groups: m.another_groups } : {}),
           ...(m.unknown ? { unknown: true } : {}),
           ...(m.why ? { why: m.why } : {}) };
}

/* ONE ground's answer over the members of one axis that belong to it (R4): an AND of its legs, so no stronger than the
   weakest of them, and a leg the walk could not finish leaves the whole ground undetermined. The naming half of
   DEC-18 is here too: load-bearing membership is decided by the presence of a grade, and the inert members are named,
   never dropped (R3). Both halves ask `grade != null`, so breaking either is loud rather than a quiet wrong answer. */
function groundResult(ground, members, exhausted) {
  const isLoadBearing = (m) => m.grade != null;
  const inert = members.filter((m) => !isLoadBearing(m)).map(namedMember);
  const loadBearing = members.filter(isLoadBearing);
  if (exhausted.length)
    return { ground, state: "undetermined", grade: null, weakest: null,
             load_bearing: loadBearing.length, population: members.length,
             not_load_bearing: inert, undetermined_at: exhausted.map(namedMember) };
  if (!loadBearing.length)
    return { ground, state: "unrated", grade: null, weakest: null,
             load_bearing: 0, population: members.length, not_load_bearing: inert };
  const w = weakestOf(members);
  return { ground, state: "graded", grade: w.grade, weakest: namedMember(w),
           load_bearing: loadBearing.length, population: members.length, not_load_bearing: inert };
}

/* Where the walk stopped, in words: the depth bound for the members it reached there, and for an unfinished member
   stopped by anything else (R33: another group's work that could not be read), that nothing here establishes it. */
function stoppedAt(exhausted, depthBound) {
  const ids = (ms) => ms.map((e) => e.target_id).join(", ");
  const bound = exhausted.filter((e) => !e.unknown), unknown = exhausted.filter((e) => e.unknown);
  return [bound.length ? word("strength.text.basis_walk_reached", { depth_bound: depthBound, bound: ids(bound) }) : null,
          unknown.length ? word("strength.text.establishes_rests", { unknown: ids(unknown) }) : null]
    .filter(Boolean).join(", and ");
}

/** One axis's answer, composed from its grounds (R4, DEC-32). Three states and no fourth: `graded` (the member that
 *  sets the grade is named), `unrated` (no member carries a grade, R3) and `undetermined` (a NECESSARY part could not
 *  be finished within the depth bound, R2).
 *
 *  The axis is the MINIMUM of at most two necessary parts: THE IMPLICIT PART, every leg with no ground label, one
 *  AND-group (a leg nobody said could be done without is necessary); and THE OR PART, the labelled grounds, each
 *  independently sufficient, composed by MAXIMUM. The default is AND in the arithmetic itself, so a basis nobody
 *  structured never silently becomes stronger. An undetermined ground beside a graded one is named, and can only have
 *  been stronger; the axis is undetermined only when the implicit part is, or every ground is.
 *
 *  `cutting` (R42, K4213) holds the members of the legs that cut against the finding. They are in no part and in no
 *  ground, and are reported beside the answer with their own grades, never folded into it.
 *
 *  EVERY `detail` BELOW IS MEMBER-FACING (D-269): it is printed on the inquiry page, on the published case, beside the
 *  leg that set the grade, and inside a leg's `why`. DEC-32 clause 1 therefore binds here: the sentences never say AND,
 *  OR, disjunction or grounds. They use UI-27's elicitation words, "sets of reasons" and "carries it on its own". */
export function axisResult(axis, members, exhausted, depthBound = DEPTH_BOUND, cutting = []) {
  /* The partition, in first-appearance (document) order. */
  const keys = [];
  const bucket = new Map();
  const at = (k) => {
    if (!bucket.has(k)) { keys.push(k); bucket.set(k, { members: [], exhausted: [] }); }
    return bucket.get(k);
  };
  for (const m of members) at(m.ground ?? null).members.push(m);
  for (const e of exhausted) at(e.ground ?? null).exhausted.push(e);
  if (!keys.length) at(null);        /* a zero-leg inquiry: one empty implicit ground */
  const grounds = keys.map((k) => groundResult(k, bucket.get(k).members, bucket.get(k).exhausted));
  const structured = keys.some((k) => k !== null);

  const implicit = grounds.find((g) => g.ground === null) ?? null;
  const branches = grounds.filter((g) => g.ground !== null);
  const gradedBranches = branches.filter((g) => g.state === "graded");
  const openBranches = branches.filter((g) => g.state === "undetermined");
  /* The OR part, as one part: the strongest branch. Undetermined only when every branch is. */
  const best = gradedBranches.length
    ? gradedBranches.reduce((a, g) => GRADE_RANK[g.grade] > GRADE_RANK[a.grade] ? g : a)
    : null;
  const orPart = !branches.length ? null
    : best ? { state: "graded", grade: best.grade, weakest: best.weakest }
    : openBranches.length ? { state: "undetermined" }
    : { state: "unrated" };

  const parts = [...(implicit ? [implicit] : []), ...(orPart ? [orPart] : [])];
  const inert = grounds.flatMap((g) => g.not_load_bearing);
  const allExhausted = grounds.flatMap((g) => g.undetermined_at ?? []);
  const loadBearing = grounds.reduce((n, g) => n + g.load_bearing, 0);
  const population = grounds.reduce((n, g) => n + g.population, 0);
  /* R42 (K4213): a cutting leg is in no part; its own result is kept beside the axis, never folded into it. */
  const withGrounds = (o) => {
    const grounded = structured ? { ...o, grounds } : o;
    return cutting.length ? { ...grounded, cutting: cutting.map(namedMember) } : grounded;
  };
  const nlb = inert.map((m) => m.target_id).join(", ");
  const label = (g) => `"${g.ground}"`;

  /* A necessary part is unknown: the implicit legs, or every branch. */
  const undeterminedDetail = () => {
    const vars = { axis, count: branches.length, stopped: stoppedAt(allExhausted, depthBound) };
    return structured && branches.length && !implicit
      ? localize("strength.arithmetic.no_computed_strength_every_set",
          "this {axis} axis has NO computed strength: EVERY one of the {count} sets of reasons it rests on is undetermined, and {stopped}, so what lies below is unknown rather than absent. This is what we do not know, not a low score.", vars)
      : structured
      ? localize("strength.arithmetic.no_computed_strength_a_leg",
          "this {axis} axis has NO computed strength: a leg every one of those sets needs is undetermined, and {stopped}, so what lies below is unknown rather than absent. This is what we do not know, not a low score.", vars)
      : localize("strength.arithmetic.no_computed_strength_stopped",
          "this {axis} axis has NO computed strength: {stopped}, so what lies below is unknown rather than absent. This is what we do not know, not a low score.", vars);
  };
  if (parts.some((p) => p.state === "undetermined")) {
    return withGrounds({ axis, state: "undetermined", grade: null, determined: false,
             weakest: null, load_bearing: loadBearing, population,
             not_load_bearing: inert,
             depth_bound: depthBound,
             undetermined_at: allExhausted,
             detail: undeterminedDetail() });
  }
  /* Nothing established anywhere. An unrated ground is inert exactly as an ungraded leg is (DEC-18). */
  const gradedParts = parts.filter((p) => p.state === "graded");
  if (!gradedParts.length) {
    return withGrounds({ axis, state: "unrated", grade: null, determined: false,
             weakest: null, load_bearing: 0, population,
             not_load_bearing: inert, depth_bound: depthBound,
             detail: !population
               ? localize("strength.arithmetic.unrated_this_inquiry_rests_on_nothing",
                   "UNRATED on {axis}: this inquiry rests on nothing on this axis.", { axis })
               : structured
               ? localize("strength.arithmetic.unrated_no_leg_on_any_set",
                   "UNRATED on {axis}: no leg on this axis carries an established grade on any of the {count} sets of reasons, so this conclusion rests on nothing established here. Not load-bearing: {legs}.",
                   { axis, count: branches.length, legs: nlb })
               : localize("strength.arithmetic.unrated_no_leg_on_this_axis",
                   "UNRATED on {axis}: no leg on this axis carries an established grade, so this conclusion rests on nothing established here. Not load-bearing: {legs}.",
                   { axis, legs: nlb }) });
  }
  /* The minimum of the necessary parts. With no labelled ground there is one part: the weakest leg, as REC-12 had it. */
  const setter = gradedParts.reduce((a, p) => GRADE_RANK[p.grade] < GRADE_RANK[a.grade] ? p : a);
  const w = setter.weakest;
  const orSets = orPart && setter === orPart;
  const gradedDetail = () => {
    const via = w.through ? ` ${localize("strength.arithmetic.through", "(through {through})", { through: w.through })}` : "";
    const head = orSets
      ? localize("strength.arithmetic.strongest_of_the_sets_of_reasons",
          "{axis} {grade} — the STRONGEST of the {count} sets of reasons that each carry this conclusion on their own, which is {set}, and no stronger than the weakest {axis} WITHIN that set, which is {leg}{via}.",
          { axis, grade: setter.grade, count: branches.length, set: label(best), leg: w.target_id, via })
      : localize("strength.arithmetic.no_stronger_than_the_weakest",
          "{axis} {grade} — no stronger than the weakest {axis} it rests on, which is {leg}{via}.",
          { axis, grade: setter.grade, leg: w.target_id, via });
    const open = !openBranches.length ? null : openBranches.length === 1
      ? localize("strength.arithmetic.one_further_set_is_undetermined",
          "{count} further set is UNDETERMINED and could only be stronger, never weaker: {sets}.",
          { count: openBranches.length, sets: openBranches.map(label).join(", ") })
      : localize("strength.arithmetic.further_sets_are_undetermined",
          "{count} further sets are UNDETERMINED and could only be stronger, never weaker: {sets}.",
          { count: openBranches.length, sets: openBranches.map(label).join(", ") });
    return [head,
            ...(structured && !orSets && implicit
                ? [localize("strength.arithmetic.that_leg_is_needed_by_every",
                    "That leg is needed by every one of those sets, so no set can be stronger than it.")] : []),
            ...(openBranches.length ? [open] : []),
            ...(inert.length ? [localize("strength.arithmetic.present_and_not_yet_load_bearing",
                                 "Present and not yet load-bearing: {legs}.", { legs: nlb })] : [])].join(" ");
  };
  return withGrounds({ axis, state: "graded", grade: setter.grade, determined: true,
           weakest: w, load_bearing: loadBearing,
           population, not_load_bearing: inert,
           depth_bound: depthBound,
           detail: gradedDetail() });
}
