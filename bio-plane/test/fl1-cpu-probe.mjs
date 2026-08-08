#!/usr/bin/env node
/* FL-1 / D-218 — CAN A FLEET-MEMBER WORKER HOLD A WHOLE INVESTIGATIVE RUN
 * INSIDE THE PAID CPU CEILING?  A DEPLOYED probe, read off the PLATFORM.
 * NOT part of the battery: it deploys throwaway Workers and deletes them.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE CONTROL THAT DEFINES THIS FILE
 * ─────────────────────────────────────────────────────────────────────────
 * `src/cpu.mjs` records the fabrication: Cloudflare FREEZES Date.now() during
 * synchronous execution as a timing-attack defence, so a Worker cannot time its
 * own compute (D-56). Any millisecond a Worker reports about itself is invented.
 *
 * So this probe NEVER accepts a number the Worker produced about itself. Every
 * cpu figure it records must arrive through `recordCpuMs()`, which THROWS unless
 * the reading's provenance is on the platform allowlist. The `selftimed` arm
 * exists to be REFUSED by that gate, and to be shown lying next to the platform's
 * reading of the same script.
 *
 * INSTRUMENT (primary): Cloudflare GraphQL Analytics API,
 *   viewer.accounts.workersInvocationsAdaptive { sum { cpuTimeUs requests
 *   subrequests errors } quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50
 *   memoryUsageBytesP50 } dimensions { scriptName usageModel } }
 * — the platform's OWN observation of what it billed, outside the isolate.
 *
 * WHAT THE INSTRUMENT CANNOT SEE, stated because every good measurement here
 * states its own limits:
 *   · IT CANNOT NAME A FRESH SCRIPT. Measured 2026-08-08: for a script created
 *     minutes ago the surface returns BOTH `scriptName` AND `scriptTag` as the
 *     literal "__unknown__", and an exact `scriptName` filter therefore matches
 *     nothing. Attribution here is by DISJOINT TIME WINDOW plus a request count
 *     unique to each arm, and an arm whose row cannot be identified unambiguously
 *     reports NO NUMBER.
 *   · It is aggregated per script and per window, never per invocation, so what
 *     is reported is a MEAN over the arm's invocations plus the platform's own
 *     quantiles.
 *   · `cpuTimeUs` is what Cloudflare says it billed. It is not independently
 *     verifiable by us; it is, however, the surface the bill is computed from,
 *     which is what D-218 actually asks about.
 *   · Analytics ingestion LAGS. The probe polls, and reports NO NUMBER rather
 *     than a stale zero if the surface never populates.
 *   · The "API" being waited on is our own responder Worker, not Anthropic. It
 *     reproduces the SHAPE of a turn — a real network wait, a real response of a
 *     real size, parsed for real — not Anthropic's latency distribution. Claimed
 *     as such and no further.
 *
 * THE PAYLOADS ARE REAL. Two days before this ran, a probe reported a 97% saving
 * because its synthetic fixture omitted what the real source carried. The corpus
 * here is swept off the LIVE plane by fl1-real-payload-sweep.mjs, which THROWS if
 * the real ops do not answer or answer trivially. Run that first.
 *
 * SAFETY: account pinned; the three real script names are a hard guard; the
 * token is read from .env and never printed; every throwaway is deleted in a
 * finally and teardown is confirmed by re-listing. Nothing touches the plane
 * except the read-only sweep that produced the corpus.
 *
 * usage:  node bio-plane/test/fl1-real-payload-sweep.mjs --json fl1-corpus.json
 *         node bio-plane/test/fl1-cpu-probe.mjs fl1-corpus.json
 */
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { creds, gql, loadEnv } from "./fl1-billing-surface-check.mjs";
const loadEnvForStats = () => loadEnv();

const { tok: TOK, acct: ACCT } = creds();
const base = `https://api.cloudflare.com/client/v4/accounts/${ACCT}`;
const AUTH = { authorization: `Bearer ${TOK}` };
const PROBE = randomBytes(16).toString("hex");

const PROTECT = new Set(["biosmoke7", "civicos", "newgroup", "pdf-worker"]);
const RESPONDER = "fl1-responder";
const PLANCHECK = "fl1-plan-check";

/* ── THE FIVE SUBJECTS, each its own script so the platform's per-script
 * attribution is exact. Five subjects, five invocations each: an outcome that
 * costs nothing to produce is not evidence. ───────────────────────────────── */
let ARMS = [
  { name: "fl1-idle",    mode: "idle",   cfg: {}, times: 5, sig: { subPer: 0, wallMs: 25 },
    asks: "THE EMPTY CASE. What does an invocation that does nothing cost? Without this "
        + "floor, every other arm's number is unattributable." },
  { name: "fl1-wait",    mode: "wait",   cfg: { turns: 25, delayMs: 2000 }, times: 6, sig: { subPer: 25, wallMs: 50000 },
    asks: "DOES WAITING COST CPU? 25 real external subrequests, each held open 2 s by the "
        + "responder: ~50 s of wall time doing nothing. This is D-218's central claim under "
        + "test, and it is the arm that can falsify it." },
  { name: "fl1-agent",   mode: "agent",  cfg: { turns: 25, delayMs: 200 }, times: 7, sig: { subPer: 25, wallMs: 5100 },
    asks: "A RUN-SHAPED LOOP at 25 turns: real plane responses fetched, parsed, appended to a "
        + "growing transcript, and the whole transcript re-serialised and SENT every turn — "
        + "the quadratic a real agent loop actually pays." },
  { name: "fl1-agentx4", mode: "agent",  cfg: { turns: 100, delayMs: 100 }, times: 8, sig: { subPer: 100, wallMs: 10800 },
    asks: "THE CURVE. The same loop at 100 turns. If CPU is linear in turns the ceiling is a "
        + "long way off; if it is quadratic, FL-3's shape is decided by where it crosses." },
  { name: "fl1-burn",    mode: "burn",   cfg: { iterations: 40_000_000 }, times: 9, sig: { subPer: 0, wallMs: 1050 },
    asks: "CALIBRATION into the currency this project already measured in. 40,000,000 "
        + "reference iterations is exactly what op=cpuprobe fitted on Free (MEASUREMENTS, "
        + "2026-07-29). This converts that number into billed milliseconds." },
];

