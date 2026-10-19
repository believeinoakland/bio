/* action-clocks' T51 entry at its interface (T51-267): R24, `clocksRunning({viewer})` (`op=clocksrunning`), the pending clock
   entries of the visible open actions counted for Home's clocks reading (N1088, K3189, K4059; for `screens-daily` R64). On
   the test profile; instance clock 2026-09-28T12:00Z. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c", D = "ACTN-2026-0004-d", X = "ACTN-2026-0005-x";
/* One clock entry's lines, with an owner when given. */
const E = (date, owed = null, status = "pending") => [`  - text: "t"`, '    description: "d"', `    date: ${date}`,
  "    basis: Act s.2", `    status: ${status}`, ...(owed ? [`    owed_by: ${owed}`] : [])];

test("R24 clocksRunning counts the pending clock entries of visible open actions, in all and by owed_by with each one's earliest date; controls: a met entry, a resolved action's pending entry and an action the viewer cannot see are not counted; at most 500 actions are read, truncated stated; writes nothing", () => {
  const w = world();
  w.action(A, ["clock:", ...E("2026-09-10", "group"), ...E("2026-09-12", "group")]);
  w.action(B, ["clock:", ...E("2026-09-05", "body")]);
  w.action(C, ["clock:", ...E("2026-09-20"), ...CLK("2026-09-01", "met")]);
  /* controls: a resolved action's pending entry, and an action no member of the viewer's sees (the `nobody` viewer). */
  w.action(D, ["resolution: complied", "clock:", ...E("2026-09-03", "group")], { state: "resolved" });
  const before = JSON.stringify(w.rows(`SELECT * FROM action_clock_proposals`));
  const r = w.c.clocksRunning({ viewer: M });
  assert.deepEqual(r, {
    ok: true, total: 4, actions_limit: 500, truncated: false,
    by_owed: { group: { count: 2, next: "2026-09-10" }, body: { count: 1, next: "2026-09-05" }, undetermined: { count: 1, next: "2026-09-20" } },
  });
  assert.deepEqual(Object.keys(r.by_owed), ["group", "body", "undetermined"], "each owed_by value R18 names");
  assert.equal(w.c.clocksRunning({ viewer: "nobody" }).total, 0, "an action the viewer cannot see counts for no one");
  assert.equal(w.c.clocksRunning({ viewer: null }).total, 0, "no viewer sees no action");
  /* writes nothing: the documents and the module's tables stand as they were. */
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM action_clock_proposals`)), before);
  assert.equal(w.fm(A).clock[0].status, "pending");
});

test("R24 at most 500 actions are read, and truncated is stated", () => {
  const many = world();
  for (let i = 0; i < 501; i++) {
    const id = `ACTN-2026-${String(i + 1).padStart(4, "0")}-m`;
    many.action(id, ["clock:", ...E("2026-10-01", "body")]);
  }
  const r = many.c.clocksRunning({ viewer: M });
  assert.deepEqual([r.total, r.by_owed.body.count, r.truncated, r.actions_limit], [500, 500, true, 500]);
  assert.equal(clocks.CLOCKS_RUNNING_ACTIONS_MAX, 500);
});

test("R24 the op clocksrunning reads the viewer from the query and answers clocksRunning's own answer", () => {
  const w = world();
  w.action(X, ["clock:", ...E("2026-09-15", "undetermined")]);
  const op = (qs, body = null) => clocks.actionClocksOps(w.c, new URL(`https://x/?${qs}`), body).clocksrunning();
  assert.deepEqual(op(`viewer=${M}`), w.c.clocksRunning({ viewer: M }));
  assert.equal(op(`viewer=${M}`).total, 1);
  assert.equal(op("", { viewer: M }).total, 0, "a viewer in the body is not the stamp");
});
