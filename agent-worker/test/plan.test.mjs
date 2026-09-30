/* agent-worker — MODE `plan` (R50–R53; K660), AT THE MEMBER'S INTERFACE.
 *
 * The member's own handler (`src/index.mjs`' default export) is driven through `POST /run` in this node process, over
 * a plane stub bound as `env.PLANE` that answers every op a plan-mode run may call and COUNTS every call at the
 * binding, and with the global `fetch` replaced by a counter, so "no fetch" is a count, not a promise. The pure table
 * (`PLAN_FLOW`, `nextPlanStep`, `applyPlanJudgement`, `planDedup`) is walked directly.
 *
 * `plan` is not deployed (R53): a plan-mode run closes `mode-not-deployed` at the gate, and one arm holds that. To
 * drive `PLAN_FLOW`'s rows through the op, the suite deploys it IN THIS PROCESS ONLY, by the edit R42 names — setting
 * `MODES.plan.deployed` on the module it imports — and restores it; no request field can do that (R42). */
import "../../bio-plane/test/sandbox.mjs";

import {
  MODES, PLANE_OPS, PLAN_FLOW, CONTROL_FLOW, OPTION_KEYS, PLAN_BUDGET_BOUNDS, nextPlanStep, planStopBecause,
  applyPlanJudgement, planDedup, earlierPlans, whyWithUndetermined, flowFor, resumeFrom, publishableState,
} from "../src/harness.mjs";
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
      principal: { plane: "member:ruth", claude: null, ref: null, skill: "investigative-session@1" },
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
    meaningrows: () => ok({ ok: true, rows: [], count: 0 }),
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
      S.log.push({ op, query, body, token: u.searchParams.get("token") });
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
    body: JSON.stringify({ run_id: "RUN-P", store: "scratch", credential: AIK, judgements, ...extra }) }),
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

