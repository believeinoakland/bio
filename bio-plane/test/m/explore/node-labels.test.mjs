/* explore at its interface, T51 fix round 10 (K5271): the graph names an event and a document (R29; amends R25). */
// fixtures-own: the events and documents readers are doubles of the two reads the graph asks, fed by the test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { exploreOf } from "../../../src/explore/index.mjs";
import { AT, ent, evt, conn, world, byOwner } from "./fixtures/owners.mjs";

const V = "alice";
const A = ent(1), B = ent(2);
const INFO = "INFO-2026-0101-a";
const make = (conns, ctx = {}) => { const w = world(byOwner(conns)); return exploreOf(null, { registry: w.registry, ...ctx }); };
const eventsOf = (table, calls = []) => ({ readEvent: ({ eventId, viewer }) => { calls.push({ eventId, viewer }); const e = table[eventId]; return e ? { ok: true, found: true, event: { event_id: eventId, ...e } } : { ok: true, found: false, event_id: eventId }; } });
const docsOf = (table, calls = []) => ({ titlesOf: ({ ids, viewer }) => { calls.push({ ids: [...ids], viewer }); return { ok: true, titles: Object.fromEntries(ids.map((id) => [id, table[id] ?? null])) }; } });
const rows = () => [conn("line:belongs_to", A, evt(7), { id: "a-e" }), conn("line:part_of", A, INFO, { id: "a-i" }), conn("line:part_of", A, B, { id: "a-b" })];
const labels = (g) => Object.fromEntries(g.nodes.map((n) => [n.id, n.label]));

test("R29 R25 an EVT- node is named by its kind and date, an undated one by its kind alone (T52-18), an INFO- node by its document's title, and an ENT- node as before", () => {
  const events = eventsOf({ [evt(7)]: { kind: "meeting", when: { value: "2026-02-10", precision: "day", zone: "America/Los_Angeles" } } });
  const documents = docsOf({ [INFO]: "Council minutes, 10 February" });
  const entities = { labelsOf: ({ ids }) => ({ ok: true, labels: Object.fromEntries(ids.map((id) => [id, id === A ? { label: "Alice Alder", kind: "person" } : null])) }) };
  const g = make(rows(), { events, documents, entities }).neighbourhood({ centre: A, at: AT, viewer: V, kinds: ["line:belongs_to", "line:part_of"] });
  assert.deepEqual(labels(g), { [A]: "Alice Alder", [evt(7)]: "meeting · 2026-02-10", [INFO]: "Council minutes, 10 February", [B]: null });
  const undated = make(rows(), { events: eventsOf({ [evt(7)]: { kind: "award", when: null } }), documents }).neighbourhood({ centre: A, at: AT, viewer: V, kinds: ["line:belongs_to"] });
  assert.equal(labels(undated)[evt(7)], "award");
  const undetermined = make(rows(), { events: eventsOf({ [evt(7)]: { kind: "award", when: "undetermined" } }) }).neighbourhood({ centre: A, at: AT, viewer: V, kinds: ["line:belongs_to"] });
  assert.equal(labels(undetermined)[evt(7)], "award");
});

test("R29 control: an event or document the record holds nothing for, or the viewer may not see, stays null; no reader leaves every such node null; a label is never the id", () => {
  const kinds = ["line:belongs_to", "line:part_of"];
  const g = make(rows(), { events: eventsOf({}), documents: docsOf({ [INFO]: INFO }) }).neighbourhood({ centre: A, at: AT, viewer: V, kinds });
  assert.deepEqual(labels(g), { [A]: null, [evt(7)]: null, [INFO]: null, [B]: null });
  const bare = make(rows()).neighbourhood({ centre: A, at: AT, viewer: V, kinds });
  assert.deepEqual(labels(bare), { [A]: null, [evt(7)]: null, [INFO]: null, [B]: null });
  const sees = [];
  make(rows(), { events: eventsOf({ [evt(7)]: { kind: "meeting", when: null } }, sees), documents: docsOf({}, sees) }).neighbourhood({ centre: A, at: AT, viewer: V, kinds });
  assert.ok(sees.length > 0 && sees.every((c) => c.viewer === V), "each read is made for the viewer, whose sight the owners keep (R7)");
});

test("R29 R7 a hop withheld from the viewer names nothing: its event is not read; documents are read in reads of at most 500", () => {
  const fenced = conn("line:belongs_to", A, evt(8), { id: "a-f", seen_by: ["carol"] });
  const calls = [];
  const events = eventsOf({ [evt(8)]: { kind: "vote", when: null }, [evt(7)]: { kind: "meeting", when: null } }, calls);
  const g = make([...rows(), fenced], { events }).neighbourhood({ centre: A, at: AT, viewer: V, kinds: ["line:belongs_to"] });
  assert.ok(!(evt(8) in labels(g)) && !calls.some((c) => c.eventId === evt(8)));
  const wide = Array.from({ length: 700 }, (_, i) => conn("line:part_of", A, `INFO-2026-${String(1000 + i)}-a`, { id: `w-${i}` }));
  const reads = [];
  const gw = make(wide, { documents: docsOf({}, reads) }).neighbourhood({ centre: A, at: AT, viewer: V, rings: 1, kinds: ["line:part_of"] });
  assert.ok(gw.nodes.length > 500 && reads.length >= 2 && reads.every((c) => c.ids.length <= 500));
});
