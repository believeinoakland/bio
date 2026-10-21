/* events: the timeline's third list, the dated facts of a set of captures (R53; N1193, JOURNEYS V4 B-33), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, testView, sha, MEMBER, OUTSIDER } from "./fixture.mjs";
import { CAPTURES_MAX, eventsOps } from "../../../src/events/index.mjs";

const doc = { kind: "document" };
const fact = (w, capture, value, kind = "adopted", by = MEMBER, extent = doc) =>
  w.ev.recordDatedFact({ captureSha: capture, extent, kind, value, method: "read by a member", by }).dated_fact;
const ids = (list) => list.map((i) => i.dated_fact_id);

test("R53 timeline takes captures: with a set of no entity and no lanes it answers dated, the facts of those captures in the order of their stated dates, never interleaved with the world or our lane, creating no event", () => {
  const w = world();
  const a = w.capture("r53-a"), b = w.capture("r53-b"), other = w.capture("r53-other");
  const late = fact(w, a, "2026-09-01", "effective");
  const early = fact(w, b, "2026-03-04", "signed");
  fact(w, other, "2026-01-01", "issued");
  const before = w.rows(`SELECT COUNT(*) AS n FROM events`)[0].n;
  const t = w.ev.timeline({ set: [], captures: [a, b], viewer: MEMBER });
  assert.equal(t.ok, true);
  assert.deepEqual(t.captures, [a, b]);
  assert.deepEqual(Object.keys(t.dated).sort(), ["items", "limit", "placed_nowhere", "truncated"]);
  assert.deepEqual(ids(t.dated.items), [early.dated_fact_id, late.dated_fact_id], "in the order of the stated dates, the other capture's fact left out");
  assert.deepEqual(t.dated.placed_nowhere, []);
  assert.equal(t.dated.truncated, false);
  assert.equal(t.dated.limit, 100);
  for (const i of t.dated.items) {
    for (const k of ["dated_fact_id", "capture_sha", "extent", "kind", "value", "precision", "zone", "method", "grade", "by", "at"]) assert.ok(k in i, k);
    assert.equal(i.order.undetermined, false);
  }
  const f = t.dated.items[0];
  assert.deepEqual([f.capture_sha, f.kind, f.value, f.precision, f.by, f.extent], [b, "signed", "2026-03-04", "day", MEMBER, doc]);
  assert.deepEqual(f, { ...w.ev.datedFactsFor({ captureSha: b, viewer: MEMBER }).dated_facts[0], when: f.when, order: f.order },
    "an item is the dated fact as datedFactsFor answers it");
  assert.deepEqual(t.world.items, []);
  assert.deepEqual(t.world.placed_nowhere, []);
  assert.deepEqual(t.ours.sources, []);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM events`)[0].n, before, "a dated fact states no happening: no event is created");
  /* the same captures asked with the dated fact's lane named alone, and the set given too */
  assert.deepEqual(Object.keys(w.ev.timeline({ set: [], captures: [a], lanes: ["dated"], viewer: MEMBER })).sort(), ["captures", "dated", "ok", "set"]);
  const p = w.entity("Ann");
  assert.deepEqual(ids(w.ev.timeline({ set: [p], captures: [a, b], viewer: MEMBER }).dated.items), [early.dated_fact_id, late.dated_fact_id]);
  /* without captures nothing changes: no dated list, the answer keeps its keys */
  assert.deepEqual(Object.keys(w.ev.timeline({ set: [p], viewer: MEMBER })).sort(), ["ok", "ours", "set", "world"]);
});

