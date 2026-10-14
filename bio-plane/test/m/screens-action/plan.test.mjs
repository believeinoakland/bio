/* screens-action R1 (and R7's rules on `plan`): the action plan, its reads and its ten acts, at the module's interface:
   the served page over a scripted plane, every act through the shell's friction and gate. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, button, fill, refusedIn, beside, DATA_PLANE, ROUTES, PLAN, PLAN_ID, PROPOSALS, ESC, DET } from "./page.mjs";

const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
// each row's name, without the row's own panel control the kit may draw beside it (interface-shell R27)
const rowsOrder = (p) => main(p).querySelectorAll("table.cs-rows tbody tr.cs-r").map((tr) => {
  const td = tr.querySelectorAll("td")[1];
  const bare = td.querySelectorAll("button").reduce((t, b) => t.replace(b.textContent, ""), td.textContent).trim();
  return bare || td.textContent.trim(); // the T46 kit draws the name inside the panel's control
});

test("R1: reads the plan: its matters (with support and escalation stage), options, scenarios, what each started option became, and the checks strip", async () => {
  const p = await open(ROUTES.plan, DATA_PLANE);
  assert.deepEqual(p.byOp("plan").map((r) => r.query.id), [PLAN_ID]);
  const t = text(p);
  assert.match(t, /Repairs: closed is not repaired/);
  assert.match(t, /Checks · 1/);
  assert.match(t, /Scenario 1: no branch answers a hostile response/);
  assert.match(t, /Matter 1/);
  assert.match(t, /hypothetical: not yet shown/);
  assert.match(t, /escalation: stage 2 Notification/);
  assert.ok(main(p).querySelector(`a[href="/app/matter/${encodeURIComponent(DET + "~" + ESC)}"]`), "an outcome matter opens its matter screen");
  assert.match(t, /Records request: inspection logs/);
  assert.match(t, /Records first/);
  assert.ok(main(p).querySelector('a[href^="/app/action/ACTN-"]'), "a started option links its action");
  assert.match(t, /awaiting a response/);
});

test("R1: the assistant's suggestions are read and drawn only while it is reachable, labelled machine work not yet in the plan; control: unreachable reads none and draws no ask", async () => {
  const off = await open(ROUTES.plan, DATA_PLANE);
  assert.equal(off.byOp("planproposals").length, 0);
  assert.ok(!ops(off).includes("planask"));
  assert.doesNotMatch(text(off), /Suggested by the assistant/);
  const on = await open(ROUTES.plan, { ...DATA_PLANE, ...REACH });
  assert.equal(on.byOp("planproposals").at(-1).query.plan, PLAN_ID);
  assert.match(text(on), /Suggested by the assistant · not yet in the plan/);
  assert.match(text(on), /Ask the committee to agendize repair performance/);
  assert.ok(ops(on).includes("planask"), "R13: Ask the assistant for options");
  assert.ok(!ops(on).includes("optionpropose"), "R13: optionpropose is not drawn for this act");
});

test("R1 (interface-shell R19): options sort by category, regulated end date, matter or disposition, each row's acts in its panel", async () => {
  const p = await open(ROUTES.plan, DATA_PLANE);
  const sort = async (col) => p.click(main(p).querySelector(`[data-shell="sort"][data-col="${col}"]`));
  await sort(1);
  assert.deepEqual(rowsOrder(p), ["Complaint to the auditor", "Story with a reporter", "Records request: inspection logs"], "by category, in the plan's order of categories");
  await sort(2);
  assert.deepEqual(rowsOrder(p), ["Records request: inspection logs", "Complaint to the auditor", "Story with a reporter"], "by end date, none last");
  await sort(4);
  assert.deepEqual(rowsOrder(p).slice(0, 2).sort(), ["Complaint to the auditor", "Records request: inspection logs"], "by disposition: chosen first");
  await sort(3);
  assert.equal(rowsOrder(p)[0], "Records request: inspection logs", "by matter");
  const panel = main(p).querySelectorAll("tr.cs-panel")[0];
  assert.ok(panel.querySelector("button[data-act]"), "the row's acts sit in its panel");
});

test("R1: 'Choose' and 'Decline' send optiondispose with the member's reason, for one option or the picked ones", async () => {
  const plane = { ...DATA_PLANE, optiondispose: ok({ plan: PLAN_ID }) };
  const p = await open(ROUTES.plan, plane);
  const choose = main(p).querySelectorAll('button[data-act="optiondispose"]').find((b) => b.dataset.option === "opt-2" && b.dataset.disposition === "chosen");
  assert.match(choose.textContent, /Choose/);
  await press(p, choose, { reason: "the reporter asked" });
  assert.deepEqual(last(p, "optiondispose").body, { plan: PLAN_ID, options: ["opt-2"], disposition: "chosen", reason: "the reporter asked" });
  // the hold strip: two picked, declined together
  await p.click(p.doc.getElementById("pick-options-opt-1"));
  await p.click(p.doc.getElementById("pick-options-opt-2"));
  const decline = main(p).querySelector(".cs-hold").querySelectorAll('button[data-act="optiondispose"]').find((b) => b.dataset.disposition === "declined");
  await press(p, decline, { reason: "too early" });
  assert.deepEqual(last(p, "optiondispose").body, { plan: PLAN_ID, options: ["opt-1", "opt-2"], disposition: "declined", reason: "too early" });
});

test("R1, R7: 'Add a matter' sends plansubjectadd with the matter and the member's reason, its label calling it a matter; control: no reference sends nothing", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, plansubjectadd: ok({ plan: PLAN_ID }) });
  assert.match(button(p, "plansubjectadd").textContent, /Add a matter/);
  const b = await press(p, "plansubjectadd", { values: { "plan-subject-reason": "the logs decide it" } });
  assert.equal(p.byOp("plansubjectadd").length, 0);
  assert.match(beside(p, b), /Give the matter's reference first/);
  await press(p, "plansubjectadd", { values: { "plan-subject-kind": "outcome", "plan-subject-id": DET, "plan-subject-standard": "STD-9", "plan-subject-reason": "the logs decide it" } });
  assert.deepEqual(last(p, "plansubjectadd").body, { plan: PLAN_ID, subject: { kind: "outcome", determination: DET, standard: "STD-9" }, reason: "the logs decide it" });
});

test("R1: optionadd sends the option's line, category and matter; optionadopt adopts a suggestion or a standing offer only by the member's act", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, ...REACH, optionadd: ok({}), optionadopt: ok({}) });
  await press(p, "optionadd", { values: { "plan-opt-summary": "Ask the auditor", "plan-opt-category": "legal", "plan-opt-matter": `outcome:${DET}#STD-1` }, reason: "worth trying" });
  assert.deepEqual({ ...last(p, "optionadd").body, reason: undefined }, { plan: PLAN_ID, summary: "Ask the auditor", category: "legal", subjects: [`outcome:${DET}#STD-1`], reason: undefined });
  const adopts = main(p).querySelectorAll('button[data-act="optionadopt"]');
  await press(p, adopts.find((b) => b.dataset.offer), { reason: "fair" });
  assert.deepEqual(last(p, "optionadopt").body.offer, { subject: `outcome:${DET}#STD-1`, kind: "chance_to_fix" });
  await press(p, main(p).querySelectorAll('button[data-act="optionadopt"]').find((b) => b.dataset.proposal), { reason: "good" });
  assert.equal(last(p, "optionadopt").body.proposal, `${PLAN_ID}/proposal/1`);
});

test("R1: scenarioset lays out a scenario of chosen options; checkpointrecord judges a checkpoint; refusals stay beside the act", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, scenarioset: ok({}), checkpointrecord: refusedIn("CHECKPOINT_NOT_DUE", "Not due yet.") });
  fill(p, { "plan-scen-name": "Go public", "plan-scen-options-0": true, "plan-scen-days": "7" });
  await press(p, "scenarioset");
  assert.deepEqual(last(p, "scenarioset").body, { plan: PLAN_ID, scenario: 2, name: "Go public",
    phases: [{ id: "p1", name: "Go public", options: ["opt-1"], starts: "plan_start", checkpoint: { after_days: 7 } }] });
  const b = await press(p, "checkpointrecord", { values: { "plan-judge-1-p1": "met", "plan-judgenote-1-p1": "logs arrived" }, reason: "x" });
  assert.deepEqual({ ...last(p, "checkpointrecord").body, reason: undefined }, { plan: PLAN_ID, scenario: 1, phase: "p1", judged: "met", note: "logs arrived", reason: undefined });
  assert.match(beside(p, b), /Not due yet/);
});

test("R1 (v0.2 rule 18): 'Take this up' routes the item's to-dos to the member, nobody assigned; the screen then says she took it up", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, itemtakeup: (req) => ok({ take_up: 1, item: req.body.item, by: "member:mai", at: "x" }) });
  const cp = main(p).querySelectorAll('button[data-act="itemtakeup"]').find((b) => b.dataset.kind === "checkpoint");
  await press(p, cp);
  assert.deepEqual(last(p, "itemtakeup").body, { item: { kind: "checkpoint", plan: PLAN_ID, scenario: 1, phase: "p1" } });
  assert.ok(!("for" in last(p, "itemtakeup").body), "names nobody else");
  assert.match(text(p), /You took this up/);
  await press(p, main(p).querySelectorAll('button[data-act="itemtakeup"]').find((b) => b.dataset.kind === "escalation_stage"));
  assert.deepEqual(last(p, "itemtakeup").body, { item: { kind: "escalation_stage", escalation: ESC, stage: 2 } });
});

test("R1: 'Start…' opens start-send for the chosen option, sending nothing; 'Close plan…' sends planclose with the reason and the lessons", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, planclose: ok({}) });
  const start = button(p, "optionstartpreview");
  assert.equal(start.dataset.option, "opt-1");
  await press(p, start);
  assert.equal(p.byOp("optionstartpreview").length, 1, "only start-send's own preview read");
  assert.equal(p.location.pathname, `/app/start-send/${encodeURIComponent(PLAN_ID + "~opt-1")}`);
  const q = await open(ROUTES.plan, { ...DATA_PLANE, planclose: ok({}) });
  assert.match(button(q, "planclose").textContent, /Close plan…/);
  await press(q, "planclose", { values: { "plan-close-note": "ask sooner" }, reason: "done" });
  assert.deepEqual(last(q, "planclose").body, { plan: PLAN_ID, note: "ask sooner", reason: "done" });
});

test("R1: control: a closed plan offers no act", async () => {
  const p = await open(ROUTES.plan, { ...DATA_PLANE, plan: ok({ ...PLAN, state: "closed", closed: { reason: "done", by: "member:dev", at: "x" } }) });
  assert.deepEqual(ops(p).filter((o) => o !== "itemtakeup"), []);
  assert.match(text(p), /Closed: done/);
});

/* ---------- R13 (T48; N1043; K3149, K3207; action-plans R51; interface-shell R55) ---------- */

