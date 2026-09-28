/* strength — what a claim is worth, derived and never stated (requirements: `build/requirements/strength.md`; DEC-21,
 * DEC-32, DEC-44). A PAIR of independent measurements, the weakest capture among the documents a conclusion reaches
 * and the weakest connection among the edges it rests on, with testimony beside them, never composed into one value.
 * This module derives the pair over an inquiry's live basis (R1–R6), over one version of it (R7–R10) and over a
 * candidate's legs (R26); says whether the parts of a reading share an upstream origin (R11, R12, R27); answers the
 * pair the search cache holds (R13); and holds the bar, the standard of evidence a project declares and the group's
 * default for new projects (R14–R16).
 *
 * Extracted from the legacy modules (T7, layer 6; K3, K86, K102, N60): `store.mjs` (the bar, DEC-72; the axes and the
 * walk, REC-12, REC-42, MK-2, REC-105; `op=inquirystrength`, REC-34; the pair over a version, PL-14; independence,
 * D-195, D-271, REC-161, REC-192), `schema.mjs` (`group_strength_bar`, now `./schema.mjs`) and `bio-checks.mjs`
 * (C-30, C-71, C-32.9, now `./checks.mjs`). The arithmetic is `./arithmetic.mjs`. The legacy code's comments moved
 * with it, shortened where they only restated the code.
 *
 * R5 (K102) is new with the extraction: a hunch leg is inert in every pair, so the live pair and the pair over a
 * version agree. Every walk now bounds a capture grade by what the record earns for its target (R1), the pair over a
 * version and over a candidate included, so an inquiry leg contributes the target's own answer (R2) on every path.
 *
 * REACHED as `strengthOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it declares `group_strength_bar` to record-core's purge,
 * exempt (R23). `deps`:
 *   record       `recordOf(host)` unless given: `readFile` (a project's bundle.md, R14), `declarePurge`.
 *   membership   `membershipOf(host)` unless given: `inSight(id, viewer)` (R6, R22), `isAdministrator(id)` (R15).
 *   inquiry      `basisFor(id) → {legs}`, `earned(subject, targets) → {earned: {capture, connection, testimony},
 *                subject_entity, subject_known}`, `legCapped(stated, earned, targetId)`, `subjectEntityOf(id)` (its
 *                R13, R14, R16). Required: legacy-store passes its own until `inquiry` is extracted.
 *   versions     `currentOf(project, inquiry, viewer) → {version} | null` (basis-versions R11). The version rows and
 *                legs are read from `inquiry_basis_versions` and `inquiry_basis_version_legs`.
 *   producingGroup  the store's recorded group or null; default: promotion's fact `producingGroup`.
 *   now          the clock for the instants it writes, an ISO string (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, its R37) and
 * provenance's `register` and `captured_locators` (its R48). */

import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { BASIS_GRADES, TESTIMONY_GRADE, normalizeType, OBJECT_TYPES, BUNDLE_ID_RE, parseFrontmatter,
         isMachineIdentity, VERSION_MACHINE, INSTANCE_GROUP_CHECKS } from "../../checks/bio-checks.mjs";
import { STRENGTH_AXES, DOCUMENT_AXES, DEPTH_BOUND, GRADE_RANK, axisResult } from "./arithmetic.mjs";
import { VERSION_STRENGTH_CHECKS, VERSION_STRENGTH_DEFAULT_STATES, VERSION_STRENGTH_INERT_SOURCES,
         PARTITION_INDEPENDENCE_CHECKS, STRENGTH_BAR_CHECKS } from "./checks.mjs";
import { STRENGTH_EXEMPT_TABLES, migrateStrength } from "./schema.mjs";

export { STRENGTH_AXES, DOCUMENT_AXES, DEPTH_BOUND, GRADE_RANK } from "./arithmetic.mjs";
export { VERSION_STRENGTH_CHECKS, VERSION_STRENGTH_DEFAULT_STATES, VERSION_STRENGTH_INERT_SOURCES,
         PARTITION_INDEPENDENCE_CHECKS, STRENGTH_BAR_CHECKS } from "./checks.mjs";
export { STRENGTH_SCHEMA, STRENGTH_EXEMPT_TABLES } from "./schema.mjs";

/** R8: the legs one version is measured over, and (R11) the most a proposed partition may place. */
export const VERSION_LEGS_MAX = 500;
/** R12: the origins read per step of the independence walk; reaching it makes the answer incomplete, never clean. */
export const ORIGIN_LIMIT = 200;
/** R12: the shared origins named per pair of parts. */
export const SHARED_NAMED_MAX = 5;
/** R7: how many state words a caller may name; the machine's own size, so it cannot go stale. */
export const VERSION_STRENGTH_STATES_MAX = VERSION_MACHINE.legal.length;
/** R26: the longest error message a candidate pair answers. */
export const CANDIDATE_ERROR_MAX = 200;

/* R10: every spelling this record has reached for when it meant "the strength". The guard fails on the NAME, before
   anybody reasons about the value; `pair` is checked separately, by totality. */
const PAIR_COMPOSED_KEYS = Object.freeze(["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"]);
/* R6: the fields of a named member that hold a bundle id; `ord`, `role`, `grade`, `grade_source`, `via` and `axis`
   are record facts and are never touched. */
const MEMBER_ID_FIELDS = Object.freeze(["bundle_id", "target_id", "inherited_from", "through"]);
/* R6: a bundle id as it appears in a sentence, derived from the catalogue's own pattern by dropping its anchors, so
   the two cannot come to disagree about what a bundle id looks like. */
const ID_IN_PROSE = new RegExp(BUNDLE_ID_RE.source.replace(/^\^/, "").replace(/\$$/, ""), "g");
/* R5: the sentence a hunch leg is named with, on every path. */
const HUNCH_WHY = "this leg is marked as a hunch, so it is visible here and does not count as evidence";

const isHunch = (source) => typeof source === "string" && VERSION_STRENGTH_INERT_SOURCES.includes(source);
const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const typeOfId = (id) => normalizeType(OBJECT_TYPES[String(id ?? "").split("-")[0]]) ?? "";

/* D-450: an axis nobody set is stated in words, never as a grade, a dash or "null". */
export function barAxisWords(bar) {
  return ["capture", "connection"]
    .map((axis) => bar[axis] == null ? `no bar set on the ${axis} axis` : `${axis} ${bar[axis]}`)
    .join(", ");
}

