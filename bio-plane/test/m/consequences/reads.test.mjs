/* consequences R7, R8: what a determination's consequences are, totals kept within one state, unit and currency, what
   is not known in front of the member, and the notice when a part's basis changes. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";
import { noSuchDetermination } from "../../../src/conformance/index.mjs";

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
  assert.deepEqual(w.c.consequencesOf({ determination: "CONF-2026-0099-x", viewer: V("alice") }),
                   noSuchDetermination("CONF-2026-0099-x"));
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

/* R15 (K903 (4), DEC-36): inside a part the viewer may see, what the viewer may not see is withheld whole, as strength
   R6 withholds a member. Each test reads one part twice through `sighted`: as pat, from whom the named bundles are
   withheld, and as alice, who sees everything and is the negative control (today's answer, byte for byte). */
const PLACEHOLDER = "an object you may not see";
/* Whether an answer holds `s` anywhere but its `project`, whose id record-core mints with four digits drawn per run (its
   counter is hidden): a short figure such as "900" would otherwise be found there by chance (K1055). Nothing withheld
   can reach the project id, which is the determination's, so every other field, text and figure is still searched. */
const PER_RUN = "the project's id, minted per run";
const holds = (v, s) => JSON.stringify(v, (k, x) => (k === "project" && typeof x === "string" ? PER_RUN : x)).includes(s);

function r15() {
  const w = setup();
  w.both = (c, id) => [c.consequenceRead({ id, viewer: V("pat") }).part, c.consequenceRead({ id, viewer: V("alice") }).part];
  w.today = (id) => w.c.consequenceRead({ id, viewer: V("alice") }).part;
  return w;
}

test("R15: a computed part's operand whose content pat may not see leaves the operands; value, grade and the rest stand", () => {
  const w = r15();
  const HID = "INFO-2026-0002-hidden";
  const a = w.figure("INFO-2026-0001-seen", "Cut 1,000", "example.org/a", "direct");
  const h = w.figure(HID, "Cut 2,500", "example.org/h", "archive.org");
  /* The hidden operand is first and the weakest (C), so the grade sentence names its place and its content id. */
  const id = w.part({ unit: "money", currency: "USD" },
    { op: "sum", operands: [{ content: h, figure: "2,500" }, { content: a, figure: "1,000" }] });
  const c = w.sighted(new Set([HID]));
  const [pat, alice] = w.both(c, id);
  assert.deepEqual(pat.computation.operands.map((o) => o.content), [a], "one operand, no null in the other's place");
  assert.equal(pat.computation.operands.every((o) => o && o.content && !("says" in o)), true);
  assert.equal(pat.out_of_view, true);
  assert.equal(holds(pat, h), false, "the hidden content id is nowhere in the answer");
  assert.equal(holds(pat, PLACEHOLDER), false, "no placeholder");
  assert.deepEqual([pat.measure, pat.grade.grade, pat.grade.determined], [alice.measure, "C", true],
                   "the computed value and grade stand");
  assert.doesNotMatch(pat.grade.why, /operand (is )?\d/, "the weakest operand is not placed or named");
  assert.match(pat.grade.why, /capture grade is C/);
  const { computation: pc, grade: pg, out_of_view, ...patRest } = pat;
  const { computation: ac, grade: ag, ...aliceRest } = alice;
  assert.deepEqual(patRest, aliceRest, "every other fact the part records stands");
  /* Negative control: alice sees both operands, and the answer is today's, with no out_of_view key. */
  assert.deepEqual(alice, w.today(id));
  assert.equal("out_of_view" in alice, false);
  assert.deepEqual(alice.computation.operands.map((o) => o.content), [h, a]);
  assert.match(alice.grade.why, new RegExp(`the weakest operand is 0 \\(content ${h}\\)`));
  /* A visible weakest operand is renumbered among the operands answered. */
  const id2 = w.part({ unit: "money", currency: "USD" },
    { op: "sum", operands: [{ content: h, figure: "2,500" }, { content: w.figure("INFO-2026-0003-arch", "Cut 7", "example.org/c", "archive.org"), figure: "7" }] });
  const p2 = c.consequenceRead({ id: id2, viewer: V("pat") }).part;
  assert.equal(p2.computation.operands.length, 1);
  assert.equal(p2.grade.grade, "C");
  /* Ties keep the first, so the hidden operand 0 is the weakest named: pat reads the finding with no place. */
  assert.equal(holds(p2, h), false);
  /* consequencesOf: each part answers alike; the listing itself states no out_of_view (K905). */
  const of = c.consequencesOf({ determination: w.D, viewer: V("pat") });
  assert.deepEqual(of.parts.find((p) => p.id === id), pat);
  assert.equal("out_of_view" in of, false);
  assert.deepEqual(c.consequencesOf({ determination: w.D, viewer: V("alice") }),
                   w.c.consequencesOf({ determination: w.D, viewer: V("alice") }));
});

