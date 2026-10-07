/* N421 — THE MEMBER AT ITS INTERFACE, IN THIS PROCESS: WHAT IT READS, WHAT IT REACHES, AND BY WHICH ROUTE.
 *
 * The older suites held "it reaches nothing but the plane" and "it names no op outside PLANE_OPS" by scanning
 * `src/index.mjs`' TEXT: regexes over `call("…")`, `env.STORE`, `.put(`, URL literals. A scan reads what the source
 * SAYS, so it went blind each time a name moved behind a constant or a table (D-276's `MEANING_OP`, R51's `PLAN_READS`)
 * and it can be satisfied by a spelling while the behaviour differs. This instrument measures the same properties as
 * BEHAVIOUR, at the member's interface: its default export `fetch(request, env)`, driven here with
 *
 *   - an `env` that records every key the member READS, and that holds a tripwire under each binding a member must
 *     never hold (STORE, CAPTURES, PUBLISHED, and a KV, D1 and queue besides): a read of one is recorded, and any use
 *     of one throws;
 *   - a `PLANE` binding that records every property the member touches and every request it sends, answering a stub
 *     that serves every op in `PLANE_OPS` (and nothing else), so each declared op can be reached;
 *   - the global `fetch` replaced by a recorder that answers as the model API does, so every egress that is not the
 *     binding is counted with its URL.
 *
 * Three drives cover every row that calls the plane: a SUPPLIED check-mode run (an internet target, reports with a
 * citation and an absence, a refused candidate adjusted and resent), a MODEL run (R40, R41, R48: the pack read from
 * `op=affordances`, four sub-sessions reading through `meaningrows`), and a PLAN run (R50–R53: mode `plan` deployed in
 * THIS PROCESS ONLY, by the edit R42 names, and restored) — plus the refusals before any plane call and the two other
 * routes. NOT a `.test.mjs`: an instrument the suites share, not a suite. */
import worker from "../src/index.mjs";
import { MODES } from "../../agent-harness/src/harness.mjs";
import { ASK_OPS, ASK_PLANE_OPS } from "../src/ops.mjs";
import { MEMBER, withAccount } from "./account.mjs";
import { PLANE_OPS } from "../src/ops.mjs";

export const AIK = "aik-" + "e".repeat(64);
export const AIK_SECOND = "aik-" + "f".repeat(64);
export const CLAUDE_TOKEN = "sk-ant-inprocess-fixture-never-echoed";
export const PACK_VERSION = "investigative-session@inprocess+0000000000000000";
export const FORBIDDEN_BINDINGS = ["STORE", "CAPTURES", "PUBLISHED", "KV", "DB", "QUEUE", "AI"];

const PACK = { id: "investigative-session", edition: "inprocess", version: PACK_VERSION,
               resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} };
const PLAN_ID = "PLN-2026-0421";
const PROJECT = "PROJ-421";
const SUBJECTS = [{ kind: "outcome", determination: "DET-1", standard: "STD-1" },
                  { kind: "inquiry", inquiry: "INQ-9", standards: ["STD-2"] }];
const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 500000 }, { bound: "runtime", allowed: 5000 },
              { bound: "proposals", allowed: 20 }];

/** One recording: what one drive read and reached. */
function recorder() {
  return { envKeys: new Set(), forbiddenTouched: [], planeProps: new Set(), planeCalls: [], globalFetches: [],
           answers: [] };
}

/** A tripwire: reading the key is recorded by the env; touching anything on it throws. */
const tripwire = (rec, name) => new Proxy({}, {
  get(_, prop) { rec.forbiddenTouched.push(`${name}.${String(prop)}`); throw new Error(`${name} is not this member's`); },
  has(_, prop) { rec.forbiddenTouched.push(`${name} has ${String(prop)}`); return false; },
});

/** The plane stub: every op PLANE_OPS declares, answered the way the plane answers it; any other op is refused
 *  unknown, so a call outside the declaration is visible in the answers as well as in the record. */
