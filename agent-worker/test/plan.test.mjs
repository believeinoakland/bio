/* agent-worker — MODE `plan` (R50–R53; K660), AT THE MEMBER'S INTERFACE.
 *
 * The member's own handler (`src/index.mjs`' default export) is driven through `POST /run` in this node process, over
 * a plane stub bound as `env.PLANE` that answers every op a plan-mode run may call and COUNTS every call at the
 * binding, and with the global `fetch` replaced by a counter, so "no fetch" is a count, not a promise. The pure table
 * (`PLAN_FLOW`, `nextPlanStep`, `applyPlanJudgement`, `planDedup`) is walked directly.
 *
 * `plan` is deployed since T46 (R53, Bob's K2892, made with run-rules R14). The arms written before then still wrap
 * their drives in `withPlanDeployed` (now a no-op that restores what it found); one arm turns `MODES.plan` off IN THIS
 * PROCESS ONLY to show the gate reads `MODES` and nothing else, and no request field can change it (R42). */
import { ACCOUNT, MEMBER, ACCOUNT_SECRET, withAccount } from "./account.mjs";
import "../../bio-plane/test/sandbox.mjs";

import { MODES, PLAN_FLOW, CONTROL_FLOW, OPTION_KEYS, PLAN_BUDGET_BOUNDS, nextPlanStep, planStopBecause, applyPlanJudgement, planDedup, earlierPlans, whyWithUndetermined, flowFor, resumeFrom, publishableState } from "../../agent-harness/src/harness.mjs";
import { PLANE_OPS } from "../src/ops.mjs";
import worker from "../src/index.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

const AIK = "aik-" + "b".repeat(64);
const PLAN_ID = "PLN-2026-0001";
const PROJECT = "PROJ-7";
const SUBJECTS = [
  { kind: "outcome", determination: "DET-1", standard: "STD-1" },
  { kind: "inquiry", inquiry: "INQ-9", standards: ["STD-2"] },
];
const HELD_OPTION = { summary: "Ask the clerk for the minutes", category: "awareness", subjects: [SUBJECTS[0]] };
const PLAN_DOC = { id: PLAN_ID, project: PROJECT, state: "open", title: "the budget plan",
                   subjects: SUBJECTS.map((subject) => ({ subject, support: "established" })),
                   options: [HELD_OPTION], proposals: [] };
const OTHER_PROJECT_PLAN = { id: "PLN-2026-0099", project: "PROJ-OTHER", title: "not this project's" };
const EARLIER_PLAN = { id: "PLN-2025-0003", project: PROJECT, title: "last year's plan" };

/* ------------------------------------------------------------------ the plane stub, counting at the binding */
function planeStub(cfg = {}) {
  const S = { log: [], proposals: [], status: "running", ended: null, state: cfg.state ?? {} };
  const budget = Object.fromEntries((cfg.budget ?? [{ bound: "proposals", allowed: 20 }, { bound: "wallclock", allowed: 600000 },
                                                     { bound: "runtime", allowed: 5000 }])
    .map((b) => [b.bound, { allowed: b.allowed, consumed: b.consumed || 0 }]));
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai" });
  const answers = {
    whoami: () => ok({ tokenClass: "ai", session: false, member: null }),
    airun: () => ok({ found: true, session: {
      id: "RUN-P", mode: cfg.mode ?? "plan", status: S.status, plan: cfg.noPlan ? null : PLAN_ID,
      context: { type: "project", id: PROJECT, questions: [] },
      principal: { plane: "member:ruth", claude: "member:ruth", ref: "member:ruth", skill: "investigative-session@1" },
      state: S.state, budget: Object.entries(budget).map(([bound, b]) => ({ bound, ...b })) } }),
    airunlog: () => ok({ found: true, entries: [], truncated: false }),
    plan: () => ok({ ...PLAN_DOC, proposals: S.proposals.map((p) => ({ summary: p.summary, category: p.category, subjects: p.subjects })) }),
    plans: () => ok({ plans: [EARLIER_PLAN, OTHER_PROJECT_PLAN, { id: PLAN_ID, project: PROJECT }], truncated: false }),
    determination: (q) => ok({ id: q.id, outcomes: [{ standard: "STD-1", outcome: "noncompliant" }] }),
    standard: (q) => ok({ id: q.id, cite: `Gov. Code § ${q.id}` }),
    consequencesof: (q) => ok({ items: [{ id: "CON-1", determination: q.determination }] }),
    availableactions: (q) => ok({ determination: q.determination, actions: [{ kind: "records_request" }] }),
    publishededitions: (q) => ok({ id: q.id, editions: [{ edition: 1, findings: ["F-1"] }] }),
    profiles: () => ok(cfg.profile ?? { profiles: [{ id: "us-ca" }], conflicts: [] }),
    optionpropose: (q, body) => {
      if ((cfg.refuseSummary || []).includes(body?.summary))
        return ok({ ok: false, code: "ADDRESSEE_REFUSED", reason: "ADDRESSEE_REFUSED", check: "C-120.9" });
      S.proposals.push(body);
      budget.proposals && (budget.proposals.consumed += 1);
      return ok({ ok: true, proposal: `PRP-${S.proposals.length}`, note: "a proposal, never an option" });
    },
    airuntick: (q, body) => {
      if (body?.state != null) S.state = body.state;
      for (const [k, v] of Object.entries(body?.consume || {})) if (budget[k]) budget[k].consumed += Number(v) || 0;
      return ok({ ticked: true, appended: (body?.log || []).length, refused: [], status: "running" });
    },
    /* mode check's reads, for the control arm: the plane's search half, and empty answers. */
    airunspawn: () => ok({ found: true, half: "search", payload: { run: "RUN-P", context: { type: "inquiry", id: "INQ-9" },
                                                                   mode: "check", skill: null, standard_pair: null } }),
    meaningrows: () => ok({ ok: true, rows: [], scope: { documents: 3, documents_with_rows: 0, documents_without_rows: 3 }, count: 0 }),
    basisversions: () => ok({ versions: [], truncated: false }),
    airunclose: (q, body) => { S.status = "finished"; S.ended = { bound: body?.bound ?? null }; return ok({ ended: true }); },
  };
  return {
    S,
    fetch: async (url, init) => {
      const u = new URL(url);
      const op = u.searchParams.get("op") || "";
      const query = Object.fromEntries([...u.searchParams.entries()].filter(([k]) => !["op", "store", "token"].includes(k)));
      let body = null;
      if (init && init.body) body = JSON.parse(init.body);
      S.log.push({ op, query, body, token: String(init?.headers?.authorization ?? "").replace(/^Bearer /, "") || null });
      if ((cfg.silent || []).includes(op)) throw new Error("the binding did not answer");
      const staged = (cfg.refuse || {})[op];
      if (staged) return Response.json({ ok: true, result: { ok: false, code: staged, reason: staged, check: "C-0.0" } });
      const answer = answers[op];
      return answer ? answer(query, body) : Response.json({ ok: false, reason: "UNKNOWN_OP" }, { status: 404 });
    },
  };
}

