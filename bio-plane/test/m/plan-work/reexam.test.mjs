/* plan-work R10: each recorded response sets off a re-examination of the plans of its project and of the projects linked
   to it by arose_from both ways: marks written through action-plans' planMark only, and one re-examination run. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, by, V, OFFICE, option, choose } from "./fixture.mjs";
import { REEXAM_SKILL } from "../../../src/plan-work/index.mjs";

/* The tables action-plans holds a plan's decisions in: dispositions, scenarios, judgements and starts. */
const decisions = (w) => Object.fromEntries(["plans", "plan_options", "plan_scenarios", "plan_checkpoints", "plan_history", "plan_subjects"]
  .map((t) => [t, JSON.stringify(w.rows(`SELECT * FROM ${t} ORDER BY 1, 2`))]));

/* A second plan in dave's project Q, with an action started from it. */
function planInQ(w) {
  const inq = w.inquiry([w.Q]);
  const r = w.ap.planOpen({ project: w.Q, subjects: [{ kind: "inquiry", inquiry: inq }], title: "Harbour plan", ...by("dave") });
  assert.equal(r.ok, true, JSON.stringify(r));
  const o = w.ap.optionAdd({ plan: r.id, summary: "Ask the harbour", category: "awareness", subjects: [{ kind: "inquiry", inquiry: inq }],
                             addressee: OFFICE, ...by("dave") }).option;
  w.ap.optionDispose({ plan: r.id, options: [o], disposition: "chosen", ...by("dave") });
  const a = w.ap.optionStart({ plan: r.id, option: o, kind: "other", ...by("dave") });
  assert.equal(a.ok, true, JSON.stringify(a));
  return { plan: r.id, option: o, action: a.action };
}

test("R10: at start the module registers with actions' response listener; a response marks the plan through planMark only", async () => {
  const w = world();
  assert.deepEqual(w.pw.registered.response_listener, { ok: true });
  assert.deepEqual(w.listeners.map((l) => l.module), ["plan-work"]);
  const s = w.started({ subjects: [w.S1] });
  const other = option(w, { summary: "Ask the auditor", subjects: [w.S3] });
  choose(w, [other]);
  w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Main", phases: [{ id: "ask", name: "Ask", options: [s.option], starts: "plan_start" }], ...by("bob") });
  w.correspond(s.action, "sent", "2026-10-01");
  const ord = w.correspond(s.action, "received", "2026-10-03");
  const before = decisions(w);
  const r = await w.respond(s.action, ord);
  const mine = r.reexamined.find((x) => x.plan === w.PL);
  assert.deepEqual(mine.marks.map((m) => [m.kind, m.option ?? m.phase]), [["option_changed", s.option], ["phase_start_holds", "ask"]]);
  assert.ok(mine.marks.every((m) => typeof m.why === "string" && m.why.length >= 1 && m.why.length <= 500));
  /* written through planMark in action-plans R43's shape, with the response as cause; none skipped */
  const held = w.marks.get(w.PL);
  assert.equal(held.length, 2);
  assert.deepEqual(held[0].cause, { action: s.action, ord });
  assert.deepEqual(w.pw.reexaminations({ plan: w.PL, viewer: V("bob") }).items[0].marks, mine.marks);
  /* control: dispositions, scenarios, judgements and starts are byte-identical before and after */
  assert.deepEqual(decisions(w), before);
  /* once per plan and response: the same response again writes nothing more */
  const again = await w.respond(s.action, ord);
  assert.deepEqual(again.reexamined, []);
  assert.equal(w.marks.get(w.PL).length, 2);
  /* a mark the plan already holds is not written again after a later response */
  const ord2 = w.correspond(s.action, "received", "2026-10-04");
  const third = await w.respond(s.action, ord2);
  assert.deepEqual(third.reexamined[0].marks, []);
});

test("R10: the guide's next routes for the action's kind after the response's outcome are one next_routes mark; the chance to fix is never a mark", async () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  w.guides.set("other", [{ guide: null, origin: "profile", items: [
    { route: "Ask for reconsideration", citation: "Rule 4", after: ["denied"] },
    { route: "Thank them", citation: "Rule 5", after: ["complied"] },
    { route: "Wait", citation: "Rule 6" }] },
    { guide: "GUD-2026-0001-g", origin: "group", items: [{ route: "Appeal to the board", citation: "Rule 9", after: ["denied", "partial"] }] }]);
  w.correspond(s.action, "sent", "2026-10-01");
  const r = w.actions.actionCorrespond({ target: s.action, direction: "received", at: "2026-10-03", account: "letter", outcome: "denied", ...by("bob") });
  assert.equal(r.ok, true, JSON.stringify(r));
  const res = await w.respond(s.action, r.ord);
  const routes = res.reexamined[0].marks.filter((m) => m.kind === "next_routes");
  assert.deepEqual(routes.map((m) => m.routes), [["Ask for reconsideration", "Appeal to the board"]],
    "the routes after denied only, in the guides' order; one with no `after` is not a next route");
  assert.equal(res.reexamined[0].marks.some((m) => !["option_changed", "phase_start_holds", "next_routes"].includes(m.kind)), false,
    "no chance-to-fix mark: action-plans R41 derives it on read");
  /* control: a response stating no outcome offers no route */
  const w2 = world();
  w2.guides.set("other", [{ guide: null, origin: "profile", items: [{ route: "Ask for reconsideration", citation: "Rule 4", after: ["denied"] }] }]);
  const t = w2.started({ subjects: [w2.S1] });
  const o2 = w2.correspond(t.action, "received", "2026-10-03");
  assert.equal((await w2.respond(t.action, o2)).reexamined[0].marks.some((m) => m.kind === "next_routes"), false);
  /* at most 20 routes */
  const w3 = world();
  w3.guides.set("other", [{ guide: null, origin: "profile", items: Array.from({ length: 25 }, (_, i) => ({ route: `Route ${i}`, citation: "R", after: ["denied"] })) }]);
  const u = w3.started({ subjects: [w3.S1] });
  const o3 = w3.actions.actionCorrespond({ target: u.action, direction: "received", at: "2026-10-03", account: "letter", outcome: "denied", ...by("bob") }).ord;
  const many = (await w3.respond(u.action, o3)).reexamined[0].marks.find((m) => m.kind === "next_routes");
  assert.equal(many.routes.length, 20);
});

