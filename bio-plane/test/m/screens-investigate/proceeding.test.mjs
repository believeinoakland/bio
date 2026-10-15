/* screens-investigate R6: a court or regulatory proceeding, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, PROC, SHA, ACT, DATES, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/proceeding/" + PROC;
const sec = (p, key) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key));

test("R6 reads the proceeding (entity: its caption, court and neutral label), its parties by role (partiesof), its register as followed (follows, the newest new), and the orders held as obligations (dutiesof), each with its due date", async () => {
  const p = await open(at);
  assert.equal(p.byOp("entity")[0].query.id, PROC);
  assert.equal(p.byOp("partiesof")[0].query.proceeding, PROC);
  assert.ok(p.byOp("follows").length === 1);
  assert.deepEqual(p.byOp("dutiesof").map((r) => [r.query.entity, r.query.as]).sort(), [["ENT-2026-0102", "obligor"], ["ENT-2026-0103", "obligor"]]);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "the lease rent case");
  drew(m, "screen.proceeding.caption", { number: "RG26-114502", label: "the lease rent case" });
  const parties = sec(p, "screen.proceeding.parties");
  for (const [role, who] of [["petitioner", "ENT-2026-0102"], ["respondent", "ENT-2026-0103"]]) { drew(parties, "screen.proceeding.role", { role: word("screen.proceeding.roles." + role) }); assert.ok(parties.textContent.includes(who)); }
  const reg = sec(p, "screen.proceeding.register.head");
  drew(reg, "screen.proceeding.new");
  assert.ok(reg.textContent.includes("https://court.example/register/RG26"));
  drew(reg, "screen.proceeding.gated");
  const orders = sec(p, "screen.proceeding.orders");
  assert.ok(orders.textContent.includes("produce the 2024 rent schedules"));
  assert.ok(orders.querySelector(".cs-due").textContent.includes(dayOf("2026-10-30")));
  drew(orders, "screen.proceeding.facts");
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
  drew(sec(p, "screen.proceeding.register.head"), "screen.proceeding.login.note");
  fill(p, { "pr-register": "https://court.example/register/RG26", "pr-login-0": true });
  await press(p, "followregister");
  assert.deepEqual(p.byOp("followregister")[0].body, { address: "https://court.example/register/RG26", proceeding: PROC, gated: { kind: "account" } }, "R16: the screen's own entity id");
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
  assert.ok(sec(p, "screen.proceeding.parties").textContent.includes("A party is joined to a proceeding."), "the refusal by its words");
});

test("R16 Follow its register sends proceeding, the screen's own entity id, and the register list shows only the follows follows answers with that proceeding; control: a register followed from another proceeding's screen is not listed here", async () => {
  const p = await open(at, { plane: { followregister: ok({ ok: true }) } });
  const regs = sec(p, "screen.proceeding.register.head").textContent;
  assert.match(regs, /court\.example\/register\/RG26/);
  assert.doesNotMatch(regs, /register\/OTHER/, "another proceeding's register is not listed");
  fill(p, { "pr-register": "https://court.example/register/NEW" });
  await press(p, "followregister");
  assert.equal(p.byOp("followregister")[0].body.proceeding, PROC);
  assert.equal(p.byOp("follows").length >= 2, true, "the list is read again after");
  const q = await open(at, { plane: { follows: ok({ ok: true, items: [{ follow: 9, kind: "register", subject: { kind: "register", address: "https://court.example/register/ELSEWHERE", proceeding: "ENT-2026-0999" } }] }) } });
  assert.doesNotMatch(main(q).textContent, /ELSEWHERE/);
});

const lanes = (p) => Object.fromEntries(main(p).querySelectorAll("section[data-lane]").map((l) => [l.getAttribute("data-lane"), l]));

test("R28 Dates reads proceedingdates and draws today's stage and two lanes, the proceeding's own and our deadlines on it, never interleaved, each date by cs.date; nothing is drawn as late", async () => {
  const p = await open(at);
  assert.equal(p.byOp("proceedingdates")[0].query.proceeding, PROC);
  const dates = sec(p, "proceeding.dates.title");
  drew(dates, "proceeding.dates.stage", { stage: "Motions pending" });
  const l = lanes(p);
  assert.deepEqual(Object.keys(l).sort(), ["group", "proceeding"]);
  assert.equal(l.proceeding.querySelector("h2").textContent, word("proceeding.dates.lane.proceeding"));
  assert.equal(l.group.querySelector("h2").textContent, word("proceeding.dates.lane.group"));
  assert.ok(l.proceeding.textContent.includes(dayOf("2026-11-04")) && l.proceeding.textContent.includes("Hearing on the motion"));
  assert.ok(l.group.textContent.includes(dayOf("2026-10-14")) && l.group.textContent.includes("The City Clerk's reply"));
  assert.ok(!l.proceeding.textContent.includes("The City Clerk's reply") && !l.group.textContent.includes("Hearing on the motion"), "never interleaved");
  assert.ok(l.group.querySelector(`a.cs-ref[href*="${ACT}"]`) || l.group.querySelector(".cs-card"), "the action a reference");
  assert.equal(dates.querySelectorAll('[data-due="overdue"], [data-state="overdue"]').length, 0, "nothing is drawn as late");
  assert.ok(dates.querySelector("h2").getAttribute("data-tip").includes(word("proceeding.dates.help").split("'")[0]), "explained by its help");
});

test("R28 control: a body's own deadline is never in the group's lane; with no dates, proceeding.dates.none", async () => {
  const p = await open(at);
  const l = lanes(p);
  assert.ok(l.proceeding.textContent.includes("The body's own answer due"), "the body's own deadline is in the proceeding's lane");
  assert.ok(!l.group.textContent.includes("The body's own answer due"), "and never in the group's");
  const q = await open(at, { plane: { proceedingdates: ok(DATES({ lanes: { proceeding: { items: [], truncated: false, status: { stage: "undetermined", why: "no event" } }, group: { items: [], truncated: false } } })) } });
  drew(sec(q, "proceeding.dates.title"), "proceeding.dates.none");
  assert.equal(main(q).querySelectorAll("section[data-lane]").length, 0, "no lane is drawn over nothing");
  const r = await open(at, { plane: { proceedingdates: refusedIn("NOT_A_PROCEEDING", "That is not a proceeding.") } });
  assert.ok(sec(r, "proceeding.dates.title").querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});
