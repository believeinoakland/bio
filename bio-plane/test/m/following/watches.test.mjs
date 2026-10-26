/* following R14 (T45), R22–R26: a follow's end date; a watch linked to the plan that set it running; the once-only
   question at the plan's close or when every promise is met; its answer in the watch owner's terms; the plan's watches
   for "where it stands" (v0.2 rules 1, 17, 18; K2781 (2)). R27 (T46): when every promise was met, read from plan-work's
   one source (its R13, R15). R28 (T47): when a duty's end took hold (`dutyWatchEndAt`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, body, sha, MEMBER, BOB, OUTSIDER, MACHINE, T0, DAY } from "./fixture.mjs";
import { noSuchPlan, refusePlanClosed } from "../../../src/action-plans/index.mjs";
import { followingOf, FOLLOWING_CHECKS } from "../../../src/following/index.mjs";
import { MONITORING_CHECKS } from "../../../src/monitoring/index.mjs";
import { world as planWorld, V, by, option, choose, OFFICE } from "../plan-work/fixture.mjs";
import { INTERNAL as DUTIES_INTERNAL } from "../../../src/duties/index.mjs";
import { standardsIn as standardsInFixture } from "../standards/fixtures.mjs";
import { AS_OF } from "../duties/fixtures.mjs";

/* standards' real answer for a record that holds no standard (its published fixture), the read these worlds stand on */
const NO_STANDARDS = standardsInFixture();

/* T0 is 2026-10-06T12:00Z; the test profile's zone is America/Halifax (UTC−3), so today is 2026-10-06 and its end
   is 2026-10-07T03:00Z. */
const REG = (n) => `https://registry.ellery.example/r/${n}`;
const PRJ = "PRJ-2026-0001-a";
const HOME = "INFO-2026-0002-a";
const PAGE = "https://ellery.example/clerk/notices";
const code = (r) => r && (r.code ?? r.reason);

