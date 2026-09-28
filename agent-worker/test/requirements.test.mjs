/* agent-worker — ITS REQUIREMENTS, ONE BY ONE, AT ITS INTERFACE (`build/requirements/agent-worker.md`).
 *
 * Every live id R1–R48 is named by a test here, in its title, and each test checks the whole requirement. The
 * member is driven through `POST /run` and `GET /version` inside workerd, over a real service binding to a plane
 * mock, with its one other egress — the model API (R40, R41) — answered by a scripted model mock that
 * miniflare's `outboundService` puts behind every global `fetch`. The pure exports the requirements name
 * (`CONTROL_FLOW`, `nextStep`, `checkReport`, `resolveClaudeCascade`, `cascadeToken`, `SURFACE`) are driven
 * directly. The plane's own vocabularies are IMPORTED from the plane's modules, never retyped (R44), and the one
 * thing only the real plane can answer — what `op=affordances` publishes, and which namespaces exist — is asked of
 * the real plane, stood up here in workerd.
 *
 * Both mocks are reconfigured between arms through `/__mock/reset` and `/__model/reset`, so one workerd instance
 * serves most of the suite; arms that need a different ENVIRONMENT (no binding, a segment bound) get their own. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  CONTROL_FLOW, FIRST_STEP, LEVELS, MODES, REPORTING_LEVEL, PLANE_OPS, JUDGEABLE, NOT_JUDGEABLE, BUDGET_BOUNDS,
  nextStep, stopBecause, applyJudgement, runContextTarget, stepLog,
} from "../src/harness.mjs";
import {
  REPORT_KEYS, REPORT_STATES, SUMMARY_MAX, ADDRESS_MAX, CITATIONS_MAX, REPORT_MAX_BYTES, SPAWN_KEYS,
  checkReport, documentHoldings,
} from "../src/subsession.mjs";
import {
  CASCADE_ORDER, resolveClaudeCascade, cascadeToken,
} from "../src/cascade.mjs";
import { MODEL_ENDPOINT, DEFAULT_MAX_SEGMENT_BYTES } from "../src/model.mjs";
import { SURFACE } from "../src/index.mjs";
import { meaningRowsBranch } from "./plane-meaning.mjs";
import { versionReadBranches } from "./plane-versions.mjs";
import { suggestBranch } from "./plane-suggest.mjs";
import { captureRequestBranch } from "./plane-capturerequest.mjs";

/* THE PLANE'S OWN VOCABULARIES AND THE SKILL PACK, from their modules (uses: ai-runs, skills, legacy-checks). */
import { OBSERVATION_LEVELS, OBSERVATION_STATES, RUN_ENDINGS, RUN_BOUNDS, runStatusFor } from "../../bio-plane/src/airun.mjs";
import { DEPLOYMENT_SEQUENCE, GATE_ADDRESS, reportsAs } from "../../bio-plane/src/skilldoctrine.mjs";
import * as HARNESS from "../src/harness.mjs";
import { renderPack } from "../../bio-plane/src/skillpack.mjs";
import * as CATALOGUE from "../../bio-plane/checks/bio-checks.mjs";
import { discoverMembers, verifyStatic, verifyFresh } from "../../bio-plane/scripts/fleet-bundle.mjs";

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  return await import(pathToFileURL(createRequire(planePkg).resolve("miniflare")).href);
})();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const section = (s) => console.log(`\n--- ${s} ---`);

const WORKER_SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WRANGLER = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const WRANGLER_CFG = JSON.parse(WRANGLER);
const MANIFEST = JSON.parse(readFileSync(fileURLToPath(new URL("../fleet-member.json", import.meta.url)), "utf8"));
const PLANE_ENTRY = fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url));

const AIK = "aik-" + "a".repeat(64);
const REVOKED = "aik-" + "c".repeat(64);
const CLAUDE_TOKEN = "sk-ant-requirements-fixture-never-echoed";
const ACCOUNTS = { project: { token: CLAUDE_TOKEN, ref: "the-project-account" } };
const wide = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 500000 }, { bound: "runtime", allowed: 5000 }];

/* ============================================================ THE REAL PLANE, asked what only it can answer */
const real = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: PLANE_ENTRY, script: readFileSync(PLANE_ENTRY, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-req", MEMBER_TOKEN: "mem-req", PROBE_TOKEN: "prb-req", VERSION: "test" },
});
const PUBLISHED = (await (await real.dispatchFetch("http://x/api/?op=affordances&token=mem-req")).json());
const PUBLISHED_ANSWER = PUBLISHED && typeof PUBLISHED === "object" && "result" in PUBLISHED ? PUBLISHED.result : PUBLISHED;
const PACK = renderPack(PUBLISHED_ANSWER, CATALOGUE);
const planeNamespaces = (await (await real.dispatchFetch("http://x/api/?op=whoami&token=mem-req&store=biosmoke")).json()).namespaces;
await real.dispose();

/* ============================================================ THE PLANE MOCK, reconfigurable per arm */
const STATUS_BY_BOUND = Object.fromEntries(
  [...Object.keys(RUN_BOUNDS), ...Object.keys(RUN_ENDINGS)].map((b) => [b, runStatusFor(b)]));
const PLANE_MOCK = `
const STATUS_BY_BOUND = ${JSON.stringify(STATUS_BY_BOUND)};
let CFG = {}, S = null;
function reset(cfg) {
  CFG = cfg || {};
  S = { log: [], runlog: (CFG.priorLog || []).slice(), seq: (CFG.priorLog || []).length,
        budget: Object.fromEntries((CFG.budget || []).map((b) => [b.bound, { allowed: b.allowed, consumed: b.consumed || 0 }])),
        refusals: new Map(), status: "running", ended: null, suggested: [], requests: [], spawns: 0, bvIds: [] };
}
reset({});
/* the canonical bytes \`plane-suggest.mjs\`'s F10 branch keys a verbatim resubmit on */
const canon = (v) => {
  if (v === null || typeof v !== "object") return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
};
const runCtx = (CFG) => (CFG.contextType || "inquiry") === "project"
  ? { type: "project", id: CFG.target || "INQ-1", questions: CFG.questions || CFG.cites || [] }
  : { type: CFG.contextType || "inquiry", id: CFG.target || "INQ-1" };
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__mock/reset") { reset(await req.json()); return Response.json({ ok: true }); }
    if (url.pathname === "/__mock/state")
      return Response.json({ log: S.log, runlog: S.runlog, budget: S.budget, status: S.status, ended: S.ended,
                             suggested: S.suggested, requests: S.requests, spawns: S.spawns, bvIds: S.bvIds,
                             repeats: [...S.refusals.values()].map((r) => r.repeats) });
    const op = url.searchParams.get("op") || "";
    const token = url.searchParams.get("token") || "";
    let body = null;
    if (req.method === "POST") { try { body = await req.json(); } catch { body = null; } }
    S.log.push({ op, token, store: url.searchParams.get("store"), method: req.method, body,
                 query: Object.fromEntries(url.searchParams.entries()) });
    if ((CFG.silent || []).includes(op)) return new Response("<html>not json</html>", { status: 500 });
    const staged = (CFG.refuse_op || {})[op];
    if (staged) return Response.json(staged.body, { status: staged.status ?? 200 });
    if (token === ${JSON.stringify(REVOKED)})
      return Response.json({ ok: false, reason: "AI_CREDENTIAL_REVOKED", code: "AI_CREDENTIAL_REVOKED", check: "C-29.7",
        translation: "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here." },
        { status: 403 });
    if (op === "whoami")
      return Response.json({ ok: true, result: { tokenClass: "ai", session: false, member: null },
                             store: url.searchParams.get("store"), tokenClass: "ai", version: "plane-test" });
    if (op === "airun") {
      if (CFG.noSession) return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: false } });
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true, session: {
        id: url.searchParams.get("run"), mode: CFG.mode || "check", status: S.status, context: runCtx(CFG),
        ...(CFG.maxPasses != null ? { max_passes: CFG.maxPasses } : {}),
        principal: { plane: "member:ruth", claude: CFG.payer ?? null, ref: null, skill: CFG.skill ?? null },
        budget: Object.entries(S.budget).map(([bound, b]) => ({ bound, allowed: b.allowed, consumed: b.consumed, unit: null })),
      } } });
    }
    if (op === "airunlog")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true,
        entries: S.runlog, limit: 200, truncated: false } });
    if (op === "airunspawn") {
      S.spawns += 1;
      if (CFG.noPayload) return Response.json({ ok: true, result: { found: true, half: "search" } });
      const payload = { run: url.searchParams.get("run"), context: runCtx(CFG), mode: CFG.mode || "check",
                        skill: CFG.skill ?? null, standard_pair: null, budget: [] };
      if (CFG.leakBias) payload.bias = { in_force: true, manifest: { statements_sha: "LENS-REQ" } };
      return Response.json({ ok: true, result: { found: true, half: "search", payload } });
    }
    if (op === "affordances") return Response.json({ ok: true, result: CFG.published ?? {} });
    ${meaningRowsBranch("CFG.meaningRows || []")}
    ${versionReadBranches()}
    if (op === "basisversions") {
      S.bvIds.push(url.searchParams.get("id"));
      return Response.json({ ok: true, result: { id: url.searchParams.get("id"),
        versions: (CFG.heldVersions || []).map((n) => ({ name: n })), limit: 50, truncated: false } });
    }
    if (op === "airuntick") {
      if (S.status !== "running") return Response.json({ ok: true, result: { ticked: false, status: S.status } });
      /* observation-log R3, as the plane's \`checkObservation\` applies it to a member's entry: NEVER_LOOKED and an
         absent state are refused, per entry, the rest appended. */
      let appended = 0; const refused = [];
      for (const e of Array.isArray(body && body.log) ? body.log : []) {
        if (CFG.refuseEntries) refused.push(CFG.refuseEntries);
        else if (!e || typeof e.state !== "string" || e.state === "NEVER_LOOKED")
          refused.push({ ok: false, code: "AI_LOG_STATE_UNKNOWN", check: "C-22.1", detail: "NEVER_LOOKED is never stored" });
        else { S.runlog.push({ seq: ++S.seq, ...e }); appended += 1; }
      }
      for (const [k, v] of Object.entries((body && body.consume) || {}))
        if (S.budget[k]) S.budget[k].consumed += Number(v) || 0;
      const hit = ["fetches","subsessions","wallclock","runtime","lease"]
        .find((b) => S.budget[b] && S.budget[b].allowed > 0 && S.budget[b].consumed >= S.budget[b].allowed);
      if (hit) {
        const condition = hit === "runtime" ? "runtime-ceiling-reached" : null;
        S.runlog.push({ seq: ++S.seq, level: "document", state: "LOOKED_INDETERMINATE", terminal: 1, bound: hit, condition });
        S.status = "stopped"; S.ended = { bound: hit, condition };
        return Response.json({ ok: true, result: { ticked: true, appended, refused, status: "stopped",
                                                   ended: { terminated: true, bound: hit, condition } } });
      }
      return Response.json({ ok: true, result: { ticked: true, appended, refused, status: "running" } });
    }
    if (op === "airunclose") {
      const bound = (body && body.bound) || null;
      if (CFG.refuseClose)
        return Response.json({ ok: true, result: { ok: false, terminated: false, code: "AI_RUN_BOUND_UNKNOWN", check: "C-22.15" } });
      S.runlog.push({ seq: ++S.seq, level: "document", state: "LOOKED_INDETERMINATE", terminal: 1, bound, condition: null });
      S.status = STATUS_BY_BOUND[bound] || "finished"; S.ended = { bound, condition: null };
      return Response.json({ ok: true, result: { terminated: true, bound, condition: null } });
    }
    ${captureRequestBranch({ run: { principal: JSON.stringify(AIK), status: "S.status" } })}
    ${suggestBranch({ f10: true, run: { context: "runCtx(CFG)", cites: "(CFG.cites || [])",
                                        principal: JSON.stringify(AIK), status: "S.status" } })}
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};
`;

