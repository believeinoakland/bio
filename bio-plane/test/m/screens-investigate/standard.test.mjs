/* screens-investigate R8: a standard the city set itself, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, STD, P, STD_PROPOSALS, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/standard/" + STD;
const reachable = (o = {}) => ({ boot: { plane: { ...plane(o), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } } });

test("R8 reads the standard (its words as written, its source passage, its issuer, kind, when in force) and its relations to laws", async () => {
  const p = await open(at);
  assert.equal(p.byOp("standard")[0].query.id, STD);
  assert.equal(p.byOp("lawrelations")[0].query.id, STD);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Administrative Instruction 4.12, §3");
  drew(m, "screen.standard.sub", { kind: word("screen.standard.kind.policy"), issuer: "Public Works" });
  drew(m, "screen.standard.inforce.since", { from: dayOf("2023-01-01") });
  assert.match(m.querySelector("blockquote").textContent, /within seven calendar days of the report/);
  drew(m, "screen.standard.rel.implements");
  assert.ok(m.textContent.includes("STD-2026-0001-ordinance"));
});

const proj = "/app/standard/" + P;

test("R19 the project's proposals are read from standardproposals (the project, state open by default), each under its state with its label, why and what became of it, each \"not a standard until a member adopts it\"; adopted and all are choices; control: a proposal of another project is not listed", async () => {
  const p = await open(proj);
  const r = p.byOp("standardproposals");
  assert.deepEqual([r.length, r[0].query.project, r[0].query.state], [1, P, "open"]);
  const sec = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  for (const t of ["90% of potholes filled within 72 hours", "Proposed by the assistant: machine work", "the department's own goal"]) assert.ok(sec.textContent.includes(t), t);
  drew(sec, "screen.standard.notyet");
  assert.ok(sec.querySelector('.cs-origin[data-origin="machine"]'), "machine work is marked");
  assert.ok(!sec.textContent.includes("Repair crews log each pothole"), "the adopted one is not under open");
  assert.ok(button(p, "standardadopt", sec), "an open one can be adopted");
  const choices = sec.querySelectorAll("a.cs-btn").map((a) => a.getAttribute("href"));
  assert.deepEqual(choices, [proj, proj + "/adopted", proj + "/all"]);
  const q = await open(proj + "/adopted");
  assert.equal(q.byOp("standardproposals")[0].query.state, "adopted");
  const s2 = main(q).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.standard.proposals"));
  assert.ok(s2.textContent.includes("Repair crews log each pothole"));
  drew(s2, "screen.standard.adopted", { by: "dev", date: dayOf("2026-10-06") });
  assert.equal(button(q, "standardadopt"), null, "an adopted one is not adopted again");
  const all = await open(proj + "/all");
  assert.equal(all.byOp("standardproposals")[0].query.state, "all");
  const other = await open(proj, { plane: { standardproposals: ok({ ok: true, project: P, state: "open", items: [], truncated: false }) } });
  assert.ok(!main(other).textContent.includes("90% of potholes"), "a proposal the read does not answer for this project is not listed");
});

test("R19 the section is drawn whether or not the assistant is reachable; truncated is said", async () => {
  const p = await open(proj, { plane: { standardproposals: ok({ ...STD_PROPOSALS({ project: P }), truncated: true }) } });
  assert.ok(main(p).textContent.includes("90% of potholes filled within 72 hours"));
  drew(main(p), "screen.standard.proposals.more");
  assert.equal(p.byOp("proposals").length, 0, "the old assistant-only read is gone");
});

test("R8 standarddeclare \"Hold this as a standard\" from a passage; standardadopt by the member's own act; lawrelate \"Relate to a law\"", async () => {
  const p = await open(at, reachable({ plane: { standarddeclare: ok({ ok: true, id: "STD-2026-0009-policy" }), standardadopt: ok({ ok: true, id: "STD-2026-0010-policy" }), lawrelate: ok({ ok: true }) } }));
  fill(p, { "st-type": "implements", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "§3 carries out the ordinance's §2" });
  assert.deepEqual(p.byOp("lawrelate")[0].body, { type: "implements", from: STD, to: "STD-2026-0001-ordinance", citation: "CNT-2026-0001", reason: "§3 carries out the ordinance's §2" });
  const q = await open(proj, { plane: { standardadopt: ok({ ok: true, id: "STD-2026-0010-policy" }) } });
  await press(q, "standardadopt", { reason: "the budget's own target" });
  assert.deepEqual(q.byOp("standardadopt")[0].body, { proposal: "STDP-2026-0001", reason: "the budget's own target" });
  assert.equal(q.location.pathname, "/app/standard/STD-2026-0010-policy");
  fill(p, { "st-cite": "Budget 2026, performance target 4", "st-kind": "commitment", "st-issuer": "City Council", "st-text": "CNT-2026-0030, CNT-2026-0031", "st-from": "2026-07-01" });
  await press(p, "standarddeclare", { reason: "the council adopted it" });
  assert.deepEqual(p.byOp("standarddeclare")[0].body, { cite: "Budget 2026, performance target 4", kind: "commitment", issuer: "City Council", text: ["CNT-2026-0030", "CNT-2026-0031"], period: { from: "2026-07-01", to: null }, reason: "the council adopted it" });
});

test("R8 an amendment needs the day it takes effect (control: nothing sent)", async () => {
  const p = await open(at);
  fill(p, { "st-type": "amends", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "x" });
  assert.equal(p.byOp("lawrelate").length, 0);
  drew(main(p), "screen.standard.relate.effective");
});
