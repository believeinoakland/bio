/* screens-action T51 fix round 10 (R57; K5284; walk E H1/H3): an office a member names from the Request screen is recorded with the body that holds it,
   so the real `actions` answers it as named (`actions` R111) and it is offered and chosen in the same visit. Real worlds (`entities`, `lines`, `actions`);
   every sentence is asserted by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { actionWorld, openIn, entityOf, answerOf } from "./world-C.mjs";
import { text, press, last, W, beside } from "./page.mjs";

const until = async (p, f, what) => { for (let i = 0; i < 40; i++) { const v = f(); if (v) return v; await p.settle(); } throw new Error("waited for " + what); };
const optionTexts = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent.trim());

test("R57 (walk E H1/H3): an office named from Request with its body is recorded with that body, answered as named by the real `actions`, offered and chosen in the same visit, and the request is started to it", async () => {
  const { world, me, project } = await actionWorld();
  const body = await entityOf(me, "body", "City of Port Ellery");
  const p = await openIn(world, me, `/app/request/${project}`);
  // she asks about the body; the record holds no office in it, so she names one: the body is chosen among the team's bodies, each by its label
  await press(p, "addresseesuggest", { values: { "req-subject": body } });
  await until(p, () => p.doc.getElementById("req-noff-body"), "the fold that names an office");
  assert.deepEqual(optionTexts(p, "req-noff-body").filter(Boolean), ["City of Port Ellery"]);
  await press(p, "entitycreate", { values: { "req-noff-name": "Records Office", "req-noff-body": body, "req-noff-since": "2000-01-01", "req-noff-until": "2099-12-31", "req-noff-note": "It keeps the city's records." } });
  await until(p, () => p.doc.getElementById("req-office"), "the office she named to be chosen");
  const office = (await me.read("entitieskind", { query: { kind: "office", limit: "200" } })).entities.find((e) => e.label === "Records Office").entity_id;
  // the record holds the office as a post in that body, on her word
  const lines = (await me.read("linesof", { query: { entity: office, kinds: "post_in", direction: "from", limit: "20" } })).lines;
  assert.deepEqual(lines.map((l) => l.to), [body], "one post_in line, to the body she chose");
  // the owner's own answer for the office is the office as named, with its body
  const real = await answerOf(world, me, "addresseesuggest", { query: { subject: office } });
  assert.equal(real.result.offices.length, 1, "named at once, not undetermined");
  assert.deepEqual({ role: real.result.offices[0].addressee.role, body: real.result.offices[0].addressee.body, entity_id: real.result.offices[0].addressee.entity_id },
    { role: "Records Office", body: "City of Port Ellery", entity_id: office });
  assert.equal((real.result.undetermined || []).length, 0);
  assert.deepEqual(optionTexts(p, "req-office").length, 1, "offered in this visit");
  // chosen: the request is started to the office
  await press(p, "actioncreate", { values: { "req-what": "The council's minutes", "req-office": "0" }, reason: "start" });
  await until(p, () => /ACTN-/.test(p.location.pathname), "the started request's page");
  // naming it again does not record a second body line (the plane would then answer it undetermined)
  const q = await openIn(world, me, `/app/request/${project}`);
  assert.ok(q.doc.getElementById("req-subject"), "on the next visit the office is offered by name");
  const again = (await me.read("linesof", { query: { entity: office, kinds: "post_in", direction: "from", limit: "20" } })).lines;
  assert.equal(again.length, 1);
});

test("R57: control: an office named with no body is refused naming the field, and nothing is sent or recorded", async () => {
  const { world, me, project } = await actionWorld();
  const body = await entityOf(me, "body", "City of Port Ellery");
  const p = await openIn(world, me, `/app/request/${project}`);
  await press(p, "addresseesuggest", { values: { "req-subject": body } });
  await until(p, () => p.doc.getElementById("req-noff-name"), "the fold that names an office");
  const b = await press(p, "entitycreate", { values: { "req-noff-name": "Records Office", "req-noff-note": "It keeps the city's records." } });
  assert.equal(p.byOp("entitycreate").length, 0, "nothing is sent");
  assert.ok(beside(p, b).includes(W("findin.fieldneeded", { field: W("screen.matter.f.body") })), "the field is named");
  assert.equal((await me.read("entitieskind", { query: { kind: "office", limit: "200" } })).entities.length, 0, "no office was registered");
});

test("R57: an office named with its body but no day stated is registered and its body recorded, the owner places it on no day, so it is not offered and the screen says why", async () => {
  const { world, me, project } = await actionWorld();
  const body = await entityOf(me, "body", "City of Port Ellery");
  const p = await openIn(world, me, `/app/request/${project}`);
  await press(p, "addresseesuggest", { values: { "req-subject": body } });
  await until(p, () => p.doc.getElementById("req-noff-name"), "the fold that names an office");
  await press(p, "entitycreate", { values: { "req-noff-name": "Records Office", "req-noff-body": body, "req-noff-note": "It keeps the city's records." } });
  await until(p, () => p.doc.querySelector('[data-undated="1"]'), "the note that no day places it");
  assert.ok(text(p).includes(W("screen.person.keeper.dates.note.b")));
  assert.equal(p.doc.getElementById("req-office"), null, "not offered as chosen");
  const office = (await me.read("entitieskind", { query: { kind: "office", limit: "200" } })).entities.find((e) => e.label === "Records Office").entity_id;
  const real = await answerOf(world, me, "addresseesuggest", { query: { subject: office } });
  assert.equal(real.result.offices.length, 0, "the owner does not place it either");
});
