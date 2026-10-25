/* screens-action, fix round 10 (diagnosis 11 §4 and §6; K5148; R50, R6): the matter's consequence parts as `consequences` answers them (its own
   published fixture world, never a hand-written part), and a part recorded as not assessed revised from the page. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, text, press, last, ok, choose, W, DATA_PLANE, DETERMINATION, QUESTION } from "./page.mjs";
import { world as consWorld, V as CV } from "../consequences/fixture.mjs";

const S = "STD-2026-0001-law";
const ALICE = CV("alice");

function setup() {
  const w = consWorld();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.base = { determination: w.D, standard: S, affected: { kind: "service", description: "library hours" }, measure: { unit: "time", range: { low: "10", high: "20" } },
    period: { from: "2026-01-01", to: "2026-03-31" }, author: ALICE };
  return w;
}
/** The plane of the matter page over the real `consequences`: `consequencesof` and `consequencerevise` answered by its owner as the door calls it. */
function plane(w) {
  return { ...DATA_PLANE,
    determination: ok({ ...DETERMINATION, id: w.D, project: w.P, standards: [{ standard: S, outcome: "noncompliant", in_force: true, rows: [{ requires: "a", did: "b" }] }] }),
    consequencesof: () => ok(w.c.consequencesOf({ determination: w.D, viewer: ALICE })),
    consequencerevise: (req) => ok(w.c.consequenceRevise({ ...req.body, author: ALICE, viewer: ALICE })) };
}

test("R50 (diagnosis 11 §4): a part recorded as not assessed is revised from the page to assessed, the page sending how it is known; control: a revise that changes neither sends neither", async () => {
  const w = setup();
  const rec = w.c.consequenceRecord({ ...w.base, measure: null, basis: { why: "not_assessed" } });
  assert.equal(rec.ok, true, JSON.stringify(rec));
  const p = await open(`/app/matter/${w.D}`, plane(w));
  assert.ok(text(p).includes(W("screen.matter.known.undetermined")), "drawn as not known");
  await choose(p, "mt-mode", "consequencerevise");
  assert.ok(p.doc.getElementById("mt-r-basis"), "the how-it-is-known choice is offered on the revise form, as on the record form");
  assert.ok(p.doc.getElementById("mt-r-cause"), "and the question");
  await press(p, "consequencerevise", { values: { "mt-r-part": rec.part.id, "mt-r-amt": "10 to 20", "mt-r-basis-1": true, "mt-r-rat": "the schedule shows fewer hours", "mt-r-why": "now assessed" } });
  const b = last(p, "consequencerevise").body;
  assert.deepEqual(b.basis, { rationale: "the schedule shows fewer hours", rests_on: [] });
  const now = w.c.consequencesOf({ determination: w.D, viewer: ALICE });
  const live = now.parts.filter((x) => !x.superseded_by);
  assert.deepEqual(live.map((x) => x.state), ["assessed"], "the part the plane holds is assessed");
  // control: a revise of the amount alone keeps the basis (nothing about it is sent)
  const q = setup();
  const r2 = q.c.consequenceRecord({ ...q.base, measure: null, basis: { why: "not_assessed" } });
  const pq = await open(`/app/matter/${q.D}`, plane(q));
  await choose(pq, "mt-mode", "consequencerevise");
  await press(pq, "consequencerevise", { values: { "mt-r-part": r2.part.id, "mt-r-desc": "library hours, all branches", "mt-r-why": "named" } });
  assert.ok(!("basis" in last(pq, "consequencerevise").body) && !("causation" in last(pq, "consequencerevise").body));
});

test("R50 (diagnosis 11 §4): the question the harm follows from is sent when she chooses one", async () => {
  const w = setup();
  const rec = w.c.consequenceRecord({ ...w.base, basis: { rationale: "r", rests_on: [] } });
  const p = await open(`/app/matter/${w.D}`, plane(w));
  await choose(p, "mt-mode", "consequencerevise");
  await press(p, "consequencerevise", { values: { "mt-r-part": rec.part.id, "mt-r-cause": QUESTION, "mt-r-why": "the question names it" } });
  assert.equal(last(p, "consequencerevise").body.causation, QUESTION);
});

test("R6 (diagnosis 11 §6): a part is drawn by what its label says and its causation not yet established, never as an object", async () => {
  const w = setup();
  w.c.consequenceRecord({ ...w.base, basis: { rationale: "the schedule shows fewer hours", rests_on: [] } });
  const part = w.c.consequencesOf({ determination: w.D, viewer: ALICE }).parts[0];
  assert.equal(typeof part.label, "object", "the owner's label is an object");
  const p = await open(`/app/matter/${w.D}`, plane(w));
  const t = text(p);
  assert.ok(!t.includes("[object Object]"));
  assert.ok(t.includes(part.label.says), "the label's own sentence");
  assert.equal(part.causation.state, "unproven");
  assert.ok(t.includes(part.causation.why), "the causation not established says why, so the member sees it before an escalation is refused for it");
  assert.ok(t.includes(W("screen.matter.known.assessed")));
});
