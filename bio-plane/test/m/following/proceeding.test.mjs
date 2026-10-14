/* following R29–R31: a register followed for a proceeding (its capture handed to events), and the proceeding's own dates
   in two lanes. `events` and `entities` are the real modules; `actions.actionsFor` and `action-clocks.ourDeadlines` are
   the fixture's stand-ins coded to their requirements (actions R30, R65; action-clocks R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, proceedingEvent, MEMBER, BOB, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";
import { notAProceeding, noSuchEntity } from "../../../src/entities/index.mjs";
import { FOLLOWING_CHECKS } from "../../../src/following/index.mjs";

const REG = "https://dockets.registry.example/case/2";
const REG2 = "https://dockets.registry.example/case/3";
/* the register's page, and the rows its court-doctypes reading holds (events R38 reads `rows`, each with the source's entry id) */
const page = "<table><tr><td>docket</td></tr></table>";
const ROWS = [{ entry_id: "1", date: "2026-09-02", text: "Complaint filed" },
              { entry_id: "2", date: "2026-09-15", kind_as_written: "Order", text: "Order granting the motion" },
              { entry_id: null, date: "2026-09-20", text: "A note the register gives no entry id" }];

/* a world whose register addresses serve the docket page and land with its court-doctypes reading */
function docketWorld() {
  const w = world();
  const parsed = { rows: ROWS };
  /* a second address serves its own bytes: one capture is held by one bundle */
  for (const a of [REG, REG2]) { w.serve(a, a === REG ? page : `${page}<!-- ${a} -->`); w.readings.set(a, { content_type: "courtlistener_docket", facts: parsed }); }
  w.parsed = parsed;
  w.handed = [];
  const real = w.ev.followedRegister.bind(w.ev);
  w.ev.followedRegister = (args) => { const r = w.override ? w.override(args) : real(args); w.handed.push({ args, result: r }); return r; };
  return w;
}
const tables = (w) => ["follows", "follow_reads", "follow_ends", "watch_links", "portal_snapshots"].map((t) => w.rows(`SELECT count(*) AS n FROM ${t}`)[0].n);

test("R29 followRegister takes a proceeding: each read of that follow hands its newest capture to events.followedRegister as the machine, and the events written concern that proceeding (control: the same follow without proceeding hands nothing)", async () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const withP = w.f.followRegister({ address: REG, proceeding: proc, author: MEMBER, viewer: MEMBER });
  const without = w.f.followRegister({ address: REG2, author: MEMBER, viewer: MEMBER });
  assert.equal(withP.ok, true);
  assert.equal(without.ok, true);
  const t = await w.f.followTick(T0);
  assert.deepEqual(t.failed, []);
  assert.equal(w.handed.length, 1, "only the follow naming a proceeding hands a capture");
  const { args, result } = w.handed[0];
  assert.deepEqual([args.proceeding, args.by], [proc, MACHINE]);
  assert.equal(args.captureSha, t.captured.find((c) => c.follow === withP.follow).capture);
  assert.equal(result.ok, true);
  const numbered = w.parsed.rows.filter((x) => x.entry_id != null);
  assert.equal(result.written.length, numbered.length);
  assert.ok(result.written.length > 0);
  for (const x of result.written) {
    const v = w.ev.readEvent({ eventId: x.event_id, viewer: MEMBER }).event;
    assert.ok(["filing", "order"].includes(v.kind));
    assert.deepEqual(v.concerns, [proc]);
  }
  assert.equal(t.read.find((x) => x.follow === withP.follow).entries_written, numbered.length);
  assert.equal(t.read.find((x) => x.follow === without.follow).entries_written, undefined);
  /* the next day the same bytes are read again and handed again; events writes each entry once */
  const t2 = await w.f.followTick(T0 + DAY);
  assert.equal(w.handed.length, 2);
  assert.equal(t2.read.find((x) => x.follow === withP.follow).outcome, "unchanged");
  assert.deepEqual(w.handed[1].result.written, []);
  assert.equal(w.handed[1].args.captureSha, args.captureSha);
});

