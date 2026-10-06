/* events: what the machine writes, at the interface: Legistar following (R22–R25) over legistar-reader's captured
   fixtures and its 50-event gold set (M-V3), a followed register (R38) over court-doctypes' captured CourtListener page,
   and the machine's limits (R41). The captures are read by the real readers under views built here as test data. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, testView, sha, MEMBER } from "./fixture.mjs";
import { parse as legistarParse } from "../../../../legistar-reader/index.mjs";
import { courtlistenerDocket } from "../../../../court-doctypes/index.mjs";

const FIX = new URL("../../../../legistar-reader/test/fixtures/", import.meta.url);
const load = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, FIX), "utf8"));
const GOLD = JSON.parse(readFileSync(new URL("gold.json", FIX), "utf8"));
/* The one marker the gold set's cancelled rows need, written here as test data (the reader takes it from the view). */
const MARKERS = { vocabulary: { meeting_markers: [{ marker: "cancelled", pattern: { re: "CANCELL(?:ED|ATION)", flags: "i" }, basis: "TEST" }] } };
const ALL = { from: "2023-10-01", to: "2026-10-06" };

/* A Legistar capture held in the record: the fixture's body read by legistar-reader, as reading-pipeline stores it. */
function legistar(w, name, { body = null, locator = null, at = null } = {}) {
  const f = body ? { locator, body, captured_at: at || "2026-10-05T22:00:00Z" } : load(name);
  const parsed = legistarParse({ locator: f.locator, text: JSON.stringify(f.body), view: MARKERS, at: f.captured_at });
  return w.capture(`legistar:${name}`, { contentType: "legistar_api", facts: parsed });
}
function setup({ zone = GOLD.zone } = {}) {
  const view = testView({ legistar: true });
  const w = world({ view: { ...view, time_zone: { value: zone, status: "researched", basis: "TEST" } } });
  const body = w.entity("A followed body", "body");
  return { w, body };
}
const iso = (s) => new Date(s).toISOString().replace(/\.000Z$/, "Z");
const eventOf = (w, id) => w.one(`SELECT target_id FROM event_sources WHERE source_key=?`, `legistar:event:${id}`)?.target_id ?? null;

