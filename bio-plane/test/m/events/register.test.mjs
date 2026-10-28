/* events (T53): one entry of a followed register is one event however many readings state it (R58, R59), the timeline over
   many captures (R60), and withdrawing an event (R61), at the interface. The two readings are court-doctypes' real
   readers over its fixtures (the JSON one is marked as assumed there, R18). */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, testView, metered, sha, MEMBER, OUTSIDER } from "./fixture.mjs";
import { courtlistenerDocket, courtlistenerApi } from "../../../../court-doctypes/index.mjs";

const FIX = new URL("../../../../court-doctypes/test/fixtures/", import.meta.url);
const text = (n) => readFileSync(new URL(n, FIX), "utf8");
const HTML = text("courtlistener-4214664-p4.html"), JSON_ = text("courtlistener-api-4214664-ASSUMED.json");
const doc = { kind: "document" };

function setup() {
  const view = testView();
  const w = world({ view });
  const proc = w.proceeding("A followed docket");
  const html = (t = HTML, name = "html") => w.capture(name, { contentType: "courtlistener_docket",
    facts: courtlistenerDocket.parse({ locator: "https://dockets.registry.example/case/4", text: t, view, origin: null }) });
  const api = (t = JSON_, name = "api") => w.capture(name, { contentType: "courtlistener_api",
    facts: courtlistenerApi.parse({ locator: "https://dockets.registry.example/api/4", text: t, view, origin: null, at: "2026-10-05T00:00:00Z" }) });
  return { w, proc, html, api, view };
}
const events = (w) => w.rows(`SELECT event_id, kind FROM events WHERE alias_of IS NULL AND kind IN ('filing','order')`);
const keyed = (j, edit) => { const o = JSON.parse(j); edit(o); return JSON.stringify(o); };
const first = (j, n) => JSON.parse(j).results.find((e) => e.entry_number === n);

test("R58 an HTML reading then a JSON reading of the same entries is one event per entry, the second an attestation with its own grade; the same pair the other way round ends alike; a re-read changes nothing", () => {
  const a = setup();
  const h = a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc });
  const numbered = h.written.length;
  assert.ok(numbered > 0);
  const j = a.w.ev.followedRegister({ captureSha: a.api(), proceeding: a.proc });
  assert.deepEqual(j.written, []);
  assert.equal(j.readings_added.length, numbered);
  assert.ok(j.readings_added.every((r) => r.content_type === "courtlistener_api" && r.provisional === true));
  assert.equal(events(a.w).length, numbered, "no second event");
  const one = a.w.ev.readEvent({ eventId: h.written[0].event_id, viewer: MEMBER }).event;
  assert.equal(one.attestations.length, 2);
  assert.deepEqual(one.concerns, [a.proc]);
  assert.ok(one.attestations.every((x) => x.grade && x.by === "class:daemon"));
  assert.deepEqual(a.w.ev.followedRegister({ captureSha: a.api(), proceeding: a.proc }).readings_added, [], "a re-read of the same capture");
  assert.equal(a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc }).written.length, 0);
  /* the other way round */
  const b = setup();
  const j1 = b.w.ev.followedRegister({ captureSha: b.api(), proceeding: b.proc });
  assert.equal(j1.written.length, numbered, "the JSON reading carries the entries of the page");
  const h1 = b.w.ev.followedRegister({ captureSha: b.html(), proceeding: b.proc });
  assert.deepEqual(h1.written, []);
  assert.equal(h1.readings_added.length, numbered);
  assert.equal(events(b.w).length, numbered);
});

