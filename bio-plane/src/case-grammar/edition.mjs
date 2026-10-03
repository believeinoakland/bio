/* case-grammar — what changed in this edition, and the lens it was produced under (requirements:
 * `build/requirements/case-grammar.md` R8, R9, with R1's `/5` and R6; DEC-101 (1)(2) and `BIO_Publication_v0_1.md` §5A;
 * DEC-103 and `BIO_Declared_Bias_v0_1.md`, "RULED 2026-10-01 by Bob (DEC-103)"; K1019). `case-authoring` writes both
 * (its R38, and the lens with its withheld counts) with the line builders here, so the bytes are written one way, and
 * `whatChangedOf` and `lensOf` are the one reading of them, so no module parses them a second way. Only a `/5` or `/6`
 * document states them: the blocks joined `/5` because no `/5` document was stored when they were added (the signed
 * release knows `/1`–`/3` only), and `/6` states everything `/5` states (R1).
 *
 * THE BLOCKS, as a `/5` document's front matter carries them (the grammar `parseFrontmatter` reads: a map, and arrays
 * of flat rows):
 *   what_changed:     a map `statement_sha`, `began_as` (`member` or `machine_draft`), `draft` (the machine draft's id,
 *                     null for `member`), `adopted_as_drafted` (true when the member signed the draft's words unchanged,
 *                     false when they rewrote them, null for `member`).
 *   lens_statements:  one row per statement in force: `bundle`, `id`, `kind`, `subject`, `text`, `justification`,
 *                     `withheld` (how many of its citations are not printed).
 *   lens_citations:   one row per PRINTED citation: `statement` (`<bundle>#<id>`, since a statement id is stable only
 *                     within its bundle and a bundle id carries no `#`), `citation`.
 *
 * THE SECTIONS, in the body: `## What Changed in This Edition, and Why` (the statement itself, whose text
 * `statement_sha` hashes), and `## The Lens This Case Was Produced Under`. Neither may sit inside the acknowledgement
 * list's prose run (R3: from `**Who else read this statement.**` to `## What Was Searched`), which a later act re-authors
 * whole; DEC-101 puts the statement at the top of the new edition.
 *
 * A WITHHELD CITATION IS COUNTED AND NEVER NAMED (DEC-103): the writer is handed each citation with whether it may be
 * printed, writes the printed ones, and writes of the rest only their number, computed here so it cannot disagree with
 * them. Pure; the readers never throw. */

import { parseFrontmatter, sha256HexSync } from "../record-grammar/index.mjs";
import { caseDocumentRequiresTensionSection } from "./formats.mjs";
import { fmSafe } from "./blocks.mjs";

const val = (v) => (v === undefined || v === null || v === "null" ? null : v);
const bool = (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : null);
const scalar = (v) => (v === null || v === undefined ? "null" : typeof v === "boolean" ? String(v)
  : typeof v === "number" && Number.isFinite(v) ? String(v) : `"${fmSafe(v)}"`);
const rowsBlock = (key, rows, fields) => (rows.length
  ? [`${key}:`, ...rows.flatMap((r) => fields.map((f, i) => `${i ? "   " : "  -"} ${f}: ${scalar(r[f])}`))]
  : [`${key}: []`]);
const objects = (xs) => (Array.isArray(xs) ? xs.filter((x) => x && typeof x === "object") : []);
/* The front matter a reader is handed, or that it reads itself from a document's text. */
const frontOf = (fm) => (fm && typeof fm === "object" ? fm : null);

/* ===== R8 — WHAT CHANGED IN THIS EDITION, AND WHY (DEC-101) ===== */

/** R8: the section's heading. */
export const WHAT_CHANGED_HEAD = "## What Changed in This Edition, and Why";
/** R8: how the statement began. */
export const WHAT_CHANGED_ORIGINS = Object.freeze(["member", "machine_draft"]);

/* The statement's lines as the section holds them: line breaks made `\n`, trailing spaces trimmed, blank lines at
   either end dropped. */
const trimmedLines = (lines) => {
  const out = lines.map((l) => l.replace(/[ \t]+$/, ""));
  while (out.length && out[0] === "") out.shift();
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
};

/** R8: the statement's text as the section will hold it, and so the text `statement_sha` hashes: line breaks made
 *  `\n`, trailing spaces trimmed, blank lines at either end dropped, and a line that would begin a heading escaped with
 *  a backslash (Markdown prints it unchanged), so nothing a member writes can end the section early. */
