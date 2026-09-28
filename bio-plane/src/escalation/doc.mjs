/* escalation's document (R18, R21): an escalation is a record document of type `escalation` under an `ESC-` id. Its
 * front matter says what it pursues and where it stands; its body's Escalation Log holds every act on it, one entry
 * each, appended and never edited (R18), each entry its fields as JSON (any text is kept as written in a body
 * section, where the front matter's grammar has no escapes). The module's tables are projections of this log. */

import { parseFrontmatter } from "../../checks/bio-checks.mjs";

export const ESCALATION = "escalation";
export const LOG = "Escalation Log";

/** A token the front matter holds bare: an id, a key, a stamped author. */
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,199}$/;
const q = (s) => `"${String(s).replace(/["\\\r\n]/g, " ")}"`;
const tok = (s) => (TOKEN.test(String(s)) ? String(s) : q(s));

export const parseFm = (text) => {
  if (typeof text !== "string") return null;
  const d = parseFrontmatter(text).data;
  return d && typeof d === "object" && !Array.isArray(d) ? d : null;
};

/** R21 (K171): the id, record-core's allocated number and a fixed word for the type, so the catalogue's id grammar
 *  holds and the id says nothing of what the escalation pursues. */
export const escalationId = (allocated) => `${allocated}-escalation`;

/* The core fields every record document carries (C-2.2), stated by the act: a member's act, nothing pending. */
const CORE_TAIL = Object.freeze(["produced_by:", "  mode: human", "  capability_tier: session", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []"]);

/** R1, R21: a new escalation's document, `open` at stage 1, its first log entry the opening. */
export function escalationDoc({ id, project, determination, act, standards, author, at, entry }) {
  return ["---", `id: ${id}`, `object_type: ${ESCALATION}`, `schema: ${ESCALATION}@1`,
    `title: ${q(`Escalation of ${determination}`)}`, "current_state: open", "prior_state: null",
    `created: ${q(at)}`, `last_updated: ${q(at)}`, `project: ${tok(project)}`, `determination: ${tok(determination)}`,
    `act: ${act ? tok(act) : "null"}`, "stage: 1", `standards: [${standards.map(tok).join(", ")}]`,
    `opened_by: ${tok(author)}`, ...CORE_TAIL, "---", "", `## ${LOG}`, "", logText(1, entry), "",
    "## Session Log", "", `### Session ${at} | Escalation opened | ${author}`,
    "Changes: escalation opened at stage 1.", ""].join("\n");
}

const logText = (seq, entry) => `### ${seq} | ${entry.kind} | ${entry.author} | ${entry.at}\n${JSON.stringify(entry)}`;

/** R18: the log's entries, oldest first, each its fields with `seq`; entries that do not parse are kept, marked. */
export function logOf(text) {
  if (typeof text !== "string") return [];
  const marker = `\n## ${LOG}\n`;
  const at = text.indexOf(marker);
  if (at === -1) return [];
  const start = at + marker.length;
  const nxt = text.indexOf("\n## ", start - 1);
  const body = text.slice(start, nxt === -1 ? text.length : nxt).trim();
  if (!body) return [];
  return body.split(/\n(?=### )/).map((part) => {
    const m = /^### (\d+) \| [^\n]*\n([\s\S]*)$/.exec(part.trim());
    if (!m) return { seq: null, unreadable: part.trim().slice(0, 200) };
    try {
      const e = JSON.parse(m[2].trim());
      return e && typeof e === "object" && !Array.isArray(e) ? { ...e, seq: Number(m[1]) } : { seq: Number(m[1]), unreadable: m[2].trim().slice(0, 200) };
    } catch { return { seq: Number(m[1]), unreadable: m[2].trim().slice(0, 200) }; }
  });
}

/** The raw text of the log section, for R18's prefix comparison. */
export function logSection(text) {
  if (typeof text !== "string") return null;
  const marker = `\n## ${LOG}\n`;
  const at = text.indexOf(marker);
  if (at === -1) return null;
  const start = at + marker.length;
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

/* Append one flat map to a column-0 list (its inline-empty or block shape). */
function appendItem(text, key, fields) {
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

function appendToSection(text, heading, entry) {
  const marker = `\n## ${heading}\n`;
  const at = text.indexOf(marker);
  if (at === -1) return `${text.replace(/\n*$/, "\n")}\n## ${heading}\n\n${entry.trim()}\n`;
  const start = at + marker.length;
  const nxt = text.indexOf("\n## ", start - 1);
  const end = nxt === -1 ? text.length : nxt;
  const head = text.slice(0, end).replace(/\n*$/, "\n");
  return `${head}\n${entry.trim()}\n${text.slice(end)}`;
}

/** R18: the document with one more log entry, its stage and state as the entry leaves them, a state move written to
 *  `state_history` (C-4.2) and a Session Log entry; null when the document cannot be extended in place. */
export function appendEntry(text, { entry, seq, stage, state, fromState, blurb }) {
  let t = appendToSection(text, LOG, logText(seq, entry));
  t = setField(t, "last_updated", q(entry.at));
  if (stage !== undefined) t = setField(t, "stage", String(stage));
  if (state !== undefined && state !== fromState) {
    t = setField(t, "prior_state", fromState);
    t = setField(t, "current_state", state);
    t = appendItem(t, "state_history",
      { timestamp: q(entry.at), from_state: fromState, to_state: state, blurb: q(blurb), author: tok(entry.author) });
    if (t === null) return null;
  }
  return appendToSection(t, "Session Log", `### Session ${entry.at} | ${blurb} | ${entry.author}\nChanges: ${entry.kind}.`);
}