/* ============================================================ THE MODEL MOCK, behind every global fetch */
const MODEL_MOCK = `
let CFG = {}, M = { calls: [] };
export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/__model/reset") { CFG = await req.json(); M = { calls: [] }; return Response.json({ ok: true }); }
    if (url.pathname === "/__model/state") return Response.json(M);
    const raw = await req.text();
    M.calls.push({ url: req.url, method: req.method, key: req.headers.get("x-api-key"),
                   version: req.headers.get("anthropic-version"), bytes: raw.length, raw });
    if (CFG.silent) return new Response("<html>gateway</html>", { status: 502 });
    if (CFG.status) return Response.json({ type: "error", error: { type: CFG.errorType || "overloaded_error",
                                                                  message: "fixture failure" } }, { status: CFG.status });
    const body = JSON.parse(raw);
    /* The API refuses a request with no message; so does this mock. */
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages[0].role !== "user")
      return Response.json({ type: "error", error: { type: "invalid_request_error", message: "messages: at least one user message first" } }, { status: 400 });
    const n = M.calls.length;
    const reply = (content) => Response.json({ id: "msg_" + n, type: "message", role: "assistant", model: body.model,
      content, stop_reason: content.some((b) => b.type === "tool_use") ? "tool_use" : "end_turn",
      usage: { input_tokens: 1, output_tokens: 1 } });
    const names = (body.tools || []).map((x) => x.name);
    const last = body.messages[body.messages.length - 1];
    /* …and every tool_use must be answered by a tool_result in the next message, as the API requires. */
    for (let i = 0; i < body.messages.length - 1; i++) {
      const uses = (Array.isArray(body.messages[i].content) ? body.messages[i].content : []).filter((b) => b.type === "tool_use");
      const next = body.messages[i + 1];
      const answered = new Set((Array.isArray(next.content) ? next.content : []).filter((b) => b.type === "tool_result").map((b) => b.tool_use_id));
      if (uses.some((u) => !answered.has(u.id)))
        return Response.json({ type: "error", error: { type: "invalid_request_error", message: "tool_use without tool_result" } }, { status: 400 });
    }
    const lastIsResult = Array.isArray(last.content) && last.content.some((b) => b.type === "tool_result");
    if (names.includes("report")) {
      const contract = JSON.parse(String(body.system).split("YOUR SPAWN CONTRACT:\\n")[1]);
      const rep = (CFG.reports || {})[contract.level];
      if (!lastIsResult && CFG.subQuery !== false)
        return reply([{ type: "tool_use", id: "q" + n, name: "meaningrows", input: { rows: "leg", q: "", limit: 5 } }]);
      if (rep === "silent") return reply([{ type: "text", text: "nothing to say" }]);
      return reply([{ type: "tool_use", id: "r" + n, name: "report",
                      input: rep ?? { state: "LOOKED_ABSENT", summary: "nothing supportable at " + contract.level } }]);
    }
    const prompt = [...body.messages].reverse().find((m) => m.role === "user" && typeof m.content === "string");
    const step = (/Answer by calling judge_([a-z]+)/.exec(prompt ? prompt.content : "") || [])[1] || "";
    if (CFG.refuseAt === step)
      return Response.json({ id: "m", type: "message", role: "assistant", content: [], stop_reason: "refusal",
                             stop_details: { type: "refusal", category: null, explanation: "fixture decline" } });
    if (CFG.loadLayer && step === "plan" && !lastIsResult)
      return reply([{ type: "tool_use", id: "l" + n, name: "load_layer", input: { name: CFG.loadLayer } }]);
    return reply([{ type: "tool_use", id: "j" + n, name: "judge_" + step, input: (CFG.judge || {})[step] ?? {} }]);
  },
};
`;

const newMf = (vars = {}, opts = {}) => new Miniflare({
  workers: [
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC,
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "req-test", ...vars },
      ...(opts.noPlane ? {} : { serviceBindings: { PLANE: "plane-mock" } }),
      outboundService: "model-mock" },
    { name: "plane-mock", modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"] },
    { name: "model-mock", modules: true, script: MODEL_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"] },
  ],
});

