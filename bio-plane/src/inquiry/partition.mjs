/* inquiry — the partition read's pure parts (requirements: `build/requirements/inquiry.md`, R65). A question's groups and
 * ungrouped legs from its document, and the `ground` acts it records from before the table that keeps them: an act's
 * Session Log entry (R28), which holds the reason and the pair BEFORE it and no pair after. Nothing here throws. */

const isMap = (v) => !!v && typeof v === "object" && !Array.isArray(v);

/** R65: `{grouped, groups, ungrouped}` over one inquiry document's frontmatter. `groups` are the document's grounds in
 *  its order, each `{ground, statement, asserted_by, at, legs}` (`statement` null when none, `legs` the ordinals of the
 *  legs naming the ground, R27); `ungrouped` the ordinals of the legs that name no ground; `grouped` whether any leg names
 *  one; `answered` whether the question was partitioned at all, a held `grounds: []` (no ground, every supporting leg
 *  necessary, R85) being an answer. A leg is an object entry of `basis[]`, addressed as `ground` addresses it. */
export function partitionOfDoc(fm) {
  const legs = isMap(fm) && Array.isArray(fm.basis) ? fm.basis.filter(isMap) : [];
  const label = legs.map((l) => (typeof l.ground === "string" && l.ground.trim() ? l.ground.trim() : null));
  const rows = isMap(fm) && Array.isArray(fm.grounds) ? fm.grounds.filter((r) => isMap(r) && typeof r.ground === "string") : [];
  const groups = rows.map((r) => ({
    ground: r.ground.trim(), statement: typeof r.statement === "string" ? r.statement : null,
    asserted_by: typeof r.asserted_by === "string" ? r.asserted_by : null, at: typeof r.at === "string" ? r.at : null,
    legs: label.flatMap((g, i) => (g === r.ground.trim() ? [i] : [])) }));
  return { grouped: label.some((g) => g !== null), answered: label.some((g) => g !== null) || (isMap(fm) && Array.isArray(fm.grounds)),
           groups,
           ungrouped: label.flatMap((g, i) => (g === null ? [i] : [])) };
}

/* "capture C, connection undetermined, testimony B" as the pair `strength` answers, `{axis: {state, grade}}`: a grade
   letter is a graded axis, any other word its state with no grade. Null for text that is no pair. */
function pairOf(text) {
  const out = {};
  for (const part of String(text ?? "").replace(/\.\s*$/, "").split(", ")) {
    const m = /^(capture|connection|testimony) (\S+)$/.exec(part.trim());
    if (!m) return null;
    out[m[1]] = /^[A-D]$/.test(m[2]) ? { state: "graded", grade: m[2] } : { state: m[2], grade: null };
  }
  return out.capture && out.connection ? out : null;
}

/* A `Changes:` line's groups, `{ground, legs}` each: "2 group(s) over 2 leg(s) — g1: 0; g2: 1, 2." or "grouping removed; …". */
function changedGroups(line) {
  const at = line.indexOf(" — ");
  if (at < 0) return [];
  return line.slice(at + 3).replace(/\.\s*$/, "").split("; ").flatMap((g) => {
    const m = /^(.+?): (\d+(?:, \d+)*)$/.exec(g);
    return m ? [{ ground: m[1], legs: m[2].split(", ").map(Number) }] : [];
  });
}

/** R65: the `ground` acts a document's Session Log records, oldest first, each as `partitionOf` answers a change made
 *  before the act recorded its pairs: `{at, by, act, reason, groups, strength_before, strength_after: null,
 *  strength_after_recorded: false}`. `groups` carry the ground and its legs the log names, and `statement`, `asserted_by`
 *  and `at` null (the log does not hold them). `skip(at, by)` is true for an act the table already holds. */
export function loggedChanges(markdown, skip = () => false) {
  const text = String(markdown ?? "");
  const start = text.indexOf("## Session Log");
  if (start < 0) return [];
  const next = text.indexOf("\n## ", start + 1);
  const entries = text.slice(start, next === -1 ? text.length : next).split(/^### Session /m).slice(1);
  const out = [];
  for (const e of entries) {
    const lines = e.split("\n");
    const head = /^(\S+) \| (Grouped|Restructured) \| (.+)$/.exec(lines[0].trim());
    if (!head || !lines.some((l) => l.startsWith("Trigger: op=inquiryground"))) continue;
    const [, at, title, by] = head;
    if (skip(at, by)) continue;
    const field = (name) => { const l = lines.find((x) => x.startsWith(`${name}: `)); return l ? l.slice(name.length + 2).trim() : null; };
    out.push({ at, by, act: title === "Grouped" ? "authored" : "restructured", reason: title === "Grouped" ? null : field("Reason"),
               groups: changedGroups(field("Changes") ?? "")
                 .map((g) => ({ ground: g.ground, statement: null, asserted_by: null, at: null, legs: g.legs })),
               strength_before: pairOf(field("Strength before")), strength_after: null, strength_after_recorded: false });
  }
  return out;
}
