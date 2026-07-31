/* Content types: WHAT a document is, as distinct from HOW it was built.
 *
 * A separate axis from the stack handler, and the separation is load-bearing. A
 * meeting calendar served by Legistar on ASP.NET and one served by Granicus on
 * something else are the SAME KIND OF THING built two ways: the questions "what
 * counts as a meaningful change here" and "what connections does this imply" have
 * one answer for both, while "which bytes are per-render machinery" has two. The
 * earlier version hung a kind() off the stack handler, which meant every new stack
 * re-answered every content question from scratch.
 *
 * A content type answers four things and nothing else:
 *
 *   detect   is this that kind of document?
 *   parse    what is IN it? entities, with stable keys and their own facts.
 *   assess   given two parses, did anything MEANINGFUL change, and how badly?
 *   connections  what referential and temporal links does this imply?
 *
 * THE STANDING RULE, inherited and it applies harder here than anywhere. A content
 * type that reports change when nothing meaningful happened costs a member some
 * attention. One that stays quiet when something did puts a false reassurance in
 * the record. So an unmeasured content type is NOT written: the generic type below
 * reports any substantive difference without describing it, which is noisy and
 * honest, and the noise is the signal that the type is worth measuring.
 */

/* The content-type axis uses the ONE confidence ladder, re-exported here so content
   types can pull it alongside entity/connection. TYPE_CONFIDENCE is gone: it was
   CONFIDENCE duplicated because this axis was split off after the stack axis already
   had a ladder (CONSTRUCTS Step 0 #1). A content type simply never returns `possible`;
   the ladder is still one ladder. */
export { CONFIDENCE } from "../recogniser.mjs";

/* What WATCHING this kind of document should do, DECLARED by the content type rather
   than derived from the stack handler (CONSTRUCTS Step 0 #4). The kind is the content
   type's business now, and so is the contract that follows from it. `unmonitorable`
   is the shell case, which the stack axis already settles at layer 1 of assess(); a
   content type declares SUBSTANCE (watch its own substance — the normal case) or
   MEMBERSHIP (watch which entries are present and whether each still says what it
   said — a list). */
export const CONTRACT = { SUBSTANCE: "substance", MEMBERSHIP: "membership", UNMONITORABLE: "unmonitorable" };

/** An entity a content type found in a document. `key` must be stable across
 *  fetches: a position in a list is not a key, an id in a URL is. `facts` are the
 *  fields whose change might mean something, named so assess() can say WHICH
 *  moved rather than that the entity differs. */
export function entity(key, kind, label, facts) {
  return { key: String(key), kind, label, facts: facts || {} };
}

/** Referential and temporal connections are different things and must not be
 *  collapsed into one edge type.
 *
 *  REFERENTIAL says two documents are ABOUT each other: this agenda item cites that
 *  ordinance; these minutes belong to that meeting; this staff member sits in that
 *  department. It is a claim about meaning, it is symmetric in interest if not in
 *  direction, and a reader follows it to understand SCOPE.
 *
 *  TEMPORAL says one thing happened AFTER another and the sequence matters: minutes
 *  were published after the meeting they record; a title changed on a date; an item
 *  was withdrawn before it was heard. It is a claim about a sequence, it is
 *  strictly directional, and a reader follows it to understand a STORY. Its most
 *  valuable form is often an ABSENCE with a due date attached: minutes that have not
 *  appeared three weeks after a meeting are a fact about the body, not a gap in the
 *  record.
 *
 *  People reason about these differently and so do their assistants, so they are
 *  emitted as different kinds and the UI shows them apart. */
export const CONNECTION = { REFERENTIAL: "referential", TEMPORAL: "temporal" };

export function referential(from, to, relation, why) {
  return { connection: CONNECTION.REFERENTIAL, from, to, relation, why };
}
/** `expected_by` turns an absence into a fact with a date on it. */
export function temporal(from, to, relation, { at, expected_by, why } = {}) {
  return { connection: CONNECTION.TEMPORAL, from, to, relation, at: at || null,
           expected_by: expected_by || null, why };
}

/** Diff two entity sets by key, reporting which FACTS moved rather than that the
 *  entity differs. A content type decides what each moved fact means; this only
 *  finds them. */
export function diffEntities(before, after) {
  const b = new Map(before.map((e) => [e.key, e]));
  const a = new Map(after.map((e) => [e.key, e]));
  const gone = [], appeared = [], altered = [];
  for (const [k, was] of b) {
    const now = a.get(k);
    if (!now) { gone.push(was); continue; }
    const moved = [];
    for (const f of new Set([...Object.keys(was.facts), ...Object.keys(now.facts)]))
      if (String(was.facts[f]) !== String(now.facts[f]))
        moved.push({ fact: f, was: was.facts[f], now: now.facts[f] });
    if (moved.length) altered.push({ entity: now, was, moved });
  }
  for (const [k, now] of a) if (!b.has(k)) appeared.push(now);
  return { gone, appeared, altered, before_count: b.size, after_count: a.size };
}