/* ================================================================== R50 */
section("R50 · mode plan walks PLAN_FLOW: its own table, one pass, no fan-out");
{
  t("R50: PLAN_FLOW's rows are exactly gate-mode, resume, read, compose, dedup, submit, adjust, close",
    Object.keys(PLAN_FLOW), ["gate-mode", "resume", "read", "compose", "dedup", "submit", "adjust", "close"]);
  t("R50: it has no fanout, collect or next-pass row, and no edge names one",
    [["fanout", "collect", "next-pass", "plan"].filter((r) => r in PLAN_FLOW),
     Object.values(PLAN_FLOW).flatMap((r) => r.to).filter((s) => !(s in PLAN_FLOW))], [[], []]);
  t("R50: no edge from compose to submit, and none from submit back to itself on a refusal",
    [PLAN_FLOW.compose.to.includes("submit"), nextPlanStep({ step: "submit", pass: 0, refusal: { code: "X" }, queue: [A] }).step],
    [false, "adjust"]);
  /* EXHAUSTIVE: every row, over every combination of the facts `nextPlanStep` reads, stays inside its row's `to`. */
  const escapes = [];
  for (const step of Object.keys(PLAN_FLOW))
    for (const mode of ["plan", "check", "nosuch"])
      for (const q of [[], [A], [A, B]])
        for (const refusal of [null, { code: "R" }])
          for (const adjusted of [false, true])
            for (const passN of [0, 1])
              for (const budget of [{}, { proposals: { allowed: 1, consumed: 1 } }, { wallclock: { allowed: 5, consumed: 9 } }])
                for (const resumeAt of [null, "dedup", "compose", "submit"]) {
                  const d = nextPlanStep({ step, mode, queue: q, refusal, adjusted, pass: passN, budget, resumeAt });
                  if (step !== "close" && !PLAN_FLOW[step].to.includes(d.step)) escapes.push(`${step}->${d.step}`);
                }
  t("R50: nextPlanStep never leaves a row's declared edges (exhaustive over mode, queue, refusal, adjust, pass, budget, resume point)",
    [...new Set(escapes)], []);
  t("R50: stopBecause asks proposals, then wallclock, for this table",
    [PLAN_BUDGET_BOUNDS, planStopBecause({ budget: { proposals: { allowed: 1, consumed: 1 }, wallclock: { allowed: 1, consumed: 1 } } }),
     planStopBecause({ budget: { wallclock: { allowed: 1, consumed: 1 } } }),
     planStopBecause({ budget: { fetches: { allowed: 1, consumed: 9 }, subsessions: { allowed: 1, consumed: 9 } }, pass: 0 })],
    [["proposals", "wallclock"], "proposals", "wallclock", null]);
  t("R50: one pass: a pass done closes completed, from any row after the gate",
    ["read", "compose", "dedup", "submit", "adjust"].map((step) => nextPlanStep({ step, pass: 1 }).bound),
    ["completed", "completed", "completed", "completed", "completed"]);
  t("R50: flowFor holds PLAN_FLOW beside CONTROL_FLOW: plan walks one, every other word the other",
    [flowFor("plan") === PLAN_FLOW, flowFor("check") === CONTROL_FLOW, flowFor("nosuch") === CONTROL_FLOW], [true, true, true]);

  await withPlanDeployed(async () => {
    const r = await run({}, [{ candidates: [A, B] }]);
    t("R50: a plan-mode run walks gate-mode, resume, read, compose, dedup, submit, submit and closes completed",
      [r.status, r.out.trace?.map((x) => `${x.step}>${x.to}`), r.out.ended, r.out.passes],
      [200, ["gate-mode>resume", "resume>read", "read>compose", "compose>dedup", "dedup>submit", "submit>submit", "submit>close"],
       { bound: "completed", by: "the table" }, 1]);
    t("R50: it called no airunspawn, capturerequest or suggest, counted at the binding",
      r.ops.filter((op) => ["airunspawn", "capturerequest", "suggest"].includes(op)), []);
    t("R50: and made no fetch (the global fetch counted zero calls)", r.fetches, 0);
    t("R50: its writes were optionpropose, airuntick and airunclose only",
      [...new Set(r.ops.filter((op) => PLANE_OPS[op]?.mutating))].sort(), ["airunclose", "airuntick", "optionpropose"]);
    t("R50: every op it called is one it declares (PLANE_OPS)", r.ops.filter((op) => !PLANE_OPS[op]), []);
  });
  const check = await run({ mode: "check" }, [{}, { reports: [] }, { candidates: [] }, {}]);
  t("R50 (control): mode check still walks CONTROL_FLOW: it fans out, and never reads a plan",
    [check.status, check.out.trace?.some((x) => x.step === "fanout"), check.ops.includes("airunspawn"), check.ops.includes("plan")],
    [200, true, true, false]);
}