test("R53 NO_SET refuses only when both set and captures are empty; AUDIENCE_UNKNOWN comes before TOO_MANY_CAPTURES, and 201 captures are refused naming the bound, 200 answered", () => {
  const w = world();
  const a = w.capture("r53-bound");
  fact(w, a, "2026-05-05");
  for (const empty of [{}, { set: [] }, { captures: [] }, { set: [], captures: [] }, { set: "", captures: " , " }, { set: [" "], captures: [""] }])
    assert.equal(w.ev.timeline({ ...empty, viewer: MEMBER }).reason, "NO_SET", JSON.stringify(empty));
  assert.equal(w.ev.timeline({ set: [], captures: [a], viewer: MEMBER }).ok, true, "captures alone are a set");
  assert.equal(w.ev.timeline({ set: [], captures: a, viewer: MEMBER }).dated.items.length, 1, "a comma list is read as a list");
  assert.equal(CAPTURES_MAX, 200);
  const many = (n) => Array.from({ length: n }, (_, i) => sha(`r53-many-${i}`));
  const over = w.ev.timeline({ set: [], captures: many(201), viewer: MEMBER });
  assert.deepEqual([over.ok, over.reason, over.bound], [false, "TOO_MANY_CAPTURES", 200]);
  assert.match(over.detail, /200/);
  assert.ok(!("dated" in over) && !("world" in over));
  assert.equal(w.ev.timeline({ set: [], captures: many(200), viewer: MEMBER }).ok, true, "the bound itself is allowed");
  const bad = w.ev.timeline({ set: [], captures: many(201), audience: "secret", viewer: MEMBER });
  assert.equal(bad.reason, "AUDIENCE_UNKNOWN", "the audience is refused first");
  assert.equal(w.ev.timeline({ set: [], captures: many(201), audience: "public", viewer: MEMBER }).reason, "TOO_MANY_CAPTURES");
});

test("R53 R29 dated: undetermined orders shown with their bands, from and to bound only the placed items, a fact whose date cannot be placed listed apart, limit for this list", () => {
  const view = testView();
  delete view.time_zone;
  const w = world({ view });
  const a = w.capture("r53-order");
  const day = fact(w, a, "2026-04-10", "meeting", MEMBER, { kind: "document" });
  assert.equal(day.zone, null, "the profile gives no zone, so a day has no span");
  const zoned = world();
  const s = zoned.capture("r53-order");
  const d1 = fact(zoned, s, "2026-04-10", "meeting");
  const m1 = fact(zoned, s, "2026-04-10T09:00", "hearing");
  const d2 = fact(zoned, s, "2026-06-01", "adopted");
  const d3 = fact(zoned, s, "2026-08-15", "effective");
  const t = zoned.ev.timeline({ set: [], captures: [s], viewer: MEMBER });
  assert.deepEqual(ids(t.dated.items).slice(2), [d2.dated_fact_id, d3.dated_fact_id]);
  const band = t.dated.items.find((i) => i.dated_fact_id === d1.dated_fact_id), minute = t.dated.items.find((i) => i.dated_fact_id === m1.dated_fact_id);
  assert.equal(band.order.undetermined, true, "a day and a minute in it do not settle the order");
  assert.deepEqual(band.order.with, [m1.dated_fact_id]);
  assert.ok(band.order.band.start && band.order.band.end);
  assert.deepEqual(minute.order.with, [d1.dated_fact_id]);
  assert.equal(t.dated.items.find((i) => i.dated_fact_id === d2.dated_fact_id).order.undetermined, false);
  /* from and to bound the placed items */
  const mid = zoned.ev.timeline({ set: [], captures: [s], from: "2026-05-01", to: "2026-07-01", viewer: MEMBER }).dated;
  assert.deepEqual(ids(mid.items), [d2.dated_fact_id]);
  assert.equal(zoned.ev.timeline({ set: [], captures: [s], from: "2026-02-31", viewer: MEMBER }).reason, "BAD_DATE");
  /* a fact whose date cannot be placed is listed apart, and no bound can exclude it */
  const none = w.ev.timeline({ set: [], captures: [a], viewer: MEMBER }).dated;
  assert.deepEqual([none.items.length, ids(none.placed_nowhere)], [0, [day.dated_fact_id]]);
  const bounded = w.ev.timeline({ set: [], captures: [a], from: "2030-01-01", viewer: MEMBER }).dated;
  assert.deepEqual(ids(bounded.placed_nowhere), [day.dated_fact_id]);
  /* limit is this list's, clamped as R27, truncated by reading one past */
  const one = zoned.ev.timeline({ set: [], captures: [s], limit: 1, viewer: MEMBER }).dated;
  assert.deepEqual([one.items.length, one.limit, one.truncated], [1, 1, true]);
  assert.equal(zoned.ev.timeline({ set: [], captures: [s], limit: 4, viewer: MEMBER }).dated.truncated, false);
  assert.equal(zoned.ev.timeline({ set: [], captures: [s], limit: 99999, viewer: MEMBER }).dated.limit, 500);
});

