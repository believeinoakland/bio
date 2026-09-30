/* case-grammar tests: a case document spelled as its authors spell it (publication's fixture `caseDoc`, cut to the
   parts this module reads). */
import { createHash } from "node:crypto";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const NOW = "2026-09-30T00:00:00Z";
export const V = (m) => `member:${m}`;

const scalar = (v) => (v === null || v === undefined ? "null" : typeof v === "string" ? `"${v}"` : String(v));
/** A block of flat rows, each field written as given (a string quoted), `key: []` when empty. */
export const rowsOf = (key, list) => (list.length ? [`${key}:`, ...list.flatMap((r) => Object.entries(r)
  .map(([k, v], i) => `${i ? "   " : "  -"} ${k}: ${scalar(v)}`))] : [`${key}: []`]);

/** A document: front matter `format` (and `fm`, extra lines) then `body` lines. */
export const doc = (format, fm = [], body = ["", "## Scope", "", "The question.", ""]) =>
  ["---", ...(format ? [`format: ${format}`] : []), "case_id: CASE-2026-0001", "case_edition: 1", ...fm, "---", ...body]
    .join("\n");

/** The tension section as case-authoring writes it: `{rows, sentences, depth?, unread?}`. */
export const tensionLines = ({ rows, sentences = [], depth = null, unread = null }) => [
  `tensions_disclosed: ${rows.length}`,
  `tensions_highlighted: ${rows.filter((r) => r.unseen_other_side).length}`,
  ...(depth ? [`tensions_depth_stated: "${depth}"`] : []),
  ...(unread ? rowsOf("case_tensions_unread", unread) : []),
  ...rowsOf("case_tensions", rows), ...rowsOf("case_tension_sentences", sentences)];