/* Not subjects — a refused control and a ceiling walk. */
const CONTROL   = { name: "fl1-selftimed", mode: "selftimed", cfg: { iterations: 20_000_000 }, times: 5, sig: { subPer: 0, wallMs: 550 } };
const SUBREQ    = { name: "fl1-subreq",    mode: "subreq",
  cfg: { max: 160, external: "https://cloudflare.com/cdn-cgi/trace" }, times: 4, sig: { subPer: 160, wallMs: 250 } };

/* ── THE CURVE SET (`--curve`). Added after the first full pass, because the
 * platform reported something this item did not set out to look for:
 * memoryUsageBytesP50 was 9.8 MB at 25 turns and 51.2 MB at 100, against a
 * 128 MB isolate — while CPU at 100 turns was still under 1% of the 30 s ceiling.
 * So the ceiling that decides FL-3 may be MEMORY rather than CPU, and where it
 * bites is worth finding the way every other ceiling in this file was found: BY
 * BEING REFUSED. A killed invocation reports nothing about itself (the isolate
 * dies, exactly as src/cpu.mjs describes), so the finding is the platform's row
 * plus what the client saw. */
const CURVE = [
  { name: "fl1-c50",  mode: "agent", cfg: { turns: 50,  delayMs: 40 }, times: 5,
    sig: { subPer: 50,  wallMs: 2200 }, asks: "curve point: 50 turns" },
  { name: "fl1-c200", mode: "agent", cfg: { turns: 200, delayMs: 20 }, times: 6,
    sig: { subPer: 200, wallMs: 8000 }, asks: "curve point: 200 turns" },
  { name: "fl1-c400", mode: "agent", cfg: { turns: 400, delayMs: 10 }, times: 7,
    sig: { subPer: 400, wallMs: 16000 }, asks: "curve point: 400 turns — expected at or past the "
        + "memory ceiling. If the runtime kills it, THAT is the measurement." },
];
if (process.argv.includes("--curve")) { ARMS.length = 0; ARMS.push(...CURVE); }

const ALL_NAMES = [RESPONDER, PLANCHECK, ...ARMS.map((a) => a.name), CONTROL.name, SUBREQ.name];
for (const n of ALL_NAMES) {
  if (PROTECT.has(n)) { console.error(`refuse: throwaway name ${n} collides with a real script`); process.exit(1); }
}

/* ─────────────────────────────────────────────────────────────────────────
 * THE PROVENANCE GATE — structural, not a convention
 * ───────────────────────────────────────────────────────────────────────── */
const PLATFORM_SOURCES = new Set(["graphql:workersInvocationsAdaptive"]);
export class FabricatedMeasurement extends Error {}

/** The ONLY way a cpu figure enters this probe's findings. A reading whose
 *  provenance is the Worker's own clock is refused as the fabrication cpu.mjs
 *  records — it is not downgraded, not caveated, not recorded with a warning. */
export function recordCpuMs(reading) {
  if (!reading || typeof reading !== "object") throw new FabricatedMeasurement("no reading");
  if (reading.provenance !== "platform-observed") {
    throw new FabricatedMeasurement(
      `REFUSED: provenance ${JSON.stringify(reading.provenance)} is not the platform's observed ` +
      `billing surface. A Worker cannot time itself (D-56, src/cpu.mjs); a millisecond it reports ` +
      `about its own compute is a fabrication, and this probe will not record one.`);
  }
  if (!PLATFORM_SOURCES.has(reading.source)) {
    throw new FabricatedMeasurement(`REFUSED: source ${JSON.stringify(reading.source)} is not an allowed instrument`);
  }
  if (!Number.isFinite(reading.cpu_ms)) throw new FabricatedMeasurement("REFUSED: cpu_ms is not a number");
  return { cpu_ms: reading.cpu_ms, source: reading.source, scriptName: reading.scriptName };
}

/* ─────────────────────────────────────────────────────────────────────────
 * The deployed sources
 * ───────────────────────────────────────────────────────────────────────── */

/** The responder stands in for the API a turn waits on. It holds the REAL plane
 *  responses swept off the live instance and hands one back per turn, after a
 *  real delay. It is deliberately dumb: whatever CPU it spends is ITS bill, on
 *  ITS script, and never lands on the subject's line. */
const responderSrc = `
const CORPUS = __CORPUS__;
export default { async fetch(request) {
  const u = new URL(request.url);
  const delay = Math.min(30000, Number(u.searchParams.get("delay") || "0"));
  const i = Number(u.searchParams.get("i") || "0") % CORPUS.length;
  if (request.body) await request.arrayBuffer();          // drain, so the caller really sends
  if (delay > 0) await new Promise((s) => setTimeout(s, delay));
  return new Response(CORPUS[i], { headers: { "content-type": "application/json" } });
} };`;

/** Every subject is THIS source under a different name, so no arm can differ by
 *  anything except its declared mode and config. */
