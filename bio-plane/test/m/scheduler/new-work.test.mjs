/* scheduler: the six consumers of T33's new work (R21; T33-80, K1466, K1481, K1491, K1522, K1566): `follow`,
   `duty-transitions`, `interest-checks`, `money-detectors`, `standing-questions` and `dated-waits`, at their place in
   R5's order (after `working-on-attest`), each calling its owner's services, its answer under its R2 key; the three
   whose owners state no due or wake run once per local day at the group's local day start and again at every firing
   while a pass is under way; and the dated wait's arm through inquiry's notice (R9). The last tests run the real
   `duties` and `inquiry` in their own test worlds (`test/m/duties/fixture.mjs`, `test/m/inquiry/fixture.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCHEDULER_ORDER, SCHEDULER_KEYS, RANKED, DAILY, DETECTORS_BUDGET_MS, Scheduler, localDayOf } from "../../../src/scheduler/index.mjs";
import { world, storage, writes, NOW } from "./fixture.mjs";
import { world as dutiesWorld } from "../duties/fixture.mjs";
import { world as inquiryWorld, inquiryMd, V } from "../inquiry/fixture.mjs";

const SIX = ["follow", "duty-transitions", "interest-checks", "money-detectors", "standing-questions", "dated-waits"];
const KEYS = ["follow", "dutytransitions", "interestchecks", "moneydetectors", "standingquestions", "datedwaits"];
const DAY = 86_400_000;
const LA = "America/Los_Angeles";   /* UTC-7 in late September: the local day starts at 07:00Z */
/* NOW is 2026-09-28T12:00:00Z: 05:00 on the 28th in LA */
const LA_TODAY = Date.parse("2026-09-28T07:00:00Z"), LA_TOMORROW = Date.parse("2026-09-29T07:00:00Z");
const UTC_TODAY = Date.parse("2026-09-28T00:00:00Z");
const TEXT = "2026-09-28T12:00:00Z";
const DAILY_TICK = { "duty-transitions": "duties.recordTransitions", "interest-checks": "people.evaluateChecks",
                     "money-detectors": "moneyChecks.runDetectors" };

test("R5, R21: the six stand after working-on-attest, in R21's order, follow before duty-transitions; R2: each answers under its own key", () => {
  const { s } = world({}, null, { daily: true });
  const names = s.consumers();
  assert.deepEqual(names.slice(names.indexOf("working-on-attest")), ["working-on-attest", ...SIX]);
  assert.deepEqual(SIX.map((n) => SCHEDULER_KEYS[n]), KEYS);
  assert.deepEqual([...DAILY], ["duty-transitions", "interest-checks", "money-detectors"]);
  for (const n of SIX) assert.ok(SCHEDULER_ORDER.includes(n), n);
  /* each is its owner's: without the owner it is absent */
  assert.deepEqual(new Scheduler({ storage: storage(), owners: {} }).consumers(), []);
});

test("R21, R2: each consumer calls exactly its owner's services, its answer under its key; a consumer that did not tick is absent", async () => {
  const { s, calls } = world({ follow: { due: true, wake: NOW + 9000, tick: { read: 2 } },
    "standing-questions": { due: 1, tick: { at: TEXT, ran: [{ id: "STQ-1" }], remaining: 0 } },
    "dated-waits": { due: true, tick: { marked: [{ inquiry: "INQ-1", index: 0 }] } } }, null, { daily: true });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.follow, { read: 2 });
  assert.deepEqual(r.standingquestions.ran, [{ id: "STQ-1" }]);
  assert.deepEqual(r.datedwaits.marked, [{ inquiry: "INQ-1", index: 0 }]);
  for (const k of ["dutytransitions", "interestchecks", "moneydetectors"]) assert.equal(typeof r[k], "object", k);
  const called = new Set(calls.map(([m]) => m));
  for (const m of ["following.followDue", "following.followWake", "following.followTick", "duties.recordTransitions",
                   "people.evaluateChecks", "moneyChecks.runDetectors", "answers.standingDue",
                   "answers.standingTick", "inquiry.datedWaitsDue", "inquiry.datedWaitsTick"])   /* their wakes: the next test */
    assert.ok(called.has(m), m);
  /* nothing due: the three owner-timed consumers are absent */
  const quiet = await world({}, null).s.onAlarm(NOW);
  for (const k of ["follow", "standingquestions", "datedwaits"]) assert.equal(k in quiet, false, k);
});

