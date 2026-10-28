/* extraction's interpretation (R114-R118; T53; N1272; K4636, K5445, K5496): the pure half. A part of a held capture is a range of a kind
   the reading already names as an extent; interpreting it is a recorded act for one project (`Extraction.interpretPart`), never a
   consequence of reading. This file holds what needs no storage: the part's shape and key, the acts' closed list, the refusals, and the
   range arithmetic `interpretationOf` states `not_interpreted` with. */
import { localize } from "../setup-words/index.mjs";

/** R114: how a part came to be interpreted, exactly one of these. */
export const INTERPRET_HOW = Object.freeze(["opened", "cited", "marked", "accepted_proposal"]);
/** R117: the acceptance basis every row carries (DEC-77 3b, c; `contradiction` R30). */
export const INTERPRET_BASIS = Object.freeze(["accepted", "unaided"]);
/** The most proposals one row records as standing at its instant (R117), the most a part holds fields, and the longest a field's text. */
export const STANDING_RECORDED_MAX = 200;
const PART_FIELDS_MAX = 8;
const PART_TEXT_MAX = 200;
/** The kinds whose ranges `interpretationOf` states the uninterpreted remainder of (R116): the reading's own extents, in the extent's numbering. */
export const RANGE_KINDS = Object.freeze({
  "pdf-page": Object.freeze({ from: "from", to: "to", extent: "pdf-page", at: "page" }),
  "doc-para": Object.freeze({ from: "from", to: "to", extent: "doc-para", at: "para" }),
  "slide": Object.freeze({ from: "from", to: "to", extent: "slide-shape", at: "slide" }),
  "sheet-range": Object.freeze({ from: "from_row", to: "to_row", extent: "sheet-range", at: null }),
});

const isInt = (v) => Number.isInteger(v) && v >= 0;

/** R114: a part as a plain object with a `kind` and at most eight scalar fields (text of at most 200 characters, whole numbers, booleans, null),
 *  keyed canonically (fields in name order) so one part has one key; null for anything else. A range names its ends in whole numbers with
 *  `from` at most `to` (a sheet's `from_row`, `to_row`). */
export function normalPart(part) {
  if (!part || typeof part !== "object" || Array.isArray(part)) return null;
  if (typeof part.kind !== "string" || !part.kind.trim() || part.kind.length > 40) return null;
  const names = Object.keys(part).sort();
  if (names.length > PART_FIELDS_MAX) return null;
  const out = {};
  for (const k of names) {
    const v = part[k];
    if (!/^[a-z_]{1,24}$/.test(k)) return null;
    if (typeof v === "string") { if (v.length > PART_TEXT_MAX) return null; out[k] = v; }
    else if (v === null || typeof v === "boolean" || isInt(v)) out[k] = v;
    else return null;
  }
  const r = RANGE_KINDS[out.kind];
  if (r && (out[r.from] !== undefined || out[r.to] !== undefined)) {
    if (!isInt(out[r.from]) || !isInt(out[r.to]) || out[r.from] > out[r.to]) return null;
  }
  if (out.kind === "sheet-range" && (typeof out.sheet !== "string" || !out.sheet)) return null;
  return { part: out, key: JSON.stringify(out) };
}

/** R117: whether two parts are the same part. */
export const samePart = (a, b) => { const x = normalPart(a), y = normalPart(b); return !!x && !!y && x.key === y.key; };

/* The refusals this module's interpretation answers, each `{ok: false, reason, code, status, detail}` with `detail` a sentence a member can read
   (K3985); no check row is minted (R47's catalogue is unmoved). */
const refuse = (code, status, detail, more = {}) => ({ ...more, ok: false, reason: code, code, status, detail });
export const refusals = {
  memberSession: () => refuse("MEMBER_SESSION_REQUIRED", 403,
    localize("extraction.interpret.member_session", "a part of a document is interpreted by a signed-in member, whose stamp names them; nothing was recorded")),
  notFound: () => refuse("NOT_FOUND", 404,
    localize("extraction.interpret.not_found", "no document answers to that fingerprint here; nothing was recorded")),
  badPart: () => refuse("PART_MALFORMED", 400,
    localize("extraction.interpret.part_malformed", "a part is a kind with its range, from a first to a last, in whole numbers; nothing was recorded")),
  badHow: () => refuse("INTERPRET_HOW_MALFORMED", 400,
    localize("extraction.interpret.how_malformed", "a part is interpreted by being opened, cited, marked or accepted as a proposal, and no other way; nothing was recorded"), { allowed: INTERPRET_HOW }),
  noProject: () => refuse("INTERPRET_NO_PROJECT", 400,
    localize("extraction.interpret.no_project", "a part is interpreted for one investigation, and none was named; nothing was recorded")),
  notStanding: (proposal) => refuse("PROPOSAL_NOT_STANDING", 409,
    localize("extraction.interpret.not_standing", "that proposal is not standing for this investigation and document, so it was not accepted; nothing was recorded"), { proposal }),
  limit: (limit, held) => refuse("INTERPRETATION_LIMIT", 409,
    localize("extraction.interpret.limit", "this team has reached the limit of {limit} parts interpreted ({held} held); nothing was recorded", { limit: String(limit), held: String(held) }), { limit, held }),
  notRead: () => refuse("INTERPRET_NO_CONTENT", 501,
    localize("extraction.interpret.no_content", "this part's facts cannot be made here just now; nothing was recorded"), { transient: false }),
  failed: (why, more = {}) => refuse("INTERPRET_FAILED", 502,
    localize("extraction.interpret.failed", "this part's facts could not be made ({why}); nothing was recorded", { why: String(why) }), more),
  noRow: () => refuse("NOT_FOUND", 404,
    localize("extraction.interpret.no_row", "no interpretation answers to that id here; nothing was withdrawn")),
};

/** R116: the ranges of `universe` (a list of `[from, to]`, any order) that no range of `taken` covers, in order, as `[from, to]` pairs. */
export function uncovered(universe, taken) {
  const merge = (list) => {
    const s = list.filter((r) => isInt(r[0]) && isInt(r[1]) && r[0] <= r[1]).map((r) => [r[0], r[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const out = [];
    for (const r of s) { const last = out[out.length - 1]; if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]); else out.push(r); }
    return out;
  };
  const cover = merge(taken);
  const out = [];
  for (const [u0, u1] of merge(universe)) {
    let at = u0;
    for (const [c0, c1] of cover) {
      if (c1 < at) continue;
      if (c0 > u1) break;
      if (c0 > at) out.push([at, c0 - 1]);
      at = Math.max(at, c1 + 1);
      if (at > u1) break;
    }
    if (at <= u1) out.push([at, u1]);
  }
  return out;
}
