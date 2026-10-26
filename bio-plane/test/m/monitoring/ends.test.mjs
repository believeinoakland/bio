/* monitoring T45 (N855 6d, N882; Actions D6d, D15; v0.2 rules 6 and 17; K2781 (2)): an address's end date (R71), its
   watchers (R72), the end on R32's rows, and a clock entry's time of day (R34, R50; T46's R73: read from the item
   `pendingClocks` answers). Driven at the module's interface over the fixture's world (its profile's zone is
   America/Halifax, UTC-3 through 2026-11-01); R34 and R50 over the real actions and action-clocks modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, serve, sha, V, NOW_MS, DAEMON } from "./fixture.mjs";
import { escalationsDue } from "../escalation/fixtures.mjs";
import { monitoringOps, FREQUENCY_CHECKS, WATCH_END_CHECKS } from "../../../src/monitoring/index.mjs";

/* escalation as its real module answers in a world with no escalation open (its published fixture, R16) */
const emptyEscalation = () => escalationsDue().emptyWorld.esc;

const HOUR = 3600000, DAY = 24 * HOUR;
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const receipt = (w, addr, cap, at) => w.prov.recordReceipt({ address: addr, addressNorm: addr, captureSha: cap, retrieved: at,
  via: "direct", retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });

/* NOW_MS is 2026-09-28T12:00:00Z, 09:00 on the 28th in Halifax: today's local day is 2026-09-28. */
const TODAY = "2026-09-28", TOMORROW = "2026-09-29", YESTERDAY = "2026-09-27";
const ADDR = "https://records.example.org/agenda", OTHER = "https://records.example.org/other";
const P = "PROJ-2026-0950-p", Q = "PROJ-2026-0951-q";
/* Two monitored versions at ADDR (P's and Q's), a third at OTHER (P's), all daily. */
function watched() {
  const w = world();
  w.inProject(P, { owner: "carol" });
  w.inProject(Q, { owner: "erin", joined: ["carol"] });
  w.inProject(P, { owner: "carol", joined: ["erin"] });
  const a = w.monitored("INFO-2026-0950-a", ADDR, "agenda v1", { freq: "daily", lines: [`project: ${P}`] });
  const b = w.monitored("INFO-2026-0951-b", ADDR, "agenda v2", { freq: "daily", lines: [`project: ${Q}`] });
  receipt(w, ADDR, a.cap, "2026-09-01T00:00:00Z");
  receipt(w, ADDR, b.cap, "2026-09-02T00:00:00Z");
  const o = w.monitored("INFO-2026-0952-o", OTHER, "other v1", { freq: "daily", lines: [`project: ${P}`] });
  receipt(w, OTHER, o.cap, "2026-09-01T00:00:00Z");
  w.net.routes[ADDR] = serve("agenda v2");
  w.net.routes[OTHER] = serve("other v1");
  return w;
}
const end = (w, o) => w.m.addressWatchEnd({ address: ADDR, until: TODAY, by: "carol", viewer: V("carol"), ...o });
const ends = (w) => w.rows(`SELECT count(*) c FROM monitor_address_end`)[0].c;
const rowOf = (w, addr, viewer = DAEMON, now = NOW_MS) => w.m.monitoring({ viewer, now }).items.find((r) => r.address === addr) || null;

