/* The listener order after the re-pin (R41; R-2 L-E7; membership R83 as T33-19a re-pinned it): every layer 5–8 module
   of the re-pinned order, and scheduler, registered on R33's slot in a scrambled order, is called in MODULE_ORDER, and
   the thread and its answer are the same as with no listener at all. progressions registers on no other module's
   slot (entities, promotion, scheduler), so R33's slot is its only listener order. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER } from "./fixture.mjs";
import { MODULE_ORDER } from "../../../src/membership/index.mjs";

const between = (a, b) => MODULE_ORDER.slice(MODULE_ORDER.indexOf(a), MODULE_ORDER.indexOf(b) + 1);

test("R41: the layer 5–8 listeners of the re-pinned order, and scheduler, are told in MODULE_ORDER; each answer unchanged", async () => {
  const L5to8 = between("entities", "review");
  // the re-pinned layer 5 as plan T33 Rules (2) gives it
  assert.deepEqual(between("entities", "workbooks"), ["entities", "events", "lines", "local-facts", "connections", "observation-log",
    "standards", "progressions", "money", "money-checks", "duties", "people", "explore", "bias", "query-language", "retrieval",
    "calculations", "workbooks"]);
  const modules = [...L5to8, "scheduler"];
  const run = async (register) => {
    const w = seeded();
    w.define();
    w.fact("sa", "2026-09-01");
    const told = [];
    if (register) {
      // scrambled: reverse, then every other one moved to the front
      const scrambled = [...modules].reverse();
      const order = [...scrambled.filter((_, i) => i % 2), ...scrambled.filter((_, i) => !(i % 2))];
      for (const m of order) assert.deepEqual(w.p.onThreaded(m, (e) => { told.push([m, e]); }), { ok: true, module: m });
    }
    const answer = await w.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: "sa" }],
                                              threadedBy: "member:alice", viewer: MEMBER });
    return { answer, told, rows: w.snapshot() };
  };
  const quiet = await run(false), loud = await run(true);
  assert.deepEqual(loud.told.map(([m]) => m), modules.filter((m) => MODULE_ORDER.includes(m)).sort((a, b) => MODULE_ORDER.indexOf(a) - MODULE_ORDER.indexOf(b)));
  assert.equal(loud.told.length, modules.length);
  for (const [, e] of loud.told) assert.deepEqual(e, { progressionKey: "proc", entityId: "ENT-1", nextDeadline: Date.parse("2026-10-02T04:00:00Z") });
  assert.deepEqual(loud.answer, quiet.answer);
  assert.deepEqual(loud.rows, quiet.rows);
});