test("R21, R10: follow is batch-bounded and receives the rank with its now; the other five are given their now alone", async () => {
  assert.ok(RANKED.includes("follow"));
  for (const n of SIX.slice(1)) assert.equal(RANKED.includes(n), false, n);
  const served = { ok: true, truncated: false, serves: [{ kind: "address", id: "g", gaps: ["k"], aspirations: [] }] };
  const { s, calls } = world({ follow: { due: NOW }, "standing-questions": { due: 1 }, "dated-waits": { due: true },
                               serves: { tick: served } }, null, { daily: true });
  await s.onAlarm(NOW);
  const [, now, rank] = calls.find(([m]) => m === "following.followTick");
  assert.equal(now, NOW);
  assert.deepEqual(rank([{ kind: "address", id: "p", waitingSince: NOW - 9 }, { kind: "address", id: "g", waitingSince: NOW - 1 }])
    .map((x) => x.id), ["g", "p"], "the follow's subjects ranked by what they serve");
  for (const m of ["answers.standingTick", "inquiry.datedWaitsTick"]) assert.equal(calls.find(([x]) => x === m).length, 2, m);
  for (const m of Object.values(DAILY_TICK)) assert.equal(calls.find(([x]) => x === m).length, 2, m);
});

test("R21: answers' and inquiry's services read now as instant text, and their wakes are read back as instants; one due now wants now", async () => {
  const later = "2026-10-01T07:00:00Z";
  const { s, calls, set } = world({ "standing-questions": { due: 0, wake: later }, "dated-waits": { due: false, wake: later } });
  assert.equal(await s.arm(NOW), Date.parse(later), "the earliest wake, read from instant text");
  for (const m of ["answers.standingDue", "answers.standingWake", "inquiry.datedWaitsDue", "inquiry.datedWaitsWake"])
    assert.deepEqual(calls.find(([x]) => x === m), [m, TEXT], `${m}: told now as instant text`);
  /* a wait due today, whose owner's wake names only later days: the consumer wants now */
  set["dated-waits"].due = true;
  assert.equal(await s.arm(NOW), NOW, "due now: armed now");
  const r = await s.onAlarm(NOW);
  assert.deepEqual(calls.filter(([m]) => m === "inquiry.datedWaitsTick"), [["inquiry.datedWaitsTick", TEXT]]);
  assert.deepEqual(r.datedwaits, { marked: [] });
  /* a count of standing questions due is due now; zero is not due */
  set["dated-waits"].due = false; set["standing-questions"].due = 3;
  assert.ok("standingquestions" in (await s.onAlarm(NOW)));
  set["standing-questions"].due = 0;
  assert.equal("standingquestions" in (await s.onAlarm(NOW)), false);
});

test("R21 (K1522): a daily consumer is due at the group's local day start, runs once that day, and wakes at the next local day's start", async () => {
  for (const name of DAILY) {
    const { s, st, calls } = world({ [name]: { tick: () => (name === "duty-transitions" ? { ok: true, duties_read: 3, recorded: 1, cursor: null, done: true }
      : name === "interest-checks" ? { ok: true, evaluated: 4, remaining: false } : { ok: true, detectors: 2, remaining: false, cursor: null }) } },
      null, { zone: LA });
    assert.equal(await s.arm(NOW), LA_TODAY, `${name}: not yet run today: its wake is today's local start, already passed`);
    const r = await s.onAlarm(NOW);
    const key = SCHEDULER_KEYS[name];
    assert.deepEqual(r[key].local_day, { date: "2026-09-28", zone: LA }, `${name}: the local day it ran for`);
    assert.equal(r.nextAt, LA_TOMORROW, `${name}: the next local day's start`);
    assert.equal(key in (await s.onAlarm(NOW + 3_600_000)), false, `${name}: not again that day`);
    assert.equal(calls.filter(([m]) => m === DAILY_TICK[name]).length, 1);
    const next = await s.onAlarm(LA_TOMORROW);
    assert.deepEqual(next[key].local_day.date, "2026-09-29", `${name}: the next day`);
    assert.equal(st.alarm, LA_TOMORROW + DAY);
  }
});