/* EVERY ANSWER THE MEMBER GIVES in this suite is kept, for the arms that are about every answer (R36, R46, R47). */
const ANSWERS = [];
const call = async (mf, path, init) => {
  const res = await mf.dispatchFetch(`http://agent-worker/${path}`, init);
  const text = await res.text();
  let out = null; try { out = JSON.parse(text); } catch { out = null; }
  ANSWERS.push({ status: res.status, headers: Object.fromEntries(res.headers.entries()), text });
  return { status: res.status, out: out ?? {}, headers: Object.fromEntries(res.headers.entries()) };
};
const runOp = (mf, body) => call(mf, "run", { method: "POST", body: JSON.stringify(body) });
const reset = async (mf, plane = {}, model = {}) => {
  await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/reset",
    { method: "POST", body: JSON.stringify({ mode: "check", maxPasses: 1, budget: wide, target: "INQ-1",
                                             skill: PACK.version, published: PUBLISHED_ANSWER, ...plane }) });
  await (await mf.getWorker("model-mock")).fetch("http://model/__model/reset", { method: "POST", body: JSON.stringify(model) });
};
const planeState = async (mf) => (await (await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/state")).json());
const modelState = async (mf) => (await (await (await mf.getWorker("model-mock")).fetch("http://model/__model/state")).json());
const base = { run_id: "run-1", store: "scratch", credential: AIK };
/* The supplied mode's judgements for one pass: plan, collect, compose, dedup (adjust only when a refusal comes). */
const J = (reports = [], candidates = []) => [{ targets: [] }, { reports }, { candidates }, {}];
const OPS_SEEN = new Set();
const seen = async (mf) => { for (const l of (await planeState(mf)).log) OPS_SEEN.add(l.op); };

const mf = newMf();

/* ============================================================ POST /run: the checks before any plane call */
section("R1 · no plane binding: 503 PLANE_NOT_CONFIGURED, before the body is read");
{
  const bare = newMf({}, { noPlane: true });
  const a = await call(bare, "run", { method: "POST", body: JSON.stringify(base) });
  const b = await call(bare, "run", { method: "POST", body: "{{{ not json" });
  t("R1: env.PLANE.fetch absent -> 503 PLANE_NOT_CONFIGURED, and an unreadable body gets the same answer (not read)",
    [a.status, a.out.code, b.status, b.out.code], [503, "PLANE_NOT_CONFIGURED", 503, "PLANE_NOT_CONFIGURED"]);
  t("R1: the refusal has the member's shape: {ok:false, reason, code, detail, worker} with reason equal to code",
    [a.out.ok, a.out.reason === a.out.code, typeof a.out.detail, a.out.worker], [false, true, "string", "agent-worker"]);
  await bare.dispose();
}

section("R2–R7 · each malformed request refused by its code, in order, with no plane call made");
{
  await reset(mf);
  const cases = [
    ["R2", "a body that is not JSON", "{{{", 400, "BAD_BODY"],
    ["R3", "run_id absent", { store: "scratch", credential: AIK }, 400, "BAD_RUN_ID"],
    ["R3", "run_id not a string", { run_id: 7, store: "scratch", credential: AIK }, 400, "BAD_RUN_ID"],
    ["R3", "run_id empty", { run_id: "", store: "scratch", credential: AIK }, 400, "BAD_RUN_ID"],
    ["R3", "run_id of 201 characters", { run_id: "r".repeat(201), store: "scratch", credential: AIK }, 400, "BAD_RUN_ID"],
    ["R4", "store absent", { run_id: "r", credential: AIK }, 400, "BAD_STORE"],
    ["R4", "store not a string", { run_id: "r", store: 1, credential: AIK }, 400, "BAD_STORE"],
    ["R4", "store empty", { run_id: "r", store: "", credential: AIK }, 400, "NAMESPACE_UNKNOWN"],
    ["R4", "store in another case", { run_id: "r", store: "Scratch", credential: AIK }, 400, "NAMESPACE_UNKNOWN"],
    ["R4", "store padded", { run_id: "r", store: "bio ", credential: AIK }, 400, "NAMESPACE_UNKNOWN"],
    ["R4", "store no instance holds", { run_id: "r", store: "biosmoke", credential: AIK }, 400, "NAMESPACE_UNKNOWN"],
    ["R5", "credential absent", { run_id: "r", store: "scratch" }, 401, "NO_CREDENTIAL"],
    ["R5", "credential empty", { run_id: "r", store: "scratch", credential: "" }, 401, "NO_CREDENTIAL"],
    ["R5", "credential of another shape", { run_id: "r", store: "scratch", credential: "hunter2" }, 400, "BAD_CREDENTIAL_SHAPE"],
    ["R5", "credential with upper-case hex", { run_id: "r", store: "scratch", credential: "aik-" + "A".repeat(64) }, 400, "BAD_CREDENTIAL_SHAPE"],
    ["R5", "credential one hex short", { run_id: "r", store: "scratch", credential: "aik-" + "a".repeat(63) }, 400, "BAD_CREDENTIAL_SHAPE"],
    ["R6", "claude_accounts an array", { ...base, claude_accounts: [] }, 400, "BAD_CLAUDE_ACCOUNTS"],
    ["R6", "claude_accounts a string", { ...base, claude_accounts: "x" }, 400, "BAD_CLAUDE_ACCOUNTS"],
    ["R6", "claude_accounts where no level resolves", { ...base, claude_accounts: { member: { token: "" } } }, 409, "NO_ACCOUNT_RESOLVED"],
    ["R7", "turns zero", { ...base, turns: 0 }, 400, "BAD_TURNS"],
    ["R7", "turns negative", { ...base, turns: -3 }, 400, "BAD_TURNS"],
    ["R7", "turns not a number", { ...base, turns: "many" }, 400, "BAD_TURNS"],
    ["R7", "turns above the bound", { ...base, turns: 121 }, 400, "SEGMENT_OVER_BOUND"],
  ];
  for (const [id, label, body, status, code] of cases) {
    const r = await call(mf, "run", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
    t(`${id}: ${label} -> ${status} ${code}`, [r.status, r.out.code, r.out.reason], [status, code, code]);
  }
  t("R2–R7: and not one of those requests reached the plane", (await planeState(mf)).log, []);

  const ns = await runOp(mf, { run_id: "r", store: "n".repeat(100), credential: AIK });
  t("R4: NAMESPACE_UNKNOWN carries `asked` cut to 80 characters and `namespaces`, the two in order",
    [ns.out.asked, ns.out.namespaces], ["n".repeat(80), ["bio", "scratch"]]);
  t("R4: the set equals the plane's — the REAL plane's own refusal lists the same namespaces", ns.out.namespaces, planeNamespaces);
  const none = await runOp(mf, { ...base, claude_accounts: { member: { token: "" }, project: {} } });
  t("R6: NO_ACCOUNT_RESOLVED carries capability 'unavailable' and every level's state",
    [none.out.capability, (none.out.levels || []).map((l) => `${l.level}:${l.state}`)],
    ["unavailable", ["member:unset", "project:unset", "instance:unset"]]);
  const over = await runOp(mf, { ...base, turns: 400 });
  t("R7: SEGMENT_OVER_BOUND names turns_requested, turns_bound and bound_source; refused, never clamped",
    [over.out.turns_requested, over.out.turns_bound, typeof over.out.bound_source === "string" && over.out.bound_source.length > 0],
    [400, 120, true]);
  t("R7: its detail names the CPU ceiling the bound keeps clear of, and no memory ceiling",
    [/CPU/.test(over.out.detail ?? ""), /MEMORY/i.test(over.out.detail ?? "")], [true, false]);
  await reset(mf);
  const omitted = await runOp(mf, { ...base, judgements: J() });
  const exact = await runOp(mf, { ...base, turns: 120, judgements: J() });
  t("R7: `turns` absent means the bound (120 by default), and exactly the bound is accepted",
    [omitted.out.segment?.turns_requested, omitted.out.segment?.turns_bound, exact.status], [120, 120, 200]);
  for (const [v, want] of [["40", 40], ["0", 120], ["-5", 120], ["abc", 120]]) {
    const m = newMf({ MAX_TURNS_PER_SEGMENT: v });
    await reset(m);
    const r = await runOp(m, { ...base, turns: want + 1 });
    t(`R7: env.MAX_TURNS_PER_SEGMENT=${JSON.stringify(v)} -> the bound is ${want} (a positive number, else 120)`,
      [r.out.code, r.out.turns_bound], ["SEGMENT_OVER_BOUND", want]);
    await m.dispose();
  }
}

section("R8 · op=whoami under the credential: silent 502, refused 403 with the plane's body");
{
  await reset(mf, { silent: ["whoami"] });
  const s = await runOp(mf, base);
  t("R8: a silent plane (a body that is not JSON) -> 502 PLANE_SILENT with detail_from_binding",
    [s.status, s.out.code, typeof s.out.detail_from_binding], [502, "PLANE_SILENT", "string"]);
  await reset(mf);
  const r = await runOp(mf, { ...base, credential: REVOKED });
  t("R8: a refused credential -> 403 PLANE_REFUSED with run_id, store, plane_status and the plane's body unchanged",
    [r.status, r.out.reason, r.out.run_id, r.out.store, r.out.plane_status, r.out.plane?.code, r.out.plane?.check,
     r.out.plane?.translation],
    [403, "PLANE_REFUSED", "run-1", "scratch", 403, "AI_CREDENTIAL_REVOKED", "C-29.7",
     "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here."]);
  t("R8: whoami was the first and only call", (await planeState(mf)).log.map((l) => l.op), ["whoami"]);
}

/* ============================================================ the run's facts come from the record */
section("R9 · op=airun: silent, refused, no such run; the record's mode, never the body's");
{
  await reset(mf, { silent: ["airun"] });
  t("R9: airun silent -> 502 PLANE_SILENT", [(await runOp(mf, base)).out.code], ["PLANE_SILENT"]);
  await reset(mf, { refuse_op: { airun: { body: { ok: true, result: { ok: false, reason: "AI_RUN_NOT_VISIBLE", check: "C-22.9" } } } } });
  const r = await runOp(mf, base);
  t("R9: airun refused (inside `result`) -> 403 PLANE_REFUSED carrying the plane's body",
    [r.status, r.out.reason, r.out.plane?.result?.reason], [403, "PLANE_REFUSED", "AI_RUN_NOT_VISIBLE"]);
  await reset(mf, { noSession: true });
  const n = await runOp(mf, base);
  t("R9: no session -> 404 NO_SUCH_RUN with the run id", [n.status, n.out.code, n.out.run_id], [404, "NO_SUCH_RUN", "run-1"]);
  await reset(mf, { mode: "investigate" });
  const m = await runOp(mf, { ...base, mode: "check", judgements: J() });
  t("R9: a `mode` in the body has no effect — the record says investigate and the run closes at the gate",
    [m.out.mode, m.out.ended?.bound], ["investigate", "mode-not-deployed"]);
  await reset(mf, { maxPasses: 2, budget: [{ bound: "fetches", allowed: 1, consumed: 1 }] });
  const b = await runOp(mf, { ...base, judgements: J() });
  t("R9: the budget is the record's — a spent `fetches` allowance ends the run before any fan-out",
    [b.out.ended?.bound, (await planeState(mf)).spawns], ["fetches", 0]);
}

section("R10 · the run's recorded payer must be the level the accounts resolved");
{
  await reset(mf, { payer: "member" });
  const r = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  const st = await planeState(mf);
  t("R10: recorded member, resolved project -> 409 RUN_NAMES_A_DIFFERENT_PAYER with recorded, resolved and levels",
    [r.status, r.out.code, r.out.recorded, r.out.resolved, (r.out.levels || []).map((l) => l.state)],
    [409, "RUN_NAMES_A_DIFFERENT_PAYER", "member", "project", ["unset", "available", "unset"]]);
  t("R10: before any step — only whoami and airun were asked", st.log.map((l) => l.op), ["whoami", "airun"]);
  t("R10: and no model turn was taken", (await modelState(mf)).calls.length, 0);
}

section("R11 · op=airunlog: silent 502, refused 403; resumed_from counts its entries");
{
  await reset(mf, { silent: ["airunlog"] });
  t("R11: airunlog silent -> 502 PLANE_SILENT", (await runOp(mf, base)).out.code, "PLANE_SILENT");
  await reset(mf, { refuse_op: { airunlog: { status: 403, body: { ok: false, reason: "AI_RUN_NOT_PRINCIPAL", check: "C-22.12" } } } });
  const r = await runOp(mf, base);
  t("R11: airunlog refused -> 403 PLANE_REFUSED", [r.status, r.out.reason, r.out.plane?.reason], [403, "PLANE_REFUSED", "AI_RUN_NOT_PRINCIPAL"]);
  const prior = Array.from({ length: 5 }, (_, i) => ({ seq: i + 1, level: "document", state: "LOOKED_ABSENT", subject: "earlier" }));
  await reset(mf, { priorLog: prior });
  const c = await runOp(mf, { ...base, judgements: J() });
  t("R11: resumed_from is the number of entries the log holds, and the resume row continues rather than restarting",
    [c.out.resumed_from, /continuing rather than restarting/.test(c.out.trace?.find((x) => x.step === "resume")?.why ?? "")],
    [5, true]);
}

section("R12 · the target is the run's context, never a project id");
{
  await reset(mf, { target: "INQ-R12" });
  t("R12: an inquiry context's id is the target", (await runOp(mf, { ...base, judgements: J() })).out.target,
    { id: "INQ-R12", basis: "the run's context question" });
  await reset(mf, { contextType: "project", target: "PROJ-R12", questions: ["INQ-ONE"] });
  t("R12: a project context's one published question is the target",
    (await runOp(mf, { ...base, judgements: J() })).out.target?.id, "INQ-ONE");
  await reset(mf, { contextType: "project", target: "PROJ-R12", questions: ["INQ-A", "INQ-B"] });
  const several = (await runOp(mf, { ...base, judgements: J() })).out.target;
  t("R12: several questions -> null, the basis UNDETERMINED and never the project id",
    [several?.id, /^UNDETERMINED/.test(several?.basis ?? "")], [null, true]);
  const at = (ctx) => runContextTarget({ context: ctx });
  t("R12: none, not published, an unread kind and no id -> null, each with an UNDETERMINED basis",
    [at({ type: "project", id: "P", questions: [] }), at({ type: "project", id: "P" }), at({ type: "bundle", id: "B" }),
     at({ type: "inquiry" })].map((x) => [x.target, /^UNDETERMINED/.test(x.basis)]),
    [[null, true], [null, true], [null, true], [null, true]]);
}

/* ============================================================ the control-flow table, pure */
section("R13 · the rows, their declared edges, and nextStep held to them");
{
  t("R13: the rows are exactly gate-mode, resume, plan, fanout, collect, compose, dedup, submit, adjust, next-pass, close",
    Object.keys(CONTROL_FLOW), ["gate-mode", "resume", "plan", "fanout", "collect", "compose", "dedup", "submit",
                                "adjust", "next-pass", "close"]);
  const illegal = [];
  for (const step of Object.keys(CONTROL_FLOW))
    for (const mode of ["check", "investigate", "", "wat"])
      for (const pass of [0, 1, 3]) for (const maxPasses of [0, 1, 3])
        for (const refusal of [null, { code: "X" }]) for (const adjusted of [false, true])
          for (const q of [0, 1, 2]) for (const budget of [null, { fetches: { allowed: 1, consumed: 1 } }]) {
            const d = nextStep({ step, mode, pass, maxPasses, refusal, adjusted, budget,
                                 queue: Array.from({ length: q }, (_, i) => ({ name: `c${i}` })) });
            if (!CONTROL_FLOW[step].to.includes(d.step) && !(step === "close" && d.step === "close")) illegal.push([step, d.step]);
          }
  t("R13: nextStep never returns a step outside its row's declared `to`, over every combination walked", illegal, []);
  t("R13: there is no edge from compose to submit", CONTROL_FLOW.compose.to.includes("submit"), false);
  t("R13: a refused submit goes to adjust, never back to submit",
    nextStep({ step: "submit", mode: "check", pass: 0, maxPasses: 3, refusal: { code: "X" }, queue: [{ name: "a" }] }).step, "adjust");
  const unknown = nextStep({ step: "nowhere", pass: 0, maxPasses: 3 });
  t("R13: an unknown step closes with `completed` and says so",
    [unknown.step, unknown.bound, /not a row/.test(unknown.why)], ["close", "completed", true]);
}

section("R14 · gate-mode is first; an undeployed mode closes mode-not-deployed before anything is spent");
{
  for (const mode of ["investigate", "extract", "sorcery"]) {
    await reset(mf, { mode });
    const r = await runOp(mf, { ...base, judgements: J() });
    const st = await planeState(mf);
    t(`R14: mode '${mode}' -> closed at its first step, bound mode-not-deployed, after only the run and log reads`,
      [r.out.trace?.map((x) => x.step), r.out.ended?.bound, st.log.map((l) => l.op), st.spawns, st.suggested.length],
      [["gate-mode"], "mode-not-deployed", ["whoami", "airun", "airunlog", "airuntick", "airunclose"], 0, 0]);
    const why = r.out.trace?.[0]?.why ?? "";
    t(`R14: its why ${MODES[mode] ? "says the table holds it and has not deployed it" : "says the table does not hold the word"}, and names the deployed modes`,
      [MODES[mode] ? /not deployed yet/.test(why) : /no mode this table knows/.test(why), /deployed now: check/.test(why)],
      [true, true]);
    t(`R14: …and the close was written (${mode})`, st.ended?.bound, "mode-not-deployed");
  }
  t("R14: the first step is gate-mode, and check is deployed while investigate and extract are not",
    [FIRST_STEP, MODES.check.deployed, MODES.investigate.deployed, MODES.extract.deployed], ["gate-mode", true, false, false]);
}

section("R15 · stopBecause: fetches, subsessions, wallclock, then the pass limit");
{
  const full = { fetches: { allowed: 1, consumed: 1 }, subsessions: { allowed: 1, consumed: 1 }, wallclock: { allowed: 1, consumed: 1 } };
  t("R15: the bounds are asked in order fetches, subsessions, wallclock, and the first spent one closes",
    [stopBecause({ budget: full, pass: 0, maxPasses: 3 }),
     stopBecause({ budget: { ...full, fetches: { allowed: 2, consumed: 1 } }, pass: 0, maxPasses: 3 }),
     stopBecause({ budget: { wallclock: full.wallclock }, pass: 0, maxPasses: 3 })],
    ["fetches", "subsessions", "wallclock"]);
  t("R15: an absent or non-positive allowance never stops a run",
    [stopBecause({ budget: {}, pass: 0, maxPasses: 3 }),
     stopBecause({ budget: { fetches: { allowed: 0, consumed: 9 }, subsessions: { allowed: -1, consumed: 9 } }, pass: 0, maxPasses: 3 })],
    [null, null]);
  t("R15: then pass count >= the pass limit closes `completed`",
    [stopBecause({ pass: 3, maxPasses: 3 }), stopBecause({ pass: 2, maxPasses: 3 })], ["completed", null]);
  await reset(mf, { maxPasses: 2 });
  const two = await runOp(mf, { ...base, judgements: [...J(), ...J()] });
  t("R15: the limit is the run's max_passes when positive (2 -> two passes, each counted at next-pass)",
    [two.out.passes, two.out.trace?.filter((x) => x.step === "next-pass").length, two.out.ended?.bound], [2, 2, "completed"]);
  await reset(mf, { maxPasses: null });
  const dflt = await runOp(mf, { ...base, judgements: [] });
  t("R15: and 3 when the run names none", dflt.out.passes, 3);
}

section("R16 · judgements taken in order, one per judged row; a judgement reaching control flow refused");
{
  const judged = Object.keys(CONTROL_FLOW).filter((s) => CONTROL_FLOW[s].judged);
  t("R16: the judged rows are plan, collect, compose, dedup, adjust", judged, ["plan", "collect", "compose", "dedup", "adjust"]);
  t("R16: the fields a judgement may set are exactly these, and the ones it may not are exactly these",
    [JUDGEABLE, NOT_JUDGEABLE],
    [["targets", "reports", "candidates", "queue", "adjusted", "submission", "level", "observed", "governed", "condition"],
     ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store", "target"]]);
  t("R16: every NOT_JUDGEABLE field is refused and named, pure",
    NOT_JUDGEABLE.map((f) => applyJudgement({}, { [f]: 1 }).overreach), NOT_JUDGEABLE.map((f) => [f]));
  t("R16: only JUDGEABLE fields are applied; anything else is ignored, not stored",
    applyJudgement({ pass: 1 }, { candidates: [1], whimsy: 2 }).state, { pass: 1, candidates: [1] });
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: [{ targets: [] }, { reports: [], target: "INQ-OTHER", mode: "x" }] });
  t("R16: through the op, a judgement naming target and mode at collect -> 400 JUDGEMENT_OVERREACH with step and fields",
    [r.status, r.out.code, r.out.step, r.out.fields], [400, "JUDGEMENT_OVERREACH", "collect", ["target", "mode"]]);
  await reset(mf);
  const ok = await runOp(mf, { ...base, judgements: [{ targets: [] }] });
  t("R16: a judged row with no judgement left carries the state on (the run completes)", [ok.status, ok.out.ended?.bound], [200, "completed"]);
}

/* ============================================================ what each row does against the plane */
section("R17 · fanout: one spawn per level, the contract built key by key, 4 sub-sessions spent");
{
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: J() });
  const st = await planeState(mf);
  const spawns = st.log.filter((l) => l.op === "airunspawn");
  t("R17: one op=airunspawn (half=search) per level", [spawns.length, [...new Set(spawns.map((l) => l.query.half))]], [4, ["search"]]);
  t("R17: the contracts are one per level, in meaning, content, document, internet order",
    r.out.fanout?.contracts?.map((c) => c.level), ["meaning", "content", "document", "internet"]);
  t("R17: each contract has exactly the keys level, run, context, mode, skill, standard_pair, standard, scope, returns",
    [...new Set((r.out.fanout?.contracts || []).map((c) => Object.keys(c).join(",")))], [SPAWN_KEYS.join(",")]);
  t("R17: each is scoped [\"meaningrows\"], and the scope is published", [r.out.fanout?.scope,
    [...new Set((r.out.fanout?.contracts || []).map((c) => JSON.stringify(c.scope)))]], [["meaningrows"], ['["meaningrows"]']]);
  t("R17: the fanout spends 4 subsessions", st.budget.subsessions.consumed, 4);
  await reset(mf, { leakBias: true });
  const lens = await runOp(mf, { ...base, judgements: J() });
  t("R17: a payload carrying `bias` -> 502 SPAWN_PAYLOAD_CARRIES_LENS naming the level",
    [lens.status, lens.out.code, lens.out.level], [502, "SPAWN_PAYLOAD_CARRIES_LENS", "meaning"]);
  await reset(mf, { noPayload: true });
  const none = await runOp(mf, { ...base, judgements: J() });
  t("R17: no payload -> 502 SPAWN_PAYLOAD_MISSING", [none.status, none.out.code], [502, "SPAWN_PAYLOAD_MISSING"]);
  await reset(mf, { refuse_op: { airunspawn: { status: 403, body: { ok: false, reason: "AI_BEYOND_TASK_SCOPE", check: "C-29.9" } } } });
  const ref = await runOp(mf, { ...base, judgements: J() });
  t("R17: a refused spawn -> 403 PLANE_REFUSED with the plane's body", [ref.status, ref.out.reason, ref.out.plane?.reason],
    [403, "PLANE_REFUSED", "AI_BEYOND_TASK_SCOPE"]);
  const { spawnContracts } = await import("../src/subsession.mjs");
  const cs = spawnContracts({ run: "r", context: { type: "inquiry", id: "I" } }).contracts;
  t("R17: the contracts are frozen and share no object", [cs.every((c) => Object.isFrozen(c) && Object.isFrozen(c.context)),
    new Set(cs.map((c) => c.context)).size, new Set(cs.map((c) => c.returns)).size], [true, 4, 4]);
}

section("R18 · fanout, the internet level: one op=capturerequest per judged target, by address; one fetch each");
{
  await reset(mf, { target: "INQ-R18" });
  const r = await runOp(mf, { ...base, judgements: [
    { targets: [{ level: "internet", url: "https://example.org/a" }, { level: "internet", url: "https://example.org/b", target: "INQ-R18" },
                { level: "internet", url: "http://localhost/x" }, { level: "meaning", target: "INQ-R18" }] },
    { reports: [] }, { candidates: [] }, {}] });
  const st = await planeState(mf);
  t("R18: one request per internet-level target, {run, target, address}, its own target else the run's",
    st.log.filter((l) => l.op === "capturerequest").map((l) => l.body),
    [{ run: "run-1", target: "INQ-R18", address: "https://example.org/a" },
     { run: "run-1", target: "INQ-R18", address: "https://example.org/b" },
     { run: "run-1", target: "INQ-R18", address: "http://localhost/x" }]);
  t("R18: each refusal is published", (r.out.refusals || []).filter((x) => x.at === "capturerequest").map((x) => x.code),
    ["CAPTURE_REQUEST_NOT_PUBLIC"]);
  t("R18: one fetch is spent per request", st.budget.fetches.consumed, 3);
}

section("R19 · collect: every report held to R20; each cited address re-read by address");
{
  await reset(mf);
  const reports = [
    { level: "meaning", state: "PRESENT", observed_at: "log:1", citations: [{ address: "bundle:a" }, { address: "bundle:b" }] },
    { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2", text: "the document" },
    { level: "document", state: "partial", observed_at: "log:3", citations: [{ address: "bundle:a" }] },
  ];
  const r = await runOp(mf, { ...base, judgements: J(reports) });
  const reads = (await planeState(mf)).log.filter((l) => l.op === "meaningrows" && Array.isArray(l.body?.ids));
  t("R19: a refused report is published in reports_refused with its level and code, and never becomes an absence",
    [r.out.reports_refused?.map((x) => [x.level, x.code]), r.out.reports_taken,
     (await planeState(mf)).suggested.some((s) => s.name === "level-empty-content")],
    [[["content", "REPORT_UNKNOWN_FIELD"]], 2, false]);
  t("R19: each DISTINCT cited address re-read once through op=meaningrows (rows=leg, ids=[address])",
    reads.map((l) => [l.query.rows, l.body.ids]), [["leg", ["bundle:a"]], ["leg", ["bundle:b"]]]);
  t("R19: citations_reread counts reads that answered", r.out.citations_reread, 2);
  await reset(mf);
  const many = await runOp(mf, { ...base, judgements: J([{ level: "meaning", state: "PRESENT", observed_at: "log:1",
    citations: Array.from({ length: 20 }, (_, i) => ({ address: `bundle:${i}` })) },
    { level: "content", state: "PRESENT", observed_at: "log:2", citations: [{ address: "bundle:extra" }] }]) });
  t("R19: at most 20 addresses are re-read", many.out.citations_reread, 20);
  await reset(mf, { refuse_op: { meaningrows: { body: { ok: true, result: { ok: false, reason: "MEANING_ROWS_UNKNOWN_ARM", check: "C-23.2" } } } } });
  const refused = await runOp(mf, { ...base, judgements: J([reports[0]]) });
  t("R19: a read that did not answer is not counted", refused.out.citations_reread, 0);
}

section("R20 · the report contract, each breach refused by its own code");
{
  const good = { level: "document", state: "PRESENT", observed_at: "log:7", summary: "s", citations: [{ address: "a" }] };
  t("R20: a report with exactly the contract's keys is accepted", checkReport(good), null);
  t("R20: the keys are level, state, observed_at, summary, citations, governed, condition",
    Object.keys(REPORT_KEYS), ["level", "state", "observed_at", "summary", "citations", "governed", "condition"]);
  const cases = [
    [{ ...good, bytes: "x" }, "REPORT_UNKNOWN_FIELD"],
    [{ state: "PRESENT" }, "REPORT_INCOMPLETE"],
    [{ level: "meaning" }, "REPORT_INCOMPLETE"],
    [{ ...good, level: "gossip" }, "REPORT_LEVEL_UNKNOWN"],
    [{ ...good, state: "FOUND" }, "REPORT_STATE_UNKNOWN"],
    ...["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"].map((s) =>
      [{ level: "meaning", state: s, citations: [{ address: "a" }] }, "REPORT_UNLOCATED"]),
    [{ ...good, citations: [] }, "REPORT_NO_CITATION"],
    [{ ...good, state: "partial", citations: undefined }, "REPORT_NO_CITATION"],
    [{ ...good, citations: Array.from({ length: CITATIONS_MAX + 1 }, (_, i) => ({ address: `a${i}` })) }, "REPORT_OVER_BOUND"],
    [{ ...good, citations: [{ address: "a", text: "x" }] }, "REPORT_CITATION_NOT_AN_ADDRESS"],
    [{ ...good, citations: [{ address: "" }] }, "REPORT_CITATION_NOT_AN_ADDRESS"],
    [{ ...good, citations: [{ address: "a".repeat(ADDRESS_MAX + 1) }] }, "REPORT_OVER_BOUND"],
    [{ ...good, summary: "s".repeat(SUMMARY_MAX + 1) }, "REPORT_OVER_BOUND"],
    [{ ...good, summary: { pages: [] } }, "REPORT_SUMMARY_NOT_PROSE"],
  ];
  t("R20: every breach refused by its own code", cases.map(([r]) => checkReport(r)?.code), cases.map(([, c]) => c));
  t("R20: NEVER_LOOKED needs no observed_at, and an absence no citation",
    [checkReport({ level: "meaning", state: "NEVER_LOOKED" }), checkReport({ level: "meaning", state: "LOOKED_ABSENT", observed_at: "l" })],
    [null, null]);
  t("R20: at the bounds exactly (20 citations of 200 characters, a 500-character summary) is accepted, inside REPORT_MAX_BYTES",
    checkReport({ ...good, summary: "s".repeat(SUMMARY_MAX),
      citations: Array.from({ length: CITATIONS_MAX }, (_, i) => ({ address: String(i).padEnd(ADDRESS_MAX, "x") })) }), null);
  t("R20: the whole-report ceiling is REPORT_MAX_BYTES", REPORT_MAX_BYTES > SUMMARY_MAX + CITATIONS_MAX * ADDRESS_MAX, true);
  t("R20: the states are D-129's five", Object.keys(REPORT_STATES), ["NEVER_LOOKED", "LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"]);
}

section("R21 · collect, holdings: each citation resolved to its document by address_norm");
{
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: J([{ level: "document", state: "PRESENT", observed_at: "log:1",
    citations: [{ address: "https://example.org/cal" }, { address: "bundle:x" }] }]) });
  const st = await planeState(mf);
  t("R21: each cited address looked up as a held bundle (op=search, id:\"…\") and read through op=versionchain",
    [st.log.filter((l) => l.op === "search").map((l) => l.query.q), st.log.filter((l) => l.op === "versionchain").map((l) => l.query.address)],
    [['id:"https://example.org/cal"', 'id:"bundle:x"'], ["https://example.org/cal", "bundle:x"]]);
  t("R21: an item with no chain counts as itself", [r.out.holdings?.documents, r.out.holdings?.unchained], [0, 2]);
  const h = documentHoldings([
    { citation: "b1", bundle: "b1", address: "https://x/cal", chain: { address_norm: "x/cal", total: 3, versions: [{ bundle_id: "b1" }, { bundle_id: "b2" }] } },
    { citation: "b2", bundle: "b2", address: "https://x/cal", chain: { address_norm: "x/cal", total: 3, versions: [{ bundle_id: "b1" }, { bundle_id: "b2" }] } },
    { citation: "b3", bundle: "b3", address: "https://y/cal", chain: { address_norm: "y/cal", total: 1, versions: [{ bundle_id: "b3" }] } },
  ]);
  t("R21: holdings count each document once by the record's address_norm (two citations of one calendar are one document)",
    [h.documents, h.by_document.map((d) => [d.address_norm, d.versions_cited.length])], [2, [["x/cal", 2], ["y/cal", 1]]]);
  await reset(mf, { refuse_op: { versionchain: { body: { ok: true, result: { ok: false, reason: "VERSION_CHAIN_REFUSED", check: "C-0" } } } } });
  const u = await runOp(mf, { ...base, judgements: J([{ level: "document", state: "PRESENT", observed_at: "log:1",
    citations: [{ address: "https://example.org/cal" }] }]) });
  t("R21: a refused read leaves that citation's document UNDETERMINED, and published",
    [u.out.holdings?.undetermined, u.out.holdings?.documents, (u.out.refusals || []).some((x) => x.code === "VERSION_CHAIN_REFUSED")],
    [1, 0, true]);
}