/* Every global fetch this member makes in a run is counted: mode `plan` makes none (R50). */
const realFetch = globalThis.fetch;
let globalFetches = 0;
globalThis.fetch = async (...args) => { globalFetches += 1; return realFetch(...args); };

async function run(cfg, judgements, extra = {}) {
  const plane = planeStub(cfg);
  globalFetches = 0;
  const res = await worker.fetch(new Request("http://agent-worker/run", { method: "POST",
    body: JSON.stringify(withAccount({ run_id: "RUN-P", store: "scratch", credential: AIK, judgements, ...extra })) }),
    { PLANE: plane, VERSION: "test" });
  return { status: res.status, out: await res.json(), S: plane.S, ops: plane.S.log.map((l) => l.op), fetches: globalFetches };
}
const withPlanDeployed = async (fn) => {
  const was = MODES.plan.deployed;
  MODES.plan.deployed = true;
  try { return await fn(); } finally { MODES.plan.deployed = was; }
};

const A = { summary: "File a records request for the contract", category: "legal", subjects: [SUBJECTS[0]],
            why: "the determination found the contract unposted", sources: ["DET-1", "STD-1"] };
const B = { summary: "Brief the neighbourhood council", category: "grassroots", subjects: [SUBJECTS[1]],
            why: "the inquiry's finding is published", sources: ["INQ-9"] };
const C = { summary: "Write to the reporter who covered it", category: "journalistic", subjects: [SUBJECTS[0]],
            why: "a reporter has covered the matter", sources: ["DET-1"] };

/* ================================================================== R53 */
section("R53 · PLANE_OPS gains exactly mode plan's ops; plan is deployed by its own reviewed act (T46)");
{
  t("R53: PLANE_OPS gains exactly plan, plans, the R51 reads (non-mutating) and optionpropose (the one new write)",
    ["plan", "plans", "determination", "standard", "consequencesof", "availableactions", "publishededitions", "profiles", "optionpropose"]
      .map((op) => [op, PLANE_OPS[op]?.mutating]),
    [["plan", false], ["plans", false], ["determination", false], ["standard", false], ["consequencesof", false],
     ["availableactions", false], ["publishededitions", false], ["profiles", false], ["optionpropose", true]]);
  t("R53 (T46): MODES gains plan, and plan is deployed (Bob's K2892; run-rules R14)", [Object.keys(MODES).includes("plan"), MODES.plan.deployed], [true, true]);
  const r = await run({}, [{ candidates: [A] }]);
  t("R53 (T46): a plan-mode run walks past gate-mode, reads its plan and proposes",
    [r.status, r.out.trace?.[0]?.step, r.out.trace?.[0]?.to, r.out.ended?.bound, r.ops.includes("plan"), r.ops.includes("optionpropose")],
    [200, "gate-mode", "resume", "completed", true, true]);
  await withPlanDeployed(async () => {
    const all = await run({ refuseSummary: [A.summary] }, [{ candidates: [A, B] }, { submission: { ...A, summary: "changed" } }]);
    t("R53 (control): optionadd, or any write but optionpropose, airuntick and airunclose, is never attempted by a plan-mode run",
      [all.ops.includes("optionadd"), [...new Set(all.ops.filter((op) => PLANE_OPS[op]?.mutating))].sort()],
      [false, ["airunclose", "airuntick", "optionpropose"]]);
  });
  t("R53, R42: a request field cannot undeploy it",
    (await run({}, [{ candidates: [A] }], { modes: { plan: { deployed: false } }, deployed: false, mode: "check" })).out.ended?.bound,
    "completed");
  t("R53, R42 (control): with MODES.plan off the same run closes mode-not-deployed: the gate reads MODES and nothing else",
    await (async () => { const was = MODES.plan.deployed; MODES.plan.deployed = false;
      try { return (await run({}, [{ candidates: [A] }])).out.ended?.bound; } finally { MODES.plan.deployed = was; } })(),
    "mode-not-deployed");
}

globalThis.fetch = realFetch;
console.log(`\nplan: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
