/* following R4–R6: a `per_meeting` watch captured before each of its body's meetings, by the body's notice period. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, body, observedMeeting, MEMBER, OUTSIDER, MACHINE, T0 } from "./fixture.mjs";

const AGENDA = "https://ellery.example/selectboard/agenda";
const at = (s) => Date.parse(s);
const iso = (s) => new Date(s).toISOString().replace(/\.000Z$/, "Z");

/* A watched address (a per_meeting subject of monitoring) in the bundle INFO-2026-0100-agenda, linked to the body. */
function watch(w, { notice = "notice_of_sitting", label } = {}) {
  const b = body(w, label);
  w.bundle("INFO-2026-0100-agenda");
  w.watched.push({ bundle: "INFO-2026-0100-agenda", address: AGENDA });
  const r = w.f.perMeetingBody({ address: AGENDA, body: b, notice, author: MEMBER, viewer: MEMBER });
  assert.equal(r.ok, true, JSON.stringify(r));
  return b;
}
const meetingItem = (w) => w.f.follows({ viewer: MEMBER }).items.find((i) => i.kind === "per_meeting");

test("R4 a per_meeting watch naming its body is captured at each meeting's start less the notice period: the profile's recurrence in the meeting's zone, an observed meeting governing the instance it matches, a cancelled meeting earning none", async () => {
  const w = world();
  const b = watch(w);
  /* the recurrence (second Tuesday, 19:00 America/Halifax): 2026-10-13T19:00 local is 22:00Z; 36 clock hours before */
  let m = meetingItem(w);
  assert.equal(m.meeting, "2026-10-13T22:00:00Z");
  assert.equal(m.meeting_source, "recurrence");
  assert.equal(m.next_due, "2026-10-12T10:00:00Z");
  assert.equal(w.f.followWake(T0), at("2026-10-12T10:00:00Z"));
  assert.equal(w.f.followDue(T0), false);
  /* the November meeting is observed at 18:00 local on the recurrence's day; the December one is cancelled */
  observedMeeting(w, b, "2026-11-10T18:00");
  observedMeeting(w, b, "2026-12-08T19:00", "EventCancelled");
  /* at the due instant, the tick asks monitoring for the document's own check (R1–R10) */
  w.t = at("2026-10-12T10:00:00Z");
  assert.equal(w.f.followDue(w.t), true);
  let tick = await w.f.followTick(w.t);
  assert.deepEqual(w.monitored.map((x) => x.bundleId), ["INFO-2026-0100-agenda"]);
  assert.equal(tick.captured.length, 1);
  assert.equal(tick.captured[0].meeting, "2026-10-13T22:00:00Z");
  /* the observed time governs November's instance (18:00 AST is 22:00Z; 36 h before) */
  m = meetingItem(w);
  assert.equal(m.meeting, "2026-11-10T22:00:00Z");
  assert.equal(m.meeting_source, "observed");
  assert.equal(m.next_due, "2026-11-09T10:00:00Z");
  w.t = at("2026-11-09T10:00:00Z");
  tick = await w.f.followTick(w.t);
  assert.equal(tick.captured[0].meeting, "2026-11-10T22:00:00Z");
  /* December's meeting is cancelled: no capture is due before it; January's recurrence is next */
  m = meetingItem(w);
  assert.equal(m.meeting, "2027-01-12T23:00:00Z");
  /* a capture already taken is never taken twice for the same meeting */
  w.t = at("2026-11-09T10:30:00Z");
  tick = await w.f.followTick(w.t);
  assert.equal(tick.captured.length, 0);
  assert.equal(w.monitored.length, 2);
});

