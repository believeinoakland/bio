/* citation — the splices by which a citation is written into the citing document's bytes (R2, R4, R6). Pure; each
 * returns the new text, or null when the block it must edit is not in a shape the restricted frontmatter grammar can
 * extend in place: that grammar has no escapes and no serializer, so a wrong guess would corrupt a document silently
 * and the write would then promote the corruption.
 *
 * `spliceEdgeStatus`, `legExtentLines` and `spliceBasis` moved here from `store.mjs` (only citing called them);
 * `spliceReferences`, `setScalar` and the Session Log splice are copies (K57), the store keeping its own for its other
 * writers. */

/** R4: rewrite the `status` and `note` of specific `cites` entries in place, touching nothing else. Walks the
 *  references block entry by entry, tracking which target the current entry belongs to, and edits only the two lines
 *  of the entries named in `changes` (target → {status, note}). An entry whose note line is absent gains one, because
 *  the reason has to land somewhere; an entry with no status is not ours to guess at. Null unless every change
 *  applied. */
export function spliceEdgeStatus(text, changes) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  let ref = -1;
  for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }
  if (ref === -1) return null;

  /* Entry boundaries first, so an edit never runs past the entry it belongs to. An entry starts at `  - ` and ends
     before the next one or at the end of the block. */
  const starts = [];
  for (let i = ref + 1; i < end; i++) {
    if (/^ {2}- /.test(lines[i])) starts.push(i);
    else if (!/^\s/.test(lines[i]) && lines[i].trim() !== "") break;
  }
  if (!starts.length) return null;
  const blockEnd = (() => {
    let last = ref;
    for (let i = ref + 1; i < end; i++) {
      if (lines[i].trim() === "") continue;
      if (/^\s/.test(lines[i])) { last = i; continue; }
      break;
    }
    return last;
  })();

  const out = lines.slice();
  let applied = 0;
  for (let s = 0; s < starts.length; s++) {
    const from = starts[s], to = (s + 1 < starts.length ? starts[s + 1] : blockEnd + 1) - 1;
    let target = null;
    for (let i = from; i <= to; i++) {
      const m = /^\s*(?:- )?target:\s*(.+?)\s*$/.exec(lines[i]);
      if (m) { target = m[1].replace(/^["']|["']$/g, ""); break; }
    }
    if (!target || !changes.has(target)) continue;
    const ch = changes.get(target);
    let sawNote = false, statusLine = -1;
    for (let i = from; i <= to; i++) {
      if (/^\s*(?:- )?status:/.test(lines[i])) { out[i] = "    status: " + ch.status; statusLine = i; }
      if (/^\s*(?:- )?note:/.test(lines[i])) { out[i] = `    note: "${ch.note}"`; sawNote = true; }
    }
    if (statusLine === -1) return null;
    if (!sawNote) out[statusLine] = out[statusLine] + `\n    note: "${ch.note}"`;
    applied++;
  }
  return applied === changes.size ? out.join("\n") : null;
}

/** R2: append entries to the `references` block, touching nothing else (a copy of the store's, K57). Three shapes are
 *  reachable: an inline empty `references: []`, a populated block, and no references key at all; any other inline
 *  scalar is refused (null). An entry is `{rel, target, status, note, extent_capture?}`; `extent_capture` is the capture
 *  a case's edge was pinned to (REC-219 / D-579(a)). */
export function spliceReferences(text, additions) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  const block = additions.map((a) =>
    `  - rel: ${a.rel}\n    target: ${a.target}\n    status: ${a.status}\n    note: "${a.note ?? ""}"`
    + (typeof a.extent_capture === "string" ? `\n    extent_capture: ${a.extent_capture}` : ""));

  let ref = -1;
  for (let i = 1; i < end; i++) if (/^references:/.test(lines[i])) { ref = i; break; }

  if (ref === -1)   // no key at all: open one immediately before the closing fence
    return [...lines.slice(0, end), "references:", ...block, ...lines.slice(end)].join("\n");

  const rest = lines[ref].slice("references:".length).trim();
  if (rest === "[]")   // an empty inline array becomes a block
    return [...lines.slice(0, ref), "references:", ...block, ...lines.slice(ref + 1)].join("\n");
  if (rest !== "") return null;   // some other inline scalar: not ours to reinterpret

  /* A block. Append after its LAST indented line, so a blank line between the block and the next column-0 key stays
     where the author put it rather than being swallowed into the array. */
  let last = ref;
  for (let i = ref + 1; i < end; i++) {
    if (lines[i].trim() === "") continue;
    if (/^\s/.test(lines[i])) { last = i; continue; }
    break;
  }
  return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
}

/** REC-97 / IC-90 — the extent lines a composed leg contributes to the basis block, or none. The extent is DISCOVERED
 *  on the leg rather than read off a list (any `extent_*` key, and `content_id`), so a field the extent grammar gains
 *  needs no edit here. ORDER IS FIXED so the bytes are deterministic: `extent_kind` first, the rest alphabetically,
 *  `content_id` last. QUOTING IS BY TYPE: a number and an inline array are bare, because the grammar reads them back as
 *  a number and an array; a string is ALWAYS quoted, so a sheet named `12` is never read back as an integer. The values
 *  are fenced at the act (no quote, backslash, newline or comment mark), so the quoting cannot be broken from outside.
 *  A leg that names no part contributes nothing, which is what keeps a cite naming no part byte-identical. */
export function legExtentLines(l) {
  const keys = Object.keys(l).filter((k) => k.startsWith("extent_") || k === "content_id");
  if (!keys.length) return [];
  const order = (k) => (k === "extent_kind" ? 0 : k === "content_id" ? 2 : 1);
  keys.sort((a, b) => order(a) - order(b) || (a < b ? -1 : a > b ? 1 : 0));
  const out = [];
  for (const k of keys) {
    const v = l[k];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v === "number") out.push(`    ${k}: ${v}`);
    else if (Array.isArray(v)) out.push(`    ${k}: [${v.join(", ")}]`);
    else out.push(`    ${k}: "${String(v)}"`);
  }
  return out;
}