const subjectSrc = `
/* burn() is copied VERBATIM from bio-plane/src/cpu.mjs so the calibration arm is
 * denominated in the same reference iterations MEASUREMENTS already records. */
function burn(iterations) {
  let x = 1;
  for (let i = 0; i < iterations; i++) x = (x * 1103515245 + 12345) % 2147483647;
  return x;
}
export default { async fetch(request, env) {
  if (request.headers.get("x-probe") !== env.PROBE) return new Response("no", { status: 404 });
  const cfg = JSON.parse(env.CFG), mode = env.MODE, RES = env.RESPONDER_URL;
  const t0 = Date.now();

  /* A PING answers without doing the arm's work, so the rollout gate can prove
   * this route serves WITHOUT spending the arm's CPU on the account and diluting
   * its own mean. The harness counts pings separately and checks the platform's
   * request count against the invocations it actually sent. */
  if (request.headers.get("x-ping") === "1") return json({ ping: true, mode });

  if (mode === "idle") {
    return json({ mode, note: "the empty case: the invocation floor" });
  }

  if (mode === "burn") {
    const x = burn(cfg.iterations);
    return json({ mode, iterations: cfg.iterations, checksum: x });
  }

  if (mode === "selftimed") {
    /* THE NEGATIVE CONTROL, and it is meant to be refused. It times itself with
     * Date.now() across synchronous compute — the exact move cpu.mjs records as
     * producing zeros — and labels its own provenance honestly so the harness's
     * gate can throw on it. */
    const a = Date.now(); const x = burn(cfg.iterations); const b = Date.now();
    return json({ mode, checksum: x, cpu_ms: b - a, provenance: "worker-self-clock",
      note: "self-timed across synchronous compute. If this reads 0 or near it while the "
          + "platform bills real milliseconds, the frozen clock is demonstrated rather than asserted." });
  }

  if (mode === "wait") {
    /* Real subrequests over the SERVICE BINDING, each genuinely held open for
     * cfg.delayMs by the responder. Bodies are NOT parsed: this arm isolates the
     * WAIT from the work, which is the half of D-218's claim that can falsify it. */
    let bytes = 0;
    for (let i = 0; i < cfg.turns; i++) {
      const r = await env.RESP.fetch("https://r.invalid/?delay=" + cfg.delayMs + "&i=0");
      bytes += (await r.arrayBuffer()).byteLength;
    }
    return json({ mode, turns: cfg.turns, bytes, wall_ms_client_visible: Date.now() - t0 });
  }

  if (mode === "agent") {
    /* The run-shaped loop. Each turn: serialise the WHOLE transcript and send it
     * (what an agent pays to re-send its context), wait on the response, parse it,
     * append it. The transcript therefore grows and the serialisation cost with it. */
    const messages = [];
    let sentBytes = 0, parsed = 0;
    for (let i = 0; i < cfg.turns; i++) {
      const body = JSON.stringify({ model: "probe", messages });
      sentBytes += body.length;
      const r = await env.RESP.fetch("https://r.invalid/?delay=" + cfg.delayMs + "&i=" + i,
        { method: "POST", body, headers: { "content-type": "application/json" } });
      const text = await r.text();
      /* If the responder is not serving JSON the arm must SAY so, not throw an
       * opaque 500 — on the first pass exactly that made four arms look like a
       * CPU story when they were a rollout story. */
      let obj; try { obj = JSON.parse(text); }
      catch { return json({ mode, aborted_at_turn: i, responder_status: r.status,
        reason: "RESPONDER_NOT_JSON", first_bytes: text.slice(0, 80) }, 200); }
      parsed += text.length;
      messages.push({ role: "assistant", content: [{ type: "tool_use", id: "t" + i, input: { i } }] });
      messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: "t" + i,
        content: JSON.stringify(obj) }] });          // real re-serialisation, as a real loop does
    }
    return json({ mode, turns: cfg.turns, sent_bytes: sentBytes, parsed_bytes: parsed,
      transcript_bytes: JSON.stringify(messages).length, wall_ms_client_visible: Date.now() - t0 });
  }

  if (mode === "subreq") {
    /* Walk the EXTERNAL subrequest ceiling by being refused, the way the 51 on
     * Free was found. This one must go to a genuinely OFF-ACCOUNT origin: the
     * service binding draws on the Cloudflare-services budget, not this one, and
     * a same-account workers.dev name is refused outright (1042). The target is
     * Cloudflare's own tiny diagnostic endpoint; the responses are discarded.
     * A NON-200 is not a ceiling — only a THROW is, so both are reported. */
    let n = 0, stopped = null, nonOk = 0;
    try {
      for (; n < cfg.max; n++) {
        const r = await fetch(cfg.external + "?i=" + n, { cache: "no-store" });
        if (!r.ok) nonOk++;
        await r.arrayBuffer();
      }
    } catch (e) { stopped = e && e.name ? e.name : "unknown"; }
    return json({ mode, completed: n, non_ok_responses: nonOk, stopped_by: stopped,
      target: cfg.external,
      reason: stopped ? "REFUSED_BY_RUNTIME" : "MAX_REACHED_WITHOUT_REFUSAL" });
  }

  return json({ error: "unknown mode" }, 400);
} };
function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
}`;

/* ─────────────────────────────────────────────────────────────────────────
 * REST plumbing
 * ───────────────────────────────────────────────────────────────────────── */
async function api(method, path, opt = {}) {
  const r = await fetch(base + path, { method, headers: { ...AUTH, ...(opt.headers || {}) }, body: opt.body });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, ok: r.ok, success: j?.success, result: j?.result, errors: j?.errors };
}
function form(source, meta) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}
async function del(name) {
  const d = await api("DELETE", `/workers/scripts/${name}?force=true`);
  return { name, status: d.status, success: d.success };
}
async function enableSubdomain(name, on) {
  return api("POST", `/workers/scripts/${name}/subdomain`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ enabled: on, previews_enabled: false }),
  });
}

/* ── the instrument ─────────────────────────────────────────────────────── */
/* ATTRIBUTION IS BY DISJOINT TIME WINDOW, and getting here cost three passes.
 * MEASURED PROPERTY OF THE INSTRUMENT (2026-08-08): for a Worker script created
 * minutes ago, workersInvocationsAdaptive returns BOTH `scriptName` AND
 * `scriptTag` as the literal "__unknown__" — the name has not propagated into
 * the analytics pipeline. Pass 1 filtered on `scriptName_in` and got rows back
 * with unusable names; pass 2 filtered on an exact `scriptName` and got NOTHING,
 * because the filter matches the same unresolved dimension. So neither handle
 * works, and a throwaway script cannot be attributed by NAME at all.
 *
 * What the surface DOES do correctly is separate one script's traffic from
 * another's into distinct rows, and honour a precise event-level `datetime`
 * filter. So each arm is invoked in a window of its own, and the arm's row is
 * the one whose request count equals the invocations this harness sent. When no
 * row matches that count, or more than one does, the arm reports NO NUMBER —
 * a guess dressed as attribution is exactly what FL-1 refuses. */
