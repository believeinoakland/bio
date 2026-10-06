/* Run with `--expose-gc` and a capped old space (`--max-old-space-size`, the Worker's heap or less): declares a table of
   100,000 rows × 10 fields (1,000,000 cells, calculations R1's bound) over a captured CSV, then creates calculations
   over it (a sum, a select and count, a group, a sort) and evaluates one. Prints, as JSON, each act's answer in brief
   and the heap: the live heap after declaring (the table held), the most seen after each act, and the growth over the
   held table. A run that does not fit the capped heap dies, and prints nothing. Runs only with CALC_HEAP_CHILD=1. */
import { seeded, V, R } from "../fixture.mjs";

const ROWS = 100_000;
export const FIELDS = [{ name: "id", type: "string" }, { name: "dept", type: "string" }, { name: "amount", type: "number" },
  ...Array.from({ length: 7 }, (_, k) => ({ name: `c${k}`, type: "integer" }))];
const dept = (i) => `d${i % 20}`;
export function csv() {
  const lines = [FIELDS.map((f) => f.name).join(",")];
  for (let i = 0; i < ROWS; i++) lines.push([`r${i}`, dept(i), String(i % 1000), ...Array.from({ length: 7 }, (_, k) => String((i + k) % 97))].join(","));
  return `${lines.join("\n")}\n`;
}
export const RECIPES = {
  sum: R([{ op: "sum", from: "t", field: "amount", as: "total" }], "total"),
  "select and count": R([{ op: "select", from: "t", where: [{ field: "dept", test: "eq", value: "d3" }], as: "s" }, { op: "count", from: "s", as: "n" }], "n"),
  "group by dept": R([{ op: "group", from: "t", by: ["dept"], measure: { op: "sum", field: "amount" }, as: "g" }], "g"),
  sort: R([{ op: "select", from: "t", where: [{ field: "c0", test: "eq", value: 5 }], as: "s" }, { op: "sort", from: "s", by: "amount", order: "desc", as: "o" }], "o"),
};

async function main() {
  if (typeof globalThis.gc !== "function") throw new Error("run with --expose-gc");
  const MB = 1024 * 1024;
  const heap = () => { globalThis.gc(); globalThis.gc(); return process.memoryUsage().heapUsed; };
  const w = seeded();
  const source = w.csv(csv());
  const t = await w.c.declareTable({ source, schema: { fields: FIELDS }, header: FIELDS.map((f) => f.name), by: V("bob") });
  if (!t.ok) throw new Error(JSON.stringify(t).slice(0, 300));
  const held = heap();
  const out = { declared: { rows: t.rows, cells: t.rows * FIELDS.length }, held_mb: held / MB, acts: {} };
  for (const [name, recipe] of Object.entries(RECIPES)) {
    const c = await w.c.create({ question: name, period: { from: "2025-07-01", to: "2026-06-30" }, kind: name === "sort" ? "ranking" : "total",
      terms: { quantity: "amount", scope: "the rows", period: "FY2025-26" }, inputs: [{ name: "t", table: t.sha }], recipe, by: V("bob") });
    const after = heap();
    const o = c.ok ? c.results.output : null;
    out.acts[name] = { ok: c.ok, reason: c.reason ?? null, output: o && Array.isArray(o.rows) ? { rows: o.rows.length, first: o.rows[0] } : o,
      growth_mb: (after - held) / MB };
  }
  const e = await w.c.evaluate({ recipe: RECIPES.sum, inputs: [{ name: "t", table: t.sha }], viewer: V("carol") });
  out.acts.evaluate = { ok: e.ok, output: e.ok ? e.results.output : null, growth_mb: (heap() - held) / MB };
  process.stdout.write(JSON.stringify(out));
}

/* run only as the measuring child the test starts, never when a test runner loads this file */
if (process.env.CALC_HEAP_CHILD === "1") await main();
