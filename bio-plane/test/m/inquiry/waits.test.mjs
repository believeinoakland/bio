/* Dated waits on an inquiry (R54–R57; T33-45, ladders §4.5, DEC-98, Choices 23): a recheck trigger carrying a date is a
   wait its setter is told of on the local day it falls due. Driven through promotions (R12's projection), the reads
   notice-producers asks (R55), the setter's look (R56) and the scheduler's consumer (R57); the profile's zone is the
   jurisdiction view's (America/Los_Angeles here: UTC-7 in October, so 07:00Z is the local midnight). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { WAIT_ENDING_STATES } from "../../../src/inquiry/index.mjs";

const Q = "INQ-2026-0701-q", R = "INQ-2026-0702-r";
const LA = () => ({ time_zone: { value: "America/Los_Angeles" } });
const trig = (list) => ["recheck_triggers:", ...list.flatMap((t) => [`  - text: "${t.text}"`,
  `    description: "${t.description ?? "from the clerk"}"`, ...(t.date ? [`    date: "${t.date}"`] : [])])];
const doc = (id, list, opts = {}) => inquiryMd(id, { ...opts, extra: [...trig(list), ...(opts.extra || [])] });
const waitRows = (w, id) => w.rows(`SELECT idx, text, description, date, set_by, set_at, ended, ended_by FROM inquiry_dated_waits
                                    WHERE bundle_id=? ORDER BY wait_id`, id);

function setup(opts = {}) {
  const w = world({ view: LA, ...opts });
  w.member("alice"); w.member("bob");
  return w;
}

test("R54 a recheck trigger with a date is a wait, set by the promotion's author; an undated trigger is none; text and date unchanged keep who set it", () => {
  const w = setup();
  assert.equal(w.promote(Q, doc(Q, [{ text: "minutes posted" }, { text: "records reply", date: "2026-10-10" }]), null,
    { author: V("alice") }).ok, true);
  assert.deepEqual(waitRows(w, Q).map((r) => [r.idx, r.text, r.date, r.set_by, r.ended]),
    [[1, "records reply", "2026-10-10", V("alice"), null]]);
  const setAt = waitRows(w, Q)[0].set_at;
  w.clock.now = "2026-09-29T00:00:00Z";
  /* bob's revision reorders the triggers and re-words the description: the wait stays alice's, at its new position */
  assert.equal(w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10", description: "from the city clerk" },
    { text: "minutes posted" }]), undefined, { author: V("bob") }).ok, true);
  assert.deepEqual(waitRows(w, Q).map((r) => [r.idx, r.description, r.set_by, r.set_at, r.ended]),
    [[0, "from the city clerk", V("alice"), setAt, null]]);
});

test("R54 a re-dated trigger ends the wait it was (redated, with who and when) and starts a new one set by that author; a removed one ends removed; ended waits are kept", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }, { text: "agenda out", date: "2026-10-12" }]), null,
    { author: V("alice") });
  w.clock.now = "2026-09-30T00:00:00Z";
  assert.equal(w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-20" }]), undefined, { author: V("bob") }).ok, true);
  assert.deepEqual(waitRows(w, Q).map((r) => [r.text, r.date, r.set_by, r.ended, r.ended_by]), [
    ["records reply", "2026-10-10", V("alice"), "redated", V("bob")],
    ["agenda out", "2026-10-12", V("alice"), "removed", V("bob")],
    ["records reply", "2026-10-20", V("bob"), null, null]]);
  /* a replayed creation's waits are projected like any other */
  assert.equal(w.promote(R, doc(R, [{ text: "x", date: "2026-11-01" }]), null, { replay: true }).ok, true);
  assert.equal(waitRows(w, R).length, 1);
});

test("R54 scheduler R9: onWaitSet tells one registered module of each wait set or re-dated; a second registration is refused; a throwing listener never undoes the promotion", () => {
  const w = setup();
  const told = [];
  assert.deepEqual(w.k.onWaitSet("scheduler", (n) => told.push(n)), { ok: true, module: "scheduler" });
  assert.equal(w.k.onWaitSet("other", () => {}).reason, "LISTENER_DECLARED");
  assert.equal(w.k.onWaitSet("", () => {}).reason, "LISTENER_MALFORMED");
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }]), null, { author: V("alice") });
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }, { text: "b" }]), undefined, { author: V("alice") });
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-11" }]), undefined, { author: V("bob") });
  assert.deepEqual(told, [{ inquiry: Q, date: "2026-10-10", set_by: V("alice") }, { inquiry: Q, date: "2026-10-11", set_by: V("bob") }]);
  const w2 = setup();
  w2.k.onWaitSet("scheduler", () => { throw new Error("boom"); });
  assert.equal(w2.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }]), null, { author: V("alice") }).ok, true);
  assert.equal(waitRows(w2, Q).length, 1);
});

