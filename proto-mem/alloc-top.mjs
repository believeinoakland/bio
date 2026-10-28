/* proto-mem (THROWAWAY): reads results/alloc-<name>.json; prints the top allocation sites of tick k (by function + bundle line:col, self bytes). node proto-mem/alloc-top.mjs name k [n] */
import { readFileSync } from "node:fs";
const [name, k = "1", n = "15"] = process.argv.slice(2);
const o = JSON.parse(readFileSync(new URL(`./results/alloc-${name}.json`, import.meta.url)));
const t = o.ticks[Number(k) - 1];
const agg = new Map();
for (const f of t.flat) { const key = `${f.fn}@${f.line}:${f.col}`; const a = agg.get(key) || { key, self: 0, stack: f.stack }; a.self += f.self; agg.set(key, a); }
const rows = [...agg.values()].sort((a, b) => b.self - a.self);
const tot = t.total_sampled_bytes;
console.log(`${name} tick ${k}: total ${(tot / 1048576).toFixed(2)} MB, ${t.ms} ms, rows_added ${t.rows_added}, r2 ${JSON.stringify(t.r2.map((x) => x.range))}`);
for (const r of rows.slice(0, Number(n))) console.log(`${(r.self / 1048576).toFixed(2).padStart(7)} MB ${(100 * r.self / tot).toFixed(1).padStart(5)}%  ${r.key}   <- ${r.stack.split(" < ").slice(1, 5).join(" < ")}`);