test("R10: the projects linked by arose_from both ways are re-examined; a response in an unlinked project marks nothing", async () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  const q = planInQ(w);
  const ordP = w.correspond(s.action, "received", "2026-10-03");
  /* control: unlinked, a response on Q's action re-examines Q's plan only, and P's response P's only */
  const onlyP = await w.respond(s.action, ordP);
  assert.deepEqual(onlyP.reexamined.map((x) => x.plan), [w.PL]);
  const ordQ = w.correspond(q.action, "received", "2026-10-04");
  const unlinked = await w.respond(q.action, ordQ, w.Q, V("dave"));
  assert.deepEqual(unlinked.reexamined.map((x) => x.plan), [q.plan]);
  assert.equal(w.marks.get(w.PL).length, 1, "P's plan gained nothing from Q's response");
  /* forward: Q arose from P's response, so a later response on P's action re-examines Q's plan too */
  const ordP2 = w.correspond(s.action, "received", "2026-10-05");
  w.links.arose.set(`${s.action}#${ordP2}`, [{ arising: { project: w.Q } }]);
  const fwd = await w.respond(s.action, ordP2);
  assert.deepEqual(fwd.reexamined.map((x) => x.plan).sort(), [w.PL, q.plan].sort());
  /* backward: P arose from a response on Q's action, so a response in P re-examines Q's plan */
  const w2 = world();
  const s2 = w2.started({ subjects: [w2.S1] });
  const q2 = planInQ(w2);
  w2.links.arisen.set(w2.P, [{ target: q2.action, ord: 0 }]);
  const ord = w2.correspond(s2.action, "received", "2026-10-03");
  const back = await w2.respond(s2.action, ord);
  assert.deepEqual(back.reexamined.map((x) => x.plan).sort(), [w2.PL, q2.plan].sort());
  /* a closed plan is not re-examined */
  w2.ap.planClose({ id: q2.plan, reason: "done", ...by("dave") });
  const ord3 = w2.correspond(s2.action, "received", "2026-10-06");
  assert.deepEqual((await w2.respond(s2.action, ord3)).reexamined.map((x) => x.plan), [w2.PL]);
});

test("R10: one re-examination run per plan, mode plan, origin reexamination, the response as <action id>#<ord>, on the recording member's act; a refusal is kept and undoes nothing", async () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  const ord = w.correspond(s.action, "received", "2026-10-03");
  const r = await w.respond(s.action, ord, w.P, V("bob"));
  assert.equal(w.runs.length, 1);
  const a = w.runs[0];
  assert.deepEqual([a.mode, a.origin, a.response, a.plan, a.contextType, a.contextId, a.actor, a.principalClaude, a.skillVersion],
    ["plan", "reexamination", `${s.action}#${ord}`, w.PL, "project", w.P, V("bob"), V("bob"), REEXAM_SKILL],
    "the project holds no account of its own here: the run is the recording member's (ai-runs R52 picks the project's first where held)");
  assert.equal(a.bounds.some((b) => (b.bound === "fetches" || b.bound === "subsessions") && b.allowed > 0), false, "no search");
  assert.equal(r.reexamined[0].run.opened, true);
  assert.deepEqual(w.pw.reexaminations({ plan: w.PL, viewer: V("bob") }).items.map((x) => [x.response, x.run.opened]),
    [[`${s.action}#${ord}`, true]]);
  /* refused (AI not enabled): kept, and the marks still stand */
  const w2 = world();
  w2.aiOpen = (x) => ({ run: x.run, started: false, code: "AI_RUN_MODE_NOT_DEPLOYED", note: "not deployed" });
  const t = w2.started({ subjects: [w2.S1] });
  const o2 = w2.correspond(t.action, "received", "2026-10-03");
  const res = await w2.respond(t.action, o2);
  assert.deepEqual(res.reexamined[0].run.refused.code, "AI_RUN_MODE_NOT_DEPLOYED");
  assert.equal(w2.marks.get(w2.PL).length, 1);
  /* a response recorded by no member opens no run */
  const w3 = world();
  const u = w3.started({ subjects: [w3.S1] });
  const o3 = w3.correspond(u.action, "received", "2026-10-03");
  await w3.respond(u.action, o3, w3.P, "class:ai");
  assert.equal(w3.runs.length, 0);
});

test("R10: the listener never throws: a failing mark or run leaves the response standing", async () => {
  const w = world();
  const s = w.started({ subjects: [w.S1] });
  w.aiOpen = () => { throw new Error("assistant down"); };
  const ord = w.correspond(s.action, "received", "2026-10-03");
  const r = await w.respond(s.action, ord);
  assert.equal(r.ok, true);
  assert.equal(r.reexamined[0].run.opened, false);
  assert.match(r.reexamined[0].run.why, /assistant down/);
  const bad = await w.pw.onResponse({ action: "nothing", ord: "x", project: null, recorder: null });
  assert.equal(bad.ok, true);
});
