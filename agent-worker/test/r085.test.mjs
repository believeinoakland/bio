/* R085-8 (K3477; WALK-085 F2) — R91, a segment outlives its caller and reports its end; R92, a run's tick entries and its
 * sub-agents' reports reach the log.
 *
 * R92 is driven in this process over a plane stub whose `op=airuntick` judges every entry with the plane's OWN
 * `checkObservation` (run-rules' re-export of observation-log's, the one predicate `#aiRunAppend` → `observe` applies),
 * appending what it admits and refusing the rest per entry, as ai-runs does: the plane's real append shape. The model is a
 * stub that writes prose where the tools offer `condition`, as a real model did on biosmoke8. `harness.test.mjs` REC100-3
 * drives the step entries through the real plane itself.
 *
 * R91 is driven in workerd (Miniflare) with this member's own `SegmentDriver` bound as `SEGMENTS` and a recording fake
 * plane: the caller takes the 202 and goes away, and the plane still sees the segment's ticks and its `segment_end`. */
import "../../bio-plane/test/sandbox.mjs";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import worker from "../src/index.mjs";
import { SEGMENT_END_BY } from "../src/ops.mjs";
import { MEMBER, ACCOUNT, withAccount } from "./account.mjs";
import { checkObservation } from "../../bio-plane/src/run-rules/index.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass += 1; else fail += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`);
};

const AIK = "aik-" + "c".repeat(64);
const PACK_VERSION = "investigative-session@r085+0000000000000000";
const PACK = { id: "investigative-session", edition: "r085", version: PACK_VERSION,
               resident: { objective: { text: "find what the record holds" }, disclosable: [] }, disclosed: {} };
const WIDE = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
              { bound: "wallclock", allowed: 500000 }, { bound: "runtime", allowed: 5000 }];
const FREE = "nothing was found and the source answered slowly";

/* ============================================================== R92, in this process */

/** The plane stub. `tick` decides how `op=airuntick` answers: `"real"` judges each entry with the plane's own
 *  `checkObservation` (authority `run`, as `#aiRunAppend` passes it); `"refuseEntries"` refuses every entry per entry;
 *  `"refuseWhole"` refuses the whole tick as ai-runs' gates do (`ticked: false` with its code, no `ok`). */
function planeStub(rec, { tick = "real", payer = MEMBER, throwAt = null } = {}) {
  const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "r085" });
  return { fetch: async (url, init) => {
    const u = new URL(url);
    const op = u.searchParams.get("op") || "";
    const body = init && typeof init.body === "string" ? JSON.parse(init.body) : null;
    rec.calls.push({ op, body });
    /* R91: an answer this member cannot read without throwing, once the segment has started (its first spawn). */
    if (op === throwAt) return { status: 200, json: async () => ({ ok: true, get result() { throw new Error("boom"); } }) };
    switch (op) {
      case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
      case "airun": return ok({ run: u.searchParams.get("run"), found: true, session: {
        id: u.searchParams.get("run"), mode: "check", status: "running", context: { type: "inquiry", id: "INQ-085" },
        max_passes: 1, principal: { plane: "member:ruth", claude: payer, ref: payer, skill: PACK_VERSION },
        state: null, budget: WIDE.map((b) => ({ ...b, consumed: 0, unit: null })) } });
      case "airunlog": return ok({ run: u.searchParams.get("run"), found: true, entries: [], limit: 200, truncated: false });
      case "agentpack": return Response.json({ ok: true, fences: [], pack: PACK, store: "scratch", tokenClass: "ai" });
      case "airunspawn": return ok({ found: true, half: "search", payload: { run: u.searchParams.get("run"),
        context: { type: "inquiry", id: "INQ-085" }, mode: "check", skill: PACK_VERSION, standard_pair: null } });
      case "meaningrows": return ok({ ok: true, arm: "leg", rows: [], count: 0 });
      case "basisversions": return ok({ id: u.searchParams.get("id"), versions: [], limit: 50, truncated: false });
      case "search": return ok({ hits: [] });
      case "versionchain": return ok({ address_norm: null, total: 0, truncated: false, versions: [] });
      case "suggest": return ok({ wrote: true });
      case "airuntick": {
        if (tick === "refuseWhole")
          return ok({ run: body.run, ticked: false, found: true, status: "running", code: "AI_RUN_NOT_PRINCIPAL",
                      check: "C-22.12", note: "Nothing was appended and no budget was spent" });
        const refused = [];
        let appended = 0;
        for (const e of Array.isArray(body?.log) ? body.log : []) {
          const bad = tick === "refuseEntries"
            ? { ok: false, code: "AI_LOG_STATE_UNKNOWN", check: "C-22.1" }
            : checkObservation({ authority_kind: "run", authority: body.run, actor_class: "machine",
                                 level: e.level || "document", subject_kind: "unstated", subject: e.subject,
                                 state: e.state, governed: e.governed === true, condition: e.condition,
                                 bound: e.bound, detail: e.detail, terminal: false });
          if (bad) refused.push(bad); else { appended += 1; rec.landed.push(e); }
        }
        return ok({ run: body.run, found: true, ticked: true, status: "running", appended, refused });
      }
      case "airunclose": return ok({ terminated: true, bound: body?.bound ?? null });
      default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
    }
  } };
}

