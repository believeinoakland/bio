/* action-clocks' lateness index over the group's own clocks (R15; D234, K1471) at its interface: `lateness`, its op.
   Instance clock 2026-09-28T12:00Z, the test profile's zone America/Halifax (UTC−3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, CP, actionMd } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d";
/* One clock entry of a basis kind, with its own keys. */
const E = (date, status, kind, extra = []) => [`  - text: "t"`, '    description: "d"', `    date: ${date}`, '    basis: "the group\'s plan"',
  `    status: ${status}`, ...(kind ? [`    basis_kind: ${kind}`] : []), ...extra];
const rests = (t) => ["action_basis:", `  - target: ${t}`, "    kind: rests_on"];
const exact = (v) => ({ value: String(v), sign: "+", precision: "exact", label: "computed fact" });

function setUp() {
  const w = world();
  w.doc("CONF-2026-0001-p1");
  w.determinations.set("CONF-2026-0001-p1", { project: "PROJ-2026-0001", sees: [M] });
  w.action(A, ["clock:",
    ...E("2026-09-10", "met", "window", ["    met_on: 2026-09-09"]),          /* 0 on time: met the day before */
    ...E("2026-09-12", "met", "commitment", ["    met_on: 2026-09-15"]),      /* 1 late, 3 days */
    ...E("2026-09-20", "pending", "dependency"),                              /* 2 pending past its date */
    ...E("2026-10-05", "pending", "window"),                                  /* 3 not yet due */
    ...E("2026-09-15", "pending", "rule"),                                    /* 4 a rule: never counted */
    ...E("2026-09-15", "pending", null),                                      /* 5 no kind: named, not counted */
    ...E("2026-09-18", "waived", "window"),                                   /* 6 waived */
    ...E("2026-08-01", "met", "window", ["    met_on: 2026-08-01"]),          /* 7 outside the period */
    ...rests("CONF-2026-0001-p1")]);
  /* B's entry is marked met by a later revision dated 2026-09-15T02:00Z: still the 14th in the action's zone. */
  w.action(B, ["clock:", ...E("2026-09-14", "pending", "window")]);
  const t = w.text(B).replace("status: pending", "status: met").replace('last_updated: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-15T02:00:00Z"');
  assert.equal(w.promote(B, t).ok, true);
  /* C:1 was written met, with no met_on: its met day is its first version's `last_updated` (2026-09-01T00:00Z, the 31st
     of August in the zone). D's document dates itself no day at all, so its met day is not held. */
  w.action(C, ["clock:", ...E("2026-09-11", "met", "window", ["    met_on: 2026-09-13"]), ...E("2026-09-11", "met", "window")]);
  const D = "ACTN-2026-0004-d";
  assert.equal(w.promote(D, actionMd(D, [...CP, "action_kind: other", "clock:", ...E("2026-09-11", "met", "window")])
    .replace('last_updated: "2026-09-01T00:00:00Z"', 'last_updated: "not stated"')).ok, true);
  return w;
}