test("R21: with no time zone held the day read is the UTC day, and the answer says so (zone null)", async () => {
  const { s } = world({ "duty-transitions": { tick: { ok: true, duties_read: 1, recorded: 0, cursor: null, done: true } } });
  assert.equal(await s.arm(NOW), UTC_TODAY);
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.dutytransitions.local_day, { date: "2026-09-28", zone: null });
  assert.equal(r.nextAt, UTC_TODAY + DAY);
  assert.deepEqual(localDayOf(NOW, "Not/AZone"), { date: "2026-09-28", zone: null, start: UTC_TODAY, next: UTC_TODAY + DAY },
    "a zone civil-time refuses is read as no zone");
  assert.deepEqual(localDayOf(NOW, LA), { date: "2026-09-28", zone: LA, start: LA_TODAY, next: LA_TOMORROW });
});

test("R21 (K1566): while a pass is under way it is due at every firing, its owner's cursor handed back, until the owner answers none", async () => {
  /* duties: done false with a cursor, then done */
  const d = [{ ok: true, duties_read: 5, recorded: 2, cursor: "DUT-2026-0005", done: false }, { ok: true, duties_read: 2, recorded: 0, cursor: null, done: true }];
  const dw = world({ "duty-transitions": { tick: () => d.shift() } }, null, { zone: LA });
  const r1 = await dw.s.onAlarm(NOW);
  assert.equal(r1.nextAt, NOW, "under way: wanted again at once");
  await dw.s.onAlarm(NOW + 10);
  const asked = dw.calls.filter(([m]) => m === "duties.recordTransitions").map(([, a]) => a);
  assert.deepEqual(asked, [{ asOf: TEXT }, { asOf: "2026-09-28T12:00:00Z", cursor: "DUT-2026-0005" }],
    "asOf the firing; the cursor handed back; no budget given (duties states its own)");
  assert.equal(dw.st.alarm, LA_TOMORROW, "the pass done: tomorrow");
  /* money-checks: remaining with a cursor, given the budget its siblings state */
  const m = [{ ok: true, detectors: 1, remaining: true, cursor: "{\"d\":\"D1\",\"s\":\"x\"}" }, { ok: true, detectors: 1, remaining: false, cursor: null }];
  const mw = world({ "money-detectors": { tick: () => m.shift() } }, null, { zone: LA });
  assert.equal((await mw.s.onAlarm(NOW)).nextAt, NOW);
  await mw.s.onAlarm(NOW + 10);
  assert.deepEqual(mw.calls.filter(([x]) => x === "moneyChecks.runDetectors").map(([, a]) => a),
    [{ budgetMs: DETECTORS_BUDGET_MS, cursor: null }, { budgetMs: DETECTORS_BUDGET_MS, cursor: "{\"d\":\"D1\",\"s\":\"x\"}" }]);
  assert.equal(DETECTORS_BUDGET_MS, 1000);
  /* people: remaining true; people holds its own cursor and states its own budget */
  const p = [{ ok: true, evaluated: 50, remaining: true }, { ok: true, evaluated: 3, remaining: false }];
  const pw = world({ "interest-checks": { tick: () => p.shift() } }, null, { zone: LA });
  assert.equal((await pw.s.onAlarm(NOW)).nextAt, NOW);
  assert.equal((await pw.s.onAlarm(NOW + 10)).nextAt, LA_TOMORROW);
  assert.deepEqual(pw.calls.filter(([x]) => x === "people.evaluateChecks").map(([, a]) => a), [{}, {}]);
});