test("R15: an undetermined computation keeps its why without a withheld operand's place, figure or count", () => {
  const w = r15();
  const HID = "INFO-2026-0002-hidden";
  const a = w.figure("INFO-2026-0001-seen", "Cut 1,000");
  const h = w.figure(HID, "Cut 2,500");
  const c = w.sighted(new Set([HID]));
  /* The hidden operand lacks its figure: the sentence about it goes, R4's why stands. */
  const lacking = w.part({ unit: "money" }, { op: "difference", operands: [{ content: a, figure: "1,000" }, { content: h, figure: "900" }] });
  let [pat, alice] = w.both(c, lacking);
  assert.equal(alice.undetermined.why, 'the figure is not in the record: operand 1\'s passage does not hold the figure "900"');
  assert.deepEqual([pat.state, pat.undetermined.code, pat.undetermined.why], ["undetermined", "not_in_record", "the figure is not in the record"]);
  assert.deepEqual([pat.computation.operands.length, pat.out_of_view, holds(pat, "900"), holds(pat, h)], [1, true, false, false]);
  /* Negative controls: the withheld figure is found wherever the answer carries it, as alice's why does, or as an
     operand would; and a project id whose drawn digits hold it finds nothing (the chance collision, K1055). */
  assert.equal(holds(alice, "900"), true);
  assert.equal(holds({ ...pat, computation: { ...pat.computation, operands: [...pat.computation.operands, { figure: "900" }] } }, "900"), true);
  assert.equal(holds({ ...pat, project: "PROJ-2026-9001-budget-watch" }, "900"), false);
  assert.deepEqual(alice, w.today(lacking));
  assert.equal("out_of_view" in alice, false);
  /* A seen operand lacks its figure behind a withheld one: renumbered to its place among the operands answered. */
  const behind = w.part({ unit: "money" }, { op: "difference", operands: [{ content: h, figure: "2,500" }, { content: a, figure: "900" }] });
  [pat, alice] = w.both(c, behind);
  assert.equal(alice.undetermined.why, 'the figure is not in the record: operand 1\'s passage does not hold the figure "900"');
  assert.equal(pat.undetermined.why, 'the figure is not in the record: operand 0\'s passage does not hold the figure "900"');
  /* The arithmetic's own sentence counts the operands: it goes when one is withheld. */
  const short = w.part({ unit: "money" }, { op: "difference", operands: [{ content: h, figure: "2,500" }] });
  [pat, alice] = w.both(c, short);
  assert.match(alice.undetermined.why, /1 was given/);
  assert.deepEqual([pat.undetermined.why, pat.computation.operands, pat.out_of_view], ["the figure is not in the record", [], true]);
});

