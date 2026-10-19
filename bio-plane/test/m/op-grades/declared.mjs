/* op-grades' tests: the ops and codes of other modules, read from their owners' declaration or from this module's own
   requirements (K3268, BOB K4069, K4076), never typed here.
   `OP_FAMILIES` in op-declarations is the product's declaration of each owner's ops, by kind. A test names a requirement's
   ops by intersecting the owners' declared ops with the op-grades table that grades them (this module's own data), or
   reads them from the backticked ops of the requirement line (`build/requirements/op-grades.md`) that states them. */
import { readFileSync } from "node:fs";
import * as DECL from "../../../src/op-declarations/index.mjs";

const { OP_FAMILIES, OPS, NEEDS } = DECL;

const FIELDS = ["kinds", "acts", "proposals", "reads", "extra"];
const listOf = (v) => !v ? [] : Array.isArray(v) ? v : Object.keys(v);
const owned = (owners) => owners.length ? owners : Object.keys(OP_FAMILIES);

/** Every op the named owners (all owners when none is named) declare, in declaration order, without repeats. */
export const declaredOps = (...owners) => [...new Set(owned(owners).flatMap((owner) => {
  const family = OP_FAMILIES[owner];
  if (!family) throw new Error(`op-declarations declares no family for ${owner}`);
  return FIELDS.flatMap((field) => listOf(family[field]));
}))];

/** Every op op-declarations declares (`OPS`), as a set. */
export const declaredNames = () => new Set(Object.keys(OPS));

/** The ops of the owners' exported route maps and lists (`STANDARDS_ACTIONS`, `ACTION_LAYER_READS`, ...), by export name. */
export const declaredList = (...exportNames) => [...new Set(exportNames.flatMap((name) => {
  if (!DECL[name]) throw new Error(`op-declarations exports no ${name}`);
  return listOf(DECL[name]);
}))];

/** Every read op-declarations declares: the owners' families' reads and every exported `*_READS` or `*_PREVIEWS` list. */
export const declaredAllReads = () => [...new Set([...declaredReads(),
  ...Object.keys(DECL).filter((name) => /_(READS|PREVIEWS)$/.test(name)).flatMap((name) => listOf(DECL[name]))])];

/** Every op op-declarations declares as a read: its spec says `mutating: false`. */
export const declaredReadOps = () => Object.keys(OPS).filter((op) => OPS[op].mutating === false);

/** Whether the capability table (`NEEDS`) carries a row for the op, that is, whether it is gated. */
export const isGated = (op) => Object.hasOwn(NEEDS, op);

/** The reads the named owners (all owners when none is named) declare. */
export const declaredReads = (...owners) => [...new Set(owned(owners).flatMap((owner) => {
  const family = OP_FAMILIES[owner];
  if (!family) throw new Error(`op-declarations declares no family for ${owner}`);
  return listOf(family.reads);
}))];

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

/** The ops a requirement states as plain words (R1's first sentences): what stands in `known`, outside parentheses. */
export const worded = (text, known) => outsideParens(text).split(/[^a-z0-9]+/).filter((w) => w && known.has(w));

/** The refusal codes named, in backticks, on the lines of the requirements that say they join `JUSTIFICATION_REFUSALS`
    (`own` are this module's exports, which are no codes). */
export const joinedCodes = (own) => [...new Set(REQ_LINES.filter((line) => line.includes("JUSTIFICATION_REFUSALS"))
  .flatMap(tickedCodes)
  .filter((c) => !Object.hasOwn(own, c) && !c.startsWith("MACHINE_CANNOT_") && c !== "ACTS" && !c.endsWith("_PATH")))];

/** R1's exclusions as a rule over a code, not a list of codes: a refusal that asks an object, an identifier, a choice, a
    form or a member (or is a machine's), and never the member's own account. */
export const asksNotTheAccount = (code) => /^(NO_(TARGET|IDS?|KIND|CITATION|BODY|TITLE|CANDIDATE|COUNSEL)|NO_SUCH_|NOT_(A_|AN_)|MACHINE_CANNOT_|ALREADY_|KNOCK_EMPTY|BAD_)|_(NO_LABEL|NO_STATEMENT|TOO_LONG|NOT_FOUND|NOT_IN_PLACE|NOT_OPEN|NOT_PAUSED|LINKED|MISMATCH|INVALID|UNCHANGED|TEXT_REFUSED|NAME_REFUSED|STEP_REFUSED|SCOPE_REFUSED|WHY_REFUSED|ENTRY_INVALID|KIND_UNKNOWN|SIGNATURE_REFUSED|ACT_REFUSED|VALUE_REFUSED)$/.test(code);
