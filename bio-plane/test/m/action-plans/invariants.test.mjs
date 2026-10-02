/* action-plans R27, R28, and the module's ops and absent providers: every act is append-only history and every table
   is declared to purge; nothing is defaulted and no place is named; the ops reach the services with the control
   plane's stamps; a provider not given refuses rather than answering in part. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, opened, option, choose, V, MACHINE, AGENT, RUN_PRINCIPAL, by, OFFICE } from "./fixture.mjs";
import { actionPlansOps, actionPlansOwns, ACTION_PLANS_TABLES, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";

const code = (r) => r.code ?? r.reason;

test("R27: no act rewrites a row of history; the log only grows; every table is declared to purge and a purge empties it", async () => {
  const w = seeded();
  opened(w);
  const history = () => w.rows(`SELECT * FROM plan_history ORDER BY seq`).map((r) => JSON.stringify(r));
  const acts = [
    () => option(w, { dates: [{ date: "2026-11-01", basis: "b" }] }),
    () => w.ap.optionRevise({ plan: w.PL, option: "opt-1", summary: "Revised", reason: "better", ...by("bob") }),
    () => choose(w, ["opt-1"]),
    () => w.ap.planSubjectAdd({ plan: w.PL, subject: w.S2, reason: "also", ...by("bob") }),
    () => w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "S", phases: [{ id: "a", name: "A", options: ["opt-1"], starts: "plan_start" }], ...by("bob") }),
    () => w.ap.optionStart({ plan: w.PL, option: "opt-1", kind: "other", ...by("bob") }),
    () => w.ap.planClose({ id: w.PL, reason: "done", ...by("bob") }),
  ];
  let before = history();
  let log = w.text(w.PL);
  for (const act of acts) {
    act();
    const after = history();
    assert.deepEqual(after.slice(0, before.length), before, "earlier history rows are unchanged");
    assert.equal(after.length, before.length + 1);
    const text = w.text(w.PL);
    const sect = (t) => t.slice(t.indexOf("## Plan Log"), t.indexOf("## Session Log"));
    assert.ok(sect(text).startsWith(sect(log).trimEnd()), "the log only grows");
    before = after; log = text;
  }
  /* an edit of the log through a raw promotion is refused, even dressed as an act's */
  const head = w.record.head(w.PL);
  const raw = w.promotion.promote({ bundleId: w.PL, base: head.bundleSha, snapKey: "raw", author: V("bob"),
    files: [{ path: "bundle.md", text: w.text(w.PL).replace("What we do about it", "Rewritten") }], meta: { object_type: "action_plan" } });
  assert.equal(raw.ok, false);
  /* purge */
  await w.ap.optionPropose({ plan: w.PL, summary: "p", category: "other", subjects: [w.S1], why: "w", proposer: V("bob"), viewer: V("bob") });
  for (const t of ACTION_PLANS_TABLES) assert.ok(actionPlansOwns(t.name), t.name);
  assert.deepEqual(ACTION_PLANS_TABLES.map((t) => t.name).sort(),
    w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'plan%')`).map((r) => r.name).sort());
  const one = w.record.purge({ bundleId: w.PL });
  assert.equal(one.ok, true);
  for (const t of ACTION_PLANS_TABLES) assert.equal(w.count(t.name), 0, t.name);
  opened(w, [w.SI]);
  w.record.purge();
  for (const t of ACTION_PLANS_TABLES) assert.equal(w.count(t.name), 0, t.name);
});

test("R28: a fact not supplied answers undetermined, never a default; no place is named in outward text; the test profile only", () => {
  const w = seeded({ profiles: null });
  opened(w);
  const legal = w.ap.optionAdd({ plan: w.PL, summary: "Sue", category: "legal", subjects: [w.S1], ...by("bob") });
  const r = w.ap.planRead({ id: w.PL, viewer: V("bob") });
  assert.equal(r.work_kinds.state, "undetermined");
  assert.equal(r.options[0].tier, "undetermined");
  assert.equal(legal.fields.addressee, null, "no addressee is defaulted");
  assert.deepEqual(legal.fields.dates, []);
  /* no place in any translation or fixed sentence the module answers */
  const texts = Object.values(ACTION_PLAN_CHECKS).map((x) => x.translation).join(" ");
  for (const place of ["Port Ellery", "Marlow", "Oakland", "California", "Alameda"]) assert.equal(texts.includes(place), false, place);
  const w2 = seeded();
  assert.deepEqual(w2.record.getSetting("jurisdiction_profiles"), ["test-port-ellery"]);
});

const op = (ops, name) => ops[name]();
const url = (q) => new URL(`https://plane.test/?${new URLSearchParams(q)}`);