test("R15: an established causation whose inquiry pat may not see is {state} alone; reopened, it raises pat no cause", () => {
  const w = r15();
  const doc = "INFO-2026-0005-d";
  w.figure(doc, "Cut 1");
  w.inquiryAt(INQ, "open", { target: doc });
  w.inquiryAt(INQ, "concluded", { target: doc, prior: "open" });
  const id = w.part({ unit: "count", value: 3 }, { rationale: "r" }, { causation: INQ });
  const c = w.sighted(new Set([INQ]));
  let [pat, alice] = w.both(c, id);
  assert.deepEqual(pat.causation, { state: "established" }, "no inquiry, why or strength key");
  assert.equal(pat.out_of_view, true);
  assert.deepEqual([holds(pat, INQ), holds(pat, PLACEHOLDER), holds(pat, "could not be read for you")], [false, false, false]);
  const { causation: pk, out_of_view, ...patRest } = pat;
  const { causation: ak, ...aliceRest } = alice;
  assert.deepEqual(patRest, aliceRest, "every other fact stands");
  /* Negative control: alice is named the inquiry with its strength pair, as today, with no out_of_view key. */
  assert.deepEqual(alice, w.today(id));
  assert.equal("out_of_view" in alice, false);
  assert.deepEqual([alice.causation.state, alice.causation.inquiry, Object.keys(alice.causation.strength).sort()],
                   ["established", INQ, ["capture", "connection", "says", "testimony"]]);
  /* R8: the same causation reopened is alice's cause and never pat's. */
  w.inquiryAt(INQ, "open", { target: doc, prior: "concluded" });
  [pat, alice] = w.both(c, id);
  assert.deepEqual(alice.basis_changed.map((x) => x.cause), ["causation_reopened"]);
  assert.equal(pat.basis_changed, undefined);
  assert.deepEqual([pat.causation, pat.out_of_view], [{ state: "established" }, true]);
  /* And superseded: neither cause reaches pat. */
  const sup = new Map([[INQ, ["INQ-2026-0002-next"]]]);
  const w2 = world({ superseded: sup });
  w2.D = w2.determination("CONF-2026-0001-act", w2.P, { [S]: "noncompliant" });
  w2.figure(doc, "Cut 1");
  w2.inquiryAt(INQ, "open", { target: doc });
  const r = w2.c.consequenceRecord({ determination: w2.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-02-01" }, measure: { unit: "count", value: 1 }, basis: { rationale: "r" },
    causation: INQ, author: V("alice") });
  const c2 = w2.sighted(new Set([INQ]));
  assert.deepEqual(c2.consequenceRead({ id: r.id, viewer: V("alice") }).part.basis_changed.map((x) => x.cause), ["causation_superseded"]);
  const p2 = c2.consequenceRead({ id: r.id, viewer: V("pat") }).part;
  assert.deepEqual([p2.causation, p2.basis_changed, p2.out_of_view], [{ state: "unproven" }, undefined, true],
                   "an unproven causation keeps its state alone too");
});

test("R15: an assessed part's rests_on and an addressed record's evidence keep only the ids pat may see", () => {
  const w = r15();
  const HID = "INFO-2026-0002-hidden";
  const a = w.figure("INFO-2026-0001-seen", "Restored 1");
  const h = w.figure(HID, "Restored 2");
  const doc = "INFO-2026-0005-d";
  w.figure(doc, "Cut 1");
  w.inquiryAt(INQ, "open", { target: doc });
  const id = w.part({ unit: "count", value: 3 }, { rationale: "r", rests_on: [a, h, INQ] });
  assert.equal(w.c.addressedRecord({ id, state: "addressed", evidence: [h, a, INQ], reason: "restored", author: V("alice") }).ok, true);
  const c = w.sighted(new Set([HID, INQ]));
  const [pat, alice] = w.both(c, id);
  assert.deepEqual(pat.assessment.rests_on, [a]);
  assert.equal(pat.assessment.says, "a member's assessment, resting on the ids listed");
  assert.deepEqual(pat.addressed.evidence, [a]);
  assert.equal(pat.out_of_view, true);
  assert.deepEqual([holds(pat, h), holds(pat, INQ), holds(pat, PLACEHOLDER)], [false, false, false]);
  assert.deepEqual([pat.addressed.state, pat.addressed.reason, pat.addressed.by], ["addressed", "restored", V("alice")]);
  /* Negative control. */
  assert.deepEqual(alice, w.today(id));
  assert.equal("out_of_view" in alice, false);
  assert.deepEqual([alice.assessment.rests_on, alice.addressed.evidence], [[a, h, INQ], [h, a, INQ]]);
  /* Every id withheld: the sentence is chosen on the list as answered. */
  const all = w.part({ unit: "count", value: 1 }, { rationale: "r", rests_on: [h] });
  const p = c.consequenceRead({ id: all, viewer: V("pat") }).part;
  assert.deepEqual([p.assessment.rests_on, p.assessment.says, p.out_of_view],
                   [[], "a member's assessment, resting on nothing in the record (stated as none)", true]);
  /* addressed() states no ids, so it answers pat as alice (K905: a listing states no out_of_view). */
  assert.deepEqual(c.addressed({ determination: w.D, viewer: V("pat") }), c.addressed({ determination: w.D, viewer: V("alice") }));
});