test("R21, R15: a daily consumer whose pass found nothing to work over wants no wake, so an idle instance holds no timer; the next start asks again", async () => {
  for (const name of DAILY) {
    const { s, st } = world({ [name]: {} }, null, { zone: LA });   /* the owners' empty answers: nothing held */
    const r = await s.onAlarm(NOW);
    assert.equal(SCHEDULER_KEYS[name] in r, true, `${name}: its first pass ran`);
    assert.deepEqual([r.nextAt, st.alarm], [null, null], `${name}: nothing to work over: no alarm`);
    assert.equal(await s.arm(NOW + DAY), null, `${name}: an arm the next day sets none`);
    assert.equal(await s.start(NOW + DAY), LA_TOMORROW, `${name}: the instance's next start asks again, at the next local day`);
  }
});

test("R21, R3: a daily pass that throws, or that its owner refuses, is answered under its key and counts the day as run, so the alarm never spins", async () => {
  const { s, st } = world({ "money-detectors": { throws: "tick" }, "duty-transitions": { tick: { ok: false, reason: "NO_AS_OF" } } }, null, { zone: LA });
  const r = await s.onAlarm(NOW);
  assert.deepEqual(r.moneydetectors, { error: "money-detectors tick broke" });
  assert.equal(r.dutytransitions.reason, "NO_AS_OF");
  assert.deepEqual([r.nextAt, st.alarm], [LA_TOMORROW, LA_TOMORROW], "tried again the next local day, not at once");
});

test("R21, R18: the daily consumers' state is the storage value sched_daily, never a table: a restarted instance does not run a pass twice in a day", async () => {
  const st = storage();
  const set = { "duty-transitions": { tick: { ok: true, duties_read: 2, recorded: 0, cursor: null, done: true } } };
  const a = world(set, null, { zone: LA, st });
  await a.s.onAlarm(NOW);
  assert.deepEqual(st.kv.get("sched_daily"), { "duty-transitions": { day: "2026-09-28", cursor: null, more: false } });
  const touched = new Set(st.log.filter(([m]) => m === "put" || m === "get").map(([m, k]) => `${m}:${k}`));
  assert.deepEqual([...touched].sort(), ["get:sched_daily", "put:sched_daily"]);
  /* a fresh instance over the same storage: started, it re-derives tomorrow's wake, and today's firing runs nothing */
  const b = world(set, null, { zone: LA, st });
  assert.equal(await b.s.start(NOW + 60_000), LA_TOMORROW);
  assert.equal("dutytransitions" in (await b.s.onAlarm(NOW + 60_000)), false);
  assert.equal(b.calls.filter(([m]) => m === "duties.recordTransitions").length, 0);
  /* a storage holding the alarm alone keeps the state for the instance: the firing still answers, once that day */
  const bare = storage(); delete bare.get; delete bare.put;
  const d = world(set, null, { zone: LA, st: bare });
  assert.equal((await d.s.onAlarm(NOW)).dutytransitions.done, true);
  assert.equal("dutytransitions" in (await d.s.onAlarm(NOW + 1000)), false);
  /* with none of the three owners, nothing is read or written for them */
  const c = world({}, null, { zone: LA });
  await c.s.onAlarm(NOW); await c.s.arm(NOW); await c.s.start(NOW);
  assert.deepEqual(c.st.log.filter(([m]) => m === "get" || m === "put"), []);
});

test("R21, R17: arm runs no daily pass and writes nothing but the alarm", async () => {
  const { s, st, calls } = world({}, null, { daily: true, zone: LA });
  await s.arm(NOW);
  assert.deepEqual(calls.filter(([m]) => Object.values(DAILY_TICK).includes(m)), []);
  assert.deepEqual(writes(st), [["setAlarm", LA_TODAY]]);
});

/* ---- R9: the dated wait's arm, through inquiry's notice (R54, K1601) ---- */

function waitNotice() {
  const heard = [];
  return { inquiry: { onWaitSet: (module, fn) => { heard.push({ module, fn }); return { ok: true, module }; } }, heard };
}