/* A project (alice its owner, bob joined), a bundle in it, and an open plan PL-1 of that project with one matter. */
function planned(opts) {
  const w = world(opts);
  w.project(PRJ);
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES (?, 'bob', 'joined', 0, '2026-01-02', '2026-01-02')`, PRJ);
  w.bundle(HOME, { project: PRJ });
  w.plan("PL-1", { project: PRJ, matters: ["inquiry:I-1", "inquiry:I-2"] });
  return w;
}
const reg = (w, n, x = {}) => w.f.followRegister({ address: REG(n), home: HOME, author: MEMBER, viewer: MEMBER, ...x });
const link = (w, watch, x = {}) => w.f.watchLink({ plan: "PL-1", watch, author: MEMBER, viewer: MEMBER, ...x });
const asked = (w, viewer = MEMBER) => w.f.watchQuestions({ viewer }).questions;
const count = (w, t) => w.rows(`SELECT count(*) AS n FROM ${t}`)[0].n;

/* ---------------------------------------------------------------- R22, R14 */

test("R22 every follow act takes ends, a calendar day after today's local day (instance zone), or none; anything else is refused WATCH_END_REFUSED before any write", () => {
  const w = planned();
  const b = body(w);
  for (const ends of ["2026-10-06", "2026-10-05", "2026-02-31", "tomorrow", 20261007, ""]) {
    const acts = [
      w.f.followBody({ body: b, from: "2026-09-01", ends, author: MEMBER, viewer: MEMBER }),
      w.f.followRegister({ address: REG(1), ends, author: MEMBER, viewer: MEMBER }),
      w.f.followPortal({ address: "https://data.ellery.example/p.json", key: "id", ends, author: MEMBER, viewer: MEMBER }),
      w.f.followPersonQuery({ register: "ellery.licences", scheme: "ellery_licence", value: "L-00042", ends, home: HOME,
                              address: "https://licences.ellery.example/search?licence=L-00042", author: MEMBER, viewer: MEMBER }),
    ];
    for (const r of acts) assert.equal(code(r), "WATCH_END_REFUSED", `${ends}: ${JSON.stringify(r)}`);
    /* monitoring's own row (C-18.19, its R71), minted there once (K2871); none of this module's */
    const row = MONITORING_CHECKS.WATCH_END_REFUSED;
    for (const r of acts) assert.deepEqual([r.ok, r.check, r.translation], [false, row ? row.check : null, row ? row.translation : null]);
  }
  assert.equal("WATCH_END_REFUSED" in FOLLOWING_CHECKS, false);
  assert.equal(count(w, "follows") + count(w, "follow_ends"), 0, "nothing written");
  /* control: tomorrow, in the instance's zone, and none */
  const r = w.f.followBody({ body: b, from: "2026-09-01", ends: "2026-10-07", author: MEMBER, viewer: MEMBER });
  assert.deepEqual([r.ok, r.ends], [true, "2026-10-07"]);
  assert.equal(w.f.followRegister({ address: REG(2), author: MEMBER, viewer: MEMBER }).ends, null);
  /* at 01:00Z on the 7th it is still the 6th in the zone, so the 7th is still after today */
  w.t = Date.parse("2026-10-07T01:00:00Z");
  assert.equal(w.f.followRegister({ address: REG(3), ends: "2026-10-07", author: MEMBER, viewer: MEMBER }).ok, true);
});

test("R22 after its end day a follow is ended by itself, once, ended_by null and ended_reason ends; never due again; R19 told once (control: ends later is read); until and ends are independent", async () => {
  const w = planned();
  const told = [];
  w.f.onFollowed("scheduler", (x) => told.push(x));
  const short = reg(w, 1, { ends: "2026-10-07" }).follow;
  const long = reg(w, 2, { ends: "2026-10-20" }).follow;
  w.serve(REG(1), "a"); w.serve(REG(2), "b");
  await w.f.followTick(T0);
  /* the end instant is a wake, so the end is recorded when its day is over (a weekly follow is next read later) */
  const w0 = planned();
  reg(w0, 1, { ends: "2026-10-07", cadence: "weekly" });
  w0.serve(REG(1), "a");
  await w0.f.followTick(T0);
  assert.equal(w0.f.followWake(T0 + 1000), Date.parse("2026-10-08T03:00:00Z"));
  assert.equal(w0.f.follows({ viewer: MEMBER, now: Date.parse("2026-10-08T02:59:59Z") }).items.length, 1, "not ended before its day is over");
  assert.equal(w0.f.follows({ viewer: MEMBER, now: Date.parse("2026-10-08T03:00:00Z") }).items.length, 0, "ended once it is");
  const b = body(w);
  const past = w.f.followBody({ body: b, from: "2026-08-01", until: "2026-08-31", author: MEMBER, viewer: MEMBER }).follow;
  /* the 7th is still its last day: read */
  const t1 = await w.f.followTick(T0 + DAY);
  assert.ok(t1.read.some((x) => x.follow === short));
  w.t = T0 + 2 * DAY;
  const t2 = await w.f.followTick(w.t);
  assert.equal(t2.read.some((x) => x.follow === short), false, "ended: read no more");
  assert.ok(t2.read.some((x) => x.follow === long), "control: a later end is still read");
  assert.ok(t2.read.some((x) => x.follow === past), "a body's past read period, with no ends, is still due");
  const ended = w.f.follows({ viewer: MEMBER, ended: true }).items.find((i) => i.follow === short);
  assert.deepEqual([ended.ends, ended.ended_at, ended.ended_by, ended.ended_reason, ended.next_due],
                   ["2026-10-07", "2026-10-08T03:00:00Z", null, "ends", null]);
  assert.deepEqual(told.filter((x) => x.follow === short && x.due === null), [{ follow: short, due: null }], "told once");
  await w.f.followTick(w.t + DAY);
  w.f.follows({ viewer: MEMBER });
  assert.equal(told.filter((x) => x.follow === short && x.due === null).length, 1, "recorded once");
  assert.equal(w.f.followDue(w.t + 30 * DAY) && w.f.follows({ viewer: MEMBER }).items.some((i) => i.follow === short), false);
});

test("R22 followEnd changes a follow's end date later, by its author, ends null removing it; a policy watch takes no ends", () => {
  const w = planned();
  const f = reg(w, 1).follow;
  assert.equal(code(w.f.followEnd({ follow: f, ends: "2026-11-01", by: MACHINE })), "MACHINE_CANNOT_FOLLOW");
  assert.equal(code(w.f.followEnd({ follow: 99, ends: "2026-11-01", by: MEMBER })), "NO_SUCH_FOLLOW");
  assert.equal(code(w.f.followEnd({ follow: f, ends: "2026-11-01", by: OUTSIDER })), "NO_SUCH_FOLLOW", "a follow in a project unseen");
  assert.equal(code(w.f.followEnd({ follow: f, ends: "2026-11-01", by: BOB })), "NOT_THE_AUTHOR");
  assert.equal(code(w.f.followEnd({ follow: f, ends: "2026-10-06", by: MEMBER })), "WATCH_END_REFUSED");
  assert.equal(count(w, "follow_ends"), 0);
  assert.deepEqual(w.f.followEnd({ follow: f, ends: "2026-11-01", by: MEMBER }).ends, "2026-11-01");
  assert.equal(w.f.follows({ viewer: MEMBER }).items[0].ends, "2026-11-01");
  const off = w.f.followEnd({ follow: f, ends: null, by: MEMBER });
  assert.deepEqual([off.ok, off.ends, off.ends_state], [true, null, "none_set"]);
  assert.deepEqual([w.f.follows({ viewer: MEMBER }).items[0].ends, w.f.follows({ viewer: MEMBER }).items[0].ends_state], [null, "none_set"]);
  assert.deepEqual(w.rows(`SELECT ends, by FROM follow_ends ORDER BY seq`), [{ ends: "2026-11-01", by: MEMBER }, { ends: null, by: MEMBER }], "appended, never edited");
  w.f.unfollow({ follow: f, author: MEMBER });
  assert.equal(code(w.f.followEnd({ follow: f, ends: "2026-11-01", by: MEMBER })), "WATCH_ENDED");
  /* a policy's standing watch */
  w.bundle("INFO-2026-0300-policy");
  w.policies.push({ id: "STD-2026-0001-policy", text: [w.policyText("cid-p", sha("p"), "INFO-2026-0300-policy", "https://ellery.example/p", "2026-10-01T00:00:00Z")] });
  const pw = w.f.follows({ viewer: MEMBER }).items.find((i) => i.kind === "policy");
  assert.equal(code(w.f.followEnd({ follow: pw.follow, ends: "2026-11-01", by: MEMBER })), "WATCH_END_REFUSED");
  assert.deepEqual([pw.ends, pw.ends_state], [null, "none_set"]);
});

test("R14 each follow answers ends or ends null with ends_state none_set, and when ended (listed with ended) its ended_reason: author, ends, answer, or R20's", () => {
  const w = planned();
  const a = reg(w, 1, { ends: "2026-12-01" }).follow;
  const b = reg(w, 2).follow;
  const items = w.f.follows({ viewer: MEMBER }).items;
  assert.deepEqual([items[0].ends, items[0].ends_state], ["2026-12-01", undefined]);
  assert.deepEqual([items[1].ends, items[1].ends_state], [null, "none_set"]);
  w.f.unfollow({ follow: b, author: MEMBER });
  assert.deepEqual(w.f.follows({ viewer: MEMBER }).items.map((i) => i.follow), [a], "ended follows are listed only when asked");
  const e = w.f.follows({ viewer: MEMBER, ended: true }).items.find((i) => i.follow === b);
  assert.deepEqual([e.ended_reason, e.ended_by], ["author", MEMBER]);
  /* R20's: a policy watch ended when its policy is superseded */
  w.bundle("INFO-2026-0300-policy");
  const p = { id: "STD-2026-0001-policy", text: [w.policyText("cid-p", sha("p"), "INFO-2026-0300-policy", "https://ellery.example/p", "2026-10-01T00:00:00Z")] };
  w.policies.push(p);
  w.f.follows({ viewer: MEMBER });
  p.superseded_by = "STD-2026-0009-policy";
  const pe = w.f.follows({ viewer: MEMBER, ended: true }).items.find((i) => i.kind === "policy");
  assert.equal(pe.ended_reason, "superseded");
  /* answer: R25's stop (below) */
});

/* ---------------------------------------------------------------- R23 */

test("R23 watchLink refuses, in order and writing nothing: a machine author, a plan absent or unseen (NO_SUCH_PLAN, one answer), a closed plan, a kind or watch absent or unseen (NO_SUCH_WATCH), a matter not of the plan, an ended watch; a second link answers existed", () => {
  const w = planned();
  const f = reg(w, 1).follow;
  const watch = { kind: "follow", id: f };
  w.plan("PL-C", { project: PRJ, state: "closed", closedAt: "2026-10-01T00:00:00Z" });
  w.question("STQ-2026-0001", BOB);
  const absentQ = link(w, { kind: "question", id: "STQ-2026-0099" });
  const refused = [
    [link(w, watch, { author: MACHINE }), "MACHINE_CANNOT_LINK_WATCH"],
    [link(w, watch, { author: "", viewer: "" }), "MACHINE_CANNOT_LINK_WATCH"],
    [link(w, watch, { author: MACHINE, plan: "PL-9" }), "MACHINE_CANNOT_LINK_WATCH"],
    [link(w, watch, { plan: "PL-9" }), "NO_SUCH_PLAN"],
    [link(w, watch, { author: OUTSIDER, viewer: OUTSIDER }), "NO_SUCH_PLAN"],
    [link(w, watch, { plan: "PL-C" }), "PLAN_CLOSED"],
    [link(w, { kind: "page", id: f }), "NO_SUCH_WATCH"],
    [link(w, { kind: "follow", id: 99 }), "NO_SUCH_WATCH"],
    [link(w, { kind: "duty", id: "DUT-1" }), "NO_SUCH_WATCH"],
    [link(w, { kind: "address", id: PAGE }), "NO_SUCH_WATCH"],
    [link(w, null), "NO_SUCH_WATCH"],
    [absentQ, "NO_SUCH_WATCH"],
    [link(w, watch, { matters: ["inquiry:I-9"] }), "MATTER_NOT_OF_PLAN"],
  ];
  for (const [r, c] of refused) assert.equal(code(r), c, JSON.stringify(r));
  /* NO_SUCH_PLAN is action-plans' own answer, alike for absent and unseen; PLAN_CLOSED and MATTER_NOT_OF_PLAN theirs */
  assert.deepEqual(refused[3][0], noSuchPlan("PL-9"));
  assert.deepEqual(refused[4][0], noSuchPlan("PL-1"));
  assert.deepEqual(refused[5][0], refusePlanClosed("PL-C"));
  assert.equal(refused[12][0].check, "C-151.1", "plan-work's row, relayed");
  /* another member's standing question answers exactly as an absent one */
  assert.deepEqual(link(w, { kind: "question", id: "STQ-2026-0001" }), absentQ);
  /* ended */
  const g = reg(w, 2).follow;
  w.f.unfollow({ follow: g, author: MEMBER });
  assert.equal(code(link(w, { kind: "follow", id: g })), "WATCH_ENDED");
  assert.equal(count(w, "watch_links"), 0, "nothing written");
  /* controls: each kind lands; a second link of the same watch to the same plan answers the first */
  const a = link(w, watch, { matters: ["inquiry:I-1"] });
  assert.deepEqual([a.ok, a.plan, a.matters, a.watch, a.author], [true, "PL-1", ["inquiry:I-1"], { kind: "follow", id: String(f) }, MEMBER]);
  assert.deepEqual(link(w, watch, { author: BOB, viewer: BOB }), { ...a, existed: true });
  w.address(PAGE, HOME);
  w.duty("DUT-1", { project: PRJ });
  assert.equal(link(w, { kind: "address", id: PAGE }).ok, true);
  assert.equal(link(w, { kind: "duty", id: "DUT-1" }).ok, true);
  assert.equal(link(w, { kind: "question", id: "STQ-2026-0001" }, { author: BOB, viewer: BOB }).ok, true);
  assert.equal(count(w, "watch_links"), 4);
});

test("R23 a link to a standing question is seen only by that question's author, in every read here (control: its author sees it)", () => {
  const w = planned();
  w.question("STQ-2026-0001", BOB);
  const l = link(w, { kind: "question", id: "STQ-2026-0001" }, { author: BOB, viewer: BOB });
  assert.equal(l.ok, true);
  assert.equal(w.f.watchesOfPlan({ plan: "PL-1", viewer: MEMBER }).length, 0);
  assert.equal(w.f.watchesOfPlan({ plan: "PL-1", viewer: null }).length, 0, "the module's own read sees none either");
  assert.deepEqual(w.f.watchesOfPlan({ plan: "PL-1", viewer: BOB }).map((x) => [x.kind, x.words]), [["question", "Anything new on the budget?"]]);
  w.close("PL-1", "2026-10-06T10:00:00Z");
  assert.equal(asked(w, MEMBER).length, 0);
  assert.deepEqual(asked(w, BOB).map((q) => [q.watch.kind, q.recipients]), [["question", [BOB]]]);
  assert.equal(code(w.f.watchAnswer({ link: l.link, stop: true, author: MEMBER })), "NO_SUCH_WATCH");
});

/* ---------------------------------------------------------------- R24 */

test("R24 a closed plan's link is asked once, cause closed, at the closing instant, with its watch's end, offered keep and stop, to its author", () => {
  const w = planned();
  const f = reg(w, 1, { ends: "2026-12-01" }).follow;
  const l = link(w, { kind: "follow", id: f });
  assert.deepEqual(asked(w), [], "an open plan asks nothing");
  w.close("PL-1", "2026-10-06T10:00:00Z");
  const q = asked(w);
  assert.equal(q.length, 1);
  assert.deepEqual(q[0], { link: l.link, plan: "PL-1", matters: null, watch: { kind: "follow", id: String(f), ends: "2026-12-01" },
    due_at: "2026-10-06T10:00:00Z", cause: "closed", relied_on: false, offered: ["keep", "stop"], recipients: [MEMBER] });
  assert.deepEqual(asked(w, BOB), q, "any member who sees the plan sees it");
  assert.deepEqual(asked(w, OUTSIDER), [], "left out whole for one who may not see the plan");
  assert.deepEqual(asked(w, "nobody"), []);
  w.f.watchAnswer({ link: l.link, keep: { until: "2027-01-01" }, author: MEMBER });
  assert.deepEqual(asked(w), [], "once answered, never listed again");
});

test("R24 a link is asked on promises_met when the second of two adopted promise-duties reads met, at the instant it did (control: one met, one pending, not listed); an ended watch is never asked", () => {
  const w = planned();
  w.duty("DUT-1", { met: ["2026-10-03T09:00:00Z"] });
  w.duty("DUT-2", { met: [null] });
  w.promises.set("PL-1 inquiry:I-1", ["DUT-1", "DUT-2"]);
  const f = reg(w, 1).follow;
  const l = link(w, { kind: "follow", id: f }, { matters: ["inquiry:I-1"] });
  assert.deepEqual(asked(w), []);
  w.dutiesHeld.get("DUT-2").occurrences = [{ state: "met", at: "2026-10-05T14:30:00Z" }];
  const q = asked(w);
  assert.deepEqual([q.length, q[0].link, q[0].cause, q[0].due_at], [1, l.link, "promises_met", "2026-10-05T14:30:00Z"]);
  /* a link naming no matter covers every matter of the plan: I-2 holds no promise-duty, so it is not asked */
  link(w, { kind: "follow", id: reg(w, 2).follow });
  assert.equal(asked(w).length, 1);
  /* an ended watch is never asked */
  w.f.unfollow({ follow: f, author: MEMBER });
  assert.deepEqual(asked(w), []);
});

/* ---------------------------------------------------------------- R27 */

test("R27 promises_met is read from plan-work's matterPromiseDuties alone, with no member's sight: due when every matter of the link answers all_met, not partial, with a met_at; due_at the latest met_at; never derived from duties' occurrences (control: one duty unmet, not listed)", () => {
  const w = planned();
  /* matter I-1: two duties read met on different days; matter I-2: one, read met between them */
  w.duty("DUT-1", { met: ["2026-10-02T08:00:00Z"] });
  w.duty("DUT-2", { met: ["2026-10-04T16:45:00Z"] });
  w.duty("DUT-3", { met: [null] });
  w.promises.set("PL-1 inquiry:I-1", ["DUT-1", "DUT-2"]);
  w.promises.set("PL-1 inquiry:I-2", ["DUT-3"]);
  const f = reg(w, 1).follow;
  const l = link(w, { kind: "follow", id: f });
  const one = link(w, { kind: "follow", id: reg(w, 2).follow }, { matters: ["inquiry:I-1"] });
  /* the link naming I-1 is due at its later duty's instant; the link naming none waits on I-2's unmet duty (control) */
  w.promiseReads.length = 0;
  let q = asked(w);
  assert.deepEqual(q.map((x) => [x.link, x.cause, x.due_at]), [[one.link, "promises_met", "2026-10-04T16:45:00Z"]]);
  assert.ok(w.promiseReads.length > 0 && w.promiseReads.every((r) => r.viewer === null && r.plan === "PL-1" && r.nowMs === T0),
            "read with no member's sight, as of the asker's now");
  w.dutiesHeld.get("DUT-3").occurrences = [{ state: "met", at: "2026-10-03T11:00:00Z" }];
  q = asked(w);
  assert.deepEqual(q.map((x) => [x.link, x.cause, x.due_at]),
                   [[l.link, "promises_met", "2026-10-04T16:45:00Z"], [one.link, "promises_met", "2026-10-04T16:45:00Z"]],
                   "the latest of the matters' met_at");
  /* whether it is due never depends on who asks */
  assert.deepEqual(asked(w, BOB).map((x) => x.due_at), q.map((x) => x.due_at));
  /* one source: plan-work's met_at governs, whatever duties' occurrences say, and the occurrences are never read */
  w.occurrenceReads = 0;
  w.promiseAnswer = (plan, matter, a) => (matter === "inquiry:I-2" ? { ...a, met_at: "2026-10-05T07:15:00Z" } : a);
  assert.deepEqual(asked(w).map((x) => [x.link, x.due_at]), [[one.link, "2026-10-04T16:45:00Z"], [l.link, "2026-10-05T07:15:00Z"]]);
  assert.equal(w.occurrenceReads, 0, "duties.occurrencesOf is not read");
  /* a matter whose read answers no met_at, or partial, or not all_met, or fails, makes the link not due by this cause */
  for (const [why, over] of [["no met_at", { met_at: null }], ["partial", { partial: true }], ["not all met", { all_met: false }],
                             ["refused", { ok: false, reason: "MATTER_NOT_OF_PLAN" }], ["unreadable met_at", { met_at: "soon" }]]) {
    w.promiseAnswer = (plan, matter, a) => (matter === "inquiry:I-2" ? { ...a, ...over } : a);
    assert.deepEqual(asked(w).map((x) => x.link), [one.link], why);
  }
  w.promiseAnswer = () => { throw new Error("down"); };
  assert.deepEqual(asked(w), [], "a read that throws: not due");
  /* R24's other terms unchanged: the closed cause when the plan closed first; an ended watch never due */
  w.promiseAnswer = null;
  w.close("PL-1", "2026-10-03T00:00:00Z");
  assert.deepEqual(asked(w).map((x) => [x.cause, x.due_at]), [["closed", "2026-10-03T00:00:00Z"], ["closed", "2026-10-03T00:00:00Z"]]);
  w.close("PL-1", "2026-10-06T00:00:00Z");
  assert.deepEqual(asked(w).map((x) => [x.cause, x.due_at]), [["promises_met", "2026-10-04T16:45:00Z"], ["promises_met", "2026-10-04T16:45:00Z"]]);
  w.f.unfollow({ follow: f, author: MEMBER });
  assert.deepEqual(asked(w).map((x) => x.link), [one.link]);
});

test("R27 with the real plan-work: a link's question is due on promises_met at the later of two duties' recorded met readings (plan-work R15), read with no member's sight (control: one duty unmet, not listed)", () => {
  const p = planWorld();
  const o = option(p, { addressee: OFFICE, subjects: [p.S1], dates: [{ date: "2026-11-01", basis: "statute" }] });
  choose(p, [o]);
  const s = p.ap.optionStart({ plan: p.PL, option: o, kind: "other", why_first: "the reply is due before we can document it", ...by("bob") });
  assert.equal(s.ok, true, JSON.stringify(s));
  const SHA = p.capture("We will repair the lights by May."), SHA2 = p.capture("And publish the schedule.");
  p.correspond(s.action, "received", "2026-10-03", { artifactSha: SHA });
  p.correspond(s.action, "received", "2026-10-04", { artifactSha: SHA2 });
  const state = { "DUT-1": "met", "DUT-2": "met_late" };
  p.dutiesAnswer = ({ captures }) => {
    const duties = [["DUT-1", SHA], ["DUT-2", SHA2]].map(([id, cap]) => ({ duty_id: id, arising_in: cap, occurrences: [{ key: `OCC-${id}`, state: state[id] }] }));
    return { ok: true, captures, duties, all_met: duties.every((d) => ["met", "met_late"].includes(d.occurrences[0].state)) };
  };
  const t = (id, st, asOf) => ({ duty_id: id, occurrence_key: `OCC-${id}`, state: st, as_of: asOf, at: asOf, cause: "derived", evidence: null, by: null });
  p.transitions = [t("DUT-1", "pending", "2026-10-03T00:00:00Z"), t("DUT-1", "met", "2026-10-05T09:00:00Z"),
                   t("DUT-2", "pending", "2026-10-04T00:00:00Z"), t("DUT-2", "met_late", "2026-10-08T17:30:00Z")];
  const stub = { monitoring: () => ({ ok: true, items: [] }), addressWatchers: () => [], addressWatchEnd: () => ({ ok: false, reason: "NO_SUCH_ADDRESS" }),
                 sweepHost: () => ({}), schedule: () => ({ unscheduled: [] }) };
  let occurrenceReads = 0;
  const f = followingOf(p.host, { record: p.record, membership: p.membership, actionPlans: p.ap, planWork: p.pw, monitoring: stub,
    duties: { readDuty: () => ({ ok: true, found: false }), occurrencesOf: () => (occurrenceReads++, { ok: false }) },
    answers: { standingQuestionsOf: () => ({ ok: true, questions: [] }) }, standards: { standardsIn: () => NO_STANDARDS },
    view: () => ({ time_zone: { value: "America/Halifax" } }), now: () => Date.parse(p.clock.now) });
  const fl = f.followRegister({ address: REG(1), ...by("alice") });
  /* the matter the promises answer: the plan's outcome on S1 (its other matters hold no promise) */
  const S1 = p.ap.planRead({ id: p.PL, viewer: V("alice") }).subjects.find((x) => x.subject.kind === "outcome" && x.subject.standard === p.S1.standard).key;
  const l = f.watchLink({ plan: p.PL, matters: [S1], watch: { kind: "follow", id: fl.follow }, ...by("alice") });
  assert.equal(l.ok, true, JSON.stringify(l));
  const q = f.watchQuestions({ viewer: V("alice") }).questions;
  assert.deepEqual(q.map((x) => [x.link, x.cause, x.due_at]), [[l.link, "promises_met", "2026-10-08T17:30:00Z"]]);
  assert.equal(p.transitionCalls.at(-1).viewer, DUTIES_INTERNAL, "plan-work read with no member's sight");
  assert.equal(occurrenceReads, 0, "duties' occurrences are not read here");
  /* control: one duty unmet */
  state["DUT-2"] = "pending";
  assert.deepEqual(f.watchQuestions({ viewer: V("alice") }).questions, []);
});

test("R24 a watch another open plan links is relied on, offered nothing (control: that plan closed, both offered); an address another project asks for is relied on, naming no project; a policy watch always", () => {
  const w = planned();
  w.plan("PL-2", { project: PRJ });
  const f = reg(w, 1).follow;
  link(w, { kind: "follow", id: f });
  link(w, { kind: "follow", id: f }, { plan: "PL-2" });
  w.close("PL-1", "2026-10-06T10:00:00Z");
  let q = asked(w);
  assert.deepEqual([q.length, q[0].relied_on, q[0].offered], [1, true, []]);
  w.close("PL-2", "2026-10-06T11:00:00Z");
  q = asked(w);
  assert.deepEqual(q.map((x) => [x.plan, x.relied_on, x.offered]), [["PL-1", false, ["keep", "stop"]], ["PL-2", false, ["keep", "stop"]]]);
  /* an address another project's document asks for */
  const w2 = planned();
  w2.address(PAGE, HOME, { projects: [PRJ, "PRJ-2026-0042-other"] });
  link(w2, { kind: "address", id: PAGE });
  w2.close("PL-1", "2026-10-06T10:00:00Z");
  q = asked(w2);
  assert.deepEqual([q[0].relied_on, q[0].offered], [true, []]);
  assert.doesNotMatch(JSON.stringify(q), /PRJ-2026-0042/, "names no other project");
  w2.addresses[0].projects = [PRJ];
  assert.equal(asked(w2)[0].relied_on, false, "control: only its own plan's project asks");
  /* a policy's standing watch */
  const w3 = planned();
  w3.bundle("INFO-2026-0300-policy");
  w3.policies.push({ id: "STD-2026-0001-policy", text: [w3.policyText("cid-p", sha("p"), "INFO-2026-0300-policy", "https://ellery.example/p", "2026-10-01T00:00:00Z")] });
  const pw = w3.f.follows({ viewer: MEMBER }).items.find((i) => i.kind === "policy").follow;
  link(w3, { kind: "follow", id: pw });
  w3.close("PL-1", "2026-10-06T10:00:00Z");
  assert.deepEqual([asked(w3)[0].relied_on, asked(w3)[0].offered], [true, []]);
});

test("R24 recipients: the link's author while an active member who sees the plan; else the project's active owners; else the administrators; a standing question's author alone", () => {
  const w = planned();
  const l = link(w, { kind: "follow", id: reg(w, 1, { author: BOB, viewer: BOB }).follow }, { author: BOB, viewer: BOB });
  w.close("PL-1", "2026-10-06T10:00:00Z");
  assert.deepEqual(asked(w)[0].recipients, [BOB]);
  w.st.sql.exec(`UPDATE members SET status='left' WHERE member_id='bob'`);
  assert.deepEqual(asked(w)[0].recipients, [MEMBER], "the author left: the project's active owner");
  w.st.sql.exec(`UPDATE members SET status='left' WHERE member_id='alice'`);
  assert.deepEqual(asked(w, "class:daemon")[0].recipients, ["member:root"], "no active owner: the administrators");
  w.st.sql.exec(`UPDATE members SET status='active' WHERE member_id IN ('alice', 'bob')`);
  /* an active author who no longer sees the plan */
  w.st.sql.exec(`DELETE FROM project_participants WHERE member_id='bob'`);
  assert.deepEqual(asked(w)[0].recipients, [MEMBER]);
  assert.equal(l.ok, true);
});

test("R24 watchQuestions pages in (due instant, link) order after the cursor, at most limit (1–200); it writes nothing", () => {
  const w = planned();
  w.plan("PL-2", { project: PRJ });
  for (let i = 1; i <= 3; i++) link(w, { kind: "follow", id: reg(w, i).follow });
  link(w, { kind: "follow", id: reg(w, 4).follow }, { plan: "PL-2" });
  w.close("PL-2", "2026-10-05T00:00:00Z");
  w.close("PL-1", "2026-10-06T00:00:00Z");
  const before = JSON.stringify(w.rows(`SELECT * FROM watch_links`)) + JSON.stringify(w.rows(`SELECT * FROM follows`));
  const all = w.f.watchQuestions({ viewer: MEMBER });
  assert.deepEqual(all.questions.map((q) => q.link), [4, 1, 2, 3]);
  assert.equal(all.cursor, null);
  const p1 = w.f.watchQuestions({ viewer: MEMBER, limit: 3 });
  assert.equal(p1.questions.length, 3);
  const p2 = w.f.watchQuestions({ viewer: MEMBER, limit: 3, after: p1.cursor });
  assert.deepEqual([...p1.questions, ...p2.questions], all.questions);
  assert.equal(p2.cursor, null);
  assert.equal(w.f.watchQuestions({ viewer: MEMBER, limit: 0 }).questions.length, 1, "clamped to 1–200");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM watch_links`)) + JSON.stringify(w.rows(`SELECT * FROM follows`)), before);
});