test("R53 R28 R30 dated stays in its own list: a fact a source also reports stays in that source's lane, an event's attestation does not become a dated item twice, and a set of no entity asks no source", () => {
  const w = world();
  const p = w.entity("Bo");
  const s = w.capture("r53-lanes");
  const f = fact(w, s, "2026-05-05", "meeting");
  const ev = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f.dated_fact_id }],
    participants: [{ entityId: p, role: "actor", attestation: 0 }], by: MEMBER });
  assert.equal(ev.ok, true);
  const asked = [];
  w.ev.registerEventSource("actions", (a) => { asked.push(a); return [{ at: "2026-05-05", label: "we cited it", ref: "A-9", kind: "letter" }]; });
  const t = w.ev.timeline({ set: [p], captures: [s], viewer: MEMBER });
  assert.deepEqual(ids(t.dated.items), [f.dated_fact_id], "the document's date, once");
  assert.equal(t.world.items.length, 1, "the event it attests is the world's");
  assert.ok(!("dated_fact_id" in t.world.items[0]));
  assert.deepEqual(t.ours.sources[0].items.map(({ order, ...x }) => x), [{ at: "2026-05-05", label: "we cited it", ref: "A-9", kind: "letter" }]);
  assert.ok(!t.dated.items.some((i) => "ref" in i), "nothing of ours in the dated list");
  assert.equal(asked.length, 1);
  const alone = w.ev.timeline({ set: [], captures: [s], viewer: MEMBER });
  assert.equal(asked.length, 1, "a set of no entity or event asks no source");
  assert.deepEqual(alone.ours.sources, [{ source: "actions", items: [], truncated: false }]);
  assert.deepEqual(alone.world.items.map((i) => i.event_id), [ev.event_id], "K4310: the event the capture is cited by is the world's, found by the capture");
});

test("R53 R40 control: a fact whose capture is in a hidden project is absent and uncounted, a capture not held answers alike, and audience public omits dated", () => {
  const w = world();
  w.project("PROJ-2026-0001-p", "alice");
  const open = w.capture("r53-open");
  const hidden = w.capture("r53-hidden", { bundleId: "INFO-2026-0009-h", project: "PROJ-2026-0001-p" });
  const seen = fact(w, open, "2026-02-02", "issued");
  fact(w, hidden, "2026-01-01", "issued");
  const never = sha("r53-never-held");
  const asked = (viewer, captures) => w.ev.timeline({ set: [], captures, viewer });
  const mine = asked(MEMBER, [open, hidden]).dated;
  assert.equal(mine.items.length, 2, "the member of the project sees both");
  const out = asked(OUTSIDER, [open, hidden]).dated;
  assert.deepEqual(ids(out.items), [seen.dated_fact_id], "the hidden capture's fact is absent");
  assert.deepEqual([out.placed_nowhere, out.truncated], [[], false], "and uncounted");
  assert.deepEqual(asked(OUTSIDER, [open, hidden, never]).dated, out, "a capture not held and a hidden one contribute alike");
  const onlyHidden = asked(OUTSIDER, [hidden]), onlyNever = asked(OUTSIDER, [never]);
  assert.deepEqual(onlyHidden.dated, onlyNever.dated);
  assert.deepEqual(onlyHidden.dated.items, []);
  const limited = w.ev.timeline({ set: [], captures: [open, hidden], limit: 1, viewer: OUTSIDER }).dated;
  assert.equal(limited.truncated, false, "a hidden fact does not count toward truncated");
  assert.deepEqual(asked(null, [open]).dated.items, [], "no viewer sees nothing");
  /* audience public: dated is not answered, the other lanes are as without it */
  const pub = w.ev.timeline({ set: [], captures: [open, hidden], audience: "public", viewer: MEMBER });
  assert.equal(pub.ok, true);
  assert.ok(!("dated" in pub));
  const named = w.ev.timeline({ set: [], captures: [open], lanes: ["dated", "world"], audience: "public", viewer: MEMBER });
  assert.ok(!("dated" in named), "naming the list does not answer it under public");
  assert.ok("world" in named);
  assert.ok("dated" in w.ev.timeline({ set: [], captures: [open], audience: undefined, viewer: MEMBER }));
  assert.ok("dated" in w.ev.timeline({ set: [], captures: [open], audience: null, viewer: MEMBER }));
});

