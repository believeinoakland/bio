/* The people a case names, and its signers' ties (requirements: `build/requirements/case-disclosures.md`, R24–R28;
 * Design Requirement 6 as amended, K1483; K1490, K1493, K1494). Pure: nothing here touches a table. The owner's list of
 * bases is read here, and the case document's `people:` and `member_ties:` blocks are spelled and read back here, one
 * spelling (P15). The services that read the record (`peopleNamed`, `peopleJudged`, `tieAttestationJudged`) are this
 * module's `CaseDisclosures`.
 *
 * THE GRAMMAR IS THE RESTRICTED FRONTMATTER GRAMMAR: an array of flat objects of scalars, as `case-grammar` R1's blocks
 * (K549); a quote, a backslash or a line break in a derived string is sanitised by `case-grammar`'s `fmSafe`. */

import { fmSafe } from "../case-grammar/index.mjs";
import { PEOPLE_KINDS } from "../lines/index.mjs";

/** R25: the closed list of bases a named person is named on (K1483). */
export const PERSON_BASES = Object.freeze(["act_or_position", "tie", "interest", "consent", "prior_publication",
                                           "private_party"]);
/** R24: the places of a case document a caller's part may be (each finding's subject is read from `prepared`). */
export const PERSON_PLACES = Object.freeze(["statement", "claim", "lens", "docket", "timeline", "money"]);
/** R25: the `lines` kinds a `tie` basis may cite: `lines`' people family, its one spelling (`lines` R15). */
export const TIE_LINE_KINDS = PEOPLE_KINDS;
/** R27: the attribution levels at which a tie row carries no handle, key or signature (R10's levels). */
export const TIE_ANONYMOUS_LEVELS = Object.freeze(["group", "project"]);

const WORDS_MAX = 2000;
const SHA_RE = /^[0-9a-f]{64}$/;
const filled = (v) => typeof v === "string" && v.trim() !== "";
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** R25's input: `peopleBases`, `[{person, basis, ref, words?}]`, as a map by person (a person listed twice is listed once,
 *  its first entry kept, the module's convention). Absent or null is none. Any malformed shape is `BAD_COMPLETENESS`
 *  (`case-authoring` R3's code) naming the field: a list that is not one; an entry that is not an object naming a
 *  `person`; a `basis` outside `PERSON_BASES`; a `ref` not of its basis' shape (`act_or_position` `{line, event}`;
 *  `tie` a line id; `interest` a line or money-fact id; `consent` and `prior_publication` a capture's SHA-256;
 *  `private_party` none); words that are not a string, are over 2,000 characters, or hold a double quote, a backslash
 *  or a line break. */