function planeStub(rec, cfg) {
  const S = { status: "running", state: {}, seq: 0, proposals: [] };
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "inprocess" });
  const handle = async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    let body = null;
    if (init && typeof init.body === "string") { try { body = JSON.parse(init.body); } catch { body = null; } }
    rec.planeCalls.push({ url: String(url), origin: u.origin, op, token: String(init?.headers?.authorization ?? "").replace(/^Bearer /, "") || null,
                          method: init?.method || "GET", query: Object.fromEntries(u.searchParams.entries()), body });
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: u.searchParams.get("run"), found: true, session: {
        id: u.searchParams.get("run"), mode: cfg.mode, status: S.status, plan: cfg.mode === "plan" ? PLAN_ID : null,
        context: cfg.mode === "plan" ? { type: "project", id: PROJECT, questions: [] } : { type: "inquiry", id: "INQ-421" },
        max_passes: 1, principal: { plane: "member:ruth", claude: cfg.payer ?? MEMBER, ref: null, skill: PACK_VERSION },
        state: S.state, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: u.searchParams.get("run"), found: true, entries: [], limit: 200, truncated: false });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: u.searchParams.get("run"),
        context: { type: "inquiry", id: "INQ-421" }, mode: cfg.mode, skill: PACK_VERSION, standard_pair: null } });
      case "affordances": return ok({ pack: PACK });
      case "meaningrows": return ok({ ok: true, arm: String(u.searchParams.get("rows") || "").trim().toLowerCase(),
                                      rows: [], count: 0 });
      case "basisversions": return ok({ id: u.searchParams.get("id"), versions: [], limit: 50, truncated: false });
      case "search": return ok({ hits: [{ bundle_id: "bundle:cited", source_locator: "https://example.org/cal" }] });
      case "versionchain": return ok({ address_norm: "example.org/cal", total: 1, truncated: false,
                                       versions: [{ bundle_id: "bundle:cited" }] });
      case "capturerequest": return ok({ request: "REQ-1", state: "queued" });
      case "suggest":
        if (body?.name === "refused-once" && body?.description === "TBD")
          return ok({ ok: false, wrote: false, repeated: false, code: "SUGGEST_BOILERPLATE", reason: "SUGGEST_BOILERPLATE",
                      check: "C-27.12" });
        return ok({ wrote: true, version: body?.name ?? null });
      case "airuntick":
        if (body?.state != null) S.state = body.state;
        return ok({ ticked: true, appended: (body?.log || []).length, refused: [], status: S.status });
      case "airunclose": S.status = "finished"; return ok({ terminated: true, bound: body?.bound ?? null });
      case "plan": return ok({ id: PLAN_ID, project: PROJECT, state: "open", title: "the plan", options: [],
        subjects: SUBJECTS.map((subject) => ({ subject, support: "established" })),
        proposals: S.proposals.map((p) => ({ summary: p.summary, category: p.category, subjects: p.subjects })) });
      case "plans": return ok({ plans: [{ id: "PLN-2025-0001", project: PROJECT }], truncated: false });
      case "determination": return ok({ id: u.searchParams.get("id"), outcomes: [] });
      case "standard": return ok({ id: u.searchParams.get("id"), cite: "a cite" });
      case "consequencesof": return ok({ items: [] });
      case "availableactions": return ok({ actions: [] });
      case "publishededitions": return ok({ id: u.searchParams.get("id"), editions: [] });
      case "profiles": return ok({ profiles: [], view: { deadlines: [], venues: [], legal_organisations: [] } });
      case "optionpropose": S.proposals.push(body); return ok({ ok: true, proposal: `PRP-${S.proposals.length}` });
      /* R54 — the ask's own calls (K1601 (3)), and its reads: every op of ASK_OPS answers when the drive is an ask. */
      case "askceiling":
        return cfg.ceilingReached
          ? ok({ ok: false, reason: "AI_USE_CEILING_REACHED", code: "AI_USE_CEILING_REACHED", check: "C-22.30",
                 translation: "You have reached today's limit." })
          : ok({ ok: true, reached: false });
      case "askcheck": return ok({ ok: true, answer: { ...(body?.answer || {}), checked: true },
                                   withheld: cfg.withheld || [] });
      case "askusage": return ok({ ok: true, counted: true });
      default:
        if (cfg.ask && ASK_OPS.includes(op)) return ok({ op, rows: [] }); return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  };
  return new Proxy({ fetch: handle }, {
    get(target, prop) { rec.planeProps.add(String(prop)); return target[prop]; },
    has(target, prop) { rec.planeProps.add(String(prop)); return prop in target; },
  });
}