export class Strength {
  constructor({ storage, record, membership, inquiry, versions = null, producingGroup = null, now = null }) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.inquiry = inquiry;
    this.versions = versions;
    this.producingGroup = typeof producingGroup === "function" ? producingGroup : () => null;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  migrate() { migrateStrength(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { return this.#rows(q, ...a)[0] ?? null; }

  /* R22: whether the viewer may see one bundle, by membership's one rule (its R43); an absent id and an unseen one are
     the same answer. */
  #visible(id, viewer) {
    if (!id) return false;
    const g = viewerPredicate(viewer);
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args);
  }

  /* R6: the same question of ONE id, as a function: a visible id passes, an unseen one answers null, a value naming no
     bundle is left alone. Memoised for the one answer it serves. */
  #redactor(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return (id) => id ?? null;          /* a machine credential: not filtered */
    if (g.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args));
      return memo.get(id) ? id : null;
    };
  }

  /* R1 (REC-105, D-373): the walk's whole document-target set, collected once, so the registry is asked once. It
     traverses the same edges the walk will, under the same bound, so the set is exactly the set the walk asks about. The
     subject is null on purpose: the registry's capture arm does not branch on one. Null when there is nothing to ask. */
  #captureBoundsFor(bundleId, bound, topLegs = null) {
    const targets = new Set();
    const visit = (legs, depth) => {
      for (const leg of legs) {
        if (typeof leg.target_id !== "string" || !leg.target_id) continue;
        if (normalizeType(leg.target_type) === "inquiry") {
          if (depth + 1 <= bound) visit(this.#legsOf(leg.target_id), depth + 1);
          continue;
        }
        targets.add(leg.target_id);
      }
    };
    visit(topLegs ?? this.#legsOf(bundleId), 0);
    if (!targets.size) return null;
    const reg = this.inquiry.earned(null, [...targets]);
    return new Map(Object.entries((reg && reg.earned && reg.earned.capture) || {}));
  }

  #legsOf(id) {
    const b = this.inquiry.basisFor(id);
    return (b && Array.isArray(b.legs)) ? b.legs : [];
  }

  /* THE WALK (R1–R5). The top level's legs are the inquiry's projected basis, or those a caller hands in (a version's,
     R9; a candidate's, R26) — one parameter rather than a second walk, so one arithmetic serves every path. The
     recursion below always reads each sub-inquiry's own stored basis: a reading of THIS question does not restate what
     the questions beneath it rest on.

     There is deliberately no visited set and no memo: the depth bound is what makes it terminate, so a cycle written
     around the write-time guard costs a bounded walk and reports `undetermined` (R2).

     Each leg is a member of the axis its grade names (the axis is the leg's own fact, not its target's type); a leg
     graded elsewhere is inert on this axis and says so. A leg's role is carried and never composed: a leg that cuts
     against stays in the population. */
  #walk(bundleId, depth, bound, legsOverride, captureBounds) {
    const legs = legsOverride ?? this.#legsOf(bundleId);
    const members = Object.fromEntries(STRENGTH_AXES.map((a) => [a, []]));
    const exhausted = Object.fromEntries(STRENGTH_AXES.map((a) => [a, []]));
    for (const leg of legs) {
      const isInquiry = normalizeType(leg.target_type) === "inquiry";
      /* REC-42: the leg's ground travels on every member it produces, its own and the pair it inherits. Null is the
         implicit ground a leg written before DEC-32 reads. */
      const site = { bundle_id: bundleId, ord: leg.ord, target_id: leg.target_id,
                     role: leg.role, grade_source: leg.grade_source ?? null, ground: leg.ground ?? null };
      /* R5: a hunch contributes nothing on any axis, whatever it states, and is named as a hunch. It inherits nothing
         either: a hunch leg to an inquiry is inert as a whole. */
      const hunch = isHunch(leg.grade_source);
      for (const axis of STRENGTH_AXES) {
        const onAxis = leg.grade_axis === axis;
        /* DEC-21: capture and testimony range over documents, so a grade on either authored on a leg to an inquiry
           has no referent. The write refuses it (C-2.8); history is append-only, so a row written before the refusal
           still reads here, named as not load-bearing rather than thrown. */
        const noReferent = DOCUMENT_AXES.includes(axis) && isInquiry;
        if (noReferent && !onAxis) continue;
        if (hunch) {
          members[axis].push({ ...site, via: "leg", grade: null, why: HUNCH_WHY });
          continue;
        }
        const stated = onAxis && !noReferent ? (leg.grade ?? null) : null;
        /* R1: the capture axis asks the registry, for a leg that carries a letter on it; the letter stands and is
           capped, never raised. MK-2: a testimony leg is read at the one letter testimony is worth, which can only
           lower it (a replayed revision is exempt from the write's check, so history may hold a stronger one). */
        const resolved = captureBounds && axis === "capture" && stated != null
          ? this.inquiry.legCapped(stated, captureBounds.get(leg.target_id), leg.target_id)
          : axis === "testimony" && stated != null && stated !== TESTIMONY_GRADE
          ? { grade: TESTIMONY_GRADE,
              why: `this leg carries testimony at ${stated}, and a member's firsthand observation is graded `
                 + `${TESTIMONY_GRADE} on the testimony axis and at no other value, so it is read at `
                 + `${TESTIMONY_GRADE} here` }
          : null;
        members[axis].push({ ...site, via: "leg",
          grade: resolved ? resolved.grade : stated,
          why: noReferent
            ? `the target is an inquiry, not a document, so a ${axis} grade on this leg has no referent`
            : leg.grade == null ? (leg.why || `the leg carries no grade`)
            : resolved && resolved.why ? resolved.why
            : onAxis ? null
            /* MK-2: capture does not apply to a member's own words at all, which is a different fact from "graded on
               another axis". */
            : axis === "capture" && leg.grade_axis === "testimony"
            ? `this leg rests on a member's own firsthand observation, graded as testimony: the capture `
              + `grade measures how the record read a document in, and these words are the member's own, `
              + `so it does not apply here`
            : `the leg's grade is on the ${leg.grade_axis} axis` });
      }
      if (!isInquiry || hunch) continue;
      /* R2: a leg to another inquiry contributes THAT inquiry's pair, per axis, never crossed. The weakest leg it names
         travels up with it, so the leg a reader is sent to check is the actual one and not the hop. */
      if (depth + 1 > bound) {
        for (const axis of STRENGTH_AXES)
          exhausted[axis].push({ ...site, via: "inherited", grade: null,
            why: `the walk reached its depth bound of ${bound} here` });
        continue;
      }
      const sub = this.#walk(leg.target_id, depth + 1, bound, null, captureBounds);
      for (const axis of STRENGTH_AXES) {
        const s = sub[axis];
        if (s.state === "undetermined") {
          exhausted[axis].push({ ...site, via: "inherited", grade: null,
            why: `${leg.target_id} is undetermined on ${axis}: ${s.detail}` });
          continue;
        }
        members[axis].push({ ...site, via: "inherited", grade: s.grade,
          inherited_from: leg.target_id,
          /* The actual leg, however deep: a weakest that was itself inherited already names it. */
          through: s.weakest ? (s.weakest.through || s.weakest.target_id) : null,
          why: s.grade == null ? `${leg.target_id} is UNRATED on ${axis}, so it is not load-bearing here` : null });
      }
    }
    return Object.fromEntries(STRENGTH_AXES.map((axis) =>
      [axis, axisResult(axis, members[axis], exhausted[axis], bound)]));
  }

  /* One pair over the given top-level legs (or the inquiry's own), capture-bounded throughout (R1). */
  #pairOver(bundleId, topLegs = null) {
    return this.#walk(bundleId, 0, DEPTH_BOUND, topLegs, this.#captureBoundsFor(bundleId, DEPTH_BOUND, topLegs));
  }

  /** R1–R5: the derived pair for one inquiry, computed on read. One answer per axis and no scalar: a case does not
   *  have one strength. This is the authority every consumer that must be right goes through (the gated read, the
   *  pair frozen into a signed case, the grouping act's before and after, re-evaluation, the cache). */
  strengthOf(bundleId) {
    if (!bundleId) return { ok: false, reason: "NO_ID", detail: "strength requires ?id=" };
    const pair = this.#pairOver(bundleId);
    return { ok: true, bundleId, depth_bound: DEPTH_BOUND,
             capture: pair.capture, connection: pair.connection, testimony: pair.testimony };
  }

  /** R6 (REC-34): `op=inquirystrength`, the pair gated. An inquiry the viewer may not see is withheld whole, byte for
   *  byte as one that does not exist; an id named inside a visible answer is a back-reference and is redacted to null
   *  while every record fact stands (a derivation that changed with its reader would claim different things to
   *  different people). Computed on read, never from the cache (R13). */
  inquiryStrength({ id = null, viewer = null } = {}) {
    if (!id) return { ok: false, reason: "NO_ID",
      detail: "the derived pair is asked of one inquiry: pass id=<bundle id>" };
    if (!this.membership.inSight(id, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: id };
    /* Refused rather than answered UNRATED: a document has no basis and no pair, and "unrated" would state a strength
       about a thing that cannot carry one. Reachable only after visibility, so it discloses nothing. */
    const row = this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, id);
    const ty = normalizeType(row?.object_type);
    if (ty !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target: id, object_type: ty ?? null,
        detail: `${id} is a ${ty ?? "bundle"}, not an inquiry. The derived pair is a property of a `
              + `question and what it rests on; a document has no basis to derive one from.` };
    const s = this.strengthOf(id);
    if (!s.ok) return s;
    const keep = this.#redactor(viewer);
    return { ok: true, target: id, depth_bound: s.depth_bound,
             capture: redactAxis(s.capture, keep),
             connection: redactAxis(s.connection, keep),
             testimony: redactAxis(s.testimony, keep) };
  }

  /** R13: the pair the search cache holds for an inquiry, `{capture: {grade, state}, connection: {grade, state}}`, or
   *  null for any other bundle. A cache, marked so wherever it is read; nothing here answers strength from it. */
  cacheOf(bundleId, isInquiry) {
    if (!isInquiry) return null;
    const s = this.strengthOf(bundleId);
    return { capture: { grade: s.capture.grade, state: s.capture.state },
             connection: { grade: s.connection.grade, state: s.connection.state }, pair: s };
  }

  /* ============================================================ the pair over a version (R7–R10; PL-14, §12) */

  /* R9: the version's legs as the walk's members, each grade resolved from what the record earns rather than read off
     the frozen row. One registry call for the whole version. `why` travels on every leg the arithmetic will find inert,
     and the three published lists (`ungraded`, `hunches`, `graded`) are this layer's facts: where a grade came from is
     about the record, and is published beside the arithmetic's own explanation rather than overwriting it. */
  #versionLegsAsMembers(rows, subjectEntity) {
    const targets = rows.map((r) => r.target_id).filter((t) => typeof t === "string" && t);
    const reg = this.inquiry.earned(subjectEntity || null, targets);
    const earnedConn = (reg && reg.earned && reg.earned.connection) || {};
    const earnedCap = (reg && reg.earned && reg.earned.capture) || {};
    const earnedTest = (reg && reg.earned && reg.earned.testimony) || {};
    const named = { ungraded: [], hunches: [], graded: [] };
    const legs = rows.map((r) => {
      const axis = STRENGTH_AXES.includes(r.grade_axis) ? r.grade_axis : null;
      const authored = typeof r.grade === "string" && r.grade ? r.grade : null;
      const source = typeof r.grade_source === "string" && r.grade_source ? r.grade_source : null;
      const base = { ord: r.ord, target_id: r.target_id, target_type: r.target_type,
                     role: r.role, ground: r.ground, grade_axis: axis, grade_source: source };
      const inert = (why, bucket) => {
        named[bucket].push({ target_id: r.target_id, ord: r.ord, ground: r.ground,
                             role: r.role, grade_axis: axis, grade_source: source, why });
        return { ...base, grade: null, why };
      };
      const carries = (grade, why) => {
        named.graded.push({ target_id: r.target_id, ord: r.ord, ground: r.ground,
                            grade_axis: axis, grade_source: source, grade, authored, why });
        return { ...base, grade };
      };
      if (isHunch(source)) return inert(HUNCH_WHY, "hunches");
      if (!axis) return inert("this leg states no axis, so there is no population it belongs to", "ungraded");
      if (axis === "connection") {
        /* The registry holds the letter, so the leg is worth that letter and no other. A member's signed testimony
           about the connection is the one authored grade that survives: the recogniser never mints a D, and erasing
           one would overrule a signed account. */
        const e = earnedConn[r.target_id];
        if (e && e.grade) return carries(e.grade, e.why);
        if (source === "testimony" && authored)
          return carries(authored,
            `${r.target_id} carries a member's own signed account of how it connects to this subject, `
            + `with its own author and date; the record earns nothing further for it and the machine `
            + `neither mints that letter nor erases it.`);
        return inert(`the record has earned nothing connecting ${r.target_id} to this question's `
                     + `subject, so this leg is present and not yet load-bearing`, "ungraded");
      }
      if (axis === "testimony") {
        if (normalizeType(r.target_type) === "inquiry")
          return inert(`the target is an inquiry, not a document, so a testimony grade on this leg has no `
                       + `referent`, "ungraded");
        const t = earnedTest[r.target_id];
        if (t && t.grade) return carries(t.grade, t.why);
        return inert(`${r.target_id} is not a member's own firsthand observation, so the record holds no `
                     + `testimony grade for it and this leg is present and not yet load-bearing`, "ungraded");
      }
      /* CAPTURE: the earned entry is a ceiling, not a value, so the member's letter stands and is capped. Two empty
         levels are different facts (REC-88, D-349): no bytes held, and bytes held with no measured fidelity. */
      const c = earnedCap[r.target_id];
      if (c && c.grade == null && c.undetermined_because) return inert(c.why, "ungraded");
      if (!c || !c.grade)
        return inert(`the record holds no captured bytes for ${r.target_id}, so there is nothing here `
                     + `to measure how it was captured`, "ungraded");
      if (!authored)
        return inert(`${r.target_id} is captured, but no capture grade was authored for this leg and `
                     + `the record cannot mint one — what it holds is a ceiling, not a measurement`, "ungraded");
      const capped = GRADE_RANK[authored] > GRADE_RANK[c.grade] ? c.grade : authored;
      return carries(capped, capped === authored ? c.why
        : `${c.why} This leg was authored at ${authored} and is reported at ${capped}, because the `
        + `record cannot support the stronger claim.`);
    });
    return { legs, ...named, subject_entity: reg ? reg.subject_entity : null,
             subject_known: reg ? reg.subject_known : false };
  }

  /** R7–R10: `op=versionstrength`, the pair over ONE reading of one question's evidence (IS-7, §12). A pure read: it
   *  writes nothing and makes no version current. */
  versionStrength(a = {}) {
    const args = a || {};
    const refusal = (code, detail, extra) => {
      const row = VERSION_STRENGTH_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-version-strength: every refusal below names its code as a string literal at its site. */
    const inq = String(args.id ?? "").trim();
    if (!inq)
      return refusal("VERSION_STRENGTH_NO_INQUIRY",
        "this answers for ONE question: pass id=<INQ-…>. A strength belongs to a question's reading "
        + "of its evidence, and there is no default question.");
    if (typeOfId(inq) !== "inquiry")
      return refusal("VERSION_STRENGTH_NOT_AN_INQUIRY",
        `${inq.slice(0, 60)} is not a question, so it holds no readings of evidence and has no `
        + `strength to report.`, { inquiry: inq });
    /* §6 rule 6's argument, defaulting to accepted. A comma-separated list or an array, so a query string and a body
       say the same thing. */
    const rawStates = args.states == null || args.states === ""
      ? null
      : (Array.isArray(args.states) ? args.states : String(args.states).split(","));
    const asked = rawStates ? rawStates.map((s) => String(s).trim()).filter(Boolean) : null;
    if (asked && asked.length > VERSION_STRENGTH_STATES_MAX)
      return refusal("VERSION_STRENGTH_TOO_MANY_STATES",
        `${asked.length} kinds of reading were named and this record has `
        + `${VERSION_STRENGTH_STATES_MAX}. The bound is published here rather than applied `
        + `silently, so nothing is dropped without the caller being told.`,
        { inquiry: inq, limit: VERSION_STRENGTH_STATES_MAX });
    const unknown = asked ? asked.filter((s) => !VERSION_MACHINE.legal.includes(s)) : [];
    if (unknown.length)
      return refusal("VERSION_STRENGTH_UNKNOWN_STATE",
        `'${unknown[0].slice(0, 40)}' is not one of the states a reading can be in: `
        + `${VERSION_MACHINE.legal.join(", ")}. The set is closed, because a strength that quietly `
        + `counted readings in states nobody recognises is a number no reader could check.`,
        { inquiry: inq, unknown, legal: VERSION_MACHINE.legal });
    /* Deduped and in the machine's own order, so two callers naming one set get one sentence and one `state_set`. */
    const stateSet = asked
      ? VERSION_MACHINE.legal.filter((s) => asked.includes(s))
      : [...VERSION_STRENGTH_DEFAULT_STATES];
    /* R22: an inquiry the viewer may not see is refused exactly as one that does not exist. */
    if (!this.#visible(inq, args.viewer ?? null))
      return refusal("VERSION_STRENGTH_NOT_AN_INQUIRY",
        "no question by that id is readable here, so there is no reading of it to measure.",
        { inquiry: inq });
    /* Which reading: named outright, or the one THIS PROJECT stands on (§7: current is a property of the project's
       relationship to the inquiry, so there is no default project). */
    const wantVersion = String(args.version ?? "").trim();
    const project = String(args.project ?? "").trim();
    const current = project && this.versions ? this.versions.currentOf(project, inq, args.viewer ?? null) : null;
    const name = wantVersion || (current ? current.version : "");
    if (!name)
      return refusal("VERSION_STRENGTH_NO_VERSION",
        project
          ? `${project.slice(0, 60)} has not said which reading of ${inq} it stands on, and there is `
            + `no default reading. Name one explicitly to measure it.`
          : "name the reading to measure (version=<name>), or name the project asking (project=<PRJ-…>) "
            + "so the reading it stands on can be used. There is no default reading here.",
        { inquiry: inq, project: project || null });
    const row = this.#one(
      `SELECT name, state, description, relationship, hidden, derived_from, kind, run, author, at, leg_count
         FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, inq, name);
    if (!row)
      return refusal("VERSION_STRENGTH_NO_SUCH_VERSION",
        `no reading named '${name.slice(0, 60)}' belongs to ${inq}.`
        + (current && current.version === name
            ? ` ${project.slice(0, 60)} points at it, so the pointer has outlived the reading it names.`
            : ``),
        { inquiry: inq, version: name });
    /* §6 rule 6: a reading outside the state set is not measured, and the refusal names the widening that turns the
       request into an honest what-if, never making the reading current. */
    if (!stateSet.includes(row.state))
      return refusal("VERSION_STRENGTH_STATE_EXCLUDED",
        `'${name.slice(0, 60)}' is ${row.state} and this answer counts ${stateSet.join(", ")}. `
        + `Ask again naming ${row.state} among the states to see what it would come to — the answer `
        + `will say on its face that it is a view you constructed and not what this record stands on.`,
        { inquiry: inq, version: name, version_state: row.state, state_set: stateSet });
    /* END DEC-49 REGION is-version-strength */

    const legRows = this.#versionLegs(inq, name, true);
    const resolved = this.#versionLegsAsMembers(legRows, this.inquiry.subjectEntityOf(inq));
    const pair = this.#pairOver(inq, resolved.legs);
    const whatIf = !(stateSet.length === VERSION_STRENGTH_DEFAULT_STATES.length
                     && stateSet.every((s, i) => s === VERSION_STRENGTH_DEFAULT_STATES[i]));
    /* DEC-40's line, in band, on every answer: the what-if says whose view it is, the default says it is not filtered,
       because absence of the line is the ambiguity the ruling names. */
    const filter = whatIf
      ? `WHAT-IF — a view you constructed, not what this record stands on. `
        + `Computed over the reading '${name}', counting readings that are: ${stateSet.join(", ")}.`
      : `Computed over the reading '${name}', counting only readings a member has adopted `
        + `(${stateSet.join(", ")}). This is the record's own answer for this question and is not filtered.`;
    const out = {
      ok: true, inquiry: inq, version: name, version_state: row.state,
      ...(project ? { project, current: current ? current.version : null } : {}),
      state_set: stateSet, what_if: whatIf, filter, depth_bound: DEPTH_BOUND,
      /* One measurement per axis, over its own population; nothing beside the axes stands for all of them. */
      pair: Object.fromEntries(STRENGTH_AXES.map((ax) => [ax, pair[ax]])),
      ungraded: resolved.ungraded, hunches: resolved.hunches, graded: resolved.graded,
      grades_from: "earnedBasisRegistry",
      subject_entity: resolved.subject_entity, subject_known: resolved.subject_known,
      legs_read: legRows.length, legs_complete: legRows.length === row.leg_count,
      hidden: row.hidden === 1, derived_from: row.derived_from,
      /* R12 (D-271, D-195): recomputed against the record as it stands, not replayed from the write, so provenance
         recorded after the write can reveal a shared origin the write could not see. Parts are the distinct non-blank
         groups of the legs read. */
      independence: this.#independenceOf(legRows, distinctParts(legRows)),
    };
    return refusePairComposed(out) ?? out;
  }

  /* The legs of one stored version, in order, at most `VERSION_LEGS_MAX` (R8). */
  #versionLegs(inq, name, withGrades) {
    const cols = withGrades ? "ord, target_id, target_type, role, grade, grade_axis, grade_source, ground"
                            : "ord, target_id, target_type, role, ground";
    return this.#rows(
      `SELECT ${cols} FROM inquiry_basis_version_legs WHERE bundle_id=? AND name=? ORDER BY ord LIMIT ?`,
      inq, name, VERSION_LEGS_MAX);
  }

  /* ============================================================ independence (R11, R12, R27; D-195) */

  /* THE ONE IMPLEMENTATION (R12), for the pair over a version, a partition and a candidate alike, so the write gate
     and the ceremony's read cannot come to disagree about what "independent" means. Derived from content-addressed
     provenance: `register` maps a capture's sha to the bundle that holds it and `captured_locators` maps that sha to
     the address it was retrieved from (provenance R48); two parts sharing a bundle, a capture or an address share an
     upstream origin. `checked: false` says there was nothing to compare (one part), which is different from looked and
     found nothing; `complete` is null then. Every read asks one past the limit, and reaching it makes the answer
     incomplete rather than clean: a missed origin would be a silent pass on the side that overstates the finding. */
  #independenceOf(legs, parts) {
    let complete = true;
    const originsOf = (bundleIds) => {
      const out = new Set();
      for (const id of bundleIds) {
        out.add(`bundle:${id}`);
        const caps = this.#rows(`SELECT capture_sha FROM register WHERE bundle_id=? LIMIT ?`, id, ORIGIN_LIMIT + 1);
        if (caps.length > ORIGIN_LIMIT) complete = false;
        for (const r of caps.slice(0, ORIGIN_LIMIT)) {
          out.add(`capture:${r.capture_sha}`);
          const addrs = this.#rows(
            `SELECT DISTINCT address_norm FROM captured_locators WHERE capture_sha=? ORDER BY address_norm LIMIT ?`,
            r.capture_sha, ORIGIN_LIMIT + 1);
          if (addrs.length > ORIGIN_LIMIT) complete = false;
          for (const l of addrs.slice(0, ORIGIN_LIMIT)) out.add(`address:${l.address_norm}`);
        }
      }
      return out;
    };
    const checked = parts > 1;
    const shared = [];
    if (checked) {
      const byPart = new Map();
      for (const l of legs) {
        const g = str(l.ground);
        if (!g) continue;
        if (!byPart.has(g)) byPart.set(g, []);
        byPart.get(g).push(l.target_id);
      }
      const originSets = [...byPart].map(([label, ids]) => [label, originsOf(ids)]);
      for (let i = 0; i < originSets.length; i++)
        for (let j = i + 1; j < originSets.length; j++) {
          const common = [...originSets[i][1]].filter((o) => originSets[j][1].has(o));
          if (common.length)
            shared.push({ a: originSets[i][0], b: originSets[j][0], through: common.slice(0, SHARED_NAMED_MAX) });
        }
    }
    return { checked, parts, shared, complete: checked ? complete : null, limit: ORIGIN_LIMIT };
  }

  /** R11–R12: `op=partitionindependence`, D-195's derivation over a PROPOSED partition of a question's existing reasons
   *  (REC-161), or over a stored version's groups (REC-192), answering independence on its own with no strength key.
   *  Gated as `op=versionstrength` is; it writes nothing. No state set: the reading a member affirms at the accept
   *  ceremony is by construction not yet accepted. */
  partitionIndependence(a = {}) {
    const args = a || {};
    const refusal = (code, detail, extra) => {
      const row = PARTITION_INDEPENDENCE_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };
    /* DEC-49 REGION is-partition-independence */
    const inq = String(args.id ?? "").trim();
    if (!inq)
      return refusal("PARTITION_INDEPENDENCE_NO_INQUIRY",
        "this answers for ONE question: pass id=<INQ-…>. A partition is a grouping of one question's "
        + "reasons, and there is no default question.");
    if (typeOfId(inq) !== "inquiry")
      return refusal("PARTITION_INDEPENDENCE_NOT_AN_INQUIRY",
        `${inq.slice(0, 60)} is not a question, so it has no reasons to group.`, { inquiry: inq });
    if (!this.#visible(inq, args.viewer ?? null))
      return refusal("PARTITION_INDEPENDENCE_NOT_AN_INQUIRY",
        "no question by that id is readable here, so there are no reasons of it to group.",
        { inquiry: inq });
    const wantVersion = String(args.version ?? "").trim();
    const partitionNamed = args.partition != null && args.partition !== "";
    if (wantVersion && partitionNamed)
      return refusal("PARTITION_INDEPENDENCE_TWO_SUBJECTS",
        "name EITHER a written reading (version=<name>) OR a proposed grouping (partition=<JSON>), not "
        + "both: this answers for one of them, and which one was meant is not this plane's to guess.",
        { inquiry: inq });
    let legs, head;
    if (wantVersion) {
      const row = this.#one(
        `SELECT name, state, leg_count FROM inquiry_basis_versions WHERE bundle_id=? AND name=?`, inq, wantVersion);
      if (!row)
        return refusal("PARTITION_INDEPENDENCE_NO_SUCH_VERSION",
          `no reading named '${wantVersion.slice(0, 60)}' belongs to ${inq.slice(0, 60)}.`,
          { inquiry: inq, version: wantVersion.slice(0, 200) });
      /* The same rows the pair over a version reads, with no grade column: nothing here may carry a grade. */
      legs = this.#versionLegs(inq, row.name, false);
      head = { version: row.name, version_state: row.state, legs_read: legs.length,
               legs_complete: legs.length === row.leg_count };
    } else {
      /* The partition as the elicitation holds it: groups, each a list of positions in the question's `basis[]`, or
         `{label, legs}` so a caller that will write the partition under names asks under the same names. An unnamed
         group is filed by its position, never under a word this plane made up about somebody's argument. */
      let raw = args.partition;
      if (typeof raw === "string") {
        try { raw = JSON.parse(raw); } catch { raw = undefined; }
      }
      const unreadable = (why) => refusal("PARTITION_INDEPENDENCE_UNREADABLE", why, { inquiry: inq });
      if (!Array.isArray(raw) || !raw.length)
        return unreadable("pass partition=<JSON>: a non-empty list of groups, each a list of reason "
          + "positions (e.g. [[0,1],[2]]) or {\"label\":…,\"legs\":[…]} — or version=<name> to read a "
          + "written reading's groups instead.");
      if (raw.length > VERSION_LEGS_MAX)
        return refusal("PARTITION_INDEPENDENCE_TOO_MANY_LEGS",
          `${raw.length} groups were proposed and a written reading holds at most ${VERSION_LEGS_MAX} reasons.`,
          { inquiry: inq, limit: VERSION_LEGS_MAX });
      const parts = [];
      for (let k = 0; k < raw.length; k++) {
        const g = raw[k];
        const named = g && typeof g === "object" && !Array.isArray(g);
        const ords = named ? g.legs : g;
        const label = named ? String(g.label ?? "").trim() : `part ${k + 1}`;
        if (!label)
          return unreadable(`group ${k + 1} carries no name; leave the name out altogether to have it `
            + "filed by its position.");
        if (label.length > 200)
          return unreadable(`group ${k + 1}'s name is longer than 200 characters.`);
        if (!Array.isArray(ords) || !ords.length)
          return unreadable(`group ${k + 1} lists no reasons; every group holds at least one.`);
        if (!ords.every((o) => Number.isInteger(o) && o >= 0))
          return unreadable(`group ${k + 1} names something other than a reason's position.`);
        if (parts.some((p) => p.label === label))
          return unreadable(`two groups are both named '${label.slice(0, 60)}'.`);
        parts.push({ label, ords: [...ords] });
      }
      /* The question's own reasons, read one past the bound so a basis larger than a reading may hold is observed. */
      const legRows = this.#legsOf(inq).slice(0, VERSION_LEGS_MAX + 1)
        .map((l) => ({ ord: l.ord, target_id: l.target_id, target_type: l.target_type, role: l.role }));
      if (legRows.length > VERSION_LEGS_MAX)
        return refusal("PARTITION_INDEPENDENCE_TOO_MANY_LEGS",
          `${inq.slice(0, 60)} rests on more than ${VERSION_LEGS_MAX} reasons.`, { inquiry: inq, limit: VERSION_LEGS_MAX });
      const byOrd = new Map(legRows.map((l) => [l.ord, l]));
      const placed = new Map();
      for (const p of parts)
        for (const o of p.ords) {
          if (!byOrd.has(o))
            return refusal("PARTITION_INDEPENDENCE_UNKNOWN_LEG",
              `'${p.label.slice(0, 60)}' names reason position ${o}, and ${inq.slice(0, 60)} has `
              + `${legRows.length} reason(s)${legRows.length ? ` at positions ${legRows.map((l) => l.ord).join(", ")}` : ""}.`,
              { inquiry: inq, ord: o });
          if (placed.has(o))
            return refusal("PARTITION_INDEPENDENCE_LEG_TWICE",
              `reason position ${o} is in both '${placed.get(o).slice(0, 60)}' and '${p.label.slice(0, 60)}'.`,
              { inquiry: inq, ord: o });
          placed.set(o, p.label);
        }
      const unplaced = legRows.filter((l) => !placed.has(l.ord)).map((l) => l.ord);
      if (unplaced.length)
        return refusal("PARTITION_INDEPENDENCE_NOT_TOTAL",
          `reason position(s) ${unplaced.slice(0, 20).join(", ")} are in no group.`,
          { inquiry: inq, unplaced: unplaced.slice(0, 20) });
      legs = legRows.map((l) => ({ ...l, ground: placed.get(l.ord) }));
      head = { partition: parts.map((p) => ({ label: p.label, legs: p.ords,
                 targets: p.ords.map((o) => byOrd.get(o).target_id) })),
               legs_read: legRows.length };
    }
    /* END DEC-49 REGION is-partition-independence */
    return { ok: true, inquiry: inq, ...head, wrote: false,
             independence: this.#independenceOf(legs, distinctParts(legs)) };
  }

  /* ============================================================ a candidate's legs (R26, R27; N60) */

  /* A candidate leg `{target, role, grade, grade_axis, grade_source, ground}` as the walk's leg, its position its ord
     and its type read from its id's prefix. */
  static #candidateLeg(l, k) {
    const target = str(l?.target) ?? "";
    return { ord: k, target_id: target, target_type: typeOfId(target),
             role: typeof l?.role === "string" ? l.role : "",
             grade: l?.grade ?? null, grade_axis: l?.grade_axis ?? null,
             grade_source: l?.grade_source ?? null, ground: str(l?.ground) };
  }

  /** R26: R1–R5's three axes over `legs` given in place of the inquiry's live basis, walking inquiry legs to the depth
   *  bound exactly as `strengthOf` does. Writes nothing. A leg whose target cannot be read makes its axis undetermined
   *  or leaves it inert, never an error; a failure of the arithmetic itself is answered `{pair: null, error}`, never
   *  thrown. */
  candidatePair({ inquiry = null, legs = [] } = {}) {
    try {
      const walkLegs = (Array.isArray(legs) ? legs : []).map((l, k) => Strength.#candidateLeg(l, k));
      return { pair: this.#pairOver(String(inquiry ?? ""), walkLegs), error: null };
    } catch (e) {
      return { pair: null, error: String(e && e.message ? e.message : e).slice(0, CANDIDATE_ERROR_MAX) };
    }
  }

  /** R27: R12's independence over `legs` grouped by their `ground` into `parts` declared parts, by the one
   *  implementation. */
  candidateIndependence({ legs = [], parts = 0 } = {}) {
    const walkLegs = (Array.isArray(legs) ? legs : []).map((l, k) => Strength.#candidateLeg(l, k));
    return this.#independenceOf(walkLegs, Number.isInteger(parts) ? parts : distinctParts(walkLegs));
  }

  /* ============================================================ the bar (R14–R16; DEC-17, DEC-72) */

  /** R14: the project's own declared bar, read from its bundle.md at act time (the caller freezes it). An authored,
   *  dated, on-the-record declaration rather than a settings row, because a group may lower its own bar and may not
   *  do it quietly. MK-2: the bar stays a pair; testimony has no bar anyone has ruled. An absent bar is not a bar of
   *  zero, and says so. */
  projectBar(projectId) {
    const md = this.record.readFile(projectId, "bundle.md");
    const pfm = md && typeof md.text === "string" ? (parseFrontmatter(md.text).data || {}) : {};
    const rq = pfm.required_strength;
    const declared = { capture: null, connection: null };
    let named = false;
    if (rq && typeof rq === "object")
      for (const axis of ["capture", "connection"]) {
        if (!BASIS_GRADES.includes(rq[axis])) continue;
        declared[axis] = rq[axis];
        named = true;
      }
    if (named)
      return { declared: true, source: "project", project: projectId,
               capture: declared.capture, connection: declared.connection,
               detail: `required by ${projectId}, the project whose production this case is: capture `
                     + `${barAxisWords(declared)}. `
                     + `The bar is the project's own declaration about its own work, stated in advance, and `
                     + `is never set by who a reader is.` };
    return { declared: false, source: "none", project: projectId, capture: null, connection: null,
             detail: `${projectId} declares no required evidentiary strength, so nothing in this case was `
                   + `measured against one. An absent bar is not a bar of zero, and this case makes no `
                   + `claim to have cleared any standard. A project declares its bar in its own bundle.md, `
                   + `which is an authored, dated, on-the-record act.` };
  }

  /** R15: the group's default bar, the one a new project starts from (DEC-17 as amended). A pair: a scalar would
   *  re-collapse the two axes in the one field a reader is most likely to quote. */
  strengthBarSet({ group = null, capture = null, connection = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const refusal = (code, detail) => {
      const row = STRENGTH_BAR_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
    };
    /* DEC-49 REGION is-machine-strength-bar */
    if (!who || isMachineIdentity(who))
      return refusal("MACHINE_CANNOT_DECLARE",
        "the required evidentiary strength is the GROUP's declaration about its own work. A "
        + "machine credential may not make it. Sign in as a member.");
    /* END DEC-49 REGION is-machine-strength-bar */
    /* DEC-49 REGION is-admin-strength-bar */
    if (!this.membership.isAdministrator(who))
      return refusal("STRENGTH_BAR_NOT_ADMIN",
        "the default bar is declared for the whole group, so only an active administrator may set it. "
        + "Nothing was declared.");
    /* END DEC-49 REGION is-admin-strength-bar */
    /* D-436: the default is the store's recorded group, never a literal; with none recorded and none named there is no
       group for the declaration to belong to. */
    const gid = String(group ?? "").trim() || this.producingGroup();
    if (!gid) {
      const row = INSTANCE_GROUP_CHECKS.GROUP_UNDETERMINED;
      return { ok: false, reason: "GROUP_UNDETERMINED", code: "GROUP_UNDETERMINED", check: row.check,
               translation: row.translation, act: "strengthbar",
               detail: "the default bar is the GROUP's declaration, keyed by its group; this request names no group "
                     + "and this store records none. Nothing was declared." };
    }
    for (const [axis, v] of [["capture", capture], ["connection", connection]])
      if (v != null && !BASIS_GRADES.includes(v))
        return { ok: false, reason: "BAD_GRADE", axis,
                 detail: `${axis} must be one of ${BASIS_GRADES.join(", ")}, or null` };
    if (capture == null && connection == null)
      return { ok: false, reason: "NO_BAR",
               detail: "declare at least one axis. Withdrawing a bar entirely is a different act from setting "
                     + "one, and an absent bar is stated as absent rather than written as a blank row." };
    const at = this.now();
    this.sql.exec(
      `INSERT INTO group_strength_bar (group_id,capture,connection,author,at) VALUES (?,?,?,?,?)
       ON CONFLICT(group_id) DO UPDATE SET capture=excluded.capture, connection=excluded.connection,
         author=excluded.author, at=excluded.at`,
      gid, capture, connection, who, at);
    return { ok: true, group: gid, capture, connection, author: who, at,
             note: "this is the DEFAULT a project starts from; a project may declare its own in its bundle.md, "
                 + "which is an authored, dated, on-the-record act visible in every case it governs. "
                 + "It gates nothing." };
  }

  /** R16: the bar read. `project=` is the answer under DEC-72; `group=` is DEC-17's surviving half, the default that
   *  seeds a new project; `target=` is refused by name, because no bar attaches to a finding. A project the viewer
   *  may not see is answered as one that does not exist. Two members who can both see a project are told the same bar
   *  ("never set by who a reader is"). */
  strengthBarOf({ group = null, target = null, project = null, viewer = null } = {}) {
    if (target)
      return { ok: false, reason: "BAR_IS_A_PROJECT_PROPERTY", target,
               detail: "a standard of evidence is a property of a PROJECT, not of a finding or a claim "
                     + "(DEC-72). No bar attaches to this finding, and none ever did on its own behalf: "
                     + "what governed it was whichever project published it, at the moment it published. "
                     + "Ask the project — op=strengthbarof&project=<project id> — or op=strengthbarof&group= "
                     + "for the default a new project starts from." };
    if (project) {
      const pid = String(project).trim();
      const gate = viewerPredicate(viewer);
      const pb = this.#one(
        `SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, pid, ...gate.args);
      if (!pb)
        return { ok: false, reason: "NO_SUCH_PROJECT", project: pid,
                 detail: `no project answers to ${pid}. A project you cannot see is answered exactly as one `
                       + `that does not exist.` };
      if (normalizeType(pb.object_type) !== "project")
        return { ok: false, reason: "NOT_A_PROJECT", project: pid, object_type: pb.object_type,
                 detail: `${pid} is a ${pb.object_type}, and a standard of evidence is a property of a `
                       + `PROJECT (DEC-72).` };
      return { ok: true, project: pid, bar: this.projectBar(pid) };
    }
    const gid = String(group ?? "").trim() || this.producingGroup();
    if (!gid)
      return { ok: true, group: null, bar: null, seeds_new_projects: true,
               detail: "no group is named and this store records no producing group, so there is no group default to "
                     + "read. An absent bar gates nothing and is not a bar of zero." };
    const g = this.#one(`SELECT group_id, capture, connection, author, at FROM group_strength_bar WHERE group_id=?`, gid);
    return { ok: true, group: gid, bar: g || null, seeds_new_projects: true,
             detail: g ? null : "no group default is declared. An absent bar gates nothing and is not a bar of zero." };
  }
}

/* The distinct non-blank groups a set of legs carries: a leg naming no part is not a part anybody declared. */
function distinctParts(legs) {
  return new Set(legs.map((l) => String(l.ground ?? "").trim()).filter(Boolean)).size;
}

/* R6: one axis object with the ids the viewer may not see withheld and every record fact left as derived. The prose is
   swept too, because a `why` can carry an id from several levels down that no field of this answer holds. Returns the
   original object when nothing is withheld, and no count of what was: the count is the leak. */
function redactAxis(axis, keep) {
  let touched = false;
  const member = (m) => {
    let out = m;
    for (const f of MEMBER_ID_FIELDS) {
      if (m[f] == null || keep(m[f]) !== null) continue;
      if (out === m) out = { ...m };
      out[f] = null;
      touched = true;
    }
    return out;
  };
  const prose = (v) => typeof v !== "string" ? v : v.replace(ID_IN_PROSE, (m) => {
    if (keep(m) !== null) return m;
    touched = true;
    return "an object you may not see";
  });
  const named = (m) => {
    const r = member(m);
    const w = prose(r.why ?? null);
    if (w === (r.why ?? null)) return r;
    return { ...r, why: w };
  };
  const out = { ...axis,
    weakest: axis.weakest ? named(axis.weakest) : axis.weakest,
    not_load_bearing: (axis.not_load_bearing ?? []).map(named),
    ...(axis.undetermined_at ? { undetermined_at: axis.undetermined_at.map(named) } : {}),
    /* REC-42: each ground names its own weakest, inert and unfinished members, so it gets the same sweep; the ground
       label is authored on the visible subject itself and is a record fact. */
    ...(axis.grounds ? { grounds: axis.grounds.map((g) => ({ ...g,
          weakest: g.weakest ? named(g.weakest) : g.weakest,
          not_load_bearing: (g.not_load_bearing ?? []).map(named),
          ...(g.undetermined_at ? { undetermined_at: g.undetermined_at.map(named) } : {}) })) } : {}),
    detail: prose(axis.detail) };
  return touched ? { ...out, out_of_view: true } : axis;
}

/* R10 (DEC-44, DEC-40), enforced over the answer on its way out: null when well formed, else the refusal itself. */
function refusePairComposed(out) {
  const refusal = (code, detail) => {
    const row = VERSION_STRENGTH_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
  };
  if (!out || out.ok !== true) return null;
  /* DEC-49 REGION is-pair-composed */
  for (const k of PAIR_COMPOSED_KEYS)
    if (Object.prototype.hasOwnProperty.call(out, k))
      return refusal("VERSION_STRENGTH_COMPOSED",
        `this answer carries a top-level '${String(k).slice(0, 40)}', which can only be one figure `
        + `standing for every axis. Strength is one measurement PER AXIS, each over its own population `
        + `— ${STRENGTH_AXES.join(", ")} — and there is no value that is all of them.`);
  const pair = out.pair;
  if (!pair || typeof pair !== "object")
    return refusal("VERSION_STRENGTH_COMPOSED",
      "this answer carries no pair at all, so whatever it reports is not the per-axis measurements "
      + "this record makes.");
  /* Totality, both ways: exactly the axes, no more and no fewer. */
  const keys = Object.keys(pair).sort();
  const want = [...STRENGTH_AXES].sort();
  if (keys.length !== want.length || keys.some((k, i) => k !== want[i]))
    return refusal("VERSION_STRENGTH_COMPOSED",
      `the pair holds ${JSON.stringify(keys)} where it must hold exactly ${JSON.stringify(want)}. `
      + `One answer per population, and nothing beside them that reads as a summary of all of them.`);
  if (typeof out.filter !== "string" || out.filter.trim().split(/\s+/).length < 5)
    return refusal("VERSION_STRENGTH_UNFILTERED",
      "this answer does not state which readings it was computed over. Every answer says so on its "
      + "face — the record's own as plainly as a view somebody constructed — because absence of the "
      + "line is exactly what makes the two indistinguishable.");
  if (!Array.isArray(out.state_set) || !out.state_set.length)
    return refusal("VERSION_STRENGTH_UNFILTERED",
      "this answer carries no machine-readable state set beside its sentence, so a consumer would "
      + "have to parse prose to learn what it counted.");
  /* END DEC-49 REGION is-pair-composed */
  return null;
}

/** R10's guard as a function a test can drive over any answer (C-30.7, C-30.8). */
export { refusePairComposed };

/** The module's ops (K3): `strength` (in-process), `inquirystrength`, `versionstrength`, `partitionindependence`,
 *  `strengthbar`, `strengthbarof`. `viewer` and `author` are the control plane's stamps. */
export function strengthOps(s, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    strength: () => s.strengthOf(q("id")),
    inquirystrength: () => s.inquiryStrength({ id: q("id"), viewer: q("viewer") }),
    versionstrength: () => s.versionStrength({ id: q("id"), version: q("version"), project: q("project"),
                                               states: q("states"), viewer: q("viewer") }),
    partitionindependence: () => s.partitionIndependence({ id: q("id"),
      partition: (body && body.partition !== undefined) ? body.partition : q("partition"),
      version: q("version"), viewer: q("viewer") }),
    strengthbar: () => s.strengthBarSet({ ...(body || {}), author: q("author") }),
    /* `target` still reaches the method, so a withdrawn arm is refused by name rather than 404'd at the router. */
    strengthbarof: () => s.strengthBarOf({ group: q("group"), target: q("target"), project: q("project"),
                                           viewer: q("viewer") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its table and declares it to
 *  purge, exempt (R23). */
export function strengthOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const producingGroup = d.producingGroup || (() => {
      const f = promotionOf(host).fact("producingGroup");
      return f && f.ok ? (f.value || null) : null;
    });
    s = new Strength({ ...d, storage, record, membership, producingGroup });
    instances.set(host, s);
    s.migrate();
    record.declarePurge("strength", [], { exempt: STRENGTH_EXEMPT_TABLES });
  }
  return s;
}