test("R29 follows answers proceeding per follow, or null; a follow without proceeding is unchanged", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const a = w.f.followRegister({ address: REG, proceeding: proc, author: MEMBER, viewer: MEMBER });
  const b = w.f.followRegister({ address: REG2, author: MEMBER, viewer: MEMBER });
  const items = w.f.follows({ viewer: MEMBER }).items;
  assert.equal(items.find((i) => i.follow === a.follow).proceeding, proc);
  assert.equal(items.find((i) => i.follow === b.follow).proceeding, null);
  assert.deepEqual(items.find((i) => i.follow === b.follow).subject, { kind: "register", address: REG2, render: false });
  w.f.followBody; /* a body follow answers null too */
  assert.ok(items.every((i) => "proceeding" in i));
});

test("R29 refusals, after R7's and before R22's, each writing nothing: an absent or unseen proceeding NO_SUCH_ENTITY (one answer), an entity of another kind NOT_A_PROCEEDING (control: a proceeding lands)", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const person = w.entity("A. Person", "person");
  const f = (x) => w.f.followRegister({ address: REG, author: MEMBER, viewer: MEMBER, ...x });
  const absent = f({ proceeding: "ENT-2026-9999" });
  const unseen = f({ proceeding: proc, viewer: "" });
  const blank = f({ proceeding: "  " });
  for (const r of [absent, unseen, blank]) assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NO_SUCH_ENTITY", "NO_SUCH_ENTITY", noSuchEntity("x").check]);
  assert.equal(unseen.translation, absent.translation, "absent and unseen are one answer");
  const other = f({ proceeding: person });
  assert.deepEqual([other.ok, other.reason, other.code], [false, "NOT_A_PROCEEDING", "NOT_A_PROCEEDING"]);
  assert.deepEqual(tables(w), [0, 0, 0, 0, 0]);
  /* the order: R7's refusals first, then this one, then R22's */
  assert.equal(f({ proceeding: person, author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  assert.equal(f({ proceeding: person, address: "http://insecure.example/x" }).reason, "NO_LOCATOR");
  assert.equal(f({ proceeding: person, cadence: "hourly" }).reason, "BAD_FOLLOW_CADENCE");
  assert.equal(f({ proceeding: person, ends: "2020-01-01" }).reason, "NOT_A_PROCEEDING");
  assert.equal(f({ proceeding: proc, ends: "2020-01-01" }).reason, "WATCH_END_REFUSED");
  assert.deepEqual(tables(w), [0, 0, 0, 0, 0]);
  assert.equal(f({ proceeding: proc }).ok, true);
});

test("R29 a person entity named as proceeding is refused NOT_A_PROCEEDING; R31 the answer is entities' own, the one site minting it, and this module holds no row of its own for it", () => {
  const w = docketWorld();
  const person = w.entity("A. Person", "person");
  const r = w.f.followRegister({ address: REG, proceeding: person, author: MEMBER, viewer: MEMBER });
  const own = notAProceeding();
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_A_PROCEEDING", "NOT_A_PROCEEDING", own.check, own.translation]);
  assert.equal(r.entity_id, person);
  assert.equal(r.kind, "person");
  const d = w.f.proceedingDates({ proceeding: person, viewer: MEMBER });
  assert.deepEqual([d.reason, d.check, d.translation], ["NOT_A_PROCEEDING", own.check, own.translation]);
  assert.equal("NOT_A_PROCEEDING" in FOLLOWING_CHECKS, false);
});

test("R29 a refusal events answers (CAPTURE_NOT_HELD, NOT_A_REGISTER) is counted in the tick's failed with its reason, and the follow stays due", async () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const a = w.f.followRegister({ address: REG, proceeding: proc, author: MEMBER, viewer: MEMBER });
  w.override = () => ({ ok: false, reason: "CAPTURE_NOT_HELD", detail: "the record holds no such capture" });
  const t = await w.f.followTick(T0);
  assert.deepEqual(t.failed.map((x) => [x.follow, x.reason]), [[a.follow, "CAPTURE_NOT_HELD"]]);
  assert.equal(t.read.find((x) => x.follow === a.follow).outcome, "failed");
  assert.equal(w.f.followDue(T0), true, "not read: still due");
  assert.equal(w.f.follows({ viewer: MEMBER }).items.find((i) => i.follow === a.follow).last_read, null);
  /* a capture that is no court register: the real events refuses NOT_A_REGISTER */
  w.override = null;
  w.readings.delete(REG);
  w.serve(REG, "<p>not a docket</p>");
  const t2 = await w.f.followTick(T0 + DAY);
  assert.deepEqual(t2.failed.map((x) => x.reason), ["NOT_A_REGISTER"]);
  assert.equal(w.f.followDue(T0 + DAY), true);
  /* once events accepts it the follow is read and no longer due until its cadence */
  w.readings.set(REG, { content_type: "courtlistener_docket", facts: w.parsed });
  w.serve(REG, `${page}<!-- corrected -->`);
  const t3 = await w.f.followTick(T0 + 2 * DAY);
  assert.deepEqual(t3.failed, []);
  assert.equal(w.f.followDue(T0 + 2 * DAY), false);
});

test("R29 a read by refreshRegister (an account-gated register) hands its capture to events too, stating what events answered", async () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const g = w.f.followRegister({ address: REG, gated: { kind: "account" }, proceeding: proc, author: MEMBER, viewer: MEMBER });
  const t = await w.f.followTick(T0);
  assert.equal(w.handed.length, 0, "a tick reads nothing gated and hands nothing");
  assert.equal(t.member_act_required.length, 1);
  const cred = { kind: "login", credential: "CRD-1", supplied_by: MEMBER };
  const r = await w.f.refreshRegister({ follow: g.follow, author: MEMBER, credential: cred });
  assert.equal(r.ok, true);
  assert.equal(w.handed.length, 1);
  assert.deepEqual([w.handed[0].args.proceeding, w.handed[0].args.captureSha, w.handed[0].args.by], [proc, r.capture, MACHINE]);
  assert.equal(r.register_import.ok, true);
  assert.equal(r.register_import.written, w.parsed.rows.filter((x) => x.entry_id != null).length);
  assert.equal(r.proceeding, proc);
  /* control: an events refusal is stated beside the capture, which is still answered */
  w.override = () => ({ ok: false, reason: "NOT_A_REGISTER", detail: "x" });
  w.serve(REG, `${page}<!-- changed -->`);
  const r2 = await w.f.refreshRegister({ follow: g.follow, author: MEMBER, credential: cred });
  assert.equal(r2.ok, true);
  assert.deepEqual([r2.register_import.ok, r2.register_import.reason], [false, "NOT_A_REGISTER"]);
});