/* ================================================================== R51 */
section("R51 · read: the plan, the same project's earlier plans and each subject's record, under the run's credential");
await withPlanDeployed(async () => {
  const r = await run({}, [{ candidates: [A] }]);
  const reads = r.S.log.filter((l) => !["whoami", "airun", "airunlog", "airuntick", "airunclose", "optionpropose"].includes(l.op))
    .map((l) => `${l.op}:${JSON.stringify(l.query)}`);
  t("R51: each read is made, in order: the plan, the project's plans, each subject's reads, the profiles (and the plan again at dedup)",
    reads, [
      `plan:${JSON.stringify({ id: PLAN_ID })}`, `plans:${JSON.stringify({ project: PROJECT })}`,
      `determination:${JSON.stringify({ id: "DET-1" })}`, `standard:${JSON.stringify({ id: "STD-1" })}`,
      `consequencesof:${JSON.stringify({ determination: "DET-1", standard: "STD-1" })}`,
      `availableactions:${JSON.stringify({ determination: "DET-1" })}`,
      `publishededitions:${JSON.stringify({ id: "INQ-9" })}`, `standard:${JSON.stringify({ id: "STD-2" })}`,
      `profiles:${JSON.stringify({})}`, `plan:${JSON.stringify({ id: PLAN_ID })}`]);
  t("R51: every call went under the run's credential and nothing else",
    [...new Set(r.S.log.map((l) => l.token))], [AIK]);
  t("R51: it reads no other project's plans: op=plans is asked for the plan's own project only",
    r.S.log.filter((l) => l.op === "plans").map((l) => l.query.project), [PROJECT]);
  t("R51: and of what op=plans answers, only the same project's earlier plans are kept, never the run's own",
    earlierPlans({ plans: [EARLIER_PLAN, OTHER_PROJECT_PLAN, { id: PLAN_ID, project: PROJECT }] }, PROJECT, PLAN_ID).map((p) => p.id),
    [EARLIER_PLAN.id]);
  t("R51: it reads no transcript, no person and nothing on the web: no op outside the declared reads, no fetch",
    [r.ops.filter((op) => !PLANE_OPS[op]), r.fetches], [[], 0]);
  t("R51: the profile's deadlines, venues and legal_organisations, unpublished by the plane's answer, are UNDETERMINED in the why",
    ["deadlines", "venues", "legal_organisations"].every((f) => r.S.proposals[0]?.why.includes(`profiles ${f}`)), true);
  t("R51 (control): a read that answers is cited in sources, as the proposal named it", r.S.proposals[0]?.sources, A.sources);

  const refused = await run({ refuse: { determination: "NO_SUCH_DETERMINATION" }, silent: ["publishededitions"] },
                            [{ candidates: [A] }]);
  const why = refused.S.proposals[0]?.why ?? "";
  t("R51: a refused read is carried as UNDETERMINED in the proposal's why, with its code, never as an absence",
    [/UNDETERMINED, not absent/.test(why), why.includes("determination DET-1 (NO_SUCH_DETERMINATION)")], [true, true]);
  t("R51: a silent read too, and the run went on to propose rather than stop",
    [why.includes("publishededitions INQ-9 (no answer)"), refused.out.submitted, refused.out.ended?.bound], [true, 1, "completed"]);
  t("R51: the why stays within optionPropose's 500 characters, the model's words cut to fit and the note kept whole",
    [whyWithUndetermined("x".repeat(600), [{ op: "standard", id: "STD-1", code: "NO_SUCH_STANDARD" }]).length,
     whyWithUndetermined("x".repeat(600), [{ op: "standard", id: "STD-1", code: "NO_SUCH_STANDARD" }]).endsWith("standard STD-1 (NO_SUCH_STANDARD).")],
    [500, true]);
  t("R51: a why with nothing undetermined is the model's own, unchanged", whyWithUndetermined("because", []), "because");
  const full = await run({ profile: { profiles: [], view: { deadlines: [], venues: [], legal_organisations: [] } } }, [{ candidates: [A] }]);
  t("R51: a profile answer that publishes the three facts leaves none of them UNDETERMINED",
    full.S.proposals[0]?.why.includes("profiles "), false);
});

