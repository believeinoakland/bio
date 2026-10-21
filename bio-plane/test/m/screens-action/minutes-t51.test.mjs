/* screens-action R55 (K4258; `actions` R108; DEC-340, U366): the minutes' fold on a reply to a public comment (`screen.action.minutes.*`).
   The document is a held capture of the project (as R38's reply document), the passage is the words as the minutes write them, found in
   that document's reading (`reading`), and the extent of the unit that holds them is what `actions` takes as `minutes.passage`. Every
   sentence is asserted by its key (R19); every request is compared with its owner's declaration by the harness. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, text, press, last, ok, beside, W, D, hasWord, DATA_PLANE, ROUTES, ACTION, ACTION_ID, AFFORDANCES } from "./page.mjs";
import { DECLARED_FIELDS } from "./declared.mjs";

const SHA = "a".repeat(64);
const EXTENT = { kind: "pdf-page", page: 2 };
const HELD = ok({ held: [{ bundle_id: "DOC-1", title: "Council minutes", collected_since: "2026-10-03T10:00:00Z", capture: { sha256: SHA, grade: "B" } }], truncated: false });
const READING = ok({ text_units: [{ seq: 1, text: "Call to order.", extent: { kind: "pdf-page", page: 0 } },
  { seq: 2, text: "Ms.   Reyes spoke for the group during public comment\nand asked  the council to answer.", extent: EXTENT }] });
const PUBLIC = { ...ACTION, kind: "public_comment" };
const plane = (action = PUBLIC, over = {}) => ({ ...DATA_PLANE, action: ok(action), affordances: ok(AFFORDANCES), heldcaptures: HELD, reading: READING, actioncorrespond: ok({}), ...over });
const sentOf = (p) => Object.fromEntries(Object.entries(last(p, "actioncorrespond").query).filter(([k]) => k !== "op" && k !== "reason"));
const MIN = { "reply-at": "2026-10-11", "reply-account": "The minutes.", "minutes-meeting": "Council, regular meeting", "minutes-date": "2026-10-07",
  "minutes-doc": SHA, "minutes-passage": "Ms. Reyes spoke for the group during public comment and asked the council to answer." };
const choose = async (p, id, value) => { const el = p.doc.getElementById(id); el.value = value; p.fire(el, "change"); await new Promise((r) => setTimeout(r, 0)); await new Promise((r) => setTimeout(r, 0)); };

test("R55 (actions R108): on a public comment the reply form draws the minutes' fold by its keys; the reply sends `minutes` as the meeting, its day and the passage's capture and extent, found in the document's reading", async () => {
  for (const k of ["heading", "says", "legend", "meeting.label", "meeting.help1", "date.label", "date.help1", "doc.label", "doc.help1", "passage.label", "passage.help1", "record"])
    assert.ok(hasWord("screen.action.minutes." + k), k);
  const p = await open(ROUTES.action, plane());
  for (const k of ["heading", "says", "legend", "meeting.label", "date.label", "doc.label", "passage.label", "record"]) assert.ok(text(p).includes(W("screen.action.minutes." + k)), k);
  await choose(p, "minutes-doc", SHA);
  const read = p.byOp("reading");
  assert.equal(read.length, 1, "the document's reading is read once it is chosen");
  assert.equal(read[0].query.sha256, SHA);
  await press(p, "actioncorrespond", { reason: "it came", values: MIN });
  const sent = sentOf(p);
  assert.deepEqual(JSON.parse(sent.minutes), { meeting: "Council, regular meeting", date: "2026-10-07", passage: { captureSha: SHA, extent: EXTENT } });
  assert.equal(sent.direction, "received");
  for (const name of Object.keys(sent)) assert.ok(DECLARED_FIELDS("actioncorrespond").includes(name), `${name} is declared`);
});

test("R55 control: an action of another kind draws no fold and sends no `minutes`", async () => {
  const p = await open(ROUTES.action, plane({ ...ACTION, kind: "records_request" }));
  assert.ok(!text(p).includes(W("screen.action.minutes.heading")));
  assert.equal(p.doc.getElementById("minutes-meeting"), null);
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-11", "reply-account": "Words." } });
  assert.ok(!("minutes" in sentOf(p)));
});

test("R55 control: no part of the minutes sends none; a part missing is refused in place and sends nothing; words the document does not hold are refused; a silence carries none", async () => {
  const p = await open(ROUTES.action, plane());
  await press(p, "actioncorrespond", { reason: "it came", values: { "reply-at": "2026-10-11", "reply-account": "Words." } });
  assert.ok(!("minutes" in sentOf(p)));
  const n = p.byOp("actioncorrespond").length;
  await choose(p, "minutes-doc", SHA);
  const b = await press(p, "actioncorrespond", { reason: "it came", values: { ...MIN, "minutes-meeting": "" } });
  assert.equal(p.byOp("actioncorrespond").length, n, "nothing is sent");
  assert.ok(beside(p, b).includes(W("findin.fieldneeded", { field: W("screen.action.minutes.meeting.label") })));
  const c = await press(p, "actioncorrespond", { reason: "it came", values: { ...MIN, "minutes-passage": "Words that no unit holds." } });
  assert.equal(p.byOp("actioncorrespond").length, n);
  assert.ok(beside(p, c).includes(W("ai.progress.check.fail", { passage: "Words that no unit holds." })));
  await press(p, "actioncorrespond", { reason: "it came", values: { ...MIN, "reply-dir": "no_response" } });
  assert.ok(!("minutes" in sentOf(p)), "a silence has no minutes");
});

test("R55: a recorded entry's minutes are said beside it with `screen.action.minutes.says`, its meeting and its day", async () => {
  const withMin = { ...PUBLIC, entries: [{ ord: 2, minutes: { meeting: "Council, regular meeting", date: "2026-10-07", passage: { captureSha: SHA, extent: EXTENT } } }] };
  const p = await open(ROUTES.action, plane(withMin));
  const t = text(p, p.doc.querySelector('[data-minutes="2"]'));
  assert.ok(t.includes(W("screen.action.minutes.says")) && t.includes("Council, regular meeting") && t.includes(D("2026-10-07")));
  const q = await open(ROUTES.action, plane(PUBLIC));
  assert.equal(q.doc.querySelector("[data-minutes]"), null, "control: an entry with no minutes says none");
});
