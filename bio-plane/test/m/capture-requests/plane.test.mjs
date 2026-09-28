/* capture-requests in the running plane (Miniflare, the Durable Object the product runs in): the ops' admission (R30),
   and the spine end to end through them (R16, R31): a member's run requests, only the drain fetches, and `op=acquire`
   refuses the capture-request arm from every caller. The ops' routing, classes and stamps are the control plane's
   (K3); this test measures that the module's ops are reached exactly as R30 states. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "src");
const sha = (v) => createHash("sha256").update(v).digest("hex");
const SEEN = [];
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: join(SRC, "index.mjs"),
  script: readFileSync(join(SRC, "index.mjs"), "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cr", MEMBER_TOKEN: "mem-cr", PROBE_TOKEN: "prb-cr", DAEMON_TOKEN: "dmn-cr",
              VERSION: "1.0.0", INSTANCE_NAME: "cr-plane", GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  outboundService(request) {
    SEEN.push(request.url);
    return new Response(new Uint8Array(512).map((_, i) => i % 251), { headers: { "content-type": "application/pdf" } });
  },
});
after(() => mf.dispose());

const unwrap = (r) => (r && typeof r === "object" && "result" in r ? r.result : r);
const call = async (op, tok, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: unwrap(await r.json()) };
};
const forbidden = (r) => r.status === 403 && r.body && r.body.reason === "CLASS_FORBIDDEN";

let setup = null;
async function world() {
  if (setup) return setup;
  const enrol = async (id, role, capabilities) => {
    const add = (await call("memberadd", "adm-cr", { memberId: id, cover: `c-${id}`, role, capabilities })).body;
    await call("enroll", undefined, { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
    return (await call("login", undefined, { role: `member:${id}`, password: `${id}-passphrase-1` })).body.token;
  };
  const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
  await enrol("sam", "admin", ["contribute"]);
  const NOCON = await enrol("nocon", "member", []);
  const md = ["---", "id: INQ-2026-9000-cr", "object_type: inquiry", "schema: inquiry@1", 'title: "What?"',
    "current_state: open", "prior_state: null", 'created: "2026-07-01T00:00:00Z"', 'last_updated: "2026-07-01T00:00:00Z"',
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: g", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", "What?", "",
    "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
    "## Review Notes", ""].join("\n");
  const p = (await call("promote", RUTH, { bundleId: "INQ-2026-9000-cr", base: null, snapKey: "INQ-2026-9000-cr-000001",
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [],
    meta: { object_type: "inquiry", group: "g", current_state: "open", created: "2026-07-01T00:00:00Z",
            last_updated: "2026-07-01T00:00:00Z" } })).body;
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const run = (await call("airunopen", RUTH, { run: "RUN-CR-1", contextType: "inquiry", contextId: "INQ-2026-9000-cr",
    label: "cr", mode: "check", principalClaude: "project", principalClaudeRef: "g/claude",
    skillVersion: "investigative-session@1", biasManifest: null, bounds: [{ bound: "fetches", allowed: 5, unit: "requests" }],
    leaseMs: 900000 })).body;
  assert.equal(run.started, true, JSON.stringify(run));
  const AI = (await call("aicredentialmint", RUTH, { tokenId: "no-writes", principalKind: "member", principalMember: "ruth",
    taskScope: "investigative", writes: [], note: "reads only" })).body.token;
  setup = { RUTH, NOCON, AI };
  return setup;
}

test("R30 capturerequest: admin, member with contribute and probe; capturerequestdrain: admin, probe and daemon, no member class; capturerequests: admin, member and probe; the daemon reaches no read of the queue; no op admits the ai class by name", async () => {
  const { RUTH, NOCON, AI } = await world();
  const ask = { run: "RUN-CR-1", address: "https://src.example.org/a.pdf", target: "INQ-2026-9000-cr", purpose: "investigate" };
  /* capturerequest */
  for (const tok of ["adm-cr", "mem-cr", "prb-cr", RUTH]) assert.equal(forbidden(await call("capturerequest", tok, ask)), false, tok);
  assert.equal(forbidden(await call("capturerequest", "dmn-cr", ask)), true, "daemon");
  const nocon = await call("capturerequest", NOCON, ask);
  assert.equal(nocon.status, 403, "a member session without contribute");
  /* capturerequestdrain */
  for (const tok of ["adm-cr", "prb-cr", "dmn-cr"]) assert.equal(forbidden(await call("capturerequestdrain", tok, {})), false, tok);
  assert.equal(forbidden(await call("capturerequestdrain", "mem-cr", {})), true, "the member class");
  assert.equal((await call("capturerequestdrain", RUTH, {})).status, 403, "a member's session");
  /* capturerequests */
  for (const tok of ["adm-cr", "mem-cr", "prb-cr", RUTH]) assert.equal(forbidden(await call("capturerequests", tok)), false, tok);
  assert.equal(forbidden(await call("capturerequests", "dmn-cr")), true, "the daemon reaches no read of the queue");
  /* an ai credential reaches an op only through the writes its record declares (D-199), never as a class the OPS row
     names: one that declares no writes reaches neither mutating op */
  for (const op of ["capturerequest", "capturerequestdrain"])
    assert.equal((await call(op, AI, ask)).status, 403, `ai ${op}`);
});

test("R16 R31 the spine in the plane: the member's run requests and nothing is fetched; op=acquire refuses the capture-request arm from every caller; only the daemon's drain fetches, and the capture lands", async () => {
  const { RUTH } = await world();
  const before = SEEN.length;
  const a = (await call("capturerequest", RUTH, { run: "RUN-CR-1", address: "https://spine.example.org/spine.pdf",
                                                target: "INQ-2026-9000-cr", purpose: "investigate" })).body;
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(SEEN.length, before, "the door fetched nothing");
  for (const tok of ["adm-cr", "prb-cr", "dmn-cr", RUTH]) {
    const r = await call("acquire", tok, { via: "capture-request", request: a.request, locator: "https://spine.example.org/spine.pdf" });
    assert.equal(r.body.code ?? r.body.reason, r.status === 403 && r.body.reason === "CLASS_FORBIDDEN" ? "CLASS_FORBIDDEN" : "CAPTURE_NOT_DRAINING", tok);
  }
  assert.equal(SEEN.filter((u) => u.startsWith("https://spine.example.org/")).length, 0, "no caller made the plane fetch it");
  const d = (await call("capturerequestdrain", "dmn-cr", {})).body;
  assert.equal(d.configured, true);
  const got = d.captured.find((c) => c.request === a.request);
  assert.ok(got, JSON.stringify(d).slice(0, 400));
  assert.equal(got.attribution.actor, "token:daemon");
  assert.equal(SEEN.filter((u) => u.startsWith("https://spine.example.org/")).length, 1);
  const read = (await call(`capturerequests&run=RUN-CR-1`, RUTH)).body;
  assert.equal(read.requests.find((r) => r.request === a.request).state, "captured");
});
