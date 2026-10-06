/* R36 over the real `calculations` module (T34-31, N576): a calculation leg is graded through calculations' synchronous
   read of its grade facts (its R30), not answered undetermined. The calculations are created, accepted and withheld by
   that module itself, in its own test world (`../calculations/fixture.mjs`: the real record-core, membership,
   promotion, content, money and the rest on one SQLite store); strength is built on the same host and driven at its
   interface, over `candidatePair`, `strengthOf`, `inquiryStrength`, `gradingFacts` and `recomputePair`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V, R } from "../calculations/fixture.mjs";
import { strengthOf, recomputePair, STRENGTH_AXES } from "../../../src/strength/index.mjs";

const F = [{ name: "dept", type: "string" }, { name: "amount", type: "number", currency: "USD" }, { name: "status", type: "string" }];
const PERIOD = { from: "2025-07-01", to: "2026-06-30" };
const SUM = R([{ op: "sum", from: "t", field: "amount", as: "total" }], "total");
const axesOf = (p) => STRENGTH_AXES.map((a) => [a, p[a].state, p[a].grade]);

/* A world holding: an open calculation over a table (its inputs captured at B), one mixing a typed value (testimony, D),
   and one over a table filed in a project only alice may see. Strength reads its basis from a provider the test holds
   (leg-earning's `basisFor`, R16), and calculations' read from the real module, reached on the host by default. */
async function calcWorld() {
  const w = seeded();
  const P = w.project("Closed", "alice");
  const open = await w.table("dept,amount,status\nparks,9,awarded\n", F);
  const hidden = await w.table("dept,amount,status\nparks,7,awarded\n", F, { by: V("alice") }, { project: P });
  const fig = w.passage("$3");
  const b = await w.c.create({ question: "Total?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: open.sha }], recipe: SUM, by: V("bob") });
  const d = await w.c.create({ question: "Less?", period: PERIOD, kind: "difference",
    inputs: [{ name: "t", table: open.sha }, { name: "k", figure: fig }, { name: "v", value: "$2" }],
    recipe: R([{ op: "sum", from: "t", field: "amount", as: "s" }, { op: "difference", a: "s", b: "k", as: "x" }, { op: "difference", a: "x", b: "v", as: "e" }], "e",
      [{ name: "t", kind: "table" }, { name: "k", kind: "figure" }, { name: "v", kind: "figure" }]), by: V("bob") });
  const h = await w.c.create({ question: "Closed total?", period: PERIOD, kind: "total", inputs: [{ name: "t", table: hidden.sha }], recipe: SUM, by: V("alice") });
  const basis = new Map();
  const inquiry = {
    basisFor: (id) => ({ ok: true, bundleId: id, legs: (basis.get(id) || []).map((l) => ({ ...l })) }),
    earned: () => ({ subject_entity: null, subject_known: false, earned: { capture: {}, connection: {}, testimony: {} } }),
    legCapped: () => null, subjectEntityOf: () => null,
  };
  const s = strengthOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, inquiry });
  assert.equal(s.calculations, w.c, "calculations reached on the same host, as strength reaches it by default (K61)");
  const ask = (id, legs) => {
    w.st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, "inquiry", "g", id, "open", "t", "t", "x");
    basis.set(id, legs.map((target, ord) => ({ ord, target_id: target, target_type: "calculation", role: "supports",
                                                 grade: null, grade_axis: null, grade_source: null, ground: null })));
  };
  return { w, s, ask, b: b.calc_id, d: d.calc_id, h: h.calc_id };
}

test("R36: an accepted calculation leg counts on the capture axis at the weakest capture calculations' synchronous read states for its inputs, its method's version named beside the grade and not graded; not accepted, it is undetermined and says why", async () => {
  const { w, s, b, d } = await calcWorld();
  /* Before acceptance: unknown, never low. */
  const before = s.candidatePair({ legs: [{ target: b }] }).pair;
  assert.equal(before.capture.state, "undetermined");
  assert.match(before.capture.undetermined_at[0].why, new RegExp(`the result of ${b} is not accepted`));
  assert.equal((await w.c.accept({ calcId: b, by: V("carol") })).ok, true);
  assert.equal((await w.c.accept({ calcId: d, by: V("carol") })).ok, true);
  const facts = w.c.gradeFactsOf({ calcId: b, viewer: V("carol") });
  const p = s.candidatePair({ legs: [{ target: b }] }).pair;
  assert.deepEqual(axesOf(p), [["capture", "graded", facts.capture.grade], ["connection", "unrated", null], ["testimony", "unrated", null]]);
  assert.equal(p.capture.grade, "B", "the table's capture, through the read");
  const m = p.capture.weakest;
  assert.deepEqual([m.target_id, m.via, m.grade], [b, "derived", "B"]);
  assert.match(m.why, /the weakest capture among its inputs/);
  assert.match(m.why, new RegExp(`Its method is stated beside the grade \\(method ${facts.method.version.replace("/", "\\/")}\\) and is not graded`));
  /* A typed value is testimony (D): the weakest input sets the leg, and the leg sets the axis beside a stronger one. */
  assert.equal(s.candidatePair({ legs: [{ target: d }] }).pair.capture.grade, "D");
  assert.equal(s.candidatePair({ legs: [{ target: b }, { target: d }] }).pair.capture.weakest.target_id, d);
  /* A calculation calculations does not hold: unknown, named. */
  const none = s.candidatePair({ legs: [{ target: "CALC-2026-aaaaaaaaaaaaaaaa" }] }).pair;
  assert.equal(none.capture.state, "undetermined");
  assert.match(none.capture.undetermined_at[0].why, /is not a calculation your group's Civicsmith holds/);
});

test("R36, R6, R35, R32: strengthOf and gradingFacts read the same grade, recomputePair over the facts agrees, and inquiryStrength withholds a calculation calculations withholds from the viewer (its R10) while the grade stays the record's", async () => {
  const { w, s, ask, b, h } = await calcWorld();
  for (const [c, by] of [[b, "carol"], [h, "alice"]]) assert.equal((await w.c.accept({ calcId: c, by: V(by) })).ok, true);
  ask("INQ-2026-0001-a", [b, h]);
  const p = s.strengthOf("INQ-2026-0001-a");
  assert.deepEqual([p.capture.state, p.capture.grade], ["graded", "B"]);
  const f = s.gradingFacts({ inquiry: "INQ-2026-0001-a", viewer: V("alice") });
  assert.deepEqual(f.legs.map((l) => [l.target, l.kind, l.grade_axis, l.grade]), [[b, "calculation", "capture", "B"], [h, "calculation", "capture", "B"]]);
  assert.deepEqual(axesOf(recomputePair({ legs: f.legs, version: f.method })), axesOf(p));
  const carol = s.inquiryStrength({ id: "INQ-2026-0001-a", viewer: V("carol") });
  assert.equal(carol.ok, true, JSON.stringify(carol).slice(0, 300));
  assert.equal(carol.out_of_view, true);
  assert.ok(!JSON.stringify(carol).includes(h), "the calculation carol may not see is withheld whole");
  assert.ok(JSON.stringify(carol).includes(b));
  assert.equal(carol.capture.grade, "B", "the grade does not change with the reader");
  const alice = s.inquiryStrength({ id: "INQ-2026-0001-a", viewer: V("alice") });
  assert.equal(alice.out_of_view, undefined);
  assert.ok(JSON.stringify(alice).includes(h));
});