/** R2 (REC-37): APPEND legs to the `basis` block, touching nothing else — `spliceReferences` line for line, the same
 *  three reachable shapes and the same refusal (null) of any other inline scalar. A key is rendered only if the leg
 *  carries it, which is the whole reason an undetermined leg is honest in the bytes: absent grade, axis and source is
 *  what the leg grammar reads as undetermined-and-stated (R8, DEC-18), while `grade: null` would be a member asserting
 *  a null; an empty note is omitted for the same reason. Nothing here rewrites or removes a leg already carried. */
export function spliceBasis(text, legs) {
  if (!legs.length) return text;
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  const block = legs.map((l) => [
    `  - target: ${l.target}`,
    `    role: ${l.role}`,
    ...(l.grade ? [`    grade: ${l.grade}`] : []),
    ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
    ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []),
    ...(l.note ? [`    note: "${l.note}"`] : []),
    ...legExtentLines(l),
  ].join("\n"));

  let bi = -1;
  for (let i = 1; i < end; i++) if (/^basis:/.test(lines[i])) { bi = i; break; }

  if (bi === -1)   // no key at all: open one immediately before the closing fence
    return [...lines.slice(0, end), "basis:", ...block, ...lines.slice(end)].join("\n");

  const rest = lines[bi].slice("basis:".length).trim();
  if (rest === "[]")   // an empty inline array becomes a block
    return [...lines.slice(0, bi), "basis:", ...block, ...lines.slice(bi + 1)].join("\n");
  if (rest !== "") return null;   // some other inline scalar: not ours to reinterpret

  let last = bi;
  for (let i = bi + 1; i < end; i++) {
    if (lines[i].trim() === "") continue;
    if (/^\s/.test(lines[i])) { last = i; continue; }
    break;
  }
  return [...lines.slice(0, last + 1), ...block, ...lines.slice(last + 1)].join("\n");
}

/** Set a top-level frontmatter scalar that is already there (a copy of the store's, K57); the text unchanged when the
 *  key is absent. Used for `last_updated`, which every citing document carries. */
export function setScalar(text, key, value) {
  const lines = text.split("\n");
  const end = lines.indexOf("---", 1);
  for (let i = 1; i < (end === -1 ? lines.length : end); i++) {
    if (lines[i].startsWith(key + ":")) { lines[i] = `${key}: ${value}`; return lines.join("\n"); }
  }
  return text;
}

/** R3, R4: append one Session Log entry at the end of the `## Session Log` section (opening the section when the
 *  document has none), as both acts wrote it inline in the store (a copy, K57). */
export function appendSessionLog(text, entry) {
  const at = text.indexOf("## Session Log");
  if (at < 0) return text + "\n## Session Log\n\n" + entry;
  const nxt = text.indexOf("\n## ", at + 1);
  const cut = nxt === -1 ? text.length : nxt + 1;
  return text.slice(0, cut) + entry + "\n" + text.slice(cut);
}