const RUN = "RUN-2026-00000001";
const asking = (held, o = {}) => ({ ...DATA_PLANE, ...REACH, planask: o.ask || ok({ ok: true, plan: PLAN_ID, run: RUN, started: true }),
  airun: () => ok({ found: true, session: { id: RUN, status: held.status, ticks: 1 } }),
  planproposals: () => ok({ ...PROPOSALS, proposals: held.proposals || PROPOSALS.proposals }), ...(o.more || {}) });

test("R13: 'Ask the assistant for options' sends planask with the plan, labelled as the registry labels optionpropose, its run drawn running; control: no optionpropose is sent", async () => {
  const held = { status: "running" };
  const p = await open(ROUTES.plan, asking(held));
  const b = button(p, "planask");
  assert.equal(b.textContent.replace(/\s+/g, " ").trim().startsWith("Ask the assistant for options"), true);
  await press(p, b, { reason: "to see what else we could do" });
  assert.equal(last(p, "planask").body.plan, PLAN_ID);
  assert.deepEqual(Object.keys(last(p, "planask").body).filter((k) => k !== "reason"), ["plan"], "the plan alone: no summary or why of her own");
  assert.equal(p.byOp("optionpropose").length, 0, "control: no optionpropose");
  assert.match(text(p), /The assistant is looking for options/);
  assert.ok(main(p).querySelector('[data-run="running"]'));
});

