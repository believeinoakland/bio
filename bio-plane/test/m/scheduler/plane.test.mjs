/* scheduler in the running plane (Miniflare, the Durable Object the product runs in): the registry the plane builds
   (R5, R8), a producer's notice arming it (R9), and the suspended run woken on the alarm that expires its request
   (R12, D-583). The alarm is driven through the Durable Object's `onAlarm(now)` on a virtual clock that starts at the
   wall clock, never in the past, so the real alarm the reconcile sets never fires inside the test. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "src");
const sha = (v) => createHash("sha256").update(v).digest("hex");
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: join(SRC, "index.mjs"),
  script: readFileSync(join(SRC, "index.mjs"), "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sch", MEMBER_TOKEN: "mem-sch", PROBE_TOKEN: "prb-sch", DAEMON_TOKEN: "dmn-sch",
              VERSION: "1.0.0", INSTANCE_NAME: "sch-plane", GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() {
    return new Response(new Uint8Array(512).map((_, i) => i % 251), { headers: { "content-type": "application/pdf" } });
  },
});
MF = mf;
after(() => mf.dispose());

const rP = (r) => (r && typeof r === "object" && "result" in r ? r.result : r);
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const store = async () => { const ns = await mf.getDurableObjectNamespace("STORE"); return ns.get(ns.idFromName("bio")); };

test("R5, R8: the plane's registry is R5's consumers, the later ones registered by legacy-store in their R5 places", async () => {
  const obj = await store();
  const r = await obj.onAlarm(Date.now());
  assert.deepEqual(Object.keys(r).slice(0, 10),
    ["swept", "drained", "created", "folded", "refused", "waiting", "remaining", "rearmed", "nextAt", "probes"]);
  assert.deepEqual(r.probes, []);
  assert.equal(typeof r.overduescan, "object", "the overdue scan is due at every firing");
});

test("R9: a selection created on an idle instance leaves the alarm armed at the sweep's wake (retrieval R52)", async () => {
  const obj = await store();
  await obj.onAlarm(Date.now());
  const before = await obj.schedAlarmAt();
  const t0 = Date.now();
  const sel = await POST("op=select&token=adm-sch", { q: "type:inquiry", kind: "query" });
  assert.equal(typeof sel.handle, "string", JSON.stringify(sel));
  const at = await obj.schedAlarmAt();
  assert.ok(at !== null && (before === null || at <= before), `armed: ${at} (was ${before})`);
  assert.ok(at >= t0 + 330_000 - 5 && at <= Date.now() + 330_000, "at now + the selection lifetime + 30 s (retrieval R51)");
});

test("R12: a run waiting on a request that reaches expired is woken on the alarm that expires it, exactly once", async () => {
  const obj = await store();
  const add = await POST("op=memberadd&token=adm-sch",
    { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
  const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
  assert.equal(en.ok, true, JSON.stringify(en));
  const RUTH = (await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" })).token;
  const INQ = "INQ-2026-4200-sched-expiry", C = "2026-09-01T00:00:00Z";
  const md = ["---", `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1", `title: "What does ${INQ} rest on?"`,
    "current_state: open", "prior_state: null", `created: "${C}"`, `last_updated: "${C}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: a-group", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", `What does ${INQ} rest on?`, "",
    "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
    `### Session ${C} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
  const pr = await POST(`op=promote&token=${RUTH}`, { bundleId: INQ, base: null, snapKey: `${INQ}-s`, register: [],
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    meta: { object_type: "inquiry", group: "a-group", current_state: "open", created: C, last_updated: C } });
  assert.equal(pr.ok, true, JSON.stringify(pr).slice(0, 300));

  const T0 = Date.now();
  const RUN = "RUN-2026-0928-sched-expiry";
  const opened = await POST(`op=airunopen&token=${RUTH}`, { run: RUN, contextType: "inquiry", contextId: INQ,
    label: "a run waiting on a request that will expire", mode: "check", principalClaude: "project",
    principalClaudeRef: "a-group/claude", skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 5, unit: "requests" }], at: new Date(T0).toISOString(), leaseMs: 3 * 86400000 });
  assert.equal(opened.started, true, JSON.stringify(opened));
  /* The one request is at a host the governor holds for longer than the request lives: held on every tick, so
     nothing completes it until its own expiry releases it (capture-requests R14, R20). */
  await (await obj.fetch("http://x/governorreport", { method: "POST",
    body: JSON.stringify({ host: "www.held.example.org", status: 429, retry_after_ms: 3 * 86400000 }) })).json();
  const rq = await POST(`op=capturerequest&token=${RUTH}`,
    { target: INQ, run: RUN, purpose: "investigate", address: "https://www.held.example.org/doc.pdf" });
  assert.equal(rq.ok, true, JSON.stringify(rq));

  const r1 = await obj.onAlarm(T0 + 1000);
  assert.deepEqual([r1.capturerequests?.held?.length, r1.airunwake?.woken ?? 0], [1, 0], "held, and nothing to wake yet");

  /* Followed as workerd would, alarm by alarm: the wake's hold keeps the run alive while the daemon owes it an
     answer, until the drain releases the request at its own 24 h expiry. */
  let at = r1.nextAt, expiring = null, n = 0;
  for (; n < 1000 && at !== null && !expiring; n++) {
    const r = await obj.onAlarm(at);
    if ((r.capturerequests?.expired || []).length) expiring = r;
    else { assert.equal(r.airunwake?.woken ?? 0, 0, "nothing is woken before the expiry"); at = r.nextAt; }
  }
  assert.ok(expiring, `the request expired within ${n} alarms`);
  assert.ok(at >= T0 + 86400000, "at its own 24 h");
  assert.deepEqual(expiring.capturerequests.expired.map((e) => e.request), [rq.request], "released as expired");
  assert.equal(expiring.airunreap?.reaped?.length ?? 0, 0, "the run was held alive until then");
  assert.equal(expiring.airunwake?.woken, 1, "woken on the alarm that expired it");
  assert.equal(expiring.airunwake?.wakes?.[0]?.run, RUN);
  assert.equal(expiring.airunwake?.wakes?.[0]?.completions, 1, "the expiry told to it as a completion");
  const again = await obj.onAlarm(at + 1000);
  assert.equal(again.airunwake?.woken ?? 0, 0, "exactly once");
  const reqs = await GET(`op=capturerequests&token=adm-sch&run=${RUN}`);
  const row = (reqs.requests || []).find((q) => q.request === rq.request);
  assert.equal(row.state, "expired");
  assert.equal(typeof row.run_woken_at, "string");
});
