/* action-clocks' T47 entries at its interface (T47-39): R22, `dueAtOf`, the one reading of a timed clock entry (N965;
   `actions` R98, `monitoring` R34); R23, each `overdueClocks` item names the clock's venue (N968; `action-producers` R1).
   On the test profile; instance clock 2026-09-28T12:00Z, the action's zone America/Halifax. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const key = (x) => `${x.action}:${x.ord}`;
const NONE = { due_at: null, due_zone: null };
/* One clock entry with its own keys. */
const E = (date, extra = []) => [`  - text: "t"`, '    description: "d"', `    date: ${date}`, "    basis: Act s.2", "    status: pending", ...extra];

test("R22 dueAtOf(entry, zone) is exported and pure: a timed entry with due_zone answers its own zone; one without answers the action's zone; a date-only entry answers both null; a malformed due_at answers both null", () => {
  const { dueAtOf } = clocks;
  assert.equal(typeof dueAtOf, "function");
  /* a timed entry stating its own zone: that zone, whatever the action's. */
  assert.deepEqual(dueAtOf({ date: "2026-09-02", due_at: "2026-09-02T17:00", due_zone: "America/Toronto" }, "America/Halifax"),
    { due_at: "2026-09-02T17:00", due_zone: "America/Toronto" });
  /* seconds are optional; due_at is answered as stated. */
  assert.deepEqual(dueAtOf({ due_at: "2026-09-02T17:00:30", due_zone: "UTC" }, "America/Halifax"), { due_at: "2026-09-02T17:00:30", due_zone: "UTC" });
  /* one stating no zone, or an empty one: the action's zone. */
  for (const due_zone of [undefined, null, "", "   ", 7])
    assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00", due_zone }, "America/Halifax"), { due_at: "2026-09-03T12:00", due_zone: "America/Halifax" }, String(due_zone));
  /* with no action zone held, its zone is null, never UTC. */
  for (const zone of [null, undefined, "", 3]) assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00" }, zone), { due_at: "2026-09-03T12:00", due_zone: null }, String(zone));
  /* a function given as zone is asked only when the entry states none. */
  let asked = 0;
  const zf = () => { asked++; return "America/Halifax"; };
  assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00", due_zone: "UTC" }, zf), { due_at: "2026-09-03T12:00", due_zone: "UTC" });
  assert.deepEqual(dueAtOf({ date: "2026-09-03" }, zf), NONE);
  assert.equal(asked, 0, "not asked for an entry stating its zone, nor for a date-only one");
  assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00" }, zf), { due_at: "2026-09-03T12:00", due_zone: "America/Halifax" });
  assert.equal(asked, 1);
  /* a date-only entry: both null. */
  assert.deepEqual(dueAtOf({ text: "t", date: "2026-09-01", status: "pending" }, "America/Halifax"), NONE);
  /* a malformed due_at: both null, even with a zone stated. */
  for (const due_at of ["soon", "2026-09-03", "2026-09-03 12:00", "2026-09-03T12", "2026-09-03T24:00", "2026-09-03T12:60", "2026-09-03T12:00:61",
                        "2026-02-30T12:00", "2026-09-03T12:00Z", "2026-09-03T12:00+01:00", "x2026-09-03T12:00", 20260903, null, {}])
    assert.deepEqual(dueAtOf({ due_at, due_zone: "UTC" }, "America/Halifax"), NONE, String(due_at));
  /* never throws: hostile entries and zones answer as an untimed entry, or a null zone. */
  const trap = { get due_at() { throw new Error("x"); } };
  for (const e of [undefined, null, 0, "2026-09-03T12:00", [], trap, new Proxy({}, { get() { throw new Error("x"); } })])
    assert.deepEqual(dueAtOf(e, "UTC"), NONE);
  assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00" }, () => { throw new Error("x"); }), { due_at: "2026-09-03T12:00", due_zone: null });
  assert.deepEqual(dueAtOf({ due_at: "2026-09-03T12:00", get due_zone() { throw new Error("x"); } }, "UTC"), NONE);
  /* pure: the entry is not changed. */
  const e = { due_at: "2026-09-03T12:00" };
  dueAtOf(e, "UTC");
  assert.deepEqual(e, { due_at: "2026-09-03T12:00" });
});