test("R1 R6 R7 R9 R11 R13 R14 R16 R18 R20 R31 R34: actionPlansOps reaches each service with the stamped author, viewer, proposer and principal, never the body's", async () => {
  const w = seeded();
  const ops = (q, body) => actionPlansOps(w.ap, url(q), body);
  assert.deepEqual(Object.keys(ops({}, {})).sort(), ["checkpointrecord", "optionadd", "optionadopt", "optiondispose", "optionpropose",
    "optionrevise", "optionstart", "optionstartpreview", "plan", "planclose", "planopen", "planproposals", "plans", "plansubjectadd", "plansubjectremove", "scenarioset"]);
  const stamp = { author: V("bob"), viewer: V("bob") };
  const forged = { author: V("alice"), viewer: V("alice") };
  const o = op(ops({ ...stamp }, { project: w.P, subjects: [w.SI, w.S1], title: "Via op", ...forged }), "planopen");
  assert.equal(o.ok, true); assert.equal(o.opened_by, V("bob"), "the body's author never wins");
  w.PL = o.id;
  assert.equal(code(op(ops({ author: MACHINE, viewer: MACHINE }, { project: w.P, subjects: [w.S2], title: "x", ...forged }), "planopen")), "MACHINE_CANNOT_PLAN");
  assert.equal(op(ops({ ...stamp, plan: w.PL }, { subject: w.S2, reason: "add" }), "plansubjectadd").ok, true);
  assert.equal(op(ops({ ...stamp, plan: w.PL }, { subject: w.S2, reason: "rm" }), "plansubjectremove").ok, true);
  const add = op(ops({ ...stamp, plan: w.PL }, { summary: "S", category: "awareness", subjects: [w.S1], addressee: OFFICE }), "optionadd");
  assert.equal(add.ok, true);
  assert.equal(op(ops({ ...stamp, plan: w.PL, option: add.option }, { reason: "better", summary: "S2" }), "optionrevise").ok, true);
  const prop = await op(ops({ proposer: V("bob"), viewer: V("bob"), plan: w.PL }, { summary: "P", category: "other", subjects: [w.S1], why: "w", proposer: V("alice") }), "optionpropose");
  assert.equal(prop.proposal.label.by, V("bob"));
  /* R11, R31 (N432): an agent's proposal reads both stamps from the query, proposer for the label, principal for the run */
  const { run } = w.openRun({ plan: w.PL, project: w.P });
  const agent = { proposer: AGENT, principal: RUN_PRINCIPAL, viewer: MACHINE, plan: w.PL, run };
  const body = { summary: "A", category: "other", subjects: [w.S1], why: "w", sources: [w.D] };
  const mp = await op(ops(agent, { ...body, proposer: V("alice"), principal: "member:dave/tok-9" }), "optionpropose");
  assert.equal(mp.ok, true, JSON.stringify(mp)); assert.equal(mp.proposal.label.by, AGENT); assert.equal(mp.proposal.run, run);
  const { principal: _, ...unstamped } = agent;
  assert.equal(code(await op(ops(unstamped, { ...body, principal: RUN_PRINCIPAL }), "optionpropose")), "AI_RUN_NOT_PRINCIPAL",
    "a principal in the body never stands in for the stamp");
  assert.equal(op(ops({ ...stamp, proposal: prop.proposal.id }, {}), "optionadopt").ok, true);
  assert.equal(op(ops({ ...stamp, plan: w.PL, disposition: "chosen" }, { options: [add.option] }), "optiondispose").ok, true);
  assert.equal(op(ops({ ...stamp, plan: w.PL, scenario: "1" }, { name: "S", phases: [{ id: "a", name: "A", options: [add.option], starts: "plan_start", checkpoint: { after_days: 1 } }] }), "scenarioset").ok, true);
  w.clock.now = "2026-10-03T00:00:00Z";
  assert.equal(op(ops({ ...stamp, plan: w.PL, scenario: "1", phase: "a", judged: "met" }, {}), "checkpointrecord").ok, true);
  assert.equal(op(ops({ ...stamp, plan: w.PL, option: add.option, kind: "other" }, {}), "optionstart").ok, true);
  assert.equal(op(ops({ viewer: V("bob"), id: w.PL }, {}), "plan").id, w.PL);
  assert.equal(op(ops({ viewer: V("dave"), id: w.PL }, {}), "plan").code, "NO_SUCH_PLAN");
  assert.equal(op(ops({ viewer: V("bob") }, {}), "plans").items.length, 1);
  assert.equal(op(ops({ viewer: V("bob"), plan: w.PL }, {}), "planproposals").ok, true);
  assert.equal(op(ops({ ...stamp, id: w.PL, reason: "done" }, {}), "planclose").ok, true);
});

test("R6 R30: a provider this host has not been given answers PROVIDER_UNAVAILABLE, never a partial answer", () => {
  const w = seeded({ omit: ["conformance"] });
  const r = w.ap.planOpen({ project: w.P, subjects: [w.S1], title: "t", ...by("bob") });
  assert.equal(code(r), "PLAN_PROVIDER_UNAVAILABLE"); assert.equal(r.provider, "conformance");
  const w2 = seeded({ omit: ["escalation"] });
  opened(w2);
  const read = w2.ap.planRead({ id: w2.PL, viewer: V("bob") });
  assert.equal(code(read), "PLAN_PROVIDER_UNAVAILABLE"); assert.equal(read.provider, "escalation");
  /* with no ai-runs, nothing registers a planning-run check (ai-runs then refuses plan mode, fail closed) */
  const w3 = world({ omit: ["aiRuns"] });
  assert.equal(w3.reg.checks.length, 0);
});
