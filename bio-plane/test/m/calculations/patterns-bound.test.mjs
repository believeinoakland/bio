/* calculations R22 (K4571, G24): a pattern's denominator says when the gather stopped at its bound; a sample is never
   shown as a census. The transitions are real duties' (declared and recorded through the duties module). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded } from "./fixture.mjs";
const UNITS_MAX = 2000;   /* the bound the requirement figure names (G24) */

async function decided(count) {
  const w = seeded();
  const office = w.entity("Town Clerk", "office");
  for (let i = 0; i < count; i++) {
    const d = w.duty({ obligor: office, trigger: "2026-01-05", due: "2026-01-10" });
    w.transition(d, i % 2 ? "met_late" : "met", "2026-02-01T00:00:00Z");
  }
  await w.c.runPatterns({ budgetMs: 100000 });
  const run = (p) => JSON.parse(w.rows(`SELECT denominator_json FROM calc_pattern_runs WHERE pattern='${p}'`)[0].denominator_json);
  return { w, run };
}

test("R22 R43 past the bound: 2,500 decided transitions give a denominator that says capped and of_total 2,500, for every pattern gathering them", { timeout: 300000 }, async () => {
  const { w, run } = await decided(UNITS_MAX + 500);
  for (const p of ["duty_lateness", "office_lateness"]) {
    const d = run(p);
    assert.equal(d.n, UNITS_MAX, `${p}: the units read`);
    assert.equal(d.capped, true, `${p}: stated as a sample`);
    assert.equal(d.of_total, UNITS_MAX + 500, `${p}: of the whole`);
  }
  const g = w.rows(`SELECT denominator_json FROM calc_pattern_results WHERE pattern='office_lateness'`).map((r) => JSON.parse(r.denominator_json));
  assert.ok(g.length && g.every((d) => d.capped === true && d.of_total === UNITS_MAX + 500), "each group's own denominator says it too");
});

test("R22 R43 control: 1,500 decided transitions are read whole and unflagged", { timeout: 300000 }, async () => {
  const { run } = await decided(1500);
  for (const p of ["duty_lateness", "office_lateness"]) {
    const d = run(p);
    assert.equal(d.n, 1500);
    assert.equal(d.capped, undefined, `${p}: not flagged`);
    assert.equal(d.of_total, undefined);
  }
});

test("R22 R43 past the bound: 2,500 open flow instances give the flow pattern's denominator capped, of_total 2,500; 1,500 are unflagged", { timeout: 300000 }, async () => {
  for (const [count, capped] of [[UNITS_MAX + 500, true], [1500, false]]) {
    const w = seeded();
    w.progressions.feed.instances = Array.from({ length: count }, (_, i) => ({ progression_key: "contracting", entity_id: `ENT-2026-${String(i).padStart(4, "0")}`, findings: [] }));
    await w.c.runPatterns({ budgetMs: 100000 });
    const d = JSON.parse(w.rows(`SELECT denominator_json FROM calc_pattern_runs WHERE pattern='flow_out_of_order'`)[0].denominator_json);
    assert.equal(d.n, Math.min(count, UNITS_MAX));
    assert.equal(d.capped, capped ? true : undefined);
    assert.equal(d.of_total, capped ? count : undefined);
  }
});
