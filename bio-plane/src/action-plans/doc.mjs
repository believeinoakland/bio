/* action-plans' document (R2, R27): a plan is a record document of type `action_plan` under a `PLN-` id (record-grammar
 * R1, R3; its `STATES.action_plan`, open → closed). Its front matter says what project it belongs to and
 * where it stands; its body's Plan Log holds every act on it, one entry each, appended and never edited, each entry its
 * fields as JSON (any text is kept as written in a body section, where the front matter's grammar has no escapes). The
 * module's tables are projections of this log. Escalation's document is the pattern (its doc.mjs). */

import { parseFrontmatter } from "../record-grammar/index.mjs";

export const ACTION_PLAN = "action_plan";
export const LOG = "Plan Log";

/** A token the front matter holds bare: an id, a key, a stamped author. */
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,199}$/;
export const q = (s) => `"${String(s).replace(/["\\\r\n]/g, " ")}"`;
export const tok = (s) => (TOKEN.test(String(s)) ? String(s) : q(s));

export const parseFm = (text) => {
  if (typeof text !== "string") return null;
  const d = parseFrontmatter(text).data;
  return d && typeof d === "object" && !Array.isArray(d) ? d : null;
};

/** R2: the id, record-core's allocated number and a fixed word, so the id grammar holds and the id says nothing of
 *  what the plan is about. */
export const planId = (allocated) => `${allocated}-plan`;

/* The core fields every record document carries (C-2.2), stated by the act: a member's act, nothing pending. */
const CORE_TAIL = Object.freeze(["produced_by:", "  mode: human", "  capability_tier: session", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []"]);

/** R2: a new plan's document, `open`, its first log entry the opening. */
export function planDoc({ id, project, title, author, at, entry }) {
  return ["---", `id: ${id}`, `object_type: ${ACTION_PLAN}`, `schema: ${ACTION_PLAN}@1`, `title: ${q(title)}`,
    "current_state: open", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`, `project: ${tok(project)}`,
    `opened_by: ${tok(author)}`, ...CORE_TAIL, "---", "", `## ${LOG}`, "", logText(1, entry), "",
    "## Session Log", "", `### Session ${at} | Plan opened | ${author}`, "Changes: plan opened.", ""].join("\n");
}

const logText = (seq, entry) => `### ${seq} | ${entry.kind} | ${entry.author} | ${entry.at}\n${JSON.stringify(entry)}`;

/** R27: the log's entries, oldest first, each its fields with `seq`; entries that do not parse are kept, marked. */
export function logOf(text) {
  const body = logSection(text);
  if (!body) return [];
  return body.split(/\n(?=### )/).map((part) => {
    const m = /^### (\d+) \| [^\n]*\n([\s\S]*)$/.exec(part.trim());
    if (!m) return { seq: null, unreadable: part.trim().slice(0, 200) };
    try {
      const e = JSON.parse(m[2].trim());
      return e && typeof e === "object" && !Array.isArray(e) ? { ...e, seq: Number(m[1]) }
        : { seq: Number(m[1]), unreadable: m[2].trim().slice(0, 200) };
    } catch { return { seq: Number(m[1]), unreadable: m[2].trim().slice(0, 200) }; }
  });
}

/** The raw text of the log section, for R27's prefix comparison; null when the document has none. */
export function logSection(text) {
  if (typeof text !== "string") return null;
  const marker = `\n## ${LOG}\n`;
  const i = text.indexOf(marker);
  if (i === -1) return null;
  const start = i + marker.length;
  const nxt = text.indexOf("\n## ", start - 1);
  return text.slice(start, nxt === -1 ? text.length : nxt).trim();
}

function fence(lines) {
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  return end === -1 ? null : end;
}

function setField(text, key, value) {
  const lines = text.split("\n");
  const end = fence(lines);
  if (end === null) return text;
  for (let i = 1; i < end; i++) if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
}

/* Append one flat map to a column-0 list (its inline-empty or block shape); null when it cannot be done in place. */
function appendItem(text, key, fields) {
  const lines = text.split("\n");
  const end = fence(lines);
  if (end === null) return null;
  const item = Object.entries(fields).map(([k, v], i) => `${i ? "    " : "  - "}${k}: ${v}`);
  const i = lines.findIndex((l, n) => n > 0 && n < end && l.startsWith(key + ":"));
  if (i === -1) return [...lines.slice(0, end), `${key}:`, ...item, ...lines.slice(end)].join("\n");
  const rest = lines[i].slice(key.length + 1).trim();
  if (rest === "[]") return [...lines.slice(0, i), `${key}:`, ...item, ...lines.slice(i + 1)].join("\n");
  if (rest !== "") return null;
  let last = i;
  for (let n = i + 1; n < end && /^\s/.test(lines[n]); n++) last = n;
  return [...lines.slice(0, last + 1), ...item, ...lines.slice(last + 1)].join("\n");
}

function appendToSection(text, heading, entry) {
  const marker = `\n## ${heading}\n`;
  const i = text.indexOf(marker);
  if (i === -1) return `${text.replace(/\n*$/, "\n")}\n## ${heading}\n\n${entry.trim()}\n`;
  const start = i + marker.length;
  const nxt = text.indexOf("\n## ", start - 1);
  const end = nxt === -1 ? text.length : nxt;
  const head = text.slice(0, end).replace(/\n*$/, "\n");
  return `${head}\n${entry.trim()}\n${text.slice(end)}`;
}

/** R27: the document with one more log entry, its state as the entry leaves it (a move written to `state_history`,
 *  C-4.2) and a Session Log entry; null when the document cannot be extended in place. */
export function appendEntry(text, { entry, seq, state, fromState, blurb }) {
  if (logSection(text) === null) return null;
  let t = appendToSection(text, LOG, logText(seq, entry));
  t = setField(t, "last_updated", q(entry.at));
  if (state !== undefined && state !== fromState) {
    t = setField(t, "prior_state", fromState);
    t = setField(t, "current_state", state);
    t = appendItem(t, "state_history",
      { timestamp: q(entry.at), from_state: fromState, to_state: state, blurb: q(blurb), author: tok(entry.author) });
    if (t === null) return null;
  }
  return appendToSection(t, "Session Log", `### Session ${entry.at} | ${blurb} | ${entry.author}\nChanges: ${entry.kind}.`);
}
