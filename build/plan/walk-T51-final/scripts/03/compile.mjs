/* rebuilds the record's top (counts, the defects for BOB, the notes) and its last line from the rows the walk wrote; run by the test at its end, or by hand: node compile.mjs */
import { readFileSync, writeFileSync } from "node:fs";
const OUT = "/home/user/bio/build/plan/walk-T51-final/03-projects.md";
const HEAD = "| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";
export function compile() {
  const text = readFileSync(OUT, "utf8");
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith("| row id |"));
  const rows = lines.slice(start + 2).filter((l) => l.startsWith("| ") && !l.startsWith("| row id"));
  const cells = (r) => r.slice(2, -2).split(" | ");
  const verdictOf = (r) => cells(r)[5];
  const n = (v) => rows.filter((r) => verdictOf(r) === v).length;
  const sevOf = (r) => (/BLOCKER/.test(r) ? "BLOCKER" : /MAJOR/.test(r) ? "MAJOR" : "MINOR");
  const broken = rows.filter((r) => verdictOf(r) === "BROKEN");
  const sev = { BLOCKER: 0, MAJOR: 0, MINOR: 0 };
  for (const r of broken) sev[sevOf(r)]++;
  const defects = broken.map((r) => { const c = cells(r); return `| ${sevOf(r)} | ${c[0]} | ${c[1].slice(0, 150)} |`; });
  const top = `# Walk T51 final, sitting 03: Projects and the daily rhythm (offline phase)\n\n**Counts** · ${rows.length} rows: WORKS ${n("WORKS")}, BROKEN ${n("BROKEN")} (BLOCKER ${sev.BLOCKER}, MAJOR ${sev.MAJOR}, MINOR ${sev.MINOR}), NOT REACHED ${n("NOT REACHED")}. \`DONE\` is the last line.\n\n`
    + `## The defects, for BOB to place (K4426)\n\n| severity | row | what |\n| --- | --- | --- |\n${defects.join("\n")}\n\n`;
  const notes = readFileSync("/home/user/bio/build/plan/walk-T51-final/scripts/03-notes.md", "utf8");
  writeFileSync(OUT, top + notes + "\n## Rows\n\n" + HEAD + rows.join("\n") + "\n\nDONE\n");
  return { rows: rows.length, sev };
}
if (process.argv[1] && process.argv[1].endsWith("compile.mjs")) console.log(JSON.stringify(compile()));
