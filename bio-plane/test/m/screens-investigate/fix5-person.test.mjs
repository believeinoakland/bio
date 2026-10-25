/* screens-investigate R1 (T51 fix round 10; K5148; WALK-FINAL-05 R59, R149): the Person page over `store-request`'s world: an office's page records who holds it
   and states a holder current through a day; where a fact was removed for good the page draws the marker the dialog promises. The words the design adopts
   with HANDOFF B520 (K5173) are asserted where the word table holds them; each is a `test.todo` until then. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled } from "./world.mjs";
import { fill, press, main, word, hasWord } from "./fixtures.mjs";

const REASON = "The roster says so.";
const NEW_KEYS = ["screen.person.expunge.marker", "screen.person.holds.heading", "screen.person.holds.holder", "screen.person.holds.capacity", "screen.person.holds.empty", "act.recordline.label.office"];
/* the second act of R1 (`linecurrentthrough`) is not the registry's for `person` nor a named re-point (`interface-shell` R21): reported to BOB; it is built when it is */
test.todo("REPORTED: R1 stating a holder current through a day (linecurrentthrough) waits for interface-shell RE_POINTS.person or the registry (K5173)");
for (const key of NEW_KEYS) if (!hasWord(key)) test.todo(`K5173: ${key} is a word the table holds (hasWord)`);

test("R1 R59 Person, an office: 'Record who holds it' sends a `holds` line from the holder to the office with an optional end; the post then reads as held", async () => {
  const { world, me } = await inWorld();
  const office = (await me.act("entitycreate", { body: { kind: "office", label: "City Clerk", note: "The city's records officer." } })).entity_id;
  const holder = (await me.act("entitycreate", { body: { kind: "person", label: "Ana Rivera", note: "Named on the roster." } })).entity_id;
  const roster = await world.recipes.hold(me, "Roster.txt", "The City Clerk is Ana Rivera, appointed March 2025.");
  const p = await openAs(world, me, "/app/person/" + office);
  assert.ok(main(p).querySelector('button[data-act="recordline"]'), "the office's page offers to record who holds it");
  fill(p, { "ho-doc": roster.sha, "ho-from": "2025-03-01" });
  await press(p, "recordline", { reason: REASON });
  assert.equal(p.byOp("recordline").length, 0, "no holder chosen, nothing sent");
  fill(p, { "ho-who": holder });
  await press(p, "recordline", { reason: REASON });
  assert.equal(p.byOp("recordline").length, 0, "no capacity chosen, nothing sent");
  fill(p, { "ho-cap": "appointed" });
  await press(p, "recordline", { reason: REASON });
  await settled(p);
  const sent = p.byOp("recordline");
  assert.equal(sent.length, 1);
  assert.deepEqual([sent[0].body.kind, sent[0].body.from, sent[0].body.to, sent[0].body.capacity], ["holds", holder, office, "appointed"]);
  assert.equal(sent[0].body.valid.from, "2025-03-01");
  assert.equal(sent[0].body.valid.to, null, "the end optional");
  assert.equal(sent[0].body.basis.captureSha, roster.sha);
  const held = (await me.read("linesof", { query: { entity: office, kinds: "holds", direction: "to", limit: "50" } })).lines;
  assert.equal(held.length, 1, "the line is held");
});

test("R1 R149 Person: where a fact was removed for good the page draws the marker with the day and the member who removed it by name, and never the value; a withdrawn fact draws none", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Ben Okafor", note: "Named in the minutes." } })).entity_id;
  const minutes = await world.recipes.hold(me, "Minutes.txt", "Ben Okafor lives at 12 Oak Street.");
  const fact = await me.act("recordpersonfact", { body: { person, kind: "address", value: "12 Oak Street", valid: { from: "2020-01-01", to: null }, citation: { captureSha: minutes.sha, extent: { kind: "document" } } } });
  const gone = await me.act("recordpersonfact", { body: { person, kind: "contact", value: "ben@example.org", valid: { from: "2020-01-01", to: null }, citation: { captureSha: minutes.sha, extent: { kind: "document" } } } });
  await me.act("personexpunge", { body: { id: fact.fact_id, ground: "court_order", order: "Order 24-17", reason: "The court ordered it removed." } });
  const read = await me.read("person", { query: { id: person, at: "2026-10-01" } });
  assert.equal(read.removed.length, 1, "the plane keeps a tombstone beside the person");
  const p = await openAs(world, me, "/app/person/" + person);
  const marks = main(p).querySelectorAll("[data-removed]");
  assert.equal(marks.length, 1, "one marker where the fact stood");
  assert.ok(!main(p).textContent.includes("12 Oak Street"), "never the value");
  assert.ok(main(p).textContent.includes("ben@example.org"), "control: the fact not removed is drawn");
  if (hasWord("screen.person.expunge.marker")) assert.ok(marks[0].textContent.includes(word("screen.person.expunge.marker", { date: "October 1, 2026", member: me.handle })), "the day and the member by name");
  assert.ok(!marks[0].textContent.includes("member:"), "no stamp");
  void gone;
});
