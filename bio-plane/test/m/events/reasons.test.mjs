/* events: reasons and vocabularies are read by key (R54), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, testView, MEMBER } from "./fixture.mjs";
import { OWNER_KINDS } from "../../../src/events/owner.mjs";
import { reasonText } from "../../../src/events/reasons.mjs";
import { word, hasWord, WORD_ROWS } from "../../../src/setup-words/index.mjs";

const doc = { kind: "document" };

/* Every `why` in an answer that is a string, by its path (the control: none of this module's undetermined reasons is one). */
function stringWhys(x, path = "$", out = []) {
  if (Array.isArray(x)) x.forEach((v, i) => stringWhys(v, `${path}[${i}]`, out));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
    if ((k === "why" || k === "dates_why") && typeof v === "string") out.push(`${path}.${k}`);
    else stringWhys(v, `${path}.${k}`, out);
  }
  return out;
}
const drawn = (why) => reasonText(why);

test("R54 sequence over a pair whose cited orders disagree answers why {key: events.why.cited_orders_disagree, vars: {}} beside both relation ids and dates_why, and word of it is non-empty; control: no why of the answer is a string", () => {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id, b = w.event({ value: "2026-07-01" }).event_id;
  const s = w.capture("r54-a"), t = w.capture("r54-b");
  const ab = w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER }).relation.relation_id;
  const ba = w.ev.relate({ from: b, to: a, kind: "precedes", attestation: { captureSha: t, extent: doc }, by: MEMBER }).relation.relation_id;
  const q = w.ev.sequence({ a, b, viewer: MEMBER });
  assert.equal(q.answer, "undetermined");
  assert.deepEqual(q.why, { key: "events.why.cited_orders_disagree", vars: {} });
  assert.deepEqual(q.relation_ids, [ab, ba]);
  assert.ok(word(q.why.key, q.why.vars).length > 0);
  assert.equal(typeof q.dates_why.key, "string", "the dates' own reason kept beside it, as a key");
  assert.ok(drawn(q.dates_why).length > 0);
  assert.deepEqual(stringWhys(q), []);
});

test("R54 sequence over a pair whose precision does not settle the order answers the reason civil-time gives, a {key, vars} passed on exactly, and word of it is non-empty; control: a pair that is settled answers no why", () => {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id, b = w.event({ value: "2026-07-01T10:00" }).event_id;
  const q = w.ev.sequence({ a, b });
  assert.equal(q.answer, "undetermined");
  assert.equal(typeof q.why.key, "string");
  assert.equal(typeof q.why.vars, "object");
  assert.ok(drawn(q.why).length > 0);
  assert.deepEqual(stringWhys(q), []);
  const c = w.event({ value: "2026-07-05" }).event_id;
  const settled = w.ev.sequence({ a, b: c });
  assert.deepEqual([settled.answer, settled.why], ["before", undefined]);
});

test("R54 an event with no when answers sequence undetermined with why {key: events.why.placed_nowhere_event, vars: {}}; a when held with no zone answers a keyed reason too", () => {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id, n = w.event({}).event_id;
  const q = w.ev.sequence({ a, b: n });
  assert.deepEqual(q.why, { key: "events.why.placed_nowhere_event", vars: {} });
  assert.equal(word(q.why.key, q.why.vars), word("events.why.placed_nowhere_event"));
  const view = testView();
  delete view.time_zone;
  const z = world({ view });
  const x = z.event({ value: "2026-07-01" }).event_id, y = z.event({ value: "2026-07-02" }).event_id;
  const zq = z.ev.sequence({ a: x, b: y });
  assert.equal(zq.answer, "undetermined");
  assert.deepEqual(zq.why, { key: "events.text.held_zone_span", vars: {} });
  assert.ok(word(zq.why.key, zq.why.vars).length > 0);
});

test("R54 a stale when_cache answers readEvent when undetermined with why {key: events.why.cache_stale, vars: {}}, the timeline item and its grade_why too, and sequence; control: no why of these is a string", () => {
  const w = world();
  const p = w.entity("Stale");
  const e = w.event({ value: "2026-06-01", participants: [{ entityId: p, role: "present", attestation: 0 }] }).event_id;
  w.st.sql.exec(`UPDATE event_when_cache SET value='2020-01-01', start='2020-01-01T04:00:00Z' WHERE event_id=?`, e);
  const read = w.ev.readEvent({ eventId: e, viewer: MEMBER }).event;
  assert.deepEqual([read.when, read.why], ["undetermined", { key: "events.why.cache_stale", vars: {} }]);
  const lane = w.ev.timeline({ set: [p], viewer: MEMBER }).world;
  const item = [...lane.items, ...lane.placed_nowhere].find((i) => i.event_id === e);
  assert.deepEqual(item.why, { key: "events.why.cache_stale", vars: {} });
  assert.deepEqual(item.grade_why, { key: "events.why.grade_time_unread", vars: {} });
  assert.equal(reasonText(item.grade_why), word("events.why.grade_time_unread"));
  const q = w.ev.sequence({ a: e, b: w.event({ value: "2027-01-01" }).event_id });
  assert.deepEqual([q.answer, q.why], ["undetermined", { key: "events.why.cache_stale", vars: {} }]);
  assert.ok(drawn(q.why).length > 0);
  assert.deepEqual(stringWhys([read, item, q]), []);
});

test("R54 every kind R35 registers has the word of its label.connectionkinds key where the list holds one, else a row of the list; control: no kind's word is English of its own", () => {
  assert.ok(OWNER_KINDS.length >= 24);
  for (const k of OWNER_KINDS) {
    const design = `label.connectionkinds.${k.kind}`;
    if (hasWord(design)) assert.equal(k.word, word(design), k.kind);
    else assert.ok(WORD_ROWS.some((r) => r[1] === k.word), `${k.kind} is read from a row of the list`);
  }
});
