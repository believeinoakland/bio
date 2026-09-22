import { readFileSync, writeFileSync } from "node:fs";
const REPO = process.argv[2];
const { isClosedDebtRow, debtDisposition } = await import(REPO + "/tools/owed.mjs");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const rd = (p) => readFileSync(REPO + "/" + p, "utf-8");
const wr = (p, t) => writeFileSync(REPO + "/" + p, t);
// 1. the inbox entry out, verbatim, to the drained archive
let q = rd("docs/development/QUEUE.md");
const START = "**2026-09-22 · BOB #26 · BOB RULED D-148 AND D-149";
const s0 = q.indexOf(START), cache = q.indexOf("## THE CACHE");
if (s0 < 0 || cache < s0) fail("entry");
const entry = q.slice(s0, cache).replace(/\n+$/, "");
if (entry.includes("\n**2026-")) fail("more than one entry in the span");
q = (q.slice(0, s0) + q.slice(cache)).replace(/\n{3,}## THE CACHE/, "\n\n## THE CACHE");
wr("docs/development/QUEUE.md", q);
let d = rd("docs/archive/ledgers/BOB-INBOX-drained.md");
d = d.replace(/\n*$/, "\n\n") + "## DRAINED 2026-09-22 by SCHEDULER #12 — BOB #26's entry (`0ce7447b`), verified at `BIO_Case_Making_v0_1.md` §2 (both rulings, with Bob's words) and at the code on `0ce7447b` (`node tools/status.mjs 8`: 8.action BUILT; C-2.10 in the catalogue): item 1 PLACED as D-148 and item 2 as D-149, after UI-69 with the M10 case path, each keeping its id, their DEBT rows archived as placed; D-147 stays a design row in `DEBT.md`.\n\n" + entry + "\n";
wr("docs/archive/ledgers/BOB-INBOX-drained.md", d);
// 2. DEBT dispositions (door 2)
const P = (id, evidence) => `M10 · CLOSED 2026-09-22 AS A DEBT ROW by LED-7 (SCHEDULER #12) — PLACED as a BACKLOG task under its own id, ${id} (owner RECORD, M10), after UI-69 with the M10 case path, on Bob's ruling of 2026-09-22 folded into \`BIO_Case_Making_v0_1.md\` §2 (BOB #26). Verified before placing, on \`0ce7447b\`: ${evidence}`;
const DISP = {
  "D-148": P("D-148", "the action and its correspondence are BUILT (`node tools/status.mjs 8`) and carry no quote grammar; D-147, the lifecycle, stays a design row."),
  "D-149": P("D-149", "an action carries no citation of the laws governing the agency asked; `action` is BUILT (`node tools/status.mjs 8`)."),
};
const lines = rd("docs/development/DEBT.md").split("\n");
for (const [id, nd] of Object.entries(DISP)) {
  const i = lines.findIndex((l) => l.startsWith(`| ${id} |`)); if (i < 0) fail(id);
  if (nd.includes("|") || !isClosedDebtRow(nd)) fail(`${id}: disposition`);
  const line = lines[i].replace(/\s+$/, ""); const prior = debtDisposition(line);
  const cells = line.replace(/\|$/, "").split(" | "); if (cells.length !== 5) fail(`${id}: cells ${cells.length}`);
  cells[3] = `${cells[3]} — PRIOR DISPOSITION, moved verbatim at the close: ${prior}`; cells[4] = nd;
  const out = cells.join(" | ") + " |"; if (debtDisposition(out) !== nd) fail(`${id}: read-back`);
  lines[i] = out;
}
wr("docs/development/DEBT.md", lines.join("\n"));
// 3. MILESTONES
const ml = rd("docs/development/MILESTONES.md").split("\n");
for (const id of ["D-148", "D-149"]) {
  const i = ml.findIndex((l) => l.startsWith(`| ${id} `)); if (i < 0) fail(`MILESTONES ${id}`);
  ml[i] = ml[i].replace(/\s*\|\s*$/, "") + " · PLACED 2026-09-22 in `BACKLOG.md` on Bob's ruling (BOB #26) |";
}
wr("docs/development/MILESTONES.md", ml.join("\n"));
console.log("drained; entry", entry.length, "chars");