/* ---------------------------------------------------------------------------------------------------------------- */

const act = (id, proceeding, clock) => ({ id, proceeding, clock });
const due = (date, owed_by = "group", status = "pending", extra = {}) => ({ status, owed_by, date, basis: "rule", text: `due ${date}`, ...extra });

test("R30 proceedingDates answers two lanes, never interleaved: the proceeding's own events as events.eventsFor answers them, with today's stage, and the group's own deadlines on its actions (controls: an action of another proceeding adds nothing; a body's pending duty, a met entry are not in group)", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const other = w.proceeding("Other suit");
  const past = proceedingEvent(w, proc, "2026-09-01", "hearing");
  const future = proceedingEvent(w, proc, "2026-11-20", "hearing");
  proceedingEvent(w, other, "2026-10-15", "hearing");
  w.actionRows.push(
    act("ACT-1", proc, [due("2026-10-20"), due("2026-10-10", "body"), due("2026-09-30", "group", "met")]),
    act("ACT-2", other, [due("2026-10-21")]),
    act("ACT-3", proc, [due("2026-10-12", "group", "pending", { basis: "statute" })]),
    act("ACT-4", null, [due("2026-10-13")]));
  const r = w.f.proceedingDates({ proceeding: proc, viewer: MEMBER });
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.lanes).sort(), ["group", "proceeding"]);
  const own = r.lanes.proceeding;
  assert.deepEqual(own.items.map((i) => i.event), [past.event, future.event], "the proceeding's own, in time order, past and future");
  for (const i of own.items) {
    assert.equal(i.kind, "hearing");
    assert.equal(typeof i.label, "string");
    assert.ok(i.when && i.when.start, "its when as held");
    assert.deepEqual(i.captures.length, 1);
  }
  assert.equal(own.items[0].captures[0], past.capture);
  assert.equal(own.truncated, false);
  const today = w.f.proceedingDates({ proceeding: proc, viewer: MEMBER }).lanes.proceeding.status;
  assert.deepEqual(own.status, w.ev.proceedingStatusAt({ proceeding: proc, at: "2026-10-06", viewer: MEMBER }), "today's stage as events answers it");
  assert.deepEqual(today, own.status);
  const g = r.lanes.group;
  assert.deepEqual(g.items.map((i) => [i.action, i.date, i.basis]), [["ACT-1", "2026-10-20", "rule"], ["ACT-3", "2026-10-12", "statute"]]);
  assert.equal(g.truncated, false);
  /* no lateness is stated and nothing is written */
  assert.doesNotMatch(JSON.stringify(r), /"past"|late|overdue|breach/i);
  assert.equal(JSON.stringify(own.items).includes("ACT-"), false, "the lanes are not interleaved");
  assert.deepEqual(tables(w), [0, 0, 0, 0, 0]);
});