const Q_WINDOW = `query($a:String!,$from:Time!,$to:Time!){
  viewer { accounts(filter:{accountTag:$a}) {
    workersInvocationsAdaptive(limit:200, filter:{datetime_geq:$from, datetime_leq:$to}) {
      sum { cpuTimeUs requests subrequests errors wallTime responseBodySize }
      quantiles { cpuTimeP50 cpuTimeP99 wallTimeP50 durationP50 memoryUsageBytesP50 memoryUsageBytesP99 }
      dimensions { scriptName scriptTag usageModel status }
    } } } }`;

/** Rows in [from,to] that belong to a script this probe created. The account's
 *  REAL scripts resolve to their real names, so they are dropped by name; what
 *  is left as "__unknown__" is this probe's. */
const REAL_SCRIPTS = new Set(["biosmoke7", "civicos", "newgroup", "pdf-worker"]);
async function readWindow(fromISO, toISO) {
  const r = await gql(TOK, Q_WINDOW, { a: ACCT, from: fromISO, to: toISO });
  if (r.body?.errors) return { error: r.body.errors.map((e) => e.message) };
  const rows = r.body?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];
  return {
    mine: rows.filter((x) => !REAL_SCRIPTS.has(x.dimensions.scriptName)),
    theirs: rows.filter((x) => REAL_SCRIPTS.has(x.dimensions.scriptName)),
  };
}

/** Pick an arm's row out of a window.
 *
 *  THE DATASET SAMPLES — it is called workersInvocationsAdaptive for a reason,
 *  and pass 4 measured it doing so: six invocations of fl1-wait were reported as
 *  FOUR, while every other arm in the same run came back 1:1. So a rule of "the
 *  row whose request count equals what I sent" is wrong, and it rejected a real
 *  measurement. What sampling does NOT distort is the SHAPE of an invocation, so
 *  each arm declares a signature — subrequests per invocation and wall ms per
 *  invocation — and the row is the one that matches it. The count is then
 *  REPORTED (sent vs seen) rather than used as the handle.
 *
 *  If no row matches, or more than one does, the arm reports NO NUMBER. */
function attribute(mine, sent, sig) {
  const scored = mine.map((r) => {
    const req = r.sum.requests || 0;
    const subPer = req ? r.sum.subrequests / req : 0;
    const wallMsPer = req ? r.sum.wallTime / 1000 / req : 0;
    const subOk = Math.abs(subPer - sig.subPer) <= Math.max(1, sig.subPer * 0.15);
    const wallOk = sig.wallMs === null ? true
      : Math.abs(wallMsPer - sig.wallMs) <= Math.max(60, sig.wallMs * 0.5);
    return { r, req, subPer, wallMsPer, match: subOk && wallOk };
  });
  const hits = scored.filter((x) => x.match);
  if (hits.length !== 1) {
    return { ok: false, why: `signature {subreq/inv ${sig.subPer}, wall/inv ${sig.wallMs} ms} matched ` +
      `${hits.length} row(s) — candidates: ` +
      JSON.stringify(scored.map((x) => ({ req: x.req, subPer: +x.subPer.toFixed(1), wallMs: Math.round(x.wallMsPer) }))) };
  }
  const r = hits[0].r;
  return { ok: true, requests: r.sum.requests, cpuTimeUs: r.sum.cpuTimeUs,
           subrequests: r.sum.subrequests, errors: r.sum.errors, rows: [r],
           sampled: r.sum.requests !== sent };
}

/* D-190. TWO surfaces, because neither alone answers the question.
 *  · durableObjectsStorageGroups.max.storedBytes is ACCOUNT-WIDE (its dimensions
 *    carry only dates), so it cannot say how close any ONE object is to its own
 *    ceiling — and the ceiling D-190 is about is PER-OBJECT.
 *  · durableObjectsPeriodicGroups IS per-object (`objectId`, `name`) and carries
 *    exceededCpuErrors / exceededMemoryErrors — the platform stating whether this
 *    project's own Durable Objects have ever been killed at a limit. */
const Q_DO = `query($a:String!,$from:Date!,$to:Date!){
  viewer { accounts(filter:{accountTag:$a}) {
    durableObjectsStorageGroups(limit:100, filter:{date_geq:$from, date_leq:$to}) {
      max { storedBytes } dimensions { date } }
    durableObjectsPeriodicGroups(limit:200, filter:{date_geq:$from, date_leq:$to}) {
      sum { cpuTime rowsRead rowsWritten exceededCpuErrors exceededMemoryErrors fatalInternalErrors }
      dimensions { name objectId } } } } }`;

/* The PER-OBJECT storage figure the analytics surface does not carry is already
 * exposed by the plane itself: `stats()` returns `dbBytes`, read from workerd's
 * own `ctx.storage.sql.databaseSize` (src/store.mjs:11209). That is the runtime
 * reporting the object's size, not the Worker measuring itself, so it is not the
 * refused class. Two namespaces give a baseline and a loaded point. */