test("R71 addressWatchEnd refuses, in order, each with its row and nothing written: an empty or machine by (R52's code); an address no visible subject is at, absent and invisible alike (R52's code); until neither a calendar day nor null, or a day before today (WATCH_END_REFUSED); each with its control", () => {
  const w = watched();
  const refused = (o, code) => {
    const before = ends(w);
    const r = end(w, o);
    const row = FREQUENCY_CHECKS[code] || WATCH_END_CHECKS[code];
    assert.equal(r.ok, false, `${code}: ${JSON.stringify(o)}`);
    assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, row.check, row.translation], JSON.stringify(o));
    assert.match(r.detail, /Nothing was written\.$/);
    assert.equal(ends(w), before, `nothing written: ${JSON.stringify(o)}`);
    return r;
  };
  assert.equal(WATCH_END_CHECKS.WATCH_END_REFUSED.check, "C-18.19");
  /* 1: before every other condition (the rest of the request is wrong too) */
  const worst = { address: "https://nowhere.example.org/", until: "someday" };
  for (const by of ["", "  ", null, "class:daemon", "token:member", "claude", "class:admin"])
    refused({ ...worst, by }, "MACHINE_CANNOT_SET_FREQUENCY");
  /* 2: absent and hidden alike, before the day is read */
  const absent = refused(worst, "NO_SUCH_ADDRESS");
  const hidden = refused({ ...worst, address: ADDR, viewer: V("zed") }, "NO_SUCH_ADDRESS");
  assert.equal(absent.detail, hidden.detail, "absent and invisible alike");
  refused({ ...worst, address: null }, "NO_SUCH_ADDRESS");
  /* 3: not a calendar day, or before today */
  for (const until of ["someday", "2026-02-30", "2026-9-29", `${TOMORROW}T00:00`, 20260929, undefined, false, YESTERDAY, "2025-12-31"])
    refused({ until }, "WATCH_END_REFUSED");
  assert.equal(ends(w), 0);
  /* the controls: each condition met, it records (a member stamp is the same member) */
  for (const until of [TODAY, TOMORROW, "2027-01-01", null]) assert.equal(end(w, { until }).ok, true, String(until));
  assert.equal(end(w, { by: "member:carol", until: TOMORROW }).setting.by, "carol");
  assert.equal(ends(w), 5);
  /* any member who sees the address may record it (following R25 decides who may answer) */
  assert.equal(end(w, { by: "erin", viewer: V("erin"), until: null }).ok, true);
});

test("R71 a setting is appended with who and when and never edited; the latest governs; null returns the address to its frequency; every setting stays readable on the address's history", () => {
  const w = watched();
  const before = rowOf(w, ADDR);
  assert.deepEqual([before.state, before.frequency, before.until, before.ends], ["due", "daily", null, "none_set"]);
  const s1 = end(w, { until: TOMORROW });
  assert.deepEqual(s1.setting, { address: ADDR, seq: 1, until: TOMORROW, by: "carol", at: iso(NOW_MS) });
  w.clock.ms = NOW_MS + HOUR;
  const s2 = end(w, { until: null, by: "erin", viewer: V("erin") });
  assert.deepEqual(s2.history, [s1.setting, { address: ADDR, seq: 2, until: null, by: "erin", at: iso(NOW_MS + HOUR) }]);
  /* null: the address is back to its frequency, the row as before but for its history */
  const back = rowOf(w, ADDR, DAEMON, NOW_MS + HOUR);
  const { end_settings: history, ...rest } = back;
  assert.deepEqual(history, s2.history);
  assert.deepEqual(rest, before);
  /* the rows themselves are never edited */
  assert.deepEqual(w.rows(`SELECT seq, until, set_by FROM monitor_address_end ORDER BY seq`).map((x) => [x.seq, x.until, x.set_by]),
                   [[1, TOMORROW, "carol"], [2, null, "erin"]]);
});

test("R71 an address ended today is not ticked on the next cadence tick, nor due, nor looked at; its plan row is ended, stating the day, who set it and the documents still asking (asked_after_end), which do not restart it; control: an address ended tomorrow is ticked today", async () => {
  const w = watched();
  assert.equal(end(w, { until: TODAY }).ok, true);
  assert.equal(w.m.addressWatchEnd({ address: OTHER, until: TOMORROW, by: "carol", viewer: V("carol") }).ok, true);
  const plan = w.m.schedule(NOW_MS);
  assert.deepEqual(plan.due.map((d) => d.address), [OTHER], "only the address ended tomorrow is due");
  const e = plan.ended.find((r) => r.address === ADDR);
  assert.deepEqual([e.until, e.until_set, e.asked_after_end.sort()],
    [TODAY, { by: "carol", at: iso(NOW_MS) }, ["INFO-2026-0950-a", "INFO-2026-0951-b"]]);
  const looks = w.looks().length;
  const t = await w.m.cadenceTick(NOW_MS);
  assert.deepEqual(t.ticked.map((x) => x.address), [OTHER]);
  assert.deepEqual(w.net.seen, [OTHER], "no tick read the ended address");
  assert.equal(w.looks().filter((l) => l.subject === ADDR).length, 0, "no look written for it");
  assert.equal(w.looks().length, looks + 1);
  /* a document that still asks, newly promoted, does not restart it */
  const c = w.monitored("INFO-2026-0953-c", ADDR, "agenda v3", { freq: "hourly", lines: [`project: ${P}`] });
  receipt(w, ADDR, c.cap, "2026-09-03T00:00:00Z");
  assert.ok(w.m.schedule(NOW_MS + 2 * DAY).ended.find((r) => r.address === ADDR).asked_after_end.includes("INFO-2026-0953-c"));
  /* the next day the address ended tomorrow is ended too, and the cadence has nothing due */
  assert.equal(w.m.cadenceDue(NOW_MS + 2 * DAY), null);
  assert.equal(w.m.cadenceWake(NOW_MS + 2 * DAY), null, "an ended address holds no wake");
  assert.deepEqual(w.m.slate({ viewer: DAEMON, now: NOW_MS + 2 * DAY }).items, [], "nor a place on the due slate");
  /* null returns it to its frequency: due again */
  assert.equal(end(w, { until: null }).ok, true);
  assert.ok(w.m.schedule(NOW_MS + 2 * DAY).due.some((d) => d.address === ADDR));
});

