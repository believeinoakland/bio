/* case-grammar — what a `/6` case document carries so anybody can recreate it: the method it was made under, the
 * materials its members' chains reach with their attestations, and the other group's work it rests on (requirements:
 * `build/requirements/case-grammar.md` R11, R12, R16, with R1's `/6` and R6; DEC-112 (3)(4)(5), DEC-119 (1), DEC-96
 * item 4; K1134 Q6 (BOB's decision 15), K1273, K1275). `case-authoring` writes the blocks (its R43, R45, R48, R51, R52)
 * with the line builders here, so the bytes are written one way, and `methodOf`, `materialsOf` and `acceptedWorkOf` are
 * the one reading of them, for `public-read`, `case-checker` and `case-import` alike.
 *
 * THE BLOCKS, as a `/6` document's front matter carries them (a map, and arrays of flat rows: K549):
 *   method:                 a map `grading` (`strength`'s `GRADING_METHOD_VERSION`), `checks` (`promotion`'s
 *                           `CATALOG_VERSION`), the versions the document was graded and checked under.
 *   materials:              one row per document or observation any member's chain reaches: `ref`, `kind` (`document`
 *                           or `observation`), `sha`, `text_sha`, `origin`, `archived_copy`, `included` (whether it
 *                           travels whole), `rests_under` (`load_bearing` or `supporting`).
 *   material_attestations:  one row per attestation of a material: `ref`, `by_kind` (`member`, `co_attestation`,
 *                           `project`, `group`), `by`, `level`, `at`, `signature`, `recorded_in`.
 *   accepted_work:          one row per (member, leg) whose chain reaches another group's finding (`inquiry-grammar`
 *                           R11's ref): who accepted which edition, when and why, its result and gaps, its pair.
 *   accepted_work_flags:    one row per open flag on that work the case discloses.
 *
 * WHAT A `member` ROW AT `group` OR `project` CARRIES (DEC-102; DEC-119 (3)): no handle, no key and no signature; the
 * writer writes `by` and `signature` null for it whatever it is handed, so the bytes cannot name an anonymous member.
 * A `group` row's signature is the literal `case`: the case document's own signature covers it. A `project` row's is
 * null. Pure; the readers never throw. */

import { caseDocumentRequiresMaterials } from "./formats.mjs";
import { fmSafe } from "./blocks.mjs";

const val = (v) => (v === undefined || v === null || v === "null" ? null : v);
const bool = (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : null);
const scalar = (v) => (v === null || v === undefined ? "null" : typeof v === "boolean" ? String(v)
  : typeof v === "number" && Number.isFinite(v) ? String(v) : `"${fmSafe(v)}"`);
/* A block of flat rows; a field in `raw` is written as handed, unquoted (R16's inline pair list). */
const rowsBlock = (key, rows, fields, raw = []) => (rows.length
  ? [`${key}:`, ...rows.flatMap((r) => fields.map((f, i) =>
      `${i ? "   " : "  -"} ${f}: ${raw.includes(f) ? r[f] : scalar(r[f])}`))]
  : [`${key}: []`]);
const objects = (xs) => (Array.isArray(xs) ? xs.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);
const frontOf = (fm) => (fm && typeof fm === "object" ? fm : null);
const oneOf = (v, allowed) => (allowed.includes(v) ? v : null);
const count = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
const read = (r, fields) => Object.fromEntries(fields.map((f) => [f, val(r[f])]));

/* ===== R11 — THE METHOD (DEC-112 (3): "the version of the method and checks inside the signed case") ===== */

/** R11: the fields of the `method:` map, in the order they are written. */
export const METHOD_FIELDS = Object.freeze(["grading", "checks"]);

/** R11: the `method:` block's lines, from `{grading, checks}`. */
export function methodBlockLines(given) {
  const { grading = null, checks = null } = given && typeof given === "object" ? given : {};
  return ["method:", `  grading: ${scalar(grading)}`, `  checks: ${scalar(checks)}`];
}

/** R11: the versions a `/6` document states it was graded and checked under, `{grading, checks}`; null for a document
 *  without the block and for any other format. A version not stated reads null, undetermined (R6). Pure; never throws. */
export function methodOf(fm) {
  try {
    const d = frontOf(fm);
    if (!caseDocumentRequiresMaterials(d)) return null;
    const m = d.method;
    if (!m || typeof m !== "object" || Array.isArray(m)) return null;
    const str = (v) => (typeof val(v) === "string" && v ? v : typeof v === "number" ? String(v) : null);
    return { grading: str(m.grading), checks: str(m.checks) };
  } catch {
    return null;
  }
}

/* ===== R12 — THE MATERIALS AND THEIR ATTESTATIONS (DEC-112 (3)(4)(5); DEC-119 (1); K1134 Q6) ===== */

/** R12: the fields of a `materials:` row and of a `material_attestations:` row, in the order they are written. */
export const MATERIAL_FIELDS = Object.freeze(["ref", "kind", "sha", "text_sha", "origin", "archived_copy", "included",
  "rests_under"]);
