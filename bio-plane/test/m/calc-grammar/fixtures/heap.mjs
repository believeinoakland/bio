/* Run with `--expose-gc`: evaluates recipes of every op over a streamed table of 100,000 rows × 10 fields
   (1,000,000 cells), whose rows are made afresh on each pass as a caller streaming a CSV makes them, and prints,
   per recipe, the heap's growth over the baseline in bytes: the most live heap seen while evaluating and reading
   the answer (the heap is collected and read every 5,000 rows a pass yields), and what the answer holds after. */
import { evaluate, METHOD } from "../../../../src/calc-grammar/index.mjs";

export const ROWS = 100_000;
export const FIELDS = [{ name: "id", type: "string" }, { name: "dept", type: "string" }, { name: "amt", type: "number", currency: "USD" },
  { name: "qty", type: "integer" }, { name: "d", type: "date" }, { name: "e", type: "date" }, { name: "kind", type: "string" },
  { name: "ok", type: "boolean" }, { name: "code", type: "string" }, { name: "note", type: "string" }];
const two = (n) => (n < 10 ? `0${n}` : `${n}`);
/** Row i, made afresh: every cell a new string. */
export const rowAt = (i) => [`R-${i}`, `dept ${i % 20}`, `${(i * 7919) % 100000}.${two(i % 100)}`, `${i % 1000}`,
  `2024-${two(1 + (i % 12))}-${two(1 + (i % 28))}`, `2025-${two(1 + ((i * 5) % 12))}-${two(1 + ((i * 3) % 28))}`,
  "spending", i % 3 ? "true" : "false", `C${i % 1000}`, `row ${i} of the fixture`];

let peak = 0;
let sampling = false;
const sample = () => { if (!sampling) return; globalThis.gc(); peak = Math.max(peak, process.memoryUsage().heapUsed); };
export const table = (n = ROWS) => ({ fields: FIELDS, rows: function* rows() {
  for (let i = 0; i < n; i++) { if (i % 5000 === 0) sample(); yield rowAt(i); }
} });
const depts = { fields: [{ name: "dept", type: "string" }, { name: "head", type: "string" }],
  rows: () => Array.from({ length: 20 }, (_, k) => [`dept ${k}`, `head ${k}`])[Symbol.iterator]() };

const S = (op, as, more) => ({ op, as, ...more });
export const RECIPES = {
  select: [S("select", "s", { from: "t", where: [{ field: "amt", test: "ge", value: 0 }] })],
  count: [S("count", "c", { from: "t" })],
  sum: [S("sum", "z", { from: "t", field: "amt" })],
  share: [S("select", "s", { from: "t", where: [{ field: "ok", test: "eq", value: true }] }), S("share", "sh", { part: "s", whole: "t", field: "amt" })],
  "group by dept": [S("group", "g", { from: "t", by: ["dept"], measure: { op: "sum", field: "amt" } })],
  "group by id (one row each)": [S("group", "g", { from: "t", by: ["id"], measure: { op: "count" } })],
  span: [S("span", "sp", { from: "t", start: "d", end: "e", unit: "days" })],
  sort: [S("sort", "o", { from: "t", by: "amt", order: "desc" })],
  "join to a small table": [S("join", "j", { left: "t", right: "u", on: { left: "dept", right: "dept" }, space: "dept" })],
  "join to itself": [S("join", "j", { left: "t", right: "t", on: { left: "id", right: "id" }, space: "row" })],
  "select, sort, span, group": [S("select", "s", { from: "t", where: [{ field: "qty", test: "lt", value: 900 }] }),
    S("sort", "o", { from: "s", by: "d", order: "asc" }), S("span", "sp", { from: "o", start: "d", end: "e", unit: "days" }),
    S("group", "g", { from: "sp", by: ["dept"], measure: { op: "sum", field: "sp" } })],
  "figures: difference, ratio, compare, round": [S("sum", "a", { from: "t", field: "qty" }), S("count", "b", { from: "t" }),
    S("difference", "df", { a: "a", b: "b" }), S("ratio", "r", { numerator: "a", denominator: "b" }),
    S("compare", "cm", { a: "a", b: "b" }), S("round", "rd", { of: "r", places: 2, mode: "half_even" })],
};
export const recipeOf = (steps) => ({ method: METHOD, inputs: [{ name: "t", kind: "table" }, { name: "u", kind: "table" }], steps,
  output: steps[steps.length - 1].as });
export const resolveId = (_space, v) => String(v);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  if (typeof globalThis.gc !== "function") throw new Error("run with --expose-gc");
  const out = {};
  for (const [name, steps] of Object.entries(RECIPES)) {
    const t = table();
    globalThis.gc(); globalThis.gc();
    const base = process.memoryUsage().heapUsed;
    peak = base; sampling = true;
    const r = evaluate(recipeOf(steps), { t, u: depts }, { resolveId });
    let rows = null;
    if (r.result && typeof r.result.rows === "function") { rows = 0; for (const _ of r.result.rows()) { rows += 1; if (rows % 5000 === 0) sample(); } }
    sampling = false;
    globalThis.gc(); globalThis.gc();
    const after = process.memoryUsage().heapUsed;
    out[name] = { growth: Math.max(peak, after) - base, held: after - base, refused: r.refused ?? null,
      result_rows: rows, undetermined_rows: r.undetermined_rows ?? null };
    globalThis.keep = r; globalThis.keep = null;
  }
  process.stdout.write(JSON.stringify(out));
}