test("R58 a second reading stating another kind or day is a disagreement beside the first reading's facts, shown by readEvent, never moving them; it never fails the tick", () => {
  const a = setup();
  const h = a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc });
  const target = h.written.find((x) => x.kind === "filing" && first(JSON_, Number(x.entry_id)));
  const n = Number(target.entry_id), ev0 = a.w.ev.readEvent({ eventId: target.event_id, viewer: MEMBER }).event;
  const edited = keyed(JSON_, (o) => { const e = o.results.find((x) => x.entry_number === n); e.description = `Order ${e.description}`; e.date_filed = "2020-01-02"; });
  const r = a.w.ev.followedRegister({ captureSha: a.api(edited, "api-edit"), proceeding: a.proc });
  assert.equal(r.ok, true);
  const mine = r.disagreements.filter((d) => d.event_id === target.event_id);
  assert.deepEqual(mine.map((d) => d.field).sort(), ["date", "kind"]);
  assert.ok(mine.every((d) => d.provisional === true && d.content_type === "courtlistener_api"));
  const v = a.w.ev.readEvent({ eventId: target.event_id, viewer: MEMBER }).event;
  assert.equal(v.kind, "filing");
  assert.deepEqual(v.when, ev0.when, "the first reading's day stands");
  assert.equal(v.attestations.length, 2, "the second's dated fact is held");
  assert.deepEqual(v.disagreements.map((d) => d.field).sort(), ["date", "kind"]);
  assert.ok(v.disagreements.every((d) => d.capture_sha && d.held_capture_sha));
  /* a re-read repeats nothing */
  a.w.ev.followedRegister({ captureSha: a.api(edited, "api-edit"), proceeding: a.proc });
  assert.equal(a.w.ev.readEvent({ eventId: target.event_id, viewer: MEMBER }).event.disagreements.length, 2);
});

test("R58 an event written under the old key is found by the JSON reading, re-keyed, with no second event; the same entry id on two proceedings is two events; other content types are refused", () => {
  const a = setup();
  const h = a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc });
  const x = h.written[0];
  a.w.rows(`UPDATE event_sources SET source_key=?, facts=? WHERE source_key=?`,
           `register:courtlistener_docket:${a.proc}:${x.entry_id}`, JSON.stringify({ entry_id: x.entry_id, date: null }), `register:courtlistener:${a.proc}:${x.entry_id}`);
  const before = events(a.w).length;
  const j = a.w.ev.followedRegister({ captureSha: a.api(), proceeding: a.proc });
  assert.equal(events(a.w).length, before);
  assert.ok(j.readings_added.some((r) => r.event_id === x.event_id));
  assert.ok(a.w.one(`SELECT 1 AS x FROM event_sources WHERE source_key=?`, `register:courtlistener:${a.proc}:${x.entry_id}`));
  assert.equal(a.w.one(`SELECT 1 AS x FROM event_sources WHERE source_key=?`, `register:courtlistener_docket:${a.proc}:${x.entry_id}`), null);
  const other = a.w.proceeding("Another docket");
  assert.equal(a.w.ev.followedRegister({ captureSha: a.api(), proceeding: other }).written.length, before);
  assert.equal(events(a.w).length, before * 2);
  assert.equal(a.w.ev.followedRegister({ captureSha: a.w.capture("page"), proceeding: a.proc }).reason, "NOT_A_REGISTER");
  assert.equal(a.w.ev.followedRegister({ captureSha: a.w.capture("err", { contentType: "application/json", facts: { detail: "x" } }), proceeding: a.proc }).reason, "NOT_A_REGISTER");
});

test("R59 a second reading tells no listener; a changed date in the same form is R25's recorded change", () => {
  const a = setup();
  const told = [], moved = [];
  a.w.ev.onEventChanged("reevaluation", (x) => told.push(x.change));
  a.w.ev.onWhenChanged("lines", (x) => moved.push(x.eventId));
  const h = a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc });
  told.length = 0; moved.length = 0;
  a.w.ev.followedRegister({ captureSha: a.api(), proceeding: a.proc });
  assert.deepEqual([told.length, moved.length], [0, 0]);
  const t = h.written.find((x) => first(JSON_, Number(x.entry_id)));
  const n = Number(t.entry_id);
  const later = a.api(keyed(JSON_, (o) => { o.results.find((e) => e.entry_number === n).description += " (amended)"; }), "api-later");
  const r = a.w.ev.followedRegister({ captureSha: later, proceeding: a.proc });
  assert.deepEqual(r.updated.map((u) => u.entry_id), [String(n)]);
  assert.equal(a.w.ev.readEvent({ eventId: t.event_id, viewer: MEMBER }).event.merges_and_splits.at(-1).kind, "source_changed");
});

