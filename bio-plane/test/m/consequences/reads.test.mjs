/* consequences R7, R8: what a determination's consequences are, totals kept within one state, unit and currency, what
   is not known in front of the member, and the notice when a part's basis changes. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const S = "STD-2026-0001-law";
const S2 = "STD-2026-0002-other";
const INQ = "INQ-2026-0001-cause";

function setup() {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant", [S2]: "noncompliant" });
  w.part = (measure, basis, over = {}) => {
    const r = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "a fund" },
      period: { from: "2026-01-01", to: "2026-12-31" }, measure, basis, author: V("alice"), ...over });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.id;
  };
  return w;
}

test("R7: every live part, totals only within one state, unit and currency, labelled with the parts they count", () => {
  const w = setup();
  const a = w.figure("INFO-2026-0001-a", "Cut 1,000");
  const b = w.figure("INFO-2026-0002-b", "Cut 2,500");
  const c1 = w.part({ unit: "money", currency: "USD" }, { op: "sum", operands: [{ content: a, figure: "1,000" }] });
  const c2 = w.part({ unit: "money", currency: "USD" }, { op: "sum", operands: [{ content: b, figure: "2,500" }] });
  const c3 = w.part({ unit: "money", currency: "EUR" }, { op: "sum", operands: [{ content: a, figure: "1,000" }] });
  const a1 = w.part({ unit: "money", currency: "USD", value: 400 }, { rationale: "estimate" });
  const a2 = w.part({ unit: "money", currency: "USD", range: { low: 100, high: 300 } }, { rationale: "estimate" });
  const a3 = w.part({ unit: "count", value: 30 }, { rationale: "families affected" });
  const u1 = w.part(null, null);
  const other = w.part({ unit: "count", value: 5 }, { rationale: "other standard" }, { standard: S2 });
  const r = w.c.consequencesOf({ determination: w.D, viewer: V("alice") });
  assert.equal(r.ok, true);
  assert.deepEqual(r.parts.map((p) => p.id).sort(), [c1, c2, c3, a1, a2, a3, u1, other].sort());
  for (const p of r.parts) {
    assert.ok(["computed", "assessed", "undetermined"].includes(p.state));
    assert.ok(p.causation && p.addressed, "each with causation and addressed state");
    if (p.state === "computed") assert.ok(p.grade); else if (p.state === "assessed") assert.ok(p.assessment.by);
  }
  const t = Object.fromEntries(r.totals.map((x) => [`${x.state}/${x.unit}/${x.currency}`, x]));
  assert.deepEqual(Object.keys(t).sort(), ["assessed/count/null", "assessed/money/USD", "computed/money/EUR", "computed/money/USD"]);
  assert.deepEqual([t["computed/money/USD"].value, t["computed/money/USD"].parts.sort()], [3500, [c1, c2].sort()]);
  assert.deepEqual([t["computed/money/EUR"].value, t["computed/money/EUR"].parts], [1000, [c3]]);
  assert.deepEqual(t["assessed/money/USD"].range, { low: 500, high: 700 }, "a value and a range add as a range");
  assert.deepEqual(t["assessed/money/USD"].parts.sort(), [a1, a2].sort());
  assert.deepEqual([t["assessed/count/null"].value, t["assessed/count/null"].parts.sort()], [35, [a3, other].sort()]);
  for (const x of r.totals) assert.match(x.says, /never added to parts in another state, unit or currency/);
  assert.deepEqual(r.undetermined, [u1]);
  assert.deepEqual(r.unproven.sort(), r.parts.map((p) => p.id).sort());
  /* One standard's parts only. */
  const one = w.c.consequencesOf({ determination: w.D, standard: S2, viewer: V("alice") });
  assert.deepEqual(one.parts.map((p) => p.id), [other]);
  /* No parts: an empty answer that says so; and an absent determination is refused. */
  const E = w.determination("CONF-2026-0002-empty", w.P, { [S]: "noncompliant" });
  assert.deepEqual([w.c.consequencesOf({ determination: E, viewer: V("alice") }).parts, w.c.consequencesOf({ determination: E, viewer: V("alice") }).says],
                   [[], "no consequence recorded"]);
  assert.equal(w.c.consequencesOf({ determination: "CONF-2026-0099-x", viewer: V("alice") }).reason, "NO_SUCH_DETERMINATION");
  /* A superseded determination's parts stay readable. */
  w.determinations.get(w.D).superseded_by = "CONF-2026-0003-next";
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: V("alice") }).parts.length, 8);
});