/* ---------------------------------------------------------------- R25 */

/* A closed plan with one linked watch of each kind. */
function asking() {
  const w = planned();
  const f = reg(w, 1).follow;
  w.address(PAGE, HOME);
  w.duty("DUT-1", { project: PRJ, met: [null] });
  w.question("STQ-2026-0001", MEMBER);
  const L = {
    follow: link(w, { kind: "follow", id: f }).link,
    address: link(w, { kind: "address", id: PAGE }).link,
    duty: link(w, { kind: "duty", id: "DUT-1" }).link,
    question: link(w, { kind: "question", id: "STQ-2026-0001" }).link,
  };
  w.close("PL-1", "2026-10-06T10:00:00Z");
  return { w, f, L };
}

test("R25 each kind kept: a follow's ends, an address's end day (monitoring R71), a duty's end day held here, a standing question's ends (answers R34), each shown by its owner's read", () => {
  const { w, f, L } = asking();
  const keep = (l) => w.f.watchAnswer({ link: l, keep: { until: "2027-01-31" }, author: MEMBER });
  for (const k of ["follow", "address", "duty", "question"]) {
    const r = keep(L[k]);
    assert.deepEqual([r.ok, r.answer, r.until, r.cause, r.by], [true, "keep", "2027-01-31", "closed", MEMBER], k);
  }
  assert.equal(w.f.follows({ viewer: MEMBER }).items.find((i) => i.follow === f).ends, "2027-01-31");
  assert.deepEqual(w.addressEnds, [{ address: PAGE, until: "2027-01-31", by: MEMBER }]);
  assert.equal(w.monitoring.monitoring({ viewer: MEMBER }).items[0].until, "2027-01-31");
  assert.equal(w.f.dutyWatchEnd("DUT-1"), "2027-01-31");
  assert.equal(w.questions.get("STQ-2026-0001").ends, "2027-01-31");
  assert.deepEqual(asked(w), []);
  /* a second answer answers the first */
  const again = w.f.watchAnswer({ link: L.follow, stop: true, author: MEMBER });
  assert.deepEqual([again.ok, again.existed, again.answer, again.until], [true, true, "keep", "2027-01-31"]);
});

