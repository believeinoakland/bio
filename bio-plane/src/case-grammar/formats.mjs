/* case-grammar — the case document's formats and their predicates (requirements: `build/requirements/case-grammar.md`
 * R1, which was `publication` R20). Copied from `publication/checks.mjs` (K651, K624 (1)); `publication` re-exports
 * this module once its own job deletes its copy. The catalogue keeps its own `/4` copy for its own
 * `checkCaseDocument`, which it cannot import from here (it is first in the order); that copy is legacy-checks'. */

/* N345 (DEC-76 item 4, DEC-84 items 11–13, DEC-85): THE FORMAT MOVES TO /5, FOR THE REASON /3 AND /4 DID. A /5 document
   is one whose author was obliged to state the contradictions its findings rest on, one level deep, in its tension
   section (`case_tensions`), and each member's tension sentences; a /4 document had no place to, so a reader could not
   tell "none was disclosed" from "the format could not disclose one". /4, /3, /2 and /1 stay in the accepted set and
   are read exactly as written, never re-signed (rule 1). op=publish authors /5 only. */
export const CASE_DOCUMENT_FORMAT = "bio-case-document/5";
/* REC-219: /4 states, beside /3's obligations, every adoption pinning a proposed revision and every citation edge with
   its version. /3 (REC-188) carries the manifest and the acknowledgement list; /2 (D-442, rule 12) states its members'
   frozen blocks; /1 (legacy) carried the frozen blocks in its members' own bytes. */
export const CASE_DOCUMENT_FORMAT_V4 = "bio-case-document/4";
export const CASE_DOCUMENT_FORMAT_V3 = "bio-case-document/3";
export const CASE_DOCUMENT_FORMAT_V2 = "bio-case-document/2";
export const CASE_DOCUMENT_FORMAT_LEGACY = "bio-case-document/1";
export const CASE_DOCUMENT_FORMATS_ACCEPTED = Object.freeze([CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4,
  CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY]);
const formatOf = (fm) => { try { return fm && typeof fm === "object" ? fm.format : undefined; } catch { return undefined; } };
/* Does the document state its members' frozen blocks itself (rule 12: /2 and later), or were they in the members' own
   bytes (/1)? ONE predicate for the gate, the committer and every per-case reader. Pure; never throws. */
export const caseDocumentStatesMemberBlocks = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2].includes(formatOf(fm));
/* REC-188: obliged to carry the bias manifest and the statement's acknowledgement list (C-41.13): /3 and later. */
export const caseDocumentRequiresDisclosures = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3].includes(formatOf(fm));
/* REC-219: obliged to state the pending adoptions (C-41.14) and the citation edges with their versions (C-41.15): /4
   and /5. */
export const caseDocumentRequiresV4Disclosures = (fm) =>
  [CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V4].includes(formatOf(fm));
/* N345: obliged to carry the tension section (`case_tensions`, `case_tension_sentences`): /5 only. */
export const caseDocumentRequiresTensionSection = (fm) => formatOf(fm) === CASE_DOCUMENT_FORMAT;