test("R8: a newer capture that does not carry an operand's passage flags the part basis_changed; nothing is recomputed", () => {
  const w = setup();
  const oldText = "Parks fund cut 1,000";
  const s1 = w.doc("INFO-2026-0001-a", "old capture of the budget");
  w.receipt(s1, "example.org/budget", { retrieved: "2026-09-01T00:00:00Z" });
  const cid = w.passage("INFO-2026-0001-a", s1, oldText);
  w.ex.units[s1] = { units: [{ extent: canonicalExtent({ kind: "pdf-page", page: 1 }), ref: "p2", text: oldText, truncated: false }],
                     state: "whole" };
  const id = w.part({ unit: "money", currency: "USD" }, { op: "sum", operands: [{ content: cid, figure: "1,000" }] });
  const clean = w.c.consequenceRead({ id, viewer: V("alice") }).part;
  assert.equal(clean.basis_changed, undefined, "no newer capture, no notice");
  /* A newer capture of the same address whose text no longer carries the passage. */
  const s2 = w.doc("INFO-2026-0002-a2", "new capture of the budget");
  w.receipt(s2, "example.org/budget", { retrieved: "2026-09-20T00:00:00Z" });
  w.ex.units[s2] = { units: [{ extent: canonicalExtent({ kind: "pdf-page", page: 1 }), ref: "p2",
                               text: "An entirely different page about zoning hearings", truncated: false }], state: "whole" };
  const flagged = w.c.consequenceRead({ id, viewer: V("alice") }).part;
  assert.deepEqual(flagged.basis_changed.map((c) => c.cause), ["newer_capture"]);
  assert.match(flagged.basis_changed[0].why, /does not carry its passage/);
  assert.deepEqual([flagged.state, flagged.measure.value], [clean.state, clean.measure.value], "nothing is recomputed");
  /* A newer capture that carries the passage unchanged raises nothing. */
  const w2 = setup();
  const t1 = w2.doc("INFO-2026-0001-a", "old");
  w2.receipt(t1, "example.org/budget", { retrieved: "2026-09-01T00:00:00Z" });
  const cid2 = w2.passage("INFO-2026-0001-a", t1, oldText);
  w2.ex.units[t1] = { units: [{ extent: canonicalExtent({ kind: "pdf-page", page: 1 }), ref: "p2", text: oldText, truncated: false }], state: "whole" };
  const id2 = w2.part({ unit: "money" }, { op: "sum", operands: [{ content: cid2, figure: "1,000" }] });
  const t2 = w2.doc("INFO-2026-0002-a2", "new");
  w2.receipt(t2, "example.org/budget", { retrieved: "2026-09-20T00:00:00Z" });
  w2.ex.units[t2] = { units: [{ extent: canonicalExtent({ kind: "pdf-page", page: 1 }), ref: "p2", text: oldText, truncated: false }], state: "whole" };
  assert.equal(w2.c.consequenceRead({ id: id2, viewer: V("alice") }).part.basis_changed, undefined);
});

test("R8: a causation inquiry reopened or superseded flags the part basis_changed, naming why; its causation stands as recorded", () => {
  const w = setup();
  const doc = "INFO-2026-0005-d";
  w.figure(doc, "Cut 1");
  w.inquiryAt(INQ, "open", { target: doc });
  w.inquiryAt(INQ, "concluded", { target: doc, prior: "open" });
  const id = w.part({ unit: "count", value: 3 }, { rationale: "r" }, { causation: INQ });
  assert.equal(w.c.consequenceRead({ id, viewer: V("alice") }).part.basis_changed, undefined);
  w.inquiryAt(INQ, "open", { target: doc, prior: "concluded" });
  const p = w.c.consequenceRead({ id, viewer: V("alice") }).part;
  assert.deepEqual(p.basis_changed.map((c) => c.cause), ["causation_reopened"]);
  assert.equal(p.causation.state, "established", "nothing moves until a member revises the part");
  /* Superseded. */
  const sup = new Map();
  const w2 = world({ superseded: sup });
  w2.D = w2.determination("CONF-2026-0001-act", w2.P, { [S]: "noncompliant" });
  w2.figure(doc, "Cut 1");
  w2.inquiryAt(INQ, "open", { target: doc });
  w2.inquiryAt(INQ, "concluded", { target: doc, prior: "open" });
  const r = w2.c.consequenceRecord({ determination: w2.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-02-01" }, measure: { unit: "count", value: 1 }, basis: { rationale: "r" },
    causation: INQ, author: V("alice") });
  sup.set(INQ, ["INQ-2026-0002-next"]);
  assert.deepEqual(w2.c.consequenceRead({ id: r.id, viewer: V("alice") }).part.basis_changed.map((c) => c.cause),
                   ["causation_superseded"]);
});