test("R15 R8: a newer capture of a withheld operand's document raises pat no cause; a seen operand's is renumbered", () => {
  const w = r15();
  const oldText = "Parks fund cut 1,000";
  const unit = (text) => ({ units: [{ extent: canonicalExtent({ kind: "pdf-page", page: 1 }), ref: "p2", text, truncated: false }], state: "whole" });
  const operand = (doc, addr) => {
    const s = w.doc(doc, `old capture of ${doc}`);
    w.receipt(s, addr, { retrieved: "2026-09-01T00:00:00Z" });
    w.ex.units[s] = unit(oldText);
    return w.passage(doc, s, oldText);
  };
  const HID = "INFO-2026-0001-hidden";
  const h = operand(HID, "example.org/h");
  const v = operand("INFO-2026-0002-seen", "example.org/v");
  const id = w.part({ unit: "money" }, { op: "sum", operands: [{ content: h, figure: "1,000" }, { content: v, figure: "1,000" }] });
  for (const [doc, addr] of [["INFO-2026-0003-h2", "example.org/h"], ["INFO-2026-0004-v2", "example.org/v"]]) {
    const s = w.doc(doc, `new capture of ${doc}`);
    w.receipt(s, addr, { retrieved: "2026-09-20T00:00:00Z" });
    w.ex.units[s] = unit("An entirely different page about zoning hearings");
  }
  const c = w.sighted(new Set([HID]));
  const [pat, alice] = w.both(c, id);
  assert.deepEqual(alice.basis_changed.map((x) => [x.cause, x.operand]), [["newer_capture", 0], ["newer_capture", 1]]);
  assert.deepEqual(alice, w.today(id));
  assert.equal("out_of_view" in alice, false);
  assert.deepEqual(pat.basis_changed.map((x) => [x.cause, x.operand]), [["newer_capture", 0]], "the seen operand, at its place");
  assert.match(pat.basis_changed[0].why, /operand 0's document/);
  assert.deepEqual([pat.computation.operands.map((o) => o.content), pat.out_of_view, holds(pat, h)], [[v], true, false]);
});

test("R13 R14: a part's CONS- object belongs to its determination's project, so it is fenced as the part's reads are", () => {
  const w = r15();
  const id = w.part({ unit: "count", value: 2 }, { rationale: "r" });
  assert.equal(w.record.bundleInfo(id).project, w.P);
  assert.match(w.record.readFile(id, "bundle.md").text, new RegExp(`^project: "${w.P}"$`, "m"));
  assert.deepEqual([V("alice"), V("pat"), V("carol"), V("bob")].map((v) => w.membership.inSight(id, v)), [true, true, true, false],
                   "bob, outside P, is answered as for the part (NO_SUCH_PART), never shown the object");
  assert.equal(w.c.consequenceRead({ id, viewer: V("bob") }).reason, "NO_SUCH_PART");
});