/* ================================================================== R52 */
section("R52 · compose, dedup, submit: optionPropose's fields only, strongest first, duplicates dropped before any write");
{
  t("R52: a candidate carries only optionPropose's fields", OPTION_KEYS,
    ["summary", "detail", "category", "subjects", "addressee", "dates", "tier", "enforces", "lobbying", "why", "sources"]);
  const overs = [
    [{ candidates: [{ ...A, score: 0.9 }] }, ["candidates[0].score"]],
    [{ candidates: [A, { ...B, rank: 2 }] }, ["candidates[1].rank"]],
    [{ candidates: [{ ...A, strength: "high" }] }, ["candidates[0].strength"]],
    [{ candidates: [A], pass: 2 }, ["pass"]],
    [{ candidates: [A], plan: "PLN-OTHER" }, ["plan"]],
    [{ targets: [] }, ["targets"]],
  ];
  for (const [j, fields] of overs)
    t(`R52: a compose judgement naming ${fields.join(", ")} is refused by name`,
      [applyPlanJudgement({ step: "compose" }, j).ok, applyPlanJudgement({ step: "compose" }, j).overreach], [false, fields]);
  t("R52: an adjust judgement may carry only the changed submission, itself only optionPropose's fields",
    [applyPlanJudgement({ step: "adjust" }, { submission: A }).ok,
     applyPlanJudgement({ step: "adjust" }, { submission: { ...A, score: 1 } }).overreach], [true, ["submission.score"]]);
  const d = planDedup([A, { ...HELD_OPTION, why: "again", sources: ["X"] }, B, { ...A, why: "said twice" }],
                      { options: [HELD_OPTION], proposals: [] });
  t("R52: dedup drops a candidate whose {summary, category, subjects} equals an option on the plan, and a repeat of an earlier one",
    [d.queue.map((c) => c.summary), d.dropped.length], [[A.summary, B.summary], 2]);
  t("R52: …and one equal to a proposal already on the plan",
    planDedup([A, B], { options: [], proposals: [{ summary: B.summary, category: B.category, subjects: B.subjects }] }).queue
      .map((c) => c.summary), [A.summary]);

  await withPlanDeployed(async () => {
    const over = await run({}, [{ candidates: [{ ...A, score: 0.9 }] }]);
    t("R52: through the op, a candidate with a score key -> 400 JUDGEMENT_OVERREACH, and nothing was proposed",
      [over.status, over.out.code, over.out.step, over.out.fields, over.ops.includes("optionpropose")],
      [400, "JUDGEMENT_OVERREACH", "compose", ["candidates[0].score"], false]);
    const r = await run({}, [{ candidates: [C, { ...HELD_OPTION, why: "held", sources: ["DET-1"] }, A, B] }]);
    const proposes = r.S.log.filter((l) => l.op === "optionpropose");
    t("R52: the duplicate of an option on the plan was dropped before any write: never sent",
      proposes.some((l) => l.body.summary === HELD_OPTION.summary), false);
    t("R52: submission order is the judgement's order, one at a time, strongest first",
      proposes.map((l) => l.body.summary), [C.summary, A.summary, B.summary]);
    t("R52: each proposal names the run and the run's plan, and carries no score, rank or strength",
      proposes.map((l) => [l.body.run, l.body.plan, Object.keys(l.body).filter((k) => ![...OPTION_KEYS, "run", "plan"].includes(k))]),
      proposes.map(() => ["RUN-P", PLAN_ID, []]));
    t("R52 (control): a distinct candidate was submitted, and the run submitted every candidate it formed",
      [r.out.submitted, r.S.proposals.length], [3, 3]);
    const adj = await run({ refuseSummary: [C.summary] },
                          [{ candidates: [C, A] }, { submission: { ...C, summary: "Write to the outlet's editor" } }]);
    t("R52: adjust follows R25: a refused proposal changed is resent in its own place, ahead of the rest",
      adj.S.proposals.map((p) => p.summary), ["Write to the outlet's editor", A.summary]);
    const drop = await run({ refuseSummary: [C.summary] }, [{ candidates: [C, A] }, { submission: C }]);
    t("R52: an unchanged answer to a refusal drops it, never resent, and the rest of the queue is still proposed",
      [drop.S.log.filter((l) => l.op === "optionpropose").map((l) => l.body.summary), drop.out.verbatim_resubmits],
      [[C.summary, A.summary], 0]);
    const bound = await run({ budget: [{ bound: "proposals", allowed: 2 }, { bound: "runtime", allowed: 5000 }] },
                            [{ candidates: [A, B, C] }]);
    t("R52: it submits until none remain or the proposals bound stops it (run-rules R13), closing on that bound",
      [bound.S.proposals.length, bound.out.ended?.bound], [2, "proposals"]);
    t("R52: it sends the plane no figure for proposals: the plane counts them",
      bound.S.log.filter((l) => l.op === "airuntick").some((l) => "proposals" in (l.body?.consume || {})), false);
    const none = await run({}, [{ candidates: [] }]);
    t("R52: a run that forms nothing proposes nothing and closes completed after dedup",
      [none.S.proposals.length, none.out.trace?.map((x) => x.step).slice(-1)[0], none.out.ended?.bound], [0, "dedup", "completed"]);
  });
}