export const MATERIAL_ATTESTATION_FIELDS = Object.freeze(["ref", "by_kind", "by", "level", "at", "signature",
  "recorded_in"]);
/** R12: what a material is, how it rests, and who attests it. */
export const MATERIAL_KINDS = Object.freeze(["document", "observation"]);
export const MATERIAL_RESTS_UNDER = Object.freeze(["load_bearing", "supporting"]);
export const ATTESTATION_BY_KINDS = Object.freeze(["member", "co_attestation", "project", "group"]);
/** R12: the levels a member's attestation is stated at (`publication` R17's four), and the two that name nobody. */
export const ATTESTATION_LEVELS = Object.freeze(["group", "project", "cover", "name"]);
export const ANONYMOUS_ATTESTATION_LEVELS = Object.freeze(["group", "project"]);
/** R12: a `group` row's signature: the case document's own signature covers it. */
export const GROUP_ATTESTATION_SIGNATURE = "case";

/* A material row as written: a `kind` or `rests_under` outside its words is written null (undetermined, never a
   guess), and `included` true only when handed true, so nothing is said to travel whole that was not. */
const materialRow = (r) => ({ ref: r.ref ?? null, kind: oneOf(r.kind, MATERIAL_KINDS), sha: r.sha ?? null,
  text_sha: r.text_sha ?? null, origin: r.origin ?? null, archived_copy: r.archived_copy ?? null,
  included: r.included === true, rests_under: oneOf(r.rests_under, MATERIAL_RESTS_UNDER) });
/* An attestation row as written, each kind's rule applied whatever it is handed. */
const attestationRow = (r) => {
  const byKind = oneOf(r.by_kind, ATTESTATION_BY_KINDS);
  const level = byKind === "member" ? oneOf(r.level, ATTESTATION_LEVELS) : null;
  /* K1317 (6): until a member's level is chosen, the row states none and carries no identity. */
  const anonymous = byKind === "member" && (level === null || ANONYMOUS_ATTESTATION_LEVELS.includes(level));
  return { ref: r.ref ?? null, by_kind: byKind, by: anonymous ? null : r.by ?? null, level, at: r.at ?? null,
           signature: byKind === "group" ? GROUP_ATTESTATION_SIGNATURE
             : byKind === "project" || anonymous ? null : r.signature ?? null,
           recorded_in: r.recorded_in ?? null };
};

/** R12 (K1317): the `materials:` block's lines, from `[{ref, kind, sha, text_sha, origin, archived_copy, included,
 *  rests_under}]`, in the order given; `materials: []` when there are none. */
export function materialsLines(rows) {
  return rowsBlock("materials", objects(rows).map(materialRow), MATERIAL_FIELDS);
}

/** R12 (K1317): the `material_attestations:` block's lines, from `[{ref, by_kind, by, level, at, signature,
 *  recorded_in}]`, in the order given. A `member` row at `group` or `project`, or with no level chosen yet, is written
 *  with no `by` and no `signature`; a `group` row's signature is `case`; a `project` row's null. `[]` when none. It is
 *  the run `SECTIONS.attestations` locates, so the act that records a member's level re-writes it whole. */
export function materialAttestationLines(rows) {
  return rowsBlock("material_attestations", objects(rows).map(attestationRow), MATERIAL_ATTESTATION_FIELDS);
}

/** R12: both blocks' lines, from `{materials, attestations}` (`materialsLines`, then `materialAttestationLines`). */
export function materialBlockLines(given) {
  const { materials = [], attestations = [] } = given && typeof given === "object" ? given : {};
  return [...materialsLines(materials), ...materialAttestationLines(attestations)];
}

/** R12: the two blocks read back from a `/6` document's front matter, in the document's order: `{materials: [{ref,
 *  kind, sha, text_sha, origin, archived_copy, included, rests_under}], attestations: [{ref, by_kind, by, level, at,
 *  signature, recorded_in}]}`; a block the document does not carry answers null, and a document carrying neither (or
 *  any other format) answers null. `included` reads true only when the bytes say true. Pure; never throws. */
export function materialsOf(fm) {
  try {
    const d = frontOf(fm);
    if (!caseDocumentRequiresMaterials(d)) return null;
    const has = (k) => Array.isArray(d[k]);
    if (!has("materials") && !has("material_attestations")) return null;
    return {
      materials: has("materials")
        ? objects(d.materials).map((r) => ({ ...read(r, MATERIAL_FIELDS), included: bool(r.included) === true })) : null,
      attestations: has("material_attestations") ? objects(d.material_attestations).map((r) => read(r, MATERIAL_ATTESTATION_FIELDS)) : null,
    };
  } catch {
    return null;
  }
}

/* ===== R16 — ANOTHER GROUP'S WORK THE CASE RESTS ON (DEC-96 item 4; N522) ===== */