async function readDbBytes(env) {
  if (!env.BIO_INSTANCE || !env.BIO_ADMIN_TOKEN) return { unavailable: "no BIO_INSTANCE / BIO_ADMIN_TOKEN" };
  const out = {};
  for (const store of ["bio", "scratch"]) {
    try {
      const r = await fetch(`https://${env.BIO_INSTANCE}.believeinoakland.workers.dev/api/` +
        `?op=stats&store=${store}&token=${encodeURIComponent(env.BIO_ADMIN_TOKEN)}`, { cache: "no-store" });
      const j = await r.json();
      out[store] = j?.result
        ? { dbBytes: j.result.dbBytes, bundles: j.result.bundles, files: j.result.files,
            register: j.result.register, history: j.result.history,
            connections: j.result.connections, entities: j.result.entities,
            resolutions: j.result.resolutions }
        : { error: `HTTP ${r.status}` };
    } catch (e) { out[store] = { error: e.name }; }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
 * The run
 * ───────────────────────────────────────────────────────────────────────── */
const REPEATS = 5;
const findings = { date: new Date().toISOString().slice(0, 10), account: ACCT,
  instrument: "Cloudflare GraphQL Analytics API — workersInvocationsAdaptive (platform-observed billing surface)",
  arms: {}, controls: {}, limits_of_instrument: [] };
const deployed = new Set();

const corpusPath = process.argv[2];
if (!corpusPath) { console.error("usage: fl1-cpu-probe.mjs <corpus.json from fl1-real-payload-sweep.mjs>"); process.exit(2); }
const sweep = JSON.parse(readFileSync(corpusPath, "utf8"));
if (!Array.isArray(sweep.corpus) || sweep.corpus.length < 8) {
  console.error(`THROW: corpus has ${sweep.corpus?.length ?? 0} real bodies. The sweep's own floor was not met; ` +
    `building the probe on invented payloads is the failure this file exists to avoid.`);
  process.exit(3);
}
const CORPUS = sweep.corpus.map((c) => c.body);
const corpusBytes = CORPUS.reduce((a, b) => a + Buffer.byteLength(b), 0);
console.log(`corpus: ${CORPUS.length} REAL plane responses, ${corpusBytes} B total, ` +
  `median ${sweep.bytes.median} B, max ${sweep.bytes.max} B (swept ${sweep.date})`);
findings.corpus = { bodies: CORPUS.length, total_bytes: corpusBytes, median_bytes: sweep.bytes.median,
  max_bytes: sweep.bytes.max, swept: sweep.date, source: "live plane read-only ops" };

findings.probe_started = new Date().toISOString();

try {
  /* ARM 0 — re-confirm the PLAN by provoking the platform, today, rather than
   * inheriting 2026-08-04's reading. The ceiling under test is the PAID one. */
  console.log("\n== plan, re-confirmed by provocation ==");
  const plan = await api("PUT", `/workers/scripts/${PLANCHECK}`, {
    body: form("export default { async fetch(){ return new Response('ok'); } };",
      { main_module: "index.mjs", compatibility_date: "2026-07-01", limits: { cpu_ms: 50000 } }),
  });
  findings.plan = plan.success
    ? { plan: "Workers PAID", evidence: `HTTP ${plan.status}, limits.cpu_ms=50000 ACCEPTED`,
        limits_echoed: plan.result?.limits ?? null }
    : { plan: "Workers FREE", evidence: plan.errors };
  console.log(" ", JSON.stringify(findings.plan));
  if (plan.success) { deployed.add(PLANCHECK); await del(PLANCHECK); deployed.delete(PLANCHECK); }

  /* deploy the responder, with the REAL corpus */
  console.log("\n== deploy responder (real corpus) ==");
  const rs = await api("PUT", `/workers/scripts/${RESPONDER}`, {
    body: form(responderSrc.replace("__CORPUS__", JSON.stringify(CORPUS)),
      { main_module: "index.mjs", compatibility_date: "2026-07-01" }),
  });
  if (!rs.success) throw new Error("responder deploy failed: " + JSON.stringify(rs.errors));
  deployed.add(RESPONDER);
  await enableSubdomain(RESPONDER, true);
  const zone = (await api("GET", "/workers/subdomain")).result?.subdomain;
  const RES_URL = `https://${RESPONDER}.${zone}.workers.dev/`;
  console.log("  responder up");

  /* deploy every subject + the control + the ceiling walk */
  const toRun = [...ARMS, CONTROL, SUBREQ];
  console.log("\n== deploy subjects ==");
  findings.cpu_limit_requested = {};
  for (const a of toRun) {
    const meta = (limits) => ({ main_module: "index.mjs", compatibility_date: "2026-07-01",
      ...(limits ? { limits } : {}),
      bindings: [{ type: "plain_text", name: "PROBE", text: PROBE },
                 { type: "plain_text", name: "MODE", text: a.mode },
                 { type: "plain_text", name: "CFG", text: JSON.stringify(a.cfg) },
                 /* MEASURED 2026-08-08 and it forced this binding: a Worker CANNOT
                  * fetch another Worker on this account's own *.workers.dev name —
                  * the runtime answers 404 with `error code: 1042` in ~7 ms. The
                  * SERVICE BINDING is the route that works, which is also the route
                  * a real fleet member uses to reach the plane (I6). */
                 { type: "service", name: "RESP", service: RESPONDER },
                 { type: "plain_text", name: "RESPONDER_URL", text: RES_URL }] });
    /* Ask for the maximum documented CPU limit. If the platform refuses the value,
     * record WHAT IT SAID and fall back to the default — the refusal is itself a
     * measurement of where the ceiling can be set on this account. */
    let up = await api("PUT", `/workers/scripts/${a.name}`, { body: form(subjectSrc, meta({ cpu_ms: 300000 })) });
    if (!up.success) {
      findings.cpu_limit_requested[a.name] = { cpu_ms: 300000, accepted: false, service_said: up.errors };
      up = await api("PUT", `/workers/scripts/${a.name}`, { body: form(subjectSrc, meta(null)) });
    } else {
      findings.cpu_limit_requested[a.name] = { cpu_ms: 300000, accepted: true, echoed: up.result?.limits ?? null };
    }
    if (!up.success) throw new Error(`${a.name} deploy failed: ` + JSON.stringify(up.errors));
    deployed.add(a.name);
    await enableSubdomain(a.name, true);
    console.log(`  ${a.name} (${a.mode}) up` +
      (findings.cpu_limit_requested[a.name].accepted ? " [cpu_ms=300000 accepted]" : " [cpu_ms limit REFUSED, default]"));
  }

  const urlOf = (n) => `https://${n}.${zone}.workers.dev/`;
  const once = async (n, timeoutMs, ping) => {
    const t0 = Date.now();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const r = await fetch(urlOf(n), { headers: { "x-probe": PROBE, ...(ping ? { "x-ping": "1" } : {}) },
        cache: "no-store", signal: ac.signal });
      const t = await r.text();
      let j = null; try { j = JSON.parse(t); } catch {}
      return { status: r.status, body: j, text: j ? undefined : t.slice(0, 60),
               client_wall_ms: Date.now() - t0 };
    } catch (e) {
      return { status: 0, error: e.name, client_wall_ms: Date.now() - t0 };
    } finally { clearTimeout(timer); }
  };
  /* A 404 on a *.workers.dev name means the EDGE never reached the script, so no
   * invocation happened and retrying cannot double-count. MEASURED on pass 3: the
   * route FLAPS — fl1-idle answered the rollout ping and then 404'd all five
   * measured hits ~20 s later, producing zero analytics rows and an arm with no
   * floor. So a 404 is retried rather than recorded as a result. Anything else,
   * including a refusal the arm produced itself, is returned as it stands. */
  const hit = async (n, timeoutMs = 300000, ping = false) => {
    let last = null;
    for (let i = 0; i < 12; i++) {
      last = await once(n, timeoutMs, ping);
      if (last.status !== 404) return last;
      await new Promise((s) => setTimeout(s, 5000));
    }
    return last;
  };

  /* ── ROLLOUT GATE, and the first pass is why it is this thorough. ─────────
   * Waiting for ONE arm to serve is not evidence that the others do: on the
   * first pass fl1-idle answered after a single attempt while fl1-wait and
   * fl1-burn still 404'd (their workers.dev route had not propagated) and
   * fl1-agent threw, because the RESPONDER was not yet reachable and a 404 HTML
   * page is not JSON. "A deploy verified is not a build serving" (CLAUDE.md),
   * per script and per route. So: every script, including the responder, must
   * answer before ANY measured invocation — otherwise the arms measure the
   * rollout window rather than the work. */
  console.log("\n== rollout gate: every script must serve before any arm is measured ==");
  const ready = {};
  for (const n of [RESPONDER, ...toRun.map((a) => a.name)]) {
    let ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      const w = n === RESPONDER
        ? await (async () => { try { const r = await fetch(RES_URL + "?i=0", { cache: "no-store" });
              return { status: r.status }; } catch { return { status: 0 }; } })()
        : await hit(n, 20000, true);   /* PING: proves the route, spends no arm CPU */
      /* a subject that is SERVING may still legitimately answer non-200 (the
       * subreq walk, a real refusal). Anything that is not 404 proves the route
       * resolved, which is what this gate is for. */
      if (w.status && w.status !== 404) ok = true; else await new Promise((s) => setTimeout(s, 5000));
    }
    ready[n] = ok;
    console.log(`  ${n}: ${ok ? "serving" : "NEVER SERVED"}`);
  }
  findings.rollout = ready;
  const notServing = Object.entries(ready).filter(([, v]) => !v).map(([k]) => k);
  if (notServing.length) {
    throw new Error(`rollout gate: ${notServing.join(", ")} never served — refusing to measure ` +
      `the rollout window and call it CPU`);
  }

  /* ── invoke: each arm inside a window of its own ──────────────────────── */
  /* WINDOW PADDING, and pass 3 is why. A window that ended one second after the
   * last response contained only FOUR of five invocations: the surface timestamps
   * an event late enough that a tight window clips it, and the attribution guard
   * then (correctly) reported NO NUMBER for an arm that had in fact run. So the
   * window is padded generously at both ends — which makes windows OVERLAP, which
   * is why each arm is invoked a DIFFERENT NUMBER OF TIMES: the request count is
   * then a unique handle inside any window, and attribution never rests on the
   * boundary being tight. */
  const GAP_MS = 20000;
  const PAD_BEFORE_MS = 5000, PAD_AFTER_MS = 150000;
  const windows = {};
  const runArm = async (a, times, timeoutMs = 300000) => {
    await new Promise((s) => setTimeout(s, GAP_MS));
    const from = new Date(Date.now() - PAD_BEFORE_MS).toISOString().replace(/\.\d+Z$/, "Z");
    const runs = [];
    for (let i = 0; i < times; i++) runs.push(await hit(a.name, timeoutMs));
    const to = new Date(Date.now() + PAD_AFTER_MS).toISOString().replace(/\.\d+Z$/, "Z");
    windows[a.name] = { from, to, sent: times };
    const okRuns = runs.filter((r) => r.status === 200);
    findings.arms[a.name] = { mode: a.mode, cfg: a.cfg, asks: a.asks,
      invocations: runs.length, answered: okRuns.length, window: windows[a.name],
      client_wall_ms: runs.map((r) => r.client_wall_ms),
      worker_reported: okRuns[0]?.body ?? null,
      failures: runs.filter((r) => r.status !== 200).map((r) => ({ status: r.status, error: r.error })) };
    console.log(`  ${a.name}: ${okRuns.length}/${runs.length} answered, ` +
      `client wall ${Math.min(...runs.map((r) => r.client_wall_ms))}–${Math.max(...runs.map((r) => r.client_wall_ms))} ms`);
    return runs;
  };

  /* THE CONTROL RUNS EARLY, not last. On pass 4 it ran last and its window came
   * back with ZERO rows: the surface had not ingested the final minute of the run
   * by the time the poller gave up, so the one arm whose whole job is to be
   * refused had no platform reading to be refused AGAINST. Order is part of the
   * instrument. */
  console.log(`\n== NEGATIVE CONTROL arm (run early so it ingests): ${CONTROL.name} ==`);
  const stRuns = await runArm(CONTROL, CONTROL.times);
  const st = stRuns[0];

  /* the subrequest ceiling walk, also early: on pass 5 it ran last and its window
   * never ingested inside the polling budget, for the same reason the control did
   * not on pass 4. Anything whose row must be read has to run before the subjects. */
  console.log("\n== external subrequest ceiling ==");
  const srRuns = await runArm(SUBREQ, SUBREQ.times);
  const sr = srRuns[0];

  console.log(`\n== invoke: ${ARMS.length} subjects, ${REPEATS}+ times each ==`);
  for (const a of ARMS) await runArm(a, a.times);
  findings.controls.subrequest_ceiling = { status: sr.status, ...(sr.body || {}), error: sr.error,
    asks: "how many EXTERNAL subrequests one invocation gets on this plan — measured by being "
        + "refused, the way 51 was found on Free (MEASUREMENTS 2026-07-29). A whole run in one "
        + "invocation needs one subrequest per model turn AND one per tool call." };
  console.log("  ", JSON.stringify(sr.body));

  /* ── THE NEGATIVE CONTROL, RUN ────────────────────────────────────────── */
  console.log("\n== NEGATIVE CONTROL: the probe timing itself in-Worker ==");
  const selfReading = { cpu_ms: st.body?.cpu_ms, provenance: st.body?.provenance,
                        source: "worker:Date.now", scriptName: CONTROL.name };
  let refused = null;
  try {
    recordCpuMs(selfReading);
    refused = { REFUSED: false, verdict: "GATE DID NOT FIRE — the control failed, and any number "
      + "this probe reports must be treated as unprovenanced." };
  } catch (e) {
    refused = { REFUSED: true, gate: e.constructor.name, said: e.message };
  }
  findings.controls.self_timed_refusal = { worker_said_cpu_ms: st.body?.cpu_ms,
    worker_declared_provenance: st.body?.provenance, ...refused };
  console.log("  ", JSON.stringify(refused));

  /* guard the empty case: a gate that also accepts nothing asserts nothing */
  const emptyGuards = [];
  for (const bad of [undefined, null, {}, { cpu_ms: 12 }, { cpu_ms: 12, provenance: "platform-observed" },
                     { cpu_ms: 12, provenance: "platform-observed", source: "vendor-docs" },
                     { provenance: "platform-observed", source: "graphql:workersInvocationsAdaptive" }]) {
    try { recordCpuMs(bad); emptyGuards.push({ input: bad, REFUSED: false }); }
    catch { emptyGuards.push({ input: bad, REFUSED: true }); }
  }
  const good = (() => { try {
    return recordCpuMs({ cpu_ms: 1, provenance: "platform-observed",
      source: "graphql:workersInvocationsAdaptive", scriptName: "x" });
  } catch { return null; } })();
  findings.controls.gate_guards = {
    refused_all_bad: emptyGuards.every((g) => g.REFUSED), detail: emptyGuards,
    accepts_a_platform_reading: !!good,
    asks: "a control can pass while asserting nothing — the gate must refuse every bad shape "
        + "INCLUDING the empty one, and must still accept a real platform reading." };
  console.log("  gate refuses all bad shapes:", findings.controls.gate_guards.refused_all_bad,
              "| still accepts a platform reading:", findings.controls.gate_guards.accepts_a_platform_reading);

  /* ── read the billing surface, per-arm, by that arm's own window ───────── */
  console.log("\n== billing surface (per-arm windows; polling for ingestion) ==");
  /* one wait for ingestion, then one query per window */
  let lastCounts = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((s) => setTimeout(s, 20000));
    const counts = {};
    let allIn = true;
    for (const a of [...ARMS, SUBREQ, CONTROL]) {
      const name = a.name, w = windows[name];
      if (!w) { allIn = false; continue; }
      const r = await readWindow(w.from, w.to);
      if (r.error) { allIn = false; counts[name] = "ERR"; continue; }
      const at = attribute(r.mine, w.sent, a.sig);
      counts[name] = at.ok ? at.requests : `?(${r.mine.length} rows)`;
      if (!at.ok) allIn = false;
    }
    lastCounts = counts;
    console.log(`  poll ${i + 1}: ` + JSON.stringify(counts));
    if (allIn) break;
  }

  findings.surface_windows = {};
  for (const a of [...ARMS, SUBREQ, CONTROL]) {
    const f = findings.arms[a.name];
    const w = windows[a.name];
    if (!w) { f.platform = { NO_NUMBER: true, why: "arm never ran" }; continue; }
    const r = await readWindow(w.from, w.to);
    findings.surface_windows[a.name] = { window: w, mine: r.mine, other_scripts_in_window: r.theirs };
    if (r.error) { f.platform = { NO_NUMBER: true, why: "surface error: " + r.error.join("; ") }; continue; }
    const at = attribute(r.mine || [], w.sent, a.sig);
    if (!at.ok) {
      /* ATTRIBUTION GUARD. No unambiguous row means the number is not this arm's,
       * and a number that is not attributable is not a measurement. Say so. */
      f.platform = { NO_NUMBER: true, why: at.why,
        note: "reported as an absence rather than as a figure — FL-1 records no number it cannot attribute" };
      continue;
    }
    /* EVERY cpu number goes through the gate. */
    f.platform = {
      ...recordCpuMs({ cpu_ms: at.cpuTimeUs / 1000 / at.requests, provenance: "platform-observed",
                       source: "graphql:workersInvocationsAdaptive", scriptName: a.name }),
      total_cpu_ms_billed: at.cpuTimeUs / 1000,
      invocations_seen: at.requests, invocations_sent: w.sent, attributable: true,
      subrequests: at.subrequests, errors: at.errors,
      quantiles: at.rows.map((x) => ({ status: x.dimensions.status, usageModel: x.dimensions.usageModel,
                                       ...x.quantiles })),
      wall_ms_platform: at.rows.reduce((s, x) => s + x.sum.wallTime, 0) / 1000 / at.requests,
    };
  }
  findings.surface_poll_counts = lastCounts;
  console.log("\n  per-arm mean billed CPU (ms/invocation), from the platform:");
  for (const a of [...ARMS, CONTROL, SUBREQ]) {
    const p = findings.arms[a.name]?.platform;
    console.log(`    ${a.name.padEnd(16)} ` + (p?.NO_NUMBER ? "NO NUMBER" :
      `${p.cpu_ms.toFixed(2)} ms  (n=${p.invocations_seen}, subreq ${p.subrequests}, err ${p.errors})`));
  }

  /* the control's second half: the self-timed number NEXT TO the platform's */
  const cp = findings.arms[CONTROL.name]?.platform;
  findings.controls.self_timed_vs_platform = {
    worker_self_clock_ms: st.body?.cpu_ms ?? null,
    platform_billed_ms: cp?.NO_NUMBER ? null : cp?.cpu_ms ?? null,
    verdict: (cp && !cp.NO_NUMBER && Number.isFinite(st.body?.cpu_ms))
      ? (st.body.cpu_ms < cp.cpu_ms * 0.5
          ? "THE SELF-TIMED NUMBER UNDER-REPORTS — the frozen clock is demonstrated, not asserted"
          : "the self-timed number is not obviously wrong here; it is refused on PROVENANCE regardless")
      : "not comparable",
  };
  console.log("  self-timed vs platform:", JSON.stringify(findings.controls.self_timed_vs_platform));

  /* ── D-190 rides this measurement: the DO storage ceiling posture ─────── */
  console.log("\n== D-190: DO storage posture, from the same platform surface ==");
  const today = new Date(), back = new Date(Date.now() - 6 * 86400_000);
  const dq = await gql(TOK, Q_DO, { a: ACCT, from: back.toISOString().slice(0, 10),
                                    to: today.toISOString().slice(0, 10) });
  const acc0 = dq.body?.data?.viewer?.accounts?.[0] || {};
  const dr = acc0.durableObjectsStorageGroups || [];
  const dp = acc0.durableObjectsPeriodicGroups || [];
  const db = await readDbBytes(loadEnvForStats());

  /* the two-point curve: an EMPTY namespace is the baseline, so the slope is the
   * cost of what was captured rather than the cost of having a schema at all */
  let curve = null;
  if (db.bio?.dbBytes && db.scratch?.dbBytes && db.bio.bundles > 0 && db.scratch.bundles === 0) {
    const slope = (db.bio.dbBytes - db.scratch.dbBytes) / db.bio.bundles;
    curve = { baseline_bytes_empty_store: db.scratch.dbBytes, loaded_bytes: db.bio.dbBytes,
      bundles: db.bio.bundles, bytes_per_bundle: Math.round(slope),
      bundles_to_vendor_10GB_claim: Math.round((10 * 2 ** 30 - db.scratch.dbBytes) / slope),
      bundles_to_vendor_1GB_claim: Math.round((1 * 2 ** 30 - db.scratch.dbBytes) / slope) };
  }

  findings.d190 = {
    instruments: [
      "plane op=stats -> dbBytes, i.e. workerd's ctx.storage.sql.databaseSize (PER-OBJECT, exact)",
      "Cloudflare GraphQL Analytics — durableObjectsStorageGroups.max.storedBytes (ACCOUNT-WIDE)",
      "Cloudflare GraphQL Analytics — durableObjectsPeriodicGroups (PER-OBJECT, no stored bytes)",
    ],
    per_object_stats: db, growth_two_point: curve,
    account_wide_storage_rows: dr,
    observed_max_stored_bytes: dr.length ? Math.max(...dr.map((x) => x.max.storedBytes)) : null,
    per_object_platform: dp,
    cannot_see: [
      "durableObjectsStorageGroups carries NO per-object dimension (only dates), so the platform's "
      + "storage surface cannot say how close any ONE object is to its own ceiling — and the ceiling "
      + "D-190 is about is PER-OBJECT. On this account it returned NO ROWS AT ALL.",
      "The two-point curve is a LINE THROUGH TWO POINTS, not a curve. It cannot show super-linear "
      + "growth, which is precisely what D-224 predicts for `connections`.",
      "AND THE LOADED POINT HAS AN EMPTY MEANING LAYER — connections, entities and resolutions are "
      + "all ZERO on this instance. The slope therefore prices CAPTURE ONLY. D-190's row says three "
      + "IS mechanisms and D-224's quadratic table grow the SAME object; none of them is in this "
      + "number, so it is a FLOOR on bytes-per-bundle and an OVERSTATEMENT of capacity.",
    ],
  };
  console.log("  per-object dbBytes:", JSON.stringify(db));
  console.log("  two-point curve:", JSON.stringify(curve));
  console.log("  account-wide storedBytes rows:", dr.length,
              "| per-object platform rows:", dp.length);

} catch (e) {
  findings.aborted = e.message;
  console.log("\naborted:", e.message);
} finally {
  console.log("\n== teardown ==");
  const td = [];
  for (const n of deployed) { await enableSubdomain(n, false).catch(() => {}); td.push(await del(n)); }
  const names = ((await api("GET", "/workers/scripts")).result || []).map((w) => w.id);
  findings.teardown = { deleted: td, scripts_now: names,
    confirmed: !ALL_NAMES.some((n) => names.includes(n)) };
  console.log("  scripts now:", JSON.stringify(names));
  console.log("  teardown confirmed:", findings.teardown.confirmed);
}

findings.limits_of_instrument = [
  "workersInvocationsAdaptive is per-SCRIPT and per-time-bucket, never per-invocation. Attribution "
  + "is exact here only because each arm is a script nobody else calls.",
  "cpuTimeUs is Cloudflare's own statement of what it billed. We cannot independently verify it; it "
  + "is the surface the bill is computed from, which is the thing D-218 asks about.",
  "The waited-on 'API' is our responder Worker. It reproduces a turn's SHAPE — a real network wait, "
  + "a real response of a real size, really parsed — not Anthropic's latency or payload distribution.",
  "Five invocations per subject. Enough to expose a wild outlier, not enough for a tail.",
  "The corpus is one instance's real op responses (biosmoke7, a development instance). A loaded "
  + "instance's projection/search bodies would be larger, so the agent arms are a FLOOR on the work.",
];

const out = process.argv[3] || "fl1-findings.json";
await import("node:fs").then((fs) => fs.writeFileSync(out, JSON.stringify(findings, null, 2)));
console.log(`\n== findings written to ${out} ==`);