test("R25 each kind stopped: a follow ended now with ended_reason answer by the answering member; an address ended today; a duty stays held with its occurrences while dutyWatchEnd answers that day; a standing question ended (answers R16)", () => {
  const { w, f, L } = asking();
  const stop = (l) => w.f.watchAnswer({ link: l, stop: true, author: MEMBER });
  for (const k of ["follow", "address", "duty", "question"]) assert.deepEqual([stop(L[k]).answer, stop(L[k]).existed], ["stop", true], k);
  const e = w.f.follows({ viewer: MEMBER, ended: true }).items.find((i) => i.follow === f);
  assert.deepEqual([e.ended_reason, e.ended_by, e.ended_at], ["answer", MEMBER, "2026-10-06T12:00:00Z"]);
  assert.deepEqual(w.addressEnds, [{ address: PAGE, until: "2026-10-06", by: MEMBER }]);
  assert.equal(w.f.dutyWatchEnd("DUT-1"), "2026-10-06");
  assert.equal(w.duties.readDuty({ dutyId: "DUT-1", viewer: MEMBER }).found, true, "the duty stays held");
  assert.equal(w.duties.occurrencesOf({ dutyId: "DUT-1", asOf: AS_OF, viewer: MEMBER }).occurrences.length, 1, "its occurrences still derived and read");
  assert.notEqual(w.questions.get("STQ-2026-0001").ended, null);
  /* stopped by a recipient who did not make the follow: the owner, once the author has left */
  const w2 = planned();
  const g = reg(w2, 1, { author: BOB, viewer: BOB }).follow;
  const l2 = link(w2, { kind: "follow", id: g }, { author: BOB, viewer: BOB }).link;
  w2.close("PL-1", "2026-10-06T10:00:00Z");
  w2.st.sql.exec(`UPDATE members SET status='left' WHERE member_id='bob'`);
  assert.equal(w2.f.watchAnswer({ link: l2, stop: true, author: MEMBER }).ok, true);
  assert.equal(w2.f.follows({ viewer: MEMBER, ended: true }).items[0].ended_by, MEMBER);
});