test("R55 the setter's waits with text and description as written, waiting before the date and due from the start of its local day in the profile's zone, never the UTC day", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", description: "from the city clerk", date: "2026-10-10" }]), null, { author: V("alice") });
  const at = (asOf) => w.k.datedWaits({ member: "alice", asOf, viewer: V("alice") });
  const before = at("2026-10-10T06:59:59Z");          /* 23:59:59 on the 9th, local: the UTC day is already the 10th */
  assert.deepEqual(before.waits.map((x) => [x.inquiry, x.index, x.text, x.description, x.date, x.state]),
    [[Q, 0, "records reply", "from the city clerk", "2026-10-10", "waiting"]]);
  assert.equal(before.zone, "America/Los_Angeles");
  assert.equal(at("2026-10-10T07:00:00Z").waits[0].state, "due", "from the local day's first instant");
  assert.equal(at("2026-10-12T07:00:00Z").waits[0].state, "due", "and after");
  assert.equal(w.k.datedWaits({ member: V("alice"), asOf: "2026-10-11T00:00:00Z", viewer: V("alice") }).waits[0].state, "due",
    "the member named by stamp or by id alike");
});

test("R55 only the member who set a wait is answered it: any other member, the administrator, a machine and no viewer read none; an inquiry out of sight is not answered", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  for (const viewer of [V("bob"), "admin", MACHINE, null, "alice"])
    assert.deepEqual(w.k.datedWaits({ member: "alice", viewer }).waits, [], String(viewer));
  assert.deepEqual(w.k.datedWaits({ member: "bob", viewer: V("bob") }).waits, [], "bob set none");
  const P = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, Q);
  assert.deepEqual(w.k.datedWaits({ member: "alice", viewer: V("alice") }).waits, [], "a question alice may no longer see");
});

test("R55 looked once its setter records a look; ended when the inquiry is concluded, divided or dismissed; undetermined, with why, while no zone is held", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  w.promote(R, doc(R, [{ text: "agenda", date: "2026-10-10" }]), null, { author: V("alice") });
  assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by: V("alice"), note: "nothing yet" }).ok, true);
  const states = () => Object.fromEntries(w.k.datedWaits({ member: "alice", asOf: "2026-10-11T00:00:00Z", viewer: V("alice") })
    .waits.map((x) => [x.inquiry, x]));
  assert.equal(states()[Q].state, "looked"); assert.equal(states()[Q].note, "nothing yet");
  assert.deepEqual(WAIT_ENDING_STATES, ["concluded", "divided", "dismissed"]);
  for (const s of WAIT_ENDING_STATES) {
    w.st.sql.exec(`UPDATE bundles SET current_state=? WHERE bundle_id=?`, s, R);
    assert.deepEqual([states()[R].state, states()[R].inquiry_state], ["ended", s], s);
  }
  for (const s of ["open", "deferred"]) {
    w.st.sql.exec(`UPDATE bundles SET current_state=? WHERE bundle_id=?`, s, R);
    assert.equal(states()[R].state, "due", s);
  }
  const nz = setup({ view: () => ({}) });
  nz.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  const u = nz.k.datedWaits({ member: "alice", asOf: "2026-10-11T00:00:00Z", viewer: V("alice") }).waits[0];
  assert.equal(u.state, "undetermined"); assert.match(u.why, /never read as the UTC day/);
  const bad = setup({ view: () => ({ time_zone: { value: "Mars/Olympus" } }) });
  bad.promote(Q, doc(Q, [{ text: "r", date: "2026-10-10" }]), null, { author: V("alice") });
  assert.equal(bad.k.datedWaits({ member: "alice", asOf: "2026-10-11T00:00:00Z", viewer: V("alice") }).waits[0].state,
    "undetermined", "an unknown zone holds no zone");
});

