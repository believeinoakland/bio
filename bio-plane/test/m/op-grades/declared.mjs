/* op-grades' tests: the ops and codes of other modules, read from this module's own requirements or its own tables, never
   typed here (K3268, BOB K4069, K4076). This module uses nothing (P4): `op-declarations` merges after it, so no test imports
   a declaration of another module; what a requirement of this module states, in backticks or as plain words, is the
   contract, and the tables are the data under test. */
import { readFileSync } from "node:fs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";

/* ---- this module's own requirements ------------------------------------------------------------------------------- */
const REQ_LINES = readFileSync(new URL("../../../../build/requirements/op-grades.md", import.meta.url), "utf8").split("\n");

/** Requirement R<n> as written: its line and its sub-bullets, to the next requirement or heading. */
export const reqText = (n) => {
  const from = REQ_LINES.findIndex((line) => line.startsWith(`- **R${n}**`));
  if (from < 0) throw new Error(`op-grades requirements: no R${n}`);
  let to = from + 1;
  while (to < REQ_LINES.length && !/^(- \*\*R\d+\*\*|#|\*\*[A-Z])/.test(REQ_LINES[to])) to++;
  return REQ_LINES.slice(from, to).join("\n");
};

/** The text between the first `from` and the next `to` (the end of the text when `to` is absent), `from` excluded. */
export const between = (text, from, to) => {
  const a = text.indexOf(from);
  if (a < 0) throw new Error(`no "${from}" in the requirement`);
  const rest = text.slice(a + from.length);
  const b = to === undefined ? -1 : rest.indexOf(to);
  return b < 0 ? rest : rest.slice(0, b);
};

const outsideParens = (text) => {
  let flat = "", depth = 0;
  for (const ch of text) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (!depth) flat += ch;
  }
  return flat;
};

/** The ops a requirement text names in backticks outside parentheses (lower-case identifiers; codes and arms are other
    shapes), in order. */
export const ticked = (text) => [...outsideParens(text).matchAll(/`([a-z][a-z0-9]*)`/g)].map((m) => m[1]);

/** Every op a text names in backticks, parentheses included. */
export const tickedAll = (text) => [...text.matchAll(/`([a-z][a-z0-9]*)`/g)].map((m) => m[1]);

/** The codes a requirement text names in backticks (UPPER_CASE), in order. */
export const tickedCodes = (text) => [...text.matchAll(/`([A-Z][A-Z0-9_]+)`/g)].map((m) => m[1]);

/** The ops a requirement states as plain words (R1's first sentences: "reversible actionlaws, cite, ..., and (N364) x"):
    outside parentheses, each comma-, semicolon- or "and"-separated item that is a single lower-case word. */
export const worded = (text) => outsideParens(text).split(/[,;.]|\band\b/).map((item) => item.trim())
  .filter((item) => /^[a-z][a-z0-9]*$/.test(item));

/** The refusal codes named, in backticks, on the lines of the requirements that say they join `JUSTIFICATION_REFUSALS`
    (`own` are this module's exports, which are no codes). */
export const joinedCodes = (own) => [...new Set(REQ_LINES.filter((line) => line.includes("JUSTIFICATION_REFUSALS"))
  .flatMap(tickedCodes)
  .filter((c) => !Object.hasOwn(own, c) && !c.startsWith("MACHINE_CANNOT_") && c !== "ACTS" && !c.endsWith("_PATH")))];

/** R1's exclusions as a rule over a code, not a list of codes: a refusal that asks an object, an identifier, a choice, a
    form or a member (or is a machine's), and never the member's own account. */
export const asksNotTheAccount = (code) => /^(NO_(TARGET|IDS?|KIND|CITATION|BODY|TITLE|CANDIDATE|COUNSEL)|NO_SUCH_|NOT_(A_|AN_)|MACHINE_CANNOT_|ALREADY_|KNOCK_EMPTY|BAD_)|_(NO_LABEL|NO_STATEMENT|TOO_LONG|NOT_FOUND|NOT_IN_PLACE|NOT_OPEN|NOT_PAUSED|LINKED|MISMATCH|INVALID|UNCHANGED|TEXT_REFUSED|NAME_REFUSED|STEP_REFUSED|SCOPE_REFUSED|WHY_REFUSED|ENTRY_INVALID|KIND_UNKNOWN|SIGNATURE_REFUSED|ACT_REFUSED|VALUE_REFUSED)$/.test(code);

/* ---- this module's own tables ------------------------------------------------------------------------------------- */
/** The ops of a NON_ACTS table whose reason is a read's ("read: …"), in table order. */
export const readRows = (table) => Object.keys(table).filter((op) => table[op].startsWith("read: "));

/** The sentence an owner declared for `op` as `localize("<module>.declared.<op>", ...)`, read from the word table
 *  (`setup-words`, which this module uses) by its id, never copied here (P7, K3810). The id is composed, not typed: the
 *  words check judges a literal key against the design's list, and these ids are code-held until the design takes them. */
export const declaredSentence = (module, op) => word(`${module}.declared.${op}`);

/** The sentence an owner declared for `op` as its design key `act.<op>.does` (K4168: the owner's declaration is the truth, so
 *  a hand row holds this sentence and the test reads it from the word table, never from a copy). The id is composed. */
export const doesSentence = (op) => (hasWord(`act.${op}.does`) ? word(`act.${op}.does`) : null);
