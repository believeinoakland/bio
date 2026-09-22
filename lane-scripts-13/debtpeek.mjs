// Read-only: for each DEBT id, print its class, date, the head of its description and its disposition (trimmed).
// Usage: node debtpeek.mjs <repo> <head-chars> <disp-chars> ID...
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
const [repoArg, headN, dispN, ...ids] = process.argv.slice(2);
const REPO = resolve(repoArg);
const { debtDisposition } = await import(join(REPO, "tools/owed.mjs"));
const lines = readFileSync(join(REPO, "docs/development/DEBT.md"), "utf-8").split("\n");
for (const id of ids) {
  const l = lines.find((x) => x.startsWith(`| ${id} |`));
  if (!l) { console.log(`${id}: NOT IN LIVE DEBT`); continue; }
  const cells = l.split(" | ");
  const disp = debtDisposition(l);
  console.log(`${id} · ${cells[1]} · ${cells[2]} · ${Buffer.byteLength(l)} B\n  HEAD: ${cells[3].slice(0, Number(headN))}\n  DISP: ${disp.slice(0, Number(dispN))}\n`);
}