/** The model as a real one answered on biosmoke8: prose where the tools offer `condition`. A sub-session queries once,
 *  then reports an absence with a free condition; the parent's `plan` judgement states a look with one too. */
function modelAnswer(body) {
  const names = (body.tools || []).map((x) => x.name);
  const last = body.messages[body.messages.length - 1];
  const answered = Array.isArray(last?.content)
    && last.content.some((b) => b.type === "tool_result" && !String(b.tool_use_id).startsWith("facts_"));
  if (names.includes("report") && !answered)
    return [{ type: "tool_use", id: "q", name: "meaningrows", input: { rows: "leg", q: "", limit: 5 } }];
  if (names.includes("report"))
    return [{ type: "tool_use", id: "r", name: "report", input: { state: "LOOKED_ABSENT", summary: "nothing at this level",
                                                                 condition: FREE } }];
  const prompt = [...body.messages].reverse().map((m) => (m.role !== "user" ? "" : typeof m.content === "string"
    ? m.content : (Array.isArray(m.content) ? m.content.filter((c) => c.type === "text").map((c) => c.text).join("") : "")))
    .find((c) => /judge_/.test(c)) || "";
  const step = (/Answer by calling judge_([a-z]+)/.exec(prompt) || [])[1] || "";
  const input = step === "plan" ? { level: "document", observed: "LOOKED_INDETERMINATE", condition: FREE } : {};
  return [{ type: "tool_use", id: "j", name: `judge_${step}`, input }];
}

async function modelRun(planeCfg, answer = modelAnswer) {
  const rec = { calls: [], landed: [], requests: [] };
  const saved = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const sent = JSON.parse(init.body);
    rec.requests.push(sent);
    return Response.json({ id: "msg", type: "message", role: "assistant",
      content: answer(sent), stop_reason: "tool_use", usage: { input_tokens: 1, output_tokens: 1 } });
  };
  try {
    const res = await worker.fetch(new Request("http://agent-worker/run", { method: "POST", body: JSON.stringify({
      run_id: "RUN-r085", store: "scratch", credential: AIK, account: ACCOUNT }) }),
      { VERSION: "r085", PLANE: planeStub(rec, planeCfg) });
    return { status: res.status, out: await res.json(), rec };
  } finally { globalThis.fetch = saved; }
}

