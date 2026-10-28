#!/usr/bin/env node
/* prints one line per proto-mem/results/chain-*.json (segments, peak above baseline, heap floor first/last/max, rests) */
import { readdirSync, readFileSync } from "node:fs";
const dir = new URL("./results/", import.meta.url).pathname;
const pat = process.argv[2] || "chain-";
for (const f of readdirSync(dir).filter((f) => f.startsWith(pat) && f.endsWith(".json")).sort()) {
  const o = JSON.parse(readFileSync(dir + f));
  if (!o.segments) continue;
  o.segments.forEach((s, i) => console.log(f.replace(".json", "").padEnd(36), `seg${i}`, `fin=${o.finished}`, `wall=${Math.round(s.wall_ms / 1000)}s`, `peak+${s.rss.peak_above_baseline}`, `rss_end+${(s.rss.end - s.rss.start).toFixed(1)}`,
    `floor first/last/max ${s.heap.floor_first}/${s.heap.floor_last}/${s.heap.floor_max}`, `peak_used ${s.heap.peak_used}`, `rests ${s.rests.length}`));
}