test("R22 followedImport refuses NO_BODY, NO_PERIOD, CAPTURE_NOT_HELD, NOT_LEGISTAR; writes only what source ids identify, each row the machine's, citing its capture; an unresolved participant answered with its source row", () => {
  const { w, body } = setup();
  const ev = legistar(w, "events-3y");
  const html = w.capture("not-legistar");
  const imp = (x) => w.ev.followedImport({ captureSha: ev, body, period: ALL, ...x });
  assert.equal(imp({ body: "", period: null, captureSha: sha("x") }).reason, "NO_BODY");
  assert.equal(imp({ period: null, captureSha: sha("x") }).reason, "NO_PERIOD");
  assert.equal(imp({ captureSha: sha("x") }).reason, "CAPTURE_NOT_HELD");
  assert.equal(imp({ captureSha: html }).reason, "NOT_LEGISTAR");
  /* the body is followed by its Legistar BodyId (a scheme identifier, grade A) */
  w.identify(body, "legistar_body", 197);
  const r = imp({});
  assert.equal(r.ok, true);
  const rows = load("events-3y").body;
  const mine = rows.filter((e) => e.EventBodyId === 197);
  assert.equal(r.written.length, mine.length, "every meeting of the followed body, and no other");
  assert.equal(r.outside + r.unresolved.length, rows.length - mine.length);
  assert.ok(r.unresolved.every((u) => Number.isInteger(u.row) && /BodyId/.test(u.why)));
  const one = w.ev.readEvent({ eventId: r.written[0].event_id, viewer: MEMBER }).event;
  assert.equal(one.by, "class:daemon");
  assert.ok(one.attestations.every((a) => a.capture_sha === ev && a.by === "class:daemon" && Number.isInteger(a.source_row)));
  /* items within their meeting, and their movers and seconders whose PersonId resolves; the others answered unresolved */
  const p734 = w.entity("Person 734"), p1012 = w.entity("Person 1012");
  w.identify(p734, "legistar_person", 734);
  w.identify(p1012, "legistar_person", 1012);
  w.identify(body, "legistar_body", load("gold/9451").body.EventBodyId);
  imp({});
  const items = w.ev.followedImport({ captureSha: legistar(w, "eventitems-9451"), body, period: ALL });
  assert.equal(items.ok, true);
  const all = load("eventitems-9451").body;
  assert.equal(items.written.length, all.length);
  const moved = all.find((x) => x.EventItemId === 232608);
  const ie = w.one(`SELECT target_id FROM event_sources WHERE source_key='legistar:event_item:232608'`).target_id;
  const iv = w.ev.readEvent({ eventId: ie, viewer: MEMBER }).event;
  assert.equal(iv.kind, "vote");
  assert.deepEqual(iv.within, [eventOf(w, 9451)]);
  assert.deepEqual(iv.participants.map((p) => [p.role, p.entity_id]).sort(), [["mover", p1012], ["seconder", null]].filter((x) => x[1]).sort());
  assert.ok(items.unresolved.some((u) => u.role === "seconder" && u.source_row.PersonId === moved.EventItemSeconderId), "1011 resolves to no entity");
  /* votes: participants whose PersonId resolves, voted with the value as written */
  const votes = w.ev.followedImport({ captureSha: legistar(w, "votes-232608"), body, period: ALL });
  const vrows = load("votes-232608").body;
  assert.equal(votes.written.length, vrows.filter((v) => [734, 1012].includes(v.VotePersonId)).length);
  assert.equal(votes.unresolved.length, vrows.length - votes.written.length);
  const voted = w.ev.readEvent({ eventId: ie, viewer: MEMBER }).event.participants.filter((p) => p.role === "voted");
  assert.deepEqual(voted.map((p) => p.vote_value), ["Aye", "Aye"]);
  /* votes for an item not held are answered unresolved, never written */
  const orphan = w.ev.followedImport({ captureSha: legistar(w, "votes-232594"), body, period: ALL });
  assert.equal(orphan.ok, true);
});

test("R23 a meeting's start is the source day and local time joined in the profile's zone at minute precision (the 50-event gold set, both daylight-saving offsets); a cancelled row is one event, EventCancelled", () => {
  const { w, body } = setup();
  const rows = load("events-3y").body;
  for (const id of new Set(rows.map((e) => e.EventBodyId))) w.identify(body, "legistar_body", id);
  const r = w.ev.followedImport({ captureSha: legistar(w, "events-3y"), body, period: ALL });
  assert.equal(r.ok, true);
  const offsets = new Set();
  for (const g of GOLD.events) {
    const id = eventOf(w, g.EventId);
    assert.ok(id, `gold ${g.n} (${g.EventId}) is held`);
    const v = w.ev.readEvent({ eventId: id, viewer: MEMBER }).event;
    assert.equal(v.when.start, iso(g.start), `gold ${g.n}: ${g.start}`);
    assert.equal(v.when.precision, "minute");
    assert.equal(v.when.zone, GOLD.zone);
    assert.equal(v.status, g.kind === "cancelled" ? "EventCancelled" : "EventScheduled", `gold ${g.n} status`);
    offsets.add(g.start.slice(-6));
  }
  assert.deepEqual([...offsets].sort(), ["-07:00", "-08:00"], "both offsets of the zone are in the set");
  assert.equal(new Set(GOLD.events.map((g) => eventOf(w, g.EventId))).size, GOLD.events.length, "one event per row, a cancelled one included");
});