test("R71 R31 no monitoring-recheck-due item is drawn for an ended address: its R32 row reads ended, neither overdue nor unscheduled (the arm machinery-producers reads); control: an unscheduled address still draws it", () => {
  const w = watched();
  /* checked three days ago: daily, overdue by more than its interval */
  w.st.sql.exec(`UPDATE bundle_projection SET monitor_last_checked=?`, iso(NOW_MS - 3 * DAY));
  w.monitored("INFO-2026-0954-meet", "https://records.example.org/meet", "m v1", { freq: "per_meeting" });
  /* machinery-producers' recheck arm, as it reads R32's rows */
  const draws = (r) => (r.state === "due" && Number.isFinite(Date.parse(r.due_at)) && NOW_MS - Date.parse(r.due_at) > r.interval_ms)
    || r.state === "unscheduled";
  assert.equal(draws(rowOf(w, ADDR)), true, "before its end, overdue: drawn");
  assert.equal(end(w, { until: TODAY }).ok, true);
  const r = rowOf(w, ADDR);
  assert.deepEqual([r.state, r.until, draws(r)], ["ended", TODAY, false]);
  const meet = w.m.monitoring({ viewer: DAEMON, now: NOW_MS }).items.find((i) => i.bundle === "INFO-2026-0954-meet");
  assert.deepEqual([meet.state, draws(meet)], ["unscheduled", true], "an unscheduled address still draws it");
  assert.equal(w.m.monitoring({ viewer: DAEMON, now: NOW_MS }).counts.ended, 1);
});

test("R32 every watched address shows its end date: until with who set it and when, or until null with ends none_set; an ended row's documents still asking name only those the viewer sees", () => {
  const w = watched();
  for (const r of w.m.monitoring({ viewer: DAEMON, now: NOW_MS }).items)
    assert.deepEqual([r.until, r.ends, "until_set" in r], [null, "none_set", false], r.address);
  assert.equal(end(w, { until: TOMORROW }).ok, true);
  const r = rowOf(w, ADDR);
  assert.deepEqual([r.state, r.until, r.until_set, "ends" in r], ["due", TOMORROW, { by: "carol", at: iso(NOW_MS) }, false]);
  assert.deepEqual(r.end_settings, [{ address: ADDR, seq: 1, until: TOMORROW, by: "carol", at: iso(NOW_MS) }]);
  assert.deepEqual([rowOf(w, OTHER).until, rowOf(w, OTHER).ends], [null, "none_set"]);
  /* ended, read by a viewer who sees only some of the documents still asking */
  assert.equal(end(w, { until: TODAY }).ok, true);
  /* dave joins Q alone: he sees Q's document at the address, never P's */
  w.inProject(Q, { owner: "erin", joined: ["carol", "dave"] });
  assert.deepEqual([w.membership.inSight("INFO-2026-0950-a", V("dave")), w.membership.inSight("INFO-2026-0951-b", V("dave"))], [false, true]);
  const dave = rowOf(w, ADDR, V("dave"));
  assert.deepEqual([dave.state, dave.asked_after_end], ["ended", ["INFO-2026-0951-b"]]);
  assert.equal(JSON.stringify(w.m.monitoring({ viewer: V("dave"), now: NOW_MS })).includes("INFO-2026-0950-a"), false);
  assert.deepEqual(rowOf(w, ADDR, V("carol")).asked_after_end.sort(), ["INFO-2026-0950-a", "INFO-2026-0951-b"]);
});

