/* screens-investigate R6: a court or regulatory proceeding, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, PROC, SHA } from "./fixtures.mjs";

const at = "/app/proceeding/" + PROC;
const sec = (p, h) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === h);

test("R6 reads the proceeding (entity: its caption, court and neutral label), its parties by role (partiesof), its register as followed (follows, the newest new), and the orders held as obligations (dutiesof), each with its due date", async () => {
  const p = await open(at);
  assert.equal(p.byOp("entity")[0].query.id, PROC);
  assert.equal(p.byOp("partiesof")[0].query.proceeding, PROC);
  assert.ok(p.byOp("follows").length === 1);
  assert.deepEqual(p.byOp("dutiesof").map((r) => [r.query.entity, r.query.as]).sort(), [["ENT-2026-0102", "obligor"], ["ENT-2026-0103", "obligor"]]);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "the lease rent case");
  assert.match(m.textContent, /No\. RG26-114502 · a neutral label: "the lease rent case"/);
  assert.match(sec(p, "Parties").textContent, /Petitioner.*ENT-2026-0102.*Respondent.*ENT-2026-0103/s);
  assert.match(sec(p, "The register").textContent, /New.*https:\/\/court\.example\/register\/RG26.*needs a login/s);
  const orders = sec(p, "Orders, held as obligations");
  assert.match(orders.textContent, /produce the 2024 rent schedules/);
  assert.match(orders.querySelector(".cs-due").textContent, /30 October 2026/);
  assert.match(orders.textContent, /facts, never advice on what to file/);
});

test("R6 entitycreate \"Register the proceeding\" from its caption: court, number, a neutral label, the member's note; then it opens", async () => {
  const p = await open("/app/proceeding", { plane: { entitycreate: ok({ ok: true, entity_id: "ENT-2026-0200", kind: "proceeding" }) } });
  assert.deepEqual(actsIn(main(p)), ["entitycreate"]);
  fill(p, { "pr-forum": "ENT-2026-0101", "pr-number": "RG26-114502", "pr-kind": "civil", "pr-label": "the lease rent case", "pr-note": "From the court's caption, captured 1 October" });
  await press(p, "entitycreate");
  assert.deepEqual(p.byOp("entitycreate")[0].body, { kind: "proceeding", note: "From the court's caption, captured 1 October", proceeding: { forum: "ENT-2026-0101", kind: "civil", number: "RG26-114502" }, label: "the lease rent case", aliases: ["the lease rent case"] });
  assert.equal(p.location.pathname, "/app/proceeding/ENT-2026-0200");
});

test("R6 recordline \"Add a party by role\"; followregister (a register needing a login says filings come only by capture); declare \"Hold an order as obligations\"; courtlink", async () => {
  const p = await open(at, { plane: { recordline: ok({ ok: true }), followregister: ok({ ok: true }), declare: ok({ ok: true }), courtlink: ok({ ok: true }) } });
  fill(p, { "pr-party": "ENT-2026-0104", "pr-role": "intervenor", "pr-sha": SHA, "pr-page": "1" });
  await press(p, "recordline");
  assert.deepEqual(p.byOp("recordline")[0].body, { kind: "party_to", from: "ENT-2026-0104", to: PROC, role: "intervenor", basis: { captureSha: SHA, extent: { kind: "pdf-page", page: 0 } } });
  assert.match(sec(p, "The register").textContent, /new filings come only by a member's own capture/);
  fill(p, { "pr-register": "https://court.example/register/RG26", "pr-login-0": true });
  await press(p, "followregister");
  assert.deepEqual(p.byOp("followregister")[0].body, { address: "https://court.example/register/RG26", gated: { kind: "account" } });
  fill(p, { "pr-obligor": "ENT-2026-0103", "pr-act": "produce the 2024 rent schedules", "pr-clause": "Order ¶3", "pr-due": "2026-10-30" });
  await press(p, "declare");
  assert.deepEqual(p.byOp("declare")[0].body, { modality: "duty", obligor: "ENT-2026-0103", performance: { act: "produce the 2024 rent schedules" }, source: { kind: "court" }, clause: "Order ¶3", arising_in: PROC,
    trigger: { kind: "date", date: "2026-10-30" }, time: { basis: "window", date: "2026-10-30" } });
  fill(p, { "pr-court": "STD-2026-0010-court", "pr-law": "STD-2026-0001-ordinance", "pr-citation": "CNT-2026-0020", "pr-type": "interprets" });
  await press(p, "courtlink", { reason: "the order reads the ordinance's §4" });
  assert.deepEqual(p.byOp("courtlink")[0].body, { type: "interprets", from: "STD-2026-0010-court", to: "STD-2026-0001-ordinance", citation: "CNT-2026-0020", reason: "the order reads the ordinance's §4" });
});

test("R6 each act names what it needs (control: nothing sent), and a refusal is drawn beside the act", async () => {
  const p = await open(at, { plane: { recordline: refusedIn("PROCEEDING_ENDS", "A party is joined to a proceeding.") } });
  for (const op of ["recordline", "followregister", "declare"]) { await press(p, op); assert.equal(p.byOp(op).length, 0, op); }
  fill(p, { "pr-party": "ENT-2026-0104", "pr-sha": SHA });
  await press(p, "recordline");
  assert.match(sec(p, "Parties").textContent, /A party is joined to a proceeding\./);
});