test("R53 R36 the timeline op reads captures from the url or the body, and lanes may name dated", () => {
  const w = world();
  const a = w.capture("r53-op"), b = w.capture("r53-op-b");
  const fa = fact(w, a, "2026-07-07"), fb = fact(w, b, "2026-06-06");
  const url = (q) => { const u = new URL("https://plane.test/op"); for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v); return u; };
  const ops = (q, body) => eventsOps(w.ev, url(q), body).timeline();
  const r = ops({ captures: `${a},${b}`, viewer: MEMBER });
  assert.deepEqual(ids(r.dated.items), [fb.dated_fact_id, fa.dated_fact_id]);
  assert.deepEqual(ids(ops({ viewer: MEMBER }, { captures: [a, b] }).dated.items), [fb.dated_fact_id, fa.dated_fact_id], "a long list may travel in the body");
  assert.deepEqual(ids(ops({ captures: a, lanes: "dated", viewer: MEMBER }).dated.items), [fa.dated_fact_id]);
  assert.equal(ops({ viewer: MEMBER }).reason, "NO_SET");
  assert.equal(ops({ captures: a, audience: "public", viewer: MEMBER }).dated, undefined);
  assert.equal(ops({ captures: Array.from({ length: 201 }, (_, i) => sha(`x${i}`)).join(","), viewer: MEMBER }).reason, "TOO_MANY_CAPTURES");
});

const cites = (w, capture, by = MEMBER, extra = {}) => w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: capture, extent: doc }], by, ...extra });
const worldIds = (t) => [...t.world.items, ...t.world.placed_nowhere].map((i) => i.event_id);

test("R53 events found by the captures they cite: an event with one capture attestation and no concerns is answered by timeline({captures}) with no set, whether it cites an extent or a dated fact", () => {
  const w = world();
  const a = w.capture("r53c-a"), b = w.capture("r53c-b");
  const byExtent = cites(w, a);
  assert.equal(byExtent.ok, true);
  const f = fact(w, b, "2026-05-05", "meeting");
  const byFact = w.ev.createEvent({ kind: "meeting", attestations: [{ datedFactId: f.dated_fact_id }], by: MEMBER });
  assert.equal(byFact.ok, true);
  const t = w.ev.timeline({ captures: [a, b], viewer: MEMBER });
  assert.equal(t.ok, true);
  assert.deepEqual(t.world.placed_nowhere.map((i) => i.event_id), [byExtent.event_id], "an event no document dates is placed nowhere, answered");
  assert.deepEqual(t.world.items.map((i) => i.event_id), [byFact.event_id]);
  assert.deepEqual(t.world.items[0].of, [], "it was found by a capture, not by a member of the set");
  assert.ok(Array.isArray(t.world.items[0].participants) && "grade" in t.world.items[0], "drawn as any world item");
  assert.deepEqual(t.dated.items.map((i) => i.dated_fact_id), [f.dated_fact_id], "the dated list is as before");
  /* the lane may be named alone */
  assert.deepEqual(worldIds(w.ev.timeline({ captures: [a], lanes: ["world"], viewer: MEMBER })), [byExtent.event_id]);
  /* a merged event is answered once, as its kept event */
  const merged = w.ev.mergeEvents({ keep: byExtent.event_id, absorb: byFact.event_id, reason: "one meeting", by: MEMBER });
  assert.equal(merged.ok, true);
  assert.deepEqual(worldIds(w.ev.timeline({ captures: [a, b], viewer: MEMBER })), [byExtent.event_id]);
});

