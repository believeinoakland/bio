/* basis-versions — the line-oriented edits of a document's front matter that versions, CURRENT and conclusions need
 * (moved from `store.mjs`: `#setVersionField`, `#setCurrentVersionRow`, `#appendFmRows`, `#appendConclusionEntry`).
 * The repository has a front-matter PARSER (record-grammar's `parseFrontmatter`, once the catalogue's) and no
 * serializer, so a field is rewritten in place and every other byte is left alone. Each edit REFUSES rather than
 * guesses, answering null for a block in a shape the restricted grammar cannot extend: the grammar has no escapes, so a
 * wrong guess would corrupt a document silently and the promotion would then hold the corruption. A ROW is `  - ` and its continuation lines, the only shape the
 * restricted parser reads and the only shape any writer in this tree emits. */

/** Frontmatter-safe text: the restricted grammar has no escapes, so a derived string loses its line breaks, and a
 *  quote or backslash becomes an apostrophe. An authored field is refused by name before it gets here. */
export function fmSafe(s) {
  return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
}

/** A quoted, frontmatter-safe scalar. */
export const quoted = (s) => `"${fmSafe(String(s ?? ""))}"`;

/** A value emitted TYPED: an integer or a boolean bare, a list of numbers as an inline array, anything else quoted. A
 *  quoted page reads back as a string, and a canonical extent then addresses no page at all (the D-362 class). */
export function typedValue(v) {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "boolean") return String(v);
  if (Array.isArray(v) && v.every((n) => typeof n === "number" && Number.isFinite(n))) return `[${v.join(", ")}]`;
  return quoted(v);
}

/** Random hex, for a promotion's snap key. */
export function randHex(n = 4) {
  return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* The rows of one array-of-objects block of the front matter: `[start, end)` of the block's continuation lines. */
function blockAt(lines, end, key) {
  for (let i = 1; i < end; i++) if (lines[i].startsWith(`${key}:`)) return i;
  return -1;
}

/** Set ONE field on ONE row (by `name`) of `basis_versions`, adding the field to that row when absent. Null when the
 *  block is inline or absent, or no row carries the name. */
export function setVersionField(text, rowName, key, value) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  let at = -1;
  for (let i = 1; i < end; i++) if (/^basis_versions:\s*$/.test(lines[i])) { at = i; break; }
  if (at === -1) return null;
  const unquote = (s) => String(s).trim().replace(/^"(.*)"$/, "$1").trim();
  const lit = typeof value === "boolean" ? String(value) : quoted(value);
  let i = at + 1, rowStart = -1, rowEnd = -1;
  while (i < end && /^\s{2,}(- )?\S/.test(lines[i])) {
    if (/^\s{2}- /.test(lines[i])) {
      if (rowStart !== -1 && rowEnd === -1) rowEnd = i;
      const m = /^\s{2}- name:\s*(.+)$/.exec(lines[i]);
      if (m && unquote(m[1]) === rowName) rowStart = i;
    }
    i++;
  }
  if (rowStart === -1) return null;
  if (rowEnd === -1) rowEnd = i;
  for (let j = rowStart; j < rowEnd; j++) {
    const m = new RegExp(`^(\\s{2}- |\\s{4})${key}:`).exec(lines[j]);
    if (m) { lines[j] = `${m[1]}${key}: ${lit}`; return lines.join("\n"); }
  }
  return [...lines.slice(0, rowEnd), `    ${key}: ${lit}`, ...lines.slice(rowEnd)].join("\n");
}

/** A project's dated pointer at what it stands on (§7): one `current_versions` row per inquiry, replaced in place
 *  when the project already names one. Handles no key, an inline `[]` and a block; any other inline value is null. */
