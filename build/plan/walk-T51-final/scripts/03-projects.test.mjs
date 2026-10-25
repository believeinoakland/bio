/* walk-T51-final, sitting 03 (Projects and the daily rhythm), offline phase: WALK-FINAL-03 #1. One journey in one room: the real plane under Miniflare, the real pages in
   Chromium (every request routed to the plane), every input made by a member's own acts. It fixes nothing and contacts no live deployment. Run from bio-plane:
     node --test --test-timeout=7200000 ../build/plan/walk-T51-final/scripts/03-projects.test.mjs
   It writes build/plan/walk-T51-final/03-projects.md (one row per check, as it goes) and build/plan/walk-T51-final/shots/03-projects/. */
import test from "node:test";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
process.env.WALK_REC = "1";
const { makeWorld } = await import("./walk03.mjs");
const { rec, OUT, SHOTS, counts } = await import("./lib.mjs");
const S1 = await import("./stages1.mjs"), S2 = await import("./stages2.mjs"), S3 = await import("./stages3.mjs"), S4 = await import("./stages4.mjs"), S5 = await import("./stages5.mjs"), S6 = await import("./stages6.mjs"), S7 = await import("./stages7.mjs");

const HEAD = "| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";
const PLAN = [
  ["R20-R23 empty room, first visit", S1.s1], ["R23 start projects", S1.s2], ["R24 founder without a handle, then the handle", S2.s3a], ["R24 project page", S2.s3b], ["R24 acts", S2.s3c], ["R24 close", S2.s3d],
  ["R25 invite and join", S3.s4a], ["R25 request to join", S3.s4b], ["R25 owners, two", S3.s4c], ["R25 owners, three", S3.s4d], ["R25 leave, remove, fork, add refusal", S3.s4e], ["R25 rescue", S3.s4f],
  ["R26 objective", S4.s5], ["R27 themes", S4.s6], ["R28 dashboards", S4.s7], ["R21 queue set acts", S5.s8], ["R127-R133", S5.s9], ["phone and dark", S6.s10], ["frame, states, weights", S6.s11], ["R216", S6.s12], ["R218", S6.s13], ["R217 and overlay", S7.s14],
];

test("walk 03: Projects and the daily rhythm (offline)", { timeout: 7200000 }, async () => {
  mkdirSync(SHOTS, { recursive: true });
  writeFileSync(OUT, HEAD);
  const c = await makeWorld({ tag: "w03final" });
  try {
    for (const [name, fn] of PLAN) {
      const t0 = Date.now();
      try { await fn(c); } catch (e) { rec(name.split(" ")[0], `stage '${name}' stopped`, "n/a", "script", "the stage's script threw", "NOT REACHED", `script error: ${String(e && e.message || e).split("\n")[0].slice(0, 300)} (the rest of that stage's rows were not walked)`, ""); }
      console.log(`STAGE ${name} ${Math.round((Date.now() - t0) / 1000)} s`);
    }
  } finally { await c.close(); }
  /* the record: counts at the top, then the rows */
  const rows = readFileSync(OUT, "utf8").slice(HEAD.length).split("\n").filter(Boolean);
  const sev = { BLOCKER: 0, MAJOR: 0, MINOR: 0 };
  for (const r of rows) if (/\| BROKEN \|/.test(r)) { if (/BLOCKER/.test(r)) sev.BLOCKER++; else if (/MAJOR/.test(r)) sev.MAJOR++; else sev.MINOR++; }
  const n = (v) => rows.filter((r) => r.includes(`| ${v} |`)).length;
  const top = `# Walk T51 final, sitting 03: Projects and the daily rhythm (offline phase)\n\n**Counts** · ${rows.length} rows: WORKS ${n("WORKS")}, BROKEN ${n("BROKEN")} (BLOCKER ${sev.BLOCKER}, MAJOR ${sev.MAJOR}, MINOR ${sev.MINOR}), NOT REACHED ${n("NOT REACHED")}.\n\n`;
  writeFileSync(OUT, top + readFileSync("/home/user/bio/build/plan/walk-T51-final/scripts/03-notes.md", "utf8") + "\n" + HEAD + rows.join("\n") + "\n");
});