test("R4 the link is a member's act on a watched address they may see, naming a registered body; the machine names none", () => {
  const w = world();
  const b = body(w);
  w.bundle("INFO-2026-0100-agenda");
  w.watched.push({ bundle: "INFO-2026-0100-agenda", address: AGENDA });
  assert.equal(w.f.perMeetingBody({ address: AGENDA, body: b, notice: "notice_of_sitting", author: MACHINE }).reason, "MACHINE_CANNOT_FOLLOW");
  assert.equal(w.f.perMeetingBody({ address: "https://ellery.example/other", body: b, author: MEMBER, viewer: MEMBER }).reason, "NO_SUCH_ADDRESS");
  assert.equal(w.f.perMeetingBody({ address: AGENDA, body: "ENT-2026-9999", author: MEMBER, viewer: MEMBER }).reason, "NO_SUCH_BODY");
  /* a watch in a project the viewer is not part of is not theirs to see */
  w.project("PRJ-2026-0001-a");
  w.st.sql.exec(`UPDATE bundles SET project='PRJ-2026-0001-a' WHERE bundle_id='INFO-2026-0100-agenda'`);
  assert.equal(w.f.perMeetingBody({ address: AGENDA, body: b, notice: "notice_of_sitting", author: OUTSIDER, viewer: OUTSIDER }).reason, "NO_SUCH_ADDRESS");
  assert.equal(w.rows(`SELECT * FROM per_meeting_links`).length, 0);
  assert.equal(w.f.perMeetingBody({ address: AGENDA, body: b, notice: "notice_of_sitting", author: MEMBER, viewer: MEMBER }).ok, true);
});

test("R5 a watch with no body, a body with no recurrence and no observed meeting in 24 months, or a notice period the profile does not hold with a primary source, is unscheduled with its reason, never a guessed time", async () => {
  const cases = [
    { name: "no body", setup: (w) => { w.bundle("INFO-2026-0100-agenda"); w.watched.push({ bundle: "INFO-2026-0100-agenda", address: AGENDA }); },
      why: /names no body/ },
    { name: "no notice", setup: (w) => watch(w, { notice: null }), why: /names no notice period/ },
    { name: "unknown notice", setup: (w) => watch(w, { notice: "no_such_rule" }), why: /hold no notice period named no_such_rule/ },
    { name: "forward rule", setup: (w) => watch(w, { notice: "claim_notice" }), why: /not a period counted back/ },
    { name: "unsourced", setup: (w) => { w.view.deadlines.find((d) => d.rule === "notice_of_sitting").status = "UNMEASURED"; watch(w); }, why: /primary source/ },
    { name: "no meeting", setup: (w) => watch(w, { label: "Port Ellery Library Board" }), why: /no stated meeting schedule and no observed meeting in the next 24 months/ },
  ];
  for (const c of cases) {
    const w = world();
    c.setup(w);
    const item = meetingItem(w);
    assert.match(item.unscheduled, c.why, c.name);
    assert.equal(item.next_due, undefined, `${c.name}: no time is given`);
    assert.equal(w.f.followWake(T0), null, c.name);
    const tick = await w.f.followTick(w.t);
    assert.equal(tick.unscheduled.length, 1, c.name);
    assert.match(tick.unscheduled[0].reason, c.why, c.name);
    assert.equal(w.monitored.length, 0, c.name);
  }
});

test("R6 each per_meeting capture states the alarm's lateness, the instant taken less the instant due, and whether the meeting had begun", async () => {
  const w = world();
  watch(w);
  w.t = at("2026-10-12T10:05:00Z");
  let tick = await w.f.followTick(w.t);
  assert.equal(tick.captured[0].due_at, "2026-10-12T10:00:00Z");
  assert.equal(tick.captured[0].taken_at, "2026-10-12T10:05:00Z");
  assert.equal(tick.captured[0].lateness_ms, 300000);
  assert.equal(tick.captured[0].after_meeting_began, false);
  assert.equal(meetingItem(w).last_capture.lateness_ms, 300000);
  /* an alarm that fires after the next meeting began says so */
  w.t = at("2026-11-10T23:30:00Z");
  tick = await w.f.followTick(w.t);
  assert.equal(tick.captured[0].meeting, "2026-11-10T23:00:00Z");
  assert.equal(tick.captured[0].lateness_ms, at("2026-11-10T23:30:00Z") - at("2026-11-09T11:00:00Z"));
  assert.equal(tick.captured[0].after_meeting_began, true);
  assert.equal(iso(at(tick.captured[0].taken_at)), "2026-11-10T23:30:00Z");
});