test("R53 control: an event is not answered by a capture it does not cite, nor by testimony, and one already answered from the set is not repeated", () => {
  const w = world();
  const p = w.entity("Cy");
  const a = w.capture("r53c-cite"), other = w.capture("r53c-other");
  const mine = cites(w, a, MEMBER, { concerns: [p] });
  const elsewhere = cites(w, other);
  const told = w.ev.createEvent({ kind: "statement", attestations: [{ testimony: "I was there" }], by: MEMBER });
  assert.deepEqual([mine.ok, elsewhere.ok, told.ok], [true, true, true]);
  const t = w.ev.timeline({ captures: [a], viewer: MEMBER });
  assert.deepEqual(worldIds(t), [mine.event_id], "neither the other capture's event nor the testimony event");
  const both = w.ev.timeline({ set: [p], captures: [a], viewer: MEMBER });
  assert.deepEqual(worldIds(both), [mine.event_id], "once");
  assert.deepEqual(both.world.placed_nowhere[0].of, [p], "as the set found it");
  assert.deepEqual(worldIds(w.ev.timeline({ set: [p], viewer: MEMBER })), [mine.event_id]);
  assert.deepEqual(worldIds(w.ev.timeline({ captures: [sha("r53c-never")], viewer: MEMBER })), []);
});

test("R53 R40 control: a capture the viewer may not see contributes no event, uncounted, answered as a capture not held; R27 limit; R30 audience public answers the world lane as without it", () => {
  const w = world();
  w.project("PROJ-2026-0001-p", "alice");
  const open = w.capture("r53c-open");
  const hidden = w.capture("r53c-hidden", { bundleId: "INFO-2026-0009-h", project: "PROJ-2026-0001-p" });
  const seen = cites(w, open), secret = cites(w, hidden);
  assert.deepEqual([seen.ok, secret.ok], [true, true]);
  assert.deepEqual(worldIds(w.ev.timeline({ captures: [open, hidden], viewer: MEMBER })).sort(), [seen.event_id, secret.event_id].sort(), "the project's member sees both");
  const out = w.ev.timeline({ captures: [open, hidden], viewer: OUTSIDER });
  assert.deepEqual(worldIds(out), [seen.event_id]);
  const limited = w.ev.timeline({ captures: [open, hidden], limit: 1, viewer: OUTSIDER });
  assert.equal(limited.world.truncated, false, "a hidden event does not count toward truncated");
  assert.deepEqual(w.ev.timeline({ captures: [hidden], viewer: OUTSIDER }).world, w.ev.timeline({ captures: [sha("r53c-nope")], viewer: OUTSIDER }).world, "hidden and not held alike");
  assert.deepEqual(worldIds(w.ev.timeline({ captures: [open], viewer: null })), [], "no viewer sees nothing");
  const cut = w.ev.timeline({ captures: [open, hidden], limit: 1, viewer: MEMBER });
  assert.deepEqual([cut.world.placed_nowhere.length, cut.world.truncated], [1, true], "R27's limit cuts the lane");
  const pub = w.ev.timeline({ captures: [open], audience: "public", viewer: MEMBER });
  assert.deepEqual(pub.world, w.ev.timeline({ captures: [open], viewer: MEMBER }).world);
  assert.ok(!("dated" in pub));
});