test("R71 with no zone held for the instance, today cannot be read: a day is refused WATCH_END_REFUSED (never the UTC day), null is accepted, and a held day is stated undetermined, the address still watched", () => {
  const w = watched();
  assert.equal(end(w, { until: TOMORROW }).ok, true);
  assert.equal(w.record.setSetting("jurisdiction_profiles", [], V("admin")).ok, true, "no profile active: no zone held");
  const r = end(w, { until: "2099-01-01" });
  assert.deepEqual([r.ok, r.reason], [false, "WATCH_END_REFUSED"]);
  assert.match(r.detail, /no time zone is held/);
  w.clock.ms = NOW_MS + 3 * DAY;
  const row = rowOf(w, ADDR, DAEMON, NOW_MS + 3 * DAY);
  assert.deepEqual([row.state, row.until], ["due", TOMORROW]);
  assert.match(row.end_undetermined, /no time zone is held/);
  assert.equal(end(w, { until: null }).ok, true, "null still clears");
});

test("R71 R72 neither is served as an op: following calls them in process", () => {
  const w = watched();
  const ops = monitoringOps(w.m, new URL("http://do/x"), {});
  for (const k of Object.keys(ops)) assert.equal(/watch|end/i.test(k), false, k);
});

test("R72 addressWatchers answers the projects whose documents ask to be monitored at the normalised address (R15's grouping), and [] for an address no subject is at; a document that no longer asks is left out (control: one that asks is in); it writes nothing and never throws", () => {
  const w = watched();
  assert.deepEqual(w.m.addressWatchers(ADDR), [P, Q].sort(), "two projects' documents at one address answer both");
  assert.deepEqual(w.m.addressWatchers("https://RECORDS.example.org/agenda"), [P, Q].sort(), "the normalised address");
  assert.deepEqual(w.m.addressWatchers(OTHER), [P]);
  for (const x of ["https://nowhere.example.org/", "", null, undefined, 42]) assert.deepEqual(w.m.addressWatchers(x), [], String(x));
  /* Q's document stops asking: Q is left out */
  /* as retrieval projects a revision whose monitoring.enabled is false (the column R15 reads) */
  w.st.sql.exec(`UPDATE bundle_projection SET monitor_enabled=0 WHERE bundle_id='INFO-2026-0951-b'`);
  assert.deepEqual(w.m.addressWatchers(ADDR), [P]);
  /* an ended address is still a subject whose documents ask: its watchers are answered */
  assert.equal(end(w, { until: TODAY }).ok, true);
  assert.deepEqual(w.m.addressWatchers(ADDR), [P]);
  /* never throws */
  const real = w.m.subjects;
  w.m.subjects = () => { throw new Error("gone"); };
  assert.deepEqual(w.m.addressWatchers(ADDR), []);
  w.m.subjects = real;
});

/* R34, R50: an action with clock entries, some carrying a time of day (`due_at`, `due_zone`), by a member. */
const actionMd = (id, clock) => ["---", `id: ${id}`, "object_type: action", `title: ${id}`, "current_state: planned",
  'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "action_kind: records_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery",
  "clock:", ...clock.flatMap(({ text, date, at = null, zone = null }) => [`  - text: ${text}`, `    description: ${text} window`,
    `    date: ${date}`, "    basis: statute", "    status: pending", ...(at ? [`    due_at: "${date}T${at}"`] : []),
    ...(zone ? [`    due_zone: ${zone}`] : [])]), "---", "", "An action.", ""].join("\n");
