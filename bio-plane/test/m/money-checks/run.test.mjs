/* money-checks R6, R7, R10, R13: runs over the facts held, in slices, results keyed so a rerun writes nothing new,
   each with its numerator, denominator and cited inputs; the results table a derived, rebuildable cache. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, ALICE, ADMIN_BOB } from "./fixture.mjs";
import { DETECTORS_DEFAULT_BUDGET_MS, SHIPPED } from "../../../src/money-checks/index.mjs";

function seeded() {
  const w = world();
  w.entityAs("ENT-2026-0010", "institution");
  w.entityAs("ENT-2026-0011", "institution");
  w.entityAs("ENT-2026-0012", "person");
  w.factAs("MNY-2026-f1", { to: "ENT-2026-0010", amount: "700" });
  w.factAs("MNY-2026-f2", { to: "ENT-2026-0010", amount: "100" });
  w.factAs("MNY-2026-f3", { to: "ENT-2026-0011", amount: "150" });
  w.factAs("MNY-2026-f4", { to: "ENT-2026-0012", amount: "50" });
  w.factAs("MNY-2026-f5", { to: "ENT-2026-0011", amount: "999", kind: "revenue", stage: "collected" });
  const d = w.c.defineDetector(shareDetector());
  w.switchOn(d.detector_id);
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
  assert.deepEqual(JSON.parse(row.subject), { kind: "pattern", over: "facts by payee", party: w.id("ENT-2026-0010") });
  assert.equal(JSON.parse(row.numerator).value, "800");
  assert.equal(JSON.parse(row.denominator).value, "1000");
  assert.deepEqual(JSON.parse(row.inputs).map((i) => i.fact_id), ["MNY-2026-f1", "MNY-2026-f2", "MNY-2026-f3", "MNY-2026-f4"].map(w.id).sort());
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
  w.factAs("MNY-2026-f6", { to: "ENT-2026-0010", amount: "10" });
  const third = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(third.written, 1);
  assert.equal(results(w).length, 1);
  assert.equal(JSON.parse(results(w)[0].numerator).value, "810");
  /* withdrawn facts are never counted; a subject that no longer raises keeps no result */
  for (const f of ["MNY-2026-f1", "MNY-2026-f2", "MNY-2026-f6"]) w.withdraw(f);
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.deepEqual(results(w).map((r) => JSON.parse(r.subject).party), [w.id("ENT-2026-0011")]);
  w.withdraw("MNY-2026-f3");
  w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(results(w).length, 0);
});

test("R6: runs in slices within the budget, answering a cursor that resumes where it stopped", () => {
  const w = world({ budgetClock: (() => { let t = 0; return () => (t += 5); })() });
  for (let i = 0; i < 6; i++) { w.entityAs(`ENT-2026-002${i}`, "institution"); w.factAs(`MNY-2026-g${i}`, { to: `ENT-2026-002${i}`, amount: "100" }); }
  w.switchOn(w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] })).detector_id);
  let r = w.c.runDetectors({ budgetMs: 9 });
  let slices = 1;
  assert.equal(r.remaining, true);
  assert.ok(r.cursor);
  while (r.remaining) { r = w.c.runDetectors({ budgetMs: 9, cursor: r.cursor }); slices++; assert.ok(slices < 20); }
  assert.ok(slices > 2);
  assert.equal(results(w).length, 6);
});

test("R6: without budgetMs it runs within its stated default of 1,000 ms; a budgetMs given and not a number above zero is refused NO_BUDGET, nothing run", () => {
  assert.equal(DETECTORS_DEFAULT_BUDGET_MS, 1000);
  /* the clock moves 400 ms per reading: the default budget (1,000 ms) stops a pass after its third subject */
  const w = world({ budgetClock: (() => { let t = 0; return () => (t += 400); })() });
  for (let i = 0; i < 6; i++) { w.entityAs(`ENT-2026-003${i}`, "institution"); w.factAs(`MNY-2026-h${i}`, { to: `ENT-2026-003${i}`, amount: "100" }); }
  w.switchOn(w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] })).detector_id);
  const before = w.snapshot();
  for (const bad of [0, -5, "500", NaN, Infinity, {}, true]) {
    const r = w.c.runDetectors({ budgetMs: bad });
    assert.equal(r.reason, "NO_BUDGET", String(bad));
    assert.equal(r.check, null);
  }
  assert.deepEqual(w.snapshot(), before);
  for (const absent of [{}, { budgetMs: undefined }, { budgetMs: null }, undefined]) {
    const r = w.c.runDetectors(absent);
    assert.equal(r.ok, true);
    assert.equal(r.budget_ms, 1000);
  }
  const fresh = world({ budgetClock: (() => { let t = 0; return () => (t += 400); })() });
  for (let i = 0; i < 6; i++) { fresh.entityAs(`ENT-2026-003${i}`, "institution"); fresh.factAs(`MNY-2026-h${i}`, { to: `ENT-2026-003${i}`, amount: "100" }); }
  fresh.switchOn(fresh.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] })).detector_id);
  const first = fresh.c.runDetectors();
  assert.equal(first.remaining, true);
  assert.equal(first.written, 3);
  assert.equal(fresh.c.runDetectors({ budgetMs: 10_000, cursor: first.cursor }).remaining, false);
  assert.equal(results(fresh).length, 6);
});

