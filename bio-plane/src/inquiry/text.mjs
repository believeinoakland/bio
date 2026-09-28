/* inquiry — the document splices its acts write with (requirements: `build/requirements/inquiry.md`). Copied from the
 * legacy store at this module's extraction (K57: each module that splices keeps its own copy). This repository has a
 * frontmatter PARSER and no serializer, so every edit is line-oriented and touches only the lines it owns: re-emitting a
 * parsed document would reorder keys, drop comments and renormalise quoting across the whole file to change one field.
 * A splice that meets a shape it cannot address answers null (or the text unchanged), and the act refuses rather than
 * guesses. */

/** Rewrite ONE column-0 scalar inside the frontmatter, leaving every other byte alone; the text unchanged when the key
 *  is absent. */
export function setScalar(text, key, value) {
  const lines = text.split("\n");
  const end = lines.indexOf("---", 1);
  for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
    if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  }
  return text;
}

/** `setScalar` for a key that may not be there yet: presence is decided by LOOKING (REC-14), and an absent key is opened
 *  immediately before the closing fence, so writing a key its existing value never appends a duplicate (C-2.1). */
export function setOrAddScalar(text, key, value) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return text;
  const end = lines.indexOf("---", 1);
  if (end === -1) return text;
  for (let i = 1; i < end; i++)
    if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  return [...lines.slice(0, end), `${key}: ${value}`, ...lines.slice(end)].join("\n");
}

/** Append one entry to the `state_history` block (absent, inline-empty or populated); null for any other shape, so
 *  the act refuses rather than guesses (C-4.2: a prior_state names an entry the document carries). */
export function appendStateHistory(text, e) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  const block = [`  - timestamp: "${e.timestamp}"`,
                 `    from_state: ${e.from_state}`,
                 `    to_state: ${e.to_state}`,
                 `    blurb: "${e.blurb}"`,
                 `    author: ${e.author}`];
  let at = -1;
  for (let i = 1; i < end; i++) if (/^state_history:/.test(lines[i])) { at = i; break; }
  if (at === -1) return [...lines.slice(0, end), "state_history:", ...block, ...lines.slice(end)].join("\n");
  const rest = lines[at].slice("state_history:".length).trim();
  if (rest === "[]") return [...lines.slice(0, at), "state_history:", ...block, ...lines.slice(at + 1)].join("\n");
  if (rest !== "") return null;
  let last = at;
  for (let i = at + 1; i < end; i++) {
    if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i;
    else break;
  }
  return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
}

/** Remove a frontmatter BLOCK (its key line and its indented lines); the text unchanged when absent. */
export function removeBlock(text, key) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return text;
  const end = lines.indexOf("---", 1);
  if (end === -1) return text;
  let at = -1;
  for (let i = 1; i < end; i++) if (lines[i].startsWith(key + ":")) { at = i; break; }
  if (at === -1) return text;
  let last = at;
  for (let i = at + 1; i < end; i++) {
    if (/^\s/.test(lines[i]) && lines[i].trim() !== "") last = i; else break;
  }
  return [...lines.slice(0, at), ...lines.slice(last + 1)].join("\n");
}

/** A frontmatter block written whole, never edited in place (a block half from one act and half from another is not a
 *  state an act should be able to produce). */
export function setOrAddBlock(text, key, block) {
  const t = removeBlock(text, key);
  const lines = t.split("\n");
  if (lines[0] !== "---") return t;
  const end = lines.indexOf("---", 1);
  if (end === -1) return t;
  return [...lines.slice(0, end), `${key}:`, ...block, ...lines.slice(end)].join("\n");
}

/** Replace a heading's section body, or open the section when the document has none. */
export function setSection(text, heading, lines) {
  const at = text.indexOf(`\n${heading}\n`);
  const body = `${heading}\n\n${lines.join("\n")}\n`;
  if (at === -1) return text.replace(/\s*$/, "\n") + "\n" + body;
  const start = at + 1;
  const nxt = text.indexOf("\n## ", start + 1);
  const end = nxt === -1 ? text.length : nxt + 1;
  return text.slice(0, start) + body + "\n" + text.slice(end);
}

/** Append one entry under `## Session Log`, opening the section when absent (C-13.2: a moved last_updated has an
 *  account). */
export function appendSessionLog(text, entry) {
  const at = text.indexOf("## Session Log");
  if (at < 0) return text + "\n## Session Log\n\n" + entry;
  const nxt = text.indexOf("\n## ", at + 1);
  const cut = nxt === -1 ? text.length : nxt + 1;
  return text.slice(0, cut) + entry + "\n" + text.slice(cut);
}

/** REC-45: set or clear the `ground:` line on each basis leg, addressed BY POSITION and touching nothing else. `byOrd[i]`
 *  is basis[i]'s label, or null to remove any it has. A splice and not a rewrite of the block, because a leg carries
 *  authored fields (a grade, its source, a hunch's author and date, a note) this act has no business restating. An
 *  entry count that differs from `byOrd` means the ordinals do not address the entries in front of it: null. */
export function spliceBasisGround(text, byOrd) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  let at = -1;
  for (let i = 1; i < end; i++) if (/^basis:/.test(lines[i])) { at = i; break; }
  if (at === -1) return null;
  const starts = [];
  let blockEnd = at;
  for (let i = at + 1; i < end; i++) {
    if (lines[i].trim() === "") continue;
    if (/^ {2}- /.test(lines[i])) { starts.push(i); blockEnd = i; continue; }
    if (/^\s/.test(lines[i])) { blockEnd = i; continue; }
    break;
  }
  if (starts.length !== byOrd.length) return null;
  const segs = [];
  for (let s = 0; s < starts.length; s++) {
    const from = starts[s], to = (s + 1 < starts.length ? starts[s + 1] : blockEnd + 1) - 1;
    const kept = [];
    for (let i = from; i <= to; i++) if (!/^\s+ground:/.test(lines[i])) kept.push(lines[i]);
    if (byOrd[s] !== null) kept.push(`    ground: ${byOrd[s]}`);
    segs.push(kept);
  }
  return [...lines.slice(0, starts[0]), ...segs.flat(), ...lines.slice(blockEnd + 1)].join("\n");
}

/** Frontmatter-safe for DERIVED strings (an authored field is refused by name instead): the restricted grammar has no
 *  escapes. */
export function fmSafe(s) {
  return String(s ?? "").replace(/[\r\n]+/g, " ").replace(/["\\]/g, "'").trim();
}

/** A snap-key suffix. */
export function rand(n = 32) {
  return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