/** R16: the fields of an `accepted_work:` row and of an `accepted_work_flags:` row, in the order they are written. */
export const ACCEPTED_WORK_FIELDS = Object.freeze(["member", "leg_of", "ref", "group", "case", "edition", "finding",
  "manifest_sha", "pair", "result", "gaps", "accepted_by", "accepted_at", "reason"]);
export const ACCEPTED_WORK_FLAG_FIELDS = Object.freeze(["ref", "edition", "flag", "issue", "flagged_at", "words",
  "acknowledged_by", "acknowledged_at"]);
/** R16: the axes a row's `pair` states, in order (`strength`'s three), and the states an axis is in. */
export const PAIR_AXES = Object.freeze(["capture", "connection", "testimony"]);
const AXIS_STATES = ["graded", "unrated", "undetermined"];
const GRADES = ["A", "B", "C", "D"];

/* THE PAIR ON ONE LINE. A row is flat (K549), so the pair is written as the grammar's inline list of `axis:value`, each
   value a grade letter or the axis's state (`unrated`, `undetermined`): `[capture:B, connection:C, testimony:unrated]`.
   An axis handed as a letter, a state word or `{state, grade}` is written so; anything else is `undetermined`, never a
   guess. */
const axisWord = (a) => {
  const grade = typeof a === "string" ? a : a && typeof a === "object" ? a.grade : null;
  const state = a && typeof a === "object" ? a.state : typeof a === "string" && !GRADES.includes(a) ? a : null;
  if (GRADES.includes(grade) && (state == null || state === "graded")) return grade;
  return state === "unrated" ? "unrated" : "undetermined";
};
/** R16: a pair as its row writes it. */
export function pairLine(pair) {
  const p = pair && typeof pair === "object" ? pair : {};
  return `[${PAIR_AXES.filter((x) => x !== "testimony" || x in p).map((x) => `${x}:${axisWord(p[x])}`).join(", ")}]`;
}
/** R16: a row's `pair` read back, `{capture: {state, grade}, connection: {state, grade}, testimony?}`; null when it
 *  is not the inline list R16 writes. */
export function pairOf(value) {
  if (!Array.isArray(value)) return null;
  const out = {};
  for (const item of value) {
    const m = /^([a-z]+):([A-Za-z]+)$/.exec(String(item ?? ""));
    if (!m || !PAIR_AXES.includes(m[1]) || m[1] in out) return null;
    out[m[1]] = GRADES.includes(m[2]) ? { state: "graded", grade: m[2] }
      : AXIS_STATES.includes(m[2]) && m[2] !== "graded" ? { state: m[2], grade: null } : null;
    if (!out[m[1]]) return null;
  }
  return "capture" in out && "connection" in out ? out : null;
}
/* `gaps` is the member's words on one line: a list handed is joined with "; ", in its order. */
const gapsLine = (g) => (Array.isArray(g) ? g.filter((x) => x != null && String(x).trim()).map(String).join("; ")
  : g == null ? null : String(g));

/** R16: the `accepted_work:` and `accepted_work_flags:` blocks' lines, from `{rows: [{member, leg_of, ref, group,
 *  case, edition, finding, manifest_sha, pair, result, gaps, accepted_by, accepted_at, reason}], flags: [{ref, edition,
 *  flag, issue, flagged_at, words, acknowledged_by, acknowledged_at}]}`. No line at all when both are empty: neither
 *  block is required when no chain reaches another group's finding, so such a document's bytes are what they were. */
export function acceptedWorkBlockLines(given) {
  const { rows = [], flags = [] } = given && typeof given === "object" ? given : {};
  const r = objects(rows);
  const f = objects(flags);
  if (!r.length && !f.length) return [];
  const out = rowsBlock("accepted_work", r.map((x) => ({ ...x, gaps: gapsLine(x.gaps), pair: pairLine(x.pair) })),
                        ACCEPTED_WORK_FIELDS, ["pair"]);
  return [...out, ...rowsBlock("accepted_work_flags", f, ACCEPTED_WORK_FLAG_FIELDS)];
}

/** R16: both blocks read back, `{rows: [...], flags: [...]}`, in the document's order, each row's `pair` as `pairOf`
 *  reads it and `edition` a count (null when it is not one). A document without them (any format) answers empty
 *  lists. Pure; never throws. */
export function acceptedWorkOf(fm) {
  try {
    const d = frontOf(fm);
    if (!d) return { rows: [], flags: [] };
    return {
      rows: objects(d.accepted_work).map((r) => ({ ...read(r, ACCEPTED_WORK_FIELDS), edition: count(r.edition),
                                                   pair: pairOf(r.pair) })),
      flags: objects(d.accepted_work_flags).map((r) => ({ ...read(r, ACCEPTED_WORK_FLAG_FIELDS), edition: count(r.edition) })),
    };
  } catch {
    return { rows: [], flags: [] };
  }
}