section("R22 · compose: one meaning read; its note never a false zero; level-empty candidates made by the table");
{
  await reset(mf, { target: "INQ-R22", meaningRows: [{ ord: 0 }, { ord: 1 }] });
  const r = await runOp(mf, { ...base, judgements: J([
    { level: "document", state: "LOOKED_ABSENT", observed_at: "log:3", summary: "nothing in the packets" },
    { level: "meaning", state: "LOOKED_INDETERMINATE", observed_at: "log:1" }]) });
  const st = await planeState(mf);
  const reads = st.log.filter((l) => l.op === "meaningrows" && !l.body);
  t("R22: compose makes one op=meaningrows read at rows=leg, and its note counts the rows",
    [reads.map((l) => l.query.rows), /^2 meaning-grain row\(s\) queried at the 'leg' grain/.test(r.out.trace?.find((x) => x.step === "compose")?.note ?? "")],
    [["leg"], true]);
  const le = st.log.find((l) => l.op === "suggest" && l.body?.kind === "level-empty")?.body ?? {};
  t("R22: one level-empty candidate per LOOKED_ABSENT level: level in the suggestion spelling, its name, observed_at, the run's target",
    [st.suggested.filter((s) => s.kind === "level-empty").map((s) => s.name), le.level, le.observed_at, le.target],
    [["level-empty-documents"], "documents", "log:3", "INQ-R22"]);
  t("R22: its description is composed from those facts, with the report's summary appended",
    [/documents level of INQ-R22/.test(le.description ?? ""), /at log:3/.test(le.description ?? ""),
     /The sub-session reported: nothing in the packets$/.test(le.description ?? "")], [true, true, true]);
  await reset(mf, { refuse_op: { meaningrows: { body: { ok: true, result: { ok: false, reason: "MEANING_ROWS_UNKNOWN_ARM", check: "C-23.2" } } } } });
  const refused = await runOp(mf, { ...base, judgements: J() });
  t("R22: a refused read -> the note says the meaning layer was NOT READ, never zero",
    [/NOT READ/.test(refused.out.trace?.find((x) => x.step === "compose")?.note ?? ""),
     /^0 meaning-grain/.test(refused.out.trace?.find((x) => x.step === "compose")?.note ?? "")], [true, false]);
  await reset(mf, { refuse_op: { meaningrows: { body: { ok: true, result: { ok: true, arm: "leg" } } } } });
  const norows = await runOp(mf, { ...base, judgements: J() });
  t("R22: no rows list -> UNDETERMINED", /UNDETERMINED/.test(norows.out.trace?.find((x) => x.step === "compose")?.note ?? ""), true);
}