/** The env: records every key read; the plane binding where configured; tripwires under the bindings it must not hold. */
function envFor(rec, cfg, vars = {}) {
  const base = { VERSION: "inprocess", ...vars };
  if (!cfg.noPlane) base.PLANE = planeStub(rec, cfg);
  for (const name of FORBIDDEN_BINDINGS) base[name] = tripwire(rec, name);
  return new Proxy(base, {
    get(target, prop) { if (typeof prop === "string") rec.envKeys.add(prop); return target[prop]; },
    has(target, prop) { if (typeof prop === "string") rec.envKeys.add(prop); return prop in target; },
    ownKeys(target) { rec.envKeys.add("(enumerated)"); return Reflect.ownKeys(target); },
  });
}

/** The model API as it answers: a sub-session queries once through its one plane tool (at `SUBSESSION_LIMIT`, so its
 *  reads are told from the parent's) and then reports an absence; the parent answers the judge tool it is asked for
 *  with an empty judgement, which carries the state on. */
export const SUBSESSION_LIMIT = 5;
function modelAnswer(body) {
  const names = (body.tools || []).map((x) => x.name);
  /* R54: the ask's two conversations. Reading: a read outside ASK_OPS (refused here, R55), one inside, then done. */
  if (names.includes("done_reading")) {
    const results = body.messages.filter((m) => Array.isArray(m.content) && m.content.some((b) => b.type === "tool_result")).length;
    if (results === 0) return { content: [{ type: "tool_use", id: "a0", name: "read", input: { op: "sources", args: {} } }] };
    if (results === 1) return { content: [{ type: "tool_use", id: "a1", name: "read", input: { op: "search", args: { q: "minutes" } } }] };
    return { content: [{ type: "tool_use", id: "a2", name: "done_reading", input: { question_as_read: "who held the seat" } }] };
  }
  if (names.includes("answer"))
    return { content: [{ type: "tool_use", id: "a3", name: "answer", input: { question_as_read: "who held the seat",
      clarifying: null, summary: "not held", sentences: [], label: "machine work" } }] };
  const last = body.messages[body.messages.length - 1];
  /* R61: a conversation opens with its facts as `read_facts`' result (ids `facts_…`); that is not a turn the model took. */
  const answered = Array.isArray(last?.content)
    && last.content.some((b) => b.type === "tool_result" && !String(b.tool_use_id).startsWith("facts_"));
  if (names.includes("report") && !answered)
    return { content: [{ type: "tool_use", id: "q", name: "meaningrows", input: { rows: "leg", q: "", limit: SUBSESSION_LIMIT } }] };
  if (names.includes("report"))
    return { content: [{ type: "tool_use", id: "r", name: "report", input: { state: "LOOKED_ABSENT", summary: "nothing" } }] };
  const prompt = [...body.messages].reverse().map((m) => (m.role !== "user" ? null : typeof m.content === "string" ? { content: m.content } : Array.isArray(m.content) && m.content.find((c) => c.type === "text") ? { content: m.content.filter((c) => c.type === "text").map((c) => c.text).join("") } : null)).find((m) => m && /judge_/.test(m.content));
  const step = (/Answer by calling judge_([a-z]+)/.exec(prompt ? prompt.content : "") || [])[1] || "";
  return { content: [{ type: "tool_use", id: "j", name: `judge_${step}`, input: {} }] };
}

async function withGlobalFetch(rec, fn) {
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : {};
    rec.globalFetches.push({ url: String(url), key: init?.headers?.["x-api-key"] ?? null });
    const a = modelAnswer(body);
    return Response.json({ id: "msg", type: "message", role: "assistant", content: a.content,
                           stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } });
  };
  try { return await fn(); } finally { globalThis.fetch = saved; }
}

async function ask(rec, cfg, path, init, vars) {
  const res = await worker.fetch(new Request(`http://agent-worker/${path}`, init), envFor(rec, cfg, vars));
  const text = await res.text();
  let out = null; try { out = JSON.parse(text); } catch { out = null; }
  rec.answers.push({ path, status: res.status, out, text });
  return { status: res.status, out };
}
const post = (body) => ({ method: "POST", body: typeof body === "string" ? body : JSON.stringify(withAccount(body)) });
const postAsIs = (body) => ({ method: "POST", body: JSON.stringify(body) });
export const GRANT = "aig-inprocess-grant-never-echoed";

