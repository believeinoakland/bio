/* walk-T51-final, sitting 03 (Projects and the daily rhythm), offline phase: WALK-FINAL-03 #1. One journey in one room: the real plane under Miniflare, the real pages in
   Chromium (every request routed to the plane), every input made by a member's own acts. It fixes nothing and contacts no live deployment. Run from bio-plane:
     node --test --test-timeout=7200000 ../build/plan/walk-T51-final/scripts/03-projects.test.mjs
   It writes build/plan/walk-T51-final/03-projects.md (one row per check, as it goes) and build/plan/walk-T51-final/shots/03-projects/. */
import test from "node:test";
import { writeFileSync, mkdirSync } from "node:fs";
process.env.WALK_REC = "1";
const { makeWorld } = await import("./walk03.mjs");
const { rec, OUT, SHOTS, counts } = await import("./lib.mjs");
const { PLAN } = await import("./plan.mjs");

const HEAD = "| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";

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
  const { compile } = await import("./compile.mjs");
  console.log("COMPILED", JSON.stringify(compile()));
});