section("R23 · dedup before any write: held names on the target dropped; others go on uncompared");
{
  await reset(mf, { target: "INQ-R23", heldVersions: ["held"], cites: ["INQ-OTHER"] });
  const cands = [{ kind: "basis-version", name: "held", description: "a reading the record already holds" },
                 { kind: "basis-version", name: "fresh", description: "a reading the record does not hold" },
                 { kind: "basis-version", name: "held", target: "INQ-OTHER", description: "the same name aimed at another question" }];
  const r = await runOp(mf, { ...base, judgements: J([], cands) });
  const st = await planeState(mf);
  t("R23: op=basisversions read for the run's target before any suggest",
    [st.bvIds, st.log.findIndex((l) => l.op === "basisversions") < st.log.findIndex((l) => l.op === "suggest")], [["INQ-R23"], true]);
  t("R23: the candidate aimed at the target whose name is held was dropped; the others went on",
    st.log.filter((l) => l.op === "suggest").map((l) => `${l.body.name}@${l.body.target}`), ["fresh@INQ-R23", "held@INQ-OTHER"]);
  t("R23: the note counts the candidates aimed at another question as not compared",
    /1 named a question other than the run's target and were NOT compared/.test(r.out.trace?.find((x) => x.step === "dedup")?.note ?? ""), true);
  await reset(mf, { target: "INQ-R23", refuse_op: { basisversions: { status: 403, body: { ok: false, reason: "AI_BEYOND_TASK_SCOPE", check: "C-29.9" } } } });
  const refused = await runOp(mf, { ...base, judgements: J([], cands.slice(0, 2)) });
  t("R23: a refused read sends every candidate on, and the note says they were compared against nothing",
    [(await planeState(mf)).log.filter((l) => l.op === "suggest").length,
     /compared its 2 candidate\(s\) against NOTHING/.test(refused.out.trace?.find((x) => x.step === "dedup")?.note ?? "")], [2, true]);
}

section("R24 · submit: one candidate at a time, as formed; a refusal to adjust; verbatim resubmits counted");
{
  await reset(mf, { target: "INQ-R24" });
  const r = await runOp(mf, { ...base, judgements: J([], [
    { kind: "basis-version", name: "a", description: "the first reading, in full" },
    { kind: "basis-version", name: "b", description: "the second reading, in full" }]) });
  const st = await planeState(mf);
  t("R24: each candidate its own op=suggest with the run and the target, each followed by its own tick",
    [st.log.filter((l) => l.op === "suggest").map((l) => [l.body.name, l.body.run, l.body.target]),
     st.log.map((l) => l.op).filter((o, i, a) => o === "suggest" && a[i + 1] === "airuntick").length, r.out.submitted],
    [[["a", "run-1", "INQ-R24"], ["b", "run-1", "INQ-R24"]], 2, 2]);
  await reset(mf, { target: "INQ-R24", refuse: { v1: "SUGGEST_UNWRITABLE_STATE" } });
  const f = await runOp(mf, { ...base, judgements: [...J([], [{ kind: "basis-version", name: "v1",
    description: "a reading the plane refuses" }]), { submission: { kind: "basis-version", name: "v1", description: "changed words, in full" } }] });
  t("R24: a refusal goes to adjust", (f.out.trace || []).some((x) => x.step === "submit" && x.to === "adjust"), true);
  /* The plane's F10 keys a verbatim resubmit on the canonical submission: the same bytes in a second segment. */
  await reset(mf, { target: "INQ-R24" });
  const first = await runOp(mf, { ...base, max_steps: 9, judgements: [...J([], [{ kind: "basis-version", name: "v1", description: "TBD" }]), {}] });
  t("R24: (the first segment stopped short of its close, so the run is still running)", first.out.ended, null);
  const again = await runOp(mf, { ...base, judgements: [...J([], [{ kind: "basis-version", name: "v1", description: "TBD" }]), {}] });
  t("R24: a verbatim resubmit the plane reports (repeated: true) is counted in verbatim_resubmits",
    [again.out.verbatim_resubmits, (await planeState(mf)).repeats], [1, [1]]);
}

section("R25 · adjust: resend only changed bytes; an unchanged submission dropped, the rest still written");
{
  await reset(mf, { target: "INQ-R25", refuse: { v1: "SUGGEST_UNWRITABLE_STATE" } });
  const same = { kind: "basis-version", name: "v1", description: "a reading the plane refuses" };
  const r = await runOp(mf, { ...base, judgements: [...J([], [same, { kind: "basis-version", name: "v2",
    description: "the reading behind it in the queue" }]), { submission: { ...same, description: "a reading the plane refuses" } }] });
  const st = await planeState(mf);
  t("R25: the unchanged submission is dropped and never resent, and the next candidate is still written",
    [st.log.filter((l) => l.op === "suggest").map((l) => l.body.name), r.out.adjusted, st.suggested.map((s) => s.name)],
    [["v1", "v2"], 0, ["v2"]]);
  await reset(mf, { target: "INQ-R25", boilerplate: ["TBD"] });
  const c = await runOp(mf, { ...base, judgements: [...J([], [{ kind: "basis-version", name: "v1", description: "TBD" }]),
    { submission: { kind: "basis-version", name: "v1", description: "what changed, and why, in full" } }] });
  t("R25: a changed submission is resent, once", [(await planeState(mf)).log.filter((l) => l.op === "suggest").length, c.out.adjusted,
    (await planeState(mf)).suggested.map((s) => s.name)], [2, 1, ["v1"]]);
}

section("R26 · after every step one tick: the spend, and an entry only when the step's judgement states a look");
{
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: [{ targets: [], level: "document", observed: "PRESENT" },
    { reports: [] }, { candidates: [], level: "meaning", observed: "LOOKED_ABSENT", governed: false }, {}] });
  const st = await planeState(mf);
  const ticks = st.log.filter((l) => l.op === "airuntick");
  t("R26: one op=airuntick per step", ticks.length, (r.out.trace || []).length);
  t("R26: only the two steps whose judgement stated a look sent an entry; no entry carries NEVER_LOOKED",
    [ticks.filter((l) => (l.body.log || []).length).map((l) => l.body.log[0].subject), ticks.flatMap((l) => l.body.log || []).filter((e) => e.state === "NEVER_LOOKED").length],
    [["plan -> fanout", "compose -> dedup"], 0]);
  const e = ticks.find((l) => (l.body.log || []).length && l.body.log[0].subject === "compose -> dedup").body.log[0];
  t("R26: an entry is {level, subject, state, governed, condition, terminal, bound, detail}, detail at most 500",
    [Object.keys(e), e.state, e.level, e.detail.length <= 500], [["level", "subject", "state", "governed", "condition", "terminal", "bound", "detail"], "LOOKED_ABSENT", "meaning", true]);
  const p = ticks.find((l) => (l.body.log || []).length && l.body.log[0].subject === "plan -> fanout").body.log[0];
  t("R26: a step judged PRESENT is logged LOOKED_INDETERMINATE with the reason stated, counted in present_unbacked",
    [p.state, p.detail.startsWith("the model judged PRESENT"), r.out.present_unbacked], ["LOOKED_INDETERMINATE", true, 1]);
  t("R26: runtime = the plane calls of that step + 1 (fanout: 4 spawns, + the tick)",
    ticks.map((l) => l.body.consume.runtime)[(r.out.trace || []).findIndex((x) => x.step === "fanout")], 5);
  t("R26: logged counts what the plane appended", r.out.logged, 2);
  await reset(mf);
  const bad = await runOp(mf, { ...base, judgements: [{ targets: [], observed: "NEVER_LOOKED" }] });
  t("R26: a judgement stating NEVER_LOOKED is no look — no entry is sent, so none is refused",
    [bad.out.log_refused, bad.out.logged], [[], 0]);
  await reset(mf, { budget: [{ bound: "runtime", allowed: 4 }] });
  const ended = await runOp(mf, { ...base, judgements: J() });
  t("R26: when a tick reports the run ended, the segment stops and ended.by is the plane's own exit",
    [ended.out.ended?.bound, ended.out.ended?.by, (await planeState(mf)).log.filter((l) => l.op === "airunclose").length],
    ["runtime", "the plane's own exit", 0]);
  const stub = stepLog({ step: "plan", level: "meaning", observed: "LOOKED_ABSENT" }, { step: "fanout", why: "w".repeat(900) });
  t("R26: detail is cut at 500 characters", stub.detail.length, 500);
}