/** THE DRIVES, each recorded on its own and together. `drives` maps a name to its recording. */
export async function driveMember() {
  const drives = {};

  /* 1 · SUPPLIED, mode check: every row of CONTROL_FLOW that calls the plane. */
  drives.supplied = recorder();
  await withGlobalFetch(drives.supplied, () => ask(drives.supplied, { mode: "check" }, "run", post({
    run_id: "run-421", store: "scratch", credential: AIK,
    judgements: [
      { targets: [{ level: "internet", url: "https://example.org/minutes" }] },
      { reports: [{ level: "document", state: "PRESENT", observed_at: "log:1", citations: [{ address: "bundle:cited" }] },
                  { level: "content", state: "LOOKED_ABSENT", observed_at: "log:2" }] },
      { candidates: [{ kind: "basis-version", name: "refused-once", description: "TBD" }] },
      {},
      { submission: { kind: "basis-version", name: "refused-once", description: "what changed and why, in full" } },
    ] })));

  /* 2 · MODEL: an account resolves and no judgements are supplied, so turns run (R40) under the pack (R48). */
  drives.model = recorder();
  await withGlobalFetch(drives.model, () => ask(drives.model, { mode: "check" }, "run", post({
    run_id: "run-421m", store: "scratch", credential: AIK,
    account: { kind: "apikey", level: "member", secret: CLAUDE_TOKEN, member: MEMBER } })));

  /* 3 · PLAN: deployed in this process only, by the edit R42 names, and restored whatever happens. */
  drives.plan = recorder();
  const was = MODES.plan.deployed;
  MODES.plan.deployed = true;
  try {
    await withGlobalFetch(drives.plan, () => ask(drives.plan, { mode: "plan" }, "run", post({
      run_id: "run-421p", store: "scratch", credential: AIK,
      judgements: [{ candidates: [{ summary: "Ask the clerk for the minutes", category: "awareness",
                                    subjects: [SUBJECTS[0]], why: "the record is silent on them" }] }] })));
  } finally { MODES.plan.deployed = was; }

  /* 4 · A SECOND credential, used alone: what reaches the plane is the credential handed, whichever it is. */
  drives.second = recorder();
  await withGlobalFetch(drives.second, () => ask(drives.second, { mode: "check" }, "run", post({
    run_id: "run-421s", store: "bio", credential: AIK_SECOND, judgements: [] })));

  /* 5 · Everything that answers before any plane call, and the two other routes. */
  drives.edges = recorder();
  await withGlobalFetch(drives.edges, async () => {
    const e = drives.edges;
    await ask(e, { mode: "check", noPlane: true }, "run", post({ run_id: "r", store: "scratch", credential: AIK }));
    await ask(e, { mode: "check" }, "run", post("{{{"));
    await ask(e, { mode: "check" }, "run", post({ store: "scratch", credential: AIK }));
    await ask(e, { mode: "check" }, "run", post({ run_id: "r", credential: AIK }));
    await ask(e, { mode: "check" }, "run", post({ run_id: "r", store: "biosmoke", credential: AIK }));
    await ask(e, { mode: "check" }, "run", post({ run_id: "r", store: "scratch", credential: "hunter2" }));
    await ask(e, { mode: "check" }, "run", post({ run_id: "r", store: "scratch", credential: AIK, turns: 400 }));
    await ask(e, { mode: "check" }, "run", post({ run_id: "r", store: "scratch", credential: AIK, turns: 41 }),
              { MAX_TURNS_PER_SEGMENT: "40" });
    await ask(e, { mode: "check" }, "version", { method: "GET" });
    await ask(e, { mode: "check" }, "nope", { method: "GET" });
  });

  /* 6 · R54: AN ASK, under its grant and the member's own account; kept apart from `all`, because an ask's reach is not
     PLANE_OPS (R37, R55). */
  drives.ask = recorder();
  await withGlobalFetch(drives.ask, () => ask(drives.ask, { mode: "check", ask: true }, "ask", postAsIs({
    question: "who held the seat in March?", grant: GRANT,
    account: { kind: "apikey", level: "member", secret: CLAUDE_TOKEN, member: MEMBER } })));

  const all = recorder();
  for (const [name, r] of Object.entries(drives)) {
    if (name === "ask") continue;
    r.envKeys.forEach((k) => all.envKeys.add(k));
    r.planeProps.forEach((k) => all.planeProps.add(k));
    all.forbiddenTouched.push(...r.forbiddenTouched);
    all.planeCalls.push(...r.planeCalls);
    all.globalFetches.push(...r.globalFetches);
    all.answers.push(...r.answers);
  }
  return { drives, all, declared: Object.keys(PLANE_OPS), declaredAsk: [...ASK_OPS, ...Object.keys(ASK_PLANE_OPS)] };
}