test("R6 (N607): a detector switched on in no project is skipped, run over nothing, and leaves no work due", () => {
  const w = world();
  w.project("PROJ-2026-0001-alpha", ["alice"]);
  w.entityAs("ENT-2026-0010", "institution");
  w.factAs("MNY-2026-f1", { to: "ENT-2026-0010", amount: "700" });
  w.factAs("MNY-2026-f2", { to: "ENT-2026-0010", amount: "100" });
  const d = w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.1", citation: "x" }] }));
  /* the shipped detector and the member's, both switched on nowhere: nothing runs, nothing is written */
  const before = w.snapshot();
  const idle = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(idle.ok, true);
  assert.equal(idle.detectors, 0);
  assert.equal(idle.remaining, false);
  assert.equal(idle.cursor, null);
  assert.deepEqual(w.snapshot(), before);
  /* switched off in a project is not switched on: still nothing */
  w.c.switchDetector({ detectorId: d.detector_id, project: "PROJ-2026-0001-alpha", on: false, by: ALICE });
  assert.equal(w.c.runDetectors({ budgetMs: 10_000 }).detectors, 0);
  /* on in one project: it runs, and only it */
  w.c.switchDetector({ detectorId: d.detector_id, project: "PROJ-2026-0001-alpha", on: true, by: ALICE });
  const ran = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(ran.detectors, 1);
  assert.deepEqual([...new Set(results(w).map((r) => r.detector_id))], [d.detector_id]);
  assert.deepEqual(w.record.rebuildAndCompare("money-checks", "money_detector_results"), { same: true });
  /* D54 (membership R43): an administrator neither invited nor joined to the hidden project cannot switch it there;
     nothing is written and the detector still runs */
  const switches = w.count("money_detector_switches");
  assert.equal(w.c.switchDetector({ detectorId: d.detector_id, project: "PROJ-2026-0001-alpha", on: false, by: ADMIN_BOB }).ok, false);
  assert.equal(w.count("money_detector_switches"), switches);
  assert.equal(w.c.runDetectors({ budgetMs: 10_000 }).detectors, 1);
  /* switched off again everywhere, by an administrator joined to it (still at FULL): run over nothing, its held
     results go, and the rebuild agrees */
  w.participate("PROJ-2026-0001-alpha", "bob");
  assert.equal(w.c.switchDetector({ detectorId: d.detector_id, project: "PROJ-2026-0001-alpha", on: false, by: ADMIN_BOB }).ok, true);
  const after = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(after.detectors, 0);
  assert.equal(results(w).length, 0);
  assert.equal(w.count("money_detector_result_times"), 0);
  assert.deepEqual(w.record.rebuildAndCompare("money-checks", "money_detector_results"), { same: true });
  assert.equal(SHIPPED.length >= 1, true);
});

test("R7: a result with no denominator is never written", () => {
  const { w } = seeded();
  w.switchOn(w.c.defineDetector(shareDetector({ population: { per: "payee", kinds: ["gift"] } })).detector_id);
  w.entityAs("ENT-2026-0040", "institution");
  w.factAs("MNY-2026-z1", { to: "ENT-2026-0040", amount: "0", kind: "gift" });
  const r = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(results(w).length, 1);
  assert.ok(Object.keys(r.skipped).length > 0);
});

test("R6 R4: a subject whose party is a person is never a subject and never written; a shipped detector with no threshold raises nothing", () => {
  const { w } = seeded();
  w.switchOn(w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.01", citation: "x" }] })).detector_id);
  w.switchOn("md-shipped-payee-share");
  w.factAs("MNY-2026-p1", { to: "ENT-2026-0010", amount: "5", kind: "payment", stage: "paid" });
  const r = w.c.runDetectors({ budgetMs: 10_000 });
  assert.equal(r.persons_skipped >= 1, true);
  assert.equal(r.skipped["no threshold stated"], 1);
  for (const row of results(w)) assert.notEqual(JSON.parse(row.subject).party, w.id("ENT-2026-0012"));
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