test("R55 the read writes nothing and never throws", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  const before = JSON.stringify(w.rows(`SELECT * FROM inquiry_dated_waits`));
  w.k.datedWaits({ member: "alice", asOf: "2026-10-11T00:00:00Z", viewer: V("alice") });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM inquiry_dated_waits`)), before);
  for (const a of [undefined, {}, { member: 42, viewer: {} }, { member: "alice", viewer: V("alice"), asOf: 7 }])
    assert.doesNotThrow(() => w.k.datedWaits(a));
});

test("R56 waitLook: MACHINE_CANNOT_LOOK, NO_SUCH_WAIT (absent or out of sight, one answer), NOT_YOUR_WAIT, BAD_NOTE; the setter's look writes the look and nothing else", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  for (const by of [MACHINE, "", null]) assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by }).reason, "MACHINE_CANNOT_LOOK");
  assert.equal(w.k.waitLook({ inquiry: Q, index: 3, by: V("alice") }).reason, "NO_SUCH_WAIT");
  assert.equal(w.k.waitLook({ inquiry: R, index: 0, by: V("alice") }).reason, "NO_SUCH_WAIT");
  assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by: V("bob") }).reason, "NOT_YOUR_WAIT");
  assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by: V("alice"), note: "x".repeat(501) }).reason, "BAD_NOTE");
  const sha = w.record.head(Q).bundleSha, doc0 = w.text(Q);
  const r = w.k.waitLook({ inquiry: Q, index: 0, by: V("alice") });
  assert.deepEqual([r.ok, r.state, r.looked_at], [true, "looked", w.clock.now]);
  assert.equal(w.record.head(Q).bundleSha, sha, "nothing in the inquiry moves");
  assert.equal(w.text(Q), doc0);
  /* out of sight answers as absent, even to the setter */
  const P = w.project("Bob's own", "bob");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, Q);
  assert.equal(w.k.waitLook({ inquiry: Q, index: 0, by: V("alice") }).reason, "NO_SUCH_WAIT");
});

test("R56 a look holds until a later revision sets a new date: the new wait reads waiting or due again", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10" }]), null, { author: V("alice") });
  w.k.waitLook({ inquiry: Q, index: 0, by: V("alice") });
  const read = () => w.k.datedWaits({ member: "alice", asOf: "2026-10-11T00:00:00Z", viewer: V("alice") }).waits;
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-10", description: "re-worded" }]), undefined, { author: V("alice") });
  assert.equal(read()[0].state, "looked", "an unchanged date keeps the look");
  w.promote(Q, doc(Q, [{ text: "records reply", date: "2026-10-20" }]), undefined, { author: V("alice") });
  assert.deepEqual(read().map((x) => [x.date, x.state]), [["2026-10-20", "waiting"]]);
});

test("R57 datedWaitsDue, datedWaitsWake and datedWaitsTick on the local day: each due wait marked once, idempotently; looked, ended and marked waits are not due", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }, { text: "b", date: "2026-10-14" }]), null, { author: V("alice") });
  w.promote(R, doc(R, [{ text: "c", date: "2026-10-10" }]), null, { author: V("bob") });
  const EVE = "2026-10-10T06:30:00Z", DAY = "2026-10-10T08:00:00Z";
  assert.equal(w.k.datedWaitsDue(EVE), false, "the 9th, local, though the 10th in UTC");
  assert.equal(w.k.datedWaitsWake(EVE), "2026-10-10T07:00:00Z", "the start of the next local day holding a wait");
  assert.deepEqual(w.k.datedWaitsTick(EVE).marked, []);
  assert.equal(w.k.datedWaitsDue(DAY), true);
  const first = w.k.datedWaitsTick(DAY).marked;
  assert.deepEqual(first.map((m) => [m.inquiry, m.index, m.date, m.set_by]).sort(),
    [[Q, 0, "2026-10-10", V("alice")], [R, 0, "2026-10-10", V("bob")]]);
  assert.deepEqual(w.k.datedWaitsTick(DAY).marked, [], "a second tick the same day marks nothing");
  assert.equal(w.k.datedWaitsDue(DAY), false);
  assert.equal(w.k.datedWaitsWake(DAY), "2026-10-14T07:00:00Z");
  /* a looked wait and an ended inquiry's are never due */
  w.k.waitLook({ inquiry: Q, index: 1, by: V("alice") });
  assert.equal(w.k.datedWaitsWake(DAY), null);
  assert.equal(w.k.datedWaitsDue("2026-10-15T08:00:00Z"), false);
  w.promote(R, doc(R, [{ text: "c", date: "2026-10-16" }]), undefined, { author: V("bob") });
  w.st.sql.exec(`UPDATE bundles SET current_state='dismissed' WHERE bundle_id=?`, R);
  assert.equal(w.k.datedWaitsDue("2026-10-17T08:00:00Z"), false);
  assert.equal(w.k.datedWaitsWake(DAY), null);
  /* a re-dated wait is a new wait, marked anew on its own day */
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-18" }, { text: "b", date: "2026-10-14" }]), undefined, { author: V("alice") });
  assert.deepEqual(w.k.datedWaitsTick("2026-10-18T08:00:00Z").marked.map((m) => m.date), ["2026-10-18"]);
});

test("R57 with no zone held nothing is due, no wake is named and a tick marks nothing; none of the three throws", () => {
  const w = setup({ view: () => ({}) });
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }]), null, { author: V("alice") });
  assert.equal(w.k.datedWaitsDue("2026-10-11T08:00:00Z"), false);
  assert.equal(w.k.datedWaitsWake("2026-10-01T08:00:00Z"), null);
  assert.deepEqual(w.k.datedWaitsTick("2026-10-11T08:00:00Z").marked, []);
  for (const bad of [undefined, null, 7, "not a time"]) {
    assert.doesNotThrow(() => w.k.datedWaitsDue(bad)); assert.doesNotThrow(() => w.k.datedWaitsWake(bad));
    assert.doesNotThrow(() => w.k.datedWaitsTick(bad));
  }
});

test("R36 R54 the dated waits carry bundle_id, are declared sight owner, and are purged with their inquiry", () => {
  const w = setup();
  w.promote(Q, doc(Q, [{ text: "a", date: "2026-10-10" }]), null, { author: V("alice") });
  const d = w.record.declaredTables().find((t) => t.name === "inquiry_dated_waits");
  assert.deepEqual([d.module, d.sight, d.purge], ["inquiry", "owner", "clear"]);
  w.record.transact(() => w.record.purge({ bundleId: Q }));
  assert.equal(w.count("inquiry_dated_waits"), 0);
});