test("R13: the run is re-read on the page clock until it ends, and its proposals then reach the tray, labelled machine work; an ended run is not read again", async () => {
  const held = { status: "running", proposals: [] };
  const p = await open(ROUTES.plan, asking(held));
  await press(p, "planask", { reason: "ask" });
  const reads = () => p.byOp("airun").length;
  const before = reads();
  await p.clock.tick(9000);
  assert.equal(reads(), before, "not before 10 seconds");
  const trayBefore = p.byOp("planproposals").length;
  held.status = "completed"; held.proposals = PROPOSALS.proposals;
  await p.clock.tick(10000);
  assert.match(text(p), /The assistant has finished/);
  assert.ok(p.byOp("planproposals").length > trayBefore, "the tray is re-read when the run ends");
  assert.match(text(p), /Ask the committee to agendize repair performance/);
  assert.match(text(p), /machine work/);
  const ended = reads();
  await p.clock.tick(60000);
  assert.equal(reads(), ended, "an ended run is not read again");
});

test("R13: existed: true draws the run already asked; refusals by their words (PLAN_CLOSED, AI_*)", async () => {
  const p = await open(ROUTES.plan, asking({ status: "running" }, { ask: ok({ ok: true, plan: PLAN_ID, run: RUN, started: false, existed: true }) }));
  await press(p, "planask", { reason: "ask" });
  assert.match(text(p), /was already asked about this plan and is still working/);
  for (const [code, words] of [["PLAN_CLOSED", "The plan is closed."], ["AI_RUN_MODE_NOT_DEPLOYED", "Planning runs are not deployed."]]) {
    const q = await open(ROUTES.plan, asking({ status: "running" }, { ask: refusedIn(code, words) }));
    const b = await press(q, "planask", { reason: "ask" });
    assert.match(beside(q, b), new RegExp(words.replace(/\./g, "\\.")), code);
    assert.doesNotMatch(text(q), /looking for options/, "nothing is drawn as asked");
  }
});

test("R13: a closed plan offers no ask; the ask is drawn only while the assistant is reachable", async () => {
  const closed = await open(ROUTES.plan, { ...DATA_PLANE, ...REACH, plan: ok({ ...PLAN, state: "closed", closed: { reason: "done", by: "member:dev", at: "x" } }) });
  assert.ok(!ops(closed).includes("planask"));
  const off = await open(ROUTES.plan, { ...DATA_PLANE, planask: ok({}) });
  assert.ok(!ops(off).includes("planask"));
});
