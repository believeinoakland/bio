/* A test shell for `agent-steps` (R43): the least a caller must be to drive `driveHarness`. NOT a `.test.mjs`: a fixture
 * the suites share. It answers `POST /run` from a body the way the Worker shell's wire does (the fields the suites read,
 * under the wire's names), so a suite moved from `agent-worker` drives `driveHarness` through `fetch(request, env)`
 * unchanged but for its import. It imports nothing of `agent-worker` (P4). The suites that assert the shell's own wire
 * (R28's answer in full, the body checks, the cascade) stay in `agent-worker`; its sentences are not copied here (K3810):
 * the host's refusals carry codes and the facts the shell hands in, and no prose. */
import { driveHarness, modelHalf, MAX_STEPS, SEGMENT_END_BY } from "../src/index.mjs";
import { segmentMeter, DEFAULT_MAX_SEGMENT_BYTES } from "../../agent-model/src/model.mjs";

const PLANE_ORIGIN = "http://plane";
export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
const refusal = (code, detail, status, extra) => json({ ok: false, reason: code, code, detail, worker: "test-shell", ...(extra || {}) }, status);

export async function askPlane(env, op, credential, store, query = null, body = null) {
  let url = `${PLANE_ORIGIN}/?op=${op}${store == null ? "" : `&store=${encodeURIComponent(store)}`}`;
  for (const [k, v] of Object.entries(query || {})) if (v != null && v !== "") url += `&${k}=${encodeURIComponent(String(v))}`;
  const headers = credential ? { authorization: `Bearer ${credential}` } : {};
  let res;
  try {
    res = await env.PLANE.fetch(url, body == null ? { headers } : { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch (e) { return { reached: false, detail: String((e && e.message) || e).slice(0, 200) }; }
  let parsed = null;
  try { parsed = await res.json(); } catch { parsed = null; }
  if (parsed == null) return { reached: false, detail: `unreadable answer ${res.status}` };
  return { reached: true, status: res.status, body: parsed };
}

/** The host (R43): the six functions, exactly. */
export const HOST = Object.freeze({
  askPlane, refusal,
  planeSilent: (asked) => refusal("PLANE_SILENT", "plane silent", 502, { detail_from_binding: asked.detail }),
  planeRefused: (runId, store, asked) => json({ ok: false, reason: "PLANE_REFUSED", code: "PLANE_REFUSED", worker: "test-shell", run_id: runId, store,
    detail: "plane refused", plane_status: asked.status, plane: asked.body }, 403),
  modelSilent: (silent, runId) => refusal("MODEL_SILENT", "model silent", 502, { run_id: runId, detail_from_model: silent?.detail ?? null }),
  modelRefused: (refused, runId) => refusal("MODEL_REFUSED", "model refused", 502, { run_id: runId, model_status: refused?.status ?? null,
    model_error: refused?.type ?? null, model_message: refused?.message ?? null }),
});

const referenceOf = (account) => (account.kind === "signin" ? { kind: "signin", member: account.member, secret: account.secret }
                                                              : { kind: "apikey", key: account.secret });
const refusalCodes = (list) => [...new Set((list || []).map((r) => r && (r.code ?? r.reason)).filter((c) => typeof c === "string" && c))];

/** One segment over `driveHarness` with `host`, answered under the wire's names (test fixture; not the shell's R28). */
export async function runSegment(host, env, body, { runner = null } = {}) {
  const store = body.store, runId = body.run_id, credential = body.credential, account = body.account ?? null;
  const bound = Number(env.MAX_TURNS_PER_SEGMENT) > 0 ? Number(env.MAX_TURNS_PER_SEGMENT) : 120;
  const requested = body.turns == null ? bound : Number(body.turns);
  const bytesBound = Number(env.MAX_SEGMENT_BYTES) > 0 ? Number(env.MAX_SEGMENT_BYTES) : DEFAULT_MAX_SEGMENT_BYTES;
  const meter = segmentMeter({ turnsBound: requested, bytesBound });
  const modelMode = !Array.isArray(body.judgements);
  const model = modelMode ? modelHalf({ reference: referenceOf(account), runner, meter, suggestions: account?.suggestions, traced: {} }) : null;
  const progress = { started: false };
  const drive = await driveHarness(host, env, {
    runId, store, credential, account, model, judgements: Array.isArray(body.judgements) ? body.judgements : [],
    maxSteps: Number(body.max_steps) > 0 ? Math.min(Number(body.max_steps), MAX_STEPS) : MAX_STEPS, deadline: null, progress,
  });
  if (drive.refusal) return drive.refusal;
  const end = { ...drive.segmentEnd, refusals: refusalCodes(drive.refusals) };
  if (end) await askPlane(env, "airuntick", credential, store, null, { run: runId, segment_end: end }).catch(() => null);
  return json({
    ok: true, run_id: runId, store, stage: "harness", turns_run: meter.turns, judgement_source: modelMode ? "model" : "body",
    mode: drive.mode, trace: drive.trace, passes: drive.passes, ended: drive.ended, logged: drive.logged,
    log_refused: drive.logRefused, present_unbacked: drive.presentUnbacked, submitted: drive.submitted, refusals: drive.refusals,
    adjusted: drive.adjusted, verbatim_resubmits: drive.verbatimResubmits, resumed_from: drive.resumedFrom, target: drive.target,
    fanout: drive.fanout, reports_taken: drive.reportsTaken, reports_refused: drive.reportsRefused,
    citations_reread: drive.citationsReread, holdings: drive.holdings, budget: drive.budget,
    segment: { turns_requested: requested, turns_run: meter.turns, bytes_sent: meter.bytes, bytes_bound: bytesBound, stopped: drive.segmentStopped ?? null },
  });
}

export { SEGMENT_END_BY };
export default { fetch: async (req, env) => runSegment(HOST, env, await req.json()) };