export function setCurrentVersionRow(text, inquiryId, vname, who, when) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const block = [`  - inquiry: ${quoted(inquiryId)}`, `    version: ${quoted(vname)}`,
                 `    at: ${quoted(when)}`, `    by: ${quoted(who)}`];
  const at = blockAt(lines, end, "current_versions");
  if (at === -1) return [...lines.slice(0, end), "current_versions:", ...block, ...lines.slice(end)].join("\n");
  const rest = lines[at].slice("current_versions:".length).trim();
  if (rest === "[]") return [...lines.slice(0, at), "current_versions:", ...block, ...lines.slice(at + 1)].join("\n");
  if (rest !== "") return null;
  const unquote = (s) => String(s).trim().replace(/^"(.*)"$/, "$1").trim();
  let i = at + 1, rowStart = -1, rowEnd = -1;
  while (i < end && /^\s{2,}(- )?\S/.test(lines[i])) {
    if (/^\s{2}- /.test(lines[i])) {
      if (rowStart !== -1 && rowEnd === -1) rowEnd = i;
      const m = /^\s{2}- inquiry:\s*(.+)$/.exec(lines[i]);
      if (m && unquote(m[1]) === inquiryId) rowStart = i;
    }
    i++;
  }
  if (rowStart === -1) return [...lines.slice(0, i), ...block, ...lines.slice(i)].join("\n");
  if (rowEnd === -1) rowEnd = i;
  return [...lines.slice(0, rowStart), ...block, ...lines.slice(rowEnd)].join("\n");
}

/** Append whole rows to one array-of-objects block (`basis_versions`, `basis_version_grounds`,
 *  `basis_version_legs`): no key, an inline `[]`, or a block; any other inline value is null. */
export function appendFmRows(text, key, rowLines) {
  if (!rowLines.length) return text;
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const at = blockAt(lines, end, key);
  if (at === -1) return [...lines.slice(0, end), `${key}:`, ...rowLines, ...lines.slice(end)].join("\n");
  const rest = lines[at].slice(key.length + 1).trim();
  if (rest === "[]") return [...lines.slice(0, at), `${key}:`, ...rowLines, ...lines.slice(at + 1)].join("\n");
  if (rest !== "") return null;
  let i = at + 1;
  while (i < end && /^\s{2,}(- )?\S/.test(lines[i])) i++;
  return [...lines.slice(0, i), ...rowLines, ...lines.slice(i)].join("\n");
}

/** R18, R20, R32: one entry APPENDED to the project's `conclusions[]` (a conclusion or a withdrawal); nothing already
 *  written is touched, so the record is append-only and its latest entry for a question is the stance. The claim is
 *  frozen verbatim at adoption and never re-read. */
export function appendConclusionEntry(text, inquiryId, f) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const q = quoted;
  const block = f.act === "withdrawn"
    ? [`  - inquiry: ${q(inquiryId)}`, `    act: "withdrawn"`,
       `    withdraws_version: ${q(f.version)}`, `    withdraws_at: ${q(f.withdrawsAt)}`,
       `    reason: ${q(f.reason)}`, `    at: ${q(f.when)}`, `    by: ${q(f.who)}`]
    : [`  - inquiry: ${q(inquiryId)}`, `    act: "concluded"`, `    version: ${q(f.version)}`,
       `    claim: ${q(f.claim)}`, `    falsifier: ${q(f.falsifier)}`,
       ...(f.noFals ? [`    falsifier_override_by: ${q(f.who)}`, `    falsifier_override_at: ${q(f.when)}`] : []),
       ...(f.commentary ? [`    commentary: ${q(f.commentary)}`] : []),
       `    at: ${q(f.when)}`, `    by: ${q(f.who)}`];
  const at = blockAt(lines, end, "conclusions");
  if (at === -1) return [...lines.slice(0, end), "conclusions:", ...block, ...lines.slice(end)].join("\n");
  const rest = lines[at].slice("conclusions:".length).trim();
  if (rest === "[]") return [...lines.slice(0, at), "conclusions:", ...block, ...lines.slice(at + 1)].join("\n");
  if (rest !== "") return null;
  let i = at + 1;
  while (i < end && /^\s{2,}(- )?\S/.test(lines[i])) i++;
  return [...lines.slice(0, i), ...block, ...lines.slice(i)].join("\n");
}