test("R9: a dated wait set, told inside the promotion's transaction, arms the alarm at the dated waits' wake once that transaction has returned, once", async () => {
  const WAKE = Date.parse("2026-10-10T07:00:00Z");
  const { s, st } = world({ "dated-waits": { wake: WAKE } });
  const n = waitNotice();
  s.listenTo(n);
  assert.deepEqual(n.heard.map((h) => h.module), ["scheduler"]);
  st.log.length = 0;
  const told = [n.heard[0].fn({ inquiry: "INQ-1", date: "2026-10-10", set_by: "member:a" }),
                n.heard[0].fn({ inquiry: "INQ-1", date: "2026-10-12", set_by: "member:a" })];
  assert.deepEqual(told, [undefined, undefined], "the listener answers nothing the promotion reads");
  assert.deepEqual(st.log, [], "no storage call inside the transaction");
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(st.alarm, WAKE);
  assert.deepEqual(writes(st), [["setAlarm", WAKE]], "one arm for the two waits");
});

/* ---- R21 against the real owners ---- */

test("R21: against the real duties, the alarm records each tracked occurrence's state change as of the firing, once that local day, and only what moved the next", async () => {
  const w = dutiesWorld();
  const ids = ["2026-01-20", "2026-02-12", "2026-02-16"].map((d) => w.declare({ trigger: { kind: "date", date: d } }).duty_id);
  const s = new Scheduler({ storage: storage(), owners: { duties: () => w.duties }, zone: () => "America/Halifax" });
  const T1 = Date.parse("2026-02-20T12:00:00Z");
  const r = await s.onAlarm(T1);
  assert.equal(r.dutytransitions.ok, true, JSON.stringify(r.dutytransitions));
  assert.equal(r.dutytransitions.recorded, 3);
  const states = () => ids.map((id) => w.duties.transitionsOf({ dutyId: id, viewer: "member:bob" }).transitions.map((t) => [t.state, t.as_of]));
  assert.deepEqual(states().map((t) => t.map(([x]) => x).join()), ["overdue", "pending", "pending"]);
  assert.equal(states()[0][0][1], "2026-02-20T12:00:00Z", "as of the firing");
  assert.equal("dutytransitions" in (await s.onAlarm(T1 + 3_600_000)), false, "not again that local day");
  const T2 = Date.parse("2026-03-01T12:00:00Z");
  const later = await s.onAlarm(T2);
  assert.equal(later.dutytransitions.recorded, 2, "the two pending occurrences turned overdue");
  assert.deepEqual(states().map((t) => t.map(([x]) => x).join()), ["overdue", "pending,overdue", "pending,overdue"]);
});

test("R21, R9: against the real inquiry, a promotion setting a dated wait arms the alarm at its local day's start, and that alarm marks it once", async () => {
  const w = inquiryWorld({ view: () => ({ time_zone: { value: LA } }) });
  w.member("alice");
  const st = storage();
  const s = new Scheduler({ storage: st, owners: { inquiry: () => w.k }, zone: () => LA });
  s.listenTo({ inquiry: w.k });
  const Q = "INQ-2026-0711-s";
  const md = inquiryMd(Q, { extra: ["recheck_triggers:", "  - text: \"records reply\"", "    description: \"from the clerk\"",
                                    "    date: \"2099-10-10\""] });
  assert.equal(w.promote(Q, md, null, { author: V("alice") }).ok, true);
  await new Promise((r) => setTimeout(r, 0));
  const AT = Date.parse("2099-10-10T07:00:00Z");
  assert.equal(st.alarm, AT, "armed at the wait's local day start");
  const r = await s.onAlarm(AT);
  assert.deepEqual(r.datedwaits.marked.map((x) => [x.inquiry, x.date, x.set_by]), [[Q, "2099-10-10", V("alice")]]);
  const again = await s.onAlarm(AT + 1000);
  assert.equal("datedwaits" in again, false, "marked once: not due again");
  assert.equal(st.alarm, null, "nothing left to mark: no alarm (R15)");
});
