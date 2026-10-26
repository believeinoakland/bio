#!/usr/bin/env node
// Every ruling that records Bob's own words must reach `build/rulings-active.md`, the file every BOB reads whole
// (K5311: K5258 never reached it, so later BOBs did not know it). Lists each ruling of the last <days> (default 3)
// whose title records it as Bob's and whose K id the active file does not cite. Run at takeover and before every handoff; each line
// it prints is folded into the active file (or named there as superseded) before the handoff is pushed.
//   node build/plan/bob-rulings-check.mjs [days]
import { readFileSync } from "node:fs";

const days = +(process.argv[2] || 3);
const since = new Date(Date.now() - days * 86400e3).toISOString().slice(0, 10);
const active = readFileSync("build/rulings-active.md", "utf8");
const cited = new Set(active.match(/K\d+/g));
// rulings whose home is elsewhere (requirements, mechanics, CLAUDE.md) or that are done, one per line `K<n> · where`
for (const l of readFileSync("build/plan/bob-rulings-placed.txt", "utf8").split("\n")) if (/^K\d+/.test(l)) cited.add(l.match(/^K\d+/)[0]);
let missing = 0;
for (const line of readFileSync("build/rulings.md", "utf8").split("\n")) {
  const m = line.match(/^- (K\d+) · (\d{4}-\d{2}-\d{2}) · (.*)$/);
  if (!m || m[2] < since) continue;
  const title = m[3].split(" · ")[0];
  if (!/^Bob[: ]|Bob's words|, Bob's \(|\(Bob's\)| Bob's direction|^Bob's/.test(title)) continue;
  if (cited.has(m[1])) continue;
  missing++;
  console.log(`NOT IN ACTIVE ${m[1]} ${m[2]} · ${m[3].slice(0, 140)}`);
}
console.log(`bob-rulings-check: ${missing} ruling(s) quoting Bob since ${since} not cited in rulings-active.md`);
process.exit(missing ? 1 : 0);