console.log("\n--- R92 · a check run's tick entries and its sub-agents' reports reach the log ---");
{
  /* THE CAUSE, at the plane's own predicate: the entries this member used to send. */
  const raw = { authority_kind: "run", authority: "RUN-r085", actor_class: "machine", level: "meaning",
                subject_kind: "unstated", subject: "sub-session meaning -> report", state: "LOOKED_ABSENT",
                governed: false, condition: FREE, detail: "nothing at this level", terminal: false };
  t("R92 (the cause): the entry a model's free condition made is refused by the plane's own check, C-22.4",
    [checkObservation(raw)?.code, checkObservation(raw)?.check], ["AI_RUN_CONDITION_UNKNOWN", "C-22.4"]);
  t("R92 (the cause): so is a governed look stating a definitive state, C-22.2",
    checkObservation({ ...raw, condition: null, governed: true })?.code, "AI_LOG_GOVERNED_ABSENCE");

  const { status, out, rec } = await modelRun({ tick: "real" });
  const levelsLooked = out.fanout?.levels?.length ?? 0;
  t("R92: a check run at the plane's append shape completes", [status, out.ok, out.judgement_source], [200, true, "model"]);
  t("R92: its tick entries are appended — logged > 0, none refused, and logged is what the plane took",
    [out.logged > 0, out.log_refused, out.logged], [true, [], rec.landed.length]);
  t("R92: every sub-agent report is located (observed_at log:<n>) and taken; none refused REPORT_UNLOCATED",
    [out.reports_taken, (out.reports_refused || []).filter((r) => r.code === "REPORT_UNLOCATED").length],
    [levelsLooked, 0]);
  t("R92: the run passed compose: the table composed the level-empty candidates the located absences earn",
    out.trace.some((x) => x.step === "compose" && /4 level\(s\) observed EMPTY/.test(x.note || "")), true);
  const sub = rec.landed.filter((e) => /^sub-session /.test(e.subject));
  t("R92: each entry is in the record's words: no condition outside its vocabulary, and the model's words in detail",
    [sub.length, sub.every((e) => e.condition == null && e.detail.includes(FREE)),
     rec.landed.filter((e) => e.condition != null).length], [levelsLooked, true, 0]);

  const refusedPer = await modelRun({ tick: "refuseEntries" });
  t("R92 (control): a report whose look the log refused is still refused REPORT_UNLOCATED, at every level",
    (refusedPer.out.reports_refused || []).filter((r) => r.code === "REPORT_UNLOCATED").length, levelsLooked);
  const refusedWhole = await modelRun({ tick: "refuseWhole" });
  t("R92 (control): so is one whose tick the plane refused whole (ticked: false with its code): never read as landed",
    [(refusedWhole.out.reports_refused || []).filter((r) => r.code === "REPORT_UNLOCATED").length,
     refusedWhole.out.logged, refusedWhole.out.refusals.some((r) => r.code === "AI_RUN_NOT_PRINCIPAL")],
    [levelsLooked, 0, true]);
}

/** R94: a sub-session that reports a summary of `long` characters on its first `report` and `short` on its next. */
const reportSizes = (long, short) => (body) => {
  const names = (body.tools || []).map((x) => x.name);
  if (!names.includes("report")) return modelAnswer(body);
  const reported = body.messages.filter((m) => m.role === "assistant" && Array.isArray(m.content)
    && m.content.some((b) => b.type === "tool_use" && b.name === "report")).length;
  return [{ type: "tool_use", id: `r${reported}`, name: "report",
            input: { state: "LOOKED_ABSENT", summary: "x".repeat(reported === 0 ? long : short) } }];
};

console.log("\n--- R94 · a refused report is handed back once to be rewritten ---");
{
  const levels = (await modelRun({ tick: "real" })).out.fanout?.levels?.length ?? 0;
  const fixed = await modelRun({ tick: "real" }, reportSizes(700, 300));
  t("R94: a sub-session whose first report carries a 700-character summary and whose second carries 300 is taken, at every level",
    [levels > 0, fixed.out.reports_taken, (fixed.out.reports_refused || []).length], [true, levels, 0]);
  t("R94: …each report is located and logged as before (observed_at is the log's, not the sub-session's)",
    [fixed.out.logged > 0, (fixed.out.reports_refused || []).filter((r) => r.code === "REPORT_UNLOCATED").length], [true, 0]);
  const over = await modelRun({ tick: "real" }, reportSizes(700, 700));
  t("R94 (control): two over-bound reports leave that level refused REPORT_OVER_BOUND, named and never read as an absence",
    [over.out.reports_taken, (over.out.reports_refused || []).filter((r) => r.code === "REPORT_OVER_BOUND").length],
    [0, levels]);
}

console.log("\n--- R95 · a check's sub-sessions call converse as sub-sessions ---");
{
  const run = await modelRun({ tick: "real" });
  const sub = run.rec.requests.filter((b) => (b.tools || []).some((x) => x.name === "report"));
  const rest = run.rec.requests.filter((b) => !(b.tools || []).some((x) => x.name === "report"));
  t("R95: each of a check's sub-sessions' requests names the sub-session model (claude-sonnet-5-5), at low effort",
    [sub.length > 0, sub.every((b) => b.model === "claude-sonnet-5-5"), sub.every((b) => b.output_config?.effort === "low")],
    [true, true, true]);
  t("R95 (control): the coordinating rows' requests do not: claude-opus-5-5 at medium effort",
    [rest.length > 0, rest.every((b) => b.model === "claude-opus-5-5"), rest.every((b) => b.output_config?.effort === "medium")],
    [true, true, true]);
}