const createAction = (w, id, clock) => {
  const md = actionMd(id, clock);
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `20260920T000000Z_${id.slice(10, 14)}`, author: V("alice"),
    meta: { object_type: "action", group: "test-group", title: id, current_state: "planned", created: "2026-09-01T00:00:00Z", last_updated: "2026-09-01T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
};
const clockWorld = () => world({ realActions: true, escalation: emptyEscalation() });
/* 12:00 on the 28th in Halifax (UTC-3) is 15:00 UTC */
const NOON = Date.parse(`${TODAY}T15:00:00Z`);

const MINUTE = 60000;

/* K2874 (B3): held as `test.todo` from T45 until actions R33's machine bound admitted a timed entry's move once its
   instant has passed (its R98, T46-32); made tests by R73 (T46-41, N922). */
test("R34 R73 an entry due 12:00 in the office's zone is marked at a tick at 12:01 that day (control: at 11:59 it is not); a date-only entry is still marked on the next local day", async () => {
  const w = clockWorld();
  const id = "ACTN-2026-0960-noon";
  createAction(w, id, [{ text: "noon", date: TODAY, at: "12:00" }, { text: "day", date: TODAY }]);
  w.clock.ms = NOON - MINUTE;
  const early = await w.m.deadlineRecheck(NOON - MINUTE);
  assert.deepEqual([early.ok, early.marked, early.failed], [true, [], []]);
  assert.deepEqual(w.fm(id).clock.map((e) => e.status), ["pending", "pending"], "11:59: not yet past");
  w.clock.ms = NOON + MINUTE;
  const r = await w.m.deadlineRecheck(NOON + MINUTE);
  assert.deepEqual(r.marked.map((m) => [m.action, m.ords]), [[id, [0]]], "12:01: past at that instant");
  assert.deepEqual(w.fm(id).clock.map((e) => e.status), ["overdue", "pending"], "the date-only entry of the same day is not");
  assert.equal(w.manifest(id).at(-1).operation, "deadline-recheck");
  /* the date-only entry: not at the last instant of its day, marked at the start of the next */
  const next = Date.parse(`${TOMORROW}T03:00:00Z`);
  w.clock.ms = next - 1000;
  assert.deepEqual((await w.m.deadlineRecheck(next - 1000)).marked, []);
  w.clock.ms = next;
  assert.deepEqual((await w.m.deadlineRecheck(next)).marked.map((m) => m.ords), [[1]]);
});

test("R34 R73 the time of day is read in the entry's own zone when it names one (due_zone), else the office's; a wall time the zone skips or repeats that day is read by its date alone, never marked early", async () => {
  const w = clockWorld();
  const id = "ACTN-2026-0961-zone";
  /* 12:00 in Los Angeles (UTC-7 in September) is 19:00 UTC */
  createAction(w, id, [{ text: "west", date: TODAY, at: "12:00", zone: "America/Los_Angeles" }]);
  const west = Date.parse(`${TODAY}T19:00:00Z`);
  w.clock.ms = west - MINUTE;
  assert.deepEqual((await w.m.deadlineRecheck(west - MINUTE)).marked, [], "noon in Halifax is not noon in Los Angeles");
  w.clock.ms = west;
  assert.deepEqual((await w.m.deadlineRecheck(west)).marked.map((m) => m.action), [id], "past at that instant");
  /* 01:30 on 2026-11-01 happens twice in Halifax: read by its date alone */
  const x = clockWorld();
  createAction(x, "ACTN-2026-0962-twice", [{ text: "twice", date: "2026-11-01", at: "01:30" }]);
  const late = Date.parse("2026-11-01T12:00:00Z");
  x.clock.ms = late;
  assert.deepEqual((await x.m.deadlineRecheck(late)).marked, [], "not marked on its day");
  assert.equal(x.m.deadlineRecheckWake(NOW_MS), Date.parse("2026-11-02T04:00:00Z"), "its wake is the next local day's start");
});

test("R50 among pending entries, one with a time of day offers that instant as its candidate, in place of the start of the next local day; deadlineRecheckDue is due from it", async () => {
  const w = clockWorld();
  createAction(w, "ACTN-2026-0963-later", [{ text: "later", date: "2026-10-05" }]);
  assert.equal(w.m.deadlineRecheckWake(NOW_MS), Date.parse("2026-10-06T03:00:00Z"));
  createAction(w, "ACTN-2026-0964-noon", [{ text: "noon", date: TODAY, at: "12:00" }]);
  assert.equal(w.m.deadlineRecheckWake(NOW_MS), NOON, "the instant, not the start of the 29th");
  assert.deepEqual([w.m.deadlineRecheckDue(NOON - 1), w.m.deadlineRecheckDue(NOON)], [null, NOON]);
  /* a date-only entry of the same day offers the start of the next day, later than the timed one */
  createAction(w, "ACTN-2026-0965-day", [{ text: "day", date: TODAY }]);
  assert.equal(w.m.deadlineRecheckWake(NOW_MS), NOON);
  /* marked, the timed entry holds the wake no more */
  w.clock.ms = NOON;
  await w.m.deadlineRecheck(NOON);
  assert.equal(w.m.deadlineRecheckWake(NOON), Date.parse(`${TOMORROW}T03:00:00Z`));
});

/* R73 (T46; N918): the instant is the item's, never the document's. */
test("R73 R34 a timed entry's instant is read from the pendingClocks item (its due_at in its due_zone), never from the action's document: an item that answers no time of day is read by its date alone though the document states one (control: the item as action-clocks answers it is marked at its instant)", async () => {
  const w = clockWorld();
  const id = "ACTN-2026-0966-item";
  createAction(w, id, [{ text: "noon", date: TODAY, at: "12:00" }]);
  const real = w.clocks.pendingClocks.bind(w.clocks);
  /* the control: action-clocks answers the entry's instant and zone (its R19) */
  const asRead = real({ before: TOMORROW, viewer: DAEMON }).items.find((x) => x.action === id);
  assert.deepEqual([asRead.due_at, asRead.due_zone], [`${TODAY}T12:00`, "America/Halifax"]);
  /* the item stripped of its time of day: the document's due_at is not read in its place */
  w.clocks.pendingClocks = (q) => { const p = real(q); return { ...p, items: p.items.map((x) => ({ ...x, due_at: null, due_zone: null })) }; };
  w.clock.ms = NOON + MINUTE;
  assert.deepEqual((await w.m.deadlineRecheck(NOON + MINUTE)).marked, [], "a date-only item is not past on its own day");
  assert.equal(w.m.deadlineRecheckWake(NOON + MINUTE), Date.parse(`${TOMORROW}T03:00:00Z`), "its wake is the next local day's start");
  assert.equal(w.fm(id).clock[0].status, "pending");
  /* the item as answered: marked at its instant */
  w.clocks.pendingClocks = real;
  assert.equal(w.m.deadlineRecheckWake(NOON - MINUTE), NOON);
  assert.deepEqual((await w.m.deadlineRecheck(NOON + MINUTE)).marked.map((m) => [m.action, m.ords]), [[id, [0]]]);
  assert.equal(w.fm(id).clock[0].status, "overdue");
});

test("R73 R50 the wake reads each item's own instant without reading any document: an item with due_at and due_zone offers that instant; one answering both null, one naming no zone, and one whose due_at is not on its date are read by their date alone (each a control of the others)", () => {
  const item = (o) => ({ action: "ACTN-2026-0967-none", ord: 0, date: TODAY, ...o });
  const wake = (it) => {
    const w = world({ actionClocks: { pendingClocks: () => ({ ok: true, items: [it], truncated: false, cursor: null }) } });
    w.record.readImage = () => { throw new Error("the action's document is not read"); };
    return w.m.deadlineRecheckWake(NOW_MS);
  };
  const dayEnd = Date.parse(`${TOMORROW}T03:00:00Z`);
  assert.equal(wake(item({ due_at: `${TODAY}T12:00`, due_zone: "America/Halifax" })), NOON);
  /* 12:00 in Los Angeles (UTC-7 in September) is 19:00 UTC: the item's zone, not the office's */
  assert.equal(wake(item({ due_at: `${TODAY}T12:00`, due_zone: "America/Los_Angeles" })), Date.parse(`${TODAY}T19:00:00Z`));
  assert.equal(wake(item({ due_at: `${TODAY}T12:00:30`, due_zone: "America/Halifax" })), NOON + 30000, "seconds are read");
  assert.equal(wake(item({ due_at: null, due_zone: null })), dayEnd, "a date-only item");
  assert.equal(wake(item({})), dayEnd, "an item answering no time of day");
  assert.equal(wake(item({ due_at: `${TODAY}T12:00`, due_zone: null })), dayEnd, "no zone: never read early");
  assert.equal(wake(item({ due_at: `${TOMORROW}T12:00`, due_zone: "America/Halifax" })), dayEnd, "a time not on its date");
  assert.equal(wake(item({ due_at: `${TODAY}T12:00`, due_zone: "Not/AZone" })), dayEnd, "a zone that cannot be read");
});
