/* proto-mem (THROWAWAY): phase table of one tick across several alloc-*.json results, with alloc-report.mjs's phases. node proto-mem/alloc-compare.mjs <tick> <name1> <name2> ... */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const [k, ...names] = process.argv.slice(2);
const rep = (n) => execFileSync("node", [new URL("./alloc-report.mjs", import.meta.url).pathname, n, k, "0"], { encoding: "utf8" });
const tabs = names.map((n) => {
  const lines = rep(n).split("\n"); const head = lines[0];
  const ph = new Map(); let i = 2;
  for (; i < lines.length && !lines[i].startsWith("top sites"); i++) { const [p, mb] = lines[i].split(" | "); ph.set(p, Number(mb)); }
  return { n, total: Number(head.match(/total ([\d.]+) MB/)[1]), ph };
});
const all = [...new Set(tabs.flatMap((t) => [...t.ph.keys()]))].sort((a, b) => (tabs[0].ph.get(b) || 0) - (tabs[0].ph.get(a) || 0));
console.log(["phase (MB)", ...names].join(" | "));
for (const p of all) console.log([p, ...tabs.map((t) => (t.ph.get(p) ?? 0).toFixed(2))].join(" | "));
console.log(["TOTAL", ...tabs.map((t) => t.total.toFixed(2))].join(" | "));
