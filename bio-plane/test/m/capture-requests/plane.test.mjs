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
import { civicsmithUserAgent } from "../../../src/acquisition/index.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "src");
const sha = (v) => createHash("sha256").update(v).digest("hex");
const SEEN = [], AGENTS = new Map();
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: join(SRC, "plane", "index.mjs"),
  script: readFileSync(join(SRC, "plane", "index.mjs"), "utf8"), modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cr", MEMBER_TOKEN: "mem-cr", PROBE_TOKEN: "prb-cr", DAEMON_TOKEN: "dmn-cr",
              VERSION: "1.0.0", INSTANCE_NAME: "cr-plane", GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  outboundService(request) {
    SEEN.push(request.url);
    AGENTS.set(request.url, request.headers.get("User-Agent"));
    if (new URL(request.url).host === "down.example.org") return new Response("unavailable", { status: 503 });
    if (new URL(request.url).host === "up.example.org")
      return new Response(new TextEncoder().encode(`%PDF-1.4 a document of its own at ${request.url}`), { headers: { "content-type": "application/pdf" } });
    return new Response(new Uint8Array(512).map((_, i) => i % 251), { headers: { "content-type": "application/pdf" } });
  },
});
after(() => mf.dispose());

const unwrap = (r) => (r && typeof r === "object" && "result" in r ? r.result : r);
const call = async (op, tok, body, headers = {}) => {
  const r = await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}`,
    body === undefined ? { headers } : { method: "POST", body: JSON.stringify(body), headers });
  return { status: r.status, body: unwrap(await r.json()) };
};
const forbidden = (r) => r.status === 403 && r.body && r.body.reason === "CLASS_FORBIDDEN";

const MEMBER_UA = "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0";
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
  const md = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", 'title: "What?"',
    "current_state: open", "prior_state: null", 'created: "2026-07-01T00:00:00Z"', 'last_updated: "2026-07-01T00:00:00Z"',
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: g", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "surfaced_by: agent", 'disposition_reason: ""', "---", "", "## Question", "", "What?", "",
    "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
    "## Review Notes", ""].join("\n");
  const create = async (id, headers) => {
    const text = md(id);
    const p = (await call("promote", RUTH, { bundleId: id, base: null, snapKey: `${id}-000001`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
      meta: { object_type: "inquiry", group: "g", current_state: "open", created: "2026-07-01T00:00:00Z",
              last_updated: "2026-07-01T00:00:00Z" } }, headers)).body;
    assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  };
  await create("INQ-2026-9000-cr");
  /* N295: an inquiry created through a member's session, whose browser agent the control plane stamps (inquiry R44) */
  await create("INQ-2026-9001-ua", { "User-Agent": MEMBER_UA });
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

test("R16 R31 R14 the spine in the plane: the member's run requests (as civicsmith by default) and nothing is fetched; op=acquire refuses the capture-request arm from every caller; only the daemon's drain fetches, with the Civicsmith agent, and the capture lands", async () => {
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
  assert.equal(a.ua_mode, "civicsmith");
  assert.equal(AGENTS.get("https://spine.example.org/spine.pdf"), civicsmithUserAgent("1.0.0", "cr-plane", "investigate"),
    "the agent that left the instance is acquisition's Civicsmith agent");
  const read = (await call(`capturerequests&run=RUN-CR-1`, RUTH)).body;
  assert.equal(read.requests.find((r) => r.request === a.request).state, "captured");
});

test("R19 R42 R38 in the plane: a source's 503 holds the row under CAPTURE_FETCH_FAILED (C-28.17), read back through op=capturerequests; op=capturerequestretry refuses it CAPTURE_REQUEST_NOT_RETRYABLE (C-28.18) and writes nothing; a new capture drained is promoted", async () => {
  const { RUTH } = await world();
  const ask = (address) => call("capturerequest", RUTH, { run: "RUN-CR-1", address, target: "INQ-2026-9000-cr", purpose: "investigate" });
  const down = (await ask("https://down.example.org/gone.pdf")).body;
  const up = (await ask("https://up.example.org/doc.pdf")).body;
  assert.equal(down && down.ok, true, String(JSON.stringify(down)));
  const d = (await call("capturerequestdrain", "dmn-cr", {})).body;
  const held = d.held.find((h) => h.request === down.request);
  assert.deepEqual([held && held.code, held && held.check], ["CAPTURE_FETCH_FAILED", "C-28.17"], String(JSON.stringify(d)).slice(0, 900));
  const row = (await call(`capturerequests&run=RUN-CR-1`, RUTH)).body.requests.find((r) => r.request === down.request);
  assert.deepEqual([row.state, row.code, row.source_reason], ["requested", "CAPTURE_FETCH_FAILED", "other"]);
  const r = (await call("capturerequestretry", RUTH, { request: down.request })).body;
  assert.deepEqual([r.ok, r.code, r.check], [false, "CAPTURE_REQUEST_NOT_RETRYABLE", "C-28.18"], JSON.stringify(r));
  const again = (await call(`capturerequests&run=RUN-CR-1`, RUTH)).body.requests.find((x) => x.request === down.request);
  assert.deepEqual(again, row, "nothing written");
  const got = d.captured.find((c) => c.request === up.request);
  assert.ok(got, JSON.stringify(d).slice(0, 600));
  assert.equal(got.promoted && got.promoted.ok, true, String(JSON.stringify(got)));
  assert.match(got.promoted.bundle_id, /^INFO-\d{4}-\d{4}-requested$/);
});

test("R14 in the plane (N295): a member-browser request under an inquiry created through a member's session is fetched with the agent the control plane stamped and inquiry records (its R44), not refused CAPTURE_CONDUCT_UA_UNRECORDED", async () => {
  const { RUTH } = await world();
  const address = "https://up.example.org/member-browser.pdf";
  const a = (await call("capturerequest", RUTH, { run: "RUN-CR-1", address, target: "INQ-2026-9001-ua",
                                                purpose: "investigate", ua_mode: "member-browser" })).body;
  assert.equal(a.ok, true, JSON.stringify(a));
  const d = (await call("capturerequestdrain", "dmn-cr", {})).body;
  assert.equal([...d.refused, ...d.held].find((x) => x.request === a.request), undefined, JSON.stringify(d).slice(0, 600));
  assert.ok(d.captured.find((c) => c.request === a.request), JSON.stringify(d).slice(0, 600));
  assert.equal(AGENTS.get(address), MEMBER_UA, "the member's own agent left the instance, verbatim");
});