test("R58 control: a hidden capture contributes no attestation to a viewer who may not see it", () => {
  const a = setup();
  const h = a.w.ev.followedRegister({ captureSha: a.html(), proceeding: a.proc });
  a.w.project("PRJ-2026-0001", "alice");
  const view = a.view;
  const hidden = a.w.capture("hidden-api", { project: "PRJ-2026-0001", bundleId: "INFO-2026-0002-a", contentType: "courtlistener_api",
    facts: courtlistenerApi.parse({ locator: "https://dockets.registry.example/api/4", text: JSON_, view, origin: null, at: "2026-10-05T00:00:00Z" }) });
  a.w.ev.followedRegister({ captureSha: hidden, proceeding: a.proc });
  const id = h.written[0].event_id;
  assert.equal(a.w.ev.readEvent({ eventId: id, viewer: MEMBER }).event.attestations.length, 2);
  assert.equal(a.w.ev.readEvent({ eventId: id, viewer: OUTSIDER }).event.attestations.length, 1);
});

for (const n of [20, 200]) {
  test(`R60 timeline of ${n} captures answers ok within a bounded work per event; an unknown capture contributes nothing`, () => {
    const w = world(), shas = [];
    for (let i = 0; i < n; i++) { const s = w.capture(`t${i}`); shas.push(s); for (let j = 0; j < 3; j++) w.event({ capture: s, value: "2026-03-01" }); }
    const m = metered(w, () => w.ev.timeline({ captures: [...shas.slice(0, n - 1), sha("unknown")], viewer: MEMBER, limit: 500 }));
    assert.equal(m.value.ok, true);
    assert.equal(m.value.world.items.length + m.value.world.placed_nowhere.length, Math.min(500, 3 * (n - 1)));
    assert.ok(m.statements <= 4 * Math.min(500, 3 * (n - 1)), `${m.statements} statements`);
    assert.equal(w.ev.timeline({ captures: shas.slice(0, 2), viewer: MEMBER, lanes: ["world"] }).ok, true);
  });
}

test("R61 withdrawEvent: reasoned, kept and shown withdrawn in readEvent and timeline; a repeat is already; refusals", () => {
  const w = world();
  const s = w.capture("w");
  const e = w.event({ capture: s, value: "2026-03-01" }).event_id, other = w.event({ capture: s, value: "2026-03-02" }).event_id;
  assert.equal(w.ev.withdrawEvent({ eventId: e, reason: "  ", by: MEMBER }).reason, "NO_REASON");
  assert.equal(w.ev.withdrawEvent({ eventId: "EVT-2026-zzzz", reason: "r", by: MEMBER }).reason, "NO_SUCH_EVENT");
  assert.equal(w.ev.withdrawEvent({ eventId: e, reason: "r", by: OUTSIDER }).ok, true, "the same capture is seen by every member");
  assert.equal(w.ev.readEvent({ eventId: other, viewer: MEMBER }).event.withdrawn, null);
  const r = w.ev.withdrawEvent({ eventId: other, reason: "dated wrongly", by: MEMBER });
  assert.equal(r.ok, true);
  assert.equal(w.ev.withdrawEvent({ eventId: other, reason: "again", by: MEMBER }).already, true);
  const v = w.ev.readEvent({ eventId: other, viewer: MEMBER }).event;
  assert.deepEqual([v.withdrawn.by, v.withdrawn.reason], [MEMBER, "dated wrongly"]);
  assert.ok(v.withdrawn.at);
  assert.equal(v.attestations.length, 1, "its attestations remain readable");
  const t = w.ev.timeline({ captures: [s], viewer: MEMBER, lanes: ["world"] });
  const item = [...t.world.items, ...t.world.placed_nowhere].find((i) => i.event_id === other);
  assert.equal(item.withdrawn.reason, "dated wrongly");
});

test("R61 control: an event no viewer sees is NO_SUCH_EVENT to a member outside its project", () => {
  const w = world();
  w.project("PRJ-2026-0002", "alice");
  const s = w.capture("hid", { project: "PRJ-2026-0002", bundleId: "INFO-2026-0009-a" });
  const e = w.event({ capture: s, value: "2026-03-01" }).event_id;
  assert.equal(w.ev.withdrawEvent({ eventId: e, reason: "r", by: OUTSIDER }).reason, "NO_SUCH_EVENT");
  assert.equal(w.ev.withdrawEvent({ eventId: e, reason: "r", by: MEMBER }).ok, true);
});