console.log("\n--- R91 · an error ends the segment, and the plane is told ---");
{
  const { status, out, rec } = await modelRun({ throwAt: "airunspawn" });
  const ends = rec.calls.filter((c) => c.op === "airuntick" && c.body && "segment_end" in c.body);
  t("R91: a segment that throws after it started answers SEGMENT_THREW, its own refusal", [status, out.code],
    [500, "SEGMENT_THREW"]);
  t("R91: …and its last call is the one segment_end, `by` an error, not done, the error's code in `error`",
    [ends.length, rec.calls[rec.calls.length - 1] === ends[0], ends[0]?.body.segment_end],
    [1, true, { by: SEGMENT_END_BY.error, done: false, refusals: [], error: "SEGMENT_THREW" }]);
}

/* ============================================================== R91, in workerd */

console.log("\n--- R91 · a segment outlives its caller and reports its end ---");
const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const resolved = createRequire(fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url))).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();
const WORKER_SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* The fake plane: answers a check run's ops, records every call, and serves the record at `op=__calls`. */
const FAKE_PLANE = `
const CALLS = [];
let chained = false;
const ok = (result) => Response.json({ ok: true, result, store: "scratch", tokenClass: "ai", version: "r085" });
export default { async fetch(req, env) {
  const u = new URL(req.url);
  const op = u.searchParams.get("op") || "";
  if (op === "__calls") return Response.json(CALLS);
  const body = req.method === "POST" ? await req.json() : null;
  CALLS.push({ op, body });
  const run = u.searchParams.get("run") || body?.run;
  /* R93: the plane's continuation (ai-runs R84): from inside the first segment_end tick of RUN-r085-chain, the next
     segment of the run is dispatched to the member, and the status it answers is recorded. */
  if (op === "airuntick" && body?.segment_end && run === "RUN-r085-chain" && !chained) {
    chained = true;
    const next = await env.WORKER.fetch("http://agent-worker/run", { method: "POST", body: env.NEXT_BODY });
    CALLS.push({ op: "__continued", status: next.status, code: (await next.json()).code ?? null });
  }
  if (op === "airunspawn" && run === "RUN-r085-slow") await new Promise((r) => setTimeout(r, 1500));
  switch (op) {
    case "whoami": return ok({ tokenClass: "ai", session: false, member: null });
    case "airun": return ok({ run, found: true, session: { id: run, mode: "check", status: "running",
      context: { type: "inquiry", id: "INQ-085" }, max_passes: 1,
      principal: { plane: "member:ruth", claude: "member:ruth", ref: "member:ruth", skill: "s@1" }, state: null,
      budget: ${JSON.stringify(WIDE.map((b) => ({ ...b, consumed: 0, unit: null })))} } });
    case "airunlog": return ok({ run, found: true, entries: [], limit: 200, truncated: false });
    case "airunspawn": return ok({ found: true, half: "search", payload: { run, context: { type: "inquiry", id: "INQ-085" },
      mode: "check", skill: "s@1", standard_pair: null } });
    case "meaningrows": return ok({ ok: true, arm: "leg", rows: [], count: 0 });
    case "basisversions": return ok({ versions: [], limit: 50, truncated: false });
    case "airuntick": return ok({ run, found: true, ticked: true, status: "running", appended: (body?.log || []).length, refused: [] });
    case "airunclose": return ok({ terminated: true, bound: body?.bound ?? null });
    default: return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  }
} };`;

