/* plan-work R5, R6: preparation items a member takes up herself, and comments under the plan's sight. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, option } from "./fixture.mjs";
import { noSuchPlan, refusePlanClosed, refuseNoSuchOption, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { PLAN_WORK_CHECKS } from "../../../src/plan-work/index.mjs";

const add = (w, extra = {}) => w.pw.prepItemAdd({ plan: w.PL, option: w.O, text: "Find the 2024 contract", ...by("bob"), ...extra });
const setup = () => { const w = world(); w.O = option(w); return w; };

test("R5: prepItemAdd adds an item to one of the plan's options; refusals for a machine, an unseen or closed plan, an unknown option, a cost or assignee key, and its text", () => {
  const w = setup();
  assert.equal(code(add(w, { author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(add(w, by("dave")), noSuchPlan(w.PL));
  assert.deepEqual(add(w, { option: "opt-9" }), refuseNoSuchOption("opt-9"));
  for (const k of ["assignee", "hours", "cost", "score"]) {
    const r = add(w, { [k]: k === "assignee" ? V("alice") : 3 });
    assert.equal(code(r), "OPTION_KEY_REFUSED", k); assert.equal(r.check, ACTION_PLAN_CHECKS.OPTION_KEY_REFUSED.check);
  }
  for (const text of ["", "x".repeat(501), "two\nlines", "a \"quote\""]) {
    const r = add(w, { text });
    assert.equal(code(r), "PLAN_WORK_TEXT_REFUSED", JSON.stringify(text)); assert.equal(r.max, 500);
  }
  assert.equal(w.count("pw_prep"), 0);
  const a = add(w);
  assert.deepEqual([a.ok, a.item, a.option, a.text], [true, "prep-1", w.O, "Find the 2024 contract"]);
  assert.equal(add(w, { text: "Ask the auditor", ...by("alice") }).item, "prep-2");
  w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") });
  assert.deepEqual(add(w), refusePlanClosed(w.PL));
});

test("R5: the author takes an item up herself with her own target date; a take-up with `for` naming another member is refused", () => {
  const w = setup();
  const item = add(w).item;
  const up = (extra = {}) => w.pw.prepItemTakeUp({ plan: w.PL, item, target: "2026-10-20", ...by("alice"), ...extra });
  /* control (R5): a take-up with `for` naming another member is refused, through action-plans' one site */
  const other = up({ for: V("bob") });
  assert.equal(code(other), "OPTION_KEY_REFUSED"); assert.deepEqual(other.keys, ["for"]);
  assert.equal(other.check, ACTION_PLAN_CHECKS.OPTION_KEY_REFUSED.check);
  assert.equal(code(up({ for: "bob" })), "OPTION_KEY_REFUSED", "a bare member id is read as the member");
  assert.equal(code(up({ assignee: V("bob") })), "OPTION_KEY_REFUSED");
  assert.equal(code(up({ author: MACHINE, viewer: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.equal(code(up({ item: "prep-9" })), "NO_SUCH_PREP_ITEM");
  assert.equal(code(up({ target: "soon" })), "PLAN_WORK_TEXT_REFUSED");
  assert.equal(code(up({ target: "2026-02-31" })), "PLAN_WORK_TEXT_REFUSED");
  /* her own: `for` naming herself, or none */
  assert.equal(up({ for: V("alice") }).ok, true);
  const b = up({ ...by("bob"), target: null });
  assert.deepEqual([b.ok, b.by, b.target], [true, V("bob"), null]);
  const done = w.pw.prepItemDone({ plan: w.PL, item, ...by("bob") });
  assert.equal(done.ok, true);
  const again = w.pw.prepItemDone({ plan: w.PL, item, ...by("alice") });
  assert.equal(code(again), "PREP_ITEM_DONE"); assert.equal(again.check, PLAN_WORK_CHECKS.PREP_ITEM_DONE.check);
  assert.equal(code(up()), "PREP_ITEM_DONE");
  /* visible to whoever sees the plan */
  for (const who of ["alice", "bob"]) {
    const l = w.pw.prepItems({ plan: w.PL, viewer: V(who) });
    assert.deepEqual(l.items.map((x) => [x.item, x.take_ups.map((t) => [t.by, t.target]), x.done && x.done.by]),
      [[item, [[V("alice"), "2026-10-20"], [V("bob"), null]], V("bob")]]);
  }
  assert.deepEqual(w.pw.prepItems({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  assert.doesNotMatch(JSON.stringify(w.pw.prepItems({ plan: w.PL, viewer: V("bob") })), /assignee|hours|score/);
});

test("R6: planComment on an option, an action or a draft of the plan, 1 to 4,000 characters; anything else is COMMENT_TARGET_REFUSED", () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  w.drafts.set(s.action, [{ filing: "FIL-2026-0001-d", purpose: null, approval: null, sending: null }]);
  const say = (on, extra = {}) => w.pw.planComment({ plan: w.PL, on, text: "Is this the right office?", ...by("alice"), ...extra });
  assert.equal(code(say({ option: s.option }, { author: MACHINE })), "MACHINE_CANNOT_PLAN");
  assert.deepEqual(say({ option: s.option }, by("dave")), noSuchPlan(w.PL));
  for (const on of [{ option: "opt-9" }, { action: "ACTN-2026-0999" }, { draft: "FIL-9" }, { plan: w.PL }, null, "opt-1"]) {
    const r = say(on);
    assert.equal(code(r), "COMMENT_TARGET_REFUSED", JSON.stringify(on));
    assert.equal(r.check, PLAN_WORK_CHECKS.COMMENT_TARGET_REFUSED.check);
  }
  for (const text of ["", "x".repeat(4001)]) assert.equal(code(say({ option: s.option }, { text })), "PLAN_WORK_TEXT_REFUSED");
  assert.equal(say({ option: s.option }).ok, true);
  assert.equal(say({ action: s.action }, { text: "x".repeat(4000) }).ok, true);
  assert.equal(say({ draft: "FIL-2026-0001-d" }, { text: "Two lines.\nFine." }).ok, true);
  const all = w.pw.planComments({ plan: w.PL, viewer: V("bob") });
  assert.deepEqual(all.comments.map((c) => Object.keys(c.on)[0]), ["option", "action", "draft"]);
  assert.deepEqual(w.pw.planComments({ plan: w.PL, on: { action: s.action }, viewer: V("bob") }).comments.map((c) => c.comment), [2]);
});

test("R6: comments are under the plan's sight: an outsider reads the plan's comments as absent, and a comment on what the reader may not see is withheld whole", () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  w.pw.planComment({ plan: w.PL, on: { action: s.action }, text: "Keep this between us", ...by("bob") });
  w.pw.planComment({ plan: w.PL, on: { option: s.option }, text: "And this", ...by("bob") });
  /* control: an outsider reads the plan's comments as absent, as no plan at all */
  assert.deepEqual(w.pw.planComments({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL));
  w.hide(V("alice"), s.action);
  const a = w.pw.planComments({ plan: w.PL, viewer: V("alice") });
  assert.deepEqual(a.comments.map((c) => c.text), ["And this"]);
  assert.equal(a.out_of_view, true);
  assert.doesNotMatch(JSON.stringify(a), /Keep this between us/);
  /* nothing here is registered with any reader that publishes: the module's only registrations are its two at start */
  assert.deepEqual(Object.keys(w.pw.registered).sort(), ["close_snapshot", "response_listener"]);
});
