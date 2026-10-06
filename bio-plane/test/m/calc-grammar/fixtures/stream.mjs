/* A table bound as row objects, bound again as a streamed table (R22), and evaluate's answers over both read back as
   row objects, so a test can compare them. */
import { evaluate } from "../../../../src/calc-grammar/index.mjs";

/** The same table, streamed: `rows()` answers a new iterator over arrays of cells in `fields` order. */
export const streamed = (t) => ({ fields: t.fields, rows: () => t.rows.map((r) => t.fields.map((f) => r[f.name]))[Symbol.iterator]() });

const isTable = (v) => v !== null && typeof v === "object" && Array.isArray(v.fields) && Array.isArray(v.rows);

/* A row object from a streamed row; a cell the object table did not hold stays absent. */
const asObject = (fields, row) => {
  const out = {};
  fields.forEach((f, k) => { if (row[k] !== undefined) out[f.name] = row[k]; });
  return out;
};

/** A table result read as row objects (a streamed one by its `rows()`); any other answer unchanged. */
export function asObjects(answer) {
  if (!answer || !answer.result || typeof answer.result.rows !== "function") return answer;
  const { fields, rows } = answer.result;
  return { ...answer, result: { fields, rows: [...rows()].map((r) => asObject(fields, r)) } };
}

/* An answer over row objects with each result row keyed by its fields only, as a streamed row reads back. */
function byFields(answer) {
  if (!answer || !answer.result || !isTable(answer.result)) return answer;
  const { fields, rows } = answer.result;
  return { ...answer, result: { fields, rows: rows.map((r) => asObject(fields, fields.map((f) => r[f.name]))) } };
}

/** Evaluate over `bound`, and again with every table input streamed: `{objects, streams, compared}`, the second read
 *  back as row objects and `compared` the first keyed as the second is. */
export function bothWays(recipe, bound, opts) {
  const objects = evaluate(recipe, bound, opts);
  const compared = byFields(objects);
  const s = Object.fromEntries(Object.entries(bound).map(([k, v]) => [k, isTable(v) ? streamed(v) : v]));
  return { objects, compared, streams: asObjects(evaluate(recipe, s, opts)) };
}
