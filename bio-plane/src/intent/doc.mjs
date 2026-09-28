/* intent's documents (R2, R8–R11, R26): the aspiration and the goal, which are record documents of their own types, and
 * the two things intent writes into a project's document (the objective's condition and the adoptions). The record's
 * front matter grammar (the catalogue's `parseFrontmatter`) has one level of map, lists of flat maps and inline scalar
 * lists, and no escapes; so a scalar written here is a bare token or a quoted string holding no quote, backslash or
 * line break, and every free text a member writes (a statement, bounds, a dead end, a lesson, a reason) lives in a
 * body section, where any text is kept as written. Each edit rewrites one field or one section and leaves every other
 * byte alone. */

import { parseFrontmatter, deriveInquiryTitle, BASIS_GRADES } from "../../checks/bio-checks.mjs";

export const ASPIRATION = "aspiration", GOAL = "goal";
export const ASPIRATION_SCOPES = Object.freeze(["group", "project", "member"]);
/** The grades a condition may require: the catalogue's, never a copy of them (N181 (3)). */
export const GRADES = BASIS_GRADES;

/** A token the grammar holds bare: an id, a key, a grade, a kind. */
export const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,199}$/;
/** A string the grammar holds between quotes, which has no escape. */
export const quotable = (s) => typeof s === "string" && !/["\\\r\n]/.test(s);
export const q = (s) => `"${String(s).replace(/["\\\r\n]/g, " ")}"`;

export const parseFm = (text) => {
  if (typeof text !== "string") return null;
  const d = parseFrontmatter(text).data;
  return d && typeof d === "object" && !Array.isArray(d) ? d : null;
};

/* The front matter's line span: [1, end) are its lines, `end` the closing fence; null when there is none. */
function fence(lines) {
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  return end === -1 ? null : end;
}

/** Set a column-0 scalar, adding it before the closing fence when the document does not carry it. */
export function setField(text, key, value) {
  const lines = text.split("\n");
  const end = fence(lines);
  if (end === null) return text;
  for (let i = 1; i < end; i++) if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
}

/** Remove a column-0 key and every indented line under it; the text unchanged when the key is absent. */
export function removeBlock(text, key) {
  const lines = text.split("\n");
  const end = fence(lines);
  if (end === null) return text;
  const at = lines.findIndex((l, i) => i > 0 && i < end && l.startsWith(key + ":"));
  if (at === -1) return text;
  let last = at;
  for (let i = at + 1; i < end && (/^\s/.test(lines[i]) || lines[i].trim() === ""); i++) last = i;
  return [...lines.slice(0, at), ...lines.slice(last + 1)].join("\n");
}

/** Put a block (`key:` and its indented lines) before the closing fence, replacing any held under that key. */
export function setBlock(text, key, childLines) {
  const lines = removeBlock(text, key).split("\n");
  const end = fence(lines);
  if (end === null) return text;
  return [...lines.slice(0, end), `${key}:`, ...childLines, ...lines.slice(end)].join("\n");
}

/** Append one flat map to a column-0 list, for its absent, inline-empty and block shapes; null for any other. */
export function appendItem(text, key, fields) {
  const lines = text.split("\n");
  const end = fence(lines);
  if (end === null) return null;
  const item = Object.entries(fields).map(([k, v], i) => `${i ? "    " : "  - "}${k}: ${v}`);
  const at = lines.findIndex((l, i) => i > 0 && i < end && l.startsWith(key + ":"));
  if (at === -1) return [...lines.slice(0, end), `${key}:`, ...item, ...lines.slice(end)].join("\n");
  const rest = lines[at].slice(key.length + 1).trim();
  if (rest === "[]") return [...lines.slice(0, at), `${key}:`, ...item, ...lines.slice(at + 1)].join("\n");
  if (rest !== "") return null;
  let last = at;
  for (let i = at + 1; i < end && /^\s/.test(lines[i]); i++) last = i;
  return [...lines.slice(0, last + 1), ...item, ...lines.slice(last + 1)].join("\n");
}

/** Append one `state_history` entry, as every state move in the record is written (C-4.2). */
export function appendHistory(text, { at, from, to, blurb, author }) {
  return appendItem(text, "state_history",
    { timestamp: q(at), from_state: from, to_state: to, blurb: q(blurb), author: TOKEN.test(author) ? author : q(author) });
}

/* ---- body sections: `## <heading>` to the next `## ` ---- */

function sectionSpan(text, heading) {
  const marker = `\n## ${heading}\n`;
  const at = text.indexOf(marker);
  if (at === -1) return null;
  const start = at + marker.length;
  const nxt = text.indexOf("\n## ", start - 1);
  return { at, start, end: nxt === -1 ? text.length : nxt };
}

/** The text of a body section, trimmed; null when the document has no such section. */
export function readSection(text, heading) {
  if (typeof text !== "string") return null;
  const s = sectionSpan(text, heading);
  return s ? text.slice(s.start, s.end).trim() : null;
}

/** Replace a body section's text, adding the section at the end when absent. */
export function setSection(text, heading, body) {
  const s = sectionSpan(text, heading);
  const content = `\n${String(body).trim()}\n`;
  if (!s) return `${text.replace(/\n*$/, "\n")}\n## ${heading}\n${content}`;
  return text.slice(0, s.start) + content + text.slice(s.end);
}

/** Append an entry at the end of a body section, adding the section when absent. */
export function appendSection(text, heading, entry) {
  const s = sectionSpan(text, heading);
  if (!s) return `${text.replace(/\n*$/, "\n")}\n## ${heading}\n\n${entry.trim()}\n`;
  const head = text.slice(0, s.end).replace(/\n*$/, "\n");
  return `${head}\n${entry.trim()}\n${text.slice(s.end)}`;
}

/** A Session Log entry, as every authored revision in the record carries one (C-13.2). */
export const logEntry = (text, at, what, author, changes) =>
  appendSection(text, "Session Log", `### Session ${at} | ${what} | ${author}\nChanges: ${changes}`);

/** R11: the dead ends recorded under an aspiration, oldest first, each `{at, author, note}`. */
export function deadEndsOf(text) {
  const body = readSection(text, "Dead Ends");
  if (!body) return [];
  const out = [];
  for (const part of body.split(/\n(?=### )/)) {
    const m = /^### (\S+) \| (.+)\n?([\s\S]*)$/.exec(part.trim());
    if (m) out.push({ at: m[1], author: m[2].trim(), note: m[3].trim() });
  }
  return out;
}

/** The title a pursuit document carries: its statement's first line, cut as a question's title is (R10 of inquiry). */
export const titleOf = (statement) => (deriveInquiryTitle(statement) || "untitled").replace(/["\\]/g, "'");

/** R26 (K171, K229): a pursuit document's id, `record-core`'s allocated number and a fixed word for its type, so the
 *  catalogue's id grammar (C-1.2) holds and the id says what kind of thing it names and nothing of what it says. */
export const pursuitId = (allocated, type) => `${allocated}-${type}`;

/* R26 (K229): the core fields C-2.2 asks of every record document that the act itself states: a member's act
   (`produced_by`), nothing pending, nothing drawn. `group` is stamped by `promotion` from the instance's producing
   group (its R13), so it is not written here. */
const CORE_TAIL = Object.freeze(["produced_by:", "  mode: human", "  capability_tier: session", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []"]);

/** R26: a new aspiration's document, `held`. */
export function aspirationDoc({ id, scope, owner, statement, entities, progressions, author, at }) {
  return ["---", `id: ${id}`, `object_type: ${ASPIRATION}`, `schema: ${ASPIRATION}@1`, `title: ${q(titleOf(statement))}`,
    "current_state: held", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
    `scope: ${scope}`, `owner: ${owner ?? "null"}`, `entities: [${entities.join(", ")}]`,
    `progressions: [${progressions.join(", ")}]`, `author: ${TOKEN.test(author) ? author : q(author)}`,
    ...CORE_TAIL, "---", "", "## Statement", "", statement.trim(), "", "## Dead Ends", "",
    "## Session Log", "", `### Session ${at} | Declared | ${author}`, `Changes: ${scope} aspiration declared.`, ""].join("\n");
}

/** R26: a new goal's document, `open`. */
export function goalDoc({ id, statement, bounds, aspiration, author, at }) {
  return ["---", `id: ${id}`, `object_type: ${GOAL}`, `schema: ${GOAL}@1`, `title: ${q(titleOf(statement))}`,
    "current_state: open", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`,
    `aspiration: ${aspiration ?? "null"}`, `author: ${TOKEN.test(author) ? author : q(author)}`, "objectives: []",
    ...CORE_TAIL, "---", "", "## Statement", "", statement.trim(), "", "## Bounds", "",
    bounds.trim(), "", "## Session Log", "", `### Session ${at} | Declared | ${author}`, "Changes: goal declared.", ""]
    .join("\n");
}

/* ---- the objective's condition, in the project's front matter (R2; Suggestions, "Where the condition lives") ---- */

export const CONDITION_KEY = "objective_condition";

/** The condition's lines under `objective_condition:`. Every value was checked to be a bare token first. */
export function conditionLines(c, by, at) {
  const lines = [`  progression: ${c.progression}`, `  entity: ${c.entity}`, `  relation: ${c.relation ?? "null"}`];
  for (const [k, v] of Object.entries(c.filter || {})) lines.push(`  filter_${k}: ${v}`);
  lines.push(`  required_grade: ${c.required.grade ?? "null"}`, `  required_stages: [${c.required.stages.join(", ")}]`,
             `  share: ${c.satisfied.share}`, `  set_by: ${TOKEN.test(by) ? by : q(by)}`, `  set_at: ${q(at)}`);
  return lines;
}

/** The condition a project's document holds, in the shape R2 takes, with who set it and when; null when none. */
export function conditionOf(fm) {
  const b = fm && fm[CONDITION_KEY];
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  const filter = {};
  for (const [k, v] of Object.entries(b)) if (k.startsWith("filter_")) filter[k.slice(7)] = v;
  const stages = Array.isArray(b.required_stages) ? b.required_stages.map(String).filter((s) => s !== "") : [];
  return {
    condition: { progression: b.progression ?? null, entity: b.entity ?? null, relation: b.relation ?? null,
                 filter: Object.keys(filter).length ? filter : null,
                 required: { grade: b.required_grade ?? null, stages }, satisfied: { share: b.share ?? null } },
    set_by: b.set_by ?? null, set_at: b.set_at ?? null,
  };
}