export function basesListed(list) {
  const byPerson = new Map();
  const bad = (field, detail) => ({ ok: false, reason: "BAD_COMPLETENESS", field, detail });
  if (list == null) return { ok: true, byPerson };
  if (!Array.isArray(list))
    return bad("peopleBases", "peopleBases is a list of {person, basis, ref, words?}, one per person the case names");
  for (let i = 0; i < list.length; i++) {
    const d = list[i];
    const at = `peopleBases[${i}]`;
    if (!isObj(d) || !filled(d.person)) return bad(at, `${at} is not {person, basis, ref, words?} naming a person`);
    if (!PERSON_BASES.includes(d.basis))
      return bad(`${at}.basis`, `${at}.basis is one of ${PERSON_BASES.join(", ")}`);
    const ref = refShape(d.basis, d.ref);
    if (ref === undefined)
      return bad(`${at}.ref`, `${at}.ref ${REF_WORDS[d.basis]}`);
    if (d.words != null && typeof d.words !== "string") return bad(`${at}.words`, `${at}.words is the owner's words, a string`);
    const words = typeof d.words === "string" ? d.words.trim() || null : null;
    if (words !== null && (words.length > WORDS_MAX || /["\\\r\n]/.test(words)))
      return bad(`${at}.words`, `${at}.words is at most ${WORDS_MAX} characters and cannot contain a quote, a backslash, or a `
        + `newline: the restricted frontmatter grammar has no escapes`);
    const person = d.person.trim();
    if (!byPerson.has(person)) byPerson.set(person, { person, ord: i, basis: d.basis, ref, words });
  }
  return { ok: true, byPerson };
}

const REF_WORDS = Object.freeze({
  act_or_position: "is {line, event}: the holds line valid at the act's date and the event of the act",
  tie: "is the id of a held line of a people kind (LIN-…)",
  interest: "is the id of a held interest: a line (LIN-…) or a money fact (MNY-…)",
  consent: "is the SHA-256 of the capture recording the person's consent, or of the member's cited testimony",
  prior_publication: "is the SHA-256 of a capture of the earlier publication naming them",
  private_party: "is absent: the words say why the person is named",
});

/* A basis' `ref` in its one shape, or undefined when it has another. */
function refShape(basis, ref) {
  switch (basis) {
    case "act_or_position":
      return isObj(ref) && filled(ref.line) && filled(ref.event) ? { line: ref.line.trim(), event: ref.event.trim() } : undefined;
    case "tie":
      return filled(ref) && /^LIN-/.test(ref.trim()) ? ref.trim() : undefined;
    case "interest":
      return filled(ref) && /^(LIN|MNY)-/.test(ref.trim()) ? ref.trim() : undefined;
    case "consent": case "prior_publication":
      return filled(ref) && SHA_RE.test(ref.trim().toLowerCase()) ? ref.trim().toLowerCase() : undefined;
    case "private_party":
      return ref == null ? null : undefined;
    default:
      return undefined;
  }
}

/** R25, R28: a basis' citation, as the people block states it: the kind's own reference, never a judgment of the person. */
export function basisCitation(basis, ref) {
  switch (basis) {
    case "act_or_position": return `line ${ref.line} held at event ${ref.event}`;
    case "tie": return `line ${ref}`;
    case "interest": return /^MNY-/.test(ref) ? `money fact ${ref}` : `line ${ref}`;
    case "consent": case "prior_publication": return `capture ${ref}`;
    default: return null;
  }
}

/** R28: the places a person is named, as one value of the people block: each `<place> <where>`, in the order R24
 *  answered them, joined by "; ". */
export function placesStated(places) {
  return (Array.isArray(places) ? places : []).map((p) => [p.place, p.where].filter((x) => x != null && x !== "").join(" "))
    .filter(Boolean).join("; ");
}

/* ===========================================================================
 * THE BLOCKS (R28). `people:` one row per person R25 passed `{person, places, basis, citation, words}`; `member_ties:`
 * R27's rows `{row, signer, at, entity, kind, level, shown}`, `row` `attestation` or `tie`. Flat, as `case-grammar` R1's
 * blocks (K549). A document without them reads back as empty lists.
 * =========================================================================== */

const q = (v) => (v == null ? "null" : `"${fmSafe(v)}"`);
const bare = (v) => (v == null ? "null" : String(v));

export function peopleLines(rows) {
  return ["people:", ...(Array.isArray(rows) ? rows : []).flatMap((r) => [
    `  - person: ${bare(r.person)}`,
    `    places: ${q(r.places)}`,
    `    basis: ${bare(r.basis)}`,
    `    citation: ${q(r.citation)}`,
    `    words: ${q(r.words)}`])];
}

export function memberTieLines(rows) {
  return ["member_ties:", ...(Array.isArray(rows) ? rows : []).flatMap((r) => [
    `  - row: ${bare(r.row)}`,
    `    signer: ${q(r.signer)}`,
    `    at: ${q(r.at)}`,
    `    entity: ${bare(r.entity)}`,
    `    kind: ${bare(r.kind)}`,
    `    level: ${bare(r.level)}`,
    `    shown: ${q(r.shown)}`])];
}

const str = (v) => (v == null ? null : String(v));
const rowsOf = (fm, key) => (isObj(fm) && Array.isArray(fm[key]) ? fm[key].filter(isObj) : []);

/** R28: the `people:` block read back, `[]` for a document without it. */
export function peopleOf(fm) {
  return rowsOf(fm, "people").map((r) => ({ person: str(r.person), places: str(r.places), basis: str(r.basis),
                                            citation: str(r.citation), words: str(r.words) }));
}

/** R28: the `member_ties:` block read back, `[]` for a document without it. */
export function memberTiesOf(fm) {
  return rowsOf(fm, "member_ties").map((r) => ({ row: str(r.row), signer: str(r.signer), at: str(r.at), entity: str(r.entity),
                                                 kind: str(r.kind), level: str(r.level), shown: str(r.shown) }));
}