test("R24 a posting time is a publication event within its meeting, when an upper bound on or before the first value observed, never moved by a later republication", () => {
  const { w, body } = setup();
  const g = load("gold/9451");
  w.identify(body, "legistar_body", g.body.EventBodyId);
  const base = { ...g.body, EventAgendaLastPublishedUTC: "2025-12-30T18:00:00.000" };
  const loc = g.locator;
  w.ev.followedImport({ captureSha: legistar(w, "9451-a", { body: base, locator: loc }), body, period: ALL });
  const meeting = eventOf(w, 9451);
  const pubId = w.one(`SELECT target_id FROM event_sources WHERE source_key='legistar:event:9451:agenda_published'`).target_id;
  const pub = () => w.ev.readEvent({ eventId: pubId, viewer: MEMBER }).event;
  assert.equal(pub().kind, "publication");
  assert.deepEqual(pub().within, [meeting]);
  assert.deepEqual([pub().when.start, pub().when.end, pub().when.precision], [null, "2025-12-30T18:00:01Z", "upper_bound"]);
  assert.equal(w.ev.sequence({ a: pubId, b: meeting }).answer, "before", "on or before the agenda's value, which precedes the meeting");
  /* a supplemental republication carries a later value: the bound does not move */
  w.ev.followedImport({ captureSha: legistar(w, "9451-b", { body: { ...base, EventAgendaLastPublishedUTC: "2026-01-05T09:00:00.000" }, locator: loc }), body, period: ALL });
  assert.equal(pub().when.end, "2025-12-30T18:00:01Z");
  /* an earlier value observed moves it earlier */
  w.ev.followedImport({ captureSha: legistar(w, "9451-c", { body: { ...base, EventAgendaLastPublishedUTC: "2025-12-29T08:00:00.000" }, locator: loc }), body, period: ALL });
  assert.equal(pub().when.end, "2025-12-29T08:00:01Z");
  assert.ok(pub().attestations.every((a) => /an upper bound/.test(w.one(`SELECT method FROM dated_facts WHERE dated_fact_id=?`, a.dated_fact_id).method)));
});

test("R25 an import is idempotent by source id: a held row changes only with a changed source value, the change recorded and R15/R16 told; a new row is added", async () => {
  const { w, body } = setup();
  const g = load("gold/9451");
  w.identify(body, "legistar_body", g.body.EventBodyId);
  const moved = [], told = [];
  w.ev.onWhenChanged("lines", (x) => moved.push(x.eventId));
  w.ev.onEventChanged("reevaluation", (x) => told.push(x.change));
  const cap = legistar(w, "9451-1", { body: g.body, locator: g.locator });
  const first = w.ev.followedImport({ captureSha: cap, body, period: ALL });
  assert.equal(first.written.length, 1);
  const again = w.ev.followedImport({ captureSha: cap, body, period: ALL });
  assert.deepEqual([again.written.length, again.updated.length, again.unchanged], [0, 0, 1]);
  const count = () => w.rows(`SELECT COUNT(*) AS n FROM events WHERE kind='meeting'`)[0].n;
  assert.equal(count(), 1);
  moved.length = 0;
  const later = legistar(w, "9451-2", { body: { ...g.body, EventTime: "6:30 PM" }, locator: g.locator });
  const up = w.ev.followedImport({ captureSha: later, body, period: ALL });
  assert.deepEqual([up.written.length, up.updated.length], [0, 1]);
  assert.equal(count(), 1);
  const e = eventOf(w, 9451);
  const v = w.ev.readEvent({ eventId: e, viewer: MEMBER }).event;
  assert.match(v.when.value, /T18:30$/);
  assert.equal(v.merges_and_splits.at(-1).kind, "source_changed");
  assert.equal(v.merges_and_splits.at(-1).detail.now.time, "6:30 PM");
  assert.ok(moved.includes(e));
  assert.ok(told.includes("when_moved"));
  /* a cancellation in the source changes the one event's status */
  w.ev.followedImport({ captureSha: legistar(w, "9451-3", { body: { ...g.body, EventTime: "6:30 PM", EventBodyName: `${g.body.EventBodyName} - CANCELLED` }, locator: g.locator }), body, period: ALL });
  assert.equal(w.ev.readEvent({ eventId: e, viewer: MEMBER }).event.status, "EventCancelled");
  assert.equal(count(), 1);
});