section("R26 · an entry the plane refuses is in log_refused and refusals, and not counted");
{
  await reset(mf, { refuseEntries: { ok: false, code: "AI_RUN_CONDITION_UNKNOWN", check: "C-22.4" } });
  const r = await runOp(mf, { ...base, judgements: [{ targets: [], observed: "LOOKED_INDETERMINATE", condition: "odd" }] });
  t("R26: the refused entry is named with its step in log_refused and in refusals; logged stays 0",
    [r.out.log_refused?.map((x) => [x.step, x.code, x.check]), (r.out.refusals || []).filter((x) => x.at === "airuntick.log").length, r.out.logged],
    [[["plan", "AI_RUN_CONDITION_UNKNOWN", "C-22.4"]], 1, 0]);
}

section("R27 · close: op=airunclose names the bound; ended only when the plane accepted; max_steps");
{
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: J() });
  const st = await planeState(mf);
  t("R27: op=airunclose names the table's bound, and ended is {bound, by: 'the table'}",
    [st.log.filter((l) => l.op === "airunclose").map((l) => l.body.bound), r.out.ended], [["completed"], { bound: "completed", by: "the table" }]);
  await reset(mf, { refuseClose: true });
  const refused = await runOp(mf, { ...base, judgements: J() });
  t("R27: a refused close -> ended null, the refusal published", [refused.out.ended, (refused.out.refusals || []).some((x) => x.at === "airunclose")],
    [null, true]);
  await reset(mf);
  const short = await runOp(mf, { ...base, judgements: J(), max_steps: 3 });
  t("R27: max_steps bounds one invocation and is never reported as a run's bound",
    [(short.out.trace || []).length, short.out.ended, (await planeState(mf)).log.some((l) => l.op === "airunclose")], [3, null, false]);
  await reset(mf, { maxPasses: 200, budget: [{ bound: "subsessions", allowed: 100000 }, { bound: "runtime", allowed: 100000 }] });
  const capped = await runOp(mf, { ...base, judgements: [], max_steps: 5000 });
  t("R27: max_steps is at most 400", (capped.out.trace || []).length, 400);
}

/* ============================================================ the answer */
section("R28 · the 200 answer carries exactly its fields");
{
  await reset(mf);
  const r = await runOp(mf, { ...base, judgements: J() });
  t("R28: the answer's keys, in order",
    Object.keys(r.out), ["ok", "run_id", "store", "stage", "turns_run", "judgement_source", "judgement_note", "claude_account",
      "mode", "trace", "passes", "ended", "logged", "log_refused", "present_unbacked", "submitted", "refusals", "adjusted",
      "verbatim_resubmits", "resumed_from", "target", "fanout", "reports_taken", "reports_refused", "citations_reread",
      "holdings", "budget", "segment", "plane_says", "principal", "principal_source", "plane", "worker"]);
  t("R28: ok, stage, target {id, basis}, fanout {of_pass, levels, scope, contracts}, plane_says, plane and worker",
    [r.out.ok, r.out.stage, Object.keys(r.out.target), Object.keys(r.out.fanout), Object.keys(r.out.plane_says),
     r.out.plane, r.out.worker],
    [true, "harness", ["id", "basis"], ["of_pass", "levels", "scope", "contracts"], ["token_class", "store", "session"],
     { version: "plane-test", op: "whoami" }, { name: "agent-worker", version: "req-test" }]);
  t("R28: budget lists the three spendable bounds as the record holds them after the segment",
    r.out.budget, BUDGET_BOUNDS.map((b) => ({ bound: b, ...{ fetches: { allowed: 50, consumed: 0 }, subsessions: { allowed: 50, consumed: 4 },
      wallclock: { allowed: 500000, consumed: 0 } }[b] })));
}

section("R29 · claude_account and principal");
{
  await reset(mf, { payer: "project" });
  const a = await runOp(mf, { ...base, judgements: J(), claude_accounts: ACCOUNTS });
  t("R29: accounts resolved -> {available: true, level, ref, levels}", a.out.claude_account,
    { available: true, level: "project", ref: "the-project-account",
      levels: [{ level: "member", state: "unset" }, { level: "project", state: "available" }, { level: "instance", state: "unset" }] });
  await reset(mf);
  const n = await runOp(mf, { ...base, judgements: J() });
  t("R29: none supplied -> {available: false, reason: NO_ACCOUNT_MATERIAL_SUPPLIED, detail}",
    [n.out.claude_account?.available, n.out.claude_account?.reason, typeof n.out.claude_account?.detail], [false, "NO_ACCOUNT_MATERIAL_SUPPLIED", "string"]);
  t("R29: principal is null and principal_source states no op an ai credential may call publishes it",
    [n.out.principal, /no read op an ai credential may call states its own principal/.test(n.out.principal_source)], [null, true]);
}

section("R30, R31 · GET /version; anything else 404 UNKNOWN");
{
  const v = await call(mf, "version", { method: "GET" });
  t("R30: GET /version -> 200 {ok, name, version: env.VERSION}", [v.status, v.out], [200, { ok: true, name: "agent-worker", version: "req-test" }]);
  const bare = newMf({ VERSION: "" });
  t("R30: and \"0.0.0\" when env.VERSION is empty", (await call(bare, "version", { method: "GET" })).out.version, "0.0.0");
  await bare.dispose();
  const others = [["GET", "run"], ["GET", ""], ["POST", "version"], ["PUT", "run"], ["GET", "nope"], ["POST", "run/extra"]];
  const got = [];
  for (const [method, path] of others) {
    const r = await call(mf, path, { method, ...(method === "GET" ? {} : { body: "{}" }) });
    got.push([r.status, r.out.code]);
  }
  t("R31: every other path or method -> 404 UNKNOWN", got, others.map(() => [404, "UNKNOWN"]));
  const empty = await call(mf, "", { method: "POST", body: JSON.stringify({ run_id: "r", store: "nope", credential: AIK }) });
  t("R31: POST to the empty path is /run", empty.out.code, "NAMESPACE_UNKNOWN");
}

/* ============================================================ the cascade, pure */
section("R32, R33 · the cascade");
{
  const PUBLISHED_VALUE = readFileSync(fileURLToPath(new URL("../../bio-plane/dist/SECRETS.txt", import.meta.url)), "utf8")
    .split("\n").find((l) => l.startsWith("ADMIN_TOKEN=")).split("=")[1].trim();
  const st = async (a) => (await resolveClaudeCascade(a)).levels.map((l) => l.state);
  t("R32: levels judged member, project, instance, in that order", [...CASCADE_ORDER], ["member", "project", "instance"]);
  t("R32: each level is unset (no non-empty string token), revoked_by_publication, or available — no shape check",
    [await st({}), await st({ member: { token: 7 }, project: { token: "" }, instance: { token: "x" } }),
     await st({ member: { token: PUBLISHED_VALUE } })],
    [["unset", "unset", "unset"], ["unset", "unset", "available"], ["revoked_by_publication", "unset", "unset"]]);
  const r = await resolveClaudeCascade({ member: { token: PUBLISHED_VALUE, ref: "m" }, project: { token: "p" }, instance: { token: "i", ref: "inst" } });
  t("R32: the first available level resolves, its ref or null", [r.available, r.level, r.ref], [true, "project", null]);
  const none = await resolveClaudeCascade({ member: { token: "" } });
  t("R32: none -> {available:false, reason:NO_ACCOUNT_RESOLVED, levels, detail}",
    [none.available, none.reason, none.levels.length, typeof none.detail], [false, "NO_ACCOUNT_RESOLVED", 3, "string"]);
  t("R32: the status never carries a token", JSON.stringify(await resolveClaudeCascade({ member: { token: "sk-secret" } })).includes("sk-secret"), false);
  t("R33: cascadeToken returns {level, token} for exactly the level resolved, else null",
    [await cascadeToken({ project: { token: "p" }, instance: { token: "i" } }), await cascadeToken({ member: { token: PUBLISHED_VALUE } })],
    [{ level: "project", token: "p" }, null]);
}

