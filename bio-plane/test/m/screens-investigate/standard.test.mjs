/* screens-investigate R8: a standard the city set itself, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, plane, STD } from "./fixtures.mjs";

const at = "/app/standard/" + STD;
const reachable = (o = {}) => ({ boot: { plane: { ...plane(o), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } } });

test("R8 reads the standard (its words as written, its source passage, its issuer, kind, when in force) and its relations to laws", async () => {
  const p = await open(at);
  assert.equal(p.byOp("standard")[0].query.id, STD);
  assert.equal(p.byOp("lawrelations")[0].query.id, STD);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Administrative Instruction 4.12, §3");
  assert.match(m.textContent, /Policy · Public Works · in force since 1 January 2023/);
  assert.match(m.querySelector("blockquote").textContent, /within seven calendar days of the report/);
  assert.match(m.textContent, /Implements.*STD-2026-0001-ordinance/s);
});

test("R8 the proposals only while the assistant is reachable, each labelled machine work, not a standard until a member adopts it (control: not reachable, not read, not drawn)", async () => {
  const p = await open(at);
  assert.equal(p.byOp("proposals").length, 0);
  assert.equal(button(p, "standardadopt"), null);
  const props = ok({ ok: true, proposals: [{ proposal_id: "STDP-2026-0001", cite: "90% of potholes filled within 72 hours" }] });
  const q = await open(at, reachable({ plane: { proposals: props } }));
  assert.equal(q.byOp("proposals").length, 1);
  const s = main(q).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === "Proposed by the assistant");
  assert.match(s.textContent, /90% of potholes filled within 72 hours · not a standard until a member adopts it/);
  assert.ok(s.querySelector('.cs-origin[data-origin="machine"]'));
});

test("R8 standarddeclare \"Hold this as a standard\" from a passage; standardadopt by the member's own act; lawrelate \"Relate to a law\"", async () => {
  const p = await open(at, reachable({ plane: { standarddeclare: ok({ ok: true, id: "STD-2026-0009-policy" }), standardadopt: ok({ ok: true, id: "STD-2026-0010-policy" }), lawrelate: ok({ ok: true }) } }));
  fill(p, { "st-type": "implements", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "§3 carries out the ordinance's §2" });
  assert.deepEqual(p.byOp("lawrelate")[0].body, { type: "implements", from: STD, to: "STD-2026-0001-ordinance", citation: "CNT-2026-0001", reason: "§3 carries out the ordinance's §2" });
  fill(p, { "st-proposal": "STDP-2026-0001" });
  await press(p, "standardadopt", { reason: "the budget's own target" });
  assert.deepEqual(p.byOp("standardadopt")[0].body, { proposal: "STDP-2026-0001", reason: "the budget's own target" });
  fill(p, { "st-cite": "Budget 2026, performance target 4", "st-kind": "commitment", "st-issuer": "City Council", "st-text": "CNT-2026-0030, CNT-2026-0031", "st-from": "2026-07-01" });
  await press(p, "standarddeclare", { reason: "the council adopted it" });
  assert.deepEqual(p.byOp("standarddeclare")[0].body, { cite: "Budget 2026, performance target 4", kind: "commitment", issuer: "City Council", text: ["CNT-2026-0030", "CNT-2026-0031"], period: { from: "2026-07-01", to: null }, reason: "the council adopted it" });
});

test("R8 an amendment needs the day it takes effect (control: nothing sent)", async () => {
  const p = await open(at);
  fill(p, { "st-type": "amends", "st-to": "STD-2026-0001-ordinance", "st-citation": "CNT-2026-0001" });
  await press(p, "lawrelate", { reason: "x" });
  assert.equal(p.byOp("lawrelate").length, 0);
  assert.match(main(p).textContent, /needs the day it takes effect/);
});
