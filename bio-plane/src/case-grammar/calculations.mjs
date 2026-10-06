/* case-grammar — the calculations a case rests on, and their provenance (requirements: `build/requirements/case-grammar.md`
 * R18, R19, with R13's `calculation` kind and R6; C:A-12, K1448; scope §1 ANALYSIS, PROV-O for inputs and outputs).
 * `case-authoring`'s `publishCase` writes the block (its R56) with `calculationsLines`, so the bytes are written one way,
 * and `calculationsOf` is the one reading of it, for `public-read`, `case-checker` (which recomputes each recipe) and
 * `case-import` (which recreates each and never trusts it). Pure; nothing here throws.
 *
 * THE BLOCK (flat rows, K549), as `/7` states it (it joins the format written, as R1's blocks did, so no `/8`):
 *   calculations:  one row per calculation any member's chain reaches: `calc` (its `CALC-` id), `recipe` (the
 *                  `bio-calc/1` recipe), `inputs` (each input's name and the SHA-256 of the canonical bytes
 *                  `calc-grammar` evaluates, `{name: sha256}`), `method_version` (the engine's), `results` (the stored
 *                  results by key), `result_key` (`calc-grammar.resultKey(recipe, inputs)` at `method_version`),
 *                  `recompute` (`agrees`, `differs` or `unbound`, as recorded at the act; a workbook row may state
 *                  `not_recomputed`, K1639) and `disclosed` (the
 *                  publisher's disclosure of a differing or unbound load-bearing calculation, null when none was needed).
 *
 * ONE VALUE, EXACTLY: every value is written as R17's are (`./facts.mjs`), its canonical JSON in one quoted value, so
 * a recipe, an input hash or a result reads back byte for byte and recomputes to the same key.
 *
 * THE KEY IS COMPUTED HERE, never copied from the caller: the writer writes `calc-grammar`'s key of the row it writes,
 * so a row cannot state a key its own recipe, inputs and method version do not give. A row it cannot key (no recipe, an
 * input that is not a hash, no method version) states the key null, undetermined (R6). */

import { canonicalJson } from "../record-grammar/index.mjs";
import { resultKey } from "../calc-grammar/index.mjs";
import { caseDocumentRequiresMaterials } from "./formats.mjs";
import { unexact, exactRowsBlock } from "./facts.mjs";

/** R18: the fields of a `calculations:` row, in the order they are written. */
export const CALCULATION_FIELDS = Object.freeze(["calc", "recipe", "inputs", "method_version", "results", "result_key",
  "recompute", "disclosed"]);
/** R18: the recompute statuses recorded at the act. */
export const RECOMPUTE_STATUSES = Object.freeze(["agrees", "differs", "unbound",
  /* K1639 (workbooks R7, K1506): a workbook the instance's engine did not recompute. Never a gate. A workbook row's
     `calc` is its capture's SHA-256, its `inputs` empty and its `result_key` null (it carries no recipe to key). */
  "not_recomputed"]);

const HEX64 = /^[0-9a-f]{64}$/;
const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const objects = (xs) => (Array.isArray(xs) ? xs.filter(plain) : []);
const str = (v) => (typeof v === "string" && v ? v : null);

/* The inputs as `{name: sha256}`: handed as that map, or as `[{name, sha256}]`. Null when any input is not a name with
   a 64-hex SHA-256, or a name repeats: an input stated wrongly is undetermined, never half-written. */
function inputsOf(v) {
  const pairs = Array.isArray(v) ? v.map((x) => (plain(x) ? [x.name, x.sha256] : [null, null]))
    : plain(v) ? Object.entries(v) : null;
  if (!pairs) return null;
  const out = {};
  for (const [name, sha] of pairs) {
    if (typeof name !== "string" || !name || typeof sha !== "string" || !HEX64.test(sha) || Object.hasOwn(out, name)) return null;
    out[name] = sha;
  }
  return out;
}

/* `calc-grammar`'s key of a row, or null when the row cannot be keyed. */
function keyOf(recipe, inputs, method) {
  try {
    return plain(recipe) && inputs && typeof method === "string" && method ? resultKey(recipe, inputs, { methodVersion: method }) : null;
  } catch {
    return null;
  }
}

/* A row as written: each field in its words, or null. */
function calculationRow(r) {
  const recipe = plain(r.recipe) ? r.recipe : null;
  const inputs = inputsOf(r.inputs);
  const method = str(r.method_version);
  return { calc: str(r.calc), recipe, inputs, method_version: method, results: plain(r.results) ? r.results : null,
           result_key: keyOf(recipe, inputs, method),
           recompute: RECOMPUTE_STATUSES.includes(r.recompute) ? r.recompute : null,
           disclosed: str(r.disclosed) };
}

/** R18: the `calculations:` block's lines, from rows `{calc, recipe, inputs ({name: sha256} or [{name, sha256}]),
 *  method_version, results, recompute, disclosed}`, in the order given; `result_key` is computed (above), never taken
 *  from the row. `calculations: []` when there are none. */
export function calculationsLines(rows) {
  return exactRowsBlock("calculations", objects(rows).map(calculationRow), CALCULATION_FIELDS);
}