test("R22 R3's and R19's items carry dueAtOf's answer for each entry, the action's zone being the one they judge it in; and a member states a timed entry only as a local date-time on its own date (control: an hour 24 is CLOCK_ENTRY_REFUSED)", () => {
  const w = world();
  const timed = [E("2026-09-01"), E("2026-09-02", ['    due_at: "2026-09-02T17:00"', "    due_zone: America/Toronto"]),
                 E("2026-09-03", ['    due_at: "2026-09-03T12:00"']), E("2026-09-04", ['    due_at: "2026-09-04T25:00"'])].flat();
  w.action(A, ["clock:", ...timed]);
  w.action(B, ["clock:", ...CLK("2026-09-05")]);
  const zone = "America/Halifax";
  const want = Object.fromEntries(w.fm(A).clock.map((e, i) => [`${A}:${i}`, clocks.dueAtOf(e, zone)]));
  want[`${B}:0`] = NONE;
  assert.deepEqual(want[`${A}:2`], { due_at: "2026-09-03T12:00", due_zone: zone });
  assert.deepEqual(want[`${A}:3`], NONE, "an hour 25 is no time of day");
  const pick = (items) => Object.fromEntries(items.map((x) => [key(x), { due_at: x.due_at, due_zone: x.due_zone }]));
  const over = w.c.overdueClocks({ viewer: M }).items;
  assert.ok(over.every((x) => x.zone === zone));
  assert.deepEqual(pick(over), want, "R3");
  assert.deepEqual(pick(w.c.pendingClocks({ before: "2026-10-01", viewer: M }).items), want, "R19");
  const S = (x) => w.c.clockState({ target: B, text: "t", description: "d", date: "2026-10-10", basis: "b", basis_kind: "window",
    owed_by: "group", author: M, viewer: M, ...x });
  for (const due_at of ["2026-10-10T24:00", "2026-10-10T12:60", "2026-10-10T9:00"]) assert.equal(S({ due_at }).arm, "due_at", due_at);
  assert.equal(S({ due_at: "2026-10-10T23:59:59" }).ok, true);
  assert.deepEqual(clocks.dueAtOf(w.fm(B).clock[1], zone), { due_at: "2026-10-10T23:59:59", due_zone: zone });
});

test("R23 each overdueClocks item carries venue: an office addressee answers its role and body; a kind with a venue and no office addressee answers the venue, named as the view states it; neither answers null with venue_why; R3's order, paging and other fields unchanged", () => {
  const w = world();
  const C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d", F = "ACTN-2026-0005-f";
  const AUD = ["counterparty:", "  state: audience", "  description: residents"];
  /* an office addressee, even where its kind has a venue: the office. */
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-09-02")]);
  /* no office addressed, the kind's venue held: the venue (the test profile's records_request venue). */
  w.action(B, [...AUD, "action_kind: records_request", "clock:", ...CLK("2026-09-01")]);
  /* a named non-office, its kind with a venue: the venue. */
  w.action(C, ["counterparty:", "  state: named", "  kind: press", "  role: Reporter", "  organisation: the Harbour Gazette",
               "action_kind: bylaw_complaint", "clock:", ...CLK("2026-09-01")]);
  /* neither (control): null, saying why. */
  w.action(D, [...AUD, "action_kind: other", "clock:", ...CLK("2026-09-01")]);
  const r = w.c.overdueClocks({ viewer: M });
  const by = Object.fromEntries(r.items.map((x) => [key(x), [x.venue, x.venue_why]]));
  const clerk = { kind: "office", role: "Town Clerk", body: "Town of Port Ellery" };
  assert.deepEqual(by[`${A}:0`], [clerk, undefined]);
  assert.deepEqual(by[`${A}:1`], [clerk, undefined], "every entry of the action");
  assert.deepEqual(by[`${B}:0`], [{ kind: "venue", action_kind: "records_request", name: "the Town Clerk's office" }, undefined]);
  assert.deepEqual(by[`${C}:0`], [{ kind: "venue", action_kind: "bylaw_complaint", name: "the Selectboard" }, undefined]);
  assert.equal(by[`${D}:0`][0], null);
  assert.match(by[`${D}:0`][1], /no office/);
  /* answered as the record states it: no sentence composed here. */
  for (const x of r.items) if (x.venue) assert.ok(!Object.values(x.venue).some((v) => typeof v === "string" && /owed|due at|is the/.test(v)));
  /* R3 unchanged: order, paging and the other fields. */
  assert.deepEqual(r.items.map(key), [`${A}:0`, `${A}:1`, `${B}:0`, `${C}:0`, `${D}:0`]);
  const p1 = w.c.overdueClocks({ viewer: M, limit: 2 });
  assert.deepEqual([p1.items.map(key), p1.cursor], [[`${A}:0`, `${A}:1`], `${A}#1`]);
  assert.deepEqual(w.c.overdueClocks({ viewer: M, limit: 2, after: p1.cursor }).items.map((x) => [key(x), x.venue && x.venue.kind]),
    [[`${B}:0`, "venue"], [`${C}:0`, "venue"]]);
  /* the pure read, at its interface. */
  assert.deepEqual(clocks.venueOf({ counterparty: { state: "named", role: " Town Clerk ", body: "City of Port Ellery" } }, null),
    { venue: { kind: "office", role: "Town Clerk", body: "City of Port Ellery" } });
  for (const x of [null, undefined, 3, {}]) assert.equal(clocks.venueOf(x, x).venue, null);
  assert.equal(clocks.venueOf({ action_kind: "x" }, { get action_kinds() { throw new Error("x"); } }).venue, null, "never throws");
});

