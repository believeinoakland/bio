/* action-plans' published fixtures, and the contracts its users hold against its real code (fix round 10; K4990, K4993). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planRead } from "./fixtures.mjs";
import { seeded, opened, V, by } from "./fixture.mjs";
import { noSuchPlan, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

test("R6, R35: the planRead fixture answers a plan a viewer may see, and an unknown or unseen one as one NO_SUCH_PLAN", () => {
  const f = planRead();
  assert.equal(f.read.ok, true);
  assert.equal(f.read.id, f.id);
  assert.deepEqual(f.unknownAnswer, noSuchPlan(f.unknown));
  assert.equal(f.unknownAnswer.ok, false);
  assert.equal(f.unknownAnswer.code, "NO_SUCH_PLAN");
  assert.equal(f.unknownAnswer.check, ACTION_PLAN_CHECKS.NO_SUCH_PLAN.check);
  assert.equal(f.unseenAnswer.code, "NO_SUCH_PLAN", "a plan the viewer may not see answers as absent (control)");
  assert.deepEqual(f.unseenAnswer, noSuchPlan(f.id));
});

test("R17: the planRead fixture's checkpointsDue answers nothing before the checkpoint and one item after it", () => {
  const f = planRead();
  assert.deepEqual(f.notDue.items, []);
  assert.equal(f.due.ok, true);
  assert.deepEqual(f.due.items.map((i) => [i.plan, i.project, i.scenario, i.phase, i.set_by]),
    [[f.id, f.world.P, 1, "q", V("alice")]]);
  assert.equal(f.due.truncated, false);
});

test("R46: the planRead fixture's plansToLookAgain answers nothing before the look-again day and the plan on it", () => {
  const f = planRead();
  assert.deepEqual(f.notYet.items, []);
  assert.equal(f.lookAgain.ok, true);
  assert.deepEqual(f.lookAgain.items.map((i) => [i.plan, i.look_again, i.paused_by]), [[f.pausedId, "2026-11-01", V("bob")]]);
});

/* The open check action-plans registers with ai-runs (R30), as ai-runs relays it unchanged (its R47). Its users are
   earlier in the order and cannot import this module, so the value is stated here as data and run against the real
   check; the user's hand-built value must equal it. A plan that is closed answers its own PLAN_CLOSED (R4), not the
   PLAN_NOT_OPEN another act refuses with (R9). */
// fixtures-run: ai-runs plan-open-check
test("R30: the plan-mode open check refuses a closed plan with PLAN_CLOSED, check, translation and detail, whole", () => {
  const w = seeded();
  opened(w, [w.SI]);
  assert.equal(w.ap.planClose({ id: w.PL, reason: "closing", ...by("bob") }).ok, true);
  const contract = { ok: false, reason: "PLAN_CLOSED", code: "PLAN_CLOSED", check: "C-124.10",
                     translation: word("refusal.PLAN_CLOSED"), plan: w.PL };
  const real = w.reg.checks.find((c) => c.mode === "plan").fn({ contextType: "project", contextId: w.P, plan: w.PL,
                                                              actor: V("bob"), viewer: V("bob") });
  assert.equal(typeof real.detail, "string");
  assert.ok(real.detail.length > 0);
  const { detail, ...rest } = real;
  assert.deepEqual(rest, contract);
  /* control: the same check passes an open plan, so the refusal is the closing's */
  const open = seeded();
  opened(open, [open.SI]);
  assert.equal(open.reg.checks.find((c) => c.mode === "plan").fn({ contextType: "project", contextId: open.P, plan: open.PL,
                                                                  actor: V("bob"), viewer: V("bob") }), null);
});