const mf = new Miniflare({ workers: [
  { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC_PATH, script: readFileSync(WORKER_SRC_PATH, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    bindings: { VERSION: "r085" }, serviceBindings: { PLANE: "fake-plane" },
    durableObjects: { SEGMENTS: { className: "SegmentDriver", useSQLite: true } } },
  { name: "fake-plane", modules: true, script: FAKE_PLANE, compatibilityDate: "2026-07-01",
    serviceBindings: { WORKER: "agent-worker" },
    bindings: { NEXT_BODY: JSON.stringify(withAccount({ run_id: "RUN-r085-chain", store: "scratch", credential: AIK, max_steps: 2 })) } },
] });
try {
  const plane = await mf.getWorker("fake-plane");
  const calls = async () => (await plane.fetch("http://plane/?op=__calls")).json();
  const runOp = (body) => mf.dispatchFetch("http://agent-worker/run",
    { method: "POST", body: JSON.stringify(withAccount(body)) });

  const res = await runOp({ run_id: "RUN-r085-durable", store: "scratch", credential: AIK });
  const accepted = await res.json();
  /* The caller is gone: nothing more is read from that request. The plane alone sees what follows. */
  let seen = [];
  for (let i = 0; i < 100 && !seen.some((c) => c.op === "airuntick" && c.body?.segment_end); i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    seen = await calls();
  }
  const ticks = seen.filter((c) => c.op === "airuntick");
  const end = ticks.find((c) => c.body?.segment_end)?.body.segment_end ?? null;
  t("R91: /run accepts the segment and answers at once, 202 {accepted: true, run_id}",
    [res.status, accepted], [202, { accepted: true, run_id: "RUN-r085-durable" }]);
  t("R91: with its caller gone, the segment still runs: the plane sees its step ticks and its close",
    [ticks.filter((c) => !c.body?.segment_end).length > 3, seen.some((c) => c.op === "airunclose")], [true, true]);
  t("R91: and, last, one airuntick carrying segment_end {by, done, refusals}: the table's close, done",
    [ticks.filter((c) => c.body?.segment_end).length, ticks[ticks.length - 1]?.body?.segment_end ? true : false, end],
    [1, true, { by: SEGMENT_END_BY.table, done: true, refusals: [] }]);
  t("R91: a segment ending done carries no `error`", "error" in (end || {}), false);
  t("R91: the segment_end tick carries no entry, no spend and no secret",
    [Object.keys(ticks[ticks.length - 1]?.body || {}).sort(), JSON.stringify(ticks).includes(ACCOUNT.secret)],
    [["run", "segment_end"], false]);

  /* A segment that stops on its own bound (here `max_steps`) while the run goes on: `by` null, not done. */
  const n0 = (await calls()).length;
  const short = await runOp({ run_id: "RUN-r085-short", store: "scratch", credential: AIK, max_steps: 2 });
  let mine = [];
  for (let i = 0; i < 100 && !mine.some((c) => c.body?.segment_end); i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    mine = (await calls()).slice(n0).filter((c) => c.op === "airuntick");
  }
  t("R91: a segment stopped on its own bound (max_steps) is accepted and ends `by` null, not done, with no error",
    [short.status, mine.find((c) => c.body?.segment_end)?.body.segment_end],
    [202, { by: null, done: false, refusals: [] }]);

  /* Control: refused before the segment starts — answered as today, never 202, and no segment_end is sent. */
  const before = (await calls()).length;
  const refused = await runOp({ run_id: "RUN-r085-other", store: "scratch", credential: AIK,
    account: { ...ACCOUNT, member: "member:sam" }, judgements: [] });
  const after = (await calls()).slice(before);
  t("R91 (control): a segment refused before starting answers its refusal, not 202 (another member's account)",
    [refused.status, (await refused.json()).code], [409, "RUN_NAMES_A_DIFFERENT_PAYER"]);
  t("R91 (control): …and nothing was written for it: no tick, no segment_end",
    after.filter((c) => c.op === "airuntick").length, 0);
  const bad = await runOp({ run_id: "RUN-r085-bad", store: "scratch", credential: "hunter2" });
  t("R91 (control): a body refused before any plane call answers as today", [bad.status, (await bad.json()).code],
    [400, "BAD_CREDENTIAL_SHAPE"]);

  /* R93: the segment is marked not running before its segment_end tick is sent, so the continuation the plane dispatches
     from inside that tick is accepted. */
  const n1 = (await calls()).length;
  const first = await runOp({ run_id: "RUN-r085-chain", store: "scratch", credential: AIK, max_steps: 2 });
  let chain = [];
  for (let i = 0; i < 100 && !chain.some((c) => c.op === "__continued"); i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    chain = (await calls()).slice(n1);
  }
  t("R93: the first segment is accepted, and the segment the plane dispatches from inside its segment_end tick is accepted too (202)",
    [first.status, chain.find((c) => c.op === "__continued")?.status, chain.find((c) => c.op === "__continued")?.code],
    [202, 202, null]);
  /* The continuation then runs: a second segment_end follows (the chain is dispatched once). */
  for (let i = 0; i < 100 && chain.filter((c) => c.body?.segment_end).length < 2; i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    chain = (await calls()).slice(n1);
  }
  t("R93: …and the dispatched segment runs to its own segment_end", chain.filter((c) => c.body?.segment_end).length, 2);
  /* Control: a /run while the run's segment is still running is refused 409 SEGMENT_RUNNING. */
  const slow1 = await runOp({ run_id: "RUN-r085-slow", store: "scratch", credential: AIK });
  const slow2 = await runOp({ run_id: "RUN-r085-slow", store: "scratch", credential: AIK });
  t("R93 (control): a /run while a segment of the run is still running is refused 409 SEGMENT_RUNNING",
    [slow1.status, slow2.status, (await slow2.json()).code], [202, 409, "SEGMENT_RUNNING"]);
} finally {
  await mf.dispose();
}

console.log(`\nr085: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