test("R15 lateness counts the group's own entries (commitment, dependency, window) dated in the period: met on time, met late with the days late each, still pending past their date, and the denominator, each a computed fact, naming what it could not count", () => {
  const w = setUp();
  const before = w.rows(`SELECT (SELECT COUNT(*) FROM manifest) AS m, (SELECT COUNT(*) FROM action_reminders) AS r, (SELECT COUNT(*) FROM action_clock_proposals) AS p`);
  const r = w.c.lateness({ from: "2026-09-01", to: "2026-09-30", viewer: M });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.kinds, ["commitment", "dependency", "window"]);
  assert.deepEqual(r.on_time, exact(3), "A:0 (met the day before), B:0 (met on its local day, the 14th) and C:1 (its first version's day)");
  assert.deepEqual([r.late.value, r.late.days_late_total.value], ["2", "5"]);
  assert.deepEqual(r.late.each, [{ action: A, ord: 1, date: "2026-09-12", days_late: 3, met_on: "2026-09-15" },
                                 { action: C, ord: 0, date: "2026-09-11", days_late: 2, met_on: "2026-09-13" }]);
  assert.deepEqual(r.pending_past, exact(1));
  assert.deepEqual(r.denominator, exact(7), "A:0–2, A:6, B:0, C:0, C:1: the counted entries (A:3 is dated after the period)");
  assert.deepEqual(r.entries.map((x) => [x.action, x.ord, x.state]),
    [[A, 0, "on_time"], [A, 1, "late"], [A, 2, "pending_past"], [A, 6, "waived"], [B, 0, "on_time"], [C, 0, "late"], [C, 1, "on_time"]]);
  assert.deepEqual(r.not_counted.map((x) => [x.action, x.ord, x.why]), [
    [A, 5, "the entry names no basis kind, so whether it is the group's own is not stated"],
    [D, 0, "met, and the day it was met is not held"]]);
  /* the method is calc-grammar's: its recipe and trace answered, the counts its exact outputs. */
  assert.equal(r.method.recipe.method, "bio-calc/1");
  assert.deepEqual(r.method.trace.map((s) => s.step), ["on_time_rows", "on_time", "late_rows", "late", "days_late", "pending_rows", "pending_past", "denominator"]);
  assert.deepEqual(w.rows(`SELECT (SELECT COUNT(*) FROM manifest) AS m, (SELECT COUNT(*) FROM action_reminders) AS r, (SELECT COUNT(*) FROM action_clock_proposals) AS p`), before, "writes nothing");
  /* the period bounds it, the project narrows it. */
  const sept10 = w.c.lateness({ from: "2026-09-10", to: "2026-09-12", viewer: M });
  assert.deepEqual(sept10.entries.map((x) => [x.action, x.ord]), [[A, 0], [A, 1], [C, 0], [C, 1]]);
  const p1 = w.c.lateness({ from: "2026-09-01", to: "2026-09-30", project: "PROJ-2026-0001", viewer: M });
  assert.deepEqual([p1.on_time.value, p1.late.value, p1.pending_past.value, p1.denominator.value], ["1", "1", "1", "4"]);
  /* a period reaching A:3's date counts it, not yet due. */
  const oct = w.c.lateness({ from: "2026-10-01", to: "2026-10-31", viewer: M });
  assert.deepEqual([oct.entries.map((x) => [x.action, x.ord, x.state]), oct.denominator.value], [[[A, 3, "not_yet_due"]], "1"]);
  /* nothing visible: zeros, each still a computed fact. */
  const none = w.c.lateness({ from: "2026-09-01", to: "2026-09-30", viewer: "nobody" });
  assert.deepEqual([none.on_time, none.denominator, none.entries], [exact(0), exact(0), []]);
});

test("R15 never a finding about government: no rule entry is counted, no counterparty is named, nothing is raised; a malformed period is refused", () => {
  const w = setUp();
  const r = w.c.lateness({ from: "2026-09-01", to: "2026-09-30", viewer: M });
  assert.ok(!r.entries.some((x) => x.action === A && x.ord === 4) && !r.not_counted.some((x) => x.ord === 4 && x.action === A), "a rule entry is not counted, nor listed");
  const text = JSON.stringify(r);
  for (const word of ["Town Clerk", "Port Ellery", "counterparty", "violation", "breach", "noncompli"]) assert.ok(!text.includes(word), word);
  assert.match(r.says, /never a finding about anyone else's conduct/);
  assert.equal(w.c.remindersDue({ viewer: M }).items.length, 0, "no reminder or item minted");
  for (const [from, to] of [["2026-09-30", "2026-09-01"], ["soon", "2026-09-30"], ["2026-09-01", "2026-02-30"], [null, null]])
    assert.equal(w.c.lateness({ from, to, viewer: M }).reason, "LATENESS_REFUSED", `${from}–${to}`);
  /* through the op, the viewer the control plane's stamp. */
  const op = clocks.actionClocksOps(w.c, new URL(`https://x/?from=2026-09-01&to=2026-09-30&viewer=${M}`), null).clocklateness();
  assert.equal(op.denominator.value, "7");
  assert.equal(clocks.actionClocksOps(w.c, new URL("https://x/?from=2026-09-01&to=2026-09-30&viewer=nobody"), null).clocklateness().denominator.value, "0");
});