export function whatChangedText(statement) {
  return trimmedLines(String(statement ?? "").split(/\r\n|\r|\n/))
    .map((l) => (/^ {0,3}#/.test(l) ? `\\${l.trimStart()}` : l)).join("\n");
}

/** R8: the `what_changed:` block's lines, from `{statement, began_as, draft, adopted_as_drafted}`. A statement begun
 *  by the member names no draft and no adoption (both null), whatever it is handed. */
export function whatChangedBlockLines({ statement = "", began_as = null, draft = null, adopted_as_drafted = null } = {}) {
  const member = began_as === "member";
  return ["what_changed:",
    `  statement_sha: ${scalar(sha256HexSync(whatChangedText(statement)))}`,
    `  began_as: ${scalar(began_as)}`,
    `  draft: ${member ? "null" : scalar(draft)}`,
    `  adopted_as_drafted: ${member ? "null" : scalar(typeof adopted_as_drafted === "boolean" ? adopted_as_drafted : null)}`];
}

/** R8: the body section's lines: the head, then the statement's text (`whatChangedText`). */
export function whatChangedSectionLines(statement) {
  const text = whatChangedText(statement);
  return [WHAT_CHANGED_HEAD, "", ...(text ? text.split("\n") : []), ""];
}

/* The section's text in a body: the lines after the head up to the next `## ` heading, trimmed as the writer trims;
   null when the body has no such head. */
const sectionText = (body) => {
  const lines = String(body ?? "").split(/\r\n|\n/);
  const at = lines.indexOf(WHAT_CHANGED_HEAD);
  if (at < 0) return null;
  let end = at + 1;
  while (end < lines.length && !lines[end].startsWith("## ")) end++;
  return trimmedLines(lines.slice(at + 1, end)).join("\n");
};

/** R8: the statement and its block read back, `{statement, began_as, draft, adopted_as_drafted}`, from a `/5`
 *  document's front matter and body; null for a document carrying neither, and for any other format. A section with
 *  no block answers its statement with the block's fields null; a block whose `statement_sha` the section's text does
 *  not hash to (or with no section) answers `statement: null`, undetermined and never filled (R6). Pure; never throws. */
export function whatChangedOf(fm, body) {
  try {
    const d = frontOf(fm);
    if (!caseDocumentRequiresTensionSection(d)) return null;
    const block = d.what_changed && typeof d.what_changed === "object" && !Array.isArray(d.what_changed)
      ? d.what_changed : null;
    const text = sectionText(body);
    if (!block && text === null) return null;
    const sha = block ? val(block.statement_sha) : null;
    return {
      statement: text !== null && (!block || (typeof sha === "string" && sha === sha256HexSync(text))) ? text : null,
      began_as: block ? val(block.began_as) : null,
      draft: block ? val(block.draft) : null,
      adopted_as_drafted: block ? bool(block.adopted_as_drafted) : null,
    };
  } catch {
    return null;
  }
}

/* ===== R9 — THE LENS THIS CASE WAS PRODUCED UNDER (DEC-103) ===== */

/** R9: the section's heading. */
export const LENS_HEAD = "## The Lens This Case Was Produced Under";
/** R9: the fields of a `lens_statements:` row and of a `lens_citations:` row, in the order they are written. */
export const LENS_STATEMENT_FIELDS = Object.freeze(["bundle", "id", "kind", "subject", "text", "justification", "withheld"]);
export const LENS_CITATION_FIELDS = Object.freeze(["statement", "citation"]);
/** R9: each statement kind in plain words (BOB's, from Declared Bias's own definitions). */
export const LENS_KIND_WORDS = Object.freeze({
  scrutiny: "a source this group checks more closely before relying on it",
  inference: "an inference this group allows or refuses to draw",
  pattern: "a pattern this group has evidence an institution or source follows",
});
/** R9: the two sentences that close the section, verbatim (DEC-103; the first is Bob's, DEC-117, N524). */
export const LENS_CLOSING_SENTENCES = Object.freeze([
  "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the "
    + "most dangerous kind.",
  "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it "
    + "looked at the material.",
]);
/** R9: with no manifest in force, the section says so. */
export const LENS_NONE_SENTENCE = "No manifest was in force when this case was published: no bias set stood adopted for "
  + "it. That is stated, not left blank: it is a different fact from a lens with nothing in it.";
/** R6: a manifest the record could not determine is stated as undetermined, never filled. */
export const LENS_UNDETERMINED_SENTENCE = "The lens this case was produced under is undetermined, so no statement is "
  + "printed and nothing is claimed either way";

/** R9: a statement's key in `lens_citations:`: its bundle and its id. */
export const lensStatementKey = (bundle, id) => `${bundle ?? ""}#${id ?? ""}`;

/* A statement as the writer is handed it, made into the row it writes and the citations it prints: a string citation
   is printed; `{citation, printed: true}` is printed; every other one is withheld, counted and never written. */
const lensRowOf = (s) => {
  const printed = [];
  let withheld = 0;
  for (const c of Array.isArray(s.citations) ? s.citations : []) {
    if (typeof c === "string" && c.trim()) printed.push(fmSafe(c));
    else if (c && typeof c === "object" && c.printed === true && typeof c.citation === "string" && c.citation.trim())
      printed.push(fmSafe(c.citation));
    else withheld++;
  }
  const one = (v) => (v === null || v === undefined ? null : fmSafe(v));
  return { row: { bundle: one(s.bundle), id: one(s.id), kind: one(s.kind), subject: one(s.subject), text: one(s.text),
                  justification: one(s.justification), withheld },
           printed };
};

/** R9: the `lens_statements:` and `lens_citations:` blocks' lines, from `[{bundle, id, kind, subject, text,
 *  justification, citations: [string | {citation, printed}]}]`, each statement in force in the order given. Empty
 *  blocks (`[]`) with no manifest in force. */
export function lensBlockLines(statements) {
  const made = objects(statements).map(lensRowOf);
  const citations = made.flatMap(({ row, printed }) =>
    printed.map((citation) => ({ statement: lensStatementKey(row.bundle, row.id), citation })));
  return [...rowsBlock("lens_statements", made.map((m) => m.row), LENS_STATEMENT_FIELDS),
          ...rowsBlock("lens_citations", citations, LENS_CITATION_FIELDS)];
}

/** R9: the body section's lines, from `{acknowledgement, statements, inForce}` (`statements` as `lensBlockLines` takes
 *  them; `inForce` true, false for no manifest, or null for undetermined with `stated`): the publisher's
 *  acknowledgement first; then each statement, its kind in plain words, its subject and its text, with its
 *  justification, its printed citations and its withheld count (never which) beneath; or, with no manifest in force,
 *  that none was; then the two closing sentences, once. */
export function lensSectionLines({ acknowledgement = null, statements = [], inForce = true, stated = null } = {}) {
  const ack = acknowledgement == null || !String(acknowledgement).trim()
    ? "No acknowledgement is stated." : fmSafe(acknowledgement);
  const made = objects(statements).map(lensRowOf);
  const said = (v) => (v == null || v === "" ? "not stated" : v);
  const lens = inForce === true
    ? [`This case was produced under ${made.length} statement${made.length === 1 ? "" : "s"} of declared bias in `
         + `force when it was published, each printed here with its reasons.`,
       "",
       ...made.flatMap(({ row, printed }, i) => [
         `${i + 1}. **${LENS_KIND_WORDS[row.kind] ?? `a statement of kind ${said(row.kind)}`}** (\`${said(row.kind)}\`), `
           + `on ${said(row.subject)}: ${said(row.text)}`,
         `   - Justification: ${said(row.justification)}`,
         `   - Evidence: ${printed.length ? printed.join("; ") : "none printed"}`,
         `   - Citations withheld: ${row.withheld ? `${row.withheld} (which ones is not stated)` : "none"}`,
         ""])]
    : inForce === null
      ? [`${LENS_UNDETERMINED_SENTENCE}${stated == null || !String(stated).trim() ? "." : `: ${fmSafe(stated)}.`}`, ""]
      : [LENS_NONE_SENTENCE, ""];
  return [LENS_HEAD, "", `**The publisher's acknowledgement.** ${ack}`, "", ...lens,
          LENS_CLOSING_SENTENCES[0], "", LENS_CLOSING_SENTENCES[1], ""];
}

/** R9: the lens blocks read back from a `/5` document's front matter, in the document's order: `{statements: [{bundle,
 *  id, kind, subject, text, justification, withheld, citations}]}`, each statement's printed citations attached by its
 *  key; null for a document without `lens_statements:`, and for any other format. A `withheld` that is not a count
 *  reads null, undetermined (R6). Pure; never throws. */
export function lensOf(fm) {
  try {
    const d = frontOf(fm);
    if (!caseDocumentRequiresTensionSection(d) || !Array.isArray(d.lens_statements)) return null;
    const citations = objects(d.lens_citations);
    return {
      statements: objects(d.lens_statements).map((r) => {
        const key = lensStatementKey(val(r.bundle), val(r.id));
        const w = r.withheld;
        return { bundle: val(r.bundle), id: val(r.id), kind: val(r.kind), subject: val(r.subject), text: val(r.text),
                 justification: val(r.justification),
                 withheld: Number.isInteger(w) && w >= 0 ? w : null,
                 citations: citations.filter((c) => c.statement === key && val(c.citation) !== null)
                   .map((c) => c.citation) };
      }),
    };
  } catch {
    return null;
  }
}

/** R8, R9 from a document's text: its front matter parsed once (record-grammar), for a reader holding bytes. */
export function editionStatementsOf(text) {
  try {
    const p = parseFrontmatter(String(text ?? ""));
    return { what_changed: whatChangedOf(p.data, p.body), lens: lensOf(p.data) };
  } catch {
    return { what_changed: null, lens: null };
  }
}