test("R21 the zone a day is read in is actions.actionZone (its R100), the one spelling: with two active profiles of different zones, an action addressed to an office the second gives is judged, and its items' zone answered, in the second's zone (R3, R5, R14, R19's fallback), the zone actions reads; with no zone held its days stay undetermined, never the UTC day; this module exports no actionZone of its own", async () => {
  const actions = await import("../../../src/actions/index.mjs");
  assert.ok(!("actionZone" in clocks), "no actionZone of this module's own");
  /* the test profile (America/Halifax) and the first profile (America/Los_Angeles) active together: their own time_zone
     facts disagree, so the combined view holds none (jurisdictions R15). */
  const w = world({ profiles: ["test-port-ellery", "oakland-alameda"] });
  const view = w.localFacts.governingView().view;
  assert.equal(view.time_zone, undefined, "no view-wide zone: each action's zone is its office's profile's");
  const LA = "America/Los_Angeles", HFX = "America/Halifax";
  const C = "ACTN-2026-0003-c";
  w.action(A, ["counterparty:", "  state: named", "  role: Controller", "  body: Finance Department", "action_kind: other",
               "clock:", ...E("2026-09-28", ['    due_at: "2026-09-28T17:00"'])]);
  w.action(B, ["counterparty:", "  state: named", "  role: Town Clerk", "  body: City of Port Ellery", "action_kind: other",
               "clock:", ...CLK("2026-09-28")]);
  w.action(C, ["counterparty:", "  state: audience", "  description: residents", "action_kind: other", "clock:", ...CLK("2026-09-01")]);
  assert.deepEqual([A, B, C].map((id) => actions.actionZone(w.fm(id), view)), [LA, HFX, null], "the zone actions reads (its R100)");
  /* R3: 2026-09-29T04:00Z is the 29th in Halifax and still the 28th in Los Angeles. */
  const at = (iso) => w.c.overdueClocks({ viewer: M, now: Date.parse(iso) });
  const r = at("2026-09-29T04:00:00Z");
  assert.deepEqual(r.items.map((x) => [x.action, x.zone, x.local_day]), [[B, HFX, "2026-09-29"]], "the second's entry not yet past in its own zone");
  assert.equal(r.zone_undetermined, 1, "C's day undetermined (no zone held), never judged on the UTC day, where it is long past");
  const later = at("2026-09-29T08:00:00Z");
  assert.deepEqual(later.items.map((x) => [x.action, x.zone, x.local_day, x.due_zone]), [[A, LA, "2026-09-29", LA], [B, HFX, "2026-09-29", null]],
    "judged, and answered, in the zone actions reads; a timed entry stating no zone falls back to it");
  assert.equal(later.zone_undetermined, 1);
  /* R19: pendingClocks' fallback due_zone is the same zone. */
  assert.deepEqual(w.c.pendingClocks({ before: "2026-10-01", viewer: M }).items.filter((x) => x.action === A).map((x) => x.due_zone), [LA]);
  /* R5: a reminder is due on the local day of that zone, and carries it. */
  assert.equal(w.c.reminderSet({ target: A, entry: 0, on: "2026-09-29", author: M, viewer: M }).ok, true);
  assert.deepEqual(w.c.remindersDue({ viewer: M, nowMs: Date.parse("2026-09-29T04:00:00Z") }).items, [], "still the 28th in Los Angeles");
  assert.deepEqual(w.c.remindersDue({ viewer: M, nowMs: Date.parse("2026-09-29T08:00:00Z") }).items.map((x) => [x.action, x.zone]), [[A, LA]]);
  /* R14: the calendar file's zone. */
  const ics = w.c.clocksIcs({ actions: [A], viewer: M }).ics;
  assert.ok(ics.includes(`TZID:${LA}`) && ics.includes(`X-WR-TIMEZONE:${LA}`) && !ics.includes(`TZID:${HFX}`));
  /* the same action under the test profile alone (control): its office is not given, so the view's own zone, Halifax. */
  const one = world();
  one.action(A, ["counterparty:", "  state: named", "  role: Controller", "  body: Finance Department", "action_kind: other", "clock:", ...CLK("2026-09-28")]);
  assert.deepEqual(one.c.overdueClocks({ viewer: M, now: Date.parse("2026-09-29T04:00:00Z") }).items.map((x) => [x.action, x.zone]), [[A, HFX]]);
});
