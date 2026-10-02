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
  modules: true, modulesRoot: "/", scriptPath: join(SRC, "plane", "index.mjs"),
  script: readFileSync(join(SRC, "plane", "index.mjs"), "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
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

test("R5, R8: the plane's registry is R5's consumers, the later ones registered by their own modules (tasks, queue, instance-setup) in their R5 places", async () => {
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

/* An information bundle carrying one captured document whose reading names an ordinance, in the register's shape
   op=acquire writes (C-18.1), so op=resolve has a reference to resolve. */
async function promoteReading(id, captureSha, ref) {
  const C = "2026-09-01T00:00:00Z", loc = `https://fixture.invalid/${id}.bin`, file = `snapshots/${id}.bin`;
  const md = ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Reading ${id}"`,
    "current_state: collected", "prior_state: null", `created: ${C}`, `last_updated: ${C}`, "produced_by:",
    "  mode: assisted", "  capability_tier: session", "group: a-group", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand", "  authority: synthetic",
    `  retrieved: ${C}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", "A reading.",
    "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const doc = { file, locator: loc, retrieved: C, authority_state: "undetermined",
    authority_basis: `a test fixture: no authority was asserted and none is determined; recorded ${C}`,
    origin: { kind: "named_request" },
    capture: { method: "bio-plane acquire, https fetch, hashed at receipt", grade: "B", actor_class: "session",
               sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: C,
               entities: [{ ref, kind: "ordinance", key: ref.split(":")[1], label: `Ordinance ${ref}` }] } };
  const prov = JSON.stringify({ documents: [doc] });
  return await POST("op=promote&token=mem-sch", { bundleId: id, base: null, snapKey: `${id}-s`, author: "sch", register: [],
    meta: { object_type: "information", group: "a-group", title: `Reading ${id}`, current_state: "collected", created: C, last_updated: C },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: file, blobSha: captureSha, sha256: captureSha, bytes: 10 }] });
}

test("R9: a resolution that marks an entity leaves the alarm armed at the connection sweep's wake (entities R13, connections R18)", async () => {
  const obj = await store();
  const ent = await POST("op=entitycreate&token=mem-sch", { kind: "ordinance", label: "A Rent Ordinance",
    note: "The rent ordinance the fixture readings name, registered so a resolution can mark it.", aliases: ["ordinance:24680"] });
  assert.equal(ent.ok, true, JSON.stringify(ent));
  const capA = sha("sched-resolve-A"), capB = sha("sched-resolve-B");
  for (const [id, c] of [["INFO-2026-0001-sch", capA], ["INFO-2026-0002-sch", capB]]) {
    const pr = await promoteReading(id, c, "ordinance:24680");
    assert.equal(pr.ok, true, JSON.stringify(pr).slice(0, 300));
  }
  await obj.onAlarm(Date.now());
  const before = await obj.schedAlarmAt();
  const t0 = Date.now();
  for (const c of [capA, capB]) {
    const r = await POST("op=resolve&token=mem-sch", { captureSha: c });
    assert.equal(r.resolved?.[0]?.entity_id, ent.entity_id, JSON.stringify(r).slice(0, 300));
  }
  const at = await obj.schedAlarmAt();
  assert.ok(at !== null && (before === null || at <= before), `armed: ${at} (was ${before})`);
  assert.ok(at >= t0 + 60_000 - 5 && at <= Date.now() + 60_000, "at now + the sweep's delay (connections R18's 60 s)");
  const fired = await obj.onAlarm(at);
  assert.deepEqual([fired.connderive?.entities, fired.connderive?.remaining], [1, 0], "the sweep derives the marked entity");
});

test("R5, R9: a promotion that leaves an action holding a past-dated pending clock entry arms the deadline re-check, and the real alarm marks it overdue (monitoring R34, R50)", async () => {
  const obj = await store();
  const DAY = 86_400_000;
  /* yesterday, UTC: R50's wake is the start of today, already passed, so the arm sets the real alarm and workerd fires
     it; the plane's own clock judges the mark (actions R33), so the date must truly have passed */
  const date = new Date(Math.floor(Date.now() / DAY) * DAY - DAY).toISOString().slice(0, 10);
  const ACT = "ACTN-2026-0900-sched";
  const C = "2026-09-01T00:00:00Z";
  const md = ["---", `id: ${ACT}`, "object_type: action", `title: ${ACT}`, "current_state: planned", `created: "${C}"`,
    `last_updated: "${C}"`, "action_kind: records_request", "risk_tier: 1", "counterparty:", "  state: named",
    "  role: Town Clerk", "  body: Town of Port Ellery", "clock:", "  - text: reply", "    description: reply window",
    `    date: ${date}`, "    basis: statute", "    status: pending", "---", "", "An action.", ""].join("\n");
  /* a risk tier is set only by a member's authored act (actions R40), so the action is promoted by an enrolled member */
  const add = await POST("op=memberadd&token=adm-sch",
    { memberId: "sam", cover: "cover for sam", role: "admin", capabilities: ["contribute", "publish"] });
  assert.equal((await POST("op=enroll", { invite: add.invite, handle: "sam", password: "sam-passphrase-1" })).ok, true);
  const SAM = (await POST("op=login", { role: "member:sam", password: "sam-passphrase-1" })).token;
  const first = await obj.onAlarm(Date.now());
  assert.equal("deadlinerecheck" in first, false, "nothing pending: it does not tick");
  const pr = await POST(`op=promote&token=${SAM}`, { bundleId: ACT, base: null, snapKey: "20260920T000000Z_0900", author: "sch",
    register: [], files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    meta: { object_type: "action", group: "a-group", title: ACT, current_state: "planned", created: C, last_updated: C } });
  assert.equal(pr.ok, true, JSON.stringify(pr).slice(0, 300));
  /* the real alarm fires and ticks the consumer: the entry leaves `pending`, so a later firing finds nothing due */
  let r = null;
  for (let i = 0; i < 100; i++) {
    r = await GET(`op=image&token=${SAM}&id=${ACT}`);
    const st = JSON.stringify(r);
    if (/overdue/.test(st)) break;
    await new Promise((ok) => setTimeout(ok, 50));
  }
  assert.match(JSON.stringify(r), /status: overdue/, JSON.stringify(r).slice(0, 400));
  const after = await obj.onAlarm(Date.now());
  assert.equal("deadlinerecheck" in after, false, "marked, it holds no wake (R15), so it is not due again");
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

test("R9: in the plane, a promotion that ratifies a sweep on an idle instance leaves the alarm armed at the sweep's wake (monitoring R56, promotion R45); the same sweep unratified arms nothing for it", async () => {
  const obj = await store();
  const C = "2026-09-01T00:00:00Z";
  /* an ordinary member once the group has its two administrators (the earlier tests' admins); alone, an administrator */
  const memberAdd = (role) => POST("op=memberadd&token=adm-sch",
    { memberId: "swen", cover: "cover for swen", role, capabilities: ["contribute", "publish", "create_projects"] });
  let add = await memberAdd("member");
  if (add.reason === "ADMINS_FIRST") add = await memberAdd("admin");
  const en = await POST("op=enroll", { invite: add.invite, handle: "swen", password: "swen-passphrase-1" });
  assert.equal(en.ok, true, JSON.stringify({ add, en }).slice(0, 300));
  const SWEN = (await POST("op=login", { role: "member:swen", password: "swen-passphrase-1" })).token;
  const pmd = ["---", "object_type: project", 'title: "Sweep project"', "current_state: forming", `created: "${C}"`,
    `last_updated: "${C}"`, 'objective: "Establish what the council publishes."', "references: []", "required_strength:",
    "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
  const proj = await POST("op=promote&token=adm-sch", { base: null, snapKey: "sched-sweep-proj",
    files: [{ path: "bundle.md", text: pmd, bytes: pmd.length, sha256: sha(pmd) }], register: [],
    meta: { object_type: "project", group: "a-group", current_state: "forming", created: C, last_updated: C } });
  assert.equal(proj.ok, true, JSON.stringify(proj).slice(0, 300));
  const own = await (await obj.fetch("http://x/projectclaimowner", { method: "POST",
    body: JSON.stringify({ projectId: proj.bundleId, memberId: "swen" }) })).json();
  assert.equal((own.result ?? own).ok, true, JSON.stringify(own));
  const LIST = "INFO-2026-0952-sched-sweep";
  const md = ["---", `id: ${LIST}`, "object_type: information", "schema: information@2", `title: "Council listing"`,
    "current_state: collected", "prior_state: null", `created: ${C}`, `last_updated: ${C}`, "produced_by:", "  mode: assisted",
    "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:", "  locator: https://records.example.org/council/list", "  authority: Town Clerk",
    `  retrieved: ${C}`, "monitoring:", "  enabled: false", "  last_checked: null", `project: ${proj.bundleId}`, "---", "",
    "## Summary", "", "A listing.", "", "## Provenance Notes", "", "## Session Log", "", "### Session 1", "", "Captured.", "",
    "## Review Notes", ""].join("\n");
  const sweep = (ratified) => ({ id: "minutes", title: "Council minutes", ratified, sources: ["https://records.example.org/council"],
    seeds: ["https://records.example.org/council/index.html"], match: { terms: ["minutes"] }, cadence: "weekly",
    budget: { per_run: 10, backlog: 20 } });
  let base = null, n = 0;
  const write = async (ratified) => {
    const g = JSON.stringify({ sweeps: [sweep(ratified)] });
    const r = await POST(`op=promote&token=${SWEN}`, { bundleId: LIST, base, snapKey: `sched-sweep-${++n}`, register: [],
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
              { path: "data/gathering.json", text: g, bytes: g.length, sha256: sha(g) }],
      meta: { object_type: "information", group: "a-group", current_state: "collected", created: C, last_updated: C } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    base = r.bundleSha;
  };
  /* idle, as far as the sweep goes: whatever earlier tests left wants no wake sooner than a minute from now */
  await obj.onAlarm(Date.now());
  const before = await obj.schedAlarmAt();
  assert.ok(before === null || before > Date.now() + 60_000, `nothing due within a minute: ${before}`);
  await write(false);
  assert.equal(await obj.schedAlarmAt(), before, "an unratified sweep's promotion arms nothing for it");
  const t0 = Date.now();
  await write(true);
  const at = await obj.schedAlarmAt();
  assert.ok(at !== null && at >= t0 + 1000 && at <= Date.now() + 1000, `armed at the sweep's wake, now + 1 s while due: ${at} (t0 ${t0})`);
});
