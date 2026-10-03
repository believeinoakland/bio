/* case-grammar — the case document's formats and their predicates (requirements: `build/requirements/case-grammar.md`
 * R1, which was `publication` R20). Copied from `publication/checks.mjs` (K651, K624 (1)), whose job then deleted its
 * copy and re-exports this module. `/5` also states R8's "What changed" block and R9's lens blocks (`./edition.mjs`;
 * DEC-101, DEC-103, K1019), with no `/6`: no `/5` document was stored when they were added. From T28 the format written
 * is `/6` (DEC-112 (3); K1268, BOB's decision 2): everything `/5` states, plus R11's `method:` block and R12's
 * `materials:` and `material_attestations:` blocks (`./materials.mjs`), required, so one predicate says "required"
 * without guessing whether a `/5` document is stored on a deployed plane. */

/* N345 (DEC-76 item 4, DEC-84 items 11–13, DEC-85): THE FORMAT MOVES TO /5, FOR THE REASON /3 AND /4 DID. A /5 document
   is one whose author was obliged to state the contradictions its findings rest on, one level deep, in its tension
   section (`case_tensions`), and each member's tension sentences; a /4 document had no place to, so a reader could not
   tell "none was disclosed" from "the format could not disclose one". /4, /3, /2 and /1 stay in the accepted set and
   are read exactly as written, never re-signed (rule 1).
   DEC-112 (3): THE FORMAT MOVES TO /6, FOR THE SAME REASON. A /6 document carries the version of the grading method and
   checks it was made under, and every document and observation its members' chains reach, with their attestations, so
   anybody can recreate it without a CivicOS copy; a /5 document had no place to. /5 joins the accepted set and is read
   exactly as written. op=publish authors /6 only. */
export const CASE_DOCUMENT_FORMAT = "bio-case-document/6";
/* N345: /5 states the tension section and the captures, sources, "What changed" and lens blocks; /6 states all of them. */
export const CASE_DOCUMENT_FORMAT_V5 = "bio-case-document/5";
/* REC-219: /4 states, beside /3's obligations, every adoption pinning a proposed revision and every citation edge with
   its version. /3 (REC-188) carries the manifest and the acknowledgement list; /2 (D-442, rule 12) states its members'
   frozen blocks; /1 (legacy) carried the frozen blocks in its members' own bytes. */
export const CASE_DOCUMENT_FORMAT_V4 = "bio-case-document/4";
export const CASE_DOCUMENT_FORMAT_V3 = "bio-case-document/3";
export const CASE_DOCUMENT_FORMAT_V2 = "bio-case-document/2";
export const CASE_DOCUMENT_FORMAT_LEGACY = "bio-case-document/1";
export const CASE_DOCUMENT_FORMATS_ACCEPTED = Object.freeze([CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V5,
  CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY]);
const formatOf = (fm) => { try { return fm && typeof fm === "object" ? fm.format : undefined; } catch { return undefined; } };
/* Does the document state its members' frozen blocks itself (rule 12: /2 and later), or were they in the members' own
   bytes (/1)? ONE predicate for the gate, the committer and every per-case reader. Pure; never throws. */
export const caseDocumentStatesMemberBlocks = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V5, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2]
    .includes(formatOf(fm));
/* REC-188: obliged to carry the bias manifest and the statement's acknowledgement list (C-41.13): /3 and later. */
export const caseDocumentRequiresDisclosures = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V5, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3].includes(formatOf(fm));
/* REC-219: obliged to state the pending adoptions (C-41.14) and the citation edges with their versions (C-41.15): /4
   and later. */
export const caseDocumentRequiresV4Disclosures = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V5, CASE_DOCUMENT_FORMAT_V4].includes(formatOf(fm));
/* N345: obliged to carry the tension section (`case_tensions`, `case_tension_sentences`), and the one gate of every `/5`
   block's reader: /5 and /6. */
export const caseDocumentRequiresTensionSection = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V5].includes(formatOf(fm));
/* DEC-112 (3): obliged to carry R11's `method:` block and R12's `materials:` and `material_attestations:` blocks: /6
   only. */
export const caseDocumentRequiresMaterials = (fm) => formatOf(fm) === CASE_DOCUMENT_FORMAT;
