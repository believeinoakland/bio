/* court-citations: Free Law Project's reporters-db and courts-db as versioned data (build/requirements/court-citations.md).
 * The data is the generated `court-data.mjs` (build.mjs); this file adds the variant index and two lookups. Pure: no
 * store, no network, no clock (R8). A reporter recognised is a spelling recognised, never a citation verified (R10). */
import { REPORTERS, COURTS, SOURCES } from "./court-data.mjs";

export { REPORTERS, COURTS, SOURCES };

/* R1: every variant and every standard abbreviation → each {reporter, edition} it stands for, in REPORTERS order. */
function variantIndex() {
  const v = Object.create(null);
  const add = (spelling, reporter, edition) => {
    const list = (v[spelling] ??= []);
    if (!list.some((x) => x.reporter === reporter && x.edition === edition)) list.push({ reporter, edition });
  };
  for (const r of REPORTERS) {
    for (const e of r.editions) add(e.key, r.key, e.key);
    for (const [spelling, edition] of Object.entries(r.variations)) add(spelling, r.key, edition);
  }
  for (const list of Object.values(v)) { for (const x of list) Object.freeze(x); Object.freeze(list); }
  return Object.freeze(v);
}
export const VARIANTS = variantIndex();

/* R7: white space and periods folded away, the only differences between many of the package's variants. */
const fold = (s) => s.replace(/[\s.]+/gu, "");
let folded = null;
function foldedIndex() {
  if (folded) return folded;
  folded = new Map();
  for (const [spelling, list] of Object.entries(VARIANTS)) {
    const k = fold(spelling), acc = folded.get(k) ?? [];
    for (const x of list) if (!acc.some((y) => y.reporter === x.reporter && y.edition === x.edition)) acc.push(x);
    folded.set(k, acc);
  }
  return folded;
}

/* R7: VARIANTS' entries for a spelling as written, else after folding, else null. Never throws. */
export function reporterFor(spelling) {
  if (typeof spelling !== "string") return null;
  if (Object.hasOwn(VARIANTS, spelling)) return VARIANTS[spelling];
  const k = fold(spelling);
  if (k === "") return null;
  const hit = foldedIndex().get(k);
  return hit ? Object.freeze(hit.slice()) : null;
}

/* courts-db's strip_punc, with Python's white-space set: runs of two or more become one space; the ends trimmed. */
const PY_SPACE = "\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const RUNS = new RegExp(`[${PY_SPACE}]{2,}`, "gu"), ENDS = new RegExp(`^[${PY_SPACE}]+|[${PY_SPACE}]+$`, "gu");
const flags = () => SOURCES.find((s) => s.package === "courts-db").pattern_flags;
let compiled = null;
function courtMatchers() {
  if (compiled) return compiled;
  const fl = flags();
  compiled = COURTS.map((c) => ({ id: c.id, res: [...c.patterns, ...(c.name_pattern ? [c.name_pattern] : [])].map((p) => new RegExp(`^(?:${p})$`, fl)) }));
  return compiled;
}

/* R7: the ids of every court one of whose patterns (or its name, as courts-db matches it) matches the whole text,
 * case-insensitively, after courts-db's white-space folding; in COURTS order, or []. Never throws. */
export function courtsNamed(text) {
  if (typeof text !== "string") return [];
  const s = text.replace(RUNS, " ").replace(ENDS, "");
  if (s === "") return [];
  return courtMatchers().filter((c) => c.res.some((r) => r.test(s))).map((c) => c.id);
}
