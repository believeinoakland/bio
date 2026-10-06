/* money-checks R6, R7, R10, R13: runs over the facts held, in slices, results keyed so a rerun writes nothing new,
   each with its numerator, denominator and cited inputs; the results table a derived, rebuildable cache. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE } from "./fixture.mjs";

function seeded() {
  const w = world();
  w.entity("ENT-2026-0010", "institution");
  w.entity("ENT-2026-0011", "institution");
  w.entity("ENT-2026-0012", "person");
  w.fact("MNY-2026-f1", { to: "ENT-2026-0010", amount: "700" });
  w.fact("MNY-2026-f2", { to: "ENT-2026-0010", amount: "100" });
  w.fact("MNY-2026-f3", { to: "ENT-2026-0011", amount: "150" });
  w.fact("MNY-2026-f4", { to: "ENT-2026-0012", amount: "50" });
  w.fact("MNY-2026-f5", { to: "ENT-2026-0011", amount: "999", kind: "revenue" });
  const d = w.c.defineDetector(shareDetector());
  return { w, d };
}
const results = (w) => w.run(`SELECT * FROM money_detector_results ORDER BY result_id`);

test("R6 R7: a run writes one result per subject past the condition, with numerator, denominator and cited inputs", () => {
  const { w, d } = seeded();
  const r = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(r.ok, true);
  assert.equal(r.remaining, false);
  assert.equal(r.cursor, null);
  const rows = results(w);
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(row.detector_id, d.detector_id);
  assert.deepEqual(JSON.parse(row.subject), { kind: "pattern", over: "facts by payee", party: "ENT-2026-0010" });
  assert.equal(JSON.parse(row.numerator).value, "800");
  assert.equal(JSON.parse(row.denominator).value, "1000");
  assert.deepEqual(JSON.parse(row.inputs).map((i) => i.fact_id), ["MNY-2026-f1", "MNY-2026-f2", "MNY-2026-f3", "MNY-2026-f4"]);
  const der = JSON.parse(row.derivation);
  assert.equal(der.method, "bio-calc/1");
  assert.equal(der.parameters[0].citation, "member's own word: half of the paid amounts");
  assert.equal(der.compare.relation, "higher");
  assert.equal(w.count("money_detector_result_times"), 1);
});

test("R6: a rerun over unchanged inputs writes nothing new; changed inputs replace the subject's result", () => {
  const { w } = seeded();
  w.c.runDetectors({ budgetMs: 10_000 });
  const first = w.snapshot();
  const again = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(again.written, 0);
  assert.equal(again.unchanged, 1);
  assert.deepEqual(w.snapshot(), first);
  w.fact("MNY-2026-f6", { to: "ENT-2026-0010", amount: "10" });
  const third = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(third.written, 1);
  assert.equal(results(w).length, 1);
  assert.equal(JSON.parse(results(w)[0].numerator).value, "810");
  /* withdrawn facts are never counted; a subject that no longer raises keeps no result */
  for (const f of ["MNY-2026-f1", "MNY-2026-f2", "MNY-2026-f6"]) w.withdraw(f);
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.deepEqual(results(w).map((r) => JSON.parse(r.subject).party), ["ENT-2026-0011"]);
  w.withdraw("MNY-2026-f3");
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(results(w).length, 0);
});

test("R6: runs in slices within the budget, answering a cursor that resumes where it stopped", () => {
  const w = world({ budgetClock: (() => { let t = 0; return () => (t += 5); })() });
  for (let i = 0; i < 6; i++) { w.entity(`ENT-2026-002${i}`, "institution"); w.fact(`MNY-2026-g${i}`, { to: `ENT-2026-002${i}`, amount: "100" }); }
  w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] }));
  let r = w.c.runDetectors({ budgetMs: 9 });
  let slices = 1;
  assert.equal(r.remaining, true);
  assert.ok(r.cursor);
  while (r.remaining) { r = w.c.runDetectors({ budgetMs: 9, cursor: r.cursor }); slices++; assert.ok(slices < 20); }
  assert.ok(slices > 2);
  assert.equal(results(w).length, 6);
  assert.equal(w.c.runDetectors({ budgetMs: 0 }).reason, "NO_BUDGET");
});

test("R7: a result with no denominator is never written", () => {
  const { w } = seeded();
  w.c.defineDetector(shareDetector({ population: { per: "payee", kinds: ["gift"] } }));
  w.entity("ENT-2026-0040", "institution");
  w.fact("MNY-2026-z1", { to: "ENT-2026-0040", amount: "0", kind: "gift" });
  const r = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(results(w).length, 1);
  assert.ok(Object.keys(r.skipped).length > 0);
});

test("R6 R4: a subject whose party is a person is never a subject and never written; a shipped detector with no threshold raises nothing", () => {
  const { w } = seeded();
  w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.01", citation: "x" }] }));
  w.fact("MNY-2026-p1", { to: "ENT-2026-0010", amount: "5", kind: "payment", stage: "paid" });
  const r = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(r.persons_skipped >= 1, true);
  assert.equal(r.skipped["no threshold stated"], 1);
  for (const row of results(w)) assert.notEqual(JSON.parse(row.subject).party, "ENT-2026-0012");
  assert.equal(results(w).filter((row) => row.detector_id === "md-shipped-payee-share").length, 0);
});

test("R13: the results table is declared derived-rebuildable and rebuilds to exactly the rows held", () => {
  const { w } = seeded();
  w.c.runDetectors({ budgetMs: 10_000 });
  const decl = w.record.declaredTables().find((t) => t.name === "money_detector_results");
  assert.equal(decl.derive, "derived-rebuildable");
  assert.equal(decl.module, "money-checks");
  assert.deepEqual(w.record.rebuildAndCompare("money-checks", "money_detector_results"), { same: true });
  for (const t of ["money_check_params", "money_detectors", "money_detector_versions", "money_detector_switches", "money_detector_gates",
                   "money_detector_result_times"])
    assert.ok(w.record.declaredTables().some((x) => x.name === t && x.module === "money-checks"), t);
});

test("R10: a run writes only this module's tables: never an entity's row, a money fact, or a placement", () => {
  const { w } = seeded();
  const before = w.snapshot();
  w.c.runDetectors({ budgetMs: 10_000 });
  const after = w.snapshot();
  const changed = Object.keys(after).filter((t) => after[t] !== before[t]);
  assert.deepEqual(changed.sort(), ["money_detector_result_times", "money_detector_results"]);
  assert.equal(ALICE, "member:alice");
});