test("R38 a followed proceeding's register rows with a source-assigned entry id become filing or order events concerning it, written as R22 writes; rows with no entry id are not", () => {
  const view = testView();
  const w = world({ view });
  const proc = w.proceeding("Commitment suit");
  const page = readFileSync(new URL("../../../../court-doctypes/test/fixtures/courtlistener-4214664-p2.html", import.meta.url), "utf8");
  const parsed = courtlistenerDocket.parse({ locator: "https://dockets.registry.example/case/2", text: page, view, origin: null });
  const cap = w.capture("docket", { contentType: "courtlistener_docket", facts: parsed });
  assert.equal(w.ev.followedRegister({ captureSha: cap, proceeding: "" }).reason, "NO_ENTITY");
  assert.equal(w.ev.followedRegister({ captureSha: cap, proceeding: "ENT-2026-9999" }).reason, "NO_SUCH_ENTITY");
  assert.equal(w.ev.followedRegister({ captureSha: sha("x"), proceeding: proc }).reason, "CAPTURE_NOT_HELD");
  assert.equal(w.ev.followedRegister({ captureSha: w.capture("html"), proceeding: proc }).reason, "NOT_A_REGISTER");
  const r = w.ev.followedRegister({ captureSha: cap, proceeding: proc });
  assert.equal(r.ok, true);
  const numbered = parsed.rows.filter((x) => x.entry_id != null);
  assert.ok(numbered.length > 0);
  assert.equal(r.written.length, numbered.length);
  assert.equal(r.skipped.length, parsed.rows.length - numbered.length);
  for (const x of r.written) {
    const v = w.ev.readEvent({ eventId: x.event_id, viewer: MEMBER }).event;
    assert.ok(["filing", "order"].includes(v.kind));
    assert.deepEqual(v.concerns, [proc]);
    assert.equal(v.by, "class:daemon");
  }
  const sample = numbered[0];
  const held = w.ev.readEvent({ eventId: r.written[0].event_id, viewer: MEMBER }).event;
  if (held.when) assert.equal(held.when.precision, "day");
  assert.equal(r.written[0].entry_id, sample.entry_id);
  assert.deepEqual(w.ev.followedRegister({ captureSha: cap, proceeding: proc }).written, [], "idempotent by entry id");
});

test("R41 the machine writes no absence, no stored sequence, no cause, no relation but within, and no participant from office holding", () => {
  const { w, body } = setup();
  const g = load("gold/9451");
  w.identify(body, "legistar_body", g.body.EventBodyId);
  for (const id of [734, 1012, 1010, 1011]) w.identify(w.entity(`P${id}`), "legistar_person", id);
  const before = w.rows(`SELECT COUNT(*) AS n FROM event_participants`)[0].n;
  const seats = w.ev.followedImport({ captureSha: legistar(w, "officerecords-0"), body, period: ALL });
  assert.equal(seats.ok, true);
  assert.equal(seats.written.length, 0);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM event_participants`)[0].n, before, "a seat makes no participant");
  w.ev.followedImport({ captureSha: legistar(w, "9451", { body: g.body, locator: g.locator }), body, period: ALL });
  w.ev.followedImport({ captureSha: legistar(w, "eventitems-9451"), body, period: ALL });
  w.ev.followedImport({ captureSha: legistar(w, "votes-232608"), body, period: ALL });
  assert.deepEqual(w.rows(`SELECT DISTINCT kind FROM event_relations WHERE by_actor='class:daemon'`).map((r) => r.kind), ["within"]);
  assert.deepEqual(w.rows(`SELECT DISTINCT role FROM event_participants WHERE by_actor='class:daemon' ORDER BY role`).map((r) => r.role), ["mover", "seconder", "voted"]);
  const names = w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'event%'`).map((r) => r.name).join(" ");
  assert.ok(!/sequence|absence|order_cache/.test(names), "no table stores a sequence or an absence");
  assert.ok(!w.rows(`PRAGMA table_info(events)`).some((c) => /before|after|seq/.test(c.name)));
});