test("R25 dutyWatchEnd: null while the duty has no link or any link of it is unanswered (control: all answered, the latest end day); it writes nothing and never throws", () => {
  const w = planned();
  w.plan("PL-2", { project: PRJ });
  w.duty("DUT-1", { project: PRJ, met: [null] });
  assert.equal(w.f.dutyWatchEnd("DUT-1"), null);
  const a = link(w, { kind: "duty", id: "DUT-1" }).link;
  const b = link(w, { kind: "duty", id: "DUT-1" }, { plan: "PL-2" }).link;
  w.close("PL-1", "2026-10-06T10:00:00Z");
  w.close("PL-2", "2026-10-06T11:00:00Z");
  w.f.watchAnswer({ link: a, keep: { until: "2027-03-01" }, author: MEMBER });
  assert.equal(w.f.dutyWatchEnd("DUT-1"), null, "one link answered, one not");
  w.f.watchAnswer({ link: b, keep: { until: "2027-02-01" }, author: MEMBER });
  assert.equal(w.f.dutyWatchEnd("DUT-1"), "2027-03-01");
  assert.equal(w.f.dutyWatchEnd(undefined), null);
  assert.equal(w.f.dutyWatchEnd({}), null);
});

test("R25 refusals, in order and writing nothing: a machine author, no such link visible, an unasked link or a non-recipient (WATCH_NOT_ASKED alike), a relied-on watch, neither or both answers or a bad until; a refusal by the owner's act is answered as given (control: a recipient lands)", () => {
  const { w, L } = asking();
  const ans = (x) => w.f.watchAnswer({ link: L.follow, stop: true, author: MEMBER, ...x });
  const refused = [
    [ans({ author: MACHINE }), "MACHINE_CANNOT_LINK_WATCH"],
    [ans({ author: "" }), "MACHINE_CANNOT_LINK_WATCH"],
    [ans({ link: 99 }), "NO_SUCH_WATCH"],
    [ans({ author: OUTSIDER }), "NO_SUCH_WATCH"],
    [ans({ author: BOB }), "WATCH_NOT_ASKED"],
    [ans({ stop: null }), "WATCH_END_REFUSED"],
    [ans({ keep: { until: "2027-01-01" } }), "WATCH_END_REFUSED"],
    [ans({ stop: null, keep: { until: "2026-10-06" } }), "WATCH_END_REFUSED"],
    [ans({ stop: null, keep: {} }), "WATCH_END_REFUSED"],
  ];
  for (const [r, c] of refused) assert.equal(code(r), c, JSON.stringify(r));
  /* an unasked link answers as a non-recipient does */
  w.plan("PL-2", { project: PRJ });
  const open = link(w, { kind: "follow", id: reg(w, 2).follow }, { plan: "PL-2" }).link;
  assert.deepEqual(w.f.watchAnswer({ link: open, stop: true, author: MEMBER }), ans({ author: BOB }));
  /* relied on */
  link(w, { kind: "address", id: PAGE }, { plan: "PL-2" });
  assert.equal(code(w.f.watchAnswer({ link: L.address, stop: true, author: MEMBER })), "WATCH_RELIED_ON");
  assert.equal(count(w, "watch_answers"), 0);
  /* the owner's act refuses: answered as given, nothing recorded here */
  w.addressRefusal = { ok: false, reason: "WATCH_END_REFUSED", code: "WATCH_END_REFUSED", check: "C-18.x" };
  const { w: w2, L: L2 } = asking();
  w2.addressRefusal = w.addressRefusal;
  assert.deepEqual(w2.f.watchAnswer({ link: L2.address, stop: true, author: MEMBER }), w.addressRefusal);
  assert.equal(count(w2, "watch_answers"), 0);
  assert.equal(asked(w2).some((q) => q.link === L2.address), true, "still asked");
  /* control */
  assert.equal(ans({}).ok, true);
  assert.equal(count(w, "watch_answers"), 1);
});

