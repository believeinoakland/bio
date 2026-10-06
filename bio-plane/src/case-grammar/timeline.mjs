/* case-grammar — the published timeline a case carries (requirements: `build/requirements/case-grammar.md` R20, with R6;
 * C11, K1494: "a published case carries the timeline of its findings, frozen at signing, each item showing its source, the
 * two lanes ('what they did', 'what we did') never mixed, people appearing as Design Requirement 6 (K1483) allows").
 * `case-authoring`'s `publishCase` writes the block (its R56) with `timelineLines`, from the items `publication` freezes at
 * signing (its R63) after `case-disclosures` has passed the people in them (DR6); `timelineOf` is the one reading of it,
 * for `public-read` (which shows it) and the complete edition (R14). Pure; nothing here throws.
 *
 * THE BLOCK (flat rows, K549), as `/7` states it (it joins the format written, as R1's blocks did, so no `/8`):
 *   timeline:  one row per item: `lane` (`they_did`, the world's events concerning the case's findings, or `we_did`, the
 *              group's own acts), `ord` (its place in its lane), `when` (the item's when as held: with its precision, or
 *              `undetermined` with its bounds, or `nowhere`), `label`, `ref` (the record it is) and `source` (the capture,
 *              extent or record entry it rests on).
 *
 * TWO LANES, NEVER MIXED: the writer writes every `they_did` row, in its lane's order, then every `we_did` row, in its,
 * so no reader can take the block for one interleaved list; and the reader answers the lanes apart whatever order the
 * bytes hold. AN ITEM WITHOUT A SOURCE IS NOT WRITTEN, and not read: a timeline item shows its source, or it is not one.
 * PEOPLE: this module writes the label it is handed; which people an item may name is `case-disclosures`' (DR6), never
 * decided here. Every value is written as R17's are (`./facts.mjs`), so a `when` reads back with its precision. */

import { caseDocumentRequiresMaterials } from "./formats.mjs";
import { unexact, exactRowsBlock } from "./facts.mjs";

/** R20: the fields of a `timeline:` row, in the order they are written. */
export const TIMELINE_FIELDS = Object.freeze(["lane", "ord", "when", "label", "ref", "source"]);
/** R20: the two lanes, in the order they are written. */
export const TIMELINE_LANES = Object.freeze(["they_did", "we_did"]);

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const objects = (xs) => (Array.isArray(xs) ? xs.filter(plain) : []);
/* A source is present: a non-empty string, or a non-empty list or map (a capture with its extent, a record entry). */
const sourced = (s) => (typeof s === "string" ? s.trim().length > 0
  : Array.isArray(s) ? s.length > 0 : plain(s) ? Object.keys(s).length > 0 : false);
const ordOf = (r) => (Number.isSafeInteger(r.ord) ? r.ord : Number.POSITIVE_INFINITY);
/* The rows of a lane in its own order: by `ord`, ties (and rows with no `ord`) kept in the order given. */
const laneOf = (rows, lane) => rows.map((r, i) => [r, i]).filter(([r]) => r.lane === lane)
  .sort((a, b) => ordOf(a[0]) - ordOf(b[0]) || a[1] - b[1]).map(([r]) => r);
const pick = (r) => Object.fromEntries(TIMELINE_FIELDS.map((f) => [f, r[f] ?? null]));

/** R20: the `timeline:` block's lines, from items `{lane, ord, when, label, ref, source}`: the `they_did` lane, then the
 *  `we_did` lane, each in its own order. An item in no lane, or without a source, is not written. `timeline: []` when
 *  none is. */
export function timelineLines(rows) {
  const items = objects(rows).filter((r) => TIMELINE_LANES.includes(r.lane) && sourced(r.source)).map(pick);
  return exactRowsBlock("timeline", TIMELINE_LANES.flatMap((lane) => laneOf(items, lane)), TIMELINE_FIELDS);
}

/** R20: the block read back from a `/6` or later document's front matter, the lanes apart: `{they_did: [item],
 *  we_did: [item]}`, each lane in its own order, every value as written. An item in no lane, or without a source, is
 *  not read. A document without the block, and any other format, answers both lanes empty. Pure; never throws. */
export function timelineOf(fm) {
  const none = () => ({ they_did: [], we_did: [] });
  try {
    const d = plain(fm) ? fm : null;
    if (!caseDocumentRequiresMaterials(d) || !Array.isArray(d.timeline)) return none();
    const items = objects(d.timeline).map((r) => Object.fromEntries(TIMELINE_FIELDS.map((f) => [f, unexact(r[f])])))
      .filter((r) => TIMELINE_LANES.includes(r.lane) && sourced(r.source));
    return { they_did: laneOf(items, "they_did"), we_did: laneOf(items, "we_did") };
  } catch {
    return none();
  }
}