test("R30 from and to bound both lanes' dated items; the group lane asks the deadlines with the viewer and those days", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const early = proceedingEvent(w, proc, "2026-09-01", "hearing");
  const mid = proceedingEvent(w, proc, "2026-10-15", "hearing");
  const late = proceedingEvent(w, proc, "2026-12-01", "hearing");
  w.actionRows.push(act("ACT-1", proc, [due("2026-09-02"), due("2026-10-16"), due("2026-12-02")]));
  const r = w.f.proceedingDates({ proceeding: proc, from: "2026-10-01", to: "2026-11-30", viewer: MEMBER });
  assert.deepEqual(r.lanes.proceeding.items.map((i) => i.event), [mid.event]);
  assert.deepEqual(r.lanes.group.items.map((i) => i.date), ["2026-10-16"]);
  assert.deepEqual([r.from, r.to], ["2026-10-01", "2026-11-30"]);
  assert.deepEqual(w.deadlineReads.at(-1), { from: "2026-10-01", to: "2026-11-30", after: null, viewer: MEMBER });
  assert.ok(early.event && late.event);
});

test("R30 an event placed nowhere is listed in the proceeding's lane with its undetermined date stated; a proceeding with no action reads no deadlines", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  proceedingEvent(w, proc, "2026-11-01", "hearing");
  const s = "f".repeat(64);
  w.bundle("INFO-2026-0902-x");
  w.st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0902-x', 'snapshots/z', 'utf8', 1, '2026-10-01T00:00:00Z')`, s);
  w.x.writeReading({ bundleId: "INFO-2026-0902-x", captureSha: s, composed: true,
    reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-10-01T00:00:00Z", entities: [], facts: {} } });
  const nowhere = w.ev.createEvent({ kind: "filing", status: "EventScheduled", concerns: [proc], attestations: [{ captureSha: s, extent: { kind: "document" } }], by: MEMBER });
  assert.equal(nowhere.ok, true, JSON.stringify(nowhere));
  const r = w.f.proceedingDates({ proceeding: proc, viewer: MEMBER });
  const n = r.lanes.proceeding.items.find((i) => i.event === (nowhere.event_id ?? nowhere.event?.event_id));
  assert.ok(n);
  assert.deepEqual([n.when, n.when_undetermined], [null, true]);
  assert.equal(typeof n.why, "string");
  assert.deepEqual(r.lanes.group, { items: [], limit: 500, truncated: false });
  assert.equal(w.deadlineReads.length, 0, "no action of the proceeding: no deadline is read");
});

test("R30 each lane holds at most 500 items with truncated: events' truncation is carried, and the group lane stops at 500 of 520 across pages of actions", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  for (let i = 0; i < 520; i++) w.actionRows.push(act(`ACT-${String(i).padStart(4, "0")}`, proc, [due("2026-10-20")]));
  const real = w.ev.eventsFor.bind(w.ev);
  let asked = null;
  w.ev.eventsFor = (a) => { asked = a; return { ...real(a), truncated: true }; };
  const r = w.f.proceedingDates({ proceeding: proc, viewer: MEMBER });
  assert.equal(asked.limit, 500, "events' bound");
  assert.equal(r.lanes.proceeding.truncated, true);
  assert.equal(r.lanes.group.items.length, 500);
  assert.equal(r.lanes.group.truncated, true);
  assert.equal(r.lanes.group.limit, 500);
  assert.equal(new Set(r.lanes.group.items.map((i) => i.action)).size, 500);
  /* control: 499 deadlines fill no lane to its bound */
  w.actionRows.length = 499;
  const r2 = w.f.proceedingDates({ proceeding: proc, viewer: MEMBER });
  assert.deepEqual([r2.lanes.group.items.length, r2.lanes.group.truncated], [499, false]);
});