section("R34 · SURFACE and fleet-member.json");
{
  t("R34: SURFACE is {run: POST, version: GET}, both mutating: false", SURFACE,
    { run: { method: "POST", mutating: false }, version: { method: "GET", mutating: false } });
  t("R34: the manifest names the entry, the surface, the test directory and the bundle recipe",
    [MANIFEST.entry, MANIFEST.surface, MANIFEST.testDir, MANIFEST.bundle?.entry, MANIFEST.bundle?.outfile, MANIFEST.bundle?.manifest],
    ["src/index.mjs", "SURFACE", "test", "src/index.mjs", "dist/agent-worker.bundled.mjs", "dist/agent-worker.bundle.json"]);
}

/* ============================================================ R40, R41, R48: model turns */
section("R48 · in the model mode the pack is rendered, and a run under another pack is refused before any turn");
{
  await reset(mf, { payer: "project", skill: "investigative-session@1+0000000000000000" });
  const r = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R48: the recorded skill version is not the rendered pack's -> 409 SKILL_VERSION_MISMATCH carrying both",
    [r.status, r.out.code, r.out.recorded, r.out.rendered], [409, "SKILL_VERSION_MISMATCH", "investigative-session@1+0000000000000000", PACK.version]);
  t("R48: refused before any turn, after the payer check (R10), from op=affordances",
    [(await modelState(mf)).calls.length, (await planeState(mf)).log.map((l) => l.op)], [0, ["whoami", "airun", "affordances"]]);
  await reset(mf, { payer: "project", refuse_op: { affordances: { status: 403, body: { ok: false, reason: "AI_BEYOND_TASK_SCOPE", check: "C-29.9" } } } });
  const ref = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R48: a refused op=affordances -> 403 PLANE_REFUSED, no turn", [ref.status, ref.out.reason, (await modelState(mf)).calls.length], [403, "PLANE_REFUSED", 0]);
  await reset(mf, { payer: "project", published: { vocabularies: {}, catalog: [] } });
  const empty = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R48: a pack that cannot be rendered -> 502 PACK_UNRENDERABLE, no turn", [empty.status, empty.out.code, (await modelState(mf)).calls.length],
    [502, "PACK_UNRENDERABLE", 0]);
  await reset(mf, { payer: "project" });
  await runOp(mf, { ...base, claude_accounts: ACCOUNTS, judgements: J() });
  t("R48: until turns run it changes nothing: the supplied mode never asks for the pack",
    (await planeState(mf)).log.some((l) => l.op === "affordances"), false);
}

section("R40 · model turns run under the resolved account and the run's pack, within the segment bound");
{
  await reset(mf, { payer: "project", target: "INQ-R40" }, {
    loadLayer: "prohibitions",
    judge: { compose: { candidates: [{ kind: "basis-version", name: "model-made", description: "the reading the model composed, in full" }] } } });
  const r = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  const calls = (await modelState(mf)).calls;
  const bodies = calls.map((c) => JSON.parse(c.raw));
  const parent = bodies.filter((b) => !(b.tools || []).some((x) => x.name === "report"));
  t("R40: the run completed with judgements the model made: the model's candidate landed",
    [r.status, r.out.judgement_source, (await planeState(mf)).suggested.map((s) => s.name).includes("model-made")], [200, "model", true]);
  t("R40: every model call went to the model API with the resolved account's token and the API version",
    [[...new Set(calls.map((c) => c.url))], [...new Set(calls.map((c) => c.key))], [...new Set(calls.map((c) => c.version))]],
    [[MODEL_ENDPOINT], [CLAUDE_TOKEN], ["2023-06-01"]]);
  t("R40: turns_run counts the model calls, within the segment", [r.out.turns_run, r.out.segment?.turns_run], [calls.length, calls.length]);
  t("R40: the parent is instructed by the run's pack: its system names the pack's version and carries the resident layer",
    [parent.every((b) => b.system.includes(PACK.version)), parent.every((b) => b.system.includes(JSON.stringify(PACK.resident)))], [true, true]);
  t("R40: a disclosed layer the model asked for was loaded from the pack",
    parent.some((b) => b.messages.some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === "tool_result"
      && c.content === JSON.stringify(PACK.disclosed.prohibitions)))), true);
  t("R40: the parent judged plan, compose, dedup — collect's judgements are the sub-sessions' reports",
    [...new Set(parent.map((b) => (/Answer by calling judge_([a-z]+)/.exec([...b.messages].reverse()
      .find((m) => m.role === "user" && typeof m.content === "string")?.content ?? "") || [])[1]))], ["plan", "compose", "dedup"]);
  t("R40: the segment publishes what it sent the model", [r.out.segment?.bytes_sent, r.out.segment?.bytes_bound, r.out.segment?.stopped],
    [calls.reduce((n, c) => n + c.bytes, 0), DEFAULT_MAX_SEGMENT_BYTES, null]);

  await reset(mf, { payer: "project" });
  const three = await runOp(mf, { ...base, claude_accounts: ACCOUNTS, turns: 3 });
  t("R40: the turn bound stops the SEGMENT, never the run: ended null, stopped 'turns', no close, 3 turns",
    [three.status, three.out.ended, three.out.segment?.stopped, three.out.turns_run, (await planeState(mf)).log.some((l) => l.op === "airunclose")],
    [200, null, "turns", 3, false]);

  const small = newMf({ MAX_SEGMENT_BYTES: "60000" });
  await reset(small, { payer: "project" });
  const b = await runOp(small, { ...base, claude_accounts: ACCOUNTS });
  const sent = (await modelState(small)).calls.reduce((n, c) => n + c.bytes, 0);
  t("R40 (D-611): the byte bound stops the segment before a request would carry it past the bound",
    [b.out.segment?.stopped, b.out.ended, sent <= 60000, b.out.segment?.bytes_sent === sent, b.out.segment?.bytes_bound], ["bytes", null, true, true, 60000]);
  await small.dispose();

  await reset(mf, { payer: "project" }, { status: 529, errorType: "overloaded_error" });
  const refused = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R40: a model call the API refuses -> 502 MODEL_REFUSED with its status and error type, no token",
    [refused.status, refused.out.code, refused.out.model_status, refused.out.model_error], [502, "MODEL_REFUSED", 529, "overloaded_error"]);
  await reset(mf, { payer: "project" }, { refuseAt: "plan" });
  const declined = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R40: a model that declines -> 502 MODEL_REFUSED, type refusal", [declined.out.code, declined.out.model_error], ["MODEL_REFUSED", "refusal"]);
  await reset(mf, { payer: "project" }, { silent: true });
  const silent = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R40: a model API that does not answer JSON -> 502 MODEL_SILENT", [silent.status, silent.out.code], [502, "MODEL_SILENT"]);
  await reset(mf, { payer: "project" }, { judge: { plan: { targets: [], maxPasses: 9 } } });
  const over = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R40 (R16): a model judgement reaching for control flow is refused as any judgement is",
    [over.status, over.out.code, over.out.fields], [400, "JUDGEMENT_OVERREACH", ["maxPasses"]]);
}

section("R41 · sub-sessions run, one per level, each under its contract, returning only reports");
{
  await reset(mf, { payer: "project", target: "INQ-R41" }, { reports: {
    meaning: { state: "PRESENT", summary: "a leg already reaches this", citations: [{ address: "bundle:m1" }] },
    content: { state: "LOOKED_ABSENT", summary: "nothing extracted says so" },
    document: { state: "LOOKED_INDETERMINATE", summary: "the packets could not be read", bytes: "%PDF the packet" },
    internet: "silent" } });
  const r = await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  const calls = (await modelState(mf)).calls.map((c) => JSON.parse(c.raw));
  const subs = calls.filter((b) => (b.tools || []).some((x) => x.name === "report"));
  const firsts = subs.filter((b) => b.messages.length === 1);
  t("R41: one sub-session per level, each starting its own conversation (nothing shared with the parent or another level)",
    firsts.map((b) => JSON.parse(b.system.split("YOUR SPAWN CONTRACT:\n")[1]).level), LEVELS);
  t("R41: each is briefed with its own spawn contract, exactly as published", firsts.map((b) => b.system.split("YOUR SPAWN CONTRACT:\n")[1]),
    (r.out.fanout?.contracts || []).map((c) => JSON.stringify(c)));
  t("R41: its tools are its contract's scope and `report`, nothing else",
    [...new Set(subs.map((b) => b.tools.map((x) => x.name).join(",")))], ["meaningrows,report"]);
  t("R41: no sub-session was handed the lens or a credential", subs.some((b) => /LENS|aik-|sk-ant/.test(JSON.stringify(b))), false);
  const st = await planeState(mf);
  t("R41: a sub-session's meaningrows reached the plane through the parent's reader",
    st.log.filter((l) => l.op === "meaningrows" && l.query.limit === "5").length >= 4, true);
  const looks = st.runlog.filter((e) => /^sub-session /.test(e.subject ?? ""));
  t("R41: each sub-session that looked was logged at its level (PRESENT as LOOKED_INDETERMINATE)",
    looks.map((e) => [e.level, e.state]), [["meaning", "LOOKED_INDETERMINATE"], ["content", "LOOKED_ABSENT"], ["document", "LOOKED_INDETERMINATE"]]);
  t("R41: its report's observed_at is that entry's address, log:<seq>, and the level-empty candidate cites it",
    st.log.find((l) => l.op === "suggest" && l.body?.kind === "level-empty")?.body?.observed_at,
    `log:${looks.find((e) => e.level === "content")?.seq}`);
  t("R41: reports are held to R20 at collect: the one carrying bytes refused, the silent one named, neither an absence",
    [r.out.reports_taken, (r.out.reports_refused || []).map((x) => [x.level, x.code]).sort()],
    [2, [["document", "REPORT_UNKNOWN_FIELD"], ["internet", "SUBSESSION_NO_REPORT"]]]);
  t("R41: the cited address was re-read by the parent", r.out.citations_reread, 1);
}

