/* screens-investigate R3: a project's timeline, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, TIMELINE, P, ENT, ORG, SHA } from "./fixtures.mjs";

const at = "/app/timeline/" + P;

test("R3 reads timeline over the project's set (the people and events its document cites), and each event for who took part and its grade", async () => {
  const p = await open(at);
  assert.equal(p.byOp("image")[0].query.id, P);
  assert.equal(p.byOp("timeline")[0].query.set, ENT);
  assert.deepEqual(p.byOp("event").map((r) => r.query.id).sort(), ["EVT-2026-0001", "EVT-2026-0002"]);
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Projects.*Pothole repairs.*Timeline/);
});

test("R3 two lanes, \"What they did\" and \"What we did\"; each event with its date as precise as its source states it, who decided or took part, and its grade", async () => {
  const p = await open(at);
  const world = main(p).querySelector('[data-lane="world"]'), ours = main(p).querySelector('[data-lane="ours"]');
  assert.equal(world.querySelector("h2").textContent, "What they did");
  assert.equal(ours.querySelector("h2").textContent, "What we did");
  const evs = world.querySelectorAll("[data-event]");
  assert.match(evs[0].querySelector(".mk-date").textContent, /^12 January 2024$/);
  assert.match(evs[1].querySelector(".mk-date").textContent, /^March 2024 \(month known\)$/);
  assert.match(evs[0].textContent, /decider:/);
  assert.equal(evs[0].querySelector(".cs-grade").textContent, "CaptureB");
  assert.match(ours.textContent, /We requested the rent schedules/);
  assert.doesNotMatch(world.textContent, /We requested/, "never mixed");
});

test("R3 an event whose order is undetermined is drawn so, with the evidence that would order it, never guessed into order; undated events are listed apart", async () => {
  const p = await open(at);
  const ev = main(p).querySelector('[data-event="EVT-2026-0002"]');
  assert.ok(ev.querySelector('.cs-gap[data-gap="undetermined"]'));
  assert.match(ev.textContent, /EVT-2026-0003 is undetermined/);
  assert.match(ev.textContent, /a passage that gives either one its day, or a source that says which came first/);
  assert.deepEqual(actsIn(ev).sort(), ["findin", "recorddatedfact", "relate"]);
  assert.equal(main(p).querySelector('[data-event="EVT-2026-0001"] .cs-gap[data-gap="undetermined"]'), null, "an ordered event carries no such mark (control)");
  const undated = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === "Undated");
  assert.match(undated.textContent, /listed apart, never guessed into place/);
  assert.equal(main(p).querySelector('[data-lane="world"]').textContent.includes("EVT-2026-0009"), false);
});

test("R3 createevent from a passage; addparticipant; relate \"Link events\" and \"Cite which came first\"; recorddatedfact (a day or a month); each read again after", async () => {
  const p = await open(at, { plane: { createevent: ok({ ok: true, event_id: "EVT-2026-0050", attestation_ids: [9] }), addparticipant: ok({ ok: true }), relate: ok({ ok: true }), recorddatedfact: ok({ ok: true }) } });
  fill(p, { "tl-sha": SHA, "tl-page": "3", "tl-kind": "vote" });
  await press(p, "createevent", { reason: "the minutes record the vote" });
  assert.deepEqual(p.byOp("createevent")[0].body, { kind: "vote", attestations: [{ captureSha: SHA, extent: { kind: "pdf-page", page: 2 } }], concerns: [ENT], reason: "the minutes record the vote" });
  assert.equal(p.byOp("timeline").at(-1).query.set, ENT + ",EVT-2026-0050", "the new event joins the set and the timeline is read again");
  fill(p, { "tl-sha": SHA, "tl-page": "3", "tl-event": "EVT-2026-0001", "tl-who": ORG, "tl-role": "voted", "tl-vote": "yes" });
  await press(p, "addparticipant", { reason: "the roll call" });
  assert.deepEqual(p.byOp("addparticipant")[0].body, { eventId: "EVT-2026-0001", entityId: ORG, role: "voted", attestation: { captureSha: SHA, extent: { kind: "pdf-page", page: 2 } }, voteValue: "yes", reason: "the roll call" });
  fill(p, { "tl-sha": SHA, "tl-page": "3", "tl-event": "EVT-2026-0001", "tl-to": "EVT-2026-0002", "tl-rel": "authorises" });
  const link = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.textContent.startsWith("Link events"));
  await press(p, "relate", { el: link });
  assert.deepEqual(p.byOp("relate")[0].body, { from: "EVT-2026-0001", to: "EVT-2026-0002", kind: "authorises", attestation: { captureSha: SHA, extent: { kind: "pdf-page", page: 2 } } });
  const first = main(p).querySelectorAll('button[data-act="relate"]').find((b) => b.textContent.startsWith("Cite which came first"));
  fill(p, { "tl-sha": SHA, "tl-to": "EVT-2026-0001" });
  await press(p, "relate", { el: first });
  assert.equal(p.byOp("relate")[1].body.from, "EVT-2026-0002", "from the undetermined event");
  fill(p, { "tl-sha": SHA, "tl-page": "", "tl-date": "2024-03", "tl-datekind": "signed" });
  await press(p, "recorddatedfact");
  assert.deepEqual(p.byOp("recorddatedfact")[0].body, { captureSha: SHA, extent: { kind: "document" }, kind: "signed", value: { value: "2024-03", precision: "edtf" }, method: "a member's reading of the passage" });
});

test("R3 each act names its passage (control: none sends nothing)", async () => {
  const p = await open(at);
  for (const op of ["createevent", "addparticipant", "recorddatedfact"]) {
    await press(p, op, { el: main(p).querySelectorAll(`button[data-act="${op}"]`).at(-1), reason: "x" });
    assert.equal(p.byOp(op).length, 0, op);
  }
});

test("R3 hypothesishold keeps a suspected cause as a hunch beside one of the project's questions, never evidence; findin opens find-in over the project", async () => {
  const p = await open(at, { plane: { hypothesishold: ok({ ok: true, hypothesis_id: "HYP-1", label: "hypothesis" }) } });
  fill(p, { "tl-question": "INQ-2026-0001-seven-days", "tl-hunch": "The adjustment answered the notice", "tl-event": "EVT-2026-0002", "tl-to": "EVT-2026-0001" });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: "INQ-2026-0001-seven-days", statement: "The adjustment answered the notice", kind: "cause", about: { from: "EVT-2026-0002", to: "EVT-2026-0001" } });
  assert.match(main(p).textContent, /never evidence/);
  await press(p, "findin", { el: main(p).querySelectorAll('button[data-act="findin"]').at(-1) });
  assert.equal(p.location.pathname, "/app/find-in/" + P);
});

test("R3 a project whose document cites no one has no set: said so, and timeline is not read (control)", async () => {
  const md = "---\nid: " + P + "\ntitle: \"Empty\"\nreferences: []\n---\n";
  const p = await open(at, { plane: { image: ok({ "bundle.md": md }) } });
  assert.equal(p.byOp("timeline").length, 0);
  assert.match(main(p).textContent, /names no person, organisation or event yet/);
});