/* ================================================================== R53 */
section("R53 · PLANE_OPS gains exactly mode plan's ops; plan is not deployed yet");
{
  t("R53: PLANE_OPS gains exactly plan, plans, the R51 reads (non-mutating) and optionpropose (the one new write)",
    ["plan", "plans", "determination", "standard", "consequencesof", "availableactions", "publishededitions", "profiles", "optionpropose"]
      .map((op) => [op, PLANE_OPS[op]?.mutating]),
    [["plan", false], ["plans", false], ["determination", false], ["standard", false], ["consequencesof", false],
     ["availableactions", false], ["publishededitions", false], ["profiles", false], ["optionpropose", true]]);
  t("R53: MODES gains plan, and plan is NOT deployed today", [Object.keys(MODES).includes("plan"), MODES.plan.deployed], [true, false]);
  const r = await run({}, [{ candidates: [A] }]);
  t("R53: a plan-mode run today closes mode-not-deployed at its first step, before any read or proposal",
    [r.status, r.out.trace?.map((x) => x.step), r.out.ended?.bound, r.ops],
    [200, ["gate-mode"], "mode-not-deployed", ["whoami", "airun", "airunlog", "airuntick", "airunclose"]]);
  t("R53: and its why says the table holds plan and has not deployed it", /mode 'plan' is not deployed yet/.test(r.out.trace?.[0]?.why ?? ""), true);
  await withPlanDeployed(async () => {
    const all = await run({ refuseSummary: [A.summary] }, [{ candidates: [A, B] }, { submission: { ...A, summary: "changed" } }]);
    t("R53 (control): optionadd, or any write but optionpropose, airuntick and airunclose, is never attempted by a plan-mode run",
      [all.ops.includes("optionadd"), [...new Set(all.ops.filter((op) => PLANE_OPS[op]?.mutating))].sort()],
      [false, ["airunclose", "airuntick", "optionpropose"]]);
  });
  t("R53: a request field cannot deploy it (R42)",
    (await run({}, [{ candidates: [A] }], { modes: { plan: { deployed: true } }, deployed: true, mode: "plan" })).out.ended?.bound,
    "mode-not-deployed");
}

/* ================================================================== R11, R49 for PLAN_FLOW */
section("R11, R49 · a plan-mode run resumes at its published state; its state restarts at read when it would not fit");
{
  t("R11: a published plan-mode state names a step PLAN_FLOW continues from",
    [resumeFrom({ step: "submit", pass: 0, queue: [A] }, PLAN_FLOW).at, resumeFrom({ step: "fanout", pass: 0 }, PLAN_FLOW).at],
    ["submit", null]);
  t("R11: resuming at compose reads again, since a state carries no reads",
    nextPlanStep({ step: "resume", pass: 0, resumeAt: "compose" }).step, "read");
  t("R49: a plan-mode state over the ceiling is published as the pass restarted at read",
    publishableState({ step: "submit", pass: 0, queue: [A, B, C] }, 50, PLAN_FLOW).restarted?.at, "read");
  await withPlanDeployed(async () => {
    const r = await run({ state: { step: "submit", pass: 0, queue: [B], candidates: [A, B] } }, []);
    t("R11: a plan-mode run whose last tick published `submit` continues there, proposing what was queued",
      [r.out.trace?.map((x) => x.step).slice(0, 3), r.S.proposals.map((p) => p.summary)],
      [["gate-mode", "resume", "submit"], [B.summary]]);
  });
}

globalThis.fetch = realFetch;
console.log(`\nplan: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
