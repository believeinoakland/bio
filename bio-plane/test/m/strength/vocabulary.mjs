/* The analyst's vocabulary DEC-32 clause 1 forbids in what a member reads (R28, D-269), derived from the ruling itself
   and never listed from memory. Not a suite: `vocabulary.test.mjs` drives it.

   The derivation is `civicos-ui/test/analyst-vocabulary.mjs`'s (UI-53), carried here because a module's tests may not
   import a later module's files (P4); DECISIONS.md is read, not imported. Three tiers:
     1. ATOMS, parsed at run time from clause 1's own sentence ("NEVER show AND / OR / disjunction / grounds"), so an
        amendment of the clause moves the family with it.
     2. SPELLINGS, the stem-prefix closure of each noun atom: `ground` covers `grounds` and `grounding`, `disjun` covers
        `disjunct`, `disjunctive` and `disjunction`.
     3. RESIDUE, the terms DEC-32's own entry uses for the same construct that share no stem with an atom (`partition`,
        `conjunct`, `branch`, `independently sufficient`); each is checked to occur in that entry.
   The connectives are matched as vocabulary, never as the English word: "and" in a sentence, or a capitalised "AND"
   between two clauses, is correct prose (UI-53's measured over-strictness). */
import { readFileSync } from "node:fs";

const decisions = readFileSync(new URL("../../../../docs/development/DECISIONS.md", import.meta.url), "utf8");
const a = decisions.indexOf("### DEC-32 · answered");
const b = decisions.indexOf("### DEC-33 · answered");
/** DEC-32's entry, or "" when either anchor moved (the suite's floor then fails rather than reading clean). */
export const DEC32_ENTRY = a >= 0 && b > a ? decisions.slice(a, b) : "";
/** Clause 1's own sentence. */
export const CLAUSE_1 = (DEC32_ENTRY.match(/NEVER show[^.]*\./) || [""])[0];
/** The words the clause enumerates, between "NEVER show" and its dash, separated by " / ". */
export const ATOMS = ((CLAUSE_1.match(/NEVER show\s+([^—.]*)/) || [, ""])[1])
  .split("/").map((s) => s.trim().toLowerCase()).filter(Boolean);

/** The prefix every spelling of a noun atom starts with. */
export function stemPrefix(atom) {
  const w = String(atom).toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w;
  if (/^disjun/.test(w) || /^conjun/.test(w)) return w.slice(0, 6);
  return w.replace(/(ives|ing|ion|ed|es|s)$/, "");
}
export const CONNECTIVES = ATOMS.filter((x) => x.replace(/[^a-z]/gi, "").length <= 3);
export const NOUNS = ATOMS.filter((x) => x.replace(/[^a-z]/gi, "").length > 3);

/** The residue: DEC-32's own words for the construct that no atom's stem reaches. */
export const RESIDUE = [
  ["partition", /\bpartition/i],
  ["conjunct", /\bconjunct/i],
  ["branch", /\bbranch/i],
  ["independently sufficient", /\bindependently\s+sufficient/i],
];
/** Each residue term and whether DEC-32's entry uses it. */
export const residueAnchored = () =>
  RESIDUE.map(([term]) => [term, new RegExp(term.replace(/\s+/g, "\\s+"), "i").test(DEC32_ENTRY)]);

export const BANNED = [
  ...NOUNS.map((n) => [new RegExp("\\b" + stemPrefix(n), "i"), `DEC-32 clause 1 names ${n}`]),
  [/(^|[^A-Za-z])(AND|OR)\s*\/\s*(AND|OR)([^A-Za-z]|$)/, "the connective pair as vocabulary"],
  [/\b(and|or)-(related|branch|branches|composed|group|grouped|max|min|set|sets)\b/i, "the connective compounded onto the construct"],
  [/\b(the|an|a|this|that|its|each|every|any|one)\s+(AND|OR)\b/, "the connective as a noun behind a determiner"],
  [/\b(AND|OR)\s+(of|branch|branches|relationship|related|composition|composed|leg|legs|set|sets)\b/i, "the connective naming the relationship"],
  [/\b(is|are|were|was|becomes|composes?)\s+(AND|OR)\b/, "the connective as the predicate"],
  ...RESIDUE.map(([term, re]) => [re, `DEC-32's own word for the construct: ${term}`]),
];

/** The hits in one sentence: `[{token, why}]`, empty for clean prose. */
export function analystHits(text) {
  const t = String(text ?? "");
  const hits = [];
  for (const [re, why] of BANNED) {
    const m = re.exec(t);
    if (m) hits.push({ token: String(m[0]).trim(), why });
  }
  return hits;
}
