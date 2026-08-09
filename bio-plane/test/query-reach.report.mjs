/* The reporter half of `query-reach.control.mjs`. Names every range of
   `query.mjs` the driver never entered, with its source text, so an
   unreachable branch can be told from a gap in the driver BY READING it. */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dir = new URL("./.query-reach-cov/", import.meta.url);
const target = fileURLToPath(new URL("../src/query.mjs", import.meta.url));
const src = await readFile(target, "utf8");
const lineOf = (off) => src.slice(0, off).split("\n").length;

const files = await readdir(dir);
const uncovered = new Map();
let seen = false;
for (const f of files) {
  const j = JSON.parse(await readFile(new URL(f, dir), "utf8"));
  for (const s of j.result) {
    if (!s.url.endsWith("/query.mjs")) continue;
    seen = true;
    for (const fn of s.functions)
      for (const r of fn.ranges)
        if (r.count === 0) uncovered.set(`${r.startOffset}:${r.endOffset}`, { r, fn: fn.functionName });
  }
}
if (!seen) { console.log("NO COVERAGE FOR query.mjs — the report measured nothing"); process.exit(2); }

/* Drop ranges wholly contained in a larger uncovered range: an uncovered
   function reports its whole body plus each branch inside it, and the inner
   ones are not separate findings. */
const list = [...uncovered.values()].sort((a, b) => a.r.startOffset - b.r.startOffset
  || b.r.endOffset - a.r.endOffset);
const top = [];
for (const u of list)
  if (!top.some((t) => u.r.startOffset >= t.r.startOffset && u.r.endOffset <= t.r.endOffset)) top.push(u);

console.log(`=== query.mjs · ${src.split("\n").length} lines · ${top.length} range(s) NEVER ENTERED ===\n`);
for (const u of top) {
  const text = src.slice(u.r.startOffset, u.r.endOffset);
  console.log(`line ${lineOf(u.r.startOffset)}${u.fn ? `  (in ${u.fn})` : ""}  [${text.length} chars]`);
  console.log("    " + text.split("\n").slice(0, 6).map((l) => l.trim()).filter(Boolean).join("\n    "));
  console.log("");
}