/* ============================================================ the invariants */
section("R35 · its only binding is PLANE; the plane is reached by no other route");
{
  t("R35: wrangler declares exactly one service binding, PLANE, and no Durable Object, R2, KV, D1, queue or secret binding",
    [WRANGLER_CFG.services, ["durable_objects", "r2_buckets", "kv_namespaces", "d1_databases", "queues", "secrets_store_secrets",
      "secrets"].filter((k) => k in WRANGLER_CFG)], [[{ binding: "PLANE", service: "bio-plane" }], []]);
  t("R35: its vars hold no token and no plane URL", Object.keys(WRANGLER_CFG.vars), ["VERSION"]);
  await reset(mf, { payer: "project" });
  await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  t("R35: across a whole model-mode run, every global fetch went to the model API and nowhere else",
    [...new Set((await modelState(mf)).calls.map((c) => c.url))], [MODEL_ENDPOINT]);
}

section("R36 · it holds no credential; nothing it answers carries a token");
{
  t("R36: no answer this suite received carried the ai credential or the Claude token",
    ANSWERS.filter((a) => a.text.includes(AIK) || a.text.includes(CLAUDE_TOKEN)).length, 0);
  await reset(mf, { payer: "project" });
  await runOp(mf, { ...base, claude_accounts: ACCOUNTS });
  const st = await planeState(mf);
  const m = await modelState(mf);
  t("R36: the Claude token went only in the model API's key header: never to the plane, never in a model request body",
    [JSON.stringify(st.log).includes(CLAUDE_TOKEN), m.calls.some((c) => c.raw.includes(CLAUDE_TOKEN)), m.calls.every((c) => c.key === CLAUDE_TOKEN)],
    [false, false, true]);
  t("R36: the ai credential went only to the plane, never to the model", m.calls.some((c) => c.raw.includes(AIK)), false);
  await reset(mf, { payer: "project" });
  const again = await runOp(mf, { ...base, claude_accounts: { member: { token: "" }, project: { token: "sk-ant-second" } } });
  t("R36: a second call's material is its own: nothing of the first was retained", [again.status, (await modelState(mf)).calls.every((c) => c.key === "sk-ant-second")],
    [200, true]);
}

section("R37 · it judges no scope; PLANE_OPS is exactly its ops, and it calls no other");
{
  t("R37: PLANE_OPS is exactly the reads and the writes the plane makes",
    [Object.keys(PLANE_OPS).filter((o) => !PLANE_OPS[o].mutating).sort(), Object.keys(PLANE_OPS).filter((o) => PLANE_OPS[o].mutating).sort()],
    [["affordances", "airun", "airunlog", "airunspawn", "basisversions", "meaningrows", "search", "versionchain", "whoami"],
     ["airunclose", "airuntick", "capturerequest", "suggest"]]);
  await seen(mf);
  t("R37: the ops the member called across this suite's last run are all in PLANE_OPS",
    [...OPS_SEEN].filter((o) => !PLANE_OPS[o]), []);
  t("R37: none of its ops is one that returns document bytes",
    Object.keys(PLANE_OPS).filter((o) => ["capture", "acquire", "image", "archivelookup", "publishedmanifest", "bytes", "file"].includes(o)), []);
}

section("R38 · it never writes runtime-ceiling-reached or any ending itself");
{
  await reset(mf, { budget: [...wide.slice(0, 3), { bound: "runtime", allowed: 6 }] });
  const r = await runOp(mf, { ...base, judgements: J() });
  const st = await planeState(mf);
  t("R38: the run ended on runtime, and the condition was the plane's: no request this member sent carried it",
    [r.out.ended?.condition, st.log.filter((l) => /runtime-ceiling-reached/.test(JSON.stringify(l.body ?? null))).length],
    ["runtime-ceiling-reached", 0]);
  t("R38: no tick it sent named an ending as a bound or condition",
    st.log.filter((l) => l.op === "airuntick").flatMap((l) => l.body.log || []).filter((e) => e.condition || (e.bound && e.bound !== "completed")).length, 0);
}

section("R39 · no model judgement sets mode, step, pass count or limit, budget, bound, run, namespace or target");
{
  for (const f of ["mode", "step", "pass", "maxPasses", "budget", "bound", "run", "store", "target"])
    t(`R39: a judgement setting ${f} is refused`, applyJudgement({}, { [f]: "x" }).ok, false);
}

section("R42 · enabling a mode is an edit to MODES, never a request parameter");
{
  await reset(mf, { mode: "investigate" });
  const r = await runOp(mf, { ...base, mode: "check", modes: { investigate: { deployed: true } }, deployed: true, judgements: J() });
  t("R42: no request field enables an undeployed mode", r.out.ended?.bound, "mode-not-deployed");
  t("R42: MODES holds which modes are deployed", Object.fromEntries(Object.entries(MODES).map(([k, v]) => [k, v.deployed])),
    { check: true, investigate: false, extract: false });
}

section("R43 · a refusal reaching the member is never reworded");
{
  const plane = { ok: false, reason: "AI_CREDENTIAL_REVOKED", code: "AI_CREDENTIAL_REVOKED", check: "C-29.7",
    translation: "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here." };
  await reset(mf);
  t("R43 (R8): the plane's refusal body passed through whole", (await runOp(mf, { ...base, credential: REVOKED })).out.plane, plane);
  const inner = { ok: false, reason: "SUGGEST_UNWRITABLE_STATE" };
  for (const op of ["airun", "airunlog", "airunspawn", "basisversions", "suggest", "airuntick", "airunclose"]) {
    const body = { ok: true, result: { ...inner, check: "C-27.13", translation: `the plane's own words for ${op}` } };
    await reset(mf, { target: "INQ-R43", refuse_op: { [op]: { body } } });
    const r = await runOp(mf, { ...base, judgements: J([], [{ kind: "basis-version", name: "v", description: "a reading in full" }]) });
    const carried = [r.out.plane, ...(r.out.refusals || []).map((x) => x.plane)].filter(Boolean);
    t(`R43: a refusal of op=${op} carries the plane's body unchanged`,
      carried.some((p) => JSON.stringify(p) === JSON.stringify(body) || JSON.stringify(p) === JSON.stringify(body.result)), true);
  }
}

section("R44 · its copies equal their sources, both ways");
{
  t("R44: LEVELS is the key order of OBSERVATION_LEVELS", LEVELS, Object.keys(OBSERVATION_LEVELS));
  t("R44: REPORT_STATES' keys are OBSERVATION_STATES'", Object.keys(REPORT_STATES), Object.keys(OBSERVATION_STATES));
  t("R44: REPORTING_LEVEL is total over LEVELS and agrees with skills' reportsAs",
    [Object.keys(REPORTING_LEVEL), LEVELS.map((l) => REPORTING_LEVEL[l] === reportsAs(l))], [LEVELS, LEVELS.map(() => true)]);
  t("R44: NAMESPACES is the plane's (the member's refusal and the real plane's list the same set)",
    (await runOp(mf, { run_id: "r", store: "x", credential: AIK })).out.namespaces, planeNamespaces);
  t("R44: MODES' keys are DEPLOYMENT_SEQUENCE.order, and only its first member is deployed",
    [Object.keys(MODES), Object.keys(MODES).filter((k) => MODES[k].deployed)], [DEPLOYMENT_SEQUENCE.order, [DEPLOYMENT_SEQUENCE.order[0]]]);
  t("R44: the mode-not-deployed ending is one of the plane's RUN_ENDINGS", Object.keys(RUN_ENDINGS).includes("mode-not-deployed"), true);
}

section("N53 · the skills doctrine's pins on this member, owned here (R14, R44)");
{
  /* Moved from `bio-plane/test/skillsequencing.test.mjs` BLOCKS B and D (N53, K81): the skills doctrine cites this
     member's gate by address, and this member's own suite holds the address true. */
  t("R44 (N53): every export GATE_ADDRESS names exists here, and its row is a row of the table",
    [typeof HARNESS[GATE_ADDRESS.modes_export], typeof HARNESS[GATE_ADDRESS.table_export],
     typeof HARNESS[GATE_ADDRESS.first_step_export], typeof HARNESS[GATE_ADDRESS.decision_function],
     Object.prototype.hasOwnProperty.call(CONTROL_FLOW, GATE_ADDRESS.row), GATE_ADDRESS.file],
    ["object", "object", "string", "function", true, "agent-worker/src/harness.mjs"]);
  t("R14 (N53): the gate is the first row every run takes, and nothing in it is judged",
    [FIRST_STEP === GATE_ADDRESS.row, CONTROL_FLOW[GATE_ADDRESS.row].judged], [true, null]);
  t("R14 (N53): the gate is reached before any bound — an undeployed mode with a spent budget still stops on the mode",
    nextStep({ step: "gate-mode", mode: "investigate", pass: 9, maxPasses: 3,
               budget: { fetches: { allowed: 1, consumed: 999 } } }).bound, "mode-not-deployed");
  t("R14 (N53): a mis-spelled deployed mode is refused too — the gate is not a denylist of one word",
    [nextStep({ step: "gate-mode", mode: "CHECK ", pass: 0, maxPasses: 3 }).bound,
     nextStep({ step: "gate-mode", mode: "check", pass: 0, maxPasses: 3 }).step], ["mode-not-deployed", "resume"]);
}

section("R45 · the committed bundle is a fresh build of src/index.mjs, its manifest naming every input");
{
  const member = discoverMembers().find((m) => m.name === "agent-worker");
  const stat = verifyStatic(member);
  t("R45: the static check finds nothing", stat.findings, []);
  const fresh = await verifyFresh(member, stat.committed);
  t("R45: a fresh build is byte-identical to the committed bundle", [fresh.checked, fresh.findings], [true, []]);
  const inputs = (stat.manifest?.inputs || []).map((i) => i.path);
  t("R45: the manifest names every input, bio-plane/src/tokens.mjs included",
    ["../bio-plane/src/tokens.mjs", "src/index.mjs", "src/harness.mjs", "src/subsession.mjs", "src/cascade.mjs", "src/model.mjs"]
      .filter((p) => !inputs.some((i) => i.endsWith(p.replace(/^\.\.\//, "")))), []);
}

section("R46 · no place is named in its behaviour or outward text; its account is the project's");
{
  const PLACES = /Oakland|Alameda|California|Berkeley|San Francisco/i;
  t("R46: no answer this suite received names a place", ANSWERS.filter((a) => PLACES.test(a.text.replace(/"[^"]*(?:ruth|believe-in-oakland)[^"]*"/g, ""))).length, 0);
  t("R46: no instruction it sends the model names a place",
    (await modelState(mf)).calls.some((c) => PLACES.test(JSON.parse(c.raw).system.replace(JSON.stringify(PACK.resident), ""))), false);
  t("R46: its account_id is the project's one Cloudflare account", WRANGLER_CFG.account_id, "20b533579290b9b93168345edd3b7f72");
}

section("R47 · reachable only through the plane's service binding");
{
  t("R47: wrangler sets workers_dev false and preview_urls false", [WRANGLER_CFG.workers_dev, WRANGLER_CFG.preview_urls], [false, false]);
  t("R47: and it declares no route", ["routes", "route"].filter((k) => k in WRANGLER_CFG), []);
  t("R47: no answer this suite received carries access-control-allow-origin",
    [ANSWERS.length > 50, ANSWERS.filter((a) => "access-control-allow-origin" in a.headers).length], [true, 0]);
}

await mf.dispose();
console.log(`\nrequirements: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
