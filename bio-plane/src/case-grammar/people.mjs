/* case-grammar — the people a case names and its signers' ties, as the case document carries them (requirements:
 * `build/requirements/case-grammar.md` R21, with R6; K1816, copied from `case-disclosures` R28's spelling, whose bytes
 * are kept exactly). `case-disclosures` decides who may be named and on what basis (its R24–R27) and answers its R28
 * through these four functions, keeping no copy; `case-authoring` writes the blocks with them; `ratification` R41 reads
 * the signed document's ties back with `memberTiesOf` (`ratification` is earlier than `case-disclosures`, so the one
 * spelling sits here, beside every other case-document block). Pure; nothing here throws.
 *
 * THE BLOCKS (flat rows, K549), as R1's blocks are:
 *   people:       one row per person `case-disclosures` R25 passed: `person`, `places` (where the case names them),
 *                 `basis` (the basis kind), `citation` (its reference, never a judgment of the person), `words`.
 *   member_ties:  one row per tie a signer attests (`case-disclosures` R27): `row` (`attestation` or `tie`), `signer`,
 *                 `at`, `entity`, `kind`, `level`, `shown`.
 *
 * THE BYTES ARE `case-disclosures`' as they were before the move: the quoted fields through `fmSafe`, the others bare, an
 * empty block its key alone. A row that is not an object, or that cannot be spelled, is not written (where the old
 * spelling threw). A document without a block reads back as an empty list, each field a string or null. */

import { fmSafe } from "./blocks.mjs";

/** R21: the fields of a `people:` row and of a `member_ties:` row, in the order they are written. */
export const PEOPLE_FIELDS = Object.freeze(["person", "places", "basis", "citation", "words"]);
export const MEMBER_TIE_FIELDS = Object.freeze(["row", "signer", "at", "entity", "kind", "level", "shown"]);

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const q = (v) => (v == null ? "null" : `"${fmSafe(v)}"`);
const bare = (v) => (v == null ? "null" : String(v));
/* The block's lines: its key, then each row's lines; a row that cannot be spelled is left out, so the writer never
   throws. */
const block = (key, rows, spell) => [`${key}:`, ...(Array.isArray(rows) ? rows : []).flatMap((r) => {
  if (!isObj(r)) return [];
  try { return spell(r); } catch { return []; }
})];

/** R21: the `people:` block's lines, from rows `{person, places, basis, citation, words}`, in the order given. */
export function peopleLines(rows) {
  return block("people", rows, (r) => [
    `  - person: ${bare(r.person)}`,
    `    places: ${q(r.places)}`,
    `    basis: ${bare(r.basis)}`,
    `    citation: ${q(r.citation)}`,
    `    words: ${q(r.words)}`]);
}

/** R21: the `member_ties:` block's lines, from rows `{row, signer, at, entity, kind, level, shown}`, in the order given. */
export function memberTieLines(rows) {
  return block("member_ties", rows, (r) => [
    `  - row: ${bare(r.row)}`,
    `    signer: ${q(r.signer)}`,
    `    at: ${q(r.at)}`,
    `    entity: ${bare(r.entity)}`,
    `    kind: ${bare(r.kind)}`,
    `    level: ${bare(r.level)}`,
    `    shown: ${q(r.shown)}`]);
}

const str = (v) => (v == null ? null : String(v));
/* A block read back from parsed front matter: each object row, each field a string or null; `[]` for no block, and for
   anything that cannot be read. */
const readBack = (fm, key, fields) => {
  try {
    if (!isObj(fm) || !Array.isArray(fm[key])) return [];
    return fm[key].filter(isObj).map((r) => Object.fromEntries(fields.map((f) => [f, str(r[f])])));
  } catch {
    return [];
  }
};

/** R21: the `people:` block read back from parsed front matter, in the document's order; `[]` for a document without
 *  it. Pure; never throws. */
export function peopleOf(fm) {
  return readBack(fm, "people", PEOPLE_FIELDS);
}

/** R21: the `member_ties:` block read back from parsed front matter, in the document's order; `[]` for a document
 *  without it. Pure; never throws. */
export function memberTiesOf(fm) {
  return readBack(fm, "member_ties", MEMBER_TIE_FIELDS);
}