/* ---------------------------------------------------------------- R28 */

test("R28 dutyWatchEndAt answers null exactly when dutyWatchEnd does, else {day, at}: the latest end day, and the recorded instant of the last answer, from which no link stood unanswered (control: one link unanswered, null); for a keep as for a stop; it writes nothing and never throws", () => {
  const w = planned();
  w.plan("PL-2", { project: PRJ });
  w.plan("PL-3", { project: PRJ });
  w.duty("DUT-1", { project: PRJ, met: [null] });
  w.duty("DUT-2", { project: PRJ, met: [null] });
  const both = (d) => [w.f.dutyWatchEnd(d), w.f.dutyWatchEndAt(d)];
  /* no link: null, as dutyWatchEnd */
  assert.deepEqual(both("DUT-1"), [null, null]);
  const a = link(w, { kind: "duty", id: "DUT-1" }).link;
  const b = link(w, { kind: "duty", id: "DUT-1" }, { plan: "PL-2" }).link;
  const c = link(w, { kind: "duty", id: "DUT-2" }).link;
  w.close("PL-1", "2026-10-06T10:00:00Z");
  w.close("PL-2", "2026-10-06T11:00:00Z");
  assert.deepEqual(both("DUT-1"), [null, null], "linked, nothing answered");
  /* the first answer, on the 6th, holds the later end day; the second, on the 8th, the earlier */
  w.f.watchAnswer({ link: a, keep: { until: "2027-03-01" }, author: MEMBER });
  assert.deepEqual(both("DUT-1"), [null, null], "control: one link answered, one not");
  w.t = T0 + 2 * DAY;
  const second = w.f.watchAnswer({ link: b, keep: { until: "2027-02-01" }, author: MEMBER });
  assert.equal(second.at, "2026-10-08T12:00:00Z");
  assert.deepEqual(both("DUT-1"), ["2027-03-01", { day: "2027-03-01", at: "2026-10-08T12:00:00Z" }],
                   "the latest end day, held at the instant the last answer was recorded");
  /* a link added later and still unanswered: the end no longer holds */
  link(w, { kind: "duty", id: "DUT-1" }, { plan: "PL-3" });
  assert.deepEqual(both("DUT-1"), [null, null]);
  /* a stop: its day is the day it was answered, its instant the answer's */
  w.t = T0 + 3 * DAY;
  const s = w.f.watchAnswer({ link: c, stop: true, author: MEMBER });
  assert.deepEqual([s.answer, s.until, s.at], ["stop", "2026-10-09", "2026-10-09T12:00:00Z"]);
  assert.deepEqual(both("DUT-2"), ["2026-10-09", { day: "2026-10-09", at: "2026-10-09T12:00:00Z" }]);
  /* dutyWatchEnd unchanged; an absent or malformed duty answers null */
  for (const d of [undefined, null, {}, "", "DUT-9"]) assert.deepEqual(both(d), [null, null], JSON.stringify(d));
  /* it writes nothing */
  const before = JSON.stringify(w.rows(`SELECT * FROM watch_links`)) + JSON.stringify(w.rows(`SELECT * FROM watch_answers`));
  w.f.dutyWatchEndAt("DUT-2");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM watch_links`)) + JSON.stringify(w.rows(`SELECT * FROM watch_answers`)), before);
  /* a link it cannot read answers null, as dutyWatchEnd does, and never throws */
  w.st.sql.exec(`ALTER TABLE watch_answers RENAME TO watch_answers_away`);
  assert.deepEqual(both("DUT-2"), [null, null]);
  w.st.sql.exec(`ALTER TABLE watch_answers_away RENAME TO watch_answers`);
  assert.deepEqual(both("DUT-2")[1], { day: "2026-10-09", at: "2026-10-09T12:00:00Z" });
});

/* ---------------------------------------------------------------- R26 */

test("R26 registered once at start through plan-work's watch-reader door: the read answers a plan's linked watches with end dates (control: a watch linked to another plan is absent); a second registration is refused by the door", () => {
  const w = planned();
  assert.deepEqual(w.f.registered, { ok: true, module: "following" });
  assert.deepEqual(w.watchReaders.map((r) => r.module), ["following"]);
  w.plan("PL-2", { project: PRJ });
  const f = reg(w, 1, { ends: "2026-12-01" }).follow;
  w.address(PAGE, HOME);
  w.duty("DUT-1", { project: PRJ, act: "publish the audit" });
  link(w, { kind: "follow", id: f });
  link(w, { kind: "address", id: PAGE });
  link(w, { kind: "duty", id: "DUT-1" });
  link(w, { kind: "follow", id: reg(w, 2).follow }, { plan: "PL-2" });
  const read = w.watchReaders[0].fn({ plan: "PL-1", viewer: MEMBER });
  assert.deepEqual(read.map((x) => [x.kind, x.ends ?? x.ends_state, x.ended, x.relied_on]),
                   [["follow", "2026-12-01", false, false], ["address", "none_set", false, false], ["duty", "none_set", false, false]]);
  assert.equal(read[2].words, "publish the audit");
  assert.equal(read[0].words.address, REG(1));
  assert.deepEqual(w.watchReaders[0].fn({ plan: "PL-1", viewer: null }).length, 3, "the closing summary's own read");
  assert.deepEqual(w.watchReaders[0].fn({ plan: "PL-1", viewer: OUTSIDER }), [], "an unseen plan: none");
  assert.deepEqual(w.watchReaders[0].fn({ plan: "PL-9", viewer: MEMBER }), []);
  assert.deepEqual(w.watchReaders[0].fn(undefined), [], "never throws");
  assert.equal(code(w.f.registerWatches()), "LISTENER_DECLARED");
});

test("R26 with the real plan-work and action-plans: where it stands lists the plan's watches; the closed plan's question is due at its closing instant; the real door refuses a second registration", () => {
  const p = planWorld();
  const stub = { monitoring: () => ({ ok: true, items: [] }), addressWatchers: () => [], addressWatchEnd: () => ({ ok: false, reason: "NO_SUCH_ADDRESS" }),
                 sweepHost: () => ({}), schedule: () => ({ unscheduled: [] }) };
  const f = followingOf(p.host, { record: p.record, membership: p.membership, actionPlans: p.ap, planWork: p.pw, monitoring: stub,
    duties: { readDuty: () => ({ ok: true, found: false }), occurrencesOf: () => ({ ok: false }) },
    answers: { standingQuestionsOf: () => ({ ok: true, questions: [] }) }, standards: { standardsIn: () => NO_STANDARDS },
    view: () => ({ time_zone: { value: "America/Halifax" } }), now: () => Date.parse(p.clock.now),
    retrieval: { registerBrowseMarks: (module) => ({ ok: true, module }) } });
  assert.deepEqual(f.registered, { ok: true, module: "following" });
  const fl = f.followRegister({ address: REG(1), ends: "2027-01-01", ...by("alice") });
  assert.equal(fl.ok, true, JSON.stringify(fl));
  const l = f.watchLink({ plan: p.PL, watch: { kind: "follow", id: fl.follow }, ...by("alice") });
  assert.equal(l.ok, true, JSON.stringify(l));
  const ws = p.pw.whereItStands({ plan: p.PL, viewer: V("alice") }).watches;
  assert.equal(ws.state, "read");
  assert.deepEqual(ws.watches.map((x) => [x.kind, x.ends, x.source.module]), [["follow", "2027-01-01", "following"]]);
  const c = p.ap.planClose({ id: p.PL, reason: "the matter is settled", ...by("bob") });
  assert.equal(c.ok, true, JSON.stringify(c));
  const q = f.watchQuestions({ viewer: V("alice") }).questions;
  assert.deepEqual(q.map((x) => [x.link, x.cause, x.due_at]), [[l.link, "closed", c.at]]);
  assert.equal(code(f.registerWatches()), "LISTENER_DECLARED");
  assert.equal(MACHINE, "class:daemon");
});

/* ---------------------------------------------------------------- R23–R26 over the real monitoring (K2875) */

test("R23 R24 R25 R26 an address watch over the real monitoring: linked as monitoring holds it, relied on while another project's document asks for it (its R72), stopped through its R71 so its R32 row is ended today, and listed ended in the plan's watches", async () => {
  const { world: monWorld, sha: msha, V: MV, NOW_MS } = await import("../monitoring/fixture.mjs");
  const m = monWorld();
  const P = "PROJ-2026-0950-p", Q = "PROJ-2026-0951-q", ADDR = "https://records.example.org/agenda", OTHER = "https://records.example.org/other";
  const rec = (addr, cap, at) => m.prov.recordReceipt({ address: addr, addressNorm: addr, captureSha: cap, retrieved: at, via: "direct",
    retrievalLocator: addr, context: { authorityKind: "sweep", authority: "x", actorClass: "plane", actor: null, observe: false } });
  m.inProject(P, { owner: "carol" });
  m.inProject(Q, { owner: "erin", joined: ["carol"] });
  const a = m.monitored("INFO-2026-0950-a", ADDR, "agenda v1", { freq: "daily", lines: [`project: ${P}`] });
  const b = m.monitored("INFO-2026-0951-b", ADDR, "agenda v2", { freq: "daily", lines: [`project: ${Q}`] });
  const o = m.monitored("INFO-2026-0952-o", OTHER, "other v1", { freq: "daily", lines: [`project: ${P}`] });
  rec(ADDR, a.cap, "2026-09-01T00:00:00Z"); rec(ADDR, b.cap, "2026-09-02T00:00:00Z"); rec(OTHER, o.cap, "2026-09-01T00:00:00Z");
  for (const id of ["carol", "erin"])
    m.st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, id);
  /* one plan of P, read as action-plans answers it (its sight is its project's participants) */
  const plan = { id: "PL-1", project: P, state: "open", subjects: [{ key: "inquiry:I-1" }] };
  const sees = (v) => v == null || m.rows(`SELECT 1 FROM project_participants WHERE project_id=? AND member_id=?`, P, String(v).replace(/^member:/, "")).length > 0;
  const actionPlans = { planRead: ({ id, viewer }) => (id === plan.id && sees(viewer) ? { ok: true, ...structuredClone(plan) } : noSuchPlan(id ?? null)) };
  const readers = [];
  const f = followingOf(m.host, { record: m.record, membership: m.membership, monitoring: m.m, actionPlans,
    planWork: { registerWatchReader: (mod, fn) => (readers.push(fn), { ok: true, module: mod }), matterPromiseDuties: () => ({ ok: true, duties: [], all_met: false }) },
    duties: { readDuty: () => ({ ok: true, found: false }) }, answers: { standingQuestionsOf: () => ({ ok: true, questions: [] }) },
    standards: { standardsIn: () => NO_STANDARDS }, view: () => ({ time_zone: { value: "America/Halifax" } }), now: () => m.clock.ms });
  const carol = MV("carol");
  const la = f.watchLink({ plan: "PL-1", watch: { kind: "address", id: ADDR }, author: carol, viewer: carol });
  const lo = f.watchLink({ plan: "PL-1", watch: { kind: "address", id: "https://RECORDS.example.org/other" }, author: carol, viewer: carol });
  assert.deepEqual([la.ok, la.watch.id, lo.ok, lo.watch.id], [true, ADDR, true, OTHER], "linked as monitoring holds the address");
  assert.equal(code(f.watchLink({ plan: "PL-1", watch: { kind: "address", id: ADDR }, author: MV("zed"), viewer: MV("zed") })), "NO_SUCH_PLAN");
  plan.state = "closed"; plan.closed = { at: "2026-09-28T10:00:00Z" };
  const q = f.watchQuestions({ viewer: carol }).questions;
  assert.deepEqual(q.map((x) => [x.watch.id, x.relied_on, x.offered, x.recipients]),
                   [[ADDR, true, [], [carol]], [OTHER, false, ["keep", "stop"], [carol]]], "Q's document asks for ADDR: relied on");
  assert.doesNotMatch(JSON.stringify(q), new RegExp(Q));
  assert.equal(code(f.watchAnswer({ link: la.link, stop: true, author: carol })), "WATCH_RELIED_ON");
  const s = f.watchAnswer({ link: lo.link, stop: true, author: carol });
  assert.deepEqual([s.ok, s.until, s.owner.ok, s.owner.setting.until], [true, "2026-09-28", true, "2026-09-28"]);
  const row = m.m.monitoring({ viewer: carol, now: NOW_MS }).items.find((r) => r.address === OTHER);
  assert.deepEqual([row.state, row.until], ["ended", "2026-09-28"], "monitoring's own row: ended today");
  const listed = readers[0]({ plan: "PL-1", viewer: carol });
  assert.deepEqual(listed.map((x) => [x.watch, x.ends ?? x.ends_state, x.ended, x.relied_on]),
                   [[ADDR, "none_set", false, true], [OTHER, "2026-09-28", true, false]]);
  assert.equal(typeof msha, "function");
});