/** R18: the block read back from a `/6` or later document's front matter: `[{calc, recipe, inputs, method_version,
 *  results, result_key, recompute, disclosed}]`, in the document's order, every value as written (a value the writer
 *  could not have written reads null). A document without the block, and any other format, answers `[]`. Pure; never
 *  throws. */
export function calculationsOf(fm) {
  try {
    const d = plain(fm) ? fm : null;
    if (!caseDocumentRequiresMaterials(d) || !Array.isArray(d.calculations)) return [];
    return objects(d.calculations).map((r) => {
      const v = Object.fromEntries(CALCULATION_FIELDS.map((f) => [f, unexact(r[f])]));
      return { calc: str(v.calc), recipe: plain(v.recipe) ? v.recipe : null, inputs: inputsOf(v.inputs),
               method_version: str(v.method_version), results: plain(v.results) ? v.results : null,
               result_key: typeof v.result_key === "string" && HEX64.test(v.result_key) ? v.result_key : null,
               recompute: RECOMPUTE_STATUSES.includes(v.recompute) ? v.recompute : null, disclosed: str(v.disclosed) };
    });
  } catch {
    return [];
  }
}

/* ===== R19 — PROV-O FOR INPUTS AND OUTPUTS (scope §1 ANALYSIS) ===== */

/** R19: the W3C PROV-O namespace, the JSON-LD context's `prov`. */
export const PROV_NAMESPACE = "http://www.w3.org/ns/prov#";
/** R19: the names the rendering gives its nodes: an input by its SHA-256, a calculation and its plan by its id, a result
 *  by the calculation and its key in `results`. */
export const provIds = Object.freeze({
  input: (sha) => `urn:sha256:${sha}`,
  calculation: (calc) => `urn:bio:calculation:${encodeURIComponent(calc)}`,
  plan: (calc) => `urn:bio:calculation:${encodeURIComponent(calc)}:plan`,
  result: (calc, key) => `urn:bio:calculation:${encodeURIComponent(calc)}:result:${encodeURIComponent(key)}`,
});
const CONTEXT = Object.freeze({ prov: PROV_NAMESPACE, bio: "urn:bio:terms:" });

/** R19: R18's rows rendered as W3C PROV-O in JSON-LD, the text of one file: each calculation a `prov:Activity` that
 *  `prov:used` each input (a `prov:Entity` named by its SHA-256, its name the role of a qualified usage) and
 *  `prov:generated` each stored result (a `prov:Entity` named by the calculation and the result's key, its value
 *  `prov:value` as canonical JSON), with its recipe and method version as the activity's `prov:Plan` (through a
 *  qualified association). A rendering of carried data: it adds no fact (no time, no agent, nothing not in a row), and
 *  a row with no `calc` is not rendered. The same rows always give the same bytes (canonical JSON, the rows' order
 *  kept). Rows as `calculationsOf` reads them, or as `calculationsLines` takes them. Pure; never throws. */
export function provOf(rows) {
  try {
    const graph = [];
    const inputs = new Map();
    for (const r of objects(rows).map(calculationRow)) {
      if (!r.calc) continue;
      const names = Object.keys(r.inputs || {}).sort();
      const keys = Object.keys(r.results || {}).sort();
      for (const n of names) if (!inputs.has(r.inputs[n])) inputs.set(r.inputs[n], { "@id": provIds.input(r.inputs[n]), "@type": "prov:Entity" });
      graph.push({
        "@id": provIds.calculation(r.calc), "@type": "prov:Activity",
        "prov:used": names.map((n) => ({ "@id": provIds.input(r.inputs[n]) })),
        "prov:qualifiedUsage": names.map((n) => ({ "@type": "prov:Usage", "prov:entity": { "@id": provIds.input(r.inputs[n]) },
                                                   "prov:hadRole": { "@id": `bio:input/${encodeURIComponent(n)}` } })),
        "prov:generated": keys.map((k) => ({ "@id": provIds.result(r.calc, k) })),
        "prov:qualifiedAssociation": { "@type": "prov:Association", "prov:hadPlan": { "@id": provIds.plan(r.calc) } },
        "bio:resultKey": r.result_key, "bio:recompute": r.recompute,
      });
      graph.push({ "@id": provIds.plan(r.calc), "@type": ["prov:Entity", "prov:Plan"],
                   "bio:recipe": r.recipe === null ? null : canonicalJson(r.recipe), "bio:methodVersion": r.method_version });
      for (const k of keys)
        graph.push({ "@id": provIds.result(r.calc, k), "@type": "prov:Entity",
                     "prov:wasGeneratedBy": { "@id": provIds.calculation(r.calc) }, "prov:value": canonicalJson(r.results[k]) });
    }
    graph.push(...[...inputs.values()]);
    return canonicalJson({ "@context": CONTEXT, "@graph": graph });
  } catch {
    return canonicalJson({ "@context": CONTEXT, "@graph": [] });
  }
}

/** R18 R13: one calculation's file in a case file (`calculations/<calc>/calculation.json`): the row's canonical JSON. */
export const calculationFileText = (row) => {
  try { return canonicalJson(calculationRow(plain(row) ? row : {})); } catch { return null; }
};