test("R30 an absent or unseen proceeding answers as R29 refuses (NO_SUCH_ENTITY, one answer), and an entity of another kind NOT_A_PROCEEDING; a bad day is refused BAD_PROCEEDING_DATES; nothing is written", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  const person = w.entity("A. Person", "person");
  const absent = w.f.proceedingDates({ proceeding: "ENT-2026-9999", viewer: MEMBER });
  const unseen = w.f.proceedingDates({ proceeding: proc, viewer: null });
  assert.deepEqual([absent.reason, unseen.reason], ["NO_SUCH_ENTITY", "NO_SUCH_ENTITY"]);
  assert.equal(absent.translation, unseen.translation);
  assert.equal(w.f.proceedingDates({ proceeding: person, viewer: MEMBER }).reason, "NOT_A_PROCEEDING");
  for (const x of [{ from: "next week" }, { to: "2026-13-40" }, { from: "2026-11-01", to: "2026-10-01" }])
    assert.equal(w.f.proceedingDates({ proceeding: proc, viewer: MEMBER, ...x }).reason, "BAD_PROCEEDING_DATES", JSON.stringify(x));
  assert.equal(w.f.proceedingDates({ proceeding: proc, from: "2026-10-01", to: "2026-10-01", viewer: MEMBER }).ok, true);
  assert.deepEqual(tables(w), [0, 0, 0, 0, 0]);
});

test("R30 the proceeding's lane is what events.eventsFor answers to the viewer: an event whose only attestation the viewer cannot see is left out", () => {
  const w = docketWorld();
  const proc = w.proceeding("Commitment suit");
  w.project("PRJ-2026-0001-a", "alice");
  const seen = proceedingEvent(w, proc, "2026-11-01", "hearing");
  const asBob = w.f.proceedingDates({ proceeding: proc, viewer: BOB });
  const asOutsider = w.f.proceedingDates({ proceeding: proc, viewer: OUTSIDER });
  const direct = (v) => w.ev.eventsFor({ entity: proc, limit: 500, viewer: v });
  for (const [r, v] of [[asBob, BOB], [asOutsider, OUTSIDER]])
    assert.deepEqual(r.lanes.proceeding.items.map((i) => i.event), [...direct(v).events, ...direct(v).placed_nowhere].map((e) => e.event_id));
  assert.ok(seen.event);
});
